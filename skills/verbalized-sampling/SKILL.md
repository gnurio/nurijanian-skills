---
name: verbalized-sampling
description: >
  Generate diverse outputs by prompting for a probability distribution instead of a single response.
  Implements Verbalized Sampling (VS) from Zhang et al. 2025 — a training-free technique that counteracts
  LLM mode collapse caused by typicality bias in alignment data.

  Use when the task needs genuine diversity: creative writing, brainstorming/ideation, synthetic data
  generation, persona/dialogue simulation, adversarial examples, open-ended QA with multiple valid
  answers, or any situation where "generate 5 ideas" keeps returning the same cluster.

  Do NOT use for: single correct answer tasks, factual lookup, strict format compliance.
---

# Verbalized Sampling

## Universal VS Template

```
[Task description with rich context]

Generate {k} responses. Return in JSON format with key "{output_key}" (list of dicts). Each dict:
• text: [output specification]
• probability: estimated probability (0.0–1.0) of this response given the input

{Distribution constraint}

Output ONLY the JSON object.
```

**Distribution constraints — pick one:**
- `Sample from the full distribution.` — balanced, moderate diversity
- `Sample from the tails of the distribution, with each probability below 0.10.` — high diversity
- `Sample from the tails of the distribution, with each probability below 0.01.` — maximum diversity

## Variant Selection

| Variant | When to use | Trade-off |
|---|---|---|
| **VS-Standard** | Straightforward tasks, speed priority | Best balance |
| **VS-CoT** | Complex tasks needing quality + diversity | Slight diversity cost, higher quality |
| **VS-Multi** | Maximum diversity, token cost acceptable | Best diversity, 2× token cost |

**VS-CoT**: add `"reasoning": "step-by-step thought process"` as the first field in each dict.

**VS-Multi**: Turn 1 generates k/2 responses. Turn 2: "Generate k alternative responses to the original prompt — do not repeat ideas from Turn 1."

## Context-First Phase (run before VS)

VS outputs are only as good as the problem framing going in. Before constructing the VS prompt:

**Step 1 — Decompose into subproblems:**
Break the task into 3–5 distinct subproblems or angles. Example: "improve sales for a B2B SaaS" → (1) acquisition channels, (2) conversion from trial, (3) pricing/packaging, (4) referral/word-of-mouth, (5) partnerships.

**Step 2 — Load context for each subproblem:**
- What are the real constraints? (time, budget, team size, org politics, market saturation)
- What do others in this space actually do? (base rates — what approaches are common, what have failed)
- What has already been tried? (avoid re-suggesting)

**Step 3 — Inject context into the VS prompt:**
Compress answers from Step 2 into the prompt preamble. Name the subproblems as explicit coverage requirements: "Cover at least one idea addressing each of: [subproblem 1], [subproblem 2], ..."

If you cannot answer Step 2 without asking the user, **ask first** before generating. Generic outputs caused by thin context are the primary failure mode for brainstorming tasks (FM-2).

## Critique-and-Improve Loop (run after VS, before presenting)

After generating VS output, run a self-critique pass before presenting results. See `references/critique-framework.md` for the full 6-dimension framework and prompt templates.

**Quick pass:**
For each output item, check:
1. Is this naive/obvious? (would it appear in a top-10 listicle?)
2. Is this actionable? (could execution start Monday without further research?)
3. Does this require magical thinking? (assumes steps will "just work" with no mechanism)
4. Does this ignore base rates? (approaches with known low success rates presented as good bets)

**If 2+ items fail 2+ checks:**
- Flag the specific failures with reasons
- Generate 2–3 improved variants that directly address the flagged weaknesses
- Present: original outputs + critique summary + improved variants

For automated quality scoring of VS outputs, see `references/judges.md` for LLM-as-Judge prompts.

## Output Mode Selection

**JSON mode** (default for agent pipelines — pipe-able, machine-readable):
- Use when outputs feed into downstream processing, storage, or evaluation
- Return raw JSON as-is

**Readable mode** (in-chat or external sharing):
- Format using `scripts/format_vs_output.py` (see below), or render inline as numbered markdown
- Group by diversity tier: High (p < 0.05), Moderate (p 0.05–0.15), Low/Common (p > 0.15)
- Show probabilities inline as `(p=0.07)`

To format manually in-chat:
```markdown
## High diversity (p < 0.05)
1. [text] (p=0.03)

## Moderate diversity (p 0.05–0.15)
2. [text] (p=0.08)
```

CLI formatting: `echo '<json>' | python ~/.cursor/skills/verbalized-sampling/scripts/format_vs_output.py`

## Probability Threshold Quick Reference

| Threshold | Use case |
|---|---|
| Full distribution | General brainstorm, want common + uncommon mix |
| p < 0.15 | Moderate novelty — avoids top-5 obvious answers |
| p < 0.10 | High diversity — noticeably non-obvious outputs |
| p < 0.05 | Aggressive — expect surprising, niche ideas |
| p < 0.01 | Maximum — edge cases, stress testing, adversarial |

## Failure Modes (from empirical evals)

**FM-1: Overfit Topic Collapse**
High-frequency training topics (weight loss, productivity, exercise) resist VS even at p<0.01. The tail of the model's distribution is still inside the well-known solution cluster. The paper's 1.6-2.1× diversity gains apply to creative and niche domains — not saturated self-help topics.

*Mitigation*: Add explicit exclusion constraints: "Exclude any idea covered in mainstream [domain] journalism. Prioritize ideas from adjacent fields or underrepresented subcultures."

**FM-2: Context Starvation → Generic Gravity**
Thin prompt context ("Xero + retention") produces generic-category outputs even at tail sampling. The more proprietary and specific the context, the better VS performs.

*Mitigation*: Load rich context before the VS prompt — company stage, current channels, known constraints, target segment, what's already been tried.

**FM-3: Semantic Clustering Despite Syntactic Diversity**
Tail sampling can produce a list that looks different but covers the same solution space. VS does not automatically cross problem-frame boundaries.

*Mitigation*: Name the problem frames explicitly: "Cover at least one idea from each of: distribution, pricing, community, product, and partnerships."

**FM-4: Probability Spread Collapse**
If the highest and lowest probabilities in your output are within 3× of each other (e.g., all between 0.05–0.09), you're likely in an overfit topic and diversity is illusory.

*Diagnosis signal*: Good VS output has a spread of at least 5-10× between highest and lowest probability. If spread is tight, switch to FM-1/FM-2 mitigations.

## Meta-Prompt: Generate a VS Prompt

```
I need to generate diverse {output_type} for {use_case}.

Create a Verbalized Sampling prompt that:
1. Clearly describes the task with specific context about {use_case}
2. Requests k={number} outputs in JSON format
3. Requires each output to include "text" and "probability" fields
4. Specifies a distribution constraint appropriate for the diversity level needed:
   - 0.10–0.15 for moderate diversity
   - 0.05–0.10 for high diversity
   - 0.01–0.05 for maximum diversity
5. Ends with "Output ONLY the JSON"
6. Includes explicit problem-frame coverage if topic is likely overfit
```

## Domain Templates

See `references/templates.md` for ready-to-paste prompts across: creative writing, brainstorming/ideation, dialogue simulation, synthetic data, adversarial examples, open-ended QA.

## When NOT to Use VS

- Single correct answer exists
- Factual lookup or retrieval
- Task requires strict format compliance
- You need one best answer, not a distribution
- Overfit topic with no rich context available (add context first, then re-evaluate)
