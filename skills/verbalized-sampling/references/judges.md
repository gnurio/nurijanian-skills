# VS Output Judges

Four binary Pass/Fail LLM-as-Judge prompts for evaluating Verbalized Sampling outputs.
Each judge checks exactly one failure dimension. Run independently; do not combine into one holistic judge.

**Input to each judge**: task context + single idea text (not the full VS output list).
**Output**: `{"critique": "...", "result": "Pass" | "Fail"}`
**Critique must come before result** — forces the judge to reason before deciding.
**Model**: use the most capable model available; optimize for cost only after alignment is confirmed.

---

## Judge 1: Magical Thinking + Physics of Reality

**What it checks**: Does the idea assume execution steps will work without stating a mechanism, or does it ignore real structural constraints (time, budget, team, market)?

### Pass/Fail Definitions

**PASS**: The idea either (a) names a concrete mechanism for how it would be executed, or (b) is simple enough that no mechanism needs stating. Constraints are not obviously violated given the stated context.

**FAIL**: The idea relies on one or more of:
- Vague causal leaps ("we'll go viral", "users will love it", "the market will respond")
- Unnamed third parties who will simply do what the idea requires
- Resources, team capacity, or infrastructure not present in the context
- Steps that require solving a hard problem that the idea treats as trivially solved
- Circular reasoning ("we'll grow because more users leads to more users")

### Prompt

```
You are evaluating whether a brainstormed idea relies on magical thinking or ignores real-world constraints.

Task context: {task_context}
Idea: {idea_text}

## Definitions

PASS: The idea names a concrete mechanism or is simple enough not to need one. Any required resources, skills, or infrastructure are either present in the context or the idea explicitly accounts for acquiring them.

FAIL: The idea contains at least one of:
- A vague causal leap with no stated mechanism ("we'll go viral", "users will adopt this")
- An unnamed actor who is assumed to cooperate without reason (partners, press, users)
- A resource requirement (team, budget, infrastructure) not present in the context and not addressed
- A hard sub-problem treated as trivially solved
- Circular logic that restates the goal as the mechanism

Return JSON only:
{"critique": "detailed assessment citing specific phrases or steps in the idea that pass or fail", "result": "Pass or Fail"}
```

### Few-Shot Examples

**Example 1 — PASS (clear)**
Task context: B2B SaaS, 2-person team, $5K/month marketing budget, targeting solo PMs at startups.
Idea: "Launch a free PMF Audit tool on the website. A user answers 10 questions about their product validation process; the tool generates a personalized gap report. The full report (with recommendations) is gated behind email signup. Estimated build time: 2-3 days with an LLM API."

Critique: The idea names a concrete mechanism (10-question quiz → gap report), the build is scoped to available team capacity (2-3 days), acquisition mechanism is specified (gated report → email capture), and the resource requirement (LLM API) is realistic for the budget. No magical steps.
Result: Pass

**Example 2 — FAIL (clear)**
Task context: B2B SaaS, 2-person team, $5K/month marketing budget, targeting solo PMs at startups.
Idea: "Partner with major consulting firms like McKinsey and Deloitte to bundle prodmgmt.world into their client engagements, giving us access to hundreds of enterprise PMs."

Critique: The idea assumes McKinsey and Deloitte will agree to bundle an unknown B2B SaaS with no enterprise track record, negotiated by a 2-person team with no existing relationships. The mechanism for how this partnership gets established is absent. Enterprise partnership cycles typically take 6-18 months and require legal, procurement, and executive sign-off — none of which the stated context can support. This is magical thinking: the mechanism is "big firms will partner with us."
Result: Fail

**Example 3 — FAIL (borderline)**
Task context: B2B SaaS, targeting senior PMs at mid-size tech companies.
Idea: "Build a LinkedIn content engine: post 3x per week with frameworks and case studies, grow to 10K followers, then convert followers to trials via DMs."

