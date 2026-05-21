#!/usr/bin/env node
import path from 'path';
import { fileURLToPath } from 'url';
import { readJson } from './pf1-markdown-utils.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const racialTraitsFile = path.join(repoRoot, 'pathfinder1e', 'racialtrait.json');
const sourceIndexFile = path.join(repoRoot, 'sources', 'pf1-racial-trait-source-index.json');

function main() {
  const racialTraits = readJson(racialTraitsFile);
  const sourceIndex = readJson(sourceIndexFile);

  if (!Array.isArray(racialTraits) || racialTraits.length === 0) {
    throw new Error('racial trait flatfile is empty');
  }

  if (sourceIndex.totalRecords !== racialTraits.length) {
    throw new Error(`source index count mismatch: ${sourceIndex.totalRecords} vs ${racialTraits.length}`);
  }

  const keyTraits = ['Battle-Hardened', 'Breeze-Kissed', 'Cat\'s Luck', 'Hardy', 'Stability'];
  const missing = keyTraits.filter((name) => !racialTraits.some((record) => record.Name === name));

  console.log(`racial trait records: ${racialTraits.length}`);
  console.log(`markdown-backed records: ${sourceIndex.markdownCoverage}`);

  if (sourceIndex.markdownCoverage < 150) {
    throw new Error(`unexpectedly low markdown coverage: ${sourceIndex.markdownCoverage}`);
  }

  if (missing.length > 0) {
    throw new Error(`missing key racial traits: ${missing.join(', ')}`);
  }

  console.log('pf1 racial trait validation passed');
}

main();
