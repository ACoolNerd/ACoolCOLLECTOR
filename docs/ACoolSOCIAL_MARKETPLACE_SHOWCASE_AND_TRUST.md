# ACoolCOLLECTOR Social Marketplace, Showcase, Collaboration, and Trust System

## Product model

ACoolCOLLECTOR supports four distinct public experiences:

1. **ACoolMARKET** — the centralized, moderated marketplace.
2. **Collector Storefront** — a member-owned shop page operating inside ACoolMARKET rules.
3. **Collector Showcase** — a non-sale gallery for displaying owned collectibles, goals, stories, and completed sets.
4. **Community Campaign** — a controlled giveaway, sweepstakes, skill contest, charitable raffle, or collaborative collectible project.

A public profile, showcase, storefront, listing, or campaign is never proof of authenticity, ownership, affiliation, or value by itself.

## Centralized marketplace

ACoolMARKET provides:

- global search and category navigation;
- collectible, set, franchise, player, character, grading, price, and location filters;
- verified and unverified seller disclosures;
- ownership and identity evidence status;
- condition and grading disclosures;
- price-source confidence and freshness;
- transaction holds and dispute workflows;
- prohibited-item and counterfeit controls;
- centralized moderation, appeals, and audit history.

## Personal storefronts

Each eligible member may create a storefront with:

- unique slug and display name;
- avatar, banner, biography, specialty tags, and shipping regions;
- verified public business links;
- published listings;
- showcase collections;
- event appearances;
- review, dispute, and fulfillment history;
- disclosure of whether the member is a collector, dealer, shop, consignor, or content creator.

Storefronts remain subordinate to platform policy. Sellers cannot disable required disclosures, fraud controls, moderation, refund rules, or evidence checks.

## Collector showcases

A showcase is not automatically a listing. It may contain:

- owned cards and collectibles;
- complete sets and master sets;
- decks;
- player, character, team, artist, and franchise runs;
- grading journeys;
- event finds;
- stories, videos, and audio;
- public or connection-only visibility;
- optional estimated value ranges with source and timestamp.

Private collection images, certification numbers, serial numbers, receipts, values, and locations remain hidden unless the owner explicitly publishes an approved public representation.

## Giveaways and drawings

Community campaigns default to disabled. Before public entry, the campaign must have:

- verified sponsor or operator;
- verified item ownership or custody;
- prize description and approximate retail value;
- official rules;
- eligible and excluded jurisdictions;
- age requirements;
- opening and closing times;
- entry limits;
- no-purchase pathway where required;
- privacy disclosure;
- tax, shipping, and fulfillment process;
- fraud and duplicate-entry controls;
- legal approval reference;
- Ruth Review approval.

Purchase-required entries are blocked by platform policy unless qualified counsel documents a lawful exception and the platform's policy is deliberately changed.

## Collaborative collectibles and art

Members may collaborate on original drawings, card art, custom collectibles, educational projects, and community drops. Publication requires:

- named contributors and roles;
- rights and license declarations;
- source-file provenance;
- approval from each rights holder;
- revenue-share terms where applicable;
- edition size and numbering rules;
- production and fulfillment owner;
- disclosure when an item is unofficial, fan-made, or not affiliated with an intellectual-property owner;
- no use of protected characters, logos, likenesses, or trademarks without permission or a documented lawful basis.

## Ownership and provenance verification

Evidence may include:

- purchase receipt with sensitive data redacted;
- authenticated marketplace receipt;
- grading certification lookup;
- event or vendor receipt;
- custody record;
- timestamped possession challenge using a server-generated nonce;
- front, back, edge, slab, label, serial, and security-feature images;
- prior provenance transfer;
- consignor agreement;
- manufacturer or authorized-artist record.

Evidence is scored by type, freshness, source, and integrity. User attestation alone never becomes third-party verification.

## Counterfeit and fraud prevention

### Listing risk signals

- impossible or inconsistent set, card-number, parallel, grade, or certification data;
- duplicate image or perceptual-hash reuse across unrelated listings;
- certification mismatch or reuse;
- EXIF, crop, or image-manipulation anomalies;
- materially below-market price without explanation;
- repeated chargebacks, non-delivery, disputes, or counterfeit reports;
- new account with high-value volume;
- off-platform payment pressure;
- conflicting seller, device, payment, shipping, and location signals;
- stolen-image reports;
- prohibited claims such as guaranteed grade or guaranteed investment return.

### Decision states

- `allow_with_disclosure`
- `manual_review_required`
- `hold_transaction`
- `block_listing`
- `suspend_seller_review`

Risk engines create recommendations, not irreversible final judgments. High-impact decisions require authorized human review, an evidence record, notice, and appeal rights.

### Fake-card controls

- AI and OCR produce candidates only;
- certification checks are provider-specific and timestamped;
- image fingerprints are compared against prior submissions;
- known counterfeit-pattern libraries are versioned;
- high-value items may require in-person, grader, or trusted-partner review;
- listings display exactly which checks passed, failed, were unavailable, or remain pending;
- no ACool badge may imply official grader or manufacturer authentication unless that provider supplied the evidence and approved the wording.

## Payment and transaction safety

- no raw card data stored by ACoolCOLLECTOR;
- payment-provider tokens only;
- server-verified webhooks;
- amount and currency reconciliation;
- seller and buyer identity controls proportionate to risk;
- delayed payout or hold for high-risk transactions;
- shipment tracking and delivery evidence;
- dispute and refund workflow;
- no custody release before confirmed settlement;
- transaction and accounting idempotency;
- suspicious activity escalation and retention controls.

## Privacy and safety defaults

- showcases private by default;
- storefronts draft by default;
- listings private-review by default;
- campaigns disabled by default;
- precise home address never public;
- seller return addresses and tax information restricted;
- private messages excluded from reputation scoring except when voluntarily submitted as dispute evidence;
- minors cannot operate storefronts or campaigns without approved guardian and legal controls;
- block, mute, report, appeal, and safety escalation available throughout the product.
