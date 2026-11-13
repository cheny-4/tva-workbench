"""Read one week-and-month example. Both models use this layout.

The week arrays are the existing contract. The month arrays are the next
30 days, written beside them. Surface runoff is channel 2. A file with
``runoff_source`` ``absent`` keeps that channel as NaN and mask 0. A file
that names the 1° daily store keeps finite values and mask 1.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np

from headwater.schema import N_TARGET, TARGET_NAMES, validate_example

MONTH_DAYS = 30


def load_week_month(path: str | Path, *, expect_grid: tuple[int, int] = (180, 360)):
    """Return the week example plus the month target and its climate."""

    path = Path(path)
    example = validate_example(str(path), expect_grid=expect_grid)
    with np.load(path) as raw:
        target_month = np.asarray(raw["target_month"], dtype=np.float32)
        reference_month = np.asarray(raw["reference_month"], dtype=np.float32)
        month_start = int(raw["month_day_start"])
        month_end = int(raw["month_day_end"])
        runoff_source = str(raw["runoff_source"])
    if target_month.shape != example.target.shape:
        raise ValueError(f"{path.name} target_month shape {target_month.shape}")
    if reference_month.shape != example.reference_train.shape:
        raise ValueError(f"{path.name} reference_month shape {reference_month.shape}")
    if month_start != 1 or month_end != MONTH_DAYS:
        raise ValueError(f"{path.name} month window is +{month_start} through +{month_end}")
    if list(example.target_names) != list(TARGET_NAMES):
        raise ValueError(f"{path.name} target names are not temperature, precipitation, runoff")
    if example.variable_mask.shape != (N_TARGET,):
        raise ValueError(f"{path.name} variable_mask length")
    if runoff_source == "absent":
        if int(example.variable_mask[2]) != 0:
            raise ValueError(f"{path.name} masks a runoff field that is absent")
        if not np.isnan(target_month[0, 2]).all() or not np.isnan(reference_month[2]).all():
            raise ValueError(f"{path.name} stores runoff numbers from an absent source")
    elif int(example.variable_mask[2]) != 1:
        raise ValueError(f"{path.name} has runoff source {runoff_source} but mask 0")
    elif not np.isfinite(target_month[0, 2]).all() or not np.isfinite(reference_month[2]).all():
        raise ValueError(f"{path.name} month runoff is missing")
    return {
        "example": example,
        "target_month": target_month,
        "reference_month": reference_month,
        "month_day_start": month_start,
        "month_day_end": month_end,
        "runoff_source": runoff_source,
    }
