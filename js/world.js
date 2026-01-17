// ============= CHUNK SYSTEM CONFIGURATION =============
const CHUNK_CONFIG = {
    SIZE: typeof CHUNK_SIZE !== 'undefined' ? CHUNK_SIZE : 16,
    KEEP_RADIUS: 3,
    MAX_CACHED_CHUNKS: 100,
    CLEANUP_INTERVAL: 5000, // ms

    // Generation parameters
    RIVER_SCALE: 0.03,
    RIVER_MIN: 0.65,
    RIVER_MAX: 0.72,
    FOREST_SCALE: 0.02,
    FOREST_OFFSET: 100,

    // Spawn rates
    TREE_BASE_RATE: 0.25,
    BUSH_RATE: 0.32,
    STONE_RATE: 0.38,
    IRON_RATE: 0.40,
    IRON_SECONDARY_THRESHOLD: 0.6,

    // Base area bounds (keep clear during generation)
    BASE_MIN: -6,
    BASE_MAX: 6,
    STARTING_BASE_CLEAR_MIN: -8,
    STARTING_BASE_CLEAR_MAX: 8
};

// Use configuration or fallback
const CHUNK_SIZE_LOCAL = CHUNK_CONFIG.SIZE;

// Track modified chunks for persistence
const modifiedChunks = new Map(); // key -> Set of modified tile indices
let lastCleanupTime = 0;

// Building lookup map for O(1) access
const buildingMap = new Map(); // "x,y" -> building object

// ============= CHUNK KEY UTILITIES =============
function getChunkKey(cx, cy) {
    // Validate inputs to prevent NaN keys
    if (!Number.isFinite(cx) || !Number.isFinite(cy)) {
        console.warn('getChunkKey: Invalid coordinates', cx, cy);
        return '0,0';
    }
    return `${Math.floor(cx)},${Math.floor(cy)}`;
}

function parseChunkKey(key) {
    const parts = key.split(',');
    if (parts.length !== 2) {
        console.warn('parseChunkKey: Invalid key format', key);
        return { cx: 0, cy: 0 };
    }
    const cx = parseInt(parts[0], 10);
    const cy = parseInt(parts[1], 10);

    if (isNaN(cx) || isNaN(cy)) {
        console.warn('parseChunkKey: Failed to parse coordinates', key);
        return { cx: 0, cy: 0 };
    }

    return { cx, cy };
}

function worldToChunk(wx, wy) {
    return {
        cx: Math.floor(wx / CHUNK_SIZE_LOCAL),
        cy: Math.floor(wy / CHUNK_SIZE_LOCAL)
    };
}

function worldToLocal(wx, wy) {
    wx = Math.floor(wx);
    wy = Math.floor(wy);
    return {
        lx: ((wx % CHUNK_SIZE_LOCAL) + CHUNK_SIZE_LOCAL) % CHUNK_SIZE_LOCAL,
        ly: ((wy % CHUNK_SIZE_LOCAL) + CHUNK_SIZE_LOCAL) % CHUNK_SIZE_LOCAL
    };
}

function localToIndex(lx, ly) {
    return ly * CHUNK_SIZE_LOCAL + lx;
}

// ============= CHUNK ACCESS =============
function getChunk(cx, cy) {
    const key = getChunkKey(cx, cy);

    if (!chunks.has(key)) {
        const newChunk = generateChunk(cx, cy);
        chunks.set(key, newChunk);
    }

    // Track access time for LRU cleanup
    const chunk = chunks.get(key);
    if (chunk) {
        chunk._lastAccess = Date.now();
    }

    return chunk;
}

function hasChunk(cx, cy) {
    return chunks.has(getChunkKey(cx, cy));
}

function isChunkModified(cx, cy) {
    const key = getChunkKey(cx, cy);
    return modifiedChunks.has(key) && modifiedChunks.get(key).size > 0;
}

function markChunkModified(cx, cy, localIndex) {
    const key = getChunkKey(cx, cy);

    if (!modifiedChunks.has(key)) {
        modifiedChunks.set(key, new Set());
    }

    modifiedChunks.get(key).add(localIndex);
}

