# Recorded October cycle and separate monthly refinement

Derived reading guide for Water4Energy workbench v0.15.0. This document adds context; it does not change the existing April evidence contract or November development review.

## One completed research cycle

The saved review dated **24 October 2026** lives in HEADWATER at `hypothesis_lab/runs/20261024_track_review/`, pinned to commit `5ea54ac4dd817ab38c82284331974d6668afde09`. The six source files are `hypotheses.json`, `critique.json`, `experiments.json`, `referee_brief.md`, `score_slice.json`, and `RESIDUAL_RESULT.md`.

The earlier ledger established a useful soil-input weather model and a stronger 9×9 local-neighborhood model. The proposed test added soil and static landscape information to the local correction of a 2-degree Reslim model, while keeping the other named settings fixed. The critic passed novelty but called the scientific claim underdetermined. The referee wrote a stopping rule: four-week valley temperature error below 0.767 K and January at or below 0.597 K, with additional July and April checks. The critic preserves the first two thresholds more precisely as 0.7668 K and 0.5969 K.

The later result in that pack was 0.955 K across four 2019 test weeks and 1.103 K for January (exact score-slice values: 0.9547 and 1.1029). The primary stopping tests failed, so that Reslim temperature direction stopped and the 9×9 soil model remained the valley model. Lower error is better; these are error differences, not actual temperatures. The historical review date is not an independently verified scheduler timestamp.

The experiment explicitly required human acceptance before training. A later result documents scored work, but the pack contains no separate acceptance receipt. Do not invent a sign-off, start time, newly executed role, or current selected brief. The November review remains a separate record with several proposals.

Use the request header **Water4Energy project — Hypothesis lab · 24 October 2026.** and `--context lab24`:

| Profile | Reader |
| --- | --- |
| lab24-ledger | lab.ledger |
| lab24-proposer | lab.design |
| lab24-critic | lab.design |
| lab24-referee | lab.design |
| lab24-human | lab.board |
| lab24-evidence | lab.ledger |

Quote the returned `verified_answer`, display every `display_paths` entry, and cite the friendly pinned `source_citations`. The full pack remains available in the inspection readout. Reading or sending a question starts no scientific job.

## Supplied figures and distinct scientific scopes

Dali supplied five original PNGs in `daliwang/water4energy_SC26Demo`, commit `d0199a817ddbfa0fbf65c9e81d9fcc53081611ee`, under `Water4Energy-Workbench/public/assets/`. The source index records the exact byte hashes. The maps were not recomputed from arrays here.

- `valley_temperature_2019.png`: four saved 2019 weeks; reference, observed, and 1×1/3×3/9×9 CNN comparisons. These are air temperatures, not error scores.
- `tva_t2m_2019_reslim.png` and `tva_precip_2019_reslim.png`: the same four weeks; reference, observed, 9×9, Reslim 6°, Reslim 2°. Rain values are weekly totals in mm. These prior comparisons do **not** show the October soil-residual run whose error was 0.955 K.
- `april_2019_tmax_refine.png` and `april_2019_prcp_refine.png`: the **whole month of April 2019, 30 days**, with a deterministic 1° field refined to 1/24° (about 4 km). Columns are REFINED, Daymet/ERA5, and difference; rows are monthly mean and daily 95th percentile. Temperature is daily maximum temperature in °C. Precipitation is in **mm/day**.

The monthly refinement is read with downscale.scorecard, `--context headwater --question headwater-downscale`. It is not the protected 16–22 April case week, the weekly mean 2 m temperature/rainfall-total result, or frozen Trial 0's 1° to 0.25° comparison and 730-day standardized aggregate score. No source establishes that a HEADWATER forecast was passed through this monthly refinement. The original Haoran arrays and generating calculation are not bundled.

## Sources

- [October referee brief](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/hypothesis_lab/runs/20261024_track_review/referee_brief.md)
- [October result](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/hypothesis_lab/runs/20261024_track_review/RESIDUAL_RESULT.md)
- [October score slice](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/hypothesis_lab/runs/20261024_track_review/score_slice.json)
- [Dali's supplied figure scope and narration](https://github.com/daliwang/water4energy_SC26Demo/blob/d0199a817ddbfa0fbf65c9e81d9fcc53081611ee/Water4Energy_workbench.md)
