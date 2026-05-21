#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const sourceIndexFile = path.join(repoRoot, 'sources', 'pf1-srd-markdown-source-index.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const sourceIndex = readJson(sourceIndexFile);
  const failures = [];

  if (!sourceIndex.upstreamCommit || !/^[a-f0-9]{40}$/.test(sourceIndex.upstreamCommit)) {
    failures.push('source index does not record a full upstream commit hash');
  }

  for (const family of sourceIndex.families ?? []) {
    const records = readJson(path.join(repoRoot, family.flatfile));
    const matchedRecords = records.filter((record) => record.SrdMarkdownPath).length;

    if (matchedRecords !== family.matchedRecords) {
      failures.push(`${family.family}: source index matched ${family.matchedRecords}, flatfile has ${matchedRecords}`);
    }

    if (family.family === 'spells' && matchedRecords < 500) {
      failures.push('spells: expected at least 500 SRD markdown matches');
    }

    if (family.family === 'monster' && matchedRecords < 500) {
      failures.push('monster: expected at least 500 SRD markdown matches');
    }
  }

  if (failures.length > 0) {
    throw new Error(`PF1 SRD markdown validation failed: ${failures.join('; ')}`);
  }

  console.log(`upstream commit: ${sourceIndex.upstreamCommit}`);
  for (const family of sourceIndex.families) {
    console.log(`${family.family}: ${family.matchedRecords}/${family.totalRecords} matched`);
  }
  console.log('pf1 SRD markdown validation passed');
}

main();
