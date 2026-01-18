// ============= INPUT HANDLING =============
function handleKeyPress(e) {
    if (!gameState.running) return;

    switch (e.code) {
        case 'KeyB':
            openBuildMenu();
            break;
        case 'KeyT':
            toggleSurvivorMenu();
            break;
        case 'KeyQ':
            toggleQuestMenu();
            break;
        case 'KeyK':
            toggleSkillMenu();
            break;
        case 'KeyJ':
            toggleAchievementMenu();
            break;
        case 'KeyC':
            toggleCraftingMenu();
            break;
        case 'KeyI':
            toggleEquipmentMenu();
            break;
        case 'KeyF':
            toggleFollow();
            break;
        case 'KeyE':
            interact();
            break;
        case 'Space':
            e.preventDefault();
            attackAction();
            break;
        case 'KeyM':
            toggleMinimap();
            break;
        case 'Escape':
            closeAllMenus();
            if (document.getElementById('minimap')) document.getElementById('minimap').classList.remove('expanded');
            gameState.paused = false;
            buildMode = false;
            break;
        case 'Digit1': case 'Digit2': case 'Digit3': case 'Digit4': case 'Digit5':
            selectInventorySlot(parseInt(e.code.slice(-1)) - 1);
            break;
        case 'F3':
            e.preventDefault();
            window.debugCollision = !window.debugCollision;
            showNotification(window.debugCollision ? 'Debug: Collision ON' : 'Debug: Collision OFF');
            break;
        case 'F2':
            e.preventDefault();
            toggleDebugMenu();
            break;
    }
}

// ============= MOUSE HANDLING =============

function handleMouseDown(e) {
    if (!gameState.running) return;

    // Store start time and position
    mouseDown = true;
    mouseDownTime = Date.now();

    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left + camera.x) / SCALE / TILE_SIZE;
    const my = (e.clientY - rect.top + camera.y) / SCALE / TILE_SIZE;

    // Root Tile Check
    let tx = Math.floor(mx);
    let ty = Math.floor(my);
    const tile = getTile(tx, ty);

    // If it's a house base, find the root house tile
    if (tile === TILES.HOUSE_BASE) {
        // Simple search in neighbors for TILES.HOUSE (limited to 2x2)
        if (getTile(tx - 1, ty) === TILES.HOUSE) tx -= 1;
        else if (getTile(tx, ty - 1) === TILES.HOUSE) ty -= 1;
        else if (getTile(tx - 1, ty - 1) === TILES.HOUSE) { tx -= 1; ty -= 1; }
    }

    dragStartTile = { x: tx, y: ty };

    // Check if clicking a building for potential drag
    if (typeof BuildingUpgradeSystem !== 'undefined') {
        const rootTile = getTile(tx, ty);
        const buildingType = BuildingUpgradeSystem.getBuildingType(rootTile);
        if (buildingType) {
            // Collect background tiles to restore later (Grass, Floor, etc.)
            const bgTiles = [];
            if (buildingType.tile === TILES.HOUSE) {
                for (let dy = 0; dy < 2; dy++) {
                    for (let dx = 0; dx < 2; dx++) {
                        const b = typeof getBuilding === 'function' ? getBuilding(tx + dx, ty + dy) : null;
                        bgTiles.push(b ? b.bgTile : TILES.GRASS);
                    }
                }
            } else {
                const b = typeof getBuilding === 'function' ? getBuilding(tx, ty) : null;
                bgTiles.push(b ? b.bgTile : TILES.GRASS);
            }

            draggedBuilding = {
                originalX: tx,
                originalY: ty,
                type: buildingType,
                bgTiles: bgTiles
            };
        } else {
            draggedBuilding = null;
        }
    }
}

