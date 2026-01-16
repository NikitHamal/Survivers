// ============= ENHANCED RENDERING =============

// Color palettes (Pokemon GBC inspired)
const PALETTE = {
    // Grass colors
    grass1: '#3d8c40',
    grass2: '#4aa84d',
    grass3: '#2d6e30',
    grassDark: '#1d4e20',

    // Earth/dirt
    dirt1: '#8b6914',
    dirt2: '#a67c00',
    dirt3: '#6b4f0f',

    // Water
    water1: '#3890d8',
    water2: '#5cb0f8',
    water3: '#2070b0',
    waterDeep: '#185890',

    // Wood
    wood1: '#6b4423',
    wood2: '#8b5a2b',
    wood3: '#4a2f17',

    // Stone
    stone1: '#808080',
    stone2: '#a0a0a0',
    stone3: '#606060',
    stoneDark: '#404040',

    // Foliage
    leaf1: '#228b22',
    leaf2: '#32a852',
    leaf3: '#145214',

    // Skin tones
    skin1: '#ffd4a8',
    skin2: '#e8b888',
    skinShadow: '#c89868',

    // Zombie
    zombie1: '#5a8a5a',
    zombie2: '#4a6a4a',
    zombie3: '#3a5a3a',
    zombieEye: '#ff2222',

    // UI
    outline: '#1a1a2e',
    white: '#f8f8f8',
    black: '#0a0a0a'
};

let lastAlpha = 1;
let pixelTime = 0;

function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Pixel-perfect drawing helpers
function drawPixelRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
}

function drawPixelCircle(cx, cy, r, color) {
    ctx.fillStyle = color;
    const x0 = Math.floor(cx);
    const y0 = Math.floor(cy);
    const ri = Math.floor(r);

    for (let dy = -ri; dy <= ri; dy++) {
        for (let dx = -ri; dx <= ri; dx++) {
            if (dx * dx + dy * dy <= ri * ri) {
                ctx.fillRect(x0 + dx, y0 + dy, 1, 1);
            }
        }
    }
}

// Dithering pattern for retro gradients
function drawDitheredRect(x, y, w, h, color1, color2, pattern = 'checker') {
    ctx.fillStyle = color1;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color2;

    for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
            let draw = false;
            if (pattern === 'checker') {
                draw = (px + py) % 2 === 0;
            } else if (pattern === 'horizontal') {
                draw = py % 2 === 0;
            } else if (pattern === 'vertical') {
                draw = px % 2 === 0;
            } else if (pattern === 'sparse') {
                draw = (px + py) % 4 === 0;
            }
            if (draw) {
                ctx.fillRect(x + px, y + py, 1, 1);
            }
        }
    }
}

// Outline drawing for that classic Pokemon look
function drawOutlinedRect(x, y, w, h, fillColor, outlineColor = PALETTE.outline) {
    ctx.fillStyle = outlineColor;
    ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, w, h);
}

function render(alpha = 1) {
    lastAlpha = alpha;
    pixelTime += 0.016;

    // Sky/ground base color
    ctx.fillStyle = '#1a2a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const renderPX = lerp(player.prevX ?? player.x, player.x, alpha);
    const renderPY = lerp(player.prevY ?? player.y, player.y, alpha);

    // Apply screen shake
    const shakeX = (Math.random() - 0.5) * camera.shake;
    const shakeY = (Math.random() - 0.5) * camera.shake;
    const camX = camera.x + shakeX;
    const camY = camera.y + shakeY;

    // Visible tile range
    const startTileX = Math.floor(camX / SCALE / TILE_SIZE) - 1;
    const startTileY = Math.floor(camY / SCALE / TILE_SIZE) - 1;
    const endTileX = startTileX + Math.ceil(canvas.width / SCALE / TILE_SIZE) + 3;
    const endTileY = startTileY + Math.ceil(canvas.height / SCALE / TILE_SIZE) + 3;

    // Render ground layer first
    for (let y = startTileY; y <= endTileY; y++) {
        for (let x = startTileX; x <= endTileX; x++) {
            const tile = getTile(x, y);
            const sx = x * TILE_SIZE * SCALE - camX;
            const sy = y * TILE_SIZE * SCALE - camY;
            renderGroundLayer(tile, sx, sy, x, y);
        }
    }

    // Render objects layer
    for (let y = startTileY; y <= endTileY; y++) {
        for (let x = startTileX; x <= endTileX; x++) {
            const tile = getTile(x, y);
            const sx = x * TILE_SIZE * SCALE - camX;
            const sy = y * TILE_SIZE * SCALE - camY;
            renderObjectLayer(tile, sx, sy, x, y);
        }
    }

    // Collect all entities for Y-sorting
    const entities = [];

    survivors.forEach(s => {
        const rx = lerp(s.prevX ?? s.x, s.x, alpha);
        const ry = lerp(s.prevY ?? s.y, s.y, alpha);
        entities.push({ type: 'survivor', data: s, x: rx, y: ry, sortY: ry });
    });

    zombies.forEach(z => {
        const rx = lerp(z.prevX ?? z.x, z.x, alpha);
        const ry = lerp(z.prevY ?? z.y, z.y, alpha);
        entities.push({ type: 'zombie', data: z, x: rx, y: ry, sortY: ry });
    });

    entities.sort((a, b) => a.sortY - b.sortY);

    // Render entity shadows first
    entities.forEach(e => {
        const s = TILE_SIZE * SCALE;
        const sx = (e.x - 0.5) * s - camX;
        const sy = (e.y - 0.5) * s - camY;
        renderEntityShadow(ctx, sx + s / 2, sy + s * 0.9, s * 0.35);
    });

    // Render entities
    entities.forEach(e => {
        if (e.type === 'survivor') {
            if (e.data.isPlayer) {
                renderPlayerEnhanced(e.x, e.y, camX, camY);
            } else {
                renderSurvivorEnhanced(e.data, e.x, e.y, camX, camY);
            }
        } else if (e.type === 'zombie') {
            renderZombieEnhanced(e.data, e.x, e.y, camX, camY);
        }
    });

    // Render projectiles with trail effect
    projectiles.forEach(p => {
        renderProjectile(p, camX, camY);
    });

    // Render particles
    renderParticles(ctx, camX, camY);

    // Render damage numbers
    renderDamageNumbers(ctx, camX, camY);

    // Build preview
    if (buildMode && selectedBuilding) {
        renderBuildPreview(camX, camY);
    }

    // Render move target marker
    renderMoveTargetEnhanced(camX, camY);

    // Debug collision
    if (window.debugCollision) {
        renderDebugCollision(camX, camY);
    }

    // Darkness / Lighting System (Re-enabled as requested)
    renderDarkness(ctx, camX, camY, alpha);

    // Weather Visuals
    if (typeof WeatherSystem !== 'undefined') {
        WeatherSystem.drawWeatherEffects(ctx);
    }

    // System World UI (Markers, Boss Bars, Horde Status)
    if (typeof EventSystem !== 'undefined') {
        EventSystem.drawEventMarkers(ctx);
    }

    if (typeof BossSystem !== 'undefined') {
        BossSystem.drawBossUI(ctx);
    }

    if (typeof HordeSystem !== 'undefined') {
        HordeSystem.drawHordeUI(ctx);
    }

    // Phase 1 New Systems Rendering
    if (typeof PetSystem !== 'undefined') {
        PetSystem.renderPets(ctx);
    }
    if (typeof ShelterSystem !== 'undefined') {
        ShelterSystem.renderShelters(ctx);
    }
    if (typeof FarmingSystem !== 'undefined') {
        FarmingSystem.renderFarming(ctx);
    }
    if (typeof CookingSystem !== 'undefined') {
        CookingSystem.renderCooking(ctx);
    }

    // Post-processing effects
    renderPostProcessing();

    // Minimap
    renderMinimap();

    // Debug info
    let debugText = `X: ${player.x.toFixed(2)} Y: ${player.y.toFixed(2)}`;
    if (window.debugCollision) {
        const tile = getTile(Math.floor(player.x), Math.floor(player.y));
        debugText += ` | Tile: ${tile} | Solid: ${isSolid(tile)}`;
    }
    const coordsEl = document.getElementById('coordsDisplay');
    if (coordsEl) coordsEl.textContent = debugText;
}

