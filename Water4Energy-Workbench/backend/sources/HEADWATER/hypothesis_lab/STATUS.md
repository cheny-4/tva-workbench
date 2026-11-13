# Hypothesis lab status

Updated: 26 October 2026.

## Phase

| Phase | State |
|---|---|
| 0 Spec freeze (schemas, allowlist, policy) | done |
| 1 Ledger bootstrap from scored runs | done |
| 1b Literature skills on top of ledger | stub contracts; RAG.md written |
| 1c Overview slides (incl. RAG + augmenter) | done (build script) |
| 2 Propose → critique → referee dry run (agent) | done for the 24 Oct track review |
| 2b Collection augmenter agent | planned (see RAG.md) |
| 3 Gated downloads for ledger gaps | not started |
| 4 Training gate | parked |

## What was seeded

From [docs/INPUT_RUN_COMPARISON.json](../docs/INPUT_RUN_COMPARISON.json) and project notes:

- **Scored:** `det_v1`, the four index and pressure runs, `det_v2_soil`, soil kernels 3 and 9, Reslim patch 6, both valley weights, and Reslim patch 2. All of those `blocks_reproposal`.
- **Planned (index):** none — season masks scored 19 Oct 2026
- **Parked:** snow-only; nutrients/roots/groundwater off list
- **Open gap:** the 90-day daily filter on the 9×9, still unlaunched, and total column water vapour as the one new field. The 850 hPa height run is scored and missed the four-week bar. Soil on the patch-2 residual is scored and missed that bar.

## Runtime home (follow closely)

See [RUNTIME.md](RUNTIME.md):

- **Mac** — Proposer / Critic / Referee, ledger, literature
- **Frontier** — append/build examples (data on disk)
- **GPU cluster** — training and scoring after NPZs are staged

## Operating mode (now)

**Supervised iteration 1** — human gate after every step. Automate only after this cycle feels right.

Prior pack (already on disk): `runs/20261018_ledger_bootstrap/`  
Charge: `charges/four_week_departure_v1.md`

### Iteration-1 checklist

| Step | Who | Gate (you say go/no-go) | Artifact |
|---|---|---|---|
| 0 | Done | Accept bootstrap prior? | `referee_brief.md` in bootstrap pack |
| 1 | Proposer (Mac, with you) | Approve hypothesis shortlist | new `runs/<id>/hypotheses.json` |
| 2 | Critic (Mac, with you) | Novelty check pass? | `critique.json` |
| 3 | You | Pick **one** experiment to prepare | note in run dir |
| 4 | Data prep | Frontier only if needed | script / path note |
| 5 | Train/score | GPU only if you approve | scores → COMPARISON.json |
| 6 | Referee | Accept brief? | `referee_brief.md` |

Do **not** automate steps 1–6 until this checklist has been walked once.

## Next human action

**Focus chosen: C — April cold-week.**

| Step | State |
|---|---|
| 0 Bootstrap prior | accepted via Focus C |
| 1 Proposer | approved — `runs/20261018_iter1_april/` |
| 1+ E1 map diagnosis | **done** — `april_map_notes.md` |
| 2 Critic | **done** — novelty PASS |
| 3 PI + E2-doc + Referee | **done** — see `referee_brief.md` / `STEP3_RESULT.md` |
| 4–6 Frontier/GPU train | **F1 + F2 done on ccsi-gpu** (19 Oct) |

**Iteration 1 Focus C closed.**  

**F1 complete:** 2019-04-15 valley persistence = 3.05 K (worse than model and clim).  
**F2 complete:** `det_v2_oni_jan` and `det_v2_gulf_jul` both fail the season-mask pass rule. See `runs/20261018_iter1_april/F1_F2_RESULT.md`.  
**F3 complete:** `marino2011falsespring` + `gu2008springfreeze` + `noaa2008easterfreeze` on the shelf (PDFs in `docs/literature/pdfs/`).  
See `runs/20261018_iter1_april/F3_INGEST_A.md`.

**Track review (24 Oct):** Proposer, Critic, and Referee on the scored soil CNN and Reslim runs. Brief: [runs/20261024_track_review/referee_brief.md](runs/20261024_track_review/referee_brief.md). The soil residual then scored and missed the 9×9 bar: [RESIDUAL_RESULT.md](runs/20261024_track_review/RESIDUAL_RESULT.md). Reslim temperature variants stop.

**Wave scores (26 Oct):** 7-day, 15-day, 850 hPa height, surface pressure, skin temperature, and the frozen 9×9 spring score. None replaces the 9×9 four-week mean of 0.767 K. July moves under the historical week for the 7-day filter (1.138 K) and for 850 hPa height (1.189 K), and both give back the other three weeks. Pack: [runs/20261026_wave_scores/FINDINGS.md](runs/20261026_wave_scores/FINDINGS.md). The 90-day daily filter stays proposed there and is not launched.

