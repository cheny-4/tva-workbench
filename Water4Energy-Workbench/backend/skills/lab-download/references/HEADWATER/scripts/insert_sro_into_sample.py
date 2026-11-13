#!/usr/bin/env python3
"""Fill surface-runoff channel 2 in the week-and-month sample.

Temperature and precipitation stay as they were written. The week runoff is
the sum of days +1 through +7. The month runoff is the sum of days +1
through +30. Both climate maps average 1980–2017. 1979 is not in the runoff
source, so it stays in the temperature and precipitation climate only.
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from headwater.build_examples import (  # noqa: E402
    VALLEY_LAT_NORTH,
    VALLEY_LAT_SOUTH,
    VALLEY_LON_EAST,
    VALLEY_LON_WEST,
)
from headwater.schema import validate_example  # noqa: E402
from headwater.sro_daily import RUNOFF_REFERENCE_YEARS, SRO_1DEG, sum_dates  # noqa: E402
from headwater.week_month import load_week_month  # noqa: E402

SAMPLE = Path(
    "/lustre/orion/geo172/proj-shared/water4energy/trainingData/headwater_examples_week_month_sample"
)
RECEIPT = ROOT / "hypothesis_lab" / "runs" / "20261102_sro_sample" / "receipt.json"
ISSUES = (
    "example_train_20160415.npz",
    "example_train_20161015.npz",
    "example_val_20180415.npz",
    "example_val_20190415.npz",
)


def _window(issue: np.datetime64, count: int) -> list[np.datetime64]:
    start = issue + np.timedelta64(1, "D")
    return [start + np.timedelta64(offset, "D") for offset in range(count)]


def _same_window(days: list[np.datetime64], year: int) -> list[np.datetime64]:
    return [np.datetime64(f"{year}-{str(day)[5:]}", "D") for day in days]


def _climate(
    days: list[np.datetime64],
    root: Path,
    cache: dict,
) -> tuple[np.ndarray, int]:
    maps = [
        sum_dates(_same_window(days, int(year)), root, cache) for year in RUNOFF_REFERENCE_YEARS
    ]
    stack = np.stack(maps).astype(np.float64)
    return stack.mean(axis=0).astype(np.float32), int(stack.shape[0])


def _valley_mean_mm(field: np.ndarray, lat: np.ndarray, lon: np.ndarray) -> float:
    rows = np.flatnonzero((lat >= VALLEY_LAT_SOUTH) & (lat <= VALLEY_LAT_NORTH))
    cols = np.flatnonzero((lon >= VALLEY_LON_WEST) & (lon <= VALLEY_LON_EAST))
    return float(field[np.ix_(rows, cols)].mean() * 1000.0)


def insert_sample(sro_root: Path = SRO_1DEG, sample: Path = SAMPLE) -> Path:
    """Write channel 2 into the four sample files and return the receipt path."""

    rows = []
    cache: dict = {}
    for name in ISSUES:
        path = sample / name
        with np.load(path) as raw:
            arrays = {key: raw[key] for key in raw.files}
        issue = np.datetime64(str(arrays["issue_time"]), "D")
        lat = np.asarray(arrays["lat"], dtype=np.float64)
        lon = np.asarray(arrays["lon"], dtype=np.float64)
        week_days = _window(issue, 7)
        month_days = _window(issue, 30)
        week = sum_dates(week_days, sro_root, cache)
        month = sum_dates(month_days, sro_root, cache)
        week_climate, week_years = _climate(week_days, sro_root, cache)
        month_climate, month_years = _climate(month_days, sro_root, cache)
        if week_years != 38 or month_years != 38:
            raise RuntimeError(f"{name} runoff climate used {week_years} and {month_years} years")
        target = np.array(arrays["target"], dtype=np.float32)
        reference = np.array(arrays["reference_train"], dtype=np.float32)
        target_month = np.array(arrays["target_month"], dtype=np.float32)
        reference_month = np.array(arrays["reference_month"], dtype=np.float32)
        mask = np.array(arrays["variable_mask"], dtype=np.uint8)
        target[0, 2] = week
        reference[2] = week_climate
        target_month[0, 2] = month
        reference_month[2] = month_climate
        mask[2] = 1
        arrays["target"] = target
        arrays["reference_train"] = reference
        arrays["target_month"] = target_month
        arrays["reference_month"] = reference_month
        arrays["variable_mask"] = mask
        arrays["runoff_source"] = np.array(str(sro_root))
        arrays["runoff_reference_years"] = RUNOFF_REFERENCE_YEARS
        tmp = path.with_name(f".{path.stem}.writing.npz")
        np.savez(tmp, **arrays)
        tmp.replace(path)
        validate_example(str(path))
        loaded = load_week_month(path)
        if loaded["runoff_source"] != str(sro_root):
            raise RuntimeError(f"{name} did not keep the runoff source")
        rows.append(
            {
                "file": name,
                "issue": str(issue),
                "valley_week_mm": round(_valley_mean_mm(week, lat, lon), 3),
                "valley_week_climate_mm": round(_valley_mean_mm(week_climate, lat, lon), 3),
                "valley_month_mm": round(_valley_mean_mm(month, lat, lon), 3),
                "valley_month_climate_mm": round(_valley_mean_mm(month_climate, lat, lon), 3),
            }
        )
        print(
            f"{name} valley week {rows[-1]['valley_week_mm']} mm "
            f"(climate {rows[-1]['valley_week_climate_mm']}), "
            f"month {rows[-1]['valley_month_mm']} mm",
            flush=True,
        )
    RECEIPT.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "written_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "sample": str(sample),
        "sro_1deg": str(sro_root),
        "units": "meters in the file; valley means below are millimeters",
        "runoff_reference_years": "1980-2017",
        "temperature_precipitation_reference_years": "1979-2017",
        "files": rows,
    }
    RECEIPT.write_text(json.dumps(payload, indent=2) + "\n")
    return RECEIPT


def main() -> None:
    insert_sample()


if __name__ == "__main__":
    main()