// ============= CHUNK CLEANUP =============
function cleanupChunks(force = false) {
    const now = Date.now();

    // Rate limit cleanup unless forced
    if (!force && now - lastCleanupTime < CHUNK_CONFIG.CLEANUP_INTERVAL) {
        return;
    }
    lastCleanupTime = now;

    const { cx: pcx, cy: pcy } = worldToChunk(player.x, player.y);
    const chunksToRemove = [];

    for (const [key, chunk] of chunks) {
        const { cx, cy } = parseChunkKey(key);

        // Never unload spawn chunk
        if (cx === 0 && cy === 0) continue;

        const dist = Math.max(Math.abs(cx - pcx), Math.abs(cy - pcy));

        if (dist > CHUNK_CONFIG.KEEP_RADIUS) {
            // Check if chunk should be preserved
            if (shouldPreserveChunk(cx, cy, key)) {
                continue;
            }

            chunksToRemove.push(key);
        }
    }

    // Also apply LRU eviction if too many chunks cached
    if (chunks.size > CHUNK_CONFIG.MAX_CACHED_CHUNKS) {
        const sortedChunks = Array.from(chunks.entries())
            .filter(([key]) => {
                const { cx, cy } = parseChunkKey(key);
                // Don't evict spawn or nearby chunks
                if (cx === 0 && cy === 0) return false;
                const dist = Math.max(Math.abs(cx - pcx), Math.abs(cy - pcy));
                return dist > CHUNK_CONFIG.KEEP_RADIUS;
            })
            .sort((a, b) => (a[1]._lastAccess || 0) - (b[1]._lastAccess || 0));

        const excessCount = chunks.size - CHUNK_CONFIG.MAX_CACHED_CHUNKS;
        for (let i = 0; i < Math.min(excessCount, sortedChunks.length); i++) {
            const key = sortedChunks[i][0];
            const { cx, cy } = parseChunkKey(key);

            if (!shouldPreserveChunk(cx, cy, key) && !chunksToRemove.includes(key)) {
                chunksToRemove.push(key);
            }
        }
    }

    // Perform removal
    for (const key of chunksToRemove) {
        unloadChunk(key);
    }
}

function shouldPreserveChunk(cx, cy, key) {
    // Preserve if chunk has been modified by player
    if (modifiedChunks.has(key) && modifiedChunks.get(key).size > 0) {
        return true;
    }

    // Preserve if chunk contains buildings
    const hasBuilding = buildings.some(b => {
        const bc = worldToChunk(b.x, b.y);
        return bc.cx === cx && bc.cy === cy;
    });

    if (hasBuilding) return true;

    // Preserve if survivors are in this chunk
    if (Array.isArray(survivors)) {
        const hasSurvivor = survivors.some(s => {
            if (s.isPlayer) return false;
            const sc = worldToChunk(s.x, s.y);
            return sc.cx === cx && sc.cy === cy;
        });

        if (hasSurvivor) return true;
    }

    return false;
}

function unloadChunk(key) {
    chunks.delete(key);

    // Keep modification data for when chunk is reloaded
    // This allows player modifications to persist
    // Only clear if we want a full reset:
    // modifiedChunks.delete(key);
}

function forceUnloadAllChunks() {
    // Keep spawn chunk and modified chunks
    const keysToKeep = ['0,0'];

    for (const [key] of chunks) {
        if (!keysToKeep.includes(key) && !modifiedChunks.has(key)) {
            chunks.delete(key);
        }
    }
}

