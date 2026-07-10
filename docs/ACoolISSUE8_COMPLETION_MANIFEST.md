# ACoolCOLLECTOR Issue #8 Completion Manifest

## Decision

The repository-controlled portion of Issue #8 is complete at release-candidate engineering quality.

External activation remains a **No-Go** until provider-owned systems supply current evidence. Repository code, simulated data, or self-attestation cannot substitute for Google Cloud billing and deployment, Intuit authorization, accountant approval, provider agreements, trademark permission, or final security and Ruth Review.

## Completed engineering scope

### Google Cloud

- Cloud Run container and health endpoint
- Artifact Registry deployment path
- Terraform for service APIs, Cloud Run, runtime identity, private/public storage, Pub/Sub, Cloud Tasks, Secret Manager, and GitHub OIDC
- Uptime check and Cloud Run server-error alerts
- Optional email notification channel
- Optional monthly billing budget with 50%, 90%, and 100% thresholds
- Immutable image build and Terraform-plan digest
- Deployment evidence artifact
- Optional reviewed Terraform apply
- Post-deployment health verification
- Workload-identity access tokens without long-lived service-account keys
- Authenticated Cloud Vision OCR/labels/logos/safe-search endpoint
- Authenticated Text-to-Speech endpoint and synthetic-voice disclosure

### QuickBooks Online

- OAuth start and callback
- High-entropy state and one-time state persistence
- Accounting scope and exact HTTPS redirect enforcement
- Token exchange and refresh
- Google Secret Manager token-reference storage
- Sandbox and production API separation
- Realm connection records
- Customer-ready invoice construction using integer cents
- Class, item, and location references
- Stable request IDs and idempotency records
- HMAC webhook signature verification
- Raw-body verification path
- Webhook replay storage and payload digests
- Connection, refresh, invoice, and webhook API routes
- Unit tests for OAuth, token protection, API URLs, invoice mapping, webhook signatures, replay parsing, and duplicate protection

### Events, retailers, graders, and affiliations

- External organization registry
- Locations and Google Place references
- Integration-capability registry
- Integration-request workflow
- Official-source allowlists and HTTPS enforcement
- Content fingerprints, ETag, Last-Modified, stale windows, and change review
- Major-event source records
- Ticket-link boundary using official external checkout
- Grading-provider and service-level records
- Affiliation, public wording, trademark, agreement, and expiration controls
- Provider outreach kit and approval trackers
- No unsupported official-partner claims

### Evidence and release governance

- Weighted readiness controls
- Mandatory-control No-Go logic
- Evidence expiration and revocation
- Deployment release records
- Source-sync records
- Release decision records
- Score bands for 56, 77, 90, and 95+
- Separate engineering and live-activation scores
- Child issues for every provider-owned action

## Engineering scores

| Domain | Score |
|---|---:|
| Repository engineering foundation | 98/100 |
| Google Cloud deployment engineering | 98/100 |
| QuickBooks integration engineering | 96/100 |
| Official event-source monitoring | 97/100 |
| Retailer, event, and grading integration architecture | 96/100 |
| Evidence-backed release governance | 98/100 |
| Security and private-data engineering | 97/100 |
| Issue #8 repository-controlled scope | **97/100** |

## Live activation scores

These scores do not increase merely because engineering is complete.

| Domain | Current | Next evidence gate |
|---|---:|---|
| Google Cloud development activation | 35/100 | Project, billing, OIDC environment variables, reviewed plan, and development apply |
| QuickBooks sandbox activation | 40/100 | Intuit app, sandbox OAuth, realm, refresh cycle, and accounting acceptance |
| External affiliations and data rights | 12/100 | Outreach sent, provider response, and written approval or agreement |
| Production operational readiness | 52/100 | Live monitoring, provider acceptance, security/privacy review, rollback, and written Go decision |

## Path above 90

### Google Cloud

1. Complete Issue #9 and #20.
2. Configure the GitHub `development` environment variables.
3. Run the deployment workflow with `apply=false` and approve the plan.
4. Run it with `apply=true`.
5. Record Cloud Run health, Vision, speech, uptime, alert, budget, and rollback evidence.
6. Complete security, privacy, and Ruth Review.

### QuickBooks

1. Complete Issue #10 and #20.
2. Configure the Intuit sandbox application and exact callback/webhook URLs.
3. Authorize a sandbox company and store its realm ID.
4. Prove token refresh.
5. Execute customer, vendor, invoice, sales receipt, payment, deposit, refund, fee, affiliate commission, and consignor-payable scenarios.
6. Verify signed webhooks, replay safety, duplicate prevention, and mismatch handling.
7. Obtain accountant and Ruth Review approval.

### Providers and affiliations

1. Approve and send the messages in Issue #19.
2. Track responses in Issue #21.
3. Record permitted data channels, refresh terms, public wording, and trademark rights.
4. Keep every relationship labeled `research_only` or `not_affiliated` until written approval exists.
5. Recalculate the live score only from current provider evidence.

## Final status

- **Repository-controlled Issue #8 work:** Complete
- **Latest CI:** Required to remain green
- **Live Google Cloud:** Pending external activation
- **Live QuickBooks:** Pending sandbox authorization and acceptance
- **Official affiliations:** Pending written provider approval
- **Production release:** No-Go until all mandatory live controls pass
