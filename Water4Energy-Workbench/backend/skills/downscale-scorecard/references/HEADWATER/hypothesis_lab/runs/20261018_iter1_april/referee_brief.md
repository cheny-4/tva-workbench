# Referee brief — Iteration 1 Focus C (April cold week)

**Run:** `20261018_iter1_april`  
**Date:** 18 October 2026  
**Mode:** Supervised (Proposer → E1 → Critic → E2-doc → Referee)  
**PI:** Step 3 completed in this brief

---

## 1. Already settled by HEADWATER

| Finding | Evidence |
|---|---|
| April 2019 sets the bad 2019 valley temperature mean | det_v1 valley 1.44 K vs clim 1.09 K; Jan/Jul/Oct OK |
| Observed week was cold; models too warm | Maps: obs −0.97 K; det_v1 +1.39 K warm bias |
| ONI / Gulf on all months hurt April | 1.58 / 1.50 K vs 1.44 K |
| Surface pressure helps April, not enough | 1.22 K; still above clim; bias +1.14 K; does not draw cold pool |
| April ≠ July | In-valley cold/wet miss vs Gulf-side July pattern |
| April precip also failed | Obs ~+31 mm wet; all runs ~30+ mm too dry near clim |
| Do not re-run all-month ONI/Gulf/ps as “new” | Ledger `blocks_reproposal` + Critic novelty PASS |

## 2. Open / next (ranked)

### Keep — program claims

1. **Next April lever is not another global index**  
   (`H_april_needs_trunk_or_land_not_index`) — Critic: supported as program direction. Candidates later: neighbor-aware trunk; land state after soil files exist. Snow stays parked.

2. **Persistence discarded — nuanced**  
   - **2018 April valley:** strongly supported (issue week 1.90 vs model 4.23 vs clim 3.70).  
   - **2019 April valley:** still need issue-week valley RMSE on train host (missing in COMPARISON).  
   - **2019 April global:** persistence is *worse* than the model (issue week 2.00 vs model 1.62).  
   So: local valley signal can be discarded even when global persistence is not a win.

3. **Spring week vs season** (`H_spring_week_vs_season`) — still open; only two April check weeks. E3 (15 Mar / 1 Apr / 1 May) only after you want that ambiguity resolved.

4. **Literature gap** — April SE cold-week papers thin; collection augmenter after you ask, not blocking.

### Map onto roadmap

| Item | Relation to NEXT_INPUTS / BRIEF |
|---|---|
| Season-masked ONI Jan / Gulf Jul | Still valid for *those* months; **not** the April fix |
| Root-zone soil | Deferred until `headwater_examples_v1_soil` ready; possible later April/summer land term |
| 850 hPa / NASH | July track — do not steal April focus |
| Trunk / Reslim | Best long-term match to “keep spatial cold / wet structure” |

## 3. Reject / park

- Retrain ONI or Gulf on all four months  
- 850z as first April experiment  
- Snow or soil **training** now  
- Claiming 2019 April global persistence beats the model (false per SEASONAL_FIT)  
- Redefining climate normals / terciles  

## 4. What this iteration delivered

| Step | Result |
|---|---|
| Proposer | Pack with status-tagged hypotheses |
| E1 | `april_map_notes.md` — warm-bias T, too-dry precip |
| Critic | novelty PASS; grades in `critique.json` |
| E2 | `april_score_slice.json` — document-backed; 2019 valley persistence pending GPU |
| Referee | this brief |

## 5. Human decision ask (one choice)

**Recommended default:** Accept this brief as the close of supervised iteration 1 Focus C.

**Optional follow-ups (pick at most one next):**

| ID | Action | Host |
|---|---|---|
| F1 | Fill 2019-04-15 **valley** issue-week RMSE into `april_score_slice.json` | GPU / train host with examples |
| F2 | Start season-masked `det_v2_oni_jan` or `det_v2_gulf_jul` (not April) | GPU |
| F3 | Collection augmenter: propose 2–3 April cold-week papers | Mac |
| F4 | Park further April work; switch Focus B (850z / July) | Mac lab |

Automation of the full loop should wait until you have walked one more focus (B or season-masks) the same way.
