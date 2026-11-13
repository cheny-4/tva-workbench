# Parallel board

26 October 2026. This is the live list of HEADWATER experiments and the command that shows it. The 24 October wave stays in [PARALLEL_QUEUE_20261024.md](PARALLEL_QUEUE_20261024.md). That note is the record of a finished wave. New rows go on the board.

```bash
python3 hypothesis_lab/scripts/board.py
python3 hypothesis_lab/scripts/board.py --all
python3 hypothesis_lab/scripts/board.py --all --evaluate
```

The open wave is [EVENT_DEPARTURE_PLAN_20261102.md](EVENT_DEPARTURE_PLAN_20261102.md). Three rows are ready and own different files: the analog check, the hit-rate rescore, and the event-loss change. Six trains stay designed until that loss commit is on `main`.

The command reads [hypothesis_lab/board.json](../hypothesis_lab/board.json). It does not launch, copy, submit, or train. `--evaluate` reads a `heldout_2019_scores.json` only when that file is already in the checkout. Those files are gitignored, so on the Mac the line says the score is not here. On the GPU host, after a run, the same command prints the valley mean against the bar stored on the row.

## Who does what

One experiment uses one GPU. A second machine runs a second experiment. It does not split one model.

| Host | Slots | What an agent may do |
|---|---:|---|
| Mac | 0 | Edit the board, run the lab, read scores after they sync. |
| GPU cluster, `ccsi-gpu-node1` | 2 | One `setsid nohup` train or score on `cuda:0`, and one on `cuda:1`, when the row says `ready` and `human_flag` is true. |
| Frontier | 8 overflow GPUs, plus batch for data | Appends and cuts, because the ERA5 shards are there. A full 400-epoch train stays on the H100s: `frontier/README.md` records a two-hour wall and a checkpoint written only at the end. |
| Lux | 6 | One MI355X each, 12 hours, account `geo172`. Python is the gfx950 prefix in [lux/README.md](../lux/README.md). A row may be placed here after a person sets the training flag. `sbatch lux/launch_four.sh` is not that row: it still names the scored wave. The current wave is one node and six tasks, in [lux/WAVE.md](../lux/WAVE.md). |

The GPU cron in `data/00_scripts/ccsi-gpu/` syncs a clean checkout. The board arrives that way. An agent on the GPU host runs `board.py` and starts only a row this file marks `ready` with the flag on. It does not add a row.

## States

`designed`, `data`, `ready`, `running`, `scored`, `killed`.

A train moves `designed` → `ready` only when the example directory is on the host that will run it and the launch script exists. `running` requires the human flag. `scored` gets a `verdict` sentence taken from the score file. `killed` means the family stops.

`blocked_by` is a list of row ids. A blocked row does not become `ready` while the blocker is still open.

## What may run together now

The rain rank and the Lux device check are ready and use no training GPU. `E_daily90` is scored and missed the four-week bar. `E_daily180` and `E_daily365` stay uncut.

| Row | Why it waits |
|---|---|
| `E_april_rain_rank` | Ready. On Frontier: `python3 scripts/april_rain_rank.py`. It writes `hypothesis_lab/runs/20261026_next_round/april_rain_rank.json`. It uses no GPU. Exit 3 means 2019 is outside the 1979–2017 range. |
| `E_lux_gpu_check` | Ready. On a Lux login node: `sbatch lux/gpu_check.sh`. One MI355X, 30 minutes, prints the device name. It does not train. |
| `E_daily90` | Scored. Job `369073`, epoch 339. April 0.662 K. Valley mean 0.968 K. July 1.372 K. Misses the four-week bar. |
| `E_daily180` | Left uncut. Same CNN, longer window. Do not build the directory. |
| `E_daily365` | Left uncut. Same CNN, longer window. Do not build the directory. |
| `E_tcwv_9x9` | Scored on Lux, job `368876`. Valley mean 0.837 K. April rain 0.0369 m. Misses the temperature bar. Do not rerun. |
| `E_band_10_20` | Scored on Lux. July 1.168 K. Valley mean 0.836 K. Misses the four-week bar. |
| `E_z500_9x9` | Scored on Lux. Valley mean 0.970 K. Every 2019 temperature week is worse than the 9×9. |
| `E_layer4_9x9` | Scored on Lux. July 1.215 K. Valley mean 0.914 K. Misses the four-week bar. |

The rain rank and the Lux device check can run in the same hours. They are different machines and different scripts. The 90-day filter is scored. The 180-day and 365-day directories stay uncut.

Job `368876` scored the Lux wave on 27 October 2026. The record is [hypothesis_lab/runs/20261027_lux_wave/FINDINGS.md](../hypothesis_lab/runs/20261027_lux_wave/FINDINGS.md). Column water, the 10–20 day band, 500 hPa height, and soil-water layer 4 all miss the 9×9 bar. Do not resubmit `lux/submit_wave.sh` or `lux/launch_four.sh`. Job `369073` scored the 90-day causal filter. April valley temperature is 0.662 K and the four-week mean is 0.968 K, so it misses the 9×9 bar. The reading is [hypothesis_lab/runs/20261027_daily_window/FINDINGS.md](../hypothesis_lab/runs/20261027_daily_window/FINDINGS.md). The 180-day and 365-day directories stay uncut. A temporal Reslim block is not a row on this board.

## What an agent may not do

- Submit `lux/launch_four.sh` or `lux/submit_wave.sh`. Those tasks are already scored. The device check is `lux/gpu_check.sh`.
- Put two experiments on one GPU, or one experiment on many GPUs
- Start a row whose flag is off, whose state is not `ready`, or whose blocker is open
- Reopen a row with `family_closed`
- Invent a valley number when the score file is absent
