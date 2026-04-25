# Evaluation Workflow for Corporate Misalignment Finder

## Overview

This document describes how to iterate on the skill using synthetic evals, error
analysis, and judges to achieve perfect performance.

## Workflow Steps

### Step 1: Generate Synthetic Test Cases ✓ COMPLETE

**What we did:**
- Created 5 dimensions for variation: input type, root cause level, context,
  severity, symptom
- Generated 20 diverse test cases covering all combinations
- Each test case includes expected diagnosis with stack assessment

**Files:**
- `evals/synthetic-data/dimensions.md` — Dimension definitions
- `evals/synthetic-data/test-cases.json` — 20 test cases with ground truth

### Step 2: Run Skill Against Test Cases

**Automated:**
```bash
cd evals
export ANTHROPIC_API_KEY=sk-ant-...
node auto-eval.js
```

**Single test:**
```bash
node auto-eval.js --test 001
```

**Manual approach:**
Copy test case input from `synthetic-data/test-cases.json`, paste into Claude/Cursor
with skill loaded, save output to `evals/results/test-{id}.json`

### Step 3: Apply Judges

**Three judges to evaluate each output:**

1. **Stack Diagnosis Judge** — Did skill identify correct root cause level(s)?
2. **Prescription Judge** — Are fixes appropriate and grounded in Robert's Rules?
3. **Format Judge** — Does output follow required structure?

**Judge invocation:**
```
Judge prompt + skill output + expected diagnosis → Pass/Fail/Borderline
```

**Files:**
- `evals/judges/stack-diagnosis-judge.md`
- `evals/judges/prescription-judge.md`
- `evals/judges/format-judge.md`

### Step 4: Error Analysis

**Categorize failures:**

| Category | Description | Example |
|----------|-------------|---------|
| Wrong level | Misidentified root cause | Said Level 3 when it's Level 4 |
| Generic prescription | No specific mechanisms | "Improve communication" |
| Missing RR grounding | No Robert's Rules reference | Should cite Previous Question |
| Format violation | Missing required section | No Prevention section |
| Wrong tool | Suggested inappropriate mechanism | Formal motion for 3-person startup |

**Document in:**
- `evals/error-analysis/batch-{date}.md`

### Step 5: Update Skill

**Based on error patterns:**

1. **Add examples** for failing cases
2. **Clarify guidance** where judges disagreed
3. **Strengthen Robert's Rules references** where missing
4. **Adjust tone** if too formal/too casual for context

### Step 6: Validate Improvement

**Re-run failed test cases:**
- If judge now passes → improvement confirmed
- If still fails → deeper analysis needed

**Target metrics:**
- Stack Diagnosis Judge: >90% Pass
- Prescription Judge: >90% Pass
- Format Judge: >95% Pass

### Step 7: Iterate

**Repeat until targets met.**

Common iteration patterns:
- **Early iterations**: Fix format issues, add missing sections
- **Middle iterations**: Improve diagnosis accuracy
- **Late iterations**: Strengthen Robert's Rules grounding

## Example Iteration

### Iteration 1: Format Issues
**Problem**: Skill missing Prevention section
**Fix**: Add explicit requirement for Prevention section
**Result**: Format Judge passes

### Iteration 2: Generic Prescriptions
**Problem**: Skill saying "improve communication" without specifics
**Fix**: Add guidance to reference specific motions, voting, minutes
**Result**: Prescription Judge passes

### Iteration 3: Wrong Level Identification
**Problem**: Skill missing Level 4 (Authority) collisions
**Fix**: Add examples of authority conflicts, clarify vs Level 1
**Result**: Stack Diagnosis Judge passes

## Integration with NotebookLM Expert

**Use the Robert's Rules notebook as expert reviewer:**

1. After each skill update, ask notebook:
   - "Does this correctly apply [specific rule]?"
   - "What are common errors when using [motion]?"
   - "Is this prescription appropriate for this situation?"

2. Use notebook feedback to:
   - Correct misapplications of parliamentary procedure
   - Add nuance for edge cases
   - Strengthen examples

**Notebook query patterns:**
```
"In Robert's Rules, when should Previous Question be used vs Postpone?"
"What's the difference between a Point of Order and Parliamentary Inquiry?"
"How should minutes record a contested decision?"
```

## Files Overview

```
corporate-misalignment-finder/
├── SKILL.md                          # Main skill (iterate on this)
├── references/
│   ├── roberts-rules-framework.md   # Key principles
│   └── roberts-rules.txt            # Full text (for expert queries)
├── evals/
│   ├── synthetic-data/              # Ground truth
│   ├── judges/                      # Evaluation prompts
│   ├── error-analysis/              # Failure patterns
│   └── results/                     # Outputs to evaluate
└── EVAL_WORKFLOW.md                 # This file
```

## Success Criteria

The skill is "perfect" when:

1. **All 20 test cases** pass all 3 judges
2. **Error analysis** reveals no systematic failure patterns
3. **NotebookLM expert** confirms correct application of Robert's Rules
4. **Edge cases** handled gracefully (multi-level, vague inputs)

## Next Steps

1. Run skill against all 20 test cases (manual or automated)
2. Apply judges to outputs
3. Document failures in error analysis
4. Update SKILL.md based on patterns
5. Re-run failing cases
6. Repeat until perfect
