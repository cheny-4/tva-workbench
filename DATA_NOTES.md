# Study locations and generated results

## Catalog

The study catalog contains 54 named locations: the original 52 reservoir/gage references from the supplied TVA flow-network material, plus Wolf Creek and Dale Hollow. The 12 headwater reservoirs are designated from Sean's project list supplied by the user: Norris, Douglas, South Holston, Watauga, Fontana, Blue Ridge, Normandy, Tims Ford, Chatuge, Nottely, Wolf Creek and Dale Hollow.

ELF means **Estimated Local Flow**. It names a reference quantity, rather than a location type. Original source/model IDs are retained internally where needed to match real artifacts. The interface presents location names and the headwater grouping. The catalog is study scope, not a statement of operator/ownership or supported model coverage.

`public/data/network.json` defines the study catalog; `geo.json` contains simplified coverage geometry and reference coordinates. The original reference diagrams in `public/data/reference/` retain their source labels. Their numbered nodes are source diagram identifiers, not newly inferred support or connectivity.

## Geography

The original 52 location anchors are forcing-region reference points from 43 reconstructed regions. They are not verified dam or streamgage outlet coordinates, and some share a reference point. The polygons are a simplified USGS-derived reconstruction; scientific aggregation must use the original model geometry.

Wolf Creek is represented by the [USGS Lake Cumberland near Jamestown station, 03413500](https://waterdata.usgs.gov/monitoring-location/USGS-03413500/statistics/). Dale Hollow uses the [USGS Dale Hollow Lake near Celina station, 03416500](https://waterdata.usgs.gov/monitoring-location/USGS-03416500/statistics/). These are reservoir reference points. No forcing polygon, model ID or prediction support is fabricated for either addition.

The map is a study-coverage overview. It does not infer routing links, exact dam positions, watershed membership for the new locations, or operational control from the source schematic.

## Live data and storage

The current package has no bundled recorded predictions, historical evaluation windows or example forcing inputs. Prior versions preserve those assets in Git history.

The Results Library reads saved files from the selected VISTA project's output directory through the scoped local adapter. VISTA retains those files. Input uploads remain separate and are available through chat attachments. Figures, tables and reports appear when the agent writes them as output files. A displayed-file list belongs to its conversation; the library browses outputs across the project.

Recognized prediction CSVs require a location identifier, a week start and an explicit `predicted_volume_m3` column. Plot conversion divides cubic metres by 1,000,000. Missing values remain missing and absent calendar weeks create gaps. These files describe their own quantities; local/incremental/allocated ELF volumes must not automatically be described as total upstream inflow or summed across overlapping locations.

A displayed artifact or completed agent turn does not independently verify its scientific provenance or the completion of a compute job. Original files remain downloadable for inspection.
