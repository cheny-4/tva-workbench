# Skill: lit.cite_extend

## Purpose

Study PDFs already on disk and decide which **closely related cited papers**
are worth adding to the literature shelf. Write a human tracking file.
Do not download, and do not edit the catalog.

## Backing

- Local PDFs: `docs/literature/pdfs/`
- Shelf: `docs/literature/catalog.csv`, `bibliography.bib`, `download_manifest.csv`
- What the next experiment is allowed to change: `docs/PROGRAM_PLAN_EVALUATION.md`
- Ledger closures: `hypothesis_lab/experiment_ledger.json` (`blocks_reproposal`)
- Tracking file this skill owns: `docs/literature/EXTEND_DOWNLOAD.csv`
- Decision note beside it: `docs/literature/EXTEND_DOWNLOAD.md`

## Contract

- Quote or cite only from a PDF that has a text layer. If a file is missing,
  image-only, or the wrong article, record a **repair** row and do not invent
  its reference list.
- Every **extend** row must name the local PDF that cites it and the program
  piece whose experiment design would change (soil, July circulation, April,
  October event tags).
- One reason per row: the decision the paper is for. No bibliography dump.
- Hard cap: **50 extend rows**. Stop earlier when each open program piece
  already has the cites needed to specify the next experiment.
- Do not add papers whose only use is to reopen a `blocks_reproposal` lever
  (all-month ONI, all-month or July-only Gulf scalar, surface pressure with
  no new delta). A paper may stay if it specifies a **different field**.
- **No PDF download, no `catalog.csv` / `bibliography.bib` /
  `download_manifest.csv` write.** Human sets `human_status` in the CSV
  (`pending`, `approved`, `skipped`, `downloaded`). Ingest is
  `collection.augment`, after that approval.
- Reject keys already in `catalog.csv`.

## Procedure

See [../prompts/cite_extend.md](../prompts/cite_extend.md).
