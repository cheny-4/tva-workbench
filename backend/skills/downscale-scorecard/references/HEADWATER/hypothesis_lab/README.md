# HEADWATER hypothesis lab

Ledger-first Proposer → Critic → Referee loop for the four week-ahead
departures from `reference_train`. **Do not build hypotheses from a blank
literature pass.** Start from what HEADWATER already scored.

## Program plan

Full evaluation program (layers, pass rule, closed vs next pieces):
[docs/PROGRAM_PLAN_EVALUATION.md](../docs/PROGRAM_PLAN_EVALUATION.md).

## Prior (required read order)

1. [experiment_ledger.json](experiment_ledger.json) — scored / planned / deferred / parked
2. [docs/INPUT_RUN_COMPARISON.json](../docs/INPUT_RUN_COMPARISON.json) — number source for stage-1 runs
3. Allowlisted notes in [allowlist.json](allowlist.json)
4. Literature shelf only for **open gaps** ([docs/literature/](../docs/literature/))

## Where to run what

Mac = agents and briefs. Frontier = data builds on shards/examples. GPU cluster = train/score.
Details and the end-to-end cycle: [RUNTIME.md](RUNTIME.md).

## RAG and collection growth

Retrieval over `docs/literature/` + allowlisted notes, plus citation extension
and a planned collection-augmenter agent: [RAG.md](RAG.md). The citation
shortlist is [docs/literature/EXTEND_DOWNLOAD.md](../docs/literature/EXTEND_DOWNLOAD.md).

Overview slides:

```bash
python3 hypothesis_lab/scripts/build_hypothesis_lab_slides.py
# → hypothesis_lab/Hypothesis_Lab_Overview.pptx
```

## Refresh the ledger

```bash
cd /path/to/HEADWATER
python3 hypothesis_lab/scripts/seed_ledger.py
python3 hypothesis_lab/scripts/seed_ledger.py --check   # validate only
```

## Bootstrap pack (no LLM)

Writes a run directory whose hypotheses are tagged from the ledger
(`already_tested`, `planned_in_docs`, …). Use this before any agent pass.

```bash
python3 hypothesis_lab/scripts/bootstrap_pack.py
python3 hypothesis_lab/scripts/bootstrap_pack.py --run-id 20261018_ledger
```

## Policy (v1)

- Numbers only from the ledger / `INPUT_RUN_COMPARISON.json` / score files.
- No training without an explicit human charge flag.
- Downloads only from documented WB2 / literature manifests (Phase 3).
- Critic must fail novelty if a Proposer re-offers a `blocks_reproposal` run without a stated delta (mask, field, or trunk change).

## Layout

```text
hypothesis_lab/
  README.md
  STATUS.md
  experiment_ledger.json
  allowlist.json
  schema/
  prompts/          # ledger-first agent instructions
  skills/           # skill contracts
  charges/
  scripts/
  runs/<run_id>/    # immutable cycle artifacts
```

## Status

See [STATUS.md](STATUS.md).
