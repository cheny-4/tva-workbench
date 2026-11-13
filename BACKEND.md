# Local VISTA adapter · v0.15.1

`launch_workbench.py` verifies the complete package, opens installed VISTA, prepares the dedicated project and starts the interface. `server.py` serves `public/` and proxies an allowlist of routes to that local project; running it directly skips setup. `backend/replay.py` and its eight skill copies read pinned records and stage saved outputs. Setup uses direct API operations, never an LLM turn.

## Identity and API boundaries

All three contexts use **Water4Energy-TVA-agent-loop** and source index **water4energy-tva-demo-2019**. Connection settings saves only a loopback HTTP backend address and project name in ignored `.local/config.json`; it accepts no model key. VISTA owns credentials, conversations and project files. The wrapper exposes project-scoped conversation, upload/output, report, elicitation and local-tool routes; it does not expose global settings or unrestricted APIs. Both browser and wrapper validate request origin and project scope.

The combined launcher accepts `--backend-url`, `--port`, `--no-browser`, `--no-start-vista`, `--setup-only` and `--setup-timeout`. `TVA_VISTA_URL` selects a local backend; `W4E_VISTA_INSTALL` identifies a nonstandard installed VISTA directory. The default is `http://127.0.0.1:8001`. The wrapper pins its folder/version/connection identity when reusing a port. Windows/Linux companion entry points retain the setup path; desktop launch verification is performed on macOS.

## Setup and safe upgrades

The package contains eight skills, nine indexed documents and 32 immutable April evidence files. Known v0.13.1, v0.13.2 and v0.14.0 backend snapshots are recognized; interface v0.14.1 delivered the same v0.14.0 payload. Before replacement, setup checks the project policy, ownership, sharing and every mounted old skill file hash. Unknown edits or a skill used by another project are not replaced.

Complete original skill bytes and project metadata are backed up in `.local/upgrade-backups/`. Existing backups are checked again before resuming. Official full-folder replacement updates each recognized old adapter. Mixed old/current states resume without repeating finished replacements. Matching outputs preserve bytes and timestamps; differing evidence is refused. The v0.14.0 baseline is reconstructed from immutable release Git objects, with a self-contained deduplicated vault.

Setup appends the ninth guide, waits for actual index readiness, verifies the original evidence and records counts in `.local/setup-receipt.json`. It checks only whether a model/credential is configured, not whether the model can answer. It sends no prompts and changes no science flags or jobs.

## Reader contexts

| Context | Saved records |
| --- | --- |
| `headwater` | Existing development profiles, November review and optional history; new separate monthly-refinement profile |
| `lab24` | Six original files from the 24 October review/result pack, with six role-specific profiles |
| `tva` | Unchanged April six-question profiles and protected case contract |

Guided requests explicitly choose the context and matching reader/profile. The reader checks pinned source hashes and returns `verified_answer`, `display_paths` and source citations. The agent must quote that narrative and actually call `display_file` for every returned display path. Full inspection records remain available. The original HEADWATER narratives and April answer/evidence hashes are retained; new October/monthly artifacts have separate versioned names and provenance.

The package contains five supplied PNGs, not their generating arrays. Their scopes and hashes are in `backend/dali-figures-provenance.json`. Three compare four 2019 weeks; two summarize all 30 days of April at 1/24° with daily maximum temperature and precipitation in mm/day. They do not replace the April-week Trial 0 contract or prove a coupled forecasting pipeline. Additional reader-generated files are separate from the 32 protected startup files, so total project output counts can be higher.

## Conversation and execution boundaries

The UI remembers drafts/sessions separately for HEADWATER, the October example and TVA. Context revision checks protect streaming, saved-session loads, reports and artifact refreshes from stale responses. Actual display identity drives evidence following; unchanged figures stay stable. Raw unexecuted provider tool framing is treated as an unavailable answer, with an editable manual retry and no automatic resend.

Selecting a node or preparing a draft runs nothing. Send initiates an agent conversation, not a science job. The installed project has no HPC submission tools or job definitions. Saved scripts/commands are evidence only. The exact original Trial 0 scorer is absent; optional dam output requires a supplied reservoir/rule. Model credentials, local VISTA state and `.local/` are excluded from the ZIP. See [VERIFICATION.md](VERIFICATION.md) for actual checks and remaining limitations.

Interface/package v0.15.1 updates the README wording. The v0.15.0 backend payload and source-checked science evidence retain their exact bytes.
