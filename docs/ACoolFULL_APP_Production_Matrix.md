# ACoolCOLLECTOR Full-App Production Matrix

## Operating Rule

**Rights → Disclosure → Proof**

Every surface must distinguish:

- implemented;
- configured;
- tested;
- connected;
- approved;
- live.

No screen may infer a later state from an earlier one.

## Identity, Onboarding, and IAM

| Capability | Production Requirement | Current Branch State |
|---|---|---|
| Email/password login | Real identity provider, rate limiting, error handling | Supabase Auth adapter added |
| MFA | Provider-enforced factor enrollment and challenge | External configuration required |
| Session refresh | Rotating provider refresh token | Adapter added |
| Logout/revocation | Provider logout and local state removal | Adapter added |
| Organizations | Database-backed tenant boundary | Migration added |
| Roles | Central role catalog | Migration added |
| Permissions | Server-enforced permission catalog | Migration and middleware added |
| Ambassador code | Hashed code, limits, expiry, audit | Migration and API added |
| Affiliate code | Hashed code, limits, expiry, audit | Migration and API added |
| Partner code | Hashed code, limits, expiry, audit | Migration and API added |
| QR onboarding | QR contains a public onboarding URL and opaque code | UI recovery/build required |
| Agreement execution | Versioned terms, signer identity, timestamp, evidence | Planned; legal review required |

Referral codes do not automatically create privileged operational access. A code may assign only its approved default role. Permission elevation requires a separate administrator action and audit event.

## Collection and Card Profiles

| Capability | Production Requirement | State |
|---|---|---|
| Private asset intake | ACool Asset ID, owner, evidence, source image | 100-item runtime manifest prepared |
| Image upload | Private object storage, signed URLs, malware and size controls | Planned |
| OCR | Structured extraction with confidence and source image | Existing vision scaffold; hardening required |
| Exact card match | Set, number, parallel, language, serial, edition | Planned evaluation pipeline |
| Duplicate detection | Image and identity collision checks | Planned |
| Card profile | Identity, evidence, pricing, grade, custody, commerce | Data model expansion required |
| Public profile | Redacted, owner-approved and review-approved fields only | Planned |

AI recognition may propose an identity. It cannot establish authenticity, title, ownership, grade, or insurance coverage.

## Pricing and Market Intelligence

| Source Class | Treatment |
|---|---|
| SportsCardsPro | Current guide values and yearly sales volume |
| Completed sales | Separate market-observation records |
| Active listings | Separate asking-price records |
| Dealer offer | Separate executable or nonbinding offer record |
| Internal cost basis | Private owner/accounting record |

The branch now supports all documented SportsCardsPro current-guide fields, integer-cent storage, one-at-a-time scheduling, and a 24-hour cache.

Future connectors for eBay, 130 Point, Card Ladder, Market Movers, TCGplayer, PSA, CGC, Beckett, or TAG require:

- documented and permitted API or licensed data access;
- provider-specific terms review;
- server-side credentials;
- source timestamps;
- rate limits;
- field provenance;
- stale-data behavior;
- tests and monitoring.

Screen scraping must not be treated as a default production integration.

## Grading Intelligence

A grading recommendation must include:

- visible-condition observations;
- confidence;
- centering measurements;
- corner, edge and surface observations;
- likely grade range, not a guaranteed grade;
- raw value scenario;
- graded value scenarios;
- submission fee and shipping assumptions;
- expected-value calculation;
- break-even result;
- recommendation and reason;
- human approval.

Grading-company price, turnaround, population, certification, and service data must be timestamped and sourced from an approved connector or manual evidence.

## Marketplace and Consignment

The branch removes invented public listings and adds database-backed private drafts.

Publication requires:

- identity verified;
- ownership verified;
- condition reviewed;
- price evidence reviewed;
- owner approval;
- Ruth Review;
- return and shipping terms;
- approved public images;
- public disclosure record.

Private collection status remains the default.

## Trades and Custody

Use **trade hold** or **custody workflow** until qualified counsel and an authorized provider approve the legal use of the term **escrow**.

A trade-hold workflow requires:

- authenticated parties;
- beneficial ownership assertions;
- asset identity and condition evidence;
- agreed trade terms;
- shipping or custody instructions;
- receipt evidence;
- dispute window;
- dual release decision;
- exception and return path;
- immutable audit history.

KYC, AML, sanctions, identity, insurance, and legal escrow status must come from qualified providers. A UI toggle or AI message is never proof of clearance.

## Payments and QuickBooks

### QuickBooks Card-Present

1. ACoolCOLLECTOR creates an order.
2. The server creates a QuickBooks invoice.
3. Staff opens it in QuickBooks Mobile or GoPayment.
4. QuickBooks controls the reader or Tap to Pay.
5. ACoolCOLLECTOR reconciles paid status.
6. Fulfillment releases once.

### Stripe and Wallets

A future Stripe integration may expose wallet methods supported by the approved Stripe configuration. Production requires server-created payment intents, webhook verification, idempotency, amount reconciliation, refund controls, and no raw card storage.

The application must never claim Apple Pay, Google Pay, Stripe, QuickBooks Payments, or any other method is active merely because a visual button or simulator exists.

## Vendors and Card Shops

Required records:

- organization;
- verified contact;
- roles;
- business status and evidence where required;
- service capabilities;
- supported categories;
- geography;
- pricing and service disclosures;
- grading-submission permissions;
- incident and quality history;
- active/suspended status.

A directory listing does not imply endorsement, licensing, insurance, grading authorization, or financial suitability unless that evidence is explicitly recorded.

## Set Archive

The archive should store:

- game or sport;
- manufacturer/publisher;
- set and subset;
- release date;
- checklist size;
- card number;
- subject;
- variation/parallel;
- language;
- rarity;
- serial numbering;
- source and license;
- last verified timestamp.

Set checklists must respect source terms and licensing.

## Recommendation Engine

Recommendations are advisory and must show:

- objective;
- input data;
- missing data;
- confidence;
- assumptions;
- risks;
- expected costs;
- estimated outcomes;
- alternative action;
- approval requirement.

Recommendations cannot guarantee investment return, grading result, sale price, authentication, or liquidity.

## A/B Testing

Production experiments require:

- hypothesis;
- experiment owner;
- eligible population;
- assignment unit;
- stable randomization;
- mutually exclusive variants;
- primary and guardrail metrics;
- privacy and consent review;
- start/stop criteria;
- exposure event;
- statistical-analysis plan;
- decision record.

Synthetic traffic is acceptable only for testing instrumentation and must be labeled synthetic.

## Production Sequence

1. Resolve credential incident and protect `main`.
2. Apply Supabase migrations in a nonproduction project.
3. Configure Auth and MFA.
4. Test organization boundaries and permissions.
5. Recover the local Gemini UI source.
6. Replace every simulation with a demo adapter or sandbox provider.
7. Implement private object storage and card intake.
8. Run the 100-item SportsCardsPro sync.
9. Verify the first 25 assets manually.
10. Enable private listing review.
11. Test QuickBooks sandbox and card-present handoff.
12. Add approved payments only after provider onboarding.
13. Run accessibility, security, restore, and incident tests.
14. Complete Ruth Review.
15. Sign a written go/no-go decision.
