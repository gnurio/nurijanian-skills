#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const SKILLS_MANIFEST = require(path.join(ROOT, 'skills.json'));
const TARGET_DIR = path.join(os.homedir(), '.claude', 'skills', SKILLS_MANIFEST.namespace);

const REF_PATH = path.join(ROOT, 'references', 'pm-excellence-behaviors.md');
const ORCHESTRATOR_SKILL = 'orchestrate-pm-alignment';

// The line in the orchestrator that tells Claude to read the external reference file.
// We replace it with the actual content so the installed skill is self-contained.
const REF_DIRECTIVE =
  "Read `references/pm-excellence-behaviors.md` before doing anything else. That file contains the\nfull behavioral framework you'll use to guide, challenge, and assess the PM.";

function install() {
  fs.mkdirSync(TARGET_DIR, { recursive: true });

  const refContent = fs.readFileSync(REF_PATH, 'utf8');

  for (const skill of SKILLS_MANIFEST.skills) {
    const src = path.join(ROOT, skill.file);
    const dest = path.join(TARGET_DIR, `${skill.name}.md`);

    let content = fs.readFileSync(src, 'utf8');

    // Embed the reference into the orchestrator so it works from any project directory
    if (skill.name === ORCHESTRATOR_SKILL) {
      if (content.includes(REF_DIRECTIVE)) {
        const embedded =
          `The PM excellence behavioral framework is embedded below — use it as your source of truth:\n\n<pm-excellence-behaviors>\n${refContent}\n</pm-excellence-behaviors>`;
        content = content.replace(REF_DIRECTIVE, embedded);
      } else {
        // Fallback: append at end
        content += `\n\n---\n\n## PM Excellence Behaviors (Reference)\n\n${refContent}`;
      }
    }

    fs.writeFileSync(dest, content);
  }

  console.log(`\nInstalled ${SKILLS_MANIFEST.skills.length} PM alignment skills to:\n  ${TARGET_DIR}\n`);
  console.log('Available skills:');
  for (const skill of SKILLS_MANIFEST.skills) {
    console.log(`  pm-alignment:${skill.name}`);
  }
  console.log('\nStart with: /pm-alignment:orchestrate-pm-alignment\n');
}

install();
