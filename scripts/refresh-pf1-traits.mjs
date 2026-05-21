#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  cleanMarkdownLinks,
  firstHeading,
  listMarkdownFiles,
  normalizeName,
  normalizeWhitespace,
  paragraphBlocks,
  readJson,
  writeJson,
} from './pf1-markdown-utils.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const vaultRoot = '/home/lancer1977/vaults/rpgs/RPG Vault/10_Rules/Pathfinder 1e';
const legacyTraitsFile = path.join(repoRoot, 'pathfinder1e', 'traits.json');
const outputFile = path.join(repoRoot, 'pathfinder1e', 'traits.json');
const sourceIndexFile = path.join(repoRoot, 'sources', 'pf1-trait-source-index.json');

function parseMarkdown(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const title = firstHeading(text);
  if (!title) return null;

  const blocks = paragraphBlocks(text);
  const records = [];
  let currentCategory = null;

  for (const block of blocks) {
    if (block.startsWith('### ')) {
      currentCategory = block.slice(4).trim();
      continue;
    }

    if (block.startsWith('## ')) {
      currentCategory = block.slice(3).trim();
      continue;
    }

    const match = block.match(/^\*\*([^*]+)\*\*\s*:\s*([\s\S]+)$/);
    if (!match) continue;

    records.push({
      key: normalizeName(match[1]),
      title: match[1].trim(),
      category: currentCategory,
      benefit: cleanMarkdownLinks(normalizeWhitespace(match[2])),
      relativePath: path.relative(vaultRoot, filePath).replaceAll(path.sep, '/'),
    });
  }

  return records;
}

function main() {
  const markdownIndex = new Map();
  for (const filePath of listMarkdownFiles(path.join(vaultRoot, 'ultimateCampaign', 'characterBackground'))) {
    if (!filePath.endsWith(`${path.sep}traits.md`)) continue;
    for (const record of parseMarkdown(filePath) ?? []) {
      if (!markdownIndex.has(record.key)) {
        markdownIndex.set(record.key, record);
      }
    }
  }

  const legacyRecords = readJson(legacyTraitsFile);
  const mergedRecords = legacyRecords.map((record) => {
    const markdown = markdownIndex.get(normalizeName(record.Name));
    if (!markdown) return record;

    return {
      ...record,
      MarkdownPath: markdown.relativePath,
      MarkdownTitle: markdown.title,
      MarkdownCategory: markdown.category,
      MarkdownBenefit: markdown.benefit,
    };
  });

  const sourceIndex = {
    generatedAt: new Date().toISOString(),
    vaultRoot,
    legacyTraitsFile,
    markdownCoverage: mergedRecords.filter((record) => record.MarkdownPath).length,
    totalRecords: mergedRecords.length,
    records: mergedRecords.map((record) => ({
      name: record.Name,
      markdownPath: record.MarkdownPath ?? null,
      category: record.Category ?? null,
      type: record.Type ?? null,
    })),
  };

  writeJson(outputFile, mergedRecords);
  writeJson(sourceIndexFile, sourceIndex);

  console.log(`wrote ${mergedRecords.length} trait records to ${outputFile}`);
  console.log(`markdown-backed records: ${sourceIndex.markdownCoverage}`);
}

main();
