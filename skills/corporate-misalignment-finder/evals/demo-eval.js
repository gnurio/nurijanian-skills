#!/usr/bin/env node
/**
 * Demo Evaluation Runner
 * 
 * Runs a mock evaluation to demonstrate the workflow without API calls.
 * Generates sample outputs and evaluations to show the report format.
 */

const fs = require('fs');
const path = require('path');
const { ReportGenerator } = require('./lib/report-generator');
const config = require('./config');

// Mock skill output generator
function generateMockOutput(testCase) {
  const expected = testCase.expected_diagnosis;
  
  // Simulate some failures for demonstration
  const shouldFail = ['002', '005', '011'].includes(testCase.id);
  
  if (shouldFail) {
    return `## Diagnosis

**Input Type**: ${testCase.input_type}

**Stack Assessment**:
- Level 1 (Goals): ✓ - Generally aligned
- Level 2 (Information): ✓ - Good information sharing
- Level 3 (Process): ✗ - Some process issues
- Level 4 (Authority): ✓ - Authority is clear
- Level 5 (Decision): ✗ - Decisions not captured

**Root Cause(s)**: Level 5 - Decisions not captured

**Symptoms vs Root**: The symptoms suggest process issues but it's really about documentation.

## Prescription

**Immediate Actions**:
1. Start documenting decisions better
2. Improve communication

**Process Fixes**:
1. Create better meeting notes

**Authority/Escalation Needs**: None

## Prevention

- Keep better records`;
  }
  
  return `## Diagnosis

**Input Type**: ${testCase.input_type}

**Stack Assessment**:
${Object.entries(expected.stack_assessment).map(([level, status]) => {
  const levelNum = level.split('_')[1];
  const levelName = ['Goals', 'Information', 'Process', 'Authority', 'Decision'][levelNum - 1];
  return `- Level ${levelNum} (${levelName}): ${status}`;
}).join('\n')}

**Root Cause(s)**: ${expected.root_causes.join(', ')}

**Symptoms vs Root**: ${testCase.symptom} → ${expected.root_causes[0]}

## Prescription

**Immediate Actions**:
${expected.root_causes[0].includes('Level 3') ? `1. Set agenda with decision items marked
2. Use motions: "I move we..."
3. Require seconds
4. Use Previous Question to close debate` : `1. Address root cause directly
2. Communicate to all stakeholders`}

**Process Fixes**:
1. Establish clear process per Robert's Rules §${Math.floor(Math.random() * 50) + 1}
2. Document in minutes

**Authority/Escalation Needs**: ${expected.root_causes[0].includes('Level 4') ? 'Escalate to CEO for authority clarification' : 'None'}

## Prevention

- Regular process review
- Training on parliamentary procedure`;
}

// Mock judge evaluation
function generateMockEvaluation(result, judgeName) {
  const shouldPass = !['002', '005', '011'].includes(result.testId);
  
  if (judgeName.includes('stack')) {
    if (result.testId === '002') {
      return {
        judge: judgeName,
        testId: result.testId,
        critique: 'The skill misidentified Level 4 (Authority) as Level 5 (Decision). The input clearly describes both VPs claiming decision rights - this is an authority collision, not a documentation issue. The skill missed that authority is the fundamental problem.',
        result: 'Fail',
        success: true,
      };
    }
    if (result.testId === '005') {
      return {
        judge: judgeName,
        testId: result.testId,
        critique: 'Skill correctly identified Level 2 and Level 3 issues but missed that information sufficiency is the primary driver of the analysis paralysis. Borderline pass.',
        result: 'Borderline',
        success: true,
      };
    }
    return {
      judge: judgeName,
      testId: result.testId,
      critique: 'Correctly identified the root cause level(s) with accurate stack assessment.',
      result: 'Pass',
      success: true,
    };
  }
  
  if (judgeName.includes('prescription')) {
    if (result.testId === '011') {
      return {
        judge: judgeName,
        testId: result.testId,
        critique: 'Prescription is too generic ("improve communication", "better meeting notes") and lacks specific Robert\'s Rules mechanisms. Should reference Previous Question, motions, or specific parliamentary tools.',
        result: 'Fail',
        success: true,
      };
    }
    return {
      judge: judgeName,
      testId: result.testId,
      critique: 'Prescription appropriately addresses the root cause with specific, actionable steps grounded in parliamentary procedure.',
      result: 'Pass',
      success: true,
    };
  }
  
  if (judgeName.includes('format')) {
    return {
      judge: judgeName,
      testId: result.testId,
      critique: 'Output follows required structure with all sections present.',
      result: 'Pass',
      success: true,
    };
  }
  
  return {
    judge: judgeName,
    testId: result.testId,
    critique: 'Evaluation completed',
    result: 'Pass',
    success: true,
  };
}

async function main() {
  console.log('\n🎭 DEMO: Corporate Misalignment Finder - Mock Evaluation');
  console.log('   (No API calls - simulated outputs)\n');
  
  // Load test cases
  const testCases = JSON.parse(fs.readFileSync(config.paths.testCases, 'utf8'));
  console.log(`Loaded ${testCases.length} test cases\n`);
  
  // Generate mock results
  console.log('Generating mock skill outputs...');
  const results = testCases.map(tc => ({
    testId: tc.id,
    input: tc.input,
    inputType: tc.input_type,
    expected: tc.expected_diagnosis,
    output: generateMockOutput(tc),
    duration: 15000 + Math.random() * 10000,
    timestamp: new Date().toISOString(),
    success: true,
    error: null,
  }));
  
  console.log(`Generated ${results.length} mock outputs`);
  console.log('  Simulating failures for tests: 002, 005, 011\n');
  
  // Generate mock evaluations
  console.log('Running mock judges...');
  const judges = ['stack_diagnosis_judge', 'prescription_judge', 'format_judge'];
  const evaluations = [];
  
  for (const result of results) {
    for (const judge of judges) {
      evaluations.push(generateMockEvaluation(result, judge));
    }
  }
  
  console.log(`Generated ${evaluations.length} evaluations\n`);
  
  // Generate reports
  console.log('Generating reports...');
  const generator = new ReportGenerator();
  const reportDir = generator.generate(results, evaluations, testCases);
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('DEMO EVALUATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`\n📊 Reports saved to: ${reportDir}`);
  console.log('\nKey files:');
  console.log('  - summary.md: High-level pass/fail summary');
  console.log('  - error-analysis.md: Categorized failures with recommendations');
  console.log('  - detailed.md: Per-test breakdown with critiques');
  console.log('\nTo run with real LLM:');
  console.log('  ANTHROPIC_API_KEY=xxx node auto-eval.js');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
