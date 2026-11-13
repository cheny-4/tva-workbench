# Data and evidence scope

The active demonstration is fixed to **16–22 April 2019, issued 15 April**. `public/data/demo-case.json` contains the case definition, eight required skill IDs, optional dam skill, panel source requirements, six acceptance questions and lead-source references. `demo-evidence.schema.json` defines the saved-output adapter format. These files contain interface/specification metadata, not model predictions or completed test results.

Actual figures and supporting values are read from the selected VISTA project's output files through **tva-demo-20190416-20190422.json**. The interface checks declared dates, source contracts and file availability. These checks do not independently reproduce a model score or prove an artifact's authenticity. No private HEADWATER ledger, prediction arrays, ERA5 shards, checkpoint or scientific example results are bundled.

Temperature and precipitation refer to the 1979–2017 week stored in the example files, plus the residual 9×9 result. Runoff is explicitly ERA5 surface-runoff observation; the HEADWATER forecast slot remains unavailable. Downscaling is the existing September 7 Trial 0 comparison, 1° to 0.25°, for a day within this week. Its presence does not establish a newly coupled HEADWATER/downscale forecast chain.

Optional dam output is display-only and requires the same case, selected Normandy/Norris reservoir, exact agreed rule and a source artifact. The browser does not invent a rule, threshold, fill/hold policy, release or operating instruction.

The secondary network retains 54 study references and Sean's 12 headwater reservoirs. The original 52 anchors are forcing-region reference points across 43 reconstructed regions, rather than verified dam/gage coordinates. Wolf Creek uses [USGS Lake Cumberland station03413500](https://waterdata.usgs.gov/monitoring-location/USGS-03413500/statistics/); Dale Hollow uses [USGS station03416500](https://waterdata.usgs.gov/monitoring-location/USGS-03416500/statistics/). Neither addition invents model/forcing coverage. Background location browsing does not change the fixed case or optional dam selection.

ELF means Estimated Local Flow, a quantity rather than a location type. Original matching IDs and reference diagrams are retained in the secondary catalog. Generic conversation files and Results Library remain separate from case-qualified evidence. Files remain stored and managed by VISTA.
