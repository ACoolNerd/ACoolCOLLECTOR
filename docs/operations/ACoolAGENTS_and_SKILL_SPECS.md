# ACoolCOLLECTOR Agent Mesh + Skill Specifications

These are operating specifications for the repository and automation layer. They do not grant agents authority to buy, sell, move custody, expose PII, or publish premium-card prices without the human gates below.

## Agent hierarchy

### ACoolOMNI — Orchestrator

**Inputs:** inventory state, calendar, market refresh state, content state, live state, fulfillment/reconciliation exceptions.

**Outputs:** prioritized daily plan, routing to sub-agents, exception summary.

**Human gate:** Collector Lead approves irreversible external actions.

### ACoolCARD Intake — Inventory sub-agent

- Normalizes imports.
- Creates/maintains asset IDs and source lineage.
- Flags duplicate IDs, missing folder/location, missing cost basis, missing grade/cert, and identification ambiguity.
- Routes premium digital-twin enrichment to Ruth Review.

### BETH Market — Market-intelligence sub-agent

- Reads exact card identity and condition evidence.
- Refreshes SportsCardsPro current-guide fields.
- Collects completed-sale evidence from eBay, 130point, and TCGplayer where applicable.
- Produces comp confidence, cash/trade/lot scenario, evidence timestamp, and review reason.
- Does not finalize premium public pricing below the required evidence/confidence gate.

### CONTENT-25 — Content sub-agent

- Selects 25 sale assets/day from eligible inventory.
- Produces hooks, card facts, CTA, channel adaptation, and live-event bridge.
- Sends premium/high-variance assets to Ruth Review before publish.

### ACoolBREAK Producer — Break-ops sub-agent

- Builds disclosed break manifests from eligible inventory.
- Creates spot schema, participant ledger template, run of show, evidence checklist, and fulfillment map.
- Does not invent undisclosed mystery/raffle mechanics.

### LIVE Director — Broadcast sub-agent

- Validates cameras, microphones, lighting, network, scene framing, recording, and clip-marker plan.
- Tracks live milestones and records exception timestamps.
- Host retains go-live/end authority.

### BreakVault Custody — Custody sub-agent

- Links every break item and hit to its digital twin.
- Records protection, assignment, packing handoff, and storage-location events.
- Requires front/back/serial/cert evidence for premium assets.

### HOWARD Community — Community sub-agent

- Moderates questions and claims.
- Routes FAQs, payment handoff, shipping questions, and post-live follow-up.
- Cannot override price, payment state, ownership, or custody records.

### Fulfillment Agent

- Generates pack lists from paid assignments.
- Controls label queue and tracking state.
- Keeps customer addresses and other PII off public video and public artifacts.

### Finance Recon

- Reconciles paid orders, fees, refunds, shipping, adjustments, and inventory state daily.
- Human approval is required before authoritative accounting writeback.

### SportsCardsPro Sync

- Reads the API token only from secrets.
- Refreshes bounded inventory slices or bulk price files.
- Preserves source ID, raw pennies, normalized USD, refresh timestamp, sales volume, mapping confidence, and exceptions.
- Does not redistribute SportsCardsPro price data externally without rights clearance.

### Ruth Review — QA / disclosure gate

- Checks public facts, exact identity, condition claims, comp evidence, break proof, and correction language.
- Can fail an asset/event back to the responsible agent.
- Premium content does not bypass this gate.

---

# Reusable skill specifications

## Skill: ACoolCOLLECTOR Inventory Intake

**Trigger:** a new collection CSV/export/photo batch is supplied.

**Steps:**
1. Preserve the source snapshot unchanged.
2. Normalize fields into the inventory ledger.
3. Detect duplicate IDs/SKUs and quantity ambiguity.
4. Classify category, set, player/character, year, variation, grade, cert, and storage state.
5. Generate data-quality exceptions.
6. Create digital-twin enrichment queue.
7. Never overwrite a source snapshot.

## Skill: BETH Comp Refresh

**Trigger:** a card is about to be posted, priced, graded, financed, insured, traded, or placed into a premium break.

**Steps:**
1. Confirm exact card/version/serial/grade/condition.
2. Refresh SportsCardsPro guide/demand fields.
3. Gather completed-sale evidence from eBay/130point/TCGplayer where applicable.
4. Exclude asking prices from the comp set.
5. Calculate cash/trade/lot scenarios and confidence.
6. Require at least 9.7/10 evidence quality for final premium recommendations; otherwise expose the evidence gap.

## Skill: CONTENT-25 Daily Sell Queue

**Trigger:** daily content-production cycle.

**Steps:**
1. Remove duplicate/reconciliation holds.
2. Rank by sellability, marketability, value, star/character demand, scarcity/parallel features, and inventory strategy.
3. Protect high-value/parallel-sensitive assets until BETH + Ruth Review pass.
4. Route sub-$5 cards toward lots/breaks rather than labor-heavy one-off sale posts.
5. Output five waves of five with TikTok, YouTube, and WhatsApp adaptations.
6. Reconcile posted/sold/held/skipped state nightly.

## Skill: ACoolBREAKS Live Event

**Trigger:** a scheduled live break/showcase.

**Steps:**
1. Freeze the disclosed manifest and rules.
2. Validate participant/payment ledger.
3. Prove product or disclosed inventory board on camera.
4. Perform and record randomization only if the published format uses it.
5. Keep an uninterrupted opening/showcase record.
6. Assign and protect hits immediately.
7. Recap, reconcile, fulfill, and retain evidence.

## Skill: Ruth Review

**Trigger:** premium price/post, break launch, public correction, or material inventory exception.

**Checks:** identity, version, condition, source freshness, sold-vs-asking evidence, unsupported claims, ownership/custody, PII exposure, participant fairness, fulfillment traceability, and correction requirement.
