# Combined VISTA setup · v0.15.0

Use the single combined ZIP and **Start TVA Workbench.command**. The recipient needs installed VISTA and their own working model credentials in VISTA Settings. The launcher prepares the project automatically; a separate setup bundle or manual Skill Hub import is unnecessary.

## What is installed

The fixed project is **Water4Energy-TVA-agent-loop**. Its source index is **water4energy-tva-demo-2019**. Eight saved-file adapters wrap local pinned readers:

| Contract ID | VISTA skill name |
| --- | --- |
| lab.literature | lab-literature |
| lab.download | lab-download |
| lab.ledger | lab-ledger |
| lab.board | lab-board |
| lab.design | lab-design |
| lab.show_command | lab-show-command |
| lab.realize | lab-realize |
| downscale.scorecard | downscale-scorecard |

The UI recognizes dotted contract labels and the actual kebab-case names. It checks index readiness separately from source coverage; a generic README does not prove the intended source was indexed.

Nine documents are indexed: the six original lead sources, the April answer guide, the HEADWATER development guide, and **October_24_cycle_and_monthly_refinement_guide_v0150.md**. Original source/guide bytes are retained. The added guide cites six real October files and the supplied figure scopes. Pinned sources and per-file SHA-256 receipts travel with the adapters; catalog references are not a claim that paper PDFs or ERA5 arrays are bundled.

## Existing installations

Matching items are adopted without duplicate imports. Known original v0.13.1/v0.13.2/v0.14.0 backend items are checked and backed up before upgrade. Interface v0.14.1 used the same v0.14.0 backend. Preflight refuses unknown policy changes, local skill edits, shared global skills and conflicting evidence. Complete backups remain in `.local/upgrade-backups/`; interrupted setup can resume safely. Never forward `.local/` with a package.

The setup receipt distinguishes backend readiness and configured model access from an actual model test. Source indexing may take a few minutes. If it fails or remains pending, keep VISTA open, resolve its message, then rerun the same launcher.

## Protected April evidence

The original **32 files** in `backend/evidence.zip` retain their hashes. The manifest **tva-demo-20190416-20190422.json** keeps start 2019-04-16, end 2019-04-22 and issue 2019-04-15. Its four panels remain:

- Frozen `det_v2_soil_k9` temperature and weekly precipitation.
- Observed ERA5 `sro` receipt summary, with no supplied HEADWATER runoff forecast or reservoir inflow prediction.
- Frozen Trial 0, 1° to 0.25°, scored 7 September 2026; the 19 April illustration is separate from its 730-day standardized aggregate scores.

Original guarded prompts, April narratives and schema remain unchanged. New October and monthly displays use their own output names and source JSONs. The five supplied PNGs are also packaged with the interface; their comparison/monthly scopes cannot be substituted into the April contract.

## Use during the demo

Start with HEADWATER development, open the October Hypothesis lab to follow one completed cycle, then select TVA for the April questions. Chat stays on the left. Choose a question, review the draft and press Send. Reading a saved review does not execute a role or set a training flag. The six October profiles correspond to ledger, proposer, critic, referee, human gate and measured result; the pack has no separate human-acceptance receipt.

Setup and the saved readers perform no training, new science inference/scoring, dataset download or HPC submission. A person approves any future experiment. The exact original Trial 0 scorer command and optional dam rule remain unavailable. Dali's video/captions and voiceover remain supplied separately. See [VERIFICATION.md](VERIFICATION.md) for the test record and limits; a first launch on another person's laptop is not certified here.
