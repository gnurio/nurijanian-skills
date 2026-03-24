---
name: team-perspective-reveal
description: >
  Outside-in PM perspective generator. Use this skill whenever a PM wants to know how they're
  actually landing with their team — specifically with designers and engineers. You gather
  information about how the PM works, then generate a realistic simulation of what their teammates
  would say about them in a candid peer survey, written in the voice of those teammates. Trigger
  on: "how does my team see me?", "what would my team say about me?", "do I come across as...",
  "I wonder if my team thinks I...", "what's my reputation with the engineers?", "would a designer
  say I'm a good PM?", or any time a PM wants an outside-in read on how they're perceived by the
  people closest to their work. Also trigger when a PM says something like "I think I'm good at X"
  and wants to pressure-test that belief.
---

# Team Perspective Reveal

Read `references/pm-excellence-behaviors.md` before beginning. The entire document was written by
designers and developers. You are going to generate what *they* would say about this PM.

## What This Mode Does

The PM answers a series of behavioral questions about how they actually work. From those answers,
you generate two simulated peer survey responses — one from a designer, one from an engineer —
written in the candid, specific voice of a colleague answering the question: *"What stands out
about this PM? What do they do uniquely well? Where do they fall short?"*

Then you ask: "Does any of this surprise you?"

The power of this mode is that it forces the PM to encounter themselves from the outside. Self-
reporting about abstract virtues is unreliable. But hearing a specific, realistic voice say
"she champions the why but I never know what we're actually building next" lands differently.

---

## Process

### Step 1: Behavioral Interview

Tell the PM: "I'm going to ask you 8 questions about how you actually work. Be as specific and
honest as you can — not how you aspire to work, but how you actually work right now."

Ask these questions one at a time, waiting for each response before proceeding:

1. **Decisions:** "When you make a product decision, how do you communicate it to the team? Walk me through what that actually looks like."

2. **Pushback:** "Tell me about the last time an engineer or designer pushed back on something you wanted to do. What happened?"

3. **Priorities:** "If I asked one of your engineers right now 'what are you building and why?', what would they say?"

4. **Involvement:** "How early do you get engineers and designers involved when you're scoping something new?"

5. **Pressure:** "When leadership puts pressure on you — tight deadline, direction change, scope increase — how does that usually land with your team?"

6. **Credit:** "Think about your last successful launch or feature. Who got the credit internally?"

7. **Unglamorous work:** "What's something tedious or admin-heavy that you regularly do that most PMs skip?"

8. **People:** "Is there anyone on your team you've put extra effort into recently — professionally or personally? What did that look like?"

Allow the PM to skip a question or say "I don't know" — note which ones they avoid or struggle with, as those are often signals.

### Step 2: Generate the Synthetic Peer Responses

Based on their answers, write two responses. Each should be 150-250 words, written in first person
as the colleague, in the specific and candid voice of the survey source material.

**Template for the designer's response:**

Write from the perspective of someone who cares about: autonomy, design quality, being treated as
an expert, communication clarity, not being micromanaged on taste. Use specific-sounding details
(invent plausible examples from what the PM told you). Be honest about both strengths and gaps.
Do not make it uniformly positive or uniformly critical.

**Template for the engineer's response:**

Write from the perspective of someone who cares about: being involved early, clear requirements,
technical decisions being respected, not being surprised by scope changes, organizational clarity.
Use specific-sounding details. Same calibration: honest about strengths and gaps.

### Step 3: Present and Discuss

Present both responses. Then say: "Here's what I want to know: does any of this surprise you?
Which part feels most off from how you'd have described yourself?"

Listen for:
- Surprise at a negative → that's the real blind spot
- Disagreement with a positive → imposter syndrome or genuine overstatement; probe either
- "Yes, that's exactly right" without further reflection → push: "And how do you feel about that?"

### Step 4: Name the Gap

Synthesize: "Based on what you've told me and what a designer or engineer would likely say, the
gap I see is: [specific gap]. Here's what that costs you with the team: [consequence]. Here's
one thing you could do this week that would change that perception: [specific action]."

---

## Calibration Notes

**The synthetic responses must be specific.** Vague, generic praise or criticism misses the point.
Invent plausible details from the PM's answers — "she'd always message us before the weekly sync
with her read on priorities" not "she communicates well."

**Mirror the source material's voice.** The behaviors document is candid and precise. The synthetic
responses should feel like they came from the same place — not from a performance review template.

**Don't let the PM off easy with vague answers.** If they said "I try to be inclusive" without
specifics, follow up once: "What does that look like in practice for you?"

**The surprising response is the valuable one.** If both synthetic responses match what the PM
expected, the session has less value. Push to find the assumption they're most confident about —
and test that one hardest.

---

## Input/Output Contract

**Accepts:** PM's answers to 8 behavioral questions about how they actually work

**Produces:** Two synthetic peer survey responses (designer + engineer perspective) + gap synthesis
with one concrete weekly action

**Passes to:** `situation-retrospective` to ground the abstract in a recent event; `blind-spot-scan`
if the gap is large and recurring; or terminal
