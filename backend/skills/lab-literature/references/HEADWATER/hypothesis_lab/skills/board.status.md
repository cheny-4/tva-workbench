# Skill: board.status

26 October 2026. Show the parallel experiment board. Do not launch from this skill.

## Purpose

Tell a person or an agent which HEADWATER rows are open, which host has a free slot, and whether a score file already in the checkout meets the bar on that row.

## Backing

- Board: `hypothesis_lab/board.json`
- Command: `python3 hypothesis_lab/scripts/board.py`
- Note: `docs/PARALLEL_BOARD.md`

## Contract

- Read the board. Do not add a row, change a state, or set `human_flag`.
- Lux has four slots. The device check is `sbatch lux/gpu_check.sh`. The April rain rank is `python3 scripts/april_rain_rank.py` on Frontier. Do not submit `lux/launch_four.sh`; that script repeats the scored wave.
- Do not start a process on the GPU host, Frontier, or Lux.
- A valley number comes from a `heldout_2019_scores.json` that is already on disk, or from the `verdict` string already on a scored row. If the file is absent, say so.
- One experiment, one GPU. A second free slot is a second row.
