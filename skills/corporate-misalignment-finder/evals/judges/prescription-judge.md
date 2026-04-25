---
name: prescription-judge
description: >
  Evaluate whether the skill's prescribed fixes are appropriate for the
  diagnosed root causes. Checks if recommendations are specific, actionable,
  and grounded in Robert's Rules of Order principles.
---

# Prescription Judge

You are evaluating whether the corporate-misalignment-finder skill provided
appropriate fixes for the diagnosed misalignment.

## Evaluation Criterion

Are the skill's prescribed fixes appropriate for the root cause(s) diagnosed?
Do they reference Robert's Rules principles and provide specific, actionable
next steps?

## Definitions

**PASS**: The prescription:
- Directly addresses the diagnosed root cause level(s)
- References specific Robert's Rules principles (motions, voting, minutes, etc.)
- Provides specific, actionable next steps (not generic advice)
- Includes both immediate actions and process fixes

**FAIL**: The prescription:
- Does not address the actual root cause
- Is generic ("improve communication") without specific mechanisms
- Contradicts the diagnosis
- Missing critical actions needed

**BORDERLINE**: The prescription:
- Partially addresses root cause
- Lacks Robert's Rules grounding
- OR is actionable but misses key elements

## Robert's Rules Principles Reference

Valid prescriptions may reference:
- **Motions**: Main motion, Previous Question, Postpone, Amend, etc.
- **Precedence**: Understanding order of motions
- **Voting**: Majority vs two-thirds, quorum requirements
- **Minutes**: Recording decisions, vote counts
- **Agenda**: Orders of the day, proper business
- **Debate**: Recognition, time limits, decorum
- **Authority**: Bylaws, charter, delegation

## Examples

### Example 1: PASS

**Root Cause**: Level 3 (Process) - no parliamentary process in meetings.

**Skill Prescription**: 
"1. Set agenda with decision items marked
2. Use motions: 'I move we prioritize...' 
3. Require seconds for all motions
4. Recognize speakers (no interruptions)
5. Use Previous Question to close debate when needed
6. Record votes and decisions in minutes"

**Critique**: Specific actions directly addressing Level 3 process issues. References specific parliamentary tools (motions, seconds, Previous Question, minutes). Actionable and grounded in Robert's Rules. Pass.

**Result**: Pass

### Example 2: FAIL

**Root Cause**: Level 4 (Authority) - collision between VP Eng and VP Product.

**Skill Prescription**:
"The VPs should have better communication and align on shared goals. They should meet weekly to build rapport and understand each other's perspectives. Communication is key to resolving conflicts."

**Critique**: Generic communication advice does not address Level 4 authority collision. No mention of RACI, decision rights, or escalation. No Robert's Rules principles. This is relationship advice, not misalignment fixing. Fail.

**Result**: Fail

### Example 3: BORDERLINE

**Root Cause**: Level 5 (Decision) - decisions not captured, keep being revisited.

**Skill Prescription**:
"Document decisions in meeting minutes. Make sure everyone knows what was decided."

**Critique**: Addresses Level 5 but lacks specificity. What should minutes include? How to prevent reconsideration? Missing Robert's Rules specifics about vote counts, notices to absentees, or reconsideration thresholds. Borderline.

**Result**: Borderline

### Example 4: PASS

**Root Cause**: Level 4 (Authority) - unclear who can spend over $500K.

**Skill Prescription**:
"Immediate: Review bylaws to clarify spending authority. Document which decisions require board approval vs CFO approval vs VP approval.
Process: Establish procurement policy with clear authority matrix. Create motion format for budget requests: 'I move to authorize $X for Y purpose.' Record authorization votes in minutes per §48."

**Critique**: Directly addresses Level 4 with specific actions. References minutes recording (§48). Includes both immediate and ongoing fixes. Specific and actionable. Pass.

**Result**: Pass

## Output Format

```json
{
  "critique": "Detailed assessment of prescription quality and appropriateness",
  "result": "Pass|Fail|Borderline"
}
```
