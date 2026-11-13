"""File-backed Water4Energy replay. No network, subprocesses, training, or jobs."""
from pathlib import Path
import argparse
import csv
import hashlib
import io
import json
import runpy

TASKS = ('lab.literature', 'lab.download', 'lab.ledger', 'lab.board', 'lab.design',
         'lab.show_command', 'lab.realize', 'downscale.scorecard')
CASE = {'start': '2019-04-16', 'end': '2019-04-22', 'issued': '2019-04-15'}
ROOT = Path(__file__).resolve().parents[1]
if not (ROOT / 'references').is_dir():
    # The packaged canonical copy can also be used for local release checks.
    ROOT = Path(__file__).resolve().parent / 'skills/lab-ledger'
SOURCES = ROOT / 'references'
HW = SOURCES / 'HEADWATER'
EX = SOURCES / 'water4energy_experiment'
MANIFEST = 'tva-demo-20190416-20190422.json'
HEADWATER_PROFILES = {
    'headwater-ledger': 'lab.ledger', 'headwater-brief': 'lab.design',
    'headwater-data': 'lab.download', 'headwater-board': 'lab.board',
    'headwater-score': 'lab.ledger', 'headwater-history': 'lab.ledger',
    'headwater-commands': 'lab.show_command', 'headwater-literature': 'lab.literature',
}

def read(path):
    return path.read_text(encoding='utf-8')

def load(path):
    return json.loads(read(path))

def write_bytes(path, data):
    """Do not invalidate VISTA display receipts when the evidence is unchanged."""
    if path.exists() and path.read_bytes() == data:
        return False
    path.write_bytes(data)
    return True

def copy_stable(source, target):
    return write_bytes(target, source.read_bytes())

def write_json(path, value):
    return write_bytes(path, (json.dumps(value, indent=2, ensure_ascii=False) + '\n').encode('utf-8'))

def readout_filename(task, context):
    prefix = 'w4e-v0140-headwater-' if context == 'headwater' else 'w4e-v0132-'
    return prefix + task.replace('.', '-') + '-readout.json'

def provenance(path):
    rel = path.relative_to(SOURCES).as_posix()
    repo, name = rel.split('/', 1)
    matches = [r for r in load(ROOT / 'source-provenance.json') if r['repo'] == repo and r['path'] == name]
    if len(matches) != 1:
        raise ValueError('Unregistered source: ' + rel)
    record = matches[0]
    if hashlib.sha256(path.read_bytes()).hexdigest() != record['sha256']:
        raise ValueError('Source hash mismatch: ' + rel)
    return record

def stage_research(out, context='tva'):
    if context == 'headwater':
        pack = HW / 'hypothesis_lab/runs/20261106_second_model'
        files = {
            'w4e-v0140-headwater-experiment-ledger.json': HW / 'hypothesis_lab/experiment_ledger.json',
            'w4e-v0140-headwater-proposer.json': pack / 'hypotheses.json',
            'w4e-v0140-headwater-critic.json': pack / 'critique.json',
            'w4e-v0140-headwater-referee.md': pack / 'referee_brief.md',
            'w4e-v0140-headwater-experiments.json': pack / 'experiments.json',
        }
        for name, source in files.items():
            provenance(source)
            copy_stable(source, out / name)
        write_json(out / 'w4e-v0140-headwater-source-provenance.json', load(ROOT / 'source-provenance.json'))
        return {'ledger_file': 'w4e-v0140-headwater-experiment-ledger.json',
                'proposal_file': 'w4e-v0140-headwater-proposer.json',
                'critic_file': 'w4e-v0140-headwater-critic.json',
                'referee_file': 'w4e-v0140-headwater-referee.md',
                'protocol_file': 'w4e-v0140-headwater-experiments.json'}
    files = {
        'experiment_ledger.json': HW / 'hypothesis_lab/experiment_ledger.json',
        'proposer_brief.md': HW / 'hypothesis_lab/runs/20261018_iter1_april/PROPOSER_BRIEF.md',
        'critique.json': HW / 'hypothesis_lab/runs/20261018_iter1_april/critique.json',
        'referee_brief.md': HW / 'hypothesis_lab/runs/20261018_iter1_april/referee_brief.md',
        'experiments.json': HW / 'hypothesis_lab/runs/20261018_iter1_april/experiments.json',
    }
    for name, source in files.items():
        provenance(source)
        copy_stable(source, out / name)
    write_json(out / 'w4e-source-provenance.json', load(ROOT / 'source-provenance.json'))
    return {'ledger_file': 'experiment_ledger.json', 'proposal_file': 'proposer_brief.md',
            'critic_file': 'critique.json', 'referee_file': 'referee_brief.md',
            'protocol_file': 'experiments.json'}

def update_manifest(out, panels):
    path = out / MANIFEST
    manifest = load(path) if path.exists() else {'schema_version': 1, 'example_only': False, 'case': CASE, 'panels': {}}
    if manifest.get('case') != CASE or manifest.get('example_only') is not False:
        raise ValueError('Existing manifest is for a different case or is an example.')
    manifest['panels'].update(panels)
    manifest['research'] = stage_research(out)
    write_json(path, manifest)

