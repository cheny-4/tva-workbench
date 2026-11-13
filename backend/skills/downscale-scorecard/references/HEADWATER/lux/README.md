# HEADWATER on Lux (ROCm)

26 October 2026. Lux copy of the four Frontier GPU tasks. `frontier/` is unchanged, and these jobs do not use `frontier/env.sh` or `frontier/launch_four.sh`.

The Python prefix is on the shared Lustre project directory. It is not in this git checkout. A clone on another machine can read this note and the `lux/` scripts. The wheel itself is visible from Lux and Frontier because both mount that Lustre path.

## Status

The environment install finished on the Lux login node.

| Check | Result |
|---|---|
| Prefix | `/lustre/orion/geo172/proj-shared/water4energy/lux-python/torch-gfx950` |
| Interpreter | `.../torch-gfx950/bin/python` |
| Torch | `2.11.0+rocm7.13.0` |
| HIP | `7.13.99004` |
| Wheel index | `https://repo.amd.com/rocm/whl/gfx950-dcgpu/` |
| Login-node import | printed the version and HIP strings above |

The one-GPU confirmation did not finish. Job `367229` (`headwater_lux_check`) ran on `lux013` and Slurm cancelled it at the 15-minute limit (`2026-10-26T01:07:39`). `runs/lux_rocm/gpu-check-367229.out` is empty, so that job never printed the device name or the memory size.

Job `368824` did run PyTorch on an MI355X. On 27 October 2026 it trained the z850 9×9 on `lux042` for 400 epochs and wrote `runs/lux_rocm/z850/`, including `heldout_2019_scores.json`. The four-week 2019 valley temperature mean was 0.952 K. The allocation has been released. `lux/train_k9.sh` is that 9×9 CNN, and `lux/launch_four.sh` still names the scored wave. Neither script is a temporal Reslim. That handoff is [docs/CNN_STOP_AND_TEMPORAL_20261027.md](../docs/CNN_STOP_AND_TEMPORAL_20261027.md).

The device check, from this checkout on a Lux login node, is `sbatch lux/gpu_check.sh`. That job asks for one GPU and 30 minutes and prints the device name. It does not train.

`sbatch lux/launch_four.sh` repeats z850, surface pressure, skin temperature, and the spring score. Those four are already scored on the H100s.

Job `368876` scored that wave on `lux042` on 27 October 2026. Column water, the 10–20 day band, 500 hPa height, and soil-water layer 4 all miss the 9×9 bar. The reading is [hypothesis_lab/runs/20261027_lux_wave/FINDINGS.md](../hypothesis_lab/runs/20261027_lux_wave/FINDINGS.md). Do not resubmit `bash lux/submit_wave.sh`.

Job `369073` scored the 90-day causal filter on `lux006`. April valley temperature is 0.662 K. The four-week mean is 0.968 K, so it misses the 9×9 bar. The reading is [hypothesis_lab/runs/20261027_daily_window/FINDINGS.md](../hypothesis_lab/runs/20261027_daily_window/FINDINGS.md). Do not resubmit `lux/launch_daily90.sh`. The 180-day and 365-day directories stay uncut.

| Setting | Value |
|---|---|
| GPU | AMD Instinct MI355X, gfx950, 288 GB HBM3E |
| Python | `/lustre/orion/geo172/proj-shared/water4energy/lux-python/torch-gfx950/bin/python` |
| Torch | 2.11.0+rocm7.13.0, HIP 7.13.99004, gfx950 wheel |
| Job | one node, 6 GPUs, one process per GPU, 12 hours, account `geo172` |
| Output | `runs/lux_rocm/<name>/` |

`sbatch lux/launch_wave.sh` asks for one node and six tasks. Each task sees one GPU and calls it `cuda:0`. The table below is the older scored script, `lux/launch_four.sh`.

| Task | Experiment | Examples |
|---|---|---|
| 0 | z850 | `trainingData/headwater_examples_v1_soil_z850` |
| 1 | ps | `trainingData/headwater_examples_v1_soil_ps` |
| 2 | skt | `trainingData/headwater_examples_v1_soil_skt` |
| 3 | spring score | `headwater_examples_spring_soil` |

Task 3 does not train. It scores only when `HEADWATER_K9_RUN` points at a finished 9×9 directory that contains `checkpoint.pt`.

The Frontier run asked one GPU for 78.76 GiB and the Frontier device has 64 GiB. A Lux GPU has 288 GB, which covers that allocation. The Frontier gfx90a PyTorch prefix stays on Frontier.
