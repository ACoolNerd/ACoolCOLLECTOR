#!/usr/bin/env python3
"""
ACoolCOLLECTOR No-Grade Card Sale Catalog Generator
Conforms strictly to:
- MP-00: ACool Global Governance Master Prompt (Seven-Field Schema Law)
- SK-05: ACoolCOLLECTOR Schema Validator Skill
- ACoolCOLLECTOR No-Grade Sale Lots and Packing Manifest (2026-10-06)
- ACool Master Project Evidence and Implementation Handoff (2026-10-06)

GOVERNANCE RULES:
1. Seven-Field Universal Envelope: id, entity, type, name, status, owner, updatedAt, metadata
2. Entity Firewall: "ACool Ecosystem"
3. Owner Isolation: "OWNER-PRIVATE-REVIEW" (protects personal owner privacy in public-facing exports)
4. Buyer No-Grade Policy: public_grade_fields_removed = True. grading, gradingCompany, gradingCertId omitted.
5. Duplicate Hold Rule: duplicate catalog ID groups (319 groups, 412 excess rows) held in HOLD_DUPLICATE_ID_REVIEW.
6. Research Comp Rule: provisional asks applied ONLY to researched pilot singletons (Joe Montana, Bert Blyleven, Rod Carew).
"""

import csv
import json
import os
import sys
from collections import Counter

JSON_INPUT_PATH = "/Users/acoolnerd/ACool/repos/ACoolCOLLECTOR/data/processed/ACoolINVENTORY_Master_7Field.json"
CSV_OUTPUT_PATH = "/Users/acoolnerd/ACool/reports/ACoolCOLLECTOR_NoGrade_Card_Sale_Catalog_2026-10-06.csv"

def get_lot_code(category: str) -> str:
    cat_lower = category.lower()
    if "baseball" in cat_lower:
        return "BASEBALL_SET_BUILD"
    elif "basketball" in cat_lower:
        return "BASKETBALL_SET_BUILD"
    elif "football" in cat_lower:
        return "FOOTBALL_SET_BUILD"
    elif "hockey" in cat_lower:
        return "HOCKEY_SET_BUILD"
    elif "soccer" in cat_lower:
        return "SOCCER_SET_BUILD"
    elif "racing" in cat_lower or "nascar" in cat_lower:
        return "RACING_SET_BUILD"
    elif "ufc" in cat_lower:
        return "UFC_SET_BUILD"
    elif "one piece" in cat_lower:
        return "ONE_PIECE_SET_BUILD"
    elif "pokemon" in cat_lower:
        return "POKEMON_SET_BUILD"
    else:
        return "CATEGORY_REVIEW"

def generate_catalog():
    print(f"[*] Reading source JSON: {JSON_INPUT_PATH}")
    if not os.path.exists(JSON_INPUT_PATH):
        print(f"[!] Error: File not found: {JSON_INPUT_PATH}")
        sys.exit(1)

    with open(JSON_INPUT_PATH, mode="r", encoding="utf-8") as f:
        source_data = json.load(f)

    total_records = len(source_data)
    print(f"[*] Total records loaded: {total_records}")

    id_counts = Counter(r["metadata"]["sourceCatalogId"] for r in source_data)
    duplicate_groups = sum(1 for c in id_counts.values() if c > 1)
    duplicate_excess_rows = sum(c - 1 for c in id_counts.values() if c > 1)
    print(f"[*] Duplicate groups: {duplicate_groups}, duplicate excess rows: {duplicate_excess_rows}")

    os.makedirs(os.path.dirname(CSV_OUTPUT_PATH), exist_ok=True)

    with open(CSV_OUTPUT_PATH, mode="w", encoding="utf-8", newline="\n") as f_out:
        writer = csv.writer(f_out)
        # Header
        writer.writerow(["id", "entity", "type", "name", "status", "owner", "updatedAt", "metadata"])

        held_duplicates = 0
        singleton_pilot_priced = 0
        singleton_comp_needed = 0

        for r in source_data:
            sid = r["metadata"]["sourceCatalogId"]
            cat = r["metadata"]["category"]
            is_dup = id_counts[sid] > 1

            lot_code = get_lot_code(cat)

            if is_dup:
                held_duplicates += 1
                sale_state = "DUPLICATE_ID_REVIEW"
                listing_state = "HOLD_DUPLICATE_ID_REVIEW"
                comp_note = "DUPLICATE_ID_HOLD; comp only useful after owner confirms the physical copy/quantity"
                ask = ""
                low = ""
                high = ""
                comp_date = ""
            else:
                sale_state = "PHYSICAL_IDENTITY_AND_CONDITION_REVIEW"
                listing_state = "DRAFT_NOT_PUBLISHED"
                if sid == "631426":  # Joe Montana #156
                    singleton_pilot_priced += 1
                    ask = "3.49"
                    low = "1.00"
                    high = "6.99"
                    comp_note = "Recent raw sales $1.00–$6.99; guide ~$3.00. Provisional raw ask."
                    comp_date = "2026-10-06"
                elif sid == "1864143":  # Bert Blyleven #515
                    singleton_pilot_priced += 1
                    ask = "3.99"
                    low = "2.99"
                    high = "7.88"
                    comp_note = "Recent raw sales $2.99–$7.88. Condition-dependent vintage raw ask."
                    comp_date = "2026-10-06"
                elif sid == "1879172":  # Rod Carew #300
                    singleton_pilot_priced += 1
                    ask = "2.99"
                    low = "2.27"
                    high = "4.00"
                    comp_note = "Recent raw sales $2.27–$4.00. Star vintage candidate raw ask."
                    comp_date = "2026-10-06"
                else:
                    singleton_comp_needed += 1
                    ask = ""
                    low = ""
                    high = ""
                    comp_note = "NEEDS_EXACT_MATCHED_SOLD_COMPS"
                    comp_date = ""

            meta = {
                "sourceCatalogId": sid,
                "category": cat,
                "quantity_source": r["metadata"].get("quantity", 1),
                "raw_condition_source": r["metadata"].get("condition", "Normal wear"),
                "lot_code_candidate": lot_code,
                "sale_review_state": sale_state,
                "chase_status": "NOT_ASSESSED",
                "suggested_start_ask_usd": ask,
                "observed_sold_low_usd": low,
                "observed_sold_high_usd": high,
                "comp_source_note": comp_note,
                "comp_url": "",
                "comp_checked_date": comp_date,
                "packing_tier": "ASSIGN_AFTER_PHYSICAL_SORT",
                "public_grade_fields_removed": True,
                "listing_state": listing_state,
            }

            writer.writerow([
                r["id"],
                r["entity"],
                r["type"],
                r["name"],
                r["status"],
                "OWNER-PRIVATE-REVIEW",
                r["updatedAt"],
                json.dumps(meta, separators=(",", ":")),
            ])

    print(f"[+] Successfully wrote {total_records} rows to: {CSV_OUTPUT_PATH}")
    print(f"    - Held Duplicate Rows: {held_duplicates} (across {duplicate_groups} ID groups)")
    print(f"    - Singleton Pilot Cards with Provisional Asks: {singleton_pilot_priced}")
    print(f"    - Singleton Cards Pending Exact Comps: {singleton_comp_needed}")
    print(f"    - Output File Size: {os.path.getsize(CSV_OUTPUT_PATH):,} bytes")

if __name__ == "__main__":
    generate_catalog()
