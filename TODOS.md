# Next Steps

- **Pathfinding:** Implement A* or Flow Fields to prevent zombies from getting stuck on walls.
- **Audio System:** Integrate a Sound Manager for SFX and ambient jungle tracks.
- **Survivor AI:** Add specialized behaviors for different roles (Medics healing, Farmers actually tending tiles).
- **Save/Load:** Implement local storage persistence for survivors, resources, and buildings.
- **Unify State:** Critical refactor to merge `gameState` and global state variables.

## New Game Ideas (Production Ready)

### Environmental Hazards
- **Quicksand:** Slows entities and drains hunger/stamina.
- **Thorns:** Natural spikes that deal minor damage but provide resources when cleared.
- **Night Fog:** Reduces visibility and minimap range, forcing players to rely on campfires for light.

### Advanced Defensive Structures
- **Barbed Wire:** High-durability wall that slows zombies significantly but doesn't block movement entirely.
- **Searchlight:** Rotatable structure that reveals zombies in fog and slightly weakens them.
- **Auto-Repair Post:** Slowly repairs nearby buildings using wood/stone from global resources.

### Survivor Synergy & Morale
- **Morale System:** Survivors work 20% faster when well-fed and near a campfire, but might refuse orders if health is low.
- **Specializations:** Some survivors could be "Veterans" (higher health) or "Scavengers" (chance to find iron in bushes).

### Weather System
- **Tropical Storms:** Increases water spread, slows movement, and puts out unshielded campfires.
- **Heatwave:** Drains hunger/hydration faster but increases farm growth speed.