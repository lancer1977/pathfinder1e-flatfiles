#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  cleanMarkdownLinks,
  firstHeading,
  listMarkdownFiles,
  normalizeName,
  normalizeWhitespace,
  paragraphBlocks,
  readJson,
  writeJson,
} from './pf1-markdown-utils.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const vaultRoot = '/home/lancer1977/vaults/rpgs/RPG Vault/10_Rules/Pathfinder 1e';
const legacyRacesFile = path.join(repoRoot, 'pathfinder1e', 'race.json');
const outputFile = path.join(repoRoot, 'pathfinder1e', 'race.json');
const sourceIndexFile = path.join(repoRoot, 'sources', 'pf1-race-source-index.json');

const raceAliases = new Map([
  ['aasimars', 'Aasimar'],
  ['catfolk', 'Catfolk'],
  ['changelings', 'Changeling'],
  ['dhampirs', 'Dhampir'],
  ['drow', 'Drow'],
  ['duergar', 'Duergar'],
  ['dwarves', 'Dwarf'],
  ['elves', 'Elf'],
  ['fetchlings', 'Fetchling'],
  ['gillmen', 'Gillman'],
  ['gnomes', 'Gnome'],
  ['goblins', 'Goblin'],
  ['gripplis', 'Grippli'],
  ['halfElves', 'Half-Elf'],
  ['halfOrcs', 'Half-Orc'],
  ['halflings', 'Halfling'],
  ['hobgoblins', 'Hobgoblin'],
  ['humans', 'Human'],
  ['ifrits', 'Ifrit'],
  ['kitsune', 'Kitsune'],
  ['kobolds', 'Kobold'],
  ['merfolk', 'Merfolk'],
  ['nagaji', 'Nagaji'],
  ['orcs', 'Orc'],
  ['oreads', 'Oread'],
  ['ratfolk', 'Ratfolk'],
  ['samsarans', 'Samsaran'],
  ['strix', 'Strix'],
  ['sulis', 'Suli'],
  ['svirfneblins', 'Svirfneblin'],
  ['sylphs', 'Sylph'],
  ['tengus', 'Tengu'],
  ['tieflings', 'Tiefling'],
  ['undines', 'Undine'],
  ['vanaras', 'Vanara'],
  ['vishkanyas', 'Vishkanya'],
  ['wayangs', 'Wayang'],
]);

function parseMarkdown(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const title = firstHeading(text);
  if (!title) return null;

  const blocks = paragraphBlocks(text);
  const introEndIndex = blocks.findIndex((block) => block.startsWith('**Physical Description** :'));
  const introBlocks = introEndIndex >= 0 ? blocks.slice(1, introEndIndex) : blocks.slice(1);
  const intro = introBlocks.length > 0 ? cleanMarkdownLinks(introBlocks.join(' ')) : null;

  const sectionLabels = [
    'Physical Description',
    'Society',
    'Relations',
    'Alignment and Religion',
    'Adventurers',
    'Males Names',
    'Female Names',
    'Alternate Racial Traits',
    'Racial Subtypes',
    'Favored Class Options',
  ];

  const sectionFields = {
    'Physical Description': 'MarkdownPhysicalDescription',
    'Society': 'MarkdownSociety',
    'Relations': 'MarkdownRelations',
    'Alignment and Religion': 'MarkdownAlignmentAndReligion',
    'Adventurers': 'MarkdownAdventurers',
    'Males Names': 'MarkdownMalesNames',
    'Female Names': 'MarkdownFemaleNames',
    'Alternate Racial Traits': 'MarkdownAlternateRacialTraits',
    'Racial Subtypes': 'MarkdownRacialSubtypes',
    'Favored Class Options': 'MarkdownFavoredClassOptions',
  };

  const fields = {};
  for (const label of sectionLabels) {
    const prefix = `**${label}** :`;
    const block = blocks.find((entry) => entry.startsWith(prefix));
    if (!block) continue;
    fields[sectionFields[label]] = cleanMarkdownLinks(normalizeWhitespace(block.slice(prefix.length)));
  }

  return {
    key: normalizeName(title),
    title,
    relativePath: path.relative(vaultRoot, filePath).replaceAll(path.sep, '/'),
    intro,
    ...fields,
  };
}

function main() {
  const markdownIndex = new Map();
  for (const filePath of listMarkdownFiles(path.join(vaultRoot, 'advancedRaceGuide'))) {
    const stem = path.basename(filePath, '.md');
    const raceName = raceAliases.get(stem);
    if (!raceName) continue;

    const parsed = parseMarkdown(filePath);
    if (!parsed) continue;
    parsed.key = normalizeName(raceName);
    parsed.raceName = raceName;
    markdownIndex.set(parsed.key, parsed);
  }

  const legacyRecords = readJson(legacyRacesFile);
  const mergedRecords = legacyRecords.map((record) => {
    const markdown = markdownIndex.get(normalizeName(record.Name));
    if (!markdown) return record;

    return {
      ...record,
      MarkdownPath: markdown.relativePath,
      MarkdownTitle: markdown.title,
      MarkdownIntro: markdown.intro,
      MarkdownPhysicalDescription: markdown.MarkdownPhysicalDescription ?? null,
      MarkdownSociety: markdown.MarkdownSociety ?? null,
      MarkdownRelations: markdown.MarkdownRelations ?? null,
      MarkdownAlignmentandReligion: markdown.MarkdownAlignmentandReligion ?? null,
      MarkdownAdventurers: markdown.MarkdownAdventurers ?? null,
      MarkdownMalesNames: markdown.MarkdownMalesNames ?? null,
      MarkdownFemaleNames: markdown.MarkdownFemaleNames ?? null,
      MarkdownAlternateRacialTraits: markdown.MarkdownAlternateRacialTraits ?? null,
      MarkdownRacialSubtypes: markdown.MarkdownRacialSubtypes ?? null,
      MarkdownFavoredClassOptions: markdown.MarkdownFavoredClassOptions ?? null,
    };
  });

  const sourceIndex = {
    generatedAt: new Date().toISOString(),
    vaultRoot,
    legacyRacesFile,
    markdownCoverage: mergedRecords.filter((record) => record.MarkdownPath).length,
    totalRecords: mergedRecords.length,
    records: mergedRecords.map((record) => ({
      name: record.Name,
      markdownPath: record.MarkdownPath ?? null,
      subtype: record.Subtype ?? null,
      advanced: record.Advanced ?? null,
    })),
  };

  writeJson(outputFile, mergedRecords);
  writeJson(sourceIndexFile, sourceIndex);

  console.log(`wrote ${mergedRecords.length} race records to ${outputFile}`);
  console.log(`markdown-backed records: ${sourceIndex.markdownCoverage}`);
}

main();
