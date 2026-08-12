#!/usr/bin/env python3
"""Give every concept an address.

Reads the `_compiled/CONCEPTS.md` files a vault-compile run already produced and
writes one note per concept into a vault-level library. Nothing else is touched:
raw notes and `_compiled/` are read-only here.

    python3 materialize.py "<vault>"            # write into <vault>/_brain
    python3 materialize.py "<vault>" --dry-run  # write into ./_brain-preview instead
"""
from __future__ import annotations

import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from datetime import datetime, timezone
from difflib import SequenceMatcher
from pathlib import Path

LIBRARY = "_brain"
SKIP_PREFIXES = ("04 ARCHIVE",)
SKIP_MARKERS = ("BACKUP", "_archive")
NON_CONCEPT_HEADINGS = ("quick stats", "sources", "index", "gaps", "knowledge gaps",
                        "open questions", "contested")
MAX_STEM = 120

STOP = set("the a an of in on for to and or is are as with by at from your our their its it this "
           "that not but how why what when where which who".split())


# ---------------------------------------------------------------- parsing

def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s)
    return re.sub(r"\s+", " ", re.sub(r"[^\w\s/]", " ", s.lower())).strip()


def toks(s: str) -> set[str]:
    return {t for t in norm(s).split() if t not in STOP and len(t) > 2}


def parse_concepts(path: Path) -> list[dict]:
    """Split a CONCEPTS.md into its level-2 concept entries.

    Mirrors the grading in the vault's own extract_brain.py so counts stay comparable.
    """
    text = path.read_text(encoding="utf-8", errors="replace")
    out = []
    for part in re.split(r"\n##\s+", "\n" + text)[1:]:
        lines = part.split("\n")
        name = lines[0].strip().strip("#").strip()
        if not name or name.lower().startswith(NON_CONCEPT_HEADINGS):
            continue
        body = "\n".join(lines[1:]).strip()
        tldr = ""
        m = re.search(r">\s*\*\*TLDR:?\*\*:?\s*(.+)", body)
        if m:
            tldr = m.group(1).strip()
        else:
            m = re.search(r"\*\*Definition:?\*\*:?\s*(.+)", body)
            tldr = m.group(1).strip() if m else ""

        related = []
        mr = re.search(r"\*\*Related concepts[^:]*:?\*\*:?\s*(.+)", body)
        if mr:
            related = [r.strip() for r in re.findall(r"\[\[([^\]|]+)", mr.group(1))]

        every_link = [s.strip() for s in re.findall(r"\[\[([^\]|]+)", body)]

        if re.search(r"is a recurring theme across \d+ notes", tldr, re.I):
            grade = "template"
        elif not tldr:
            grade = "thin"
        else:
            grade = "synthesized"

        out.append({"name": name, "tldr": tldr, "related": related,
                    "links": every_link, "grade": grade, "body": body})
    return out


def collect(vault: Path) -> list[dict]:
    """One record per (folder, concept), in vault order."""
    records = []
    for compiled in sorted(vault.rglob("_compiled")):
        if not compiled.is_dir():
            continue
        folder = compiled.parent.relative_to(vault).as_posix()
        if folder.startswith(SKIP_PREFIXES) or any(m in folder for m in SKIP_MARKERS):
            continue
        concepts_file = compiled / "CONCEPTS.md"
        if not concepts_file.exists():
            continue
        has_index = (compiled / "INDEX.md").exists()
        for c in parse_concepts(concepts_file):
            records.append({**c, "folder": folder, "folder_index": has_index})
    return records


# ---------------------------------------------------------------- naming

_ILLEGAL = str.maketrans({c: None for c in '"?*<>|\\'})


def to_stem(title: str) -> str:
    """A filename Obsidian and macOS both accept, as close to the title as possible."""
    stem = title.replace("/", "-").replace(":", " -").translate(_ILLEGAL)
    stem = re.sub(r"\s+", " ", stem).strip(" .")
    if len(stem) > MAX_STEM:
        cut = stem[:MAX_STEM].rsplit(" ", 1)[0]
        stem = (cut or stem[:MAX_STEM]).rstrip(" .,;:-")
    return stem or "untitled concept"


