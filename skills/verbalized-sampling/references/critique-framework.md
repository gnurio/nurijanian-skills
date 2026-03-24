# VS Critique Framework

Six dimensions for critiquing VS outputs before presenting them. Apply after generation, before delivery.

---

## The Six Dimensions

| Dimension | Failure pattern | Diagnostic question |
|---|---|---|
| **Naivete** | Obvious, shallow — any informed person would say this | "Would this appear in a top-10 listicle on this topic?" |
| **Under-specification** | Too vague to act on without further research | "Could a team start executing this on Monday?" |
| **Magical thinking** | Assumes execution steps will work without mechanism | "What specific steps make this actually happen?" |
| **Physics of reality** | Ignores real constraints: time, budget, org, market | "What resource or structural constraint does this violate?" |
| **Base rate blindness** | Ignores empirical evidence about success rates | "What's the known success rate of this approach?" |
| **Over-thinking** | Too complex for the context or problem size | "Is this a cannon to kill a fly?" |

### Dimension Notes

**Naivete vs. Base Rate Blindness** are distinct: naivete is about idea quality (too obvious), base rate blindness is about idea validity (sounds good but historically fails). An idea can be neither naive nor obviously wrong and still be base-rate blind — e.g., "launch a referral program" sounds novel for some companies but has a documented low success rate in B2B SaaS without strong word-of-mouth foundations.

**Magical thinking vs. Physics of reality** are closely related but differ in failure mode: magical thinking fails at the mechanism level ("we'll go viral"), physics of reality fails at the constraint level ("this requires a 6-person team and we have 1"). Both can be present in the same idea.

**Over-thinking** is context-dependent — complexity that's appropriate for a Series B startup may be wildly over-engineered for a solo founder. Always evaluate relative to the stated context.

---

## Self-Critique Prompt Template

Use this prompt to get a structured critique of VS output before presenting it.

```
You are a rigorous idea critic with expertise in [domain].

Below is a set of brainstormed ideas. For each idea, evaluate it against six failure dimensions. Be specific — cite what exactly is naive, under-specified, magical, etc. Do not be diplomatic.

Context:
- Task: [original task]
- Constraints: [stated constraints]
- What's already been tried: [if known]

Ideas to critique:
[paste VS JSON output or formatted list]

For each idea, return a JSON object:
{
  "idea": "idea text",
  "scores": {
    "naive": true/false,
    "under_specified": true/false,
    "magical_thinking": true/false,
    "ignores_constraints": true/false,
    "base_rate_blind": true/false,
    "over_engineered": true/false
  },
  "failures": ["list only the dimensions that fail, with 1-sentence reason each"],
  "failure_count": integer
}

Return a JSON array of these objects. Output ONLY the JSON.
```

**Threshold**: Flag ideas with `failure_count >= 2` for improvement or removal.

---

## Iteration Prompt Template

Use this after critique to generate improved variants that address specific failures.

```
Below is an idea and its critique. Generate 3 improved variants that directly fix the identified failures while preserving the core insight.

Original idea: [idea text]
Identified failures: [paste failures array from critique output]
Context: [original task + constraints]

Requirements for each variant:
- Directly addresses each identified failure
- Remains in the same problem space as the original idea
- Is specific enough to execute without further research
- Acknowledges the real constraints in the context

Return JSON with key "variants". Each dict:
• text: the improved idea (2-3 sentences, concrete)
• fixes: list of failure dimensions this variant addresses
• trade_offs: what this variant sacrifices or requires

Output ONLY the JSON.
```

---

## Combined VS + Critique Workflow

Full workflow for high-stakes brainstorming:

```
1. CONTEXT-FIRST (see SKILL.md)
   - Decompose into subproblems
   - Load constraints, base rates, what's been tried

2. VS GENERATION
   - Run VS with rich context (tail sampling, k=5-8)
   - Use VS-CoT for complex domains

3. SELF-CRITIQUE
   - Apply self-critique prompt to all outputs
   - Identify ideas with failure_count >= 2

4. TRIAGE
   - Keep ideas with failure_count 0-1 (present as-is)
   - Flag ideas with failure_count 2+ for iteration
   - Drop ideas with failure_count 4+ (not worth fixing)

5. ITERATE
   - For flagged ideas: run iteration prompt
   - Select best variant from each iteration
   - Add to final output set

6. PRESENT
   - Show final set with readable output mode
   - Include critique summary: "X of Y original ideas were improved"
   - Optionally surface the specific failures that were corrected
```

---

## Domain-Specific Base Rates Reference

Common approaches and their known success rates — use to catch base-rate blindness:

**B2B SaaS growth:**
- Referral programs: low success rate without existing word-of-mouth; works well only when NPS > 50 and product is inherently shareable
- Cold outbound: declining open rates (~20-25% cold email opens, <5% reply rate typical); requires strong ICP specificity to work
- Content/SEO: 6-18 month lag before results; works best with high-search-volume adjacent problems
- Product-led growth: requires product that delivers clear value within first session; fails for complex B2B tools with long onboarding

**Consumer health/wellness:**
- Caloric restriction alone: high short-term success, ~80% regain within 2 years
- Habit-stacking: works when anchored to existing strong habits; fails when the anchor habit is irregular
- Social accountability: effective for 4-12 weeks; effectiveness declines after novelty wears off

**Enterprise retention:**
- Customer success check-ins: effective when triggered by usage signals, not calendar; calendar-based check-ins show weak retention correlation
- Feature adoption campaigns: low conversion when users haven't hit core value moments first
- Pricing lock-ins (multi-year contracts): reduces churn but increases CAC and slows expansion

Add domain-specific base rates here as they are learned from your context.
