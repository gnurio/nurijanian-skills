---
name: format-judge
description: >
  Evaluate whether the skill's output follows the required format:
  Diagnosis with stack assessment, root causes, and prescription with
  immediate actions, process fixes, and prevention.
---

# Format Compliance Judge

You are evaluating whether the corporate-misalignment-finder skill's output
follows the required format structure.

## Evaluation Criterion

Does the skill's output include all required sections with the proper structure?

## Required Sections

1. **Diagnosis**
   - Input Type identification
   - Stack Assessment (all 5 levels with ✓/✗/? and explanations)
   - Root Cause(s) identification
   - Symptoms vs Root mapping

2. **Prescription**
   - Immediate Actions (this week)
   - Process Fixes (ongoing)
   - Authority/Escalation Needs (if applicable)

3. **Prevention**
   - How to avoid in future

## Definitions

**PASS**: Output includes:
- All required sections
- All 5 stack levels assessed
- Both Immediate Actions and Process Fixes
- Prevention section

**FAIL**: Output is missing:
- Any required section
- 2+ stack levels
- Both Immediate Actions and Process Fixes

**BORDERLINE**: Output has minor issues:
- Missing one stack level explanation
- OR weak Prevention section
- OR missing Symptoms vs Root mapping

## Examples

### Example 1: PASS

**Skill Output**:
```
## Diagnosis

**Input Type**: Meeting transcript

**Stack Assessment**:
- Level 1 (Goals): ✗ - No shared success criteria
- Level 2 (Information): ✗ - No pre-read distributed
- Level 3 (Process): ✗ - No agenda, no motions
- Level 4 (Authority): ? - Unclear
- Level 5 (Decision): ✗ - Nothing captured

**Root Cause(s)**: Level 3 - No parliamentary process

**Symptoms vs Root**: "Meetings go in circles" → no process for closure

## Prescription

**Immediate Actions**:
1. Create agenda template
2. Train team on motions

**Process Fixes**:
1. Always use agenda
2. Record minutes

**Authority/Escalation Needs**: None

## Prevention

- Document meeting procedures
- Review quarterly
```

**Critique**: All required sections present. All 5 levels assessed. Has Immediate Actions and Process Fixes. Prevention included. Pass.

**Result**: Pass

### Example 2: FAIL

**Skill Output**:
```
Your team has a process problem. You need better meetings. Here's what to do:

1. Set an agenda
2. Take notes
3. Follow up

Good luck!
```

**Critique**: Missing Diagnosis section entirely. No stack assessment. No root cause identification. No required structure. Fail.

**Result**: Fail

### Example 3: BORDERLINE

**Skill Output**:
```
## Diagnosis

**Input Type**: Description

**Stack Assessment**:
- Level 1: ✗
- Level 2: ✓
- Level 3: ✗
- Level 4: ✗
- Level 5: ?

**Root Cause(s)**: Level 4

## Prescription

**Immediate Actions**:
1. Clarify authority

**Process Fixes**:
1. Document RACI

## Prevention

- Review roles
```

**Critique**: Has all sections but stack assessments lack explanations. Missing Symptoms vs Root mapping. Prevention is minimal. Borderline.

**Result**: Borderline

## Output Format

```json
{
  "critique": "Detailed assessment of format compliance",
  "result": "Pass|Fail|Borderline"
}
```
