# TVA Workbench · v0.3.0

A dedicated Water4Energy webpage for presenting the TVA agentic workflow from a laptop, with VISTA as the execution backend. The main screen keeps the four-stage workflow, full TVA network map, agent and result chart in view. Skills, resources and supporting evidence remain available on demand.

[Run locally](#run-from-github) · [Version history](#version-history) · [Backend](BACKEND.md) · [Data notes](DATA_NOTES.md) · [VISTA](https://github.com/Genesis-VISTA/vista)

![TVA Workbench presentation view](Preview.jpg)

## Run from GitHub

Clone the repository:

```sh
git clone https://github.com/cheny-4/tva-workbench.git
cd tva-workbench
```

Or choose **Code → Download ZIP** on GitHub and extract the complete folder. To use a specific revision, select its version tag before downloading. From that folder, double-click **Start TVA Workbench.command** on macOS or **Start TVA Workbench.bat** on Windows; on Linux run `sh start.sh`. Terminal users can run `python3 server.py` with Python 3.9+.

The app runs on your laptop at **http://127.0.0.1:8765**. GitHub hosts the source and history; GitHub Pages cannot run the Python server or local VISTA backend. Recorded mode works without VISTA. Live mode uses your own running VISTA and TVA project, as described below.

## ORNL / Genesis theme

The header uses the original ORNL wordmark and DOE’s current Genesis Mission mark, bundled locally for offline presentation. ORNL’s website green (`#00662c`) drives primary controls and selected states. The Genesis mark remains black and white; navy is a complementary interface color rather than a claimed official Mission palette. Map, chart, navigation and text colors share the same tokens.

Brand styling is centralized in `public/brand-theme.css`. The logo files are in `public/assets/brand/` and are embedded proportionally without redrawing or recoloring. Source URLs, checksums and palette details are in [BRANDING.md](BRANDING.md).

## What changed in v0.3.0

- **Cleaner presentation:** compact workflow, map, agent and chart; stage details expand when needed.
- **Three starters:** Explain workflow, Explore TVA and Show skills. Recorded answers are brief, with expandable **More detail**; the full eight-prompt library remains available.
- **Details on demand:** scenario, model and compute controls sit under **Demo options**. **More** opens the prompt library, conversations, files and resources. **Metrics & provenance** opens the selected result’s evidence.
- **Full project coverage:** all ELF01–ELF52 sites, the searchable network roster, live Skills count and cards, ORNL/Genesis branding and resource views are retained. Planned integrations remain labeled.

If an older Workbench is still running, stop its launcher terminal with **Control+C** before launching this revision. Refreshing the browser alone does not restart the Python backend.

## Version history

- [v0.2.1](https://github.com/cheny-4/tva-workbench/tree/v0.2.1): preserved original ORNL/Genesis presentation.
- [v0.3.0](https://github.com/cheny-4/tva-workbench/tree/v0.3.0): simplified DOE presentation with supporting details on demand. Scientific data and backend contracts are retained.

The tags point to consecutive commits: the original v0.2.1 snapshot first, followed by v0.3.0. Repository setup documentation is included in v0.3.0.

## Start on macOS

1. Open the cloned repository or extract the downloaded ZIP into a writable folder. Keep all files together.
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

1. Click a starter prompt, or open **Demo options → Walk through recorded run** for an annotated walkthrough of the included record.
2. Select a **Site** to inspect its chart, or open **TVA network** to search all 52 sites. Missing saved results stay missing; no values are filled.
3. Open **Metrics & provenance** for the selected site, or download the CSV, provenance JSON and summary from **More → Project files**.
4. Click **Export brief** for a local Markdown study brief.
5. Optionally select **GEFS retrospective · Mar 2010** under **Demo options** to show the completed two-week retrospective forcing pilot.

The historical example spans 26 calendar weeks starting January–June 2010, with the final week ending July 4. It includes 1,233 eligible saved site–week pairs across 51 sites; Nickajack (ELF46) has no saved evaluation predictions. The 119 missing site–week positions are explicit gaps, not zero flow. Charts use **weekly ELF volume in million cubic metres**. The model output is the site reference quantity; it is not universally total upstream inflow. Sample NSE values cover the displayed weeks only. The recorded guide answers the eight starter topics and example questions using included project metadata; it does not call a language model. Open-ended agent work uses Live VISTA.

## Connect to VISTA for live work

Each laptop needs its **own installed, running VISTA**, inference configuration, TVA project and TVA skills. The repository does not transfer your VISTA installation or access credentials to Dali’s laptop.

1. Open VISTA normally and confirm your TVA project is available.
2. In Workbench, click **Connection settings**.
3. Keep the default backend `http://127.0.0.1:8001`, unless your VISTA uses another local port.
4. Enter the exact project name. The initial default is `Genesis_Water4Energy`.
5. Save and check the connection, then select **Live VISTA**.
6. Choose a starter prompt, or open **Demo options → Prepare live inference plan**. These fill a message for you to review and send.

**Prepare live inference plan** requests read-only checks and asks the agent to wait for explicit confirmation before submitting a job. It does not automatically upload the included input pair or submit work. Upload an appropriate CSV/metadata pair through **Attach files** when needed, and review which files the agent proposes to use. The prepared historical example pairs remain two-site input examples and do not provide full-network forcing. They are in `public/data/inputs/`; use a matched CSV/metadata/model combination.

Live chat, tool events and elicitation requests use the real VISTA backend. Existing conversation history stays in VISTA. The Workbench stores only a selected conversation ID in browser storage and backend address/project name in `.local/config.json`. Credentials remain in VISTA. Sensitive elicitation values are forwarded to VISTA without being added to the Workbench transcript or report.

The evidence panel uses files **explicitly displayed in the selected conversation**. Known prediction CSVs containing `basin_id` (or `site_id`), `start` (or `week_start`), and `predicted_volume_m3` are plotted automatically; missing predictions and calendar gaps remain gaps. Other artifacts are downloadable, and displayed images can be previewed. Project files lists all project inputs/outputs separately. An agent turn marked complete is not proof that a cluster job completed.

**Stop turn** stops the VISTA agent turn. A previously submitted HPC job may continue; check its actual scheduler status in VISTA. Closing the webpage does not stop a backend-owned turn. Reopening a running conversation reconnects while the VISTA process is alive; a backend restart interrupts active runs.

**Export brief** in Live mode asks VISTA to draft a report from the selected conversation and downloads it as Markdown. Review generated claims against tool events and original artifacts before presentation.

## Skills and stage coverage

Open **Skills** to read the live TVA project’s count, descriptions and available job definitions; the sidebar also shows its loaded count. The adapter fetches only skills attached to the selected project; unrelated VISTA library skills remain outside this view. Add or load a new skill in VISTA, then click **Refresh from VISTA**. Offline or missing-project counts are shown as unknown, not zero.

The four-stage workflow describes the intended science chain. HEADWATER, downscaling and Georgia Tech handoffs are labeled as planned integrations. A loaded LSTM skill, recorded model evidence and a verified compute runtime remain distinct states. The stages and prompts are documented in [WORKFLOW_NOTES.md](WORKFLOW_NOTES.md).

## Resources

Open **More → Compute resources** for readiness and connection details.

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

For v0.3.0, all 8 frontend checks passed, Python syntax compiled, and DOM IDs/selectors were checked. Manual browser checks covered the simplified main screen, prompt expansion, metrics, Demo options and resources. The earlier backend/scientific test results are retained baseline evidence; they were not rerun for this presentation revision. No real inference or HPC submission was performed. See [VERIFICATION.md](VERIFICATION.md) for coverage and limits, and Preview.jpg for the interface preview.

Run backend/data checks with `python3 -m unittest discover -s tests -v` and frontend checks with `node --test tests/test_frontend.cjs` when Node is available.

Files to customize:

- `public/index.html`, `public/styles.css`: layout and presentation.
- `public/brand-theme.css`: ORNL / Genesis color tokens, official logo layout and theme overrides.
- `public/presentation.css`: compact DOE presentation layout and responsive overrides.
- `public/app.js`: interaction, streaming, charting and VISTA client.
- `public/project-ui.js`: full network, Skills, workflow stages and prompt-library views.
- `server.py`: local server and scoped backend proxy.
- `public/data/`: recorded examples, map and prepared input pairs.

No build step is required. Refresh the browser after editing. Do not distribute `.local/`, Python caches, personal VISTA state or credentials when repackaging.

VISTA: https://github.com/Genesis-VISTA/vista
