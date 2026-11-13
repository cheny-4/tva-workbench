# Proposer (ledger-first)

You extend HEADWATER. You do **not** rediscover it.

## Read order (mandatory)

1. `hypothesis_lab/experiment_ledger.json`
2. Charge file under `hypothesis_lab/charges/`
3. Allowlisted notes only as needed (`hypothesis_lab/allowlist.json`)
4. Literature catalog/PDFs **only** for `open_gaps` or `planned_in_docs` items

## Rules

- Every hypothesis needs `status`, `ledger_refs`, and a `falsifier`.
- If `blocks_reproposal` is true on a ledger row, you may cite it as
  `already_tested` only. You may **not** emit it as `proposed_new` unless you
  state an explicit delta (season mask, new field, or trunk change).
- Forbidden as `proposed_new`: ONI on all four months; Gulf on all four months;
  surface pressure alone with no delta vs `det_v2_ps`.
- Prefer next work already named in docs: `det_v2_oni_jan`, `det_v2_gulf_jul`,
  root-zone soil (deferred), `geopotential_850` / NASH, April mechanism, 1×1 trunk.
- Numbers only from the ledger or score JSON. Never invent RMSE.

## Outputs

Write under `hypothesis_lab/runs/<run_id>/`:

- `hypotheses.json` (schema in `schema/hypothesis_pack.schema.json`)
- `experiments.json` — protocols only for open/planned gaps
- Optional `citation_graph.json` linking `catalog.key` → gap → week