Critique: The mechanism (post content → followers → DMs → trials) is sequential and partially plausible, but contains a magical step: the conversion from 10K followers to trials via DMs. LinkedIn DM-to-trial conversion rates for cold outreach are typically 1-3%; the idea doesn't account for the effort required to reach 10K followers (typically 12-18 months for niche B2B accounts), nor does it address why followers would convert via DM rather than through the website. The "grow to 10K followers" step is treated as a foregone conclusion rather than a hard sub-problem. Borderline: the first part (content engine) is executable; the conversion mechanism is underspecified.
Result: Fail

---

## Judge 2: Base Rate Blindness

**What it checks**: Does the idea ignore or contradict known empirical success rates for this type of approach in this domain?

### Pass/Fail Definitions

**PASS**: The idea is either (a) an approach with a positive or neutral empirical track record in the stated domain, or (b) explicitly acknowledges low base rates and proposes a specific mechanism that addresses why this instance would differ.

**FAIL**: The idea proposes an approach that has a documented low success rate in this domain, with no acknowledgment of the base rate and no stated mechanism for why this instance would outperform the historical average.

### Prompt

```
You are evaluating whether a brainstormed idea ignores the empirical track record of similar approaches in its domain.

Task context: {task_context}
Idea: {idea_text}

## Definitions

PASS: The approach has a positive or neutral empirical track record for this type of company/context, OR the idea explicitly acknowledges a low base rate and provides a concrete differentiating mechanism (why this instance will succeed when most similar attempts fail).

FAIL: The approach has a documented low success rate for this type of company/context, AND the idea presents it as a straightforward good bet without acknowledging the base rate or proposing a differentiating mechanism.

Common base rate failures by domain:
- B2B SaaS: referral programs without existing word-of-mouth, cold outbound without strong ICP targeting, content/SEO without budget for 12+ month runway, viral loops in non-inherently-shareable tools
- Consumer health: single-intervention weight loss solutions (high short-term success, ~80% regress within 2 years), habit apps without accountability structures
- Enterprise retention: calendar-based check-ins (vs. usage-triggered), feature adoption campaigns before users hit core value

Return JSON only:
{"critique": "cite the specific approach and its known base rate; explain whether the idea acknowledges or ignores this", "result": "Pass or Fail"}
```

### Few-Shot Examples

**Example 1 — PASS (clear)**
Task context: B2B SaaS with NPS of 62, 300 active customers, primarily spread by word-of-mouth already.
Idea: "Launch a formal referral program: existing customers get 1 month free for each successful referral. Referrals already account for ~30% of new signups; this formalises the existing behaviour and amplifies it."

Critique: The idea correctly identifies that word-of-mouth is already present (30% of signups). Referral programs work when there is existing word-of-mouth to amplify — this is the condition under which referral programs have positive base rates. The idea doesn't ignore the base rate; it implicitly demonstrates it is in the good-base-rate regime.
Result: Pass

**Example 2 — FAIL (clear)**
Task context: Early-stage B2B SaaS, 50 customers, NPS unknown, primarily sold via founder outreach.
Idea: "Launch a referral program where customers get discounts for referring peers. Word-of-mouth is the most powerful B2B growth channel."

Critique: Referral programs in B2B SaaS without existing organic word-of-mouth have a poor track record — they formalise behaviour that isn't happening, creating administrative overhead without driving referrals. The idea cites "word-of-mouth is powerful" as justification without evidence that this product has the conditions (high NPS, inherently shareable workflow, dense professional networks among customers) under which referral programs succeed. The base rate for referral programs at this company stage and NPS-unknown state is poor.
Result: Fail

**Example 3 — FAIL (borderline)**
Task context: Consumer weight loss app, targeting adults 30-50.
Idea: "Add a 30-day challenge feature with daily check-ins and streaks. Habit streaks create accountability and improve retention."

Critique: Streak-based habit loops have a mixed empirical track record in consumer health. They work well for novelty-driven engagement in the first 2-4 weeks but show declining effectiveness beyond that — most streak-based features see a sharp drop in active use around days 21-30 as novelty wears off. The idea presents streaks as a straightforward retention mechanism without acknowledging this pattern or proposing what happens at day 31. It's not wildly wrong, but it's presenting a known-declining-returns approach as if it reliably solves retention. Borderline: the idea is reasonable but ignores the medium-term base rate.
Result: Fail

---

