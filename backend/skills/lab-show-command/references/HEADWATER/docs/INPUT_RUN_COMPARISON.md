# Input-run comparison

13 October 2026. This is the sheet for reading every input experiment together. The number ledger is [INPUT_RUN_COMPARISON.json](INPUT_RUN_COMPARISON.json). New runs are appended here. Earlier run folders are not replaced.

## Plan

Two stages. The trunk, the four issue dates, the 1979–2017 fit, the 2018 stopping year, and the 2019 holdout stay fixed. 2019 is scored after the run and is not used to choose the epoch.

**Stage 1. One added field at a time.** Each run starts from the version-1 inputs and changes one thing. The comparison is with `runs/det_v1`, not with the previous single-field run. A field that does not help is still kept on disk, so the table stays complete.

| Run | What is added | Status |
|---|---|---|
| `runs/det_v1` | None. The Niño slot is masked off. | Done. The baseline. |
| `runs/det_v2_oni` | Oceanic Niño Index only. | Done. The Gulf anomaly is in the version-2 files and was not read. |
| `runs/det_v2_gulf` | Gulf temperature anomaly only. The Niño slot in the file was not read. | Done. |
| `runs/det_v2_ps` | Surface pressure only. Niño stays masked. | Done, 14 October 2026. Files in `headwater_examples_v1_ps`. |
| Root zone only | Mean of soil layers 2 and 3 (`headwater_examples_v1_soil`). | **Done** — valley mean **0.84 K** on 2019 (vs det_v1 **0.93 K**, det_v2_ps **0.88 K**). All four weeks beat det_v1 on valley T. |
| Snow only | Snow water, if a field is on the shards. Scored on January and April. | Parked. |

**Stage 2. Combinations, after this table has the single-field rows.** Each combination is a new folder. The set is chosen from the stage-1 scores. A field that worsened the April valley row is not added to every later run. It can still be paired once, so the interaction is measured. `det_v2_oni` is that case: it stays in the table, and it is not the base of the pressure run.

## Held-out 2019

Valley temperature is the score that has to move. Lower is closer to the observed week. The historical week is the same in every run.

| Week | Historical week | det_v1 | det_v2_oni | det_v2_gulf | det_v2_ps |
|---|---:|---:|---:|---:|---:|
| 16–22 Jan | 0.67 K | 0.62 K | 0.58 K | 0.60 K | 0.62 K |
| 16–22 Apr | 1.09 K | 1.44 K | 1.58 K | 1.50 K | 1.22 K |
| 16–22 Jul | 1.21 K | 1.21 K | 1.16 K | 1.17 K | 1.15 K |
| 16–22 Oct | 0.48 K | 0.45 K | 0.57 K | 0.67 K | 0.53 K |
| Four-week mean | 0.86 K | 0.93 K | 0.97 K | 0.98 K | 0.88 K |

Global temperature on the same four weeks:

| | Historical week | det_v1 | det_v2_oni | det_v2_gulf | det_v2_ps |
|---|---:|---:|---:|---:|---:|
| RMSE | 1.62 K | 1.60 K | 1.59 K | 1.57 K | 1.62 K |
| Anomaly correlation | — | 0.15 | 0.16 | 0.16 | 0.11 |

The Niño index moved January and July a little closer in the valley and raised the global anomaly correlation from 0.15 to 0.16. April moved farther from the observed week, 1.44 K to 1.58 K, and October fell behind the historical week. The four-week valley mean went from 0.93 K to 0.97 K. Under the stage-1 reading, this field is recorded and is not the starting point of the next single-field run.

The Gulf-only run also leaves the four-week valley mean behind `det_v1`, at 0.98 K. July is a little closer than `det_v1` (1.17 K against 1.21 K). April is 1.50 K, between `det_v1` and the Niño run, and still well behind the historical week. October is the worst of the three. Global temperature RMSE is the best of the three, 1.57 K, and the anomaly correlation is 0.16. This row stays in the table. It is not the base of the pressure run.

The pressure-only run is the first single-field fit that moves the four-week valley mean closer than `det_v1`, from 0.93 K to 0.88 K. The historical week is 0.86 K. April is the week that moved: 1.44 K to 1.22 K, still behind the historical week at 1.09 K. July moved from 1.21 K to 1.15 K. January stayed at 0.62 K. October moved from 0.45 K to 0.53 K and is behind the historical week. Global temperature error is 1.62 K, the same as the historical week and a little behind `det_v1` at 1.60 K. The global anomaly correlation fell from 0.15 to 0.11. The Niño slot in these files stayed masked, so this row is surface pressure alone. The bar chart is [valley_2019.png](../figures/input_brief/valley_2019.png). The 16–22 April maps are [temperature](../figures/input_brief/april2019_t2m.png) and [precipitation](../figures/input_brief/april2019_precip.png).

## Reading after the two index runs

Neither index should be applied to all four issue weeks with one shared weight. The network adds the index as one number on the whole map. The same coefficient multiplies every season. A positive temperature weight then moves every week in the same direction, scaled by how large the index is on that date.

