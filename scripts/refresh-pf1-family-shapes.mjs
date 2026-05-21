#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const flatfileRoot = path.join(repoRoot, 'pathfinder1e');
const outputFile = path.join(repoRoot, 'sources', 'pf1-family-shape-index.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function main() {
  const families = fs
    .readdirSync(flatfileRoot)
    .filter((name) => name.endsWith('.json') && name !== 'README.md')
    .sort((left, right) => left.localeCompare(right))
    .map((name) => {
      const filePath = path.join(flatfileRoot, name);
      const payload = readJson(filePath);
      if (!Array.isArray(payload)) {
        throw new Error(`family ${name} is not an array payload`);
      }

      return {
        family: path.basename(name, '.json'),
        file: path.relative(repoRoot, filePath).replaceAll(path.sep, '/'),
        shape: 'array',
        count: payload.length,
        fields: payload[0] ? Object.keys(payload[0]) : [],
      };
    });

  const manifest = {
    generatedAt: new Date().toISOString(),
    flatfileRoot: path.relative(repoRoot, flatfileRoot).replaceAll(path.sep, '/'),
    format: 'json-array',
    families,
  };

  writeJson(outputFile, manifest);
  console.log(`wrote ${families.length} family shapes to ${outputFile}`);
}

main();
