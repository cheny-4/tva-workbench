# Data preparation — spring cut and the two transfers

21 October 2026. This is the preparation that can run now, while the four-week valley Reslim train continues on the existing soil files. A checkout of this note is the protocol. Frontier builds. The GPU host copies. Neither side chooses new dates.

The four issue weeks stay the scored experiment. This cut asks the next question: whether 16–22 April is one calendar week or the spring around it. The explanation for the team and for program readers is [SPRING_SET_PURPOSE.md](SPRING_SET_PURPOSE.md). A sample on every week, and the full runoff archive, stay out of this pass. The reason is [TRAINING_DATA_DESIGN.md](TRAINING_DATA_DESIGN.md). The holds in the note to Qi'ao are the same holds.

## What each machine does

Git carries this note and the date lists. It does not carry the NPZ files. Pull this repository on each machine, then do only that machine's rows.

| Machine | After `git pull` | Writes | Leaves alone |
|---|---|---|---|
| Frontier | The 1° shards are on this machine | `headwater_examples_spring` (112 files). A copy of the eight 2021–2022 files, if that source directory is already there | `headwater_examples_v1`, `headwater_examples_v2`, `headwater_examples_v1_soil`, the hourly shards |
| GPU host (`ccsi-gpu-node1`) | Frontier has finished a directory and its `manifest.csv` matches the counts below | `HEADWATER/headwater_examples_spring` and `HEADWATER/headwater_examples_2021_2022` | The running `runs/det_v2_reslim_valley01` job and `headwater_examples_v1_soil`. No train on the new directories |
| This checkout (control) | — | This protocol | A training launch. That starts only after both copies are in place and a person accepts them |

The two cluster steps do not negotiate. Frontier writes a new directory and the manifest the builder already emits. The GPU host copies that directory only. A later train reads the staged directory. It does not read Frontier.

## Contract for the spring files

Same file contract as version 1. `scripts/build_real_examples.py` already writes it when `--issues` is set.

| Item | Value |
|---|---|
| Issue dates | 15 March, 1 April, and 1 May, years 1979–2019, minus the 11 March dates in [protocols/spring_skipped_dates.txt](protocols/spring_skipped_dates.txt) |
| Passed to the builder | The 112 dates in [protocols/spring_issue_dates.txt](protocols/spring_issue_dates.txt): 106 `example_train_*.npz`, 6 `example_val_*.npz` |
| Condition | 90 days through the issue date, including that date. 23 version-1 channels |
| Target | Lead 1, days +1 through +7. Windows are 16–22 March, 2–8 April, and 2–8 May. Each window gets its own `reference_train` |
| `reference_years` | 1979–2017. 2018 and 2019 stay out of the mean |
| Names | Training years `example_train_YYYYMMDD.npz`. Check years `example_val_YYYYMMDD.npz` |
| Runoff | NaN on every cell. `variable_mask` is 1, 1, 0 |
| ONI | NaN. `index_mask` is 0. The builder writes it that way. Do not fill it in this pass |
| Per-file size | 538,111,714 bytes, the version-1 size, because the channel count is unchanged |
| Directory size | About 60 GB |

The 11 omitted March issues need a day the packed hourly copy does not store. 15 March 1979 starts on 16 December 1978. Each later omitted March includes 31 December of the previous leap year (1980, 1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016). That is the same gap as the ten missing 15 January files in [EXAMPLES_V1.md](EXAMPLES_V1.md). Leave them missing. Do not splice them from the zarr.

`--issues` aborts the whole run if any date needs a missing day. Pass only `spring_issue_dates.txt`. The builder then reports zero skips, and the README it writes still describes the original 15 January / 15 April / 15 July / 15 October batch. That sentence is leftover template text. `manifest.csv` and `spring_skipped_dates.txt` are the lists that count. Copy the skip file into the output directory so the directory carries the omission.

1 April and 1 May never ask for 31 December. All 41 years of each are in the date list, including 1979, 2018, and 2019.

## Frontier — spring cut

Shards:

`/lustre/orion/world-shared/lrn036/data/superres/era5/1.0_deg`

Destination, a new directory:

`/lustre/orion/lrn105/proj-shared/wangd/water4energy/trainingData/headwater_examples_spring`

From the HEADWATER checkout:

```bash
git pull

mapfile -t ISSUES < docs/protocols/spring_issue_dates.txt
test "${#ISSUES[@]}" -eq 112

python3 scripts/build_real_examples.py \
  --out /lustre/orion/lrn105/proj-shared/wangd/water4energy/trainingData/headwater_examples_spring \
  --issues "${ISSUES[@]}"

cp docs/protocols/spring_skipped_dates.txt \
  /lustre/orion/lrn105/proj-shared/wangd/water4energy/trainingData/headwater_examples_spring/skipped_dates.txt
```

A rerun keeps a file whose stored issue date already matches. It does not refresh version 1. If the command stops on a missing day, the date list was not the one in this checkout: fix the list, and delete the destination only when it contains no `example_*.npz`.

If a login node will not hold a long read of the shards, submit that same command on the account and queue used for the version-1 cut. The destination path stays the one above.

