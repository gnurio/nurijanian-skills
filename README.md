# nurijanian-skills

A growing collection of Claude Code and Cursor skills for product managers.

These skills are part of [PM OS](https://www.prodmgmt.world/products/pm-os) — an AI workspace for product managers built inside Cursor and Claude Code, with 190+ skills, 168 frameworks, and 7 guided workflows. If you want the full system, start there. If you want just these skills, install them below.

## Installation

```bash
git clone https://github.com/gnurio/nurijanian-skills.git
cd nurijanian-skills
node bin/install.js
```

Skills are installed to `~/.claude/skills/`.

## Uninstall

```bash
rm -rf ~/.claude/skills/pm-alignment
```

Uninstall a single skill:

```bash
rm ~/.claude/skills/pm-alignment/focal-point-finder.md
```

---

## Skills

### PM Alignment

PM coaching grounded in what designers and engineers actually say about their best product managers. A survey of the people closest to PMs surfaces 7 behavioral clusters that separate great from average.

| Skill | What it does |
|-------|-------------|
| `pm-alignment:orchestrate-pm-alignment` | Entry point — detects what you need and routes you to the right mode |
| `pm-alignment:situation-retrospective` | Debrief a real situation against the 7 PM excellence clusters |
| `pm-alignment:team-perspective-reveal` | Simulate what your team would say about you in a peer survey |
| `pm-alignment:adversarial-roleplay` | Practice live with a frustrated designer or engineer, then debrief |
| `pm-alignment:decision-audit` | Audit whether a past decision was high quality — not just whether it worked out |
| `pm-alignment:blind-spot-scan` | Full interview to surface the behavioral patterns you can't see yourself |

Start here:

```
/pm-alignment:orchestrate-pm-alignment
```

---

### Verbalized Sampling

Implements Verbalized Sampling (Zhang et al. 2025) — a training-free technique that counteracts LLM mode collapse caused by typicality bias. Instead of asking for a single response, it prompts for a probability distribution over outputs to generate genuine diversity.

Use when the task needs real variety: creative writing, brainstorming, synthetic data generation, persona simulation, adversarial examples, or any situation where "generate 5 ideas" keeps returning the same cluster.

```
/verbalized-sampling
```

---

### Tech Sensemaking

Analyzes technology announcements to surface non-obvious strategic implications using Verbalized Sampling. Works against any context — a business, product, codebase, feature branch, personal project, career, or exploratory domain. Goes beyond obvious hot takes to find new outcomes, affordances, and competitive levers a technology change creates.

Trigger on: "analyze this announcement", "what does this mean for us", "what can we do with this", "strategic implications of X".

```
/tech-sensemaking
```

---

### Focal Point Finder

Find, evaluate, or create focal points in coordination and negotiation problems. Based on Thomas Schelling's *The Strategy of Conflict* — the foundational game theory text on how people converge on outcomes without explicit agreement.

Use when multiple parties need to align on a single choice (a standard, a deadline, a boundary, a price, a process) and no one has the authority to dictate the answer. The skill walks through scanning for existing focal points, diagnosing why convergence is failing, and creating or proposing a focal point using 7 Schelling-grounded techniques.

Trigger on: "where should we align?", "how do we get everyone on the same page?", "find a focal point", "Schelling point", "coordination problem", "propose a standard", "set a default".

```
/focal-point-finder
```
