import fs from 'fs';
import path from 'path';

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function listMarkdownFiles(rootDir) {
  const results = [];
  if (!fs.existsSync(rootDir)) return results;

  function visit(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        results.push(fullPath);
      }
    }
  }

  visit(rootDir);
  return results.sort((left, right) => left.localeCompare(right));
}

export function normalizeName(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function normalizeWhitespace(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/\s+/g, ' ').trim();
}

export function cleanMarkdownLinks(value) {
  if (!value) return value;
  return normalizeWhitespace(
    value
      .replace(/\[\[([^\]|]+)\|([^\]]+)]]/g, '$2')
      .replace(/\[\[([^\]]+)]]/g, '$1')
      .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
      .replace(/\*\*/g, ''),
  );
}

export function firstHeading(text) {
  return (
    text.match(/^#\s+(.+?)\s*$/m)?.[1]?.trim()
    ?? text.match(/^##\s+(.+?)\s*$/m)?.[1]?.trim()
    ?? null
  );
}

export function paragraphBlocks(text) {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

export function sectionText(text, heading) {
  const pattern = new RegExp(`^#{2,3}\\s+${heading}\\s*$`, 'im');
  const match = text.match(pattern);
  if (!match) return null;

  const start = match.index + match[0].length;
  const tail = text.slice(start);
  const next = tail.match(/^#{2,3}\s+/m);
  const section = next ? tail.slice(0, next.index) : tail;
  return normalizeWhitespace(section);
}
