#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const classesFile = path.join(repoRoot, 'pathfinder1e', 'characterClass.json');
const sourceIndexFile = path.join(repoRoot, 'sources', 'pf1-class-source-index.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const classes = readJson(classesFile);
  const sourceIndex = readJson(sourceIndexFile);

  if (!Array.isArray(classes) || classes.length === 0) {
    throw new Error('class flatfile is empty');
  }

  if (sourceIndex.totalRecords !== classes.length) {
    throw new Error(`source index count mismatch: ${sourceIndex.totalRecords} vs ${classes.length}`);
  }

  const missingMarkdown = classes.filter((record) => !record.MarkdownPath).map((record) => record.Name);
  const coreClasses = ['Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Wizard'];
  const missingCore = coreClasses.filter((name) => !classes.some((record) => record.Name === name));

  console.log(`class records: ${classes.length}`);
  console.log(`markdown-backed records: ${sourceIndex.markdownCoverage}`);

  if (missingCore.length > 0) {
    throw new Error(`missing core classes: ${missingCore.join(', ')}`);
  }

  if (missingMarkdown.length > 0) {
    console.log(`markdown missing for ${missingMarkdown.length} records`);
  }

  console.log('pf1 class validation passed');
}

main();
