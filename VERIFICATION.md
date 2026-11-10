# v0.11.0 verification

Verified November 9, 2026 on macOS. The previous ORNL/Genesis theme and interactive workflow are restored. Libraries are compact, and saved conversations move to the lab History control. The case, VISTA scope and science contracts are unchanged.

## Automated checks

- **40 Python checks passed:** adapter/project knowledge, launcher identity and study catalog using isolated mock servers.
- **83 JavaScript checks passed:** retained case/source validation, following/selection, scoped reads, session races, composer bounds, literature normalization/search and artifact behavior. New checks cover workflow expansion/collapse and result-list rendering without automatic image loading; Preview still opens the safe local raster and downloads remain available.
- HTML nesting, unique IDs, script/style references, JavaScript syntax and whitespace were checked.

## Browser checks

- The sidebar is the previous navy (#13263f), with ORNL green controls and original ORNL/Genesis logos. Main navigation is Hypothesis lab, Literature library, Results Library, TVA network, Skills & sources.
- The interactive six-node workflow starts expanded in the single right evidence workspace. Selecting Critic explains that topic and prepares its question only through the explicit Ask button. Following and checked/unverified figure handling remain in place; actual evidence events can collapse the workflow, which can be reopened.
- History in the lab header opens saved conversations. A saved QA conversation returned to the lab with its transcript and interactive workflow intact. Back to lab also returns to the current conversation; no conversation was deleted or sent to an agent.
- Typical literature entries measured about 67–90px at 1366×900, with citation and links sharing a row. Searching munoz 2021 found ERA5-Land. Details revealed the pinned repository path and file size. The two repair entries kept their source-reported notes visible without expansion.
- Sixteen synthetic saved outputs rendered as roughly 55px file rows at 1366×900, with zero preloaded images inside the list. Search found a temperature PNG; Preview opened an enlarged modal with the original download. Fixture files were conspicuously QA-only, and no real agent or compute operation was run. QA proof images remain outside the package.
- At 1280×720 the left chat and right evidence each filled the available height; the composer maximum preserved a 100px transcript and visible Send. At 390×844 both compact libraries had no horizontal page overflow and their controls remained available.
- Network, skills, Results Library, Literature and Connection settings were inspected after navigation changes. No browser console errors were observed. Real local VISTA responded but the named demo project remained missing; release previews show that actual state. Saved settings were not changed during QA.

## Literature snapshot

The existing audited snapshot is unchanged: 42 records across four pinned repositories, consisting of 24 repository PDFs, two repair entries, 15 references and one review note. HEADWATER f79283770e84585753f16c1efafda956c0cfd229 tracks 22 shelf PDFs, including two repair flags. Only metadata and links are bundled; PDF presence does not establish article validity or VISTA indexing. Reload catalog rereads the package snapshot.

## Runnable package

The launcher starts v0.11.0 on an available loopback port while an older 8765 copy remains untouched. The archive verifies ZIP integrity, every manifest hash and executable launcher modes. A fresh extracted copy is launched through its actual macOS shell launcher, checked for version/project/assets and reopened to verify exact-instance reuse.

Owned QA listeners were stopped. No real project, skill, knowledge base, training, inference, ERA5 download or HPC job was created or changed. VISTA_SETUP.md still lists the scientific demo dependencies. Windows/Linux launchers are included; desktop verification was on macOS.
