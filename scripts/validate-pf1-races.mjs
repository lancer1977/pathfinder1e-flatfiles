#!/usr/bin/env node
import path from 'path';
import { fileURLToPath } from 'url';
import { readJson } from './pf1-markdown-utils.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const racesFile = path.join(repoRoot, 'pathfinder1e', 'race.json');
const sourceIndexFile = path.join(repoRoot, 'sources', 'pf1-race-source-index.json');

function main() {
  const races = readJson(racesFile);
  const sourceIndex = readJson(sourceIndexFile);

  if (!Array.isArray(races) || races.length === 0) {
    throw new Error('race flatfile is empty');
  }

  if (sourceIndex.totalRecords !== races.length) {
    throw new Error(`source index count mismatch: ${sourceIndex.totalRecords} vs ${races.length}`);
  }

  const markdownRaces = ['Aasimar', 'Catfolk', 'Drow', 'Dwarf', 'Elf', 'Gnome', 'Human', 'Kobold', 'Tiefling', 'Vanara'];
  const missing = markdownRaces.filter((name) => !races.some((record) => record.Name === name));

  console.log(`race records: ${races.length}`);
  console.log(`markdown-backed records: ${sourceIndex.markdownCoverage}`);

  if (sourceIndex.markdownCoverage < 30) {
    throw new Error(`unexpectedly low markdown coverage: ${sourceIndex.markdownCoverage}`);
  }

  if (missing.length > 0) {
    throw new Error(`missing key races: ${missing.join(', ')}`);
  }

  console.log('pf1 race validation passed');
}

main();
