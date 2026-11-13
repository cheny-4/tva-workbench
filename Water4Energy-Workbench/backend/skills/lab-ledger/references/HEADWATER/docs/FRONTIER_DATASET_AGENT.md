# Frontier dataset agent

21 October 2026. This is a design, waiting for review. It does not start the spring cut. The protocol it executes is [DATA_PREP_PLAN_20261021.md](DATA_PREP_PLAN_20261021.md), from commit `e1b3f9e`. The skill contract is [data.frontier_cut.md](../hypothesis_lab/skills/data.frontier_cut.md).

The agent is a script on Frontier. It runs one job whose dates, masks, and destination are already in this checkout. A later experiment is a new row in the job table below, committed in git, and then the same script. The Mac proposer stays the place that drafts a protocol. This agent does not draft one.

## Review of `e1b3f9e`

`e1b3f9e` (21 October 2026, “Record the spring-cut protocol…”) is documentation and two date lists. Five files, 281 lines. It does not change `scripts/build_real_examples.py`.

The cut asks whether 16–22 April is one calendar week or the spring around it. Issue dates are 15 March, 1 April, and 1 May, years 1979–2019, minus the 11 March dates the packed hourly copy cannot form. Frontier writes `headwater_examples_spring` (112 files) and, as a separate copy, the eight 2021–2022 files Qi'ao already built. The GPU host copies a finished directory after `manifest.csv` matches. Training stays off both machines until a person accepts the copies.

The last line of the plan is the constraint on this agent: the date list in the checkout is the choice. The Frontier command runs it. The GPU command copies the directory the manifest names.

I checked the date lists against `uncovered_day` and `split_for_year` in `headwater/build_examples.py`. They match the builder.

| Check | Result |
|---|---|
| `spring_issue_dates.txt` | 112 dates, unique, already sorted |
| Months | 30 of 15 March, 41 of 1 April, 41 of 1 May |
| Splits | 106 `example_train_*.npz`, 6 `example_val_*.npz` (2018 and 2019, all three dates) |
| Target windows | 16–22 March, 2–8 April, 2–8 May |
| Dates the shards cannot form | none of the 112 |
| `spring_skipped_dates.txt` | the same 11 rows the builder would skip, including the `train` split and the missing day |
| 1 April and 1 May | all 41 years pass `uncovered_day` |

The 11 skips are 15 March 1979 (condition starts 16 December 1978) and 15 March of 1981, 1985, 1989, 1993, 1997, 2001, 2005, 2009, 2013, and 2017 (each needs 31 December of the previous leap year). That is the same gap as the ten missing 15 January files in [EXAMPLES_V1.md](EXAMPLES_V1.md).

Two facts in the builder matter more than the prose.

`--issues` defaults to `None`. Omitting it calls `first_batch_issues()` and writes the 15 January / 15 April / 15 July / 15 October batch into whatever `--out` was given. The spring command has to pass the 112 dates. An empty `--issues` is also wrong: `nargs="*"` then yields `[]`, and the run plans zero files.

`write_readme` still says the issue day is the 15th of January, April, July, and October. After a spring run that sentence is leftover template text. `manifest.csv` and `skipped_dates.txt` are the lists that count. The agent copies the skip file into the output directory and does not treat the generated README as the protocol.

`matches_version0` compares a finished file with `headwater_examples_v0` when the same filename exists there. Version 0 holds `example_train_20100115.npz` and `example_val_20180115.npz`. No spring filename collides with those two, so that check returns without reading them.

## What is already on Frontier

Looked up on 21 October 2026 from this checkout. Names and sizes only. No array was loaded, and nothing was copied.

| Path | State |
|---|---|
| `/lustre/orion/world-shared/lrn036/data/superres/era5/1.0_deg` | present (`lat.npy`, `lon.npy`, `train/`, `val/`, `test/`) |
| `.../trainingData/headwater_examples_v1` | 153 files, each 538,111,714 bytes |
| `.../trainingData/headwater_examples_v0` | the two January files above |
| `.../trainingData/headwater_examples_v1_ps` | present |
| `.../trainingData/headwater_examples_v2` | absent at the path in [FRONTIER_CONTINUE.md](FRONTIER_CONTINUE.md) |
| `.../trainingData/headwater_examples_spring` | absent |
| `/lustre/orion/geo172/proj-shared/water4energy/trainingData/headwater_examples_v1_soil` | present |
| `.../cql0536/HEADWATER/data/headwater_examples_2021_2022_v1` | present, 8 files |
| `.../trainingData/headwater_examples_2021_2022` | absent |
| `/lustre/orion/world-shared/csc662/jyc/weatherbench2/scripts/check_nan.py` | present. The builder calls it before it writes `manifest.csv`. |

