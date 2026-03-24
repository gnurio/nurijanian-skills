# Tech Sensemaking — VS Prompt Templates

4 prompt templates, one per sensemaking question. Replace `{announcement_summary}` and `{business_context}` before use. All use VS-CoT variant with tail sampling (p < 0.10).

---

## Q1: New Outcomes

```
A technology announcement has just been made. Your job is to identify what new outcomes are now possible — not just the direct capabilities the technology enables, but second-order and third-order effects: societal shifts, behavioral changes, market dynamics, and knock-on consequences that create exploitable opportunities.

ANNOUNCEMENT:
{announcement_summary}

BUSINESS CONTEXT:
{business_context}

Generate 5 responses. Return in JSON with key "new_outcomes". Each dict:
• reasoning: step-by-step thought process connecting the announcement to the outcome
• text: the new outcome (2-3 sentences, concrete, specific to this business)
• probability: estimated probability (0.0–1.0) of this being suggested given the input
• time_horizon: "near-term" (<3mo), "medium" (3-12mo), or "long-term" (>12mo)
• order: "first" (direct), "second" (consequence of direct), or "third" (consequence of consequence)

Constraints:
- Exclude any outcome that would appear in a mainstream tech journalist's hot take within 48 hours of this announcement
- At least 2 outcomes must be second-order or third-order effects
- Each outcome must reference a specific aspect of the business context
- Cover at least one outcome from each of: product capability, market dynamics, user behavior shift

Sample from the tails of the distribution, with each probability below 0.10.

Output ONLY the JSON object.
```

---

## Q2: New Affordances

```
A technology announcement has just been made. Your job is to identify what new actions are now possible — new affordances this technology gives practitioners, builders, and businesses. Focus on what you can now DO that you couldn't before, or what existing actions become dramatically cheaper/faster/better.

ANNOUNCEMENT:
{announcement_summary}

BUSINESS CONTEXT:
{business_context}

Generate 5 responses. Return in JSON with key "new_affordances". Each dict:
• reasoning: step-by-step thought process connecting the technology to the affordance
• text: the new affordance (2-3 sentences — what action is now possible, and why it matters for this business)
• probability: estimated probability (0.0–1.0) of this being suggested given the input
• time_horizon: "near-term" (<3mo), "medium" (3-12mo), or "long-term" (>12mo)
• effort: "trivial" (hours), "light" (days), "moderate" (weeks), or "heavy" (months)

Constraints:
- Exclude any affordance that restates the announced feature's marketing copy
- Each affordance must describe a concrete action a solo founder or small team could take, not a theoretical possibility
- Cover at least one affordance from each of: product development, content/distribution, pricing/packaging, workflow automation

Sample from the tails of the distribution, with each probability below 0.10.

Output ONLY the JSON object.
```

---

## Q3: Relative Value

```
A technology announcement has just been made. Your job is to assess which of the new possibilities matter most for THIS specific business given its competitive position, goals, and constraints. Not all new capabilities are equally valuable — some are table stakes, some are irrelevant, and a few might be asymmetric advantages.

ANNOUNCEMENT:
{announcement_summary}

BUSINESS CONTEXT:
{business_context}

Generate 5 responses. Return in JSON with key "relative_value". Each dict:
• reasoning: step-by-step analysis of why this matters more (or less) for this business than for competitors
• text: the strategic implication (2-3 sentences — what's uniquely valuable here and why competitors can't leverage it the same way)
• probability: estimated probability (0.0–1.0) of this being suggested given the input
• asymmetry: "strong" (we can exploit this and competitors cannot easily), "moderate" (advantage but replicable), or "weak" (everyone benefits equally)
• urgency: "act now" (first-mover window <4 weeks), "act soon" (1-3 months), or "monitor" (no urgency)

Constraints:
- Exclude generic "this is good for everyone" observations — every item must explain the differential advantage or disadvantage
- At least 2 items must have asymmetry "strong" — if you cannot find 2, say so explicitly and explain why this announcement creates no asymmetric advantage
- Reference specific competitors, market segments, or business constraints from the context

Sample from the tails of the distribution, with each probability below 0.10.

Output ONLY the JSON object.
```

---

## Q4: Secret Levers

```
A technology announcement has just been made. Your job is to identify non-obvious causal relationships and hidden levers — actions that, if taken quietly or early, would create a durable edge against competitors. Think: what would a strategist do with this information that a content creator would miss?

ANNOUNCEMENT:
{announcement_summary}

BUSINESS CONTEXT:
{business_context}

Generate 5 responses. Return in JSON with key "secret_levers". Each dict:
• reasoning: the causal chain — what you do, what it causes, why the advantage compounds
• text: the lever (2-3 sentences — the specific action, the mechanism, and the resulting edge)
• probability: estimated probability (0.0–1.0) of this being suggested given the input
• visibility: "invisible" (competitors won't notice until it's too late), "low-profile" (noticeable but not alarming), or "visible" (competitors will see and may copy)
• compounding: true/false — does this advantage grow over time or is it a one-shot benefit?

Constraints:
- Exclude anything that amounts to "write a blog post about this" or "be first to tweet about it" — content plays are not secret levers
- Each lever must have a clear causal mechanism: action → intermediate effect → competitive advantage
- At least 2 levers must be "invisible" visibility — if you cannot find 2, explain why this announcement doesn't enable hidden moves
- Prioritize levers from adjacent fields, non-obvious integrations, or structural advantages over marketing tactics

Sample from the tails of the distribution, with each probability below 0.10.

Output ONLY the JSON object.
```