function handleMouseUp(e) {
    if (!gameState.running) return;
    mouseDown = false;

    const clickDuration = Date.now() - mouseDownTime;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left + camera.x) / SCALE / TILE_SIZE;
    const clickY = (e.clientY - rect.top + camera.y) / SCALE / TILE_SIZE;
    const tileX = Math.floor(clickX);
    const tileY = Math.floor(clickY);

    // If we were dragging a building
    if (isDraggingBuilding && draggedBuilding) {
        // Drop logic
        const ignorePos = { x: draggedBuilding.originalX, y: draggedBuilding.originalY };
        if (canBuild(tileX, tileY, draggedBuilding.type, ignorePos)) { // Reuse build check which usually checks for empty space
            // Move the building
            if (typeof BuildingUpgradeSystem !== 'undefined' && BuildingUpgradeSystem.moveBuilding) {
                const type = draggedBuilding.type;

                // 1. Clear old tile(s) using correct background tiles
                if (type.tile === TILES.HOUSE) {
                    let idx = 0;
                    for (let dy = 0; dy < 2; dy++) {
                        for (let dx = 0; dx < 2; dx++) {
                            const bg = draggedBuilding.bgTiles[idx++] ?? TILES.GRASS;
                            setTile(draggedBuilding.originalX + dx, draggedBuilding.originalY + dy, bg);
                        }
                    }
                } else {
                    const bg = (draggedBuilding.bgTiles && draggedBuilding.bgTiles[0]) ?? TILES.GRASS;
                    setTile(draggedBuilding.originalX, draggedBuilding.originalY, bg);
                }

                // 2. Set new tile(s)
                if (type.tile === TILES.HOUSE) {
                    setTile(tileX, tileY, TILES.HOUSE);
                    setTile(tileX + 1, tileY, TILES.HOUSE_BASE);
                    setTile(tileX, tileY + 1, TILES.HOUSE_BASE);
                    setTile(tileX + 1, tileY + 1, TILES.HOUSE_BASE);
                } else {
                    setTile(tileX, tileY, type.tile);
                }

                // 3. Update System Data
                BuildingUpgradeSystem.moveBuilding(
                    draggedBuilding.originalX, draggedBuilding.originalY,
                    tileX, tileY
                );

                spawnParticles(tileX + 0.5, tileY + 0.5, '#ffd700', 15);
            }
        }

        // Reset drag state
        isDraggingBuilding = false;
        draggedBuilding = null;
        document.body.style.cursor = 'default';
        return;
    }

    // Normal Click Logic (Short duration)
    if (clickDuration < 300) {
        // Build mode takes priority
        if (buildMode && selectedBuilding) {
            if (canBuild(tileX, tileY)) {
                placeBuild(tileX, tileY);
            }
            return;
        }

        // Standard Interaction
        handleClickInteraction(clickX, clickY, tileX, tileY);
    }

    // Cleanup simple drag attempts that didn't become drags
    draggedBuilding = null;
    inputState.keysPressedThisFrame.clear(); // Cleanup hack if needed
}

function handleClickInteraction(clickX, clickY, tileX, tileY) {
    // Calculate distance to click
    const dist = Math.sqrt((clickX - player.x) ** 2 + (clickY - player.y) ** 2);

    // If close enough and harvestable, harvest
    if (dist < 3.5) { // Increased distance slightly for large trees
        // Check clicked tile
        let targetTile = getTile(tileX, tileY);
        let targetX = tileX;
        let targetY = tileY;

        // If clicked tile isn't harvestable, check if it's the canopy of a tree below
        if (!isHarvestable(targetTile)) {
            for (let dy = 1; dy <= 3; dy++) {
                const checkTile = getTile(tileX, tileY + dy);
                if (checkTile === TILES.TREE) {
                    targetTile = checkTile;
                    targetX = tileX;
                    targetY = tileY + dy;
                    break;
                }
            }
        }

        if (isHarvestable(targetTile)) {
            harvestTile(targetX, targetY, targetTile);
            return;
        }
    }

    // Check for animals - attack if close enough
    if (typeof PetSystem !== 'undefined' && dist < 2.5) {
        const animal = PetSystem.getAnimalAt(clickX, clickY, 1.0);
        if (animal) {
            const damage = 18 + player.level * 3;
            PetSystem.attackAnimal(animal, damage, player);
            player.attackCooldown = 0.4;
            camera.shake = 3;
            spawnParticles(animal.x, animal.y, '#ffffff', 4);
            return;
        }
    }

    // Otherwise, click-to-move
    setPlayerMoveTarget(clickX, clickY);
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left + camera.x) / SCALE / TILE_SIZE;
    const mouseY = (e.clientY - rect.top + camera.y) / SCALE / TILE_SIZE;

    // Check for Drag Initiation
    if (mouseDown && draggedBuilding && !isDraggingBuilding) {
        const duration = Date.now() - mouseDownTime;
        const dist = Math.hypot(Math.floor(mouseX) - dragStartTile.x, Math.floor(mouseY) - dragStartTile.y);

        // Threshold: 300ms hold OR moved to a new tile
        if (duration > 300 || dist >= 1) {
            isDraggingBuilding = true;
            document.body.style.cursor = 'grabbing';
        }
    }

    if (buildMode) {
        buildPreviewX = Math.floor(mouseX);
        buildPreviewY = Math.floor(mouseY);
    }

    // Visuals for dragging
    if (isDraggingBuilding) {
        dragHoverTile = { x: Math.floor(mouseX), y: Math.floor(mouseY) };
        // We could render a ghost building here in render.js if we exported dragHoverTile
    }
}

