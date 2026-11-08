# v0.2.1 brand refresh verification

Verified November 6, 2026.

- Original ORNL SVG and DOE Genesis PNG assets were verified, bundled locally, and rendered with their original aspect ratios.
- Both header images loaded successfully in the browser. Desktop and 390-pixel layouts were inspected; the narrow document had no horizontal overflow and no browser console errors were observed.
- Main interface contrast pairs measured: white on ORNL green 7.15:1, primary text on white 13.40:1, muted text on white 4.72:1, sidebar navigation text on navy 9.70:1.
- Python and JavaScript syntax checks passed. This revision changes branding, logo placement and visual color tokens; scientific data and backend execution behavior are retained.

The v0.2.0 functional/data verification below applies to the retained workflow. It is not a claim of new model or HPC execution.

## v0.2.0 functional verification

Verified on November 6, 2026, on macOS with Python 3.9.6 and the installed VISTA 0.2.4 API.

- **25 Python checks passed:** 17 adapter/Skills tests using fake loopback VISTA responses and 8 full-network scientific data checks.
- **8 frontend checks passed:** CSV parsing, explicit unit contracts, volume conversion, invalid dates/nonweekly rows, missing predictions/totals, prompt routing and workflow/prompt catalog status.
- Browser checks verified all 52 options in the site selector, network navigation/search, Nickajack’s no-prediction state, Savannah’s partial-week chart, the live count of 2 loaded skills, skill instructions, the eight-prompt library, immediate recorded answers and review-before-send live requests.
- The narrow viewport had no horizontal document overflow. Desktop and narrow layouts were visually inspected. No browser console errors were observed.
- Source inventory, source units, original-map hashes, 26 calendar positions per site, 1,233 saved eligible pairs, 119 explicit gaps and model-specific provenance were validated.
- Read-only live access confirmed the selected VISTA project, resource status and loaded skill metadata. No real agent inference or HPC submission ran during this revision.

The existing chat/streaming/file/report adapter is retained. Python tests cover SSE flushing and multipart forwarding. The original version’s isolated browser fixture previously exercised streaming, elicitation, uploads, displayed CSVs, report downloads and history; those are not represented as real scientific computation.

Not verified: live HEADWATER products, a runnable downscaling integration, actual TVA Frontier runtime/submission/transfers, Odo/Lux TVA job definitions, CCSI execution, Georgia Tech economics integration, Windows/Linux launch, or compatibility with other VISTA releases. Planned workflow cards clearly retain their integration status.

Preview.jpg, Preview-network.jpg and Preview-skills.jpg were captured from this revision with local VISTA connected. Resource states and the loaded skill count vary with the laptop/project.
