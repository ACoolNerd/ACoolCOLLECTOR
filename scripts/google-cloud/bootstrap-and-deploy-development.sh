#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-acoolcollector}"
REGION="${REGION:-us-central1}"
ENVIRONMENT="${ENVIRONMENT:-development}"
PUBLIC_SITE_URL="${PUBLIC_SITE_URL:-https://acoolcollector.com}"
ALLOWED_ORIGINS_JSON="${ALLOWED_ORIGINS_JSON:-[\"https://acoolcollector.com\",\"https://www.acoolcollector.com\"]}"
ALERT_EMAIL="${ALERT_EMAIL:-}"
MONTHLY_BUDGET_USD="${MONTHLY_BUDGET_USD:-250}"
ENABLE_GITHUB_OIDC="${ENABLE_GITHUB_OIDC:-true}"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-ACoolNerd/ACoolCOLLECTOR}"
GITHUB_BRANCH="${GITHUB_BRANCH:-main}"
TF_STATE_BUCKET="${TF_STATE_BUCKET:-${PROJECT_ID}-terraform-state}"
TF_STATE_PREFIX="${TF_STATE_PREFIX:-acoolcollector/${ENVIRONMENT}}"
ACCEPT_BOOTSTRAP="${ACCEPT_BOOTSTRAP:-NO}"
ACCEPT_FULL_APPLY="${ACCEPT_FULL_APPLY:-NO}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TF_DIR="${ROOT_DIR}/infra/google-cloud/terraform"
EVIDENCE_DIR="${EVIDENCE_DIR:-${HOME}/acoolcollector-evidence/$(date -u +%Y%m%dT%H%M%SZ)-deploy}"
IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/acoolcollector/acoolcollector-api:$(git -C "${ROOT_DIR}" rev-parse --short=12 HEAD)"
PLACEHOLDER_IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/acoolcollector/acoolcollector-api:bootstrap"

mkdir -p "${EVIDENCE_DIR}"

if [[ "${ACCEPT_BOOTSTRAP}" != "YES" ]]; then
  cat <<'MESSAGE'
Bootstrap was not authorized.

Review the Terraform plan first, then rerun with:

  ACCEPT_BOOTSTRAP=YES bash scripts/google-cloud/bootstrap-and-deploy-development.sh

To authorize the final full development apply in the same run, also set:

  ACCEPT_FULL_APPLY=YES
MESSAGE
  exit 2
fi

gcloud config set project "${PROJECT_ID}" --quiet

gcloud auth print-access-token >/dev/null

if ! command -v terraform >/dev/null 2>&1; then
  echo "Terraform is not installed or not on PATH."
  exit 1
fi

PROJECT_ID="${PROJECT_ID}" \
REGION="${REGION}" \
ENVIRONMENT="${ENVIRONMENT}" \
PUBLIC_SITE_URL="${PUBLIC_SITE_URL}" \
ALLOWED_ORIGINS_JSON="${ALLOWED_ORIGINS_JSON}" \
ALERT_EMAIL="${ALERT_EMAIL}" \
MONTHLY_BUDGET_USD="${MONTHLY_BUDGET_USD}" \
ENABLE_GITHUB_OIDC="${ENABLE_GITHUB_OIDC}" \
GITHUB_REPOSITORY="${GITHUB_REPOSITORY}" \
GITHUB_BRANCH="${GITHUB_BRANCH}" \
TF_STATE_BUCKET="${TF_STATE_BUCKET}" \
TF_STATE_PREFIX="${TF_STATE_PREFIX}" \
EVIDENCE_DIR="${EVIDENCE_DIR}/preflight" \
bash "${ROOT_DIR}/scripts/google-cloud/activate-and-plan-development.sh"

BILLING_ACCOUNT_ID="$(gcloud billing projects describe "${PROJECT_ID}" --format='value(billingAccountName)' | sed 's#^billingAccounts/##')"

export GOOGLE_OAUTH_ACCESS_TOKEN="$(gcloud auth print-access-token)"
trap 'unset GOOGLE_OAUTH_ACCESS_TOKEN' EXIT

cd "${TF_DIR}"
terraform init \
  -reconfigure \
  -backend-config="bucket=${TF_STATE_BUCKET}" \
  -backend-config="prefix=${TF_STATE_PREFIX}"

COMMON_ARGS=(
  -var="project_id=${PROJECT_ID}"
  -var="region=${REGION}"
  -var="environment=${ENVIRONMENT}"
  -var="container_image=${PLACEHOLDER_IMAGE}"
  -var="public_site_url=${PUBLIC_SITE_URL}"
  -var="allowed_origins=${ALLOWED_ORIGINS_JSON}"
  -var="enable_github_oidc=${ENABLE_GITHUB_OIDC}"
  -var="github_repository=${GITHUB_REPOSITORY}"
  -var="github_branch=${GITHUB_BRANCH}"
  -var="alert_email=${ALERT_EMAIL}"
  -var="billing_account_id=${BILLING_ACCOUNT_ID}"
  -var="monthly_budget_usd=${MONTHLY_BUDGET_USD}"
)

