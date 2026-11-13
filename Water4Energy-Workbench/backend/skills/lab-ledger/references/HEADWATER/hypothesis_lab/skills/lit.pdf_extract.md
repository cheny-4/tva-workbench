# Skill: lit.pdf_extract

## Purpose

Chunk local PDFs under `docs/literature/pdfs/` and return grounded quotes.

## Backing

- `docs/literature/pdfs/`
- `docs/literature/pdfs/DOWNLOAD_STATUS.md`
- Fill missing: `python3 scripts/download_literature.py`

## Contract

- Quotes must come from a file on disk.
- Always return `catalog.key` (or filename) with the quote.
- If the PDF is missing, say so and point at DOWNLOAD_STATUS — do not paraphrase from memory as a quote.
