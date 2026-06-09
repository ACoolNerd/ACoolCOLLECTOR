# ACoolAPP_Development_Plan

## 1. Technology Stack
- **Frontend (UI/UX):** Flutter (Dart) - Targeting iOS, Android, and Web simultaneously.
- **Backend (ACoolOMNI Core):** Node.js (TypeScript) + Express.
- **Database (ACoolSCHEMA):** PostgreSQL (Relational Data) + Redis (Pricing Cache).
- **AI Services:** Google AI Studio (Image processing, dynamic prompt generation).
- **External Data:** SportsCardsPro API.

## 2. Repository Structure (Planned)
```
/ACoolCOLLECTOR
  /src
    /app            # Flutter frontend
    /omni-engine    # Node.js backend (ACoolOMNI core)
      /services     # ACoolAPI_[purpose] microservices
  /data             # ACoolINVENTORY_Master
  /docs             # Project Documentation
```

## 3. Development Phases

### Phase A: Engine Initialization
1. Set up the Node.js project in `/src/omni-engine`.
2. Build `ACoolAPI_Inventory` to serve data from the current CSV.
3. Build `ACoolAPI_Pricing` to connect to SportsCardsPro and cache results.

### Phase B: Frontend Scaffolding
1. Initialize Flutter project in `/src/app`.
2. Create the base "Zero-Gravity" theme (dark mode, futuristic aesthetics matching ACoolECOSYSTEM).
3. Implement state management (e.g., Riverpod or Provider) to handle UI morphing based on user roles.

### Phase C: Core Feature Implementation
1. **Portfolio View:** Connect Flutter app to `ACoolAPI_Inventory`.
2. **Scanner:** Integrate device camera with AI Studio backend for card ingestion.
3. **Marketplace:** Develop the trading and bidding interfaces.

## 4. API Service Specifications
- **`ACoolAPI_Pricing`:** Responsible for fetching, caching, and serving `loose-price` data for raw cards.
- **`ACoolAPI_Auth`:** Handles secure login and session management across the ecosystem.
- **`ACoolAPI_Omni`:** The central nervous system that logs contextual actions and dictates schema updates.