function handleClick(e) {
    // Deprecated - redirected to handleMouseUp logic if needed, 
    // but we are replacing the event listener so this might not be called.
}

function handleRightClick(e) {
    e.preventDefault();
    if (!gameState.running) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left + camera.x) / SCALE / TILE_SIZE;
    const mouseY = (e.clientY - rect.top + camera.y) / SCALE / TILE_SIZE;
    const tileX = Math.floor(mouseX);
    const tileY = Math.floor(mouseY);
    const tile = getTile(tileX, tileY);

    // Check if building interaction (Upgrade)
    if (typeof BuildingUpgradeSystem !== 'undefined') {
        const buildingType = BuildingUpgradeSystem.getBuildingType(tile);
        if (buildingType) {
            BuildingUpgradeSystem.showUpgradeUI(tileX, tileY);
            return;
        }
    }

    // Right-click cancels movement if no building
    cancelPlayerPath();
}

function setPlayerMoveTarget(worldX, worldY) {
    // Clear any existing path first
    cancelPlayerPath();

    // Store the intended destination
    player.moveTarget = { x: worldX, y: worldY };

    // Calculate path using A*
    const path = pathfinder.findPath(player.x, player.y, worldX, worldY);

    if (path && path.length > 0) {
        player.path = path;
        player.pathIndex = 0;
        console.debug(`Path found with ${path.length} nodes`);
    } else if (path && path.length === 0) {
        // Empty path means we're already at the destination tile
        console.debug('Already at destination');
        player.moveTarget = null;
    } else {
        // No path found - try direct movement for short distances
        const dist = Math.sqrt((worldX - player.x) ** 2 + (worldY - player.y) ** 2);

        if (dist < 2) {
            // Short distance, try direct path
            player.path = [{ x: worldX, y: worldY }];
            player.pathIndex = 0;
            console.debug('Using direct path for short distance');
        } else {
            // Long distance with no path - try to find nearest walkable
            const nearest = pathfinder.findNearestWalkable(
                Math.floor(worldX),
                Math.floor(worldY),
                Math.floor(player.x),
                Math.floor(player.y)
            );

            if (nearest) {
                const newPath = pathfinder.findPath(
                    player.x, player.y,
                    nearest.x + 0.5, nearest.y + 0.5
                );

                if (newPath && newPath.length > 0) {
                    player.path = newPath;
                    player.pathIndex = 0;
                    player.moveTarget = { x: nearest.x + 0.5, y: nearest.y + 0.5 };
                    console.debug(`Rerouted to nearest walkable with ${newPath.length} nodes`);
                } else {
                    console.debug('Could not find path to nearest walkable');
                    player.moveTarget = null;
                }
            } else {
                console.debug('No walkable tiles near destination');
                player.moveTarget = null;
            }
        }
    }
}

function cancelPlayerPath() {
    player.path = null;
    player.pathIndex = 0;
    player.moveTarget = null;
    player.stuckTime = 0;
}

function isHarvestable(tile) {
    return tile === TILES.TREE || tile === TILES.BUSH ||
        tile === TILES.STONE || tile === TILES.IRON || tile === TILES.FARM;
}

// Helper to determine if a harvested tile should become floor or grass
function determineHarvestedGround(x, y) {
    // Check neighbors for floor or buildings
    const neighbors = [
        getTile(x + 1, y),
        getTile(x - 1, y),
        getTile(x, y + 1),
        getTile(x, y - 1)
    ];

    const structures = [TILES.FLOOR, TILES.HOUSE, TILES.CHEST, TILES.WORKBENCH, TILES.BED, TILES.WALL, TILES.CAMPFIRE];
    let floorCount = 0;

    for (const t of neighbors) {
        if (structures.includes(t)) floorCount++;
    }

    // If surrounded by 2 or more floor-like tiles, it becomes floor
    // This assumes the player is clearing land inside their base
    return floorCount >= 2 ? TILES.FLOOR : TILES.GRASS;
}