def realization(out):
    panels = {}
    for panel, variable, observed, stored, model, units in [
        ('temperature', 't2m', 17.3, 18.2, 18.0, 'degrees Celsius'),
        ('precipitation', 'precip', 55.9, 24.4, 24.7, 'mm'),
    ]:
        source = HW / f'figures/april2019_temporal_reslim/tva_{variable}_20190415_reference_obs_k9_reslim_temporal.png'
        figure = f'w4e-april-{panel}.png'
        backing = f'w4e-april-{panel}-source.json'
        records = [provenance(source), provenance(HW / 'scripts/plot_april2019_temporal_reslim.py'),
                   provenance(HW / 'scripts/plot_obs_target_comparison.py')]
        copy_stable(source, out / figure)
        write_json(out / backing, {
            'case': CASE, 'kind': 'frozen_prediction', 'model': 'det_v2_soil_k9',
            'figure': figure, 'source_material': records,
            'values_from_published_figure_labels': {'units': units, 'observed_valley': observed,
                'stored_1979_2017_week_valley': stored, 'residual_9x9_valley': model},
            'scope': 'Single valid week. Values transcribed from the original published map labels, not recomputed from arrays.',
            'column_mapping': 'plot_obs_target_comparison.py maps Residual 9×9 to runs/det_v2_soil_k9.',
            'other_columns': 'The unmodified source figure also contains saved Reslim comparisons; these are not a claim about the current model.',
            'aggregate_score_warning': 'The four-week 2019 valley RMSE of 0.767 K is not a score for this single April week.',
        })
        panels[panel] = {'kind': 'frozen_prediction', 'model': 'det_v2_soil_k9',
            'figure': figure, 'source_file': backing,
            'source': 'Original HEADWATER April map; Residual 9×9 column is det_v2_soil_k9. Other saved comparison columns retained.'}
    source = HW / 'hypothesis_lab/runs/20261102_sro_sample/receipt.json'
    receipt = load(source)
    rows = [row for row in receipt['files'] if row['issue'] == CASE['issued']]
    if len(rows) != 1:
        raise ValueError('The committed ERA5 receipt does not contain exactly one April case.')
    row = rows[0]
    backing = 'w4e-april-runoff-source.json'
    figure = 'w4e-april-runoff-receipt.png'
    write_json(out / backing, {'case': CASE, 'kind': 'observation', 'dataset': 'ERA5', 'variable': 'sro',
        'forecast_available': False, 'receipt_written_at': receipt['written_at'], 'receipt_row': row,
        'source_material': [provenance(source), provenance(HW / 'scripts/insert_sro_into_sample.py')],
        'scope': 'Valley mean of the 7-day accumulated ERA5 surface runoff, in mm, from the committed receipt. Not a spatial map.',
        'window': 'insert_sro_into_sample.py uses issue +1 through issue +7 days.',
        'raw_arrays_in_bundle': False, 'new_inference': False})
    # This is the existing receipt-derived summary PNG, not an original spatial
    # runoff map. Copying its fixed bytes removes Matplotlib/runtime variance.
    chart = ROOT / 'assets' / figure
    chart_record = load(ROOT / 'assets/runoff-receipt-chart.json')
    if (chart_record['receipt_sha256'] != provenance(source)['sha256']
            or chart_record['valley_week_mm'] != row['valley_week_mm']
            or chart_record['figure_sha256'] != hashlib.sha256(chart.read_bytes()).hexdigest()):
        raise ValueError('Frozen receipt chart does not match the pinned observation receipt.')
    copy_stable(chart, out / figure)
    panels['runoff'] = {'kind': 'observation', 'dataset': 'ERA5', 'variable': 'sro', 'forecast_available': False,
        'figure': figure, 'source_file': backing,
        'source': 'ERA5 sro observation: committed 7-day valley summary receipt. Summary chart, not a spatial map; no runoff forecast.'}
    update_manifest(out, panels)
    return {'case': CASE, 'panels': panels, 'display_files': [p['figure'] for p in panels.values()],
            'new_inference': False, 'runoff_scope': 'Receipt-derived valley summary; original spatial runoff arrays are not staged.'}

def downscale(out):
    source = EX / 'Trial0_run_20260907_220510_scorecard_ext.json'
    scorecard = load(source)
    if scorecard.get('wet_day', {}).get('date') != '2019-04-19' or 'run_20260907_220510_trial0_unet' not in scorecard.get('ckpt', ''):
        raise ValueError('Trial 0 source identity/date mismatch.')
    figures = []
    materials = [provenance(source)]
    for variable in ['tp', 't2m']:
        image = EX / f'figures/trial0_test_wet_2019-04-19_{variable}.png'
        name = f'w4e-trial0-20190419-{variable}.png'
        copy_stable(image, out / name)
        materials.append(provenance(image))
        figures.append(name)
    backing = 'w4e-trial0-scorecard-source.json'
    write_json(out / backing, {'case': CASE, 'trial': 'Trial 0', 'scored': '2026-09-07',
        'date': '2019-04-19', 'input_resolution_deg': 1, 'output_resolution_deg': .25,
        'source_material': materials, 'original_scorecard': scorecard,
        'score_scope': 'Original aggregate standardized test-split scores over 730 days. Not an April-only or one-day re-score.',
        'figure_scope': 'Existing wet test day 19 April 2019. U-Net, bilinear and persistence shown in the original figure.',
        'new_training': False, 'new_scoring': False})
    panel = {'kind': 'frozen_comparison', 'trial': 'Trial 0', 'scored': '2026-09-07',
        'date': '2019-04-19', 'input_resolution_deg': 1, 'output_resolution_deg': .25,
        'figure': figures[0], 'source_file': backing,
        'source': 'Original Trial 0 wet-day map, 19 April 2019; original aggregate scorecard scored 7 September 2026. No retrain or re-score.'}
    update_manifest(out, {'downscale': panel})
    return {'panel': panel, 'score_scope': 'Aggregate test split; not an April-only score.',
            'scores': scorecard['scores'], 'display_files': figures}

def source_ref(path):
    record = provenance(path)
    return {'path': '/mnt/skills/' + ROOT.name + '/references/' + record['repo'] + '/' + record['path'], 'repo_path': record['repo'] + '/' + record['path'],
            'commit': record['commit'], 'url': record['url']}

def headwater_story():
    story = load(ROOT / 'assets/headwater-story.json')
    for row in story['history']:
        for source in row['sources']:
            record = provenance(SOURCES / source['repo_path'])
            if record['commit'] != source['commit'] or record['url'] != source['url']:
                raise ValueError('The development story cites a different source snapshot.')
    return story

def headwater_facts(task):
    ledger = load(HW / 'hypothesis_lab/experiment_ledger.json')
    soil = next(row for row in ledger['runs'] if row['id'] == 'det_v2_soil_k9')
    board = load(HW / 'hypothesis_lab/board.json')
    protocol = load(HW / 'hypothesis_lab/runs/20261106_second_model/experiments.json')
    return {
        'project': 'Water4Energy workbench', 'context': 'headwater',
        'recorded_example': 'The soil-input model with a larger 9×9 first convolution',
        'ledger_record_date': ledger['updated'], 'recorded_run': soil,
        'score_scope': 'Temperature error across four 2019 target weeks, not a real temperature or a single April score.',
        'comparison': {'model_error_C': .77, 'stored_week_error_C': .86,
                       'label': 'the 1979–2017 week already in the example files',
                       'attribution': 'H100 / CCSI; Lux contributes its listed scored run names.',
                       'causal_scope': 'This comparison does not isolate the effect of soil information alone.'},
        'frontier_inventory_record_date': '2026-10-21', 'weekly_examples': 153,
        'root_zone_soil_copy': 'headwater_examples_v1_soil',
        'inventory_scope': 'The committed inventory reports what was present on 21 October; no live cluster lookup is performed.',
        'v0_examples': ['example_train_20100115.npz', 'example_val_20180115.npz'],
        'latest_staged_review': '20261106_second_model',
        'review_proposal_ids': [row['id'] for row in protocol['experiments']],
        'selected_current_brief_established': False,
        'original_board_record_date': board['updated'],
        'original_board_rows': [{key: row.get(key) for key in ['id', 'state', 'human_flag', 'family_closed']} for row in board['rows']],
        'supplied_demo_board_date': '2026-11-12',
        'supplied_H100_training_flag': False, 'supplied_Lux_training_flag': False,
        'approval_rule': 'A recorded status or old true flag does not authorize a new run. A person chooses and approves a specific brief.',
        'story': headwater_story(), 'jobs_submitted': 0,
    }