// ============= CHUNK GENERATION =============
function generateChunk(cx, cy) {
    const chunk = new Array(CHUNK_SIZE_LOCAL * CHUNK_SIZE_LOCAL).fill(TILES.GRASS);
    chunk._lastAccess = Date.now();

    const worldX = cx * CHUNK_SIZE_LOCAL;
    const worldY = cy * CHUNK_SIZE_LOCAL;
    const key = getChunkKey(cx, cy);

    // Check if we have stored modifications for this chunk
    const modifications = modifiedChunks.get(key);

    for (let y = 0; y < CHUNK_SIZE_LOCAL; y++) {
        for (let x = 0; x < CHUNK_SIZE_LOCAL; x++) {
            const wx = worldX + x;
            const wy = worldY + y;
            const idx = localToIndex(x, y);

            // Skip if this tile was modified (will be restored separately)
            if (modifications && modifications.has(idx)) {
                continue;
            }

            // Skip base area (always keep clear for base generation)
            if (isInBaseArea(wx, wy)) {
                continue;
            }

            chunk[idx] = generateTileAt(wx, wy);
        }
    }

    return chunk;
}

function isInBaseArea(wx, wy) {
    return wx >= CHUNK_CONFIG.BASE_MIN &&
        wx <= CHUNK_CONFIG.BASE_MAX &&
        wy >= CHUNK_CONFIG.BASE_MIN &&
        wy <= CHUNK_CONFIG.BASE_MAX;
}

function generateTileAt(wx, wy) {
    // Validate noise functions exist
    if (typeof noise2D !== 'function' || typeof seededRandom !== 'function') {
        console.warn('Missing noise functions for terrain generation');
        return TILES.GRASS;
    }

    if (typeof BiomeSystem !== 'undefined' && typeof BiomeSystem.generateBiomeTile === 'function') {
        const baseNoise = noise2D(wx * 0.02, wy * 0.02);
        const biomeTile = BiomeSystem.generateBiomeTile(wx, wy, baseNoise);
        if (biomeTile !== undefined && biomeTile !== null) {
            return biomeTile;
        }
    }

    const r = seededRandom(wx, wy);

    // Rivers using noise
    const riverNoise = noise2D(wx * CHUNK_CONFIG.RIVER_SCALE, wy * CHUNK_CONFIG.RIVER_SCALE);
    if (riverNoise > CHUNK_CONFIG.RIVER_MIN && riverNoise < CHUNK_CONFIG.RIVER_MAX) {
        return TILES.WATER;
    }

    // Forest density varies with noise
    const forestDensity = noise2D(
        wx * CHUNK_CONFIG.FOREST_SCALE + CHUNK_CONFIG.FOREST_OFFSET,
        wy * CHUNK_CONFIG.FOREST_SCALE + CHUNK_CONFIG.FOREST_OFFSET
    );

    // Determine tile type based on random value and density
    const treeThreshold = CHUNK_CONFIG.TREE_BASE_RATE * (0.5 + forestDensity);

    if (r < treeThreshold) {
        return TILES.TREE;
    } else if (r < CHUNK_CONFIG.BUSH_RATE) {
        return TILES.BUSH;
    } else if (r < CHUNK_CONFIG.STONE_RATE) {
        return TILES.STONE;
    } else if (r < CHUNK_CONFIG.IRON_RATE) {
        // Iron is rarer - use secondary random check
        const ironRandom = seededRandom(wx + 500, wy + 500);
        if (ironRandom > CHUNK_CONFIG.IRON_SECONDARY_THRESHOLD) {
            return TILES.IRON;
        }
    }

    return TILES.GRASS;
}

// ============= TILE ACCESS =============
function getTile(wx, wy) {
    // Validate input
    if (!Number.isFinite(wx) || !Number.isFinite(wy)) {
        console.warn('getTile: Invalid coordinates', wx, wy);
        return TILES.GRASS;
    }

    wx = Math.floor(wx);
    wy = Math.floor(wy);

    const { cx, cy } = worldToChunk(wx, wy);
    const { lx, ly } = worldToLocal(wx, wy);
    const chunk = getChunk(cx, cy);

    if (!chunk) {
        console.warn('getTile: Failed to get chunk', cx, cy);
        return TILES.GRASS;
    }

    const idx = localToIndex(lx, ly);
    const tile = chunk[idx];

    // Return default if tile is undefined/null
    return tile !== undefined && tile !== null ? tile : TILES.GRASS;
}

