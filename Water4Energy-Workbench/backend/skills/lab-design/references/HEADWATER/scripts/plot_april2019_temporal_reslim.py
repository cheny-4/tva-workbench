"""16–22 April 2019: reference, observed, residual 9×9, residual Reslim, temporal Reslim.

One temperature figure and one precipitation figure. The five maps share one color scale.
"""

from __future__ import annotations

import sys
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from scripts.plot_obs_target_comparison import (  # noqa: E402
    PRECIP,
    T2M,
    draw,
    field_for,
    load_case,
    load_prediction,
    prediction_file,
    region_index,
    robust_limit,
    target_window,
    valley_mean,
)

TEMPORAL = ROOT / "runs" / "temporal_reslim"
OUT = ROOT / "figures" / "april2019_temporal_reslim"
COLUMNS = ("Reference", "Observed", "Residual 9×9", "Residual Reslim", "Temporal Reslim")


def valley_rmse(left: np.ndarray, right: np.ndarray, case: dict) -> float:
    rows = case["valley_lat_idx"]
    cols = case["valley_lon_idx"]
    error = left[np.ix_(rows, cols)] - right[np.ix_(rows, cols)]
    weights = case["valley_lat_weights"]
    mse = float((weights * np.square(error).mean(axis=1)).sum())
    return float(np.sqrt(mse))


def case_for(stamp: str) -> dict:
    case = load_case(stamp)
    path = prediction_file(TEMPORAL, stamp)
    if path is None:
        raise FileNotFoundError(f"no temporal Reslim prediction for {stamp}")
    case["forecasts"]["Temporal Reslim"] = load_prediction(path)
    missing = [name for name in COLUMNS[2:] if name not in case["forecasts"]]
    if missing:
        raise FileNotFoundError(f"{stamp} predictions missing: {missing}")
    return case


def plot_cases(cases: list[dict], channel: int, path: Path, unit: str, offset: float, scale: float, cmap: str, title: str) -> None:
    nrows = len(cases)
    fig, axes = plt.subplots(
        nrows, len(COLUMNS), figsize=(3.4 * len(COLUMNS), 2.7 * nrows + 0.7), squeeze=False
    )
    for row, case in enumerate(cases):
        fields = [field_for(case, name, channel, offset, scale) for name in COLUMNS]
        lat_idx, lon_idx = region_index(case)
        blocks = [field[np.ix_(lat_idx, lon_idx)] for field in fields]
        lo, hi = robust_limit(blocks)
        norm = plt.Normalize(lo, hi)
        meshes = []
        for col, (field, label) in enumerate(zip(fields, COLUMNS)):
            mesh = draw(axes[row, col], case, field, norm, cmap)
            meshes.append(mesh)
            mean = valley_mean(field, case)
            axes[row, col].set_title(f"{label}\nvalley {mean:.1f} {unit}", fontsize=9, pad=4)
        axes[row, 0].text(
            -0.28,
            0.5,
            f"{case['issue']}\n{target_window(case['issue'])}",
            transform=axes[row, 0].transAxes,
            va="center",
            ha="right",
            fontsize=9,
        )
        fig.colorbar(meshes[0], ax=axes[row, :].tolist(), shrink=0.86, pad=0.015, label=unit)
    fig.suptitle(title, fontsize=13)
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(path, dpi=150, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print("wrote", path)


def main() -> None:
    april = case_for("20190415")
    plot_cases(
        [april],
        T2M,
        OUT / "tva_t2m_20190415_reference_obs_k9_reslim_temporal.png",
        "°C",
        273.15,
        1.0,
        "RdYlBu_r",
        "16–22 April 2019 week-ahead 2 m temperature",
    )
    plot_cases(
        [april],
        PRECIP,
        OUT / "tva_precip_20190415_reference_obs_k9_reslim_temporal.png",
        "mm",
        0.0,
        1000.0,
        "Blues",
        "16–22 April 2019 week-ahead precipitation",
    )
    val_2018 = [case_for(stamp) for stamp in ("20180115", "20180415", "20180715", "20181015")]
    plot_cases(
        val_2018,
        T2M,
        OUT / "tva_t2m_2018_reference_obs_k9_reslim_temporal.png",
        "°C",
        273.15,
        1.0,
        "RdYlBu_r",
        "2018 validation week-ahead 2 m temperature",
    )
    plot_cases(
        val_2018,
        PRECIP,
        OUT / "tva_precip_2018_reference_obs_k9_reslim_temporal.png",
        "mm",
        0.0,
        1000.0,
        "Blues",
        "2018 validation week-ahead precipitation",
    )
    for channel, offset, scale, unit in ((T2M, 273.15, 1.0, "C"), (PRECIP, 0.0, 1000.0, "mm")):
        print(unit)
        for case in [april, *val_2018]:
            bits = [
                f"{name} {valley_mean(field_for(case, name, channel, offset, scale), case):.1f}"
                for name in COLUMNS
            ]
            print(f"  {case['issue']}", " ".join(bits))
        if channel == T2M:
            print("  valley RMSE K")
            for case in [april, *val_2018]:
                observed = field_for(case, "Observed", channel, offset, scale)
                bits = [
                    f"{name} {valley_rmse(field_for(case, name, channel, offset, scale), observed, case):.3f}"
                    for name in COLUMNS
                    if name != "Observed"
                ]
                print(f"  {case['issue']}", " ".join(bits))


if __name__ == "__main__":
    main()
