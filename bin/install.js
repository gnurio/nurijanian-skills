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
const CODEX_SKILLS_DIR = path.join(CODEX_DIR, 'skills');

const PMOS_BASE = path.join(
  HOME,
  'Library/Mobile Documents/iCloud~md~obsidian/Documents/EVERNOTE 2025/05 PRODMGMT.WORLD/pm-os'
);
const PMOS_CLAUDE_SKILLS_DIR = path.join(PMOS_BASE, '.claude', 'skills');
const PMOS_CURSOR_SKILLS_DIR = path.join(PMOS_BASE, '.cursor', 'skills');

// Legacy install locations to clean up from the old namespaced layout.
const LEGACY_CLAUDE = path.join(CLAUDE_SKILLS_DIR, 'pm-alignment');
const LEGACY_CURSOR = path.join(CURSOR_RULES_DIR, 'pm-alignment');
const LEGACY_CODEX = path.join(CODEX_DIR, 'pm-alignment.md');
const LEGACY_CODEX_BUNDLE = path.join(CODEX_DIR, `${MANIFEST.name}.md`);

function parseArgs(argv) {
  const flags = new Set(argv);
  const hasTargetFlag = ['--claude', '--cursor', '--codex', '--pmos'].some((t) => flags.has(t));
  return {
    claude: flags.has('--claude') || !hasTargetFlag,
    cursor: flags.has('--cursor') || !hasTargetFlag,
    codex: flags.has('--codex') || !hasTargetFlag,
    pmos: flags.has('--pmos'),
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

Targets (default: all except --pmos):
  --claude     Install to Claude Code (~/.claude/skills/<skill>/)
  --cursor     Install to Cursor (~/.cursor/skills/<skill>/)
  --codex      Install to Codex (~/.codex/skills/<skill>/)
  --pmos       Copy (not symlink) into pm-os project for distribution

Modes:
  --link       Symlink source dirs for local dev (Claude Code, Cursor, and Codex)
  --clean      Remove previously installed skills before installing
  --uninstall  Remove installed skills and exit
  --help       Show this message
`);
}

function rmIfExists(target) {
  const stat = fs.lstatSync(target, { throwIfNoEntry: false });
  if (!stat) return;
  if (stat.isSymbolicLink()) {
    fs.unlinkSync(target);
  } else {
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
    rmIfExists(LEGACY_CODEX_BUNDLE);
    for (const skill of MANIFEST.skills) {
      rmIfExists(path.join(CODEX_SKILLS_DIR, skill.name));
    }
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

function installCodex(opts) {
  fs.mkdirSync(CODEX_SKILLS_DIR, { recursive: true });
  rmIfExists(LEGACY_CODEX);
  rmIfExists(LEGACY_CODEX_BUNDLE);
  for (const skill of MANIFEST.skills) {
    const src = path.join(ROOT, skill.dir);
    const dest = path.join(CODEX_SKILLS_DIR, skill.name);
    rmIfExists(dest);
    if (opts.link) {
      fs.symlinkSync(src, dest);
    } else {
      copyDir(src, dest);
    }
  }
  console.log(
    `\nCodex: installed ${MANIFEST.skills.length} skills to ${CODEX_SKILLS_DIR} (${opts.link ? 'symlinked' : 'copied'})`
  );
  for (const skill of MANIFEST.skills) {
    console.log(`  /${skill.name}`);
  }
}

function syncPmos() {
  for (const dir of [PMOS_CLAUDE_SKILLS_DIR, PMOS_CURSOR_SKILLS_DIR]) {
    if (!fs.existsSync(dir)) {
      console.warn(`  skipping ${dir} (not found)`);
      continue;
    }
    for (const skill of MANIFEST.skills) {
      const src = path.join(ROOT, skill.dir);
      const dest = path.join(dir, skill.name);
      rmIfExists(dest);
      copyDir(src, dest);
    }
    console.log(`pm-os: synced ${MANIFEST.skills.length} skills to ${dir}`);
  }
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) return printHelp();

  if (opts.uninstall) {
    cleanTargets(opts);
    console.log('\nUninstalled nurijanian-skills from selected targets.');
    return;
  }

  if (opts.clean) cleanTargets(opts);

  if (opts.claude) installClaudeCode(opts);
  if (opts.cursor) installCursor(opts);
  if (opts.codex) installCodex(opts);
  if (opts.pmos) syncPmos();

  console.log('\nDone. Re-run this command any time you update a skill source file.');
}

main();