## Judge 3: Context Sufficiency

**What it checks**: Was enough context loaded before generation for the outputs to be specific to this situation, or are the outputs generic enough to apply to any company in this space?

### Pass/Fail Definitions

**PASS**: The idea could only have been generated for this specific task context — it references or depends on specific constraints, conditions, or characteristics that are particular to the stated context.

**FAIL**: The idea is generic enough to appear in a list of "top ideas for [broad category]" without any of the specific context provided. Removing the context from the prompt would not change the output.

### Prompt

```
You are evaluating whether a brainstormed idea is genuinely specific to the stated context or is generic enough to apply to any company/situation in this space.

Task context: {task_context}
Idea: {idea_text}

## Definitions

PASS: The idea depends on or references specific elements of the context — the company's stage, existing channels, constraints, customer segment, or competitive position. If the context were swapped for a different company in the same space, this idea would need to change.

FAIL: The idea is generic. It would appear in any "top 10 ideas for [broad category]" article. Swapping in a different company's name would leave the idea unchanged. The specific context provided adds no value to the output.

Test: mentally replace the company name with a generic placeholder and re-read. If the idea reads identically, it fails.

Return JSON only:
{"critique": "cite specific elements of the context that the idea does or does not reference; apply the swap test", "result": "Pass or Fail"}
```

### Few-Shot Examples

**Example 1 — PASS (clear)**
Task context: prodmgmt.world — solo founder, newsletter with 1,200 subscribers (Saturdays), B2B SaaS targeting PMs at Series A-C startups, existing Polar.sh billing integration, no outbound sales team.
Idea: "Build a Slack bot that surfaces relevant PM frameworks from the prodmgmt.world library contextually when users are in a meeting or writing a PRD — the Slack install becomes the distribution channel, bypassing cold outbound entirely."

Critique: The idea is specific to this context in three ways: (1) it references the existing library of PM frameworks as the content asset, (2) it identifies Slack as the distribution channel specifically because the company has no outbound team (the stated constraint), (3) it targets the workflow moment (PRD writing, meetings) specific to the target customer segment (PMs). Replacing "prodmgmt.world" with a generic SaaS company would require redesigning the core idea.
Result: Pass

**Example 2 — FAIL (clear)**
Task context: prodmgmt.world — solo founder, newsletter with 1,200 subscribers, B2B SaaS targeting PMs at Series A-C startups.
Idea: "Improve customer onboarding by creating a welcome email sequence that guides new users through key features."

Critique: This idea applies to every SaaS product in existence. It does not reference the newsletter as an asset, the PM-specific customer segment, the solo founder constraint, or any other element of the stated context. Replacing "prodmgmt.world" with "any SaaS" leaves the idea unchanged. This would appear in any "SaaS retention 101" article.
Result: Fail

**Example 3 — FAIL (borderline)**
Task context: Xero accounting SaaS, mid-market SMB segment, high churn among customers in Year 2 post-onboarding.
Idea: "Create a customer health score dashboard for the customer success team, combining login frequency, feature adoption depth, and support ticket volume to predict churn 60 days in advance."

Critique: The idea is partially specific — it correctly identifies Year 2 as the churn risk window (from the context) and names three health score signals. However, predictive churn scoring for customer success teams is a standard SaaS retention playbook that appears in every CS tool's documentation. The specific signals (login frequency, feature adoption, support tickets) are generic defaults, not derived from Xero's specific churn patterns or the SMB segment's behaviour. The idea shows awareness of the context but doesn't push into what is specific about Xero's situation. Borderline: has context-aware framing but generic execution.
Result: Fail

---

## Judge 4: Actionability

**What it checks**: Is the idea specific enough that a team could begin executing it this week, or does it require substantial further research and specification before any action is possible?

### Pass/Fail Definitions

**PASS**: The idea names a concrete first action, has a clear owner type, and doesn't require another brainstorming session to figure out what to do. A team could write a project brief from this idea without asking clarifying questions about the core approach.

**FAIL**: The idea is a direction, not a plan. Executing it would first require answering "but what exactly do we do?" — the idea names a category of action without specifying the action. Or the idea requires skills/tools not present in the context without naming how to acquire them.

