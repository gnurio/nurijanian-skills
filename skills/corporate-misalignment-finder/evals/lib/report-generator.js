/**
 * Report Generator
 * Generates evaluation reports and error analysis
 */

const fs = require('fs');
const path = require('path');
const config = require('../config');

class ReportGenerator {
  constructor() {
    this.resultsDir = config.eval.resultsDir;
  }

  /**
   * Generate a full evaluation report
   */
  generate(results, evaluations, testCases) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportDir = path.join(this.resultsDir, `batch-${timestamp}`);
    fs.mkdirSync(reportDir, { recursive: true });
    
    // Save raw results
    fs.writeFileSync(
      path.join(reportDir, 'results.json'),
      JSON.stringify(results, null, 2)
    );
    
    // Save evaluations
    fs.writeFileSync(
      path.join(reportDir, 'evaluations.json'),
      JSON.stringify(evaluations, null, 2)
    );
    
    // Generate summary report
    const summary = this.generateSummary(results, evaluations);
    fs.writeFileSync(
      path.join(reportDir, 'summary.md'),
      summary
    );
    
    // Generate error analysis
    const errorAnalysis = this.generateErrorAnalysis(results, evaluations, testCases);
    fs.writeFileSync(
      path.join(reportDir, 'error-analysis.md'),
      errorAnalysis
    );
    
    // Generate detailed per-test report
    const detailed = this.generateDetailedReport(results, evaluations);
    fs.writeFileSync(
      path.join(reportDir, 'detailed.md'),
      detailed
    );
    
    console.log(`\n✓ Reports saved to: ${reportDir}`);
    console.log(`  - results.json: Raw skill outputs`);
    console.log(`  - evaluations.json: Judge evaluations`);
    console.log(`  - summary.md: High-level summary`);
    console.log(`  - error-analysis.md: Categorized failures`);
    console.log(`  - detailed.md: Per-test breakdown`);
    
