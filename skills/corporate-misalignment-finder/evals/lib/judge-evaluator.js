/**
 * Judge Evaluator
 * Evaluates skill outputs using LLM-as-judge
 */

const fs = require('fs');
const path = require('path');
const { LLMClient } = require('./llm-client');
const config = require('../config');

class JudgeEvaluator {
  constructor() {
    this.client = new LLMClient('anthropic');
    this.judges = this.loadJudges();
  }

  /**
   * Load judge prompts from files
   */
  loadJudges() {
    const judgeDir = config.paths.judges;
    const judges = {};
    
    const files = fs.readdirSync(judgeDir).filter(f => f.endsWith('.md'));
    
    for (const file of files) {
      const name = file.replace('.md', '').replace(/-/g, '_');
      const content = fs.readFileSync(path.join(judgeDir, file), 'utf8');
      judges[name] = content;
    }
    
    return judges;
  }

  /**
   * Build prompt for a specific judge
   */
  buildPrompt(judgeName, skillOutput, expected) {
    const judgePrompt = this.judges[judgeName];
    
    return `${judgePrompt}

---

EVALUATION TASK:

Expected Diagnosis:
${JSON.stringify(expected, null, 2)}

Skill Output:
${skillOutput}

---

Provide your evaluation in the following JSON format:

{\n  "critique": "Your detailed assessment here",\n  "result": "Pass|Fail|Borderline"\n}`;
  }

  /**
   * Evaluate a single result with a specific judge
   */
  async evaluate(result, judgeName, options = {}) {
    if (!result.success) {
      return {
        judge: judgeName,
        testId: result.testId,
        critique: 'Skill execution failed',
        result: 'Fail',
        raw: null,
        success: false,
        error: result.error,
      };
    }
    
    try {
      const prompt = this.buildPrompt(judgeName, result.output, result.expected);
      const response = await this.client.complete(prompt, {
        model: options.model || config.llm.judgeModel,
        timeout: config.llm.judgeTimeout,
      });
      
      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in judge response');
      }
      
      const evaluation = JSON.parse(jsonMatch[0]);
      
      return {
        judge: judgeName,
        testId: result.testId,
        critique: evaluation.critique,
        result: evaluation.result,
        raw: response,
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        judge: judgeName,
        testId: result.testId,
        critique: 'Judge evaluation failed',
        result: 'Fail',
        raw: null,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Evaluate a result with all judges
   */
  async evaluateAll(result, options = {}) {
    const judgeNames = Object.keys(this.judges);
    const evaluations = [];
    
    for (const judgeName of judgeNames) {
      const evalResult = await this.evaluate(result, judgeName, options);
      evaluations.push(evalResult);
    }
    
    return evaluations;
  }

  /**
   * Evaluate all results with all judges
   */
  async evaluateBatch(results, options = {}) {
    console.log(`\nEvaluating ${results.length} results with ${Object.keys(this.judges).length} judges...\n`);
    
    const allEvaluations = [];
    
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      console.log(`  Evaluating test ${result.testId} (${i + 1}/${results.length})...`);
      
      const evaluations = await this.evaluateAll(result, options);
      allEvaluations.push(...evaluations);
      
      // Show verdicts
      const verdicts = evaluations.map(e => `${e.judge}: ${e.result}`).join(', ');
      console.log(`    ${verdicts}`);
    }
    
    return allEvaluations;
  }

  /**
   * Calculate summary statistics
   */
  summarize(evaluations) {
    const byJudge = {};
    
    for (const evaluation of evaluations) {
      if (!byJudge[evaluation.judge]) {
        byJudge[evaluation.judge] = { Pass: 0, Fail: 0, Borderline: 0, total: 0 };
      }
      byJudge[evaluation.judge][evaluation.result]++;
      byJudge[evaluation.judge].total++;
    }
    
    const summary = {};
    for (const [judge, counts] of Object.entries(byJudge)) {
      summary[judge] = {
        ...counts,
        passRate: counts.Pass / counts.total,
      };
    }
    
    return summary;
  }
}

module.exports = { JudgeEvaluator };
