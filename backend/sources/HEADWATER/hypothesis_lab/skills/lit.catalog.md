# Skill: lit.catalog

## Purpose

List literature entries for RAG filtering (theme, status, project link).

## Backing

- `docs/literature/catalog.csv`
- `docs/literature/bibliography.bib`
- Overview: `docs/literature/README.md`

## Contract

- Return only rows that exist in the catalog.
- Do not invent DOIs, years, or keys.
- Prefer filtering by `theme` and `status` (`in_notes`, `seeded`, gap).