function renderEntityShadow(x, y, w, h) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(Math.floor(x), Math.floor(y), w, h, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dithered edge for pixel look
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dx = Math.cos(angle) * w * 1.1;
        const dy = Math.sin(angle) * h * 1.3;
        ctx.fillRect(Math.floor(x + dx), Math.floor(y + dy), 2, 2);
    }
}

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

function renderWall(x, y, s, wx, wy) {
    // Outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x - 1, y - 1, s + 2, s + 2);

    // Main wall with variation
    const pattern = seededRandom(wx, wy);
    const wallBase = pattern > 0.5 ? PALETTE.stone1 : '#707070';
    ctx.fillStyle = wallBase;
    ctx.fillRect(x, y, s, s);

    // Grid lines (synced with world)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(x, y, s, 1);
    ctx.fillRect(x, y, 1, s);

    // Subtle stone texture
    ctx.fillStyle = PALETTE.stone2;
    ctx.fillRect(x + 3, y + 3, s - 8, 2);
    ctx.fillRect(x + 3, y + s - 5, s - 6, 1);
}



function renderCampfire(x, y, s) {
    // 1. Base Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s / 2 + s * 0.1, s * 0.45, s * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Stone ring (More detailed dark edges)
    ctx.fillStyle = '#1a1a1a';
    for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const dist = s * 0.35;
        const stoneX = x + s / 2 + Math.cos(angle) * dist - 5;
        const stoneY = y + s / 2 + Math.sin(angle) * dist - 4;
        ctx.fillRect(stoneX, stoneY, 10, 8);
    }

    ctx.fillStyle = '#4a4a4a';
    for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const dist = s * 0.32;
        const stoneX = x + s / 2 + Math.cos(angle) * dist - 4;
        const stoneY = y + s / 2 + Math.sin(angle) * dist - 3;
        ctx.fillRect(stoneX, stoneY, 8, 6);
    }

    // 3. Fire glow (Atmospheric)
    const flickerPulse = Math.sin(pixelTime * 8) * 0.1 + 0.9;
    const glowSize = s * 0.6 * flickerPulse;
    const g = ctx.createRadialGradient(x + s / 2, y + s / 2, 0, x + s / 2, y + s / 2, glowSize);
    g.addColorStop(0, 'rgba(255, 120, 0, 0.5)');
    g.addColorStop(0.4, 'rgba(255, 60, 0, 0.2)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x + s / 2, y + s / 2, glowSize, 0, Math.PI * 2);
    ctx.fill();

    // 4. Animated Logs (Ccrossed)
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(x + s * 0.3, y + s * 0.5, s * 0.4, s * 0.15); // Horiz log
    ctx.save();
    ctx.translate(x + s / 2, y + s / 2);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-s * 0.2, -s * 0.05, s * 0.4, s * 0.1);
    ctx.restore();

    // 5. Triple-Layer Flame Animation
    const f1 = Math.sin(pixelTime * 15) * 3;
    const f2 = Math.cos(pixelTime * 11 + 1) * 2;

    // Outer Hot Flame (Red/Orange)
    ctx.fillStyle = '#ff3300';
    drawFlame(ctx, x + s / 2, y + s * 0.7, s * 0.25, s * 0.5 + f1, f2);

    // Core Flame (Orange/Yellow)
    ctx.fillStyle = '#ff9900';
    drawFlame(ctx, x + s / 2, y + s * 0.65, s * 0.18, s * 0.4 + f2, f1 * 0.5);

    // Bright Heart (Yellow/White)
    ctx.fillStyle = '#ffff66';
    drawFlame(ctx, x + s / 2, y + s * 0.6, s * 0.12, s * 0.25 + f1 * 0.3, 0);

    // 6. High-intensity core
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6 + Math.sin(pixelTime * 20) * 0.2;
    ctx.fillRect(x + s * 0.45, y + s * 0.52, s * 0.1, s * 0.1);
    ctx.globalAlpha = 1;

    // Sparks (Moving upwards with curves)
    for (let i = 0; i < 4; i++) {
        const p = (pixelTime * 2.5 + i * 1.3) % 4;
        const sx = x + s * 0.5 + Math.sin(pixelTime * 4 + i) * s * 0.12;
        const sy = y + s * 0.4 - p * s * 0.2;
        if (p < 2) {
            ctx.fillStyle = i % 2 === 0 ? '#ffaa00' : '#ffdd00';
            ctx.fillRect(sx, sy, 2, 2);
        }
    }
}

