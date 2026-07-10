#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-acoolcollector}"
EVIDENCE_DIR="${EVIDENCE_DIR:-${HOME}/acoolcollector-evidence/$(date -u +%Y%m%dT%H%M%SZ)-maps-ai}"
mkdir -p "${EVIDENCE_DIR}"

gcloud config set project "${PROJECT_ID}" --quiet
gcloud auth print-access-token >/dev/null

# Contextually relevant APIs. The script enables only names exposed as available
# to this project. This avoids breaking activation when Google renames, restricts,
# or does not expose an optional service in a region/account.
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
  streetviewpublish.googleapis.com
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

AVAILABLE_FILE="${EVIDENCE_DIR}/available-services.txt"
ENABLED_FILE="${EVIDENCE_DIR}/enabled-maps-ai-services.txt"
SKIPPED_FILE="${EVIDENCE_DIR}/unavailable-or-unapproved-services.txt"

gcloud services list --available \
  --project="${PROJECT_ID}" \
  --format='value(config.name)' \
  | sort > "${AVAILABLE_FILE}"

: > "${ENABLED_FILE}"
: > "${SKIPPED_FILE}"

for api in "${CANDIDATE_APIS[@]}"; do
  if grep -Fxq "${api}" "${AVAILABLE_FILE}"; then
    echo "Enabling ${api}"
    gcloud services enable "${api}" --project="${PROJECT_ID}" --quiet
    echo "${api}" >> "${ENABLED_FILE}"
  else
    echo "SKIP unavailable or not exposed: ${api}"
    echo "${api}" >> "${SKIPPED_FILE}"
  fi
done

gcloud services list --enabled \
  --project="${PROJECT_ID}" \
  --format='value(config.name)' \
  | sort > "${EVIDENCE_DIR}/all-enabled-services.txt"

FAILURES=0
for api in places.googleapis.com routes.googleapis.com addressvalidation.googleapis.com vision.googleapis.com texttospeech.googleapis.com; do
  if grep -Fxq "${api}" "${EVIDENCE_DIR}/all-enabled-services.txt"; then
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
