# ACoolCOLLECTOR Gemini Prototype Reconciliation

## Purpose

This document reconciles the locally reported Gemini application work with the code that is actually present in `ACoolNerd/ACoolCOLLECTOR`.

A transcript, screenshot, local preview, generated walkthrough, or agent completion message is **prototype evidence**. It is not production evidence unless the corresponding source code, migrations, tests, security controls, and deployment records are present in the repository and validated by CI.

## Reported Local Prototype Features

The supplied Gemini transcript reports prototypes for:

- QuickBooks Advanced ledger views;
- a simulated card-reader checkout terminal;
- multi-step onboarding;
- Ambassador, Affiliate, and Partner codes;
- role and permission screens;
- session-expiry warnings;
- role-distribution charts;
- audit-log CSV export;
- QR self-onboarding;
- SportsCardsPro search and valuation;
- image recognition and OCR;
- card-profile tools;
- grading recommendations;
- trade-hold or escrow concepts;
- Apple Pay, Google Pay, and Stripe simulations;
- set archives, shops, vendors, and experiments.

The transcript also describes simulated or synthetic behaviors, including mock MFA, mock token refresh, simulated reader authorization, randomized fallback valuations, synthetic A/B traffic, and compliance toggles.

## Verified Repository State Before Reconciliation

The checked-in server contained:

- a hard-coded demonstration login and scaffold token;
- an always-valid validation endpoint;
- an in-memory marketplace with invented listings;
- a partial SportsCardsPro client returning only the ungraded field;
- a ten-minute in-memory price cache;
- no global request scheduler for the provider limit;
- no database-backed Ambassador, Affiliate, or Partner redemption;
- no production authorization middleware.

The named React files from the transcript were not found in the checked repository at the time of reconciliation:

- `src/components/OnboardingFlow.tsx`
- `src/components/IAMConsole.tsx`
- `src/components/ReferralManager.tsx`
- `src/components/AuditLog.tsx`
- `src/components/RoleDistributionDashboard.tsx`
- `src/components/SportsCardsValuation.tsx`
- `src/components/PremiumCardVault.tsx`
- `src/App.tsx`
- `server.ts`

These files may exist in a separate local Gemini workspace, export, or unpushed branch. They must be recovered before their UI work can be reviewed or merged.

## Production Replacements Added in Pull Request #2

This branch now adds or replaces the following production foundations:

- Supabase Auth-backed signup, login, refresh, logout, and validation;
- fail-closed bearer-token validation;
- organization membership and permission resolution;
- role and permission catalog;
- Ambassador, Affiliate, and Partner referral programs;
- hashed referral codes rather than plaintext database storage;
- secure referral verification and authenticated redemption;
- append-only audit-event schema;
- private marketplace listing drafts;
- public visibility only for database records marked `published`;
- current-guide SportsCardsPro normalization across supported grade fields;
- one-at-a-time provider scheduling with a 1.1-second default delay;
- 24-hour current-guide cache;
- explicit separation of guide values from historical-sale evidence;
- deterministic TypeScript build checks.

## Features That Must Not Be Presented as Live

Until provider authorization, deployment, and end-to-end tests pass, the following must be labeled `prototype`, `planned`, or `prepared`:

- card-reader payment processing;
- Apple Pay or Google Pay acceptance;
- Stripe processing;
- QuickBooks production synchronization;
- legal escrow;
- KYC or AML clearance;
- grading-company authentication;
- grading-company submission prices or turnaround times;
- eBay, 130 Point, Card Ladder, Market Movers, or TCGplayer live feeds;
- PSA, CGC, Beckett, or TAG certification verification;
- insurance coverage;
- AI authenticity or grade conclusions;
- real-time A/B experiment results.

## Recovery Protocol for the Local Gemini App

1. Export the complete local workspace as source code, not screenshots.
2. Include `package.json`, lockfile, source files, migrations, tests, and asset licenses.
3. Remove `.env`, `.env.local`, tokens, API keys, test card data, and private evidence.
4. Create a dedicated recovery branch from Pull Request #2.
5. Run dependency and secret scans.
6. Compare each recovered file to the production architecture.
7. Replace simulations with provider sandbox integrations or clearly labeled demo adapters.
8. Add authentication and permission enforcement at the API boundary.
9. Add unit, integration, end-to-end, accessibility, and security tests.
10. Merge only after Ruth Review and a written release decision.

## Required Evidence for Completion

A feature is production-complete only when all of the following exist:

- checked-in implementation;
- database migration where required;
- server-side authorization;
- secret-management configuration;
- tests passing in CI;
- loading, empty, denied, error, and recovery states;
- audit event;
- operational owner;
- user-facing disclosure;
- deployment record;
- provider sandbox or production proof where applicable.

## Current Decision

The Gemini transcript is accepted as a useful design and prototype record. It is **not** accepted as proof that the listed features are live, secure, compliant, connected, or production-ready.
