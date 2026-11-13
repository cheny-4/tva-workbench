# TVA / Task 3 briefing — 15 Sep 2026 transcript summary and demo candidates

**Source:** [`GM project and Task 3 briefing_TVA.docx`](GM%20project%20and%20Task%203%20briefing_TVA.docx) (Teams transcript, ~37 min)  
**ORNL:** Dali Wang, Yang Chen  
**TVA:** Benjamin Heath, Colleen Rice Montgomery  
**Related:** [`TVA_Demo_Case_Meeting_20260915.md`](TVA_Demo_Case_Meeting_20260915.md)

Working freeze for demo scoping. Not an ops commitment.

---

## 1. Meeting summary

TVA walked through **real decisions** that weeks-to-years water/thermal information would change. Dali asked what can be shown publicly and how Task 1/2 rainfall–temperature–runoff odds connect to reservoir ops and energy.

**TVA workflow (Ben):** rainfall (and soil moisture) → Sacramento runoff/inflow → **RiverWare** → release vs store, elevation, generation. It **starts with the rainfall forecast**. Confidence in a **longer-range** wet/dry outlook is what would let them fill earlier in a dry year instead of holding flood storage.

**What can be shown:** reservoir elevations and the **operations guide** are already public. **Do not** show plant MW, capacity, or generation detail. Scenario language is OK: more/less water in or out; **direction** of generation fluctuation (not MW). That can later feed GT-NEMS as bulk energy impact, not plant-level numbers.

**Dali close (first demo):** start on **headwater water quantity** (fill / too much / too little water → hydro and refill energy). River temperature is a **second layer** — still worth mapping, but less clear for Phase I.

**Leads TVA actually wants:** not one season. **Spring** = can we fill, and can we keep cold water if it is wet. **Summer** = coolest water for thermal plants. **Winter** warmth can set a bad summer (Norris). Weeks-to-years **continuous** picture, plus ENSO as context for SE rainfall.

---

## 2. Sites and problems they named

| Site / system | Problem | Water vs thermal |
|---|---|---|
| **Duck River / Normandy Dam** | Small reservoir; growth + industry water supply; 30–40 miles to next gauge (Shelbyville); **Garrison Fork ungauged**; dry-year **fill early** if they had confidence; biodiversity / TN habitat attention | Quantity first |
| **Norris** | Main **accessible cold-water** pool; **did not fill** this year → little relief for Watts Bar (~130 mi downstream). April–May flood: run hydro 24/7, spill **cold** water, lose 5–7 °F of bottom water, then a bad summer. Warm winter start (~48 °F vs 42 °F) also sets a rough summer | Quantity **and** thermal |
| **Watts Bar nuclear** | Ultimate heat sink **84.8 °F** intake — **hard stop**, ~**2400 MW** off. Not a flexible derate (reactor chemistry → 2–3 day event) | Thermal (needs cold water from Norris) |
| **Browns Ferry / Wheeler** (N AL) | River often **>90 °F**; back-pressure / derates; barge spikes on sensors | Thermal |
| Coal (Kingston, Gallatin, Cumberland) | Overnight derates if river is hot; more flexible than nuclear; fewer plants left | Thermal, lower priority |
| Data centers (e.g. Widows Creek / Google) | Load + possible thermal discharge; unique sites; political | Not a Phase I demo |

---

## 3. Demonstration candidates (ranked for Phase I)

Pick **2–3**. Prefer cases that use Task 1/2 **odds** (wet/dry, runoff, air T) without claiming RiverWare or river T this quarter.

### Recommended first set

**D1 — Headwater fill / dry-year confidence (quantity)**  
*Sites:* Duck–Normandy and/or Norris.  
*Decision:* In a dry or uncertain spring, do we **fill early** or hold flood space? Ben: better long-range rainfall confidence is leverage for that call.  
*AI now:* G1 winter wet/dry; week-ahead **runoff** odds; next **Band M +2/+3 month** `sro`/`tp`.  
*Demo look:* regional / basin wet–dry **odds** → “more/less inflow than usual,” not MW. Public elevations/policy OK.  
**Strongest Phase I candidate.** Matches Dali’s close and Band W/M.

**D2 — Spring wet: keep vs waste Norris cold water (quantity that enables thermal)**  
*Decision:* After a March–May rain that fills Norris, drain for flood storage (flush cold water) or hold because the rest of spring/summer looks dry? Ben/Colleen: this year’s inverse of “didn’t fill”; also the **worst** thermal summer if they flush.  
*AI now:* same as D1, with **seasonal + 2–3 month** more important than week-ahead. ENSO as context.  
*Demo look:* scenario odds for **wet spring then dry summer** vs climatology.  
**Best “one story” that ties water to Watts Bar without solving river T yet.**

**D3 — Thermal overlay (second layer, do not lead with this)**  
*Watts Bar UHS / Norris delivery* (shutdown risk) and/or *Browns Ferry days above ~90 °F* (derate duration).  
Needs RiTHyMs **and** regulated CE-QUAL-W2; air T is only a proxy. Keep as **named future join**, not Demo 1.

### Strong but not first (need maps / gauges / ops models)

| ID | Case | Why wait |
|---|---|---|
| D4 | **Ungauged Garrison Fork** inflows to Duck / Shelbyville | Needs spatial precip/runoff (odds-guided maps / 1 km / routing), not TVA-mean odds alone |
| D5 | Coarse 25 km rain is “everywhere” — they want **where** it rains (Duck thunderstorms) | Same as D4; Haoran downscale path |
| D6 | Coal overnight derates | Smaller MW, more flexible, plants declining |
| D7 | Data-center water/thermal | Site-specific, not our FOA first proof |

---

## 4. How this maps to what we can actually score

| TVA ask | Task 1/2 now | Honest label |
|---|---|---|
| Chance of more/less rain or runoff in a basin, weeks–seasons | Band W runoff **yes**; precip week-ahead **not yet**; G1 winter **yes**; Band M next | Odds, not mm maps |
| Fill reservoir / inflow | Runoff odds + later routing (RAPID/TRITON) | Not USGS inflow |
| Cold water at Watts Bar | Needs reservoir T + operations | Air T ≠ river T |
| Ungauged tributary | Spatial downscale later | Not this quarter |

---

## 5. Suggested freeze to send back to Ben / Colleen

1. **Demo 1:** Duck–Normandy and/or Norris **headwater quantity** — wet/dry and runoff odds to support **fill vs hold** (public elevations only).  
2. **Demo 2:** **Norris spring fill/flush** under longer-lead wet/dry odds (cold-water conservation for summer thermal).  
3. **Named later:** Watts Bar UHS / Browns Ferry river T; Garrison Fork spatial inflows.

Ask them to confirm **which reservoir is Demo 1** (Normandy vs Norris vs both) and whether **2–3 month** lead is the one that would change the fill call.
