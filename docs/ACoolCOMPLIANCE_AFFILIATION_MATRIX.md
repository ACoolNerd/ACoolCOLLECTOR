# ACoolCOLLECTOR Compliance and Affiliation Matrix

This matrix governs public claims, data access, integrations, monetized links, and provider branding.

| Area | Allowed | Requires approval | Prohibited |
|---|---|---|---|
| QuickBooks | Factual integration language after tested connection | Official app-store badge, partner or endorsed claim, production accounting launch | Claiming Intuit approval without evidence; plaintext tokens; cardholder-data storage |
| Google AI | Candidate extraction, structured outputs, reviewed function calling | Production private-media processing, Vertex AI migration, new model release | Presenting AI output as authenticity, grade, legal, tax, or accounting truth |
| Google Maps | Places, venue maps, routes, time zones with restricted credentials and attribution | New API enablement, location analytics, persistent data use beyond baseline | Unrestricted keys; copying Maps data into an unlicensed shadow database |
| Google People | User-selected vendor contact export or sync | OAuth consent, minimum scopes, retention and deletion review | Reading contacts without consent; discovering hidden vendor identity |
| Google Calendar | User-selected show and release reminders | OAuth consent and minimum scopes | Silent calendar writes or reading unrelated events |
| Google Business Profile | Authorized owner-management workflows | Business owner authorization and product eligibility | General vendor discovery or competitor-profile scraping |
| Meta / Instagram / Facebook | Open Graph tags; authorized public business account data | Meta app review and approved permissions | Private-message, contact-list, hidden phone, private-account, or follower-list scraping |
| WhatsApp | Vendor-supplied public business link or approved Business Platform integration | Provider onboarding, approved templates, consent | Reading private chats or harvesting phone numbers |
| Telegram | Vendor public username, vendor link, or authorized bot interaction | Bot setup and user interaction | General private-user discovery or private-group scraping |
| YouTube | Official API channel lookup and permitted public metrics | API key restriction and quota review | Scraping private analytics or using popularity as trust |
| SportsCardsPro | Current guide values with server token and rate limit | Paid subscription, token rotation, terms review | Treating guide values as historical sales or exposing token |
| Grading providers | Timestamped public fees and certification links | Trademark use, referral program, service submission integration | Calling AI estimate an official grade or guaranteed result |
| Event ticketing | Verified official external ticket link and user plan | Embedded checkout, partner API, confirmation webhooks, refunds | Requesting provider password or claiming ticket issuance without confirmation |
| Affiliate links | Clearly labeled approved links with proximate disclosure | Written program approval, trademark use, accounting map | Hidden affiliate redirects, false partner badge, unverified conversions |
| Vendor ratings | Evidence-backed score plus evidence confidence | Public score release, moderation, vendor appeal | Social popularity as trust; publishing unsupported fraud accusations |
| Promotions | Draft architecture, reviewed rules, reproducible drawing | Qualified legal review, eligibility, prize, tax, jurisdiction, Ruth Review | Opening entry before approval or manipulating results |
| Structured data | Visible-content-matching schema.org JSON-LD | New rating, offer, event, or organization claim | Hidden claims, fake ratings, stale availability, private inventory offers |
| Analytics / A-B tests | Pseudonymous approved events and synthetic labels | Privacy review, consent, experiment plan | Secrets, payment data, private notes, contacts, or misleading synthetic results |

## Public Claim Statuses

Use these exact internal statuses:

- `not_applied`
- `application_draft`
- `applied`
- `pending_review`
- `approved`
- `rejected`
- `suspended`
- `expired`
- `revoked`

Only `approved` with a current agreement and approved brand usage may produce an affiliation badge.

## Required Evidence for Affiliation

- provider name;
- program name;
- agreement or approval reference;
- approval date;
- expiration or review date;
- approved trademarks and badge files;
- public wording;
- disclosure language;
- commission model;
- owner;
- accounting map;
- current verification date.

## Universal Disclosure Rule

Material connections must be disclosed clearly and near the recommendation, link, rating, testimonial, event ticket, product, grading service, or provider action that could influence the user.

## Claims Review

Ruth Review is required before publishing:

- official partner or affiliate language;
- provider endorsement language;
- grading outcome claims;
- authenticity claims;
- insurance claims;
- guaranteed savings, earnings, or appreciation;
- vendor misconduct conclusions;
- promotion eligibility and winner language;
- structured ratings and aggregate-review markup;
- financial or tax claims.

## Data Source Labels

Every public factual field must expose or internally retain:

- source type;
- source URL or provider ID;
- source timestamp;
- verification method;
- region and language where relevant;
- date precision;
- confidence;
- reviewer;
- expiration or refresh schedule.

## Release Decision

A connected API, generated code file, or approved CI build is not sufficient by itself. Production approval also requires credentials, provider authorization, environment configuration, external sandbox tests, monitoring, disclosures, support process, and a written go/no-go decision.
