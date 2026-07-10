# ACoolCOLLECTOR Live Activation Scorecard

## Rule

Scores are evidence-backed. Architecture, prompts, documentation, or simulated output cannot substitute for live provider evidence.

## Current verified state

- Google Cloud project `acoolcollector` exists and is active.
- Billing is enabled.
- Terraform 1.15.8 is installed in Cloud Shell.
- Terraform initialized with the Google provider.
- Terraform formatting and validation passed.
- Cloud Run, Artifact Registry, BigQuery, and Monitoring were verified enabled.
- Additional required APIs still require final activation verification.
- No Terraform apply or live Cloud Run acceptance has been recorded.

## 100-point Google Cloud activation model

| Control | Weight | Evidence required |
|---|---:|---|
| Active dedicated project and billing | 8 | project and billing output |
| Required APIs enabled | 8 | timestamped enabled-service inventory |
| Terraform format and validation | 5 | successful validation output |
| Review-only Terraform plan | 8 | plan file, text export, SHA-256 digest |
| Plan security review | 5 | approved IAM, storage, network, secret, and public-access review |
| Development Terraform apply | 10 | apply output and deployment record |
| Immutable container build and push | 8 | image digest and provenance |
| Cloud Run healthy | 8 | service URL, revision, `/health`, logs |
| Workload Identity Federation | 6 | pool, provider, service account, GitHub claim restrictions |
| Secret Manager wiring | 6 | secret IDs, IAM, version timestamps; never secret values |
| Vision acceptance | 4 | authenticated candidate-only test |
| Text-to-Speech acceptance | 3 | authenticated output and disclosure test |
| Logging and monitoring | 4 | logs, uptime, 5xx policy, notification evidence |
| Budget and quota controls | 3 | budget and quota evidence |
| Backup and rollback | 5 | rollback rehearsal and recovery evidence |
| Security, privacy, accessibility, and Ruth Review | 9 | signed review records and written Go/No-Go |

Total: 100

## Promotion gates

### Gate 56

- active project and billing;
- required APIs enabled;
- Terraform validation passed;
- review-only plan created and hashed;
- plan security review started.

### Gate 77

- development apply completed;
- immutable container pushed;
- Cloud Run healthy;
- runtime service account least privilege confirmed;
- Secret Manager references attached;
- logs available.

### Gate 90

- GitHub OIDC live without a service-account key;
- Vision and Text-to-Speech acceptance passed;
- uptime and server-error alerts tested;
- budget and quotas configured;
- rollback rehearsal passed;
- privacy and accessibility review complete;
- security review has no unresolved critical issue;
- written Conditional-Go or Go recorded.

### Gate 95+

- production environment separated from development;
- production Terraform plan and apply reviewed;
- disaster recovery tested;
- QuickBooks sandbox acceptance complete;
- provider claims evidence-backed;
- external penetration testing or equivalent independent assessment complete;
- production Go recorded.

## Mandatory No-Go controls

The score cannot override these blockers:

- exposed credential not revoked;
- unresolved critical or high-risk secret exposure;
- unsupported official-partner claim;
- public private-collection artifact;
- unaudited payment or custody release;
- promotion without required legal approval;
- missing deletion/export workflow;
- inaccessible core workflow;
- no rollback path;
- no written release decision.

## Native application score model

Each native platform receives a separate score. No platform inherits the backend score.

| Domain | Weight |
|---|---:|
| Native build and signing | 10 |
| Authentication and secure storage | 10 |
| API contract compatibility | 8 |
| Scanner and media privacy | 10 |
| Adaptive UI and accessibility | 10 |
| Offline and synchronization behavior | 8 |
| Security and attestation | 10 |
| Unit, UI, integration, and device tests | 12 |
| Store privacy and policy readiness | 8 |
| Crash, performance, and observability | 6 |
| Rollback and feature flags | 4 |
| Ruth Review and release decision | 4 |

A native platform must score at least 90 and pass every mandatory control before public release.

## Next evidence sequence

1. Enable and verify all required APIs.
2. Remove accidental nested repository clone.
3. Create the review-only Terraform plan and SHA-256 evidence.
4. Review the plan for IAM, storage, public access, network, billing, and duplication.
5. Build and push an immutable bootstrap image.
6. Apply to development.
7. Verify `/health`, logs, Vision, speech, uptime, and alerts.
8. Configure OIDC and remove all long-lived deployment keys.
9. Run rollback rehearsal.
10. Record Conditional-Go or No-Go.
