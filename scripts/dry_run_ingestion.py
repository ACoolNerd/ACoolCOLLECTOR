#!/usr/bin/env python3
"""
ACoolCOLLECTOR — 7-Field Inventory Dry-Run Ingestion Tool
Conforms to AGENTS.md 7-Field Schema Law:
  id, entity, type, name, status, owner, updatedAt, metadata?
"""

import json
import os
import sys
from datetime import datetime
from collections import Counter

JSON_PATH = os.path.join(
    os.path.dirname(__file__),
    "../data/processed/ACoolINVENTORY_Master_7Field.json"
)

REQUIRED_FIELDS = ["id", "entity", "type", "name", "status", "owner", "updatedAt"]

def validate_iso_date(date_str: str) -> bool:
    if not isinstance(date_str, str):
        return False
    try:
        # Handles 2025-10-02T00:00:00Z or similar
        datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        return True
    except Exception:
        return False

def dry_run_validate(json_file_path: str):
    if not os.path.exists(json_file_path):
        print(f"ERROR: Inventory file not found: {json_file_path}")
        sys.exit(1)

    print(f"Reading inventory data from: {json_file_path} ...")
    with open(json_file_path, "r", encoding="utf-8") as f:
        records = json.load(f)

    total_records = len(records)
    print(f"Total records loaded: {total_records}")

    seen_ids = set()
    duplicate_ids = set()
    valid_records = []
    invalid_records = []
    skipped_records = []

    entity_counter = Counter()
    type_counter = Counter()
    status_counter = Counter()

    for idx, item in enumerate(records):
        if not isinstance(item, dict):
            invalid_records.append({
                "index": idx,
                "reason": "Record is not a dictionary"
            })
            continue

        item_id = item.get("id")
        if not item_id or not isinstance(item_id, str):
            invalid_records.append({
                "index": idx,
                "reason": "Missing or non-string 'id'"
            })
            continue

        # Duplicate check
        if item_id in seen_ids:
            duplicate_ids.add(item_id)
            skipped_records.append({
                "id": item_id,
                "index": idx,
                "reason": f"Duplicate ID: {item_id}"
            })
            continue
        seen_ids.add(item_id)

        # Check required 7-fields
        missing = [k for k in REQUIRED_FIELDS if k not in item or item[k] is None or item[k] == ""]
        if missing:
            invalid_records.append({
                "id": item_id,
                "index": idx,
                "reason": f"Missing required 7-field(s): {', '.join(missing)}"
            })
            continue

        # Check updatedAt format
        if not validate_iso_date(item["updatedAt"]):
            invalid_records.append({
                "id": item_id,
                "index": idx,
                "reason": f"Invalid ISO 8601 date format for updatedAt: {item.get('updatedAt')}"
            })
            continue

        # Counters
        entity_counter[item.get("entity", "UNKNOWN")] += 1
        type_counter[item.get("type", "UNKNOWN")] += 1
        status_counter[item.get("status", "UNKNOWN")] += 1

        valid_records.append(item)

    print("\n" + "=" * 60)
    print(" DRY-RUN VALIDATION REPORT ")
    print("=" * 60)
    print(f" Total Records:     {total_records}")
    print(f" Valid Records:     {len(valid_records)} ({len(valid_records)/total_records*100:.2f}%)")
    print(f" Invalid Records:   {len(invalid_records)}")
    print(f" Duplicate Records: {len(duplicate_ids)}")
    print(f" Skipped Records:   {len(skipped_records)}")
    print("-" * 60)
    print("Breakdown by Entity:")
    for ent, count in entity_counter.most_common():
        print(f"  - {ent}: {count}")
    print("Breakdown by Type:")
    for t, count in type_counter.most_common():
        print(f"  - {t}: {count}")
    print("Breakdown by Status:")
    for s, count in status_counter.most_common():
        print(f"  - {s}: {count}")
    print("-" * 60)

    if invalid_records:
        print("\nFirst 5 Invalid Records:")
        for inv in invalid_records[:5]:
            print(f"  Index {inv.get('index')}: {inv.get('reason')}")

    # Simulated Batch Plan
    batch_size = 500
    num_batches = (len(valid_records) + batch_size - 1) // batch_size
    print(f"\nSimulated Idempotent Upsert Plan:")
    print(f"  Target Table:   \"Item\" (id, categoryId, name, attributes JSONB)")
    print(f"  Batch Size:     {batch_size} records / batch")
    print(f"  Total Batches:  {num_batches} batches")
    print(f"  Upsert Clause:  ON CONFLICT (\"id\") DO UPDATE SET ...")
    print(f"  Status:         DRY-RUN ONLY (No live database changes committed)")
    print("=" * 60)

    return {
        "total": total_records,
        "valid": len(valid_records),
        "invalid": len(invalid_records),
        "duplicate": len(duplicate_ids),
        "skipped": len(skipped_records),
        "batches": num_batches
    }

if __name__ == "__main__":
    dry_run_validate(JSON_PATH)
