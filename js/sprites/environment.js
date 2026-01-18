// ============= ENVIRONMENT SPRITES =============

function renderGroundLayer(tile, sx, sy, wx, wy) {
    const s = TILE_SIZE * SCALE;
    const px = Math.floor(sx);
    const py = Math.floor(sy);

    // List of building/structure tiles that should have a transparent background
    const buildingTiles = [
        TILES.HOUSE, TILES.CHEST, TILES.WORKBENCH, TILES.BED,
        TILES.TOWER, TILES.CANNON, TILES.SPIKES, TILES.WALL,
        TILES.WALL_BROKEN, TILES.CAMPFIRE, TILES.FARM, TILES.HOUSE_BASE,
        // New buildings
        TILES.ARMORY, TILES.HOSPITAL, TILES.BREWERY, TILES.WELL,
        TILES.STABLE, TILES.MINE, TILES.BARRICADE, TILES.WATCHTOWER,
        TILES.STORAGE, TILES.ALTAR, TILES.FORGE, TILES.GARDEN
    ];

    // Check if there's a building here and get its stored background tile
    let effectiveTile = tile;
    if (buildingTiles.includes(tile)) {
        if (typeof getBuilding === 'function') {
            const b = getBuilding(wx, wy);
            if (b && b.bgTile !== undefined) {
                effectiveTile = b.bgTile;
            } else {
                effectiveTile = TILES.GRASS; // Fallback
            }
        } else {
            effectiveTile = TILES.GRASS; // Fallback
        }
    }

    if (effectiveTile === TILES.FLOOR) {
        renderWoodenFloor(px, py, s + 1, wx, wy);
    } else if (effectiveTile === TILES.WATER) {
        renderWater(px, py, s + 1, wx, wy);
    } else {
        // Render as grass (default for most ground)
        if (typeof BiomeSystem !== 'undefined') {
            const biomeColor = BiomeSystem.getTileColor(effectiveTile, wx, wy);
            ctx.fillStyle = biomeColor;
            ctx.fillRect(px, py, s + 1, s + 1);
            renderGrassTexture(px, py, s, wx, wy, 0.1);
        } else {
            renderGrass(px, py, s + 1, wx, wy, effectiveTile);
        }
    }
}

function renderGrass(x, y, s, wx, wy, tile) {
    // 1. Base Gradient (Subtle variation per tile)
    const noise = seededRandom(wx, wy);
    // varied greens
    const g1 = PALETTE.grass1 || '#4caf50';
    const g2 = PALETTE.grass2 || '#388e3c';

    ctx.fillStyle = noise > 0.5 ? g1 : g2;
    ctx.fillRect(x, y, s, s);

    // 2. Texture (Blades of grass)
    renderGrassTexture(x, y, s, wx, wy, 1.0);

    // 3. Flowers (Animated swaying)
    if (tile === TILES.GRASS && seededRandom(wx * 2, wy * 2) > 0.9) {
        const fx = x + s * 0.2 + seededRandom(wx, wy) * s * 0.6;
        const fy = y + s * 0.2 + seededRandom(wy, wx) * s * 0.6;
        const sway = Math.sin(pixelTime * 3 + wx) * 2;

        // Stem
        ctx.fillStyle = '#1b5e20';
        ctx.fillRect(fx + 1 + sway, fy + 4, 1, 4);

        // Petals
        const cols = ['#ffeb3b', '#f44336', '#e91e63', '#9c27b0'];
        const colIndex = Math.floor(seededRandom(wx * 3, wy * 3) * cols.length);
        ctx.fillStyle = cols[colIndex];
        ctx.fillRect(fx + sway, fy, 3, 3);
        ctx.fillStyle = '#fff';
        ctx.fillRect(fx + 1 + sway, fy + 1, 1, 1);
    }
}

