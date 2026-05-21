#!/usr/bin/env node
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const upstreamUrl = 'https://github.com/Obsidian-TTRPG-Community/Pathfinder-1E-SRD-Markdown.git';
const upstreamBranch = process.env.PF1_SRD_MARKDOWN_BRANCH ?? 'main';
const upstreamCache = process.env.PF1_SRD_MARKDOWN_CACHE
  ? path.resolve(process.env.PF1_SRD_MARKDOWN_CACHE)
  : path.join(repoRoot, '.cache', 'Pathfinder-1E-SRD-Markdown');
const shouldPull = !process.argv.includes('--no-pull');

const spellsFile = path.join(repoRoot, 'pathfinder1e', 'spells.json');
const monstersFile = path.join(repoRoot, 'pathfinder1e', 'monster.json');
const sourceIndexFile = path.join(repoRoot, 'sources', 'pf1-srd-markdown-source-index.json');
const futureOverlayFamilies = [
  {
    folder: 'classes',
    overlayFamily: 'classes',
    parser: parseGenericMarkdown,
    targets: [
      { family: 'classes', filePath: path.join(repoRoot, 'pathfinder1e', 'characterClass.json') },
    ],
  },
  {
    folder: 'skills',
    overlayFamily: 'skills',
    parser: parseGenericMarkdown,
    targets: [
      { family: 'skills', filePath: path.join(repoRoot, 'pathfinder1e', 'skills.json') },
    ],
  },
  {
    folder: 'equipment',
    overlayFamily: 'equipment',
    parser: parseGenericMarkdown,
    targets: [
      { family: 'equipment-armor', filePath: path.join(repoRoot, 'pathfinder1e', 'armor.json') },
      { family: 'equipment-weapons', filePath: path.join(repoRoot, 'pathfinder1e', 'weapon.json') },
      { family: 'equipment-mundane', filePath: path.join(repoRoot, 'pathfinder1e', 'mundane.json') },
      { family: 'equipment-items', filePath: path.join(repoRoot, 'pathfinder1e', 'magicItems.json') },
    ],
  },
  {
    folder: 'feats',
    overlayFamily: 'feats',
    parser: parseGenericMarkdown,
    targets: [
      { family: 'feats', filePath: path.join(repoRoot, 'pathfinder1e', 'feats.json') },
    ],
  },
  {
    folder: 'traits',
    overlayFamily: 'traits',
    parser: parseGenericMarkdown,
    targets: [
      { family: 'traits', filePath: path.join(repoRoot, 'pathfinder1e', 'traits.json') },
    ],
  },
];

function runGit(args, options = {}) {
  const output = execFileSync('git', args, {
    cwd: options.cwd ?? repoRoot,
    encoding: 'utf8',
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
  });

  return typeof output === 'string' ? output.trim() : '';
}

function ensureUpstreamCache() {
  fs.mkdirSync(path.dirname(upstreamCache), { recursive: true });

  if (!fs.existsSync(path.join(upstreamCache, '.git'))) {
    runGit(['clone', '--depth', '1', '--branch', upstreamBranch, upstreamUrl, upstreamCache], { stdio: 'inherit' });
  } else if (shouldPull) {
    runGit(['fetch', '--depth', '1', 'origin', upstreamBranch], { cwd: upstreamCache, stdio: 'inherit' });
    runGit(['checkout', upstreamBranch], { cwd: upstreamCache, stdio: 'inherit' });
    runGit(['reset', '--hard', `origin/${upstreamBranch}`], { cwd: upstreamCache, stdio: 'inherit' });
  }

  return runGit(['rev-parse', 'HEAD'], { cwd: upstreamCache });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function listMarkdownFiles(rootDir) {
  const results = [];
  if (!fs.existsSync(rootDir)) return results;

  function visit(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        results.push(fullPath);
      }
    }
  }

  visit(rootDir);
  return results.sort((left, right) => left.localeCompare(right));
}

function normalizeName(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function normalizeWhitespace(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/\s+/g, ' ').trim();
}

function cleanMarkdownLinks(value) {
  if (!value) return value;
  return normalizeWhitespace(
    value
      .replace(/\[\[([^\]|]+)\|([^\]]+)]]/g, '$2')
      .replace(/\[\[([^\]]+)]]/g, '$1')
      .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
      .replace(/\*\*/g, ''),
  );
}

