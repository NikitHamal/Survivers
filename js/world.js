// ============= CHUNK SYSTEM =============
function getChunkKey(cx, cy) {
    return `${cx},${cy}`;
}

function getChunk(cx, cy) {
    const key = getChunkKey(cx, cy);
    if (!chunks.has(key)) {
        chunks.set(key, generateChunk(cx, cy));
    }
    return chunks.get(key);
}

function generateChunk(cx, cy) {
    const chunk = new Array(CHUNK_SIZE * CHUNK_SIZE).fill(TILES.GRASS);
    const worldX = cx * CHUNK_SIZE;
    const worldY = cy * CHUNK_SIZE;

    for (let y = 0; y < CHUNK_SIZE; y++) {
        for (let x = 0; x < CHUNK_SIZE; x++) {
            const wx = worldX + x;
            const wy = worldY + y;
            const idx = y * CHUNK_SIZE + x;

            // Skip base area
            if (wx >= -5 && wx <= 5 && wy >= -5 && wy <= 5) continue;

            const r = seededRandom(wx, wy);

            // Rivers using noise
            const riverNoise = noise2D(wx * 0.03, wy * 0.03);
            if (riverNoise > 0.65 && riverNoise < 0.72) {
                chunk[idx] = TILES.WATER;
                continue;
            }

            // Forest density varies with noise
            const forestDensity = noise2D(wx * 0.02 + 100, wy * 0.02 + 100);

            if (r < 0.25 * (0.5 + forestDensity)) {
                chunk[idx] = TILES.TREE;
            } else if (r < 0.32) {
                chunk[idx] = TILES.BUSH;
            } else if (r < 0.38) {
                chunk[idx] = TILES.STONE;
            } else if (r < 0.40 && seededRandom(wx + 500, wy + 500) > 0.6) {
                chunk[idx] = TILES.IRON;
            }
        }
    }

    return chunk;
}

function getTile(wx, wy) {
    wx = Math.floor(wx);
    wy = Math.floor(wy);
    const cx = Math.floor(wx / CHUNK_SIZE);
    const cy = Math.floor(wy / CHUNK_SIZE);
    const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const ly = ((wy % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const chunk = getChunk(cx, cy);
    return chunk[ly * CHUNK_SIZE + lx];
}

function setTile(wx, wy, tile) {
    wx = Math.floor(wx);
    wy = Math.floor(wy);
    const cx = Math.floor(wx / CHUNK_SIZE);
    const cy = Math.floor(wy / CHUNK_SIZE);
    const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const ly = ((wy % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const chunk = getChunk(cx, cy);
    chunk[ly * CHUNK_SIZE + lx] = tile;
}

function isSolid(tile) {
    return tile === TILES.TREE || tile === TILES.STONE || tile === TILES.IRON ||
        tile === TILES.WALL || tile === TILES.WATER || tile === TILES.HOUSE ||
        tile === TILES.TOWER || tile === TILES.CANNON;
}

function isSolidAt(x, y, radius = 0.3) {
    // Check corners of hitbox
    const checks = [
        [x - radius, y - radius],
        [x + radius, y - radius],
        [x - radius, y + radius],
        [x + radius, y + radius]
    ];

    for (const [cx, cy] of checks) {
        if (isSolid(getTile(cx, cy))) return true;
    }
    return false;
}

function generateStartingBase() {
    // Clear base area first
    for (let y = -6; y <= 6; y++) {
        for (let x = -6; x <= 6; x++) {
            setTile(x, y, TILES.GRASS);
        }
    }

    // Floor inside base
    for (let y = -3; y <= 3; y++) {
        for (let x = -3; x <= 3; x++) {
            setTile(x, y, TILES.FLOOR);
        }
    }

    // Walls around base (some broken)
    for (let i = -4; i <= 4; i++) {
        setTile(i, -4, Math.random() > 0.25 ? TILES.WALL : TILES.WALL_BROKEN);
        setTile(i, 4, Math.random() > 0.25 ? TILES.WALL : TILES.WALL_BROKEN);
        setTile(-4, i, Math.random() > 0.25 ? TILES.WALL : TILES.WALL_BROKEN);
        setTile(4, i, Math.random() > 0.25 ? TILES.WALL : TILES.WALL_BROKEN);
    }

    // House in corner
    setTile(-2, -2, TILES.HOUSE);

    // Campfire
    setTile(1, 1, TILES.CAMPFIRE);

    // Some trees inside
    setTile(2, -2, TILES.TREE);
    setTile(-2, 2, TILES.TREE);

    // Chest with starting supplies
    setTile(0, -2, TILES.CHEST);
}
