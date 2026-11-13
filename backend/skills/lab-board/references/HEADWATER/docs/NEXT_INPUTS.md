# Next inputs for the four issue weeks

13 October 2026. This is the build order for the next HEADWATER examples. The reason for these fields is [JULY2019_SOUTHEAST_DEPARTURE.md](JULY2019_SOUTHEAST_DEPARTURE.md). The case design they attach to is [TRAINING_DATA_DESIGN.md](TRAINING_DATA_DESIGN.md). The baseline checkpoint stays `runs/det_v1`.

Do not cut more issue dates in this pass. Do not start a sliding window. Do not rebuild the 1979–2019 examples from the hourly archive. Append to a copy.

## What version 2 already contains

The copy was written on 13 October 2026 by `scripts/build_examples_v2.py`. It is `headwater_examples_v2`, 153 files, beside version 1. The maps, the targets, and `reference_train` are the version-1 arrays. Version 1 was not edited.

| Addition | State in these files |
|---|---|
| Oceanic Niño Index | Filled. `index_names` is still `['oni']`. `index_mask` is 1 on all 153 files. No season was missing. |
| Gulf temperature anomaly | Computed and stored as `gulf_sst_anomaly`, with `gulf_sst_mask` 1. It is not an index. The network does not read it. |
| Surface pressure | Not in the files. The 1° shards are not mounted on the machine that wrote this copy. |
| Root-zone soil moisture | Not in the files. |

`index_manifest.csv` in that directory lists the ONI value, the center month, the Gulf mean, and the Gulf anomaly for each file. July 2019 uses the May 2019 ONI, +0.64. April 2019 uses February 2019, +0.86. The 1979–2017 Gulf means are 296.33 K (15 January), 297.70 K (15 April), 302.35 K (15 July), and 301.10 K (15 October). 2018 and 2019 are not in those means. The July 2019 Gulf anomaly is +0.24 K.

Git does not carry the arrays. `*.npz` is ignored. A pull on Frontier gets this note, the builder, the manifest, and `headwater_examples_v2/README.md`. It does not get the 82 GB of example files.

The filled copy on the machine that built it is

`/mnt/proj-shared/VASTdata/7xw/Water4Energy/HEADWATER/headwater_examples_v2`

The version-1 files Frontier already has are

`/lustre/orion/lrn105/proj-shared/wangd/water4energy/trainingData/headwater_examples_v1`

If that Frontier copy is the one to extend, rebuild the index fields there first. Do not recompute them by hand. From a HEADWATER checkout:

```bash
python3 scripts/build_examples_v2.py \
  --source /lustre/orion/lrn105/proj-shared/wangd/water4energy/trainingData/headwater_examples_v1 \
  --dest /lustre/orion/lrn105/proj-shared/wangd/water4energy/trainingData/headwater_examples_v2 \
  --indices /lustre/orion/lrn105/proj-shared/wangd/water4energy/trainingData/processed/monthly/indices_monthly.nc
```

That index path is the Frontier copy of `trainingData/processed/monthly/indices_monthly.nc`. The checkout-and-run sequence, including the pressure command, is [FRONTIER_CONTINUE.md](FRONTIER_CONTINUE.md). Leave the version-1 directory unchanged.

## Frontier step: append surface pressure

This is the part that has to run on Frontier. The shards are

`/lustre/orion/world-shared/lrn036/data/superres/era5/1.0_deg`

`scripts/append_surface_pressure.py` reads those shards. It refuses to start if that directory is missing, so it will not run on the machine that built the index copy.

Before it writes, it opens one 2019 shard and lists keys whose names contain pressure, geopotential, soil, or snow. The field it appends is `surface_pressure` only. If `geopotential_850` is in the shard, the script records the name and does not add it. If `surface_pressure` is absent, it stops. It does not fill the channel from the 64×32 sea-level-pressure store.

