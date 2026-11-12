# Water4Energy workbench — actions for 12 November 2026

**For:** Yang Chen
**From:** Dali Wang
**Package:** the workbench you already ship, interface v0.12.1
**Goal:** ship this interface as the workbench for the Water4Energy project, in time for today’s demo.

The workbench is the project. HEADWATER development is the workflow the demo walks. The 16–22 April 2019 TVA week is one case inside the project. The first screen is HEADWATER development. A person can open the TVA case from there. Opening that case changes the question list and the evidence pane. It leaves the product name, the sidebar, and the libraries as the project.

The science sentences below are fixed. This pass does not need a live ledger, a new VISTA project, or a job submission.

Edit your workbench tree (v0.12.1). Leave the copy under `Downscaling_Interface/` alone. Keep the VISTA project id `Water4Energy-TVA-agent-loop`, the launcher filenames, and the ORNL and Genesis marks. Bump the on-screen version to **v0.13.0** so a demo tab is obviously this build.

The folder may stay `TVA-Workbench`. The on-screen name is **Water4Energy workbench** on every screen, including while the TVA case is open.

## 1. Rename the product on screen

These strings name the project, on every view:

| Where | Now | Becomes |
|---|---|---|
| Page title, sidebar brand small-text, top breadcrumb prefix | TVA Research Workbench / TVA HYPOTHESIS LAB | **Water4Energy workbench** |
| Sidebar project label and footer | TVA research workbench · TVA WORKBENCH | **Water4Energy workbench** |
| Chat agent label | TVA agent | **Water4Energy agent** (the VISTA chip stays) |
| Skills page eyebrow and heading | TVA PROJECT CAPABILITIES | **Project capabilities** |
| Literature page lead | papers connected to the TVA hypothesis lab | papers and references for the Water4Energy project |
| History empty state and “Back to…” | this laptop’s TVA conversations / Back to TVA Case Lab | this laptop’s project conversations / **Back to Case Lab** |
| Meta description | Explore TVA decisions | The Water4Energy project workbench: HEADWATER development, and the cases inside the project |

The TVA name stays on the TVA case itself: the network view, the April evidence, and the Case Lab subtitle while that case is selected.

Files: `public/index.html`, `public/app.js` (breadcrumb map in `switchView`, the default view, the agent label, the history empty state), `public/case-journey.js`.

## 2. Information architecture

The app opens on **HEADWATER development**. Set the initial view there, and give that nav item the active state in `index.html`. Hypothesis lab remains the method. It is no longer the home screen, and its introduction is no longer “Method & April case.”

Sidebar order:

1. **HEADWATER development** — project workflow, and the screen the demo starts on
2. **Hypothesis lab** — the project method
3. **TVA case** — the one loaded case (rename the current “TVA network” item to this)
4. **Case Lab** — the project conversation
5. **Results Library**
6. **Literature library**
7. **Skills & sources**

### Hypothesis lab

Kicker: **Project method**. Lead: the research loop for Water4Energy. A question becomes one reviewed test, a person approves it, and the score returns to the ledger.

Keep the six-node map. Clicking a node still only prepares a question. It does not start Proposer, Critic, Referee, or a train.

Replace the three-step path “Understand the method → Explore TVA decisions → Ask & inspect evidence” with two entries under the map:

- **Open HEADWATER development**
- **Open the TVA case**

Move the spring fill-or-hold brief off this page. That brief already lives on the TVA case view. This page’s side panel is the project loop in one paragraph: hypothesis, data on Frontier, a person picks one experiment, execution on the H100s and Lux, score back to the ledger.

The button that prepares a question reads **Try this question in Case Lab**. The question it prepares follows the active context. From this page the context is the project method.

### TVA case

This view keeps what it has now: 54 study locations, the fill-or-hold questions, downstream water, energy-water connections, and the cold-water concern. The heading can stay specific to this case: **TVA case**. The eyebrow names the case, not the product.

Its continue button reads **Open this case in Case Lab**. That action selects the TVA case and opens Case Lab. It does not make the TVA week the identity of the workbench.

### Case Lab

Title: **Case Lab**. The subtitle is the active context, not a permanent April date.

A switcher sits in the header:

- **HEADWATER development** — selected when the app opens, and when a person arrives from the development view or from Hypothesis lab
- **TVA · 16–22 April 2019** — selected only after a person opens the TVA case

**HEADWATER development** uses a new question list in `public/headwater-workflow.js`. Each item fills the composer. Sending still requires the person to press Send. Each prepared request refuses job submission, training, and invented scores. Suggested questions:

- What has the ledger already scored?
- What is the one change in the current brief?
- What did Frontier already prepare?
- Which board rows are ready, and which training flags are off?
- What did the 2019 valley score return?

Welcome copy for this context: “Start from the ledger. Choose a question to put an editable request in the message box.”

**TVA · 16–22 April 2019** restores the current April behavior: the six questions, the April evidence pane, Trial 0, the ERA5 runoff observation, and the optional dam readout. Welcome and “Questions for this case” use the April wording only while this case is selected. The menu summary reads **Questions for this case**.

