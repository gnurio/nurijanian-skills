# Automated Evaluation System

Complete automated evaluation pipeline for the `corporate-misalignment-finder` skill.

## Quick Start

### Demo (No API Key Required)
```bash
cd skills/corporate-misalignment-finder/evals
node demo-eval.js
```

This runs a mock evaluation with simulated outputs to demonstrate the report format.

### Full Evaluation (Requires API Key)
```bash
export ANTHROPIC_API_KEY=sk-ant-...
node auto-eval.js
```

## System Components

```
evals/
├── auto-eval.js              # Main orchestrator
├── demo-eval.js              # Mock evaluation (no API)
├── config.js                 # Configuration
├── lib/
│   ├── llm-client.js         # API client (Anthropic/OpenAI)
│   ├── skill-runner.js       # Runs skill against test cases
│   ├── judge-evaluator.js    # Evaluates with LLM judges
│   └── report-generator.js   # Generates reports
├── judges/
│   ├── stack-diagnosis-judge.md    # Evaluates root cause accuracy
│   ├── prescription-judge.md       # Evaluates fix appropriateness
│   └── format-judge.md             # Evaluates output structure
└── synthetic-data/
    ├── dimensions.md         # Test case dimensions
    └── test-cases.json       # 20 test cases with ground truth
```

## Usage

### Run Full Evaluation
```bash
node auto-eval.js
```

### Run Single Test Case
```bash
node auto-eval.js --test 001
```

### Run Skill Only (Skip Judging)
```bash
node auto-eval.js --skill-only
```

### Judge Existing Results
```bash
node auto-eval.js --judge-only
```

## Configuration

Set environment variables or edit `config.js`:

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | - | Required for Claude API |
| `DEFAULT_MODEL` | claude-sonnet-4-20250514 | Model for skill execution |
| `JUDGE_MODEL` | claude-haiku-3-20240307 | Model for judges (can be smaller) |

## Output

Results are saved to `evals/results/batch-{timestamp}/`:

- **results.json** — Raw skill outputs for all test cases
- **evaluations.json** — Judge evaluations (Pass/Fail/Borderline)
- **summary.md** — High-level pass/fail statistics
- **error-analysis.md** — Categorized failures with recommendations
- **detailed.md** — Per-test breakdown with critiques

## Success Thresholds

Defined in `config.js`:

| Judge | Target | Description |
|-------|--------|-------------|
| Stack Diagnosis | 90% | Correctly identifies root cause level |
| Prescription | 90% | Fixes appropriate and grounded in Robert's Rules |
| Format | 95% | Output follows required structure |

## Iteration Workflow

1. **Run evaluation**: `node auto-eval.js`
2. **Review summary**: Check `summary.md` for pass rates
3. **Analyze errors**: Read `error-analysis.md` for patterns
4. **Update skill**: Edit `../SKILL.md` based on recommendations
5. **Re-run**: Repeat until all thresholds met

## Example Output

```
🚀 Corporate Misalignment Finder - Automated Evaluation
   Model: claude-sonnet-4-20250514
   Judge: claude-haiku-3-20240307
   Test Cases: all

============================================================
PHASE 1: Running Skill Against Test Cases
============================================================

Running 20 test cases with concurrency 3...
  Processing batch 1/7...
    Completed: 3/20, Success: 3/3
  Processing batch 2/7...
    Completed: 6/20, Success: 6/6
  ...

============================================================
PHASE 2: Evaluating Results with Judges
============================================================

Evaluating 20 results with 3 judges...
  Evaluating test 001 (1/20)...
    stack_diagnosis_judge: Pass, prescription_judge: Pass, format_judge: Pass
  ...

Judge Summary:
  stack_diagnosis_judge: 90.0% pass (18/20)
  prescription_judge: 95.0% pass (19/20)
  format_judge: 100.0% pass (20/20)

============================================================
PHASE 3: Generating Reports
============================================================

✓ Reports saved to: results/batch-2026-04-25T08-46-05-507Z
  - results.json: Raw skill outputs
  - evaluations.json: Judge evaluations
  - summary.md: High-level summary
  - error-analysis.md: Categorized failures
  - detailed.md: Per-test breakdown

============================================================
EVALUATION COMPLETE
============================================================

📊 Reports saved to: results/batch-2026-04-25T08-46-05-507Z

Next steps:
  1. Review error-analysis.md for failure patterns
  2. Update SKILL.md based on recommendations
  3. Re-run: node auto-eval.js
```

## Troubleshooting

### API Rate Limits
Reduce `maxConcurrency` in `config.js` if hitting rate limits.

### Timeouts
Increase `skillTimeout` or `judgeTimeout` in `config.js` for slower models.

### Cost Control
- Use smaller model for judges (e.g., `claude-haiku`)
- Run `--test` with single case for debugging
- Use `--skill-only` to skip expensive judge evaluation

## Adding Test Cases

Edit `synthetic-data/test-cases.json` and follow the existing schema:

```json
{
  "id": "021",
  "input_type": "meeting_transcript",
  "root_cause_level": "level_3_process",
  "context": "startup",
  "severity": "blocking",
  "symptom": "meetings_drag_on",
  "input": "Your test input here...",
  "expected_diagnosis": {
    "stack_assessment": { ... },
    "root_causes": ["Level 3 - ..."],
    "prescription": "..."
  }
}
```

## Adding Judges

1. Create new file in `judges/` (e.g., `tone-judge.md`)
2. Follow existing judge format:
   - Evaluation criterion
   - Pass/Fail/Borderline definitions
   - Examples
   - JSON output format
3. Re-run `auto-eval.js` — new judge is picked up automatically
