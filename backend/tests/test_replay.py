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
            compact = replay.compact_readout(result)
            inspection = Path(compact['inspection_readout_path']).name
            self.assertTrue(inspection.startswith('w4e-v0132-headwater-'))
            self.assertTrue((self.out / inspection).is_file())
            self.assertTrue(all((self.out / Path(path).name).is_file() for path in compact['display_paths']))
        after = fingerprints(self.out)
        self.assertEqual({name: after[name] for name in before}, before)
        self.assertEqual(len(set(after) - set(before)), 8)
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


if __name__ == '__main__':
    unittest.main()
