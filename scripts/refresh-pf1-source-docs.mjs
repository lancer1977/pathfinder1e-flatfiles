#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const vaultRoot = '/home/lancer1977/vaults/rpgs/RPG Vault/10_Rules/Pathfinder 1e';

function slugify(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function pageExists(relativePath) {
  return fs.existsSync(path.join(vaultRoot, relativePath));
}

function resolveClassAbilityMarkdown(record) {
  const normalizedClass = String(record.ClassName ?? '').trim();
  const classAlias = normalizedClass === 'Paldin' ? 'Paladin' : normalizedClass;
  const candidates = [];

  if (classAlias === 'Unchained Monk') {
    candidates.push('advanced/coreClasses/monk.md', 'classes/monk.md');
  }

  const slug = slugify(classAlias);
  candidates.push(
    `classes/${slug}.md`,
    `ultimateCombat/classArchetypes/${slug}.md`,
    `ultimateCombat/classes/${slug}.md`,
    `advanced/coreClasses/${slug}.md`,
    `ultimateMagic/spellcastingClassOptions/${slug}.md`,
  );

  const relativePath = candidates.find((candidate) => pageExists(candidate)) ?? 'classes.md';
  return {
    title: path.basename(relativePath, '.md').replace(/[-_]/g, ' '),
    relativePath,
  };
}

const familyConfigs = [
  {
    family: 'armor',
    legacyFile: path.join(repoRoot, 'pathfinder1e', 'armor.json'),
    outputFile: path.join(repoRoot, 'pathfinder1e', 'armor.json'),
    sourceIndexFile: path.join(repoRoot, 'sources', 'pf1-armor-source-index.json'),
    resolveMarkdown(record) {
      return {
        title: 'Armor',
        relativePath: 'ultimateEquipment/armsAndArmor/armor.md',
      };
    },
  },
  {
    family: 'armorFeatures',
    legacyFile: path.join(repoRoot, 'pathfinder1e', 'armorFeatures.json'),
    outputFile: path.join(repoRoot, 'pathfinder1e', 'armorFeatures.json'),
    sourceIndexFile: path.join(repoRoot, 'sources', 'pf1-armor-feature-source-index.json'),
    resolveMarkdown() {
      return {
        title: 'Armor Special Abilities',
        relativePath: 'ultimateEquipment/magicArmsAndArmor/armorSpecialAbilities.md',
      };
    },
  },
  {
    family: 'feats',
    legacyFile: path.join(repoRoot, 'pathfinder1e', 'feats.json'),
    outputFile: path.join(repoRoot, 'pathfinder1e', 'feats.json'),
    sourceIndexFile: path.join(repoRoot, 'sources', 'pf1-feat-source-index.json'),
    resolveMarkdown(record) {
      return {
        title: 'Feats',
        relativePath: 'feats.md',
      };
    },
  },
  {
    family: 'classAbility',
    legacyFile: path.join(repoRoot, 'pathfinder1e', 'classAbility.json'),
    outputFile: path.join(repoRoot, 'pathfinder1e', 'classAbility.json'),
    sourceIndexFile: path.join(repoRoot, 'sources', 'pf1-class-ability-source-index.json'),
    resolveMarkdown(record) {
      return resolveClassAbilityMarkdown(record);
    },
  },
  {
    family: 'classAbility.UnchainedMonk',
    legacyFile: path.join(repoRoot, 'pathfinder1e', 'classAbility.UnchainedMonk.json'),
    outputFile: path.join(repoRoot, 'pathfinder1e', 'classAbility.UnchainedMonk.json'),
    sourceIndexFile: path.join(repoRoot, 'sources', 'pf1-class-ability-unchained-monk-source-index.json'),
    resolveMarkdown() {
      return {
        title: 'Monk',
        relativePath: 'advanced/coreClasses/monk.md',
      };
    },
  },
  {
    family: 'ammo',
    legacyFile: path.join(repoRoot, 'pathfinder1e', 'ammo.json'),
    outputFile: path.join(repoRoot, 'pathfinder1e', 'ammo.json'),
    sourceIndexFile: path.join(repoRoot, 'sources', 'pf1-ammo-source-index.json'),
    resolveMarkdown() {
      return {
        title: 'Weapons',
        relativePath: 'ultimateEquipment/armsAndArmor/weapons.md',
      };
    },
  },
  {
    family: 'magicItems',
    legacyFile: path.join(repoRoot, 'pathfinder1e', 'magicItems.json'),
    outputFile: path.join(repoRoot, 'pathfinder1e', 'magicItems.json'),
    sourceIndexFile: path.join(repoRoot, 'sources', 'pf1-magic-item-source-index.json'),
    resolveMarkdown(record) {
      const slotPage = {
        Amulet: 'ultimateEquipment/wondrousItems/neck.md',
        Armor: 'ultimateEquipment/artifactsAndOthers/index.md',
        Arms: 'ultimateEquipment/wondrousItems/index.md',
        Belt: 'ultimateEquipment/wondrousItems/belts.md',
        Body: 'ultimateEquipment/wondrousItems/body.md',
        'Body And Helm (See Text)': 'ultimateEquipment/wondrousItems/body.md',
        Chest: 'ultimateEquipment/wondrousItems/chest.md',
        Cloak: 'ultimateEquipment/wondrousItems/shoulders.md',
        Earring: 'ultimateEquipment/wondrousItems/index.md',
        Eye: 'ultimateEquipment/wondrousItems/eyes.md',
        Eyes: 'ultimateEquipment/wondrousItems/eyes.md',
        Feet: 'ultimateEquipment/wondrousItems/feet.md',
        Hands: 'ultimateEquipment/wondrousItems/hands.md',
        Head: 'ultimateEquipment/wondrousItems/head.md',
        'Head (And None, See Below)': 'ultimateEquipment/wondrousItems/head.md',
        Headband: 'ultimateEquipment/wondrousItems/headbands.md',
        Neck: 'ultimateEquipment/wondrousItems/neck.md',
        'Neck (Brooch) Or Armor (Unfolded)': 'ultimateEquipment/wondrousItems/neck.md',
        'Neck (Does Not Take Up Slot)': 'ultimateEquipment/wondrousItems/neck.md',
        None: 'ultimateEquipment/wondrousItems/index.md',
        Ring: 'ultimateEquipment/ringsRodsStaves/rings.md',
        'See Text': 'ultimateEquipment/wondrousItems/index.md',
        Shield: 'ultimateEquipment/wondrousItems/index.md',
        Shoulders: 'ultimateEquipment/wondrousItems/shoulders.md',
        Special: 'ultimateEquipment/wondrousItems/index.md',
        Weapon: 'ultimateEquipment/wondrousItems/index.md',
        Wrist: 'ultimateEquipment/wondrousItems/wrists.md',
      };

      const categoryPage = {
        Armor: 'advanced/magicItems/armor.md',
        Artifact: 'ultimateEquipment/artifactsAndOthers/artifacts.md',
        Cursed: 'advanced/magicItems/cursedItems.md',
        Potion: 'magicItems.md',
        Ring: 'advanced/magicItems/rings.md',
        Rod: 'advanced/magicItems/rods.md',
        Staff: 'advanced/magicItems/staves.md',
        Weapon: 'advanced/magicItems/weapons.md',
        'Wondrous Item': slotPage[record.ItemType] ?? 'ultimateEquipment/wondrousItems/index.md',
      };

      const relativePath = categoryPage[record.ItemCategory] ?? 'magicItems.md';
      const titleMap = {
        Armor: 'Armor',
        Artifact: 'Artifacts',
        Cursed: 'Cursed Items',
        Potion: 'Magic Items',
        Ring: 'Rings',
        Rod: 'Rods',
        Staff: 'Staves',
        Weapon: 'Weapons',
        'Wondrous Item': 'Wondrous Items',
      };

      return {
        title: titleMap[record.ItemCategory] ?? 'Magic Items',
        relativePath,
      };
    },
  },
  {
    family: 'specificArmor',
    legacyFile: path.join(repoRoot, 'pathfinder1e', 'specificArmor.json'),
    outputFile: path.join(repoRoot, 'pathfinder1e', 'specificArmor.json'),
    sourceIndexFile: path.join(repoRoot, 'sources', 'pf1-specific-armor-source-index.json'),
    resolveMarkdown() {
      return {
        title: 'Armor Special Abilities',
        relativePath: 'ultimateEquipment/magicArmsAndArmor/armorSpecialAbilities.md',
      };
    },
  },
  {
    family: 'specificWeapon',
    legacyFile: path.join(repoRoot, 'pathfinder1e', 'specificWeapon.json'),
    outputFile: path.join(repoRoot, 'pathfinder1e', 'specificWeapon.json'),
    sourceIndexFile: path.join(repoRoot, 'sources', 'pf1-specific-weapon-source-index.json'),
    resolveMarkdown() {
      return {
        title: 'Weapon Special Abilities',
        relativePath: 'ultimateEquipment/magicArmsAndArmor/weaponSpecialAbilities.md',
      };
    },
  },
  {
    family: 'mundane',
    legacyFile: path.join(repoRoot, 'pathfinder1e', 'mundane.json'),
    outputFile: path.join(repoRoot, 'pathfinder1e', 'mundane.json'),
    sourceIndexFile: path.join(repoRoot, 'sources', 'pf1-mundane-source-index.json'),
    resolveMarkdown(record) {
      const subtype = String(record.Subtype ?? '');
      const pageBySubtype = {
        Bag: 'ultimateEquipment/gear/adventuringGear.md',
        Barrel: 'ultimateEquipment/gear/adventuringGear.md',
        Beverage: 'ultimateEquipment/gear/foodAndDrink.md',
        Bodywear: 'ultimateEquipment/gear/clothing.md',
        Bottle: 'ultimateEquipment/gear/adventuringGear.md',
        Box: 'ultimateEquipment/gear/adventuringGear.md',
        Card: 'ultimateEquipment/gear/entertainmentAndTradeGoods.md',
        Chest: 'ultimateEquipment/gear/adventuringGear.md',
        Comfort: 'ultimateEquipment/gear/adventuringGear.md',
        Cup: 'ultimateEquipment/gear/adventuringGear.md',
        Face: 'ultimateEquipment/gear/clothing.md',
        Flask: 'ultimateEquipment/gear/adventuringGear.md',
        Foci: 'ultimateEquipment/gear/toolsAndSkillKits.md',
        Food: 'ultimateEquipment/gear/foodAndDrink.md',
        Footwear: 'ultimateEquipment/gear/clothing.md',
        Game: 'ultimateEquipment/gear/entertainmentAndTradeGoods.md',
        Head: 'ultimateEquipment/gear/clothing.md',
        Hunting: 'ultimateEquipment/gear/adventuringGear.md',
        Illumination: 'ultimateEquipment/gear/adventuringGear.md',
        Jewelry: 'ultimateEquipment/gear/clothing.md',
        Neck: 'ultimateEquipment/gear/clothing.md',
        'Outdoors Gear': 'ultimateEquipment/gear/adventuringGear.md',
        Outfit: 'ultimateEquipment/gear/clothing.md',
        Perfume: 'ultimateEquipment/gear/clothing.md',
        Pot: 'ultimateEquipment/gear/adventuringGear.md',
        Pouch: 'ultimateEquipment/gear/adventuringGear.md',
        Religious: 'ultimateEquipment/gear/toolsAndSkillKits.md',
        Ring: 'ultimateEquipment/gear/clothing.md',
        Shelter: 'ultimateEquipment/gear/adventuringGear.md',
        Sponge: 'ultimateEquipment/gear/adventuringGear.md',
        Tatoo: 'ultimateEquipment/gear/clothing.md',
        Toy: 'ultimateEquipment/gear/entertainmentAndTradeGoods.md',
        Watch: 'ultimateEquipment/gear/clothing.md',
      };

      const relativePath = pageBySubtype[subtype] ?? 'equipment.md';
      const titleByPath = {
        'equipment.md': 'Equipment',
        'ultimateEquipment/gear/adventuringGear.md': 'Adventuring Gear',
        'ultimateEquipment/gear/clothing.md': 'Clothing',
        'ultimateEquipment/gear/entertainmentAndTradeGoods.md': 'Entertainment and Trade Goods',
        'ultimateEquipment/gear/foodAndDrink.md': 'Food and Drink',
        'ultimateEquipment/gear/toolsAndSkillKits.md': 'Tools and Skill Kits',
      };

      return {
        title: titleByPath[relativePath] ?? 'Equipment',
        relativePath,
      };
    },
  },
  {
    family: 'weaponfeature',
    legacyFile: path.join(repoRoot, 'pathfinder1e', 'weaponfeature.json'),
    outputFile: path.join(repoRoot, 'pathfinder1e', 'weaponfeature.json'),
    sourceIndexFile: path.join(repoRoot, 'sources', 'pf1-weapon-feature-source-index.json'),
    resolveMarkdown() {
      return {
        title: 'Weapon Special Abilities',
        relativePath: 'ultimateEquipment/magicArmsAndArmor/weaponSpecialAbilities.md',
      };
    },
  },
  {
    family: 'weapon',
    legacyFile: path.join(repoRoot, 'pathfinder1e', 'weapon.json'),
    outputFile: path.join(repoRoot, 'pathfinder1e', 'weapon.json'),
    sourceIndexFile: path.join(repoRoot, 'sources', 'pf1-weapon-source-index.json'),
    resolveMarkdown(record) {
      return {
        title: 'Weapons',
        relativePath: 'ultimateEquipment/armsAndArmor/weapons.md',
      };
    },
  },
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function enrichFamily(config) {
  const legacyRecords = readJson(config.legacyFile);
  const mergedRecords = legacyRecords.map((record) => {
    const markdown = config.resolveMarkdown(record);
    return {
      ...record,
      MarkdownPath: markdown.relativePath,
      MarkdownTitle: markdown.title,
    };
  });

  const sourceIndex = {
    generatedAt: new Date().toISOString(),
    vaultRoot,
    legacyFile: path.relative(repoRoot, config.legacyFile).replaceAll(path.sep, '/'),
    markdownCoverage: mergedRecords.length,
    totalRecords: mergedRecords.length,
    records: mergedRecords.map((record) => ({
      name: record.Name,
      markdownPath: record.MarkdownPath,
      category: record.Category ?? record.ItemCategory ?? record.Subtype ?? record.Type ?? null,
      source: record.Source ?? null,
    })),
  };

  writeJson(config.outputFile, mergedRecords);
  writeJson(config.sourceIndexFile, sourceIndex);

  console.log(`wrote ${mergedRecords.length} ${config.family} records to ${config.outputFile}`);
  console.log(`markdown-backed records: ${sourceIndex.markdownCoverage}`);
}

function main() {
  for (const config of familyConfigs) {
    enrichFamily(config);
  }
}

main();
