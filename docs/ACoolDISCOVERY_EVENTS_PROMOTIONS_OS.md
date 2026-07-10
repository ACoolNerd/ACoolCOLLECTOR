# ACoolCOLLECTOR Discovery, Events, Promotions, and Recommendation OS

> **Know what is coming. Plan what to buy. Complete the collection. Build the deck. Attend the show. Preserve the evidence.**

## Scope

This system expands ACoolCOLLECTOR beyond individual card pricing into a reusable operating layer for:

- release calendars and checklists;
- One Piece, Disney Lorcana, sports cards, Pokémon and additional TCGs;
- LEGO, Funko, comics, video games, figures and other collectibles;
- event discovery and official ticket links;
- event plans and savings goals;
- collection completion;
- deck completion and meta-deck acquisition planning;
- bargain-bin scanning;
- grading expected-value scenarios;
- compliance-first promotions;
- deterministic A/B testing;
- full user profiles, privacy and notifications.

## Product Modules

### Release Radar

Release Radar stores publisher, source, franchise, set, product, release date, MSRP, region, language, rotation date and last verification time.

Every current fact requires:

- official or licensed source;
- source URL;
- region;
- timestamp;
- precision such as exact date, month or quarter;
- current verification state.

A release without current evidence must show **Needs Verification**, not an invented date.

### Set and Checklist Graph

A catalog set can contain checklist items with:

- item or card number;
- name;
- rarity;
- language;
- parallel or variant;
- external provider IDs;
- rule, character, player, artist and product attributes.

The same goal infrastructure supports base sets, master sets, player runs, character collections, artist collections, parallel runs and custom goals.

### Deck Builder and Meta Acquisition

Deck archetypes and versions preserve source and effective date. The recommendation engine compares required copies against owned copies and ranks missing cards using:

- deck importance;
- missing quantity;
- price and price confidence;
- substitution flexibility;
- budget fit;
- format and rotation context.

Community lists, tournament-verified lists and publisher-recommended lists remain visibly distinct.

### Event Explorer

Event Explorer provides:

- event and venue data;
- official organizer URL;
- official ticket-provider URL;
- show dates and hours;
- ticket availability status;
- saved attendance plan;
- travel, ticket and show budgets;
- show-floor Card Show Mode;
- vendor, booth and wishlist correlation.

Initial ticketing uses official external checkout. ACoolCOLLECTOR does not silently purchase tickets or store a third-party ticketing password.

### Savings Goals

Collectors can create manual savings goals for:

- tickets;
- travel;
- show spending;
- release products;
- grading submissions;
- collection completion;
- deck completion.

The system calculates remaining amount and suggested weekly and monthly contributions. It does not move money without a separately approved financial connection and explicit user action.

### Bargain Bin Mode

Dollar-bin and one-to-five-dollar-bin mode records:

- vendor and show;
- bin label and maximum item price;
- front and back image references;
- identity candidate;
- purchase price;
- raw-value scenario;
- condition observations;
- grading scenarios;
- buy raw, grade candidate, manual review or pass recommendation.

A cheap purchase price alone never makes a card a grading candidate.

### Grading Advisor

The grading model compares:

- purchase price;
- grading fee;
- shipping and insurance;
- sale fee assumption;
- raw resale scenario;
- probability-weighted grade outcomes;
- identity and condition confidence.

Outputs are expected-value scenarios, not grading-company results. Current service fees must show the official source and last verified timestamp.

### Promotions and Raffles

The code supports promotion records for giveaways, sweepstakes, skill contests and jurisdiction-specific charitable raffles.

**Public entry is disabled by default.**

Before opening a promotion, the system requires:

- written official rules;
- legal approval reference;
- eligible jurisdictions;
- excluded jurisdictions;
- age requirement;
- start and close times;
- prize and approximate retail value;
- entry limits;
- no-purchase method where required;
- privacy notice;
- tax and fulfillment plan;
- fraud, duplicate and employee/household rules;
- Ruth Review.

Purchase-required entries are blocked by the application policy. Charitable raffles remain blocked until a qualified operator and jurisdiction-specific approval are documented.

Draws use a commit-reveal process:

1. Create a cryptographically random private seed.
2. Publish its SHA-256 commitment before entries close.
3. Freeze and export the eligible-entry set.
4. Reveal the seed after closing.
5. Verify the commitment.
6. Select the winner deterministically from the sorted entry IDs.
7. Store the algorithm version, digest, entry count, approver and result.

### Experimentation

A/B tests require:

- documented hypothesis;
- privacy review;
- stable deterministic assignment;
- exposure event;
- primary metric;
- guardrail metrics;
- start and stop rules;
- minimum sample plan;
- no synthetic traffic represented as user behavior.

Experiment metadata rejects obvious personal, authentication and payment fields.

## Verified Seed Data

The repository includes:

- `data/verified_sources/collectacon_2026.json` — thirteen official 2026 Collect-A-Con tour stops and official ticket-provider links;
- `data/verified_sources/one_piece_upcoming_2026.json` — official One Piece products visible at the recorded verification time.

These are seeds, not permanent truth. Scheduled source checks must update them.

Disney Lorcana is registered as a franchise and official source, but no future set should be marked verified until the official source can be retrieved and timestamped.

## Data Architecture

Core entities include:

- `catalog_sources`
- `collectible_categories`
- `franchises`
- `catalog_sets`
- `catalog_products`
- `set_checklist_items`
- `event_ticket_offers`
- `user_event_plans`
- `savings_goals`
- `savings_contributions`
- `collection_goals`
- `collection_goal_items`
- `deck_archetypes`
- `deck_versions`
- `deck_cards`
- `user_deck_goals`
- `bargain_bin_sessions`
- `bargain_bin_items`
- `grading_providers`
- `grading_service_levels`
- `recommendation_runs`
- `recommendation_items`
- `promotion_campaigns`
- `promotion_prizes`
- `promotion_entries`
- `promotion_draws`
- `experiments`
- `experiment_variants`
- `experiment_assignments`
- `experiment_events`

## API

Base path: `/api/v1/discovery`

- `GET /profile`
- `PATCH /profile`
- `GET /catalog/categories`
- `GET /catalog/sets`
- `GET /catalog/products`
- `GET /events`
- `POST /events/:eventId/plan`
- `GET /savings-goals`
- `POST /savings-goals`
- `POST /recommendations/collection`
- `POST /recommendations/deck`
- `POST /recommendations/bargain-grading`
- `GET /grading/services`
- `GET /promotions`
- `POST /promotions/:promotionId/enter`
- `POST /promotions/:promotionId/draw`
- `POST /experiments/:experimentKey/exposure`

All routes currently require authentication. Restricted actions require server-enforced permission checks.

## Mobile UI and UX

### Main Navigation

- Home
- Scan
- Collection
- Decks
- Releases
- Events
- Wishlist
- Recommendations
- Profile

### Home

- upcoming releases;
- nearby and saved events;
- savings progress;
- set and deck progress;
- price and grading review queue;
- recommendation cards with explanation and confidence.

### Release Detail

- verified release date and source;
- product types and MSRP;
- checklist progress;
- collection goal action;
- release savings goal;
- alert preferences;
- update history.

### Event Detail

- organizer and venue;
- verified date;
- official ticket button;
- ticket, travel and show budget;
- savings plan;
- attending vendors;
- show-floor session;
- wishlist and route plan.

### Collection Goal

- owned, missing and upgrading counts;
- completion percentage;
- remaining estimated cost;
- recommended next acquisitions;
- budget and price ceilings;
- substitutions and condition preferences.

### Deck Goal

- deck source and version;
- owned copies and missing copies;
- rotation warning;
- core cards versus flex cards;
- recommended purchase order;
- low-cost substitute view;
- total remaining cost.

### Bargain Bin Scanner

- rapid multi-capture;
- offline queue;
- price entered once per bin or per item;
- condition checklist;
- candidate identity;
- raw and grade expected value;
- red-flag and pass reasons.

### Promotion Detail

- official rules;
- eligibility and jurisdiction;
- prize and approximate value;
- entry method;
- close time;
- entry count for the current user;
- winner and audit record after drawing.

## Security and Compliance

- private user goals and budgets use RLS;
- no bank credential or card credential storage;
- official ticket links are allowlisted and source-attributed;
- promotion entry is fail-closed;
- no public raffle before legal approval;
- no AI-generated grading result represented as official;
- no unverifiable release date presented as confirmed;
- no recommendation is a guaranteed return;
- experiments exclude sensitive metadata;
- all restricted actions require audit events and human approval.

## Production Release Gates

- migrations applied in an isolated Supabase environment;
- SQL lint and rollback test complete;
- authentication and RLS tests pass;
- catalog source jobs are idempotent;
- dates and ticket links show last verification time;
- official ticket redirects are allowlisted;
- recommendation evaluation set approved;
- bargain-bin false-positive review complete;
- grading scenarios verified against current official fees;
- promotion counsel approval and official rules complete;
- experiment privacy review complete;
- accessibility testing complete;
- Ruth Review and executive go/no-go complete.
