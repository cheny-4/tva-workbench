# Where the hypothesis lab runs

18 October 2026. Control plane vs data vs training. Follow this when wiring
Phase 2–4 agents and jobs so the loop stays on the right machine.

## Split (default)

| Layer | Where | Why |
|---|---|---|
| Proposer / Critic / Referee (LLM, ledger, papers, briefs) | **Mac** (or any light host with a `HEADWATER` checkout) | Needs git, docs, optional PDF extract — not Lustre or GPUs. Covered by the Water4Energy sync LaunchAgent. |
| Data builds (append pressure/soil, cut examples, WB2 pulls) | **Frontier** (or Pathfinder/VAST if that copy is the source of truth) | ERA5 shards and ~80 GB example trees live there. Scripts such as `scripts/append_surface_pressure.py` refuse to run without the shard path. |
| Training / scoring (`det_v2_*`, later trunk) | **GPU cluster** when examples are staged there; **Frontier GPU** only when the job must sit on the same filesystem as the full archive | Training needs GPUs + example NPZs, not the full hourly shard tree every time. |

Do **not** run the LLM proposer loop on Frontier login nodes. Do **not** train on the Mac. Do **not** assume every agent step needs Frontier — only steps that touch shards or large NPZs do.

## End-to-end cycle

```text
Mac agents          Frontier / VAST              GPU cluster
─────────────       ─────────────────            ────────────
ledger + charge
propose / critique
gated protocol ──►  build / append examples
                    (shards, WB2, soil, …)
                         │
                         └─ rsync / pull NPZs ─►  train + score
                                                    │
Mac ◄──── git sync ◄──── score JSON / docs ◄───────┘
Critic / Referee on updated ledger
PI review (referee_brief.md)
```

1. Agents on Mac propose protocols from `experiment_ledger.json`.
2. Human (or a small scripted job) runs **data prep on Frontier**.
3. Stage the new `headwater_examples_*` tree to the **GPU cluster** (same pattern as Trial-0 DTN pulls).
4. Train/eval on the GPU cluster; write scores into `docs/INPUT_RUN_COMPARISON.json` (and refresh the ledger with `scripts/seed_ledger.py`).
5. Sync pulls those docs to Mac; Critic/Referee run again.

## Path anchors (do not invent)

Documented locations change; always re-read the cited note before a job.

| Role | Typical path / note |
|---|---|
| Frontier v1 examples | See [docs/NEXT_INPUTS.md](../docs/NEXT_INPUTS.md) (`headwater_examples_v1` under lrn105 proj-shared) |
| Frontier root-zone examples | `/lustre/orion/geo172/proj-shared/water4energy/trainingData/headwater_examples_v1_soil` ([docs/WB2_TRAINING_SAMPLES.md](../docs/WB2_TRAINING_SAMPLES.md)) |
| GPU cluster examples | `/mnt/proj-shared/VASTdata/7xw/Water4Energy/HEADWATER/` on `ccsi-gpu-node1` (`headwater_examples_v0`, `headwater_examples_v1`, and `headwater_examples_v1_soil` after the copy) |
| Frontier / VAST v2 index copy | NEXT_INPUTS / FRONTIER_CONTINUE |
| ERA5 1° shards | NEXT_INPUTS Frontier section (`.../era5/1.0_deg`) |
| ERA5 soil and skin temperature | `/lustre/orion/world-shared/cli138/deeksha/ERA5_for_Dali` (`stl/`, `skt/`). Inventory in [docs/ERA5_DOWNLOAD_REQUEST.md](../docs/ERA5_DOWNLOAD_REQUEST.md) |
| Pressure append | `scripts/append_surface_pressure.py` + [docs/FRONTIER_CONTINUE.md](../docs/FRONTIER_CONTINUE.md) |
| Spring cut and 2021–2022 copy | [docs/DATA_PREP_PLAN_20261021.md](../docs/DATA_PREP_PLAN_20261021.md). Frontier builds; the GPU host copies after `manifest.csv` matches. No train from that note |
| Frontier dataset agent | [docs/FRONTIER_DATASET_AGENT.md](../docs/FRONTIER_DATASET_AGENT.md). A script that runs a committed job. Design only; it does not choose dates, and it is not the command to start |
| Score source of truth | [docs/INPUT_RUN_COMPARISON.json](../docs/INPUT_RUN_COMPARISON.json) |
| Lab ledger | [experiment_ledger.json](experiment_ledger.json) |
| Parallel board | [docs/PARALLEL_BOARD.md](../docs/PARALLEL_BOARD.md). `python3 hypothesis_lab/scripts/board.py` reads it and does not launch |
| Lux trainer | [lux/README.md](../lux/README.md). Four MI355X, gfx950 prefix on geo172 Lustre. Device check: `sbatch lux/gpu_check.sh`. Do not submit `lux/launch_four.sh` |
| April rain rank | `python3 scripts/april_rain_rank.py` on Frontier. Writes `hypothesis_lab/runs/20261026_next_round/april_rain_rank.json`. Does not train |

Git does **not** carry `*.npz` example arrays. A pull on any machine gets builders and notes, not the 80 GB trees.

## What lives in this repo vs on disk

| In git (sync everywhere) | On cluster disk only |
|---|---|
| `hypothesis_lab/` packs, prompts, ledger | `runs/det_*/checkpoint.pt` |
| `docs/INPUT_RUN_COMPARISON.json` | `headwater_examples_v*/example_*.npz` |
| Literature PDFs under `docs/literature/pdfs/` | Hourly ERA5 shards, WB2 staging |

## Defaults for later phases

| Phase | Home for execution scripts |
|---|---|
| 2 Agent dry run | Mac |
| 3 Gated downloads / appends | Frontier (data); Mac only to emit the protocol |
| 4 Training gate | GPU cluster entrypoints; Frontier GPU only if data cannot be staged |

## Related

- Lab overview: [README.md](README.md)
- Rolling status: [STATUS.md](STATUS.md)
- Charge: [charges/four_week_departure_v1.md](charges/four_week_departure_v1.md)
