# v0.5.0 verification

Verified November 8, 2026 on macOS. The interface targets Dali's16–22April2019 case, issued15April, through the local VISTA backend.

## Automated checks

- **40 Python checks passed:**23 adapter/project-knowledge checks,11 launcher/instance/port/browser checks and6 study-catalog checks.
- **25 JavaScript checks passed:**fixed-case and source-kind validation, exact loaded-skill counting, separate source/index coverage, optionaldam gating, filename safety, output filtering, date/unit/CSV behavior and correct output-store links.
- Syntax, unique DOM IDs/selector wiring, JSON parsing and whitespace checks passed.

## Browser checks

- The real VISTA backend returned404 for `Water4Energy-TVA-agent-loop`. The UI accurately showed Awaiting project, unknown required-skill/KB status and pending scientific evidence. It did not substitute the old LSTM project or fabricate results.
- An isolated, read-only fake VISTA backend supplied8 core skills plus the optionaldam skill,6 canonical knowledge sources, a matching manifest and4 visiblyQA-labeled PNGs. The UI showed8/8 core skills, separate optional status and loaded the matching figures. Temperature preview opened and the image loaded.
- Clicking a Critic/loop action prepared an editable request with zero chat messages/tool events. No backend turn was submitted.
- Dam was off by default. Its request required a reservoir and explicit rule. A matching synthetic Normandy/Hold artifact appeared only when those matched. Changing the rule hid it. Wrong-week manifest metadata cleared all4 case images and the prior dam readout.
- A rebuilding/unready KB showed0/1 indexes ready and six separately listed, not-ready source badges. Listed documents were not treated as proof of a Ready index.
- Laptop1366-pixel and narrow390-pixel layouts had no horizontal document overflow. No browser console errors were observed. The schema link and retained secondary views were checked.

## Runnable launch and package

The actual macOS shell launcher was run while the user's older Workbench occupied8765. It startedv0.5.0 on an OS-selected loopback port. Reopening the same copy returned that same actual address and exited without another server. The older process remained untouched. Archive file hashes, executable launcher modes and a fresh extracted-package smoke launch are checked during packaging.

QA backend files and figures were held outside the source/package, and its servers were stopped after checks. Product previews show the real missing-project state; they are not screenshots of synthetic science results.

No real model training, scientific inference, ERA5 download or HPC submission ran during this revision. No VISTA project, skill or knowledge base was created or changed. Dali/Junqi's project, skill loading, indexed sources and actual realization/Trial0 artifacts are required for a scientific walkthrough. [VISTA_SETUP.md](VISTA_SETUP.md) records that setup contract.

Windows/Linux launchers are retained, but desktop launch verification was performed on macOS. Metadata/file-presence checks do not independently reproduce or certify a scientific score.