SHAPES = {"synthesized": "claim", "template": "topic", "thin": "process"}


def shape_of(grade: str) -> str:
    """Is the title an assertion, a topic bucket, or a procedure?

    vault-compile's own rule wants claim phrases ("API-like titles ... rather than
    nouns"), so a `topic` shape is the concept that needs retitling — not a concept
    that needs more words. Body length says nothing about it either way.
    """
    return SHAPES.get(grade, "claim")


def maturity_of(body: str, related: list[str], contexts: int) -> str:
    size = len(re.sub(r"\s+", " ", body))
    if size < 900 or not related:
        return "draft"
    return "mature" if contexts > 1 else "substantial"


# ---------------------------------------------------------------- assembly

def merge_group(records: list[dict]) -> dict:
    """Fold verbatim-identical titles from different folders into one concept."""
    richest = max(records, key=lambda r: len(r["body"]))
    contexts, seen = [], set()
    for r in records:
        if r["folder"] not in seen:
            seen.add(r["folder"])
            contexts.append({"folder": r["folder"], "index": r["folder_index"]})

    related, rseen = [], set()
    for r in records:
        for t in r["related"]:
            if t.lower() not in rseen:
                rseen.add(t.lower())
                related.append(t)

    alternates = []
    for r in records:
        if r is richest:
            continue
        trimmed = re.sub(r"\s+", " ", r["body"]).strip()
        if trimmed and SequenceMatcher(None, trimmed,
                                       re.sub(r"\s+", " ", richest["body"])).ratio() < 0.92:
            alternates.append({"folder": r["folder"], "body": r["body"].strip()})

    return {"title": richest["name"], "tldr": richest["tldr"], "body": richest["body"],
            "grade": richest["grade"], "related": related, "contexts": contexts,
            "alternates": alternates,
            "source_links": [l for r in records for l in r["links"]]}


def build_concepts(records: list[dict]) -> list[dict]:
    by_title: dict[str, list[dict]] = defaultdict(list)
    for r in records:
        by_title[r["name"]].append(r)
    concepts = [merge_group(g) for g in by_title.values()]
    concepts.sort(key=lambda c: c["title"].lower())
    return concepts


def assign_addresses(concepts: list[dict], taken_stems: set[str]) -> None:
    """Give each concept a unique filename, aliasing the original title when they differ."""
    used = set()
    for c in concepts:
        stem = to_stem(c["title"])
        base, n = stem, 2
        while stem.lower() in used or stem in taken_stems:
            stem = f"{base} ({n})"
            n += 1
        used.add(stem.lower())
        c["stem"] = stem
        c["aliases"] = [] if stem == c["title"] else [c["title"]]


def attach_alias_rescues(concepts: list[dict]) -> int:
    """A dangling link that all-but-matches a real concept becomes an alias of it.

    Turns near-miss phrasings across folders into links that resolve, without
    merging two concepts that might genuinely differ.
    """
    addressable = {}
    for c in concepts:
        addressable[c["stem"].lower()] = c
        for a in c["aliases"]:
            addressable[a.lower()] = c

    dangling = Counter()
    for c in concepts:
        for t in c["related"]:
            if t.lower() not in addressable:
                dangling[t] += 1

    rescued = 0
    index = [(norm(c["title"]), c) for c in concepts]
    for target, _ in dangling.items():
        nt = norm(target)
        best, score = None, 0.0
        for cand_norm, c in index:
            r = SequenceMatcher(None, nt, cand_norm).ratio()
            if r > score:
                best, score = c, r
        if best is not None and score >= 0.90 and target.lower() not in addressable:
            best["aliases"].append(target)
            addressable[target.lower()] = best
            rescued += 1
    return rescued


# ---------------------------------------------------------------- rendering

def yaml_list(values: list[str]) -> str:
    return "[" + ", ".join(json.dumps(v, ensure_ascii=False) for v in values) + "]"