echo "=== BOOTSTRAPPING APIS, ARTIFACT REGISTRY, AND RUNTIME IDENTITY ==="
terraform apply \
  -auto-approve \
  -target='google_project_service.required' \
  -target='google_artifact_registry_repository.containers' \
  -target='google_service_account.runtime' \
  "${COMMON_ARGS[@]}" \
  | tee "${EVIDENCE_DIR}/bootstrap-apply.txt"

echo "=== BUILDING IMMUTABLE CONTAINER WITH CLOUD BUILD ==="
gcloud builds submit "${ROOT_DIR}/src/omni-engine" \
  --project="${PROJECT_ID}" \
  --tag="${IMAGE_TAG}" \
  --quiet \
  | tee "${EVIDENCE_DIR}/cloud-build.txt"

DIGEST="$(
  gcloud artifacts docker images describe "${IMAGE_TAG}" \
    --project="${PROJECT_ID}" \
    --location="${REGION}" \
    --format='value(image_summary.digest)'
)"

test -n "${DIGEST}"
IMMUTABLE_IMAGE="${IMAGE_TAG}@${DIGEST}"
printf '%s\n' "${IMMUTABLE_IMAGE}" | tee "${EVIDENCE_DIR}/immutable-image.txt"

FULL_ARGS=(
  -var="project_id=${PROJECT_ID}"
  -var="region=${REGION}"
  -var="environment=${ENVIRONMENT}"
  -var="container_image=${IMMUTABLE_IMAGE}"
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
  "${FULL_ARGS[@]}" \
  -out="${EVIDENCE_DIR}/development-full.tfplan"

terraform show -no-color "${EVIDENCE_DIR}/development-full.tfplan" \
  > "${EVIDENCE_DIR}/development-full-plan.txt"

terraform show -json "${EVIDENCE_DIR}/development-full.tfplan" \
  > "${EVIDENCE_DIR}/development-full-plan.json"

sha256sum \
  "${EVIDENCE_DIR}/development-full.tfplan" \
  "${EVIDENCE_DIR}/development-full-plan.txt" \
  "${EVIDENCE_DIR}/development-full-plan.json" \
  "${EVIDENCE_DIR}/immutable-image.txt" \
  | tee "${EVIDENCE_DIR}/development-full.sha256"

if grep -Eq 'roles/(owner|editor)' "${EVIDENCE_DIR}/development-full-plan.txt"; then
  echo "Blocked: plan contains project Owner or Editor role."
  exit 1
fi

if grep -q 'allAuthenticatedUsers' "${EVIDENCE_DIR}/development-full-plan.txt"; then
  echo "Blocked: plan contains allAuthenticatedUsers."
  exit 1
fi

if [[ "${ACCEPT_FULL_APPLY}" != "YES" ]]; then
  echo "Full plan is ready but was not applied."
  echo "Review: ${EVIDENCE_DIR}/development-full-plan.txt"
  echo "Then rerun with ACCEPT_BOOTSTRAP=YES ACCEPT_FULL_APPLY=YES."
  exit 0
fi

echo "=== APPLYING REVIEWED DEVELOPMENT PLAN ==="
terraform apply \
  -auto-approve \
  "${EVIDENCE_DIR}/development-full.tfplan" \
  | tee "${EVIDENCE_DIR}/development-full-apply.txt"

SERVICE_URL="$(
  gcloud run services describe acoolcollector-api \
    --project="${PROJECT_ID}" \
    --region="${REGION}" \
    --format='value(status.url)'
)"

test -n "${SERVICE_URL}"

HEALTH_OK=false
for attempt in $(seq 1 18); do
  if curl --fail --silent --show-error --max-time 10 "${SERVICE_URL}/health" \
    | tee "${EVIDENCE_DIR}/health.json" \
    | grep -q '"status":"ok"'; then
    HEALTH_OK=true
    break
  fi
  sleep 10
done

if [[ "${HEALTH_OK}" != "true" ]]; then
  echo "Cloud Run health verification failed."
  exit 1
fi

gcloud run services describe acoolcollector-api \
  --project="${PROJECT_ID}" \
  --region="${REGION}" \
  --format=json \
  > "${EVIDENCE_DIR}/cloud-run-service.json"

gcloud monitoring uptime list-configs \
  --project="${PROJECT_ID}" \
  --format=json \
  > "${EVIDENCE_DIR}/uptime-configs.json" || true

cat <<MESSAGE | tee "${EVIDENCE_DIR}/deployment-summary.txt"
ACoolCOLLECTOR development deployment completed.
Project: ${PROJECT_ID}
Region: ${REGION}
Service: ${SERVICE_URL}
Image: ${IMMUTABLE_IMAGE}
State bucket: gs://${TF_STATE_BUCKET}/${TF_STATE_PREFIX}
Evidence: ${EVIDENCE_DIR}

Still required for 90+ evidence:
- authenticated Vision acceptance;
- authenticated Text-to-Speech acceptance;
- alert notification delivery test;
- budget notification evidence;
- rollback rehearsal;
- privacy, accessibility, security, and Ruth Review;
- exposed SportsCardsPro credential remediation.
MESSAGE
