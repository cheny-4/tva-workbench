---
name: lab-show-command
description: "Display an existing training command file as text, never execute it. Report absent command references."
allowed_tools: view run_bash display_file
metadata: {"water4energy-contract-id": "lab.show_command", "setup-owner": "water4energy-local-replay-20261112", "mode": "saved-file-replay", "replay-version": "0.15.0", "answer-profile": "context-scoped-v0150"}
---

# lab.show_command

This adapter reads pinned files and returns a **deterministic saved-evidence readout**. It does not perform a new experiment, review, data cut or job. Choose the actual request context before running a reader.

For the TVA April case, use:

```sh
python3 /mnt/skills/lab-show-command/scripts/replay.py --task lab.show_command --context tva --question commands --output /mnt/data/output
```

For HEADWATER development, use `--context headwater` and the matching profile: headwater-commands. The five primary profiles are headwater-ledger (lab.ledger), headwater-brief (lab.design), headwater-data (lab.download), headwater-board (lab.board), and headwater-score (lab.ledger). A history/conclusions/next-decision table uses headwater-history with lab.ledger. Never use an April profile merely because the same project contains that case.

HEADWATER example:

```sh
python3 /mnt/skills/lab-show-command/scripts/replay.py --task lab.show_command --context headwater --question headwater-commands --output /mnt/data/output
```

For the dated 24 October 2026 example, use `--context lab24` and exactly one matching profile: lab24-ledger (lab.ledger), lab24-proposer / lab24-critic / lab24-referee (lab.design), lab24-human (lab.board), or lab24-evidence (lab.ledger). The request header is “Water4Energy project — Hypothesis lab · 24 October 2026”. This separate context reads the actual pinned October pack, never the November review or April case. Quote its `verified_answer` and call `display_file` for every `display_paths` entry, then cite its friendly `source_citations`. The pack documents a required human gate and a later result, but no separate acceptance receipt. Do not claim a new review, present-day selected brief, approval or execution.

The additional HEADWATER profile headwater-downscale uses downscale.scorecard with `--context headwater`. It displays the supplied April 2019 monthly, 30-day, 1° to 1/24° (~4 km) deterministic refinement: maximum-temperature and precipitation mean/P95, with precipitation in mm/day. This is separate from the fixed April-week Trial 0 quarter-degree contract and does not establish a coupled forecast pipeline. The supplied four-week CNN/Reslim maps are prior comparisons, not a map of the October soil-residual run at 0.955 K.

Procedure:
1. Read this skill and run only the matching documented reader/profile. Context and profile mismatches are refused. For a guided question, quote `verified_answer` exactly under “Saved-evidence answer”; do not add your own interpretation or substitute an older raw record. The full dated source material stays available for explicit inspection.
2. Call `display_file` for every returned `display_paths` entry. Never substitute Markdown image text, invent figures or copy source references into new aliases. `source_paths` are read-only provenance.
3. For HEADWATER and the dated October example cite the friendly titles and pinned URLs from `source_citations`. Use the supplied plain-language narrative: lower error is better; root-zone soil means water held in the soil; development record dates are not job times. Keep raw filesystem paths in inspection metadata.
4. Do not invent a selected current brief: the November pack contains multiple proposals. Historical flags/ready labels are not a new approval. The 12 November demonstration board is separate from the original board. H100 owns the 0.77°C result; Lux lists its run names. The stored-week comparison does not isolate soil’s causal effect.
5. Keep the April contract unchanged: weekly rainfall is not a daily rate or RMSE; ERA5 runoff is an observation receipt, not a forecast or reservoir inflow; Trial 0 has separate 730-day standardized scores and a 19 April illustration, without a demonstrated HEADWATER handoff. The exact original Trial 0 scorer is absent. Never derive an exact H100 command from the supplied Lux script.

No network, trainer, scorer, data download, scheduler, settings/flag change or reservoir operation is authorized. The optional dam skill remains absent without an agreed reservoir/rule. Missing records and capabilities must be reported, not filled in. A person still controls Send and approves any future execution.