def headwater_profile(task, question=None):
    default = {'lab.ledger': 'headwater-ledger', 'lab.design': 'headwater-brief',
               'lab.download': 'headwater-data', 'lab.board': 'headwater-board',
               'lab.show_command': 'headwater-commands', 'lab.literature': 'headwater-literature'}
    topic = question or default.get(task)
    if topic not in HEADWATER_PROFILES or HEADWATER_PROFILES[topic] != task:
        raise ValueError('Use the matching HEADWATER question profile and reader. April weather/downscale evidence belongs to the TVA case.')
    return topic

def validate_requested_profile(task, context, question):
    if context == 'headwater':
        return headwater_profile(task, question)
    if question and question.startswith('headwater-'):
        raise ValueError('A HEADWATER question profile requires --context headwater, not the TVA case.')
    return question

def history_markdown(story):
    def cell(value):
        return value.replace('|', '\\|').replace('\n', ' ')
    lines = ['# Recorded HEADWATER development history', '', story['date_note'], '',
             '| Record date | What was documented | What it means | Next decision |',
             '| --- | --- | --- | --- |']
    for row in story['history']:
        lines.append('| ' + ' | '.join(cell(value) for value in [row['date'], row['record'], row['meaning'], row['next_decision']]) + ' |')
    lines += ['', '## Sources', '']
    seen = set()
    for row in story['history']:
        for source in row['sources']:
            if source['url'] not in seen:
                seen.add(source['url'])
                lines.append('- [' + source['repo_path'] + '](' + source['url'] + ')')
    return '\n'.join(lines) + '\n'

def history_csv(story):
    stream = io.StringIO(newline='')
    writer = csv.writer(stream, lineterminator='\n')
    writer.writerow(['record_date', 'documented_record', 'meaning', 'next_decision', 'source_urls'])
    for row in story['history']:
        writer.writerow([row['date'], row['record'], row['meaning'], row['next_decision'],
                         ' '.join(source['url'] for source in row['sources'])])
    return stream.getvalue()

