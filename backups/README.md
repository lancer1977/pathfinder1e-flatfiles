# Backups

This folder stores raw flat backups of upstream Pathfinder data sources.

## Pathfinder 1e API Backup

- Location: `backups/pathfinder1e-api/`
- Command: `npm run export:backup`
- Validation: `npm run validate:backup`

The PF1e API backup is generated directly from `~/code/DataSeeds/pathfinder1e/*.js`.
It is intentionally not markdown-enriched and should preserve the source payload shape exactly after JSON conversion.

## Layout

- `adventure/` - encounters and encounter title data
- `ancestry/` - race, racial trait, and trait data
- `bestiary/` - monster data
- `classes/` - classes, archetypes, class abilities, deeds, powers, and specializations
- `equipment/` - weapons, armor, ammunition, mundane gear, specific items, and magic items
- `magic/` - spells and word data
- `rules/` - conditions, feats, languages, and skills
- `manifest.json` - group map, source files, backup files, counts, and SHA-256 hashes

Use `pathfinder1e/*.json` for the working flatfiles that downstream importers can consume.
Use `backups/pathfinder1e-api/<group>/*.json` when you need the raw recoverable snapshot of the current API/DataSeeds payloads.
