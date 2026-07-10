# Discovery, Events, Promotions, and Recommendation Implementation Status

## Implemented in Pull Request #2

- reusable collectible category, franchise, set, product and checklist schema;
- event ticket offers and private attendance plans;
- manual savings goals and contributions;
- collection-completion and deck-completion goals;
- bargain-bin sessions and grading scenarios;
- grading provider and service-level records;
- recommendation runs and explainable ranked items;
- compliance-first promotion and audited draw records;
- deterministic experiment assignment and exposure events;
- full profile and privacy extensions;
- server API routes;
- automated TypeScript tests;
- verified seed files for One Piece and Collect-A-Con;
- UI screen register and operating documentation.

## Not Yet Live

- Supabase migrations have not been applied to a live production project;
- source synchronization jobs are not deployed;
- mobile UI is not recovered or connected;
- Disney Lorcana future releases are not seeded without official verification;
- event ticket purchase remains official external checkout;
- savings goals do not move money;
- no promotion or raffle is open;
- grading fees require recurring source verification;
- recommendation evaluation and Ruth Review remain pending;
- SportsCardsPro credentials still require rotation and history remediation.

## Required Release Sequence

1. Apply migrations in isolated development.
2. Run schema, RLS and rollback tests.
3. Deploy official-source synchronization jobs.
4. Recover and connect the mobile UI.
5. Run recommendation evaluation.
6. Verify ticket redirects and source freshness.
7. Complete promotion legal review before enabling entries.
8. Complete privacy, accessibility and security review.
9. Complete Ruth Review.
10. Record executive go/no-go.
