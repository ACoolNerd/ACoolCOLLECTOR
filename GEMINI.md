# ACoolCOLLECTOR Project Instructions

## Project Context
ACoolCOLLECTOR is driven by **ACoolOMNI**, the evolving ecosystem engine. Every component must adhere to the **ACoolSCHEMA**.

## Standards & Conventions (The ACool Way)
- **Nomenclature:** Critical components must prefix with `ACool` (e.g., `ACoolINVENTORY_Master`, `ACoolAPI_Pricing`, `ACoolARCHITECTURE`).
- **Architecture:** ACoolOMNI acts as the central brain. Applications (like the Flutter UI) are dynamically influenced by the ACoolSCHEMA.
- **Community First:** Adhere to the `ACoolCOMMUNITY_RASCI` matrix. Every feature must consider Collectors, Vendors, Distributors, and Subcommunities.
- **Security:** Never commit API keys. Use `.env.local`.

## Workflow
1. **Data:** Rely on `ACoolINVENTORY_Master.csv` as the initial truth before database migration.
2. **API:** Internal APIs are structured as `ACoolAPI_[purpose]`. External API is SportsCardsPro.
3. **Evolution:** Ensure code is modular so ACoolOMNI can stitch and evolve the ecosystem continuously.

## Sub-components
- **CoOp COLLECTORS:** Community-driven subcommunities.
- **ACoolPROMPTS:** The directory containing the DNA for AI Studio and Omni-engine tasks.
