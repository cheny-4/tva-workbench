# Referee brief: why the temporal farm misses large departures

**Date:** 6 November 2026
**Proposer:** GPT-5.6 Sol (`hypotheses.json`, `experiments.json`, `proposer_notes.md`)
**Critic:** Gemini 4 Argon (`critique.json`, `critic_notes.md`)
**Read run after both:** `insample_fit_temporal_reslim_farm.json`, from `scripts/insample_departure_fit.py` on the kept farm checkpoint (epoch 26)

## 1. Settled

The farm does not miss 2018 because 2018 is a harder year. It draws the same small share of the departure on the years it was fit on. The slope of predicted on observed valley departure:

| | 1979–2017 (fit) | 2018 (epoch rule) | 2019 (held out) |
|---|---:|---:|---:|
| Temperature, all weeks | 0.19 | 0.16 | 0.16 |
| Temperature, largest tenth | 0.21 | 0.22 | 0.13 |
| Rain, all weeks | 0.12 | 0.07 | 0.16 |
| Rain, largest tenth | 0.11 | 0.06 | 0.40 |

On 1979–2017 the model departure is 1.26 K root mean square against 2.75 K observed. The ratio of those variances is 0.21, the same as the slope. A squared-error fit that explains a fifth of the variance shrinks every departure to a fifth. The fit is not memorizing the training weeks, and 2018 is not failing a validation the training passed. The 90 condition days, through 6° tokens, explain about 20% of the valley week temperature and about 10% of the week rain.

Both models agree that the two causes compound. The first is a conditional-mean limit: the closest 1979–2017 valley states to 15 April 2019 were followed by weeks of −8 to +4 mm. The second is the 6° token path with no 1° soil route, which the residual 9×9 avoids. The `already_in_condition` label on April 2019 rain does not contradict the analog result. The wet fortnight before the issue date was followed, in the training years, by ordinary weeks.

## 2. Open

**The 0.7 valley loss** is running in `runs/temporal_reslim_farm_valley07`, Lux job 394375. Through epoch 18 the training loss went from 1.61 to 1.49, and 2018 valley temperature from 2.63 K to 2.55 K. The original farm kept 2.43 K. Pass is the 2019 four-week valley temperature at or under 0.767 K, no issue week worse than the 9×9, and April 2019 rain at or above 40.2 mm. A fail closes loss reweighting on this trunk.

**GEFSv12 as an input** is the one change that adds information the in-sample read says is missing. Days 1–7 only. The next decision is to cut that farm:
- The 00 UTC five-member forecast for every farm issue date from 2000 to 2019. The reforecast has every morning through December 2019, with Days:1-10 and Days:10-16.
- Inputs are the ensemble mean and spread of week temperature and week rain, as anomalies from the 1979–2017 reference.
- The inputs enter at 1°. The 9×9 is the natural first host.
- Fit on 2000–2017, about 936 mornings. Choose the epoch on 2018 and score 2019 once.

The kill rule is the Critic's. The model must reach 0.767 K, with no week worse than the 9×9. It must also beat the raw GEFS member mean on April rain (38.4 mm) and on the four-week rain error. If it fails, the issued forecast keeps the 9×9 for temperature and the raw members for rain.

## 3. Rejected

- A GEFS branch fit on only the four calendar dates. At 67–72 mornings it is too few.
- Zero-filling 1979–1999 with an availability mask. The mask is the same as the era.
- A larger trunk, or more weekly files of the same 24 channels. The in-sample slope already says the inputs explain only a fifth of the variance.

## Corrections to the Critic

`runs/gefs_reforecast_cache` is not empty. It holds 575 GRIB files over 75 mornings. Each member's temperature or rain file is about 5.3 MB. The farm trainer logs only the combined loss, so the separate global and valley terms of the 0.7 run are not recorded.