### Prompt

```
You are evaluating whether a brainstormed idea is actionable enough to begin executing without further research or specification.

Task context: {task_context}
Idea: {idea_text}

## Definitions

PASS: The idea names a specific action (not just a category of action), implies a clear owner type, and could be turned into a project brief without asking "but what exactly do we build/do?" A team member reading this could start working on it this week.

FAIL: The idea describes a direction rather than an action. Executing it requires answering additional questions about the core approach (not just implementation details). Examples:
- "Improve our onboarding" (direction) vs. "Add an in-app checklist with 4 steps: upload first invoice, connect bank account, invite an accountant, set up a recurring expense" (action)
- "Explore partnerships" (direction) vs. "Reach out to the top 5 Xero-adjacent SaaS tools by shared customer overlap and propose a co-marketing webinar" (action)
- "Use AI to personalise the experience" (direction) vs. "Use the customer's industry (from signup data) to pre-populate the dashboard with industry-relevant chart templates" (action)

Return JSON only:
{"critique": "identify whether a specific action is named or only a direction; cite what would need to be answered before execution could start", "result": "Pass or Fail"}
```

### Few-Shot Examples

**Example 1 — PASS (clear)**
Task context: B2B SaaS, 2-person team, targeting solo PMs at startups.
Idea: "Build a 10-question PMF diagnostic on the website. Users answer questions about their validation process; the tool generates a personalised gap report using GPT-4o. The full report is gated behind email signup. Build time estimated at 2-3 days."

Critique: The idea names a specific artifact (10-question diagnostic), a specific output (gap report), a specific technology (GPT-4o), a specific conversion mechanism (email gate), and a specific build estimate. A developer could start this today. No further research into "what exactly are we building" is needed — only implementation details remain.
Result: Pass

**Example 2 — FAIL (clear)**
Task context: B2B SaaS, 2-person team, targeting solo PMs at startups.
Idea: "Leverage AI to create personalised experiences for each user segment."

Critique: "Leverage AI" and "personalised experiences" are both category labels, not actions. Before execution could begin, the team would need to answer: what AI capability, what data, which user segments, what would personalisation look like, in which part of the product, measured how? This idea requires a full scoping session before any action is possible. It is a direction, not an actionable idea.
Result: Fail

**Example 3 — PASS (borderline)**
Task context: Enterprise SaaS, customer success team of 5, targeting companies with 50-500 employees.
Idea: "Build a churn prediction model that flags at-risk accounts 60 days before renewal. Use login frequency, feature adoption, and support volume as inputs. Surface alerts in the CS team's Slack channel."

Critique: The idea names specific inputs (login frequency, feature adoption, support volume), a specific output channel (Slack), a specific lead time (60 days), and a specific team owner (CS). However, "build a churn prediction model" still contains implementation ambiguity — does this mean a statistical model, an ML model, a rule-based threshold system, or buying a CS tool? A team could start scoping this week, but would need to make a build-vs-buy decision before work begins. The idea is more actionable than most but leaves one significant decision open. Borderline: the core approach is specified, one architectural decision is not.
Result: Pass

---

## Running Judges in Batch

To score a full VS output set, run each judge against each idea individually. Suggested pipeline:

```python
# Pseudocode for batch judge execution
ideas = vs_output["ideas"]  # list of dicts with "text" field
task_context = "..."

for idea in ideas:
    for judge in [judge_magical_thinking, judge_base_rate, judge_context, judge_actionability]:
        result = call_llm(judge.prompt.format(
            task_context=task_context,
            idea_text=idea["text"]
        ))
        idea[judge.name] = result  # {"critique": "...", "result": "Pass|Fail"}

# Summary
for idea in ideas:
    failures = [j for j in judges if idea[j.name]["result"] == "Fail"]
    idea["failure_count"] = len(failures)
    idea["failed_judges"] = failures
```

**Action thresholds:**
- `failure_count == 0`: present as-is
- `failure_count == 1`: present with the single critique noted
- `failure_count == 2-3`: run iteration prompt, replace with best improved variant
- `failure_count == 4`: drop; not worth improving
