# PM Alignment Skills

PM coaching skills for Claude Code and Cursor, grounded in what designers and engineers actually say about their best product managers.

## What's inside

| Skill | What it does |
|-------|-------------|
| `pm-alignment:orchestrate-pm-alignment` | Entry point — detects what you need and routes you to the right mode |
| `pm-alignment:situation-retrospective` | Debrief a real situation against the 7 PM excellence clusters |
| `pm-alignment:team-perspective-reveal` | Simulate what your team would say about you in a peer survey |
| `pm-alignment:adversarial-roleplay` | Practice live with a frustrated designer or engineer, then debrief |
| `pm-alignment:decision-audit` | Audit whether a past decision was high quality — not just whether it worked out |
| `pm-alignment:blind-spot-scan` | Full interview to surface the behavioral patterns you can't see yourself |

## Installation

Clone this repo and run the install script:

```bash
git clone https://github.com/gnurio/nurijanian-skills.git
cd nurijanian-skills
node bin/install.js
```

This copies the skills to `~/.claude/skills/pm-alignment/`.

## Usage

In Claude Code, invoke the main entry point:

```
/pm-alignment:orchestrate-pm-alignment
```

Or start any mode directly:

```
/pm-alignment:situation-retrospective
/pm-alignment:blind-spot-scan
/pm-alignment:adversarial-roleplay
```

In Cursor, reference skills by their path in your prompt.

## The framework

All skills draw from a behavioral framework synthesized from a survey of designers and developers: *"What stands out about the best product manager you've ever worked with?"*

The framework covers 7 clusters: Communication, Decision Quality, Team Dynamics, Execution, Strategy, Customer Orientation, and Self-Awareness.

## Uninstall

```bash
rm -rf ~/.claude/skills/pm-alignment
```
