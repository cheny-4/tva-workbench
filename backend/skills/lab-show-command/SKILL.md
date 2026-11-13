---
name: lab-show-command
description: "Display an existing training command file as text, never execute it. Report absent command references."
allowed_tools: view run_bash display_file
metadata: {"water4energy-contract-id": "lab.show_command", "setup-owner": "water4energy-local-replay-20261112", "mode": "saved-file-replay", "replay-version": "0.13.2", "answer-profile": "compact-v2"}
---

# lab.show_command

This adapter returns a **deterministic saved-evidence readout**, derived from pinned source records. It is not a new scientific result or a newly executed review. Use the readout faithfully; the live agent may explain it concisely but may not add interpretations or replace later records with older source wording.

For the corresponding question run this exact local reader, with the appropriate context:

```sh
python3 /mnt/skills/lab-show-command/scripts/replay.py --task lab.show_command --context tva --question commands --output /mnt/data/output
```

For a **runoff-only** question, use `lab-realize` with `--task lab.realize --question runoff`. For **project purpose / optional dam scope**, use `lab-ledger` with `--task lab.ledger --question purpose`. Use `--context headwater` for development questions. The other selectors are ledger, weather, downscale, design, commands, board, literature and download. Do not choose a different topic merely because the guarded request mentions it in background context.

Procedure:
1. Read this skill and run its documented reader. It validates source hashes, reads the actual records, writes only saved readouts and copies fixed evidence. It never runs a network, scheduler, trainer or scientific inference/scorer.
2. Read the compact stdout. Its `verified_answer` is the source-checked answer to the selected question. Use it verbatim or give a faithful concise paraphrase. It is explicitly a saved-evidence readout, not a generic interpretation task. Do not add a table, mechanism, pass target, other gap status, training history or operational rule absent from that text. In particular, do not infer what Reslim names mean, relabel the stored week as the model, couple HEADWATER into Trial 0, call completed F1/spring work pending, or turn a supplied Lux recipe into an exact H100 command.
3. Actually call `display_file` for every path in `display_paths`. These are the displayable project outputs. `source_paths` are read-only citations; do not display or copy files from `/mnt/skills` just to create aliases. Do not echo raw Markdown image syntax or say a display succeeded before its tool call succeeds.
4. Answer directly with the verified saved-evidence narrative and its provided citations. The full raw records remain in `inspection_readout_path` for a person requesting a deeper audit. Do not re-read obsolete raw passages to override the later dated conclusions already reconciled in the readout.

The project remains Water4Energy workbench. The optional dam skill is uninstalled and no agreed reservoir/rule is supplied. Missing files or capabilities are reported, never invented. Show existing command text only; never execute it. No training, re-scoring, dataset download, setting/flag change, job or reservoir operation is authorized here.