The eight 2021–2022 files are `example_test_YYYYMMDD.npz` for 15 January, 15 April, 15 July, and 15 October in 2021 and 2022. Each is 538,111,714 bytes. `manifest.csv` there has a `source` column set to `zarr`. `split_for_year` stops at 2020, so `build_real_examples.py` cannot write these years. The copy job copies the directory. It does not rename `test` to `val` and it does not rebuild them.

The Slurm account and queue used for the version-1 cut are not in this repository. The plan says to submit on that account if a login node will not hold the read. Until those two names are written into the job table by a person, the agent stops instead of submitting.

## Job table

The script may run a row in this table and no other. Paths are the ones in the 21 October plan.

| Job id | Kind | Output |
|---|---|---|
| `spring_cut_20261021` | `scripts/build_real_examples.py` with `--issues` set to the 112 dates | `/lustre/orion/lrn105/proj-shared/wangd/water4energy/trainingData/headwater_examples_spring` |
| `copy_2021_2022` | `rsync -a` of the Qi'ao directory, then `file_list.txt` | `/lustre/orion/lrn105/proj-shared/wangd/water4energy/trainingData/headwater_examples_2021_2022` |

A third experiment, when there is one, is a commit that adds a row and a protocol note. The script refuses an id that is not in the table. It also refuses a row whose output path is any of these:

- `headwater_examples_v0`
- `headwater_examples_v1`
- `headwater_examples_v1_ps`
- `headwater_examples_v1_soil`
- `headwater_examples_v2`
- the hourly shard tree under `world-shared/lrn036`
- the Qi'ao source directory (read-only for the copy job)

Version 2 being absent today does not make that path a legal output. The soil directory is on `geo172`. The spring directory is on `lrn105`. The agent uses the path on the row.

## How a run goes

The launcher is [scripts/frontier_data_prep.sh](../scripts/frontier_data_prep.sh). It runs the 2021–2022 copy and the spring build, then writes `build_receipt.txt`. [scripts/monitor_frontier_data_prep.sh](../scripts/monitor_frontier_data_prep.sh) is a second process. It reads the log and the file counts. It does not build, copy, or train.

```bash
bash scripts/frontier_data_prep.sh --check

mkdir -p runs/frontier_data_prep
setsid nohup bash scripts/frontier_data_prep.sh \
  > runs/frontier_data_prep/nohup.out 2>&1 < /dev/null &

setsid nohup bash scripts/monitor_frontier_data_prep.sh --watch 60 \
  > runs/frontier_data_prep/monitor.out 2>&1 < /dev/null &
```

Version 1 wrote 151 new files in 164 minutes with 8 workers, so one Slurm job for all 112 spring dates does not fit the 2-hour limit. `bash scripts/frontier_data_prep_submit.sh` submits March, April, and May together, 16 workers each, then a finalize job after they succeed. Each request is 1 hour 50 minutes on one `geo172` batch node. `nohup` of `scripts/frontier_data_prep.sh` remains the login-node run, which has no 2-hour cap.

`--check` only runs the preflight. The launch commands above are what write the example directories.

### Preflight

1. The shard root exists, and `check_nan.py` is on disk. If the shard root is absent, this is the wrong machine. Stop.
2. Record the SHA. Refuse to run if the date lists, `docs/DATA_PREP_PLAN_20261021.md`, or the builder differ from that SHA. The script does not `git pull`, and it does not edit the date lists.
3. Re-read `docs/protocols/spring_issue_dates.txt` and `spring_skipped_dates.txt`. The counts in the review table above have to hold, and every kept date has to pass `uncovered_day`.
4. The output paths are the spring directory and the 2021–2022 copy directory. Version 1 has to already contain 153 examples.
5. If the spring directory already contains `example_*.npz`, the run is a resume. The builder keeps a file whose stored issue date already matches. Those files stay.
6. `--check` prints the result and exits before any example write.

The spring argv is the command in the plan: `--out` set to the spring directory, `--issues` set to the 112 dates, `--workers` left at the builder default of 8. After a zero exit, copy `docs/protocols/spring_skipped_dates.txt` to `skipped_dates.txt` in that directory.

### Pass rule for the spring job

The five counts from the plan, then one more:

| Check | Required |
|---|---|
| `example_*.npz` | 112 |
| `manifest.csv` data rows | 112 |
| `example_train_*.npz` | 106 |
| `example_val_*.npz` | 6 |
| files of size 538,111,714 bytes | 112 |
| version 1 `example_*.npz` | still 153 |
| `skipped_dates.txt` | the same 11 rows as the protocol file |

