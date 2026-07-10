# ACoolCOLLECTOR Master Build Prompt

Build the complete ACoolCOLLECTOR application from the attached repository and specifications. Produce working source, migrations, tests, documentation, deployment configuration, and release evidence. Do not return only a concept.

## Audit First

Inspect the repository and identify the current frontend, API, database, migrations, CI, environment files, mock data, duplicate implementations, security issues, and external blockers. Create an evidence-based implementation plan, improve it to at least 99/100, then execute it. A plan is not proof of completion.

## Product Areas

### Public

Build home, platform overview, collectible search, approved marketplace, product detail, release radar, card-show directory, event detail, verified ticket links, vendor directory, vendor profiles, grading directory, memberships, partners, education, support, FAQ, policy, privacy, terms, and accessibility pages.

### Collector

Build authentication, MFA states, onboarding, referrals, profile, privacy, devices, connected services, private collection, scanner, Card Show Mode, wishlist by vendor and show, vendor comparison, collection goals, deck goals, savings, release reminders, event plans, bargain-bin scanner, grading advisor, BreakVault, portfolio, recommendations, and support.

### Vendor and Dealer

Build vendor claim and verification, public profile management, public contact verification, show and booth schedule, inventory intake, private listing drafts, consignment, offers, orders, payment handoff, fulfillment, review responses, appeals, reputation evidence, and approved partner reporting.

### Administration

Build organizations, users, roles, permissions, referrals, vendor claims, duplicate resolution, review moderation, disputes, incidents, agents, skills, integration health, Google configuration, QuickBooks status, affiliate registry, metadata validation, promotion approval, experiments, Ruth Review, audit logs, and release center.

## Data and IAM

Extend the existing migrations rather than creating incompatible duplicates. Use UUIDs, integer cents, currencies, timestamps with time zones, source timestamps, status constraints, unique keys, idempotency keys, and append-only evidence.

Implement Supabase Auth, organization-scoped RBAC, row-level security, record ownership, MFA for privileged actions, invite and suspension states, session views, consent records, export and deletion, and server-side permission checks. UI hiding is never authorization.

## Recognition and Private Media

Implement short-lived private uploads, media validation, private storage, asynchronous analysis, provenance, SHA-256, and field-level confidence. Support cards, slabs, price tags, Funko boxes, LEGO boxes, sealed products, comics, and games where appropriate. Gemini output is a candidate only. It cannot prove authenticity, ownership, certification, or official grade and cannot publish inventory automatically.

## Vendors and Card Shows

Collectors must be able to photograph a collectible, save it privately, attach show, venue, booth, vendor, asking price, condition claim, negotiation notes, public contacts, and follow-up status.

Vendor profiles use vendor-provided links, organizer directories, official APIs, verified ACool transactions, moderated reviews, and dispute outcomes. Do not scrape private messages, contacts, hidden phones, addresses, follower lists, or anonymous identities. Show Vendor Score and Evidence Confidence separately. Social popularity does not directly increase trust.

## Catalog, Releases, and Events

Use a reusable category, franchise, set, product, and checklist graph for One Piece, Disney Lorcana, Pokemon, sports cards, other TCGs, LEGO, Funko, comics, games, and future categories. Every record carries source, region, language, date precision, verification state, and last-checked time. Never invent an exact release date.

Build event maps, list views, venues, dates, organizers, vendors, booths, routes, ticket offers, official external checkout, attendance plans, travel budgets, show budgets, reminders, and recap. Google People and Calendar connections are opt-in and use minimum scopes.

## Goals and Recommendations

Build base-set, master-set, parallel, player, character, team, artist, and custom collection goals. Build versioned deck archetypes with formats, legality, core cards, flex cards, substitutes, owned quantities, missing quantities, budget, and source verification.

Recommendations must be explainable, budget constrained, source dated, and non-transactional until user confirmation. Return reasons, risks, alternatives, confidence, and stale-source warnings.

## Bargain Bins and Grading

