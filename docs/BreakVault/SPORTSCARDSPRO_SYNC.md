# SportsCardsPro Sync Plan

## Role in ACoolCOLLECTOR
SportsCardsPro is an internal current price-guide and demand input. It is not the only completed-sale authority for premium transaction decisions.

## Secret handling
Use an environment secret such as `SPORTSCARDSPRO_TOKEN`. Never commit a subscription token, API URL containing the token, or downloaded licensed data to a public repository.

## Mapping flow
1. If the inventory record contains a confirmed SportsCardsPro product ID, map directly.
2. Otherwise search using product name + set/console name.
3. Store candidate match confidence and require human review for ambiguous parallels/variants.
4. Refresh price-guide data no more often than the subscription/data cadence requires.

## Suggested fields
- `mapping_status`
- `scp_id`
- `last_refreshed_at`
- `loose_price`
- `graded_price`
- `psa10_price`
- `bgs10_price`
- `sales_volume`
- `confidence`
- `review_reason`

## Premium card workflow
Exact identity → front/back/condition evidence → SportsCardsPro current guide → independent completed-sale evidence where applicable → BETH confidence → Ruth Review → final public ask.

## Data rights gate
Treat downloaded/API price data as licensed internal business data unless external display/redistribution permission is confirmed under the current SportsCardsPro terms. Do not expose raw subscription datasets through a public API or client-side bundle.