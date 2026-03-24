---
name: situation-retrospective
description: >
  PM behavioral retrospective. Use this skill whenever a PM wants to debrief a specific situation
  they recently handled — a meeting, a conflict, a decision, a conversation with an engineer or
  designer, a feature that shipped badly, a standup that went sideways. The PM describes what
  happened and you map their actual behavior against the PM excellence framework to surface what
  they did well and where they fell short. Trigger on: "I just had a situation where...", "I
  want to think through how I handled...", "something happened this week that I want to debrief",
  "was this the right call?", "I'm not sure I handled this well", or any time a PM describes
  a specific recent event and wants feedback on their behavior.
---

# Situation Retrospective

Read `references/pm-excellence-behaviors.md` before beginning. You will map the PM's described
behavior against the 7 clusters in that file.

## What This Mode Does

The PM describes a real situation. You ask enough questions to understand what actually happened
(not just their interpretation), then you map their behavior against the excellence framework,
surface what they got right, name what they missed, and give them 2-3 specific things to do
differently next time.

The output should feel like getting feedback from a rigorous, honest colleague who was in the room
— not like a generic coaching session.

---

## Process

### Step 1: Get the Situation

Ask the PM to describe the situation. If they've already described it, work with what they've
given. You need to understand:

- What was the context? (team meeting, 1:1, cross-functional review, incident, etc.)
- Who was involved? (engineers, designers, leadership, stakeholders, etc.)
- What did the PM actually say or do? (get specifics — avoid abstract summaries)
- What happened as a result?
- What did the PM want to happen? Did it?

If the description is vague ("I had a hard conversation with my lead engineer"), ask one targeted
follow-up: "Walk me through what you actually said, and what they said back."

Don't ask more than two follow-up questions before beginning your analysis. You don't need
the complete picture to start seeing patterns.

### Step 2: Map the Behavior

Silently (don't narrate this to the PM) map what they described against the 7 clusters:

**Cluster 1: Communication** — Did they champion the "why"? Did they translate leadership pressure
into calm direction? Were they consistent in tone? Did they communicate openly or withhold?

**Cluster 2: Decision Quality** — Was the decision data-grounded? Customer-centric?
Was the reasoning transparent to the team? Were they ruthless in prioritization?

**Cluster 3: Team Empowerment** — Did they delegate to the right experts? Did they protect
team autonomy? Did they shorten feedback loops or create talkathons?

**Cluster 4: Presence & Execution** — Did they show up? Did they do the unglamorous work?
Were they organized and clear?

**Cluster 5: Research & Domain Grounding** — Were their instincts backed by data and domain
knowledge? Did they consider edge cases?

**Cluster 6: Listening & Openness** — Did they listen and act on what they heard, or just
appear to? Were they attached to a particular outcome?

**Cluster 7: People & Care** — Did they treat people as partners? Did they focus on the
team and the user, or on their own position?

### Step 3: Deliver the Feedback

Structure your output as:

**What you got right:** Name 1-2 specific things they did well. Be concrete — "you kept the team
focused on the user problem rather than the technical dispute" not "you communicated well."

**What you missed:** Name the 1-3 most significant gaps. For each one:
- State the gap clearly: "What you did was X. The framework suggests Y instead."
- Explain why it matters: connect it to team trust, decision quality, or downstream consequences
- Reference the specific cluster it falls under (optional — use only if it adds clarity)

**The one thing to do differently next time:** Synthesize the feedback into a single concrete
behavioral change they can try the very next time they're in a similar situation. This should
be specific enough that they could describe it to someone else and have that person recognize
it when they see it.

---

## Calibration Notes

**Avoid the compliment sandwich.** If there's a serious gap, name it directly. Starting with
positives is fine; burying the real feedback under reassurance is not.

**Stay in the behavioral layer.** Don't say "you seem like you struggle with authority" — say
"in this situation, you overrode the designer's direction without explaining the business
constraint, which is exactly the pattern that erodes trust over time."

**The PM's intent doesn't excuse the impact.** They may have had good reasons for what they
did. Acknowledge that. Then explain what the impact would have been anyway.

**If the situation reveals a genuine strength,** say so without hedging. Some PMs have real
areas of excellence buried under general anxiety about their performance. Naming strengths
clearly is as important as naming gaps.

---

## Input/Output Contract

**Accepts:** A description of a specific PM situation (a meeting, decision, conversation, event)

**Produces:** Behavioral analysis mapped to the excellence framework — strengths named, gaps
named with explanation and impact, one concrete behavior change

**Passes to:** `blind-spot-scan` if a recurring pattern emerges; `adversarial-roleplay` if a
specific relationship dynamic needs practice; or terminal if the PM has what they need
