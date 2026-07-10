# ACoolCOLLECTOR

> **Cards today. Legacy tomorrow.**
>
> **Rights → Disclosure → Proof**

ACoolCOLLECTOR is the AI-native operating system for collectors, dealers, consignors, breakers, graders, marketplaces, and collection businesses. It connects card identity, private collection management, pricing intelligence, grading scenarios, BreakVault evidence, marketplace preparation, in-person commerce, accounting, fulfillment, and governance through the ACoolOMNI orchestration layer.

This repository is not a promise that every external integration is live. It contains the production foundation, operating protocols, data pipelines, agent instructions, and controlled release gates required to build and verify the platform.

## Current implementation status

| Capability | Status |
|---|---|
| ACoolOMNI and ACoolSCHEMA foundation | Existing |
| Private 100-item collection manifest | Available at runtime; intentionally not committed |
| Private card-image ingestion | Implemented |
| SportsCardsPro current-value synchronization | Implemented; requires rotated server secret |
| One-request-per-second rate control | Implemented |
| 24-hour current-value cache model | Implemented |
| Listing-candidate generation | Implemented |
| Earnings and fee scenarios | Implemented |
| Listing, pricing, approval, and fulfillment protocol | Implemented |
| Unit tests and GitHub Actions CI | Implemented |
| Public inventory publication | Blocked until owner and Ruth Review approval |
| Current price results | Not generated in this repository without a valid private token |
| QuickBooks Advanced and POS bridge | Production foundation prepared outside this branch |

## Platform architecture

```text
ACoolCOLLECTOR
├── ACoolOMNI
│   ├── intent routing
│   ├── authorization
│   ├── specialist-agent coordination
│   ├── approval gates
│   └── append-only audit events
├── ACoolCARD
│   ├── asset identity
│   ├── collection registry
│   ├── portfolio and cost basis
│   ├── pricing scenarios
│   └── grading records
├── BETH Bridge
│   ├── current guide values
│   ├── completed-sale evidence
│   ├── active-listing evidence
│   ├── liquidity and volatility
│   └── valuation confidence
├── BreakVault
│   ├── digital twins
│   ├── ownership evidence
│   ├── custody history
│   ├── storage and movement
│   └── continuity records
├── ACoolBREAKS
│   ├── product proof
│   ├── rules and participants
│   ├── randomization evidence
│   ├── hit assignment
│   └── fulfillment reconciliation
├── Marketplace and Consignment
│   ├── listing preparation
│   ├── offers
│   ├── settlements
│   └── seller and buyer workflows
├── QuickBooks Finance
│   ├── customers
│   ├── invoices and payments
│   ├── fees and taxes
│   ├── refunds and chargebacks
│   └── accounting reports
├── HOWARD Help
│   └── onboarding, support, routing, and escalation
└── Ruth Review
    └── identity, pricing, claims, publication, and release approval
```

## Repository structure

```text
ACoolPROMPTS/
  AI and ACoolOMNI operating instructions

data/
  source and processed inventory artifacts

docs/
  architecture, governance, analysis, and operating protocols

ecosystem/
  partner and special-project assets

integrations/sportscardspro_pipeline/
  private image intake, price synchronization, listing candidates,
  earnings scenarios, tests, and the selling protocol

scripts/
  repository and orchestration utilities

src/
  existing application and prototype source

.github/workflows/
  automated validation and secret-pattern checks
```

## Private collection pipeline

The collection pipeline is private by default.

```text
Private collection manifest
        ↓
Validate unique ACool Asset and provider IDs
        ↓
Pull card images into a gitignored private directory
        ↓
Synchronize current SportsCardsPro guide values
        ↓
Preserve integer-cent values and provider timestamps
        ↓
Create private listing candidates
        ↓
Research completed sales and active asks separately
        ↓
Verify identity, ownership, condition, grade, and evidence
        ↓
Calculate target, expected, and minimum-approved prices
        ↓
Run fee and estimated-net-proceeds scenarios
        ↓
Ruth Review and owner approval
        ↓
Publish approved inventory only
        ↓
Payment, fulfillment, accounting, and BreakVault evidence
```

