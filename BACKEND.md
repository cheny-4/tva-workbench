# Local VISTA adapter · v0.14.0

The combined launcher and the HTTP wrapper have separate responsibilities:

- **`launch_workbench.py`** verifies the package, opens installed VISTA if needed, prepares the dedicated project/skills/source index and saved evidence, then starts the interface.
- **`server.py`** serves `public/` and proxies an allowlist of routes to one local VISTA project. It uses only Python 3.9+ standard-library modules. Running it directly skips backend setup.
- **`backend/replay.py`** and its skill copies read pinned saved records, validate source hashes and write context-specific inspection files. They do not train, score, download datasets, submit jobs or change approval flags.

Setup uses direct local API operations and verified file checks/copies, not an LLM turn. A stage click or prepared question does not start an agent. The person presses **Send** for a conversation turn.

## Launch and configuration

On macOS, extract the complete package and double-click **Start TVA Workbench.command**. Keep Terminal and VISTA open. The recipient needs installed VISTA and their own model credentials; the ZIP contains no account secrets or VISTA database. The retained Windows/Linux entry points use the same setup path; desktop launch verification is performed on macOS.

The combined launcher accepts `--backend-url`, `--port`, `--no-browser`, `--no-start-vista`, `--setup-only` and `--setup-timeout`. `TVA_VISTA_URL` can supply the backend address, and `W4E_VISTA_INSTALL` can identify a nonstandard VISTA package directory. The launcher pins the dedicated project name **`Water4Energy-TVA-agent-loop`**.

For wrapper-only development, run `python3 server.py --no-browser --port 8765`. Its `--backend-url`/`--project` options and `TVA_PORT`, `TVA_VISTA_URL`, `TVA_PROJECT` variables configure that process. Connection settings saves only a backend address and project name in `.local/config.json`; no token/key is accepted there. Backend addresses must be loopback HTTP origins without credentials, path, query or fragment.

The wrapper binds only to `127.0.0.1` for use on the presenting laptop. An occupied preferred port falls back to an OS-selected free port without stopping other processes. The printed URL is authoritative. Reopening reuses only a matching folder, version and connection identity. `.local/instance.json` stores launch metadata. Browser-open failures print a copyable URL.

Ctrl+C stops the wrapper. A backend-owned VISTA turn can continue after its browser/wrapper closes; use **Stop** or VISTA itself to cancel it. SSE reconnection can watch that running turn, but does not provide durable resumption after a VISTA backend restart.

## Project setup and verified upgrades

Setup creates or recognizes the dedicated project, loads **eight replay skills**, and indexes **eight documents**: the original six lead sources, the TVA answer guide and the HEADWATER development guide. It polls document/index status before reporting setup ready. It reads only the secret-free `/settings/inference` view to report whether a model and credential are configured; that check does not test actual model access.

Known original **v0.13.1 and v0.13.2** installations have packaged migration baselines. Before replacing old global skills, setup verifies the project policy, ownership/body metadata and mounted file hashes, and refuses an upgrade if another project shares those old globals. Original project metadata and complete skill files are backed up under ignored `.local/upgrade-backups`. Replacement uses VISTA's supported full-folder import, not a body-only edit. Verified temporary staging folders are removed. An interrupted upgrade can resume from known old/current items.

Unknown project/skill edits and differing saved evidence are preserved and reported. Matching evidence is not rewritten. New guide documents are appended for indexing; existing sources are not deleted. The package excludes `.local/`, credentials, caches, chat history and local project IDs. The installed API reviewed for compatibility is VISTA 0.2.4; later VISTA API changes may require adapter updates.

## Context-specific saved-evidence readers

The interface remains one Water4Energy project with two contexts. **HEADWATER development** opens first; **TVA · 16–22 April 2019** is a selectable case. Context changes do not create or rename projects. Each context has its own question list, draft, conversation association and evidence pane. An unlabelled history item requires a context choice, and the switcher is disabled during an active turn.

HEADWATER requests explicitly select `--context headwater` and a matching profile:

| Profile | Reader | Source boundary |
| --- | --- | --- |
| `headwater-ledger` | `lab.ledger` | Recorded development results and remaining questions |
| `headwater-brief` | `lab.design` | The 6 November review pack; no selected current brief is established |
| `headwater-data` | `lab.download` | Dated Frontier preparation/inventory records; no live remote file check |
| `headwater-board` | `lab.board` | Separate original board and supplied 12 November demo record |
| `headwater-score` | `lab.ledger` | H100 four-week error comparison, its limitations and exact stored-week label |
| `headwater-history` | `lab.ledger` | Four dated records; readable retrospective plus a source-linked CSV |

The reader validates profile/task/context combinations. Guided and project-method requests require the returned verified narrative, actual `display_file` calls for `display_paths`, and readable source titles/URLs from `source_citations`. Raw paths remain available for inspection. Missing records or a missing selected brief must be stated; a saved critique or referee record is not a newly executed role.

HEADWATER proposal, critique, referee and protocol artifacts use distinct `w4e-v0140-headwater-*` outputs from the same November pack. The historical record dates identify documents, not training start/completion times. The score is temperature error over four 2019 target weeks: about 0.77 degrees Celsius versus 0.86 degrees Celsius for **the 1979–2017 week already in the example files**. Lower is better. The comparison does not isolate soil's contribution, and some weeks/rain remain weak. The supplied files do not establish which next proposal a person selected as the current brief.

