// ============= ENVIRONMENT SPRITES =============

function renderGroundLayer(tile, sx, sy, wx, wy) {
    const s = TILE_SIZE * SCALE;
    const px = Math.floor(sx);
    const py = Math.floor(sy);

    // Determine ground type
    let useFloorBackground = false;
    const structures = [
        TILES.HOUSE, TILES.CHEST, TILES.WORKBENCH, TILES.BED,
        TILES.TOWER, TILES.CANNON, TILES.SPIKES, TILES.WALL,
        TILES.WALL_BROKEN, TILES.CAMPFIRE
    ];

    if (structures.includes(tile) || tile === TILES.FLOOR) {
        useFloorBackground = true;
    }

    if (useFloorBackground) {
        // Wooden floor with planks
        renderWoodenFloor(px, py, s, wx, wy);
    } else if (tile === TILES.WATER) {
        renderWater(px, py, s, wx, wy);
    } else {
        // Enhanced grass with Biome support
        if (typeof BiomeSystem !== 'undefined') {
            const biomeColor = BiomeSystem.getTileColor(tile, wx, wy);
            ctx.fillStyle = biomeColor;
            ctx.fillRect(px, py, s, s);

            // Add biome-specific patterns
            const pattern = seededRandom(wx, wy);
            if (pattern > 0.7) {
                ctx.fillStyle = 'rgba(0,0,0,0.1)';
                ctx.fillRect(px + s * 0.2, py + s * 0.2, s * 0.6, s * 0.6);
            }
        } else {
            renderGrass(px, py, s, wx, wy, tile);
        }
    }
}

function renderGrass(x, y, s, wx, wy, tile) {
    // Base grass with pattern variation
    const pattern = seededRandom(wx, wy);
    const grassBase = pattern > 0.5 ? PALETTE.grass1 : PALETTE.grass2;
    ctx.fillStyle = grassBase;
    ctx.fillRect(x, y, s, s);

    // Add grass texture patches
    if (pattern > 0.3) {
        ctx.fillStyle = PALETTE.grass3;
        const patchX = Math.floor(seededRandom(wx * 2, wy) * s * 0.6);
        const patchY = Math.floor(seededRandom(wx, wy * 2) * s * 0.6);
        ctx.fillRect(x + patchX, y + patchY, s * 0.3, s * 0.3);
    }

    // Small grass tufts (animated)
    if (tile === TILES.GRASS && seededRandom(wx * 3, wy * 3) > 0.6) {
        const windOffset = Math.sin(pixelTime * 2 + wx * 0.5) * 1;

        ctx.fillStyle = PALETTE.leaf2;
        // Tuft 1
        ctx.fillRect(x + s * 0.2 + windOffset, y + s * 0.65, 2, s * 0.2);
        ctx.fillRect(x + s * 0.25 + windOffset, y + s * 0.6, 2, s * 0.25);
        ctx.fillRect(x + s * 0.22 + windOffset, y + s * 0.7, 2, s * 0.15);

        // Tuft 2
        ctx.fillRect(x + s * 0.65 - windOffset, y + s * 0.55, 2, s * 0.25);
        ctx.fillRect(x + s * 0.7 - windOffset, y + s * 0.6, 2, s * 0.2);
    }

    // Occasional flowers
    if (seededRandom(wx * 7, wy * 11) > 0.92) {
        const fx = x + s * 0.3 + seededRandom(wx * 5, wy) * s * 0.4;
        const fy = y + s * 0.4 + seededRandom(wx, wy * 5) * s * 0.3;
        const flowerColors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff'];
        const flowerColor = flowerColors[Math.floor(seededRandom(wx * 13, wy * 17) * 4)];

        // Stem
        ctx.fillStyle = PALETTE.leaf1;
        ctx.fillRect(fx + 1, fy + 3, 2, 5);

        // Petals
        ctx.fillStyle = flowerColor;
        ctx.fillRect(fx, fy, 4, 4);
        ctx.fillStyle = '#ffff88';
        ctx.fillRect(fx + 1, fy + 1, 2, 2);
    }

    // Grid lines (subtle, like Pokemon)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(x, y, s, 1);
    ctx.fillRect(x, y, 1, s);
}

