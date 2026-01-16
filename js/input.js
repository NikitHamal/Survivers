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
            inputState.space = true;
            break;
        case 'KeyM':
            toggleMinimap();
            break;
        case 'ShiftLeft':
            if (typeof MountSystem !== 'undefined') {
                MountSystem.toggleSprint();
            }
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

function handleMouseMove(e) {
    if (!buildMode) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left + camera.x) / SCALE / TILE_SIZE;
    const mouseY = (e.clientY - rect.top + camera.y) / SCALE / TILE_SIZE;

    buildPreviewX = Math.floor(mouseX);
    buildPreviewY = Math.floor(mouseY);
}

function handleClick(e) {
    if (!gameState.running) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left + camera.x) / SCALE / TILE_SIZE;
    const clickY = (e.clientY - rect.top + camera.y) / SCALE / TILE_SIZE;
    const tileX = Math.floor(clickX);
    const tileY = Math.floor(clickY);

    // Build mode takes priority
    if (buildMode && selectedBuilding) {
        if (canBuild(tileX, tileY)) {
            placeBuild(tileX, tileY);
        }
        return;
    }

    // Calculate distance to click
    const tile = getTile(tileX, tileY);
    const dist = Math.sqrt((clickX - player.x) ** 2 + (clickY - player.y) ** 2);

    // If close enough and harvestable, harvest
    if (dist < 2.5) {
        if (isHarvestable(tile)) {
            harvestTile(tileX, tileY, tile);
            return;
        }

        // Check if building interaction
        if (typeof BuildingUpgradeSystem !== 'undefined') {
            const buildingType = BuildingUpgradeSystem.getBuildingType(tile);
            if (buildingType) {
                BuildingUpgradeSystem.showUpgradeUI(tileX, tileY);
                return;
            }
        }
    }

    // Otherwise, click-to-move
    setPlayerMoveTarget(clickX, clickY);
}

function handleRightClick(e) {
    e.preventDefault();
    if (!gameState.running) return;

    // Right-click now cancels movement and removes the marker
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

    // 1. Merchant Interaction
    if (typeof TradingSystem !== 'undefined') {
        const merchant = TradingSystem.getMerchantAt(player.x + dir[0] * 0.8, player.y + dir[1] * 0.8) ||
            TradingSystem.getMerchantAt(player.x, player.y);
        if (merchant) {
            TradingSystem.interactWithMerchant(merchant);
            return;
        }
    }

    // 2. Mount Interaction
    if (typeof MountSystem !== 'undefined') {
        const checkRange = 1.0;
        const targetX = player.x + dir[0] * 0.8;
        const targetY = player.y + dir[1] * 0.8;

        // Check for mounting/dismounting first if already mounted
        if (MountSystem.isMounted()) {
            MountSystem.dismount();
            return;
        }

        const wildMount = MountSystem.getWildMounts().find(m =>
            Math.sqrt((m.x - targetX) ** 2 + (m.y - targetY) ** 2) < checkRange
        );
        if (wildMount) {
            MountSystem.startTaming(wildMount);
            return;
        }

        const ownedMount = MountSystem.getOwnedMounts().find(m =>
            Math.sqrt((m.x - targetX) ** 2 + (m.y - targetY) ** 2) < checkRange
        );
        if (ownedMount) {
            MountSystem.mountUp(ownedMount);
            return;
        }
    }

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
    }
}

function attackAction() {
    if (player.attackCooldown > 0) return;

    // Mount Ability Check
    if (typeof MountSystem !== 'undefined' && MountSystem.isMounted()) {
        const mount = MountSystem.getCurrentMount();
        if (mount && mount.type && mount.type.abilities && mount.type.abilities.length > 0) {
            MountSystem.useAbility(mount.type.abilities[0]);
            player.attackCooldown = 0.5; // Shared cooldown
            return;
        }
    }

    player.attackCooldown = 0.4;
    camera.shake = 5;

    if (typeof AudioSystem !== 'undefined') {
        AudioSystem.play('player_attack');
    }

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