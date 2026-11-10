# TVA Workbench · Hypothesis-lab demo · v0.11.0

A local ORNL/Genesis interface for Dali's HEADWATER hypothesis-lab walkthrough. The case is fixed: **16–22 April 2019, issued 15 April 2019**. VISTA supplies the live agent, loaded skills, knowledge bases and saved files.

![Hypothesis-lab workspace](Preview.jpg)

## Launch

Extract the complete **TVA-Workbench-v0.11.0.zip**, then double-click **Start TVA Workbench.command** inside its `TVA-Workbench` folder on macOS. Keep the Terminal window open. Windows uses **Start TVA Workbench.bat** with Python 3.9+; Linux uses `sh start.sh`. Terminal users can run `python3 server.py`.

The launcher prints the version, folder and actual local URL, and opens a browser tab. It prefers port 8765. If another copy occupies that port, this version uses an available loopback port without stopping the other process. Opening this same copy again reuses its validated running instance. Follow the printed URL; an older tab on port 8765 may belong to another version. Control+C stops this wrapper.

No npm, pip or frontend build is required. The launcher uses VISTA's bundled Python if available, otherwise Python 3.9+. The interface can open before VISTA is configured; readiness and missing artifacts remain explicit.

## Start with a conversation

The **Hypothesis lab** opens with full-height chat on the left and one **Evidence** workspace on the right. One welcome offers two starting questions: **Read the April ledger** and **Compare Trial 0 with bilinear**. Either prepares an editable question with the fixed-case/source instructions below it. Review the request and press **Send** to call VISTA. Open **History** in the lab header for saved conversations and extra hints. **Back to lab** returns to the current conversation.

The evidence workspace restores the interactive hypothesis-lab workflow: Ledger → Proposer → Critic → Referee → Human review → Evidence, with findings returning to the ledger. Select any node to inspect that stage. The diagram starts open and can be collapsed or reopened. Actual saved-evidence activity, a newly displayed conversation figure while following, or the explicit figure control collapses it to make room for the figure viewer; a new conversation reopens it. The topic follows actual structured VISTA skill/tool activity. A known saved Critic or Referee file can identify that topic; free-text mentions cannot. A topic highlight is not proof that a review completed. Select a stage to pause following and open its explanation; **Ask about this step** prepares a question. **About this step** keeps explanations available on demand. **Resume following** returns to the latest observed topic. A new explicit Send resumes following. Human review never grants approval or starts training.

One large figure occupies the main evidence area. Select another using the thumbnail strip; **Enlarge** opens its full preview. The actual filename, original download and, for checked case figures, source JSON sit beside the figure. New current-conversation images become the focus while following. Manual selection stays put through refreshes and new arrivals. Case figures retain their April metadata checks and observation/frozen-result labels. Other current images explicitly displayed by the selected conversation are labeled **Case not verified**. These labels are always visible for the selected figure.

Artifact reads are scoped to the selected conversation, coalesced after tool activity, and refreshed every four seconds only while a turn is active. Switching conversations clears their displayed images while retaining checked project case figures. The Results Library remains available for all saved outputs.

Drag **Adjust message box** upward or downward to resize the typing area. Up/Down arrows also adjust it; Home/End select the limits; Enter or double-click resets. The local numeric preference is restored on this laptop, with limits that preserve transcript and Send/Stop space. The chat and evidence scroll independently on laptops. On narrow screens, evidence stacks below chat.

The previous ORNL/Genesis color theme is restored: navy navigation, ORNL green accents, blue-gray surfaces and the original logos. The full-height conversation and focused evidence viewer remain. Main navigation follows the demo: **Hypothesis lab → Literature library → Results Library → TVA network → Skills & sources**. Conversation history is a secondary lab control rather than a separate main tab.

Supporting information has one clear home:

| Information | Where to find it |
| --- | --- |
| Research loop and saved research-source links | Evidence workspace on the right |
| Current and checked case figures | Inline on the right; Results Library remains available for all stored outputs |
| Optional reservoir readout | Results Library; off by default |
| Project connection, required skills, knowledge indexing and source coverage | **Skills & sources**; connection controls still open the existing settings dialog |
| Extra case questions, selected-conversation files, provenance and Export brief | **History** in the Hypothesis lab |

The former bottom loop repeats the guide and is removed. Actual research-source links from the matching manifest remain attached to the corresponding research stage. Invalid or unavailable evidence clears those links.

In **TVA network**, the 12 headwaters start expanded and the other 42 locations start collapsed. Expand either group as needed. Searching reveals matching locations automatically; clearing the search restores your expansion choices.

## What the walkthrough shows

- Project, eight required skills, actual knowledge-index status and the six lead-source checks.
- The ledger-first loop: ledger → Proposer → Critic → Referee → human approval → evidence back to the ledger. Buttons prepare editable requests; they do not start a multi-agent run by themselves.
- Temperature and precipitation from the frozen climate-week plus residual 9×9 result.
- **Observed ERA5 surface runoff**, with the HEADWATER runoff forecast explicitly unavailable.
- Frozen **Trial 0, 1° → 0.25°** downscaling beside bilinear, scored 7 September 2026.
- An optional, off-by-default dam panel. Select Normandy or Norris and provide the agreed rule before preparing `dam.readout`. The interface does not infer a fill/hold policy.

