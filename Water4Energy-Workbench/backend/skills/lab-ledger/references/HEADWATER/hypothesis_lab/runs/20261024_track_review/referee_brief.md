# Referee brief — track review after the soil CNN and Reslim

**Run:** `20261024_track_review`  
**Date:** 24 October 2026  
**Mode:** Proposer → Critic → Referee, ledger first  
**Charge:** `charges/four_week_departure_v1.md`

The series is still the right track. The valley forecast is not yet the result you wanted. Those are different statements. Critic novelty check: pass.

## 1. Already settled

| Finding | Evidence |
|---|---|
| Indexes on all four months, and both season masks, stay closed | Ledger `det_v2_oni`, `det_v2_gulf`, `det_v2_ps`, `det_v2_oni_jan`, `det_v2_gulf_jul` |
| Root-zone soil is the input that moved the valley | `det_v2_soil` 0.841 K versus `det_v1` 0.930 K |
| A local neighborhood helps temperature through 9° | `det_v2_soil_k3` 0.796 K, `det_v2_soil_k9` 0.767 K |
| 9° is where that help stops | July 1.260 K, behind the historical week 1.211 K. Rain stays near 0.030 m |
| Reslim at 6° buys the globe and sells the valley | Global 1.525 K, valley 1.015 K |
| A valley weight does not build a 1° path | Weight 1 mean 0.916 K at epoch 2. Weight 0.1 mean 2.128 K |
| A 2° token without soil on the residual makes temperature worse | Valley 1.124 K. Rain mean improves to 0.0283 m. The April streak is still missing |

The design rules held on every one of these runs: one change, the same soil files, 2018 chooses the epoch, 2019 is only a score. Failed runs closed a lever. They did not open a new one. That is why the track is intact.

`det_v2_soil_k9` is the valley-temperature model until something beats 0.767 K under the kill test below.

## 2. Open / next

Approve one run: `E_patch2_soil_residual`.

Put root-zone soil and the static maps on the 1° residual of the patch-2 Reslim trunk. Leave the patch at 2. Same files, same loss, same split, one GPU. Save it as `runs/det_v2_reslim_patch2_soilresid`.

This is the test still open inside the track. Every scored Reslim residual saw issue-week temperature and precipitation, and not the soil channel that moved the CNN. The critic grades that claim underdetermined. It is not a promise that the valley will fall below 0.767 K.

Pass rule, from the 9×9 score file: four-week valley temperature below 0.767 K, January at or under 0.597 K, July no worse than 1.211 K, April still ahead of 1.090 K. Report global temperature RMSE and valley precipitation beside that.

**Kill test.** If the mean is not below 0.767 K, or January is worse than 0.597 K, stop Reslim temperature variants. Keep the 9×9 CNN. Do not answer that failure with a wider kernel, another valley weight, or a spring train.

Spring stays the later question in `docs/SPRING_SET_PURPOSE.md`. The files are 23 channels. They cannot be read by the 9×9 checkpoint, and a train on them would drop the soil channel. The week-versus-season reading waits until a trunk that already leaves the historical week can be scored on those weeks.

850 hPa and a daily temporal convolution stay behind the residual score.

## 3. Reject / park

- A kernel wider than 9×9
- Another valley-weight run
- A second patch-2 run with the same residual
- Spring training on the 23-channel files
- 850 hPa or a daily convolution as the next launch
- Replaying all-month ONI, Gulf, or surface pressure

## 4. Human decision

Accept this brief, then launch `E_patch2_soil_residual` and no other run.

This review does not start that training. The charge still requires your go-ahead.