def link(c: dict) -> str:
    """`[[stem]]`, piped to the real title only when the filename had to be sanitised."""
    return f"[[{c['stem']}]]" if c["stem"] == c["title"] else f"[[{c['stem']}|{c['title']}]]"


def where(c: dict, limit: int = 3) -> str:
    folders = [x["folder"] for x in c["contexts"]]
    head = ", ".join(f"`{f}`" for f in folders[:limit])
    return head if len(folders) <= limit else f"{head} +{len(folders) - limit} more"


def render_concept(c: dict) -> str:
    fm = [
        "---",
        "concept: true",
        f'title: {json.dumps(c["title"], ensure_ascii=False)}',
    ]
    if c["aliases"]:
        fm.append(f"aliases: {yaml_list(c['aliases'])}")
    fm += [
        f"shape: {c['shape']}",
        f"maturity: {c['maturity']}",
        f"contexts: {yaml_list([x['folder'] for x in c['contexts']])}",
        f"sources: {c['source_count']}",
        "generated-by: vault-brain",
        "---",
        "",
    ]

    body = c["body"]
    body = re.sub(r"\*\*Related concepts in this folder:?\*\*", "**Related concepts:**", body)
    body = re.sub(r"\*\*Key sources in this folder:?\*\*", "**Key sources:**", body)
    body = body.rstrip().rstrip("-").rstrip()

    parts = [f"# {c['title']}", "", body, ""]

    if c["alternates"]:
        parts.append("## Also synthesized as")
        for alt in c["alternates"]:
            parts += ["", f"### In `{alt['folder']}`", "", alt["body"].rstrip().rstrip("-").rstrip()]
        parts.append("")

    parts.append("## Appears in")
    parts.append("")
    for ctx in c["contexts"]:
        if ctx["index"]:
            parts.append(f"- `{ctx['folder']}` — [[{ctx['folder']}/_compiled/INDEX|folder index]]")
        else:
            parts.append(f"- `{ctx['folder']}`")
    parts.append("")

    return "\n".join("\n".join(fm).split("\n") + parts).rstrip() + "\n"


def render_index(concepts: list[dict], stamp: str) -> str:
    by_context: dict[str, list[dict]] = defaultdict(list)
    for c in concepts:
        for ctx in c["contexts"]:
            by_context[ctx["folder"]].append(c)

    mat = Counter(c["maturity"] for c in concepts)
    shp = Counter(c["shape"] for c in concepts)
    lines = [
        "# Concept library",
        "",
        f"> {len(concepts)} concepts, each its own note. Generated by `vault-brain` on {stamp}.",
        "> Catalogues the *generated* layer — the per-folder `INDEX.md` files still catalogue raw notes.",
        "",
        "| maturity | count | | shape | count |",
        "|---|---|---|---|---|",
    ]
    rows = max(3, len(shp))
    mats = ["mature", "substantial", "draft"]
    shapes = ["claim", "process", "topic"]
    for i in range(rows):
        m = f"| {mats[i]} | {mat.get(mats[i], 0)} " if i < len(mats) else "| | "
        s = f"| | {shapes[i]} | {shp.get(shapes[i], 0)} |" if i < len(shapes) else "| | | |"
        lines.append(m + s)

    topics = [c for c in concepts if c["shape"] == "topic"]
    if topics:
        lines += [
            "",
            "## Needs a claim title",
            "",
            "> These are titled as topic buckets. `vault-compile` asks for claim phrases",
            "> (\"API-like titles ... rather than nouns\"), so each of these wants a rewrite",
            "> into an assertion — not more words.",
            "",
        ]
        for c in sorted(topics, key=lambda x: x["title"].lower()):
            lines.append(f"- {link(c)} — {where(c)}")

    lines += ["", "## By folder", ""]

    for folder in sorted(by_context):
        lines.append(f"### {folder}")
        lines.append("")
        for c in sorted(by_context[folder], key=lambda x: x["title"].lower()):
            tldr = re.sub(r"\s+", " ", c["tldr"]).strip()
            suffix = f" — {tldr[:140]}" if tldr else ""
            flag = " ◇" if c["shape"] == "topic" else ""
            lines.append(f"- {link(c)}{flag}{suffix}")
        lines.append("")

    lines += ["## Legend", "",
              "◇ topic-shaped title — wants rewriting as a claim.", ""]
    return "\n".join(lines)


