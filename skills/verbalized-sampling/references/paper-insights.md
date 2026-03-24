# Paper Insights: Verbalized Sampling

**Source**: Zhang et al. (2025). "Verbalized Sampling: How to Mitigate Mode Collapse and Unlock LLM Diversity." arXiv:2510.01171v3.

---

## Why Mode Collapse Happens (Theoretical Grounding)

Mode collapse is not primarily an algorithmic problem — it's a **data-level problem**. Human annotators in preference datasets systematically favor familiar, typical text over creative or unusual outputs. This is *typicality bias*, a well-established cognitive psychology finding: humans rate typical exemplars as better, clearer, and more correct.

Because RLHF trains models to maximize human preferences, and human preferences are biased toward the typical, alignment amplifies mode collapse. The paper formalizes this: even with a perfect reward model and perfect optimization, typicality bias in the preference data itself drives the model toward mode-collapsed outputs.

**Implication for VS**: The model retains its full pretrained distribution internally. Mode collapse is a surface-level behavior driven by the prompt framing, not a loss of internal knowledge. VS exploits this by changing the prompt structure.

---

## How VS Works (Mechanism)

- **Direct prompting**: "Tell me a joke about coffee" → the model finds the modal response to this instance-level prompt, which is the most typical joke
- **List prompting**: "Give me 5 jokes about coffee" → the model finds the modal response to *this* prompt, which is 5 typical jokes (still collapses)
- **VS**: "Generate 5 jokes with probabilities" → the modal response to *this* prompt is an approximation of the distribution over jokes, because that's what a good probability estimate looks like

The key insight: **different prompts collapse to different modes**. VS's modal response happens to be a distribution — which is what we want.

---

## Quantitative Results

| Domain | Diversity Gain vs Direct Prompting |
|---|---|
| Creative writing (poems, jokes, stories) | 1.6–2.1× |
| Dialogue simulation | Comparable to dedicated fine-tuned model |
| Open-ended QA | Broader, more realistic distribution |
| Synthetic data generation | Improved downstream math task performance |

**Model scaling**: Larger models benefit more. GPT-4 gains 1.5-2× more diversity from VS than GPT-4-mini. The technique leverages a richer pretrained distribution, so model capability is a multiplier.

**VS-CoT**: Often achieves the best quality *and* diversity on complex tasks. The chain-of-thought reasoning activates more careful probability calibration, which produces better-calibrated distributions.

**VS-Multi (multi-turn)**: Highest diversity, ~2× token cost. Each turn requests alternatives to previous turns' outputs, breaking within-session clustering.

**Combination with temperature**: VS and temperature tuning are orthogonal — using both outperforms either alone. VS restructures the prompt distribution; temperature scales the sampling distribution. They attack different parts of the problem.

**Safety and accuracy**: VS does not degrade factual accuracy or safety. The model doesn't hallucinate more or produce unsafe content — it just produces a broader range of valid outputs.

---

## Empirical Eval Results (This Session)

Tests run: 3 brainstorm prompts with k=5, tail sampling (p < 0.10), brainstorming template.

| Prompt | Context specificity | VS effectiveness | Failure mode |
|---|---|---|---|
| prodmgmt.world sales ideas | High (niche B2B SaaS, known stack) | Strong — genuinely novel ideas | None observed |
| Xero retention ideas | Medium (large company, generic framing) | Partial — tail ideas novel, mid-band generic | FM-2: Context starvation |
| How to lose weight | Low (massively overfit topic) | Failed — same cluster as direct prompting | FM-1: Overfit topic collapse |

**Key finding**: Context specificity is the dominant predictor of VS effectiveness on brainstorming tasks, more than the probability threshold alone.

---

## Practical Implementation Notes

**Prompt format**: The paper uses XML tags (`<response>`, `<text>`, `<probability>`) in system prompts. JSON format in user prompts works equivalently and is easier to parse programmatically.

**k selection**: The paper tests k=5 most commonly. Diminishing returns above k=10 for most tasks. For synthetic data, k=10–20 with multi-turn is more effective than a single large k.

**Probability threshold selection heuristic**:
- If topic has saturated training data → start at p<0.05, add FM-1 constraints
- If topic is niche/specific → p<0.10 is usually sufficient
- **Diagnostic**: If your output's probability spread is less than 3× (e.g., all outputs between 0.05–0.09), VS failed — apply FM-1/FM-2 mitigations

**Closed-source models**: VS works on GPT-4, Claude, Gemini — no fine-tuning, no API access beyond standard inference. Pure prompting.