// Flame Helper
function drawFlame(ctx, cx, bottomY, width, height, offset) {
    ctx.beginPath();
    ctx.moveTo(cx - width, bottomY);
    ctx.bezierCurveTo(cx - width, bottomY - height * 0.4, cx - width * 0.5 + offset, bottomY - height * 0.7, cx, bottomY - height);
    ctx.bezierCurveTo(cx + width * 0.5 + offset, bottomY - height * 0.7, cx + width, bottomY - height * 0.4, cx + width, bottomY);
    ctx.closePath();
    ctx.fill();
}

function renderHouse(x, y, s) {
    const s2 = s * 2; // 2x2 size

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + 8, y + s2 * 0.3 + 8, s2, s2 * 0.7);

    // Outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x - 2, y + s2 * 0.25, s2 + 4, s2 * 0.75 + 2);

    // Main building
    ctx.fillStyle = '#8a7a6a';
    ctx.fillRect(x, y + s2 * 0.28, s2, s2 * 0.72);

    // Wall detail (plank look)
    ctx.fillStyle = '#9a8a7a';
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(x + 4, y + s2 * 0.35 + (i * s2 * 0.12), s2 - 8, 2);
    }

    // Roof outline
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.moveTo(x - 10, y + s2 * 0.32);
    ctx.lineTo(x + s2 / 2, y - 8);
    ctx.lineTo(x + s2 + 10, y + s2 * 0.32);
    ctx.closePath();
    ctx.fill();

    // Roof
    ctx.fillStyle = '#6a3a2a';
    ctx.beginPath();
    ctx.moveTo(x - 6, y + s2 * 0.3);
    ctx.lineTo(x + s2 / 2, y);
    ctx.lineTo(x + s2 + 6, y + s2 * 0.3);
    ctx.closePath();
    ctx.fill();

    // Door with outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s2 * 0.4, y + s2 * 0.55, s2 * 0.25, s2 * 0.45);
    ctx.fillStyle = '#3a2815';
    ctx.fillRect(x + s2 * 0.42, y + s2 * 0.57, s2 * 0.21, s2 * 0.43);

    // Windows
    const winSize = s2 * 0.2;
    [x + s2 * 0.1, x + s2 * 0.7].forEach(wx => {
        ctx.fillStyle = PALETTE.outline;
        ctx.fillRect(wx - 2, y + s2 * 0.35 - 2, winSize + 4, winSize + 4);
        ctx.fillStyle = '#88ccee';
        ctx.fillRect(wx, y + s2 * 0.35, winSize, winSize);
        // Window frame
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(wx + winSize / 2 - 1, y + s2 * 0.35, 2, winSize);
        ctx.fillRect(wx, y + s2 * 0.35 + winSize / 2 - 1, winSize, 2);
    });
}

function renderFarm(x, y, s) {
    // Tilled soil
    ctx.fillStyle = PALETTE.dirt3;
    ctx.fillRect(x, y, s, s);

    // Soil rows
    ctx.fillStyle = PALETTE.dirt1;
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(x + s * 0.1, y + s * (0.1 + i * 0.3), s * 0.8, s * 0.15);
    }

    // Crops with animation
    const cropSway = Math.sin(pixelTime * 2) * 1;
    ctx.fillStyle = PALETTE.leaf1;

    for (let i = 0; i < 3; i++) {
        const cropHeight = 0.35 + Math.sin(pixelTime + i * 0.5) * 0.03;
        const baseY = y + s * (0.1 + i * 0.3) + s * 0.08;

        // Multiple crop sprites per row
        for (let j = 0; j < 4; j++) {
            const cropX = x + s * 0.15 + j * s * 0.2 + cropSway * (j % 2 === 0 ? 1 : -1);
            ctx.fillRect(cropX, baseY - s * cropHeight * 0.5, 2, s * cropHeight * 0.5);
            ctx.fillRect(cropX - 2, baseY - s * cropHeight * 0.4, 6, 2);
            ctx.fillRect(cropX - 1, baseY - s * cropHeight * 0.55, 4, 2);
        }
    }
}

function renderTower(x, y, s) {
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x + s * 0.18 + 4, y + s * 0.15 + 4, s * 0.68, s * 0.87);

    // Outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.12, y + s * 0.08, s * 0.76, s * 0.94);

    // Main tower body
    ctx.fillStyle = '#6a6a7a';
    ctx.fillRect(x + s * 0.15, y + s * 0.12, s * 0.7, s * 0.88);

    // Stone texture
    ctx.fillStyle = '#7a7a8a';
    for (let row = 0; row < 4; row++) {
        const offsetX = row % 2 === 0 ? 0 : s * 0.15;
        for (let col = 0; col < 3; col++) {
            ctx.fillRect(
                x + s * 0.18 + offsetX + col * s * 0.22,
                y + s * (0.15 + row * 0.2),
                s * 0.18,
                s * 0.15
            );
        }
    }

    // Arrow slit
    ctx.fillStyle = PALETTE.stoneDark;
    ctx.fillRect(x + s * 0.45, y + s * 0.4, s * 0.1, s * 0.25);
    ctx.fillStyle = '#222';
    ctx.fillRect(x + s * 0.47, y + s * 0.42, s * 0.06, s * 0.21);

    // Battlements
    ctx.fillStyle = '#8a8a9a';
    const battleWidth = s * 0.18;
    ctx.fillRect(x + s * 0.08, y, battleWidth, s * 0.15);
    ctx.fillRect(x + s * 0.41, y - 2, battleWidth, s * 0.17);
    ctx.fillRect(x + s * 0.74, y, battleWidth, s * 0.15);

    // Battlement outlines
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.08 - 1, y - 1, battleWidth + 2, 2);
    ctx.fillRect(x + s * 0.41 - 1, y - 3, battleWidth + 2, 2);
    ctx.fillRect(x + s * 0.74 - 1, y - 1, battleWidth + 2, 2);
}