function renderGrassTexture(x, y, s, wx, wy, density) {
    const count = Math.floor(3 * density);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; // Darker green/shadow

    for (let i = 0; i < count; i++) {
        // Deterministic positions based on world coordinates
        const ox = (seededRandom(wx + i, wy) * 0.8 + 0.1) * s;
        const oy = (seededRandom(wx, wy + i) * 0.8 + 0.1) * s;

        // Draw little "V" shapes
        ctx.fillRect(x + ox, y + oy, 1, 2);
        ctx.fillRect(x + ox + 2, y + oy, 1, 2);
        ctx.fillRect(x + ox + 1, y + oy + 2, 1, 1);
    }
}

function renderWater(x, y, s, wx, wy) {
    const time = pixelTime;

    // 1. Deep Water Base
    ctx.fillStyle = PALETTE.water1 || '#29b6f6';
    ctx.fillRect(x, y, s, s);

    // 2. Moving Waves (Sine wave patterns)
    ctx.fillStyle = PALETTE.water2 || '#4fc3f7'; // Lighter

    // Create varying wave offsets based on world position
    const offset1 = Math.sin(time * 2 + wx * 0.5) * (s * 0.2);
    const offset2 = Math.cos(time * 1.5 + wy * 0.5) * (s * 0.2);

    ctx.globalAlpha = 0.5;
    ctx.fillRect(x, y + s * 0.2 + offset1, s, s * 0.2);
    ctx.fillRect(x, y + s * 0.6 + offset2, s, s * 0.15);
    ctx.globalAlpha = 1.0;

    // 3. Sparkles/Glints (Randomly appearing)
    // We use time in the seed so they twinkle
    const twinkleSeed = Math.floor(time * 5) + wx + wy;
    if (Math.sin(twinkleSeed) > 0.95) {
        ctx.fillStyle = '#ffffff';
        const tx = x + (Math.sin(twinkleSeed * 123) * 0.5 + 0.5) * s;
        const ty = y + (Math.cos(twinkleSeed * 321) * 0.5 + 0.5) * s;
        ctx.fillRect(tx, ty, 2, 2);
    }

    // 4. Foam edge (Simple border logic)
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    if (wx % 2 === 0) ctx.fillRect(x, y, 2, s); // Just visual variety
}

function renderWoodenFloor(x, y, s, wx, wy) {
    // 1. Base Planks
    ctx.fillStyle = PALETTE.wood2 || '#8d6e63';
    ctx.fillRect(x, y, s, s);

    // 2. Plank Separation Lines
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    // Draw 3 horizontal planks per tile
    const plankH = s / 3;
    ctx.fillRect(x, y, s, 1);
    ctx.fillRect(x, y + plankH, s, 1);
    ctx.fillRect(x, y + plankH * 2, s, 1);

    // 3. Staggered Vertical Lines (The brick/plank pattern)
    // Offset every other row
    const rowOffset = (Math.floor(wy) % 2 === 0) ? 0 : s / 2;

    if (seededRandom(wx, wy) > 0.5) {
        ctx.fillRect(x + s / 2, y, 1, plankH);
        ctx.fillRect(x, y + plankH, 1, plankH);
    } else {
        ctx.fillRect(x + s * 0.3, y + plankH * 2, 1, plankH);
    }

    // 4. Nail Heads
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + plankH / 2, 1, 1);
    ctx.fillRect(x + s - 2, y + plankH * 1.5, 1, 1);
}

