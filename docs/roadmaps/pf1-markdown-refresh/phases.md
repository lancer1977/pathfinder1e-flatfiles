# Phases

## Phase 1: Inventory

- [x] List PF1 markdown source folders
- [x] Map each source folder to a flatfile family
- [x] Record any source gaps or duplicates
- [x] Confirm DataSeeds root PF1 files are JSON payloads
- [x] Record complete DataSeeds payload list

## Phase 2: Raw Backup And Full DataSeeds Mirror

- [x] Export every root DataSeeds PF1 `.js` payload as raw backup JSON
- [x] Organize raw backup payloads by family group
- [x] Add a family-oriented export helper for grouped flatfile snapshots
- [x] Generate a raw backup manifest with record counts and SHA-256 hashes
- [x] Convert every root DataSeeds PF1 `.js` payload to `.json`
- [x] Preserve current payload shape for compatibility
- [x] Generate a payload source index with family counts
- [x] Validate every DataSeeds payload has a flatfile output
- [x] Validate raw backup hashes against the source payloads

## Phase 3: Classes

- [x] Build the class refresh path
- [x] Normalize class aliases and metadata
- [x] Validate counts against source

Normalization rules:

- preserve source family names and filenames as raw compatibility labels
- use `Name` as the display label
- keep `Id` when the source provides it
- synthesize `FlatfileId` only for duplicate-name records without an upstream `Id`
- keep alias/casing changes in validation and lookup helpers, not in the source payloads

## Phase 4: Spells and Skills

- [x] Build the skill refresh path
- [x] Build the spell refresh path
- [x] Validate core lookup fields

## Phase 5: Validation

- [x] Add repeatable comparison checks
- [x] Add source drift reporting
- [x] Document manual correction rules

Manual correction rules:

- record corrections as explicit source notes rather than silent payload edits
- keep count/identity changes separate from enrichment changes
- document any renamed family, merged alias, or typo recovery in the source index before consumers depend on it
- preserve raw backup snapshots as the unedited reference surface

## Phase 6: Upstream SRD Markdown Overlay

- [x] Add a repeatable `git clone`/pull cache for `Pathfinder-1E-SRD-Markdown`
- [x] Extract structured spell markdown values into `Srd*` fields
- [x] Extract bestiary statblock and description values into `Srd*` fields
- [x] Record the upstream commit in a source index
- [x] Validate SRD overlay coverage against generated flatfiles
- [ ] Extend overlay to new upstream folders if classes, skills, equipment, feats, or traits are added

Current scope:

- spells and monsters are the active overlay targets
- classes, skills, equipment, feats, and traits remain future extension points until the upstream markdown repo adds stable source sections for them

## Phase 7: Additional Enrichment

- [ ] Enrich `weapon.json`, `weaponfeature.json`, `ammo.json`, `specificWeapon.json`
- [ ] Enrich `armor.json`, `armorFeatures.json`, `specificArmor.json`
- [ ] Enrich `mundane.json`, `magicItems.json`
- [ ] Enrich `feats.json`, `classAbility.json`, `classAbility.UnchainedMonk.json`
- [ ] Enrich `race.json`, `racialtrait.json`, `traits.json`
- [ ] Enrich `monster.json`, `encounters.json`, `encountertitles.json`
- [ ] Decide whether `archtype.json` should be renamed after downstream importer compatibility is verified
