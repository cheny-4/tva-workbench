# Week, month, and season

**Date:** 4 November 2026
**Status:** For review. No new model is proposed, and nothing here is submitted.
**Read with:** [MONTHLY_BACKUP_20261029.md](MONTHLY_BACKUP_20261029.md), [NEXT_SET_20261103.md](NEXT_SET_20261103.md)

This note is the relationship among the three ranges, written so it can be picked up later. The week remains the product being scored. The month and the season are not opened by this note.

## Three forecasts from one morning

The morning is 15 April 2019. Three questions can be asked of that morning. They are not the same question asked three times.

| Forecast | What is being asked | How long the atmosphere remembers that morning |
|---|---|---|
| Week | What will the valley be like on 16–22 April? | A weather model can still carry the morning forward. This is the range just scored with GEFSv12. |
| Month | What will the valley be like from 16 April through 15 May, thirty days? | The first week can still be the weather forecast. The later days have forgotten the morning. Soil moisture can still matter. |
| Season | What will the coming season be like, for example summer, or the next three months? | The particular week of 16–22 April has been forgotten. Ocean temperature, soil moisture, and snow are what remain. |

A correct answer to the first question does not answer the second, and it does not answer the third. The week is seven days. The month is those seven days plus about twenty-three more. The season is a different stretch of the year. Adding up weekly maps does not make either of the longer forecasts.

## What a good week can give the month

The month already stored in the example files is days 1 through 30 after the issue date. The week is days 1 through 7, the first slice of that month.

Until a month model beats a simple blend, the monthly map is the weekly forecast for those seven days and the ordinary climate for the days after them. No new network is required to write that blend.

April 2019 rain, valley mean:

| Piece | Rain |
|---|---:|
| Observed week, 16–22 April | 55.9 mm |
| Ordinary week | 24.4 mm |
| Observed thirty days | 164.5 mm |
| Ordinary thirty days | 118.2 mm |
| A perfect week, then the ordinary climate for the rest | 149.7 mm |

The arithmetic of the last row is 55.9 + (118.2 − 24.4). Most of the gap between the ordinary month and the observed month sat inside the first week. About 15 mm sat in the later days. A perfect week forecast cannot supply those 15 mm. The month models already fit did not beat the blend. The both-channel month put April rain at 117.9 mm, on the ordinary month, and its 2019 valley temperature mean was 1.525 K against a monthly climate of 1.481 K.

The same blend is the bar a future month model has to beat. Beating the ordinary month by forecasting week 1 and using climate afterward is allowed, and it has to be labeled as such. It is not evidence that days 8 through 30 were forecast.

## What a good week cannot give the season

A season is not twelve weeks added together, and it is not three months added together. The rain on 16–22 April does not say what July will be. By the next season the wind and the pressure of 15 April are gone. The leftover information is slow: the ocean, the soil, the snowpack. Those fields change on a scale of months. A week of weather does not set them.

The seasonal forecast therefore has its own target, its own ordinary climate, and its own fit. It is not the weekly network with the outputs averaged, and it is not the month head that already shares the temporal trunk. That month head was trained. It redrew the ordinary month. Sharing the trunk did not create a longer forecast.

One seasonal attempt is already on record and stays closed. Putting the Niño index on all four issue months hurt the months that are not winter. A later seasonal model, if one is opened, would be scored on a seasonal target against the seasonal climate. It would not be scored by how closely its weeks match 0.767 K.

## What stays as it is

The week is the forecast being worked on. The next week measurement is the temperature offset on the GEFSv12 mornings, one number for each of the four issue dates, fit on 2000–2017. That is [NEXT_SET_20261103.md](NEXT_SET_20261103.md). It is not a month model and not a seasonal model.

The month, when someone asks for it, is the weekly map plus the ordinary climate for the remaining days, until a model beats that blend on 2019. The month checkpoints already written stay as scored.

The season stays closed. This note does not choose its target, its years, or its inputs.