Private records must begin with:

```text
collection_status = private_collection
commerce_status   = not_for_sale
approved           = false
public_publish_allowed = false
```

## SportsCardsPro integration

The integration uses the provider for **current price-guide scenarios**. It does not treat provider values as completed-sale evidence.

Supported mappings:

| SportsCardsPro key | ACoolCOLLECTOR meaning |
|---|---|
| `loose-price` | Ungraded |
| `cib-price` | Grade 7 or 7.5 |
| `new-price` | Grade 8 or 8.5 |
| `graded-price` | Grade 9 |
| `box-only-price` | Grade 9.5 |
| `manual-only-price` | PSA 10 |
| `bgs-10-price` | BGS 10 |
| `condition-17-price` | CGC 10 |
| `condition-18-price` | SGC 10 |
| `sales-volume` | Estimated yearly unit volume |

Production rules:

- Requests must run server-side.
- Prices remain integer cents until display formatting.
- Calls must be spaced at least one second apart.
- Current guide values should be cached for 24 hours.
- Raw provider payloads and synchronization timestamps must be preserved.
- Completed sales, active listings, dealer offers, and provider guide values remain separate evidence classes.
- A provider match never authorizes a public listing.

## Image handling

Card images, receipts, ownership records, certification evidence, and source manifests are private evidence. They must not be committed to a public repository.

The image importer writes to:

```text
integrations/sportscardspro_pipeline/private/images/
```

The directory is gitignored. Production should eventually replace local private storage with protected object storage, signed URLs, row-level security, and evidence-retention policies.

## Listing and pricing protocol

Every sellable asset requires three price values:

1. **Target list price** — public ask.
2. **Expected sale price** — realistic transaction scenario.
3. **Minimum approved price** — lowest price allowed without escalation.

Pricing evidence must include:

- exact product identity and variation;
- language and region;
- raw or graded state;
- certification and serial information;
- completed sales;
- active supply;
- current guide values;
- liquidity and yearly unit volume;
- condition adjustments;
- marketplace and payment fees;
- shipping and insurance;
- return and chargeback reserve;
- consignor payout where applicable;
- cost basis and tax treatment where known.

A card cannot become public until all of these are true:

```text
identity_verified       = true
ownership_verified      = true
condition_verified      = true
pricing_reviewed        = true
owner_approval          = true
ruth_review_status      = approved
public_publish_allowed  = true
```

See `integrations/sportscardspro_pipeline/LISTING_AND_PRICING_PROTOCOL.md` for the complete operating standard.

## Earnings model

The pipeline calculates an estimated sale scenario:

```text
Expected sale price
- marketplace fee
- payment percentage fee
- fixed payment fee
- shipping
- insurance
- return / chargeback reserve
- consignor payout, when applicable
= estimated net proceeds
```

The defaults are configurable planning assumptions. They are not guaranteed provider fees or earnings promises.

## Agentic operating model

ACoolOMNI routes work to specialist agents including:

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

Every agent must authenticate, authorize, gather evidence, calculate confidence, request required human approval, execute idempotently, and create an audit event.

Agents must never invent an identity, claim an unsupported grade, treat an asking price as a sale, release an unpaid order, publish a private asset, expose secrets, or delete custody evidence.

## Local setup

### 1. Clone and create an environment

```bash
git clone https://github.com/ACoolNerd/ACoolCOLLECTOR.git
cd ACoolCOLLECTOR
python -m venv .venv
source .venv/bin/activate
```

### 2. Create a private environment file

```bash
cp .env.example .env.local
```

Never commit `.env.local`.

Required for price synchronization:

```text
SPORTSCARDSPRO_API_TOKEN=<rotated private token>
```

