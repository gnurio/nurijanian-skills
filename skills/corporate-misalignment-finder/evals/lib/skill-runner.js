/**
 * Skill Runner
 * Executes the skill against test cases
 */

const fs = require('fs');
const path = require('path');
const { LLMClient } = require('./llm-client');
const config = require('../config');

class SkillRunner {
  constructor() {
    this.client = new LLMClient('anthropic');
    this.skillContent = fs.readFileSync(config.paths.skill, 'utf8');
    this.frameworkContent = fs.readFileSync(config.paths.framework, 'utf8');
  }

  /**
   * Build the full prompt for a test case
   */
  buildPrompt(testCase) {
    return `You are the Corporate Misalignment Finder skill. Follow the instructions below exactly.

${this.skillContent}

---

REFERENCE: Robert's Rules Framework
${this.frameworkContent}

---

USER INPUT:
${testCase.input}

Provide your diagnosis following the format specified in your instructions.`;
  }

  /**
   * Run the skill against a single test case
   */
  async runTest(testCase, options = {}) {
    const startTime = Date.now();
    
    try {
      const prompt = this.buildPrompt(testCase);
      const output = await this.client.complete(prompt, {
        model: options.model || config.llm.skillModel,
        timeout: config.llm.skillTimeout,
      });
      
      const duration = Date.now() - startTime;
      
      return {
        testId: testCase.id,
        input: testCase.input,
        inputType: testCase.input_type,
        expected: testCase.expected_diagnosis,
        output: output,
        duration: duration,
        timestamp: new Date().toISOString(),
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        testId: testCase.id,
        input: testCase.input,
        inputType: testCase.input_type,
        expected: testCase.expected_diagnosis,
        output: null,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Run all test cases
   */
  async runAll(testCases, options = {}) {
    const results = [];
    const concurrency = options.concurrency || config.eval.maxConcurrency;
    
    console.log(`\nRunning ${testCases.length} test cases with concurrency ${concurrency}...\n`);
    
    // Process in batches
    for (let i = 0; i < testCases.length; i += concurrency) {
      const batch = testCases.slice(i, i + concurrency);
      const batchPromises = batch.map(tc => this.runTest(tc, options));
      
      console.log(`  Processing batch ${Math.floor(i/concurrency) + 1}/${Math.ceil(testCases.length/concurrency)}...`);
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Progress update
      const completed = Math.min(i + concurrency, testCases.length);
      const successful = results.filter(r => r.success).length;
      console.log(`    Completed: ${completed}/${testCases.length}, Success: ${successful}/${completed}`);
    }
    
    return results;
  }
}

module.exports = { SkillRunner };