The six April guided questions and original catalog remain intact. Their dates are 16–22 April 2019, issued 15 April. The original manifest, source JSON and figures keep their bytes; their versioned readout names remain distinct from HEADWATER. Weather/Trial 0 PNGs are pinned originals. Runoff is a frozen chart derived from a committed observed ERA5 valley receipt, not a spatial map or supplied forecast. Trial 0's standardized test-split aggregates are separate from the displayed 19 April wet-day maps. The exact original Trial 0 scorer command remains unavailable. The optional dam skill is uninstalled until an agreed reservoir/rule exists.

## Browser API contract

- `GET /api/health`: `{app:"tva-workbench",version:"0.14.0",instance_id,connection_id}`.
- `GET /api/config`: `{backend_url,project}`. `POST`/`PUT` accepts only those two fields.
- `GET /api/status`: connection/project availability, loaded skill names and read-only resource status. Results are cached for 15 seconds; `?fresh=1` bypasses the wrapper cache. A connection or facility badge does not validate a science result or job environment.
- `GET /api/skills`: selected-project declarations/details and distinct loaded count. A missing/unavailable project returns `count:null`, an empty connected project returns `count:0`. `?fresh=1` refreshes the cache; unrelated global skills are not exposed.
- `GET /api/knowledge`: sanitized status only for knowledge-base slugs attached to the selected project. Index readiness and required source coverage are separate checks.
- `GET /api/workbench-assets`: presence of approved nonempty, nonsymlink local media at the fixed filenames below. It does not enumerate arbitrary directories or certify scientific validity.
- `/api/vista/<backend route>`: allowlisted project routes preserve VISTA status codes and SSE types/data/sequence IDs. Redirects are refused.

Selected-project routes after `/projects/{project}`:

| Method | Backend path |
| --- | --- |
| GET | Project record; `/chat-sessions`; `/chat-session?chat_session_id=UUID`; `/chat-runs/status`; `/models` |
| POST | `/chat-sessions` with `{title}`; `/agent/run` with `{user_prompt,stream:true,chat_session_id}` |
| PUT | `/chat-session?chat_session_id=UUID` with VISTA's session update body |
| GET | `/chat-sessions/UUID/run/events?after=N`; `/chat-sessions/UUID/displayed-files` |
| POST | `/chat-sessions/UUID/run/stop` |
| GET | `/uploads`; `/outputs`; `/uploads/PATH`; `/outputs/PATH` |
| POST | `/uploads` multipart file upload; `/elicitation` response |
| POST | `/reports/generate`; `/reports` for explicit report saving |
| POST | `/mcp/call`, limited to `get_hpc_job_status` and `get_hpc_job_outputs` |

Session IDs are UUIDs and streaming requires a created session. VISTA owns history and turn persistence. File entries use `{name,size,created,modified,shown_in}`. Generated report drafts use `{title,slug_suggestion,summary,body}` and are not saved until explicitly posted. Requests/uploads have a 64 MiB limit and upstream inactivity timeout is 120 seconds.

Raw global skill/knowledge routes, generic settings/credential routes, skill edit/publish endpoints and job submission are not available through the browser proxy. The separate local setup process uses its narrowly scoped import/upgrade API operations before the wrapper starts.

## Evidence workspace and libraries

The HEADWATER workspace explains the saved record relevant to a known prepared/sent/reopened question. Unknown questions use the overview. This topic selection does not assert agent progress or a completed review. Sources/technical details open on demand. Session/context revision guards prevent stale reads from replacing the active transcript or evidence.

For April conversation images, the browser combines actual display records with the real output listing. Only current passive raster files are accepted. Display identity uses bounded run/tool/time metadata; newest records deduplicate by filename and sort chronologically. A successful redisplay can select an existing checked case card without duplicating it. Manual selection pauses following; Resume returns to the latest actual display. Unchanged polling preserves image DOM. Missing/changed records remain excluded, while stable replay avoids restamping identical files.

Artifact reads coalesce and poll every four seconds only while a turn is active. The manifest-checked April panels remain separate from unverified conversation images. Text mentioning a tool or role does not certify its execution.

Results Library uses the selected project's output store, with compact file rows and explicit previews/downloads. There is no second output store. Literature is a packaged metadata snapshot with source links, no runtime GitHub credential or bundled paper bytes. Compute badges are read-only; the CCSI connection placeholder remains separate from the supplied historical H100 record.

## Supplied media and checks

The local media endpoint recognizes these files under `public/assets/`:

| Key | Filename |
| --- | --- |
| `video` | `water4energy-workbench-90s.mp4` |
| `captions` | `water4energy-workbench-90s.vtt` |
| `scoreMap` | `water4energy-april-2019-score.png`, otherwise `.jpg` |

The player requires both video and captions, has controls/captions enabled, and does not autoplay. The April score frame remains empty until an approved raster is supplied; it stays inside the Score details. Dali supplies these media and the voiceover. The numerical four-week comparison is independent of that April image slot.

The interface/setup version is **0.14.0**. The case definition's embedded `0.12.1` is retained case metadata. The April prompts, hypothesis-step logic, case contract and ORNL/Genesis marks remain preserved.

Run the checks below and see [VERIFICATION.md](VERIFICATION.md) for final automated/live results and their scope:

```sh
python3 -m unittest discover -s tests -v
python3 -m unittest discover -s backend/tests -v
node --test tests/*.cjs
```
