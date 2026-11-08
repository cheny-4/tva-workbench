# TVA Workbench · v0.2.1

A dedicated Water4Energy webpage for presenting the TVA agentic workflow from a laptop. VISTA remains the execution backend. The interface includes the full 52-site TVA network, a four-stage scientific workflow, a live Skills view and count, eight persistent starter prompts, chat, tool activity, history, files, prediction charts and provenance.

## ORNL / Genesis theme · v0.2.1

The header uses the original ORNL wordmark and DOE’s current Genesis Mission mark, bundled locally for offline presentation. ORNL’s website green (`#00662c`) drives primary controls and selected states. The Genesis mark remains black and white; navy is a complementary interface color rather than a claimed official Mission palette. Map, chart, navigation and text colors share the same tokens.

Brand styling is centralized in `public/brand-theme.css`. The logo files are in `public/assets/brand/` and are embedded proportionally without redrawing or recoloring. Source URLs, checksums and palette details are in [BRANDING.md](BRANDING.md).

## What changed in v0.2

- **TVA network:** all ELF01–ELF52 sites, a searchable roster, a site selector, and the original ELF map/routing schematic.
- **Scientific workflow:** HEADWATER precipitation/air-temperature/runoff → reconstruction and downscaling → Yang’s LSTM water availability → Georgia Tech economic assessment. TRITON hydraulics, RiTHyMs water temperature and the plant interface appear as supporting paths. Click a stage for its input/output contract.
- **Skills:** the sidebar and header show the selected VISTA project’s actual loaded count. Skills cards show descriptions, job definitions and instructions. Planned science stages are not counted as loaded skills.
- **Starter prompts:** three persistent starters plus an eight-prompt library. Recorded mode explains the project immediately; Live mode prepares a request for review and Send.

If an older Workbench is still running, stop its launcher terminal with **Control+C** before launching this revision. Refreshing the browser alone does not restart the Python backend.

## Start on macOS

1. Extract the ZIP into a normal, writable folder. Keep the whole `tva-workbench` folder together.
2. Double-click **Start TVA Workbench.command**. A Terminal window starts the local app and opens your browser.
3. Keep that Terminal window open during the presentation. Press **Control+C** there when finished.

The launcher uses VISTA’s bundled Python when installed, otherwise Python 3.9 or later. No npm, pip, internet font, frontend build, or package installation is needed. If macOS opens the command as text, run it from Terminal with `sh "Start TVA Workbench.command"` while in the extracted folder.

The local address is **http://127.0.0.1:8765**. Opening the launcher again reopens the existing Workbench when it recognizes that app at this port.

## Start on Windows or Linux

- **Windows:** install Python 3.9+ if needed, extract the ZIP, then double-click **Start TVA Workbench.bat**.
- **Linux:** use Python 3.9+ and run `sh start.sh` from the extracted folder.
- **Any platform, terminal:** `python3 server.py` (Windows may use `py -3 server.py`).

Windows and Linux launchers are included, but browser verification was performed on macOS. If port 8765 is occupied by another program, run `python3 server.py --port 8767`.

## Present immediately with the recorded example

The app opens in **Recorded example** mode, which works with VISTA closed and without network access.

1. Click **Walk through recorded run** to explain the included workflow record. This is an annotated walkthrough, not a new computation.
2. Open **TVA network** to search all 52 sites, or use **Inspect a site** and the evidence-panel selector. Missing saved results stay missing; no values are filled.
3. Open **View provenance** or download the CSV, provenance JSON and summary from **Project files**.
4. Click **Export brief** for a local Markdown study brief.
5. Optionally select **GEFS retrospective · Mar 2010** to show the completed two-week retrospective forcing pilot.

The historical example spans 26 calendar weeks starting January–June 2010, with the final week ending July 4. It includes 1,233 eligible saved site–week pairs across 51 sites; Nickajack (ELF46) has no saved evaluation predictions. The 119 missing site–week positions are explicit gaps, not zero flow. Charts use **weekly ELF volume in million cubic metres**. The model output is the site reference quantity; it is not universally total upstream inflow. Sample NSE values cover the displayed weeks only. The recorded guide answers the eight starter topics and example questions using included project metadata; it does not call a language model. Open-ended agent work uses Live VISTA.

## Connect to VISTA for live work

Each laptop needs its **own installed, running VISTA**, inference configuration, TVA project and TVA skills. The ZIP does not transfer your VISTA installation or access credentials to Dali’s laptop.

1. Open VISTA normally and confirm your TVA project is available.
2. In Workbench, click **Connection settings**.
3. Keep the default backend `http://127.0.0.1:8001`, unless your VISTA uses another local port.
4. Enter the exact project name. The initial default is `Genesis_Water4Energy`.
5. Save and check the connection, then select **Live VISTA**.
6. Start with **Explain the full TVA workflow**, **Show the project’s loaded skills**, or **Prepare live inference plan**. These fill a message for you to review and send.

