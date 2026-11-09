# v0.7.0 verification

Verified November 9, 2026 on macOS. This revision renames the opening page **Hypothesis lab**, places the conversation on the left and adds an interactive explanation of the research loop on the right. The fixed case remains **16–22 April 2019**, issued **15 April**.

## Automated checks

- **40 Python checks passed:** 23 adapter/project-knowledge checks, 11 launcher/instance/port/browser checks and 6 study-catalog checks, using isolated loopback servers.
- **36 JavaScript checks passed:** the previous 30 checks plus 6 guide checks for the six-stage mapping, question-first requests, source-grounded role focus, fixed-case/fallback guards, selection-only behavior, explicit question/figure actions and an explorable unavailable state.
- JavaScript syntax, HTML nesting, unique IDs and whitespace checks passed. All 111 prior page IDs are retained; the new guide mount is unique.

## Browser checks

- Hypothesis lab navigation, breadcrumb and heading replace Demo walkthrough. The laptop layout has a large chat on the left and an equally tall guide on the right. Default ledger explanation, question action and chat composer fit in the first screen at 1280×720 and 1366×768.
- The six guide steps explain Ledger, Proposer, Critic, Referee, human review and saved evidence. Keyboard selection changes only the explanation and pressed state. A draft question stayed intact through selection. **Use this question** prepared a request beginning with that exact question and retained case/source instructions, with zero messages or tool activity. The desktop page did not scroll when the composer was already visible.
- Human review explicitly describes command inspection and a separate human training gate. The guide does not grant approval, set flags or execute a workflow. Its highlight is explanatory selection, not progress.
- On a 390-pixel screen the guide stacks above chat with no horizontal document overflow. Using a question brings the composer into view.
- An isolated read-only fake VISTA supplied a conspicuously labeled long saved transcript, 8 core skills plus optional dam, 6 canonical sources, a manifest and 4 watermarked QA figures. The guide's results action opened the case figures; all four image files loaded. The optional dam remained off. Scientific evidence validation and its source distinctions are unchanged.
- A read-only QA watcher simulated reopening a working saved conversation without starting a turn. Stop remained visible, the transcript scrolled internally and the guide remained explorable. Attempting to prepare another question while working preserved the draft and displayed the busy guard. All fixture mutations returned 405; no real agent or science request was sent.
- The real local VISTA backend was reachable but `Water4Energy-TVA-agent-loop` was absent. The interface reported the missing project and pending evidence while the educational guide remained usable. Product previews show this real state, not synthetic scientific results.
- Network grouping and conversation hints remain available. No browser console errors were observed.

## Runnable launch and package

The actual macOS shell launcher started v0.7.0 on an OS-selected loopback port while the user's older copy occupied 8765. The older process was untouched. The release ZIP is checked for integrity, every manifest hash and executable launcher modes. A freshly extracted copy is smoke-tested through its printed URL, version, project selection, case schema and new guide/layout assets; reopening must reuse that exact running instance.

QA fixtures remain outside the shipped repository/package. Their listeners and the owned preview were stopped after checks. No real project, skill, knowledge base, model training, scientific inference, ERA5 download or HPC job was created or changed. The scientific walkthrough requires the backend dependencies in [VISTA_SETUP.md](VISTA_SETUP.md).

Windows/Linux launchers are retained; desktop launch verification was performed on macOS. Metadata and file-presence checks do not independently reproduce or certify a scientific score.
