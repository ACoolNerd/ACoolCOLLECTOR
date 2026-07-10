# ACoolCOLLECTOR Card Show Mode and Vendor Intelligence

> **Photograph the opportunity. Know the vendor. Decide with evidence.**

## Objective

Card Show Mode gives collectors a fast, private workflow for capturing cards they are considering at a show, associating every card with the vendor and booth where it was seen, and returning later to compare price, condition, reputation, contact options, and follow-up status.

The Vendor Intelligence layer creates full business profiles using public business information, vendor-provided information, verified ACoolCOLLECTOR transactions, moderated user reviews, dispute outcomes, and transparent evidence scoring.

It must never become a private-person surveillance or doxxing system.

## Collector Experience

### Start a Show Session

The collector creates a session with:

- show name;
- date;
- venue;
- budget;
- collecting goals;
- target games, sports, players, characters, sets, grades, and price bands;
- offline capture preference.

### Capture a Card

The collector opens the camera and captures:

1. card front;
2. card back;
3. slab label or certification, when present;
4. price tag;
5. optional vendor table or booth marker.

The app creates a private wishlist item immediately, even when the network is unavailable.

### Recognition Result

The recognition service may propose:

- sport or game;
- player or character;
- manufacturer;
- year;
- set;
- card number;
- parallel or variation;
- language;
- raw or graded status;
- grading company;
- grade;
- certification number;
- serial numbering;
- likely provider product IDs;
- confidence score.

Every recognition result is a candidate until the collector or authorized reviewer confirms it.

### Associate the Vendor

The collector can:

- select an existing vendor;
- search by business name or public handle;
- scan an ACool vendor QR code;
- create an unclaimed vendor profile;
- enter booth number and hall;
- save asking price and negotiation notes;
- record accepted payment method labels;
- save public contact links supplied by the vendor.

### Compare and Follow Up

The collector can group the wishlist by:

- vendor;
- show;
- booth;
- player or character;
- set;
- card type;
- asking price;
- target-price variance;
- interest level;
- reputation score;
- evidence confidence;
- follow-up status.

Useful actions include:

- compare the same card across vendors;
- calculate total spend by booth;
- mark a card as held, sold, passed, purchased, or still available;
- open vendor website or public messaging link;
- create a negotiation checklist;
- build a route through the show floor;
- convert a purchased card into collection intake.

## Vendor Profile

A vendor profile can contain:

### Identity

- display name;
- legal business name when voluntarily supplied and appropriate;
- business type;
- logo;
- description;
- city and region;
- verification level;
- claim status;
- show appearances and booth history.

### Public Contact Methods

- website;
- public business email;
- public business phone;
- WhatsApp business link supplied by the vendor;
- Telegram public handle or bot link supplied by the vendor;
- Instagram business profile;
- YouTube channel;
- Facebook, X, TikTok, Discord, and other approved business links;
- payment-link label and URL, when voluntarily supplied and reviewed.

Never store card numbers, bank-account credentials, payment passwords, private message history, private phonebook data, personal home addresses, or hidden contact information.

### Social and Business Evidence

Social evidence is limited to information available through:

- official platform APIs;
- vendor exports;
- organizer directories;
- vendor-submitted public links;
- manual verification of public business pages.

Popularity does not equal trust. Follower counts, views, likes, and subscribers do not directly increase the ACool Vendor Score.

### Reviews

Reviews can include:

- overall rating;
- communication;
- item-description accuracy;
- pricing fairness;
- fulfillment;
- written experience;
- verified-transaction status;
- incentive disclosure;
- relationship disclosure.

Reviews begin in moderation. Positive and negative reviews use the same policy. Vendors may respond, claim their profile, supply evidence, and appeal a moderation or dispute outcome.

## ACool Vendor Score

The profile displays two separate numbers:

1. **ACool Vendor Score** — performance score from eligible evidence.
2. **Evidence Confidence** — how much verified evidence supports the score.

A profile with insufficient evidence shows **Not Yet Rated** instead of a misleading number.

### Component Weights

| Component | Weight |
|---|---:|
| Verified transaction reliability | 25% |
| Published review quality | 20% |
| Identity and business verification | 15% |
| Fulfillment reliability | 15% |
| Communication | 15% |
| Cross-platform account consistency | 10% |

The implementation ignores raw social popularity when calculating the score.

### Confidence Inputs

Confidence increases with:

- verified transactions;
- reviews linked to verified transactions;
- verified business identity;
- multiple consistent public business accounts;
- recent, source-attributed evidence.

### Score Status

- **Insufficient evidence** — no public score.
- **Provisional** — score shown with a prominent limited-evidence label.
- **Established** — evidence threshold met.
- **Under review** — dispute, integrity, or moderation process is active.

Every score snapshot stores:

- model version;
- calculation time;
- component scores;
- evidence counts;
- explanation;
- reviewer;
- publication status.

## Tag System

### Card Tags

