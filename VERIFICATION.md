# v0.9.0 verification

Verified November 9, 2026 on macOS. This revision adds conversation following and inline figures, adjustable message-box height, compute status inside Connection settings, and an audited Literature library. The April case and scientific validation contract remain fixed.

## Automated checks

- **40 Python checks passed:** adapter/project knowledge, launcher/instance identity and study catalog, using isolated mock servers.
- **80 JavaScript checks passed:** case/source validation, guide following, checked versus unverified figures, current listed output filtering, coalesced/scoped reads, two real loadSession race regressions, composer pointer/keyboard/storage bounds, literature status/search/URL validation and retained artifact/library behavior.
- A stale-to-current same-turn coalescing edge was fixed and tested. Session/backend scope is checked again after artifact reads so an older conversation cannot start a watcher for a newly selected one.
- JavaScript syntax and whitespace checks passed. HTML nesting/IDs and removed compute-view bindings were inspected.

## Browser checks

- An isolated read-only fake VISTA emitted structured phased events through a saved-session watcher: ledger, lab.design, saved Critic and Referee reads, realization and display_file. The right-side topic followed actual tool activity. A manual Human selection paused following; Resume returned to the latest actual Referee topic.
- Phase updates supplied four watermarked case PNGs plus a separately displayed conversation PNG. The right side showed four metadata-checked case cards and one unverified conversation card, with unsafe/stale/upload/non-raster controls filtered out. ERA5 observation and frozen Trial 0 subtitles remained explicit. Clicking a thumbnail opened an enlarged modal with figure/source download links while the main view remained Hypothesis lab.
- Tool-triggered reads and four-second busy polling discovered new files without waiting for completion. Completing the watcher changed its status; selecting another saved conversation removed its conversation-only figure while retaining the four checked project case figures. No actual agent, model or job was run; fixture mutations returned 405.
- Dragging the message-box separator upward expanded 65px to 145px; keyboard maximum was 213px at 1280×720, leaving a 101px transcript and visible composer/Send/Stop. Enter reset the preference. Unit tests also cover canceled drags, blocked storage and reclamping after hints/busy/viewport changes.
- Connection settings contained all four resource cards. Refresh status is type=button and does not submit the connection form. The standalone compute view/navigation is removed. The dialog scrolls internally and fits a 390px screen.
- Literature showed 42 records and the expected availability counts. Searching 'munoz 2021' found ERA5-Land; Needs repair showed two records with source-reported corrections; Reference only showed 15. Narrow-screen search had no horizontal overflow. Pinned repository/DOI links were inspected without downloading paper files.
- Laptop layouts retained full height. No browser console errors were observed. The real local VISTA backend was reachable but the named TVA project was absent; product previews show that state, not synthetic scientific results. The separate QA proof screenshot remains outside the repository/package.

## Literature audit

Four accessible complete repository trees were checked at pinned commits recorded in public/data/literature.json. HEADWATER commit f79283770e84585753f16c1efafda956c0cfd229 tracks 22 shelf PDFs. Its MISSING_PDFS.md and EXTEND_DOWNLOAD.csv flag li2012ridge.pdf as a wrong article and ropelewski1986enso.pdf as lacking article text. Twenty shelf PDFs have no repair flag. The catalog adds 15 pending references, three AmSC reference PDFs, one experiment draft PDF and one project-plan review note. UI totals are 24 repository PDFs, 2 repair entries, 15 references and 1 note. Repository presence does not verify article quality or VISTA indexing.

Only metadata/links are packaged. PDF bytes, audit checkout data and GitHub credentials remain outside the release. Reload catalog rereads the bundled snapshot, not GitHub.

## Runnable package

The macOS launcher started v0.9.0 on an available loopback port while the older 8765 instance continued untouched. Packaging verifies ZIP integrity, every manifest hash and executable launcher modes. A fresh extracted copy is smoke-tested for version, project, case schema and new assets, then reopened to confirm exact-instance reuse.

Owned preview/fixture listeners were stopped. No real project, skill, knowledge base, training, scientific inference, ERA5 download or HPC job was created or changed. Scientific walkthrough dependencies remain in VISTA_SETUP.md. Windows/Linux launchers remain included; desktop launch verification was performed on macOS.
