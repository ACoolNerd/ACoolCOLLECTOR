from __future__ import annotations

import json
import os
from pathlib import Path
from urllib.request import Request, urlopen


def main() -> None:
    manifest_path = Path(os.environ.get("SOURCE_MANIFEST_PATH", "./private/ACoolCOLLECTION_100_Item_Drive_Manifest.json"))
    output_directory = Path(os.environ.get("PRIVATE_IMAGE_DIRECTORY", "./private/images"))
    output_directory.mkdir(parents=True, exist_ok=True)

    payload = json.loads(manifest_path.read_text(encoding="utf-8"))
    items = payload.get("items", [])
    if not items:
        raise RuntimeError("Source manifest contains no image records")

    failures: list[dict[str, str]] = []
    for index, item in enumerate(items, start=1):
        asset_id = item["acool_asset_id"]
        product_id = item["provider_product_id"]
        source_url = item.get("drive_thumbnail_url")
        if not source_url:
            failures.append({"acool_asset_id": asset_id, "error": "missing drive_thumbnail_url"})
            continue

        destination = output_directory / f"{asset_id}__product_{product_id}.jpg"
        if destination.exists() and destination.stat().st_size > 0:
            print(f"Skipped existing {index}/{len(items)}: {destination.name}")
            continue

        try:
            request = Request(source_url, headers={"User-Agent": "ACoolCOLLECTOR/1.0"})
            with urlopen(request, timeout=45) as response:
                body = response.read()
                content_type = response.headers.get("Content-Type", "")
            if not body or not content_type.startswith("image/"):
                raise RuntimeError(f"unexpected response content type: {content_type}")
            destination.write_bytes(body)
            print(f"Downloaded {index}/{len(items)}: {destination.name}")
        except Exception as exc:  # Capture per-file failures without exposing private URLs.
            failures.append({"acool_asset_id": asset_id, "error": str(exc)})

    report = {
        "requested": len(items),
        "downloaded_or_existing": len(items) - len(failures),
        "failed": len(failures),
        "failures": failures,
        "security_note": "Images remain under the gitignored private directory and must not be committed.",
    }
    (output_directory.parent / "image_ingestion_report.json").write_text(
        json.dumps(report, indent=2), encoding="utf-8"
    )
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