**Prepare live inference plan** requests read-only checks and asks the agent to wait for explicit confirmation before submitting a job. It does not automatically upload the included input pair or submit work. Upload an appropriate CSV/metadata pair through **Attach files** when needed, and review which files the agent proposes to use. The prepared historical example pairs remain two-site input examples and do not provide full-network forcing. They are in `public/data/inputs/`; use a matched CSV/metadata/model combination.

Live chat, tool events and elicitation requests use the real VISTA backend. Existing conversation history stays in VISTA. The Workbench stores only a selected conversation ID in browser storage and backend address/project name in `.local/config.json`. Credentials remain in VISTA. Sensitive elicitation values are forwarded to VISTA without being added to the Workbench transcript or report.

The evidence panel uses files **explicitly displayed in the selected conversation**. Known prediction CSVs containing `basin_id` (or `site_id`), `start` (or `week_start`), and `predicted_volume_m3` are plotted automatically; missing predictions and calendar gaps remain gaps. Other artifacts are downloadable, and displayed images can be previewed. Project files lists all project inputs/outputs separately. An agent turn marked complete is not proof that a cluster job completed.

**Stop turn** stops the VISTA agent turn. A previously submitted HPC job may continue; check its actual scheduler status in VISTA. Closing the webpage does not stop a backend-owned turn. Reopening a running conversation reconnects while the VISTA process is alive; a backend restart interrupts active runs.

**Export brief** in Live mode asks VISTA to draft a report from the selected conversation and downloads it as Markdown. Review generated claims against tool events and original artifacts before presentation.

## Skills and stage coverage

Open **Skills** to read the live TVA project’s count, descriptions and available job definitions. The adapter fetches only skills attached to the selected project; unrelated VISTA library skills remain outside this view. Add or load a new skill in VISTA, then click **Refresh from VISTA**. Offline or missing-project counts are shown as unknown, not zero.

The four-stage workflow describes the intended science chain. HEADWATER, downscaling and Georgia Tech handoffs are labeled as planned integrations. A loaded LSTM skill, recorded model evidence and a verified compute runtime remain distinct states. The stages and prompts are documented in [WORKFLOW_NOTES.md](WORKFLOW_NOTES.md).

## Resources

| Resource | Current Workbench support |
| --- | --- |
| Frontier | Reports VISTA readiness; target of the currently installed TVA inference skill. Actual runtime, account, input and transfer prerequisites must still be verified. |
| Odo | Reports VISTA readiness. A matching TVA job definition is needed before TVA execution here. |
| Lux | Reports VISTA readiness. A matching TVA job definition is needed before TVA execution here. |
| CCSI GPU node | Visible as **Planned**. No connection or execution is claimed. |

Adding CCSI later requires its host/access method, scheduler if any, Python/container environment, storage paths and a VISTA tool/skill adapter. The interface already reserves its resource card. Resource readiness and scientific workflow validation are separate facts.

## Scientific and deployment scope

This package presents the full project science chain and demonstrates recorded saved-model evidence review. It does not execute the planned HEADWATER/downscaling/economics stages merely by displaying their cards. The included examples do not implement reservoir-operation optimization, hydropower decisions, live HEADWATER ingestion or a general verified forecast service. The GEFS scenario is one archived issue/control member, two sites and two weeks; its timing and data-latency qualifications are included in provenance. The map uses simplified USGS-derived forcing-region reconstructions; markers are region centroids, not dam/outlet locations.

The package contains a limited-period full-network recorded evaluation, a separate two-site GEFS pilot, prepared two-site input examples, simplified project map geometry and the original ELF reference diagrams. It omits checkpoints, full training datasets, full archives and credentials. Treat it as an authorized local project demonstration, not a public dataset release.

The server binds only to this laptop’s loopback address. It is not a shared or publicly hosted service. VISTA API compatibility was reviewed against the installed VISTA 0.2.4; future pre-1.0 versions may require adapter changes. See [BACKEND.md](BACKEND.md) and [DATA_NOTES.md](DATA_NOTES.md) for contracts and source details.

## Verification and source

`python3 -m unittest discover -s tests -v` runs adapter tests against a fake local VISTA. Optional frontend data checks use `node --test tests/test_frontend.cjs` if Node is available. Browser checks exercise the real page, recorded walkthrough, site/scenario changes, navigation and a separate fake backend for streaming, files, reports and human-input prompts. Read-only checks confirmed the installed local TVA project and resource-status connection. No real agent inference or HPC submission was performed while creating this package. See [VERIFICATION.md](VERIFICATION.md) for coverage and limits, and Preview.jpg for the interface preview.

Files to customize:

- `public/index.html`, `public/styles.css`: layout and presentation.
- `public/brand-theme.css`: ORNL / Genesis color tokens, official logo layout and theme overrides.
- `public/app.js`: interaction, streaming, charting and VISTA client.
- `public/project-ui.js`: full network, Skills, workflow stages and prompt-library views.
- `server.py`: local server and scoped backend proxy.
- `public/data/`: recorded examples, map and prepared input pairs.

No build step is required. Refresh the browser after editing. Do not distribute `.local/`, Python caches, personal VISTA state or credentials when repackaging.

VISTA: https://github.com/Genesis-VISTA/vista
