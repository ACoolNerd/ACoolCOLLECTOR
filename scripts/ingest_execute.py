#!/usr/bin/env python3
"""
ACoolCOLLECTOR — Production Batch Ingestion Engine
Authorized by Keith Z. C. McPherson (2026-10-12)
Executes idempotent batch upserts of 7-field assets into PostgreSQL.
"""

import json
import os
import sys
import time
from pathlib import Path
from sqlalchemy import create_engine, text

REQUIRED_FIELDS = {"id", "entity", "type", "name", "status", "owner", "updatedAt"}
INVENTORY_PATH = Path(__file__).parent.parent / "data" / "processed" / "ACoolINVENTORY_Master_7Field.json"

# Connect either via container network (db:5432) or host (localhost:5432)
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    POSTGRES_USER = os.environ.get("POSTGRES_USER", "acool_admin")
    POSTGRES_PASSWORD = os.environ.get("POSTGRES_PASSWORD", "whV5hwz4R2B1RgkbCIJnR3UoKVxzEy1K")
    POSTGRES_DB = os.environ.get("POSTGRES_DB", "acool_paas")
    DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@localhost:5432/{POSTGRES_DB}"

def execute_ingestion(batch_size: int = 250):
    if not INVENTORY_PATH.exists():
        print(f"ERROR: Inventory not found at {INVENTORY_PATH}")
        sys.exit(1)

    print(f"Connecting to database...")
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        before_count = conn.execute(text('SELECT count(*) FROM "Item";')).scalar()
        print(f"Initial record count in \"Item\": {before_count}")

    print(f"Loading inventory from {INVENTORY_PATH} ...")
    with open(INVENTORY_PATH, "r", encoding="utf-8") as f:
        records = json.load(f)

    seen_ids = set()
    valid_items = []
    skipped_duplicates = 0

    for idx, item in enumerate(records):
        item_id = item.get("id")
        if not item_id or item_id in seen_ids:
            skipped_duplicates += 1
            continue
        
        # Verify 7 fields
        if not REQUIRED_FIELDS.issubset(item.keys()):
            continue

        seen_ids.add(item_id)
        
        category_id = item.get("metadata", {}).get("category", "General")
        name = item.get("name", "Unnamed Asset")
        attributes_payload = {
            "entity": item.get("entity"),
            "type": item.get("type"),
            "status": item.get("status"),
            "owner": item.get("owner"),
            "updatedAt": item.get("updatedAt"),
            "metadata": item.get("metadata", {})
        }
        
        valid_items.append({
            "id": item_id,
            "categoryId": str(category_id),
            "name": str(name),
            "attributes": json.dumps(attributes_payload)
        })

    total_valid = len(valid_items)
    print(f"Validated {total_valid:,} unique records. Skipped {skipped_duplicates} duplicates.")
    print(f"Starting batch insertion (Batch Size: {batch_size}) ...")

    start_time = time.time()
    inserted_count = 0

    upsert_sql = text("""
        INSERT INTO "Item" ("id", "categoryId", "name", "attributes")
        VALUES (:id, :categoryId, :name, CAST(:attributes AS JSONB))
        ON CONFLICT ("id") DO UPDATE SET
            "categoryId" = EXCLUDED."categoryId",
            "name" = EXCLUDED."name",
            "attributes" = EXCLUDED."attributes";
    """)

    with engine.begin() as conn:
        for i in range(0, total_valid, batch_size):
            batch = valid_items[i:i + batch_size]
            conn.execute(upsert_sql, batch)
            inserted_count += len(batch)
            print(f"  Processed batch {i // batch_size + 1}: {inserted_count:,} / {total_valid:,} records")

    elapsed = time.time() - start_time
    print(f"\nIngestion complete in {elapsed:.2f} seconds ({inserted_count / elapsed:.1f} records/sec)")

    with engine.connect() as conn:
        after_count = conn.execute(text('SELECT count(*) FROM "Item";')).scalar()
        print(f"Final record count in \"Item\": {after_count} (Delta: +{after_count - before_count})")

if __name__ == "__main__":
    execute_ingestion()
