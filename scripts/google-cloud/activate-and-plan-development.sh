#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-acoolcollector}"
REGION="${REGION:-us-central1}"
ENVIRONMENT="${ENVIRONMENT:-development}"
PUBLIC_SITE_URL="${PUBLIC_SITE_URL:-https://acoolcollector.com}"
ALLOWED_ORIGINS_JSON="${ALLOWED_ORIGINS_JSON:-[\"https://acoolcollector.com\",\"https://www.acoolcollector.com\"]}"
CONTAINER_IMAGE="${CONTAINER_IMAGE:-${REGION}-docker.pkg.dev/${PROJECT_ID}/acoolcollector/acoolcollector-api:bootstrap}"
ALERT_EMAIL="${ALERT_EMAIL:-}"
MONTHLY_BUDGET_USD="${MONTHLY_BUDGET_USD:-250}"
ENABLE_GITHUB_OIDC="${ENABLE_GITHUB_OIDC:-false}"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-ACoolNerd/ACoolCOLLECTOR}"
GITHUB_BRANCH="${GITHUB_BRANCH:-main}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TF_DIR="${ROOT_DIR}/infra/google-cloud/terraform"
EVIDENCE_DIR="${EVIDENCE_DIR:-${HOME}/acoolcollector-evidence/$(date -u +%Y%m%dT%H%M%SZ)}"

mkdir -p "${EVIDENCE_DIR}"

echo "=== ACoolCOLLECTOR DEVELOPMENT ACTIVATION ==="
echo "Project: ${PROJECT_ID}"
echo "Region: ${REGION}"
echo "Environment: ${ENVIRONMENT}"
echo "Evidence: ${EVIDENCE_DIR}"

gcloud config set project "${PROJECT_ID}" --quiet

gcloud auth print-access-token >/dev/null

gcloud projects describe "${PROJECT_ID}" \
  --format="yaml(projectId,projectNumber,name,lifecycleState)" \
  | tee "${EVIDENCE_DIR}/project.yaml"

gcloud billing projects describe "${PROJECT_ID}" \
  --format="yaml(projectId,billingEnabled,billingAccountName)" \
  | tee "${EVIDENCE_DIR}/billing.yaml"

if ! grep -q "billingEnabled: true" "${EVIDENCE_DIR}/billing.yaml"; then
  echo "Billing is not enabled for ${PROJECT_ID}."
  exit 1
fi

REQUIRED_APIS=(
  serviceusage.googleapis.com
  cloudresourcemanager.googleapis.com
  iam.googleapis.com
  iamcredentials.googleapis.com
  sts.googleapis.com
  run.googleapis.com
  artifactregistry.googleapis.com
  cloudbuild.googleapis.com
  compute.googleapis.com
  secretmanager.googleapis.com
  cloudkms.googleapis.com
  storage.googleapis.com
  firestore.googleapis.com
  bigquery.googleapis.com
  bigquerystorage.googleapis.com
  pubsub.googleapis.com
  cloudtasks.googleapis.com
  cloudscheduler.googleapis.com
  eventarc.googleapis.com
  workflows.googleapis.com
  aiplatform.googleapis.com
  vision.googleapis.com
  texttospeech.googleapis.com
  speech.googleapis.com
  documentai.googleapis.com
  translate.googleapis.com
  logging.googleapis.com
  monitoring.googleapis.com
  billingbudgets.googleapis.com
)

echo "=== ENABLING REQUIRED APIS ==="
gcloud services enable "${REQUIRED_APIS[@]}" \
  --project="${PROJECT_ID}" \
  --quiet

gcloud services list \
  --enabled \
  --project="${PROJECT_ID}" \
  --format="value(config.name)" \
  | sort \
  | tee "${EVIDENCE_DIR}/enabled-services.txt"

FAILURES=0
for api in "${REQUIRED_APIS[@]}"; do
  if grep -Fxq "${api}" "${EVIDENCE_DIR}/enabled-services.txt"; then
    echo "PASS: ${api}"
  else
    echo "FAIL: ${api}"
    FAILURES=$((FAILURES + 1))
  fi
done

if [[ "${FAILURES}" -ne 0 ]]; then
  echo "${FAILURES} required APIs are still disabled."
  exit 1
fi

if ! command -v terraform >/dev/null 2>&1; then
  echo "Terraform is not installed or is not on PATH."
  exit 1
fi

terraform version | tee "${EVIDENCE_DIR}/terraform-version.txt"

cd "${TF_DIR}"
terraform init -backend=false
terraform fmt -check -recursive
terraform validate | tee "${EVIDENCE_DIR}/terraform-validate.txt"

BILLING_ACCOUNT_ID="$(gcloud billing projects describe "${PROJECT_ID}" --format='value(billingAccountName)' | sed 's#^billingAccounts/##')"

export GOOGLE_OAUTH_ACCESS_TOKEN="$(gcloud auth print-access-token)"
trap 'unset GOOGLE_OAUTH_ACCESS_TOKEN' EXIT

PLAN_ARGS=(
  -var="project_id=${PROJECT_ID}"
  -var="region=${REGION}"
  -var="environment=${ENVIRONMENT}"
  -var="container_image=${CONTAINER_IMAGE}"
  -var="public_site_url=${PUBLIC_SITE_URL}"
  -var="allowed_origins=${ALLOWED_ORIGINS_JSON}"
  -var="enable_github_oidc=${ENABLE_GITHUB_OIDC}"
  -var="github_repository=${GITHUB_REPOSITORY}"
  -var="github_branch=${GITHUB_BRANCH}"
  -var="alert_email=${ALERT_EMAIL}"
  -var="billing_account_id=${BILLING_ACCOUNT_ID}"
  -var="monthly_budget_usd=${MONTHLY_BUDGET_USD}"
)

terraform plan \
  "${PLAN_ARGS[@]}" \
  -out="${EVIDENCE_DIR}/development.tfplan"

terraform show -no-color "${EVIDENCE_DIR}/development.tfplan" \
  > "${EVIDENCE_DIR}/development-plan.txt"

terraform show -json "${EVIDENCE_DIR}/development.tfplan" \
  > "${EVIDENCE_DIR}/development-plan.json"

sha256sum \
  "${EVIDENCE_DIR}/development.tfplan" \
  "${EVIDENCE_DIR}/development-plan.txt" \
  "${EVIDENCE_DIR}/development-plan.json" \
  | tee "${EVIDENCE_DIR}/development-plan.sha256"

if grep -Eq 'roles/(owner|editor)' "${EVIDENCE_DIR}/development-plan.txt"; then
  echo "Blocked: plan contains project Owner or Editor role."
  exit 1
fi

if grep -q 'allAuthenticatedUsers' "${EVIDENCE_DIR}/development-plan.txt"; then
  echo "Blocked: plan contains allAuthenticatedUsers."
  exit 1
fi

echo
echo "=== PLAN SUMMARY ==="
grep -E 'Plan:|No changes|Error:|Warning:' \
  "${EVIDENCE_DIR}/development-plan.txt" \
  | tail -30 || true

echo
echo "REVIEW-ONLY TERRAFORM PLAN COMPLETE"
echo "No resources were applied."
echo "Evidence directory: ${EVIDENCE_DIR}"
