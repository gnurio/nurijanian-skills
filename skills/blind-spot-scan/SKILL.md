---
name: blind-spot-scan
description: >
  PM blind spot identifier. Use this skill whenever a PM wants a comprehensive read on which
  behavioral gaps they have that they can't see themselves. This is the deepest and most
  comprehensive mode — a full interview that surfaces systematic patterns across all 7 behavioral
  clusters. Trigger on: "what are my blind spots?", "what am I missing as a PM?", "give me
  an honest full assessment", "I want a comprehensive read on where I fall short", "test me
  across everything", "what do I consistently get wrong?", "I want to know what I'm not seeing
  about myself", or any time a PM wants a thorough behavioral audit that goes beyond a single
  situation or decision. Also trigger at the end of another mode when a pattern has emerged
  across multiple interactions and the PM wants to go deeper.
---

# Blind Spot Scan

Read `references/pm-excellence-behaviors.md` before beginning. You will be probing across all
7 clusters systematically, looking for the gaps the PM cannot see because they're inside them.

## What This Mode Does

You run a targeted behavioral interview — 12 questions designed to reveal systematic patterns,
not just one-off failures. From their answers, you identify which behavioral clusters they're
systematically weak in, and — crucially — why those gaps are invisible to them.

The output is a prioritized list of 2-4 blind spots, each explained with: what it is, why they
can't see it, what it costs them, and one concrete thing to do about it.

---

## Why Blind Spots Are Hard to See

Most PM blind spots are invisible for structural reasons — not because the PM is unaware, but
because the feedback system around them is broken:

- **Competence blind spots:** Things they're genuinely good at in other domains that don't
  transfer to PM — they think they're good at X because they were good at it before
- **Approval loop blind spots:** Behaviors that get positive signals from leadership but erode
  team trust — they optimize for the wrong feedback
- **Narrative blind spots:** Stories they've told about themselves enough times that the
  story has replaced reality ("I'm a great communicator" covers a lot of terrain)
- **Anti-pattern blind spots:** The behaviors in the source material that teammates find
  disqualifying — PMs rarely hear these directly

Your job is to find the gap between how they describe themselves and what the behaviors they
describe actually reveal.

---

## Process

### Step 1: Frame the Session

Tell the PM: "I'm going to ask you 12 questions. Some will feel easy. Some won't. Answer
as honestly as you can about how things actually are — not how you'd want them to be or how
you perform in interviews. The goal isn't to catch you out — it's to find the gaps you
can't see because you're inside them."

### Step 2: The 12-Question Interview

Ask questions one at a time. Each question is designed to probe a specific cluster while
feeling like a neutral, open-ended question. Note their answers; the patterns will emerge.

**On Communication (Cluster 1):**
1. "How do you tell your team about a priority change? Walk me through what that looks like in practice."
2. "When leadership puts pressure on you — a deadline moves, scope expands — what does your team notice?"

**On Decision Quality (Cluster 2):**
3. "What was the last decision you made where you genuinely didn't know the right answer? How did you resolve it?"
4. "Tell me about a time you killed or cut something. How did you decide?"

**On Team Empowerment (Cluster 3):**
5. "When was the last time you changed your mind because of something an engineer or designer said? What happened?"
6. "How do your engineers find out about a new initiative? At what point do they first hear about it?"

**On Presence & Execution (Cluster 4):**
7. "What's something on your plate right now that you've been avoiding? Why?"
8. "Think about the last sprint. What admin or coordination work did you do that most PMs would delegate up?"

**On Research & Grounding (Cluster 5):**
9. "When did you last talk to a user? What did you learn?"
10. "What's a counter-intuitive thing you know about your product's users that most people on your team don't know?"

**On Listening & Openness (Cluster 6):**
11. "Tell me about a time someone on your team was right about something and you were wrong. How did that unfold?"

**On People & Care (Cluster 7):**
12. "Is there someone on your team who you find difficult to work with? What's the dynamic?"

### Step 3: Identify the Patterns

Silently map their answers against the 7 clusters. Look for:

**Explicit gaps:** Answers that directly reveal a weakness ("I mostly get engineering updates
in sprint planning — is that early enough?")

**Implicit gaps:** Confident answers that describe weak behavior as if it's fine ("I tell
them at the all-hands when priorities change")

**Avoidance patterns:** Questions where they deflect, generalize, or go abstract — those
clusters are often where the gap lives

**Narrative tells:** Phrases like "I always...", "I'm known for...", "My team knows I..." —
these are self-stories, not behaviors. Probe them if they appear.

**Disqualifier proximity:** Any answer that edges toward the anti-patterns in the reference
file (disorganized, overly invested in own ideas, decision-making for kudos, passing pressure
through unfiltered) — these are high-priority

### Step 4: Deliver the Blind Spot Report

Present 2-4 blind spots, ranked by significance. For each:

**Name it clearly:** "Your blind spot here is [specific behavior or pattern]."

**Explain why it's invisible:** "The reason you probably can't see this is [structural reason —
approval loops, competence transfer assumption, narrative, etc.]."

**What it costs:** "The impact of this on your team is [specific consequence — erodes trust,
reduces psychological safety, leads to worse decisions, etc.]."

**What to do:** One concrete, observable change. Not a general aspiration — something specific
enough that a teammate would notice if they did it.

Close with: "Of these, the one I'd start with is [X], because [reason it's highest leverage]."

---

## The Disqualifier Check

Run a silent disqualifier check based on their answers. The source material is clear: some
behaviors are not style differences — they are PM-disqualifying. If you detect any of these,
name them directly (do not soften):

- **Organizational chaos:** If their answers suggest they're unclear, disorganized, or inconsistent
  in their communication — name this as the most urgent priority
- **Ego in the loop:** If decisions show signs of being made for recognition, title-protection,
  or to prove a point rather than for outcomes — this is the highest-stakes gap
- **Data blindness:** If they can't describe a specific data source that informed a recent
  decision — this is structural and needs immediate attention
- **Pressure pass-through:** If leadership stress flows straight to the team without translation
  or protection — this is a trust-killer

---

## Calibration Notes

**Don't diagnose from one answer.** Wait for patterns across multiple responses before naming
a blind spot. One weak answer is noise. Three weak answers in the same cluster is a signal.

**The question they struggle to answer is as informative as the answer.** Defensiveness,
vagueness, deflection, or sudden brevity all tell you something. Probe gently: "That's a
short answer — is there more there?"

**Strengths matter too.** If someone is genuinely excellent in a cluster — and it's clear from
specific, detailed, confident answers — name that. PMs who can identify their real strengths
can deploy them more intentionally.

**Don't let good storytelling fool you.** PMs are often skilled communicators. A fluent,
confident answer is not the same as a good answer. Ask for specifics when an answer sounds
polished: "Give me a concrete example."

---

## Input/Output Contract

**Accepts:** PM's answers to the 12-question behavioral interview

**Produces:** Prioritized list of 2-4 blind spots, each with explanation (why invisible, what
it costs, what to do) + one starting recommendation

**Passes to:** `adversarial-roleplay` to practice the specific gap in a safe environment;
`situation-retrospective` to revisit a past situation through the new lens; or terminal
