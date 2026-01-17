## Goal (incl. success criteria):
- Improve survival game integration: world variation/biomes, animals/pets/sprites, spawn systems, building upgrades with visual tiers, add new buildings, stabilize systems/UI; game feels more cohesive and playable.

## Constraints/Assumptions:
- No user questions; use judgment; production-grade changes; no TODOs; keep files <=800 LOC; ASCII-only edits.
- Maintain ledger updates each turn.

## Key Decisions:
- Use biome-driven world generation with safe tile normalization; revamp pet sprites into modular shapes; add building upgrade overlays and new buildings with light/water utility; integrate tower stats with upgrades.

## State:
- Done:
  - Biome-aware world generation and screen effects; zombie spawn scaling by biome.
  - Modular pet sprites; pet habitat spawning and valid spawn checks; fix pet ability context.
  - Building upgrade visual tiers; tower/cannon stats tied to upgrades.
  - New buildings: Storage, Lantern, Well with sprites, tracking, UI, lighting, and water resource.
  - Resource/UI/save fixes (water resource display, building type tracking).
- Now: Validate integrated systems and remaining gaps.
- Next: Run targeted sanity checks or adjust balance if needed.

## Open Questions (UNCONFIRMED if needed):
- None (per instruction to avoid user questions).

## Working Set (files/ids/commands):
- js/world.js
- js/biome-system.js
- js/render.js
- js/sprites/pets.js
- js/sprites/buildings.js
- js/constants.js
- js/entities.js
- js/pet-system.js
- js/input.js
- js/building-upgrade-system.js
- js/ui.js
- js/effects.js
- js/save-system.js
- index.html
