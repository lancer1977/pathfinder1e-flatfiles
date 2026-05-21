#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const dataSeedsRoot = '/home/lancer1977/code/DataSeeds/pathfinder1e';
const outputRoot = path.join(repoRoot, 'pathfinder1e');
const sourceIndexFile = path.join(repoRoot, 'sources', 'pf1-dataseeds-payload-index.json');

const enrichedFamilies = new Map([
  ['characterClass', 'refresh:classes'],
  ['skills', 'refresh:skills'],
  ['spells', 'refresh:spells'],
]);

function readJsonPayload(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8').trim());
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function getPayloadShape(value) {
  if (Array.isArray(value)) {
    return {
      kind: 'array',
      count: value.length,
    };
  }

  if (value && typeof value === 'object') {
    return {
      kind: 'object',
      count: Object.keys(value).length,
    };
  }

  return {
    kind: typeof value,
    count: null,
  };
}

function main() {
  const payloadFiles = fs
    .readdirSync(dataSeedsRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  const records = [];
  let copiedCount = 0;
  let preservedManagedCount = 0;

  for (const fileName of payloadFiles) {
    const family = fileName.slice(0, -'.js'.length);
    const sourcePath = path.join(dataSeedsRoot, fileName);
    const outputFileName = `${family}.json`;
    const outputPath = path.join(outputRoot, outputFileName);
    const payload = readJsonPayload(sourcePath);
    const shape = getPayloadShape(payload);
    const managedBy = enrichedFamilies.get(family) ?? null;
    const shouldPreserveManagedOutput = managedBy && fs.existsSync(outputPath);

    if (shouldPreserveManagedOutput) {
      preservedManagedCount += 1;
    } else {
      writeJson(outputPath, payload);
      copiedCount += 1;
    }

    records.push({
      family,
      sourceFile: path.relative(repoRoot, sourcePath).replaceAll(path.sep, '/'),
      outputFile: path.relative(repoRoot, outputPath).replaceAll(path.sep, '/'),
      shape: shape.kind,
      count: shape.count,
      managedBy,
      copiedFromDataSeeds: !shouldPreserveManagedOutput,
    });
  }

  writeJson(sourceIndexFile, {
    generatedAt: new Date().toISOString(),
    dataSeedsRoot,
    outputRoot: path.relative(repoRoot, outputRoot).replaceAll(path.sep, '/'),
    totalPayloads: records.length,
    copiedPayloads: copiedCount,
    preservedManagedPayloads: preservedManagedCount,
    enrichedFamilies: Object.fromEntries(enrichedFamilies),
    records,
  });

  console.log(`indexed ${records.length} DataSeeds payloads`);
  console.log(`copied ${copiedCount} payloads to ${outputRoot}`);
  console.log(`preserved ${preservedManagedCount} managed payloads`);
}

main();
