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
TF_STATE_BUCKET="${TF_STATE_BUCKET:-${PROJECT_ID}-terraform-state}"
TF_STATE_PREFIX="${TF_STATE_PREFIX:-acoolcollector/${ENVIRONMENT}}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TF_DIR="${ROOT_DIR}/infra/google-cloud/terraform"
EVIDENCE_DIR="${EVIDENCE_DIR:-${HOME}/acoolcollector-evidence/$(date -u +%Y%m%dT%H%M%SZ)}"

mkdir -p "${EVIDENCE_DIR}"

# Accept the known Cloud Shell Regional Access Boundary/Gaia warning only for
# read-only gcloud calls that still produced non-empty stdout. Every result is
# then validated from the captured evidence before continuing.
capture_gcloud_read() {
  local stdout_file="$1"
  local stderr_file="$2"
  shift 2

  local status=0
  "$@" >"${stdout_file}" 2>"${stderr_file}" || status=$?

  if [[ "${status}" -ne 0 ]]; then
    if [[ -s "${stdout_file}" ]] && grep -q 'Regional Access Boundary HTTP request failed after retries' "${stderr_file}"; then
      echo "WARNING: accepted non-fatal Cloud Shell Regional Access Boundary read warning." >&2
    else
      cat "${stderr_file}" >&2 || true
      return "${status}"
    fi
  fi
}

# Retrieve a short-lived access token without persisting the token to disk.
# The known Cloud Shell warning is accepted only when a plausible token exists.
get_gcloud_access_token() {
  local token_file stderr_file status token
  token_file="$(mktemp)"
  stderr_file="$(mktemp)"
  status=0

  gcloud auth print-access-token >"${token_file}" 2>"${stderr_file}" || status=$?
  token="$(tr -d '\r\n' <"${token_file}")"

  if [[ -z "${token}" || "${#token}" -lt 20 ]]; then
    cat "${stderr_file}" >&2 || true
    rm -f "${token_file}" "${stderr_file}"
    echo "Unable to obtain a usable short-lived Google Cloud access token." >&2
    return 1
  fi

  if [[ "${status}" -ne 0 ]] && ! grep -q 'Regional Access Boundary HTTP request failed after retries' "${stderr_file}"; then
    cat "${stderr_file}" >&2 || true
    rm -f "${token_file}" "${stderr_file}"
    return "${status}"
  fi

  rm -f "${token_file}" "${stderr_file}"
  printf '%s' "${token}"
}

echo "=== ACoolCOLLECTOR DEVELOPMENT ACTIVATION ==="
echo "Project: ${PROJECT_ID}"
echo "Region: ${REGION}"
echo "Environment: ${ENVIRONMENT}"
echo "State bucket: ${TF_STATE_BUCKET}"
echo "Evidence: ${EVIDENCE_DIR}"

gcloud config set project "${PROJECT_ID}" --quiet
ACCESS_TOKEN="$(get_gcloud_access_token)"
printf 'verified=true\ntoken_length=%s\n' "${#ACCESS_TOKEN}" > "${EVIDENCE_DIR}/access-token-verification.txt"
unset ACCESS_TOKEN

capture_gcloud_read \
  "${EVIDENCE_DIR}/project.yaml" \
  "${EVIDENCE_DIR}/project.stderr.txt" \
  gcloud projects describe "${PROJECT_ID}" \
    --format="yaml(projectId,projectNumber,name,lifecycleState)"
cat "${EVIDENCE_DIR}/project.yaml"

if ! grep -q "projectId: ${PROJECT_ID}" "${EVIDENCE_DIR}/project.yaml" \
  || ! grep -q 'lifecycleState: ACTIVE' "${EVIDENCE_DIR}/project.yaml"; then
  echo "Project verification failed for ${PROJECT_ID}."
  exit 1
fi

capture_gcloud_read \
  "${EVIDENCE_DIR}/billing.yaml" \
  "${EVIDENCE_DIR}/billing.stderr.txt" \
  gcloud billing projects describe "${PROJECT_ID}" \
    --format="yaml(projectId,billingEnabled,billingAccountName)"
cat "${EVIDENCE_DIR}/billing.yaml"

if ! grep -q 'billingEnabled: true' "${EVIDENCE_DIR}/billing.yaml"; then
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
ENABLE_STATUS=0
gcloud services enable "${REQUIRED_APIS[@]}" \
  --project="${PROJECT_ID}" \
  --quiet \
  >"${EVIDENCE_DIR}/required-api-enable.stdout.txt" \
  2>"${EVIDENCE_DIR}/required-api-enable.stderr.txt" || ENABLE_STATUS=$?
echo "gcloud services enable exit status: ${ENABLE_STATUS}" | tee "${EVIDENCE_DIR}/required-api-enable.status.txt"

capture_gcloud_read \
  "${EVIDENCE_DIR}/enabled-services.txt" \
  "${EVIDENCE_DIR}/enabled-services.stderr.txt" \
  gcloud services list \
    --enabled \
    --project="${PROJECT_ID}" \
    --format="value(config.name)"
sort -u -o "${EVIDENCE_DIR}/enabled-services.txt" "${EVIDENCE_DIR}/enabled-services.txt"
test -s "${EVIDENCE_DIR}/enabled-services.txt"

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

if ! gcloud storage buckets describe "gs://${TF_STATE_BUCKET}" \
  --project="${PROJECT_ID}" >/dev/null 2>&1; then
  echo "=== CREATING TERRAFORM STATE BUCKET ==="
  gcloud storage buckets create "gs://${TF_STATE_BUCKET}" \
    --project="${PROJECT_ID}" \
    --location="${REGION}" \
    --uniform-bucket-level-access \
    --public-access-prevention \
    --soft-delete-duration=7d
fi

gcloud storage buckets update "gs://${TF_STATE_BUCKET}" \
  --project="${PROJECT_ID}" \
  --versioning

gcloud storage buckets describe "gs://${TF_STATE_BUCKET}" \
  --project="${PROJECT_ID}" \
  --format="yaml(name,location,uniformBucketLevelAccess,publicAccessPrevention,versioning)" \
  | tee "${EVIDENCE_DIR}/terraform-state-bucket.yaml"

if ! command -v terraform >/dev/null 2>&1; then
  echo "Terraform is not installed or is not on PATH."
  exit 1
fi

terraform version | tee "${EVIDENCE_DIR}/terraform-version.txt"

cd "${TF_DIR}"
terraform init \
  -reconfigure \
  -backend-config="bucket=${TF_STATE_BUCKET}" \
  -backend-config="prefix=${TF_STATE_PREFIX}"
terraform fmt -check -recursive
terraform validate | tee "${EVIDENCE_DIR}/terraform-validate.txt"

BILLING_ACCOUNT_ID="$(sed -n 's/^[[:space:]]*billingAccountName: billingAccounts\///p' "${EVIDENCE_DIR}/billing.yaml" | head -1)"
if [[ -z "${BILLING_ACCOUNT_ID}" ]]; then
  echo "Unable to derive billing account ID from verified billing evidence."
  exit 1
fi

export GOOGLE_OAUTH_ACCESS_TOKEN="$(get_gcloud_access_token)"
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
echo "No application resources were applied."
echo "Terraform state bucket is active and versioned."
echo "Evidence directory: ${EVIDENCE_DIR}"
