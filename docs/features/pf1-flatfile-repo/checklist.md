# Checklist

## Discovery

- [x] Repo boundary chosen
- [x] PF1 markdown vault confirmed as source of truth
- [x] Legacy `DataSeeds` repo confirmed as historical reference
- [x] PF1 class family chosen as the first refresh slice
- [x] Root `DataSeeds/pathfinder1e/*.js` files confirmed as JSON payloads
- [x] DataSeeds root payload count confirmed at 28 families
- [x] Raw backup family grouping defined
- [x] Upstream SRD markdown repository confirmed at `Pathfinder-1E-SRD-Markdown`
- [x] Upstream SRD overlap confirmed for spells and bestiary records

## Data

- [x] Export raw PF1e API/DataSeeds backup payloads
- [x] Organize raw backup payloads by family group
- [x] Mirror every root DataSeeds PF1 payload as JSON
- [x] Overlay SRD markdown spell values into `spells.json`
- [x] Overlay SRD markdown bestiary values into `monster.json`
- [x] Inventory class markdown sections
- [x] Inventory skill markdown sections
- [x] Inventory spell markdown sections
- [x] Determine normalization rules for shared labels and aliases
- [x] Prioritize next enrichment families for equipment, feats, class abilities, and races

## Scripts

- [x] Add raw backup export helper
- [x] Add full DataSeeds sync helper
- [x] Add upstream SRD markdown update helper
- [x] Add class refresh helper
- [x] Add race refresh helper
- [x] Add racial trait refresh helper
- [x] Add skill refresh helper
- [x] Add spell refresh helper
- [x] Add trait refresh helper
- [x] Add payload validation helper
- [x] Add raw backup validation helper
- [x] Add race validation helper
- [x] Add racial trait validation helper
- [x] Add trait validation helper
- [x] Add source-doc enrichment helper for armor, feats, magic items, mundane gear, and weapons
- [x] Add source-doc validation helper for armor, feats, magic items, mundane gear, and weapons
- [x] Add source-doc enrichment helper for armor features, ammunition, specific armor, specific weapons, and weapon features
- [x] Add source-doc validation helper for armor features, ammunition, specific armor, specific weapons, and weapon features
- [x] Add source-doc enrichment helper for class abilities
- [x] Add source-doc validation helper for class abilities
- [x] Add upstream SRD markdown validation helper
- [x] Add enriched family validation helpers

## Output

- [x] Generate raw backup files for all 28 root DataSeeds PF1 payloads
- [x] Generate raw backup manifest with counts and SHA-256 hashes
- [x] Generate raw backup files under family group folders
- [x] Generate JSON flatfiles for all 28 root DataSeeds PF1 payloads
- [x] Generate merged class flatfile from vault and legacy seeds
- [x] Generate merged race flatfile from vault and legacy seeds
- [x] Generate merged racial trait flatfile from vault and legacy seeds
- [x] Generate merged skill flatfile from vault and legacy seeds
- [x] Generate merged spell flatfile from vault and legacy seeds
- [x] Generate merged trait flatfile from vault and legacy seeds
- [x] Generate source-linked flatfiles for armor, feats, magic items, mundane gear, and weapons
- [x] Generate source-linked flatfiles for armor features, ammunition, specific armor, specific weapons, and weapon features
- [x] Generate source-linked flatfiles for class abilities
- [x] Generate SRD markdown source index with upstream commit and match counts

## Validation

- [x] Count records after refresh
- [x] Check required fields are present
- [x] Compare regenerated output against expected source coverage
- [x] Validate every DataSeeds root payload has a JSON flatfile counterpart
- [x] Validate mirrored payload counts match source counts
- [x] Validate raw backup hashes match source payloads
- [x] Validate race markdown coverage against generated flatfiles
- [x] Validate racial trait markdown coverage against generated flatfiles
- [x] Validate trait markdown coverage against generated flatfiles
- [x] Validate SRD overlay match counts against generated flatfiles
- [x] Validate the full refresh smoke path and grouped family export manifest
