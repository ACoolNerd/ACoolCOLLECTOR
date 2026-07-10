# ACoolCOLLECTOR Maps Cloud Shell Activation Note

## Verified observation

Cloud Shell may emit a Regional Access Boundary / Gaia warning while still completing ordinary `gcloud` operations. The Maps activation script must not require a raw access-token preflight because API activation is performed through authenticated `gcloud` commands and final enabled-service verification.

## Current behavior

`scripts/google-cloud/enable-maps-ai-experience.sh` now:

- tolerates the known warning only when a read command produced non-empty output;
- verifies the active account without persisting credentials;
- does not write access tokens to disk;
- attempts only APIs exposed to the project;
- verifies the final enabled-service inventory;
- keeps Street View Publish disabled unless explicitly rights-authorized.

## Acceptance evidence

The Maps activation is accepted only when the evidence directory contains:

- `identity-verification.txt`
- `available-services.txt`
- `all-enabled-services.txt`
- `enabled-maps-ai-services.txt`
- `unavailable-or-unapproved-services.txt`
- `api-enable-attempts.txt`
- `security-next-steps.txt`

and the terminal ends with:

```text
MAPS AND AI API ACTIVATION COMPLETE
```

The Terraform planning gate is accepted separately only when the plan, text and JSON renderings, and SHA-256 file exist and the terminal ends with:

```text
REVIEW-ONLY TERRAFORM PLAN COMPLETE
```
