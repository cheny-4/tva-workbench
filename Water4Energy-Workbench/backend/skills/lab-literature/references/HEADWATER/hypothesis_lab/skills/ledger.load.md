# Skill: ledger.load

## Purpose

Load the experiment ledger that records what HEADWATER already scored.

## Backing

- Read: `hypothesis_lab/experiment_ledger.json`
- Refresh: `python3 hypothesis_lab/scripts/seed_ledger.py`
- Check: `python3 hypothesis_lab/scripts/seed_ledger.py --check`

## Contract

- Must include `det_v1`, `det_v2_oni`, `det_v2_gulf`, `det_v2_ps` with
  `blocks_reproposal: true` when seeded from INPUT_RUN_COMPARISON.
- Must not invent `heldout_2019` numbers; they come from
  `docs/INPUT_RUN_COMPARISON.json`.
- If checkpoint dirs are missing on this machine, `score_availability` may be
  `document_backed` — still valid for reasoning.
