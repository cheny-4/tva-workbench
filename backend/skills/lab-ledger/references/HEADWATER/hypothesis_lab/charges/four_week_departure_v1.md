# Charge: four-week departure from reference_train (v1)

**Date:** 18 October 2026  
**Mode:** ledger-first (no blank-slate proposer)

## Question

Why do the four issue weeks (15 Jan / 15 Apr / 15 Jul / 15 Oct) leave
`reference_train` (1979–2017 calendar week) in ways that `det_v1` and the
scored single-field runs do not yet capture — especially valley temperature
on April and July 2019?

## Required prior

1. Load `hypothesis_lab/experiment_ledger.json`.
2. Treat every run with `blocks_reproposal: true` as settled prior.
3. Do **not** propose unrestricted ONI, Gulf anomaly, or surface pressure on
   all four months as `proposed_new`.
4. Prefer open items already named in `docs/NEXT_INPUTS.md` and the BRIEF:
   season-masked ONI/Gulf, root-zone soil (deferred), 850 hPa height / NASH,
   trunk locality (1×1 shrinkage).

## Addendum, 26 October 2026

The 26 October slice closed the one-field and short-window tests. Do not re-offer `det_v2_soil_k9_daily7`, `det_v2_soil_k9_daily15`, `det_v2_soil_k9_z850`, `det_v2_soil_k9_ps`, `det_v2_soil_k9_skt`, or the frozen spring score without a stated delta. The open proposal is `H_ninety_day_order` in `runs/20261026_wave_scores/`. Training still needs an explicit human flag.

## Outputs

- `hypotheses.json` with status tags and `ledger_refs`
- `experiments.json` only for `planned_in_docs` / `proposed_new` gaps
- Critic novelty check must pass before any download or train ask

## Forbidden

- Inventing valley/global RMSE numbers
- Redefining climate normals or tercile years
- Training without an explicit human flag on this charge