def compact_headwater(result, question=None):
    topic = headwater_profile(result['contract_id'], question)
    ledger = HW / 'hypothesis_lab/experiment_ledger.json'
    actions = SOURCES / 'water4energy_SC26Demo/Water4Energy_Workbench_Actions_20261112.md'
    review = HW / 'hypothesis_lab/runs/20261106_second_model'
    inventory = HW / 'docs/FRONTIER_DATASET_AGENT.md'
    board = HW / 'hypothesis_lab/board.json'
    sources = [ledger, actions]
    displays = []
    if topic == 'headwater-ledger':
        text = ('The development record shows a completed test of a small weather model that reads soil information and a '
                '9×9 neighborhood of grid cells. The ledger dated 26 October 2026 marks this model, det_v2_soil_k9, as scored. '
                'Dali’s 12 November record attributes it to the H100 / CCSI machines.\n\n'
                'Across four 2019 target weeks, its valley temperature error was about 0.77 degrees Celsius, compared with '
                '0.86 degrees Celsius for the 1979–2017 week already in the example files. Lower error is better; these are '
                'errors, not actual air temperatures. The comparison does not isolate the contribution of soil information alone.\n\n'
                'The model still misses much of the April rain, and it does not improve every week. The ledger therefore keeps '
                'open research questions. Repeating an unchanged tested setup is not a new experiment. The next step needs a '
                'clearly stated change and a person’s review. This is a reading of saved records, not a new run.')
    elif topic == 'headwater-brief':
        text = ('The supplied files do not establish one selected current brief. The latest staged HEADWATER review is dated '
                '6 November 2026 and contains several proposed follow-up tests, together with the proposer’s ideas, a critique '
                'and a referee’s assessment. A saved review is available, but it does not show which proposal a person chose '
                'as the next one-change experiment.\n\n'
                'For this walkthrough, keep that distinction visible: the recorded soil-input 9×9 result is completed work; '
                'the next experiment is still a decision to be made from the documented proposals. Before execution, the chosen '
                'brief must identify one change, why it is worth testing, the inputs, the comparison and the person’s approval. '
                'It would be misleading to call the April rain problem itself the selected amendment. No new brief, review, '
                'approval or training run is created by reading these files.')
        sources = [review / 'experiments.json', review / 'hypotheses.json', review / 'critique.json', review / 'referee_brief.md', actions]
    elif topic == 'headwater-data':
        text = ('The committed Frontier inventory, dated 21 October 2026, lists 153 weekly examples and a copy that includes '
                'root-zone soil information: water held in the soil that plant roots can reach. Dali’s 12 November development '
                'record describes the same preparation sequence: the weekly examples, then the soil-information copy. These '
                'were inputs available for the documented model work.\n\n'
                'The dates and destinations were written into the preparation plan. The inventory also distinguishes directories '
                'that were present from later cuts or copy targets that were absent at that time. Its two older version-0 examples '
                'are January 2010 training and January 2018 validation files.\n\n'
                'This answer reports that dated inventory; it does not check Frontier live, confirm today’s file availability, '
                'or claim that a historical preflight state is the current state of every job. A person reviews any new data '
                'preparation or training request. No download or dataset job is started here.')
        sources = [inventory, HW / 'docs/DATA_PREP_PLAN_20261021.md', actions]
    elif topic == 'headwater-board':
        text = ('Use the supplied 12 November 2026 board for the demonstration: the H100 and Lux training flags are both off. '
                'The April rain-rank item reads existing soil files; the Lux device check only identifies the device. The '
                'column-water and 90-day-filter items are described as designed work. Temporal attention along the 90 days '
                'has no script and no row in this supplied demo record.\n\n'
                'The original board dated 2 November is a different snapshot. For example, its rain-rank and Lux-device-check '
                'rows say ready while their human flags are false. E_daily90 has a historical true flag, but is already '
                'scored and its experiment family is closed. Several other rows also have true flags.\n\n'
                'A status or an old flag alone is not permission for a new run. A person must choose and approve the specific '
                'brief before any future execution. These are saved records, not live scheduler status, and nothing is submitted here.')
        sources = [actions, board]
    elif topic == 'headwater-score':
        text = ('The recorded H100 9×9 result has a four-week 2019 valley temperature error of about 0.77 degrees Celsius, '
                'against 0.86 degrees Celsius for the 1979–2017 week already in the example files. Lower error is better. '
                'These numbers describe the size of the error across four target weeks; they are not actual temperatures '
                'and are not the score for the April week alone.\n\n'
                'The result belongs to det_v2_soil_k9 on H100 / CCSI. Lux is represented by its listed scored run names, '
                'not this H100 valley number. The ledger records the result so the next design can build on what was learned.\n\n'
                'The limitations matter too: July is worse than its stored comparison, and the April rain map remains close '
                'to the stored week. For that April illustration, observed rain is 55.9 mm, the stored week is 24.4 mm, '
                'and the 9×9 map is 24.7 mm. The temperature improvement does not establish that all weather problems are solved. '
                'No new score is calculated here.')
    elif topic == 'headwater-history':
        story = result['answer_facts']['story']
        text = ('These dates identify documents, not training start or completion times. The development history in 2026 is '
                'separate from the 2019 weeks used to check the model. The accompanying CSV contains the dated record, '
                'its meaning, the next decision and the source links.\n\n'
                'On 21 October, the Frontier inventory lists 153 weekly examples and the soil-information copy. The 26 October '
                'ledger records the soil-input 9×9 result together with its rain and seasonal weaknesses. The 6 November pack '
                'contains several reviewed follow-up proposals; it does not establish which brief a person selected. The supplied '
                '12 November demo record identifies the H100 result and records both training flags as off.\n\n'
                'Together, these records explain how documented inputs, a tested model, measured limitations and proposed next '
                'tests connect. A person must still choose and approve a specific next brief. This source-based retrospective '
                'does not create a new scientific conclusion, selected experiment or job.')
        sources = [inventory, ledger, review / 'experiments.json', review / 'referee_brief.md', actions]
        displays = ['w4e-v0140-headwater-history.csv']
    elif topic == 'headwater-commands':
        text = ('The supplied Lux training recipe can be read as an existing command reference. Its presence does not establish '
                'the exact command that produced the H100 result. The selected next HEADWATER brief is not established by '
                'the supplied review pack. A person must review the actual host, inputs, comparison, command and approval '
                'before any future execution. Reading a recipe or a historical true flag does not authorize a run. '
                'This readout shows saved information and starts no training or job.')
        sources = [HW / 'lux/train_k9.sh', actions, review / 'experiments.json']
        displays = [readout_filename('lab.show_command', 'headwater')]
    else:
        text = ('The saved literature catalog and download notes record the project’s reading material and documented gaps. '
                'They are useful background for a new proposal, but a catalog entry does not prove that a paper was read '
                'or that its PDF is included in this package. This readout performs no search or download. Any follow-up '
                'proposal should identify its source evidence and the change it would test.')
        sources = [HW / 'docs/literature/catalog.csv', HW / 'docs/literature/DOWNLOAD.md']
    titles = {
        str(ledger): 'Experiment ledger — 26 October 2026', str(actions): 'Supplied demonstration record — 12 November 2026',
        str(inventory): 'Frontier data inventory — 21 October 2026', str(board): 'Historical board — 2 November 2026',
        str(HW / 'docs/DATA_PREP_PLAN_20261021.md'): 'Written data-preparation plan — 21 October 2026',
        str(review / 'experiments.json'): 'Proposed follow-up tests — 6 November 2026',
        str(review / 'hypotheses.json'): 'Proposer record — 6 November 2026',
        str(review / 'critique.json'): 'Critic record — 6 November 2026',
        str(review / 'referee_brief.md'): 'Referee record — 6 November 2026',
    }
    refs = [source_ref(path) for path in sources]
    return {'mode': 'deterministic saved-evidence readout; not a new scientific result', 'context': 'headwater',
            'topic': topic, 'verified_answer': text,
            'display_paths': ['/mnt/data/output/' + name for name in displays], 'source_paths': refs,
            'source_citations': [{'title': titles.get(str(path), path.name), 'url': ref['url']} for path, ref in zip(sources, refs)],
            'inspection_readout_path': '/mnt/data/output/' + readout_filename(result['contract_id'], 'headwater'),
            'must_not_infer': 'Quote this saved readout faithfully. Do not select a current brief, infer permission from flags, confuse record dates with execution dates, or substitute April mode for HEADWATER development.',
            'jobs_submitted': 0}

