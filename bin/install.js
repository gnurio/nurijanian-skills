#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const SKILLS_MANIFEST = require(path.join(ROOT, 'skills.json'));

const REF_PATH = path.join(ROOT, 'references', 'pm-excellence-behaviors.md');
const ORCHESTRATOR_SKILL = 'orchestrate-pm-alignment';

const REF_DIRECTIVE =
  "Read `references/pm-excellence-behaviors.md` before doing anything else. That file contains the\nfull behavioral framework you'll use to guide, challenge, and assess the PM.";

// Skills with local reference files that should be embedded at install time.
const SKILL_REFS = {
  'focal-point-finder': {
    directive: 'For detailed source quotes, examples, and the full Schelling methodology, read `references/schelling-focal-points.md`.',
    file: path.join(ROOT, 'skills', 'focal-point-finder', 'references', 'schelling-focal-points.md'),
    label: 'Schelling Focal Points Reference'
  },
  'vibe-code-leaf-finder': {
    directive: 'Full framework quotes and rationale: `references/schluntz-framework.md`.',
    file: path.join(ROOT, 'skills', 'vibe-code-leaf-finder', 'references', 'schluntz-framework.md'),
    label: 'Schluntz Leaf-vs-Trunk Framework'
  }
};

// Skills with asset files (templates etc.) that should be embedded at install time.
const SKILL_ASSETS = {
  'vibe-code-leaf-finder': {
    directive: 'Write output to `LEAF_REPORT.md` using the template in `assets/LEAF_REPORT_TEMPLATE.md`. Use the Write tool, not Shell echo.',
    file: path.join(ROOT, 'skills', 'vibe-code-leaf-finder', 'assets', 'LEAF_REPORT_TEMPLATE.md'),
    label: 'LEAF_REPORT_TEMPLATE'
  }
};

function buildSkillContent(skill) {
  const src = path.join(ROOT, skill.file);
  let content = fs.readFileSync(src, 'utf8');

  // Embed the PM excellence reference into the orchestrator
  if (skill.name === ORCHESTRATOR_SKILL) {
    const refContent = fs.readFileSync(REF_PATH, 'utf8');
    if (content.includes(REF_DIRECTIVE)) {
      const embedded =
        `The PM excellence behavioral framework is embedded below — use it as your source of truth:\n\n<pm-excellence-behaviors>\n${refContent}\n</pm-excellence-behaviors>`;
      content = content.replace(REF_DIRECTIVE, embedded);
    } else {
      content += `\n\n---\n\n## PM Excellence Behaviors (Reference)\n\n${refContent}`;
    }
  }

  // Embed local references for skills that have them
  if (SKILL_REFS[skill.name]) {
    const ref = SKILL_REFS[skill.name];
    const refData = fs.readFileSync(ref.file, 'utf8');
    if (content.includes(ref.directive)) {
      content = content.replace(
        ref.directive,
        `${ref.label} is embedded below:\n\n<${skill.name}-reference>\n${refData}\n</${skill.name}-reference>`
      );
    } else {
      content += `\n\n---\n\n## ${ref.label}\n\n${refData}`;
    }
  }

  // Embed asset files for skills that have them
  if (SKILL_ASSETS[skill.name]) {
    const asset = SKILL_ASSETS[skill.name];
    const assetData = fs.readFileSync(asset.file, 'utf8');
    if (content.includes(asset.directive)) {
      content = content.replace(
        asset.directive,
        `The ${asset.label} template is embedded below — copy it and fill it in:\n\n<${asset.label}>\n${assetData}\n</${asset.label}>`
      );
    } else {
      content += `\n\n---\n\n## ${asset.label}\n\n${assetData}`;
    }
  }

  return content;
}

function installClaudeCode() {
  const targetDir = path.join(os.homedir(), '.claude', 'skills', SKILLS_MANIFEST.namespace);
  fs.mkdirSync(targetDir, { recursive: true });

  for (const skill of SKILLS_MANIFEST.skills) {
    const dest = path.join(targetDir, `${skill.name}.md`);
    fs.writeFileSync(dest, buildSkillContent(skill));
  }

  console.log(`\nClaude Code: installed ${SKILLS_MANIFEST.skills.length} skills to:\n  ${targetDir}`);
  console.log('\nAvailable skills:');
  for (const skill of SKILLS_MANIFEST.skills) {
    console.log(`  /${SKILLS_MANIFEST.namespace}:${skill.name}`);
  }
}

function installCursor() {
  const targetDir = path.join(os.homedir(), '.cursor', 'rules', SKILLS_MANIFEST.namespace);
  fs.mkdirSync(targetDir, { recursive: true });

  for (const skill of SKILLS_MANIFEST.skills) {
    const dest = path.join(targetDir, `${skill.name}.mdc`);
    const body = buildSkillContent(skill);

    // Extract description from frontmatter if present, otherwise use manifest description
    const fmMatch = body.match(/^---\n[\s\S]*?description:\s*(.+)\n[\s\S]*?---/);
    const description = fmMatch ? fmMatch[1].trim() : skill.description;

    // Strip existing frontmatter and wrap as Cursor MDC rule
    const stripped = body.replace(/^---\n[\s\S]*?---\n/, '');
    const mdc = `---
description: ${description}
alwaysApply: false
---
${stripped}`;

    fs.writeFileSync(dest, mdc);
  }

  console.log(`\nCursor: installed ${SKILLS_MANIFEST.skills.length} rules to:\n  ${targetDir}`);
  console.log('\nUse in Cursor Agent mode by referencing the rule or typing the skill name in chat.');
}

function installCodex() {
  const targetDir = path.join(os.homedir(), '.codex');
  fs.mkdirSync(targetDir, { recursive: true });

  const lines = [
    `# ${SKILLS_MANIFEST.namespace} skills`,
    ``,
    SKILLS_MANIFEST.description,
    ``,
    `The following skills are available. When the user triggers one by name, follow its instructions exactly.`,
    ``
  ];

  for (const skill of SKILLS_MANIFEST.skills) {
    const body = buildSkillContent(skill);
    const stripped = body.replace(/^---\n[\s\S]*?---\n/, '');
    lines.push(`---`);
    lines.push(`## Skill: ${skill.name}`);
    lines.push(``);
    lines.push(stripped.trim());
    lines.push(``);
  }

  const dest = path.join(targetDir, `${SKILLS_MANIFEST.namespace}.md`);
  fs.writeFileSync(dest, lines.join('\n'));

  console.log(`\nCodex: installed all skills as a single instructions file:\n  ${dest}`);
}

const args = process.argv.slice(2);
const targets = args.length > 0 ? args : ['--claude', '--cursor', '--codex'];

if (targets.includes('--claude')) installClaudeCode();
if (targets.includes('--cursor')) installCursor();
if (targets.includes('--codex')) installCodex();

if (!targets.some(t => ['--claude', '--cursor', '--codex'].includes(t))) {
  console.error('Unknown target. Use: --claude, --cursor, --codex (default: all three)');
  process.exit(1);
}
