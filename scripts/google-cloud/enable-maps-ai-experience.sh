#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-acoolcollector}"
EVIDENCE_DIR="${EVIDENCE_DIR:-${HOME}/acoolcollector-evidence/$(date -u +%Y%m%dT%H%M%SZ)-maps-ai}"
ENABLE_STREET_VIEW_PUBLISH="${ENABLE_STREET_VIEW_PUBLISH:-NO}"
mkdir -p "${EVIDENCE_DIR}"

# Cloud Shell can emit a Regional Access Boundary/Gaia warning and return a
# non-zero status even when a read-only gcloud command produced usable output.
# This helper accepts that one known warning only when stdout is non-empty.
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

# Retrieve a short-lived access token without ever writing it to the evidence
# directory. Accept the same known Cloud Shell warning only when a plausible
# non-empty token was still returned.
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

gcloud config set project "${PROJECT_ID}" --quiet
ACCESS_TOKEN="$(get_gcloud_access_token)"
printf 'verified=true\ntoken_length=%s\n' "${#ACCESS_TOKEN}" > "${EVIDENCE_DIR}/access-token-verification.txt"
unset ACCESS_TOKEN

# Contextually relevant APIs. The script attempts only names exposed as
# available to this project, and verifies the final enabled inventory.
CANDIDATE_APIS=(
  places.googleapis.com
  routes.googleapis.com
  addressvalidation.googleapis.com
  geocoding-backend.googleapis.com
  geolocation.googleapis.com
  timezone-backend.googleapis.com
  roads.googleapis.com
  routeoptimization.googleapis.com
  street-view-image-backend.googleapis.com
  maps-android-backend.googleapis.com
  maps-ios-backend.googleapis.com
  maps-backend.googleapis.com
  maps-embed-backend.googleapis.com
  static-maps-backend.googleapis.com
  maptiles.googleapis.com
  aerialview.googleapis.com
  elevation-backend.googleapis.com
  navigation.googleapis.com
  apikeys.googleapis.com
  recaptchaenterprise.googleapis.com
  speech.googleapis.com
  texttospeech.googleapis.com
  translate.googleapis.com
  documentai.googleapis.com
  aiplatform.googleapis.com
  vision.googleapis.com
)

# Publishing user-generated 360 imagery is rights-gated and stays disabled
# unless explicitly authorized for this run.
RIGHTS_GATED_APIS=(
  streetviewpublish.googleapis.com
)

AVAILABLE_FILE="${EVIDENCE_DIR}/available-services.txt"
AVAILABLE_ERR="${EVIDENCE_DIR}/available-services.stderr.txt"
ALL_ENABLED_FILE="${EVIDENCE_DIR}/all-enabled-services.txt"
ALL_ENABLED_ERR="${EVIDENCE_DIR}/all-enabled-services.stderr.txt"
ENABLED_FILE="${EVIDENCE_DIR}/enabled-maps-ai-services.txt"
SKIPPED_FILE="${EVIDENCE_DIR}/unavailable-or-unapproved-services.txt"
ATTEMPT_LOG="${EVIDENCE_DIR}/api-enable-attempts.txt"

capture_gcloud_read \
  "${AVAILABLE_FILE}" \
  "${AVAILABLE_ERR}" \
  gcloud services list --available \
    --project="${PROJECT_ID}" \
    --format='value(config.name)'

sort -u -o "${AVAILABLE_FILE}" "${AVAILABLE_FILE}"
test -s "${AVAILABLE_FILE}"

: > "${ENABLED_FILE}"
: > "${SKIPPED_FILE}"
: > "${ATTEMPT_LOG}"

APIS_TO_PROCESS=("${CANDIDATE_APIS[@]}")
if [[ "${ENABLE_STREET_VIEW_PUBLISH}" == "YES" ]]; then
  APIS_TO_PROCESS+=("${RIGHTS_GATED_APIS[@]}")
else
  printf '%s\n' "${RIGHTS_GATED_APIS[@]}" >> "${SKIPPED_FILE}"
  echo "SKIP rights-gated unless ENABLE_STREET_VIEW_PUBLISH=YES: streetviewpublish.googleapis.com"
fi

for api in "${APIS_TO_PROCESS[@]}"; do
  if ! grep -Fxq "${api}" "${AVAILABLE_FILE}"; then
    echo "SKIP unavailable or not exposed: ${api}"
    echo "${api}" >> "${SKIPPED_FILE}"
    continue
  fi

  echo "Enabling ${api}"
  status=0
  gcloud services enable "${api}" \
    --project="${PROJECT_ID}" \
    --quiet \
    >"${EVIDENCE_DIR}/enable-${api}.stdout.txt" \
    2>"${EVIDENCE_DIR}/enable-${api}.stderr.txt" || status=$?

  printf '%s status=%s\n' "${api}" "${status}" >> "${ATTEMPT_LOG}"
done

capture_gcloud_read \
  "${ALL_ENABLED_FILE}" \
  "${ALL_ENABLED_ERR}" \
  gcloud services list --enabled \
    --project="${PROJECT_ID}" \
    --format='value(config.name)'

sort -u -o "${ALL_ENABLED_FILE}" "${ALL_ENABLED_FILE}"
test -s "${ALL_ENABLED_FILE}"

for api in "${APIS_TO_PROCESS[@]}"; do
  if grep -Fxq "${api}" "${ALL_ENABLED_FILE}"; then
    echo "${api}" >> "${ENABLED_FILE}"
  elif ! grep -Fxq "${api}" "${SKIPPED_FILE}"; then
    echo "${api}" >> "${SKIPPED_FILE}"
  fi
done

sort -u -o "${ENABLED_FILE}" "${ENABLED_FILE}"
sort -u -o "${SKIPPED_FILE}" "${SKIPPED_FILE}"

FAILURES=0
for api in places.googleapis.com routes.googleapis.com addressvalidation.googleapis.com vision.googleapis.com texttospeech.googleapis.com; do
  if grep -Fxq "${api}" "${ALL_ENABLED_FILE}"; then
    echo "PASS: ${api}"
  else
    echo "FAIL: ${api}"
    FAILURES=$((FAILURES + 1))
  fi
done

cat <<'NOTICE' | tee "${EVIDENCE_DIR}/security-next-steps.txt"
Required security configuration after API activation:
- create separate Android, iOS, browser, and server credentials;
- restrict every credential to its exact APIs;
- restrict Android by package and signing certificate;
- restrict iOS by bundle identifier;
- restrict browser keys by HTTPS origin;
- use server-side signing for Static Maps and Street View Static requests;
- set per-API quotas, billing alerts, and anomaly monitoring;
- do not put server keys or URL-signing secrets in mobile apps or source control;
- do not enable Street View Publish unless ACool owns or is authorized to publish the imagery.
NOTICE

if [[ "${FAILURES}" -ne 0 ]]; then
  echo "${FAILURES} core Maps/AI APIs remain disabled or unavailable."
  exit 1
fi

echo "MAPS AND AI API ACTIVATION COMPLETE"
echo "Evidence directory: ${EVIDENCE_DIR}"
