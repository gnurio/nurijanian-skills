# Design

## Where the pattern comes from

Andrej Karpathy's [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
gist (April 2026) describes three layers:

- **Raw sources** — "immutable — the LLM reads from them but never modifies them"
- **The wiki** — "a **directory** of LLM-generated markdown files. Summaries, entity pages,
  concept pages, comparisons, an overview, a synthesis"
- **The schema** — a config file telling the LLM how the wiki is structured

The lossy step in most implementations is the second one. "A directory of pages" gets
compressed into "a file with sections", and everything downstream quietly breaks:

| Karpathy | The compressed version |
|---|---|
| a directory of pages | three flat files per folder |
| `index.md` catalogues **wiki pages** | INDEX catalogues **raw notes** |
| "incrementally builds and maintains" | full regeneration each run |
| lint finds "important concepts needing dedicated pages" | lint has no notion of a concept page |

That last row is the tell. A lint check for *concepts needing dedicated pages* only makes
sense if concepts have pages. Where they are headings, the check cannot even be expressed.

## Why an address is the whole fix

Obsidian resolves `[[X]]` against note filenames, basenames, and frontmatter aliases —
never against headings, and never against folders. So in the compressed version:

- `[[Some concept]]` written by the compiler resolves to nothing, and a linter then
  flags the compiler's own output as a broken link
- `[[03 RESOURCES/some folder]]` resolves to nothing either, because folders are not notes
- the same concept in two folders is two headings that cannot know about each other

One note per concept fixes all three, and it does so without touching a single raw note:
the concept note links *to* the sources, and Obsidian supplies the reverse direction as
backlinks. The "should the tool edit raw notes to add links?" question dissolves rather
than getting answered.

Andy Matuschak names the failure this avoids: factoring notes by source or topic means
"there's no accumulation ... you just have a scattered set of notes on the concept,
perhaps referring to it by different names, each embedded in some larger document."

## What it deliberately does not do

**Merge similar concepts.** Only verbatim-identical titles are merged. Two concepts that
merely *look* alike may be genuinely different claims, and collapsing them destroys
information that no later pass can recover. They go to `MERGE-CANDIDATES.md` for a human.

**Delete anything.** Rebuilds report stale notes rather than removing them. A concept
whose title changed leaves its old note behind; that is a rename the user should see.

**Grade by length.** An early cut called a concept a "stub" when it had no `**TLDR:**`
line. That misfired badly: notes with 2,000 characters of dense prose and 19 sources were
being labelled stubs purely for using a different heading format. Body length turns out to
say almost nothing useful here — every concept in a real vault had at least 400 characters.

What matters instead is the **shape of the title**:

- `claim` — the title asserts something ("Session logs are the recoverable memory layer")
- `process` — a numbered procedure ("1. The Define-the-Decision process")
- `topic` — a noun bucket ("Career and Leadership")

`vault-compile` already asks for claim phrases "rather than nouns", so `topic` marks the
concepts that violate its own rule. That is an actionable defect. Length is not.

## A bug this surfaces

Capture-source names — `Manual`, `Tweet`, `Web Clip`, `Readwise`, `Snipd` — show up as
concepts, repeated across many folders. They are Readwise metadata that the concept
extraction mistook for ideas. They land in the `topic` shape and appear at the top of the
**Needs a claim title** list, which is where the fix belongs: upstream, in whatever pass
emits them.

## Frontmatter

```yaml
concept: true
title: "the full claim, before filename sanitising"
aliases: ["variants and near-miss link targets that should resolve here"]
shape: claim | process | topic
maturity: draft | substantial | mature
contexts: ["folders this concept was synthesized in"]
sources: 12
generated-by: vault-brain
```

`maturity` is derived from body size, presence of cross-links, and whether the concept
appears in more than one folder. It is a rough signal for sorting, not a quality score —
`shape` is the field that carries an action.
