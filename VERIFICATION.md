# v0.4.0 verification

Verified November 7, 2026 on macOS with Python 3.9 and the local VISTA 0.2.4 backend.

## Automated checks

- **17 local adapter checks passed:** scoped proxy/file access, multipart uploads, SSE flushing, project/skill boundaries, loopback configuration, status refresh and request validation. These tests use a fake loopback VISTA backend.
- **6 catalog checks passed:** the exact 12 headwaters, 54 unique study locations, unchanged original model-matching keys, explicitly unmapped new reservoirs, source geometry/reference images, and removal of bundled evaluation artifacts.
- **17 JavaScript checks passed:** CSV parsing and explicit volume units, dates and gaps, review-before-send prompts, integration status, output-store provenance, catalog name matching, saved-file classification, safe paths, filtering and timestamps.

## Browser checks

- The live workspace has no recorded-mode switch, historical scenario, evaluation metrics or team/owner labels. Its default results area is empty until actual conversation outputs are available.
- The location selector has native groups containing 12 headwater reservoirs and 42 other reservoir/gage locations. Wolf Creek's workflow plan prepared an editable request with zero chat messages/tool events; it did not submit work. Dale Hollow was found through network search and selected successfully.
- Results Library read the real selected project's 10 existing output files. Type filters, search and the truthful no-matching-figures state worked.
- An isolated, read-only QA backend supplied a synthetic PNG, CSV and Markdown file solely for testing. Figure preview loaded in its dialog, filtering worked, and the CSV download succeeded. The fixture servers and downloaded test file were cleaned up. QA files are not bundled or saved to the real VISTA project.
- Laptop (1366-pixel) and narrow (390-pixel) workspace/library layouts had no horizontal document overflow. No browser console errors were observed.
- Original ORNL/Genesis logos retain their aspect ratios and local asset sources. Live agent streaming, Stop, elicitation and session reconnection controls are retained.

No real agent inference, HEADWATER/downscaling/economics execution or HPC submission ran during this revision. The selected project's skill/resource/output metadata was read only. Existing storage is provided by VISTA; this revision adds a browser for its output files rather than a new persistence service.

Actual model support for Wolf Creek/Dale Hollow, live compute/runtime readiness, planned science integrations and Windows/Linux launch were not verified. The map remains a reference-point study-coverage view rather than a precise dam-outlet/routing map. Earlier recorded-study assets remain available in the prior Git tags.
