---
name: lab-realize
description: "Show the existing April 2019 temperature and precipitation figures and the committed ERA5 surface-runoff receipt summary. No new inference."
allowed_tools: view run_bash display_file
metadata: {"water4energy-contract-id": "lab.realize", "setup-owner": "water4energy-local-replay-20261112", "mode": "saved-file-replay", "replay-version": "0.14.0", "answer-profile": "context-scoped-v0140"}
---

# lab.realize

This adapter reads pinned files and returns a **deterministic saved-evidence readout**. It does not perform a new experiment, review, data cut or job. Choose the actual request context before running a reader.

For the TVA April case, use:

```sh
python3 /mnt/skills/lab-realize/scripts/replay.py --task lab.realize --context tva --question weather --output /mnt/data/output
```

This reader shows April case evidence. A HEADWATER development question uses its explicit headwater-* profile in the matching ledger/design/data/board skill; do not substitute April evidence.

Procedure:
1. Read this skill and run only the matching documented reader/profile. Context and profile mismatches are refused. For a guided question, quote `verified_answer` exactly under “Saved-evidence answer”; do not add your own interpretation or substitute an older raw record. The full dated source material stays available for explicit inspection.
2. Call `display_file` for every returned `display_paths` entry. Never substitute Markdown image text, invent figures or copy source references into new aliases. `source_paths` are read-only provenance.
3. For HEADWATER cite the friendly titles and pinned URLs from `source_citations`. Use the supplied plain-language narrative: lower error is better; root-zone soil means water held in the soil; development record dates are not job times. Keep raw filesystem paths in inspection metadata.
4. Do not invent a selected current brief: the November pack contains multiple proposals. Historical flags/ready labels are not a new approval. The 12 November demonstration board is separate from the original board. H100 owns the 0.77°C result; Lux lists its run names. The stored-week comparison does not isolate soil’s causal effect.
5. Keep the April contract unchanged: weekly rainfall is not a daily rate or RMSE; ERA5 runoff is an observation receipt, not a forecast or reservoir inflow; Trial 0 has separate 730-day standardized scores and a 19 April illustration, without a demonstrated HEADWATER handoff. The exact original Trial 0 scorer is absent. Never derive an exact H100 command from the supplied Lux script.

No network, trainer, scorer, data download, scheduler, settings/flag change or reservoir operation is authorized. The optional dam skill remains absent without an agreed reservoir/rule. Missing records and capabilities must be reported, not filled in. A person still controls Send and approves any future execution.
