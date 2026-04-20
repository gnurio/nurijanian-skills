# Leaf Finder Report: {{scope}}

**Generated:** {{date}}
**Scope:** {{scope_path}}
**Files audited:** {{total_files}}

---

## Plain-English Summary

You can safely ask Claude to edit **{{leaf_count}} files** in this scope.
Claude should **not** touch **{{trunk_count}} files** without an engineer present.
**{{branch_count}} files** need guardrails — safe for drafts, review the structural decisions.

---

## Classification Table

| File | Class | One-line reason |
|---|---|---|
| path/to/file.ts | LEAF | No external imports, stable 8mo, clear IO |
| path/to/file.ts | BRANCH | Registers middleware but churn is low |
| path/to/file.ts | TRUNK | Imported by 14 files, 40 commits last quarter |

---

## Safe to Vibe (LEAF)

### `path/to/leaf_file.ts`

**Why it's a leaf:**
- External importers: 0
- Registrations: none
- Git: 3 commits in last 6 months, all bugfixes
- Testable from outside: yes (HTTP endpoint with documented request/response)

**Suggested stress tests (Schluntz-style, 3 minimum):**
1. **Happy path:** [Input → Expected output]
2. **Failure mode 1:** [Invalid input → Error behavior]
3. **Failure mode 2:** [Edge case → Graceful handling]

**Vibe-code strategy:** Describe what you want at behavior level. Let Claude write. Run the tests. Ship if green.

---

## Caution (BRANCH)

### `path/to/branch_file.ts`

**Why it's a branch (not leaf):**
- External importers: 2 (all within the same feature package)
- Registrations: 1 route handler
- Risk: changing its signature would ripple

**Guardrail:** Claude can draft. Human reviews the *interface* (exported function signatures, route definitions). Implementation body is fair game.

---

## Hands Off (TRUNK)

### `path/to/trunk_file.ts`

**Why it's a trunk:**
- External importers: 14 files across 5 packages
- Registrations: middleware pipeline, DB connection pool
- Git: 40 commits in last quarter, actively being refactored
- Current TODO comments: "plan to extract auth into separate service"

**Rule:** Human writes every line. Claude may suggest patches, but no autonomous edits. Future features will build on top of this file — tech debt here compounds.

---

## Test Coverage Context

Test files detected in scope (not classified, listed for reference):
- path/to/test1.spec.ts
- path/to/test2.spec.ts

Coverage gaps on LEAF files (leaf without ≥1 end-to-end test):
- path/to/uncovered_leaf.ts — write tests *before* vibe-coding it.

---

## Next Step

Start with the highest-confidence LEAF file. Write its stress tests first. Then hand the behavior spec to Claude.