- sport;
- game;
- player;
- character;
- team;
- manufacturer;
- year;
- set;
- subset;
- card number;
- parallel;
- rookie;
- autograph;
- memorabilia;
- promo;
- error;
- serial numbered;
- language;
- raw;
- slabbed;
- grading company;
- grade;
- certification;
- condition concern;
- price band;
- target price;
- grail;
- priority;
- grading candidate;
- trade candidate.

### Vendor Tags

- card shop;
- independent dealer;
- breaker;
- consignor;
- auction house;
- submission center;
- show promoter;
- sports specialties;
- TCG specialties;
- high-end;
- value inventory;
- vintage;
- modern;
- sealed product;
- trade friendly;
- cash accepted;
- digital payment accepted;
- shipping available;
- local pickup;
- claimed profile;
- verified business;
- dispute under review.

### Show Tags

- show name;
- organizer;
- city;
- venue;
- hall;
- booth;
- date;
- day;
- route order;
- revisit;
- negotiation pending.

## Data Architecture

Primary entities:

- `card_shows`
- `card_show_sessions`
- `vendors`
- `vendor_memberships`
- `vendor_show_appearances`
- `vendor_contacts`
- `vendor_social_accounts`
- `vendor_social_snapshots`
- `vendor_transactions`
- `vendor_reviews`
- `vendor_disputes`
- `vendor_claims`
- `vendor_reputation_snapshots`
- `wishlist_items`
- `wishlist_item_images`
- `vendor_card_sightings`
- `card_recognition_candidates`

The transactional `create_card_show_capture` RPC creates the wishlist item, private image reference, vendor sighting, and recognition candidates as one database operation.

## API Surface

Base path: `/api/v1/card-show`

- `POST /sessions`
- `GET /sessions`
- `POST /vendors`
- `GET /vendors/search?q=`
- `GET /vendors/:vendorId`
- `POST /wishlist/captures`
- `GET /wishlist`
- `POST /vendors/:vendorId/reviews`
- `POST /vendors/:vendorId/reputation/recalculate`

All routes require authentication. Reputation recalculation requires `vendor.reputation.review`.

## Image Infrastructure

Production capture uses private object storage:

1. Request a short-lived signed upload.
2. Validate MIME type and file size.
3. Scan for malware and malformed media.
4. Calculate SHA-256.
5. Strip unsafe metadata while preserving approved capture metadata separately.
6. Store the original and normalized derivative privately.
7. Create the wishlist capture by object path.
8. Run OCR and visual recognition asynchronously.
9. Require user confirmation before verified identity.

Do not send private card-show images to an AI provider without an approved data-processing configuration and user disclosure.

## Vendor Discovery Connectors

### YouTube

Use the official YouTube Data API to resolve a channel by handle or channel ID and retrieve permitted channel metadata. Store source IDs, timestamps, and the fields actually returned.

### Instagram and WhatsApp

Use only official Meta APIs, vendor authorization, vendor-submitted public links, or manual verification of public business pages. Do not scrape private accounts, follower lists, contacts, direct messages, or non-public phone information.

### Telegram

Use public usernames, vendor-supplied links, or an authorized bot interaction. A Telegram bot cannot be used as a general-purpose mechanism to discover private user information.

### Websites and Payment Links

Store only vendor-supplied or verified public business URLs. Payment links are contact conveniences, not evidence that the vendor is financially verified or endorsed.

## Review Integrity and Fairness

- Never create or purchase fake reviews.
- Never require positive sentiment for an incentive.
- Disclose any review incentive.
- Do not suppress truthful negative reviews.
- Apply the same moderation policy to positive and negative content.
- Clearly separate user statements, verified transaction facts, platform findings, and unresolved allegations.
- Offer vendor response, claim, correction, and appeal paths.
- Expire or recheck stale social and contact evidence.

## Privacy and Safety

The system must not:

- identify private individuals behind anonymous accounts;
- infer protected traits;
- publish private phone numbers or addresses;
- scrape private groups or messages;
- aggregate rumors into a factual accusation;
- label a vendor fraudulent without an adjudicated and supportable basis;
- expose collector routes, budgets, images, or wishlists publicly by default.

## Competitive Edge

The defensible advantage is not merely scanning a card. It is the evidence graph connecting:

```text
Collector intent
    + card identity candidate
    + show and booth context
    + vendor profile
    + asking price
    + market evidence
    + reputation components
    + contact pathway
    + follow-up and purchase outcome
```

That graph produces better decisions, stronger follow-up, safer commerce, and a growing vendor-and-show intelligence network while preserving privacy and procedural fairness.

## Release Gates

- authenticated private capture works offline and online;
- signed image storage passes security review;
- card recognition never auto-verifies identity;
- vendor contact sources and verification are displayed;
- reputation scoring tests pass;
- insufficient evidence suppresses the overall score;
- review moderation is viewpoint-neutral;
- vendor claim and appeal workflows exist;
- privacy and defamation review is complete;
- no private messaging data is scraped;
- accessibility and field testing at a real card show pass;
- Ruth Review approves public language and score presentation.