For each example it takes the 90 days that end on `issue_time`, the same days already in `condition`, and reads `surface_pressure` at 00:00 UTC. That map is channel 23. Channels 0–22 stay in their current order. The new shape is `(90, 24, 180, 360)`. ONI, the Gulf anomaly, the target, and `reference_train` are copied through. The source directory is not modified.

```bash
python3 scripts/append_surface_pressure.py \
  --source /lustre/orion/lrn105/proj-shared/wangd/water4energy/trainingData/headwater_examples_v2 \
  --dest /lustre/orion/lrn105/proj-shared/wangd/water4energy/trainingData/headwater_examples_v2_ps
```

The destination is about the same size as the source, a little over 80 GB, because the pressure channel is one more global map for each of 90 days. `validate_example` still requires 23 channels. These files will not pass that check until `CONDITION_NAMES` lists `surface_pressure` last. That code change is part of training `runs/det_v2_ps`, not part of writing the files. A `det_v1` checkpoint cannot be loaded into the wider network.

## What stays fixed

| Item | Keep |
|---|---|
| Issue dates | 15 January, 15 April, 15 July, 15 October |
| Years | Train 1979–2017 (145 files). Stop on 2018. Report 2019 untouched. |
| Condition length | 90 days through the issue date |
| Target | Lead 1, days +1 through +7. Weekly-mean 2 m temperature and the 7-day precipitation sum. Runoff stays empty, mask 0. |
| Reference | The same `reference_train` already in each version-1 file. Do not recompute it. |
| Loss | Residual: observed week minus that reference. Add the reference back for the plotted map. |
| Score | Valley and global RMSE for temperature and precipitation, next to the issue week and the reference. The number that has to move is valley temperature on the four 2019 weeks, and on 16–22 April and 16–22 July in particular. |

`runs/det_v1` valley temperature on those two weeks is 1.44 K against a reference of 1.09 K in April 2019, and 1.21 K against 1.21 K in July 2019. July persistence, the week just observed, is 1.02 K. A new run is useful if it beats `det_v1` on those rows without using 2019 to stop.

Write the new files beside version 1, as `headwater_examples_v2`. Leave the 153 version-1 files unchanged.

## Order

Three additions, one at a time. Retrain after each one and keep that checkpoint. Do not add all three and then try to see which one moved the map.

| Step | Field | Where it goes | New maps? |
|---|---|---|---|
| 1 | Oceanic Niño Index | The existing `oni` slot | No |
| 2 | Surface pressure | One new condition channel | Yes, one channel, from the hourly shards |
| 3 | Gulf of Mexico temperature anomaly | A second index, beside ONI | No. Computed from the temperature map already in the file. |

Root-zone soil moisture is step 4. After the Niño, Gulf, and surface-pressure scores, that training run is deferred until the WeatherBench root-zone examples are fully written and ready for training (`headwater_examples_v1_soil`). It is not cancelled. Layer 1 remains the only soil field in the version-1 channels.

## Step 1. Fill ONI

Done in `headwater_examples_v2`. The rule below is what the builder used. Do not fill the slot a second time with a different lag.

`validate_example` requires `index_names` to be `['oni']` and the value to have length 1. `WeeklyDeterministic.index_bias` is a linear map from that one number. Filling the slot does not change the network’s shape. The version-1 files store NaN and `index_mask` 0, so the term is zero today.

Source: `oni` in `trainingData/processed/monthly/indices_monthly.nc`. The project’s month rule is center-month: DJF is January, JFM is February, and so on.

Use only a season whose three months all end before the issue month. The issue day is the 15th, so the issue month itself is not finished.

| Issue | Last allowed season | Center month |
|---|---|---|
| 15 January | OND of the previous year | November |
| 15 April | JFM | February |
| 15 July | AMJ | May |
| 15 October | JAS | August |

Copy each version-1 file. Replace `index_values` with that season’s ONI and set `index_mask` to 1. If the season is missing, leave the mask at 0 and list the file. Do not fill a missing season with zero.

Retrain with the same residual setup as `det_v1`: hidden width 64, learning rate 0.001, cosine latitude weights, stop on 2018, report 2019. Save the run as `runs/det_v2_oni`.

