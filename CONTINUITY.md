## Goal (incl. success criteria):
- Improve survival game playability by integrating biome-based world variation, upgrading animal sprites, fixing spawn/upgrade systems, and ensuring visuals reflect upgrades.
- Success: world varies across biomes, animal sprites no longer emoji-based, spawn logic respects biomes/terrain, upgrade visuals reflect levels, save/load includes new system state.

## Constraints/Assumptions:
- No user questions; proceed with best judgment.
- Keep changes production-grade, no TODOs, prefer modularization (500-800 LOC per file).
- Avoid destructive commands; work within existing codebase.

## Key Decisions:
- Integrate BiomeSystem into chunk generation and tile rendering.
- Replace pet emoji sprites with procedural modular sprites per animal.
- Add upgrade-level visual variants for key buildings in sprite rendering.
- Persist BuildingUpgradeSystem and BiomeSystem state in SaveSystem.

## State:
- Done:
- Done: Added biome tile IDs and rendering support, integrated BiomeSystem into chunk generation, replaced pet emoji rendering with procedural sprites, improved wild spawn logic, added upgrade-level visuals for buildings, and persisted biome/upgrade state in saves.
- Now: Verifying remaining integration points (minimap colors, spawn checks) and ensuring changes compile logically.
- Next: Address any remaining compatibility gaps and provide final summary/testing guidance.

## Open Questions (UNCONFIRMED if needed):
- None (no questions allowed).

## Working Set (files/ids/commands):
- js/world.js
- js/biome-system.js
- js/sprites/environment.js
- js/sprites/pets.js
- js/building-upgrade-system.js
- js/save-system.js
- js/entities.js
- js/game.js
- js/constants.js
- js/sprites/buildings.js
- js/ui.js
