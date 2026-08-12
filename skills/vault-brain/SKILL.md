---
name: vault-brain
description: >
  Address every concept in a compiled Obsidian vault: turn the headings inside per-folder
  CONCEPTS.md files into one note each, so [[concept]] links resolve, raw notes gain
  backlinks, and the concept network appears in the graph. Use when a compiled layer
  regenerates instead of accumulating, when concept wikilinks lead nowhere, or when the
  same idea keeps being re-synthesized in folder after folder.
  Not for compiling raw notes into a folder's CONCEPTS.md (`vault-compile`), and not for
  scoring folder health (`vault-lint`).
---

# vault-brain

A concept with no **address** cannot accumulate.

`vault-compile` writes concepts as level-2 headings inside a per-folder `CONCEPTS.md`.
A heading has no address, so three things follow: `[[Some concept]]` resolves to nothing,
Obsidian's graph shows no concept network, and the same idea gets re-derived from scratch
in every folder that touches it. Giving each concept its own note fixes all three at once,
because an address is the thing links, backlinks, and graph edges are made of.

This skill only ever writes inside one library folder. Raw notes and `_compiled/` are
read-only to it.

## Steps

### 1. Find the vault

Ask for the vault root if it was not named. Confirm it holds at least one
`_compiled/CONCEPTS.md` — without one there are no concepts to address, and
`vault-compile` should run first.

**Done when:** you can name the vault root and the number of folders under it that
carry a `CONCEPTS.md`.

### 2. Address the concepts

```bash
python3 ~/.claude/skills/vault-brain/scripts/materialize.py "<vault root>"
```

Add `--dry-run` to write into `./_brain-preview` instead, when you want to inspect
output before it lands in the vault.

The run merges concepts whose titles match verbatim, gives each a filename Obsidian
and macOS both accept, and aliases the original title whenever sanitising changed it.
Near-miss link targets become aliases too, so a phrasing that drifted between folders
still resolves.

**Done when:** the run reports a written path, and the percentage of concept links
that resolve.

### 3. Verify against disk

```bash
python3 ~/.claude/skills/vault-brain/scripts/measure.py "<vault root>"
```

This rebuilds the resolution universe from the filesystem rather than trusting the
build, so the number is independent of the tool that produced it.

**Done when:** resolution is reported for both layers, and the collision count is zero.
A non-zero collision count means a concept title shadows an existing note — stop and
report it rather than leaving the shadowing note in place.

### 4. Hand over the three worklists

The library ships its own queues. Report each with its count, and say what the user
would do about it:

- `INDEX.md` — the catalogue, including a **Needs a claim title** section. `vault-compile`
  asks for claim phrases rather than nouns, so every entry there wants a rewrite into an
  assertion, not more words.
- `QUEUE.md` — concepts linked to but not yet written. These are deliberate red links:
  a worklist, not rot.
- `MERGE-CANDIDATES.md` — near-identical concepts across folders, left separate because
  merging two similar claims is a judgement the tool declines to make.

**Done when:** the user has seen all three counts and knows which one to start with.

## Rebuilding

Re-running overwrites every file the tool owns. Notes left over from a previous run are
reported, never deleted — a title that changed leaves its old note behind, and removing
it is the user's call.

## Design

Why one note per concept, where the pattern comes from, and what it deliberately does
not do: [`references/design.md`](references/design.md).
