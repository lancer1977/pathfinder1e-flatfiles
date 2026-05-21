#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const spellsFile = path.join(repoRoot, 'pathfinder1e', 'spells.json');
const sourceIndexFile = path.join(repoRoot, 'sources', 'pf1-spell-source-index.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const spells = readJson(spellsFile);
  const sourceIndex = readJson(sourceIndexFile);

  if (!Array.isArray(spells) || spells.length === 0) {
    throw new Error('spell flatfile is empty');
  }

  if (sourceIndex.totalRecords !== spells.length) {
    throw new Error(`source index count mismatch: ${sourceIndex.totalRecords} vs ${spells.length}`);
  }

  const keySpells = ['Acid Arrow', 'Fireball', 'Magic Missile', 'Cure Light Wounds', 'Summon Monster I'];
  const missing = keySpells.filter((name) => !spells.some((record) => record.Name === name));

  console.log(`spell records: ${spells.length}`);
  console.log(`markdown-backed records: ${sourceIndex.markdownCoverage}`);

  if (sourceIndex.markdownCoverage < 500) {
    throw new Error(`unexpectedly low markdown coverage: ${sourceIndex.markdownCoverage}`);
  }

  if (missing.length > 0) {
    throw new Error(`missing key spells: ${missing.join(', ')}`);
  }

  console.log('pf1 spell validation passed');
}

main();
