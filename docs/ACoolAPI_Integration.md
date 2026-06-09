# API Integration Documentation

## SportsCardsPro API
The primary data source for card valuations is the SportsCardsPro (PriceCharting) API.

### Authentication
- **Parameter:** `t`
- **Key:** Obtained from `.env.local` (`SPORTSCARDSPRO_API_KEY`).

### Base URL
- `https://www.pricecharting.com`

### Endpoints
1. **Product Lookup:** `GET /api/product?id=[ID]&t=[TOKEN]`
   - Used for fetching the latest price for a specific card.
   - Priority: `loose-price` (for Raw/Ungraded cards).
2. **Search:** `GET /api/products?q=[QUERY]&t=[TOKEN]`
   - Returns up to 20 products matching the query.
   - Used for adding new cards to the inventory.

### Rate Limits
- 1 call per second.
- CSV download: 1 per 10 minutes.

## Data Mapping
| CSV Column | API Field | Note |
| :--- | :--- | :--- |
| `id` | `id` | Matches SportsCardsPro Product ID |
| `price-in-pennies` | `loose-price` | Current market value for Raw cards |
| `product-name` | `product-name` | Full card title |
| `console-name` | `console-name` | Set/Category info |
