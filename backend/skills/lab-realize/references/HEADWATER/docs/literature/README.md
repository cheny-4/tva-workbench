# HEADWATER literature collection

18 October 2026. Seeded from the project notes, the example cuts, and the input runs already scored. Machine-readable entries are in [catalog.csv](catalog.csv). BibTeX is in [bibliography.bib](bibliography.bib).

**PDFs are tracked in git** under [pdfs/](pdfs/). Status of what is present is [pdfs/DOWNLOAD_STATUS.md](pdfs/DOWNLOAD_STATUS.md). To fill missing rows on a machine that can reach the publishers, use [DOWNLOAD.md](DOWNLOAD.md) and [download_manifest.csv](download_manifest.csv):

```bash
python3.11 scripts/download_literature.py   # or python3 on a newer interpreter
git add docs/literature/pdfs/*.pdf docs/literature/pdfs/DOWNLOAD_STATUS.md
```

An agent can be pointed at the task block in [DOWNLOAD.md](DOWNLOAD.md).

This is a working shelf for methods and program writing, not a complete Southeast climate bibliography. Papers already used in the notes are marked **in notes**. Papers added here to cover the datasets and the week-ahead framing are marked **seeded**. Gaps to fill next are at the end.

## What the project is doing (for reading order)

| Activity | What exists | Literature question |
|---|---|---|
| Deterministic week-ahead map | `runs/det_v1`, 23 ERA5 channels, residual vs 1979–2017 week | What organizes a Southeast week of temperature and rain? |
| Training cases | `headwater_examples_v1` (153 files), v2 with ONI and Gulf anomaly | How to design independent week-ahead samples against a calendar climatology |
| Input experiments | ONI, Gulf SST anomaly, surface pressure scored on 2019 | Which index or field belongs on which season |
| Data stores | Frontier 1° ERA5 shards; WeatherBench 2 copy for msl, soil 2–4, snow, TCWV | Canonical citations for ERA5 / WB2 / ERA5-Land |
| Next cut (not built) | High-impact valley weeks; root-zone soil; neighbor-aware trunk | Extremes, land memory, circulation fields the 1×1 trunk cannot see |

Score region: Tennessee Valley box, about 34–38°N and 90.5–81°W. Domain of the map: global 1°.

Project notes that already carry citations:

- [JULY2019_SOUTHEAST_DEPARTURE.md](../JULY2019_SOUTHEAST_DEPARTURE.md) — NASH / July 2019
- [INPUT_VARIABLE_DISCUSSION_20261013.md](../INPUT_VARIABLE_DISCUSSION_20261013.md) — land and circulation shortlist
- [NEXT_INPUTS.md](../NEXT_INPUTS.md) — build order
- [TRAINING_DATA_DESIGN.md](../TRAINING_DATA_DESIGN.md) — four issue dates
- [HIGH_IMPACT_EVENTS.md](../HIGH_IMPACT_EVENTS.md) — event-file cut to revisit
- [ERA5_WB2_DOWNLOAD_PLAN.md](../ERA5_WB2_DOWNLOAD_PLAN.md) — WeatherBench 2 fields on disk

An earlier land-memory review for TVA water is cited from the discussion note as `ProjectPlan_Tasks/LandMemory_TVA_Literature_Review.md`. That path is not under this checkout; fold its bibliography into this catalog when it is available.

---

## 1. Datasets and products

These are the stores the examples are cut from or appended from.

| Key | Citation | Status | Why it sits here |
|---|---|---|---|
| `hersbach2020era5` | Hersbach et al., 2020, *QJRMS* | seeded | Source of the Frontier 1° shards and the training fields |
| `rasp2024weatherbench2` | Rasp et al., 2024, *JAMES* | seeded | Public store used for msl, swvl2–4, snow depth, TCWV ([ERA5_WB2_DOWNLOAD_PLAN.md](../ERA5_WB2_DOWNLOAD_PLAN.md)) |
| `munozsabater2021era5land` | Muñoz-Sabater et al., 2021, *ESSD* | in notes | Candidate land product if root-zone layers on the shards are not enough |

**Read first for data methods:** Hersbach et al. (2020); Rasp et al. (2024) data guide / paper.

---

## 2. Southeast summer circulation (NASH / Bermuda high)