function setTile(wx, wy, tile) {
    // Validate inputs
    if (!Number.isFinite(wx) || !Number.isFinite(wy)) {
        console.warn('setTile: Invalid coordinates', wx, wy);
        return false;
    }

    if (tile === undefined || tile === null) {
        console.warn('setTile: Invalid tile', tile);
        return false;
    }

    wx = Math.floor(wx);
    wy = Math.floor(wy);

    const { cx, cy } = worldToChunk(wx, wy);
    const { lx, ly } = worldToLocal(wx, wy);
    const chunk = getChunk(cx, cy);

    if (!chunk) {
        console.warn('setTile: Failed to get chunk', cx, cy);
        return false;
    }

    const idx = localToIndex(lx, ly);
    const oldTile = chunk[idx];

    // No change needed
    if (oldTile === tile) return true;

    // Set the new tile
    chunk[idx] = tile;

    // Mark chunk as modified for persistence
    markChunkModified(cx, cy, idx);

    // Update building tracking
    updateBuildingTracking(wx, wy, oldTile, tile);

    return true;
}

function updateBuildingTracking(wx, wy, oldTile, newTile) {
    const functionalTiles = [
        TILES.TOWER,
        TILES.CANNON,
        TILES.FARM,
        TILES.CAMPFIRE,
        TILES.HOUSE,
        TILES.HOUSE_BASE,
        TILES.SPIKES,
        TILES.WORKBENCH,
        TILES.CHEST,
        TILES.BED,
        TILES.WALL
    ];

    const posKey = `${wx},${wy}`;
    const wasBuilding = functionalTiles.includes(oldTile) || buildingMap.has(posKey);
    const isBuilding = functionalTiles.includes(newTile);

    // Remove old building if it exists in our tracking
    if (wasBuilding) {
        // Remove from buildings array
        const buildingIndex = buildings.findIndex(b => b.x === wx && b.y === wy);
        if (buildingIndex !== -1) {
            buildings.splice(buildingIndex, 1);
        }

        // Remove from lookup map
        buildingMap.delete(posKey);

        // Notify tower system if applicable
        if (oldTile === TILES.TOWER || oldTile === TILES.CANNON) {
            if (typeof unregisterTower === 'function') {
                unregisterTower(wx, wy);
            }
        }
    }

    // Add new building
    if (isBuilding) {
        // Store the building
        const building = {
            x: wx,
            y: wy,
            tile: newTile,
            bgTile: oldTile, // Store what was here before (Grass, Floor, etc.)
            level: 1,
            lastUpdate: typeof gameTime !== 'undefined' ? gameTime : Date.now(),
            health: getBuildingMaxHealth(newTile),
            maxHealth: getBuildingMaxHealth(newTile)
        };

        buildings.push(building);
        buildingMap.set(posKey, building);

        // Notify tower system if applicable
        if (newTile === TILES.TOWER || newTile === TILES.CANNON) {
            if (typeof registerTower === 'function') {
                registerTower(wx, wy, newTile);
            }
        }
    }
}

function getBuildingMaxHealth(tileType) {
    const healthMap = {
        [TILES.WALL]: 150, // Buffed health since broken walls are gone
        [TILES.TOWER]: 200,
        [TILES.CANNON]: 250,
        [TILES.HOUSE]: 500, // House is bigger and tougher
        [TILES.FARM]: 100,
        [TILES.CAMPFIRE]: 80,
        [TILES.SPIKES]: 120
    };

    return healthMap[tileType] || 100;
}

function getBuilding(wx, wy) {
    return buildingMap.get(`${Math.floor(wx)},${Math.floor(wy)}`);
}

