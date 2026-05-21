---
title: PF1 Flatfile Repository
status: active
owner: @lancer1977
priority: high
complexity: 2
created: 2026-05-20
updated: 2026-05-20
tags: [feature, Pathfinder1e, flatfiles, markdown]
---

# PF1 Flatfile Repository

This repo stores generated PF1 flatfiles outside the app repo. The baseline is a complete JSON mirror of the root `DataSeeds/pathfinder1e` payloads, with markdown-backed enrichment layered onto individual families.

## Current Scope

- complete DataSeeds PF1 root payload mirror
- raw PF1e API/DataSeeds backup export
- upstream SRD markdown overlay for matching spell and monster records
- class flatfiles
- race flatfiles
- racial trait flatfiles
- spell flatfiles
- skill flatfiles
- trait flatfiles
- monster flatfiles
- supporting lookup, item, rules, race, monster, encounter, and equipment data

## Source Model

- `DataSeeds/pathfinder1e/*.js` remains the compatibility source for the current API payload shape.
- `backups/pathfinder1e-api/<group>/*.json` is the raw backup snapshot and should not be markdown-enriched.
- `pathfinder1e/*.json` is the generated flatfile surface consumed by downstream importers.
- `Pathfinder-1E-SRD-Markdown` is pulled into `.cache/` and used as an upstream markdown overlay source.
- PF1 markdown is the correction and enrichment source for fields missing from DataSeeds.
- `sources/pf1-family-shape-index.json` records the canonical PF1 flatfile JSON array shapes.
- Family-specific refresh scripts may add fields, but they should preserve record identity and counts unless a deliberate source correction is documented.

## Normalization Rules

- Preserve source family names and filenames as raw compatibility labels, even when they contain legacy typos such as `archtype`.
- Treat `Name` as the primary display label for flatfile records.
- Preserve source `Id` values when they exist; only synthesize `FlatfileId` for duplicate-name records that do not have an upstream `Id`.
- Use deterministic duplicate IDs in the form `family:slug(name):occurrence`.
- Normalize aliases and casing in validation or lookup helpers, not by mutating source identity in the flatfile payloads.
- Record markdown-derived enrichment as additional fields, but do not let enrichment change record counts or primary identity without an explicit source-correction note.

## SRD Update Command

- `npm run update:srd` fetches the latest upstream `main` branch and overlays supported markdown values.
- `PF1_SRD_MARKDOWN_BRANCH=...` changes the upstream branch.
- `PF1_SRD_MARKDOWN_CACHE=...` changes the local cache directory.
- `npm run update:srd -- --no-pull` reuses the current local cache.

## Family Export Command

- `npm run export:families` writes grouped family snapshots under `exports/pf1-family-snapshots/` with a manifest for review and downstream packaging.
- The export manifest preserves source-file metadata, output-file metadata, shapes, counts, and managed-family markers for diffing and provenance.

## Smoke Refresh Command

- `npm run smoke:refresh` runs the full PF1 refresh, validation, and family export pipeline and verifies the grouped export manifest exists.
- The refresh smoke uses the source index to validate every current PF1 family, so the contract expands as the flatfile set grows.

## Backup Groups

- `adventure`: encounters, encounter titles
- `ancestry`: race, racial traits, traits
- `bestiary`: monsters
- `classes`: classes, archetypes, class abilities, deeds, powers, specializations
- `equipment`: weapons, armor, ammunition, mundane gear, specific equipment, magic items
- `magic`: spells, words
- `rules`: conditions, feats, languages, skills

## Checklist

- [x] Define flatfile family list
- [x] Define source-to-flatfile mapping
- [x] Add full DataSeeds payload sync
- [x] Add raw API/DataSeeds backup export
- [x] Add repeatable upstream SRD markdown pull/update script
- [x] Add class refresh script
- [x] Add spell refresh script
- [x] Add skill refresh script
- [x] Add payload coverage validation
- [x] Add raw backup hash validation
- [x] Add SRD markdown overlay validation
- [x] Add enriched family validation checks
- [x] Define shared label and alias normalization rules
- [x] Add family-oriented export helper for grouped family snapshots
- [x] Add source-repo refresh smoke tests for the flatfile repo itself
- [x] Add canonical family-shape manifest and validation
- [x] Add markdown enrichment for weapons
- [x] Add markdown enrichment for armor
- [x] Add markdown enrichment for weapon features
- [x] Add markdown enrichment for armor features
- [x] Add markdown enrichment for mundane gear
- [x] Add markdown enrichment for magic items
- [x] Add markdown enrichment for feats
- [x] Add markdown enrichment for races, racial traits, and traits
- [x] Add markdown enrichment for specific weapons
- [x] Add markdown enrichment for specific armor
- [x] Add markdown enrichment for ammunition
- [x] Add markdown enrichment for class abilities
- [x] Add exact-match markdown enrichment for monsters
- [x] Add markdown enrichment for encounters
- [x] Add markdown enrichment for encounter titles
- [ ] Extend SRD overlay if the upstream repository adds classes, skills, equipment, feats, or traits
- [x] Keep the legacy `archtype.json` filename as the compatibility label for the existing payload shape
