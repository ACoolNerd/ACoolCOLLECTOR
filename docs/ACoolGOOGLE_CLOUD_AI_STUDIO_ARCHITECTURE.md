# ACoolCOLLECTOR Google AI Studio and Google Cloud Architecture

> Prototype quickly in Google AI Studio. Deploy only through reviewed, least-privilege production services.

## Architecture Decision

Google AI Studio is the prompt, multimodal, structured-output, and agent-prototyping environment. Production requests run from controlled server services using the current Google Gen AI SDK or an approved Vertex AI deployment. API keys never ship in public browser bundles.

The application must distinguish:

- prototype prompt;
- evaluated prompt version;
- production model configuration;
- tool/function authorization;
- human approval requirement;
- source and evidence freshness;
- model response versus verified fact.

## Google AI and Cloud Layers

### AI and Agent Runtime

- Google AI Studio for prompt and agent prototyping;
- Gemini API Interactions API or approved GenerateContent path;
- structured outputs for card-recognition candidates, recommendations, vendor-evidence summaries, and catalog synchronization;
- function calling for ACoolCOLLECTOR APIs;
- Gemini image understanding for candidate extraction only;
- optional Vertex AI migration for enterprise identity, governance, regional controls, and centralized Cloud operations;
- evaluation datasets and versioned prompt releases before production.

### Maps and Location

Enable only the APIs required by an approved feature:

- Maps JavaScript API or native Maps SDK;
- Places API for place search, autocomplete, and place details;
- Geocoding API for coordinates and addresses;
- Address Validation API for verified venue and shipping-address components;
- Routes API for show travel and booth/venue route planning;
- Time Zone API for event times;
- Maps Static API for approved share assets;
- Places Aggregate or Insights only after cost and terms review.

Every stored Google place record must preserve the Google Place ID, fields requested, source timestamp, and permitted attribution. Do not create a shadow copy of Google Maps data beyond permitted storage and caching terms.

### User Contacts and Calendar

- People API is optional and user-consented;
- request only the minimum contact scopes needed;
- use it to export or synchronize vendor contacts selected by the user;
- never use a user's contacts to discover hidden vendor identities;
- Calendar API is optional for saving card shows, ticket-sale dates, release reminders, grading deadlines, and follow-up reminders;
- disconnect and deletion flows must revoke stored links and tokens.

### Private Media

Preferred Google Cloud path:

1. client requests a short-lived upload authorization;
2. server validates user, organization, object purpose, type, and size;
3. upload enters a private Cloud Storage bucket;
4. event-driven malware/media validation runs;
5. unsafe metadata is removed from public derivatives;
6. SHA-256 and provenance are stored;
7. OCR and Gemini analysis run asynchronously;
8. private images are served through short-lived signed URLs;
9. retention and deletion policies are enforced.

No private card, receipt, certification, custody, identity, ticket, or contact image belongs in a public bucket.

### Server and Workflow

Recommended services:

- Cloud Run for stateless API and workers;
- Secret Manager for provider credentials;
- Cloud KMS for envelope encryption and key rotation;
- Cloud Tasks for rate-limited and retryable jobs;
- Pub/Sub for asynchronous events;
- Cloud Scheduler for release, event, price, and verification refresh jobs;
- Cloud Logging, Monitoring, Error Reporting, and Trace;
- Cloud Armor and reCAPTCHA Enterprise for public abuse controls;
- BigQuery for pseudonymized analytics and experiment analysis;
- Firebase Cloud Messaging for approved notifications;
- Artifact Registry and Cloud Build for controlled deployment.

The existing Supabase PostgreSQL, Auth, RLS, and object-storage architecture can remain authoritative during migration. Google Cloud services must not silently create a second user, permissions, or accounting source of truth.

## Key Separation

Create separate credentials by platform and purpose:

### Browser Maps Key

- HTTP-referrer restrictions;
- only browser-required Maps APIs;
- quotas and budget alerts;
- never permits server or privileged APIs.

### Server Maps Key or Service Identity

- restricted to server environment;
- only Places, Routes, Geocoding, Address Validation, or Time Zone APIs actually used;
- service/IP restrictions where supported;
- never exposed to client logs or HTML.

### Gemini Key or Workload Identity

- server-side only for normal API calls;
- model and quota limits;
- separate development and production projects;
- no private-media processing without approved disclosure and data configuration.

### Google OAuth Client

- verified redirect URIs;
- separate development and production credentials;
- incremental scopes;
- consent records;
- revoke and disconnect path.

## Google Business Profile Boundary

Google Business Profile APIs are for authorized owners and managers to manage their own eligible business profiles. They are not a general vendor-discovery or reputation-scraping database. Vendor discovery must use vendor-provided links, organizer directories, permitted Places data, official social APIs, and ACoolCOLLECTOR's own evidence.

## Recommended API Enablement Matrix

| Capability | API or Service | Default |
|---|---|---|
| Show and vendor map | Maps JavaScript API / native SDK | Planned |
| Venue autocomplete | Places API | Planned |
| Venue coordinates | Geocoding API | Planned |
| Address quality | Address Validation API | Planned |
| Travel directions | Routes API | Planned |
| Correct event local time | Time Zone API | Planned |
| Save vendor contact | People API | Opt-in only |
| Save show or release | Calendar API | Opt-in only |
| Card recognition candidate | Gemini image understanding | Private beta |
| Agent orchestration | Gemini function calling | Private beta |
| Structured extraction | Gemini structured output | Private beta |
| Private images | Cloud Storage | Planned |
| Rate-limited jobs | Cloud Tasks | Planned |
| Scheduled source refresh | Cloud Scheduler | Planned |
| Event distribution | Pub/Sub | Planned |
| Secrets | Secret Manager + KMS | Required |
| Abuse defense | Cloud Armor + reCAPTCHA Enterprise | Required before public write endpoints |
| Analytics | BigQuery + GA4 | Consent-reviewed |

## Data and Compliance Requirements

- data minimization;
- least-privilege scopes;
- explicit consent for contacts and calendar;
- purpose-specific retention;
- user export and deletion;
- vendor correction and appeal;
- documented subprocessors;
- regional and age review;
- no private-message scraping;
- no protected-trait inference;
- no AI output represented as authenticity, official grade, official release date, legal advice, financial advice, or accounting truth;
- no Google, Meta, Intuit, grading-provider, event, or publisher affiliation claim without written approval.

## Production Gate

The Google layer is not production-ready until:

- development and production Cloud projects are separated;
- budgets, quotas, alerts, and kill switches exist;
- APIs are individually enabled and restricted;
- OAuth consent and privacy disclosures are approved;
- secret rotation is tested;
- private-media threat model passes;
- model evaluations pass reviewed datasets;
- function calls enforce server authorization;
- Places and Maps attribution is correct;
- contact and calendar disconnect flows pass;
- accessibility and mobile field tests pass;
- Ruth Review approves public claims;
- written go/no-go approval is recorded.
