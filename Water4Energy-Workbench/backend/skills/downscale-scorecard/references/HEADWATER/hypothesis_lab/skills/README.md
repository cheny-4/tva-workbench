# Skill contracts

One skill = one script or file read + a hard contract (VISTA/agentic pattern).
Never fabricate numeric outputs.

| Skill | Backing | Contract |
|---|---|---|
| `ledger.load` | `experiment_ledger.json` via `scripts/seed_ledger.py` | Return runs + open_gaps; no invented scores |
| `scores.input_runs` | `docs/INPUT_RUN_COMPARISON.json` | Return heldout_2019 tables only from JSON |
| `notes.link` | paths in `allowlist.json` | Quote or path+section; do not paraphrase numbers |
| `roadmap.next_inputs` | `docs/NEXT_INPUTS.md`, BRIEF | Extract planned steps; mark scored vs open |
| `lit.catalog` | `docs/literature/catalog.csv` | Keys/themes/status only; see `lit.catalog.md` |
| `lit.pdf_extract` | `docs/literature/pdfs/` | Quotes + catalog.key; see `lit.pdf_extract.md` |
| `lit.cite_extend` | local PDFs + program plan | Cited-paper shortlist, cap 50, no download; see `lit.cite_extend.md` |
| `collection.augment` | literature README gaps + download scripts | Propose → human gate → ingest; see `collection.augment.md` |
| `data.wb2_plan` | `docs/ERA5_WB2_DOWNLOAD_PLAN.md` | Gap-filling fields only; Phase 3 |
| `data.frontier_cut` | `docs/DATA_PREP_PLAN_20261021.md` | Execute a committed Frontier job; see `data.frontier_cut.md`. Design only until the executor is accepted |
| `board.status` | `hypothesis_lab/board.json` | Show open rows and free slots; see `board.status.md`. Does not launch |

Bootstrap without LLM: `scripts/bootstrap_pack.py`.  
RAG design: [../RAG.md](../RAG.md).  
Slides: `scripts/build_hypothesis_lab_slides.py`.