On the 2019 issues the Gulf anomaly is +0.35 K in January, +0.27 K in April, +0.24 K in July, and +1.13 K in October. The October value is about five times the July value, and October is the week the Gulf run damaged. The Niño values are +0.97 in January, +0.86 in April, +0.64 in July, and +0.19 in October. April, already too warm in `det_v1`, got warmer still.

The useful part is seasonal, and it is small. Niño helps January (0.62 K to 0.58 K). Both indices help July by a few hundredths of a kelvin. Both hurt April. Both hurt October. The four-week mean gets worse because the damaged weeks outweigh the helped ones.

The next index runs keep one index and turn it on for one issue month only. Everything else stays masked, so the other three weeks match the `det_v1` input. New folders, same split.

| Run | Index on | Index off | Status (19 Oct 2026) |
|---|---|---|---|
| `runs/det_v2_oni_jan` | 15 January, Niño | April, July, October | Done. Fail pass rule. |
| `runs/det_v2_gulf_jul` | 15 July, Gulf anomaly | January, April, October | Done. Fail pass rule. |

A pass is a closer valley temperature on the month that is switched on, with the other three months no worse than `det_v1`. April is not an index test. Both global indices moved that cold week the wrong way. Pressure, when the shards are available, is the separate map-channel test.

### Season-mask results (2019 valley temperature RMSE, K)

| Week | Historical week | det_v1 | oni (all) | gulf (all) | oni_jan | gulf_jul |
|---|---:|---:|---:|---:|---:|---:|
| 15 Jan | 0.67 | 0.62 | 0.58 | 0.60 | 0.62 | 0.66 |
| 15 Apr | 1.09 | 1.44 | 1.58 | 1.50 | 1.57 | 1.51 |
| 15 Jul | 1.21 | 1.21 | 1.16 | 1.17 | 1.18 | 1.17 |
| 15 Oct | 0.48 | 0.45 | 0.57 | 0.67 | 0.52 | 0.47 |
| Mean | 0.86 | 0.93 | 0.97 | 0.98 | 0.97 | 0.95 |

`det_v2_oni_jan` barely moves January (0.623 → 0.621) and worsens April and October. `det_v2_gulf_jul` helps July (1.206 → 1.166) but worsens January, April, and October. Neither run replaces `det_v1` or `det_v2_ps`. Retraining with a month mask still moves the off-month weights, so masked months are not identical to `det_v1`.

2018 chose the epoch, so it is not the untouched test. Mean valley temperature there is 2.38 K for `det_v1` and 2.41 K for `det_v2_oni`, against a historical-week mean of 2.37 K.

## Where the example files are

14 October 2026. The folder name `v1_ps` is the source of the copy, not a different experiment. Surface pressure is the next single-field run in the same stage as Niño and the Gulf anomaly. Each one is compared with `runs/det_v1`.

| Directory | What it is | Channels | Niño | Gulf anomaly | Surface pressure |
|---|---|---:|---|---|---|
| `headwater_examples_v1` | The original files. `runs/det_v1` was trained here. | 23 | Empty, mask 0 | Absent | Absent |
| `headwater_examples_v2` | The index copy used by `det_v2_oni` and `det_v2_gulf`. | 23 | Filled, mask 1 | Stored, read only by the Gulf run | Absent |
| `headwater_examples_v1_ps` | Version 1 plus surface pressure. The source for `runs/det_v2_ps`. | 24 | Empty, mask 0 | Absent | Channel 23 |
| `headwater_examples_v1_soil` | Version 1 plus the root-zone mean (layers 2 and 3). The source for `runs/det_v2_soil` once that run starts. | 24 | Empty, mask 0 | Absent | Absent |

Frontier path: `/lustre/orion/geo172/proj-shared/water4energy/trainingData/headwater_examples_v1_soil`. GPU path, after the copy in [WB2_TRAINING_SAMPLES.md](WB2_TRAINING_SAMPLES.md): `/mnt/proj-shared/VASTdata/7xw/Water4Energy/HEADWATER/headwater_examples_v1_soil` on `ccsi-gpu-node1`.

Pressure was appended to version 1 so the new map is not mixed with the filled Niño index. A `headwater_examples_v2_ps` directory was not written. `geopotential_850` is on the 2019 shard and was not added. That inventory listed `volumetric_soil_water_layer_1` and did not list a deeper soil layer or a snow field.

## Where the run files are

| Run | Checkpoint | Scores |
|---|---|---|
| `runs/det_v1` | `checkpoint.pt`, 9 October 2026 | `check_scores.json` |
| `runs/det_v2_oni` | `checkpoint.pt`, 13 October 2026 | `metrics.json` for 1979–2018. `heldout_2019_scores.json` and `prediction_heldout_2019*.npz` for 2019. |
| `runs/det_v2_gulf` | `checkpoint.pt`, 13 October 2026 | Same layout. `index_source.json` records that the Niño slot was not read. |
| `runs/det_v2_ps` | `checkpoint.pt`, 14 October 2026 | Same layout. Trained on `headwater_examples_v1_ps`. The Niño slot was masked. |