Support rapid low-cost-bin capture with vendor and booth context. Calculate purchase price, raw value, grade probabilities, current service options, fees, shipping, insurance, turnaround, probability-weighted graded value, selling costs, raw alternative, liquidity, confidence, and risks. Never guarantee grade or profit.

## Promotions

Keep public entry disabled by default. Implement draft, review, approved, open, closed, draw-pending, drawn, fulfilled, and cancelled states. Require approved rules, eligibility, age, geography, dates, limits, prize custody, value, privacy, tax, alternate winner, fraud controls, and Ruth Review. Drawings must be reproducible and audited.

## Commerce, QuickBooks, and Affiliates

Use Intuit OAuth 2.0, anti-forgery state, encrypted token references, server-side refresh, idempotency, signed webhooks, sandbox tests, customer and vendor sync, invoices, payments, refunds, deposits, fees, affiliate commission income, commission payables, consignor payables, and exception queues.

ACoolCOLLECTOR owns collectible identity, custody, vendor evidence, attribution, and workflow. QuickBooks owns accounting records and reports. Do not store cardholder data, record gross third-party ticket value as ACool revenue when only a commission is earned, record consigned assets as owned inventory, release unpaid fulfillment, or claim Intuit endorsement without written approval.

Every affiliate, referral, reseller, sponsor, or technology relationship defaults to pending. A public badge requires written approval, trademark permission, agreement reference, disclosure, expiration, and owner. Implement approved destination allowlists, proximate disclosures, consent-aware attribution, provider-confirmed conversions, reversals, statements, and QuickBooks mapping.

## Google AI Studio and Cloud

Use the attached system instructions, function declarations, structured-output schemas, and evaluations. Model function calls are proposals; the server authorizes execution.

Use least-privilege Google services: Gemini, Maps, Places, Geocoding, Address Validation, Routes, Time Zone, opt-in People and Calendar, Cloud Storage, Secret Manager, KMS, Cloud Tasks, Scheduler, Pub/Sub, Logging, Monitoring, reCAPTCHA Enterprise, Cloud Armor, BigQuery, and approved notification services. Separate browser and server credentials. Do not use Business Profile APIs as a general vendor database.

## SEO and Social Metadata

Implement canonical URLs, unique title and description, robots, Open Graph, Twitter-compatible cards, XML sitemaps, public share images, breadcrumbs, and schema.org JSON-LD. Use Organization, WebSite, SoftwareApplication, Product, Offer, Event, Place, Store or LocalBusiness, Review, AggregateRating, CollectionPage, ItemList, Article, FAQPage, and BreadcrumbList only where accurate.

Do not emit Offer for private or unpublished inventory, Event ticket data with unverified destinations, AggregateRating with insufficient evidence, or unverified sameAs and affiliation claims. Structured data must match visible content.

## UI and Accessibility

Create a premium dark-first mobile, tablet, desktop, show-mode, and POS experience using ACoolCOLLECTOR branding and custom icons. Every screen needs loading, empty, success, error, denied, offline, stale-data, manual-review, and disabled-feature states. Meet WCAG 2.2 AA targets.

## Testing

Implement unit, integration, migration, rollback, RLS, organization-boundary, contract, provider-sandbox, webhook-signature, replay, idempotency, recognition-evaluation, recommendation-evaluation, vendor-score, structured-data, destination-allowlist, accessibility, offline, backup, restore, and synthetic-experiment separation tests.

## Deployment

Prepare development and production environments, controlled server deployment, Secret Manager and KMS, private and public storage, background jobs, logs, alerts, budgets, migrations, HTTPS, sitemap, Search Console, analytics consent, rollback, and incident procedures.

## Final Report

Return the file tree, files changed, migrations, feature status, preview links, test and CI output, metadata validation, security findings, privacy findings, accessibility findings, QuickBooks sandbox status, Google API status, affiliation approval status, blockers, evidence-backed readiness score, and explicit go or no-go decision.

Continue until all internally executable work is complete or a blocker is explicitly tied to a credential, contract, subscription, legal review, physical evidence, or human approval.
