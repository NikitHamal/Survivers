// ============= INPUT HANDLING =============
function handleKeyPress(e) {
    if (!gameRunning) return;

    switch (e.code) {
        case 'KeyB':
            openBuildMenu();
            break;
        case 'KeyT':
            toggleSurvivorMenu();
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
            closeBuildMenu();
            document.getElementById('survivorMenu').style.display = 'none';
            document.getElementById('minimap').classList.remove('expanded');
            buildMode = false;
            break;
        case 'Digit1': case 'Digit2': case 'Digit3': case 'Digit4': case 'Digit5':
            selectInventorySlot(parseInt(e.code.slice(-1)) - 1);
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
    if (!gameRunning) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left + camera.x) / SCALE / TILE_SIZE;
    const clickY = (e.clientY - rect.top + camera.y) / SCALE / TILE_SIZE;
    const tileX = Math.floor(clickX);
    const tileY = Math.floor(clickY);

    if (buildMode && selectedBuilding) {
        if (canBuild(tileX, tileY)) {
            placeBuild(tileX, tileY);
        }
        return;
    }

    // Harvest
    const tile = getTile(tileX, tileY);
    const dist = Math.sqrt((clickX - player.x) ** 2 + (clickY - player.y) ** 2);

    if (dist < 2.5) {
        harvestTile(tileX, tileY, tile);
    }
}

function harvestTile(x, y, tile) {
    let harvested = false;

    switch (tile) {
        case TILES.TREE:
            resources.wood += 4 + Math.floor(Math.random() * 3);
            setTile(x, y, TILES.GRASS);
            player.exp += 8;
            spawnParticles(x + 0.5, y + 0.5, '#8B4513', 10);
            harvested = true;
            break;
        case TILES.BUSH:
            if (Math.random() < 0.4) resources.food += 1;
            resources.wood += 1;
            setTile(x, y, TILES.GRASS);
            player.exp += 3;
            spawnParticles(x + 0.5, y + 0.5, '#4a8a3a', 6);
            harvested = true;
            break;
        case TILES.STONE:
            resources.stone += 3 + Math.floor(Math.random() * 2);
            setTile(x, y, TILES.GRASS);
            player.exp += 8;
            spawnParticles(x + 0.5, y + 0.5, '#707070', 10);
            harvested = true;
            break;
        case TILES.IRON:
            resources.iron += 2 + Math.floor(Math.random() * 2);
            resources.stone += 1;
            setTile(x, y, TILES.GRASS);
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
        updateUI();
    }
}

function interact() {
    const tileX = Math.floor(player.x);
    const tileY = Math.floor(player.y);
    const tile = getTile(tileX, tileY);

    // Heal at campfire/bed
    if (tile === TILES.CAMPFIRE || tile === TILES.BED) {
        const healAmount = tile === TILES.BED ? 30 : 15;
        player.health = Math.min(player.health + healAmount, player.maxHealth);
        spawnParticles(player.x, player.y, '#ff6a2a', 8);
        addDamageNumber(player.x, player.y - 0.5, '+' + healAmount, '#44ff44');
    }

    // Chest
    if (tile === TILES.CHEST) {
        showNotification('<i class="material-icons">inventory_2</i> Chest contains supplies!', [{
            text: 'Take All',
            action: () => {
                resources.food += 5;
                resources.wood += 8;
                resources.stone += 3;
                setTile(tileX, tileY, TILES.FLOOR);
            }
        }]);
        return;
    }

    // Eat food
    if (resources.food > 0 && player.hunger < player.maxHunger) {
        resources.food--;
        player.hunger = Math.min(player.hunger + 25, player.maxHunger);
        spawnParticles(player.x, player.y, '#88cc88', 5);
    }
}

function attackAction() {
    if (player.attackCooldown > 0) return;

    player.attackCooldown = 0.4;

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
