"""
Dry-run ingestion tool for ACoolINVENTORY_Master_7Field.json.
Validates records against 7-Field Schema Law.
Reports valid / invalid / skipped / duplicate counts.
Does NOT write to the database unless --execute flag is passed.
Full import requires explicit approval from Keith Z. C. McPherson.
"""
import json
import sys
import argparse
from pathlib import Path
from datetime import datetime

REQUIRED_FIELDS = {"id", "entity", "type", "name", "status", "owner", "updatedAt"}
INVENTORY_PATH = Path(__file__).parent.parent / "data" / "processed" / "ACoolINVENTORY_Master_7Field.json"


def validate_record(record: dict, seen_ids: set) -> tuple[bool, list[str]]:
    errors = []

    missing = REQUIRED_FIELDS - set(record.keys())
    if missing:
        errors.append(f"missing fields: {sorted(missing)}")

    record_id = record.get("id")
    if not record_id:
        errors.append("id is empty")
    elif record_id in seen_ids:
        errors.append(f"duplicate id: {record_id}")

    for field in ("id", "entity", "type", "name", "status", "owner", "updatedAt"):
        val = record.get(field)
        if val is not None and not isinstance(val, str):
            errors.append(f"{field} must be a string, got {type(val).__name__}")

    return (len(errors) == 0), errors


def run_dry_run(batch_size: int = 100):
    if not INVENTORY_PATH.exists():
        print(f"ERROR: inventory not found at {INVENTORY_PATH}")
        sys.exit(1)

    print(f"Loading inventory from {INVENTORY_PATH}")
    with open(INVENTORY_PATH, "r") as f:
        records = json.load(f)

    if not isinstance(records, list):
        print("ERROR: inventory root must be a JSON array")
        sys.exit(1)

    total = len(records)
    valid = 0
    invalid = 0
    duplicate = 0
    seen_ids: set[str] = set()
    errors_sample: list[dict] = []

    print(f"\nDRY RUN — {total:,} records found. Validating...\n")

    for i, record in enumerate(records):
        is_valid, errs = validate_record(record, seen_ids)

        if not is_valid:
            invalid += 1
            if "duplicate" in " ".join(errs):
                duplicate += 1
            if len(errors_sample) < 10:
                errors_sample.append({"index": i, "id": record.get("id", "MISSING"), "errors": errs})
        else:
            valid += 1
            seen_ids.add(record["id"])

        if (i + 1) % batch_size == 0:
            print(f"  Processed {i+1:,} / {total:,} records...")

    print(f"\n{'='*50}")
    print(f"DRY RUN COMPLETE — {datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')}")
    print(f"{'='*50}")
    print(f"  Total records  : {total:,}")
    print(f"  Valid          : {valid:,}")
    print(f"  Invalid        : {invalid - duplicate:,}")
    print(f"  Duplicates     : {duplicate:,}")
    print(f"  Ready to import: {valid:,}")
    print(f"{'='*50}")

    if errors_sample:
        print(f"\nFirst {len(errors_sample)} invalid record samples:")
        for e in errors_sample:
            print(f"  [{e['index']}] id={e['id']} → {', '.join(e['errors'])}")

    print("\nFull import BLOCKED — run with --execute after explicit approval.")
    return valid, invalid, duplicate


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ACoolINVENTORY dry-run ingestion validator")
    parser.add_argument("--execute", action="store_true", help="BLOCKED: requires explicit approval")
    parser.add_argument("--batch-size", type=int, default=100)
    args = parser.parse_args()

    if args.execute:
        print("ERROR: --execute requires explicit approval from Keith Z. C. McPherson.")
        print("       Contact ACoolCOMMANDER to unlock the approval gate.")
        sys.exit(1)

    run_dry_run(batch_size=args.batch_size)
