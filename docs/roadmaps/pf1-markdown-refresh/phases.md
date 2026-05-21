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
- [x] Generate a raw backup manifest with record counts and SHA-256 hashes
- [x] Convert every root DataSeeds PF1 `.js` payload to `.json`
- [x] Preserve current payload shape for compatibility
- [x] Generate a payload source index with family counts
- [x] Validate every DataSeeds payload has a flatfile output
- [x] Validate raw backup hashes against the source payloads

## Phase 3: Classes

- [x] Build the class refresh path
- [ ] Normalize class aliases and metadata
- [x] Validate counts against source

## Phase 4: Spells and Skills

- [x] Build the skill refresh path
- [x] Build the spell refresh path
- [x] Validate core lookup fields

## Phase 5: Validation

- [x] Add repeatable comparison checks
- [x] Add source drift reporting
- [ ] Document manual correction rules

## Phase 6: Additional Enrichment

- [ ] Enrich `weapon.json`, `weaponfeature.json`, `ammo.json`, `specificWeapon.json`
- [ ] Enrich `armor.json`, `armorFeatures.json`, `specificArmor.json`
- [ ] Enrich `mundane.json`, `magicItems.json`
- [ ] Enrich `feats.json`, `classAbility.json`, `classAbility.UnchainedMonk.json`
- [ ] Enrich `race.json`, `racialtrait.json`, `traits.json`
- [ ] Enrich `monster.json`, `encounters.json`, `encountertitles.json`
- [ ] Decide whether `archtype.json` should be renamed after downstream importer compatibility is verified