function renderObjectLayer(tile, sx, sy, wx, wy) {
    const s = TILE_SIZE * SCALE;
    const px = Math.floor(sx);
    const py = Math.floor(sy);

    // Get building level for upgradeable structures
    let level = 1;
    if (typeof BuildingUpgradeSystem !== 'undefined') {
        level = BuildingUpgradeSystem.getBuildingLevel(wx, wy);
    }

    // Pass specific context to helpers - buildings now receive level for visual upgrades
    switch (tile) {
        case TILES.TREE: renderTree(px, py, s, wx, wy); break;
        case TILES.BUSH: renderBush(px, py, s, wx, wy); break;
        case TILES.STONE: renderStone(px, py, s, wx, wy); break;
        case TILES.IRON: renderIronOre(px, py, s, wx, wy); break;
        // Buildings with 5 upgrade levels
        case TILES.WALL: renderWall(px, py, s, wx, wy, level); break;
        case TILES.CAMPFIRE: renderCampfire(px, py, s, wx, wy, level); break;
        case TILES.HOUSE: renderHouse(px, py, s, wx, wy, level); break;
        case TILES.FARM: renderFarm(px, py, s, wx, wy, level); break;
        case TILES.TOWER: renderTower(px, py, s, wx, wy, level); break;
        case TILES.CANNON: renderCannon(px, py, s, wx, wy, level); break;
        case TILES.WORKBENCH: renderWorkbench(px, py, s, wx, wy, level); break;
        case TILES.CHEST: renderChest(px, py, s, wx, wy, level); break;
        case TILES.BED: renderBed(px, py, s, wx, wy, level); break;
        case TILES.SPIKES: renderSpikes(px, py, s, wx, wy, level); break;
        // New buildings from buildings-extra.js
        case TILES.ARMORY: renderArmory(px, py, s, wx, wy, level); break;
        case TILES.HOSPITAL: renderHospital(px, py, s, wx, wy, level); break;
        case TILES.BREWERY: renderBrewery(px, py, s, wx, wy, level); break;
        case TILES.WELL: renderWellBuilding(px, py, s, wx, wy, level); break;
        case TILES.STABLE: renderStable(px, py, s, wx, wy, level); break;
        case TILES.MINE: renderMine(px, py, s, wx, wy, level); break;
        case TILES.BARRICADE: renderBarricade(px, py, s, wx, wy, level); break;
        case TILES.WATCHTOWER: renderWatchtower(px, py, s, wx, wy, level); break;
        case TILES.STORAGE: renderStorage(px, py, s, wx, wy, level); break;
        case TILES.ALTAR: renderAltar(px, py, s, wx, wy, level); break;
        case TILES.FORGE: renderForge(px, py, s, wx, wy, level); break;
        case TILES.GARDEN: renderGarden(px, py, s, wx, wy, level); break;
    }
}

function renderTree(x, y, s, wx, wy) {
    // Wind Effect
    const sway = Math.sin(pixelTime * 2 + wx) * 2;

    // 1. Shadow (Oval at base)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s - 2, s * 0.3, s * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Trunk
    const trunkW = s * 0.25;
    const trunkH = s * 0.4;
    const trunkX = x + s / 2 - trunkW / 2;
    const trunkY = y + s - trunkH - 4; // Moved up slightly

    ctx.fillStyle = '#5d4037'; // Dark Wood
    ctx.fillRect(trunkX + sway * 0.2, trunkY, trunkW, trunkH);

    // Bark texture
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(trunkX + 2 + sway * 0.2, trunkY + 4, 2, 8);
    ctx.fillRect(trunkX + trunkW - 4 + sway * 0.2, trunkY + 12, 2, 6);

    // 3. Leaves (Clustered Circles for fluffiness)
    const centerX = x + s / 2 + sway;
    const centerY = y + s * 0.35;
    const r = s * 0.35;

    // We draw 3 blobs: Top, Left-Bottom, Right-Bottom

    // Draw Outline/Dark Layer first
    ctx.fillStyle = '#1b5e20'; // Darkest Green
    drawBlob(ctx, centerX, centerY + 4, r + 2);
    drawBlob(ctx, centerX - r * 0.6, centerY + r * 0.6, r * 0.7 + 2);
    drawBlob(ctx, centerX + r * 0.6, centerY + r * 0.6, r * 0.7 + 2);

    // Draw Main Body
    ctx.fillStyle = PALETTE.leaf1 || '#2e7d32';
    drawBlob(ctx, centerX, centerY, r);
    drawBlob(ctx, centerX - r * 0.6, centerY + r * 0.5, r * 0.7);
    drawBlob(ctx, centerX + r * 0.6, centerY + r * 0.5, r * 0.7);

    // Highlights (Sunlight from top left)
    ctx.fillStyle = PALETTE.leaf2 || '#4caf50'; // Lighter
    drawBlob(ctx, centerX - r * 0.3, centerY - r * 0.3, r * 0.4);
    drawBlob(ctx, centerX - r * 0.8, centerY + r * 0.4, r * 0.3);
}

