---
title: PF1 Markdown Refresh
status: active
owner: @lancer1977
priority: high
complexity: 3
created: 2026-05-20
updated: 2026-05-20
tags: [roadmap, Pathfinder1e, markdown, regeneration]
---

# PF1 Markdown Refresh

Create a repeatable path from the current DataSeeds payload mirror to markdown-enriched PF1 flatfiles.

## Goals

- Keep source parsing separate from application code.
- Regenerate a complete JSON mirror of current Pathfinder API payload data.
- Export a raw backup snapshot of the current Pathfinder API payload data.
- Regenerate enriched flatfiles from markdown on demand.
- Pull and overlay current values from the upstream SRD markdown repository.
- Make data corrections traceable back to markdown source sections.

## Phases

- Phase 1: inventory and mapping
- Phase 2: raw API backup and full DataSeeds payload mirror
- Phase 3: class refresh
- Phase 4: spells and skills refresh
- Phase 5: validation and drift checks
- Phase 6: upstream SRD markdown overlay
- Phase 7: equipment, feats, class abilities, race, trait, and item enrichment
