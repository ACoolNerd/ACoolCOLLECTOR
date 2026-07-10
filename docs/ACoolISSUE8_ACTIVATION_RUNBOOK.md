# ACoolCOLLECTOR Issue #8 Activation Runbook

## Objective

Move ACoolCOLLECTOR from repository-complete engineering to evidence-backed development, sandbox, staging, and production readiness without inflating scores or implying unauthorized affiliations.

## Operating rule

**Rights → Disclosure → Proof**

A score may increase only when the corresponding control has current, reviewable evidence. Source code, mock screens, synthetic traffic, unexecuted Terraform, draft outreach, and simulated accounting do not count as live activation.

## Readiness bands

| Score | Meaning |
|---:|---|
| 0–39 | Concept or disconnected prototype |
| 40–59 | Foundation exists; major operational gaps remain |
| 60–76 | Deployable with significant provider or acceptance work outstanding |
| 77–89 | Near-production; one or more mandatory controls are incomplete |
| 90–94 | Production candidate; all mandatory controls passed and final review pending |
| 95–99 | Release-ready with current evidence, rollback, and monitoring |
| 100 | Fully accepted for the defined scope and observation window; not a permanent guarantee |

## Issue #8 workstreams

### Google Cloud

1. Create separate development and production projects.
2. Attach billing and budgets.
3. Configure GitHub OIDC Workload Identity Federation.
4. Use the manual deployment workflow to build an immutable image.
5. Review the Terraform plan and its digest.
6. Apply only after approval.
7. Record the Cloud Run URL, image digest, commit, plan digest, and health result.
8. Verify Vision and Text-to-Speech behavior, quotas, latency, errors, privacy, and cost.
9. Verify least-privilege IAM, secret access, bucket access, Tasks, and Pub/Sub.
10. Test rollback to the previous healthy image.

### QuickBooks Online

1. Create the Intuit application and sandbox callback.
2. Add Accounting scope and the webhook URL.
3. Configure credentials only through the approved secret path.
4. Start OAuth from an authenticated finance or organization administrator session.
5. Validate one-time state, company realm, protected token material, and expiration.
6. Test token refresh and reconnect.
7. Create test customers and vendors.
8. Test invoice, sales receipt, payment, deposit, refund, merchant fee, affiliate commission, and consignor payable flows.
9. Verify webhook signatures and duplicate-event handling.
10. Verify idempotency prevents duplicate accounting writes.
11. Reconcile ACool records against QuickBooks.
12. Obtain accountant and Ruth Review approval.

### Events and tickets

1. Monitor only official organizer or ticket-provider sources.
2. Record source URL, host, status, content type, ETag, Last-Modified, fingerprint, and check time.
3. Treat changed pages as review-required rather than silently overwriting public dates.
4. Mark stale, cancelled, moved, or unavailable events.
5. Use verified external checkout links until an approved ticket integration exists.
6. Never claim a ticket was bought without provider receipt or user confirmation.

### Retailers and grading providers

1. Confirm official identity and public contact channel.
2. Submit the approved outreach request.
3. Record capability requested: profile, locations, events, grading, inventory, affiliate, referral, API, or ticket data.
4. Record agreement reference, approved wording, trademark permission, terms, owner, and expiration.
5. Keep the public status at **Not affiliated** or **Research only** until written approval is attached.
6. Keep AI condition estimates separate from PSA, BGS, CGC, SGC, or TAG grades.

## Mandatory no-go conditions

- Exposed or unrotated credential
- Missing provider authorization
- Missing official source evidence for public date, price, or service information
- Missing accounting reconciliation
- Failed webhook or idempotency tests
- Missing privacy, security, accessibility, trademark, or terms review
- Missing rollback evidence
- Unresolved high-severity defect or incident
- Unsupported partnership, endorsement, or authorized-submission claim

## Evidence recording

Use `integration_activation_evidence` for each control. Required fields include:

- integration and environment
- control key and weight
- status
- evidence type and reference
- digest where available
- observed and expiration times
- approver and approval time
- notes and unresolved limitations

Expired or revoked evidence stops contributing to the score.

## Score promotion sequence

### Engineering foundation target: 95+

Requires successful TypeScript, Python, Docker, Terraform, metadata, source-registry, credential, and private-artifact checks.

### Development activation target: 90+

Requires a billed project, OIDC, successful Terraform apply, healthy Cloud Run endpoint, monitored Vision and Speech tests, secret management, least privilege, and rollback.

### QuickBooks sandbox target: 90+

Requires real sandbox OAuth, realm storage, protected tokens, refresh, accounting writes, reconciliation, webhooks, replay safety, idempotency, accountant review, and Ruth Review.

### External integration target: 90+

Requires official identity, approved data rights, source monitoring, agreement evidence, public wording, trademark status, privacy review, and expiration monitoring.

### Production target: 90+

Requires every mandatory control, current evidence, no high-severity blockers, written go/no-go, rollback, incident ownership, and post-launch observation.

## Go/no-go record

Each release decision must state:

- release key and environment
- score and threshold
- mandatory-control result
- evidence snapshot
- unresolved blockers
- rollback target
- decision owner
- decision time
- go, conditional go, or no-go

A manually typed score without control-level evidence is invalid.