**Next round (26 Oct):** Proposer, Critic, and Referee after the wave. Brief: [runs/20261026_next_round/referee_brief.md](runs/20261026_next_round/referee_brief.md). July is the open temperature week. April rain still sits on the reference. The one new field to prepare is total column water vapour (`E_tcwv_9x9`). The rain-rank check comes first. Training still needs a human flag. Novelty check: pass.

**Parallel board (26 Oct):** `python3 hypothesis_lab/scripts/board.py`. Two actions can run together: `python3 scripts/april_rain_rank.py` on Frontier, and `sbatch lux/gpu_check.sh` on Lux. `E_daily90` stays designed because an odd temporal kernel cannot see all 90 days. `E_tcwv_9x9` stays off until the rank file says the 2019 week is inside the 1979–2017 range and a person sets the training flag. The board command does not launch. Note: [docs/PARALLEL_BOARD.md](../docs/PARALLEL_BOARD.md).

**Program plan (repo):** [docs/PROGRAM_PLAN_EVALUATION.md](../docs/PROGRAM_PLAN_EVALUATION.md) — use for biweekly / evaluation-paper framing.

**Next set (3 Nov):** Proposer, Critic, and Referee on `docs/NEXT_SET_20261103.md`. Brief: [runs/20261103_next_set/referee_brief.md](runs/20261103_next_set/referee_brief.md). One read: a dynamical hindcast on the eight 2018–2019 issue weeks, mean and wet end. A miss does not open days 15–30. No train. Novelty check: pass.

## Changelog

| Date | Note |
|---|---|
| 2026-11-04 | GEFSv12 reading. Rain spread is the new result. Temperature offset 1.047 K misses 0.861 K. `docs/GEFS_SCORE_READING_20261104.md` |
| 2026-11-04 | Monthly blend and slow-state lines. Soil temperature loses to the blend on 2018 (1.123 K against 0.952 K). No month train. `docs/MONTH_SLOW_PLAN_20261104.md` |
| 2026-11-04 | Farm week fit. Job `389074` stopped after epoch 1. Resume `389217` has four GPUs and 1.54 TB and continues at epoch 2 in `runs/temporal_reslim_farm`. |
| 2026-11-03 | GEFSv12 score on the eight weeks. April wet end 49.3 mm, mean 38.4 mm. Temperature mean 1.793 K. No train. `runs/20261103_next_set/gefs_week_score.json` |
| 2026-11-03 | Next-set review. One hindcast score on eight weeks. Days 15–30 does not follow a miss. `runs/20261103_next_set/` |
| 2026-10-26 | Parallel actions: Frontier `scripts/april_rain_rank.py` and Lux `lux/gpu_check.sh`. Column water and the 90-day filter stay off. |
| 2026-10-26 | Lux on the board: four MI355X slots. Device check empty. Do not submit `lux/launch_four.sh`. |
| 2026-10-26 | Parallel board. `python3 hypothesis_lab/scripts/board.py`. Lux unwired. `docs/PARALLEL_BOARD.md` |
| 2026-10-26 | Next-round pack. New field to prepare: column water vapour. 90-day filter stays in the wave pack. `runs/20261026_next_round/` |
| 2026-10-26 | Wave scores filed. Next proposed run is the 90-day daily filter. `runs/20261026_wave_scores/` |
| 2026-10-26 | Eleven extension PDFs filed. Parallel versions, each still behind its own training flag: `docs/IMPLEMENTATION_PLAN_20261026_LITERATURE_VERSIONS.md` |
| 2026-10-20 | First Reslim trunk filed. Test it beside the soil CNN. `docs/STEP_SUMMARY_20261020.md` |
| 2026-10-20 | Literature step summary: Reslim now; GraphCast and Storm held. `docs/STEP_SUMMARY_20261020.md` |
| 2026-10-19 | F1 valley persistence + F2 season-mask trains on ccsi-gpu; both recorded |
| 2026-10-18 | F3: also ingested noaa2008easterfreeze PDF + catalog |
| 2026-10-18 | F3 ingest A: Marino + Gu PDFs and catalog rows committed |
| 2026-10-18 | F3 propose-only: Marino 2011, Gu 2008, NOAA 2008 Easter Freeze — await ingest gate |
| 2026-10-18 | Step 3: E2 doc-slice + Referee; Focus C iteration closed |
| 2026-10-18 | E1 + Critic done for Focus C; await PI on E2 vs Referee |
| 2026-10-18 | Iter1 Focus C Proposer pack `20261018_iter1_april` — await PI gate |
| 2026-10-18 | Supervised iteration-1 checklist; wait for PI focus choice |
| 2026-10-18 | Slides + RAG.md (literature RAG + collection augmenter) |
| 2026-10-18 | Added RUNTIME.md (Mac / Frontier / GPU split) |
| 2026-10-18 | Created `hypothesis_lab/`; seeded ledger from INPUT_RUN_COMPARISON.json |
