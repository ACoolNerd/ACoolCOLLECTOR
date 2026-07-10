from __future__ import annotations

import csv
import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class FeeModel:
    marketplace_rate: float
    payment_rate: float
    payment_fixed_cents: int
    shipping_cents: int
    insurance_cents: int
    reserve_rate: float

    @classmethod
    def from_env(cls) -> "FeeModel":
        return cls(
            marketplace_rate=float(os.environ.get("DEFAULT_MARKETPLACE_FEE_RATE", "0.13")),
            payment_rate=float(os.environ.get("DEFAULT_PAYMENT_FEE_RATE", "0.029")),
            payment_fixed_cents=int(os.environ.get("DEFAULT_PAYMENT_FIXED_FEE_CENTS", "30")),
            shipping_cents=int(os.environ.get("DEFAULT_SHIPPING_CENTS", "500")),
            insurance_cents=int(os.environ.get("DEFAULT_INSURANCE_CENTS", "0")),
            reserve_rate=float(os.environ.get("DEFAULT_RESERVE_RATE", "0.05")),
        )


def cents(value: Any) -> int | None:
    if value in (None, ""):
        return None
    return int(value)


def determine_reference_value(item: dict[str, Any]) -> tuple[str, int | None]:
    # This is a scenario selector, not a statement of the physical card's actual grade.
    for key, label in (
        ("psa_10_cents", "PSA 10 scenario"),
        ("grade_95_cents", "Grade 9.5 scenario"),
        ("grade_9_cents", "Grade 9 scenario"),
        ("ungraded_cents", "Ungraded scenario"),
    ):
        value = cents(item.get(key))
        if value and value > 0:
            return label, value
    return "No guide scenario", None


def calculate_net(list_price_cents: int, fee: FeeModel) -> dict[str, int]:
    marketplace_fee = round(list_price_cents * fee.marketplace_rate)
    payment_fee = round(list_price_cents * fee.payment_rate) + fee.payment_fixed_cents
    reserve = round(list_price_cents * fee.reserve_rate)
    total_cost = marketplace_fee + payment_fee + fee.shipping_cents + fee.insurance_cents + reserve
    return {
        "marketplace_fee_cents": marketplace_fee,
        "payment_fee_cents": payment_fee,
        "shipping_cents": fee.shipping_cents,
        "insurance_cents": fee.insurance_cents,
        "reserve_cents": reserve,
        "estimated_net_proceeds_cents": max(list_price_cents - total_cost, 0),
    }


def build_candidate(item: dict[str, Any], fee: FeeModel) -> dict[str, Any]:
    scenario, guide = determine_reference_value(item)
    list_price = round(guide * 1.08) if guide else None
    floor_price = round(guide * 0.90) if guide else None
    net = calculate_net(list_price, fee) if list_price else {}
    return {
        "acool_asset_id": item.get("acool_asset_id"),
        "provider_product_id": item.get("provider_product_id"),
        "product_name": item.get("product_name"),
        "set_name": item.get("set_name"),
        "reference_scenario": scenario,
        "reference_guide_cents": guide,
        "suggested_list_price_cents": list_price,
        "suggested_floor_price_cents": floor_price,
        **net,
        "sales_volume": item.get("sales_volume"),
        "image_reference": item.get("drive_thumbnail_url"),
        "listing_status": "draft_private_review",
        "owner_approval": False,
        "identity_verified": False,
        "ownership_verified": False,
        "condition_verified": False,
        "pricing_reviewed": False,
        "ruth_review_status": "not_started",
        "public_publish_allowed": False,
        "disclosure": "Current provider guide scenario only. Physical grade, condition, ownership and sale price require verification.",
    }


def main() -> None:
    source = Path(os.environ.get("PRICED_COLLECTION_PATH", "./private/output/collection_current_guide.json"))
    output = Path(os.environ.get("LISTING_OUTPUT_DIRECTORY", "./private/output"))
    payload = json.loads(source.read_text(encoding="utf-8"))
    items = payload.get("items", [])
    fee = FeeModel.from_env()
    candidates = [build_candidate(item, fee) for item in items]
    output.mkdir(parents=True, exist_ok=True)

    (output / "listing_candidates.json").write_text(json.dumps({"items": candidates}, indent=2), encoding="utf-8")
    headers = list(candidates[0].keys()) if candidates else []
    with (output / "listing_candidates.csv").open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers)
        writer.writeheader()
        writer.writerows(candidates)

    total_guide = sum(item.get("reference_guide_cents") or 0 for item in candidates)
    total_list = sum(item.get("suggested_list_price_cents") or 0 for item in candidates)
    total_net = sum(item.get("estimated_net_proceeds_cents") or 0 for item in candidates)
    summary = {
        "item_count": len(candidates),
        "items_with_guide": sum(1 for item in candidates if item.get("reference_guide_cents")),
        "total_reference_guide_cents": total_guide,
        "total_suggested_list_cents": total_list,
        "total_estimated_net_proceeds_cents": total_net,
        "warning": "Scenario analysis only. No item is approved or public for sale.",
    }
    (output / "earnings_scenario.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
