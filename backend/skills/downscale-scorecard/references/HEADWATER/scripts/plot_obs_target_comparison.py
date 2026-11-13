"""2019 Southeast maps: climate week, observation, both 9×9 labels, and Reslim.

Columns are the 1979–2017 reference, the observed week, the residual-trained
9×9 when that prediction file is on disk, the observation-week 9×9, the
residual patch-2 Reslim when that prediction file is on disk, and the
observation-week patch-2 Reslim when that prediction file is on disk.
Each row is one issue week and shares one color scale.
"""

from __future__ import annotations

import sys
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Rectangle

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from headwater.schema import validate_example  # noqa: E402

EXAMPLES = Path(
    "/lustre/orion/geo172/proj-shared/water4energy/trainingData/headwater_examples_v1_soil"
)
RESIDUAL = ROOT / "runs" / "det_v2_soil_k9"
OBSERVED = ROOT / "runs" / "det_v2_soil_k9_obs"
RESLIM_OBS = ROOT / "runs" / "det_v2_reslim_patch2_obs"
RESLIM_RESIDUAL = ROOT / "runs" / "det_v2_reslim_patch2_soilresid"
OUT = ROOT / "figures" / "obs_target"
STAMPS = ("20190115", "20190415", "20190715", "20191015")
SOUTH, NORTH, WEST, EAST = 30.0, 42.0, -96.0, -76.0
T2M, PRECIP = 0, 1


def signed_lon(lon: np.ndarray) -> np.ndarray:
    return np.where(lon > 180.0, lon - 360.0, lon)


def edges(centers: np.ndarray) -> np.ndarray:
    centers = np.asarray(centers, dtype=np.float64)
    out = np.empty(centers.size + 1, dtype=np.float64)
    out[1:-1] = 0.5 * (centers[:-1] + centers[1:])
    out[0] = centers[0] - (out[1] - centers[0])
    out[-1] = centers[-1] + (centers[-1] - out[-2])
    return out


def prediction_file(directory: Path, stamp: str) -> Path | None:
    for prefix in ("prediction_heldout_", "prediction_val_", "prediction_train_"):
        path = directory / f"{prefix}{stamp}.npz"
        if path.is_file():
            return path
    return None


def example_file(stamp: str) -> Path:
    for split in ("val", "train"):
        path = EXAMPLES / f"example_{split}_{stamp}.npz"
        if path.is_file():
            return path
    raise FileNotFoundError(f"no example for {stamp}")


def load_prediction(path: Path) -> np.ndarray:
    with np.load(path) as raw:
        prediction = np.asarray(raw["prediction"], dtype=np.float32)
    if prediction.ndim == 4:
        prediction = prediction[0]
    return prediction


def load_case(stamp: str) -> dict:
    example = validate_example(str(example_file(stamp)), expect_grid=(180, 360))
    forecasts = {}
    observed_path = prediction_file(OBSERVED, stamp)
    if observed_path is None:
        raise FileNotFoundError(f"no observation-week 9×9 prediction for {stamp}")
    forecasts["Obs-week 9×9"] = load_prediction(observed_path)
    residual_path = prediction_file(RESIDUAL, stamp)
    if residual_path is not None:
        forecasts["Residual 9×9"] = load_prediction(residual_path)
    reslim_obs = prediction_file(RESLIM_OBS, stamp)
    if reslim_obs is not None:
        forecasts["Obs-week Reslim"] = load_prediction(reslim_obs)
    reslim_residual = prediction_file(RESLIM_RESIDUAL, stamp)
    if reslim_residual is not None:
        forecasts["Residual Reslim"] = load_prediction(reslim_residual)
    return {
        "issue": np.datetime64(example.issue_time, "D"),
        "reference": np.asarray(example.reference_train, dtype=np.float32),
        "target": np.asarray(example.target[0], dtype=np.float32),
        "forecasts": forecasts,
        "lat": np.asarray(example.lat, dtype=np.float64),
        "lon": np.asarray(example.lon, dtype=np.float64),
        "valley_lat_idx": np.asarray(example.valley_lat_idx),
        "valley_lon_idx": np.asarray(example.valley_lon_idx),
        "valley_lat_weights": np.asarray(example.valley_lat_weights, dtype=np.float64),
    }


def valley_mean(field: np.ndarray, case: dict) -> float:
    rows = case["valley_lat_idx"]
    cols = case["valley_lon_idx"]
    block = field[np.ix_(rows, cols)]
    weights = case["valley_lat_weights"]
    return float((weights * block.mean(axis=1)).sum())


def target_window(issue: np.datetime64) -> str:
    start = issue + np.timedelta64(1, "D")
    end = issue + np.timedelta64(7, "D")
    return f"{str(start)[5:]} – {str(end)[5:]}"


def region_index(case: dict):
    lat = case["lat"]
    lon_s = signed_lon(case["lon"])
    lat_idx = np.flatnonzero((lat >= SOUTH) & (lat <= NORTH))
    lon_idx = np.flatnonzero((lon_s >= WEST) & (lon_s <= EAST))
    lon_idx = lon_idx[np.argsort(lon_s[lon_idx])]
    return lat_idx, lon_idx


