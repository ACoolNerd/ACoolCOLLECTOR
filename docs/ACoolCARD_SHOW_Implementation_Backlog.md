# Card Show Mode Implementation Backlog

## Phase 1 — Private Capture Foundation

- apply card-show and vendor schema migrations;
- configure private object-storage bucket;
- create signed-upload endpoint;
- validate image type and size;
- add SHA-256 and normalized derivatives;
- build show-session create/list APIs;
- build transactional wishlist capture;
- build offline queue and retry model;
- add collection conversion after purchase.

## Phase 2 — Vendor Directory

- vendor search and create;
- show and booth appearance records;
- public contact methods;
- vendor QR profile;
- profile claim workflow;
- duplicate and impersonation handling;
- vendor specialties and tags;
- show-organizer import template.

## Phase 3 — Recognition and Pricing

- front/back capture flow;
- OCR and visual candidates;
- SportsCardsPro candidate search;
- user confirmation;
- BETH completed-sale research;
- asking-price comparison;
- target and maximum price controls;
- stale-evidence warnings.

## Phase 4 — Reputation

- transaction records;
- review submission and moderation;
- vendor responses;
- dispute records;
- transparent component scoring;
- evidence-confidence threshold;
- snapshot publication workflow;
- model-version audit;
- vendor appeals.

## Phase 5 — Public Business Connectors

- YouTube channel resolution through official API;
- Instagram business connector after Meta authorization;
- WhatsApp business contact link after vendor confirmation;
- Telegram public handle and bot link;
- public website verification;
- organizer directories;
- evidence freshness jobs.

## Phase 6 — Show-Floor Intelligence

- wishlist grouped by vendor;
- same-card cross-vendor comparison;
- booth route planning;
- total spend and budget remaining;
- negotiation state;
- vendor revisit reminders;
- vendor and show analytics;
- purchase conversion and receipt capture.

## Phase 7 — Pilot and Release

- run a controlled test at one card show;
- recruit five collectors and five vendors;
- verify at least 50 captures;
- measure capture time and recognition correction rate;
- validate offline behavior;
- review every moderation decision;
- conduct privacy, security and accessibility review;
- complete Ruth Review;
- record production go/no-go.

## Release Metrics

- median capture time under 20 seconds;
- 95% of captures saved without data loss;
- offline queue recovery above 99%;
- no public exposure of private images;
- vendor duplicate rate under 5% after review;
- reputation score withheld in every insufficient-evidence test;
- 100% of contact methods display source and verification status;
- 100% of restricted actions generate audit events.
