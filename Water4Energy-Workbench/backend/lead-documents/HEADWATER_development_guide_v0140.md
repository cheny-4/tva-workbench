# HEADWATER development guide — v0.14.0

Derived from the pinned source records bundled with Water4Energy workbench. These are source-checked readings of recorded work, not new experiments, live scheduler state or training approval. Record dates identify documentation; the model-check weeks are in 2019.

The recorded example uses soil information and a larger 9×9 neighborhood. The temperature error comparison does not isolate the contribution of soil information alone.

## What did the recorded test show?

The development record shows a completed test of a small weather model that reads soil information and a 9×9 neighborhood of grid cells. The ledger dated 26 October 2026 marks this model, det_v2_soil_k9, as scored. Dali’s 12 November record attributes it to the H100 / CCSI machines.

Across four 2019 target weeks, its valley temperature error was about 0.77 degrees Celsius, compared with 0.86 degrees Celsius for the 1979–2017 week already in the example files. Lower error is better; these are errors, not actual air temperatures. The comparison does not isolate the contribution of soil information alone.

The model still misses much of the April rain, and it does not improve every week. The ledger therefore keeps open research questions. Repeating an unchanged tested setup is not a new experiment. The next step needs a clearly stated change and a person’s review. This is a reading of saved records, not a new run.

