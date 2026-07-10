# ACoolARCHITECTURE — Production System

## Purpose

This document defines the production architecture for ACoolCOLLECTOR, including data boundaries, agent responsibilities, external integrations, and release controls.

## Core rule

**Rights → Disclosure → Proof**

- **Rights:** confirm ownership, authorization, contractual rights, and role permissions.
- **Disclosure:** present source, timestamp, assumptions, limitations, fees, and conflicts.
- **Proof:** preserve evidence, approvals, transactions, custody, and audit events.

## System-of-record boundaries

### ACoolCOLLECTOR
Authoritative for:

- ACool Asset ID;
- exact card or collectible identity;
- front and back evidence;
- certification and serial evidence;
- ownership and beneficial ownership;
- collection and commerce status;
- pricing evidence and recommendations;
- grading assessments;
- listings, breaks, custody, and fulfillment;
- private collection data;
- agent runs and approvals.

### SportsCardsPro
External current-value provider for:

- product identity candidates;
- set and product names;
- current grade-condition guide values;
- yearly sales-volume estimate;
- provider release date and genre.

SportsCardsPro is not authoritative for ownership, actual condition, completed-sale history, final list price, or permission to sell.

### QuickBooks Online Advanced
Authoritative for:

- customers and vendors;
- invoices and payments;
- deposits and merchant fees;
- refunds and chargebacks;
- accounts receivable and payable;
- taxes and accounting reports.

QuickBooks must not replace the card registry or BreakVault evidence.

### Protected object storage
Authoritative binary store for:

- card images;
- receipts;
- grading and certification evidence;
- ownership documents;
- custody evidence;
- insurance documents;
- fulfillment photographs.

GitHub must not be used as the private evidence store.

## Logical components

```text
Client applications
  ├── public web
  ├── collector app
  ├── dealer/operations console
  └── administration and Ruth Review
          ↓
API gateway / application services
  ├── ACoolAPI_Auth
  ├── ACoolAPI_Assets
  ├── ACoolAPI_Pricing
  ├── ACoolAPI_Grading
  ├── ACoolAPI_BreakVault
  ├── ACoolAPI_Marketplace
  ├── ACoolAPI_Breaks
  ├── ACoolAPI_Orders
  ├── ACoolAPI_Finance
  ├── ACoolAPI_Agents
  └── ACoolAPI_Audit
          ↓
PostgreSQL + protected object storage + queue/cache
          ↓
External integrations
  ├── SportsCardsPro
  ├── QuickBooks / Intuit
  ├── email
  ├── shipping
  └── analytics
```

## Canonical entities

- organizations
- users
- organization_memberships
- roles
- permissions
- collections
- collection_items
- asset_images
- asset_evidence
- provider_matches
- provider_price_snapshots
- market_observations
- grading_assessments
- grading_submissions
- digital_twins
- custody_events
- storage_locations
- insurance_records
- listings
- offers
- consignments
- consignment_settlements
- breaks
- break_rules_versions
- break_participants
- break_randomizations
- break_hits
- orders
- order_lines
- payments
- refunds
- fulfillment_events
- qbo_connections
- qbo_entity_links
- sync_jobs
- agent_runs
- approval_requests
- audit_events
- security_incidents

## Money and time

- Store all money as integer cents plus ISO currency.
- Use timezone-aware UTC timestamps.
- Preserve provider source time and internal ingestion time separately.
- Never overwrite historical market observations; append a new observation.

## Authorization model

Authorization decisions must include:

```text
organization
actor
role
resource
resource scope
action
conditions
approval requirement
```

Privileged roles require MFA. Vault movements, refunds, payout release, publication, role elevation, break-rule changes, and evidence changes require explicit approval.

## Agent architecture

ACoolOMNI orchestrates specialist agents. It does not bypass role checks or human approvals.

Every agent run must record:

- actor and organization;
- input resource IDs;
- tool permissions;
- evidence references;
- output and confidence;
- approval state;
- changes made;
- error or escalation;
- immutable audit event.

## Pricing architecture

```text
SportsCardsPro current guide
Completed-sale observations
Active-listing observations
Dealer or auction quotes
Condition and grading evidence
Liquidity and volume
Costs and fee assumptions
        ↓
BETH confidence model
        ↓
Target list / expected sale / minimum approved
        ↓
Ruth Review + owner approval
```

Each evidence class remains separate so users can see why a value was recommended.

## Image and evidence flow

1. Intake creates a private asset record.
2. Client requests a signed upload URL.
3. Binary data uploads directly to protected storage.
4. Server records checksum, mime type, dimensions, actor, and timestamp.
5. Recognition agents create candidates, not final identity claims.
6. Authorized reviewers confirm identity and evidence.
7. Public derivatives are generated only for approved listings.
8. Original evidence remains private and access-controlled.

## Reliability

- Idempotency keys for external writes.
- Bounded retries with exponential backoff.
- Dead-letter handling for failed sync jobs.
- One-second-or-greater SportsCardsPro request spacing.
- Reconciliation jobs for missed webhooks.
- Backup and restore tests.
- Observability for latency, errors, queue depth, stale prices, and failed approvals.

## Release sequence

1. foundation and secret remediation;
2. private inventory alpha;
3. BETH pricing alpha;
4. BreakVault operations alpha;
5. finance and POS alpha;
6. security and compliance beta;
7. invite-only private beta;
8. written production go/no-go.

Public release is prohibited while a critical security risk, failed payment control, incomplete ownership record, or unapproved public claim remains open.
