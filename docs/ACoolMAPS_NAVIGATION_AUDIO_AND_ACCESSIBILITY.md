# ACoolCOLLECTOR Maps, Navigation, Audio, and Accessibility Architecture

## Purpose

This document defines the location, route, Street View, spoken guidance, music, accessibility, and privacy architecture for ACoolCOLLECTOR.

The objective is to help collectors find card shows, stores, booths, grading locations, transit options, parking, hotels, restaurants, and verified vendors without turning precise location history into a public or advertising profile.

## Google Maps Platform capability map

### Server-side planning

- Places API (New): verified place identity, address, phone, website, hours, photos, and Google Maps URI using allowlisted fields.
- Routes API: route planning, route matrices, distance, duration, traffic-aware estimates, toll context, and accessible route previews.
- Address Validation API: shipping, event, vendor, and storefront address normalization.
- Geocoding and Geolocation APIs: consented address and approximate-location workflows.
- Time Zone API: event and release reminders across time zones.
- Roads API: snap-to-road and route-quality workflows where approved.
- Route Optimization API: multi-stop show itineraries and vendor-route planning.
- Street View Static API: server-signed, non-interactive venue previews.
- Street View Publish API: disabled unless ACoolCOLLECTOR later owns or is authorized to publish 360-degree imagery.

### Native mobile clients

- Navigation SDK for Android and Navigation SDK for iOS provide in-app turn-by-turn navigation.
- The Navigation SDK replaces the Maps SDK inside a client that uses the full navigation experience; both must not be bundled together in the same target.
- Android Auto and CarPlay support remain separate release gates.
- Native platform location permissions, background-location rules, and app-store disclosures apply.

### Web and public discovery

- Maps JavaScript API or Web Components for public maps.
- Maps Embed API for simple public venue maps.
- Maps Static API for server-signed social and event cards.
- Street View Static API for venue and storefront previews.
- Map Tiles and Aerial View only when justified by product value and cost.

## Voice directions and TalkBack

Live turn-by-turn instructions must come from the native Navigation SDK, not an LLM. AI may summarize a route before departure, but it may not invent turns, road closures, safety conditions, or arrival instructions.

Android requirements:

- every interactive map control receives Compose semantics;
- TalkBack announces destination, route status, distance, next maneuver, and actionable controls;
- map-only information has an equivalent ordered list;
- voice guidance ducks music through Android audio-focus APIs;
- alerts never rely only on color, vibration, or spatial placement;
- spoken route previews can use Google Cloud Text-to-Speech, while live navigation remains the Navigation SDK's responsibility.

Apple requirements:

- VoiceOver labels and custom actions;
- Dynamic Type and Reduce Motion;
- spoken route summaries without replacing system navigation safety behavior;
- CarPlay support only after entitlement and safety review.

## Street View controls

- Street View availability is checked through metadata before requesting imagery.
- Static requests are generated or proxied by the server.
- Browser and mobile clients never receive the server signing secret.
- Requests use digital signatures, referrer or application restrictions, quotas, and billing alerts.
- Imagery is contextual evidence only; it does not prove a current vendor location or event status.
- User-contributed imagery is not republished without rights and consent.

## Privacy model

Location is private by default.

The platform stores only the minimum required precision:

- coarse region for discovery;
- event venue for attendance planning;
- optional active-navigation position held transiently;
- booth notes private to the collector;
- no public live location;
- no hidden background tracking;
- no sale of route, venue, or attendance history;
- deletion and export support;
- separate consent for location, background location, contacts, calendar, microphone, and AI processing.

## API key and quota strategy

Use separate credentials for:

1. Android application restrictions by package name and signing certificate;
2. iOS restrictions by bundle identifier;
3. browser restrictions by HTTPS origin;
4. server restrictions by service account, workload identity, or restricted server key;
5. static-image URL signing.

Every key receives an API allowlist. Quotas and budgets are configured per product. A single unrestricted key is prohibited.

## Audio and music companion

ACoolCOLLECTOR may provide:

- ACool-owned or properly licensed ambient audio;
- user-owned local audio where platform rules permit;
- licensed streaming-provider playback after provider approval;
- external deep links to a user's chosen service;
- event playlists, creator playlists, and collection soundscapes with rights evidence;
- spoken collection stories and accessible descriptions;
- navigation and safety prompts that temporarily duck or pause music.

The platform may not host, copy, rebroadcast, or monetize copyrighted music without the necessary rights. Provider branding and playback rules remain provider-controlled.

Android playback uses Jetpack Media3, MediaSession, media controls, and audio focus. Apple playback uses AVFoundation for owned audio and MusicKit only after Apple authorization and entitlement requirements are satisfied.

## Maps and audio acceptance gates

- relevant APIs enabled and inventoried;
- restricted keys created without exposing values;
- route and place acceptance tests;
- Street View metadata and signed-image tests;
- navigation permission-denial tests;
- TalkBack and VoiceOver audits;
- audio-focus and interruption tests;
- background-location review;
- quota and budget alerts;
- location deletion/export verification;
- no secret values in logs, source, screenshots, or mobile bundles;
- written Conditional-Go or Go decision.