function harvestTile(x, y, tile) {
    let harvested = false;
    // Determine what to replace the tile with
    const groundTile = determineHarvestedGround(x, y);

    switch (tile) {
        case TILES.TREE:
            resources.wood += 4 + Math.floor(Math.random() * 3);
            setTile(x, y, groundTile);
            player.exp += 8;
            spawnParticles(x + 0.5, y + 0.5, '#8B4513', 10);
            harvested = true;
            break;
        case TILES.BUSH:
            if (Math.random() < 0.4) resources.food += 1;
            resources.wood += 1;
            setTile(x, y, groundTile);
            player.exp += 3;
            spawnParticles(x + 0.5, y + 0.5, '#4a8a3a', 6);
            harvested = true;
            break;
        case TILES.STONE:
            resources.stone += 3 + Math.floor(Math.random() * 2);
            setTile(x, y, groundTile);
            player.exp += 8;
            spawnParticles(x + 0.5, y + 0.5, '#707070', 10);
            harvested = true;
            break;
        case TILES.IRON:
            resources.iron += 2 + Math.floor(Math.random() * 2);
            resources.stone += 1;
            setTile(x, y, groundTile);
            player.exp += 15;
            spawnParticles(x + 0.5, y + 0.5, '#5a5a7a', 10);
            harvested = true;
            break;
        case TILES.FARM:
            if (Math.random() < 0.6) {
                resources.food += 2 + Math.floor(Math.random() * 2);
                spawnParticles(x + 0.5, y + 0.5, '#6a8a3a', 6);
                harvested = true;
            }
            break;
    }

    if (harvested) {
        checkLevelUp();
        if (typeof updateUI === 'function') updateUI();
    }
}

function interact() {
    // 0 = right, 1 = down, 2 = left, 3 = up
    const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    const dir = dirs[player.direction];

    // Check tile in front first, then tile standing on
    const checkCoords = [
        { x: Math.floor(player.x + dir[0] * 0.8), y: Math.floor(player.y + dir[1] * 0.8) },
        { x: Math.floor(player.x), y: Math.floor(player.y) }
    ];

    for (const coord of checkCoords) {
        const tile = getTile(coord.x, coord.y);

        // Heal at campfire/bed
        if (tile === TILES.CAMPFIRE || tile === TILES.BED) {
            const healAmount = tile === TILES.BED ? 30 : 15;
            if (player.health < player.maxHealth) {
                player.health = Math.min(player.health + healAmount, player.maxHealth);
                spawnParticles(player.x, player.y, '#ff6a2a', 8);
                addDamageNumber(player.x, player.y - 0.5, '+' + healAmount, '#44ff44');
                return;
            }
        }

        // Chest
        if (tile === TILES.CHEST) {
            showNotification('<i class="material-icons">inventory_2</i> Chest contains supplies!', [{
                text: 'Take All',
                action: () => {
                    resources.food += 5;
                    resources.wood += 8;
                    resources.stone += 3;
                    setTile(coord.x, coord.y, TILES.FLOOR);
                }
            }]);
            return;
        }
    }

    // Eat food (if no world interaction found)
    if (resources.food > 0 && player.hunger < player.maxHunger) {
        resources.food--;
        player.hunger = Math.min(player.hunger + 25, player.maxHunger);
        spawnParticles(player.x, player.y, '#88cc88', 5);
        if (typeof updateUI === 'function') updateUI();
    }
}

function attackAction() {
    if (player.attackCooldown > 0) return;

    player.attackCooldown = 0.4;
    camera.shake = 5;

    const damage = 18 + player.level * 3;

    // Attack zombies in range
    zombies.forEach(z => {
        const dist = Math.sqrt((z.x - player.x) ** 2 + (z.y - player.y) ** 2);
        if (dist < 1.3) {
            z.health -= damage;
            spawnParticles(z.x, z.y, '#ff6644', 6);
            addDamageNumber(z.x, z.y - 0.5, damage, '#ffffff');
        }
    });

    // Attack animals in range
    if (typeof PetSystem !== 'undefined') {
        const animals = PetSystem.getWildAnimals();
        for (const animal of animals) {
            const dist = Math.sqrt((animal.x - player.x) ** 2 + (animal.y - player.y) ** 2);
            if (dist < 1.5) {
                PetSystem.attackAnimal(animal, damage, player);
            }
        }
    }

    // Attack visual
    const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    const dir = dirs[player.direction];
    spawnParticles(player.x + dir[0] * 0.6, player.y + dir[1] * 0.6, '#ffffff', 4);
}

function toggleFollow() {
    followMode = !followMode;
    showNotification(followMode ? '<i class="material-icons">diversity_3</i> Team following you!' : '<i class="material-icons">diversity_3</i> Team returned to duties.', []);
}

function useItem() {
    interact();
}