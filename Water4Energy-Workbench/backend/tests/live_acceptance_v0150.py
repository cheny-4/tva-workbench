"""Explicit, sequential live acceptance; prepare never calls a live API.

Artifacts stay in a separately supplied output directory, never in this package.
There are no automatic retries. A further attempt requires --attempt N explicitly.
"""
from pathlib import Path
import argparse
import datetime
import hashlib
import importlib.util
import json
import re
import subprocess
import tempfile
import time
import urllib.parse
import urllib.request

REPO = Path(__file__).resolve().parents[2]
NODE = '/Applications/VISTA/node/bin/node'
PROJECT = 'Water4Energy-TVA-agent-loop'
PREFIX = '/api/vista/projects/' + PROJECT
GROUPS = ('lab24', 'headwater', 'tva')


def save(path, value):
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')


def digest(data):
    return hashlib.sha256(data).hexdigest()


def questions():
    code = r"""
const fs=require('node:fs'),path=require('node:path'),root=process.argv[1];
const load=file=>require(path.join(root,'public',file));
const lab=load('lab24.js'),hw=load('headwater-workflow.js'),tva=load('case-journey.js');
const settings={guide:load('hypothesis-guide.js'),caseDefinition:load('data/demo-case.json'),prompts:load('data/prompts.json').prompts};
const rows=[];
for(const item of lab.questions){const p=lab.PROFILES[item.id];rows.push({context:'lab24',id:item.id,reader:p.reader,profile:p.question,prompt:lab.questionRequest(item.id)});}
for(const id of [...hw.questions.map(q=>q.id),'history','downscale']){const p=id==='history'?{reader:'lab.ledger',question:'headwater-history'}:hw.ANSWER_PROFILES[id];rows.push({context:'headwater',id,reader:p.reader,profile:p.question,prompt:hw.questionRequest(id)});}
for(const item of tva.questions){const prompt=tva.questionRequest(item.id,settings);const reader=prompt.match(/Use only the ([a-z._]+) saved-evidence reader/)[1];const profile=prompt.match(/\(--question ([a-z-]+)\)/)[1];rows.push({context:'tva',id:item.id,reader,profile,prompt});}
if(rows.length!==19||rows.some(r=>!r.prompt))throw new Error('Expected nineteen exact guided requests');
process.stdout.write(JSON.stringify(rows));
"""
    values = json.loads(subprocess.check_output([NODE, '-e', code, str(REPO)], text=True))
    for row in values:
        row['question'] = row['prompt'].split('\n', 1)[0]
        row['prompt_sha256'] = digest(row['prompt'].encode())
    return values