def answer_facts(task, context):
    """Short scoped readings, always traceable to the unchanged pinned records.

    These are evidence fields for the live agent, not prewritten user answers.
    Numeric values are selected directly from JSON or the labelled saved maps.
    """
    if context == 'headwater':
        return headwater_facts(task)
    ledger_path = HW / 'hypothesis_lab/experiment_ledger.json'
    ledger = load(ledger_path)
    soil = next(row for row in ledger['runs'] if row['id'] == 'det_v2_soil_k9')
    april = soil['heldout_2019']['weeks']['2019-04-15']
    common = {
        'project': 'Water4Energy workbench',
        'project_scope': 'Water4Energy is the project; HEADWATER development is its demonstrated research workflow. The TVA April week is one selectable case, not the product name.',
        'case': CASE,
        'science_boundary': 'HEADWATER frozen forecasts and the separate Trial 0 downscaling comparison are separate saved results. No demonstrated coupling of the HEADWATER soil_k9 forecast into Trial 0 is supplied.',
        'dam_scope': {'optional': True, 'skill_installed': False, 'agreed_reservoir': None,
                      'agreed_fill_hold_rule': None,
                      'allowed': 'Explain that a reservoir and an agreed plain-language rule are required before an optional saved-evidence readout. Do not suggest thresholds or say fill/hold now.'},
    }
    if task == 'lab.ledger':
        common.update({
            'ledger_updated': ledger['updated'],
            'april_temperature': {'model': soil['id'], 'status': soil['status'],
                'valley_rmse_K': april['temperature_valley_rmse'],
                'stored_week_valley_rmse_K': april['climatology_valley_rmse'],
                'scope': 'Only 16–22 April 2019, issued 15 April. An RMSE is an error, not a temperature mean.'},
            'separate_four_week_scores': {'temperature_valley_rmse_K': soil['heldout_2019']['temperature_valley_rmse_mean'],
                'precipitation_valley_rmse_m': soil['heldout_2019']['precip_valley_rmse_mean'],
                'scope': 'Aggregate over four 2019 check weeks, not April rainfall amount or the score for one week.'},
            'open_april_gap': next(g for g in ledger['open_gaps'] if g['id'] == 'april_cold_week_mechanism'),
            'blocks_reproposal_meaning': 'Do not repeat the already-tested configuration unchanged as a new experiment. A genuinely changed proposal must state its delta and pass human review; this is not a ban on every future related hypothesis.',
            'sources': [source_ref(ledger_path), source_ref(SOURCES / 'water4energy_SC26Demo/Water4Energy_Workbench_Actions_20261112.md')],
            'answer_focus': 'Report scored versus still-open findings. Do not describe a board row as permission to execute or present Trial 0 as a coupled HEADWATER pipeline.'})
    elif task == 'lab.realize':
        receipt_path = HW / 'hypothesis_lab/runs/20261102_sro_sample/receipt.json'
        receipt = load(receipt_path)
        row = next(r for r in receipt['files'] if r['issue'] == CASE['issued'])
        common.update({
            'valid_week_label': '16–22 April 2019 (issued 15 April 2019)',
            'saved_weather_columns': ['Reference', 'Observed', 'Residual 9×9', 'Residual Reslim', 'Temporal Reslim'],
            'weather_comparison_label': 'the 1979–2017 week already in the example files',
            'weekly_valley_temperature_C': {'observed': 17.3, 'stored_week': 18.2, 'residual_9x9': 18.0},
            'weekly_accumulated_valley_precipitation_mm': {'observed': 55.9, 'stored_week': 24.4, 'residual_9x9': 24.7},
            'rainfall_reading': 'The residual 9×9 stays close to the stored week and misses much of the observed wet week. The numbers are 7-day totals in mm, never mm/day.',
            'runoff': {'dataset': 'ERA5', 'variable': 'sro', 'kind': 'observation',
                'weekly_accumulated_valley_mean_mm': row['valley_week_mm'],
                'forecast_available': False,
                'figure_origin': 'A receipt-summary chart rendered once from the committed receipt and frozen in this bundle. It is derived, not an original repository spatial map.',
                'scope': 'Observed valley mean of seven-day accumulated surface runoff; not reservoir inflow, not a spatial map, not a HEADWATER prediction.'},
            'sources': [source_ref(HW / 'scripts/plot_april2019_temporal_reslim.py'),
                source_ref(HW / 'scripts/plot_obs_target_comparison.py'), source_ref(receipt_path),
                source_ref(HW / 'scripts/insert_sro_into_sample.py')],
            'answer_focus': 'Use only the displayed map labels/columns and the receipt. Do not invent a bilinear column in the HEADWATER weather maps or infer an extra climatology pattern.',
            'required_display': {
                'weather_question': ['w4e-april-runoff-receipt.png', 'w4e-april-precipitation.png', 'w4e-april-temperature.png'],
                'runoff_question': ['w4e-april-runoff-receipt.png', 'w4e-april-runoff-source.json'],
                'rule': 'Actually call display_file, using /mnt/data/output/ plus each name. A sentence claiming a display is not a display call.'}})
    elif task == 'downscale.scorecard':
        path = EX / 'Trial0_run_20260907_220510_scorecard_ext.json'
        score = load(path)
        common.update({
            'trial': 'Frozen Trial 0 U-Net, scored 7 September 2026',
            'score_scope': {'split': score['split'], 'n_days': score['n'], 'metric_space': score['metric_space'],
                'scope': 'Original aggregate test-split metrics over 730 days, not a score for 19 April or the April week.'},
            'global_standardized_rmse': {variable: {'unet': score['scores']['unet']['rmse_' + variable],
                'bilinear': score['scores']['bilinear']['rmse_' + variable]}
                for variable in ['t2m', 'tp', 'msl']},
            'verdict': 'T2M and TP have lower aggregate RMSE than bilinear. MSL has slightly higher RMSE, so do not claim every variable improves.',
            'figure_scope': {'date': score['wet_day']['date'], 'scope': 'Existing illustrative wet test day; separate from the aggregate score scope.'},
            'input_boundary': 'The scorecard names its own daily_image_trial0 pack and checkpoint. It does not establish use of a HEADWATER det_v2_soil_k9 forecast as input.',
            'sources': [source_ref(path), source_ref(EX / 'figures/trial0_test_wet_2019-04-19_tp.png'),
                source_ref(EX / 'figures/trial0_test_wet_2019-04-19_t2m.png')],
            'required_display': ['w4e-trial0-20190419-tp.png', 'w4e-trial0-20190419-t2m.png'],
            'answer_focus': 'Give a short comparison with scope labels and actually display both existing figures. Do not attribute a runoff receipt to this scorecard or the ledger.'})
    elif task == 'lab.design':
        folder = '20261106_second_model' if context == 'headwater' else '20261018_iter1_april'
        pack = HW / 'hypothesis_lab/runs' / folder
        protocol = load(pack / 'experiments.json')
        april_slice_path = HW / 'hypothesis_lab/runs/20261018_iter1_april/april_score_slice.json'
        april_slice = load(april_slice_path)
        board = load(HW / 'hypothesis_lab/board.json')
        common.update({
            'current_ledger_snapshot': ledger['updated'],
            'current_april_gap': next(g for g in ledger['open_gaps'] if g['id'] == 'april_cold_week_mechanism'),
            'saved_review': {'folder': folder, 'review_date': '2026-11-06' if context == 'headwater' else '2026-10-18',
                'focus': protocol.get('focus'), 'roles_present': ['Proposer', 'Critic', 'Referee'],
                'experiment_ids': [e['id'] for e in protocol.get('experiments', [])],
                'scope': 'A saved staged review, not a newly run review or current training approval.'},
            'archived_april_reading': 'The 18 October April pack already contains E1 map diagnosis, E2 persistence table, E3 spring-date cuts, and E4 literature collection. The saved Referee reports E1 notes and E2 document-backed slice delivered; 2019 valley issue-week RMSE was still pending there. Do not say the role artifacts are absent.',
            'later_F1_completion': {'date': april_slice['date'], 'completed_at': april_slice['f1_completed_at'],
                'april_2019_issue_week_valley_rmse_K': april_slice['valley_temperature_rmse_K']['2019-04-15']['issue_week_persistence'],
                'april_2019_det_v1_valley_rmse_K': april_slice['valley_temperature_rmse_K']['2019-04-15']['det_v1'],
                'april_2018_issue_week_valley_rmse_K': april_slice['valley_temperature_rmse_K']['2018-04-15']['issue_week_persistence'],
                'april_2018_det_v1_valley_rmse_K': april_slice['valley_temperature_rmse_K']['2018-04-15']['det_v1'],
                'reading': 'The 19 October score slice supersedes the 18 October referee’s pending-F1 statement. Persistence is worse than det_v1 in April 2019, better in April 2018. F1 is not missing now.'},
            'later_spring_score': next(row for row in board['rows'] if row['id'] == 'E_spring_score'),
            'date_rule': 'Use the later 26 October ledger to describe what remains open now. E1 notes, E2/F1 measurements and later spring scoring exist: do not present any of these as a wholly missing or newly completed test. The 2 November board records E_spring_score as scored/closed; 16–22 March and 2–8 May beat their stored weeks, but 2–8 April loses.',
            'next_step_scope': 'The April rain shortfall/mechanism remains open in the ledger. A new one-change test needs a stated delta, review and a person’s approval; this reply does not approve or run it. The 12 November demo board lists April rain rank as a CPU/read diagnostic, not a GPU training job.',
            'sources': [source_ref(ledger_path), source_ref(pack / 'experiments.json'),
                source_ref(pack / 'critique.json'), source_ref(pack / 'referee_brief.md'),
                source_ref(april_slice_path),
                source_ref(HW / 'hypothesis_lab/board.json'),
                source_ref(SOURCES / 'water4energy_SC26Demo/Water4Energy_Workbench_Actions_20261112.md')],
            'answer_focus': 'Name the actual open gap, show that saved role evidence exists, distinguish its date from later ledger findings, and keep any new proposal explicitly unapproved.'})
    elif task in ('lab.board', 'lab.show_command'):
        board_path = HW / 'hypothesis_lab/board.json'
        board = load(board_path)
        daily90 = next(row for row in board['rows'] if row['id'] == 'E_daily90')
        common.update({
            'dated_flags': {'original_board_updated': board['updated'],
                'original_E_daily90_human_flag': daily90['human_flag'],
                'demo_record_date': '2026-11-12', 'demo_H100_training_flag': False, 'demo_Lux_training_flag': False,
                'scope': 'The original board has historical true flags. Only the separate 12 November demo H100/Lux flags are both off. Neither is a live scheduler permission.'},
            'existing_command_file': '/mnt/skills/' + ROOT.name + '/references/HEADWATER/lux/train_k9.sh',
            'command_scope': 'An existing Lux 9×9 training script is supplied as text. Its presence does not make it the exact command used for the H100 result.',
            'trial0_exact_scorer_command': None,
            'missing_command_rule': 'The exact original Trial 0 scoring command is absent from this bundle. Report missing; do not reconstruct a plausible command from checkpoint paths.',
            'human_gate': 'Before any future execution a person reviews the exact target host, inputs, command, dated board/brief and required flag. Do not execute or submit anything in this demonstration. Historical ready/scored labels alone are not permission.',
            'sources': [source_ref(HW / 'lux/train_k9.sh'), source_ref(board_path),
                source_ref(SOURCES / 'water4energy_SC26Demo/Water4Energy_Workbench_Actions_20261112.md')],
            'answer_focus': 'Show the existing command file verbatim when asked, clearly label the absent Trial 0 scorer, and distinguish dated flags without claiming all historical flags are off.'})
    return common

