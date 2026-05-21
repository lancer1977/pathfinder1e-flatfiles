#!/usr/bin/env node
import fs from 'fs';
import os from 'os';
import path from 'path';
import { indexMarkdownRecords, parseGenericMarkdown } from './update-from-srd-markdown.mjs';

function writeFixture(rootDir, folder, fileName, title) {
  const fullPath = path.join(rootDir, folder, fileName);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `# ${title}\n\nFixture content for ${folder}.`);
}

function main() {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pf1-future-overlay-'));

  const folders = [
    ['classes', 'fixture-class.md', 'Fixture Class'],
    ['skills', 'fixture-skill.md', 'Fixture Skill'],
    ['equipment', 'fixture-equipment.md', 'Fixture Equipment'],
    ['feats', 'fixture-feat.md', 'Fixture Feat'],
    ['traits', 'fixture-trait.md', 'Fixture Trait'],
  ];

  try {
    for (const [folder, fileName, title] of folders) {
      writeFixture(rootDir, folder, fileName, title);
    }

    const failures = [];
    for (const [folder, fileName, title] of folders) {
      const index = indexMarkdownRecords(path.join(rootDir, folder), parseGenericMarkdown);
      if (index.records.length !== 1) {
        failures.push(`${folder}: expected 1 parsed markdown record`);
        continue;
      }

      if (index.records[0].title !== title) {
        failures.push(`${folder}: parsed title mismatch`);
      }

    }

    if (failures.length > 0) {
      throw new Error(`PF1 future overlay validation failed: ${failures.join('; ')}`);
    }

    console.log('pf1 future overlay validation passed');
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true });
  }
}

main();