function renderCannon(x, y, s) {
    // Platform
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.1, y + s * 0.55, s * 0.8, s * 0.47);
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(x + s * 0.12, y + s * 0.58, s * 0.76, s * 0.4);

    // Wheels
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.arc(x + s * 0.25, y + s * 0.8, s * 0.12, 0, Math.PI * 2);
    ctx.arc(x + s * 0.75, y + s * 0.8, s * 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4a3a2a';
    ctx.beginPath();
    ctx.arc(x + s * 0.25, y + s * 0.8, s * 0.1, 0, Math.PI * 2);
    ctx.arc(x + s * 0.75, y + s * 0.8, s * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Cannon barrel outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.25, y + s * 0.22, s * 0.5, s * 0.4);

    // Cannon barrel
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x + s * 0.28, y + s * 0.25, s * 0.44, s * 0.35);

    // Barrel highlight
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(x + s * 0.3, y + s * 0.28, s * 0.4, s * 0.1);

    // Muzzle
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x + s * 0.38, y + s * 0.12, s * 0.24, s * 0.18);
    ctx.fillStyle = '#222';
    ctx.fillRect(x + s * 0.42, y + s * 0.08, s * 0.16, s * 0.12);
}

function renderWorkbench(x, y, s) {
    // Legs
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.12, y + s * 0.5, s * 0.12, s * 0.52);
    ctx.fillRect(x + s * 0.76, y + s * 0.5, s * 0.12, s * 0.52);

    ctx.fillStyle = PALETTE.wood3;
    ctx.fillRect(x + s * 0.15, y + s * 0.52, s * 0.08, s * 0.48);
    ctx.fillRect(x + s * 0.78, y + s * 0.52, s * 0.08, s * 0.48);

    // Table top outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.02, y + s * 0.28, s * 0.96, s * 0.22);

    // Table top
    ctx.fillStyle = PALETTE.wood2;
    ctx.fillRect(x + s * 0.05, y + s * 0.3, s * 0.9, s * 0.18);

    // Wood grain
    ctx.fillStyle = PALETTE.wood1;
    ctx.fillRect(x + s * 0.1, y + s * 0.35, s * 0.3, 2);
    ctx.fillRect(x + s * 0.55, y + s * 0.38, s * 0.25, 2);

    // Tools on table
    // Hammer
    ctx.fillStyle = '#777';
    ctx.fillRect(x + s * 0.18, y + s * 0.12, s * 0.08, s * 0.22);
    ctx.fillStyle = PALETTE.wood3;
    ctx.fillRect(x + s * 0.2, y + s * 0.22, s * 0.04, s * 0.15);

    // Saw
    ctx.fillStyle = '#999';
    ctx.fillRect(x + s * 0.58, y + s * 0.08, s * 0.22, s * 0.06);
    ctx.fillStyle = PALETTE.wood3;
    ctx.fillRect(x + s * 0.75, y + s * 0.06, s * 0.1, s * 0.22);

    // Sawteeth
    ctx.fillStyle = '#aaa';
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + s * (0.6 + i * 0.05), y + s * 0.14, 2, 3);
    }
}

function renderChest(x, y, s) {
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + s * 0.18 + 2, y + s * 0.42 + 2, s * 0.68, s * 0.52);

    // Outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.12, y + s * 0.32, s * 0.76, s * 0.62);

    // Chest body
    ctx.fillStyle = '#7a5030';
    ctx.fillRect(x + s * 0.15, y + s * 0.42, s * 0.7, s * 0.5);

    // Chest lid
    ctx.fillStyle = '#8a6040';
    ctx.fillRect(x + s * 0.15, y + s * 0.35, s * 0.7, s * 0.15);

    // Lid curve highlight
    ctx.fillStyle = '#9a7050';
    ctx.fillRect(x + s * 0.18, y + s * 0.37, s * 0.64, s * 0.05);

    // Metal bands
    ctx.fillStyle = '#666';
    ctx.fillRect(x + s * 0.15, y + s * 0.48, s * 0.7, 3);
    ctx.fillRect(x + s * 0.15, y + s * 0.75, s * 0.7, 3);

    // Lock
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.42, y + s * 0.52, s * 0.18, s * 0.16);
    ctx.fillStyle = '#bb9944';
    ctx.fillRect(x + s * 0.44, y + s * 0.54, s * 0.14, s * 0.12);

    // Keyhole
    ctx.fillStyle = '#333';
    ctx.fillRect(x + s * 0.49, y + s * 0.57, s * 0.04, s * 0.06);
}

function renderBed(x, y, s) {
    // Frame outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.05, y + s * 0.48, s * 0.9, s * 0.54);

    // Bed frame
    ctx.fillStyle = PALETTE.wood3;
    ctx.fillRect(x + s * 0.08, y + s * 0.52, s * 0.84, s * 0.48);

    // Mattress
    ctx.fillStyle = '#aa5555';
    ctx.fillRect(x + s * 0.12, y + s * 0.4, s * 0.76, s * 0.38);

    // Blanket detail
    ctx.fillStyle = '#bb6666';
    ctx.fillRect(x + s * 0.15, y + s * 0.45, s * 0.7, s * 0.15);

    // Pillow
    ctx.fillStyle = '#eeeeee';
    ctx.fillRect(x + s * 0.14, y + s * 0.38, s * 0.28, s * 0.18);

    // Pillow shading
    ctx.fillStyle = '#dddddd';
    ctx.fillRect(x + s * 0.14, y + s * 0.5, s * 0.28, s * 0.06);

    // Headboard
    ctx.fillStyle = PALETTE.wood2;
    ctx.fillRect(x + s * 0.08, y + s * 0.28, s * 0.4, s * 0.15);
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.06, y + s * 0.26, s * 0.44, 3);
}

