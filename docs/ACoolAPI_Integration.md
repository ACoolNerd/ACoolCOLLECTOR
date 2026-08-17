# API Integration Documentation

## SportsCardsPro / PriceCharting Prices API

SportsCardsPro is a current price-guide and demand input for ACoolCOLLECTOR. It is not, by itself, the final completed-sale evidence source for premium transactions.

### Authentication

- Premium API access requires a qualifying paid subscription.
- Authentication uses the `t` request parameter.
- Store the real token only in local/runtime secrets such as `SPORTSCARDSPRO_API_KEY`.
- `.env.local` is ignored and must never be committed.

### Base URL

`https://www.pricecharting.com`

SportsCardsPro documentation and examples also reference the SportsCardsPro domain, but the documented base URL is PriceCharting.

### Current-price endpoints

1. `GET /api/product?t=[TOKEN]&id=[SPORTSCARDSPRO_ID]`
   - Current data for one mapped product.
   - `loose-price` = ungraded/raw guide value for cards.
   - Other graded fields must be mapped to the exact grading service/grade.
2. `GET /api/products?t=[TOKEN]&q=[QUERY]`
   - Returns up to the first 20 matching products.
   - Use for mapping only when a validated SportsCardsPro product ID is unavailable.

### Bulk data

SportsCardsPro provides downloadable price-list CSVs to eligible subscribers. Their documentation says these CSVs are generated once every 24 hours. Prefer bulk set downloads for large refreshes when available rather than issuing unnecessary one-product requests.

### Important limitation

The Prices API and downloadable price CSVs provide **current item values**, not historical sale records. Premium ACoolCOLLECTOR pricing should therefore pair exact-version/condition proof with completed-sale evidence from sources such as eBay, 130point, and TCGplayer where applicable.

### Price / demand fields

Common card fields include:

- `id`
- `product-name`
- `console-name`
- `loose-price` — ungraded
- `graded-price` — graded 9 guide field
- `manual-only-price` — PSA 10 guide field for cards
- `bgs-10-price` — BGS 10 guide field
- `sales-volume` — yearly units sold
- retailer buy/sell guide fields where included

Prices are integer pennies in the API response. Persist both the raw penny field and normalized USD.

## ACoolCOLLECTOR mapping

| Inventory field | SportsCardsPro field | Control |
|---|---|---|
| `id` | `id` | Require match verification if source is not a known SportsCardsPro export |
| `product-name` | `product-name` | Exact parallel/version matters |
| `console-name` | `console-name` | Used with product name for mapping review |
| `price-in-pennies` | `loose-price` | Current guide input for raw cards, not completed-sale proof |
| grading data | graded guide fields | Never infer service/grade when absent |

## Rights / redistribution gate

SportsCardsPro terms state that its price data may be used for internal business purposes under an active qualifying subscription, while third-party-accessible redistribution requires permission. ACoolCOLLECTOR therefore defaults SportsCardsPro price data to internal decision support unless external-display rights are separately cleared.

Official documentation:
- https://www.sportscardspro.com/api-documentation
- https://www.sportscardspro.com/page/terms-of-service
