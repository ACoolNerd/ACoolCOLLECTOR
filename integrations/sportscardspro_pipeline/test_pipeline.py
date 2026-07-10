import os
import unittest

from build_listing_candidates import FeeModel, build_candidate, calculate_net, determine_reference_value
from sync_collection import normalize_item


class PipelineTests(unittest.TestCase):
    def test_normalize_provider_prices_as_integer_cents(self):
        source = {
            "acool_asset_id": "AC-TEST-0001",
            "provider_product_id": "72584",
            "drive_file_id": "private-file",
            "drive_thumbnail_url": "https://example.invalid/private-image",
        }
        payload = {
            "status": "success",
            "id": "72584",
            "product-name": "Example Card #1",
            "console-name": "Example Set",
            "loose-price": 1000,
            "manual-only-price": 5000,
            "sales-volume": "12",
        }
        item = normalize_item(source, payload)
        self.assertEqual(item["ungraded_cents"], 1000)
        self.assertEqual(item["psa_10_cents"], 5000)
        self.assertEqual(item["commerce_status"], "not_for_sale")
        self.assertFalse(item["approved"])

    def test_reference_value_is_explicit_scenario(self):
        scenario, value = determine_reference_value({"psa_10_cents": 5000, "ungraded_cents": 1000})
        self.assertEqual(scenario, "PSA 10 scenario")
        self.assertEqual(value, 5000)

    def test_net_proceeds_subtract_all_configured_costs(self):
        fee = FeeModel(
            marketplace_rate=0.10,
            payment_rate=0.03,
            payment_fixed_cents=30,
            shipping_cents=500,
            insurance_cents=100,
            reserve_rate=0.05,
        )
        result = calculate_net(10000, fee)
        self.assertEqual(result["marketplace_fee_cents"], 1000)
        self.assertEqual(result["payment_fee_cents"], 330)
        self.assertEqual(result["reserve_cents"], 500)
        self.assertEqual(result["estimated_net_proceeds_cents"], 7570)

    def test_listing_candidate_is_private_and_unapproved(self):
        fee = FeeModel(0.13, 0.029, 30, 500, 0, 0.05)
        candidate = build_candidate(
            {
                "acool_asset_id": "AC-TEST-0001",
                "provider_product_id": "72584",
                "product_name": "Example Card",
                "set_name": "Example Set",
                "ungraded_cents": 1000,
            },
            fee,
        )
        self.assertEqual(candidate["listing_status"], "draft_private_review")
        self.assertFalse(candidate["public_publish_allowed"])
        self.assertFalse(candidate["owner_approval"])


if __name__ == "__main__":
    unittest.main()
