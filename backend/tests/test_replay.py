"""Saved-file replay invariants: source scope, provenance and stable displays."""
from pathlib import Path
import hashlib
import importlib.util
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
import zipfile

BACKEND = Path(__file__).resolve().parents[1]


def reader(folder):
    spec = importlib.util.spec_from_file_location('water4energy_replay_test', folder / 'scripts/replay.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def fingerprints(folder):
    return {p.name: (hashlib.sha256(p.read_bytes()).hexdigest(), p.stat().st_mtime_ns)
            for p in folder.iterdir() if p.is_file()}


class ReplayTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.out = Path(self.temporary.name) / 'output'
        self.out.mkdir()
        self.reader = reader(BACKEND / 'skills/lab-ledger')

    def tearDown(self):
        self.temporary.cleanup()

    def test_all_staged_evidence_keeps_bytes_and_mtime_after_its_own_readers(self):
        with zipfile.ZipFile(BACKEND / 'evidence.zip') as archive:
            archive.extractall(self.out)
        before = fingerprints(self.out)
        for task in self.reader.TASKS:
            name = task.replace('.', '-').replace('_', '-')
            reader(BACKEND / 'skills' / name).run(task, self.out, 'tva')
        after = fingerprints(self.out)
        self.assertEqual({name: after[name] for name in before}, before)
        self.assertTrue((self.out / 'w4e-v0132-lab-ledger-readout.json').exists())

    def test_second_replay_writes_nothing_for_identical_context(self):
        for task in self.reader.TASKS:
            self.reader.run(task, self.out, 'tva')
        before = fingerprints(self.out)
        for task in self.reader.TASKS:
            self.reader.run(task, self.out, 'tva')
        self.assertEqual(fingerprints(self.out), before)

    def test_headwater_replay_does_not_change_any_packaged_tva_evidence(self):
        with zipfile.ZipFile(BACKEND / 'evidence.zip') as archive:
            archive.extractall(self.out)
        before = fingerprints(self.out)
        for task in self.reader.TASKS:
            name = task.replace('.', '-').replace('_', '-')
            replay = reader(BACKEND / 'skills' / name)
            result = replay.run(task, self.out, 'headwater')
            if task in ('lab.realize', 'downscale.scorecard'):
                with self.assertRaisesRegex(ValueError, 'April weather/downscale'):
                    replay.compact_readout(result)
                inspection = replay.readout_filename(task, 'headwater')
                compact = {'display_paths': []}
            else:
                compact = replay.compact_readout(result)
                inspection = Path(compact['inspection_readout_path']).name
            self.assertTrue(inspection.startswith('w4e-v0140-headwater-'))
            self.assertTrue((self.out / inspection).is_file())
            self.assertTrue(all((self.out / Path(path).name).is_file() for path in compact['display_paths']))
        after = fingerprints(self.out)
        self.assertEqual({name: after[name] for name in before}, before)
        self.assertEqual(len(set(after) - set(before)), 17)
        for task in self.reader.TASKS:
            name = task.replace('.', '-').replace('_', '-')
            replay = reader(BACKEND / 'skills' / name)
            compact = replay.compact_readout(replay.run(task, self.out, 'tva'))
            self.assertTrue((self.out / Path(compact['inspection_readout_path']).name).is_file())
            self.assertTrue(all((self.out / Path(path).name).is_file() for path in compact['display_paths']))
        self.assertEqual({name: fingerprints(self.out)[name] for name in before}, before)

    def test_every_installed_reader_is_identical_and_runs_both_contexts(self):
        reference = (BACKEND / 'replay.py').read_bytes()
        for folder in sorted((BACKEND / 'skills').iterdir()):
            if not folder.is_dir():
                continue
            self.assertEqual((folder / 'scripts/replay.py').read_bytes(), reference)
        for context in ['tva', 'headwater']:
            for task in self.reader.TASKS:
                result = self.reader.run(task, self.out, context)
                self.assertEqual(result['context'], context)
                self.assertEqual(result['jobs_submitted'], 0)

    def test_metric_fields_keep_source_scope_and_weather_display_paths(self):
        ledger = self.reader.run('lab.ledger', self.out)['answer_facts']
        self.assertEqual(ledger['april_temperature']['valley_rmse_K'], .8282)
        self.assertEqual(ledger['separate_four_week_scores']['temperature_valley_rmse_K'], .7668)
        self.assertEqual(ledger['separate_four_week_scores']['precipitation_valley_rmse_m'], .0301)
        weather = self.reader.run('lab.realize', self.out)
        facts = weather['answer_facts']
        self.assertEqual(facts['weekly_accumulated_valley_precipitation_mm'],
                         {'observed': 55.9, 'stored_week': 24.4, 'residual_9x9': 24.7})
        self.assertEqual(facts['runoff']['weekly_accumulated_valley_mean_mm'], 7.364)
        self.assertFalse(facts['runoff']['forecast_available'])
        self.assertNotIn('Bilinear', facts['saved_weather_columns'])
        self.assertTrue(all(path.startswith('/mnt/data/output/') for path in weather['display_paths']))
        self.assertTrue(all(Path(path).name in fingerprints(self.out) for path in weather['display_paths']))
        self.assertTrue(all(source['path'].startswith('/mnt/skills/') for source in facts['sources']))

    def test_april_review_reports_later_f1_and_spring_completion(self):
        result = self.reader.run('lab.design', self.out, 'tva')['answer_facts']
        self.assertEqual(result['saved_review']['focus'], 'april_cold_week_mechanism')
        self.assertEqual(len(result['saved_review']['experiment_ids']), 4)
        self.assertEqual(result['saved_review']['roles_present'], ['Proposer', 'Critic', 'Referee'])
        self.assertEqual(result['later_F1_completion']['completed_at'], '2026-10-19T23:09:30Z')
        self.assertEqual(result['later_F1_completion']['april_2019_issue_week_valley_rmse_K'], 3.0524)
        self.assertEqual(result['later_spring_score']['state'], 'scored')
        self.assertTrue(result['later_spring_score']['family_closed'])
        self.assertEqual(result['current_april_gap']['status'], 'open_gap')

    def test_commands_and_dam_do_not_turn_missing_inputs_into_permissions(self):
        result = self.reader.run('lab.show_command', self.out)
        facts = result['answer_facts']
        self.assertFalse(result['executed'])
        self.assertIsNone(result['trial0_command'])
        self.assertTrue(facts['dated_flags']['original_E_daily90_human_flag'])
        self.assertFalse(facts['dated_flags']['demo_H100_training_flag'])
        self.assertFalse(facts['dated_flags']['demo_Lux_training_flag'])
        self.assertFalse(facts['dam_scope']['skill_installed'])
        self.assertIsNone(facts['dam_scope']['agreed_fill_hold_rule'])

    def test_tampered_frozen_chart_is_rejected(self):
        copied = Path(self.temporary.name) / 'lab-realize'
        shutil.copytree(BACKEND / 'skills/lab-realize', copied)
        chart = copied / 'assets/w4e-april-runoff-receipt.png'
        chart.write_bytes(b'changed image')
        replay = reader(copied)
        with self.assertRaisesRegex(ValueError, 'Frozen receipt chart'):
            replay.run('lab.realize', self.out)
        self.assertFalse((self.out / 'w4e-april-runoff-receipt.png').exists())

    def test_cli_returns_compact_reconciled_design_not_obsolete_raw_review(self):
        command = [sys.executable, str(BACKEND / 'skills/lab-design/scripts/replay.py'),
                   '--task', 'lab.design', '--context', 'tva', '--question', 'design', '--output', str(self.out)]
        result = json.loads(subprocess.check_output(command, text=True))
        self.assertIn('E2/F1 is already completed', result['verified_answer'])
        self.assertIn('E_spring_score as scored/closed', result['verified_answer'])
        self.assertNotIn('referee', result)
        self.assertNotIn('saved_protocol', result)
        self.assertNotIn('answer_facts', result)
        self.assertEqual(result['display_paths'], [])
        self.assertLess(len(json.dumps(result)), 7000)
        self.assertTrue((self.out / Path(result['inspection_readout_path']).name).is_file())

    def test_runoff_and_purpose_selectors_do_not_emit_unrelated_score_tables(self):
        weather = self.reader.run('lab.realize', self.out)
        runoff = self.reader.compact_readout(weather, 'runoff')
        self.assertEqual([Path(p).name for p in runoff['display_paths']],
                         ['w4e-april-runoff-receipt.png', 'w4e-april-runoff-source.json'])
        self.assertNotIn('55.9', runoff['verified_answer'])
        purpose = self.reader.compact_readout(self.reader.run('lab.ledger', self.out), 'purpose')
        self.assertIn('one selectable case', purpose['verified_answer'])
        self.assertIn('1° to 0.25° in degrees', purpose['verified_answer'])
        self.assertNotIn('0.0301', purpose['verified_answer'])

    def test_approved_april_narratives_are_byte_identical(self):
        expected = json.loads((BACKEND / 'tests/tva-narrative-sha256.json').read_text())
        profiles = {'ledger': 'lab.ledger', 'weather': 'lab.realize', 'runoff': 'lab.realize',
                    'downscale': 'downscale.scorecard', 'design': 'lab.design',
                    'commands': 'lab.show_command', 'purpose': 'lab.ledger'}
        for question, task in profiles.items():
            text = self.reader.compact_readout(self.reader.run(task, self.out, 'tva'), question)['verified_answer']
            self.assertEqual(hashlib.sha256(text.encode()).hexdigest(), expected[question])

    def test_headwater_profiles_require_matching_context_and_task(self):
        for question, task in self.reader.HEADWATER_PROFILES.items():
            self.assertEqual(self.reader.validate_requested_profile(task, 'headwater', question), question)
            with self.assertRaisesRegex(ValueError, 'requires --context headwater'):
                self.reader.validate_requested_profile(task, 'tva', question)
        with self.assertRaisesRegex(ValueError, 'matching HEADWATER'):
            self.reader.validate_requested_profile('lab.ledger', 'headwater', 'headwater-brief')
        with self.assertRaisesRegex(ValueError, 'matching HEADWATER'):
            self.reader.validate_requested_profile('lab.design', 'headwater', 'design')
        command = [sys.executable, str(BACKEND / 'skills/lab-ledger/scripts/replay.py'),
                   '--task', 'lab.ledger', '--context', 'tva', '--question', 'headwater-ledger', '--output', str(self.out)]
        result = subprocess.run(command, capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(list(self.out.iterdir()), [])

    def test_headwater_artifacts_are_all_from_the_november_review(self):
        replay = reader(BACKEND / 'skills/lab-design')
        result = replay.run('lab.design', self.out, 'headwater')
        self.assertEqual(result['saved_review_folder'], '20261106_second_model')
        self.assertIsNone(result['case'])
        self.assertEqual(result['reader_version'], '0.14.0')
        pack = BACKEND / 'sources/HEADWATER/hypothesis_lab/runs/20261106_second_model'
        expected = {'w4e-v0140-headwater-proposer.json': 'hypotheses.json',
                    'w4e-v0140-headwater-critic.json': 'critique.json',
                    'w4e-v0140-headwater-referee.md': 'referee_brief.md',
                    'w4e-v0140-headwater-experiments.json': 'experiments.json'}
        self.assertEqual(set(result['display_files']), set(expected))
        for output, original in expected.items():
            self.assertEqual((self.out / output).read_bytes(), (pack / original).read_bytes())
        self.assertEqual(result['saved_protocol'], json.loads((pack / 'experiments.json').read_text()))

    def test_headwater_answers_keep_selection_dates_flags_and_score_scopes(self):
        values = {}
        for question, task in self.reader.HEADWATER_PROFILES.items():
            replay = reader(BACKEND / 'skills' / task.replace('.', '-').replace('_', '-'))
            values[question] = replay.compact_readout(replay.run(task, self.out, 'headwater'), question)
            self.assertEqual(values[question]['context'], 'headwater')
            self.assertTrue(values[question]['source_citations'])
            self.assertTrue(all(c['url'].startswith('https://github.com/daliwang/') for c in values[question]['source_citations']))
        self.assertIn('do not establish one selected current brief', values['headwater-brief']['verified_answer'])
        self.assertIn('January 2010 training and January 2018 validation', values['headwater-data']['verified_answer'])
        self.assertIn('not check Frontier live', values['headwater-data']['verified_answer'])
        self.assertIn('already scored', values['headwater-board']['verified_answer'])
        self.assertIn('both off', values['headwater-board']['verified_answer'])
        self.assertIn('0.77 degrees Celsius', values['headwater-score']['verified_answer'])
        self.assertIn('0.86 degrees Celsius', values['headwater-score']['verified_answer'])
        self.assertIn('the 1979–2017 week already in the example files', values['headwater-score']['verified_answer'])
        self.assertIn('not the score for the April week alone', values['headwater-score']['verified_answer'])
        self.assertIn('H100 / CCSI', values['headwater-score']['verified_answer'])

    def test_history_export_uses_record_dates_and_source_links(self):
        result = self.reader.run('lab.ledger', self.out, 'headwater')
        compact = self.reader.compact_readout(result, 'headwater-history')
        self.assertEqual(compact['display_paths'], ['/mnt/data/output/w4e-v0140-headwater-history.csv'])
        self.assertNotIn('| Record date |', compact['verified_answer'])
        story = json.loads((self.out / 'w4e-v0140-headwater-history.json').read_text())
        self.assertIn('not job submission', story['date_note'])
        self.assertEqual([r['date'] for r in story['history']], ['2026-10-21', '2026-10-26', '2026-11-06', '2026-11-12'])
        self.assertTrue(all(r['sources'] for r in story['history']))
        csv_text = (self.out / 'w4e-v0140-headwater-history.csv').read_text()
        self.assertIn('record_date,documented_record,meaning,next_decision,source_urls', csv_text)
        self.assertIn('https://github.com/daliwang/', csv_text)


if __name__ == '__main__':
    unittest.main()
