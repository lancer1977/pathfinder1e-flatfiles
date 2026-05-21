#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const flatfileRoot = path.join(repoRoot, 'pathfinder1e');
const sourceIndexFile = path.join(repoRoot, 'sources', 'pf1-dataseeds-payload-index.json');
const outputRoot = path.join(repoRoot, 'exports', 'pf1-family-snapshots');

const familyGroups = {
  adventure: new Set(['encounters', 'encountertitles']),
  ancestry: new Set(['race', 'racialtrait', 'traits']),
  bestiary: new Set(['monster']),
  classes: new Set(['characterClass', 'archtype', 'classAbility', 'classAbility.UnchainedMonk', 'deed', 'powers', 'specialization']),
  equipment: new Set(['ammo', 'armor', 'armorFeatures', 'magicItems', 'mundane', 'specificArmor', 'specificWeapon', 'weapon', 'weaponfeature']),
  magic: new Set(['spells', 'words']),
  rules: new Set(['conditions', 'feats', 'language', 'skills']),
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function resolveGroup(family) {
  for (const [group, families] of Object.entries(familyGroups)) {
    if (families.has(family)) return group;
  }

  return 'misc';
}

function main() {
  const sourceIndex = readJson(sourceIndexFile);
  const manifest = {
    generatedAt: new Date().toISOString(),
    outputRoot: path.relative(repoRoot, outputRoot).replaceAll(path.sep, '/'),
    groups: [],
  };

  const recordsByGroup = new Map();
  for (const record of sourceIndex.records ?? []) {
    const group = resolveGroup(record.family);
    if (!recordsByGroup.has(group)) {
      recordsByGroup.set(group, []);
    }

    const flatfilePath = path.join(flatfileRoot, `${record.family}.json`);
    if (!fs.existsSync(flatfilePath)) {
      continue;
    }

    const payload = readJson(flatfilePath);
    const groupedPath = path.join(outputRoot, group, `${record.family}.json`);
    writeJson(groupedPath, payload);
    recordsByGroup.get(group).push({
      family: record.family,
      sourceFile: record.sourceFile,
      outputFile: record.outputFile,
      source: path.relative(repoRoot, flatfilePath).replaceAll(path.sep, '/'),
      output: path.relative(repoRoot, groupedPath).replaceAll(path.sep, '/'),
      shape: record.shape,
      count: Array.isArray(payload) ? payload.length : null,
      managedBy: record.managedBy ?? null,
      copiedFromDataSeeds: record.copiedFromDataSeeds ?? null,
    });
  }

  for (const [group, families] of recordsByGroup.entries()) {
    manifest.groups.push({
      group,
      families: families.length,
      records: families,
    });
  }

  writeJson(path.join(outputRoot, 'manifest.json'), manifest);
  console.log(`exported ${manifest.groups.length} PF1 family groups to ${outputRoot}`);
}

main();