// ============= COLLISION DETECTION =============
function isSolid(tile) {
    if (tile === undefined || tile === null) return false;

    // Natural obstacles
    if (tile === TILES.TREE) return true;
    if (tile === TILES.STONE) return true;
    if (tile === TILES.IRON) return true;
    if (tile === TILES.BUSH) return true;
    if (tile === TILES.CACTUS) return true;
    if (tile === TILES.DEAD_TREE) return true;
    if (tile === TILES.MUSHROOM) return true;
    if (tile === TILES.ICE_BLOCK) return true;
    if (tile === TILES.OBSIDIAN) return true;
    if (tile === TILES.WATER) return true;
    if (tile === TILES.MURKY_WATER) return true;
    if (tile === TILES.LAVA) return true;
    if (tile === TILES.MURKY_WATER) return true;
    if (tile === TILES.LAVA) return true;

    // Buildings that block
    if (tile === TILES.WALL) return true;
    if (tile === TILES.HOUSE) return true;
    if (tile === TILES.HOUSE_BASE) return true;
    if (tile === TILES.TOWER) return true;
    if (tile === TILES.CANNON) return true;

    // NOT solid: GRASS, FLOOR, CAMPFIRE, FARM, WORKBENCH, CHEST, BED, SPIKES
    return false;
}

function isPassable(tile) {
    // Inverse of solid, but with more nuance
    if (tile === undefined || tile === null) return true;

    const impassableTiles = [
        TILES.TREE,
        TILES.STONE,
        TILES.IRON,
        TILES.BUSH,
        TILES.CACTUS,
        TILES.DEAD_TREE,
        TILES.MUSHROOM,
        TILES.ICE_BLOCK,
        TILES.OBSIDIAN,
        TILES.WALL,
        TILES.WATER,
        TILES.MURKY_WATER,
        TILES.LAVA,
        TILES.HOUSE,
        TILES.HOUSE_BASE,
        TILES.TOWER,
        TILES.CANNON
    ];

    return !impassableTiles.includes(tile);
}

function isDamaging(tile) {
    return tile === TILES.SPIKES || tile === TILES.WATER || tile === TILES.MURKY_WATER || tile === TILES.LAVA;
}

function isHarvestable(tile) {
    const harvestableTiles = [
        TILES.TREE,
        TILES.STONE,
        TILES.IRON,
        TILES.BUSH,
        TILES.CACTUS,
        TILES.DEAD_TREE,
        TILES.MUSHROOM,
        TILES.ICE_BLOCK,
        TILES.OBSIDIAN
    ];

    return harvestableTiles.includes(tile);
}

function isSolidAt(x, y, entityRadius = 0.25) {
    // Validate inputs
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(entityRadius)) {
        return false;
    }

    entityRadius = Math.max(0, Math.min(entityRadius, 0.5)); // Clamp radius

    // Check tiles in a small area around the entity
    const checkRadius = Math.ceil(entityRadius + 0.5);
    const tileX = Math.floor(x);
    const tileY = Math.floor(y);

    for (let dy = -checkRadius; dy <= checkRadius; dy++) {
        for (let dx = -checkRadius; dx <= checkRadius; dx++) {
            const tx = tileX + dx;
            const ty = tileY + dy;
            const tile = getTile(tx, ty);

            if (!isSolid(tile)) continue;

            // Get collision properties for this tile type
            const tileCollision = getTileCollision(tile);

            // Calculate tile center
            const tileCenterX = tx + 0.5;
            const tileCenterY = ty + 0.5;

            // Circle vs Circle collision (entity vs tile's collision circle)
            const distX = x - tileCenterX;
            const distY = y - tileCenterY;
            const distSq = distX * distX + distY * distY;
            const combinedRadius = entityRadius + tileCollision.radius;

            if (distSq < combinedRadius * combinedRadius) {
                return true;
            }
        }
    }

    return false;
}

// Get collision properties for different tile types
function getTileCollision(tile) {
    switch (tile) {
        // Natural obstacles - use circular collision matching visual
        case TILES.TREE:
            return { radius: 0.35 }; // Tree trunk is ~35% of tile
        case TILES.BUSH:
            return { radius: 0.30 }; // Bushes are small
        case TILES.STONE:
            return { radius: 0.40 }; // Stone is a bit wider
        case TILES.IRON:
            return { radius: 0.38 };

        // Buildings - full tile blocking
        case TILES.WALL:
            return { radius: 0.5 }; // Full tile block
        case TILES.HOUSE:
        case TILES.HOUSE_BASE:
            return { radius: 0.5 }; // Full tile block for larger house
        case TILES.TOWER:
        case TILES.CANNON:
            return { radius: 0.45 };

        // Water - full tile (can't swim)
        case TILES.WATER:
            return { radius: 0.5 };

        // Default for any other solid
        default:
            return { radius: 0.45 };
    }
}

