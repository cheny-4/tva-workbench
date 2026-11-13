# E1 — April 2019 map diagnosis

**Run:** `20261018_iter1_april`  
**Date:** 18 October 2026  
**PI gate:** Approve + start E1  
**Sources (repo figures only; no retrain):**

- `figures/input_brief/april2019_t2m.png`
- `figures/input_brief/april2019_precip.png`
- Cross-check: `docs/INPUT_VARIABLE_BRIEF_20261013.md`, `docs/INPUT_RUN_COMPARISON.json`

April 2018 prediction NPZs were not opened on this Mac (not in git). Temperature
story for 2018 remains document-backed in `docs/V1_RESULT_PLAIN.md` until E2 on
the train host.

---

## Temperature, 16–22 April 2019

### Observed departure from 1979–2017 week

- Valley mean about **−0.97 K** (cold inside the box, stronger on the east side
  of the window in the published map).
- Pattern is a real cold week relative to the calendar reference, not a flat
  near-climatology week.

### Forecasts (departure maps)

| Run | Valley error (map label) | Pattern vs observed cold |
|---|---:|---|
| No extra field (`det_v1`) | 1.44 K | Stays near warm/neutral; does not draw the cold pool |
| Niño all months | 1.58 K | Same failure, slightly worse |
| Gulf anomaly all months | 1.50 K | Same failure |
| Surface pressure | 1.22 K | Slightly more cool/neutral tone; still does not place the cold area |

### Forecast − observed (bias)

All four runs are **too warm** in the valley:

| Run | Valley bias (map label) |
|---|---:|
| det_v1 | +1.39 K too warm |
| Niño | +1.53 K too warm |
| Gulf | +1.45 K too warm |
| Surface pressure | +1.14 K too warm |

**Classification (2019 temperature):** warm bias / missed cold pool. Not a
“flat while obs departed weakly” case — obs cold is clear; models stay on the
warm side of the historical week.

**Pressure:** reduces the warm bias (~0.25 K vs det_v1 on the bias labels) but
does not reconstruct the spatial cold structure. Matches BRIEF wording.

---

## Precipitation, 16–22 April 2019

### Observed

- Valley about **+31.5 mm** vs historical week — a wet diagonal band through
  the region.

### Forecasts

All four runs stay near the dry/historical week and miss the wet band:

| Run | Valley error (map) | Bias vs obs |
|---|---:|---|
| det_v1 | 37.2 mm | −31.4 mm too dry |
| Niño | 42.1 mm | −36.9 mm too dry |
| Gulf | 38.8 mm | −33.0 mm too dry |
| Surface pressure | 38.0 mm | −32.4 mm too dry |

**Classification (2019 precip):** too dry / missed wet band. Indexes and
pressure do not move precip off climatology in a useful way on this week.
Temperature remains the primary April score that “sets the mean”; precip is a
second failure mode (event-like wet week) for later high-impact / trunk work.

---

## Link to hypotheses

| Hypothesis | E1 support |
|---|---|
| `H_april_sets_mean` | Supported for 2019 T — cold obs, large valley RMSE |
| `H_indexes_hurt_april` | Supported — Niño/Gulf warm bias and RMSE worse than det_v1 |
| `H_ps_helps_april_not_enough` | Supported — best T bias/RMSE, still warm vs clim; precip not fixed |
| `H_persistence_discarded` | **Underdetermined from 2019 figures alone** — need issue-week panel or Apr 2018 files (E2 / V1_RESULT_PLAIN) |
| `H_april_not_july_physics` | Supported — failure is in-valley cold/wet, not Gulf-side July pattern |
| `H_spring_week_vs_season` | Untouched — needs other spring issue dates (E3) |
| `H_april_needs_trunk_or_land_not_index` | Consistent with maps — indexes fail; pressure partial; spatial structure missing |

---

## E1 conclusion → recommended next

1. **E1 complete** for 2019 figures in-repo.  
2. **E2** (optional, train host): tabulate issue-week vs model vs clim for Apr
   2018 and 2019 to close `H_persistence_discarded`.  
3. Do **not** start E3 spring cuts or soil/850z train until PI picks after Critic.  
4. Collection augmenter (E4) can wait until E2 or a deliberate literature pass.