function renderSpikes(x, y, s) {
    // Base
    ctx.fillStyle = PALETTE.wood3;
    ctx.fillRect(x, y, s, s);

    // Wooden frame
    ctx.fillStyle = PALETTE.wood2;
    ctx.fillRect(x + 2, y + 2, s - 4, s - 4);

    // Spikes
    ctx.fillStyle = '#888';
    const spikePositions = [
        [0.2, 0.2], [0.5, 0.2], [0.8, 0.2],
        [0.35, 0.5], [0.65, 0.5],
        [0.2, 0.8], [0.5, 0.8], [0.8, 0.8]
    ];

    spikePositions.forEach(([px, py]) => {
        const sx = x + s * px;
        const sy = y + s * py;

        // Spike outline
        ctx.fillStyle = PALETTE.outline;
        ctx.beginPath();
        ctx.moveTo(sx - s * 0.08, sy + s * 0.08);
        ctx.lineTo(sx, sy - s * 0.12);
        ctx.lineTo(sx + s * 0.08, sy + s * 0.08);
        ctx.closePath();
        ctx.fill();

        // Spike body
        ctx.fillStyle = '#aaa';
        ctx.beginPath();
        ctx.moveTo(sx - s * 0.06, sy + s * 0.06);
        ctx.lineTo(sx, sy - s * 0.1);
        ctx.lineTo(sx + s * 0.06, sy + s * 0.06);
        ctx.closePath();
        ctx.fill();

        // Spike highlight
        ctx.fillStyle = '#ccc';
        ctx.fillRect(sx - 1, sy - s * 0.05, 2, s * 0.08);
    });
}

function renderPlayerEnhanced(renderX, renderY, camX, camY) {
    const s = TILE_SIZE * SCALE;
    const sx = (renderX - 0.5) * s - camX;
    // Grounding: (renderY - 0.6) instead of -0.9 to bring the feet to the shadow
    const sy = (renderY - 0.6) * s - camY;

    // Hit flash
    if (player.hitTimer > 0) {
        ctx.globalAlpha = 0.5 + Math.sin(player.hitTimer * 30) * 0.3;
    }

    // 2. Dust Puff (if moving)
    if (player.isMoving && Math.random() < 0.1) {
        spawnParticles(player.x, player.y + 0.3, 'dust', 1, 'dust', { speed: 0.5, size: 1.5 });
    }

    const bobY = player.isMoving ? Math.sin(player.animTimer * 2) * 2 : 0;
    const armSwing = player.isMoving ? Math.sin(player.animTimer * 2) * s * 0.08 : 0;
    const legSwing = player.isMoving ? Math.sin(player.animTimer * 2) * s * 0.06 : 0;

    // Directional offsets for eyes/face
    let faceOffX = 0;
    if (player.direction === 0) faceOffX = s * 0.1; // Facing Right
    if (player.direction === 2) faceOffX = -s * 0.1; // Facing Left

    // ======= BODY =======
    // Body outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.26, sy + s * 0.38 + bobY, s * 0.48, s * 0.44);

    // Body
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(sx + s * 0.28, sy + s * 0.4 + bobY, s * 0.44, s * 0.4);

    // Shirt detail
    ctx.fillStyle = '#5599ff';
    ctx.fillRect(sx + s * 0.32 + faceOffX * 0.5, sy + s * 0.45 + bobY, s * 0.36, s * 0.12);

    // ======= ARMS =======
    // Left arm outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.15, sy + s * 0.4 + bobY + armSwing, s * 0.16, s * 0.28);
    // Left arm
    ctx.fillStyle = PALETTE.skin1;
    ctx.fillRect(sx + s * 0.17, sy + s * 0.42 + bobY + armSwing, s * 0.12, s * 0.24);

    // Right arm outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.69, sy + s * 0.4 + bobY - armSwing, s * 0.16, s * 0.28);
    // Right arm
    ctx.fillStyle = PALETTE.skin1;
    ctx.fillRect(sx + s * 0.71, sy + s * 0.42 + bobY - armSwing, s * 0.12, s * 0.24);

    // ======= HEAD =======
    // Head outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.30, sy + s * 0.15 + bobY, s * 0.40, s * 0.32);

    // Head
    ctx.fillStyle = PALETTE.skin1;
    ctx.fillRect(sx + s * 0.32, sy + s * 0.18 + bobY, s * 0.36, s * 0.28);

    // ======= HAIR =======
    // Hair outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.28, sy + s * 0.08 + bobY, s * 0.44, s * 0.18);

    // Hair
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(sx + s * 0.30, sy + s * 0.1 + bobY, s * 0.40, s * 0.14);

    // ======= EYES =======
    if (player.direction !== 3) { // Not facing away (Up)
        ctx.fillStyle = '#222';
        if (player.direction === 0 || player.direction === 2) {
            // Facing Left or Right - render one eye shifted
            const eyeX = player.direction === 0 ? sx + s * 0.54 : sx + s * 0.4;
            ctx.fillRect(eyeX, sy + s * 0.26 + bobY, s * 0.06, s * 0.08);
        } else {
            // Facing Down - render both eyes
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(sx + s * 0.36, sy + s * 0.26 + bobY, s * 0.1, s * 0.08);
            ctx.fillRect(sx + s * 0.54, sy + s * 0.26 + bobY, s * 0.1, s * 0.08);
            ctx.fillStyle = '#222';
            ctx.fillRect(sx + s * 0.39, sy + s * 0.27 + bobY, s * 0.05, s * 0.06);
            ctx.fillRect(sx + s * 0.56, sy + s * 0.27 + bobY, s * 0.05, s * 0.06);
        }
    }

    // ======= LEGS =======
    // Left leg outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.30, sy + s * 0.76 + legSwing, s * 0.17, s * 0.22);
    // Left leg
    ctx.fillStyle = '#3355aa';
    ctx.fillRect(sx + s * 0.32, sy + s * 0.78 + legSwing, s * 0.13, s * 0.18);

    // Right leg outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.53, sy + s * 0.76 - legSwing, s * 0.17, s * 0.22);
    // Right leg
    ctx.fillStyle = '#3355aa';
    ctx.fillRect(sx + s * 0.55, sy + s * 0.78 - legSwing, s * 0.13, s * 0.18);

    ctx.globalAlpha = 1;
}

