# Tech Sensemaking — VS Prompt Templates

4 prompt templates, one per sensemaking question. Replace `{announcement_summary}` and `{context_block}` before use. All use VS-CoT variant with tail sampling (p < 0.10).

The `{context_block}` is a ~300-word compressed summary of whatever the user is analyzing the announcement against — a business, product, codebase, personal project, role, etc. See SKILL.md Phase 2 for how it gets built.

---

## Q1: New Outcomes

```
A technology announcement has just been made. Your job is to identify what new outcomes are now possible — not just the direct capabilities the technology enables, but second-order and third-order effects: behavioral changes, market dynamics, workflow shifts, and knock-on consequences that create exploitable opportunities.

ANNOUNCEMENT:
{announcement_summary}

CONTEXT (what to analyze against):
{context_block}

Generate 5 responses. Return in JSON with key "new_outcomes". Each dict:
• reasoning: step-by-step thought process connecting the announcement to the outcome
• text: the new outcome (2-3 sentences, concrete, specific to this context)
• probability: estimated probability (0.0–1.0) of this being suggested given the input
• time_horizon: "near-term" (<3mo), "medium" (3-12mo), or "long-term" (>12mo)
• order: "first" (direct), "second" (consequence of direct), or "third" (consequence of consequence)

Constraints:
- Exclude any outcome that would appear in a mainstream tech journalist's hot take within 48 hours of this announcement
- At least 2 outcomes must be second-order or third-order effects
- Each outcome must reference a specific aspect of the context
- Cover at least one outcome from each of: capability shift, market/ecosystem dynamics, user/practitioner behavior change

Sample from the tails of the distribution, with each probability below 0.10.

Output ONLY the JSON object.
```

---

## Q2: New Affordances

```
A technology announcement has just been made. Your job is to identify what new actions are now possible — new affordances this technology gives practitioners, builders, and operators. Focus on what can now be DONE that couldn't before, or what existing actions become dramatically cheaper/faster/better.

ANNOUNCEMENT:
{announcement_summary}

CONTEXT (what to analyze against):
{context_block}

Generate 5 responses. Return in JSON with key "new_affordances". Each dict:
• reasoning: step-by-step thought process connecting the technology to the affordance
• text: the new affordance (2-3 sentences — what action is now possible, and why it matters for this context)
• probability: estimated probability (0.0–1.0) of this being suggested given the input
• time_horizon: "near-term" (<3mo), "medium" (3-12mo), or "long-term" (>12mo)
• effort: "trivial" (hours), "light" (days), "moderate" (weeks), or "heavy" (months)

Constraints:
- Exclude any affordance that restates the announced feature's marketing copy
- Each affordance must describe a concrete action that could realistically be taken given the stated constraints, not a theoretical possibility
- Cover at least one affordance from each of: building/development, distribution/reach, efficiency/automation, strategic positioning

Sample from the tails of the distribution, with each probability below 0.10.

Output ONLY the JSON object.
```

---

## Q3: Relative Value

```
A technology announcement has just been made. Your job is to assess which of the new possibilities matter most for THIS specific context given its position, goals, and constraints. Not all new capabilities are equally valuable — some are table stakes, some are irrelevant, and a few might be asymmetric advantages.

ANNOUNCEMENT:
{announcement_summary}

CONTEXT (what to analyze against):
{context_block}

Generate 5 responses. Return in JSON with key "relative_value". Each dict:
• reasoning: step-by-step analysis of why this matters more (or less) for this context than for alternatives or competitors
• text: the strategic implication (2-3 sentences — what's uniquely valuable here and why others can't leverage it the same way)
• probability: estimated probability (0.0–1.0) of this being suggested given the input
• asymmetry: "strong" (exploitable advantage that others cannot easily replicate), "moderate" (advantage but replicable), or "weak" (everyone benefits equally)
• urgency: "act now" (first-mover window <4 weeks), "act soon" (1-3 months), or "monitor" (no urgency)

Constraints:
- Exclude generic "this is good for everyone" observations — every item must explain the differential advantage or disadvantage
- At least 2 items must have asymmetry "strong" — if you cannot find 2, say so explicitly and explain why this announcement creates no asymmetric advantage for this context
- Reference specific competitors, alternatives, constraints, or goals from the context

Sample from the tails of the distribution, with each probability below 0.10.

Output ONLY the JSON object.
```

---

## Q4: Secret Levers

```
A technology announcement has just been made. Your job is to identify non-obvious causal relationships and hidden levers — actions that, if taken quietly or early, would create a durable edge. Think: what would a strategist do with this information that a content creator would miss?

ANNOUNCEMENT:
{announcement_summary}

CONTEXT (what to analyze against):
{context_block}

Generate 5 responses. Return in JSON with key "secret_levers". Each dict:
• reasoning: the causal chain — what to do, what it causes, why the advantage compounds
• text: the lever (2-3 sentences — the specific action, the mechanism, and the resulting edge)
• probability: estimated probability (0.0–1.0) of this being suggested given the input
• visibility: "invisible" (others won't notice until it's too late), "low-profile" (noticeable but not alarming), or "visible" (others will see and may copy)
• compounding: true/false — does this advantage grow over time or is it a one-shot benefit?

Constraints:
- Exclude anything that amounts to "write a blog post about this" or "be first to tweet about it" — content plays are not secret levers
- Each lever must have a clear causal mechanism: action → intermediate effect → advantage
- At least 2 levers must be "invisible" visibility — if you cannot find 2, explain why this announcement doesn't enable hidden moves
- Prioritize levers from adjacent fields, non-obvious integrations, or structural advantages over marketing tactics

Sample from the tails of the distribution, with each probability below 0.10.

Output ONLY the JSON object.
```