    return reportDir;
  }

  /**
   * Generate summary statistics
   */
  generateSummary(results, evaluations) {
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    // Calculate judge stats
    const judgeStats = {};
    for (const evaluation of evaluations) {
      if (!judgeStats[evaluation.judge]) {
        judgeStats[evaluation.judge] = { Pass: 0, Fail: 0, Borderline: 0 };
      }
      judgeStats[evaluation.judge][evaluation.result]++;
    }
    
    let report = `# Evaluation Summary\n\n`;
    report += `**Date:** ${new Date().toISOString()}\n\n`;
    
    report += `## Execution Results\n\n`;
    report += `- **Total test cases:** ${results.length}\n`;
    report += `- **Successful executions:** ${successful} (${(successful/results.length*100).toFixed(1)}%)\n`;
    report += `- **Failed executions:** ${failed} (${(failed/results.length*100).toFixed(1)}%)\n\n`;
    
    report += `## Judge Results\n\n`;
    report += `| Judge | Pass | Fail | Borderline | Pass Rate | Target | Status |\n`;
    report += `|-------|------|------|------------|-----------|--------|--------|\n`;
    
    for (const [judge, stats] of Object.entries(judgeStats)) {
      const total = stats.Pass + stats.Fail + stats.Borderline;
      const passRate = stats.Pass / total;
      const threshold = config.thresholds[judge.replace(/_judge$/, '')] || config.thresholds.overall;
      const status = passRate >= threshold ? '✓ PASS' : '✗ FAIL';
      
      report += `| ${judge} | ${stats.Pass} | ${stats.Fail} | ${stats.Borderline} | ${(passRate*100).toFixed(1)}% | ${(threshold*100).toFixed(0)}% | ${status} |\n`;
    }
    
    report += `\n## Overall Status\n\n`;
    const allPass = Object.entries(judgeStats).every(([judge, stats]) => {
      const total = stats.Pass + stats.Fail + stats.Borderline;
      const passRate = stats.Pass / total;
      const threshold = config.thresholds[judge.replace(/_judge$/, '')] || config.thresholds.overall;
      return passRate >= threshold;
    });
    
    if (allPass) {
      report += `✓ **ALL THRESHOLDS MET** — Skill is performing at target level.\n`;
    } else {
      report += `✗ **THRESHOLDS NOT MET** — See error-analysis.md for improvement recommendations.\n`;
    }
    
    return report;
  }

  /**
   * Generate error analysis
   */
  generateErrorAnalysis(results, evaluations, testCases) {
    // Group evaluations by test
    const byTest = {};
    for (const evaluation of evaluations) {
      if (!byTest[evaluation.testId]) {
        byTest[evaluation.testId] = [];
      }
      byTest[evaluation.testId].push(eval);
    }
    
    // Categorize failures
    const failures = {
      diagnosis: [],      // Stack diagnosis judge failed
      prescription: [],   // Prescription judge failed
      format: [],         // Format judge failed
      execution: [],      // Skill execution failed
    };
    
    for (const result of results) {
      if (!result.success) {
        failures.execution.push(result);
        continue;
      }
      
      const testEvals = byTest[result.testId] || [];
      
      for (const evaluation of testEvals) {
        if (evaluation.result === 'Fail') {
          if (evaluation.judge.includes('stack')) failures.diagnosis.push({ result, evaluation });
          else if (evaluation.judge.includes('prescription')) failures.prescription.push({ result, evaluation });
          else if (evaluation.judge.includes('format')) failures.format.push({ result, evaluation });
        }
      }
    }
    
    let report = `# Error Analysis\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;
    
    // Failure counts
    report += `## Failure Summary\n\n`;
    report += `- **Execution failures:** ${failures.execution.length}\n`;
    report += `- **Stack diagnosis failures:** ${failures.diagnosis.length}\n`;
    report += `- **Prescription failures:** ${failures.prescription.length}\n`;
    report += `- **Format failures:** ${failures.format.length}\n\n`;
    
    // Pattern analysis
    report += `## Failure Patterns\n\n`;
    
    if (failures.diagnosis.length > 0) {
      report += `### Stack Diagnosis Errors\n\n`;
      report += `Common issues with root cause identification:\n\n`;
      
      // Group by expected root cause
      const byExpected = {};
      for (const { result, evaluation } of failures.diagnosis) {
        const testCase = testCases.find(tc => tc.id === result.testId);
        const expected = testCase?.expected_diagnosis?.root_causes?.[0] || 'unknown';
        if (!byExpected[expected]) byExpected[expected] = [];
        byExpected[expected].push({ result, evaluation });
      }
      
      for (const [root, items] of Object.entries(byExpected)) {
        report += `- **${root}** (${items.length} failures): ${items.map(i => i.result.testId).join(', ')}\n`;
      }
      report += `\n`;
    }
    
    if (failures.prescription.length > 0) {
      report += `### Prescription Errors\n\n`;
      report += `Skill outputs with inappropriate or non-actionable fixes:\n\n`;
      
      for (const { result, evaluation } of failures.prescription.slice(0, 5)) {
        report += `**Test ${result.testId}:**\n`;
        report += `- Expected root: ${result.expected?.root_causes?.join(', ')}\n`;
        report += `- Judge critique: ${eval.critique.slice(0, 200)}...\n\n`;
      }
    }
    
    if (failures.format.length > 0) {
      report += `### Format Errors\n\n`;
      report += `Skill outputs not following required structure:\n\n`;
      
      for (const { result, evaluation } of failures.format.slice(0, 5)) {
        report += `**Test ${result.testId}:** ${eval.critique}\n\n`;
      }
    }
    
    // Recommendations
    report += `## Recommendations\n\n`;
    
    if (failures.diagnosis.length > results.length * 0.1) {
      report += `1. **Improve stack diagnosis:** Add more examples of different root cause levels to SKILL.md\n`;
    }
    if (failures.prescription.length > results.length * 0.1) {
      report += `2. **Strengthen prescriptions:** Add explicit requirement to cite Robert's Rules mechanisms\n`;
    }
    if (failures.format.length > results.length * 0.05) {
      report += `3. **Enforce format:** Add format reminder in system prompt\n`;
    }
    
    report += `\nSee detailed.md for full per-test breakdown.\n`;
    
    return report;
  }

  /**
   * Generate detailed per-test report
   */
  generateDetailedReport(results, evaluations) {
    // Group evaluations by test
    const byTest = {};
    for (const evaluation of evaluations) {
      if (!byTest[evaluation.testId]) {
        byTest[evaluation.testId] = [];
      }
      byTest[evaluation.testId].push(eval);
    }
    
    let report = `# Detailed Test Results\n\n`;
    
    for (const result of results) {
      report += `## Test ${result.testId}\n\n`;
      report += `**Input Type:** ${result.inputType}\n`;
      report += `**Success:** ${result.success ? '✓' : '✗'}\n`;
      
      if (result.duration) {
        report += `**Duration:** ${(result.duration/1000).toFixed(2)}s\n`;
      }
      
      if (!result.success) {
        report += `**Error:** ${result.error}\n\n`;
        continue;
      }
      
      // Judge results
      const testEvals = byTest[result.testId] || [];
      report += `\n**Judge Results:**\n`;
      for (const evaluation of testEvals) {
        const icon = evaluation.result === 'Pass' ? '✓' : eval.result === 'Borderline' ? '~' : '✗';
        report += `- ${icon} ${eval.judge}: ${eval.result}\n`;
      }
      
      // Show critiques for failures
      const failures = testEvals.filter(e => e.result === 'Fail');
      if (failures.length > 0) {
        report += `\n**Failure Critiques:**\n\n`;
        for (const evaluation of failures) {
          report += `*${eval.judge}:*\n${eval.critique}\n\n`;
        }
      }
      
      // Show skill output preview
      if (result.output) {
        const preview = result.output.slice(0, 500);
        report += `**Output Preview:**\n\n\`\`\`\n${preview}...\n\`\`\`\n`;
      }
      
      report += `\n---\n\n`;
    }
    
    return report;
  }
}

module.exports = { ReportGenerator };
