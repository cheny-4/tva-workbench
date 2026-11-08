# Recorded study assets

The bundled assets are recorded extracts and an inventory for a local TVA demonstration. No model was executed while preparing them. They do not include checkpoint files, full training datasets, raw six-hour source files, credentials, or absolute personal filesystem paths.

## JSON interface

- `public/data/demo.json`: the complete 52-site ELF01–ELF52 network, using the selected epoch-19 `total_runoff` checkpoint. Each site has 26 calendar positions; 1,233 saved eligible paired rows are available across 51 sites. Missing eligible rows remain explicitly null. Nickajack (`ELF46`) has no saved eligible test predictions in this selected model run and has no plotted values or accuracy metrics.
- `public/data/demo-surface.json`: the matching saved cases using the selected epoch-20 `surface_runoff_static8` checkpoint. This model uses surface runoff, not surface-plus-subsurface runoff.
- `public/data/pilot.json`: two saved weekly cases per site from the completed GEFSv12 retrospective control-member pilot. It uses the total-runoff model only.
- `public/data/geo.json`: a GeoJSON FeatureCollection with 43 simplified forcing regions and a separate `sites` array containing the 52 site IDs and their source-region centroid anchors.
- `public/data/network.json`: a 52-site inventory of the user-supplied `All basin ELFs` files, with human site names, source file names, SHA256 values, source units/interval, header ranges, valid-record ranges and missing-record counts. It also links the supplied original location map and schematic.
- `public/data/network-validation.json`: checks of site coverage, paired-record counts, missing positions and displayed per-site totals.
- `public/data/reference/elf_map.jpg` and `schematic.gif`: unmodified original source images for viewing the full river-network context. These historical references also show nodes 53 and 54; no corresponding source files or model outputs are bundled for those two nodes.

Each study JSON has `title`, `subtitle`, `mode`, `model`, `modelLabel`, `units`, `valueLabel`, `period`, `sites`, `provenance`, `caveats`, `steps`, and `downloads`. Each site contains `series` rows with `date` (week start), `end`, `predicted`, and `observed` values. Those chart values are **million cubic metres per week**. Downloaded CSVs retain the original **cubic metres per week**. The conversion is division by 1,000,000 only.

The historical window has week starts from 4 January through 28 June 2010; the final week ends 4 July. Not every site has 26 eligible prediction pairs. The associated metrics and volume totals use only the available saved eligible pairs for that site within this window. Missing weeks are not zero and are not interpolated. The metrics must not be described as complete test-set or general forecast performance.

ELF means **Estimated Local Flows**, as identified in the supplied source material. It remains each site's reference flow quantity, potentially local, incremental, or allocated. It is not universally total upstream inflow; do not sum outputs across overlapping sites. The raw source files use six-hourly streamflow in **CFS** and identify `-999` as missing. File header ranges begin in 1902, but valid records differ by site; the header range is not a promise of uninterrupted observations.

## Map interpretation

Map markers are **forcing-region centroids**, not reservoir, dam, or gauge outlet coordinates. Sites sharing a forcing region can share a marker. Boundaries are a USGS-derived reconstruction, not original TVA GIS. The display geometry is simplified at 0.006 degrees and rounded to five decimal places; scientific aggregation must use the original frozen geometry. `geo.json` contains a source SHA256 and these qualifications. The original schematic is provided as an image; no machine-readable routing graph or numerical directed connectivity was inferred from it.

## Provenance and downloads

`public/data/recorded/` holds the paired prediction CSVs, sanitized provenance JSON, and plain-text summaries. SHA256 values identify the exact saved predictions and selected model checkpoint. The historical sources are the active frozen-model run directories named in `models.json`, not the older reference-model artifacts.

## Prepared inputs

`public/data/inputs/` provides the repository's small Norris/Normandy historical CSV/metadata examples for the two distinct model families. These are prepared physical-unit inputs, with twelve weeks of prior context. They are separate from the 26-week recorded chart sample and will not reproduce that entire chart. Each example yields eight target-window predictions in the current model package. They contain no observed ELF targets. A browser download alone does not place these files in a VISTA sandbox; the live workflow must upload them or use the installed skill's packaged defaults.

## Retrospective GEFS limitations

The pilot has one archived issue, one control member, two sites and two weeks. GEFSv12 Phase 2 initializes at 03 UTC despite the nominal 00 UTC archive label; its first three hours include a reanalysis correction. Actual operational publication latency is unverified. The pilot establishes pipeline execution, not general forecast skill. Norris's close two-week total includes offsetting weekly errors.