### 3. Supply the private manifest

```text
ACoolCOLLECTION_MANIFEST_PATH=/absolute/private/path/ACoolCOLLECTION_100_Item_Drive_Manifest.json
```

### 4. Run tests

```bash
python -m unittest integrations.sportscardspro_pipeline.test_pipeline
```

### 5. Pull private images

```bash
python integrations/sportscardspro_pipeline/pull_private_images.py
```

### 6. Synchronize current guide values

```bash
python integrations/sportscardspro_pipeline/sync_collection.py
```

### 7. Generate private listing and earnings candidates

```bash
python integrations/sportscardspro_pipeline/build_listing_candidates.py
```

Generated files remain in the private output directory and must be reviewed before publication.

## Environment variables

| Variable | Purpose |
|---|---|
| `SPORTSCARDSPRO_API_TOKEN` | Rotated provider token; server-side only |
| `SPORTSCARDSPRO_BASE_URL` | Provider API base URL |
| `ACoolCOLLECTION_MANIFEST_PATH` | Absolute private manifest path |
| `ACOOL_PRIVATE_OUTPUT_DIR` | Private generated-output directory |
| `ACOOL_API_DELAY_SECONDS` | Provider throttle; minimum 1.0 |
| `ACOOL_PRICE_CACHE_HOURS` | Current-value cache duration |
| `ACOOL_MARKETPLACE_FEE_RATE` | Scenario assumption |
| `ACOOL_PAYMENT_FEE_RATE` | Scenario assumption |
| `ACOOL_PAYMENT_FIXED_FEE_CENTS` | Scenario assumption |
| `ACOOL_DEFAULT_SHIPPING_CENTS` | Scenario assumption |
| `ACOOL_RETURN_RESERVE_RATE` | Scenario assumption |

## Security incident requiring action

A `.env.local` file containing an active-looking provider credential was committed previously, and another credential was shared outside the repository. Both must be considered exposed.

Required remediation:

1. Rotate or revoke both provider credentials.
2. Remove `.env.local` from tracked files.
3. Add `.env.local`, private manifests, images, receipts, exports, and generated listing files to `.gitignore`.
4. Search the full Git history and GitHub Actions logs.
5. Rewrite history if policy requires complete removal.
6. Configure GitHub secret scanning and push protection.
7. Protect `main` and require status checks before merging.
8. Store replacement secrets only in a secret manager or GitHub Actions secrets.

Do not paste replacement credentials into issues, pull requests, chat, README files, screenshots, or source code.

## Production release gates

Public launch is blocked until:

- the first verified physical asset batch is complete;
- private/public row-level security is tested;
- identity, ownership, condition, and certification workflows pass;
- SportsCardsPro synchronization runs with the rotated token;
- completed-sale research is implemented separately;
- QuickBooks invoice, payment, refund, and reconciliation tests pass;
- fulfillment and custody workflows pass;
- backup and restore are tested;
- legal, tax, payments, insurance, privacy, and break rules are reviewed;
- no critical security risk remains open;
- Ruth Review approves public claims;
- the executive owner signs a written go/no-go decision.

## Quality standard

The implementation target is 99/100 or better, but scores must be evidence-backed. Documentation does not make an integration live. A feature is complete only when implementation, tests, permissions, audit events, error handling, accessibility, documentation, and release evidence exist.

## Contributing

All contributions must follow:

- ACool naming conventions;
- private-by-default collection handling;
- organization-scoped authorization;
- server-side secret storage;
- source-separated pricing evidence;
- append-only audit history;
- human approval for restricted actions;
- `Rights → Disclosure → Proof`.

## License and external data

Repository code ownership and licensing should be documented before broad external contribution. External card data, images, marketplace data, grading information, certification records, and provider APIs remain subject to their respective licenses, subscriptions, terms, and usage restrictions.

---

Built by **ACoolNERD** for the **ACoolECOSYSTEM**.