The evidence cards read a matching manifest and existing files from the selected VISTA project's outputs. They do not turn arbitrary images into case results. Metadata and file-presence checks are not an independent scientific re-score. No prediction arrays, private ledger, checkpoints or example scientific results are bundled.

The 54-location study network, 12-headwater grouping, conversations, Results Library and resource status remain secondary views. General conversation files remain separate from the fixed-case evidence cards. The native VISTA Hypothesis Lab debate page is not required: this interface follows the HEADWATER checkout's research loop through VISTA skills.

## Literature and compute

**Literature library** is a searchable snapshot checked on 9 November 2026 across Dali's four shared repositories. HEADWATER tracks 22 shelf PDFs: 20 have no repair flag, while the repository notes identify two needing replacement/correction. The complete tab has 42 records: 24 repository PDFs (including reference/project draft PDFs), 2 repair entries, 15 pending references and 1 project review note. Titles, authors, years, topics and availability are searchable. Compact rows combine the citation and PDF/DOI/record links; Details expands file paths, topics and notes. Repair notes stay visible without expanding a row. Links point to pinned repository commits or supplied scholarly destinations. Paper bytes and GitHub credentials are not bundled. **Reload catalog** rereads the package snapshot; it does not fetch new repository contents or index papers in VISTA.

**Connection settings** now contains both the saved backend/project fields and a separate read-only compute section for Odo, Frontier, Lux and planned CCSI. **Refresh status** reads the current saved connection. Save changes only the two connection fields. Resource readiness does not verify a TVA runtime, and the CCSI card does not register or authenticate a node.

## Connect the science backend

Open VISTA separately. The default project is **Water4Energy-TVA-agent-loop** and backend is `http://127.0.0.1:8001`. Each laptop needs its own project, skill loading, knowledge indexing and staged source files. The package does not create or train these automatically.

See **[VISTA_SETUP.md](VISTA_SETUP.md)** for the eight skills, optional dam skill, lead knowledge sources and evidence-manifest contract. The current interface can be fully inspected with missing dependencies; a scientific walkthrough requires those dependencies to be supplied.

A starter or loop button fills the composer. Review the text and click Send to call the real VISTA agent. The six cold-open questions provide the demo acceptance checklist. Completion of a chat turn is not proof that a scientific test passed or a scheduler job completed.

## Storage and scope

VISTA owns saved outputs, history and credentials. Results Library browses the selected project's output directory as a compact file list: extension, filename, size/date and original download. Safe raster Preview buttons load an enlarged image only on request; the list itself does not preload image tiles. Search and type filters are retained. Chat attachments supply input files. Export brief creates a Markdown download from the selected conversation.

The wrapper stores only backend/project selection and validated launch-port metadata under ignored `.local/`. It binds to loopback only. No new training, ERA5 download, RiverWare, river temperature or plant-MW calculation is part of this walkthrough. A figure redraw needs its own explicit request and supported runtime.

## Source and versions

[Dali's plan](https://github.com/daliwang/HEADWATER/blob/main/docs/TVA_AGENT_DEMO_PLAN_20261102.md), [HEADWATER lab](https://github.com/daliwang/HEADWATER/blob/main/hypothesis_lab/README.md), [runtime](https://github.com/daliwang/HEADWATER/blob/main/hypothesis_lab/RUNTIME.md).

| Tag | Interface |
| --- | --- |
| v0.2.1 | Full original interface |
| v0.3.0 | Simplified presentation |
| v0.4.0 | Full live workspace and Results Library |
| v0.5.0 | Fixed April 2019 hypothesis-lab walkthrough |
| v0.6.0 | Chat-first walkthrough, integrated hints and collapsible network |
| v0.7.0 | Hypothesis lab with a conversation and interactive workflow guide |
| v0.8.0 | Full-height lab with supporting information in its relevant views |
| v0.9.0 | Conversation-following guide, inline figures, adjustable input, compute settings and literature |
| v0.10.0 | Quiet two-column research desk, single welcome and focused evidence viewer |
| v0.11.0 | Restored brand colors and interactive workflow, compact libraries and lab History |

Earlier versions remain in Git history. Clone `https://github.com/cheny-4/tva-workbench.git` or use GitHub's Code → Download ZIP. GitHub hosts source; the Python/VISTA app runs on the laptop.

## Development

The app is vanilla HTML/CSS/JavaScript with a Python standard-library adapter. `research-workspace.css` supplies the current visual treatment; `hypothesis-guide.js` owns following and the focused evidence viewer; `live-lab-sync.js` scopes/coalesces artifact reads; `composer-resize.js` sizes the input; `literature-library.js` renders the audited metadata snapshot; `hypothesis-demo.js` owns case/readiness/artifact validation; `project-ui.js` owns secondary views; `results-library.js` browses stored outputs. Brand assets remain local and proportional. See [BRANDING.md](BRANDING.md), [DATA_NOTES.md](DATA_NOTES.md), [WORKFLOW_NOTES.md](WORKFLOW_NOTES.md), [BACKEND.md](BACKEND.md) and [VERIFICATION.md](VERIFICATION.md).

```sh
python3 -m unittest discover -s tests -v
node --test tests/*.cjs
```

Node is only needed for developer checks. Release archives omit `.git/`, `.local/`, credentials and caches.