This block names the July miss on `det_v1` and the missing 850 hPa height / pressure field.

| Key | Citation | Status | Why it sits here |
|---|---|---|---|
| `li2011nash` | Li et al., 2011, *J. Climate* | in notes | Western ridge of the NASH on 850 hPa height; SE summer rain variability |
| `li2012ridge` | Li, Li, and Kushnir, 2012, *Climate Dyn.* | in notes | Southwest vs northwest ridge; Gulf moisture vs subsidence |
| `wei2019isv` | Wei et al., 2019, *Climate Dyn.* | seeded | 10–20-day SE summer rain, NASH–LLJ coupling; week-scale target |
| `zorzetto2021nash` | Zorzetto and Li, 2021, *J. Hydrometeor.* | seeded | NASH ridge and daily precip stats over CONUS, including Tennessee |

**Project link:** [JULY2019_SOUTHEAST_DEPARTURE.md](../JULY2019_SOUTHEAST_DEPARTURE.md), surface-pressure run in [INPUT_VARIABLE_BRIEF_20261013.md](../INPUT_VARIABLE_BRIEF_20261013.md). The literature index is 850 hPa geopotential height; the first append used surface pressure because that key is on the shards.

---

## 3. ENSO and cold-season Southeast

| Key | Citation | Status | Why it sits here |
|---|---|---|---|
| `ropelewski1986enso` | Ropelewski and Halpert, 1986, *Mon. Wea. Rev.* | in notes | ENSO → North American precip/temperature; winter, not July |

**Project link:** ONI fills the empty `oni` slot for January (and seasonal) rows. One weight on all four issue months hurt April and October ([INPUT_VARIABLE_BRIEF_20261013.md](../INPUT_VARIABLE_BRIEF_20261013.md)). Next design: mask ONI to January.

---

## 3b. Southeast spring cold / false spring

Added 18 October 2026 from hypothesis-lab F3 (ingest A: Marino + Gu). Supports the April cold-week reading in [hypothesis_lab/runs/20261018_iter1_april/april_map_notes.md](../../hypothesis_lab/runs/20261018_iter1_april/april_map_notes.md).

| Key | Citation | Status | Why it sits here |
|---|---|---|---|
| `marino2011falsespring` | Marino, Kaiser, Gu, and Ricciuto, 2011, *Environ. Res. Lett.* | seeded | SE false-spring / late hard-freeze climatology (32–39°N); April arctic outbreak after warm March |
| `gu2008springfreeze` | Gu et al., 2008, *BioScience* | seeded | ORNL-led synthesis of the 2007 eastern US spring freeze; April cold as structured extreme |
| `noaa2008easterfreeze` | NOAA/NWS, 2008, tech assessment | seeded | Synoptic/climatology and impacts for the Easter Freeze of April 2007 (surface high, deep trough, multi-day cold) |

**Project link:** April valley temperature miss is not a July NASH story and not fixed by all-month ONI ([INPUT_VARIABLE_BRIEF_20261013.md](../INPUT_VARIABLE_BRIEF_20261013.md)).

---

## 4. Land memory, soil moisture, snow

| Key | Citation | Status | Why it sits here |
|---|---|---|---|
| `koster2001memory` | Koster and Suarez, 2001, *J. Hydrometeor.* | in notes | Soil-moisture memory in models; layer-1 is the fast layer |
| `koster2004coupling` | Koster et al., 2004, *Science* | in notes | Coupling hotspots; Great Plains ≠ humid Tennessee Valley |
| `koster2010glace2` | Koster et al., 2010, *GRL* | in notes | Land init → subseasonal skill (GLACE-2) |
| `koster2010streamflow` | Koster et al., 2010, *Nat. Geosci.* | in notes | Soil moisture and snow for streamflow skill |
| `koster2011glace2` | Koster et al., 2011, *J. Hydrometeor.* | in notes | Full GLACE-2 soil-moisture contribution |
| `seneviratne2010review` | Seneviratne et al., 2010, *Earth-Sci. Rev.* | in notes | Soil moisture–climate review; root zone |
| `wood2006west` | Wood and Lettenmaier, 2006, *BAMS* | in notes | Seasonal hydro forecast test bed (western U.S. contrast) |

