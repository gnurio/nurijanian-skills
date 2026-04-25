/**
 * Evaluation Configuration
 * 
 * Set environment variables:
 *   ANTHROPIC_API_KEY - for Claude
 *   OPENAI_API_KEY - for OpenAI models
 *   DEFAULT_MODEL - which model to use (claude-sonnet-4-20250514, gpt-4o, etc.)
 */

const path = require('path');

module.exports = {
  // LLM Configuration
  llm: {
    // Default model for running the skill
    skillModel: process.env.DEFAULT_MODEL || 'claude-sonnet-4-20250514',
    
    // Model for judges (can be smaller/faster)
    judgeModel: process.env.JUDGE_MODEL || 'claude-haiku-3-20240307',
    
    // API Configuration
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    
    // Rate limiting (requests per minute)
    rateLimit: 60,
    
    // Timeouts
    skillTimeout: 120000,  // 2 minutes for skill (complex reasoning)
    judgeTimeout: 30000,   // 30 seconds for judges (simpler task)
  },
  
  // Evaluation Settings
  eval: {
    // Number of times to run each test case (for consistency)
    runsPerTest: 1,
    
    // Stop on first failure (for debugging)
    stopOnFail: false,
    
    // Output directory
    resultsDir: path.join(__dirname, 'results'),
    
    // Save full traces?
    saveTraces: true,
    
    // Parallel execution
    maxConcurrency: 3,
  },
  
  // Judge Thresholds
  thresholds: {
    // Minimum pass rate for each judge
    stackDiagnosis: 0.90,  // 90%
    prescription: 0.90,    // 90%
    format: 0.95,          // 95%
    
    // Overall success threshold
    overall: 0.90,         // 90%
  },
  
  // Paths
  paths: {
    skill: path.join(__dirname, '../SKILL.md'),
    framework: path.join(__dirname, '../references/roberts-rules-framework.md'),
    testCases: path.join(__dirname, 'synthetic-data/test-cases.json'),
    judges: path.join(__dirname, 'judges'),
  }
};