// Helper to draw rough circles
function drawBlob(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}

function renderBush(x, y, s, wx, wy) {
    const sway = Math.sin(pixelTime * 3 + wx * 2);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s - 4, s * 0.35, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Base Foliage (Irregular shape)
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.arc(x + s / 2 + sway, y + s * 0.6, s * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + s * 0.3 + sway, y + s * 0.75, s * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + s * 0.7 + sway, y + s * 0.75, s * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.arc(x + s / 2 + sway - 2, y + s * 0.55, s * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Berries (Red dots)
    if (seededRandom(wx, wy) > 0.4) {
        ctx.fillStyle = '#e53935'; // Red
        ctx.fillRect(x + s * 0.4 + sway, y + s * 0.6, 4, 4);
        ctx.fillRect(x + s * 0.6 + sway, y + s * 0.7, 4, 4);
        ctx.fillRect(x + s * 0.5 + sway, y + s * 0.8, 3, 3);
    }
}

function renderStone(x, y, s, wx, wy) {
    const cx = x + s / 2;
    const cy = y + s / 2 + 5;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.35, s * 0.4, s * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rock Shape (Grey)
    ctx.fillStyle = PALETTE.stone1 || '#757575';
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.3, cy + s * 0.3); // Bottom Left
    ctx.lineTo(cx - s * 0.35, cy - s * 0.1); // Mid Left
    ctx.lineTo(cx - s * 0.1, cy - s * 0.35); // Top Left
    ctx.lineTo(cx + s * 0.2, cy - s * 0.3); // Top Right
    ctx.lineTo(cx + s * 0.35, cy + s * 0.2); // Mid Right
    ctx.lineTo(cx + s * 0.1, cy + s * 0.35); // Bottom Right
    ctx.closePath();
    ctx.fill();

    // Highlight (Top edge)
    ctx.fillStyle = PALETTE.stone2 || '#9e9e9e';
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.25, cy - s * 0.1);
    ctx.lineTo(cx - s * 0.1, cy - s * 0.25);
    ctx.lineTo(cx + s * 0.15, cy - s * 0.2);
    ctx.lineTo(cx, cy);
    ctx.fill();

    // Moss (Bottom)
    if (seededRandom(wx, wy) > 0.3) {
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(cx - s * 0.2, cy + s * 0.2, 4, 4);
        ctx.fillRect(cx, cy + s * 0.25, 6, 4);
    }
}

function renderIronOre(x, y, s, wx, wy) {
    // 1. Base Rock (Darker than normal stone)
    const cx = x + s / 2;
    const cy = y + s / 2 + 5;

    ctx.fillStyle = 'rgba(0,0,0,0.3)'; // Shadow
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.35, s * 0.4, s * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#546e7a'; // Blue-grey rock
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.35, cy + s * 0.3);
    ctx.lineTo(cx - s * 0.2, cy - s * 0.3);
    ctx.lineTo(cx + s * 0.3, cy - s * 0.2);
    ctx.lineTo(cx + s * 0.35, cy + s * 0.25);
    ctx.closePath();
    ctx.fill();

    // 2. Iron Crystals (Protruding)
    const crystals = [
        { ox: -0.1, oy: -0.1, w: 0.15, h: 0.15 },
        { ox: 0.15, oy: 0.05, w: 0.12, h: 0.12 },
        { ox: -0.05, oy: 0.15, w: 0.1, h: 0.1 }
    ];

    // Crystal shine animation
    const shine = Math.abs(Math.sin(pixelTime * 3 + wx));

    crystals.forEach(c => {
        const px = cx + c.ox * s;
        const py = cy + c.oy * s;

        // Dark Base of crystal
        ctx.fillStyle = '#d7ccc8';
        ctx.fillRect(px, py, s * c.w, s * c.h);

        // Shiny Top
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + shine * 0.4})`;
        ctx.fillRect(px + 2, py + 2, s * c.w - 4, s * c.h - 4);
    });
}