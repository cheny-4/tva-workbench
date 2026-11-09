# v0.8.0 verification

Verified November 9, 2026 on macOS. Hypothesis lab now consists only of a full-height left conversation and full-height explanatory blocks on the right. Supporting controls have moved to their relevant views. The fixed case remains **16–22 April 2019**, issued **15 April**.

## Automated checks

- **40 Python checks passed:** 23 adapter/project-knowledge checks, 11 launcher/instance/port/browser checks and 6 study-catalog checks, using isolated loopback servers.
- **43 JavaScript checks passed:** the previous 36 plus 4 research-link integration checks and 3 guide source-link checks. These cover matching case metadata, actual listed files, safe encoded project-scoped links, unavailable/error cleanup, superseded reads, stage-specific display and escaped labels.
- JavaScript syntax, HTML nesting and whitespace checks passed. The page has 110 unique IDs. A structural check confirmed figures/dam in Results Library, readiness/sources in Skills, questions/artifacts/export in Conversations, and only the chat/guide grid in the workspace. The duplicate loop IDs are removed.

## Browser checks

- At 1280×720 both chat and guide span from y=108 to y=708 beneath the branding bar. At 1366×900 both end at y=888. The document exactly matches the viewport height, with no page scroll or content below the workspace. A 1920×1080 check also used the available height. Transcript and guide content scroll internally as needed.
- The right side has separate workflow and selected-step blocks. Actual saved research links appear as another block only for the corresponding selected step. Diagram selections preserve drafts; explicit question preparation retains the fixed-case request and source guards.
- Both the chat Figures control and the guide View case figures control open Results Library and expand its case gallery. Skills & sources exposes project/required-skill/knowledge readiness, six source checks, Connection details and Demo scope. Conversations exposes the six extra questions, selected-conversation files, provenance and Export brief. Preparing a relocated question returns to the full-height lab without sending it.
- An isolated read-only fake VISTA supplied five conspicuously QA-labeled research files, a long saved conversation, eight core skills plus optional dam, six canonical sources, a matching manifest and four watermarked figures. Correct saved links followed the selected Ledger/Critic stages. All four case figures loaded in Results Library. The optional dam was off initially; explicit Normandy selection and the exact synthetic rule showed its matching saved Hold readout.
- Switching that fixture to a wrong week cleared all saved research links, case images and the prior dam readout. No stale source was presented as matching evidence.
- A read-only QA watcher simulated reopening a working saved conversation. Stop and the composer stayed within the viewport, including with More hints and workflow activity expanded. The busy guard preserved the draft when a guide request was attempted. No backend turn was started; fixture mutations return 405.
- Secondary pages release the fixed-height layout and scroll normally. Returning to Hypothesis lab restores it. A 390-pixel layout stacks guide/chat without horizontal overflow; preparing a question brings the composer into view.
- The real local VISTA backend was reachable but the named demo project was absent. The interface reported the missing project and pending evidence. Product previews show this state; synthetic QA files are not product previews. No browser console errors were observed.

## Runnable launch and package

The macOS shell launcher started v0.8.0 on an OS-selected loopback port while an older Workbench occupied 8765. The older process was untouched. Release packaging verifies ZIP integrity, every manifest hash and executable launcher modes. A freshly extracted copy is smoke-tested through its printed URL, version, project selection, schema and interface assets; reopening must reuse that exact running instance.

QA fixtures remain outside the shipped repository/package. Their listeners and the owned preview were stopped after checks. No real VISTA project, skill, knowledge base, training, scientific inference, ERA5 download or HPC job was created or changed. The scientific walkthrough still requires the backend dependencies in [VISTA_SETUP.md](VISTA_SETUP.md).

Windows/Linux launchers are retained; desktop launch verification was performed on macOS. Metadata and file-presence checks do not independently reproduce or certify a scientific score.