def compact_readout(result, question=None):
    """A concise, explicitly deterministic saved-evidence readout for the LLM.

    The full dated source material remains in the versioned inspection JSON.
    Keeping obsolete raw review paragraphs out of stdout prevents them from
    drowning out the later source record that completes the same measurement.
    """
    if result['context'] == 'headwater':
        return compact_headwater(result, question)
    if question and question.startswith('headwater-'):
        raise ValueError('A HEADWATER profile requires the HEADWATER context.')
    task = result['contract_id']
    default = {'lab.ledger': 'ledger', 'lab.realize': 'weather',
               'downscale.scorecard': 'downscale', 'lab.design': 'design',
               'lab.show_command': 'commands', 'lab.board': 'board',
               'lab.literature': 'literature', 'lab.download': 'download'}[task]
    topic = question or default
    facts = result['answer_facts']
    ledger = HW / 'hypothesis_lab/experiment_ledger.json'
    actions = SOURCES / 'water4energy_SC26Demo/Water4Energy_Workbench_Actions_20261112.md'
    sources = [ledger]
    displays = []
    if result['context'] == 'headwater' and topic == 'ledger':
        text = ('The Water4Energy development record identifies det_v2_soil_k9 as the H100 9×9 result. Its four-week 2019 '
                'valley temperature RMSE is 0.7668 K, about 0.77 degrees Celsius as a temperature difference, compared with '
                'about 0.86 degrees Celsius for the 1979–2017 week already in the example files. These are four-week error '
                'metrics, not a single April temperature mean. Lux is listed through saved run names, not this H100 valley score.\n\n'
                'The actual ledger rows distinguish scored work from still-open problems. A person must state the change and '
                'review a new brief before any future training flag or execution. No training, review or job is performed by this saved readout.')
        sources = [ledger, actions]
    elif result['context'] == 'headwater' and topic == 'design':
        text = ('This is a saved HEADWATER development review, not a new review or permission to train. '
                'The included latest staged pack is 20261106_second_model; its Proposer, Critic, Referee and experiment file are available. '
                'A person must choose a stated change and approve any future training flag. No experiment or job was run by this readout.')
        sources = [HW / 'hypothesis_lab/runs/20261106_second_model/experiments.json', actions]
    elif topic == 'ledger':
        text = ('The ledger updated 26 October 2026 records det_v2_soil_k9 as scored. For 16–22 April 2019, issued 15 April, '
                'its valley temperature RMSE is 0.8282 K versus 1.0903 K for that week’s stored historical field. '
                'The separate four-week 2019 valley temperature RMSE is 0.7668 K; the four-week precipitation RMSE is 0.0301 m. '
                'These are error metrics, not the April temperature or rainfall amount.\n\n'
                'The ledger still labels april_cold_week_mechanism open: the frozen 9×9 wins 16–22 April but loses 2–8 April to '
                'that week’s own stored value, and rain remains near the stored week. An unchanged tested configuration is blocked '
                'from being presented as a new proposal; a genuinely changed proposal needs its stated delta and human review. '
                'This readout approves no job and makes no claim about other gap statuses or a new weekly pass target.')
    elif topic == 'weather':
        text = ('These are the saved figures for 16–22 April 2019, issued 15 April 2019. The labelled valley temperature means '
                'are 17.3 °C observed, 18.2 °C for the stored week, and 18.0 °C for the Residual 9×9 model det_v2_soil_k9. '
                'The stored comparison is the 1979–2017 week already in the example files; it is not the det_v2_soil_k9 model.\n\n'
                'The corresponding seven-day accumulated valley precipitation is 55.9 mm observed, 24.4 mm for the stored week, '
                'and 24.7 mm for Residual 9×9. These are weekly totals, not mm/day: the 9×9 misses much of the observed wet week. '
                'The saved columns are Reference, Observed, Residual 9×9, Residual Reslim and Temporal Reslim. The names alone do not '
                'establish a filter length or mechanism, and there is no bilinear column in these weather maps. '
                'The accompanying runoff chart is a derived summary of an observed ERA5 receipt, with no forecast supplied in this package.')
        sources = [HW / 'scripts/plot_april2019_temporal_reslim.py', HW / 'scripts/plot_obs_target_comparison.py', actions]
        displays = ['w4e-april-runoff-receipt.png', 'w4e-april-precipitation.png', 'w4e-april-temperature.png']
    elif topic == 'runoff':
        text = ('The April runoff panel reads a committed ERA5 surface-runoff (sro) observation receipt. '
                'Its April row gives 7.364 mm: the valley mean of seven-day accumulated runoff for 16–22 April 2019, '
                'issued 15 April. The source script selects issue +1 through issue +7 days. This is not reservoir inflow.\n\n'
                'The displayed PNG is a receipt-summary chart derived once from that saved number and frozen for repeatable display. '
                'It is not an original spatial runoff map. This saved-evidence package supplies neither the spatial arrays nor a '
                'HEADWATER runoff forecast. That package boundary does not establish that no runoff component exists anywhere in '
                'HEADWATER. The receipt does not establish a ledger gap or a Trial 0 scoring result.')
        sources = [HW / 'hypothesis_lab/runs/20261102_sro_sample/receipt.json', HW / 'scripts/insert_sro_into_sample.py']
        displays = ['w4e-april-runoff-receipt.png', 'w4e-april-runoff-source.json']
    elif topic == 'downscale':
        text = ('Frozen Trial 0 is a separate saved U-Net comparison, scored 7 September 2026. Its original scorecard uses '
                'standardized metrics over the 730-day test split. Global RMSE is 0.0852923433 versus 0.0869391907 for bilinear '
                'on T2M, 0.3117148441 versus 0.3410172119 on TP, and 0.0398471137 versus 0.0397473065 on MSL. '
                'T2M and TP improve; MSL does not. These dimensionless standardized RMSE values are not physical-unit rainfall or temperature totals.\n\n'
                'The existing TP and T2M maps illustrate the wet test day 19 April 2019. That one day is not the date range used '
                'for the aggregate scores. The comparison goes from 1° to 0.25°, in degrees, using the Trial 0 pack and checkpoint '
                'named in its scorecard. No supplied source establishes that any HEADWATER forecast was passed into Trial 0. '
                'This is not a demonstrated coupled forecasting/downscaling pipeline, and no new score was computed.')
        sources = [EX / 'Trial0_run_20260907_220510_scorecard_ext.json']
        displays = ['w4e-trial0-20190419-tp.png', 'w4e-trial0-20190419-t2m.png']
    elif topic == 'design':
        text = ('The still-open April item is the rain/mechanism shortfall in the ledger updated 26 October 2026: the frozen 9×9 '
                'wins 16–22 April, loses 2–8 April to that week’s own stored value, and rain remains near the stored week. '
                'The archived 18 October Proposer/Critic/Referee pack and its E1–E4 plan are present; they are not missing role evidence.\n\n'
                'E2/F1 is already completed in the 19 October score slice, at 2026-10-19T23:09:30Z. April 2019 issue-week persistence '
                'has valley temperature RMSE 3.0524 K versus det_v1 1.4440 K; April 2018 has 1.8997 K versus det_v1 4.23 K. '
                'The earlier Referee’s pending-F1 text is superseded by this later measurement. The 2 November board also records '
                'E_spring_score as scored/closed: 16–22 March and 2–8 May beat their stored weeks, while 2–8 April loses.\n\n'
                'A new test must therefore state a genuine change aimed at the remaining mechanism/rain problem and receive fresh '
                'review and human approval. Reading this archive does not perform that review or approve training. '
                'Do not repeat E1, E2/F1 or the spring score as though they were wholly unperformed.')
        sources = [ledger, HW / 'hypothesis_lab/runs/20261018_iter1_april/experiments.json',
                   HW / 'hypothesis_lab/runs/20261018_iter1_april/april_score_slice.json', HW / 'hypothesis_lab/board.json']
    elif topic in ('commands', 'board'):
        text = ('The supplied existing recipe is HEADWATER/lux/train_k9.sh, a Lux 9×9 training script. Its text is available for '
                'human review; it was not executed. This Lux recipe is not evidence of the exact command that produced the '
                'H100 det_v2_soil_k9 result. The exact original Trial 0 scorer command is absent from this package; '
                'checkpoint paths do not supply or justify reconstructing it.\n\n'
                'The original board dated 2 November contains historical true flags, including E_daily90.human_flag=true. '
                'The separate 12 November demonstration record says the H100 and Lux training flags are both off. '
                'These are distinct dated records, not live scheduler permissions. Before any future execution a person must '
                'review the exact host, inputs, command, dated brief and approval flag. No command or job is run by this readout.')
        sources = [HW / 'lux/train_k9.sh', HW / 'hypothesis_lab/board.json', actions]
        if topic == 'commands':
            displays = [readout_filename('lab.show_command', result['context'])]
    elif topic == 'purpose':
        text = ('Water4Energy workbench is the project workbench. HEADWATER development is the research workflow demonstrated first: '
                'hypothesis, data, a reviewed design, human-authorized execution and score back to the ledger. '
                'TVA 16–22 April 2019, issued 15 April 2019, is one selectable case; opening it changes its questions and evidence '
                'while the product remains Water4Energy workbench.\n\n'
                'This case reviews saved weather results, an observed ERA5 runoff receipt summary, and a separate frozen Trial 0 '
                'comparison from 1° to 0.25° in degrees. The sources do not establish a coupled HEADWATER-to-Trial-0 forecast run. '
                'The optional dam.readout skill is not installed, and no agreed reservoir or fill/hold rule is supplied. '
                'Those inputs are required before a dam readout; no threshold, reservoir choice or fill/hold recommendation is made.')
        sources = [actions, HW / 'docs/TVA_AGENT_DEMO_PLAN_20261102.md']
    else:
        text = ('The pinned literature catalog and download records describe source availability. This local replay performs no '
                'download, and catalog entries do not establish that paper PDFs or ERA5 arrays are present. '
                'Read the dated source records for their stated gaps; do not infer that absent files were downloaded or read.')
        sources = [HW / 'docs/literature/catalog.csv', HW / 'docs/literature/DOWNLOAD.md']
    return {'mode': 'deterministic saved-evidence readout; not a new scientific result',
            'topic': topic, 'verified_answer': text,
            'display_paths': ['/mnt/data/output/' + name for name in displays],
            'source_paths': [source_ref(path) for path in sources],
            'inspection_readout_path': '/mnt/data/output/' + readout_filename(task, result['context']),
            'must_not_infer': 'Use only this verified answer faithfully. Do not add mechanisms, targets, unlisted gap statuses, training histories, pipeline coupling, command reconstructions or operating rules. Reference paths are read-only citations, not displayable output files. Use display_file only on display_paths; do not echo Markdown image syntax.',
            'jobs_submitted': 0}

