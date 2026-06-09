# ACoolECOSYSTEM: Subgroups Integration Manifest

The ACoolCOLLECTOR project is not a standalone application; it is the central node in the wider ACoolECOSYSTEM. The `ecosystem/subgroups/` directory manages the specific data access, UI views, and RASCI responsibilities for our three primary user bases.

## 1. CoOp COLLECTORS
**Path:** `/ecosystem/subgroups/CoOp_COLLECTORS/`
- **Role:** The heartbeat of the ecosystem. Individual collectors and subcommunity syndicates pooling resources.
- **Access Level:** Read-heavy. Access to the Omnianalysis Dashboard, Arbitrage Ticker, and Personal Portfolio tracking.
- **Tools:** Use the `ACoolAPP` to scan raw cards and get instant estimated grades (Ruth Review standard) before sending to PSA/TAG.

## 2. Vendors (Shops & Breakers)
**Path:** `/ecosystem/subgroups/Vendors/`
- **Role:** The local game stores (LGS), eBay powersellers, and Fanatics Live breakers.
- **Access Level:** Read/Write. Ability to list inventory, broadcast live breaks, and access wholesale pricing indexes.
- **Tools:** The Vendor Matrix dashboard allows them to instantly adjust inventory prices based on real-time CardLadder shifts.

## 3. Distributors
**Path:** `/ecosystem/subgroups/Distributors/`
- **Role:** The macro-level suppliers.
- **Access Level:** Analytics-heavy. Heatmaps of which regions are buying which products (e.g., Pokémon vs. Topps Chrome Baseball).
- **Tools:** Predictive modeling to allocate sealed wax to Vendors based on CoOp COLLECTOR demand trends.
