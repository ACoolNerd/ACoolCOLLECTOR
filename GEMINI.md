# ACoolCOLLECTOR Agent Instructions

## Mission

Build and maintain ACoolCOLLECTOR as the AI-native operating system for collectors, dealers, consignors, breakers, graders, marketplaces, and collection businesses.

The governing rule is:

> **Rights → Disclosure → Proof**

Do not optimize for a convincing demo. Optimize for a secure, testable, evidence-backed production system.

## Canonical architecture

- **ACoolOMNI** — orchestration, authorization, agent routing, approvals, and audit.
- **ACoolSCHEMA** — canonical entities, relationships, events, and data contracts.
- **ACoolCARD** — collection registry, asset identity, portfolio, pricing, and grading records.
- **BETH Bridge** — source-separated market intelligence.
- **BreakVault** — digital twins, ownership, custody, storage, and continuity.
- **ACoolBREAKS** — product proof, rules, participants, randomization, hits, and fulfillment.
- **Marketplace and Consignment** — listings, offers, seller rights, settlement, and returns.
- **QuickBooks Finance** — accounting, customers, invoices, payments, fees, refunds, and reporting.
- **HOWARD Help** — support, onboarding, routing, and escalation.
- **Ruth Review** — identity, pricing, claims, publication, and release approval.

## ACool naming rules

Critical public modules, services, schemas, prompts, operating documents, and generated business artifacts should use the `ACool` prefix where it improves clarity.

Examples:

- `ACoolAPI_Pricing`
- `ACoolINVENTORY_Master`
- `ACoolASSET_ID`
- `ACoolARCHITECTURE`
- `ACoolPROTOCOL_Selling`
- `ACoolAUDIT_Event`

Do not rename established external concepts or create awkward identifiers merely to force a prefix.

## Source-of-truth rules

1. The private collection manifest is the intake source for the current pilot.
2. `data/processed/ACoolINVENTORY_Master.csv` may be a transitional operational source before database migration.
3. PostgreSQL becomes the transactional source after the approved migration.
4. Private card images, receipts, ownership records, certification evidence, and listing outputs must never be committed publicly.
5. Every public card must map to one immutable ACool Asset ID.
6. Provider IDs are references, not ownership or identity proof by themselves.

## SportsCardsPro rules

- Use only a rotated `SPORTSCARDSPRO_API_TOKEN`.
- Run provider requests server-side.
- Never include tokens in source, logs, screenshots, design files, issues, pull requests, chat, or client bundles.
- Keep at least 1.0 seconds between API calls.
- Cache current guide values for 24 hours unless policy changes.
- Preserve integer-cent values and raw provider timestamps.
- Treat provider values as current guide scenarios, not historical sales.
- Keep completed sales, active asks, dealer quotes, and provider values in separate evidence classes.
- A provider match must not publish or price a card automatically.

## Agent execution contract

Every material agent run must receive:

- authenticated actor;
- organization scope;
- resource identifier;
- requested action;
- current state;
- permitted tools;
- required evidence;
- confidence threshold;
- approval threshold;
- audit context.

Every agent must return:

- decision;
- confidence;
- evidence references;
- proposed or executed changes;
- approval status;
- policy checks;
- audit-event payload;
- exception or escalation path.

## Specialist agents

- Collector Intake Agent
- Scanner and Recognition Agent
- BETH Pricing Agent
- Grading Intelligence Agent
- BreakVault Custody Agent
- Marketplace and Consignment Agent
- ACoolBREAKS Operations Agent
- QuickBooks Finance Agent
- IAM and Permissions Agent
- Fraud and Risk Agent
- HOWARD Help Agent
- Ruth Review Agent
- Audit and Compliance Agent

## Restricted actions

Human approval is mandatory for:

