# ACoolCOLLECTOR Listing, Pricing, and Earnings Protocol

## Universal rule

**Rights → Disclosure → Proof**

No collectible may become public or sellable merely because an image, provider match, or guide value exists.

## Stage 1 — Private intake

Required:

- immutable ACool Asset ID;
- private source image reference;
- SportsCardsPro product ID or documented manual-match process;
- owner and beneficial-owner confirmation;
- acquisition date and cost basis where available;
- front and back images;
- slab label, certification and serial images when applicable.

Default state:

- `collection_status = private_collection`
- `commerce_status = not_for_sale`
- `approved = false`

## Stage 2 — Provider synchronization

- Call the provider no faster than once per second.
- Cache current guide values for 24 hours.
- Store integer cents and synchronization time.
- Preserve the raw provider response privately.
- Treat provider values as current guide scenarios only.
- Do not label provider values as completed sales.

## Stage 3 — Identity and condition review

An operator verifies:

- exact card, set and card number;
- base, parallel, promo, error or serialized variation;
- language and region;
- raw or graded condition;
- grading company, grade and certification;
- visible defects and disclosure notes;
- image-to-record match.

A provider match does not establish the physical card's condition or grade.

## Stage 4 — Market evidence

BETH Bridge keeps three evidence classes separate:

1. current guide values;
2. completed sales;
3. active listings or asks.

Every observation requires source, date, currency, condition, grade, fees and confidence.

## Stage 5 — Price recommendation

Create at least three scenarios:

- target list price;
- expected sale price;
- minimum approved price.

Adjust for:

- exact condition and grade;
- liquidity and annual sales volume;
- completed-sale recency;
- marketplace fees;
- payment fees;
- shipping and insurance;
- returns and chargeback reserve;
- consignment commission where applicable;
- tax and accounting treatment.

The automated list-price suggestion in this integration is a planning scenario, not a final approved price.

## Stage 6 — Earnings model

For each item calculate:

`estimated net proceeds = sale price - marketplace fee - payment fee - shipping - insurance - reserve - consignor payout - other approved costs`

Portfolio earnings scenarios must show:

- gross guide value;
- proposed gross listing value;
- expected sale value;
- estimated fees;
- estimated net proceeds;
- cost basis;
- estimated gross profit;
- estimated taxable gain where accounting data supports it;
- items missing data.

Never present a scenario as guaranteed earnings.

## Stage 7 — Ruth Review

Required approvals:

- identity verified;
- ownership verified;
- condition and grade language approved;
- price evidence reviewed;
- disclosures complete;
- seller agreement or owner instruction recorded;
- shipping and return method approved;
- tax and finance mapping assigned.

## Stage 8 — Publication

Only after approval:

- change `commerce_status` to `for_sale`;
- set `approved = true`;
- create a public image derivative that excludes private evidence;
- create the listing with source timestamp and disclosures;
- write an append-only audit event.

## Stage 9 — Sale and fulfillment

- Create the ACool order.
- Create or link the QuickBooks invoice.
- Confirm payment before release.
- Record marketplace and payment fees.
- Preserve packaging and tracking evidence.
- Close the listing once.
- Update custody and ownership records.
- Reconcile net proceeds and cost basis.

## Prohibited actions

- committing the API token;
- committing private Drive images or evidence to a public repository;
- listing an item from the provider match alone;
- describing an asking price as a sale;
- claiming an unverified grade;
- publishing guaranteed appreciation, grading, insurance or investment returns;
- releasing an item before payment reconciliation;
- deleting custody or audit evidence.
