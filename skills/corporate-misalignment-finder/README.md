# Corporate Misalignment Finder

Find, diagnose, and fix misalignment in corporate settings using parliamentary procedure principles from Robert's Rules of Order (12th Edition).

## When to Use

Trigger this skill when:
- "We're misaligned"
- "Can't get everyone on the same page"
- "Meetings are a waste of time"
- "Who's supposed to decide this?"
- "Too many cooks"
- "Analysis paralysis"
- "Nothing gets decided"
- "People aren't following the process"
- "Decisions keep getting revisited"
- "Silent resistance" — people nod then don't execute

## The Misalignment Stack

Misalignment happens at 5 levels. The skill diagnoses which level(s) are broken:

| Level | Name | Diagnostic Question | Fix Category |
|-------|------|---------------------|--------------|
| 1 | Goals | Does everyone agree on what success looks like? | Goal Alignment |
| 2 | Information | Does everyone have the same relevant facts? | Info Sync |
| 3 | Process | Is there agreement on HOW to decide? | Process Fix |
| 4 | Authority | Is it clear WHO has decision rights? | Authority Resolution |
| 5 | Decision | Is there a clear, documented decision? | Decision Capture |

Misalignment at lower levels cascades up. Fix Level 1 first.

## How It Works

1. **Input Clarification**: The skill accepts explicit descriptions, meeting transcripts, decision logs, or vague complaints
2. **Stack Diagnostic**: Assesses all 5 levels with ✓ (pass), ✗ (fail), or ? (unclear)
3. **Root Cause ID**: Identifies the lowest broken level as primary root cause
4. **Prescription**: Provides immediate actions and process fixes grounded in Robert's Rules
5. **Prevention**: Suggests how to avoid recurrence

## Robert's Rules Integration

The skill draws on:
- **Point of Order** (§23): Enforcing rules and protecting rights
- **Parliamentary Inquiry** (§33): Clarifying procedure
- **Question of Privilege** (§19): Addressing urgent rights/compensation issues
- **Previous Question** (§16): Closing debate to force decision
- **Motions precedence**: Understanding order of business
- **Minutes requirements**: Documenting decisions properly
- **Voting thresholds**: When majority vs two-thirds is needed
- **Quorum rules**: Minimum participation for valid decisions

## Evals Structure

```
evals/
├── synthetic-data/
│   ├── dimensions.md       # Test case dimensions
│   └── test-cases.json     # 20 diverse test cases
├── error-analysis/
│   └── template.md         # Error categorization template
├── judges/
│   ├── stack-diagnosis-judge.md    # Evaluates root cause accuracy
│   ├── prescription-judge.md       # Evaluates fix appropriateness
│   └── format-judge.md             # Evaluates output structure
└── results/                # Evaluation outputs
```

## Test Case Coverage

20 synthetic test cases covering:
- **Input types**: Transcripts, descriptions, decision logs, vague complaints
- **Root causes**: All 5 levels + multi-level cases
- **Contexts**: Startup, enterprise, non-profit, cross-functional, leadership
- **Symptoms**: Meetings dragging, decisions revisited, silent resistance, authority conflicts, analysis paralysis

## Judges

Three binary (Pass/Fail/Borderline) judges:

1. **Stack Diagnosis Judge**: Did the skill correctly identify which stack level(s) are broken?
2. **Prescription Judge**: Are the fixes appropriate for the root cause and grounded in Robert's Rules?
3. **Format Judge**: Does the output follow the required structure?

## Automated Evaluation

The skill includes a complete automated evaluation pipeline:

```bash
cd evals

# Demo (no API key required)
node demo-eval.js

# Full evaluation (requires Anthropic API key)
export ANTHROPIC_API_KEY=sk-ant-...
node auto-eval.js

# Single test case
node auto-eval.js --test 001

# Skip judging (faster, just generate outputs)
node auto-eval.js --skill-only
```

### Evaluation Pipeline

1. **Skill Runner** — Executes skill against 20 test cases via LLM API
2. **Judge Evaluator** — Three LLM-as-judges score each output (Pass/Fail/Borderline)
3. **Report Generator** — Produces:
   - `summary.md` — Pass rates vs thresholds
   - `error-analysis.md` — Categorized failures with recommendations
   - `detailed.md` — Per-test breakdown with critiques

### Success Thresholds

| Judge | Target | Description |
|-------|--------|-------------|
| Stack Diagnosis | 90% | Correctly identifies root cause level(s) |
| Prescription | 90% | Fixes appropriate and grounded in Robert's Rules |
| Format | 95% | Output follows required structure |

### Iteration Workflow

1. Run `node auto-eval.js`
2. Review `summary.md` — are thresholds met?
3. Read `error-analysis.md` — what patterns emerge?
4. Update `SKILL.md` based on recommendations
5. Re-run and validate improvement
6. Repeat until all thresholds met

See `evals/README.md` for detailed documentation.

## Manual Evaluation

For manual testing without automation:

```bash
# Load skill and run single test case
cat evals/synthetic-data/test-cases.json | jq '.[0].input'
# Copy output, invoke skill, compare to expected diagnosis
```

## Files

- `SKILL.md` — Main skill prompt
- `references/roberts-rules-framework.md` — Key principles from 12th Edition
- `references/roberts-rules.txt` — Full text of Robert's Rules (1.4M chars)
- `README.md` — This file

## Integration

Install with the main skills package:
```bash
npx nurijanian-skills
```

Or link for development:
```bash
node bin/install.js --link
```

Invoke as:
```
/corporate-misalignment-finder
```
