from __future__ import annotations

import csv
import json
import os
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen

PRICE_FIELDS = {
    "loose-price": "ungraded_cents",
    "cib-price": "grade_7_75_cents",
    "new-price": "grade_8_85_cents",
    "graded-price": "grade_9_cents",
    "box-only-price": "grade_95_cents",
    "manual-only-price": "psa_10_cents",
    "bgs-10-price": "bgs_10_cents",
    "condition-17-price": "cgc_10_cents",
    "condition-18-price": "sgc_10_cents",
}


@dataclass(frozen=True)
class Settings:
    token: str
    base_url: str
    manifest_path: Path
    output_directory: Path
    delay_seconds: float
    cache_hours: int

    @classmethod
    def from_env(cls) -> "Settings":
        token = os.environ.get("SPORTSCARDSPRO_API_TOKEN", "").strip()
        if not token:
            raise RuntimeError("SPORTSCARDSPRO_API_TOKEN is required and must be supplied as a server-side secret")
        return cls(
            token=token,
            base_url=os.environ.get("SPORTSCARDSPRO_BASE_URL", "https://www.sportscardspro.com").rstrip("/"),
            manifest_path=Path(os.environ.get("SOURCE_MANIFEST_PATH", "./private/ACoolCOLLECTION_100_Item_Drive_Manifest.json")),
            output_directory=Path(os.environ.get("OUTPUT_DIRECTORY", "./private/output")),
            delay_seconds=max(float(os.environ.get("SYNC_DELAY_SECONDS", "1.1")), 1.0),
            cache_hours=max(int(os.environ.get("CACHE_HOURS", "24")), 1),
        )


def request_product(settings: Settings, product_id: str) -> dict[str, Any]:
    query = urlencode({"t": settings.token, "id": product_id})
    request = Request(
        f"{settings.base_url}/api/product?{query}",
        headers={"Accept": "application/json", "User-Agent": "ACoolCOLLECTOR/1.0"},
    )
    with urlopen(request, timeout=30) as response:
        payload = json.loads(response.read().decode("utf-8"))
    if payload.get("status") != "success":
        raise RuntimeError(payload.get("error-message", f"Provider request failed for {product_id}"))
    return payload


def normalize_item(source: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any]:
    record: dict[str, Any] = {
        "acool_asset_id": source["acool_asset_id"],
        "provider": "sportscardspro",
        "provider_product_id": str(payload.get("id") or source["provider_product_id"]),
        "product_name": payload.get("product-name"),
        "set_name": payload.get("console-name"),
        "genre": payload.get("genre"),
        "release_date": payload.get("release-date"),
        "sales_volume": payload.get("sales-volume"),
        "drive_file_id": source.get("drive_file_id"),
        "drive_thumbnail_url": source.get("drive_thumbnail_url"),
        "collection_status": "private_collection",
        "commerce_status": "not_for_sale",
        "approved": False,
        "pricing_status": "synced_current_guide",
        "provider_synced_at": datetime.now(timezone.utc).isoformat(),
    }
    for provider_key, internal_key in PRICE_FIELDS.items():
        value = payload.get(provider_key)
        record[internal_key] = int(value) if value not in (None, "") else None
    for key in (
        "retail-loose-buy", "retail-loose-sell", "retail-cib-buy", "retail-cib-sell",
        "retail-new-buy", "retail-new-sell",
    ):
        value = payload.get(key)
        record[key.replace("-", "_") + "_cents"] = int(value) if value not in (None, "") else None
    record["raw_provider_payload"] = payload
    return record


def write_outputs(output_directory: Path, records: list[dict[str, Any]]) -> None:
    output_directory.mkdir(parents=True, exist_ok=True)
    json_path = output_directory / "collection_current_guide.json"
    json_path.write_text(json.dumps({"items": records}, indent=2), encoding="utf-8")

    flat_records = [{k: v for k, v in item.items() if k != "raw_provider_payload"} for item in records]
    csv_path = output_directory / "collection_current_guide.csv"
    headers = sorted({key for item in flat_records for key in item})
    with csv_path.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers)
        writer.writeheader()
        writer.writerows(flat_records)


def main() -> None:
    settings = Settings.from_env()
    manifest = json.loads(settings.manifest_path.read_text(encoding="utf-8"))
    items = manifest.get("items", [])
    if not items:
        raise RuntimeError("The source manifest contains no items")

    records: list[dict[str, Any]] = []
    for index, source in enumerate(items, start=1):
        product_id = str(source.get("provider_product_id", "")).strip()
        if not product_id.isdigit():
            raise RuntimeError(f"Invalid provider product ID for {source.get('acool_asset_id')}")
        payload = request_product(settings, product_id)
        records.append(normalize_item(source, payload))
        print(f"Synced {index}/{len(items)}: {source['acool_asset_id']} -> {product_id}")
        if index < len(items):
            time.sleep(settings.delay_seconds)

    write_outputs(settings.output_directory, records)
    print(f"Wrote {len(records)} private records to {settings.output_directory}")


if __name__ == "__main__":
    main()
