# Connecting Dali's TVA hypothesis-lab demo

The interface is runnable on its own. This checklist connects the scientific backend described in Dali's 2 November plan. It is not a claim that these skills or artifacts are installed.

## Project and skills

Create/configure the VISTA project **Water4Energy-TVA-agent-loop** using the existing Case A pattern: project, Skill Hub and knowledge base. Dali's plan assigns project/skill loading to Junqi, the lab and realization to Dali, downscale scorecard to Haoran, and the optional reservoir choice/rule to Yang.

Load these exact core skill IDs, each wrapping its existing script and returning file-backed evidence:

| Skill | Source / result |
| --- | --- |
| `lab.literature` | Literature shelf for gaps left open by the ledger |
| `lab.download` | Existing literature/local-download status |
| `lab.ledger` | Scored, closed and blocked ledger records |
| `lab.board` | Open rows from `board.py`, without launching work |
| `lab.design` | Ledger-grounded protocol for human review |
| `lab.show_command` | Existing train/score command strings, without execution |
| `lab.realize` | Saved 9×9 temperature/precipitation and observed ERA5 runoff figure |
| `downscale.scorecard` | Frozen Trial 0 scorecard and existing maps beside bilinear |

`dam.readout` is optional and is counted separately. The UI checks actual selected-project skill names, not the presence of a planned card. It does not load global VISTA library skills.

## Lead knowledge sources

Index the following and wait for actual VISTA index readiness:

1. `hypothesis_lab/README.md` — title **HEADWATER hypothesis lab**.
2. `hypothesis_lab/RUNTIME.md` — title **Where the hypothesis lab runs**.
3. `TVA_AGENT_DEMO_PLAN_20261102.md`.
4. `TVA_Task3_Briefing_Summary_20260915.md`.
5. The frozen September 7 Trial 0 scorecard.
6. A short April 2019 ledger excerpt.

The source URLs, accepted filenames and descriptive titles are in `public/data/demo-case.json`. Preserve meaningful titles if VISTA converts documents during indexing. A generic `README.md` filename alone does not prove which README was indexed. The UI separates index readiness from coverage of these six lead sources; unknown or ambiguous coverage stays unverified.

## Fixed-case evidence manifest

Stage the figures and supporting source files in this VISTA project's **outputs**. Write **tva-demo-20190416-20190422.json** there using `public/data/demo-evidence.schema.json`. The schema is an adapter contract for this interface; it does not supply scientific values.

The root case metadata must match start **2019-04-16**, end **2019-04-22**, issued **2019-04-15**. Panel records declare source, kind, model/observation metadata and a relative figure path. Paths must resolve to files in the same project's output listing. The supplied schema and validator define the precise required fields.

- Temperature/precipitation identify `det_v2_soil_k9` and frozen prediction evidence.
- Runoff identifies **ERA5 sro observation** and explicitly unavailable HEADWATER runoff forecast.
- Downscale identifies frozen **Trial 0**, score date **2026-09-07**, **1° → 0.25°**, and U-Net/bilinear comparison for a day inside the case week.
- An optional `dam.source_file` in the manifest points to a separate JSON readout containing the same case, Normandy or Norris, fill/hold decision, agreed rule text and `realization_source_file` naming an available panel’s backing JSON. The enabled UI reservoir/rule must match before a sentence is shown.

The interface rejects mismatched dates, unsupported source kinds, unavailable files and unsafe paths. It does not infer provenance from an image filename or compute an operating decision. Keep numeric interpretation and score scope in the source artifacts. Four-week aggregate scores must not be relabeled as the single displayed week's score.

Use `display_file` for conversation artifacts, and refresh the case evidence when files change. A three-panel figure may be reused by multiple panel records when it is the actual labeled realization file. Generic saved outputs remain accessible through Results Library even when they do not satisfy the case contract.

## Cold-open walkthrough

Open the project; inspect actual skill/KB readiness; ask the agent what the ledger already closed; inspect the open gap and protocol review; show the existing command without executing it; open the realization and Trial 0 figures. The six questions on the interface are prompts for a real check, not automatically marked pass.

Enable the dam panel only if the team elects to include it. Choose one reservoir and enter the agreed rule. Request a file-grounded readout; do not derive an operations policy from a single rainfall number in the browser.

Source: [TVA agent demo plan](https://github.com/daliwang/HEADWATER/blob/main/docs/TVA_AGENT_DEMO_PLAN_20261102.md). Backend project creation, scientific wrappers, original predictions, ERA5 observation files and compute access remain VISTA/HEADWATER setup work.
