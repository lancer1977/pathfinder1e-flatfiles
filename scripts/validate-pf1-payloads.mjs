#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const dataSeedsRoot = '/home/lancer1977/code/DataSeeds/pathfinder1e';
const outputRoot = path.join(repoRoot, 'pathfinder1e');
const sourceIndexFile = path.join(repoRoot, 'sources', 'pf1-dataseeds-payload-index.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readJsonPayload(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8').trim());
}

function getCount(value) {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === 'object') return Object.keys(value).length;
  return null;
}

function main() {
  const sourceIndex = readJson(sourceIndexFile);
  const sourceFiles = fs
    .readdirSync(dataSeedsRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  const indexedFamilies = new Set(sourceIndex.records.map((record) => record.family));
  const missingIndexRecords = [];
  const missingOutputs = [];
  const countMismatches = [];

  for (const fileName of sourceFiles) {
    const family = fileName.slice(0, -'.js'.length);
    const sourcePath = path.join(dataSeedsRoot, fileName);
    const outputPath = path.join(outputRoot, `${family}.json`);

    if (!indexedFamilies.has(family)) {
      missingIndexRecords.push(family);
    }

    if (!fs.existsSync(outputPath)) {
      missingOutputs.push(family);
      continue;
    }

    const sourcePayload = readJsonPayload(sourcePath);
    const outputPayload = readJson(outputPath);
    const sourceCount = getCount(sourcePayload);
    const outputCount = getCount(outputPayload);

    if (sourceCount !== outputCount) {
      countMismatches.push(`${family}: source ${sourceCount} vs flatfile ${outputCount}`);
    }
  }

  if (sourceIndex.totalPayloads !== sourceFiles.length) {
    throw new Error(`source index payload count mismatch: ${sourceIndex.totalPayloads} vs ${sourceFiles.length}`);
  }

  if (missingIndexRecords.length > 0) {
    throw new Error(`source index missing families: ${missingIndexRecords.join(', ')}`);
  }

  if (missingOutputs.length > 0) {
    throw new Error(`flatfile outputs missing families: ${missingOutputs.join(', ')}`);
  }

  if (countMismatches.length > 0) {
    throw new Error(`flatfile count mismatches: ${countMismatches.join('; ')}`);
  }

  console.log(`DataSeeds payloads: ${sourceFiles.length}`);
  console.log('pf1 payload mirror validation passed');
}

main();
