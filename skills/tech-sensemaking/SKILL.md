---
name: tech-sensemaking
description: >
  Analyze technology announcements to surface non-obvious strategic implications
  using Verbalized Sampling. Works against any context: a business, product,
  codebase, feature branch, personal project, career, or exploratory domain.
  Use when a new technology, feature, or capability is announced and you want to
  understand what new outcomes, affordances, and competitive levers it creates —
  beyond the obvious hot takes. Triggers on: "analyze this announcement",
  "what does this mean for us", "tech sensemaking", "new feature dropped",
  "what can we do with this", "sensemaking on this", "strategic implications of",
  or any request to evaluate a technology change strategically.
  Category: Product Strategy
---

# Tech Sensemaking

Analyze a technology announcement through 4 strategic questions using Verbalized
Sampling to produce diverse, non-obvious insights grounded in the user's specific
context — whether that's a business, a product, a feature branch, a codebase, a
personal project, or anything else.

## Required Input

- **Announcement**: pasted text, URL, or description of the technology change.
- **Context subject**: what to analyze the announcement against (asked in Phase 2 if not obvious).

## Workflow

### Phase 1 — Intake

1. Accept the announcement. If a URL, scrape it (Firecrawl, WebFetch, or browser tools).
2. Write a neutral **announcement summary** (200-400 words):
   - What was announced (capabilities, features, changes)
   - What constraints or limitations were mentioned
   - Availability and timeline
   - What was NOT said (notable omissions)
3. Present the summary to the user. Ask: "Does this capture the announcement accurately, or should I adjust anything before analysis?"

### Phase 2 — Context Loading

Determine the context type and load accordingly. If the user hasn't specified what
to analyze the announcement against, ask:

> "What should I analyze this announcement against? For example:
> - A business (prodmgmt.world, your startup, etc.)
> - A product or feature (your SaaS, an open-source project, etc.)
> - A codebase or feature branch (a repo you're building)
> - A personal goal or project
> - Something else?"

#### Context sources by type

| Context type | Where to look | What to extract |
|---|---|---|
| **Business** | Vault notes (qmd search), `Context/` files if they exist, user description | What it does, revenue model, competitive position, goals, constraints, team size |
| **Product** | README, product docs, vault notes, user description | What it does, target users, current capabilities, roadmap, tech stack |
| **Codebase / feature branch** | Source code, README, CLAUDE.md, recent commits/PRs | Architecture, dependencies, current problems, what's being built |
| **Personal project** | Vault notes, user description | Goals, constraints, timeline, what's been tried |
| **Role / career** | Vault notes, user description | Current role, skills, goals, industry, constraints |
| **Generic / exploratory** | User description, web research | Domain, key players, known constraints, relevant trends |

Compress into a **context block** (~300 words) covering:
- What the subject is and what it does
- Current state, capabilities, or position
- Goals or direction
- Key constraints (time, resources, technical, strategic)
- What's already been tried or is in progress (if known)

This block is injected into every VS prompt. Rich context is the primary defense
against generic outputs — see the `/verbalized-sampling` skill's FM-2 failure mode.
If context is thin, say so and ask the user to enrich it before proceeding.

### Phase 3 — VS Generation

This phase uses the `/verbalized-sampling` skill for generation mechanics.

Read `references/vs-prompts.md` for the 4 prompt templates. Substitute
`{announcement_summary}` and `{context_block}` into each template.

**VS configuration for this skill:**
- Variant: VS-CoT (each output includes a `reasoning` field)
- Distribution: tail sampling, p < 0.10
- k = 5 per question (20 total outputs)
- FM-1 mitigation: exclusion constraints baked into each prompt template
- FM-2 mitigation: rich context block injected into every prompt
- FM-3 mitigation: 4 separate problem frames + coverage requirements within each

The 4 questions:

| # | Question | Key | What it surfaces |
|---|----------|-----|------------------|
| 1 | New Outcomes | `new_outcomes` | What's now possible — including second/third-order effects |
| 2 | New Affordances | `new_affordances` | What actions can now be taken — concrete, effort-rated |
| 3 | Relative Value | `relative_value` | Which possibilities matter most for THIS context vs. alternatives |
| 4 | Secret Levers | `secret_levers` | Non-obvious causal chains for durable advantage |

### Phase 4 — Critique

Apply the critique-and-improve loop from the `/verbalized-sampling` skill
(see its `references/critique-framework.md`) to all 20 outputs.

For each item, check the 6 dimensions:
1. **Naive?** Would this appear in a tech journalist's hot take?
2. **Under-specified?** Could execution start this week without further research?
3. **Magical thinking?** Does this assume steps will "just work"?
4. **Ignores constraints?** Does this violate real constraints from the context block?
5. **Base rate blind?** Is this approach known to fail in similar contexts?
6. **Over-engineered?** Is this a cannon to kill a fly given the subject's stage/scale?

Triage:
- `failure_count 0-1`: Keep as-is
- `failure_count 2-3`: Generate 2 improved variants, pick the best
- `failure_count 4+`: Drop entirely

### Phase 5 — Present

Output in readable format, grouped by question. Within each question, order by
probability ascending (most novel first).

Format:

```
## Q1: New Outcomes

### High diversity (p < 0.05)
1. [text] (p=0.03, time_horizon: medium, order: second)
   **Reasoning:** [condensed reasoning]

### Moderate diversity (p 0.05–0.10)
2. [text] (p=0.07, ...)
   ...
```

After all 4 questions, add:

```
## Synthesis: Top 3 Moves

[Identify the 3 highest-leverage actions across all 4 questions. For each:]
1. **Action**: What to do
2. **Why now**: Why this announcement creates the window
3. **First step**: The concrete next action
```

End with:
```
## What I excluded (and why)
[List 2-3 items that were dropped by the critique pass, with the failure reasons.
This shows the user what "obvious" looks like so they calibrate their own thinking.]
```

## Usage Notes

- The skill works best when the announcement is fresh (within days). Stale announcements produce outputs closer to what's already been discussed publicly.
- If context is thin, the outputs will drift generic. Enrich context before running on high-stakes announcements.
- For major platform shifts (not just feature announcements), consider running this skill twice: once on the announcement itself, once on the second-order market reactions 1-2 weeks later.
- The "Secret Levers" question (Q4) is the highest-value output. If time-constrained, run Q4 alone.
- This skill delegates VS mechanics to `/verbalized-sampling`. Consult that skill for distribution thresholds, failure modes, output formatting, and the meta-prompt for generating custom VS prompts.
