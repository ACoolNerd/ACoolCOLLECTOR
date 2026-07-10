# ACoolCOLLECTOR Native Multidevice Architecture — 2026

## Purpose

This document defines the native application architecture for ACoolCOLLECTOR across Android phones, tablets, foldables, ChromeOS, Wear OS, Android XR, Meta Quest, iPhone, iPad, macOS, Apple Watch, and visionOS.

The platform remains API-first and private by default. Native apps are clients of the authenticated ACoolOMNI API; they do not embed provider secrets, accounting credentials, payment credentials, or private collection data in source code.

## Platform strategy

| Platform | Native stack | Primary experiences |
|---|---|---|
| Android phone/tablet/foldable | Kotlin, Jetpack Compose, CameraX, Credential Manager | Scanner, collection, show mode, vendor profiles, marketplace, goals |
| Wear OS | Kotlin, Compose for Wear OS, Tiles, Complications | Show checklist, saved cards, budget, booth reminders, quick voice capture |
| Android XR | Kotlin, Jetpack XR, Compose for XR, Glimmer, SceneCore, ARCore for Jetpack XR | Spatial card wall, hands-free scanning, booth route, comparison panels |
| Meta Quest | OpenXR with Unity and Meta Interaction SDK | Immersive vault, collection review, show training, collaborative viewing |
| iPhone/iPad | Swift, SwiftUI, AVFoundation, Vision, AuthenticationServices | Scanner, portfolio, show mode, vendor intelligence, ticket and goal planning |
| macOS | SwiftUI, AppKit bridges where required | Dealer operations, bulk intake, reconciliation, analytics, admin |
| Apple Watch | SwiftUI, WatchKit, App Intents | Show checklist, alerts, budget, saved-card quick actions |
| visionOS | SwiftUI, RealityKit | Spatial collection, slab inspection, event planning, collaborative review |

## Shared boundaries

The clients share API contracts and JSON schemas, not UI code. Each platform uses its native navigation, camera, accessibility, secure storage, background execution, and design language.

All clients must:

1. Authenticate with short-lived user tokens.
2. Store refresh credentials only in Keychain or Android Keystore-backed storage.
3. Upload images through signed URLs.
4. Treat AI recognition as a candidate until user confirmation.
5. Keep collection values, routes, budgets, receipts, and vendor notes private by default.
6. Require explicit consent for camera, microphone, contacts, calendar, location, notifications, and AI processing.
7. Record audit events for publishing, money movement, vendor moderation, raffle draws, grading submissions, and account changes.
8. Fail closed when authorization, confidence, source freshness, or policy evidence is insufficient.

## Profile standard

The profile system supports:

- public identity: username, avatar, bio, favorite categories, public badges;
- collector identity: sports, games, players, characters, teams, franchises, sets, eras, artists, card types;
- goals: set completion, master set, deck completion, player run, character run, grail, grading, show attendance;
- professional mode: collector, dealer, vendor, breaker, consignor, shop, grader-submission center, event organizer;
- accessibility: text scale, reduced motion, high contrast, color-vision support, screen-reader labels, haptics, speech speed;
- privacy: per-field visibility, collection visibility, value visibility, event attendance visibility, vendor-note privacy;
- communication: email, push, SMS opt-in, release alerts, show alerts, price alerts, grading alerts;
- device links: Android, Wear OS, XR, iPhone, iPad, Mac, Apple Watch, visionOS;
- trust: verified email, verified phone, MFA, passkey enrollment, business verification, review history;
- commerce: preferred currency, tax region, shipping region, payment-method labels only, no raw card data;
- social: user-submitted public profile links with verification and removal controls.

The canonical machine-readable contract is `schemas/acool-profile.schema.json`.

## Google I/O 2026 adoption map

Only features confirmed by current official documentation are included.

### Production-track

