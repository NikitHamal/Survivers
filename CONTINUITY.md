## Goal (incl. success criteria):
- Improve survival game integration and playability by strengthening spawn/upgrade/world variation systems, adding modular sprites, and making upgrades visually and mechanically meaningful.

## Constraints/Assumptions:
- No user questions; use best judgment.
- Maintain modular files (<= 800 LOC per file).
- Production-grade implementations; no TODOs.
- Sandbox full access; avoid destructive commands.

## Key Decisions:
- Use existing BiomeSystem to drive world variation.
- Connect building upgrades to tower/cannon stats and visible appearance.

## State:
- Done:
  - Created continuity ledger.
  - Integrated biome-driven world tiles with new terrain/resource sprites.
  - Connected biome modifiers to zombie spawn rates and types.
  - Wired building upgrades into tower/cannon combat stats and visuals.
- Now:
  - Verify integration consistency across rendering, harvesting, and collision.
- Next:
  - Final pass for balance and any UI/logic regressions.

## Open Questions (UNCONFIRMED if needed):
- UNCONFIRMED: Exact scope of new buildings/sprites desired beyond core systems.

## Working Set (files/ids/commands):
- js/world.js
- js/biome-system.js
- js/building-upgrade-system.js
- js/entities.js
- js/sprites/environment.js
- js/sprites/buildings.js
- js/sprites/building-upgrades.js
- js/constants.js
- js/input.js
- js/sprites/entities.js
- index.html
