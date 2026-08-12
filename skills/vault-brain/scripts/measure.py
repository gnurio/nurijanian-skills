#!/usr/bin/env python3
"""Measure whether concept links actually resolve, reading only the filesystem.

Deliberately shares no code with materialize.py: it rebuilds Obsidian's resolution
universe from the vault on disk, so the number does not depend on the tool that
produced the library.

    python3 measure.py "<vault>"
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

LIBRARY = "_brain"
SKIP_PREFIXES = ("04 ARCHIVE",)
SKIP_MARKERS = ("BACKUP", "_archive")


def live_folders(vault: Path):
    for compiled in sorted(vault.rglob("_compiled")):
        if not compiled.is_dir():
            continue
        folder = compiled.parent.relative_to(vault).as_posix()
        if folder.startswith(SKIP_PREFIXES) or any(m in folder for m in SKIP_MARKERS):
            continue
        yield folder, compiled


def related_targets(body: str) -> list[str]:
    m = re.search(r"\*\*Related concepts[^:]*:?\*\*:?\s*(.+)", body)
    return [t.strip() for t in re.findall(r"\[\[([^\]|]+)", m.group(1))] if m else []


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    vault = Path(sys.argv[1]).expanduser().resolve()
    if not vault.is_dir():
        print(f"not a directory: {vault}")
        return 2

    md = list(vault.rglob("*.md"))
    library = [p for p in md if LIBRARY in p.relative_to(vault).parts]
    outside = [p for p in md if LIBRARY not in p.relative_to(vault).parts]

    stems = {p.stem for p in md}
    paths = {p.relative_to(vault).with_suffix("").as_posix() for p in md}
    aliases: set[str] = set()
    for p in library:
        m = re.search(r"^aliases:\s*(\[.*\])\s*$", p.read_text(encoding="utf-8", errors="replace"), re.M)
        if m:
            try:
                aliases |= {a.lower() for a in json.loads(m.group(1))}
            except Exception:
                pass

    def resolves(t: str) -> bool:
        t = (t or "").strip().rstrip("/")
        return bool(t) and (t in paths or t.split("/")[-1] in stems or t.lower() in aliases)

    # --- the old layer: concept cross-refs still living inside _compiled/CONCEPTS.md
    outside_stems = {p.stem for p in outside}
    outside_paths = {p.relative_to(vault).with_suffix("").as_posix() for p in outside}

    old_total = old_ok = 0
    for _, compiled in live_folders(vault):
        f = compiled / "CONCEPTS.md"
        if not f.exists():
            continue
        text = f.read_text(encoding="utf-8", errors="replace")
        for part in re.split(r"\n##\s+", "\n" + text)[1:]:
            for t in related_targets(part):
                old_total += 1
                old_ok += t in outside_paths or t.split("/")[-1] in outside_stems

    # --- the new layer
    concepts = sorted((vault / LIBRARY / "concepts").glob("*.md"))
    new_total = new_ok = 0
    inbound: dict[str, set[str]] = {}
    concept_stems = {p.stem for p in concepts}
    for p in concepts:
        text = p.read_text(encoding="utf-8", errors="replace")
        for t in related_targets(text):
            new_total += 1
            new_ok += resolves(t)
        for t in re.findall(r"\[\[([^\]|]+)", text):
            t = t.strip()
            key = t.split("/")[-1]
            if key in stems and key not in concept_stems and resolves(t):
                inbound.setdefault(key, set()).add(p.stem)

    collisions = sorted(concept_stems & {p.stem for p in outside})

    pct = lambda a, b: f"{100 * a // b}%" if b else "n/a"
    print(f"vault                 {vault}")
    print(f"notes outside library {len(outside)}")
    print(f"concept notes         {len(concepts)}")
    print()
    print(f"concept links in _compiled/  {old_total:>5}   resolving: {old_ok:>4}  {pct(old_ok, old_total)}")
    print(f"concept links in {LIBRARY}/      {new_total:>5}   resolving: {new_ok:>4}  {pct(new_ok, new_total)}")
    print()
    print(f"raw notes with inbound links from concepts  {len(inbound)}")
    print(f"concept -> raw edges                        {sum(len(v) for v in inbound.values())}")
    print()
    print(f"title collisions with existing notes        {len(collisions)}")
    for c in collisions[:10]:
        print(f"  !! {c}")
    return 1 if collisions else 0


if __name__ == "__main__":
    raise SystemExit(main())