function renderWater(x, y, s, wx, wy) {
    // Animated water with waves
    const time = pixelTime * 2;
    const wavePhase = Math.sin(time + wx * 0.8 + wy * 0.6);

    // Deep water base
    ctx.fillStyle = wavePhase > 0 ? PALETTE.water1 : PALETTE.water3;
    ctx.fillRect(x, y, s, s);

    // Wave highlights
    ctx.fillStyle = PALETTE.water2;
    const waveY = Math.floor(s * 0.3 + wavePhase * 3);
    ctx.fillRect(x + s * 0.1, y + waveY, s * 0.3, 2);
    ctx.fillRect(x + s * 0.5, y + waveY + 4, s * 0.35, 2);

    // Sparkle
    if (Math.sin(time * 3 + wx * wy) > 0.8) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + s * 0.4, y + s * 0.4, 2, 2);
    }

    // Dark edges for depth
    ctx.fillStyle = PALETTE.waterDeep;
    ctx.fillRect(x, y, s, 2);
    ctx.fillRect(x, y, 2, s);
}

function renderWoodenFloor(x, y, s, wx, wy) {
    // Base wood color with variation for distinct tiles
    const pattern = seededRandom(wx, wy);
    const woodBase = pattern > 0.5 ? PALETTE.wood2 : '#7a4a2a';
    ctx.fillStyle = woodBase;
    ctx.fillRect(x, y, s, s);

    // Subtle grid lines (synced with world grass grid)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(x, y, s, 1);
    ctx.fillRect(x, y, 1, s);

    // Wood grain detail (horizontal planks look)
    ctx.fillStyle = PALETTE.wood3;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(x + 2, y + s * 0.3, s - 4, 1);
    ctx.fillRect(x + 2, y + s * 0.6, s - 4, 1);
    ctx.globalAlpha = 1.0;

    // Nail heads at corners
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + 2, y + 2, 2, 2);
    ctx.fillRect(x + s - 4, y + 2, 2, 2);
    ctx.fillRect(x + 2, y + s - 4, 2, 2);
    ctx.fillRect(x + s - 4, y + s - 4, 2, 2);
}

function renderObjectLayer(tile, sx, sy, wx, wy) {
    const s = TILE_SIZE * SCALE;
    const px = Math.floor(sx);
    const py = Math.floor(sy);

    switch (tile) {
        case TILES.TREE:
            renderTree(px, py, s, wx, wy);
            break;

        case TILES.BUSH:
            renderBush(px, py, s, wx, wy);
            break;

        case TILES.STONE:
            renderStone(px, py, s, wx, wy);
            break;

        case TILES.IRON:
            renderIronOre(px, py, s, wx, wy);
            break;

        case TILES.WALL:
            renderWall(px, py, s, wx, wy);
            break;

        case TILES.CAMPFIRE:
            renderCampfire(px, py, s);
            break;

        case TILES.HOUSE:
            renderHouse(px, py, s);
            break;

        case TILES.FARM:
            renderFarm(px, py, s);
            break;

        case TILES.TOWER:
            renderTower(px, py, s);
            break;

        case TILES.CANNON:
            renderCannon(px, py, s);
            break;

        case TILES.WORKBENCH:
            renderWorkbench(px, py, s);
            break;

        case TILES.CHEST:
            renderChest(px, py, s);
            break;

        case TILES.BED:
            renderBed(px, py, s);
            break;

        case TILES.SPIKES:
            renderSpikes(px, py, s);
            break;
    }
}

