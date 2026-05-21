#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const vaultRoot = '/home/lancer1977/vaults/rpgs/RPG Vault/10_Rules/Pathfinder 1e';
const legacySpellsFile = '/home/lancer1977/code/DataSeeds/pathfinder1e/spells.js';
const outputFile = path.join(repoRoot, 'pathfinder1e', 'spells.json');
const sourceIndexFile = path.join(repoRoot, 'sources', 'pf1-spell-source-index.json');

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

function parseSpellMarkdown(filePath) {
  const text = readText(filePath);
  const title = (text.match(/^\s*\*\*(.+?)\*\*\s*$/m) ?? text.match(/^#\s+(.+?)\s*$/m))?.[1]?.trim() ?? null;
  if (!title) return null;

  return {
    title,
    key: normalizeName(title),
    relativePath: path.relative(vaultRoot, filePath).replaceAll(path.sep, '/'),
  };
}

function parseLegacySpells(filePath) {
  return JSON.parse(readText(filePath).trim());
}

function buildMergedRecord(legacyRecord, markdownRecord) {
  const merged = { ...legacyRecord };
  if (markdownRecord) {
    merged.MarkdownPath = markdownRecord.relativePath;
    merged.MarkdownTitle = markdownRecord.title;
  }
  return merged;
}

function main() {
  const markdownFiles = listMarkdownFiles(path.join(vaultRoot, 'spells'));
  const markdownByKey = new Map();

  for (const filePath of markdownFiles) {
    const parsed = parseSpellMarkdown(filePath);
    if (parsed) markdownByKey.set(parsed.key, parsed);
  }

  const legacyRecords = parseLegacySpells(legacySpellsFile);
  const mergedRecords = legacyRecords.map((record) => buildMergedRecord(record, markdownByKey.get(normalizeName(record.Name))));

  const sourceIndex = {
    generatedAt: new Date().toISOString(),
    vaultRoot,
    legacySpellsFile,
    markdownCoverage: mergedRecords.filter((record) => record.MarkdownPath).length,
    totalRecords: mergedRecords.length,
    records: mergedRecords.map((record) => ({
      name: record.Name,
      markdownPath: record.MarkdownPath ?? null,
      source: record.Source ?? null,
      school: record.School ?? null,
      level: record.Level ?? null,
    })),
  };

  writeJson(outputFile, mergedRecords);
  writeJson(sourceIndexFile, sourceIndex);

  console.log(`wrote ${mergedRecords.length} spell records to ${outputFile}`);
  console.log(`markdown-backed records: ${sourceIndex.markdownCoverage}`);
}

main();