- adaptive Compose layouts for phones, tablets, foldables, ChromeOS, and XR-compatible panels;
- Firebase AI Logic for approved cloud/hybrid Gemini use with App Check and server-enforced authorization;
- ML Kit and on-device inference for OCR, barcode, speech, and privacy-preserving candidate extraction;
- Compose for Wear OS;
- Android XR compatibility mode for existing adaptive Android screens;
- Google Play Integrity, Credential Manager, passkeys, and secure deep links;
- Android accessibility semantics to make workflows automation-ready without exposing restricted actions.

### Feature-flagged preview track

- AppFunctions and Android MCP integrations;
- Android Computer Control compatibility;
- AICore Developer Preview;
- Gemini Nano and Gemma on-device agentic workflows;
- new ML Kit GenAI audio and prefix-caching capabilities;
- Android XR Developer Preview 4 APIs;
- Compose Glimmer for display glasses;
- ARCore semantic segmentation and anchors in XR.

Preview features must never gate core collection, payment, custody, publishing, or compliance workflows. They require kill switches, telemetry separation, privacy review, and fallback behavior.

## Native feature modules

### Identity and access

- passkeys and MFA;
- organization and role selection;
- trusted-device management;
- session revocation;
- account export and deletion.

### Scanner

- front, back, slab label, certification, serial, price tag, and booth marker capture;
- glare and perspective guidance;
- offline encrypted queue;
- candidate identity, confidence, and evidence;
- duplicate detection;
- user confirmation before asset creation.

### Card Show Mode

- event plan, route, hall, booth, vendor, budget, and saved-card list;
- fast $1–$5 bin mode;
- watch or glasses alerts;
- vendor-linked captures;
- asking-price comparison;
- purchase confirmation and receipt attachment.

### Collection and deck intelligence

- set and checklist completion;
- deck legality and missing-copy analysis;
- budget-aware acquisition order;
- grading expected-value scenarios;
- source freshness and confidence display;
- explanation-first recommendations.

### Vendor intelligence

- claimed and verified profiles;
- public business links;
- show history;
- verified transactions, reviews, responses, disputes, and evidence confidence;
- no private-message or hidden-contact scraping;
- no popularity-only trust score.

### Spatial experiences

- collection wall by franchise, player, character, set, grade, or value band;
- 3D slab inspection using user-provided scans;
- side-by-side grade and price evidence panels;
- voice and gaze navigation;
- shared review room with owner-controlled permissions;
- no implication that a rendered slab proves authenticity.

## Meta Quest boundary

Meta Quest support uses OpenXR and Meta's supported interaction stack. The Quest application receives only short-lived ACool tokens and signed media URLs. It must not contain SportsCardsPro, Intuit, Stripe, Supabase service-role, or Google server credentials.

The first Quest release is read-mostly: collection viewing, wishlist, event preparation, education, and collaborative review. Publishing, payment, refund, custody release, and raffle administration remain on authenticated mobile or desktop clients with step-up verification.

## Apple platform boundary

The Apple client is a SwiftUI multiplatform project with separate entitlements and targets for iOS, iPadOS, macOS, watchOS, and visionOS. Shared models and services live in Swift packages; platform UI and permissions remain native.

The macOS app is the preferred workstation for bulk intake, dealer operations, accounting review, metadata correction, export, and Ruth Review.

## Quality gates

A platform cannot be labeled production-ready until it has:

- native build success;
- unit, UI, accessibility, and security tests;
- offline and low-connectivity tests;
- camera and permission-denial tests;
- account deletion and data export tests;
- signed-image URL expiry tests;
- Play Integrity or App Attest strategy;
- store privacy disclosures;
- crash reporting and performance monitoring;
- rollback and remote feature flags;
- Ruth Review and written release approval.

## References

- Google I/O 2026: https://io.google/2026/
- Android AI: https://developer.android.com/ai
- Android XR: https://developer.android.com/develop/xr
- Compose for Wear OS: https://developer.android.com/training/wearables/compose
- Firebase AI Logic: https://firebase.google.com/docs/ai-logic
- SwiftUI: https://developer.apple.com/documentation/swiftui
- visionOS: https://developer.apple.com/documentation/visionos
- Meta Interaction SDK: https://developers.meta.com/horizon/documentation/unity/unity-isdk-getting-started/
