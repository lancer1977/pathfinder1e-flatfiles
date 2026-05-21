#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const outputFile = path.join(repoRoot, 'sources', 'pf1-family-shape-index.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  if (!fs.existsSync(outputFile)) {
    throw new Error(`missing family shape manifest: ${outputFile}`);
  }

  const manifest = readJson(outputFile);
  if (manifest.format !== 'json-array') {
    throw new Error(`unexpected family shape format: ${manifest.format}`);
  }

  if (!Array.isArray(manifest.families) || manifest.families.length === 0) {
    throw new Error('family shape manifest is empty');
  }

  for (const family of manifest.families) {
    if (family.shape !== 'array') {
      throw new Error(`family ${family.family} is not an array shape`);
    }

    const filePath = path.join(repoRoot, family.file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`missing family file: ${family.file}`);
    }

    const payload = readJson(filePath);
    if (!Array.isArray(payload)) {
      throw new Error(`family ${family.family} is not an array`);
    }

    if (payload.length !== family.count) {
      throw new Error(`family ${family.family} count mismatch: ${family.count} vs ${payload.length}`);
    }
  }

  console.log(`validated ${manifest.families.length} PF1 family shapes`);
}

main();
