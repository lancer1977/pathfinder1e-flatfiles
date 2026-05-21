#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const flatfileRoot = path.join(repoRoot, 'pathfinder1e');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function slug(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'record';
}

function getScalar(record, key) {
  const value = record?.[key];
  return value === null || value === undefined || value === '' ? null : String(value);
}

function assignIds(records, family) {
  const totalByName = new Map();
  for (const record of records) {
    const name = getScalar(record, 'Name');
    if (!name) continue;
    totalByName.set(name.toLowerCase(), (totalByName.get(name.toLowerCase()) ?? 0) + 1);
  }

  const seenByName = new Map();
  let changed = 0;
  for (const record of records) {
    const name = getScalar(record, 'Name');
    if (!name || getScalar(record, 'Id')) {
      if (record.FlatfileId !== undefined) {
        delete record.FlatfileId;
        changed += 1;
      }

      continue;
    }

    const normalizedName = name.toLowerCase();
    const occurrence = (seenByName.get(normalizedName) ?? 0) + 1;
    seenByName.set(normalizedName, occurrence);

    if ((totalByName.get(normalizedName) ?? 0) === 1 || occurrence === 1) {
      if (record.FlatfileId !== undefined) {
        delete record.FlatfileId;
        changed += 1;
      }

      continue;
    }

    const flatfileId = `${family}:${slug(name)}:${occurrence}`;
    if (record.FlatfileId !== flatfileId) {
      record.FlatfileId = flatfileId;
      changed += 1;
    }
  }

  return changed;
}

function main() {
  const fileNames = fs
    .readdirSync(flatfileRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  let changedFiles = 0;
  let changedRecords = 0;
  for (const fileName of fileNames) {
    const filePath = path.join(flatfileRoot, fileName);
    const family = fileName.slice(0, -'.json'.length);
    const payload = readJson(filePath);
    if (!Array.isArray(payload)) {
      continue;
    }

    const changed = assignIds(payload, family);
    if (changed > 0) {
      writeJson(filePath, payload);
      changedFiles += 1;
      changedRecords += changed;
    }
  }

  console.log(`assigned flatfile duplicate ids: ${changedRecords} records in ${changedFiles} files`);
}

main();
