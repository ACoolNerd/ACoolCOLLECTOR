# ACoolCOLLECTOR Recommendation Test Plan

## Reviewed Test Sets

Create reviewed examples for set completion, deck completion, bargain-bin decisions, event savings and grading scenarios. Every example records its source data, expected output range, confidence threshold and reviewer notes.

## Metrics

- accuracy of the top three recommendations;
- budget-limit violations;
- stale-source rate;
- identity-confidence violations;
- grading false-positive rate;
- deck-legality errors;
- duplicate recommendations;
- explanation completeness;
- user overrides and dismissals.

## Guardrails

- no recommendation from an unverified identity;
- no guaranteed return language;
- manual review below grading confidence policy;
- warning before exceeding a user's maximum price;
- rotation and legality warning for deck lists;
- source and verification time for current release facts;
- social popularity is not a trust or purchase signal.

## A/B Testing

Appropriate early tests include explanation-first versus score-first cards, progress bars versus checklists, weekly versus monthly savings framing, and route versus vendor-grouped show views.

Every test requires a written hypothesis, primary metric, guardrails, privacy review, stable assignment, an exposure event, a predetermined stop rule and a documented result. Synthetic test events must remain labeled as synthetic.
