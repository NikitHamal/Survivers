// ============= RENDERING =============
let lastAlpha = 1;

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function render(alpha = 1) {
    lastAlpha = alpha;
    ctx.fillStyle = '#1a2a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Interpolated player position for camera and sorting
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

    // Render tiles
    for (let y = startTileY; y <= endTileY; y++) {
        for (let x = startTileX; x <= endTileX; x++) {
            const tile = getTile(x, y);
            const sx = x * TILE_SIZE * SCALE - camX;
            const sy = y * TILE_SIZE * SCALE - camY;
            renderTile(tile, sx, sy, x, y);
        }
    }

    // Collect all entities for Y-sorting
    const entities = [];

    // Add survivors
    survivors.forEach(s => {
        const rx = lerp(s.prevX ?? s.x, s.x, alpha);
        const ry = lerp(s.prevY ?? s.y, s.y, alpha);
        entities.push({ type: 'survivor', data: s, x: rx, y: ry, sortY: ry });
    });

    // Add zombies
    zombies.forEach(z => {
        const rx = lerp(z.prevX ?? z.x, z.x, alpha);
        const ry = lerp(z.prevY ?? z.y, z.y, alpha);
        entities.push({ type: 'zombie', data: z, x: rx, y: ry, sortY: ry });
    });

    // Sort by Y for proper layering
    entities.sort((a, b) => a.sortY - b.sortY);

    // Render entities
    entities.forEach(e => {
        if (e.type === 'survivor') {
            if (e.data.isPlayer) {
                renderPlayer(e.x, e.y, camX, camY);
            } else {
                renderSurvivor(e.data, e.x, e.y, camX, camY);
            }
        } else if (e.type === 'zombie') {
            renderZombie(e.data, e.x, e.y, camX, camY);
        }
    });

    // Render projectiles
    projectiles.forEach(p => {
        const sx = p.x * TILE_SIZE * SCALE - camera.x;
        const sy = p.y * TILE_SIZE * SCALE - camera.y;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * SCALE, 0, Math.PI * 2);
        ctx.fill();
    });

    // Render particles
    renderParticles(ctx, camX, camY);

    // Render damage numbers
    renderDamageNumbers(ctx, camX, camY);

    // Build preview
    if (buildMode && selectedBuilding) {
        const sx = buildPreviewX * TILE_SIZE * SCALE - camera.x;
        const sy = buildPreviewY * TILE_SIZE * SCALE - camera.y;
        const canPlace = canBuild(buildPreviewX, buildPreviewY);

        ctx.globalAlpha = 0.6;
        ctx.fillStyle = canPlace ? '#44ff44' : '#ff4444';
        ctx.fillRect(sx, sy, TILE_SIZE * SCALE, TILE_SIZE * SCALE);
        ctx.globalAlpha = 1;

        ctx.strokeStyle = canPlace ? '#22ff22' : '#ff2222';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, sy, TILE_SIZE * SCALE, TILE_SIZE * SCALE);
    }

    // Render move target marker
    renderMoveTarget(camX, camY);

    // Debug: Render collision circles (press F3 to toggle)
    if (window.debugCollision) {
        renderDebugCollision(camX, camY);
    }

    // Darkness / Lighting System
    renderDarkness(ctx, camX, camY, alpha);

    // Minimap
    renderMinimap();

    // Coords + debug info
    let debugText = `X: ${player.x.toFixed(2)} Y: ${player.y.toFixed(2)}`;
    if (window.debugCollision) {
        const tile = getTile(Math.floor(player.x), Math.floor(player.y));
        debugText += ` | Tile: ${tile} | Solid: ${isSolid(tile)}`;
    }
    document.getElementById('coordsDisplay').textContent = debugText;
}

// renderDarkness moved to effects.js

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

            // Show tile type
            ctx.fillStyle = '#ff0000';
            ctx.font = '10px monospace';
            ctx.fillText(tile.toString(), sx - 5, sy + 3);
        }
    }

    // Draw player collision circle
    const px = player.x * TILE_SIZE * SCALE - camX;
    const py = player.y * TILE_SIZE * SCALE - camY;
    ctx.strokeStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(px, py, 0.25 * TILE_SIZE * SCALE, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 1;
}

