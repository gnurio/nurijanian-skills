---
name: tech-sensemaking
description: >
  Analyze technology announcements to surface non-obvious strategic implications
  for your business using Verbalized Sampling. Use when a new technology, feature,
  or capability is announced and you want to understand what new outcomes,
  affordances, and competitive levers it creates — beyond the obvious hot takes.
  Triggers on: "analyze this announcement", "what does this mean for us",
  "tech sensemaking", "new feature dropped", "what can we do with this",
  "sensemaking on this", "strategic implications of", or any request to evaluate
  a technology change strategically. Category: Product Strategy
---

# Tech Sensemaking

Analyze a technology announcement through 4 strategic questions using Verbalized
Sampling to produce diverse, non-obvious, business-contextualized insights.

## Required Input

- **Announcement**: pasted text, URL, or description of the technology change.

No other input required — business context is loaded automatically from `Context/` files.

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

Read all 5 `Context/` files: `COMPANY.md`, `PRODUCTS.md`, `GOALS.md`, `TEAM.md`, `CONSTRAINTS.md`.

Compress into a **business context block** (~300 words) covering:
- What the business does, current products, revenue model
- Competitive position and key competitors
- Current goals and growth targets
- Key constraints (time, team, technical, strategic)
- What's already been tried or is in progress

This block is injected into every VS prompt. Rich context is the primary defense against generic outputs (FM-2).

### Phase 3 — VS Generation

Read `references/vs-prompts.md` for the 4 prompt templates.

Run each prompt with the `{announcement_summary}` and `{business_context}` substituted. Use VS-CoT variant (each output includes a `reasoning` field). All prompts use tail sampling with p < 0.10.

The 4 questions:

| # | Question | Key | What it surfaces |
|---|----------|-----|------------------|
| 1 | New Outcomes | `new_outcomes` | What's now possible — including second/third-order effects |
| 2 | New Affordances | `new_affordances` | What actions we can now take — concrete, effort-rated |
| 3 | Relative Value | `relative_value` | Which possibilities matter most for THIS business vs. competitors |
| 4 | Secret Levers | `secret_levers` | Non-obvious causal chains for durable competitive advantage |

Generate k=5 per question (20 total outputs).

### Phase 4 — Critique

Apply the 6-dimension critique framework to all 20 outputs:

For each item, check:
1. **Naive?** Would this appear in a tech journalist's hot take?
2. **Under-specified?** Could execution start this week without further research?
3. **Magical thinking?** Does this assume steps will "just work"?
4. **Ignores constraints?** Does this violate the business's real constraints (solo founder, limited time, etc.)?
5. **Base rate blind?** Is this approach known to fail in similar contexts?
6. **Over-engineered?** Is this a cannon to kill a fly given the business stage?

Triage:
- `failure_count 0-1`: Keep as-is
- `failure_count 2-3`: Generate 2 improved variants, pick the best
- `failure_count 4+`: Drop entirely

### Phase 5 — Present

Output in readable format, grouped by question. Within each question, order by probability ascending (most novel first).

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
3. **First step**: The concrete thing to do Monday morning
```

End with:
```
## What I excluded (and why)
[List 2-3 items that were dropped by the critique pass, with the failure reasons.
This shows the user what "obvious" looks like so they calibrate their own thinking.]
```

## VS Configuration Summary

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Variant | VS-CoT | Strategic reasoning needs chain-of-thought |
| Distribution | p < 0.10 | High diversity — avoid obvious takes |
| k per question | 5 | 20 total pre-critique, ~12-16 post-critique |
| FM-1 mitigation | Exclusion constraints in each prompt | "Exclude mainstream tech journalist hot takes" |
| FM-2 mitigation | Context/ files loaded into every prompt | Rich business context prevents generic drift |
| FM-3 mitigation | 4 separate problem frames + coverage requirements within each | Forces cross-frame diversity |

## Usage Notes

- The skill works best when the announcement is fresh (within days). Stale announcements produce outputs closer to what's already been discussed publicly.
- If Context/ files are thin, the outputs will drift generic. Enrich context before running on high-stakes announcements.
- For major platform shifts (not just feature announcements), consider running this skill twice: once on the announcement itself, once on the second-order market reactions 1-2 weeks later.
- The "Secret Levers" question (Q4) is the highest-value output. If time-constrained, run Q4 alone.