def render_queue(dangling: Counter, stamp: str) -> str:
    lines = [
        "# Concepts needing a page",
        "",
        f"> {len(dangling)} concepts are linked to but have no note. Generated on {stamp}.",
        "> These are deliberate red links: a worklist, not rot. Karpathy's lint pass calls them",
        "> \"important concepts needing dedicated pages\".",
        "",
        "| concept | inbound links |",
        "|---|---|",
    ]
    for name, n in dangling.most_common():
        safe = name.replace("|", r"\|")
        lines.append(f"| {safe} | {n} |")
    lines.append("")
    return "\n".join(lines)


def render_merge_candidates(groups: list[list[dict]], stamp: str) -> str:
    lines = [
        "# Merge candidates",
        "",
        f"> {len(groups)} clusters of near-identical concepts across folders. Generated on {stamp}.",
        "> Verbatim-identical titles were merged automatically. These are only *similar*,",
        "> so they were left as separate notes — a human call, not a machine one.",
        "",
    ]
    for g in groups:
        lines.append(f"## {g[0]['title']}")
        lines.append("")
        for c in g:
            lines.append(f"- {link(c)} — {where(c)}")
        lines.append("")
    return "\n".join(lines)


def render_readme(stamp: str, n: int) -> str:
    return f"""# _brain

Generated by `vault-brain` on {stamp}. **Nothing here was hand-written, and nothing
outside this folder was touched** — your notes and every `_compiled/` folder are
read-only to the tool that built it.

## What this is

Every concept your `vault-compile` runs synthesized used to be a *heading* inside a
per-folder `CONCEPTS.md`. A heading has no address, so `[[Some concept]]` pointed at
nothing, the same idea was re-derived in folder after folder, and nothing accumulated.

Here each concept is a note. That single change gives it an address, which is what
lets links resolve, backlinks appear, and the graph view show the concept network.

- `concepts/` — one note per concept ({n} of them)
- `INDEX.md` — catalogue of these pages, plus the ones whose titles need rewriting
- `QUEUE.md` — concepts that are linked to but have no page yet (deliberate red links)
- `MERGE-CANDIDATES.md` — near-identical concepts left separate for you to judge
- `LOG.md` — append-only record of each run

## Frontmatter

- `shape` — `claim` (title asserts something), `process` (numbered procedure),
  `topic` (a noun bucket; wants rewriting into a claim)
- `maturity` — `draft` / `substantial` / `mature`, from body length, cross-links,
  and whether the concept shows up in more than one folder
- `contexts` — the folders this concept was synthesized in

## Rebuilding

Re-run the tool. It overwrites every file it owns and reports — but never deletes —
notes left over from a previous run.

## Removing it

Delete this one folder. Nothing else in the vault depends on it, and nothing else
was modified to create it.
"""


def near_duplicate_groups(concepts: list[dict]) -> list[list[dict]]:
    """Same clustering the vault's own survey used, so the 25 groups stay recognisable."""
    entries = [(c, toks(c["title"])) for c in concepts if c["grade"] != "template"]
    groups, used = [], set()
    for i, (a, at) in enumerate(entries):
        if i in used or not at:
            continue
        grp = [i]
        for j in range(i + 1, len(entries)):
            if j in used:
                continue
            b, bt = entries[j]
            if not bt or {x["folder"] for x in a["contexts"]} & {x["folder"] for x in b["contexts"]}:
                continue
            inter, union = len(at & bt), len(at | bt)
            jac = inter / union if union else 0
            if jac >= 0.42 or (inter >= 2 and jac >= 0.3):
                grp.append(j)
        if len(grp) > 1:
            used.update(grp)
            groups.append([entries[k][0] for k in grp])
    groups.sort(key=len, reverse=True)
    return groups


# ---------------------------------------------------------------- main

