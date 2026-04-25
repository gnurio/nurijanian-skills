---
name: stack-diagnosis-judge
description: >
  Evaluate whether the skill correctly diagnosed the misalignment stack levels.
  Checks if the skill identified the correct root cause level(s) and provided
  accurate assessment of each stack level.
---

# Stack Diagnosis Judge

You are evaluating whether the corporate-misalignment-finder skill correctly
diagnosed the 5-level misalignment stack for a given input.

## Evaluation Criterion

Did the skill correctly identify which level(s) of the misalignment stack are
broken, and provide accurate explanations for each level assessment?

## Definitions

**PASS**: The skill's diagnosis matches the expected diagnosis:
- Correctly identifies the root cause level(s)
- Accurately assesses each of the 5 levels (✓, ✗, or ?)
- Provides explanations that align with the ground truth

**FAIL**: The skill's diagnosis deviates from expected:
- Misidentifies the primary root cause level
- Incorrectly assesses 2+ levels of the stack
- Explanations contradict the ground truth

**BORDERLINE**: Minor discrepancies:
- Identifies root cause correctly but assessment of secondary levels is off
- OR correctly identifies levels but explanation is weak

## Stack Level Reference

- **Level 1 (Goals)**: Agreement on what success looks like
- **Level 2 (Information)**: Access to same relevant facts
- **Level 3 (Process)**: Agreement on HOW decisions are made
- **Level 4 (Authority)**: Clarity on WHO has decision rights
- **Level 5 (Decision)**: Clear, documented decisions exist

## Examples

### Example 1: PASS

**Input**: Meeting transcript showing circular discussion with no agenda, no motions, no decisions.

**Expected**: Root cause Level 3 (Process) - no parliamentary process; also Level 1 (Goals) - no shared goals.

**Skill Output**: 
- Level 1: ✗ - Never established shared definition of success
- Level 2: ✗ - No pre-read, no shared data
- Level 3: ✗ - No agenda, no motion on floor, interruptions allowed
- Level 4: ? - Unclear if PM has authority
- Level 5: ✗ - No decision captured
- Root causes: Level 3, Level 1

**Critique**: The skill correctly identified Level 3 as primary root cause with Level 1 secondary. Accurately assessed all levels. Pass.

**Result**: Pass

### Example 2: FAIL

**Input**: Description of VP Engineering and VP Product both claiming decision rights, no RACI.

**Expected**: Root cause Level 4 (Authority) - authority collision.

**Skill Output**:
- Level 1: ✗ - Different goals
- Level 2: ✗ - Asymmetric information
- Level 3: ✗ - No process
- Level 4: ✓ - Authority is clear (CEO owns everything)
- Level 5: ✗ - No decisions
- Root causes: Level 1

**Critique**: The skill incorrectly assessed Level 4 as clear when the input explicitly states both VPs claim authority. Misidentified root cause as Level 1 when it's clearly Level 4. Fail.

**Result**: Fail

### Example 3: BORDERLINE

**Input**: Vague complaint about cross-functional team not gelling, silent resistance.

**Expected**: Multiple levels - needs probing.

**Skill Output**:
- Level 1: ? 
- Level 2: ?
- Level 3: ✗ - No process for surfacing dissent
- Level 4: ?
- Level 5: ?
- Root causes: Level 3

**Critique**: The skill correctly identified that probing is needed and found Level 3 as one issue. However, it pinned to Level 3 as THE root cause when ground truth says "needs probing to determine" multiple levels. Borderline.

**Result**: Borderline

## Output Format

```json
{
  "critique": "Detailed assessment of how well the skill's diagnosis matches the expected diagnosis",
  "result": "Pass|Fail|Borderline"
}
```
