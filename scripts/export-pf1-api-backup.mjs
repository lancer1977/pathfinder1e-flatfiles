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

const payloadGroups = new Map([
  ['ammo', 'equipment'],
  ['armor', 'equipment'],
  ['armorFeatures', 'equipment'],
  ['magicItems', 'equipment'],
  ['mundane', 'equipment'],
  ['specificArmor', 'equipment'],
  ['specificWeapon', 'equipment'],
  ['weapon', 'equipment'],
  ['weaponfeature', 'equipment'],
  ['archtype', 'classes'],
  ['characterClass', 'classes'],
  ['classAbility', 'classes'],
  ['classAbility.UnchainedMonk', 'classes'],
  ['deed', 'classes'],
  ['powers', 'classes'],
  ['specialization', 'classes'],
  ['race', 'ancestry'],
  ['racialtrait', 'ancestry'],
  ['traits', 'ancestry'],
  ['conditions', 'rules'],
  ['feats', 'rules'],
  ['language', 'rules'],
  ['skills', 'rules'],
  ['spells', 'magic'],
  ['words', 'magic'],
  ['encounters', 'adventure'],
  ['encountertitles', 'adventure'],
  ['monster', 'bestiary'],
]);

function readJsonPayload(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8').trim());
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function hashJson(value) {
  return crypto.createHash('sha256').update(`${JSON.stringify(value)}\n`).digest('hex');
}

function getShape(value) {
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

function getPayloadGroup(family) {
  const group = payloadGroups.get(family);
  if (!group) {
    throw new Error(`No backup group configured for payload family: ${family}`);
  }

  return group;
}

function resetGeneratedBackupFiles() {
  if (!fs.existsSync(backupRoot)) return;

  for (const entry of fs.readdirSync(backupRoot, { withFileTypes: true })) {
    const fullPath = path.join(backupRoot, entry.name);

    if (entry.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else if (entry.isFile() && entry.name !== 'README.md') {
      fs.rmSync(fullPath);
    }
  }
}

function main() {
  const payloadFiles = fs
    .readdirSync(dataSeedsRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  const payloads = [];
  resetGeneratedBackupFiles();

  for (const fileName of payloadFiles) {
    const family = fileName.slice(0, -'.js'.length);
    const group = getPayloadGroup(family);
    const sourcePath = path.join(dataSeedsRoot, fileName);
    const outputPath = path.join(backupRoot, group, `${family}.json`);
    const payload = readJsonPayload(sourcePath);
    const shape = getShape(payload);

    writeJson(outputPath, payload);

    payloads.push({
      family,
      group,
      sourceFile: path.relative(repoRoot, sourcePath).replaceAll(path.sep, '/'),
      backupFile: path.relative(repoRoot, outputPath).replaceAll(path.sep, '/'),
      shape: shape.kind,
      count: shape.count,
      sha256: hashJson(payload),
    });
  }

  writeJson(manifestFile, {
    schemaVersion: 1,
    description: 'Raw Pathfinder 1e API/DataSeeds payload backup. This backup is not markdown-enriched.',
    dataSeedsRoot,
    backupRoot: path.relative(repoRoot, backupRoot).replaceAll(path.sep, '/'),
    groups: Object.fromEntries(
      [...new Set([...payloadGroups.values()])]
        .sort((left, right) => left.localeCompare(right))
        .map((group) => [
          group,
          [...payloadGroups.entries()]
            .filter(([, mappedGroup]) => mappedGroup === group)
            .map(([family]) => family)
            .sort((left, right) => left.localeCompare(right)),
        ]),
    ),
    totalPayloads: payloads.length,
    payloads,
  });

  console.log(`exported ${payloads.length} Pathfinder 1e API backup payloads to ${backupRoot}`);
}

main();
