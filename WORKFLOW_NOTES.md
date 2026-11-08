# Workflow and prompt catalog

The four science stages follow the project scope supplied by the user: HEADWATER precipitation, temperature and runoff; high-resolution downscaling; LSTM water availability; and economic assessment. Team/owner labels are omitted from the interface.

The original sources are `Dali-earth-Google-ORNL-GM.pptx` slide 2 (SHA256 `2dba49e2ef2be25aaa314c4e07aa9f3418af30d654a12ddd1624999356c0c7c7`) and `TRITON_discussion.pptx` slide 1 (SHA256 `774e7a9846ccc2a9a184b4324f06c8bd8d7eb1c1d193cdc19836fcd9867d3e07`). The source presentations were inspected previously and are not bundled. They establish the intended handoffs, rather than completed integrations.

`public/data/workflow.json` describes the stages, inputs, outputs, target resolution, integration status, supporting plant-impact pathways and source references. HEADWATER/downscaling/economics remain planned where no project skill is installed. Loaded skill metadata comes only from the selected VISTA project; workflow cards are not counted as installed skills.

`public/data/prompts.json` provides editable live requests. Clicking a prompt prepares text for review and never starts computation by itself. Requests check skill coverage, inputs, quantity/unit contracts, runtime and resource prerequisites before proposing execution. New catalog locations need their actual model/forcing support established. Requests to generate artifacts include saving files to the project's output area and displaying them for inspection.

The LSTM's thirteen-week input window includes a target week plus twelve preceding weeks; it is not a thirteen-week forecast lead. The plant/economic handoff must establish what each water quantity means before using it as total inflow or summing locations. TRITON hydraulics, river temperature and plant-data pathways remain supporting integrations with their own readiness requirements.

No model, agent inference or HPC job was run to author these catalogs.
