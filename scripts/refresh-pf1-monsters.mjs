#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { firstHeading, listMarkdownFiles, normalizeName, readJson, writeJson } from './pf1-markdown-utils.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const vaultRoot = '/home/lancer1977/vaults/rpgs/RPG Vault/10_Rules/Pathfinder 1e';
const legacyMonstersFile = path.join(repoRoot, 'pathfinder1e', 'monster.json');
const outputFile = path.join(repoRoot, 'pathfinder1e', 'monster.json');
const sourceIndexFile = path.join(repoRoot, 'sources', 'pf1-monster-source-index.json');

function parseMonsterMarkdown(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const title = firstHeading(text);
  if (!title) return null;

  return {
    key: normalizeName(title),
    title,
    relativePath: path.relative(vaultRoot, filePath).replaceAll(path.sep, '/'),
  };
}

function main() {
  const markdownIndex = new Map();
  for (const filePath of listMarkdownFiles(path.join(vaultRoot, 'monsters'))) {
    const parsed = parseMonsterMarkdown(filePath);
    if (parsed) markdownIndex.set(parsed.key, parsed);
  }

  for (const filePath of listMarkdownFiles(path.join(vaultRoot, 'bestiary3'))) {
    const parsed = parseMonsterMarkdown(filePath);
    if (parsed && !markdownIndex.has(parsed.key)) markdownIndex.set(parsed.key, parsed);
  }

  const legacyRecords = readJson(legacyMonstersFile);
  const mergedRecords = legacyRecords.map((record) => {
    const markdown = markdownIndex.get(normalizeName(record.Name));
    if (!markdown) return record;

    return {
      ...record,
      MarkdownPath: markdown.relativePath,
      MarkdownTitle: markdown.title,
    };
  });

  const sourceIndex = {
    generatedAt: new Date().toISOString(),
    vaultRoot,
    legacyMonstersFile,
    markdownCoverage: mergedRecords.filter((record) => record.MarkdownPath).length,
    totalRecords: mergedRecords.length,
    records: mergedRecords.map((record) => ({
      name: record.Name,
      markdownPath: record.MarkdownPath ?? null,
      cr: record.CR ?? null,
      source: record.Source ?? null,
    })),
  };

  writeJson(outputFile, mergedRecords);
  writeJson(sourceIndexFile, sourceIndex);

  console.log(`wrote ${mergedRecords.length} monster records to ${outputFile}`);
  console.log(`markdown-backed records: ${sourceIndex.markdownCoverage}`);
}

main();