ONI is one number for the whole globe. It can shift the broad pattern. It cannot place the cold side of the valley or the warm side south of the box. That is still a successful step if the global anomaly correlation on 2019 rises from the `det_v1` value of about 0.15 and the April valley row does not get worse.

## Step 2. Append surface pressure

The literature field for the July high is 850 hPa geopotential height (Li et al., 2011). That height is not one of the 23 channels. Mean sea-level pressure is not on the 1° hourly shards; it is on the 64×32 daily store only. Surface pressure is on those shards and was left out of the example list (`model/docs/HEADWATER_ERA5_Frontier_Dataset_Report.md`).

Run this on Frontier with `scripts/append_surface_pressure.py`, as written in the Frontier section above. The shards are

`/lustre/orion/world-shared/lrn036/data/superres/era5/1.0_deg`

The script confirms the key before it writes. The expected name is `surface_pressure`, in pascals, shape `(438, 1, 180, 360)`, at 00:00 UTC on the same days as the other channels. If a `geopotential_850` key is present, the script records it and still adds surface pressure only. Do not download a new archive for this step.

It appends the 90 daily surface-pressure maps as condition channel 23. The existing 23 stay in their current order. The condition shape becomes `(90, 24, 180, 360)`.

That shape is a new contract. `CONDITION_NAMES`, `N_CONDITION`, and the tests that lock the list at 23 have to accept 24 names, with `surface_pressure` last. The first convolution then sees 48 inputs, because the trunk still concatenates the 90-day mean and the last-7-day mean. A `det_v1` checkpoint cannot be loaded into that network. Train from the start. Save the run as `runs/det_v2_ps`.

A 1×1 kernel still does not see the cell next door, so this channel cannot draw the outline of the high. The test is whether the local pressure departure moves the valley temperature on 16–22 April 2019 and 16–22 July 2019 relative to `det_v2_oni`. The neighbor trunk remains a later model change. It is not part of this data pass.

## Step 3. Gulf temperature anomaly

The anomaly is already stored on each version-2 file as `gulf_sst_anomaly`. Promoting it to a second index is still waiting on a scored ONI run. That promotion requires the index vector to grow from length 1 to length 2, `index_bias` to accept two inputs, and `validate_example` to allow the name `gulf_sst`. Do this only after step 1 has been scored, so the Niño effect is already known.

The box is 18–30°N, 98–82°W. The value is the cosine-weighted mean of `2m_temperature` over ocean cells in that box, on the issue date. In this copy the ocean part of that field is the filled sea-surface temperature. Land cells in the box are excluded with `land_sea_mask`.

Store the anomaly, not the raw temperature. Subtract the 1979–2017 mean of that same box on that same issue date. July is always warm; a raw value would be another copy of the calendar. Years after 2017 stay out of that mean, as they stay out of `reference_train`.

Retrain as `runs/det_v2_gulf`. Compare the July 2019 valley row with `det_v2_ps`.

## Step 4. Root zone (deferred until the training files are ready)

18 October 2026. Do not start `runs/det_v2_soil` in this pass. The WeatherBench copy supplies layers 2 and 3; the example directory is `headwater_examples_v1_soil` (mean of those layers, layer 1 kept). Pick this run up only after that directory has all 153 examples and is ready for training. Compare with `runs/det_v1` the same way as the other single-field rows.

When the files are ready: keep layer 1; append the root-zone mean as the next condition channel; ocean cells may be slightly negative, as they are for layer 1—do not floor them. Retrain as `runs/det_v2_soil`. This is a summer temperature term. It is not a reason to expect the model to place storms in the Tennessee Valley.

## What not to mix in

- More issue dates, including 15 March, 1 April, and 1 May.
- A start day on every day.
- Sea-surface temperature as its own map. It duplicates `2m_temperature` over the ocean in this copy.
- A second copy of the 1979–2017 reference as an input or as a second target.
- 2019, in the fit, in the stopping rule, or in any new climatology.
