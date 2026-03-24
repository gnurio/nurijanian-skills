# VS Domain Templates

Ready-to-paste Verbalized Sampling prompts. Replace `{placeholders}` before use.
For all templates: increase context specificity to counter FM-2 (generic gravity).

---

## 1. Creative Writing

```
Write a short {form} about {topic}.

Generate 5 {form}s. Return in JSON with key "{form}s". Each dict:
• text: the complete {form}
• probability: likelihood (0.0–1.0) of generating this given the topic

Sample from the tails of the distribution, each probability below 0.10.

Output ONLY the JSON.
```

**Diversity boost**: Add `"Avoid conventional {topic} imagery. Prioritize unexpected angles, subversions, or non-Western framings."`

---

## 2. Brainstorming / Ideation

```
Generate product/strategy ideas for: {specific context — include company stage, target segment, current channels, known constraints}.

Generate 5 ideas. Return in JSON with key "ideas". Each dict:
• text: idea name and 1-sentence description
• probability: likelihood (0.0–1.0) this idea would be suggested given the context
• rationale: why this fits the context

Cover at least one idea from each of: {frame1}, {frame2}, {frame3}.
Sample from the tails of the distribution, each probability below 0.10.

Output ONLY the JSON.
```

**Note**: Load maximum context. Generic company names (e.g. "Xero", "Salesforce") without additional constraints will drift toward generic SaaS playbooks (FM-2).

---

## 3. Dialogue / Persona Simulation

```
Simulate how {persona — describe in detail: role, background, emotional state, communication style} would respond to: "{situation}"

Generate 5 responses. Return in JSON with key "responses". Each dict:
• text: the response in character
• probability: likelihood (0.0–1.0) this persona would say this in this situation

Sample from the full distribution to capture realistic behavioral variance.

Output ONLY the JSON.
```

**Diversity boost for behavioral realism**: `"Include at least one response representing an atypical or stress-state reaction for this persona."`

---

## 4. Synthetic Data Generation

```
Generate {data_type} examples for {purpose — describe ML task, edge cases of interest, known distribution gaps}.

Generate 10 examples. Return in JSON with key "examples". Each dict:
• text: the example
• probability: likelihood (0.0–1.0) of this appearing in real {data_type} data
• pattern_type: what pattern or edge case this represents

Sample from the tails of the distribution, each probability below 0.05. Prioritize edge cases, underrepresented patterns, and distributional outliers.

Output ONLY the JSON.
```

**Use VS-Multi for synthetic data**: run 2-3 turns requesting "alternative examples not covered in previous turns" to avoid cluster repetition across batches.

---

## 5. Adversarial / Negative Examples

```
Generate incorrect or adversarial responses to: "{question or task}"

Generate 5 wrong answers. Return in JSON with key "wrong_answers". Each dict:
• text: the incorrect answer
• probability: likelihood (0.0–1.0) a confused or adversarial person would give this
• error_type: category of mistake (e.g. plausible-but-wrong, off-topic, hallucinated, partial)

Sample from the full distribution of plausible errors.

Output ONLY the JSON.
```

---

## 6. Open-Ended QA (Coverage)

```
{Question with multiple valid answers}

Generate 5 answers. Return in JSON with key "answers". Each dict:
• text: a valid answer
• probability: likelihood (0.0–1.0) of this answer being given by a knowledgeable person
• perspective: the disciplinary or cultural frame this answer comes from

Sample to maximize coverage of the answer space across different fields, cultures, and time periods — not just the most common responses.

Output ONLY the JSON.
```

---

## Overfit Topic Template (FM-1 Mitigation)

Use when the topic has saturated training data (health, productivity, generic business advice).

```
{Task description}

Generate 5 responses. Return in JSON with key "{output_key}". Each dict:
• text: [output specification]
• probability: likelihood (0.0–1.0)
• source_domain: the field or subculture this idea draws from

Constraints:
- Exclude any idea that appears in mainstream {topic} content (articles, listicles, YouTube videos)
- Each idea must draw from a distinct source domain
- Prioritize: adjacent fields, minority subcultures, non-English-language traditions, pre-1980 research

Sample from the tails of the distribution, each probability below 0.05.

Output ONLY the JSON.
```
