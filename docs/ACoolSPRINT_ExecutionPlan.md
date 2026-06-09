# ACoolSPRINT: Phase 2 & 3 Execution Plan

## Sprint Objective
Initialize the core technical infrastructure of ACoolCOLLECTOR. This sprint transitions the project from a static data state (CSV) into a dynamic, API-driven ecosystem (`ACoolOMNI`) with a scafollded frontend (Flutter).

## Target Outcomes
1.  **Backend (`omni-engine`):** A functional Node.js/TypeScript server exposing the `ACoolAPI_Pricing` microservice.
2.  **Data Architecture:** Transition `ACoolINVENTORY_Master.csv` reading logic into an API-accessible format.
3.  **Frontend (`app`):** A scaffolded Flutter application featuring the "Zero-Gravity" base UI and routing structure.

---

## 1. Backend Initialization (ACoolOMNI Engine)
**Scope:** Establish the central nervous system.

### Tasks:
- **Setup:** Initialize a new Node.js project in `/ACoolCOLLECTOR/src/omni-engine`.
- **Framework:** Configure TypeScript, Express, and essential middleware (CORS, Helmet).
- **Security:** Implement `dotenv` for handling `.env.local` (Specifically `SPORTSCARDSPRO_API_KEY`).
- **Data Ingestion Module:** Create a utility to parse `/data/processed/ACoolINVENTORY_Master.csv` into memory (simulating a database for this sprint).
- **The ACoolAPI_Pricing Service:**
  - Build an endpoint: `GET /api/v1/pricing/lookup/:id`
  - Integrate with the SportsCardsPro API.
  - Implement a basic caching layer (in-memory or Redis) to respect the 1-call-per-second rate limit.

## 2. Frontend Scaffolding (Zero-Gravity UI)
**Scope:** Establish the user conduit.

### Tasks:
- **Setup:** Initialize a new Flutter project in `/ACoolCOLLECTOR/src/app`.
- **Architecture:** Implement a scalable folder structure (e.g., Feature-First or Domain-Driven Design).
- **Theming:** Define the "Zero-Gravity" theme (Dark mode defaults, futuristic typography, ACoolECOSYSTEM color palette).
- **State Management:** Integrate `Riverpod` (recommended for scalability and testing).
- **Core Screens (Scaffolding):**
  - **Dashboard:** Overview of portfolio value.
  - **Inventory List:** Grid/List view of cards.
  - **Card Detail:** Deep dive into a specific card's pricing and history.
- **API Integration Prep:** Create the `ACoolAPI_Client` class in Dart to communicate with the `omni-engine`.

## 3. Sprint Validation & "Stitch" Testing
**Scope:** Ensure the engine and the UI communicate flawlessly.

### Verification Steps:
- [ ] Run `omni-engine` locally.
- [ ] Hit the `ACoolAPI_Pricing` endpoint via Postman/cURL and verify accurate response from SportsCardsPro.
- [ ] Run the Flutter `app` in a simulator/web browser.
- [ ] Verify the Flutter app can successfully fetch and display data from the local `omni-engine`.

## Rollback & Mitigation
- If the SportsCardsPro API rate limit is hit, the `ACoolAPI_Pricing` service must fallback gracefully to the last known cached price or the `price-in-pennies` listed in the CSV.
- Do NOT commit `.env.local` to version control.
