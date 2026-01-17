## Goal (incl. success criteria):
- Revamp survival game to be more integrated, varied, and playable with improved systems, sprites, world variation, and upgrades.
- Ensure core systems function properly (spawns, upgrades, AI, biomes, sprites) with production-grade, modular code.

## Constraints/Assumptions:
- No user questions; proceed with expert judgment.
- No TODOs or placeholders; must be fully functional.
- Modularization preferred; avoid excessively large files for new changes.

## Key Decisions:
- Integrate BiomeSystem into world generation with new biome tiles and resources.
- Replace emoji-based pet sprites with modular pixel-art rendering and equipment overlays.
- Apply building upgrade visuals and scale tower behavior using upgrade stats (including chain effects).
- Make wildlife spawns biome-aware and terrain-valid.
- Surface biome effects via movement modifiers and screen tint.

## State:
- Done:
  - Added biome tiles/resources to constants and BiomeSystem.
  - Integrated biome-driven chunk generation and metadata.
  - Added biome terrain/resource rendering and water variants.
  - Replaced pet emoji sprites with modular pixel art + equipment overlays.
  - Improved wildlife spawning logic and constraints.
  - Scaled tower combat with upgrade stats and chain/splash effects.
  - Applied biome movement modifiers and screen tinting.
- Now:
  - Finalizing ledger and preparing summary.
- Next:
  - Recommend in-browser playthrough to validate biomes, spawns, upgrades, and sprites.

## Open Questions (UNCONFIRMED if needed):
- None.

## Working Set (files/ids/commands):
- `js/constants.js`, `js/biome-system.js`, `js/world.js`, `js/render.js`
- `js/sprites/environment.js`, `js/sprites/buildings.js`, `js/sprites/pets.js`
- `js/input.js`, `js/pet-system.js`, `js/entities.js`, `js/game.js`
