# ACoolCOLLECTOR Social Marketplace, Maps, Audio, and Trust Expansion Prompt

Build the next production increment of ACoolCOLLECTOR using the repository as the source of truth.

## Non-negotiable rule

Rights → Disclosure → Proof.

Do not fabricate ownership, authenticity, grade, affiliation, event participation, location status, legal approval, music rights, or payment completion.

## Build targets

### Maps and navigation

- Places discovery for shows, stores, graders, parking, hotels, transit, and verified vendors.
- Routes and route matrices for show itineraries.
- Native Navigation SDK integration specifications for Android and iOS.
- Street View metadata and server-signed static previews.
- ordered text alternatives for every visual route.
- TalkBack and VoiceOver labels, actions, headings, and announcements.
- explicit location, background-location, microphone, contacts, and calendar consent.
- separate restricted credentials for Android, iOS, browser, server, and static signing.
- quota, budget, anomaly, and deletion controls.

### Central marketplace and member storefronts

- ACoolMARKET global discovery.
- member-created storefronts with draft, review, published, limited, suspended, and closed states.
- listings subordinate to platform moderation and fraud controls.
- seller identity, business verification, fulfillment, dispute, and evidence-confidence views.
- public profile and storefront metadata without exposing private addresses, receipts, certification details, values, or routes.

### Showcases

- private-by-default galleries.
- set, master-set, deck, player, character, team, artist, grading, and event-find showcases.
- optional public stories, images, videos, and rights-cleared audio.
- separate showcase and listing actions so display never silently becomes an offer for sale.

### Giveaways and collaborations

- giveaways, sweepstakes, skill contests, charitable raffles, collaborative drops, and community art projects.
- disabled-by-default public entry.
- official rules, legal approval, jurisdiction, age, prize, tax, privacy, fulfillment, anti-fraud, and Ruth Review gates.
- contributor roles, rights evidence, approvals, edition size, revenue share, and provenance.
- prohibit purchase-required entries by default.

### Fraud and counterfeit prevention

- ownership attestations and evidence.
- possession challenges using server-generated nonce values.
- SHA-256 and perceptual image fingerprints.
- duplicate and stolen-image detection.
- grader-certification verification state.
- price-deviation, device-risk, dispute, chargeback, and off-platform payment signals.
- explainable risk decisions.
- human review and appeal for high-impact actions.
- transaction holds and no payout or custody release before settlement.
- AI results labeled as candidates, never official authentication.

### Audio and music

- Android Media3 and audio focus.
- Apple AVFoundation and MusicKit only after provider authorization.
- ACool-owned, user-owned, licensed-provider, and external-deep-link source modes.
- rights verification and provider approval before in-app playback.
- music ducks or pauses for navigation and safety alerts.
- generated speech clearly disclosed.

## Required repository context

- `docs/ACoolMAPS_NAVIGATION_AUDIO_AND_ACCESSIBILITY.md`
- `docs/ACoolSOCIAL_MARKETPLACE_SHOWCASE_AND_TRUST.md`
- `supabase/migrations/20260710_social_marketplaces_showcases_trust.sql`
- `src/omni-engine/src/services/ACoolAPI_CommunityMarketplace.ts`
- `src/omni-engine/src/services/ACoolMarketplaceTrust.ts`
- `src/omni-engine/src/services/ACoolGoogleMaps.ts`
- `src/omni-engine/src/services/ACoolAPI_Google.ts`
- `apps/android-native/src/main/kotlin/com/acoolcollector/nativeapp/media/ACoolAudioCompanion.kt`
- `apps/apple-native/Sources/ACoolProfile/ACoolAudioCompanion.swift`

## Required outputs

1. Architecture delta.
2. Threat model.
3. Data-flow and consent matrix.
4. Android implementation plan.
5. Apple implementation plan.
6. Web implementation plan.
7. API and schema changes.
8. Unit, integration, accessibility, fraud, and adversarial tests.
9. Quota and billing controls.
10. Store-policy and legal-review checklist.
11. Rollback and remote feature flags.
12. Evidence package and written Go/No-Go recommendation.

Do not deploy directly from AI Studio. Export to a review branch, run CI, inspect the Terraform plan, complete provider approvals, and preserve all mandatory No-Go controls.
