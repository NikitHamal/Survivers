// ============= MAIN RENDERING SYSTEM =============

let lastAlpha = 1;
let pixelTime = 0;

function render(alpha = 1) {
    lastAlpha = alpha;
    pixelTime += 0.016;

    // Sky/ground base color
    ctx.fillStyle = '#1a2a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

    // Collect all entities for Y-sorting
    const entities = [];

    // Add trees from visible tiles to Y-sort list
    for (let y = startTileY; y <= endTileY; y++) {
        for (let x = startTileX; x <= endTileX; x++) {
            const tile = getTile(x, y);
            if (tile === TILES.TREE) {
                entities.push({
                    type: 'tree',
                    x: x,
                    y: y,
                    sortY: y + 1 // Sort from base
                });
            } else {
                const sx = x * TILE_SIZE * SCALE - camX;
                const sy = y * TILE_SIZE * SCALE - camY;
                renderObjectLayer(tile, sx, sy, x, y);
            }
        }
    }

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

    // Add animals to Y-sort
    if (typeof PetSystem !== 'undefined') {
        PetSystem.getWildAnimals().forEach(a => {
            const rx = lerp(a.prevX ?? a.x, a.x, alpha);
            const ry = lerp(a.prevY ?? a.y, a.y, alpha);
            entities.push({ type: 'animal', data: a, x: rx, y: ry, sortY: ry });
        });
    }

    entities.sort((a, b) => a.sortY - b.sortY);

    // Render entity shadows first
    entities.forEach(e => {
        // Trees/survivors/animals render their own shadows for proper grounding.
        if (e.type === 'tree' || e.type === 'survivor' || e.type === 'animal') return;
        const s = TILE_SIZE * SCALE;
        const cx = e.x * s - camX;
        const cy = (e.y + 0.5) * s - camY;
        renderEntityShadow(ctx, cx, cy, s * 0.35);
    });

    // Render entities
    entities.forEach(e => {
        const s = TILE_SIZE * SCALE;
        const sx = e.x * s - camX;
        const sy = e.y * s - camY;

        if (e.type === 'survivor') {
            if (e.data.isPlayer) {
                renderPlayerEnhanced(e.x, e.y, camX, camY);
            } else {
                renderSurvivorEnhanced(e.data, e.x, e.y, camX, camY);
            }
        } else if (e.type === 'zombie') {
            renderZombieEnhanced(e.data, e.x, e.y, camX, camY);
        } else if (e.type === 'animal') {
            renderAnimalSprite(ctx, e.data, { x: camX, y: camY }, alpha);
        } else if (e.type === 'tree') {
            renderTree(Math.floor(sx), Math.floor(sy), s, e.x, e.y);
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

    // Drag preview
    if (isDraggingBuilding && draggedBuilding) {
        renderDragPreview(camX, camY);
    }

    // Render move target marker
    renderMoveTargetEnhanced(camX, camY);

    // Debug collision
    if (window.debugCollision) {
        renderDebugCollision(camX, camY);
    }

    // Darkness / Lighting System
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

    if (typeof ShelterSystem !== 'undefined') {
        ShelterSystem.renderShelters(ctx);
    }
    if (typeof FarmingSystem !== 'undefined') {
        FarmingSystem.renderFarming(ctx);
    }
    if (typeof CookingSystem !== 'undefined') {
        CookingSystem.renderCooking(ctx);
    }


    // Draw building upgrade progress bars
    if (typeof BuildingUpgradeSystem !== 'undefined' && BuildingUpgradeSystem.getActiveUpgrades) {
        const upgrades = BuildingUpgradeSystem.getActiveUpgrades();
        for (const upgrade of upgrades) {
            // Check if visible
            const screenX = (upgrade.x * TILE_SIZE * SCALE) - camera.x;
            const screenY = (upgrade.y * TILE_SIZE * SCALE) - camera.y;

            if (screenX > -TILE_SIZE * SCALE && screenX < canvas.width &&
                screenY > -TILE_SIZE * SCALE && screenY < canvas.height) {

                const progress = upgrade.progress / upgrade.totalTime;
                const barWidth = TILE_SIZE * SCALE * 0.8;
                const barHeight = 6;
                const barX = screenX + (TILE_SIZE * SCALE - barWidth) / 2;
                const barY = screenY - 10; // Float above

                // Background
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(barX, barY, barWidth, barHeight);

                // Border
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.strokeRect(barX, barY, barWidth, barHeight);

                // Fill
                ctx.fillStyle = '#f1c40f'; // Gold
                ctx.fillRect(barX + 1, barY + 1, (barWidth - 2) * progress, barHeight - 2);
            }
        }
    }

    // Post-processing effects
    renderPostProcessing();

    // Render selected building UI (radial menu, range, selection glow)
    renderSelectedBuildingUI(camX, camY);

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

function renderDragPreview(camX, camY) {
    if (!dragHoverTile) return;

    const sx = dragHoverTile.x * TILE_SIZE * SCALE - camX;
    const sy = dragHoverTile.y * TILE_SIZE * SCALE - camY;
    const s = TILE_SIZE * SCALE;

    const ignorePos = { x: draggedBuilding.originalX, y: draggedBuilding.originalY };
    const canPlace = canBuild(dragHoverTile.x, dragHoverTile.y, draggedBuilding.type, ignorePos);

    // Pulsing effect
    const pulse = Math.sin(pixelTime * 6) * 0.1 + 0.9;

    const isHouse = draggedBuilding.type.tile === TILES.HOUSE;
    const size = isHouse ? s * 2 : s;

    // Skeleton/Ghost look
    ctx.globalAlpha = 0.4 * pulse;
    ctx.fillStyle = canPlace ? '#44ff44' : '#ff4444';
    ctx.fillRect(sx, sy, size, size);

    // Draw the icon of the building
    const icon = draggedBuilding.type.icon || '📦';
    ctx.globalAlpha = 0.7;
    ctx.font = `${size * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, sx + size / 2, sy + size / 2);

    // Grid Highlight
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx, sy, size, size);

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

function renderPostProcessing() {
    // Optional scanlines (set window.enableScanlines = true to enable)
    if (window.enableScanlines) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let y = 0; y < canvas.height; y += 3) {
            ctx.fillRect(0, y, canvas.width, 1);
        }
    }
}

// Debug collision rendering
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

// ============= BUILDING SELECTION UI =============
function renderSelectedBuildingUI(camX, camY) {
    if (!selectedBuildingData) return;

    const { x, y, tile, building, type } = selectedBuildingData;
    const s = TILE_SIZE * SCALE;

    // Determine building size (houses are 2x2)
    const isHouse = tile === TILES.HOUSE;
    const size = isHouse ? s * 2 : s;

    const screenX = x * s - camX;
    const screenY = y * s - camY;
    const centerX = screenX + size / 2;
    const centerY = screenY + size / 2;

    // ========== 1. RANGE CIRCLE (for applicable buildings) ==========
    let range = 0;
    let rangeColor = 'rgba(255, 200, 50, 0.15)';
    let rangeBorderColor = 'rgba(255, 200, 50, 0.6)';

    if (tile === TILES.TOWER) {
        range = 6; // Tower range in tiles
        rangeColor = 'rgba(52, 152, 219, 0.12)';
        rangeBorderColor = 'rgba(52, 152, 219, 0.5)';
    } else if (tile === TILES.CANNON) {
        range = 8; // Cannon range in tiles
        rangeColor = 'rgba(231, 76, 60, 0.12)';
        rangeBorderColor = 'rgba(231, 76, 60, 0.5)';
    } else if (tile === TILES.CAMPFIRE) {
        range = 3; // Campfire heal range
        rangeColor = 'rgba(241, 196, 15, 0.15)';
        rangeBorderColor = 'rgba(241, 196, 15, 0.6)';
    }

    if (range > 0) {
        const rangePixels = range * s;

        // Fill
        ctx.fillStyle = rangeColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, rangePixels, 0, Math.PI * 2);
        ctx.fill();

        // Border (dashed)
        ctx.strokeStyle = rangeBorderColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, rangePixels, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // ========== 2. SELECTION GLOW ==========
    const pulse = Math.sin(pixelTime * 4) * 0.15 + 0.85;

    // Outer glow
    ctx.shadowBlur = 15 * pulse;
    ctx.shadowColor = '#ffd700';
    ctx.strokeStyle = `rgba(255, 215, 0, ${0.6 * pulse})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(screenX - 2, screenY - 2, size + 4, size + 4);
    ctx.shadowBlur = 0;

    // Corner brackets for selection
    const bracketSize = 8;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(screenX - 4, screenY + bracketSize);
    ctx.lineTo(screenX - 4, screenY - 4);
    ctx.lineTo(screenX + bracketSize, screenY - 4);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(screenX + size - bracketSize, screenY - 4);
    ctx.lineTo(screenX + size + 4, screenY - 4);
    ctx.lineTo(screenX + size + 4, screenY + bracketSize);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(screenX - 4, screenY + size - bracketSize);
    ctx.lineTo(screenX - 4, screenY + size + 4);
    ctx.lineTo(screenX + bracketSize, screenY + size + 4);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(screenX + size - bracketSize, screenY + size + 4);
    ctx.lineTo(screenX + size + 4, screenY + size + 4);
    ctx.lineTo(screenX + size + 4, screenY + size - bracketSize);
    ctx.stroke();

    // ========== 3. RADIAL ACTION MENU ==========
    const actions = [
        { id: 'upgrade', icon: '⬆️', label: 'Upgrade', angle: -90, color: '#2ecc71' },
        { id: 'move', icon: '✋', label: 'Move', angle: 0, color: '#3498db' },
        { id: 'remove', icon: '🗑️', label: 'Remove', angle: 90, color: '#e74c3c' },
        { id: 'info', icon: 'ℹ️', label: 'Info', angle: 180, color: '#9b59b6' }
    ];

    const menuRadius = size + 35;
    const iconSize = 28;

    actions.forEach(action => {
        const angleRad = (action.angle * Math.PI) / 180;
        const iconX = centerX + Math.cos(angleRad) * menuRadius;
        const iconY = centerY + Math.sin(angleRad) * menuRadius;

        // Store position for click detection
        action.screenX = iconX;
        action.screenY = iconY;
        action.radius = iconSize / 2 + 6;

        // Background circle
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(iconX, iconY, iconSize / 2 + 6, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = action.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(iconX, iconY, iconSize / 2 + 6, 0, Math.PI * 2);
        ctx.stroke();

        // Icon
        ctx.font = `${iconSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(action.icon, iconX, iconY);
    });

    // Store actions for click handling
    window._buildingActions = actions;
    window._buildingActionCenter = { x: centerX, y: centerY };
}

// Handle radial menu clicks
function handleRadialMenuClick(screenX, screenY) {
    if (!selectedBuildingData || !window._buildingActions) return false;

    for (const action of window._buildingActions) {
        const dx = screenX - action.screenX;
        const dy = screenY - action.screenY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= action.radius) {
            executeRadialAction(action.id);
            return true;
        }
    }

    return false;
}

function executeRadialAction(actionId) {
    if (!selectedBuildingData) return;

    const { x, y, tile, building } = selectedBuildingData;

    switch (actionId) {
        case 'upgrade':
            if (typeof BuildingUpgradeSystem !== 'undefined') {
                BuildingUpgradeSystem.showUpgradeUI(x, y);
            }
            break;

        case 'move':
            // Start dragging this building
            const buildingType = BUILDINGS.find(b => b.tile === tile);
            if (buildingType) {
                isDraggingBuilding = true;
                draggedBuilding = {
                    x: x,
                    y: y,
                    originalX: x,
                    originalY: y,
                    type: buildingType,
                    building: building
                };
                dragHoverTile = { x: x, y: y };
                selectedBuildingData = null;
            }
            break;

        case 'remove':
            // Remove building with confirmation
            if (typeof showNotification === 'function') {
                showNotification(
                    `🗑️ Remove this building? You'll get 50% resources back.`,
                    [
                        { text: 'Remove', action: () => removeBuilding(x, y) },
                        { text: 'Cancel', action: () => { } }
                    ]
                );
            }
            break;

        case 'info':
            // Show building info panel
            if (typeof BuildingUpgradeSystem !== 'undefined') {
                BuildingUpgradeSystem.showUpgradeUI(x, y);
            }
            break;
    }
}

function removeBuilding(x, y) {
    const tile = getTile(x, y);
    const buildingDef = BUILDINGS.find(b => b.tile === tile);

    if (buildingDef) {
        // Refund 50% resources
        for (const [res, amt] of Object.entries(buildingDef.cost)) {
            resources[res] = (resources[res] || 0) + Math.floor(amt * 0.5);
        }

        // Remove from world
        setTile(x, y, TILES.FLOOR);

        // Remove from buildings array
        const idx = buildings.findIndex(b => b.x === x && b.y === y);
        if (idx !== -1) buildings.splice(idx, 1);

        // Handle 2x2 buildings (houses)
        if (tile === TILES.HOUSE) {
            setTile(x + 1, y, TILES.FLOOR);
            setTile(x, y + 1, TILES.FLOOR);
            setTile(x + 1, y + 1, TILES.FLOOR);
        }

        if (typeof showNotification === 'function') {
            showNotification(`🗑️ Building removed. Resources refunded!`, []);
        }

        if (typeof spawnParticles === 'function') {
            spawnParticles(x + 0.5, y + 0.5, '#888888', 15);
        }
    }

    selectedBuildingData = null;
}
