"""Daily 1° surface runoff, and the windows the example files sum.

Deeksha's ERA5 files store one value per forecast hour, in meters. A wet
cell usually peaks and then falls. One cell can rise for all 12 hours while
a storm is still building. A total carried forward from the forecast start
would rise or stay flat at every wet cell, because runoff is not negative.

The day stamped D is the same day as ``total_precipitation_24hr``: the 24
hours ending at 00:00 UTC on D.

- 18:00 UTC on D-2, hours 7–12, covers 00:00–06:00 UTC on D-1
- 06:00 UTC on D-1, hours 1–12, covers 06:00–18:00 UTC on D-1
- 18:00 UTC on D-1, hours 1–6, covers 18:00 UTC on D-1 through 00:00 UTC on D

The source starts in January 1980, so 1979 stays out of the runoff climate.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np

SRO_ROOT = Path("/lustre/orion/world-shared/cli138/deeksha/ERA5_for_Dali/sro")
SRO_1DEG = Path(
    "/lustre/orion/geo172/proj-shared/water4energy/trainingData/sro_1deg_daily"
)
RUNOFF_REFERENCE_YEARS = np.arange(1980, 2018, dtype=np.int32)
HOURS_PER_DAY = 24


def forecast_is_running_total(block: np.ndarray) -> bool:
    """True when ``block`` is a total carried forward from the first hour.

    ``block`` is one forecast, shape ``(hours, lat, lon)``. The wettest cells
    decide. A single rising cell is an hourly amount during a building storm.
    """

    if block.ndim != 3 or block.shape[0] < 2:
        raise ValueError(f"forecast block shape {block.shape}")
    flat = np.asarray(block, dtype=np.float64).reshape(block.shape[0], -1)
    peak = np.nanmax(flat, axis=0)
    order = np.argsort(np.where(np.isfinite(peak), peak, -1.0))[::-1]
    series_list = []
    for cell in order:
        if not np.isfinite(peak[cell]) or peak[cell] < 1.0e-4:
            break
        series = flat[:, cell]
        if not np.isfinite(series).all():
            continue
        series_list.append(series)
        if len(series_list) == 40:
            break
    if len(series_list) < 8:
        return False
    rising = 0
    for series in series_list:
        step = np.diff(series)
        if np.all(step >= -1.0e-8) and series[-1] > series[0] + 1.0e-4:
            rising += 1
    return rising * 2 >= len(series_list)


def hour_groups(init_hour: int) -> tuple[tuple[slice, int], ...]:
    """Map one 06 or 18 UTC initialization onto daily stamps.

    The integer is the number of days after the initialization date. Stamp
    D is the 24 hours that end at 00:00 UTC on D.
    """

    if init_hour == 6:
        return ((slice(0, 12), 1),)
    if init_hour == 18:
        return ((slice(0, 6), 1), (slice(6, 12), 2))
    raise ValueError(f"runoff init hour {init_hour} is not 06 or 18 UTC")


def parse_init(stamp: int) -> tuple[np.datetime64, int]:
    """Return the date and UTC hour of one ``utc_date`` value."""

    text = f"{int(stamp):010d}"
    day = np.datetime64(f"{text[:4]}-{text[4:6]}-{text[6:8]}", "D")
    return day, int(text[8:])


def year_path(year: int, root: Path = SRO_1DEG) -> Path:
    return Path(root) / f"sro_{int(year)}.npz"


def load_year(year: int, root: Path = SRO_1DEG) -> tuple[np.ndarray, np.ndarray]:
    """Return ``(dates, sro)`` for one calendar year. ``sro`` is meters."""

    path = year_path(year, root)
    with np.load(path) as raw:
        dates = np.asarray(raw["dates"], dtype="datetime64[D]")
        sro = np.asarray(raw["sro"], dtype=np.float32)
    if sro.shape != (dates.size, 180, 360):
        raise ValueError(f"{path.name} shape {sro.shape} does not match {dates.size} days")
    return dates, sro


def _year_of(day: np.datetime64) -> int:
    return int(str(np.datetime64(day, "D"))[:4])


def sum_dates(
    days: list[np.datetime64] | np.ndarray,
    root: Path = SRO_1DEG,
    cache: dict[int, tuple[np.ndarray, np.ndarray]] | None = None,
) -> np.ndarray:
    """Sum daily 1° maps. A missing hour on any day raises."""

    days = [np.datetime64(day, "D") for day in days]
    years = {_year_of(day) for day in days}
    stored: dict[int, tuple[np.ndarray, np.ndarray]] = {}
    for year in years:
        if cache is not None and year in cache:
            stored[year] = cache[year]
            continue
        loaded = load_year(year, root)
        stored[year] = loaded
        if cache is not None:
            cache[year] = loaded
    total = np.zeros((180, 360), dtype=np.float64)
    for day in days:
        dates, sro = stored[_year_of(day)]
        index = int((day - dates[0]) / np.timedelta64(1, "D"))
        if index < 0 or index >= dates.size or dates[index] != day:
            raise ValueError(f"{day} is not in the { _year_of(day) } runoff year")
        field = sro[index]
        if not np.isfinite(field).all():
            raise ValueError(f"{day} runoff is missing")
        total += field
    return total.astype(np.float32)
