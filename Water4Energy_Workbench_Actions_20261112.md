# Water4Energy workbench — actions for 12 November 2026

**For:** Yang Chen
**From:** Dali Wang
**Package:** the workbench you already ship, interface v0.12.1
**Goal:** make that interface the workbench for the whole project, and add the HEADWATER development path beside the TVA path, in time for today’s demo.

The science sentences below are fixed. This pass does not need a live ledger, a new VISTA project, or a job submission.

Edit your workbench tree (v0.12.1). Leave the copy under `Downscaling_Interface/` alone. Keep the VISTA project id `Water4Energy-TVA-agent-loop`, the launcher filenames, and the ORNL and Genesis marks. Bump the on-screen version to **v0.13.0** so a demo tab is obviously this build.

The folder may stay `TVA-Workbench`. The on-screen name becomes **Water4Energy workbench**.

## 1. Rename the product on screen

| Where | Now | Becomes |
|---|---|---|
| Page title, sidebar brand small-text, top breadcrumb prefix | TVA Research Workbench / TVA HYPOTHESIS LAB | **Water4Energy workbench** |
| Sidebar project label and footer | TVA research workbench · TVA WORKBENCH | **Water4Energy workbench** |
| Chat agent label | TVA agent | **Water4Energy agent** (the VISTA chip stays) |
| Case Lab titles, History “Back to…”, “Try this question in…”, “Questions for this TVA case” | TVA Case Lab | **Case Lab** |
| Meta description | Explore TVA decisions | Method, HEADWATER development, and the April TVA case |

Files: `public/index.html`, `public/app.js` (breadcrumb map in `switchView`), `public/case-journey.js` (the prepare-question button and the question-menu summary).

## 2. Add a HEADWATER development view beside TVA

New sidebar item, second, directly under Hypothesis lab:

**HEADWATER development**

Order: Hypothesis lab → **HEADWATER development** → TVA network → Case Lab → Results Library → Literature library → Skills & sources.

TVA network, the 54 locations, the fill-or-hold questions, the April case, Trial 0, the ERA5 runoff panel, and the optional dam readout stay as they are. They are one track of the project.

On Hypothesis lab, add a second path above the current three-step TVA path:

1. **HEADWATER development** → the new view
2. **TVA case** → the existing path (method → TVA network → Case Lab)

The six-node map stays the method. Clicking a node still only prepares a question. It does not start Proposer, Critic, Referee, or a train.

## 3. What the new view shows

One static page, five stages, in this order. This is the demo walk. A clicked stage opens a short card. It does not call VISTA, set `human_flag`, or submit a job.

1. **Hypothesis.** Ledger, then Proposer, Critic, Referee. Link: open Hypothesis lab. Line: the lab starts from what was already scored.
2. **Data.** Frontier. **153** weekly examples, then the root-zone soil copy. The dates and the destination were already written down. The dataset agent runs that committed job.
3. **Design.** The brief names one change. A person picks that experiment and sets the training flag. Button label: **Review this in Case Lab**. It only fills the composer.
4. **Execution.** The same brief is the job. Name the H100s (`ccsi-gpu`) as where `det_v2_soil_k9` was trained, and Lux as nine scored run directories. List the nine names below. No valley temperature on the Lux card.
5. **Score.** The 2019 valley number returns to the ledger, and the next brief is written from that ledger. Show one figure slot. Until a file is dropped in, use a labeled empty frame: “April map supplied for the demo.” Preferred file, if it is added: a static copy of the valley temperature figure for 2019, placed in `public/assets/`. Caption the **16–22 April 2019** week only.

Lux run names, listed as scored on Lux. Their score files are on Lux, not in this checkout:

| Run on Lux | What it is |
|---|---|
| `det_v2_reslim_patch2_obs` | Reslim. Attention is over patches and variables. It does not run along the 90 days. |
| `det_v2_soil_k9_obs` | 9×9 soil CNN |
| `lux_rocm/valley_cnn` | 9×9 CNN |
| `lux_rocm/band` | 9×9 CNN plus the 10–20 day band |
| `lux_rocm/daily90` | Named as a Lux score. The trainer script in this tree is still the 9×9 CNN. |
| `lux_rocm/tcwv` | 9×9 CNN, column water vapour |
| `lux_rocm/z500` | 9×9 CNN, 500 hPa height |
| `lux_rocm/z850` | 9×9 CNN, 850 hPa height |
| `lux_rocm/layer4` | 9×9 CNN, soil-water layer 4 |

Under the five stages, a small dated board (12 November 2026). Both training flags are off:

| Row | Where | What the card may say |
|---|---|---|
| April rain rank | Frontier | Reads the soil files. No GPU. |
| Lux device check | Lux, one MI355X | Prints the device name. Does not train. |
| Column water `E_tcwv_9x9` | Designed | Waits on the rank file and a person. |
| 90-day daily filter | Designed | An odd temporal kernel cannot see all 90 days. |
| Temporal attention along the 90 days | Not a row | No script and no board row. |

A local video mount sits at the top of this view: poster frame of the six-node map, play on click, no autoplay with sound, captions on. The file is not in the tree yet. Use `public/assets/water4energy-workbench-90s.mp4` when it arrives, and leave the player hidden until that file exists.

Promote the existing Frontier, Lux, H100 / CCSI, and Odo cards onto this view as read-only status. Connection settings remains the only place that saves the backend URL and the project name.

## 4. Copy that is allowed on the new view

- Model `det_v2_soil_k9`, fit on 1979–2017, stopped on 2018, scored on 2019.
- Four-week valley temperature: **0.77°C** against **0.86°C** for the 1979–2017 week stored in the example files. Exact figures if a table needs them: **0.767 K** and **0.861 K**. Say degrees Celsius in any sentence. Use kelvin only in the table, labeled as a difference.
- July is behind that week: 1.260 K against 1.211 K.
- April rain, same week: observed **55.9 mm**, 1979–2017 week **24.4 mm**, 9×9 map **24.7 mm**. The map redrew the historical week.
- Root-zone soil, prepared on Frontier, is the input that moved the valley temperature.
- A person approves the next training run.

The comparison label is **the 1979–2017 week already in the example files**. Use that phrase as written. Where an existing caption says the temperature result is a frozen week plus the residual 9×9, retitle it with this same phrase.

## 5. Copy that stays off this screen

- A Lux valley temperature, or any line that Lux trained the 0.77°C map. That figure is the H100 9×9.
- A new name for the 1979–2017 week. Do not call it a long-term normal, a 30-year reference, or a funding-skill result.
- An odds forecast, an ensemble, or a skill claim for a funding announcement.
- Reslim as the current model.
- A runoff forecast. On the TVA case, runoff stays an ERA5 observation.
- A dam release, a reservoir rule, or a plant megawatt number.
- A count of thousands of GPUs as work already in the log. That scale is the project goal.
- Any line that a clicked node or a clicked stage started an agent or a job.
- Policy language about long-term average conditions. Keep the wording to the stored week, the valley score, and the machines.

## 6. Files and checks

New: `public/headwater-workflow.js` and `public/headwater-workflow.css`, mounted from `index.html`. Keep the five stages and the board as data in that script so the HTML stays a shell.

Also touch: `public/index.html`, `public/app.js`, `public/case-journey.js`, `README.md` (one version row for v0.13.0).

Leave `public/data/prompts.json`, the step logic in `hypothesis-guide.js`, `demo-case.json`, and the evidence manifest contract unchanged. The April questions still refuse job submission.

After the edit, run:

```sh
python3 -m unittest discover -s tests -v
node --test tests/*.cjs
```

Add one frontend test that the new view’s text contains “1979–2017 week” and does not contain “megawatt”, and that the Lux card does not contain “0.77”.

## Split for today

**Yang:** sections 1–3 and 6, with the sentences in sections 4 and 5 pasted as card text.

**Dali:** the video file, which map to drop in the score frame, and the voiceover.

Numbers and the Lux run list match the 12 November communications packet. The comparison stays the 1979–2017 week already stored in the example files.