def run(task, out, context='tva'):
    out.mkdir(parents=True, exist_ok=True)
    research = stage_research(out, context)
    if context == 'headwater':
        write_bytes(out / 'w4e-v0140-headwater-history.md', history_markdown(headwater_story()).encode('utf-8'))
        write_bytes(out / 'w4e-v0140-headwater-history.csv', history_csv(headwater_story()).encode('utf-8'))
        write_json(out / 'w4e-v0140-headwater-history.json', headwater_story())
    if task == 'lab.realize':
        result = realization(out)
    elif task == 'downscale.scorecard':
        result = downscale(out)
    elif task == 'lab.ledger':
        ledger = load(HW / 'hypothesis_lab/experiment_ledger.json')
        result = {'snapshot_updated': ledger.get('updated'), 'source': provenance(HW / 'hypothesis_lab/experiment_ledger.json'),
            'rows': [{k: row[k] for k in ['id', 'status', 'hypothesis_status', 'blocks_reproposal', 'conclusion'] if k in row}
                     for row in ledger['runs']], 'open_gaps': ledger.get('open_gaps'), 'display_files': [research['ledger_file']]}
    elif task == 'lab.board':
        script = HW / 'hypothesis_lab/scripts/board.py'
        provenance(script)
        namespace = runpy.run_path(str(script), run_name='water4energy_read_only_board')
        result = {'source': provenance(HW / 'hypothesis_lab/board.json'),
            'board': namespace['render'](load(HW / 'hypothesis_lab/board.json'), show_all=True, root=HW),
            'snapshot_only': True, 'jobs_submitted': 0}
        result['demo_record'] = {'as_of': '2026-11-12',
            'source': provenance(SOURCES / 'water4energy_SC26Demo/Water4Energy_Workbench_Actions_20261112.md'),
            'H100_training_flag': False, 'Lux_training_flag': False,
            'rows': [
                {'item': 'April rain rank', 'where': 'Frontier', 'record': 'Reads the soil files. No GPU.'},
                {'item': 'Lux device check', 'where': 'Lux, one MI355X', 'record': 'Prints the device name. Does not train.'},
                {'item': 'Column water E_tcwv_9x9', 'where': 'Designed', 'record': 'Waits on the rank file and a person.'},
                {'item': '90-day daily filter', 'where': 'Designed', 'record': 'An odd temporal kernel cannot see all 90 days.'},
                {'item': 'Temporal attention along the 90 days', 'where': 'Not a row', 'record': 'No script and no board row.'},
            ], 'note': 'Supplied demo record; distinguish it from the older original board.json snapshot and from live scheduler status.'}
    elif task == 'lab.download' and context == 'headwater':
        source = HW / 'docs/FRONTIER_DATASET_AGENT.md'
        result = {'inventory_record_date': '2026-10-21', 'source': provenance(source),
                  'inventory_and_design_record': read(source),
                  'written_preparation_plan': read(HW / 'docs/DATA_PREP_PLAN_20261021.md'),
                  'scope': 'A committed, dated inventory; not live filesystem status or a new data-preparation run.',
                  'downloads_performed': 0, 'display_files': []}
    elif task in ('lab.literature', 'lab.download'):
        with (HW / 'docs/literature/catalog.csv').open(encoding='utf-8', newline='') as handle:
            catalog = list(csv.DictReader(handle))
        result = {'catalog': catalog, 'source': provenance(HW / 'docs/literature/catalog.csv'),
            'download_status_document': read(HW / 'docs/literature/DOWNLOAD.md'),
            'missing_pdf_document': read(HW / 'docs/literature/MISSING_PDFS.md'),
            'pdf_bytes_in_this_bundle': False, 'downloads_performed': 0,
            'note': 'Repository catalog/download records are not a claim that PDFs were copied into this local project.'}
    elif task == 'lab.design':
        folder = '20261106_second_model' if context == 'headwater' else '20261018_iter1_april'
        pack = HW / 'hypothesis_lab/runs' / folder
        result = {'source': provenance(pack / 'experiments.json'),
            'review_context': context, 'saved_review_folder': folder,
            'saved_protocol': load(pack / 'experiments.json'), 'protocol_source': provenance(pack / 'experiments.json'),
            'proposer': load(pack / 'hypotheses.json') if context == 'headwater' else read(out / research['proposal_file']),
            'critic': load(pack / 'critique.json'), 'referee': read(pack / 'referee_brief.md'),
            'scope': 'Latest checked-in review in the staged source set, not a new review or a claim that its model is currently selected.' if context == 'headwater' else 'Archived October review of the fixed April case, not current project status.',
            'mode': 'Read saved review; any newly drafted protocol is a proposal only. No human flag is changed.',
            'display_files': [research[key] for key in ['proposal_file', 'critic_file', 'referee_file', 'protocol_file']]}
    else:
        source = HW / 'lux/train_k9.sh'
        result = {'source': provenance(source), 'existing_command_file': read(source), 'executed': False,
            'trial0_command': None, 'missing': 'The exact original Trial 0 scoring command is not in this staged bundle; do not invent one.',
            'display_files': [readout_filename(task, context)]}
    result = {'answer_facts': answer_facts(task, context), **result}
    result['display_paths'] = ['/mnt/data/output/' + name for name in result.get('display_files', [])]
    result.update({'contract_id': task, 'case': CASE if context == 'tva' else None, 'context': context,
                   'mode': 'saved-file replay', 'jobs_submitted': 0,
                   'reader_version': '0.13.2' if context == 'tva' else '0.14.0'})
    write_json(out / readout_filename(task, context), result)
    return result

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--task', required=True, choices=TASKS)
    parser.add_argument('--output', type=Path, default=Path('/mnt/data/output'))
    parser.add_argument('--context', choices=['headwater', 'tva'], required=True)
    parser.add_argument('--question', choices=['ledger', 'weather', 'runoff', 'downscale', 'design', 'commands', 'board', 'literature', 'download', 'purpose', *HEADWATER_PROFILES])
    args = parser.parse_args()
    validate_requested_profile(args.task, args.context, args.question)
    result = run(args.task, args.output, args.context)
    print(json.dumps(compact_readout(result, args.question), indent=2, ensure_ascii=False))