function renderTree(x, y, s, wx, wy) {
    // Tree shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(x + s / 2 + 3, y + s * 0.9, s * 0.35, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk with outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.35, y + s * 0.5, s * 0.3, s * 0.5);
    ctx.fillStyle = PALETTE.wood1;
    ctx.fillRect(x + s * 0.37, y + s * 0.52, s * 0.26, s * 0.46);

    // Trunk highlight
    ctx.fillStyle = PALETTE.wood2;
    ctx.fillRect(x + s * 0.4, y + s * 0.55, s * 0.08, s * 0.35);

    // Trunk bark detail
    ctx.fillStyle = PALETTE.wood3;
    ctx.fillRect(x + s * 0.55, y + s * 0.6, 2, s * 0.15);
    ctx.fillRect(x + s * 0.45, y + s * 0.75, 2, s * 0.12);

    // Leaves - multiple layers for depth
    // Wind animation
    const wind = Math.sin(pixelTime * 1.5 + wx * 0.3) * 2;

    // Back leaves (darker)
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.arc(x + s / 2 + wind * 0.5, y + s * 0.35, s * 0.42, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PALETTE.leaf3;
    ctx.beginPath();
    ctx.arc(x + s / 2 + wind * 0.5, y + s * 0.35, s * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Middle leaves
    ctx.fillStyle = PALETTE.leaf1;
    ctx.beginPath();
    ctx.arc(x + s / 2 + wind * 0.7, y + s * 0.28, s * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // Top leaves (lighter)
    ctx.fillStyle = PALETTE.leaf2;
    ctx.beginPath();
    ctx.arc(x + s / 2 + wind, y + s * 0.2, s * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Leaf highlights (pixel dots)
    ctx.fillStyle = '#4ade4a';
    const highlights = [[0.35, 0.25], [0.55, 0.18], [0.65, 0.32], [0.4, 0.4]];
    highlights.forEach(([hx, hy]) => {
        ctx.fillRect(x + s * hx + wind, y + s * hy, 2, 2);
    });
}

function renderBush(x, y, s, wx, wy) {
    const wind = Math.sin(pixelTime * 2 + wx) * 1;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s * 0.85, s * 0.35, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.arc(x + s / 2 + wind * 0.5, y + s * 0.55, s * 0.38, 0, Math.PI * 2);
    ctx.fill();

    // Main bush body
    ctx.fillStyle = PALETTE.leaf3;
    ctx.beginPath();
    ctx.arc(x + s / 2 + wind * 0.5, y + s * 0.55, s * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Highlight areas
    ctx.fillStyle = PALETTE.leaf1;
    ctx.beginPath();
    ctx.arc(x + s * 0.4 + wind, y + s * 0.48, s * 0.18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PALETTE.leaf2;
    ctx.beginPath();
    ctx.arc(x + s * 0.55 + wind, y + s * 0.45, s * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Berry details (occasional)
    if (seededRandom(wx * 5, wy * 7) > 0.7) {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + s * 0.35, y + s * 0.55, 3, 3);
        ctx.fillRect(x + s * 0.55, y + s * 0.6, 3, 3);
        ctx.fillRect(x + s * 0.48, y + s * 0.48, 3, 3);
    }
}

function renderStone(x, y, s, wx, wy) {
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + s / 2 + 2, y + s * 0.85, s * 0.38, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.moveTo(x + s * 0.12, y + s * 0.88);
    ctx.lineTo(x + s * 0.25, y + s * 0.22);
    ctx.lineTo(x + s * 0.72, y + s * 0.18);
    ctx.lineTo(x + s * 0.88, y + s * 0.82);
    ctx.closePath();
    ctx.fill();

    // Main stone body
    ctx.fillStyle = PALETTE.stone1;
    ctx.beginPath();
    ctx.moveTo(x + s * 0.15, y + s * 0.85);
    ctx.lineTo(x + s * 0.28, y + s * 0.25);
    ctx.lineTo(x + s * 0.7, y + s * 0.2);
    ctx.lineTo(x + s * 0.85, y + s * 0.8);
    ctx.closePath();
    ctx.fill();

    // Highlight
    ctx.fillStyle = PALETTE.stone2;
    ctx.beginPath();
    ctx.moveTo(x + s * 0.3, y + s * 0.3);
    ctx.lineTo(x + s * 0.4, y + s * 0.25);
    ctx.lineTo(x + s * 0.55, y + s * 0.35);
    ctx.lineTo(x + s * 0.45, y + s * 0.45);
    ctx.closePath();
    ctx.fill();

    // Cracks
    ctx.fillStyle = PALETTE.stoneDark;
    ctx.fillRect(x + s * 0.4, y + s * 0.5, 2, s * 0.2);
    ctx.fillRect(x + s * 0.55, y + s * 0.6, s * 0.15, 1);
}

function renderIronOre(x, y, s, wx, wy) {
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + s * 0.15 + 2, y + s * 0.35 + 2, s * 0.72, s * 0.55);

    // Outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.12, y + s * 0.27, s * 0.76, s * 0.61);

    // Stone base
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(x + s * 0.15, y + s * 0.3, s * 0.7, s * 0.55);

    // Iron veins
    ctx.fillStyle = '#8888aa';
    ctx.fillRect(x + s * 0.22, y + s * 0.38, s * 0.2, s * 0.18);
    ctx.fillRect(x + s * 0.52, y + s * 0.52, s * 0.22, s * 0.2);
    ctx.fillRect(x + s * 0.35, y + s * 0.62, s * 0.18, s * 0.15);

    // Shiny spots
    ctx.fillStyle = '#b0b0cc';
    ctx.fillRect(x + s * 0.25, y + s * 0.4, 3, 3);
    ctx.fillRect(x + s * 0.58, y + s * 0.55, 3, 3);

    // Sparkle animation
    if (Math.sin(pixelTime * 4 + wx * wy) > 0.7) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + s * 0.45, y + s * 0.45, 2, 2);
    }
}
