"""Scientific coverage checks for the bundled full-network recorded example.

No model execution, source-directory dependency, sockets or VISTA access.
"""
import csv
import datetime as dt
import hashlib
import json
import math
from pathlib import Path
import unittest


PUBLIC = Path(__file__).resolve().parents[1] / "public"
DATA = PUBLIC / "data"
EXPECTED_IDS = {"ELF{:02d}".format(i) for i in range(1, 53)}


def read_json(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


class NetworkDataTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.network = read_json("network.json")
        cls.study = read_json("demo.json")
        cls.geo = read_json("geo.json")

    def test_all_52_ids_match_inventory_study_and_map_anchors(self):
        for dataset in (self.network, self.study, self.geo):
            sites = dataset["sites"]
            self.assertEqual(len(sites), 52)
            self.assertEqual({s["id"] for s in sites}, EXPECTED_IDS)
        self.assertEqual(self.network["siteCount"], 52)
        features = {f["properties"]["id"] for f in self.geo["features"]}
        self.assertEqual(len(features), 43)
        for site in self.network["sites"]:
            self.assertIn(site["regionId"], features)
            self.assertTrue(site["name"].strip())
            self.assertTrue(math.isfinite(site["lat"]))
            self.assertTrue(math.isfinite(site["lon"]))
            self.assertEqual(site["locationType"], "forcing-region centroid")

    def test_source_inventory_matches_ids_and_preserves_units_and_missing_counts(self):
        self.assertEqual(self.network["sourceFiles"], 52)
        for site in self.network["sites"]:
            self.assertEqual(site["sourceFile"], site["id"] + "_6hr.out")
            self.assertRegex(site["sourceSha256"], r"^[0-9a-f]{64}$")
            self.assertEqual(site["sourceUnits"], "CFS")
            self.assertEqual(site["sourceIntervalHours"], 6)
            self.assertEqual(site["sourceMissingValue"], -999)
            self.assertGreater(site["sourceRecords"], 0)
            self.assertGreaterEqual(site["sourceMissingRecords"], 0)
            self.assertLessEqual(site["sourceMissingRecords"], site["sourceRecords"])
            self.assertNotIn("/", site["sourceFile"])

    def test_calendar_rows_preserve_all_26_week_positions(self):
        expected = [dt.date(2010, 1, 4) + dt.timedelta(weeks=i) for i in range(26)]
        for site in self.study["sites"]:
            self.assertEqual([r["date"] for r in site["series"]], [d.isoformat() for d in expected])
            for date, row in zip(expected, site["series"]):
                self.assertEqual(row["end"], (date + dt.timedelta(days=6)).isoformat())
                # An unavailable saved pair is neither interpolated nor zero-filled.
                self.assertEqual(row["predicted"] is None, row["observed"] is None)
                if row["predicted"] is None:
                    self.assertEqual(row["status"], "no_saved_eligible_prediction")

    def test_coverage_counts_and_nickajack_no_data_are_explicit(self):
        valid_counts = [sum(r["predicted"] is not None for r in s["series"]) for s in self.study["sites"]]
        self.assertEqual(sum(valid_counts), 1233)
        self.assertEqual(sum(n > 0 for n in valid_counts), 51)
        self.assertEqual(sum(26 - n for n in valid_counts), 119)
        self.assertEqual(self.study["coverage"]["eligiblePairs"], 1233)
        self.assertEqual(self.study["coverage"]["missingSiteWeeks"], 119)
        nickajack = next(s for s in self.study["sites"] if s["id"] == "ELF46")
        self.assertEqual(nickajack["metrics"]["nWeeks"], 0)
        for field in ("predictedTotal", "observedTotal", "nse", "rmse", "pbiasPercent"):
            self.assertIsNone(nickajack["metrics"][field])
        self.assertTrue(all(r["predicted"] is None for r in nickajack["series"]))

    def test_per_site_metrics_use_only_saved_eligible_pairs(self):
        for site in self.study["sites"]:
            rows = [r for r in site["series"] if r["predicted"] is not None]
            metrics = site["metrics"]
            self.assertEqual(metrics["nWeeks"], len(rows))
            self.assertEqual(metrics["missingWeeks"], 26 - len(rows))
            if not rows:
                continue
            observed = [r["observed"] for r in rows]
            predicted = [r["predicted"] for r in rows]
            self.assertAlmostEqual(metrics["predictedTotal"], sum(predicted), places=8)
            self.assertAlmostEqual(metrics["observedTotal"], sum(observed), places=8)
            squared = sum((p - o) ** 2 for p, o in zip(predicted, observed))
            self.assertAlmostEqual(metrics["rmse"], math.sqrt(squared / len(rows)), places=10)
            denominator = sum((o - sum(observed) / len(rows)) ** 2 for o in observed)
            if denominator:
                self.assertAlmostEqual(metrics["nse"], 1 - squared / denominator, places=10)

    def test_download_csv_matches_chart_rows_with_exact_unit_conversion(self):
        with (DATA / "recorded/historical-total-runoff-predictions.csv").open(newline="") as source:
            csv_rows = list(csv.DictReader(source))
        self.assertEqual(len(csv_rows), 1233)
        indexed = {(r["basin_id"], r["start"]): r for r in csv_rows}
        self.assertEqual(len(indexed), len(csv_rows))
        for site in self.study["sites"]:
            for row in site["series"]:
                key = (site["id"], row["date"])
                if row["predicted"] is None:
                    self.assertNotIn(key, indexed)
                else:
                    raw = indexed[key]
                    self.assertEqual(raw["days"], "7")
                    self.assertAlmostEqual(row["predicted"], float(raw["predicted_volume_m3"]) / 1e6, places=10)
                    self.assertAlmostEqual(row["observed"], float(raw["observed_volume_m3"]) / 1e6, places=10)

    def test_reference_images_are_original_hashed_assets(self):
        self.assertEqual(len(self.network["referenceImages"]), 2)
        for reference in self.network["referenceImages"]:
            path = PUBLIC / reference["url"].lstrip("/")
            self.assertTrue(path.is_file())
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), reference["sha256"])
            self.assertEqual(path.stat().st_size, reference["bytes"])
            self.assertIn("53", reference["description"])
            self.assertIn("54", reference["description"])

    def test_gefs_pilot_is_not_expanded_into_a_network_forecast(self):
        pilot = read_json("pilot.json")
        self.assertEqual({s["id"] for s in pilot["sites"]}, {"ELF13", "ELF39"})
        self.assertTrue(all(len(s["series"]) == 2 for s in pilot["sites"]))
        self.assertEqual(self.study["provenance"]["selectedEpoch"], 19)
        self.assertFalse(self.study["provenance"]["training"])
        self.assertFalse(self.study["provenance"]["biasCorrection"])


if __name__ == "__main__":
    unittest.main()
