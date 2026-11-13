# Local VISTA adapter

`server.py` uses only the Python 3.9+ standard library. It serves `public/` and proxies an explicit set of requests to one selected project on an already-running local VISTA backend. It does not start VISTA, install software, read credentials, or run an agent on startup.

## Start

- macOS: double-click **Start TVA Workbench.command**. It uses VISTA's bundled Python when available, otherwise an installed Python 3.
- Windows: double-click **Start TVA Workbench.bat** with Python 3.9+ installed.
- Linux: run `./start.sh` with Python 3.9+ installed.
- Terminal: `python3 server.py --no-browser --port 8765`.

Open VISTA separately for live mode. The default backend is `http://127.0.0.1:8001` and the project is `Water4Energy-TVA-agent-loop`. Change these in the application's Connection dialog or use `--backend-url` and `--project`. Optional environment variables: `TVA_PORT`, `TVA_VISTA_URL`, `TVA_PROJECT`.

Keep the launcher terminal open while using the app. Ctrl+C stops the wrapper. If a VISTA agent turn has started, closing its webpage or stopping this wrapper does not cancel that turn; use the live Stop action or VISTA itself. Reopening the launcher reuses only the same folder/version/connection identified by its health endpoint. Other occupied preferred ports fall back to an OS-assigned loopback port; the printed URL is authoritative.

The wrapper binds only to `127.0.0.1`. It is intended for presenting from the same laptop, not remote hosting or a shared multi-user server.

## Browser contract

- `GET /api/health`: `{app:"tva-workbench",version:"0.2.0",instance_id,connection_id}`. Lightweight instance identification.
- `GET /api/config`: `{backend_url,project}`.
- `POST /api/config` or `PUT /api/config`: accepts only `backend_url` and/or `project`; returns the updated configuration. Backend URLs must be local HTTP endpoints without a path, query, credentials, or fragment.
- `GET /api/status`: `{app,version,backend_url,project,connected,project_found,skills,resources,detail}`. Cached for 15 seconds; `?fresh=1` bypasses the wrapper cache for an explicit connection refresh. VISTA still owns its facility-status cache. `connected` means VISTA responded; `project_found` means its selected project exists. `resources` contains `{id,name,state,message,checked_at,planned}` for Odo, Frontier, Lux and planned CCSI. Facility readiness is distinct from TVA skill/runtime validation.
- `GET /api/skills`: `{project,connected,project_found,count,skills,detail}`. Only the selected project's loaded skills are included. Each skill has `{name,description,body,hpc_jobs,loaded:true,detail_available,bundled}`. `count` is the number of distinct skill names declared by that project, including a loaded name whose detail record could not be read. An unavailable backend or missing project returns `count:null`, not a misleading zero. An empty connected project returns `count:0`. Add `?fresh=1` to bypass its 15-second cache. The adapter reads each declared `/skills/{name}` individually and never reads or exposes the unrelated global skill library.
- `/api/vista/<backend route>` preserves allowed VISTA responses and error status codes. SSE event types, data and sequence IDs pass through unchanged. No redirect is followed.

Selected-project routes supported:

| Method | Backend path after `/projects/{project}` |
| --- | --- |
| GET | project record itself; `/chat-sessions`; `/chat-session?chat_session_id=UUID`; `/chat-runs/status`; `/models` |
| POST | `/chat-sessions` with `{title}` |
| PUT | `/chat-session?chat_session_id=UUID` with VISTA's session update body |
| POST | `/agent/run` with `{user_prompt,stream:true,chat_session_id}` |
| GET | `/chat-sessions/UUID/run/events?after=N` |
| POST | `/chat-sessions/UUID/run/stop` |
| GET | `/chat-sessions/UUID/displayed-files` |
| GET | `/uploads`; `/outputs`; `/uploads/PATH`; `/outputs/PATH` |
| POST | `/uploads` with a multipart form containing `files` fields |
| POST | `/elicitation` with `{id,action:"accept"\|"decline"\|"cancel",content}` |
| POST | `/reports/generate` with `{message_history,hint,chat_session_id}`; `/reports` with `{title,summary,slug,body,chat_session_id}` |
| POST | `/mcp/call` restricted to `get_hpc_job_status` and `get_hpc_job_outputs` |