**Project link:** Root-zone mean of layers 2–3 is step 4 in [NEXT_INPUTS.md](../NEXT_INPUTS.md). Snow is parked for January/April. Nutrients and groundwater stay off the predictor list until a packable field and a forecast-init paper exist.

---

## 5. Week-ahead / subseasonal framing

HEADWATER is lead-1 week (days +1…+7), not weeks 3–4, but the same sources of skill (land, ocean, large-scale circulation) and the same evaluation habits apply.

| Key | Citation | Status | Why it sits here |
|---|---|---|---|
| `lorenz1969predictability` | Lorenz, 1969, *Tellus* | in notes | Multi-scale predictability limit cited in the input discussion |
| `vitart2017s2s` | Vitart et al., 2017, *BAMS* | seeded | S2S project database; operational subseasonal archive |
| `vitart2018extremes` | Vitart and Robertson, 2018, *npj Clim. Atmos. Sci.* | seeded | S2S extremes; bridge to the high-impact event cut |
| `tian2017cfsv2` | Tian, Wood, and Yuan, 2017, *HESS* | seeded | CONUS week-scale temp/precip skill from CFSv2; temp ≫ precip |

**Project link:** Residual training against the calendar week; score valley and global RMSE next to persistence and `reference_train` ([SEASONAL_FIT.md](../SEASONAL_FIT.md), [TRAINING_DATA_DESIGN.md](../TRAINING_DATA_DESIGN.md)).

---

## 6. High-impact weeks (queue)

No event files are cut yet. These papers support the cut described in [HIGH_IMPACT_EVENTS.md](../HIGH_IMPACT_EVENTS.md).

| Key | Citation | Status | Why it sits here |
|---|---|---|---|
| `vitart2018extremes` | Vitart and Robertson, 2018 | seeded | Extremes at subseasonal lead; ready-set-go framing |
| `zorzetto2021nash` | Zorzetto and Li, 2021 | seeded | Daily extremes modulated by NASH ridge |
| — | Tropical-cyclone track / valley rainfall case studies | **gap** | Need a short TVA / Southeast landfall set for October labels |

---

## Suggested reading order

1. Li et al. (2011) and Li, Li, and Kushnir (2012) — why 850 hPa height (or pressure) is the July field.
2. Ropelewski and Halpert (1986) — why ONI is a winter index.
3. Koster et al. (2004, 2010 GLACE-2) and Seneviratne et al. (2010) — why root zone, not layer 1 alone, and why not to expect valley rain placement from soil moisture.
4. Hersbach et al. (2020) and Rasp et al. (2024) — dataset citations for any paper or report.
5. Vitart et al. (2017) and Tian et al. (2017) — how week-scale CONUS skill is usually discussed.
6. Wei et al. (2019) and Zorzetto and Li (2021) — intraseasonal and daily SE rain around the valley box.
7. Marino et al. (2011) and Gu et al. (2008) — Southeast spring cold / false spring (April track).

---

Citation chasing from the PDFs on disk is tracked in
[EXTEND_DOWNLOAD.md](EXTEND_DOWNLOAD.md) (cap 50; the first pass kept 15).
Those rows are not part of the catalog until they are approved and ingested.

## Gaps to fill next

- Fold in the TVA land-memory review bibliography once that file is on a mounted path.
- October event tags: three cited papers are pending in [EXTEND_DOWNLOAD.md](EXTEND_DOWNLOAD.md) (`miniussi2020tc`, `bishop2019frontal`, `lavers2015ar`). Valley thresholds stay unset.
- Gulf scalar index is a closed ladder row. The one Atlantic mechanism paper on the extend list is `kushnir2010atlanticsst`, for the July height-field design.
- ORBIT-2 / Reslim, GraphCast, and Storm: the model decision for this cycle is [STEP_SUMMARY_20261020.md](../STEP_SUMMARY_20261020.md). Architecture papers join the shelf when that Reslim run is written up.
- Optional: CPC week 3–4 outlook skill notes, for contrast with HEADWATER’s lead-1 week.

## How to add a paper

1. Add a BibTeX entry to [bibliography.bib](bibliography.bib) with a stable key.
2. Add one row to [catalog.csv](catalog.csv).
3. Place a one-line “why it sits here” under the right theme above, and point at the project note it supports.
