#!/usr/bin/env node
import path from 'path';
import { fileURLToPath } from 'url';
import { readJson } from './pf1-markdown-utils.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const traitsFile = path.join(repoRoot, 'pathfinder1e', 'traits.json');
const sourceIndexFile = path.join(repoRoot, 'sources', 'pf1-trait-source-index.json');

function main() {
  const traits = readJson(traitsFile);
  const sourceIndex = readJson(sourceIndexFile);

  if (!Array.isArray(traits) || traits.length === 0) {
    throw new Error('trait flatfile is empty');
  }

  if (sourceIndex.totalRecords !== traits.length) {
    throw new Error(`source index count mismatch: ${sourceIndex.totalRecords} vs ${traits.length}`);
  }

  const keyTraits = ['Adopted', 'Animal Friend', 'Dirty Fighter', 'Fate\'s Favored', 'Reactionary'];
  const missing = keyTraits.filter((name) => !traits.some((record) => record.Name === name));

  console.log(`trait records: ${traits.length}`);
  console.log(`markdown-backed records: ${sourceIndex.markdownCoverage}`);

  if (sourceIndex.markdownCoverage < 240) {
    throw new Error(`unexpectedly low markdown coverage: ${sourceIndex.markdownCoverage}`);
  }

  if (missing.length > 0) {
    throw new Error(`missing key traits: ${missing.join(', ')}`);
  }

  console.log('pf1 trait validation passed');
}

main();