function renderMoveTarget(camX, camY) {
    if (!player.moveTarget) return;

    const sx = player.moveTarget.x * TILE_SIZE * SCALE - camX;
    const sy = player.moveTarget.y * TILE_SIZE * SCALE - camY;

    // Pulsing effect
    const pulse = Math.sin(Date.now() * 0.008) * 0.3 + 0.7;
    const radius = TILE_SIZE * SCALE * 0.4 * pulse;

    // Outer ring
    ctx.strokeStyle = '#44ff44';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.8 * pulse;
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner dot
    ctx.fillStyle = '#88ff88';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(sx, sy, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
}

function renderTile(tile, sx, sy, wx, wy) {
    const s = TILE_SIZE * SCALE;

    // Base grass with variation
    // Determine base background
    let useFloorBackground = false;

    // List of constructed tiles that should have a floor foundation
    const structures = [
        TILES.HOUSE,
        TILES.CHEST,
        TILES.WORKBENCH,
        TILES.BED,
        TILES.TOWER,
        TILES.CANNON,
        TILES.SPIKES,
        TILES.WALL,
        TILES.WALL_BROKEN,
        TILES.CAMPFIRE
    ];

    if (structures.includes(tile)) {
        useFloorBackground = true;
    } else if (tile === TILES.TREE) {
        // Special check for trees: if surrounded by floor, draw floor background
        // Check 4 neighbors
        let floorNeighbors = 0;
        const neighbors = [
            getTile(wx + 1, wy),
            getTile(wx - 1, wy),
            getTile(wx, wy + 1),
            getTile(wx, wy - 1)
        ];

        for (const t of neighbors) {
            if (t === TILES.FLOOR || structures.includes(t)) {
                floorNeighbors++;
            }
        }

        if (floorNeighbors >= 3) {
            useFloorBackground = true;
        }
    }

    if (useFloorBackground) {
        // Floor background
        ctx.fillStyle = '#6a5a4a';
        ctx.fillRect(sx, sy, s, s);
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(sx + s * 0.48, sy, s * 0.04, s);
        ctx.fillRect(sx, sy + s * 0.48, s, s * 0.04);
    } else {
        // Base grass with variation
        const grassShade = ((wx + wy) % 2 === 0) ? '#3a5a28' : '#3d5d2b';
        ctx.fillStyle = grassShade;
        ctx.fillRect(sx, sy, s, s);

        // Small grass detail (only if grass or valid natural tile)
        if (tile === TILES.GRASS && seededRandom(wx * 3, wy * 3) > 0.7) {
            ctx.fillStyle = '#4a6a38';
            ctx.fillRect(sx + s * 0.3, sy + s * 0.6, s * 0.1, s * 0.25);
            ctx.fillRect(sx + s * 0.6, sy + s * 0.5, s * 0.1, s * 0.3);
        }
    }

    switch (tile) {
        case TILES.TREE:
            // Trunk
            ctx.fillStyle = '#4a3a2a';
            ctx.fillRect(sx + s * 0.38, sy + s * 0.55, s * 0.24, s * 0.45);
            // Leaves layers
            ctx.fillStyle = '#1d4a0c';
            ctx.beginPath();
            ctx.arc(sx + s / 2, sy + s * 0.4, s * 0.42, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#2d5a1c';
            ctx.beginPath();
            ctx.arc(sx + s / 2, sy + s * 0.3, s * 0.32, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#3d6a2c';
            ctx.beginPath();
            ctx.arc(sx + s / 2, sy + s * 0.22, s * 0.22, 0, Math.PI * 2);
            ctx.fill();
            break;

        case TILES.BUSH:
            ctx.fillStyle = '#2a5a1a';
            ctx.beginPath();
            ctx.arc(sx + s / 2, sy + s * 0.6, s * 0.35, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#3a6a2a';
            ctx.beginPath();
            ctx.arc(sx + s * 0.4, sy + s * 0.55, s * 0.2, 0, Math.PI * 2);
            ctx.fill();
            break;

        case TILES.STONE:
            ctx.fillStyle = '#5a5a5a';
            ctx.beginPath();
            ctx.moveTo(sx + s * 0.15, sy + s * 0.85);
            ctx.lineTo(sx + s * 0.3, sy + s * 0.25);
            ctx.lineTo(sx + s * 0.7, sy + s * 0.2);
            ctx.lineTo(sx + s * 0.85, sy + s * 0.8);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#7a7a7a';
            ctx.fillRect(sx + s * 0.35, sy + s * 0.4, s * 0.25, s * 0.2);
            break;

        case TILES.IRON:
            ctx.fillStyle = '#4a4a5a';
            ctx.fillRect(sx + s * 0.15, sy + s * 0.3, s * 0.7, s * 0.55);
            ctx.fillStyle = '#6a6a8a';
            ctx.fillRect(sx + s * 0.25, sy + s * 0.4, s * 0.18, s * 0.18);
            ctx.fillRect(sx + s * 0.55, sy + s * 0.55, s * 0.18, s * 0.18);
            break;

        case TILES.WATER:
            ctx.fillStyle = '#2a5a8a';
            ctx.fillRect(sx, sy, s, s);
            // Animated waves
            ctx.fillStyle = '#4a7aaa';
            const wave = Math.sin(gameTime * 2 + wx * 0.5 + wy * 0.3) * 2;
            ctx.fillRect(sx + s * 0.1, sy + s * 0.3 + wave, s * 0.25, s * 0.08);
            ctx.fillRect(sx + s * 0.55, sy + s * 0.6 - wave, s * 0.3, s * 0.08);
            break;

        case TILES.WALL:
            // Wall uses floor background now, just draw wall detail
            ctx.fillStyle = '#5a4a3a';
            ctx.fillRect(sx, sy, s, s);
            ctx.fillStyle = '#6a5a4a';
            ctx.fillRect(sx + s * 0.05, sy + s * 0.05, s * 0.4, s * 0.4);
            ctx.fillRect(sx + s * 0.55, sy + s * 0.55, s * 0.4, s * 0.4);
            ctx.fillStyle = '#4a3a2a';
            ctx.fillRect(sx + s * 0.5, sy, s * 0.05, s);
            ctx.fillRect(sx, sy + s * 0.5, s, s * 0.05);
            break;

        case TILES.WALL_BROKEN:
            ctx.fillStyle = '#4a3a2a';
            ctx.fillRect(sx, sy + s * 0.4, s * 0.35, s * 0.6);
            ctx.fillRect(sx + s * 0.65, sy + s * 0.5, s * 0.35, s * 0.5);
            ctx.fillStyle = '#3a2a1a';
            ctx.fillRect(sx + s * 0.1, sy + s * 0.6, s * 0.15, s * 0.3);
            break;

        case TILES.FLOOR:
            ctx.fillStyle = '#6a5a4a';
            ctx.fillRect(sx, sy, s, s);
            ctx.fillStyle = '#5a4a3a';
            ctx.fillRect(sx + s * 0.48, sy, s * 0.04, s);
            ctx.fillRect(sx, sy + s * 0.48, s, s * 0.04);
            break;

        case TILES.CAMPFIRE:
            ctx.fillStyle = '#5a4a3a';
            ctx.fillRect(sx, sy, s, s);

            // Stones in a circle
            ctx.fillStyle = '#4a4a4a';
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const dist = s * 0.3;
                ctx.beginPath();
                ctx.arc(sx + s / 2 + Math.cos(angle) * dist, sy + s / 2 + Math.sin(angle) * dist, s * 0.08, 0, Math.PI * 2);
                ctx.fill();
            }

            // Glow effect (base)
            const glowSize = (Math.sin(gameTime * 8) * 0.1 + 1.0) * s * 0.4;
            const gradient = ctx.createRadialGradient(sx + s / 2, sy + s / 2, 0, sx + s / 2, sy + s / 2, glowSize);
            gradient.addColorStop(0, 'rgba(255, 150, 50, 0.4)');
            gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(sx + s / 2, sy + s / 2, glowSize, 0, Math.PI * 2);
            ctx.fill();

            // Fire layers
            const flicker = Math.sin(gameTime * 12) * 2 + Math.sin(gameTime * 19) * 1;

            // Outer flame
            ctx.fillStyle = '#ff4400';
            ctx.beginPath();
            ctx.moveTo(sx + s * 0.25, sy + s * 0.75);
            ctx.quadraticCurveTo(sx + s * 0.5, sy + s * 0.1 + flicker, sx + s * 0.75, sy + s * 0.75);
            ctx.fill();

            // Inner flame
            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.moveTo(sx + s * 0.35, sy + s * 0.7);
            ctx.quadraticCurveTo(sx + s * 0.5, sy + s * 0.3 + flicker * 0.7, sx + s * 0.65, sy + s * 0.7);
            ctx.fill();

            // Core
            ctx.fillStyle = '#fffFAA';
            ctx.beginPath();
            ctx.arc(sx + s / 2, sy + s * 0.55 + flicker * 0.2, s * 0.1, 0, Math.PI * 2);
            ctx.fill();

            // Floating sparks (simplified, just a few pixels)
            if (Math.random() < 0.1) {
                const sparkX = sx + s * (0.3 + Math.random() * 0.4);
                const sparkY = sy + s * (0.2 + Math.random() * 0.4);
                ctx.fillStyle = '#ffdd44';
                ctx.fillRect(sparkX, sparkY, 1, 1);
            }
            break;

        case TILES.HOUSE:
            ctx.fillStyle = '#7a6a5a';
            ctx.fillRect(sx, sy + s * 0.25, s, s * 0.75);
            // Roof
            ctx.fillStyle = '#5a3a2a';
            ctx.beginPath();
            ctx.moveTo(sx - s * 0.05, sy + s * 0.3);
            ctx.lineTo(sx + s / 2, sy);
            ctx.lineTo(sx + s * 1.05, sy + s * 0.3);
            ctx.closePath();
            ctx.fill();
            // Door
            ctx.fillStyle = '#4a3020';
            ctx.fillRect(sx + s * 0.38, sy + s * 0.55, s * 0.24, s * 0.45);
            // Window
            ctx.fillStyle = '#88bbdd';
            ctx.fillRect(sx + s * 0.1, sy + s * 0.4, s * 0.22, s * 0.22);
            ctx.fillStyle = '#5a3a2a';
            ctx.fillRect(sx + s * 0.2, sy + s * 0.4, s * 0.02, s * 0.22);
            ctx.fillRect(sx + s * 0.1, sy + s * 0.5, s * 0.22, s * 0.02);
            break;

        case TILES.FARM:
            ctx.fillStyle = '#5a4030';
            ctx.fillRect(sx, sy, s, s);
            ctx.fillStyle = '#4a6a2a';
            for (let i = 0; i < 3; i++) {
                const h = 0.4 + Math.sin(gameTime + i) * 0.05;
                ctx.fillRect(sx + s * 0.15 + i * s * 0.28, sy + s * (0.9 - h * 0.6), s * 0.12, s * h * 0.6);
            }
            break;

        case TILES.TOWER:
            ctx.fillStyle = '#5a5a6a';
            ctx.fillRect(sx + s * 0.15, sy + s * 0.1, s * 0.7, s * 0.9);
            ctx.fillStyle = '#4a4a5a';
            ctx.fillRect(sx + s * 0.25, sy + s * 0.2, s * 0.5, s * 0.25);
            // Battlements
            ctx.fillStyle = '#6a6a7a';
            ctx.fillRect(sx + s * 0.1, sy, s * 0.15, s * 0.15);
            ctx.fillRect(sx + s * 0.4, sy, s * 0.2, s * 0.15);
            ctx.fillRect(sx + s * 0.75, sy, s * 0.15, s * 0.15);
            break;

        case TILES.CANNON:
            ctx.fillStyle = '#4a4a4a';
            ctx.fillRect(sx + s * 0.15, sy + s * 0.5, s * 0.7, s * 0.45);
            ctx.fillStyle = '#3a3a3a';
            ctx.fillRect(sx + s * 0.3, sy + s * 0.2, s * 0.4, s * 0.5);
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(sx + s * 0.4, sy + s * 0.1, s * 0.2, s * 0.3);
            break;

        case TILES.WORKBENCH:
            ctx.fillStyle = '#6a5040';
            ctx.fillRect(sx + s * 0.1, sy + s * 0.4, s * 0.8, s * 0.55);
            ctx.fillStyle = '#8a6a4a';
            ctx.fillRect(sx + s * 0.05, sy + s * 0.3, s * 0.9, s * 0.15);
            // Tools
            ctx.fillStyle = '#888';
            ctx.fillRect(sx + s * 0.2, sy + s * 0.15, s * 0.08, s * 0.2);
            ctx.fillRect(sx + s * 0.6, sy + s * 0.1, s * 0.12, s * 0.25);
            break;

        case TILES.CHEST:
            ctx.fillStyle = '#6a4a2a';
            ctx.fillRect(sx + s * 0.15, sy + s * 0.4, s * 0.7, s * 0.5);
            ctx.fillStyle = '#8a5a3a';
            ctx.fillRect(sx + s * 0.15, sy + s * 0.35, s * 0.7, s * 0.15);
            ctx.fillStyle = '#aa8844';
            ctx.fillRect(sx + s * 0.42, sy + s * 0.5, s * 0.16, s * 0.12);
            break;

        case TILES.BED:
            ctx.fillStyle = '#5a4030';
            ctx.fillRect(sx + s * 0.1, sy + s * 0.5, s * 0.8, s * 0.45);
            ctx.fillStyle = '#aa5555';
            ctx.fillRect(sx + s * 0.15, sy + s * 0.4, s * 0.7, s * 0.35);
            ctx.fillStyle = '#dddddd';
            ctx.fillRect(sx + s * 0.15, sy + s * 0.4, s * 0.25, s * 0.2);
            break;

        case TILES.SPIKES:
            ctx.fillStyle = '#4a3a2a';
            ctx.fillRect(sx, sy, s, s);
            ctx.fillStyle = '#888';
            for (let i = 0; i < 4; i++) {
                const ox = (i % 2) * s * 0.4 + s * 0.2;
                const oy = Math.floor(i / 2) * s * 0.4 + s * 0.2;
                ctx.beginPath();
                ctx.moveTo(ox + sx - s * 0.1, oy + sy + s * 0.1);
                ctx.lineTo(ox + sx, oy + sy - s * 0.1);
                ctx.lineTo(ox + sx + s * 0.1, oy + sy + s * 0.1);
                ctx.fill();
            }
            break;
    }
}

function renderPlayer(renderX, renderY, camX, camY) {
    const s = TILE_SIZE * SCALE;
    // Align sprite center/feet with physics position
    const sx = (renderX - 0.5) * s - camX;
    const sy = (renderY - 0.9) * s - camY;

    // Hit flash
    if (player.hitTimer > 0) {
        ctx.globalAlpha = 0.5 + Math.sin(player.hitTimer * 30) * 0.3;
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(sx + s / 2, sy + s * 0.92, s * 0.32, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    const bobY = player.isMoving ? Math.sin(player.animTimer * 2) * 1.5 : 0;

    // Body
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(sx + s * 0.28, sy + s * 0.4 + bobY, s * 0.44, s * 0.4);

    // Arms
    const armSwing = player.isMoving ? Math.sin(player.animTimer * 2) * s * 0.08 : 0;
    ctx.fillStyle = '#ffccaa';
    ctx.fillRect(sx + s * 0.18, sy + s * 0.42 + bobY + armSwing, s * 0.12, s * 0.25);
    ctx.fillRect(sx + s * 0.70, sy + s * 0.42 + bobY - armSwing, s * 0.12, s * 0.25);

    // Head
    ctx.fillStyle = '#ffccaa';
    ctx.fillRect(sx + s * 0.32, sy + s * 0.18 + bobY, s * 0.36, s * 0.28);

    // Hair
    ctx.fillStyle = '#4a3020';
    ctx.fillRect(sx + s * 0.30, sy + s * 0.12 + bobY, s * 0.40, s * 0.14);

    // Eyes based on direction
    ctx.fillStyle = '#222';
    if (player.direction !== 3) {
        ctx.fillRect(sx + s * 0.38, sy + s * 0.28 + bobY, s * 0.07, s * 0.07);
        ctx.fillRect(sx + s * 0.55, sy + s * 0.28 + bobY, s * 0.07, s * 0.07);
    }

    // Legs
    ctx.fillStyle = '#3355aa';
    const legSwing = player.isMoving ? Math.sin(player.animTimer * 2) * s * 0.06 : 0;
    ctx.fillRect(sx + s * 0.32, sy + s * 0.78 + legSwing, s * 0.14, s * 0.18);
    ctx.fillRect(sx + s * 0.54, sy + s * 0.78 - legSwing, s * 0.14, s * 0.18);

    ctx.globalAlpha = 1;
}

function renderSurvivor(s, renderX, renderY, camX, camY) {
    const size = TILE_SIZE * SCALE;
    const sx = (renderX - 0.5) * size - camX;
    const sy = (renderY - 0.9) * size - camY;

    if (sx < -size || sx > canvas.width + size || sy < -size || sy > canvas.height + size) return;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(sx + size / 2, sy + size * 0.9, size * 0.28, size * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Role colors
    const colors = {
        'Soldier': '#aa4444', 'Guard': '#6666aa', 'Builder': '#aa8844',
        'Farmer': '#44aa44', 'Woodcutter': '#8a5a2a', 'Miner': '#666666',
        'Hunter': '#668844', 'Medic': '#aa88cc', 'None': '#888888'
    };

    // Body
    ctx.fillStyle = colors[s.role] || '#888888';
    ctx.fillRect(sx + size * 0.3, sy + size * 0.42, size * 0.4, size * 0.38);

    // Head
    ctx.fillStyle = '#ddb088';
    ctx.fillRect(sx + size * 0.35, sy + size * 0.2, size * 0.3, size * 0.26);

    // Role indicator
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(s.role[0], sx + size / 2, sy + size * 0.15);
}

function renderZombie(z, renderX, renderY, camX, camY) {
    const s = TILE_SIZE * SCALE;
    const sx = (renderX - 0.5) * s - camX;
    const sy = (renderY - 0.9) * s - camY;

    if (sx < -s * 2 || sx > canvas.width + s || sy < -s * 2 || sy > canvas.height + s) return;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(sx + s / 2, sy + s * 0.92, s * 0.32, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = Math.sin(z.animTimer * 3) * 1;

    // Body
    ctx.fillStyle = '#4a6a4a';
    ctx.fillRect(sx + s * 0.22, sy + s * 0.35 + bob, s * 0.56, s * 0.45);

    // Head
    ctx.fillStyle = '#5a7a5a';
    ctx.fillRect(sx + s * 0.28, sy + s * 0.12 + bob, s * 0.44, s * 0.3);

    // Eyes
    ctx.fillStyle = '#ff3333';
    ctx.fillRect(sx + s * 0.34, sy + s * 0.22 + bob, s * 0.1, s * 0.08);
    ctx.fillRect(sx + s * 0.56, sy + s * 0.22 + bob, s * 0.1, s * 0.08);

    // Arms reaching
    const armReach = Math.sin(z.animTimer * 4) * s * 0.08;
    ctx.fillStyle = '#4a6a4a';
    ctx.fillRect(sx + s * 0.05 + armReach, sy + s * 0.38 + bob, s * 0.2, s * 0.1);
    ctx.fillRect(sx + s * 0.75 - armReach, sy + s * 0.42 + bob, s * 0.2, s * 0.1);

    // Health bar
    if (z.health < z.maxHealth) {
        ctx.fillStyle = '#222';
        ctx.fillRect(sx + s * 0.1, sy - 2, s * 0.8, 4);
        ctx.fillStyle = '#dd3333';
        ctx.fillRect(sx + s * 0.1, sy - 2, s * 0.8 * (z.health / z.maxHealth), 4);
    }
}

// renderMinimap moved to ui.js
