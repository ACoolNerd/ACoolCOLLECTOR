# ACoolCOLLECTOR XR Native Applications

## Scope

This folder defines the spatial applications for Android XR, intelligent eyewear, Meta Quest, and future OpenXR-compatible devices.

The XR clients are not standalone systems of record. They consume the authenticated ACoolOMNI API and use signed, expiring media URLs. Restricted actions remain on mobile or desktop clients with step-up authentication.

## Android XR track

Use:

- Kotlin;
- Jetpack Compose and adaptive layouts;
- Jetpack Compose for XR;
- Jetpack Compose Glimmer for display glasses;
- Jetpack SceneCore for spatial entities and environments;
- ARCore for Jetpack XR for anchors and semantic understanding;
- Android Credential Manager and passkeys;
- Android Keystore-backed secure token storage.

Initial Android XR experiences:

1. Spatial collection wall grouped by franchise, player, character, set, grade, or value band.
2. Hands-free show wishlist review.
3. Side-by-side card, price evidence, grading scenario, and vendor evidence panels.
4. Booth-route and saved-card reminders.
5. Voice-driven collection search.
6. Accessibility narration and captions.
7. Display-glasses glance cards for booth, budget, target price, and wishlist status.

Because the current Android XR SDK is a Developer Preview, XR-specific APIs must remain behind remote feature flags and must not gate the core Android application.

## Meta Quest track

Use:

- Unity LTS;
- OpenXR;
- Meta Interaction SDK;
- Meta-supported hand, controller, gaze, and passthrough interactions;
- ACool short-lived access token exchange;
- signed media URLs;
- server-side authorization for every private asset request.

Initial Meta Quest experiences:

1. BreakVault immersive gallery.
2. Collaborative collection review room.
3. Card-show preparation and route rehearsal.
4. Educational grading and condition-comparison training.
5. Dealer presentation mode using owner-approved public or shared records.

The Quest app must not perform:

- payment capture;
- refunds;
- custody release;
- public listing approval;
- raffle administration;
- QuickBooks authorization;
- raw secret storage;
- silent social or contact discovery.

## Spatial data model

Every visible object must reference:

- `assetId`;
- `displayTitle`;
- `mediaVariant`;
- `mediaSignedUrl`;
- `mediaExpiresAt`;
- `identityConfidence`;
- `verificationStatus`;
- `privacyScope`;
- `ownerPermission`;
- `sourceTimestamp`;
- `priceEvidenceStatus`;
- `gradeEvidenceStatus`.

Rendered cards and slabs are visualizations only. They do not prove authenticity, ownership, grade, certification, or custody.

## Security requirements

- no provider secret in application bundles;
- no long-lived cloud credential;
- TLS certificate validation;
- device attestation strategy;
- token revocation and remote logout;
- screenshot and recording disclosure for shared rooms;
- private-room access controls;
- moderation and abuse reporting;
- remote kill switch for preview APIs;
- auditable access to high-value private assets.

## Acceptance

A spatial client cannot be promoted beyond private beta until:

- the non-XR mobile app passes production gates;
- device testing covers motion comfort, accessibility, thermal behavior, and battery impact;
- private images cannot be retrieved after signed-link expiry;
- shared-room permissions are tested;
- preview SDK dependencies are inventoried;
- store and platform policy review is complete;
- Ruth Review records a written release decision.
