---
name: vibe-code-leaf-finder
description: This skill should be used when a user wants to identify which parts of a codebase are safe to modify with AI ("vibe code") and which require careful human engineering. It classifies files and modules into Leaf (safe to vibe), Branch (caution), or Trunk (hands off) based on dependency isolation, stability, and external verifiability. Use when users say "find safe places to vibe code", "where can I let AI loose in this repo", "leaf nodes", "vibe-code audit", "can a PM edit this codebase", or when someone points at a directory and asks whether it's safe to let Claude rewrite it. Grounded in Erik Schluntz's (Anthropic) "leaf nodes vs trunks" framework from the "Vibe coding in prod" talk.
---

# Vibe Code Leaf Finder

## Purpose

Classify every part of a codebase by risk-to-modify-with-AI, producing a report that tells the user where AI can write freely (leaves), where it needs guardrails (branches), and where humans must stay in the loop (trunks).

Based on Erik Schluntz's framing from "Vibe coding in prod" (Anthropic, 2025): tech debt is acceptable in leaf nodes because nothing depends on them, but trunks and branches are core architecture that must be "protected, deeply understood, extensible, and flexible."

Full framework quotes and rationale: `references/schluntz-framework.md`.

## When to Use

Trigger this skill when the user:
- Points at a codebase or directory and asks where it's safe to use AI.
- Wants a report of "leaf nodes" vs "trunks" before a vibe-coding session.
- Is a PM, founder, or non-engineer who wants to ship features without breaking core architecture.
- Says phrases like: "vibe-code audit", "leaf finder", "where can I let Claude loose", "which files are safe to rewrite", "can a PM edit this".

Do NOT use this skill for: general code review, bug hunting, or performance audits. This skill only answers one question — "where is it safe to let AI write this code without human review of every line?"

## Workflow

Execute these four checks against the target scope. If no scope is given, ask the user once: "Scope this to a directory, a package, or the whole repo?"

### Step 1: Dependency Check (outward edges)

For each file in scope, find every place outside the file (and outside the scope directory if scoped) that imports or references it.

Use ripgrep, not grep. Search for:
- Import statements: `from <module>`, `import <module>`, `require('<path>')`, `from '<path>'`
- Symbol references: exported class names, exported function names
- String references: dynamic imports, module registries, route tables

Record, for each file: a list of external referrers. Zero referrers = candidate leaf.

### Step 2: Isolation Check (inward edges)

For each candidate leaf from Step 1, confirm it is also a *pure consumer* not a *provider*:
- Does it register anything globally (plugins, middleware, migrations, event handlers, cron jobs)?
- Does it write to shared state (singletons, global config, shared DB schema)?
- Does it expose a public API surface (HTTP routes, SDK exports, CLI commands)?

A file with zero external importers but that registers a middleware or a route is NOT a leaf — it is a hidden trunk. Flag these as **BRANCH**.

### Step 3: Stability Check (time axis)

For each remaining leaf candidate, inspect git history:

```bash
git log --follow --oneline --since="12 months ago" -- <file>
git log --follow --stat -- <file> | head -40
```

Signals of a true leaf (end-feature, unlikely to grow):
- Low commit frequency after initial creation.
- Commits are bugfixes or copy changes, not structural refactors.
- File has no `TODO`, `FIXME`, or `HACK` comments pointing to future expansion.
- No recent PR descriptions mention building on top of it.

Signals of a hidden trunk:
- High commit churn.
- Frequent "refactor", "extract", "split" commits.
- Comments like "temporary", "will move", "refactor soon".

### Step 4: Testability Check (verification axis)

This is the Schluntz test: can you verify this feature works without reading the implementation?

For each leaf candidate, answer:
- Does it have clear, observable inputs and outputs (HTTP request → response, CLI args → stdout, form input → rendered DOM)?
- Can you write an end-to-end test that exercises it from outside?
- Can a non-engineer verify the behavior by using the product?

If no to any of these: downgrade to **BRANCH**.

### Step 5: Classify and Report

Classify every file in scope as one of:

| Class | Definition | AI Strategy |
|---|---|---|
| **LEAF** | Zero external deps, no registrations, stable git history, externally verifiable | Vibe code freely. Claude writes, human runs tests, ships. |
| **BRANCH** | Leaf-like but with 1-2 of: light external refs, some registrations, moderate churn | AI can draft, human reviews structural decisions only. |
| **TRUNK** | Imported by many files, registers globally, high churn, OR no external test surface | Human writes. AI may suggest, human writes every line. |

Then for each LEAF, propose Schluntz-style stress tests — 3 end-to-end tests minimum (one happy path, two failure modes) that verify behavior without reading the implementation.

Write output to `LEAF_REPORT.md` using the template in `assets/LEAF_REPORT_TEMPLATE.md`. Use the Write tool, not Shell echo.

## Output Contract

Every run produces:
1. A table: every file in scope classified LEAF / BRANCH / TRUNK with one-line reasoning.
2. A `Safe to Vibe` section listing LEAF files with suggested stress tests per file.
3. A `Hands Off` section listing TRUNK files with the blocking reason (who imports them, what they register, what churns).
4. A `Caution` section listing BRANCH files with the specific guardrail needed.

If the user is non-technical (PM, founder), add a plain-English summary at the top: "You can safely ask Claude to edit these N files. Do not let Claude touch these M files without an engineer present."

## Anti-Patterns

Do NOT:
- Classify a file as LEAF just because it has zero imports inside the scope. External imports from outside the scope still count.
- Rely on filename patterns (e.g. "utils.py always = trunk"). Check actual dependencies.
- Skip the stability check. A file with zero deps *today* that had 40 commits last quarter is a hidden trunk mid-extraction.
- Suggest stress tests that require reading the implementation. Tests must be writable from the outside.
- Produce the report without running `rg` / `git log` — hallucinated classifications destroy trust.

## Edge Cases

- **Monorepo**: If scope crosses package boundaries, treat each package as its own scope and produce one report per package.
- **Generated code**: Auto-generated files (protobuf, GraphQL schemas, migrations) are always TRUNK regardless of deps. Flag and skip.
- **Config files**: `.env`, `config.yaml`, infra-as-code — always TRUNK.
- **Tests**: Test files themselves are LEAF by definition (nothing depends on them). Don't classify test files; report them separately as "test coverage context".
- **Empty repo or single-file project**: Skip classification, return: "Not enough structure to classify. Entire file is either leaf or trunk depending on who will call it."

## Resources

- `references/schluntz-framework.md` — source quotes, framework definitions, rationale. Read this before running the workflow if unfamiliar with the leaf/trunk model.
- `assets/LEAF_REPORT_TEMPLATE.md` — the exact report format to produce. Copy and fill in.
