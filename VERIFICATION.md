# v0.6.0 verification

Verified November 8–9, 2026 on macOS. This revision changes the presentation of Dali's fixed **16–22 April 2019** case, issued **15 April**. The backend routes, scientific evidence validation and optional dam rule contract remain unchanged.

## Automated checks

- **40 Python checks passed:** 23 adapter/project-knowledge checks, 11 launcher/instance/port/browser checks and 6 study-catalog checks. Tests used isolated loopback servers; the restricted sandbox first prevented socket binding, then the authorized loopback-enabled run passed.
- **30 JavaScript checks passed:** the previous 25 checks plus 5 focused checks for network expansion, selection rerenders, temporary search expansion/restoration, compact hint coverage and prepare-only requests with a busy guard.
- JavaScript syntax, HTML nesting/unique IDs and whitespace checks passed.

## Browser checks

- The main page opens with a short guide, three hints and a full-width chat. Figures, the loop, setup/sources, optional dam, walkthrough questions and conversation artifacts all start collapsed. The separate Prompt Library page/navigation is removed.
- Hints in both the chat and Conversations prepare editable text without creating messages, tool events or a backend turn. Additional hints open on demand and close after a choice.
- Headwaters start expanded (12); other locations start collapsed (42). Native keyboard expansion works. Searching Savannah revealed its group and filtered count; clearing the search restored the prior expansion choice. Map/location selections remain background context.
- The composer fits within laptop viewports of 1366×768 and 1280×720. Expanded hints scroll within a bounded area; expanded activity overlays above its button so the composer stays available. The 390-pixel layout had no horizontal document overflow.
- An isolated read-only fake VISTA supplied a clearly labeled long saved conversation, 8 core skills plus optional dam, 6 canonical source records, a matching manifest and 4 watermarked QA figures. The transcript scrolls internally; the explicit Figures button opens the figure section without opening other details. All four image files loaded. Setup still distinguishes 8/8 core skills, optional status, index readiness and source coverage.
- The dam remained off by default. Enabling it, choosing Normandy and supplying the exact synthetic rule revealed its matching saved readout. Wrong-week evidence showed zero case images and an explicit metadata mismatch. No real agent request was sent.
- No browser console errors were observed. Product previews show the real backend's missing-project state, not synthetic scientific evidence.

## Runnable launch and package

The actual macOS shell launcher started v0.6.0 on an OS-selected loopback port while the user's older copy occupied 8765. The other process was left running. The release package is checked for ZIP integrity, all manifest hashes and executable launcher modes. A fresh extracted copy is smoke-tested through its printed URL, version, project selection, case schema and UI assets; reopening it must reuse that exact running instance.

All QA fixtures stay outside the shipped repository/package. Their listeners and the owned preview are stopped after checks. No project, skill, knowledge base, model training, scientific inference, ERA5 download or HPC job was created or changed. The real local `Water4Energy-TVA-agent-loop` project was absent; the interface reports that state and does not substitute another project. The scientific walkthrough still requires the dependencies in [VISTA_SETUP.md](VISTA_SETUP.md).

Windows/Linux launchers are retained; desktop launch verification was performed on macOS. Metadata and file-presence checks do not independently reproduce or certify a scientific score.
