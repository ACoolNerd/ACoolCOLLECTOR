#!/usr/bin/env python3
"""
ACoolCOLLECTOR Phase 0 Physical Inspection Worksheet Generator
Generates a bounded 50-card physical inspection worksheet (CSV and Markdown)
per ACW-COLLECTOR-OWNED-SITE-2026-10-06-01 and ACW-COLLECTOR-PHASE0-INSPECT-2026-10-06-01.
"""

import csv
import json
import os

CATALOG_PATH = '/Users/acoolnerd/ACool/reports/ACoolCOLLECTOR_NoGrade_Card_Sale_Catalog_2026-10-06.csv'
CSV_OUT = '/Users/acoolnerd/ACool/reports/ACoolCOLLECTOR_Phase0_Physical_Inspection_Worksheet_2026-10-06.csv'
MD_OUT = '/Users/acoolnerd/ACool/reports/ACoolCOLLECTOR_Phase0_Physical_Inspection_Worksheet_2026-10-06.md'

def main():
    rows = []
    with open(CATALOG_PATH, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            m = json.loads(r['metadata'])
            rows.append((r, m))

    pilot_ids = [
        ('631426', 'Vintage Pilot Singleton ($3.49 draft ask)'),
        ('1864143', 'Vintage Pilot Singleton ($3.99 draft ask)'),
        ('1879172', 'Vintage Pilot Singleton ($2.99 draft ask)'),
    ]
    selected = []

    # 1-3: Vintage pilot singletons
    for cid, role in pilot_ids:
        for r, m in rows:
            if m.get('sourceCatalogId') == cid:
                selected.append((r, m, role))
                break

    # 4-6: Reggie Jackson #700 duplicate trio (sourceCatalogId 1879574)
    for r, m in rows:
        if m.get('sourceCatalogId') == '1879574':
            selected.append((r, m, 'Vintage Duplicate Trio (Test physical count: 3 entries)'))

    # 7-8: Joe Montana #381 duplicate pair (sourceCatalogId 633176)
    for r, m in rows:
        if m.get('sourceCatalogId') == '633176':
            selected.append((r, m, 'Football Duplicate Pair (Test physical count: 2 entries)'))

    # 9-10: Reggie Jackson Red Ice #162 duplicate pair (sourceCatalogId 8544476)
    for r, m in rows:
        if m.get('sourceCatalogId') == '8544476':
            selected.append((r, m, 'Modern Basketball Duplicate Pair (Test physical count: 2 entries)'))

    # 11-50: 40 category cross-section cards
    quotas = [
        ('Basketball Cards 2024 Panini Prizm', 5),
        ('Basketball Cards 2024 Panini Mosaic', 5),
        ('Basketball Cards 2024 Panini Donruss', 4),
        ('Hockey Cards 2024 Upper Deck', 4),
        ('Football Cards 2024 Panini Contenders', 4),
        ('Football Cards 2024 Topps Resurgence', 4),
        ('Soccer Cards 2024 Topps Chrome UEFA', 4),
        ('Baseball Cards 2025 Topps Chrome', 4),
        ('Ufc Cards 2025 Topps Chrome UFC', 3),
        ('One Piece Legacy of the Master', 3),
    ]

    used_ids = set([m['sourceCatalogId'] for _, m, _ in selected])

    for cat, count in quotas:
        cat_rows = [x for x in rows if x[1].get('category') == cat and x[1].get('sourceCatalogId') not in used_ids and x[1].get('sale_review_state') == 'PHYSICAL_IDENTITY_AND_CONDITION_REVIEW']
        step = max(1, len(cat_rows) // count)
        picked = cat_rows[::step][:count]
        for r, m in picked:
            selected.append((r, m, f'Category Sample: {cat}'))
            used_ids.add(m['sourceCatalogId'])

    assert len(selected) == 50, f'Expected 50 cards, got {len(selected)}'

    # Write CSV
    fieldnames = [
        'slot', 'id', 'entity', 'type', 'name', 'status', 'owner', 'updatedAt',
        'sourceCatalogId', 'category', 'source_quantity', 'source_raw_condition',
        'sale_review_state', 'pilot_role', 'suggested_start_ask_usd',
        'physical_present_yn', 'physical_count', 'actual_condition_grade',
        'centering_corners_edges_surface', 'photo_front_back_taken_yn',
        'duplicate_disposition', 'saleable_decision', 'inspection_notes'
    ]

    with open(CSV_OUT, mode='w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for idx, (r, m, role) in enumerate(selected, start=1):
            writer.writerow({
                'slot': idx,
                'id': r['id'],
                'entity': r['entity'],
                'type': r['type'],
                'name': r['name'],
                'status': r['status'],
                'owner': r['owner'],
                'updatedAt': r['updatedAt'],
                'sourceCatalogId': m.get('sourceCatalogId', ''),
                'category': m.get('category', ''),
                'source_quantity': m.get('quantity_source', 1),
                'source_raw_condition': m.get('raw_condition_source', ''),
                'sale_review_state': m.get('sale_review_state', ''),
                'pilot_role': role,
                'suggested_start_ask_usd': m.get('suggested_start_ask_usd', ''),
                'physical_present_yn': '',
                'physical_count': '',
                'actual_condition_grade': '',
                'centering_corners_edges_surface': '',
                'photo_front_back_taken_yn': '',
                'duplicate_disposition': '',
                'saleable_decision': '',
                'inspection_notes': ''
            })

    print(f'Wrote CSV to {CSV_OUT} with {len(selected)} rows.')

    # Write Markdown
    md_content = """# ACoolCOLLECTOR Phase 0 Physical Inspection Worksheet

**Document ID:** `ACW-COLLECTOR-PHASE0-INSPECT-2026-10-06-01`  
**Date:** 2026-10-06  
**Status:** `READY FOR PHYSICAL OWNER EXECUTION`  
**Entity:** ACool Ecosystem / ACoolCOLLECTOR  
**Accountable Owner:** Keith Z. C. McPherson  
**Purpose:** Physical inspection and verification worksheet for a bounded 50-card sample prior to pack batching, sealing, or direct storefront listing per [ACW-COLLECTOR-OWNED-SITE-2026-10-06-01](file:///Users/acoolnerd/ACool/reports/ACoolCOLLECTOR_Owned_Site_and_Counter_Display_Manifest_2026-10-06.md).

---

## 1. Inspection Protocol & Rules of Engagement

1. **Physical Card Presence:** Verify that each card physically exists in the binder/box. Mark `[Y/N]` and record actual physical quantity found.
2. **Raw Condition Grading:** Inspect raw surfaces under direct lighting. Note centering, corners, edges, and surface (scratches, creases, print lines). No slab is physically cracked or claimed graded.
3. **Duplicate Verification:** For items with repeated source IDs (slots 4-10), verify whether multiple physical copies exist, or if the source file contains data duplication. Mark duplicate disposition (`KEEP_AS_MULTIPLE`, `MERGE_SINGLE_ROW`, or `REJECT_DATA_ERROR`).
4. **Photography:** Capture high-resolution front and back photos against a neutral dark background for approved saleable cards.
5. **Saleable Decision:** Assign final disposition: `APPROVED_SALEABLE`, `HOLD_CONDITION`, `HOLD_OWNERSHIP`, or `REJECT`.

---

## 2. 50-Card Inspection Register

| Slot | Record ID | Card Name & Number | Category | Source ID | Role / Note | Physical [Y/N] | Actual Count | Actual Condition | Photo [Y/N] | Saleable Decision |
|:---:|---|---|---|:---:|---|:---:|:---:|---|:---:|---|
"""

    for idx, (r, m, role) in enumerate(selected, start=1):
        ask = f" (${m['suggested_start_ask_usd']})" if m.get('suggested_start_ask_usd') else ''
        md_content += f"| {idx:02d} | `{r['id']}` | **{r['name']}** | {m.get('category')} | `{m.get('sourceCatalogId')}` | {role}{ask} | [ ] | ____ | ________________ | [ ] | [ ] |\n"

    md_content += """
---

## 3. Sample Breakdown Summary

- **Vintage Pilot Singles (Slots 1-3):** 3 cards (Joe Montana #156, Bert Blyleven #515, Rod Carew #300) with researched raw sold comps ($3.49, $3.99, $2.99).
- **Vintage Duplicate Test (Slots 4-6):** 3 repeated entries for Reggie Jackson #700 (1979 Topps, Source ID `1879574`) to physically verify single vs. multiple copies.
- **Cross-Sport Duplicate Tests (Slots 7-10):** 4 cards (Joe Montana 1989 Pro Set #381 pair; Reggie Jackson 2024 Panini Prizm Red Ice #162 pair).
- **Modern & Era Cross-Section (Slots 11-50):** 40 cards across 10 top categories:
  - Basketball 2024 Panini Prizm: 5 cards
  - Basketball 2024 Panini Mosaic: 5 cards
  - Basketball 2024 Panini Donruss: 4 cards
  - Hockey 2024 Upper Deck: 4 cards
  - Football 2024 Panini Contenders: 4 cards
  - Football 2024 Topps Resurgence: 4 cards
  - Soccer 2024 Topps Chrome UEFA: 4 cards
  - Baseball 2025 Topps Chrome: 4 cards
  - UFC 2025 Topps Chrome UFC: 3 cards
  - Gaming / One Piece Legacy of the Master: 3 cards

---

## 4. Execution Sign-Off

- **Inspector Name:** __________________________________
- **Date Completed:** __________________________________
- **Total Physical Cards Confirmed:** _____ / 50
- **Total Duplicate Groups Resolved:** _____ / 3
- **Total Saleable Cards Approved:** _____
- **Owner Signature:** __________________________________
"""

    with open(MD_OUT, mode='w', encoding='utf-8') as f:
        f.write(md_content)

    print(f'Wrote Markdown worksheet to {MD_OUT}.')

if __name__ == '__main__':
    main()
