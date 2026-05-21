#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { firstHeading, readJson, writeJson } from './pf1-markdown-utils.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const vaultRoot = '/home/lancer1977/vaults/rpgs/RPG Vault/10_Rules/Pathfinder 1e';
const encounterSourcePath = 'monsters/encounterTables.md';
const encounterSourceTitle = 'Encounter Tables';

const familyConfigs = [
  {
    family: 'encounters',
    legacyFile: path.join(repoRoot, 'pathfinder1e', 'encounters.json'),
    outputFile: path.join(repoRoot, 'pathfinder1e', 'encounters.json'),
    sourceIndexFile: path.join(repoRoot, 'sources', 'pf1-encounter-source-index.json'),
  },
  {
    family: 'encountertitles',
    legacyFile: path.join(repoRoot, 'pathfinder1e', 'encountertitles.json'),
    outputFile: path.join(repoRoot, 'pathfinder1e', 'encountertitles.json'),
    sourceIndexFile: path.join(repoRoot, 'sources', 'pf1-encounter-title-source-index.json'),
  },
];

function enrichFamily(config) {
  const legacyRecords = readJson(config.legacyFile);
  const mergedRecords = legacyRecords.map((record) => ({
    ...record,
    MarkdownPath: encounterSourcePath,
    MarkdownTitle: encounterSourceTitle,
  }));

  const sourceIndex = {
    generatedAt: new Date().toISOString(),
    vaultRoot,
    legacyFile: path.relative(repoRoot, config.legacyFile).replaceAll(path.sep, '/'),
    markdownCoverage: mergedRecords.length,
    totalRecords: mergedRecords.length,
    records: mergedRecords.map((record) => ({
      name: record.Name ?? record.Encounter ?? record.Roll ?? null,
      markdownPath: record.MarkdownPath,
      tableId: record.TableID ?? record.Id ?? null,
      cr: record.CR ?? null,
    })),
  };

  writeJson(config.outputFile, mergedRecords);
  writeJson(config.sourceIndexFile, sourceIndex);

  console.log(`wrote ${mergedRecords.length} ${config.family} records to ${config.outputFile}`);
  console.log(`markdown-backed records: ${sourceIndex.markdownCoverage}`);
}

function main() {
  const encounterHeading = firstHeading(fs.readFileSync(path.join(vaultRoot, encounterSourcePath), 'utf8'));
  if (!encounterHeading) {
    throw new Error(`missing encounter source markdown: ${encounterSourcePath}`);
  }

  for (const config of familyConfigs) {
    enrichFamily(config);
  }
}

main();
