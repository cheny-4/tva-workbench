#!/usr/bin/env python3
"""Show the parallel experiment board.

This command reads hypothesis_lab/board.json. It does not launch, copy,
submit, or train. A score file is read only when it is already in this
checkout.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BOARD = ROOT / "hypothesis_lab" / "board.json"
STATES = {"designed", "data", "ready", "running", "scored", "killed"}
KINDS = {"read", "data", "train", "score"}
OPEN = {"designed", "data", "ready", "running"}


def load_board(path: Path = BOARD) -> dict:
    return json.loads(path.read_text())


def validate(board: dict) -> list[str]:
    errors: list[str] = []
    hosts = board.get("hosts")
    rows = board.get("rows")
    if not isinstance(hosts, list) or not isinstance(rows, list):
        return ["board needs hosts and rows"]
    host_ids = []
    slots: dict[str, int] = {}
    for host in hosts:
        hid = host.get("id")
        if not isinstance(hid, str) or hid in slots:
            errors.append(f"bad host id {hid!r}")
            continue
        host_ids.append(hid)
        count = host.get("slots")
        if not isinstance(count, int) or count < 0:
            errors.append(f"{hid} slots must be a non-negative integer")
            count = 0
        slots[hid] = count
    seen: set[str] = set()
    running: dict[str, int] = {hid: 0 for hid in host_ids}
    for row in rows:
        rid = row.get("id")
        if not isinstance(rid, str) or rid in seen:
            errors.append(f"bad or repeated row id {rid!r}")
            continue
        seen.add(rid)
        if row.get("state") not in STATES:
            errors.append(f"{rid} has a bad state")
        if row.get("kind") not in KINDS:
            errors.append(f"{rid} has a bad kind")
        host = row.get("host")
        if host not in slots:
            errors.append(f"{rid} names an unknown host {host!r}")
        elif row.get("state") == "running":
            running[host] = running.get(host, 0) + 1
        if row.get("state") == "running" and row.get("human_flag") is not True:
            errors.append(f"{rid} is running without a human flag")
        if not isinstance(row.get("blocked_by"), list):
            errors.append(f"{rid} blocked_by must be a list")
    for row in rows:
        for dep in row.get("blocked_by") or []:
            if dep not in seen:
                errors.append(f"{row.get('id')} is blocked by an unknown row {dep}")
    for hid, used in running.items():
        if used > slots.get(hid, 0):
            errors.append(f"{hid} has {used} running rows and {slots[hid]} slots")
    return errors


def _week(score: dict, issue: str, key: str) -> float | None:
    weeks = score.get("weeks")
    if not isinstance(weeks, dict):
        return None
    week = weeks.get(issue)
    if not isinstance(week, dict) or key not in week:
        return None
    value = week[key]
    return float(value) if isinstance(value, (int, float)) else None


def evaluate_file(row: dict, root: Path = ROOT) -> str:
    rel = row.get("score") or ""
    if not rel:
        return "no score path"
    path = root / rel
    if not path.is_file():
        return "score not in this checkout"
    payload = json.loads(path.read_text())
    if isinstance(payload, list):
        return f"{rel} is the raw heldout list"
    if not isinstance(payload, dict):
        return f"{rel} has no heldout_2019 object"
    score = payload.get("heldout_2019", {})
    if not isinstance(score, dict):
        return f"{rel} has no heldout_2019 object"
    lines = [f"score file {rel}"]
    mean = score.get("temperature_valley_rmse_mean")
    bar = row.get("bar") or {}
    if isinstance(mean, (int, float)):
        lines.append(f"valley mean {mean:.4f} K")
        cap = bar.get("temperature_valley_rmse_mean_max")
        if isinstance(cap, (int, float)):
            lines.append("mean bar met" if mean <= cap else "mean bar missed")
    july = _week(score, "2019-07-15", "temperature_valley_rmse")
    cap = bar.get("july_valley_max")
    if july is not None and isinstance(cap, (int, float)):
        lines.append("July bar met" if july <= cap else "July bar missed")
    april = _week(score, "2019-04-15", "precip_valley_rmse")
    cap = bar.get("april_precip_valley_max")
    if april is not None and isinstance(cap, (int, float)):
        lines.append("April rain bar met" if april < cap else "April rain bar missed")
    if len(lines) == 1:
        lines.append("heldout_2019 did not include a comparable valley number")
    return "; ".join(lines)


def render(board: dict, *, show_all: bool = False, evaluate: bool = False, root: Path = ROOT) -> str:
    errors = validate(board)
    if errors:
        raise ValueError("\n".join(errors))
    hosts = {host["id"]: host for host in board["hosts"]}
    running = {hid: 0 for hid in hosts}
    for row in board["rows"]:
        if row["state"] == "running":
            running[row["host"]] += 1
    lines = [
        f"HEADWATER board  {board.get('updated', '')}",
        "This command does not launch, copy, submit, or train.",
        "",
        "Hosts",
    ]
    for host in board["hosts"]:
        hid = host["id"]
        free = host["slots"] - running[hid]
        lines.append(
            f"  {hid:<10} {host['where']:<32} slots {host['slots']:<2} running {running[hid]:<2} free {free}"
        )
        lines.append(f"             {host['note']}")
    champ = board.get("champion") or {}
    if champ:
        lines.extend(
            [
                "",
                "Champion",
                f"  {champ['id']}  valley mean {champ['valley_temperature_mean']} K"
                f"  historical week {champ['historical_week_mean']} K"
                f"  July {champ['july_valley']} K against {champ['july_historical']} K",
            ]
        )
    lines.extend(["", "Open"])
    open_rows = [row for row in board["rows"] if row["state"] in OPEN]
    if not open_rows:
        lines.append("  none")
    for row in open_rows:
        flag = "flag on" if row["human_flag"] else "flag off"
        deps = ", ".join(row["blocked_by"]) if row["blocked_by"] else "nothing"
        lines.append(f"  {row['id']:<18} {row['state']:<10} {row['host']:<10} {row['kind']:<6} {flag}")
        lines.append(f"    blocked by {deps}")
        lines.append(f"    next: {row['next']}")
        if evaluate:
            lines.append(f"    evaluate: {evaluate_file(row, root)}")
    if show_all:
        lines.extend(["", "Scored or killed"])
        for row in board["rows"]:
            if row["state"] in OPEN:
                continue
            lines.append(f"  {row['id']:<18} {row['state']:<8} {row.get('verdict', '')}")
            if evaluate:
                lines.append(f"    evaluate: {evaluate_file(row, root)}")
    else:
        closed = sum(1 for row in board["rows"] if row["state"] not in OPEN)
        lines.extend(["", f"Closed rows: {closed}. Add --all to list them."])
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Show the HEADWATER parallel board.")
    parser.add_argument("--all", action="store_true", help="include scored and killed rows")
    parser.add_argument("--evaluate", action="store_true", help="read score files that are already in this checkout")
    parser.add_argument("--board", type=Path, default=BOARD)
    args = parser.parse_args(argv)
    try:
        text = render(load_board(args.board), show_all=args.all, evaluate=args.evaluate, root=args.board.parents[1])
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        print(exc, file=sys.stderr)
        return 1
    print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
