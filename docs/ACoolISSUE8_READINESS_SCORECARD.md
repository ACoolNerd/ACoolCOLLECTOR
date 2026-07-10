# ACoolCOLLECTOR Issue #8 Readiness Scorecard

## Purpose

This scorecard distinguishes engineering completion from live external activation. Scores are calculated from current evidence; they are not marketing claims.

## Promotion bands

| Score | Gate | Required meaning |
|---:|---|---|
| 0–39 | Foundation | Concept, schema, or disconnected prototype |
| 40–55 | Configured | Core code exists, but provider configuration and acceptance are incomplete |
| 56–76 | Development candidate | Deployable foundation with unresolved mandatory controls |
| 77–89 | Sandbox/staging candidate | Real provider connection exists; reconciliation, security, or approval remains |
| 90–94 | Production candidate | Mandatory controls passed; final release review or observation remains |
| 95–99 | Release ready | Current evidence, monitoring, rollback, and approvals are complete |
| 100 | Accepted scope | Full acceptance for the defined environment and evidence window |

## Current engineering scores

| Domain | Score | Evidence |
|---|---:|---|
| Repository engineering foundation | 97 | TypeScript, Python, Docker, Terraform, metadata, source-registry, secret, and private-artifact checks pass |
| Google Cloud deployment engineering | 96 | Cloud Run container, Terraform, OIDC deployment workflow, least-privilege runtime identity, storage, Tasks, Pub/Sub, Secret Manager resources, health verification, and evidence artifacts |
| QuickBooks integration engineering | 93 | OAuth state, callback, token exchange, refresh, protected token utilities, realm connection model, invoice API, idempotency, webhook HMAC and replay storage, accounting mappings, and tests |
| Official event-source monitoring | 94 | HTTPS/host controls, source fingerprints, ETag/Last-Modified capture, stale/change states, official ticket-link boundary, and source-check records |
| Retailer, event, and grading integration architecture | 93 | External organization registry, locations, capabilities, request status, agreement evidence, trademark and public wording controls, source timestamps, and outreach kit |
| Evidence-backed release governance | 96 | Weighted controls, mandatory no-go rules, evidence expiry, deployment records, release decisions, child issues, and written runbook |
| Security and private-data engineering | 96 | Authenticated services, IAM permissions, RLS foundations, credential scanning, private-artifact checks, raw webhook verification, and fail-closed publication defaults |

## Current live activation scores

| Domain | Score | Why it is not yet over 90 |
|---|---:|---|
| Google Cloud development activation | 35 | Project, billing, GitHub OIDC, Terraform apply, Cloud Run URL, endpoint tests, monitoring, budget, and rollback evidence are not yet recorded |
| QuickBooks sandbox activation | 40 | Intuit application, real sandbox OAuth, realm ID, refresh, accounting transactions, reconciliation, and accountant approval are not yet recorded |
| External affiliations and data rights | 12 | Research and outreach infrastructure exists, but written provider approvals and agreement evidence remain outstanding |
| Production operational readiness | 52 | Strong engineering package, but external authorizations, live monitoring, provider acceptance, security review, and Ruth Review remain mandatory |

## Path through 56, 77, and 90+

### Google Cloud

**Reach 56**

- Development project and billing confirmed
- GitHub OIDC configured
- Terraform plan reviewed
- Immutable image pushed

**Reach 77**

- Terraform applied
- Cloud Run endpoint healthy
- Vision and Text-to-Speech tests pass
- Secret versions and least-privilege roles verified

**Reach 90+**

- Monitoring, error rate, latency, quota, and budget evidence
- Domain and TLS acceptance
- Abuse protection
- Rollback drill
- Security and privacy review
- Ruth Review and written go decision

### QuickBooks

**Reach 56**

- Intuit application exists
- Exact sandbox redirect and webhook configured
- Credentials stored through the approved secret process

**Reach 77**

- Sandbox OAuth and realm ID confirmed
- Refresh token cycle passes
- Customer, vendor, and invoice acceptance passes
- Signed webhook received

**Reach 90+**

- Payment, deposit, refund, fee, commission, and consignor payable reconciliation
- Replay and duplicate-write tests
- Exception and mismatch queue review
- Accountant approval
- Ruth Review
- Written production decision

### Events, retailers, and graders

**Reach 56**

- Official identity and source confirmed
- Contact owner assigned
- Outreach approved and sent

**Reach 77**

- Provider response received
- Permitted data, links, refresh cadence, and public wording documented
- Trademark and affiliation status recorded

**Reach 90+**

- Executed agreement or explicit written approval
- Production source or feed accepted
- Monitoring and correction process live
- Privacy, terms, accounting, and expiration controls complete
- Public claim reviewed and approved

## Mandatory controls

A score cannot produce a `go` decision while any mandatory control is missing, failed, expired, or revoked. Mandatory controls include:

- provider authorization;
- official source evidence;
- credential protection;
- working authentication;
- accounting reconciliation;
- webhook and idempotency controls;
- least-privilege IAM;
- monitoring and rollback;
- privacy and security review;
- supported affiliation wording;
- written go/no-go decision.

## Current decision

**Engineering:** release-candidate quality, above 90 for the defined repository scope.

**Live external operation:** no-go until Issues #9–#16 contain provider-generated evidence.

This is the correct path to moving the live scores from the 35–52 range, through 56 and 77, and ultimately above 90 without fabricating activation.
