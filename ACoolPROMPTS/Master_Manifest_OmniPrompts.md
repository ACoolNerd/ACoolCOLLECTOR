# ACoolCOLLECTOR: Master Manifest & Omni-Prompts

## 1. Executive Summary: The Omnianalysis Architecture
We have successfully initialized the **ACoolCOLLECTOR** project, executing the **Alpha Protocol** to build the foundation for the **Omnianalysis Trading Card Framework**.

**Accomplishments:**
1.  **Architecture Defined:** Created the Master Blueprint (`ACoolARCHITECTURE_Omnianalysis.md`) establishing the vision, data sources (SportsCardsPro, 130point, TCGPlayer, CardLadder), and the unified grading matrix (Pinnacle, Gem, Mint tiers across PSA, BGS, SGC, CGC, TAG).
2.  **Alpha Protocol Execution:**
    *   `src/alpha_protocol/db_setup.py`: Initialized the SQLite database (`omnianalysis.db`) with tables designed specifically for multi-source market data and detailed subgrades (Centering, Corners, Edges, Surface).
    *   `src/alpha_protocol/ingestion_engine.py`: Scaffolded the Python engine to hit the SportsCardsPro API and stubbed out ACoolOSINT integrations for 130point and CardLadder.
3.  **The Ruth Review Standard:** All code and architecture have been written to honor the absolute standard of care, truth, and discipline required by the Ruth Review phase.

---

## 2. ACoolSTACK: Full-Stack Organization

The ACoolSTACK divides the project into clear operational tiers. Ensure your repositories (GitHub/GitLab/GCP) follow this structure:

*   **Layer 1: ACoolSCHEMA (Data & DB)**
    *   `/data/db/`: SQLite (Alpha) -> PostgreSQL/BigQuery (Production).
    *   `/src/alpha_protocol/db_setup.py`: Schema management.
*   **Layer 2: ACoolOSINT & ACoolAPI (Ingestion)**
    *   `/src/alpha_protocol/ingestion_engine.py`: API wrappers and scraping scripts.
*   **Layer 3: ACoolAI (Omnianalysis Engine)**
    *   `/notebooks/`: For predictive modeling, arbitrage detection, and chart generation.
*   **Layer 4: The Beth Beta (User Interface)**
    *   *(Pending)* Flutter/React UI for Collector, Vendor, and Distributor views.
*   **Layer 5: ACoolPROMPTS (AI DNA)**
    *   `/ACoolPROMPTS/`: Master prompts and system instructions (like this file).

---

## 3. Master Prompts for Omni-Engine Syncing
*Copy and paste these directly into the respective AIs to instantly sync them to the project.*

### A. Gemini (The Builder & Integrator)
> **Master Prompt:**
> "I am ACoolNERD. You are operating within the ACoolCOLLECTOR ecosystem, powered by ACoolOMNI. We have initialized the Alpha Protocol and the Omnianalysis architecture for the trading card market. You must adhere to the Ruth Review standards of absolute discipline and truth. Your task is to act as the primary software engineer. Review the `ACoolARCHITECTURE_Omnianalysis.md` and the `alpha_protocol` scripts in `/src/`. Help me build out the predictive arbitrage models using BigQuery, write the ACoolOSINT scrapers for Fanatics Live and 130point, and ensure our grading matrix (PSA, BGS, SGC, CGC, TAG) correctly weighs subgrades. Only output production-ready code that passes the Board of Barbara review."

### B. Claude (The Analyst & UI/UX Architect)
> **Master Prompt:**
> "I am ACoolNERD. We are building ACoolCOLLECTOR, an Omnianalysis trading card platform. We are entering the 'Beth Beta' phase. Your role is the Lead Architect for User Experience and Market Analysis. Based on a unified grading matrix that standardizes PSA 10, BGS 9.5, SGC 10, and TAG 950+, I need you to design the data visualization architecture. How should we present historical CardLadder index data alongside real-time 130point eBay sales to a user? Design the Flutter widget component tree and the color psychology to make the 'Pinnacle Tier' (Black Label/Pristine 10) stand out. Ensure the design passes the 'Ruth Review' for absolute clarity and integrity."

### C. ChatGPT (The Content, Market, & Strategy Engine)
> **Master Prompt:**
> "I am ACoolNERD. You are the Chief Market Strategist for ACoolCOLLECTOR. We are preparing for the 'Board of Barbara'—a presentation to industry experts, Fanatics executives, and GameStop partners. Our platform uses 'Omnianalysis' to aggregate SportsCardsPro, TCGPlayer, 130point, and grading house pop reports into one unified truth. I need you to draft the executive pitch deck, the go-to-market strategy, and the community engagement plan for 'CoOp COLLECTORS'. Emphasize how our proprietary grading matrix discovers market arbitrage and protects the investor. Keep the tone visionary, authoritative, and rooted in the discipline of the 'Ruth Review'."

---

## 4. Required Permissions & Environment Setup

To fully manifest the Alpha Protocol and push to the cloud, you must configure the following on your machine:

### A. Local API Keys (`.env.local`)
Create or edit `/Users/acoolnerd/ACoolCOLLECTOR/.env.local` and add:
```env
SPORTSCARDSPRO_API_KEY=your_key_here
TCGPLAYER_PUBLIC_KEY=your_public_key
TCGPLAYER_PRIVATE_KEY=your_private_key
# Add keys for 130point/CardLadder if they offer official APIs
```

### B. Git (GitHub & GitLab)
1.  **Initialize locally:** `git init` in the ACoolCOLLECTOR directory.
2.  **Permissions:** You need SSH keys or Personal Access Tokens (PATs) configured for both GitHub and GitLab on your Mac.
3.  **Remotes:**
    *   `git remote add github git@github.com:yourusername/ACoolCOLLECTOR.git`
    *   `git remote add gitlab git@gitlab.com:yourusername/ACoolCOLLECTOR.git`

### C. Google Cloud Workspace (GCP)
1.  **gcloud CLI:** Ensure `gcloud` is installed and you are logged in (`gcloud auth login`).
2.  **Project:** You need a GCP Project ID (e.g., `acoolcollector-omni`).
3.  **Services:** Enable the BigQuery API (for advanced Omnianalysis), Cloud Storage (for raw data dumps), and Cloud Source Repositories (if hosting code on GCP).
