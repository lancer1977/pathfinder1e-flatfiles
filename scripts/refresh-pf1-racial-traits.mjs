#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  cleanMarkdownLinks,
  firstHeading,
  normalizeName,
  normalizeWhitespace,
  paragraphBlocks,
  readJson,
  writeJson,
} from './pf1-markdown-utils.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const vaultRoot = '/home/lancer1977/vaults/rpgs/RPG Vault/10_Rules/Pathfinder 1e';
const legacyTraitsFile = path.join(repoRoot, 'pathfinder1e', 'racialtrait.json');
const outputFile = path.join(repoRoot, 'pathfinder1e', 'racialtrait.json');
const sourceIndexFile = path.join(repoRoot, 'sources', 'pf1-racial-trait-source-index.json');

function parseMarkdown(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const title = firstHeading(text);
  if (!title) return [];

  const blocks = paragraphBlocks(text);
  const records = [];
  let currentSection = null;
  let currentCategory = null;

  for (const block of blocks) {
    if (block.startsWith('## ')) {
      currentSection = block.slice(3).trim();
      currentCategory = null;
      continue;
    }

    if (block.startsWith('### ')) {
      currentCategory = block.slice(4).trim();
      continue;
    }

    const match = block.match(/^\*\*([^*]+)\*\*\s*:\s*([\s\S]+)$/);
    if (!match) continue;

    const entryTitle = stripRpSuffix(match[1].trim());
    const body = cleanMarkdownLinks(normalizeWhitespace(match[2]));

    records.push({
      key: normalizeName(entryTitle),
      title: entryTitle,
      section: currentSection,
      category: currentCategory,
      prerequisites: captureField(body, '_Prerequisites?_'),
      benefit: captureField(body, '_Benefit_'),
      special: captureField(body, '_Special_'),
      relativePath: path.relative(vaultRoot, filePath).replaceAll(path.sep, '/'),
    });
  }

  return records;
}

function stripRpSuffix(value) {
  return value.replace(/\s*\((?:\d+ RP|see special)\)$/i, '').trim();
}

function captureField(body, fieldLabel) {
  const pattern = new RegExp(`${fieldLabel}:\\s*(.+?)(?=\\s*_[A-Za-z ]+_:|$)`, 'i');
  const match = body.match(pattern);
  return match ? cleanMarkdownLinks(normalizeWhitespace(match[1])) : null;
}

function main() {
  const markdownFile = path.join(vaultRoot, 'advancedRaceGuide', 'raceBuilder', 'racialTraits.md');
  const markdownRecords = parseMarkdown(markdownFile);
  const legacyRecords = readJson(legacyTraitsFile);
  const markdownIndex = new Map();
  for (const record of markdownRecords) {
    if (!markdownIndex.has(record.key)) {
      markdownIndex.set(record.key, record);
    }
  }

  const mergedRecords = legacyRecords.map((record, index) => {
    const markdown = markdownIndex.get(normalizeName(record.Name));
    if (!markdown) return record;

    return {
      ...record,
      MarkdownPath: markdown.relativePath,
      MarkdownTitle: markdown.title,
      MarkdownSection: markdown.section,
      MarkdownCategory: markdown.category,
      MarkdownPrerequisites: markdown.prerequisites,
      MarkdownBenefit: markdown.benefit,
      MarkdownSpecial: markdown.special,
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
      rp: record.Rp ?? null,
    })),
  };

  writeJson(outputFile, mergedRecords);
  writeJson(sourceIndexFile, sourceIndex);

  console.log(`wrote ${mergedRecords.length} racial trait records to ${outputFile}`);
  console.log(`markdown-backed records: ${sourceIndex.markdownCoverage}`);
}

main();
