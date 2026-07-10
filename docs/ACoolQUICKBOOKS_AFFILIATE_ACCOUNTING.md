# ACoolCOLLECTOR QuickBooks, Partner, and Affiliate Accounting

## Core Rule

A technical integration, tracked link, or application submission does not make ACoolCOLLECTOR an official partner, reseller, affiliate, sponsor, or endorsed product.

Display an affiliation badge or claim only after:

1. written approval or executed agreement;
2. current program status verification;
3. approved trademark and brand usage;
4. disclosure language review;
5. commission and tax treatment review;
6. expiration and revocation controls.

Until then, use factual language such as **Connects to QuickBooks Online** or **Opens the provider's official checkout**, not **Official Partner**.

## QuickBooks System Boundary

### ACoolCOLLECTOR remains authoritative for

- collectible identity;
- collection ownership;
- card-show captures;
- vendor profiles and reputation evidence;
- wishlist and collection goals;
- deck goals;
- pricing evidence;
- listing approval;
- BreakVault custody evidence;
- referral attribution detail;
- user-facing order workflow.

### QuickBooks Online remains authoritative for

- customers and vendors needed for accounting;
- invoices and sales receipts;
- payments and refunds;
- merchant deposits and fees;
- sales tax accounting;
- accounts receivable and payable;
- affiliate commission income;
- affiliate commission expense/payable;
- consignor payables;
- financial statements and close.

## OAuth and Token Controls

- Use Intuit OAuth 2.0 and the Accounting scope required by the feature.
- Keep development and production credentials separate.
- Use an anti-forgery state value and verify it on callback.
- Store only an encrypted token reference or secret-manager path in the database.
- Never render authorization codes or tokens into a page with analytics or third-party scripts.
- Refresh tokens server-side and record the result without logging credentials.
- Support explicit disconnect and reauthorization.
- Treat `realmId` as the connected QuickBooks company identifier.

## Accounting Map

The accountant must approve the final chart of accounts. Recommended working accounts include:

| Purpose | Suggested account treatment |
|---|---|
| Owned collectible sales | Product sales income |
| Cost of owned inventory | Cost of goods sold |
| Owned inventory | Inventory asset |
| Consignment commission | Consignment commission income |
| Consignor balance | Consignor payable |
| Break spots | Break/event revenue |
| Grading facilitation | Service revenue |
| Event referral commission | Affiliate and partner revenue |
| Ticket referral commission | Affiliate and partner revenue |
| Product affiliate commission | Affiliate and partner revenue |
| Commissions ACool pays | Affiliate commission expense or payable |
| Merchant fees | Merchant processing fees |
| Refund reserve | Refund/returns liability or contra-revenue as approved |
| Chargebacks | Chargeback expense/receivable as approved |

## Classes and Locations

Suggested classes:

- Direct Inventory Sales
- Consignment
- Live Breaks
- Marketplace
- Membership
- Grading Services
- Event and Ticket Referrals
- Product Affiliate Revenue
- Dealer Services
- Sponsorship and Media
- Education and Community

Suggested locations:

- Online
- Maryland Operations
- California Operations
- Convention or Pop-Up
- Partner Location
- Fulfillment Center
- General Vault

Do not expose exact vault or private-storage addresses through public reports.

## Affiliate Revenue Flow

### ACool earns a commission

1. The user sees a clearly labeled affiliate link.
2. Consent and attribution rules are applied.
3. A click or provider-confirmed conversion is recorded.
4. Provider reporting or a verified webhook confirms the commission.
5. The conversion moves from reported to verified.
6. Finance approves the accounting mapping.
7. QuickBooks receives the approved income entry, deposit, invoice, or sales receipt pattern selected by the accountant.
8. The ACool conversion stores the linked QuickBooks entity ID and sync timestamp.
9. Reversals and clawbacks create a new adjustment; they do not rewrite history.

### ACool pays an ambassador, affiliate, or partner

1. The program and rate are approved.
2. Eligible conversion and attribution are verified.
3. Fraud, refund, return, and chargeback windows close.
4. A payable statement is generated.
5. Finance approves the recipient and amount.
6. QuickBooks creates the approved vendor bill, expense, or payable workflow.
7. Payment status is reconciled back to ACoolCOLLECTOR.
8. Tax-information and reporting requirements are handled outside public profile fields.

## Prohibited Accounting Behavior

- no unverified conversion booked as earned revenue;
- no gross ticket or product price recorded as ACool revenue when ACool only earns a commission;
- no consigned item booked as ACool-owned inventory;
- no fulfillment release before payment confirmation;
- no duplicate invoice or conversion from webhook retries;
- no deletion of reversal, chargeback, refund, or payout evidence;
- no storing cardholder data in ACoolCOLLECTOR;
- no claim that QuickBooks reviewed or approved ACoolCOLLECTOR unless that is documented.

## Affiliate Disclosure

Every monetized link must have a proximate, plain-language disclosure such as:

> ACoolCOLLECTOR may earn a commission from qualifying purchases made through this clearly labeled link.

The disclosure must appear before or next to the link where practical. A global footer alone is not sufficient for a decision-driving card, event ticket, grading service, product, or vendor recommendation.

## Provider Registry

Every program record must include:

- provider and program name;
- program type;
- official program page;
- application and approval status;
- agreement reference;
- approved disclosure;
- commission model;
- start, expiration, and last verification dates;
- approved trademark treatment;
- QuickBooks income/expense account, class, and location;
- owner and reviewer.

The default status is `not_applied`, never `approved`.

## Idempotency and Reconciliation

Use a stable key for every external accounting operation:

```text
provider + external reference + operation + amount + currency
```

The system must:

- reject duplicate conversions;
- make invoice creation idempotent;
- verify webhook signatures;
- retain payload digests;
- reconcile payment amount and currency;
- create exception queues for mismatches;
- keep fulfillment on hold until paid;
- keep affiliate payout on hold until conversion and return windows are verified.

## Release Gate

QuickBooks and affiliate operations remain non-production until:

- Intuit app and OAuth credentials are configured;
- sandbox authorization passes;
- encrypted token storage is implemented;
- chart of accounts, class, and location maps are approved;
- invoices, payments, refunds, fees, and webhooks pass tests;
- affiliate or partner enrollment is verified;
- disclosures and trademark use are approved;
- tax and accounting treatment is approved;
- duplicate, reversal, and amount-mismatch tests pass;
- Ruth Review and executive approval are recorded.
