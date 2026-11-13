# Water4Energy TVA demo — source reading guide, v0.13.2

This is a derived reading guide for the live agent, not a new experiment, score,
review, approval or operating rule. Its source snapshots are unchanged. Read the
relevant local replay adapter and raw records before answering. Cite the dated
original records below. Do not turn a source omission into a plausible claim.

## Project and selected case

The product is **Water4Energy workbench**. **HEADWATER development** is the research
workflow the demonstration walks. **TVA · 16–22 April 2019**, issued 15 April 2019,
is one selectable case. The workbench does not become a TVA-only product when
that case is opened. See the [12 November action record](https://github.com/daliwang/water4energy_SC26Demo/blob/d9c185da04bb72e51414c72c4004447cd38292ee/Water4Energy_Workbench_Actions_20261112.md).

## 1. What the ledger established

Use `lab.ledger`. In the ledger updated 26 October, `det_v2_soil_k9` is scored and
already tested. Its **April-only valley temperature RMSE is 0.8282 K**, compared
with **1.0903 K** for that week's stored historical field. The **separate four-week
2019 valley temperature RMSE is 0.7668 K**. Its **four-week precipitation RMSE is
0.0301 m**; its **April-only precipitation RMSE is 0.0373 m**. These are error
metrics, not April rainfall totals or temperature means.

The same ledger still marks `april_cold_week_mechanism` open: the frozen 9×9 wins
16–22 April, loses 2–8 April to that week's own stored value, and rain remains
near the stored field. `blocks_reproposal` prevents presenting an unchanged
tested configuration as a novel experiment. A future changed proposal needs a
stated delta and human review; the field does not forbid every related future
hypothesis. See the [original ledger](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/hypothesis_lab/experiment_ledger.json).

## 2. What the weather figures show

Use `lab.realize`, then actually call `display_file` for the returned PNGs. The
map columns are **Reference, Observed, Residual 9×9, Residual Reslim, Temporal
Reslim**. The plotting source maps Residual 9×9 to `det_v2_soil_k9`; the saved
weather figures do not have a bilinear column.

The labelled **weekly valley temperature means**, observed / stored week /
residual 9×9, are **17.3 / 18.2 / 18.0 °C**. The labelled **seven-day accumulated
valley precipitation**, in the same order, is **55.9 / 24.4 / 24.7 mm**. It is not
mm/day. The 9×9 precipitation remains close to the stored week and misses much
of the observed wet week. Use the comparison phrase **the 1979–2017 week already
in the example files**. Do not infer an extra climatological pattern from the
panel's appearance.

Sources: [five-column plotting code](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/scripts/plot_april2019_temporal_reslim.py),
[model-column mapping](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/scripts/plot_obs_target_comparison.py),
and [12 November communication record](https://github.com/daliwang/water4energy_SC26Demo/blob/d9c185da04bb72e51414c72c4004447cd38292ee/Water4Energy_Workbench_Actions_20261112.md).

## 3. Frozen Trial 0 versus bilinear

Use `downscale.scorecard`, then display both existing TP/T2M PNGs. Trial 0's
original scorecard has `split=test`, `n=730`, and standardized metric space.
Global standardized RMSE is:

| Variable | Trial 0 U-Net | Bilinear |
| --- | ---: | ---: |
| T2M | 0.0852923433 | 0.0869391907 |
| TP | 0.3117148441 | 0.3410172119 |
| MSL | 0.0398471137 | 0.0397473065 |

T2M and TP improve; MSL does not. These are **aggregate 730-day test-split
scores**. The displayed **19 April 2019 wet-day maps** illustrate one saved day;
they are not the time span over which these aggregate numbers were scored.
The scorecard names its own `daily_image_trial0` pack and U-Net checkpoint.
Nothing supplied establishes that a HEADWATER forecast was passed into Trial 0.
Do not invent a coupled pipeline. See the [original Trial 0 scorecard](https://github.com/daliwang/water4energy_experiment/blob/ee96c2cc2e257c22c1e0bac6c5a7ec9b9c197ea5/Trial0_run_20260907_220510_scorecard_ext.json).

## 4. Why runoff is an observation

Use `lab.realize`; for a runoff question display the existing runoff PNG and its
source JSON. The committed receipt's April row reports **7.364 mm**, the valley
mean of seven-day accumulated observed **ERA5 surface runoff (`sro`)**. It is not
a HEADWATER runoff forecast or reservoir inflow. The source script's valid
window is issue +1 through issue +7 days.

The workbench chart is a **derived receipt-summary chart**, rendered once from
those committed numbers and frozen for repeatable display. It is not an
original repository spatial runoff map. Raw spatial arrays and a HEADWATER
runoff forecast are absent. Do not attribute the receipt to the ledger or Trial
0 scoring. Sources: [committed receipt](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/hypothesis_lab/runs/20261102_sro_sample/receipt.json)
and [window/units script](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/scripts/insert_sro_into_sample.py).

## 5. Open April gap and the actual review history

Use `lab.design --context tva`. The saved `20261018_iter1_april` directory contains
the Proposer, Critic and Referee, with `experiments.focus` exactly
`april_cold_week_mechanism`. E1 is map diagnosis; E2 is the persistence table; E3
is spring-date cuts; E4 is literature collection. Do not say these role files
or protocols are missing.

Read the dates in order. The **18 October Referee** reports E1 notes and E2's
document-backed slice delivered, with 2019 valley persistence then pending.
The **19 October score slice** records F1 completed at `2026-10-19T23:09:30Z`:
2019 issue-week persistence is **3.0524 K**, worse than `det_v1` **1.4440 K**;
2018 persistence is **1.8997 K**, better than `det_v1` **4.23 K**. F1 is not a
still-missing task. The later **2 November board** records `E_spring_score`
scored/closed: the frozen 9×9 loses 2–8 April, while 16–22 March and 2–8 May beat
their own stored weeks. Do not present E3 as wholly unperformed current work.

The **26 October ledger** still leaves the April mechanism/rain shortfall open.
A new one-change test must state a delta, distinguish itself from these saved
results, and receive review and human approval. Reading an archived pack is
not a new review, experiment or approval. The 12 November demonstration board
lists April rain rank as a read diagnostic with no GPU, not a training job.

Sources: [archived experiments](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/hypothesis_lab/runs/20261018_iter1_april/experiments.json),
[Critic](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/hypothesis_lab/runs/20261018_iter1_april/critique.json),
[dated Referee](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/hypothesis_lab/runs/20261018_iter1_april/referee_brief.md),
[later F1 score slice](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/hypothesis_lab/runs/20261018_iter1_april/april_score_slice.json),
[ledger](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/hypothesis_lab/experiment_ledger.json),
and [original board](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/hypothesis_lab/board.json).

## 6. Commands and approval

Use `lab.show_command` and quote the existing `HEADWATER/lux/train_k9.sh` as text.
It is a supplied Lux 9×9 training script, not proof of the exact H100 command.
The exact original Trial 0 scorer command is absent; checkpoint/config paths
are not a license to invent a replacement command.

The **2 November original board** contains historical true flags, including
`E_daily90.human_flag=true`. Only the separate **12 November demo record** says
the H100 and Lux training flags are both off. Neither is a live scheduler
permission. A person must review the exact target, inputs, command and dated
approval before any future execution. This demo only displays saved command
text; it does not execute it. Sources: [existing Lux script](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/lux/train_k9.sh),
[historical board](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/hypothesis_lab/board.json),
and [12 November demo record](https://github.com/daliwang/water4energy_SC26Demo/blob/d9c185da04bb72e51414c72c4004447cd38292ee/Water4Energy_Workbench_Actions_20261112.md).

## Optional dam panel

`dam.readout` is not installed. No agreed reservoir or plain-language fill/hold
rule is supplied. Explain what inputs are needed; do not invent a threshold,
choose a reservoir, or advise fill/hold. The [April demo plan](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/docs/TVA_AGENT_DEMO_PLAN_20261102.md)
keeps this panel optional.

## Display discipline

Use actual `display_file` calls on returned `/mnt/data/output` paths. Do not echo
raw markdown image syntax or claim a display occurred before the call succeeds.
Existing source JSON and figures are copied without rewriting identical bytes;
no new scientific prediction or score is computed. If a file or capability is
absent, say so.