function parseFrontMatter(text) {
  if (!text.startsWith('---\n')) return {};
  const endIndex = text.indexOf('\n---', 4);
  if (endIndex < 0) return {};

  const fields = {};
  for (const line of text.slice(4, endIndex).split('\n')) {
    const match = line.match(/^([^:#]+):\s*(.*)$/);
    if (!match) continue;
    fields[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }

  return fields;
}

function parseDataviewFields(text) {
  const fields = {};
  const fieldPattern = /^\*\*([^*]+)\*\*::\s*(.+?)\s*$/gm;
  let match;

  while ((match = fieldPattern.exec(text)) !== null) {
    fields[match[1].trim().toLowerCase()] = cleanMarkdownLinks(match[2].trim());
  }

  return fields;
}

function firstHeading(text) {
  return (
    text.match(/^##\s+(.+?)\s*$/m)?.[1]?.trim()
    ?? text.match(/^#\s+(.+?)\s*$/m)?.[1]?.trim()
    ?? null
  );
}

export function parseGenericMarkdown(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const frontMatter = parseFrontMatter(text);
  const fields = parseDataviewFields(text);
  const title = firstHeading(text) ?? frontMatter.aliases?.replace(/^\[|\]$/g, '') ?? null;
  if (!title) return null;

  return {
    key: normalizeName(title),
    title,
    relativePath: path.relative(upstreamCache, filePath).replaceAll(path.sep, '/'),
    updated: frontMatter.updated || null,
    source: fields.source ?? null,
    description: cleanMarkdownLinks(sectionText(text, 'Description')),
  };
}

function sectionText(text, heading) {
  const pattern = new RegExp(`^#{2,3}\\s+${heading}\\s*$`, 'im');
  const match = text.match(pattern);
  if (!match) return null;

  const start = match.index + match[0].length;
  const tail = text.slice(start);
  const next = tail.match(/^#{2,3}\s+/m);
  const section = next ? tail.slice(0, next.index) : tail;
  return normalizeWhitespace(section);
}

function parseSpellMarkdown(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const frontMatter = parseFrontMatter(text);
  const fields = parseDataviewFields(text);
  const title = firstHeading(text) ?? frontMatter.aliases?.replace(/^\[|\]$/g, '') ?? null;
  if (!title) return null;

  return {
    key: normalizeName(title),
    title,
    relativePath: path.relative(upstreamCache, filePath).replaceAll(path.sep, '/'),
    updated: frontMatter.updated || null,
    source: fields.source ?? null,
    school: fields.school ?? null,
    level: fields.level ?? null,
    castingTime: fields['casting-time'] ?? null,
    components: fields.components ?? null,
    range: fields.range ?? null,
    area: fields.area ?? null,
    effect: fields.effect ?? null,
    targets: fields.targets ?? null,
    duration: fields.duration ?? null,
    savingThrow: fields['saving-throw'] ?? null,
    spellResistance: fields['spell-resistance'] ?? null,
    description: cleanMarkdownLinks(sectionText(text, 'Description')),
  };
}

function parseStatblock(text) {
  const block = text.match(/```statblock\n([\s\S]*?)\n```/m)?.[1];
  if (!block) return {};

  const fields = {};
  for (const line of block.split('\n')) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.+)$/);
    if (!match) continue;
    fields[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
  }

  return fields;
}

function parseMonsterMarkdown(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const frontMatter = parseFrontMatter(text);
  const statblock = parseStatblock(text);
  const title = statblock.name ?? frontMatter.name ?? firstHeading(text);
  if (!title) return null;

  return {
    key: normalizeName(title),
    title,
    relativePath: path.relative(upstreamCache, filePath).replaceAll(path.sep, '/'),
    updated: frontMatter.updated || null,
    source: statblock.source ?? null,
    cr: statblock.Monster_CR ?? null,
    xp: statblock.Monster_XP ?? null,
    alignment: statblock.alignment ?? null,
    size: statblock.size ?? null,
    type: statblock.type ?? null,
    subtype: statblock.subtype ?? null,
    shortDescription: statblock.desc_short ?? null,
    description: cleanMarkdownLinks(sectionText(text, 'Description')),
  };
}

export function indexMarkdownRecords(rootDir, parser) {
  const records = [];
  const byKey = new Map();

  for (const filePath of listMarkdownFiles(rootDir)) {
    const record = parser(filePath);
    if (!record) continue;
    records.push(record);
    if (!byKey.has(record.key)) byKey.set(record.key, record);
  }

  return { records, byKey };
}

function overlayGeneric(record, markdown) {
  if (!markdown) return record;
  return {
    ...record,
    SrdMarkdownPath: markdown.relativePath,
    SrdMarkdownTitle: markdown.title,
    SrdMarkdownUpdated: markdown.updated,
    SrdSource: markdown.source,
    SrdDescription: markdown.description,
  };
}

function overlaySpell(record, markdown) {
  if (!markdown) return record;
  return {
    ...record,
    SrdMarkdownPath: markdown.relativePath,
    SrdMarkdownTitle: markdown.title,
    SrdMarkdownUpdated: markdown.updated,
    SrdSource: markdown.source,
    SrdSchool: markdown.school,
    SrdLevel: markdown.level,
    SrdCastingTime: markdown.castingTime,
    SrdComponents: markdown.components,
    SrdRange: markdown.range,
    SrdArea: markdown.area,
    SrdEffect: markdown.effect,
    SrdTargets: markdown.targets,
    SrdDuration: markdown.duration,
    SrdSavingThrow: markdown.savingThrow,
    SrdSpellResistance: markdown.spellResistance,
    SrdDescription: markdown.description,
  };
}

function overlayMonster(record, markdown) {
  if (!markdown) return record;
  return {
    ...record,
    SrdMarkdownPath: markdown.relativePath,
    SrdMarkdownTitle: markdown.title,
    SrdMarkdownUpdated: markdown.updated,
    SrdSource: markdown.source,
    SrdCR: markdown.cr,
    SrdXP: markdown.xp,
    SrdAlignment: markdown.alignment,
    SrdSize: markdown.size,
    SrdType: markdown.type,
    SrdSubtype: markdown.subtype,
    SrdShortDescription: markdown.shortDescription,
    SrdDescription: markdown.description,
  };
}

export function updateFamily({ family, filePath, markdownIndex, overlay }) {
  const records = readJson(filePath);
  const updatedRecords = records.map((record) => overlay(record, markdownIndex.byKey.get(normalizeName(record.Name))));
  const coverage = updatedRecords.filter((record) => record.SrdMarkdownPath).length;

  writeJson(filePath, updatedRecords);

  return {
    family,
    flatfile: path.relative(repoRoot, filePath).replaceAll(path.sep, '/'),
    markdownRecords: markdownIndex.records.length,
    matchedRecords: coverage,
    totalRecords: updatedRecords.length,
    missingRecords: updatedRecords
      .filter((record) => !record.SrdMarkdownPath)
      .map((record) => record.Name)
      .sort((left, right) => left.localeCompare(right)),
  };
}

function collectFutureFamilies() {
  const families = [];

  for (const config of futureOverlayFamilies) {
    const rootDir = path.join(upstreamCache, config.folder);
    const markdownIndex = indexMarkdownRecords(rootDir, config.parser);
    if (markdownIndex.records.length === 0) {
      continue;
    }

    for (const target of config.targets) {
      families.push(
        updateFamily({
          family: target.family,
          filePath: target.filePath,
          markdownIndex,
          overlay: overlayGeneric,
        }),
      );
    }
  }

  return families;
}

function main() {
  const upstreamCommit = ensureUpstreamCache();
  const spellsIndex = indexMarkdownRecords(path.join(upstreamCache, 'spells'), parseSpellMarkdown);
  const monstersIndex = indexMarkdownRecords(path.join(upstreamCache, 'fantasy-bestiary'), parseMonsterMarkdown);

  const families = [
    updateFamily({
      family: 'spells',
      filePath: spellsFile,
      markdownIndex: spellsIndex,
      overlay: overlaySpell,
    }),
    updateFamily({
      family: 'monster',
      filePath: monstersFile,
      markdownIndex: monstersIndex,
      overlay: overlayMonster,
    }),
    ...collectFutureFamilies(),
  ];

  writeJson(sourceIndexFile, {
    generatedAt: new Date().toISOString(),
    upstreamUrl,
    upstreamBranch,
    upstreamCommit,
    upstreamCache,
    families,
  });

  for (const family of families) {
    console.log(`${family.family}: matched ${family.matchedRecords}/${family.totalRecords} flatfile records from ${family.markdownRecords} markdown records`);
  }
  console.log(`upstream commit: ${upstreamCommit}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
