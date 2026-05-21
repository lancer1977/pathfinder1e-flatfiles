#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const vaultRoot = '/home/lancer1977/vaults/rpgs/RPG Vault/10_Rules/Pathfinder 1e';
const legacyClassesFile = '/home/lancer1977/code/DataSeeds/pathfinder1e/characterClass.js';
const outputFile = path.join(repoRoot, 'pathfinder1e', 'characterClass.json');
const sourceIndexFile = path.join(repoRoot, 'sources', 'pf1-class-source-index.json');

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

function parseHeading(text) {
  const match = text.match(/^#\s+(.+?)\s*$/m);
  return match ? match[1].trim() : null;
}

function captureFirst(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
}

function captureSummary(text) {
  const match = text.match(/^# .+\n\n([\s\S]*?)\n\*\*Role\*\* :/m);
  if (!match) return null;
  return match[1].replace(/\s+/g, ' ').trim();
}

function parseClassMarkdown(filePath) {
  const text = readText(filePath);
  const title = parseHeading(text);
  if (!title) return null;

  const classSkills = captureFirst(
    text,
    /class skills(?:[^]*?) are\s+(.+?)\s*\.\s*\n\n\*\*Skill Ranks per Level\*\*/i,
  );

  return {
    title,
    relativePath: path.relative(vaultRoot, filePath).replaceAll(path.sep, '/'),
    summary: captureSummary(text),
    role: captureFirst(text, /\*\*Role\*\* :\s*([^\n]+)/),
    alignment: captureFirst(text, /\*\*Alignment\*\* :\s*([^\n]+)/),
    hitDie: captureFirst(text, /\*\*Hit Die\*\* :\s*([^.\n]+)\./),
    skillRanksPerLevel: captureFirst(text, /\*\*Skill Ranks per Level\*\* :\s*([^\n]+)/),
    classSkills,
  };
}

function parseLegacyClasses(filePath) {
  const text = readText(filePath).trim();
  return JSON.parse(text);
}

function normalizeWhitespace(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/\s+/g, ' ').trim();
}

function buildMergedRecord(legacyRecord, markdownRecord) {
  const merged = {
    ...legacyRecord,
  };

  if (markdownRecord) {
    merged.MarkdownPath = markdownRecord.relativePath;
    merged.MarkdownTitle = markdownRecord.title;
    merged.Summary = markdownRecord.summary;
    merged.Role = markdownRecord.role;
    merged.Alignment = markdownRecord.alignment;
    merged.HitDieText = markdownRecord.hitDie;
    merged.SkillRanksText = markdownRecord.skillRanksPerLevel;
    merged.ClassSkillsMarkdown = markdownRecord.classSkills;
  }

  if (merged.ClassSkillsMarkdown) {
    merged.ClassSkillsMarkdown = normalizeWhitespace(merged.ClassSkillsMarkdown);
  }

  if (merged.Summary) {
    merged.Summary = normalizeWhitespace(merged.Summary);
  }

  return merged;
}

function main() {
  const markdownFiles = listMarkdownFiles(vaultRoot);
  const markdownByTitle = new Map();

  for (const filePath of markdownFiles) {
    const parsed = parseClassMarkdown(filePath);
    if (parsed) {
      markdownByTitle.set(parsed.title, parsed);
    }
  }

  const legacyRecords = parseLegacyClasses(legacyClassesFile);
  const mergedRecords = legacyRecords.map((record) => buildMergedRecord(record, markdownByTitle.get(record.Name)));

  const sourceIndex = {
    generatedAt: new Date().toISOString(),
    vaultRoot,
    legacyClassesFile,
    markdownCoverage: mergedRecords.filter((record) => record.MarkdownPath).length,
    totalRecords: mergedRecords.length,
    records: mergedRecords.map((record) => ({
      name: record.Name,
      markdownPath: record.MarkdownPath ?? null,
      source: record.Source ?? null,
      type: record.Type ?? null,
      spellStat: record.SpellStat ?? null,
      casterType: record.CasterType ?? null,
    })),
  };

  writeJson(outputFile, mergedRecords);
  writeJson(sourceIndexFile, sourceIndex);

  console.log(`wrote ${mergedRecords.length} class records to ${outputFile}`);
  console.log(`markdown-backed records: ${sourceIndex.markdownCoverage}`);
}

main();