function renderSurvivorEnhanced(survivor, renderX, renderY, camX, camY) {
    const s = TILE_SIZE * SCALE;
    const sx = (renderX - 0.5) * s - camX;
    const sy = (renderY - 0.6) * s - camY;

    if (sx < -s || sx > canvas.width + s || sy < -s || sy > canvas.height + s) return;

    // Role badge colors
    const colors = {
        'Soldier': { main: '#aa4444', light: '#cc5555' },
        'Guard': { main: '#6666aa', light: '#8888cc' },
        'Builder': { main: '#aa8844', light: '#ccaa66' },
        'Farmer': { main: '#44aa44', light: '#66cc66' },
        'Woodcutter': { main: '#8a5a2a', light: '#aa7a4a' },
        'Miner': { main: '#666666', light: '#888888' },
        'Hunter': { main: '#668844', light: '#88aa66' },
        'Medic': { main: '#aa88cc', light: '#ccaaee' },
        'None': { main: '#888888', light: '#aaaaaa' },
        'Leader': { main: '#aaaaaa', light: '#ffffff' }
    };

    const skinColor = survivor.skinColor || '#ddb088';
    const hairColor = survivor.hairColor || '#5a4030';
    const clColors = colors[survivor.role] || colors['None'];
    const clothingColor = survivor.clothingColor || clColors.main;
    const isFemale = survivor.gender === 'female';

    // Animation states
    const isMoving = !!survivor.isMoving; // Use explicit movement flag
    const isWorking = survivor.state === 'WORKING';
    const animTimer = survivor.animTimer || 0;

    let bobY = 0;
    let armSwing = 0;
    let legSwing = 0;
    let toolAngle = 0;

    if (isMoving) {
        bobY = Math.sin(animTimer * 12) * 1.5;
        armSwing = Math.sin(animTimer * 12) * s * 0.1;
        legSwing = Math.sin(animTimer * 12) * s * 0.12;
    } else if (isWorking) {
        bobY = Math.sin(animTimer * 15) * 1;
        armSwing = Math.sin(animTimer * 15) * s * 0.15;
        toolAngle = Math.sin(animTimer * 15) * 0.5;
    }

    // ======= SHADOW =======
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(sx + s * 0.5, sy + s * 0.9, s * 0.3, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // ======= LEGS & SHOES =======
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(sx + s * 0.30, sy + s * 0.88 + legSwing, s * 0.16, s * 0.08);
    ctx.fillRect(sx + s * 0.54, sy + s * 0.88 - legSwing, s * 0.16, s * 0.08);

    ctx.fillStyle = '#3355aa';
    ctx.fillRect(sx + s * 0.30, sy + s * 0.76 + legSwing, s * 0.16, s * 0.14);
    ctx.fillRect(sx + s * 0.54, sy + s * 0.76 - legSwing, s * 0.16, s * 0.14);

    // ======= BODY =======
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.26, sy + s * 0.38 + bobY, s * 0.48, s * 0.42);

    ctx.fillStyle = clothingColor;
    ctx.fillRect(sx + s * 0.28, sy + s * 0.40 + bobY, s * 0.44, s * 0.38);

    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(sx + s * 0.28, sy + s * 0.40 + bobY, s * 0.1, s * 0.38);
    ctx.fillRect(sx + s * 0.62, sy + s * 0.40 + bobY, s * 0.1, s * 0.38);
    ctx.fillRect(sx + s * 0.38, sy + s * 0.65 + bobY, s * 0.24, s * 0.13);

    // ======= ARMS =======
    const leftArmX = sx + s * 0.14;
    const rightArmX = sx + s * 0.72;
    const armY = sy + s * 0.42 + bobY;

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(leftArmX - 1, armY + armSwing - 1, s * 0.14, s * 0.24);
    ctx.fillStyle = skinColor;
    ctx.fillRect(leftArmX, armY + armSwing, s * 0.12, s * 0.22);

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(rightArmX - 1, armY - armSwing - 1, s * 0.14, s * 0.24);
    ctx.fillStyle = skinColor;
    ctx.fillRect(rightArmX, armY - armSwing, s * 0.12, s * 0.22);

    if (isWorking) {
        ctx.save();
        ctx.translate(rightArmX + s * 0.06, armY - armSwing + s * 0.15);
        ctx.rotate(toolAngle);
        if (survivor.role === 'Woodcutter') {
            ctx.fillStyle = '#835c39'; ctx.fillRect(0, -s * 0.2, 2, s * 0.45);
            ctx.fillStyle = '#aaa'; ctx.fillRect(-2, -s * 0.3, 8, 8);
        } else if (survivor.role === 'Miner') {
            ctx.fillStyle = '#555'; ctx.fillRect(0, -s * 0.2, 2, s * 0.45);
            ctx.fillStyle = '#888'; ctx.fillRect(-6, -s * 0.25, 14, 4);
        } else if (survivor.role === 'Farmer') {
            ctx.fillStyle = '#835c39'; ctx.fillRect(0, -s * 0.25, 2, s * 0.5);
            ctx.fillStyle = '#90ee90'; ctx.fillRect(-4, -s * 0.25, 10, 2);
        }
        ctx.restore();
    }

    // ======= HEAD & HAIR =======
    const headX = sx + s * 0.31;
    const headY = sy + s * 0.16 + bobY;

    // Directional face offset
    let faceOffX = 0;
    if (survivor.direction === 0) faceOffX = s * 0.08; // Right
    if (survivor.direction === 2) faceOffX = -s * 0.08; // Left

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(headX - 1, headY - 1, s * 0.38 + 2, s * 0.28 + 2);
    ctx.fillStyle = skinColor;
    ctx.fillRect(headX, headY, s * 0.38, s * 0.28);

    ctx.fillStyle = hairColor;
    if (isFemale) {
        ctx.fillRect(sx + s * 0.28, sy + s * 0.08 + bobY, s * 0.44, s * 0.12);
        ctx.fillRect(sx + s * 0.26, sy + s * 0.18 + bobY, s * 0.08, s * 0.3);
        ctx.fillRect(sx + s * 0.66, sy + s * 0.18 + bobY, s * 0.08, s * 0.3);
    } else {
        ctx.fillRect(sx + s * 0.28, sy + s * 0.08 + bobY, s * 0.44, s * 0.1);
    }

    // ======= EYES =======
    if (survivor.direction !== 3) { // Not Up
        ctx.fillStyle = '#fff';
        if (survivor.direction === 0 || survivor.direction === 2) {
            // Side eye
            const eyeX = survivor.direction === 0 ? sx + s * 0.54 : sx + s * 0.38;
            ctx.fillRect(eyeX, sy + s * 0.26 + bobY, s * 0.08, s * 0.06);
            ctx.fillStyle = '#222';
            const pupilX = survivor.direction === 0 ? sx + s * 0.57 : sx + s * 0.39;
            ctx.fillRect(pupilX, sy + s * 0.27 + bobY, s * 0.04, s * 0.04);
        } else {
            // Facing Down (Frontal)
            ctx.fillRect(sx + s * 0.38, sy + s * 0.26 + bobY, s * 0.08, s * 0.06);
            ctx.fillRect(sx + s * 0.54, sy + s * 0.26 + bobY, s * 0.08, s * 0.06);
            ctx.fillStyle = '#222';
            ctx.fillRect(sx + s * 0.40, sy + s * 0.27 + bobY, s * 0.04, s * 0.04);
            ctx.fillRect(sx + s * 0.56, sy + s * 0.27 + bobY, s * 0.04, s * 0.04);

            // Cheek blush
            ctx.fillStyle = 'rgba(255, 100, 100, 0.2)';
            ctx.fillRect(sx + s * 0.34, sy + s * 0.32 + bobY, s * 0.08, s * 0.04);
            ctx.fillRect(sx + s * 0.58, sy + s * 0.32 + bobY, s * 0.08, s * 0.04);
        }
    }

    // ======= STATS =======
    const barWidth = s * 0.7;
    const healthPercent = Math.max(0, (survivor.health || 0) / (survivor.maxHealth || 100));
    const hpColor = healthPercent > 0.5 ? '#4ade4a' : healthPercent > 0.25 ? '#facc15' : '#f87171';

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(sx + s * 0.15, sy - 12, barWidth, 5);
    ctx.fillStyle = hpColor;
    ctx.fillRect(sx + s * 0.15, sy - 12, barWidth * healthPercent, 5);

    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.arc(sx + s * 0.85, sy + s * 0.82, s * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = clColors.main;
    ctx.beginPath();
    ctx.arc(sx + s * 0.85, sy + s * 0.82, s * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.floor(s * 0.11)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(survivor.role ? survivor.role[0] : '?', sx + s * 0.85, sy + s * 0.82);
}

function renderZombieEnhanced(z, renderX, renderY, camX, camY) {
    const s = TILE_SIZE * SCALE;
    const sx = (renderX - 0.5) * s - camX;
    const sy = (renderY - 0.6) * s - camY;

    if (sx < -s * 2 || sx > canvas.width + s || sy < -s * 2 || sy > canvas.height + s) return;

    const bob = Math.sin(z.animTimer * 3) * 1.5;
    const shamble = Math.sin(z.animTimer * 2) * 2;
    const armReach = Math.sin(z.animTimer * 4) * s * 0.08;

    // 2. Glowing Red Eyes Glow (Atmospheric)
    if (isNight) {
        const eyeGlow = ctx.createRadialGradient(sx + s * 0.5, sy + s * 0.3, 0, sx + s * 0.5, sy + s * 0.3, s * 0.4);
        eyeGlow.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
        eyeGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = eyeGlow;
        ctx.fillRect(sx + s * 0.1, sy + s * 0.1, s * 0.8, s * 0.6);
    }

    // ======= BODY =======
    // Body outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.20, sy + s * 0.33 + bob, s * 0.60, s * 0.50);

    // Body
    ctx.fillStyle = PALETTE.zombie2;
    ctx.fillRect(sx + s * 0.22, sy + s * 0.35 + bob, s * 0.56, s * 0.46);

    // ======= ARMS (reaching forward) =======
    // Left arm
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.02 + armReach, sy + s * 0.36 + bob, s * 0.22, s * 0.14);
    ctx.fillStyle = PALETTE.zombie1;
    ctx.fillRect(sx + s * 0.04 + armReach, sy + s * 0.38 + bob, s * 0.18, s * 0.10);

    // Right arm
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.76 - armReach, sy + s * 0.40 + bob, s * 0.22, s * 0.14);
    ctx.fillStyle = PALETTE.zombie1;
    ctx.fillRect(sx + s * 0.78 - armReach, sy + s * 0.42 + bob, s * 0.18, s * 0.10);

    // ======= HEAD =======
    // Head outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.26, sy + s * 0.10 + bob, s * 0.48, s * 0.32);

    // Head
    ctx.fillStyle = PALETTE.zombie1;
    ctx.fillRect(sx + s * 0.28, sy + s * 0.12 + bob, s * 0.44, s * 0.28);

    // ======= EYES (glowing red) =======
    ctx.fillStyle = PALETTE.zombieEye;
    ctx.fillRect(sx + s * 0.33, sy + s * 0.20 + bob, s * 0.12, s * 0.08);
    ctx.fillRect(sx + s * 0.55, sy + s * 0.20 + bob, s * 0.12, s * 0.08);

    // ======= LEGS =======
    // Left leg
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.28 + shamble * 0.5, sy + s * 0.78, s * 0.18, s * 0.22);
    ctx.fillStyle = PALETTE.zombie2;
    ctx.fillRect(sx + s * 0.30 + shamble * 0.5, sy + s * 0.80, s * 0.14, s * 0.18);

    // Right leg
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.54 - shamble * 0.5, sy + s * 0.78, s * 0.18, s * 0.22);
    ctx.fillStyle = PALETTE.zombie2;
    ctx.fillRect(sx + s * 0.56 - shamble * 0.5, sy + s * 0.80, s * 0.14, s * 0.18);

    // ======= HEALTH BAR =======
    if (z.health < z.maxHealth) {
        const barWidth = s * 0.8;
        const healthPercent = z.health / z.maxHealth;

        // Background
        ctx.fillStyle = PALETTE.outline;
        ctx.fillRect(sx + s * 0.1 - 1, sy - 6, barWidth + 2, 7);

        ctx.fillStyle = '#333';
        ctx.fillRect(sx + s * 0.1, sy - 5, barWidth, 5);

        // Health gradient
        const healthColor = healthPercent > 0.5 ? '#44dd44' : healthPercent > 0.25 ? '#dddd44' : '#dd4444';
        ctx.fillStyle = healthColor;
        ctx.fillRect(sx + s * 0.1, sy - 5, barWidth * healthPercent, 5);

        // Shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(sx + s * 0.1, sy - 5, barWidth * healthPercent, 2);
    }
}