Sources:
- [Experiment ledger — 26 October 2026](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/hypothesis_lab/experiment_ledger.json)
- [Supplied demonstration record — 12 November 2026](https://github.com/daliwang/water4energy_SC26Demo/blob/d9c185da04bb72e51414c72c4004447cd38292ee/Water4Energy_Workbench_Actions_20261112.md)

## What is selected for the next test?

The supplied files do not establish one selected current brief. The latest staged HEADWATER review is dated 6 November 2026 and contains several proposed follow-up tests, together with the proposer’s ideas, a critique and a referee’s assessment. A saved review is available, but it does not show which proposal a person chose as the next one-change experiment.

For this walkthrough, keep that distinction visible: the recorded soil-input 9×9 result is completed work; the next experiment is still a decision to be made from the documented proposals. Before execution, the chosen brief must identify one change, why it is worth testing, the inputs, the comparison and the person’s approval. It would be misleading to call the April rain problem itself the selected amendment. No new brief, review, approval or training run is created by reading these files.

Sources:
- [Proposed follow-up tests — 6 November 2026](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/hypothesis_lab/runs/20261106_second_model/experiments.json)
- [Proposer record — 6 November 2026](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/hypothesis_lab/runs/20261106_second_model/hypotheses.json)
- [Critic record — 6 November 2026](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/hypothesis_lab/runs/20261106_second_model/critique.json)
- [Referee record — 6 November 2026](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/hypothesis_lab/runs/20261106_second_model/referee_brief.md)
- [Supplied demonstration record — 12 November 2026](https://github.com/daliwang/water4energy_SC26Demo/blob/d9c185da04bb72e51414c72c4004447cd38292ee/Water4Energy_Workbench_Actions_20261112.md)

## What data were documented?

The committed Frontier inventory, dated 21 October 2026, lists 153 weekly examples and a copy that includes root-zone soil information: water held in the soil that plant roots can reach. Dali’s 12 November development record describes the same preparation sequence: the weekly examples, then the soil-information copy. These were inputs available for the documented model work.

The dates and destinations were written into the preparation plan. The inventory also distinguishes directories that were present from later cuts or copy targets that were absent at that time. Its two older version-0 examples are January 2010 training and January 2018 validation files.

This answer reports that dated inventory; it does not check Frontier live, confirm today’s file availability, or claim that a historical preflight state is the current state of every job. A person reviews any new data preparation or training request. No download or dataset job is started here.

Sources:
- [Frontier data inventory — 21 October 2026](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/docs/FRONTIER_DATASET_AGENT.md)
- [Written data-preparation plan — 21 October 2026](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/docs/DATA_PREP_PLAN_20261021.md)
- [Supplied demonstration record — 12 November 2026](https://github.com/daliwang/water4energy_SC26Demo/blob/d9c185da04bb72e51414c72c4004447cd38292ee/Water4Energy_Workbench_Actions_20261112.md)

## What needs a person’s approval?

Use the supplied 12 November 2026 board for the demonstration: the H100 and Lux training flags are both off. The April rain-rank item reads existing soil files; the Lux device check only identifies the device. The column-water and 90-day-filter items are described as designed work. Temporal attention along the 90 days has no script and no row in this supplied demo record.

The original board dated 2 November is a different snapshot. For example, its rain-rank and Lux-device-check rows say ready while their human flags are false. E_daily90 has a historical true flag, but is already scored and its experiment family is closed. Several other rows also have true flags.

A status or an old flag alone is not permission for a new run. A person must choose and approve the specific brief before any future execution. These are saved records, not live scheduler status, and nothing is submitted here.

Sources:
- [Supplied demonstration record — 12 November 2026](https://github.com/daliwang/water4energy_SC26Demo/blob/d9c185da04bb72e51414c72c4004447cd38292ee/Water4Energy_Workbench_Actions_20261112.md)
- [Historical board — 2 November 2026](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/hypothesis_lab/board.json)

## How should the score be read?

The recorded H100 9×9 result has a four-week 2019 valley temperature error of about 0.77 degrees Celsius, against 0.86 degrees Celsius for the 1979–2017 week already in the example files. Lower error is better. These numbers describe the size of the error across four target weeks; they are not actual temperatures and are not the score for the April week alone.

The result belongs to det_v2_soil_k9 on H100 / CCSI. Lux is represented by its listed scored run names, not this H100 valley number. The ledger records the result so the next design can build on what was learned.

The limitations matter too: July is worse than its stored comparison, and the April rain map remains close to the stored week. For that April illustration, observed rain is 55.9 mm, the stored week is 24.4 mm, and the 9×9 map is 24.7 mm. The temperature improvement does not establish that all weather problems are solved. No new score is calculated here.

Sources:
- [Experiment ledger — 26 October 2026](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/hypothesis_lab/experiment_ledger.json)
- [Supplied demonstration record — 12 November 2026](https://github.com/daliwang/water4energy_SC26Demo/blob/d9c185da04bb72e51414c72c4004447cd38292ee/Water4Energy_Workbench_Actions_20261112.md)

## How do the dated records connect?

These dates identify documents, not training start or completion times. The development history in 2026 is separate from the 2019 weeks used to check the model. The accompanying CSV contains the dated record, its meaning, the next decision and the source links.

On 21 October, the Frontier inventory lists 153 weekly examples and the soil-information copy. The 26 October ledger records the soil-input 9×9 result together with its rain and seasonal weaknesses. The 6 November pack contains several reviewed follow-up proposals; it does not establish which brief a person selected. The supplied 12 November demo record identifies the H100 result and records both training flags as off.

Together, these records explain how documented inputs, a tested model, measured limitations and proposed next tests connect. A person must still choose and approve a specific next brief. This source-based retrospective does not create a new scientific conclusion, selected experiment or job.

Sources:
- [Frontier data inventory — 21 October 2026](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/docs/FRONTIER_DATASET_AGENT.md)
- [Experiment ledger — 26 October 2026](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/hypothesis_lab/experiment_ledger.json)
- [Proposed follow-up tests — 6 November 2026](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/hypothesis_lab/runs/20261106_second_model/experiments.json)
- [Referee record — 6 November 2026](https://github.com/daliwang/HEADWATER/blob/5ea54ac4dd817ab38c82284331974d6668afde09/hypothesis_lab/runs/20261106_second_model/referee_brief.md)
- [Supplied demonstration record — 12 November 2026](https://github.com/daliwang/water4energy_SC26Demo/blob/d9c185da04bb72e51414c72c4004447cd38292ee/Water4Energy_Workbench_Actions_20261112.md)
