# ACoolCOLLECTOR Native Multidevice Expansion Prompt

You are extending the existing ACoolCOLLECTOR production repository. Do not create a disconnected demo.

## Mission

Produce native, accessible, secure application foundations for:

- Android phones, tablets, foldables, and ChromeOS;
- Wear OS;
- Android XR headsets, wired XR glasses, audio glasses, and display glasses;
- Meta Quest through OpenXR and Meta Interaction SDK;
- iPhone and iPad;
- macOS;
- Apple Watch;
- visionOS.

Use the existing ACoolOMNI API, IAM, vendor, event, collection, recommendation, pricing, grading, promotion, QuickBooks, and audit contracts.

## Mandatory context

Read before generating code:

- `docs/ACoolNATIVE_MULTIDEVICE_2026.md`
- `docs/ACool90_LIVE_ACTIVATION_SCORECARD.md`
- `schemas/acool-profile.schema.json`
- `docs/ACoolARCHITECTURE_Production.md`
- `docs/ACoolCARD_SHOW_MODE_VENDOR_INTELLIGENCE.md`
- `docs/ACoolDISCOVERY_EVENTS_RECOMMENDATIONS.md`
- `docs/ACoolSECURITY_Secret_Remediation.md`
- `GEMINI.md`

## Native implementation requirements

### Android

- Kotlin and Jetpack Compose;
- adaptive layouts for compact, medium, and expanded windows;
- CameraX capture flows;
- Credential Manager and passkeys;
- Android Keystore-backed secure storage;
- WorkManager for approved background synchronization;
- Compose accessibility semantics;
- Play Integrity strategy;
- AppFunctions preparation behind a disabled feature flag;
- Firebase AI Logic only through approved, authenticated flows;
- candidate-only AI recognition;
- no secrets in application resources or build outputs.

### Wear OS

- Compose for Wear OS;
- show checklist, saved-card reminders, budget glance, booth reminder, and quick voice capture;
- Tiles and Complications only for non-sensitive summary data;
- no collection value on lock-screen surfaces unless explicitly opted in.

### Android XR

- compatible 2D adaptive panel first;
- Compose for XR and SceneCore only behind feature flags;
- Glimmer for display-glasses glance surfaces;
- ARCore anchors and semantic features treated as preview;
- voice, gaze, controller, and hand interaction alternatives;
- motion-comfort and accessibility settings;
- no payment, refund, custody release, or public-publish administration in preview clients.

### Meta Quest

- Unity LTS, OpenXR, and Meta Interaction SDK;
- short-lived ACool token exchange;
- signed media URLs;
- read-mostly immersive vault and collaborative review;
- no raw provider or accounting secret;
- server-side authorization for every private asset.

### Apple

- Swift and SwiftUI;
- separate iOS, iPadOS, macOS, watchOS, and visionOS targets;
- shared Swift packages for models and API services;
- AuthenticationServices and passkeys;
- Keychain secure storage;
- AVFoundation and Vision for camera and recognition support;
- App Attest or DeviceCheck strategy;
- platform-native navigation and permissions;
- Dynamic Type, VoiceOver, Reduce Motion, high contrast, captions, and keyboard support.

## Profile experience

Implement the canonical schema in `schemas/acool-profile.schema.json` with:

- public identity;
- collector and professional roles;
- interests and goals;
- trust and verification;
- device links;
- privacy per field;
- accessibility preferences;
- notification preferences;
- public social links with verification state;
- account export and deletion;
- no raw payment data;
- no hidden contact discovery.

## Google I/O 2026 feature policy

Adopt only capabilities confirmed by current official documentation.

Production-track:

- adaptive Compose;
- Firebase AI Logic with App Check;
- ML Kit production APIs;
- Compose for Wear OS;
- Play Integrity;
- Credential Manager;
- Android XR compatibility mode.

Feature-flagged preview:

- AppFunctions;
- Android Computer Control;
- AICore Developer Preview;
- Gemini Nano and Gemma local agentic flows;
- new ML Kit GenAI audio and prefix caching;
- Android XR Developer Preview APIs;
- Compose Glimmer;
- preview ARCore for Jetpack XR capabilities.

Every preview capability requires:

- a remote kill switch;
- fallback behavior;
- separate telemetry;
- privacy review;
- no dependency for core or regulated workflows.

## Security rules

Never:

- embed provider tokens;
- expose service-role keys;
- store raw cardholder data;
- auto-publish an AI match;
- infer private vendor contacts;
- claim an official partnership without evidence;
- expose collection value by default;
- allow XR or wearable clients to perform restricted finance or custody actions without step-up verification.

## Deliverables

Generate in reviewable increments:

1. platform folder structure;
2. shared API contract client generation plan;
3. Android native shell and profile flow;
4. Wear OS companion;
5. Apple multiplatform shell and profile flow;
6. Android XR compatibility shell;
7. Meta Quest OpenXR shell;
8. authentication and secure storage adapters;
9. scanner and signed-upload adapters;
10. offline queue and conflict handling;
11. accessibility test matrix;
12. unit and UI tests;
13. CI workflows for Android and Apple;
14. store privacy manifests;
15. production-readiness evidence.

Do not report a platform as complete until its native build, tests, permissions, secure storage, device testing, store disclosures, rollback, and Ruth Review all pass.
