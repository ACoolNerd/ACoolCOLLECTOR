# ACoolCOLLECTOR Private Collection Market Pipeline

This module imports the private ACoolCOLLECTOR pilot manifest, retrieves private card images into an ignored local directory, synchronizes current SportsCardsPro guide values, creates private listing candidates, and calculates estimated net-proceeds scenarios.

It is designed to prepare decisions—not to publish inventory automatically.

## Security boundary

- Never commit a SportsCardsPro token.
- Never commit the private collection manifest.
- Never commit card images, receipts, ownership evidence, generated pricing files, or listing candidates.
- Use only a rotated `SPORTSCARDSPRO_API_TOKEN` stored in `.env.local`, GitHub Actions secrets, or a deployment secret manager.
- Treat every previously committed or shared credential as compromised.

## Files

| File | Purpose |
|---|---|
| `sync_collection.py` | Validate the manifest and synchronize current provider guide values |
| `pull_private_images.py` | Download private source images into the ignored evidence directory |
| `build_listing_candidates.py` | Build private listing and earnings candidates |
| `test_pipeline.py` | Unit tests for money, status, pricing, and publication controls |
| `LISTING_AND_PRICING_PROTOCOL.md` | Complete operating and approval protocol |
| `.env.example` | Safe environment-variable template |
| `.gitignore` | Module-level private-output exclusions |

## Inputs

The pipeline expects a private JSON manifest containing an `items` list. Each item should provide, when available:

```json
{
  "acool_asset_id": "AC-...",
  "provider": "SportsCardsPro",
  "provider_product_id": "617074",
  "source_file_name": "...product_617074.jpg",
  "drive_view_url": "https://...",
  "collection_status": "private_collection",
  "commerce_status": "not_for_sale",
  "pricing_status": "pending_secure_api_sync"
}
```

The manifest remains outside the public repository.

## Environment

From the repository root:

```bash
cp .env.example .env.local
```

Required:

```text
SPORTSCARDSPRO_API_TOKEN=<rotated secret>
ACoolCOLLECTION_MANIFEST_PATH=/absolute/private/path/ACoolCOLLECTION_100_Item_Drive_Manifest.json
```

Optional configuration:

```text
SPORTSCARDSPRO_BASE_URL=https://www.sportscardspro.com
ACOOL_PRIVATE_OUTPUT_DIR=integrations/sportscardspro_pipeline/private
ACOOL_API_DELAY_SECONDS=1.1
ACOOL_PRICE_CACHE_HOURS=24
ACOOL_MARKETPLACE_FEE_RATE=0.13
ACOOL_PAYMENT_FEE_RATE=0.029
ACOOL_PAYMENT_FIXED_FEE_CENTS=30
ACOOL_DEFAULT_SHIPPING_CENTS=500
ACOOL_DEFAULT_INSURANCE_CENTS=0
ACOOL_RETURN_RESERVE_RATE=0.05
```

Fee values are planning assumptions, not guarantees or provider quotes.

## Run order

### 1. Test

```bash
python -m unittest integrations.sportscardspro_pipeline.test_pipeline
```

### 2. Pull images privately

```bash
python integrations/sportscardspro_pipeline/pull_private_images.py
```

Expected directory:

```text
integrations/sportscardspro_pipeline/private/images/
```

### 3. Synchronize current guide values

```bash
python integrations/sportscardspro_pipeline/sync_collection.py
```

The synchronizer:

- validates unique provider IDs;
- waits at least one second between API calls;
- stores integer-cent values;
- preserves source timestamps and raw provider payloads;
- keeps every asset private and not for sale;
- records errors instead of inventing missing values.

### 4. Build listing and earnings candidates

```bash
python integrations/sportscardspro_pipeline/build_listing_candidates.py
```

Expected private outputs:

```text
listing_candidates.json
listing_candidates.csv
earnings_scenario.json
```

## Price mappings

| Provider key | Scenario |
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

SportsCardsPro values are current guide values. Completed sales, active asks, dealer quotes, and auction evidence must be gathered and stored separately through BETH Bridge.

## Publication gate

Generated candidates remain private until all required controls pass:

```text
identity_verified
ownership_verified
condition_verified
pricing_reviewed
owner_approval
ruth_review_status == approved
public_publish_allowed
```

The pipeline does not create public marketplace listings by itself.

## Earnings scenario

```text
expected sale price
- marketplace fee
- payment percentage fee
- fixed payment fee
- shipping
- insurance
- return / chargeback reserve
- consignor payout, when applicable
= estimated net proceeds
```

Every assumption must remain visible in the output.

## Production migration

Local private files are suitable only for controlled development. Production should use:

- PostgreSQL with organization-scoped row-level security;
- protected object storage with signed URLs;
- a queue for rate-limited provider synchronization;
- encrypted server-side secrets;
- immutable audit events;
- approval workflows;
- reconciliation and alerting.

See the root README, `docs/ACoolARCHITECTURE_Production.md`, and `LISTING_AND_PRICING_PROTOCOL.md`.