- changing a private asset to for-sale;
- publishing or delisting inventory;
- overriding price outside approved tolerance;
- moving a vaulted asset;
- releasing payouts;
- issuing refunds or accounting adjustments;
- changing break rules after publication or payment;
- changing roles or permissions;
- deleting, redacting, or replacing evidence;
- publishing claims about authenticity, grade, insurance, value, or investment outcomes;
- production deployment.

## Prohibited behavior

Never:

- invent a card identity;
- collapse similar variants into one record without proof;
- publish an unverified grade;
- treat an asking price as a completed sale;
- guarantee a grade, value, insurance outcome, liquidity, or return;
- publish a private item without owner approval;
- release fulfillment before confirmed payment;
- store cardholder data;
- expose secrets;
- delete custody or audit evidence through ordinary application flows;
- describe a prepared integration as live;
- leave production-path TODOs that bypass safety or authorization.

When evidence is insufficient, return `manual_review` rather than guessing.

## Pricing and sale protocol

Every approved sale record requires:

- exact identity and variation;
- ownership rights;
- front and back images;
- condition or grade evidence;
- certification lookup where applicable;
- source-separated market evidence;
- target list price;
- expected sale price;
- minimum approved price;
- fee and net-proceeds scenario;
- seller instructions;
- shipping and return rules;
- Ruth Review;
- owner approval.

Expected net proceeds must explicitly show each assumption:

```text
expected sale price
- marketplace fee
- payment percentage fee
- fixed fee
- shipping
- insurance
- return / chargeback reserve
- consignor payout, if applicable
= estimated net proceeds
```

## QuickBooks and payments

ACoolCOLLECTOR is authoritative for asset identity, images, custody, listings, and fulfillment.

QuickBooks is authoritative for customers, invoices, payments, deposits, fees, tax, accounts receivable, accounts payable, and financial reporting.

For card-present payment:

1. Create the ACool order.
2. Create or update the QuickBooks customer.
3. Create the QuickBooks invoice.
4. Take payment in QuickBooks Mobile or GoPayment with the reader or Tap to Pay.
5. Reconcile the paid invoice.
6. Release fulfillment exactly once.
7. Create BreakVault fulfillment evidence.

Do not collect or store full card numbers, CVV, track data, EMV cryptograms, PIN data, or raw reader payloads.

## Coding standards

- Prefer small, typed, testable modules.
- Validate all external payloads.
- Use integer cents for money.
- Use timezone-aware UTC timestamps.
- Use idempotency keys for writes and external synchronization.
- Make retry behavior bounded and observable.
- Use explicit error types.
- Preserve provider payloads for audit while protecting sensitive fields.
- Enforce organization boundaries in the database, not only the UI.
- Use row-level security where supported.
- Write append-only audit events for material actions.
- Include loading, empty, success, failure, retry, and manual-review states.
- Include unit, integration, permission, and regression tests.

## Security rules

- `.env.local` must not be tracked.
- Use `.env.example` for names only.
- Use GitHub Actions secrets, a cloud secret manager, or equivalent protected server secrets.
- Enforce MFA for privileged users.
- Require approval for privilege elevation.
- Protect `main` and require status checks.
- Enable secret scanning and push protection.
- Do not weaken a security check merely to make CI pass.

A committed `.env.local` and a separately shared provider credential must both be treated as compromised and rotated.

## Definition of done

A feature is complete only when:

- implementation exists;
- tests pass;
- authorization is enforced;
- audit events exist;
- loading, empty, and error states exist;
- secrets are protected;
- accessibility is reviewed;
- documentation is current;
- acceptance criteria pass;
- Ruth Review is complete when required.

## Required agent output

For each implementation task, report:

1. files changed;
2. data migrations;
3. tests run and results;
4. security implications;
5. integration status: prepared, testing, blocked, or live;
6. unresolved blockers;
7. release score backed by evidence;
8. explicit go/no-go recommendation.

Do not use a numerical score to hide missing external credentials, untested workflows, or incomplete physical evidence.