`check_nan` runs inside the builder, once per target window, before `manifest.csv` is written. If it fails, examples may already be on disk and the manifest may be missing. The agent leaves those files in place, writes a failed receipt, and does not start the copy job. A later `--execute` resumes them.

### The 2021–2022 copy

This job does not call the builder.

The source today is `/lustre/orion/proj-shared/lrn105/cql0536/HEADWATER/data/headwater_examples_2021_2022_v1`, with the eight `example_test_*.npz` files above. If that directory is missing on the day of the run, the receipt says `source_absent` and the job stops. If the count is something other than eight, the plan still says to copy it, keep `file_list.txt`, and stop. The agent does that. It does not merge the files into version 1 or into the spring directory.

### Receipt

On `--execute`, the job writes `build_receipt.txt` in its own output directory. Trainers load `example_*.npz`, so a text file beside them is unread by a fit. The receipt names the job id, the git SHA, the argv or the rsync source, the counts, and one status: `ready_for_human_copy`, `failed`, or `source_absent`.

The script does not rsync to `ccsi-gpu-node1`. A person reads the receipt and then runs the GPU-host copy in the plan. No train is launched from either job.

## Stops

- A dirty tree, or a pull that is not fast-forward.
- A date count other than 112, or any date that `uncovered_day` rejects. One such date aborts the whole builder run.
- An argv that omits `--issues`.
- An output path on the protected list, including version 1 and the soil directory.
- Deleting a directory that already holds `example_*.npz`.
- `scripts/build_examples_v2.py` on the spring directory or the eight later files. That script requires 153 files, rejects March and May, and writes the Gulf field.
- Filling `oni` or `surface_runoff` on this pass.
- A Slurm request longer than 2 hours on this association. The script asks for 2 hours on `geo172` / `batch`. A longer request was rejected on 21 October 2026.
- A train or a score.
- Rewriting the date list, the skip file, or the builder so that a refused date will pass.

## After this design is accepted

| Piece | Path | Now |
|---|---|---|
| This note | `docs/FRONTIER_DATASET_AGENT.md` | written for review |
| Skill contract | `hypothesis_lab/skills/data.frontier_cut.md` | written for review |
| Executor | `scripts/frontier_data_prep.sh` | written. `--check` passes on login05. It has not been launched |
| Monitor | `scripts/monitor_frontier_data_prep.sh` | written. A one-shot report on an unlaunched run says `not_started` |
| Preflight test | `tests/test_frontier_dataset_agent.py` | not written. `--check` is the preflight |
| Prompt for an LLM on Frontier | none | A prompt would be a place to invent a date. `hypothesis_lab/RUNTIME.md` already keeps the proposer off Frontier login nodes. |

`--check` reads the shards' date rule and does not write an example directory. The `nohup` and `sbatch` launches are the run.

## Check log

Recorded so this note can be reviewed without the chat.

- Read `e1b3f9e` and the five files it touches, then `scripts/build_real_examples.py`, `headwater/build_examples.py`, [TRAINING_DATA_DESIGN.md](TRAINING_DATA_DESIGN.md), [EXAMPLES_V1.md](EXAMPLES_V1.md), [QIAO_ASSIGNMENT.md](QIAO_ASSIGNMENT.md), [FRONTIER_CONTINUE.md](FRONTIER_CONTINUE.md), and [hypothesis_lab/RUNTIME.md](../hypothesis_lab/RUNTIME.md).
- Ran the two date files through `uncovered_day` and `split_for_year` with Python 3.11. The table in the review section is that run. The system `python3` is 3.6 and cannot import the package.
- Searched the repo for a Slurm account or queue tied to the version-1 cut. None is recorded.
- Listed the directories in the table above. Counted version 1 (153 files, one size). Listed the eight 2021–2022 names and read that directory’s `manifest.csv`. Confirmed `check_nan.py` is on disk. Confirmed the spring destination and the 2021–2022 destination are absent.
- Did not run `build_real_examples.py`. Did not `rsync`. Did not submit a job. Did not change a date list.
- 21 October 2026, later: added `scripts/frontier_data_prep.sh` and `scripts/monitor_frontier_data_prep.sh`. `--check` passed on `login05`. A one-shot monitor report said `not_started`. `sbatch --test-only` accepted a 2-hour `geo172` batch job and left the queue empty. A 12-hour request was rejected because this association's walltime limit is 120 minutes. The spring directory was still absent after these checks.