function renderProjectile(p, camX, camY) {
    const sx = p.x * TILE_SIZE * SCALE - camX;
    const sy = p.y * TILE_SIZE * SCALE - camY;

    // Trail effect
    ctx.fillStyle = p.color + '44';
    for (let i = 1; i <= 3; i++) {
        const trailX = sx - p.vx * TILE_SIZE * SCALE * 0.1 * i;
        const trailY = sy - p.vy * TILE_SIZE * SCALE * 0.1 * i;
        ctx.beginPath();
        ctx.arc(trailX, trailY, p.size * SCALE * (1 - i * 0.2), 0, Math.PI * 2);
        ctx.fill();
    }

    // Outline
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.arc(sx, sy, p.size * SCALE + 1, 0, Math.PI * 2);
    ctx.fill();

    // Main projectile
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(sx, sy, p.size * SCALE, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    ctx.fillStyle = '#ffffff88';
    ctx.beginPath();
    ctx.arc(sx - p.size * SCALE * 0.3, sy - p.size * SCALE * 0.3, p.size * SCALE * 0.4, 0, Math.PI * 2);
    ctx.fill();
}

function renderBuildPreview(camX, camY) {
    const sx = buildPreviewX * TILE_SIZE * SCALE - camX;
    const sy = buildPreviewY * TILE_SIZE * SCALE - camY;
    const s = TILE_SIZE * SCALE;
    const canPlace = canBuild(buildPreviewX, buildPreviewY);

    // Pulsing effect
    const pulse = Math.sin(pixelTime * 6) * 0.1 + 0.9;

    const isHouse = selectedBuilding.tile === TILES.HOUSE;
    const size = isHouse ? s * 2 : s;

    ctx.globalAlpha = 0.6 * pulse;
    ctx.fillStyle = canPlace ? '#44ff44' : '#ff4444';
    ctx.fillRect(sx, sy, size, size);

    // Dithered edge
    ctx.globalAlpha = 0.3;
    const color = canPlace ? '#88ff88' : '#ff8888';
    ctx.fillStyle = color;
    for (let i = 0; i < size; i += 2) {
        ctx.fillRect(sx + i, sy, 1, 2);
        ctx.fillRect(sx + i, sy + size - 2, 1, 2);
        ctx.fillRect(sx, sy + i, 2, 1);
        ctx.fillRect(sx + size - 2, sy + i, 2, 1);
    }

    ctx.globalAlpha = 1;

    // Outline
    ctx.strokeStyle = canPlace ? '#22ff22' : '#ff2222';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx + 1, sy + 1, size - 2, size - 2);
}

