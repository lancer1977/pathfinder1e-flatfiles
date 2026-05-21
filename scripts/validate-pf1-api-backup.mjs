#!/usr/bin/env node
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const dataSeedsRoot = '/home/lancer1977/code/DataSeeds/pathfinder1e';
const backupRoot = path.join(repoRoot, 'backups', 'pathfinder1e-api');
const manifestFile = path.join(backupRoot, 'manifest.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readJsonPayload(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8').trim());
}

function hashJson(value) {
  return crypto.createHash('sha256').update(`${JSON.stringify(value)}\n`).digest('hex');
}

function getCount(value) {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === 'object') return Object.keys(value).length;
  return null;
}

function main() {
  const manifest = readJson(manifestFile);
  const sourceFiles = fs
    .readdirSync(dataSeedsRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  if (manifest.totalPayloads !== sourceFiles.length) {
    throw new Error(`backup manifest count mismatch: ${manifest.totalPayloads} vs ${sourceFiles.length}`);
  }

  const manifestByFamily = new Map(manifest.payloads.map((payload) => [payload.family, payload]));
  const failures = [];

  for (const fileName of sourceFiles) {
    const family = fileName.slice(0, -'.js'.length);
    const sourcePath = path.join(dataSeedsRoot, fileName);
    const manifestRecord = manifestByFamily.get(family);

    if (!manifestRecord) {
      failures.push(`${family}: missing from manifest`);
      continue;
    }

    if (!manifestRecord.group) {
      failures.push(`${family}: missing manifest group`);
      continue;
    }

    if (!manifestRecord.backupFile) {
      failures.push(`${family}: missing manifest backup file`);
      continue;
    }

    const backupPath = path.resolve(repoRoot, manifestRecord.backupFile);

    if (!backupPath.startsWith(backupRoot + path.sep)) {
      failures.push(`${family}: backup file escapes backup root`);
      continue;
    }

    if (!fs.existsSync(backupPath)) {
      failures.push(`${family}: missing backup file`);
      continue;
    }

    const sourcePayload = readJsonPayload(sourcePath);
    const backupPayload = readJson(backupPath);
    const sourceHash = hashJson(sourcePayload);
    const backupHash = hashJson(backupPayload);

    if (sourceHash !== backupHash) {
      failures.push(`${family}: backup hash ${backupHash} does not match source hash ${sourceHash}`);
    }

    if (manifestRecord.sha256 !== sourceHash) {
      failures.push(`${family}: manifest hash ${manifestRecord.sha256} does not match source hash ${sourceHash}`);
    }

    if (manifestRecord.count !== getCount(sourcePayload)) {
      failures.push(`${family}: manifest count ${manifestRecord.count} does not match source count ${getCount(sourcePayload)}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`PF1 API backup validation failed: ${failures.join('; ')}`);
  }

  console.log(`PF1 API backup payloads: ${sourceFiles.length}`);
  console.log('pf1 API backup validation passed');
}

main();
