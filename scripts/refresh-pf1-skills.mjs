#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const vaultRoot = '/home/lancer1977/vaults/rpgs/RPG Vault/10_Rules/Pathfinder 1e';
const legacySkillsFile = '/home/lancer1977/code/DataSeeds/pathfinder1e/skills.js';
const outputFile = path.join(repoRoot, 'pathfinder1e', 'skills.json');
const sourceIndexFile = path.join(repoRoot, 'sources', 'pf1-skill-source-index.json');

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function listMarkdownFiles(rootDir) {
  const results = [];

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
  return results;
}

function normalizeName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function captureFirst(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
}

function captureBlock(text, startPattern, endPattern) {
  const startMatch = text.match(startPattern);
  if (!startMatch) return null;
  const startIndex = startMatch.index + startMatch[0].length;
  const tail = text.slice(startIndex);
  const endMatch = tail.match(endPattern);
  const block = endMatch ? tail.slice(0, endMatch.index) : tail;
  return block.trim();
}

function parseSkillMarkdown(filePath) {
  const text = readText(filePath);
  const title = captureFirst(text, /^#\s+(.+?)\s*$/m);
  if (!title) return null;

  const headingLine = captureFirst(text, /^##\s*\((.+?)\)\s*$/m);
  const intro = captureBlock(text, /^#\s+.+?\s*$/m, /\n\*\*Check\*\* :/m);

  return {
    title,
    key: normalizeName(title),
    relativePath: path.relative(vaultRoot, filePath).replaceAll(path.sep, '/'),
    abilityBlock: headingLine,
    intro: intro ? intro.replace(/\s+/g, ' ').trim() : null,
    check: captureBlock(text, /\n\*\*Check\*\* :/m, /\n\*\*Action\*\* :/m)?.replace(/\s+/g, ' ').trim() ?? null,
    action: captureFirst(text, /\*\*Action\*\* :\s*([^\n]+)/),
    tryAgain: captureFirst(text, /\*\*Try Again\*\* :\s*([^\n]+)/),
    special: captureBlock(text, /\n\*\*Special\*\* :/m, /\n\*\*Restriction\*\* :/m)?.replace(/\s+/g, ' ').trim() ?? null,
    restriction: captureBlock(text, /\n\*\*Restriction\*\* :/m, /\n\*\*Untrained\*\* :/m)?.replace(/\s+/g, ' ').trim() ?? null,
    untrained: captureFirst(text, /\*\*Untrained\*\* :\s*([^\n]+)/),
  };
}

function parseLegacySkills(filePath) {
  return JSON.parse(readText(filePath).trim());
}

function buildMergedRecord(legacyRecord, markdownRecord) {
  const merged = { ...legacyRecord };
  if (markdownRecord) {
    merged.MarkdownPath = markdownRecord.relativePath;
    merged.MarkdownTitle = markdownRecord.title;
    merged.AbilityText = markdownRecord.abilityBlock;
    merged.Intro = markdownRecord.intro;
    merged.Check = markdownRecord.check;
    merged.Action = markdownRecord.action;
    merged.TryAgain = markdownRecord.tryAgain;
    merged.Special = markdownRecord.special;
    merged.Restriction = markdownRecord.restriction;
    merged.Untrained = markdownRecord.untrained;
  }
  return merged;
}

function main() {
  const markdownFiles = listMarkdownFiles(path.join(vaultRoot, 'skills'));
  const markdownByKey = new Map();

  for (const filePath of markdownFiles) {
    const parsed = parseSkillMarkdown(filePath);
    if (parsed) markdownByKey.set(parsed.key, parsed);
  }

  const legacyRecords = parseLegacySkills(legacySkillsFile);
  const mergedRecords = legacyRecords.map((record) => buildMergedRecord(record, markdownByKey.get(normalizeName(record.Name))));

  const sourceIndex = {
    generatedAt: new Date().toISOString(),
    vaultRoot,
    legacySkillsFile,
    markdownCoverage: mergedRecords.filter((record) => record.MarkdownPath).length,
    totalRecords: mergedRecords.length,
    records: mergedRecords.map((record) => ({
      name: record.Name,
      markdownPath: record.MarkdownPath ?? null,
      categoryId: record.CategoryId ?? null,
      stat: record.Stat ?? null,
      trained: record.Trained ?? null,
    })),
  };

  writeJson(outputFile, mergedRecords);
  writeJson(sourceIndexFile, sourceIndex);

  console.log(`wrote ${mergedRecords.length} skill records to ${outputFile}`);
  console.log(`markdown-backed records: ${sourceIndex.markdownCoverage}`);
}

main();
