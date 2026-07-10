# ACoolCOLLECTOR Google AI Studio Build Package

This directory is the controlled input package for rebuilding and extending ACoolCOLLECTOR in Google AI Studio without losing product, security, accounting, privacy, or evidence requirements.

## Files

- `00_SYSTEM_INSTRUCTIONS.md` — persistent model behavior and non-negotiable controls.
- `01_MASTER_BUILD_PROMPT.md` — complete application build assignment.
- `02_CONTEXT_MANIFEST.json` — canonical repository and product context.
- `03_FUNCTION_DECLARATIONS.json` — approved agent tool declarations.
- `04_STRUCTURED_OUTPUT_SCHEMAS.json` — JSON response contracts.
- `05_EVALUATION_SUITE.md` — acceptance and adversarial evaluations.
- `06_DEPLOYMENT_CHECKLIST.md` — Google Cloud, QuickBooks, SEO, privacy, and release gates.

## Google AI Studio Setup

1. Create a new app or prompt in Google AI Studio.
2. Add `00_SYSTEM_INSTRUCTIONS.md` as the System Instructions.
3. Add `01_MASTER_BUILD_PROMPT.md` as the first user/build prompt.
4. Attach the repository documents listed in `02_CONTEXT_MANIFEST.json`.
5. Configure function declarations from `03_FUNCTION_DECLARATIONS.json`.
6. Use the schemas in `04_STRUCTURED_OUTPUT_SCHEMAS.json` for structured outputs.
7. Run every evaluation in `05_EVALUATION_SUITE.md` before accepting generated code.
8. Export generated code to a review branch. Never deploy directly from an unreviewed AI Studio session.
9. Run repository CI, security scans, migration tests, accessibility tests, and Ruth Review.
10. Deploy through a controlled Google Cloud or approved application environment.

## API and Secret Rule

Google AI Studio may help create the application, but production secrets must live in Secret Manager or an equivalent server-side secret store.

Never place these in client code, prompts, screenshots, generated documentation, or repository files:

- Gemini API keys;
- Google Maps server keys;
- Google OAuth client secrets;
- Supabase service-role keys;
- SportsCardsPro tokens;
- Intuit client secrets or OAuth tokens;
- Stripe secrets;
- webhook verification secrets;
- private image signed URLs;
- private contact or ticket data.

## Model Strategy

Use a capable reasoning model for architecture, migrations, security, and complex cross-file work. Use a fast model for bounded transformations, extraction, classification, and repetitive UI generation. Pin the selected model and prompt version in release evidence instead of relying on an unrecorded automatic model choice.

## Production Rule

AI-generated code is a draft until:

- it is committed to a branch;
- it compiles;
- tests pass;
- authorization is enforced server-side;
- migrations apply and roll back in development;
- secrets are protected;
- data sources and dates are verified;
- accessibility passes;
- public claims and affiliation language pass review;
- a human approves release.
