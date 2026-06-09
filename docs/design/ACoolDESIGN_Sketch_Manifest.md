# ACoolDESIGN: Sketch Artboard Manifest (Beth Beta)

*Note: Use this document as the 1-to-1 blueprint to build your Sketch (.sketch) file for the ACoolCOLLECTOR UI.*

## 1. Global Design System (The ACoolTHEME)
- **Backgrounds:** Pure Black `#000000` to Deep Charcoal `#121212`
- **Typography:** Inter or Roboto (Clean, data-heavy readability)
    - Headers: Bold, tracking +0.5
    - Numbers/Data: Monospace (for alignment in tables)
- **Accent / Arbitrage Green:** `#00FFCC` (Use for "Buy" signals, positive arbitrage)
- **Pinnacle Tier Gold (BGS/SGC):** `#FFD700`
- **Gem Tier Red (PSA):** `#FF3B30`

## 2. Artboard 1: Mobile Omnianalysis Dashboard
**Dimensions:** iPhone 14 Pro (393 x 852)

### A. Navigation Bar (Top)
- **Background:** `#000000`
- **Text:** "ACoolCOLLECTOR" (White, Bold, 16pt)
- **Icon:** Analytics/Radar icon (Right-aligned, `#00FFCC`)

### B. Arbitrage Ticker Component
- **Position:** Y: 100, X: 16, Width: 361, Height: 70
- **Background:** Gradient `#1E1E1E` to `#2A2A2A`
- **Border:** 1px solid `#00FFCC` (Opacity: 30%)
- **Corner Radius:** 12px
- **Content:**
    - Left text: "Fanatics Live Break: 1986 Fleer Box" (White, 70% opacity, 14pt)
    - Right text: "Target: Under $15k" (`#00FFCC`, Bold, 14pt)

### C. Grading Matrix Card Component
- **Position:** Y: 220, X: 16, Width: 361, Height: 200
- **Background:** `#1A1A1A`
- **Corner Radius:** 16px
- **Drop Shadow:** Y: 4, Blur: 10, Color: `#000000`, Opacity: 50%
- **Content (The Ruth Review Standard):**
    - Title: "Michael Jordan 1986 Fleer #57" (White, Semi-bold, 18pt)
    - Divider Line: 1px `#FFFFFF` (Opacity 24%)
    - Row 1: Red circle indicator + "PSA 10 (Gem Mint)" | Right align: "$250,000"
    - Row 2: Gold circle indicator + "BGS Black Label" | Right align: "$1,000,000+"
    - Row 3: Blue circle indicator + "TAG 1000" | Right align: "Calculating..."

## 3. Export & Handoff
Once designed in Sketch, export the artboards as PNG/SVG into `/Users/acoolnerd/ACoolCOLLECTOR/docs/design/exports/` for engineering reference.
