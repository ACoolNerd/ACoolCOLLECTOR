#!/usr/bin/env python3
"""Refresh SportsCardsPro guide fields for a bounded inventory slice.

Safe defaults:
- reads token from environment only
- never writes back to SportsCardsPro
- caps the number of API requests unless the operator raises --max-items
- writes a new CSV instead of mutating the source file

SportsCardsPro/PriceCharting price data is an internal guide input. Premium public
pricing still requires exact-version/condition proof and completed-sale evidence.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

DEFAULT_BASE_URL = "https://www.pricecharting.com"


def fetch_product(base_url: str, token: str, product_id: str, timeout: int = 20) -> dict:
    params = urllib.parse.urlencode({"t": token, "id": product_id})
    url = f"{base_url.rstrip('/')}/api/product?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": "ACoolCOLLECTOR/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def pennies_to_usd(value: object) -> str:
    try:
        return f"{int(value) / 100:.2f}"
    except (TypeError, ValueError):
        return ""


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input_csv", type=Path)
    parser.add_argument("output_csv", type=Path)
    parser.add_argument("--max-items", type=int, default=100,
                        help="Maximum rows to refresh in this run; default 100")
    parser.add_argument("--delay", type=float,
                        default=float(os.getenv("SPORTSCARDSPRO_REQUEST_DELAY_SECONDS", "1.0")),
                        help="Operator-configured delay between requests; not an official rate-limit claim")
    args = parser.parse_args()

    token = os.getenv("SPORTSCARDSPRO_API_KEY") or os.getenv("SPORTSCARDSPRO_TOKEN")
    if not token:
        raise SystemExit("Set SPORTSCARDSPRO_API_KEY in your local environment; do not commit it.")

    base_url = os.getenv("SPORTSCARDSPRO_BASE_URL", DEFAULT_BASE_URL)
    refreshed_at = datetime.now(timezone.utc).isoformat()

    with args.input_csv.open(newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
        original_fields = list(f.fieldnames or [])

    extra_fields = [
        "scp-refresh-status", "scp-refreshed-at", "scp-loose-price", "scp-loose-usd",
        "scp-graded-price", "scp-psa10-price", "scp-bgs10-price", "scp-sales-volume",
        "scp-review-reason"
    ]
    fields = original_fields + [x for x in extra_fields if x not in original_fields]

    refreshed = 0
    for row in rows:
        product_id = (row.get("id") or "").strip()
        if refreshed >= args.max_items:
            row["scp-refresh-status"] = "NOT_REFRESHED_LIMIT"
            continue
        if not product_id:
            row["scp-refresh-status"] = "REVIEW"
            row["scp-review-reason"] = "Missing SportsCardsPro product id"
            continue
        try:
            payload = fetch_product(base_url, token, product_id)
            if payload.get("status") != "success":
                row["scp-refresh-status"] = "REVIEW"
                row["scp-review-reason"] = str(payload.get("error") or payload.get("status") or "API response not success")
            else:
                row["scp-refresh-status"] = "REFRESHED"
                row["scp-refreshed-at"] = refreshed_at
                row["scp-loose-price"] = payload.get("loose-price", "")
                row["scp-loose-usd"] = pennies_to_usd(payload.get("loose-price"))
                row["scp-graded-price"] = payload.get("graded-price", "")
                row["scp-psa10-price"] = payload.get("manual-only-price", "")
                row["scp-bgs10-price"] = payload.get("bgs-10-price", "")
                row["scp-sales-volume"] = payload.get("sales-volume", "")
                refreshed += 1
        except Exception as exc:  # keep row and make the failure reviewable
            row["scp-refresh-status"] = "ERROR"
            row["scp-review-reason"] = f"{type(exc).__name__}: {exc}"
        if args.delay > 0:
            time.sleep(args.delay)

    args.output_csv.parent.mkdir(parents=True, exist_ok=True)
    with args.output_csv.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)

    print(f"Refreshed {refreshed} items; wrote {args.output_csv}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
