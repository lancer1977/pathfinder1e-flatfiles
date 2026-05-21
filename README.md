# Pathfinder 1e Flatfiles

This repository stores Pathfinder 1e flatfiles outside the application repo.

## Purpose

- Keep Pathfinder source data separate from application code.
- Preserve a clean flatfile surface that starts as a complete `DataSeeds/pathfinder1e` payload mirror.
- Layer markdown-backed corrections and richer fields onto the mirrored families over time.
- Avoid mixing in legacy scraper helpers or runtime app logic.

## Source of Truth

- Current flatfile baseline: `~/code/DataSeeds/pathfinder1e`
- Upstream markdown refresh source: `https://github.com/Obsidian-TTRPG-Community/Pathfinder-1E-SRD-Markdown`
- Canonical rules recovery source: the local PF1 markdown vault under `~/vaults/rpgs/RPG Vault/10_Rules/Pathfinder 1e`

## Repository Layout

- `pathfinder1e/` - normalized PF1 flatfiles
- `backups/` - raw flat backups of upstream payloads
- `sources/` - source inventory and raw-source notes
- `scripts/` - refresh, compare, and validation helpers
- `docs/` - feature notes and roadmap tracking

## Working Rules

- Treat the root `DataSeeds/pathfinder1e/*.js` payloads as the full compatibility mirror for today's Pathfinder API data.
- Treat `backups/pathfinder1e-api/*.json` as the raw recovery snapshot.
- Treat markdown as the recovery and correction source.
- Treat flatfiles as generated artifacts.
- Keep regeneration repeatable.
- Do not add app code unless it is directly needed for data generation or validation.

## Current Status

- Generated families: all 28 root `DataSeeds/pathfinder1e/*.js` payloads are mirrored as JSON.
- Raw backup: all 28 root payloads are exported to `backups/pathfinder1e-api/` with a hash manifest.
- Enriched families: `characterClass.json`, `skills.json`, `spells.json`
- SRD markdown overlay: `spells.json` and `monster.json` include `Srd*` fields from the upstream markdown repository when names match.
- Duplicate-name records that lack upstream IDs get a generated `FlatfileId` on the second and later occurrence so importers can preserve every record without changing the first occurrence's name-based key.
- Validation helpers are in place for payload coverage plus enriched class, skill, and spell checks.
- Source coverage manifests are generated alongside the flatfiles.

## Commands

- `npm run refresh:all` - sync the full DataSeeds payload mirror, refresh enriched classes, skills, and spells, overlay upstream SRD markdown values, then assign deterministic duplicate IDs.
- `npm run assign:ids` - assign generated `FlatfileId` values to duplicate-name records that do not have upstream IDs.
- `npm run export:backup` - export a grouped raw JSON backup of the current PF1e API/DataSeeds payloads.
- `npm run update:srd` - clone or fast-forward the upstream SRD markdown cache, then overlay matching spell and monster markdown values.
- `npm run validate:all` - verify payload coverage and enriched family checks.
- `npm run validate:backup` - verify the raw backup still matches DataSeeds counts and hashes.
- `npm run validate:srd` - verify SRD markdown overlay coverage and source-index consistency.
- `npm run sync:dataseeds` - sync DataSeeds-only families without overwriting existing enriched outputs.

`update:srd` options:

- `PF1_SRD_MARKDOWN_BRANCH=main` overrides the upstream branch.
- `PF1_SRD_MARKDOWN_CACHE=/path/to/cache` overrides the local clone path.
- `npm run update:srd -- --no-pull` reuses the current local cache without fetching.

## Next Steps

- Normalize aliases and shared labels.
- Add markdown-backed enrichment for weapons, armor, mundane gear, feats, class abilities, races, traits, and item families as upstream markdown coverage becomes available.
- Document any source gaps or manual corrections as they are discovered.