Session IDs are UUIDs. VISTA stream mode requires a session ID created through `/chat-sessions`. VISTA owns turn persistence and history. SSE reconnect replays an active backend run; it does not provide durable resumption after a VISTA backend restart.

File list entries use `{name,size,created,modified,shown_in}`. Generated report drafts use `{title,slug_suggestion,summary,body}`. A generated report is not saved until explicitly posted to `/reports`.

## Local state and limits

The wrapper saves only the selected backend address and project name in `.local/config.json`. No tokens or API keys are accepted in that configuration. Do not distribute `.local/` or Python cache directories. VISTA retains its own credentials, conversations and artifacts; each laptop must have its own working VISTA configuration and TVA project/skills.

HTTP requests and file uploads have a 64 MiB limit. Upstream request inactivity timeout is 120 seconds. An idle live stream may disconnect, but a backend-owned turn continues and can be watched again through its event endpoint.

CCSI is a display placeholder for a future resource adapter. Adding its name to the interface does not register it in VISTA, authenticate to the node, or make existing Frontier-only scripts compatible with it. Similarly, Odo and Lux resource availability does not imply the TVA inference skill supports those clusters.

The adapter reads VISTA's nonsecret `/settings/hpc-status` route for resource cards. It never proxies generic `/settings` routes. Skill catalog reads use the separate adapter-owned `/api/skills` endpoint; raw global `/api/vista/skills` and skill import/edit/delete/publish routes stay blocked. Adding, loading or removing skills remains in VISTA. The installed API reviewed for this package was VISTA 0.2.4; VISTA is pre-1.0, so future releases may need adapter changes. The Workbench package version is 0.2.0. Yang's workbench is 0.1.0.

## Verification

Run `python3 -m unittest discover -s tests -v`. The 23 adapter and project-knowledge checks use an in-process fake VISTA server. They cover forwarding, SSE flush behavior, multipart uploads, project scope, status refresh, traversal prevention, origin/host checks, loopback-only configuration, refusal of upstream redirects, and Skills scope/cache/offline/missing-detail behavior. They do not run a real VISTA agent or submit an HPC job. During the v0.12.1 read-only check, the local `Water4Energy-TVA-agent-loop` project was absent. This package reports that missing state and does not create or substitute a project.

## Results Library

The library uses the selected project's existing `GET /outputs` listing and scoped individual output-file downloads. VISTA stores output files in its project output directory; the wrapper does not create a second file store. Input uploads are excluded from this library. Safe image previews use the same file endpoint with `?preview=true`; original files remain downloadable. The library refreshes after agent work and through its refresh control.

## Hypothesis-lab readiness and launch identity

`GET /api/knowledge?fresh=1` reads only knowledge-base slugs attached to the selected VISTA project, then their sanitized build/document status. It does not expose raw global knowledge routes or publication contents. Index readiness does not imply the six required lead documents are covered; the browser checks source coverage separately.

Health includes opaque instance/connection IDs so another extracted folder or differently configured process is not mistaken for this copy. `.local/instance.json` stores only validated port/instance metadata. An occupied preferred port uses an OS-selected free port without stopping any process. Browser-opening failures print a copyable URL. Explicit `--port` is also a preferred port; `--port 0` requests an OS-selected port.

## Inline conversation artifacts and literature

The browser combines the selected session's displayed-files listing with actual output names, accepts only current passive raster outputs, and rejects stale or unsafe references. Coalesced reads follow tool calls/results and a four-second timer while busy. Session/backend changes invalidate pending reads. The right-side gallery keeps unchecked conversation images separate from manifest-validated fixed-case panels. Structured tool events identify guide topics without certifying role execution or scientific success.

Compute status is rendered inside Connection settings; no new configuration fields, credential routes or job actions were added. Literature is static metadata in public/data/literature.json, audited from four shared repository trees at pinned commits. It uses no runtime GitHub credential and bundles no papers.
