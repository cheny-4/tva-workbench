# TVA agent demo, 2 November 2026

**Status:** Plan for a two-week demonstration. No job is submitted by this note.
**Audience:** Dali Wang, Yang Chen, Haoran Niu, Junqi Yin.
**Interface:** One VISTA project. The hypothesis lab in this checkout is the backend.
**Case:** 16–22 April 2019, issued 15 April. Headwater water quantity. Normandy or Norris, Yang Chen’s choice.

This note is the spec for the walkthrough. It does not change the 9×9 checkpoint, the ledger, or the Trial 0 downscale score.

## What the demo is

A collaborator opens one VISTA project, asks the agent to walk the hypothesis-lab loop, and sees one week: temperature, precipitation, and runoff, then Haoran’s already-scored 1° to 0.25° map. Yang Chen’s dam panel is optional and last. It reads those numbers and says fill or hold. It does not run RiverWare.

The 15 September TVA briefing is the decision this serves. Duck–Normandy and Norris care about fill versus hold. Air temperature is a thermal proxy. ERA5 surface runoff is a water proxy. River temperature stays off this demo. Public elevation language only. No plant megawatts.

VISTA objects stay the three already used for Gate G1: project, skill hub, knowledge base. Docs: [genesis-vista.github.io/docs](https://genesis-vista.github.io/docs/). The Case A pattern to copy is in `water4energy_AgenticAmSC`, file `g1_demo/VISTA_G1_Demonstration_Plan.md`.

## The week on screen

| Panel | What is shown | Source |
|---|---|---|
| Temperature | Climate week plus the residual 9×9 | `det_v2_soil_k9`. 2019 four-week valley mean 0.767 K, climate week 0.861 K |
| Precipitation | Same trunk, same week | April rain is still short: about 25 mm versus an observed valley sum of about 56 mm |
| Runoff | ERA5 surface runoff for 16–22 April 2019 | Observation. The HEADWATER runoff slot is empty. Label the panel that way |
| Downscale | One Southeast day in that week, U-Net beside bilinear | Trial 0, scored 7 September 2026. `tp` and `t2m` beat bilinear. `msl` does not. No retrain |
| Dam, optional | One sentence: wetter or drier than the climate week, so fill or hold | Yang Chen’s rule on the file above |

The agent reads files. It does not invent a hit rate, a new valley score, or a release.

## VISTA project

**Name:** `Water4Energy-TVA-agent-loop`

**Description:** Weeks-to-years water-for-energy, Tennessee Valley. This project replays the hypothesis lab on one issued week. Temperature and precipitation come from the scored 9×9. Runoff on the figure is ERA5. The downscale figure is the frozen Trial 0 scorecard.

**Non-goals, on the project card:** No new Gate G1 score. No live U-Net train. No RiverWare. No WeatherNext. No E3SM pack. No new 9×9 fit.

### Skills

One skill, one script. Numbers come from a file.

| Skill | Wraps | Returns |
|---|---|---|
| `lab.literature` | `docs/literature/` and the cite-extend note | Papers on the shelf, and the gap still open |
| `lab.download` | Literature download status | What is already local. Not a live ERA5 pull |
| `lab.ledger` | `hypothesis_lab/experiment_ledger.json` | Scored, closed, and blocked rows for this week |
| `lab.board` | `python3 hypothesis_lab/scripts/board.py` | Open rows. The command does not launch |
| `lab.design` | Proposer prompt and the April charge | A protocol. A person still sets the train flag |
| `lab.show_command` | `lux/train_k9.sh` and the Trial 0 score command | The command string. It does not run it |
| `lab.realize` | Saved 9×9 predictions plus ERA5 `sro` for this week | The three-panel figure |
| `downscale.scorecard` | Trial 0 scorecard and the existing Southeast maps | RMSE versus bilinear. Haoran owns this skill |
| `dam.readout` | Optional. Yang Chen | Fill-versus-hold sentence from the realization file |

### Knowledge base

Index these until status is Ready:

- [hypothesis_lab/README.md](../hypothesis_lab/README.md)
- [hypothesis_lab/RUNTIME.md](../hypothesis_lab/RUNTIME.md)
- This note
- The 15 September TVA briefing summary in `water4energy_projectPlan` (`TVA_Task3_Briefing_Summary_20260915.md`)
- The Trial 0 scorecard in `water4energy_experiment`
- A short ledger excerpt for April 2019

Leave the event-loss wave and the ORBIT-2 trunk notes out of the lead set.

### Pass

A cold open passes when a new user gets these answers from the skills:

1. What this project is for, and which week it shows.
2. What the ledger already closed for that week.
3. What the 9×9 did on April 2019 temperature and rain.
4. Why the runoff panel is ERA5 and not a forecast.
5. Whether the downscale panel is a new train. The answer is no.
6. What the dam panel is allowed to say. Fill or hold, from the file, in public language.

## Two weeks

**Days 1–2.** Freeze this case and this skill table. Junqi opens the VISTA project from the Case A pattern. Yang Chen picks Normandy or Norris and writes the fill-versus-hold rule in plain language. Haoran points at the Trial 0 checkpoint and the figure script. Science choices stop here.

**Days 3–5.** Thin wrappers only. `lab.realize` reads predictions already on disk and writes the three panels. `downscale.scorecard` calls the existing Trial 0 scorer. `dam.readout` is a function of that JSON once the rule exists. No new examples. The runoff channel stays empty.

**Days 6–8.** Load the skills. Run the six questions on a cold project. A skill that answers from memory instead of a file gets fixed before the walkthrough.

**Days 9–10.** Fifteen minutes with Yang Chen: project card, skill list, ledger, realization figure, downscale figure, optional dam sentence. Record pass or miss. That recording is the demo.

## Where a GPU is used

Replay, not a fit. Lux and `ccsi-gpu-node1` already hold the 9×9 scores. The Trial 0 packs are the ones scored on 7 September. If a figure has to be redrawn, run the plot script on one GPU slice.

The four Lux event-loss trains in job `381331` stay off this demo. None of them reached the April rain bar. The forecast this demo shows is the climate week plus the residual 9×9.

Paths already written down:

| Role | Path |
|---|---|
| This checkout | `/lustre/orion/geo172/proj-shared/water4energy/HEADWATER` |
| Soil examples | `/lustre/orion/geo172/proj-shared/water4energy/trainingData/headwater_examples_v1_soil` |
| GPU-cluster examples | `/mnt/proj-shared/VASTdata/7xw/Water4Energy/HEADWATER/headwater_examples_v1_soil` on `ccsi-gpu-node1` |
| Trial 0 packs | `/lustre/orion/lrn105/proj-shared/wangd/water4energy/processed/daily_image_trial0/` |

## Who owns what

| Person | Owns |
|---|---|
| Dali | This charge, the ledger skills, `lab.realize` |
| Junqi | The VISTA project and the skill loader |
| Haoran | `downscale.scorecard`. No retrain |
| Yang Chen | The reservoir choice and `dam.readout` |

Yang Chen does not need the trainer, the ERA5 shards, or ORBIT-2 to start.

## Repos

Read access for the walkthrough:

| Repo | Why |
|---|---|
| `github.com/daliwang/HEADWATER` | This note, the hypothesis lab, the ledger, the 9×9 record |
| `github.com/daliwang/water4energy_AgenticAmSC` | VISTA case pattern. Start at `g1_demo/VISTA_G1_Demonstration_Plan.md` |
| `github.com/daliwang/water4energy_projectPlan` | TVA case language, 15 September briefing |
| `github.com/daliwang/water4energy_experiment` | Trial 0 scorecard, and the note that river temperature is later |

Held until someone needs a specific path: `water4energy_model`, `XiaoWang-Github/ORBIT-2`, `water4energy_trainingData`, `water4energy_data`, `water4energy_diagnostic`.

## Done when

The six questions pass on a cold open. The realization figure shows temperature, precipitation, and labeled ERA5 runoff for 16–22 April 2019. The downscale figure is the frozen Trial 0 comparison. The dam sentence, if present, uses only that file.