function isPassableAt(x, y, radius = 0.3) {
    return !isSolidAt(x, y, radius);
}

function getCollidingTile(x, y, entityRadius = 0.25) {
    // Returns the first solid tile colliding with entity, or null
    const tileX = Math.floor(x);
    const tileY = Math.floor(y);

    // Check nearby tiles
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const tx = tileX + dx;
            const ty = tileY + dy;
            const tile = getTile(tx, ty);

            if (!isSolid(tile)) continue;

            const tileCollision = getTileCollision(tile);
            const tileCenterX = tx + 0.5;
            const tileCenterY = ty + 0.5;

            const distX = x - tileCenterX;
            const distY = y - tileCenterY;
            const distSq = distX * distX + distY * distY;
            const combinedRadius = entityRadius + tileCollision.radius;

            if (distSq < combinedRadius * combinedRadius) {
                return {
                    tile,
                    x: tx,
                    y: ty
                };
            }
        }
    }

    return null;
}

// ============= STARTING BASE GENERATION =============
function generateStartingBase() {
    // Use seeded random for deterministic base generation
    const baseRandom = (x, y) => {
        if (typeof seededRandom === 'function') {
            return seededRandom(x + 1000, y + 1000);
        }
        // Fallback deterministic random
        const seed = (x * 374761393 + y * 668265263) % 2147483647;
        return ((seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    };

    // Clear expanded area around base (grass for natural look)
    for (let y = -8; y <= 8; y++) {
        for (let x = -8; x <= 8; x++) {
            setTile(x, y, TILES.GRASS);
        }
    }

    // Floor inside base - larger 5x5 floor area for movement
    for (let y = -4; y <= 4; y++) {
        for (let x = -4; x <= 4; x++) {
            setTile(x, y, TILES.FLOOR);
        }
    }

    // Outer wall ring at distance 5, with wide 2-tile gate openings
    for (let i = -5; i <= 5; i++) {
        // North wall (y = -5)
        if (i !== 0 && i !== -1) { // 2-tile gap at center
            setTile(i, -5, TILES.WALL);
        }

        // South wall (y = 5)
        if (i !== 0 && i !== 1) {
            setTile(i, 5, TILES.WALL);
        }

        // West wall (x = -5)
        if (i !== 0 && i !== -1 && i > -5 && i < 5) {
            setTile(-5, i, TILES.WALL);
        }

        // East wall (x = 5)
        if (i !== 0 && i !== 1 && i > -5 && i < 5) {
            setTile(5, i, TILES.WALL);
        }
    }

    // Corner walls
    setTile(-5, -5, TILES.WALL);
    setTile(5, -5, TILES.WALL);
    setTile(-5, 5, TILES.WALL);
    setTile(5, 5, TILES.WALL);

    // House in northwest corner (2x2)
    setTile(-4, -4, TILES.HOUSE);
    setTile(-3, -4, TILES.HOUSE_BASE);
    setTile(-4, -3, TILES.HOUSE_BASE);
    setTile(-3, -3, TILES.HOUSE_BASE);

    // Chest in northeast area
    setTile(3, -3, TILES.CHEST);
    initializeStartingChest(3, -3);

    // Campfire in south-center (not directly on spawn)
    setTile(0, 3, TILES.CAMPFIRE);

    // Workbench in southeast
    setTile(3, 3, TILES.WORKBENCH);

    // Some bushes outside walls for resources
    setTile(-6, -3, TILES.BUSH);
    setTile(-6, 3, TILES.BUSH);
    setTile(6, -3, TILES.BUSH);
    setTile(6, 3, TILES.BUSH);

    // Nearby trees outside the walls
    setTile(-7, -6, TILES.TREE);
    setTile(7, -6, TILES.TREE);
    setTile(-7, 6, TILES.TREE);
    setTile(7, 6, TILES.TREE);

    // Stone deposits outside
    setTile(-7, 0, TILES.STONE);
    setTile(7, 0, TILES.STONE);
}

function initializeStartingChest(x, y) {
    // Hook for chest content initialization
    if (typeof chests !== 'undefined' && Array.isArray(chests)) {
        const existingChest = chests.find(c => c.x === x && c.y === y);
        if (!existingChest) {
            chests.push({
                x: x,
                y: y,
                contents: {
                    food: 10,
                    wood: 20,
                    stone: 10,
                    iron: 5
                },
                opened: false
            });
        }
    }
}

// ============= UTILITY FUNCTIONS =============
function getVisibleChunks(viewX, viewY, viewWidth, viewHeight, tileSize) {
    const chunks = [];

    const startCX = Math.floor((viewX - viewWidth / 2) / CHUNK_SIZE_LOCAL / tileSize) - 1;
    const endCX = Math.floor((viewX + viewWidth / 2) / CHUNK_SIZE_LOCAL / tileSize) + 1;
    const startCY = Math.floor((viewY - viewHeight / 2) / CHUNK_SIZE_LOCAL / tileSize) - 1;
    const endCY = Math.floor((viewY + viewHeight / 2) / CHUNK_SIZE_LOCAL / tileSize) + 1;

    for (let cy = startCY; cy <= endCY; cy++) {
        for (let cx = startCX; cx <= endCX; cx++) {
            chunks.push({ cx, cy, key: getChunkKey(cx, cy) });
        }
    }

    return chunks;
}

function getTilesInRadius(centerX, centerY, radius) {
    const tiles = [];
    const minX = Math.floor(centerX - radius);
    const maxX = Math.floor(centerX + radius);
    const minY = Math.floor(centerY - radius);
    const maxY = Math.floor(centerY + radius);
    const radiusSq = radius * radius;

    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            const dx = x + 0.5 - centerX;
            const dy = y + 0.5 - centerY;

            if (dx * dx + dy * dy <= radiusSq) {
                tiles.push({
                    x,
                    y,
                    tile: getTile(x, y),
                    distance: Math.sqrt(dx * dx + dy * dy)
                });
            }
        }
    }

    return tiles;
}