function renderMoveTargetEnhanced(camX, camY) {
    if (!player.moveTarget) return;

    const sx = player.moveTarget.x * TILE_SIZE * SCALE - camX;
    const sy = player.moveTarget.y * TILE_SIZE * SCALE - camY;
    const s = TILE_SIZE * SCALE;

    // Pulsing effect
    const pulse = Math.sin(pixelTime * 8) * 0.2 + 0.8;
    const radius = s * 0.25 * pulse; // Smaller radius

    // Outer ring
    ctx.strokeStyle = '#44ff44';
    ctx.lineWidth = 2; // Thinner
    ctx.globalAlpha = 0.6 * pulse;
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Rotating markers (smaller)
    for (let i = 0; i < 4; i++) {
        const angle = pixelTime * 3 + (i * Math.PI / 2);
        const markerX = sx + Math.cos(angle) * radius * 1.2;
        const markerY = sy + Math.sin(angle) * radius * 1.2;

        ctx.fillStyle = '#88ff88';
        ctx.fillRect(markerX - 1.5, markerY - 1.5, 3, 3);
    }

    // Center dot (smaller)
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sx - 1.5, sy - 1.5, 3, 3);

    ctx.globalAlpha = 1;
}

// Post-processing effects (optional - can be toggled)
function renderPostProcessing() {
    // Vignette effect (Disabled)
    /*
    if (window.enableVignette !== false) {
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, canvas.height * 0.3,
            canvas.width / 2, canvas.height / 2, canvas.height * 0.8
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    */

    // Optional scanlines (set window.enableScanlines = true to enable)
    if (window.enableScanlines) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let y = 0; y < canvas.height; y += 3) {
            ctx.fillRect(0, y, canvas.width, 1);
        }
    }
}

// Helper function for seeded random (if not already defined)
function seededRandom(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
}

// Debug collision rendering (kept from original)
function renderDebugCollision(camX, camY) {
    const startX = Math.floor((camX) / TILE_SIZE / SCALE) - 1;
    const startY = Math.floor((camY) / TILE_SIZE / SCALE) - 1;
    const endX = startX + Math.ceil(canvas.width / TILE_SIZE / SCALE) + 2;
    const endY = startY + Math.ceil(canvas.height / TILE_SIZE / SCALE) + 2;

    for (let wy = startY; wy <= endY; wy++) {
        for (let wx = startX; wx <= endX; wx++) {
            const tile = getTile(wx, wy);
            if (!isSolid(tile)) continue;

            const collision = getTileCollision(tile);
            const sx = (wx + 0.5) * TILE_SIZE * SCALE - camX;
            const sy = (wy + 0.5) * TILE_SIZE * SCALE - camY;
            const radius = collision.radius * TILE_SIZE * SCALE;

            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(sx, sy, radius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#ff0000';
            ctx.font = '10px monospace';
            ctx.fillText(tile.toString(), sx - 5, sy + 3);
        }
    }

    const px = player.x * TILE_SIZE * SCALE - camX;
    const py = player.y * TILE_SIZE * SCALE - camY;
    ctx.strokeStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(px, py, 0.25 * TILE_SIZE * SCALE, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 1;
}

function renderEntityShadow(ctx, cx, cy, radius) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius, radius * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
}