def valley_box(case: dict) -> tuple[float, float, float, float]:
    lat = case["lat"]
    lon_s = signed_lon(case["lon"])
    south = float(lat[case["valley_lat_idx"]].min() - 0.5)
    north = float(lat[case["valley_lat_idx"]].max() + 0.5)
    west = float(lon_s[case["valley_lon_idx"]].min() - 0.5)
    east = float(lon_s[case["valley_lon_idx"]].max() + 0.5)
    return west, south, east - west, north - south


def draw(ax, case: dict, field: np.ndarray, norm, cmap: str):
    lat_idx, lon_idx = region_index(case)
    lat = case["lat"][lat_idx]
    lon = signed_lon(case["lon"])[lon_idx]
    block = field[np.ix_(lat_idx, lon_idx)]
    mesh = ax.pcolormesh(edges(lon), edges(lat), block, cmap=cmap, norm=norm, shading="flat")
    west, south, width, height = valley_box(case)
    ax.add_patch(Rectangle((west, south), width, height, fill=False, edgecolor="black", linewidth=1.1))
    ax.set_xlim(WEST, EAST)
    ax.set_ylim(SOUTH, NORTH)
    ax.set_aspect("equal")
    ax.tick_params(labelsize=7)
    return mesh


def columns_for(case: dict) -> list[str]:
    names = ["Reference", "Observed"]
    if "Residual 9×9" in case["forecasts"]:
        names.append("Residual 9×9")
    names.append("Obs-week 9×9")
    if "Residual Reslim" in case["forecasts"]:
        names.append("Residual Reslim")
    if "Obs-week Reslim" in case["forecasts"]:
        names.append("Obs-week Reslim")
    return names


def field_for(case: dict, name: str, channel: int, offset: float, scale: float) -> np.ndarray:
    if name == "Reference":
        raw = case["reference"][channel]
    elif name == "Observed":
        raw = case["target"][channel]
    else:
        raw = case["forecasts"][name][channel]
    return (raw - offset) * scale


def robust_limit(blocks: list[np.ndarray]) -> tuple[float, float]:
    values = np.concatenate([block[np.isfinite(block)] for block in blocks])
    lo, hi = np.percentile(values, [2.0, 98.0])
    if hi <= lo:
        hi = lo + 1.0
    return float(lo), float(hi)


def plot_field(cases: list[dict], channel: int, path: Path, unit: str, offset: float, scale: float, cmap: str, title: str) -> None:
    names = columns_for(cases[0])
    nrows = len(cases)
    ncols = len(names)
    fig, axes = plt.subplots(nrows, ncols, figsize=(3.4 * ncols, 2.7 * nrows + 0.7), squeeze=False)
    for row, case in enumerate(cases):
        fields = [field_for(case, name, channel, offset, scale) for name in names]
        lat_idx, lon_idx = region_index(case)
        blocks = [field[np.ix_(lat_idx, lon_idx)] for field in fields]
        lo, hi = robust_limit(blocks)
        norm = plt.Normalize(lo, hi)
        meshes = []
        for col, (field, label) in enumerate(zip(fields, names)):
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


def plot_year(stamps: tuple[str, ...], year: str, role: str = "", file_year: str | None = None) -> None:
    cases = [load_case(stamp) for stamp in stamps]
    names = columns_for(cases[0])
    joined = ", ".join(names)
    if "Residual Reslim" in names:
        suffix = "both_labels"
    elif "Obs-week Reslim" in names:
        suffix = "k9_reslim"
    else:
        suffix = "residual_obsweek"
    label = file_year or year
    plot_field(
        cases,
        T2M,
        OUT / f"tva_t2m_{label}_reference_obs_{suffix}.png",
        "°C",
        273.15,
        1.0,
        "RdYlBu_r",
        f"{year}{role} week-ahead 2 m temperature  ·  {joined}",
    )
    plot_field(
        cases,
        PRECIP,
        OUT / f"tva_precip_{label}_reference_obs_{suffix}.png",
        "mm",
        0.0,
        1000.0,
        "Blues",
        f"{year}{role} week-ahead precipitation  ·  {joined}",
    )
    for channel, offset, scale, unit in ((T2M, 273.15, 1.0, "C"), (PRECIP, 0.0, 1000.0, "mm")):
        print(year, unit)
        for case in cases:
            bits = [
                f"{name} {valley_mean(field_for(case, name, channel, offset, scale), case):.1f}"
                for name in names
            ]
            print(" ", case["issue"], " | ".join(bits))


def main() -> None:
    plot_year(STAMPS, "2019")
    plot_year(("20180115", "20180415", "20180715", "20181015"), "2018")
    plot_year(
        ("20160115", "20160415", "20160715", "20161015"),
        "2016",
        " training, best epoch",
        "2016_train",
    )


if __name__ == "__main__":
    main()
