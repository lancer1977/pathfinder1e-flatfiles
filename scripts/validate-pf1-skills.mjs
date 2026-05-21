#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const skillsFile = path.join(repoRoot, 'pathfinder1e', 'skills.json');
const sourceIndexFile = path.join(repoRoot, 'sources', 'pf1-skill-source-index.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const skills = readJson(skillsFile);
  const sourceIndex = readJson(sourceIndexFile);

  if (!Array.isArray(skills) || skills.length === 0) {
    throw new Error('skill flatfile is empty');
  }

  if (sourceIndex.totalRecords !== skills.length) {
    throw new Error(`source index count mismatch: ${sourceIndex.totalRecords} vs ${skills.length}`);
  }

  const markdownSkills = ['Acrobatics', 'Appraise', 'Bluff', 'Climb', 'Diplomacy', 'Disable Device', 'Disguise', 'Escape Artist', 'Fly', 'Handle Animal', 'Heal', 'Intimidate', 'Linguistics', 'Perception', 'Perform', 'Ride', 'Sense Motive', 'Sleight Of Hand', 'Spellcraft', 'Stealth', 'Survival', 'Swim', 'Use Magic Device'];
  const missing = markdownSkills.filter((name) => !skills.some((record) => record.Name === name));

  console.log(`skill records: ${skills.length}`);
  console.log(`markdown-backed records: ${sourceIndex.markdownCoverage}`);

  if (missing.length > 0) {
    throw new Error(`missing vault-backed skills: ${missing.join(', ')}`);
  }

  console.log('pf1 skill validation passed');
}

main();