def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    vault = Path(sys.argv[1]).expanduser().resolve()
    dry = "--dry-run" in sys.argv
    if not vault.is_dir():
        print(f"not a directory: {vault}")
        return 2

    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    records = collect(vault)
    if not records:
        print("no _compiled/CONCEPTS.md files found — nothing to address")
        return 1

    concepts = build_concepts(records)

    existing_stems = {p.stem for p in vault.rglob("*.md")
                      if LIBRARY not in p.relative_to(vault).parts}
    assign_addresses(concepts, existing_stems)
    rescued = attach_alias_rescues(concepts)

    addressable = set()
    for c in concepts:
        addressable.add(c["stem"].lower())
        addressable.update(a.lower() for a in c["aliases"])

    for c in concepts:
        c["source_count"] = len({l for l in c["source_links"] if l.lower() not in addressable})
        c["shape"] = shape_of(c["grade"])
        c["maturity"] = maturity_of(c["body"], c["related"], len(c["contexts"]))

    dangling = Counter()
    resolved_links = 0
    for c in concepts:
        for t in c["related"]:
            if t.lower() in addressable:
                resolved_links += 1
            else:
                dangling[t] += 1

    groups = near_duplicate_groups(concepts)

    out = (Path.cwd() / "_brain-preview") if dry else (vault / LIBRARY)
    notes_dir = out / "concepts"
    notes_dir.mkdir(parents=True, exist_ok=True)

    written = []
    for c in concepts:
        (notes_dir / f"{c['stem']}.md").write_text(render_concept(c), encoding="utf-8")
        written.append(f"concepts/{c['stem']}.md")

    (out / "README.md").write_text(render_readme(stamp, len(concepts)), encoding="utf-8")
    (out / "INDEX.md").write_text(render_index(concepts, stamp), encoding="utf-8")
    (out / "QUEUE.md").write_text(render_queue(dangling, stamp), encoding="utf-8")
    if groups:
        (out / "MERGE-CANDIDATES.md").write_text(render_merge_candidates(groups, stamp),
                                                 encoding="utf-8")

    manifest = out / ".brain-manifest.json"
    previous = set()
    if manifest.exists():
        try:
            previous = set(json.loads(manifest.read_text()).get("files", []))
        except Exception:
            pass
    orphans = sorted(previous - set(written))
    manifest.write_text(json.dumps({"generated": stamp, "files": sorted(written)}, indent=2),
                        encoding="utf-8")

    log = out / "LOG.md"
    entry = (f"\n## [{stamp}] address | {len(concepts)} concepts from {len({r['folder'] for r in records})} folders\n"
             f"- {resolved_links}/{resolved_links + sum(dangling.values())} concept links resolve\n"
             f"- {len(dangling)} concepts queued for a page\n"
             f"- {rescued} near-miss links rescued as aliases\n")
    if log.exists():
        log.write_text(log.read_text(encoding="utf-8") + entry, encoding="utf-8")
    else:
        log.write_text("# Log\n\n> Append-only record of what happened and when.\n" + entry,
                       encoding="utf-8")

    total = resolved_links + sum(dangling.values())
    print(f"folders read        {len({r['folder'] for r in records})}")
    print(f"concept entries     {len(records)}")
    print(f"concept notes       {len(concepts)}  (verbatim duplicates merged)")
    print(f"shape               {dict(Counter(c['shape'] for c in concepts))}")
    print(f"maturity            {dict(Counter(c['maturity'] for c in concepts))}")
    print(f"aliases added       {sum(len(c['aliases']) for c in concepts)}  ({rescued} near-miss rescues)")
    print()
    print(f"concept links       {total}")
    print(f"  now resolve       {resolved_links}  ({100 * resolved_links // max(1, total)}%)")
    print(f"  queued as red     {sum(dangling.values())} links -> {len(dangling)} pages")
    print(f"source-note links   {sum(c['source_count'] for c in concepts)} inbound edges onto raw notes")
    print(f"merge candidates    {len(groups)} clusters left for review")
    if orphans:
        print(f"\nstale notes from a previous run ({len(orphans)}) — left in place, remove by hand:")
        for o in orphans[:10]:
            print(f"  {o}")
    print(f"\nwritten to {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
