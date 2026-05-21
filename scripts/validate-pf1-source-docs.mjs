#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

const familyConfigs = [
  {
    family: 'armor',
    file: path.join(repoRoot, 'pathfinder1e', 'armor.json'),
  },
  {
    family: 'armorFeatures',
    file: path.join(repoRoot, 'pathfinder1e', 'armorFeatures.json'),
  },
  {
    family: 'ammo',
    file: path.join(repoRoot, 'pathfinder1e', 'ammo.json'),
  },
  {
    family: 'classAbility',
    file: path.join(repoRoot, 'pathfinder1e', 'classAbility.json'),
  },
  {
    family: 'classAbility.UnchainedMonk',
    file: path.join(repoRoot, 'pathfinder1e', 'classAbility.UnchainedMonk.json'),
  },
  {
    family: 'feats',
    file: path.join(repoRoot, 'pathfinder1e', 'feats.json'),
  },
  {
    family: 'magicItems',
    file: path.join(repoRoot, 'pathfinder1e', 'magicItems.json'),
  },
  {
    family: 'monster',
    file: path.join(repoRoot, 'pathfinder1e', 'monster.json'),
    minimumCoverage: 100,
  },
  {
    family: 'encounters',
    file: path.join(repoRoot, 'pathfinder1e', 'encounters.json'),
  },
  {
    family: 'encountertitles',
    file: path.join(repoRoot, 'pathfinder1e', 'encountertitles.json'),
  },
  {
    family: 'mundane',
    file: path.join(repoRoot, 'pathfinder1e', 'mundane.json'),
  },
  {
    family: 'specificArmor',
    file: path.join(repoRoot, 'pathfinder1e', 'specificArmor.json'),
  },
  {
    family: 'specificWeapon',
    file: path.join(repoRoot, 'pathfinder1e', 'specificWeapon.json'),
  },
  {
    family: 'weapon',
    file: path.join(repoRoot, 'pathfinder1e', 'weapon.json'),
  },
  {
    family: 'weaponfeature',
    file: path.join(repoRoot, 'pathfinder1e', 'weaponfeature.json'),
  },
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  let checkedFamilies = 0;

  for (const config of familyConfigs) {
    if (!fs.existsSync(config.file)) {
      throw new Error(`missing source family file: ${config.file}`);
    }

    const records = readJson(config.file);
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error(`family ${config.family} is empty`);
    }

    const markdownCoverage = records.filter((record) => record.MarkdownPath).length;
    if (typeof config.minimumCoverage === 'number') {
      if (markdownCoverage < config.minimumCoverage) {
        throw new Error(
          `family ${config.family} has insufficient markdown coverage: ${markdownCoverage}/${records.length}`,
        );
      }
    } else if (markdownCoverage !== records.length) {
      throw new Error(
        `family ${config.family} has incomplete markdown coverage: ${markdownCoverage}/${records.length}`,
      );
    }

    const matchedRecords = typeof config.minimumCoverage === 'number'
      ? records.filter((record) => record.MarkdownPath)
      : records;

    for (const record of matchedRecords) {
      const relativePath = record.MarkdownPath;
      const absolutePath = path.join('/home/lancer1977/vaults/rpgs/RPG Vault/10_Rules/Pathfinder 1e', relativePath);
      if (!fs.existsSync(absolutePath)) {
        throw new Error(`family ${config.family} points at missing markdown file: ${relativePath}`);
      }
    }

    console.log(`validated ${config.family}: ${records.length} records, ${markdownCoverage} markdown-backed`);
    checkedFamilies += 1;
  }

  console.log(`validated ${checkedFamilies} PF1 source-doc families`);
}

main();
