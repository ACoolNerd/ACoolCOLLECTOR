# Event Ticketing and Savings Security Protocol

## Ticketing

ACoolCOLLECTOR begins with verified official external checkout links.

- Display organizer, ticket provider, source URL and last verified time.
- Allowlist ticket domains.
- Warn when availability has not been rechecked.
- Never request or store a user's third-party ticketing password.
- Never claim a ticket was purchased until a receipt or provider confirmation is recorded.
- Do not open embedded checkout until provider terms, content security policy and payment scope are approved.
- Require explicit user confirmation before leaving ACoolCOLLECTOR.

## Attendance Plan

A saved plan may contain ticket status, travel budget, show budget, target products, target cards, target vendors and notes. Plans are private by default and protected by row-level security.

## Savings

The initial system records manual goals and contributions. It does not hold funds or initiate transfers.

Future financial connections require:

- separate consent;
- regulated provider review;
- tokenized authorization;
- no storage of bank credentials;
- revocation controls;
- transaction reconciliation;
- error and dispute handling;
- privacy, legal and security approval.

## Redirect Security

- Permit HTTPS only.
- Permit verified organizer or ticket-provider hosts only.
- Reject URL shorteners unless resolved and reviewed.
- Prevent user-controlled redirect destinations.
- Add outbound-link disclosure.
- Log the event, offer, user and timestamp without logging ticket credentials.