function findNearestTile(centerX, centerY, tileType, maxRadius = 20) {
    let nearest = null;
    let nearestDistSq = maxRadius * maxRadius;

    const tiles = getTilesInRadius(centerX, centerY, maxRadius);

    for (const t of tiles) {
        if (t.tile === tileType) {
            const distSq = t.distance * t.distance;
            if (distSq < nearestDistSq) {
                nearestDistSq = distSq;
                nearest = t;
            }
        }
    }

    return nearest;
}

function countTilesInRadius(centerX, centerY, radius, tileType) {
    const tiles = getTilesInRadius(centerX, centerY, radius);
    return tiles.filter(t => t.tile === tileType).length;
}

// ============= DEBUG UTILITIES =============
function getChunkStats() {
    return {
        totalChunks: chunks.size,
        modifiedChunks: modifiedChunks.size,
        totalBuildings: buildings.length,
        buildingMapSize: buildingMap.size
    };
}

function debugDrawChunkBoundaries(ctx, cameraX, cameraY, tileSize) {
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 2;

    for (const [key] of chunks) {
        const { cx, cy } = parseChunkKey(key);
        const screenX = (cx * CHUNK_SIZE_LOCAL - cameraX) * tileSize;
        const screenY = (cy * CHUNK_SIZE_LOCAL - cameraY) * tileSize;
        const size = CHUNK_SIZE_LOCAL * tileSize;

        ctx.strokeRect(screenX, screenY, size, size);

        // Draw chunk coordinates
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.font = '12px monospace';
        ctx.fillText(`${cx},${cy}`, screenX + 4, screenY + 14);
    }
}