### Check before telling the GPU host to copy

```bash
OUT=/lustre/orion/lrn105/proj-shared/wangd/water4energy/trainingData/headwater_examples_spring
echo "examples $(find "$OUT" -name 'example_*.npz' | wc -l)"
echo "manifest rows $(($(wc -l < "$OUT/manifest.csv") - 1))"
echo "train $(find "$OUT" -name 'example_train_*.npz' | wc -l)"
echo "val $(find "$OUT" -name 'example_val_*.npz' | wc -l)"
find "$OUT" -name 'example_*.npz' -size 538111714c | wc -l
```

The five numbers are 112, 112, 106, 6, and 112. `skipped_dates.txt` is present and lists the 11 March dates. Version 1's file count is still 153.

## Frontier — 2021–2022 copy

This is a copy of a directory Qi'ao already built. It is not a new cut from the 1979–2020 shards. `split_for_year` stops at 2020, so `build_real_examples.py` cannot write these years.

Source, if it is there:

`/lustre/orion/proj-shared/lrn105/cql0536/HEADWATER/data/headwater_examples_2021_2022_v1`

Destination, its own directory:

`/lustre/orion/lrn105/proj-shared/wangd/water4energy/trainingData/headwater_examples_2021_2022`

```bash
SRC=/lustre/orion/proj-shared/lrn105/cql0536/HEADWATER/data/headwater_examples_2021_2022_v1
DST=/lustre/orion/lrn105/proj-shared/wangd/water4energy/trainingData/headwater_examples_2021_2022
test -d "$SRC"
rsync -a "$SRC"/ "$DST"/
find "$DST" -name 'example_*.npz' -printf '%f\n' | sort > "$DST/file_list.txt"
```

Eight files is the expected count: the 15th of January, April, July, and October in 2021 and 2022. If the source has a different count, copy it anyway, keep `file_list.txt`, and stop. Do not merge these files into `headwater_examples_v1` or into the spring directory. They stay out of training. `reference_train` on them stays the 1979–2017 mean.

Send, with the path, the file list and the schema check already run on that source. This checkout does not repeat that check.

## GPU host — copy finished directories

Run this on `ccsi-gpu-node1` after the Frontier counts match. The soil train keeps reading `headwater_examples_v1_soil`. These commands write sibling directories.

```bash
cd /mnt/proj-shared/VASTdata/7xw/Water4Energy/HEADWATER
git pull

rsync -a --partial \
  wangd@frontier.olcf.ornl.gov:/lustre/orion/lrn105/proj-shared/wangd/water4energy/trainingData/headwater_examples_spring/ \
  /mnt/proj-shared/VASTdata/7xw/Water4Energy/HEADWATER/headwater_examples_spring/

rsync -a --partial \
  wangd@frontier.olcf.ornl.gov:/lustre/orion/lrn105/proj-shared/wangd/water4energy/trainingData/headwater_examples_2021_2022/ \
  /mnt/proj-shared/VASTdata/7xw/Water4Energy/HEADWATER/headwater_examples_2021_2022/
```

Repeat the five spring counts on the GPU copy. They match Frontier before anyone points a trainer at the directory. The 2021–2022 copy matches `file_list.txt`. Do not start that trainer from this note.

## ONI, later, on a copy

`headwater_examples_v2` already holds the Oceanic Niño Index for the 153 version-1 issue dates, with the Gulf anomaly stored beside it. Do not fill that slot again, and do not run `scripts/build_examples_v2.py` on the spring directory or on the eight 2021–2022 files. That script requires 153 files, rejects March and May, and writes the Gulf field.

When a later copy fills ONI, the season is the one whose three months end before the issue, from NOAA CPC `ANOM`:

https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt

| Issue date | Season | Year on the CPC row | Center month |
|---|---|---|---|
| 15 January | `OND` | previous year | November |
| 15 March | `DJF` | the issue year | January |
| 1 April and 15 April | `JFM` | the issue year | February |
| 1 May | `FMA` | the issue year | March |
| 15 July | `AMJ` | the issue year | May |
| 15 October | `JAS` | the issue year | August |

`DJF 2010` is December 2009 through February 2010. A missing season stays NaN with `index_mask` 0. Weather maps, targets, and `reference_train` stay as the builder wrote them. The four-week rows of this table are what version 2 already used. March and May are the rows that script does not know.

## What this pass does not start

- Issue dates other than the 112 in `spring_issue_dates.txt`. A weekly or daily archive is a different product. See [TRAINING_DATA_DESIGN.md](TRAINING_DATA_DESIGN.md).
- Another cut of 15 January, 15 April, 15 July, or 15 October.
- Filling the 11 missing March dates, or the ten missing 15 January dates.
- `QRUNOFF` in `surface_runoff`, flooring negative runoff, or storing ocean runoff as zero. The full E3SM runoff build stays held.
- Training, or scoring, on the spring files or the 2021–2022 files.
- An agent on Frontier or on the GPU host that picks dates, masks, or destination directories. The date list in this checkout is the choice. The Frontier command runs it. The GPU command copies the directory the manifest names.
