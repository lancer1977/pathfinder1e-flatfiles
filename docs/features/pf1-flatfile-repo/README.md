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
- class flatfiles
- spell flatfiles
- skill flatfiles
- supporting lookup, item, rules, race, monster, encounter, and equipment data

## Source Model

- `DataSeeds/pathfinder1e/*.js` remains the compatibility source for the current API payload shape.
- `backups/pathfinder1e-api/<group>/*.json` is the raw backup snapshot and should not be markdown-enriched.
- `pathfinder1e/*.json` is the generated flatfile surface consumed by downstream importers.
- PF1 markdown is the correction and enrichment source for fields missing from DataSeeds.
- Family-specific refresh scripts may add fields, but they should preserve record identity and counts unless a deliberate source correction is documented.

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
- [x] Add class refresh script
- [x] Add spell refresh script
- [x] Add skill refresh script
- [x] Add payload coverage validation
- [x] Add raw backup hash validation
- [x] Add enriched family validation checks
- [ ] Add markdown enrichment for weapons and weapon features
- [ ] Add markdown enrichment for armor and armor features
- [ ] Add markdown enrichment for mundane gear and magic items
- [ ] Add markdown enrichment for feats and class abilities
- [ ] Add markdown enrichment for races, racial traits, and traits
