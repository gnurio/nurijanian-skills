# Synthetic Data Dimensions for Corporate Misalignment Finder

## Purpose
Generate diverse test cases to evaluate the skill's ability to diagnose and fix
corporate misalignment across the 5-level stack.

## Dimensions

### Dimension 1: Input Type
What form does the user's input take?
- **Explicit description**: User clearly states the problem
- **Meeting transcript**: Raw dialogue showing dysfunction
- **Decision log**: History of attempted decisions
- **Vague complaint**: "Things aren't working" - needs probing

### Dimension 2: Root Cause Level
Which level(s) of the misalignment stack is broken?
- **Level 1 (Goals)**: Different objectives, competing incentives
- **Level 2 (Information)**: Asymmetric information, lack of transparency
- **Level 3 (Process)**: No clear decision-making protocol
- **Level 4 (Authority)**: Unclear who can decide
- **Level 5 (Decision)**: Decisions not captured or communicated
- **Multi-level**: Multiple levels broken (cascading failure)

### Dimension 3: Organizational Context
What type of organization/situation?
- **Startup**: Fast-moving, informal, flat hierarchy
- **Enterprise**: Bureaucratic, formal, matrix org
- **Non-profit**: Board-driven, mission-focused, volunteer-led
- **Cross-functional team**: Multiple departments, dotted lines
- **Leadership team**: C-suite/executive, high stakes

### Dimension 4: Severity/Urgency
How critical is the misalignment?
- **Blocking**: Work cannot proceed
- **Slowing**: Work continues but inefficiently
- **Chronic**: Long-standing pattern of dysfunction
- **Emerging**: New team/situation, catching early

### Dimension 5: Surface Symptom
What does the user complain about?
- **Meetings drag on**: No clear outcomes, circular discussion
- **Decisions get revisited**: Same issues keep coming up
- **Silent resistance**: Appear aligned but don't execute
- **Authority conflict**: Multiple people claim decision rights
- **Information hoarding**: Key data not shared
- **Analysis paralysis**: Can't reach conclusion

## Example Tuples

| Input Type | Root Cause | Context | Severity | Symptom |
|------------|------------|---------|----------|---------|
| Transcript | Level 3 | Startup | Blocking | Meetings drag on |
| Description | Level 4 | Enterprise | Chronic | Authority conflict |
| Vague | Multi-level | Cross-functional | Slowing | Silent resistance |
| Decision log | Level 5 | Non-profit | Blocking | Decisions revisited |
| Description | Level 2 | Leadership | Emerging | Analysis paralysis |
| Transcript | Level 1 | Enterprise | Chronic | Authority conflict |
