## Goal (incl. success criteria):
- Understand existing survival game codebase and improve broken or incomplete systems with production-grade enhancements, including sprites, pet/spawn systems, buildings, upgrades, AI/NPCs, and overall integration.

## Constraints/Assumptions:
- No user questions; proceed with expert judgment.
- Keep files modular (500-800 LOC max); avoid TODOs and placeholder logic.
- Use highest-quality implementations; if not, do not change.

## Key Decisions:
- Integrated BuildingUpgradeSystem stats into tower/cannon combat and added burn/slow/chain effects.
- Added level-aware building sprites and biome-aware wildlife/zombie spawns.
- Added basic taming to PetSystem with follow behavior and UI hints.

## State:
- Done:
  - Reviewed core systems (rendering, upgrades, entities, pets, spawn).
  - Implemented tower/cannon stat upgrades and status effects.
  - Added level-aware visuals for key buildings.
  - Added biome-aware zombie/wildlife spawning and pet taming.
- Now:
  - Stabilize state updates and ensure integrations are consistent.
- Next:
  - Final pass for regressions and document changes.

## Open Questions (UNCONFIRMED if needed):
- UNCONFIRMED: Intended gameplay scope and balance targets.

## Working Set (files/ids/commands):
- Files: js/entities.js, js/game.js, js/world.js, js/pet-system.js, js/sprites/buildings.js, js/sprites/environment.js, js/sprites/pets.js, js/phase1-ui.js, js/input.js, js/boss-system.js
- Commands: rg --files, rg, sed
