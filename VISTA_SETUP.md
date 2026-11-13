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

## Local replay setup completed 12 November 2026

The dedicated project has eight local replay adapters. These were authored to read pinned source files; they are not existing team-certified wrappers or a new science run.

| Demo contract | Actual VISTA skill |
| --- | --- |
| lab.literature | lab-literature |
| lab.download | lab-download |
| lab.ledger | lab-ledger |
| lab.board | lab-board |
| lab.design | lab-design |
| lab.show_command | lab-show-command |
| lab.realize | lab-realize |
| downscale.scorecard | downscale-scorecard |

The six-source knowledge base `water4energy-tva-demo-2019` was indexed to Ready and a real retrieval query returned the demo plan. Original Markdown notes and Markdown renderings of the original Trial 0 JSON and derived April ledger excerpt are indexed. Their filenames retain descriptive source identity. Index status and source coverage are checked separately.

Sources are pinned to HEADWATER `5ea54ac4dd817ab38c82284331974d6668afde09`, water4energy_experiment `ee96c2cc2e257c22c1e0bac6c5a7ec9b9c197ea5`, and the provenance receipt for the briefing/actions. Each replay adapter carries a SHA-256 provenance manifest and validates its source bytes. Original inputs, saved proposals and new proposals stay distinct. The older board/ledger snapshots are labelled by their original dates; the supplied 12 November demo board is a separate record.

Four panels are staged in project outputs using the unchanged evidence contract:

- Original 16–22 April temperature and precipitation maps, with their existing comparison columns retained. Committed plotting code maps Residual 9×9 to `det_v2_soil_k9`. Values in source JSON are transcribed from published labels, not recomputed predictions. The four-week aggregate RMSE is not labelled as this one-week score.
- ERA5 surface runoff: 7.364 mm valley mean accumulated over the valid week, from the committed `20261102_sro_sample/receipt.json`. The plotted summary is explicitly not a spatial map. No runoff forecast is supplied.
- Original Trial 0 wet-day map for 19 April 2019, backed by the original 7 September scorecard. Aggregate standardized test scores over 730 days are not presented as scores for the displayed day.

The readers copy saved figures, read records and render the receipt summary locally. They submit no jobs, train no models and do not rerun inference or scoring. Their eight entry points were checked inside VISTA. Chat sending remains manual; the six conversational cold-open answers have not been certified by this setup. The exact original Trial 0 scorer command is not in the staged bundle and is reported missing rather than invented. The optional dam skill remains unloaded pending an agreed reservoir rule. Video, approved home-score map and voiceover remain with Dali.

The replay project allows file reading, local replay code, file display and retrieval tools. It has no HPC submission tools or HPC job definitions. Existing Genesis_Water4Energy project configuration is retained. Local source bundles and VISTA state are not included in the application ZIP or Git repository.