def module_for(task):
    folder = task.replace('.', '-').replace('_', '-')
    path = REPO / 'backend/skills' / folder / 'scripts/replay.py'
    spec = importlib.util.spec_from_file_location('acceptance_' + folder.replace('-', '_'), path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def expected(row):
    module = module_for(row['reader'])
    module.validate_requested_profile(row['reader'], row['context'], row['profile'])
    with tempfile.TemporaryDirectory(prefix='w4e-v0150-expected-') as temporary:
        out = Path(temporary)
        result = module.run(row['reader'], out, row['context'])
        compact = module.compact_readout(result, row['profile'])
        auxiliary = compact.get('source_json_path')
        return {'readout': compact, 'verified_answer_sha256': digest(compact['verified_answer'].encode()),
                'display_sha256': {path: digest((out / Path(path).name).read_bytes()) for path in compact['display_paths']},
                'source_json_sha256': {auxiliary: digest((out / Path(auxiliary).name).read_bytes())} if auxiliary else {}}


def prepare(output_root, groups):
    rows = questions()
    if output_root is None:
        print(json.dumps({'mode': 'prepare-only; no live requests', 'count': len(rows),
                          'questions': [{key: row[key] for key in ('context', 'id', 'reader', 'profile', 'prompt_sha256')}
                                        for row in rows]}, indent=2))
        return
    paths = [output_root / ('demo-acceptance-v0150-' + group) for group in groups]
    if any(path.exists() for path in paths):
        raise FileExistsError('Refusing to overwrite an existing acceptance directory.')
    for group, path in zip(groups, paths):
        path.mkdir(parents=True, exist_ok=False)
        selected = [row for row in rows if row['context'] == group]
        save(path / 'questions.json', selected)
        save(path / 'preparation.json', {'version': '0.15.0', 'project': PROJECT, 'live_requests_performed': 0,
             'prepared_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
             'ui_source_sha256': {name: digest((REPO / 'public' / name).read_bytes()) for name in
                 ('lab24.js', 'headwater-workflow.js', 'case-journey.js', 'hypothesis-guide.js', 'data/prompts.json')}})
        for number, row in enumerate(selected, 1):
            case = path / (f'{number:02d}-' + row['id'])
            case.mkdir()
            save(case / 'question.json', row)
            save(case / 'expected.json', expected(row))
        print(f'PREPARED {group}: {len(selected)} exact UI requests at {path}', flush=True)


def parse_args(value):
    if isinstance(value, str):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return {'unparsed': value}
    return value if isinstance(value, dict) else {}


def display_argument(part):
    args = parse_args(part.get('args'))
    return args.get('path', args.get('uri'))


def normalized_quote(text):
    # Accept typographic hyphens/spacing and quote formatting, never omitted prose.
    value = re.sub(r'^\s*> ?', '', text, flags=re.M).replace('**', '')
    value = value.translate(str.maketrans({char: '-' for char in '\u2010\u2011\u2012\u2013\u2014\u2015'}))
    return re.sub(r'\s+', ' ', value).strip()


def session_parts(session, kind):
    return [part for message in session.get('message_history', []) for part in message.get('parts', [])
            if part.get('part_kind') == kind]


def reader_payloads(returns):
    values = []
    for part in returns:
        if part.get('tool_name', '').split('.')[-1] != 'run_bash':
            continue
        value = part.get('content')
        try:
            if isinstance(value, str):
                value = json.loads(value)
            if isinstance(value, dict) and isinstance(value.get('stdout'), str):
                value = json.loads(value['stdout'])
        except json.JSONDecodeError:
            values.append({'tool_call_id': part.get('tool_call_id'), 'parse_error': 'Reader return was not JSON', 'content': part.get('content')})
            continue
        values.append({'tool_call_id': part.get('tool_call_id'), 'outcome': part.get('outcome'), 'payload': value})
    return values


def refresh_expectations(output_root, groups, attempt, ids):
    if attempt < 2:
        raise ValueError('Revised expectations require an explicitly numbered later attempt.')
    current = {(r['context'], r['id']): r for r in questions()}
    for group in groups:
        directory = output_root / ('demo-acceptance-v0150-' + group)
        rows = json.loads((directory / 'questions.json').read_text())
        for number, row in enumerate(rows, 1):
            if ids and row['id'] not in ids:
                continue
            revised = current[(group, row['id'])]
            if any(row[key] != revised[key] for key in ('context', 'id', 'reader', 'profile')):
                raise ValueError('UI reader mapping changed; use a fresh acceptance directory.')
            case = directory / (f'{number:02d}-' + row['id'])
            path = case / f'expected-attempt-{attempt:02d}.json'
            if path.exists():
                raise FileExistsError('Refusing to overwrite revised expected readouts.')
            question_path = case / f'question-attempt-{attempt:02d}.json'
            if question_path.exists():
                raise FileExistsError('Refusing to overwrite a revised guided request.')
            save(question_path, revised)
            save(path, expected(revised))
            print(f'REFRESHED EXPECTATION {group}/{row["id"]} for explicit attempt {attempt}', flush=True)


def assess(row, expectation, session, displayed, downloads):
    parts = session_parts(session, 'text')
    answer = '\n\n'.join(p.get('content', '') for p in parts)
    calls = session_parts(session, 'tool-call')
    returns = session_parts(session, 'tool-return')
    requested = expectation['readout']['display_paths']
    display_calls = [parse_args(p.get('args')) for p in calls if p.get('tool_name', '').split('.')[-1] == 'display_file']
    successful = {p['tool_call_id'] for p in returns if p.get('tool_name', '').split('.')[-1] == 'display_file' and p.get('outcome') == 'success'}
    displayed_names = {p.get('path', p.get('name')) for p in displayed} if isinstance(displayed, list) else set()
    display_check = {}
    for path in requested:
        ids = {p.get('tool_call_id') for p in calls if p.get('tool_name', '').split('.')[-1] == 'display_file'
               and display_argument(p) == path}
        display_check[path] = {'called': bool(ids), 'tool_return_success': bool(ids & successful),
            'receipt_present': Path(path).name in displayed_names or path in displayed_names,
            'download_sha_matches': downloads.get(path, {}).get('sha256') == expectation['display_sha256'][path]}
    commands = [parse_args(p.get('args')).get('command', '') for p in calls
                if p.get('tool_name', '').split('.')[-1] == 'run_bash']
    readers = [cmd for cmd in commands if re.search(
        r'(?:^|\s)(?:python(?:3(?:\.\d+)?)?|/[^\s]+/python(?:3(?:\.\d+)?)?)\s+[^\s]*/scripts/replay\.py(?:\s|$)', cmd)]
    matching = [cmd for cmd in readers if all(token in cmd for token in
                ('--task ' + row['reader'], '--context ' + row['context'], '--question ' + row['profile']))]
    reader_json = reader_payloads(returns)
    reader_answer = any(isinstance(item.get('payload'), dict)
                        and item['payload'].get('verified_answer') == expectation['readout']['verified_answer']
                        and item['payload'].get('display_paths') == requested
                        and all(item['payload'].get(key) == expectation['readout'].get(key)
                                for key in ('source_json_path', 'source_json_sha256')) for item in reader_json)
    source_json_check = {path: {'download_sha_matches': downloads.get(path, {}).get('sha256') == sha,
                               'contract_sha_matches': expectation['readout'].get('source_json_sha256') == sha}
                         for path, sha in expectation.get('source_json_sha256', {}).items()}
    exact = expectation['readout']['verified_answer'] in answer
    normalized = normalized_quote(expectation['readout']['verified_answer']) in normalized_quote(answer)
    # A visible protocol failure is recorded as a failed attempt, never retried.
    malformed = answer.strip().startswith('<|start|>assistant') and not calls
    ok = bool(matching) and len(matching) == len(readers) and reader_answer and normalized and not malformed
    ok = ok and all(all(value.values()) for value in display_check.values())
    ok = ok and all(all(value.values()) for value in source_json_check.values())
    return {'passed': ok, 'exact_verified_answer_present': exact, 'malformed_unexecuted_protocol': malformed,
            'complete_verified_answer_after_typography_normalization': normalized,
            'reader_json_matches_expected_answer_and_displays': reader_answer,
            'matching_reader_calls': len(matching), 'reader_calls': readers,
            'actual_tool_calls': len(calls), 'display_calls': display_calls, 'display_check': display_check,
            'source_json_check': source_json_check,
            'answer_characters': len(answer)}, answer, calls, returns


def run(output_root, group, base, attempt, ids):
    directory = output_root / ('demo-acceptance-v0150-' + group)
    rows = json.loads((directory / 'questions.json').read_text())
    current = {(r['context'], r['id']): r for r in questions()}
    for number, row in enumerate(rows, 1):
        if ids and row['id'] not in ids:
            continue
        if attempt > 1:
            row = json.loads((directory / (f'{number:02d}-' + row['id']) /
                              f'question-attempt-{attempt:02d}.json').read_text())
            rows[number - 1] = row
        if row != current[(group, row['id'])]:
            raise ValueError('UI request changed after preparation; prepare a separate fresh directory.')
    if ids and not set(ids).issubset({row['id'] for row in rows}):
        raise ValueError('Unknown question id.')

    def request(path, value=None, method='GET', timeout=30):
        body = None if value is None else json.dumps(value).encode()
        return urllib.request.urlopen(urllib.request.Request(base + path, data=body, method=method,
            headers={'Content-Type': 'application/json', 'Origin': base}), timeout=timeout)

    def get(path):
        with request(path) as response:
            return json.load(response)

    health, config = get('/api/health'), get('/api/config')
    if health['version'] != '0.15.0' or config['project'] != PROJECT:
        raise ValueError('Expected the v0.15.0 wrapper and the authorized demonstration project.')
    for number, row in enumerate(rows, 1):
        if ids and row['id'] not in ids:
            continue
        case = directory / (f'{number:02d}-' + row['id'])
        target = case / f'attempt-{attempt:02d}'
        target.mkdir(exist_ok=False)
        expectation_path = case / ('expected.json' if attempt == 1 else f'expected-attempt-{attempt:02d}.json')
        expected_value = json.loads(expectation_path.read_text())
        save(target / 'health.json', health)
        save(target / 'config.json', config)
        with request(PREFIX + '/chat-sessions', {'title': f'v0.15.0 {group} acceptance · {row["id"]} · attempt {attempt}'}, 'POST') as response:
            session = json.load(response)
        sid = session['id']
        save(target / 'session-created.json', session)
        payload = {'user_prompt': row['prompt'], 'stream': True, 'chat_session_id': sid}
        save(target / 'request.json', payload)
        started = time.monotonic()
        record = {'context': group, 'id': row['id'], 'session_id': sid, 'attempt': attempt,
                  'state': 'running', 'started_utc': datetime.datetime.now(datetime.timezone.utc).isoformat()}
        save(target / 'status.json', record)
        print(f'START {group}/{row["id"]} attempt={attempt} session={sid}', flush=True)
        events = []
        try:
            with (target / 'stream.sse').open('wb') as raw_file, (target / 'events.jsonl').open('w') as journal:
                def event(block):
                    data = '\n'.join(line[5:].lstrip() for line in block if line.startswith('data:'))
                    if not data:
                        return
                    try:
                        value = json.loads(data)
                    except json.JSONDecodeError:
                        value = {'unparsed_sse_data': data}
                    kind = next((line[6:].strip() for line in block if line.startswith('event:')), 'message')
                    item = {'event': value.get('event_kind', kind) if isinstance(value, dict) else kind, 'data': value}
                    events.append(item)
                    journal.write(json.dumps(item, ensure_ascii=False) + '\n')
                    journal.flush()
                    if item['event'] == 'run_finished':
                        record['state'] = value.get('state', 'finished')
                with request(PREFIX + '/agent/run', payload, 'POST', timeout=180) as response:
                    block = []
                    for raw in response:
                        raw_file.write(raw)
                        raw_file.flush()
                        line = raw.decode('utf-8').rstrip('\r\n')
                        if line:
                            block.append(line)
                        elif block:
                            event(block)
                            block = []
                        if time.monotonic() - started > 600:
                            with request(PREFIX + f'/chat-sessions/{sid}/run/stop', {}, 'POST'):
                                pass
                            raise TimeoutError('Stopped this acceptance turn after ten minutes.')
                    if block:
                        event(block)
            if record['state'] == 'running':
                record['state'] = 'stream-ended-without-finish'
        except Exception as error:
            record.update(state='client-error', error=f'{type(error).__name__}: {error}')
            try:
                with request(PREFIX + f'/chat-sessions/{sid}/run/stop', {}, 'POST') as response:
                    save(target / 'stop-receipt.json', json.load(response))
                record['own_turn_stopped_after_client_error'] = True
            except Exception as stop_error:
                record['stop_error'] = f'{type(stop_error).__name__}: {stop_error}'
        finally:
            save(target / 'events.json', events)
        session = get(PREFIX + '/chat-session?chat_session_id=' + urllib.parse.quote(sid))
        displayed = get(PREFIX + f'/chat-sessions/{sid}/displayed-files')
        save(target / 'session.json', session)
        save(target / 'displayed-files.json', displayed)
        downloads = {}
        (target / 'displayed-output').mkdir()
        paths = list(dict.fromkeys(expected_value['readout']['display_paths'] + list(expected_value.get('source_json_sha256', {}))))
        for path in paths:
            try:
                with request(PREFIX + '/outputs/' + urllib.parse.quote(Path(path).name)) as response:
                    data = response.read()
                (target / 'displayed-output' / Path(path).name).write_bytes(data)
                downloads[path] = {'sha256': digest(data), 'bytes': len(data)}
            except Exception as error:
                downloads[path] = {'error': f'{type(error).__name__}: {error}'}
        save(target / 'download-receipts.json', downloads)
        grade, answer, calls, returns = assess(row, expected_value, session, displayed, downloads)
        (target / 'answer.txt').write_text(answer, encoding='utf-8')
        save(target / 'tool-calls.json', calls)
        save(target / 'tool-results.json', returns)
        save(target / 'reader-results.json', reader_payloads(returns))
        save(target / 'assessment.json', grade)
        record.update(elapsed_seconds=round(time.monotonic() - started, 1), **grade)
        save(target / 'status.json', record)
        print('DONE ' + json.dumps(record, ensure_ascii=False), flush=True)
        if record.get('stop_error'):
            raise RuntimeError('Could not confirm this failed turn stopped; refusing to start another acceptance turn.')


def audit(output_root, groups):
    """Re-evaluate recorded sessions only; never call an API or retry a turn."""
    for group in groups:
        directory = output_root / ('demo-acceptance-v0150-' + group)
        rows = json.loads((directory / 'questions.json').read_text())
        for number, row in enumerate(rows, 1):
            case = directory / (f'{number:02d}-' + row['id'])
            for target in sorted(case.glob('attempt-*')):
                if not (target / 'download-receipts.json').is_file():
                    continue
                values = [json.loads((target / name).read_text()) for name in
                          ('session.json', 'displayed-files.json', 'download-receipts.json')]
                number = int(target.name.split('-')[-1])
                path = case / ('expected.json' if number == 1 else f'expected-attempt-{number:02d}.json')
                expectation = json.loads(path.read_text())
                attempt_row = row if number == 1 else json.loads((case / f'question-attempt-{number:02d}.json').read_text())
                grade = assess(attempt_row, expectation, *values)[0]
                initial = target / 'assessment.initial.json'
                if not initial.exists():
                    initial.write_bytes((target / 'assessment.json').read_bytes())
                save(target / 'assessment.json', grade)
                print(f'AUDIT {group}/{row["id"]}/{target.name} ' + json.dumps(grade, ensure_ascii=False), flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['prepare', 'run', 'audit', 'refresh'])
    parser.add_argument('--output-root', type=Path)
    parser.add_argument('--group', choices=[*GROUPS, 'all'], default='all')
    parser.add_argument('--base', default='http://127.0.0.1:8788')
    parser.add_argument('--attempt', type=int, default=1)
    parser.add_argument('--ids', nargs='*')
    parser.add_argument('--live-authorized', action='store_true')
    args = parser.parse_args()
    if args.mode == 'prepare':
        prepare(args.output_root, GROUPS if args.group == 'all' else (args.group,))
    elif args.mode == 'refresh':
        if not args.output_root:
            parser.error('Refresh requires --output-root and an explicit later --attempt.')
        refresh_expectations(args.output_root, GROUPS if args.group == 'all' else (args.group,), args.attempt, args.ids)
    elif args.mode == 'audit':
        if not args.output_root:
            parser.error('Audit requires --output-root.')
        audit(args.output_root, GROUPS if args.group == 'all' else (args.group,))
    else:
        if not args.live_authorized or not args.output_root or args.group == 'all' or args.attempt < 1:
            parser.error('Run requires --live-authorized, --output-root, one --group, and a positive explicit attempt number.')
        run(args.output_root, args.group, args.base, args.attempt, args.ids)


if __name__ == '__main__':
    main()
