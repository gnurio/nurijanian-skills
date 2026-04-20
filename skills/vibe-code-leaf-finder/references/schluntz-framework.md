# The Schluntz Leaf-vs-Trunk Framework

Source: Erik Schluntz (Member of Technical Staff, Anthropic), *Vibe coding in prod*, Code w/ Claude, May 2025. https://www.youtube.com/watch?v=fHWFF_pnqDk

## The Core Idea

When AI writes your code, you cannot responsibly read every line at the pace AI produces it. So you stop reading code and start verifying *behavior* — with one caveat.

> "There is not a good way to measure or validate tech debt without reading the code yourself. Most other systems in life... you have ways to verify the things you care about without knowing the implementation. Tech I think is one of those rare things where there really isn't a good way to validate it other than being an expert in the implementation itself."
> — Schluntz

Because tech debt can't be verified from outside, **containment is the strategy**. Vibe code where tech debt is cheap. Don't vibe code where tech debt compounds.

## Definitions

### Leaf nodes
> "Parts of the code and parts of our system that nothing depends on them. They are kind of the end feature. They're the end bell or whistle."

Properties:
- Zero downstream dependencies.
- End-feature, not a foundation.
- Unlikely to change.
- Unlikely to have further things built on them.

> "It's kind of okay if there is tech debt in these leaf nodes because nothing else depends on them."

### Trunks and branches
> "The core architecture that we as engineers still need to deeply understand because that's what's going to change. That's what other things are going to be built on and it's very important that we protect those and make sure that they stay extensible and understandable and flexible."

Properties:
- Imported by many files.
- Registers global behavior (middleware, plugins, migrations, routes).
- Actively evolving.
- Future features will build on top.

## The Containment Argument

1. You cannot verify tech debt without reading the code.
2. Reading all AI-generated code defeats the point of AI-generated code.
3. Therefore: constrain AI-written code to places where local tech debt does not radiate outward.
4. Leaf nodes are those places.

## Concrete Example: The 22,000-Line Change

Schluntz cites a 22,000-line change to a production reinforcement learning codebase:
- Change completed in **one day** instead of two weeks.
- AI-generated code concentrated in leaf nodes not expected to change soon.
- Trunk-adjacent parts got **heavy human review**.
- Verification via **stress tests** running for long durations, plus input/output checks.

> "We designed this system to be understandable and verifiable even without us reading all the code."

## Rules of Thumb from the Talk

1. **Containment**: "Focus your vibe coding on the leaf nodes so that if there is tech debt, it's contained and it's not in important areas."
2. **Verifiability**: Design features so inputs and outputs are human-verifiable from the outside.
3. **Stress testing**: For leaves with important behavior, run stress tests for long durations as a verification substitute for code reading.
4. **PM mindset**: "Forget that the code exists but not that the product exists."
5. **Mode mix**: Schluntz uses Claude Code to explore and draft, then switches to direct editing in Cursor for targeted changes when he knows the exact lines.

## Model Caveat

> "The models are getting better all the time... with Claude 4 over the last week or two within Anthropic I've given them much more trust than I did with 3.7."

As models improve, the leaf/trunk boundary moves outward — more of the codebase becomes safe to vibe code. Re-audit quarterly.

## The Closing Frame

Schluntz ends with: **"Be Claude's PM."**

He meant it for engineers. It applies even more directly to actual PMs: you already know how to ship work you didn't implement. Leaf nodes are where you can start doing it in code.
