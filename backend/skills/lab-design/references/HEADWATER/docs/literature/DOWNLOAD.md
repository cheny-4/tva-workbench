# Download the HEADWATER literature PDFs

18 October 2026. This note is for a human or an agent on a machine with outbound HTTPS that can pass publisher Cloudflare checks. Successful PDFs are committed under `docs/literature/pdfs/`. Many AMS/Wiley hosts block Frontier login nodes; a desktop network often works for the open-access rows.

## What to fetch

| File | Role |
|---|---|
| [download_manifest.csv](download_manifest.csv) | One row per paper: DOI, landing URL, preferred PDF URL, access flag |
| [catalog.csv](catalog.csv) | Theme and project-note links (no URLs) |
| [bibliography.bib](bibliography.bib) | BibTeX |

Local / git store:

`docs/literature/pdfs/<key>.pdf`

Example: `docs/literature/pdfs/li2011nash.pdf`. Commit new PDFs after a successful fetch.

## Agent task (copy this)

```text
In the HEADWATER repo, download the literature PDFs listed in
docs/literature/download_manifest.csv into docs/literature/pdfs/.

1. Read docs/literature/DOWNLOAD.md and docs/literature/download_manifest.csv.
2. Prefer: python3 scripts/download_literature.py
3. If the script cannot run, curl/wget each preferred_pdf_url to
   docs/literature/pdfs/<key>.pdf. Skip files that already exist and
   look like PDFs (%PDF header).
4. For rows with access=paywall, try preferred_pdf_url once. On 403/401,
   open landing_url, record the failure in docs/literature/pdfs/DOWNLOAD_STATUS.md,
   and continue. Do not invent alternate pirate mirrors.
5. Write docs/literature/pdfs/DOWNLOAD_STATUS.md with one line per key:
   ok / skipped / failed + HTTP status or short reason.
6. git add the new PDFs and DOWNLOAD_STATUS.md, then commit and push.
```

## Script

From the repo root, on a node that can reach the open web:

```bash
python3 scripts/download_literature.py
```

Useful flags:

```bash
# only open-access rows
python3 scripts/download_literature.py --open-only

# one key
python3 scripts/download_literature.py --key wei2019isv

# custom destination
python3 scripts/download_literature.py --out /path/to/pdfs
```

The script uses the standard library only (`urllib`). It sends a normal browser-like User-Agent. It refuses to overwrite a file that already starts with `%PDF`.

## Access notes

- **open:** Direct PDF URL is expected to work without a login on most research networks.
- **paywall:** `koster2004coupling`, `koster2010streamflow`, and `seneviratne2010review` were saved by hand on 20 Oct 2026 and are in `pdfs/`. `li2012ridge` is on disk but is the wrong article (see [EXTEND_DOWNLOAD.md](EXTEND_DOWNLOAD.md)).
- AMS `downloadpdf` links and Wiley `pdfdirect` links sometimes need cookies; if curl gets HTML, open the `landing_url` in a browser and save the PDF as `<key>.pdf`.
- Prefer the arXiv PDF for WeatherBench 2 (`rasp2024weatherbench2`) and the PMC PDF for Wei et al. (`wei2019isv`).

## After download

Confirm:

```bash
ls docs/literature/pdfs/*.pdf | wc -l
file docs/literature/pdfs/*.pdf | head
```

As of 20 Oct 2026, all 22 catalogued PDFs are in `pdfs/`. Two of those files are still not the usable paper: `li2012ridge` is the wrong article, and `ropelewski1986enso` has no article text ([EXTEND_DOWNLOAD.md](EXTEND_DOWNLOAD.md)). On Frontier login nodes, expect many AMS/Wiley 403s even for OA titles.