`public/data/prompts.json`, the step logic in `hypothesis-guide.js`, `demo-case.json`, and the evidence manifest stay as they are. The April contract is the TVA case. It is not the shell of the app.

## 3. What HEADWATER development shows

One static page, five stages, in this order. This is the demo walk. A clicked stage opens a short card. It does not call VISTA, set `human_flag`, or submit a job.

1. **Hypothesis.** Ledger, then Proposer, Critic, Referee. Link: open Hypothesis lab. Line: the lab starts from what was already scored.
2. **Data.** Frontier. **153** weekly examples, then the root-zone soil copy. The dates and the destination were already written down. The dataset agent runs that committed job.
3. **Design.** The brief names one change. A person picks that experiment and sets the training flag. Button label: **Review this in Case Lab**. It selects the HEADWATER context and fills the composer.
4. **Execution.** The same brief is the job. Name the H100s (`ccsi-gpu`) as where `det_v2_soil_k9` was trained, and Lux as nine scored run directories. List the nine names below. No valley temperature on the Lux card.
5. **Score.** The 2019 valley number returns to the ledger, and the next brief is written from that ledger. Show one figure slot. Until a file is dropped in, use a labeled empty frame: “April map supplied for the demo.” Preferred file, if it is added: a static copy of the valley temperature figure for 2019, placed in `public/assets/`. Caption the **16–22 April 2019** week only. This figure is a score that came back to the project ledger. It is not a second home screen.

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

## 4. Copy that is allowed on HEADWATER development

- Model `det_v2_soil_k9`, fit on 1979–2017, stopped on 2018, scored on 2019.
- Four-week valley temperature: **0.77°C** against **0.86°C** for the 1979–2017 week stored in the example files. Exact figures if a table needs them: **0.767 K** and **0.861 K**. Say degrees Celsius in any sentence. Use kelvin only in the table, labeled as a difference.
- July is behind that week: 1.260 K against 1.211 K.
- April rain, same week: observed **55.9 mm**, 1979–2017 week **24.4 mm**, 9×9 map **24.7 mm**. The map redrew the historical week.
- Root-zone soil, prepared on Frontier, is the input that moved the valley temperature.
- A person approves the next training run.

The comparison label is **the 1979–2017 week already in the example files**. Use that phrase as written. Where an existing caption says the temperature result is a frozen week plus the residual 9×9, retitle it with this same phrase.

## 5. Copy that stays off the project shell

These limits apply to the home screen, the sidebar, Hypothesis lab, Case Lab in the HEADWATER context, and the libraries. The TVA case view may keep its own April evidence labels.

- A Lux valley temperature, or any line that Lux trained the 0.77°C map. That figure is the H100 9×9.
- A new name for the 1979–2017 week. Do not call it a long-term normal, a 30-year reference, or a funding-skill result.
- An odds forecast, an ensemble, or a skill claim for a funding announcement.
- Reslim as the current model.
- A runoff forecast. On the TVA case, runoff stays an ERA5 observation.
- A dam release, a reservoir rule, or a plant megawatt number.
- A count of thousands of GPUs as work already in the log. That scale is the project goal.
- Any line that a clicked node or a clicked stage started an agent or a job.
- Policy language about long-term average conditions. Keep the wording to the stored week, the valley score, and the machines.
- Any heading that presents the April week, the reservoir network, or a fill-or-hold question as the name of the workbench.

## 6. Files and checks

New: `public/headwater-workflow.js` and `public/headwater-workflow.css`, mounted from `index.html`. Keep the five stages, the board, the HEADWATER question list, and the active-context switcher as data in that script so the HTML stays a shell.

Also touch: `public/index.html`, `public/app.js`, `public/case-journey.js`, `README.md` (one version row for v0.13.0, and a lead sentence that this package is the Water4Energy project workbench).

Leave `public/data/prompts.json`, the step logic in `hypothesis-guide.js`, `demo-case.json`, and the evidence manifest contract unchanged. The April questions still refuse job submission. They run when the TVA case is the active context.

After the edit, run:

```sh
python3 -m unittest discover -s tests -v
node --test tests/*.cjs
```

Add frontend checks for these four facts:

- The document title is `Water4Energy workbench`.
- The first screen is the HEADWATER development view, and its text contains “1979–2017 week”.
- That first screen does not contain “megawatt”, and the Lux card does not contain “0.77”.
- The TVA network markup is still in the page, including the 54 study locations, and the April case strings are inside that case view.

## Split for today

**Yang:** sections 1, 2, 3, and 6, with the sentences in sections 4 and 5 pasted as card text. The first screen a person sees is HEADWATER development. The TVA week is one case.

**Dali:** the video file, which map to drop in the score frame, and the voiceover.

Numbers and the Lux run list match the 12 November communications packet. The comparison stays the 1979–2017 week already stored in the example files.
