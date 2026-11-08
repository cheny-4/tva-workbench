# Workflow and starter prompt sources

The workflow catalog follows the user's four main stages: HEADWATER prediction, high-resolution downscaling, Yang Chen's LSTM water availability, and Georgia Tech economic assessment. The two supplied slide decks provide the detailed model handoffs and optional plant-impact paths.

## Source record

- `Dali-earth-Google-ORNL-GM.pptx`, slide 2. SHA256: `2dba49e2ef2be25aaa314c4e07aa9f3418af30d654a12ddd1624999356c0c7c7`.
- `TRITON_discussion.pptx`, slide 1. SHA256: `774e7a9846ccc2a9a184b4324f06c8bd8d7eb1c1d193cdc19836fcd9867d3e07`.

Slide text was inspected directly from the original PPTX XML. The source presentations were not edited, imported, or bundled into this application. These are project references, not evidence of a live model run.

The Google/ORNL discussion's slide 2 describes input data, ORBIT/LANDSIM prediction, regional-to-1 km downscaling, RiTHyMs/RiverWare impact models, TVA decision support, and an agentic orchestration layer. The later user clarification supplies the current HEADWATER/LSTM/Georgia Tech spine. `workflow.json` preserves that distinction.

The TRITON discussion's slide 1 describes a 25 km HEADWATER residual/probability-map handoff, reconstruction with historical reference maps, and a 4 km intermediate / 1 km target. It adds TRITON hydraulics, RiTHyMs river temperature, a later reservoir/CE-QUAL-W2 path, a plant-data interface, and Georgia Tech generation/cost/risk analysis whose metrics remain to be agreed. Its questions leave TRITON TVA readiness, routing needs and agentic skill availability unresolved.

## Catalog contracts

- `public/data/workflow.json`: `stages` contains four main stage records. Each record has a stable ID, number, title, short title, owner, status, status label, description, input and output arrays, target resolution, source references, integration note, and skill-keyword hints. `branches` contains two optional plant-impact paths. `handoff` describes the plant interface. `sources` and `disclosures` retain the evidence scope.
- `public/data/prompts.json`: `prompts` contains eight records with ID, category, title, description, live prompt, recorded answer and optional stage ID. The live prompt prepares read-only inspection/planning. The recorded answer is a deterministic explanation of the source materials and included evidence.

## Status semantics

`planned` describes a project stage without claiming an installed skill or execution. `recorded_available` describes existing LSTM example results and does not imply a verified live HPC runtime. Actual installed skill names/count must come from the selected VISTA project. Never count the four workflow cards or two optional branches as installed skills.

The prompt library does not provide HEADWATER forecasts, downscale data, run an LSTM or create economic results merely because a prompt is clicked. Keep model/tool execution and its observed results distinct from a requested plan. Any synthetic scenario used in a future demonstration must be labeled as synthetic.

## Scientific interpretation

The LSTM uses prepared basin-week inputs and matched model metadata. A thirteen-week input window includes a target week plus twelve preceding weeks; it does not mean a thirteen-week forecast lead. The ELF source header expands ELF as Estimated Local Flow. Individual reference quantities may be local, incremental or allocated, so the plant handoff must state what each site's quantity means before calling it total plant inflow or summing sites.

No new forecast, inference, downscaling, economic calculation, real agent turn or HPC job ran to author these catalogs.
