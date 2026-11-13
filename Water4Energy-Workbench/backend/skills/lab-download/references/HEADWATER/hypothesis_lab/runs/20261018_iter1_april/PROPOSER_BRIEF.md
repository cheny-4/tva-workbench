# Supervised Proposer — Iteration 1 Focus C (April)

**Run:** `20261018_iter1_april`  
**Gate:** You approve or edit before Critic (Step 2).

## What the ledger already settled (do not re-run)

| Run | April 2019 valley T RMSE | vs historical 1.09 K |
|---|---:|---|
| Historical week | 1.09 | — |
| det_v1 | 1.44 | worse |
| det_v2_oni | 1.58 | worse |
| det_v2_gulf | 1.50 | worse |
| det_v2_ps | 1.22 | better than det_v1, still worse than clim |

April ≠ July. Indexes with one weight hurt April. Pressure helps but is not enough.

## New / open claims (for your gate)

1. **H_persistence_discarded** — cold already in recent week; model drops it (strongest story on Apr 2018 numbers in V1_RESULT_PLAIN).  
2. **H_spring_week_vs_season** — maybe only 16–22 Apr, not all spring (docs already suggest Mar/Apr/May cuts).  
3. **H_april_needs_trunk_or_land_not_index** — next lever is trunk or land, not another April index.  
4. **G_april_literature_thin** — shelf weak on spring cold weeks; augmenter later.

## Recommended next experiment

**E1_april_map_diagnosis** (no train, no Frontier required if using repo figures):

- `figures/input_brief/april2019_t2m.png` (+ precip)
- Optional prediction NPZs on the train host
- Output: `april_map_notes.md` in this run folder

Then E2 score slice → only then E3 spring cuts or E4 literature augmenter.

## Rejected

- Re-train ONI/Gulf all months  
- 850z as first April fix  
- Soil/snow train now  

## Your decision (reply)

- **Approve** shortlist as-is → run Critic next  
- **Edit** (say which hypothesis to drop/change)  
- **Approve + start E1** → we draft `april_map_notes.md` from the April 2019 figures now  
