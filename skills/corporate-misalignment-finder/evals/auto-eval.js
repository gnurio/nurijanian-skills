#!/usr/bin/env node
/**
 * Automated Evaluation Runner
 * 
 * Usage:
 *   node auto-eval.js              # Run full evaluation
 *   node auto-eval.js --skill-only # Run skill, skip judges
 *   node auto-eval.js --judge-only # Run judges on existing results
 *   node auto-eval.js --test 001   # Run single test case
 * 
 * Environment:
 *   ANTHROPIC_API_KEY - Required for Claude
 *   DEFAULT_MODEL     - Model for skill (default: claude-sonnet-4-20250514)
 *   JUDGE_MODEL       - Model for judges (default: claude-haiku-3-20240307)
 */

const fs = require('fs');
const path = require('path');
const { SkillRunner } = require('./lib/skill-runner');
const { JudgeEvaluator } = require('./lib/judge-evaluator');
const { ReportGenerator } = require('./lib/report-generator');
const config = require('./config');

// Parse arguments
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    skillOnly: args.includes('--skill-only'),
    judgeOnly: args.includes('--judge-only'),
    singleTest: args.find((_, i) => args[i - 1] === '--test'),
    help: args.includes('--help') || args.includes('-h'),
  };
}

function printHelp() {
  console.log(`
Automated Evaluation Runner for Corporate Misalignment Finder

Usage:
  node auto-eval.js [options]

Options:
  --skill-only    Run skill against test cases, skip judging
  --judge-only    Run judges on existing results file
  --test ID       Run single test case (e.g., --test 001)
  --help, -h      Show this help

Environment Variables:
  ANTHROPIC_API_KEY    Required for Claude API access
  DEFAULT_MODEL        Model for skill execution
  JUDGE_MODEL          Model for judge evaluation

Examples:
  node auto-eval.js                    # Full evaluation
  node auto-eval.js --test 001         # Single test case
  node auto-eval.js --skill-only       # Generate results only
  node auto-eval.js --judge-only       # Judge existing results
`);
}

async function loadTestCases(singleTestId = null) {
  const testCases = JSON.parse(fs.readFileSync(config.paths.testCases, 'utf8'));
  
  if (singleTestId) {
    const testCase = testCases.find(tc => tc.id === singleTestId);
    if (!testCase) {
      throw new Error(`Test case ${singleTestId} not found`);
    }
    return [testCase];
  }
  
  return testCases;
}

async function runSkillPhase(testCases) {
  console.log('\n' + '='.repeat(60));
  console.log('PHASE 1: Running Skill Against Test Cases');
  console.log('='.repeat(60));
  
  const runner = new SkillRunner();
  const results = await runner.runAll(testCases);
  
  // Check for failures
  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    console.log(`\n⚠ ${failures.length} skill execution(s) failed:`);
    for (const f of failures) {
      console.log(`  - Test ${f.testId}: ${f.error}`);
    }
  }
  
  return results;
}

async function runJudgePhase(results) {
  console.log('\n' + '='.repeat(60));
  console.log('PHASE 2: Evaluating Results with Judges');
  console.log('='.repeat(60));
  
  const evaluator = new JudgeEvaluator();
  const evaluations = await evaluator.evaluateBatch(results);
  
  // Show summary
  const summary = evaluator.summarize(evaluations);
  console.log('\nJudge Summary:');
  for (const [judge, stats] of Object.entries(summary)) {
    console.log(`  ${judge}: ${(stats.passRate * 100).toFixed(1)}% pass (${stats.Pass}/${stats.total})`);
  }
  
  return evaluations;
}

async function runReportPhase(results, evaluations, testCases) {
  console.log('\n' + '='.repeat(60));
  console.log('PHASE 3: Generating Reports');
  console.log('='.repeat(60));
  
  const generator = new ReportGenerator();
  const reportDir = generator.generate(results, evaluations, testCases);
  
  return reportDir;
}

async function main() {
  const args = parseArgs();
  
  if (args.help) {
    printHelp();
    process.exit(0);
  }
  
  // Check API key
  if (!config.llm.anthropicApiKey && !config.llm.openaiApiKey) {
    console.error('Error: No API key found. Set ANTHROPIC_API_KEY or OPENAI_API_KEY environment variable.');
    process.exit(1);
  }
  
  console.log('\n🚀 Corporate Misalignment Finder - Automated Evaluation');
  console.log(`   Model: ${config.llm.skillModel}`);
  console.log(`   Judge: ${config.llm.judgeModel}`);
  console.log(`   Test Cases: ${args.singleTest ? args.singleTest : 'all'}`);
  
  try {
    let results = [];
    let evaluations = [];
    let testCases = [];
    
    if (args.judgeOnly) {
      // Load existing results
      const resultsFiles = fs.readdirSync(config.eval.resultsDir)
        .filter(f => f.startsWith('batch-'))
        .sort()
        .reverse();
      
      if (resultsFiles.length === 0) {
        throw new Error('No results found for judging. Run without --judge-only first.');
      }
      
      const latestBatch = path.join(config.eval.resultsDir, resultsFiles[0]);
      console.log(`\nLoading results from: ${latestBatch}`);
      
      results = JSON.parse(fs.readFileSync(path.join(latestBatch, 'results.json'), 'utf8'));
      testCases = JSON.parse(fs.readFileSync(config.paths.testCases, 'utf8'));
      
      evaluations = await runJudgePhase(results);
      await runReportPhase(results, evaluations, testCases);
      
    } else {
      // Full pipeline
      testCases = await loadTestCases(args.singleTest);
      
      results = await runSkillPhase(testCases);
      
      if (!args.skillOnly) {
        evaluations = await runJudgePhase(results);
        const reportDir = await runReportPhase(results, evaluations, testCases);
        
        // Final summary
        console.log('\n' + '='.repeat(60));
        console.log('EVALUATION COMPLETE');
        console.log('='.repeat(60));
        console.log(`\n📊 Reports saved to: ${reportDir}`);
        console.log('\nNext steps:');
        console.log('  1. Review error-analysis.md for failure patterns');
        console.log('  2. Update SKILL.md based on recommendations');
        console.log('  3. Re-run: node auto-eval.js');
      } else {
        // Save results only
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportDir = path.join(config.eval.resultsDir, `batch-${timestamp}`);
        fs.mkdirSync(reportDir, { recursive: true });
        fs.writeFileSync(
          path.join(reportDir, 'results.json'),
          JSON.stringify(results, null, 2)
        );
        console.log(`\n✓ Results saved to: ${reportDir}/results.json`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
