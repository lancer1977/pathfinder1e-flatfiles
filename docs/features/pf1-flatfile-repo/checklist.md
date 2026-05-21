# Checklist

## Discovery

- [x] Repo boundary chosen
- [x] PF1 markdown vault confirmed as source of truth
- [x] Legacy `DataSeeds` repo confirmed as historical reference
- [x] PF1 class family chosen as the first refresh slice
- [x] Root `DataSeeds/pathfinder1e/*.js` files confirmed as JSON payloads
- [x] DataSeeds root payload count confirmed at 28 families
- [x] Raw backup family grouping defined

## Data

- [x] Export raw PF1e API/DataSeeds backup payloads
- [x] Organize raw backup payloads by family group
- [x] Mirror every root DataSeeds PF1 payload as JSON
- [x] Inventory class markdown sections
- [x] Inventory skill markdown sections
- [x] Inventory spell markdown sections
- [ ] Determine normalization rules for shared labels and aliases
- [ ] Prioritize next enrichment families for equipment, feats, class abilities, and races

## Scripts

- [x] Add raw backup export helper
- [x] Add full DataSeeds sync helper
- [x] Add class refresh helper
- [x] Add skill refresh helper
- [x] Add spell refresh helper
- [x] Add payload validation helper
- [x] Add raw backup validation helper
- [x] Add enriched family validation helpers

## Output

- [x] Generate raw backup files for all 28 root DataSeeds PF1 payloads
- [x] Generate raw backup manifest with counts and SHA-256 hashes
- [x] Generate raw backup files under family group folders
- [x] Generate JSON flatfiles for all 28 root DataSeeds PF1 payloads
- [x] Generate merged class flatfile from vault and legacy seeds
- [x] Generate merged skill flatfile from vault and legacy seeds
- [x] Generate merged spell flatfile from vault and legacy seeds

## Validation

- [x] Count records after refresh
- [x] Check required fields are present
- [x] Compare regenerated output against expected source coverage
- [x] Validate every DataSeeds root payload has a JSON flatfile counterpart
- [x] Validate mirrored payload counts match source counts
- [x] Validate raw backup hashes match source payloads
