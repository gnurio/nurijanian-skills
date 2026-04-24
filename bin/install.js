#!/usr/bin/env node
/*
 * Install nurijanian-skills into Claude Code, Cursor, and/or Codex.
 *
 * Usage:
 *   node bin/install.js                        # all targets, copy mode
 *   node bin/install.js --claude --cursor      # only selected targets
 *   node bin/install.js --link                 # symlink skill dirs (local dev)
 *   node bin/install.js --clean                # remove previously installed skills before install
 *   node bin/install.js --uninstall            # remove only, no install
 *   npx nurijanian-skills                      # same as default (from installed package)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const MANIFEST = require(path.join(ROOT, 'skills.json'));
const HOME = os.homedir();

const CLAUDE_SKILLS_DIR = path.join(HOME, '.claude', 'skills');
const CURSOR_SKILLS_DIR = path.join(HOME, '.cursor', 'skills');
const CURSOR_RULES_DIR = path.join(HOME, '.cursor', 'rules');
const CODEX_DIR = path.join(HOME, '.codex');

// Legacy install locations to clean up from the old namespaced layout.
const LEGACY_CLAUDE = path.join(CLAUDE_SKILLS_DIR, 'pm-alignment');
const LEGACY_CURSOR = path.join(CURSOR_RULES_DIR, 'pm-alignment');
const LEGACY_CODEX = path.join(CODEX_DIR, 'pm-alignment.md');

function parseArgs(argv) {
  const flags = new Set(argv);
  const hasTargetFlag = ['--claude', '--cursor', '--codex'].some((t) => flags.has(t));
  return {
    claude: flags.has('--claude') || !hasTargetFlag,
    cursor: flags.has('--cursor') || !hasTargetFlag,
    codex: flags.has('--codex') || !hasTargetFlag,
    link: flags.has('--link'),
    clean: flags.has('--clean'),
    uninstall: flags.has('--uninstall'),
    help: flags.has('--help') || flags.has('-h'),
  };
}

function printHelp() {
  console.log(`nurijanian-skills v${MANIFEST.version}

Usage:
  npx nurijanian-skills [options]

Targets (default: all):
  --claude     Install to Claude Code (~/.claude/skills/<skill>/)
  --cursor     Install to Cursor (~/.cursor/skills/<skill>/)
  --codex      Install to Codex (~/.codex/nurijanian-skills.md)

Modes:
  --link       Symlink source dirs for local dev (Claude Code and Cursor)
  --clean      Remove previously installed skills before installing
  --uninstall  Remove installed skills and exit
  --help       Show this message
`);
}

function rmIfExists(target) {
  if (fs.existsSync(target) || fs.lstatSync(target, { throwIfNoEntry: false })) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    } else if (entry.isSymbolicLink()) {
      const linkTarget = fs.readlinkSync(srcPath);
      fs.symlinkSync(linkTarget, destPath);
    }
  }
}

function readSkillMarkdown(skill) {
  return fs.readFileSync(path.join(ROOT, skill.dir, 'SKILL.md'), 'utf8');
}

function cleanTargets(opts) {
  if (opts.claude) {
    rmIfExists(LEGACY_CLAUDE);
    for (const skill of MANIFEST.skills) {
      rmIfExists(path.join(CLAUDE_SKILLS_DIR, skill.name));
    }
  }
  if (opts.cursor) {
    rmIfExists(LEGACY_CURSOR);
    for (const skill of MANIFEST.skills) {
      rmIfExists(path.join(CURSOR_SKILLS_DIR, skill.name));
      rmIfExists(path.join(CURSOR_RULES_DIR, `${skill.name}.mdc`));
    }
  }
  if (opts.codex) {
    rmIfExists(LEGACY_CODEX);
    rmIfExists(path.join(CODEX_DIR, `${MANIFEST.name}.md`));
  }
}

function installClaudeCode(opts) {
  fs.mkdirSync(CLAUDE_SKILLS_DIR, { recursive: true });
  rmIfExists(LEGACY_CLAUDE);
  for (const skill of MANIFEST.skills) {
    const src = path.join(ROOT, skill.dir);
    const dest = path.join(CLAUDE_SKILLS_DIR, skill.name);
    rmIfExists(dest);
    if (opts.link) {
      fs.symlinkSync(src, dest);
    } else {
      copyDir(src, dest);
    }
  }
  console.log(
    `\nClaude Code: installed ${MANIFEST.skills.length} skills to ${CLAUDE_SKILLS_DIR} (${opts.link ? 'symlinked' : 'copied'})`
  );
  for (const skill of MANIFEST.skills) {
    console.log(`  /${skill.name}`);
  }
}

function installCursor(opts) {
  fs.mkdirSync(CURSOR_SKILLS_DIR, { recursive: true });
  rmIfExists(LEGACY_CURSOR);
  for (const skill of MANIFEST.skills) {
    const src = path.join(ROOT, skill.dir);
    const dest = path.join(CURSOR_SKILLS_DIR, skill.name);
    rmIfExists(dest);
    rmIfExists(path.join(CURSOR_RULES_DIR, `${skill.name}.mdc`));
    if (opts.link) {
      fs.symlinkSync(src, dest);
    } else {
      copyDir(src, dest);
    }
  }
  console.log(
    `\nCursor: installed ${MANIFEST.skills.length} skills to ${CURSOR_SKILLS_DIR} (${opts.link ? 'symlinked' : 'copied'})`
  );
  console.log('  Reference by name in Agent mode.');
  for (const skill of MANIFEST.skills) {
    console.log(`  /${skill.name}`);
  }
}

function installCodex() {
  fs.mkdirSync(CODEX_DIR, { recursive: true });
  rmIfExists(LEGACY_CODEX);
  const lines = [
    `# ${MANIFEST.name} skills`,
    '',
    MANIFEST.description,
    '',
    'The following skills are available. When the user triggers one by name, follow its instructions exactly.',
    '',
  ];
  for (const skill of MANIFEST.skills) {
    const body = readSkillMarkdown(skill);
    const stripped = body.replace(/^---\n[\s\S]*?---\n/, '').trim();
    lines.push('---');
    lines.push(`## Skill: ${skill.name}`);
    lines.push('');
    lines.push(stripped);
    lines.push('');
  }
  const dest = path.join(CODEX_DIR, `${MANIFEST.name}.md`);
  fs.writeFileSync(dest, lines.join('\n'));
  console.log(`\nCodex: installed all skills as a single instructions file: ${dest}`);
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) return printHelp();

  if (opts.uninstall) {
    cleanTargets(opts);
    console.log('\nUninstalled nurijanian-skills from selected targets.');
    return;
  }

  if (opts.link && opts.codex) {
    console.warn('Note: --link applies to directory-based targets; Codex will still copy into one instructions file.');
  }

  if (opts.clean) cleanTargets(opts);

  if (opts.claude) installClaudeCode(opts);
  if (opts.cursor) installCursor(opts);
  if (opts.codex) installCodex();

  console.log('\nDone. Re-run this command any time you update a skill source file.');
}

main();
