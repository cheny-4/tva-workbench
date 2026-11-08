# TVA Workbench · v0.4.0

A Water4Energy interface for the TVA agentic workflow, using a local VISTA installation as its execution backend. This version restores the fuller v0.2.1 layout and focuses on live work.

![TVA Workbench](Preview.jpg)

## What changed

- Live VISTA workspace with editable starter prompts, conversations, skills and compute resources.
- A 54-location study catalog, grouped into **12 headwater reservoirs** and **42 other reservoir/gage locations**. Names identify study locations; ELF describes a flow quantity.
- Headwater reservoirs are distinguished in the selector, network roster and map: Norris, Douglas, South Holston, Watauga, Fontana, Blue Ridge, Normandy, Tims Ford, Chatuge, Nottely, Wolf Creek and Dale Hollow.
- Four science stages retain their inputs, outputs and integration status, with team labels removed.
- **Results Library** collects saved figures, data, reports and other files from the selected VISTA project's outputs. Conversation results show the files displayed by that agent session.
- Recorded examples and historical evaluation assets are removed from this version. Earlier versions remain available in Git history.

## Launch

Clone this private repository, or select **Code → Download ZIP** and extract the complete folder:

```sh
git clone https://github.com/cheny-4/tva-workbench.git
cd tva-workbench
```

On macOS, double-click **Start TVA Workbench.command**. On Windows, use **Start TVA Workbench.bat** with Python 3.9+. On Linux, run `sh start.sh`. Terminal users can run `python3 server.py`.

The app opens at **http://127.0.0.1:8765**. Keep the launcher terminal open; use Control+C to stop it. Stop an older Workbench before starting this version. No frontend build or package installation is needed. The launcher uses VISTA's bundled Python where available, otherwise Python 3.9+.

Open VISTA separately on the same laptop. In **Connection settings**, use its local backend (default `http://127.0.0.1:8001`) and the exact project name (default `Genesis_Water4Energy`). Each laptop needs its own VISTA installation, project, skills and access configuration. GitHub hosts source and history; the Python/VISTA application runs locally.

## Use the workspace

1. Choose a study location, starting with the headwater group, and a supported compute resource.
2. Click a starter prompt or **Plan workflow**. The request is placed in the composer for review; click Send to start an agent turn.
3. Follow the agent conversation and tool activity. Supply requested input or stop the turn through the interface.
4. Ask the agent to save generated figures, datasets and reports in the project's output area and display the files. Open **Results Library** to browse, preview or download saved outputs across conversations.

The library reads files stored by VISTA; it does not move inputs into outputs or create sample results. Files remain subject to the selected VISTA project's storage and deletion behavior. Attaching files in chat supplies inputs. **Export brief** generates a Markdown download from the current conversation; reports appear in the library when saved as project output files.

## Workflow and scope

The intended science chain is **HEADWATER precipitation/temperature/runoff → high-resolution downscaling → LSTM water availability → economic assessment**. A workflow card describes a stage; only the live selected-project Skills count describes loaded skills. Planned integrations retain that status.

Adding Wolf Creek and Dale Hollow to the catalog does not add model training, forcing, routing or runtime support. The agent must check whether the selected skill supports a requested location before planning execution. Resource readiness also remains distinct from an executable TVA job definition. CCSI is a planned resource.

The map shows study coverage, using existing forcing-region reference points and USGS lake-station references for the two additions. It is not a dam-outlet or routing map. See [DATA_NOTES.md](DATA_NOTES.md).

Generated prediction CSVs are plotted only when their column/unit contract is recognized. Missing predictions and calendar gaps remain gaps. Volume display conversion is explicit; a file using ELF quantities does not by itself establish total upstream inflow. Figures and other output files can be viewed independently of prediction charts.

VISTA owns credentials, history and execution. The wrapper stores the backend/project in ignored `.local/config.json` and a selected conversation ID in browser storage. The server binds to loopback only. **Stop turn** stops the agent turn; already submitted HPC jobs remain scheduler-managed. See [BACKEND.md](BACKEND.md), [WORKFLOW_NOTES.md](WORKFLOW_NOTES.md), [BRANDING.md](BRANDING.md) and [VERIFICATION.md](VERIFICATION.md).

## Version history

| Version | Interface |
| --- | --- |
| [v0.2.1](https://github.com/cheny-4/tva-workbench/tree/v0.2.1) | Full original interface with recorded examples |
| [v0.3.0](https://github.com/cheny-4/tva-workbench/tree/v0.3.0) | Simplified DOE presentation |
| [v0.4.0](https://github.com/cheny-4/tva-workbench/tree/v0.4.0) | Full live workspace, headwater grouping and Results Library |

## Development

`public/index.html`, `app.js` and `project-ui.js` provide the interface. `styles.css` and `brand-theme.css` retain ORNL/Genesis styling; `live-workspace.css` covers this revision. `results-library.js` and its CSS provide the saved-output browser. Catalogs and geometry are in `public/data/`; `server.py` is the scoped local VISTA adapter.

```sh
python3 -m unittest discover -s tests -v
node --test tests/*.cjs
```

Node is optional for developer checks and is not needed to run the app. Exclude local state, credentials, caches and release archives from source commits. Original ORNL/Genesis assets are bundled locally with source attribution.
