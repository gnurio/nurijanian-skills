# Error Analysis Template

## Process

For each test case, record:

1. **Trace ID**: Test case ID
2. **Input Type**: How the user described the problem
3. **Expected Root Cause**: Ground truth from test case
4. **Skill Output**: What the skill produced
5. **Judge Scores**: Pass/Fail/Borderline for each judge
6. **What Went Wrong**: First failure point
7. **Error Category**: Classification

## Error Categories

### Diagnosis Errors
- **Wrong root cause level**: Skill misidentified which level is broken
- **Missed secondary level**: Skill found one root cause but missed another
- **False positive**: Skill identified problem where none exists
- **Vague assessment**: Skill used ? for all levels instead of committing

### Prescription Errors
- **Generic advice**: "Improve communication" without specifics
- **Wrong level fix**: Prescription doesn't match diagnosed root cause
- **Not actionable**: Recommendations too abstract to implement
- **Missing Robert's Rules**: No parliamentary principles referenced

### Format Errors
- **Missing sections**: Diagnosis, Prescription, or Prevention absent
- **Incomplete stack**: Missing level assessments
- **No immediate actions**: Only long-term recommendations
- **No prevention**: Missing forward-looking guidance

### Robert's Rules Errors
- **Wrong principle**: Cited incorrect parliamentary rule
- **Missing tool**: Should have suggested specific motion/procedure
- **Overcomplication**: Suggested formal rules for informal setting
- **Undercomplication**: Suggested informal approach for formal setting

## Analysis Table

| Trace ID | Input | Expected | Skill Root | Stack Judge | Prescription Judge | Format Judge | Error Category | Notes |
|----------|-------|----------|------------|-------------|-------------------|--------------|----------------|-------|
| 001 | Transcript | L3 | | | | | | |
| 002 | Description | L4 | | | | | | |
| ... | | | | | | | | |

## Failure Patterns

After reviewing all traces, group similar failures:

### Pattern 1: [Name]
**Description**: 
**Affected Traces**: 
**Root Cause**: 
**Fix**: 

### Pattern 2: [Name]
...

## Recommendations for Skill Improvement

1. **Fix immediate**: 
2. **Add examples**: 
3. **Clarify guidance**: 
4. **Strengthen judges**: 
