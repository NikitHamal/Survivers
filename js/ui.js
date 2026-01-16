function updateUI() {
    document.getElementById('dayCount').textContent = dayCount;
    document.getElementById('woodCount').textContent = resources.wood;
    document.getElementById('stoneCount').textContent = resources.stone;
    document.getElementById('ironCount').textContent = resources.iron;
    document.getElementById('foodCount').textContent = resources.food;

    document.getElementById('healthText').textContent = Math.floor(player.health);
    document.getElementById('maxHealthText').textContent = player.maxHealth;
    document.getElementById('healthFill').style.width = Math.max(0, (player.health / player.maxHealth * 100)) + '%';

    document.getElementById('hungerText').textContent = Math.floor(player.hunger);
    document.getElementById('hungerFill').style.width = (player.hunger / player.maxHunger * 100) + '%';

    document.getElementById('levelText').textContent = player.level;
    document.getElementById('expText').textContent = player.exp;
    document.getElementById('expNeededText').textContent = player.expToLevel;
    document.getElementById('expFill').style.width = (player.exp / player.expToLevel * 100) + '%';
}

function setupInventoryUI() {
    const container = document.getElementById('invSlots');
    const items = ['🪓', '⛏️', '🗡️', '🍖', '💊']; // Restored original emojis
    for (let i = 0; i < 5; i++) {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        slot.innerHTML = `<span style="font-size:24px;">${items[i]}</span><span class="inv-count">${i + 1}</span>`;
        slot.onclick = () => selectInventorySlot(i);
        container.appendChild(slot);
    }
}

function toggleMinimap() {
    const minimap = document.getElementById('minimap');
    const backdrop = document.getElementById('minimapBackdrop');
    minimap.classList.toggle('expanded');

    if (backdrop) {
        if (minimap.classList.contains('expanded')) {
            backdrop.style.display = 'block';
            setTimeout(() => backdrop.classList.add('active'), 10);
        } else {
            backdrop.classList.remove('active');
            setTimeout(() => backdrop.style.display = 'none', 500);
        }
    }

    if (minimap.classList.contains('expanded')) {
        gameState.paused = true;
    } else {
        gameState.paused = false;
    }
}

function selectInventorySlot(idx) {
    document.querySelectorAll('.inv-slot').forEach((s, i) => {
        s.classList.toggle('selected', i === idx);
    });
}

function showNotification(text, buttons = []) {
    const notif = document.getElementById('notification');
    document.getElementById('notifText').innerHTML = text;

    const btnContainer = document.getElementById('notifButtons');
    btnContainer.innerHTML = '';

    if (buttons.length === 0) {
        setTimeout(() => { notif.style.display = 'none'; }, 2000);
    }

    buttons.forEach(b => {
        const btn = document.createElement('button');
        btn.className = 'notif-btn ' + (b.class || '');
        btn.textContent = b.text;
        btn.onclick = () => {
            b.action();
            notif.style.display = 'none';
            gameState.paused = false;
        };
        btnContainer.appendChild(btn);
    });

    if (buttons.length > 0) {
        gameState.paused = true;
    }

    notif.style.display = 'block';
}

function addDamageNumber(x, y, amount, color) {
    damageNumbers.push({ x, y, amount: Math.floor(amount), color, life: 1 });
}

// ============= BUILD SYSTEM =============
function openBuildMenu() {
    const grid = document.getElementById('buildGrid');
    grid.innerHTML = '';

    BUILDINGS.forEach((b, i) => {
        const canAfford = Object.entries(b.cost).every(([r, amt]) => resources[r] >= amt);
        const div = document.createElement('div');
        div.className = 'menu-item' + (canAfford ? '' : ' disabled');
        div.innerHTML = `
            <div style="margin-bottom:4px; font-size:32px; height:40px; display:flex; align-items:center; justify-content:center;">${b.icon}</div>
            <div style="font-weight:bold; font-size:14px;">${b.name}</div>
            <div style="font-size:10px;color:#888;margin:3px 0;line-height:1.2;">${b.desc}</div>
            <div style="font-size:10px;color:#aaa;">
                ${Object.entries(b.cost).map(([r, a]) => {
            const hasEnough = resources[r] >= a;
            return `<span style="color:${hasEnough ? '#8f8' : '#f88'}">${r}:${a}</span>`;
        }).join(' ')}
            </div>
        `;
        if (canAfford) {
            div.onclick = () => selectBuilding(i);
        }
        grid.appendChild(div);
    });

    document.getElementById('buildMenu').style.display = 'block';
    gameState.paused = true;
}

function closeBuildMenu() {
    document.getElementById('buildMenu').style.display = 'none';
    gameState.paused = false;
    buildMode = false;
    selectedBuilding = null;
}

function selectBuilding(idx) {
    selectedBuilding = BUILDINGS[idx];
    buildMode = true;
    document.getElementById('buildMenu').style.display = 'none';
    gameState.paused = false;
}

function canBuild(x, y) {
    const tile = getTile(x, y);
    const dist = Math.sqrt((x + 0.5 - player.x) ** 2 + (y + 0.5 - player.y) ** 2);
    return (tile === TILES.GRASS || tile === TILES.FLOOR) && dist < 4;
}

function placeBuild(x, y) {
    Object.entries(selectedBuilding.cost).forEach(([r, amt]) => {
        resources[r] -= amt;
    });

    setTile(x, y, selectedBuilding.tile);

    spawnParticles(x + 0.5, y + 0.5, '#ffd700', 8);
    player.exp += 20;
    checkLevelUp();

    buildMode = false;
    selectedBuilding = null;
    updateUI();
}

// ============= SURVIVOR MANAGEMENT =============
function toggleSurvivorMenu() {
    const menu = document.getElementById('survivorMenu');
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
        gameState.paused = false;
        return;
    }

    const container = document.getElementById('roleAssignments');
    container.innerHTML = '';

    if (survivors.length <= 1) {
        container.innerHTML = '<p style="color:#888;text-align:center;">No team members yet.<br>Survivors will come during daytime!</p>';
    } else {
        survivors.forEach((s, i) => {
            if (s.isPlayer) return;

            const div = document.createElement('div');
            div.style.cssText = 'background:#1a1a2a;padding:10px 12px;margin:6px 0;border-radius:5px;color:#fff;display:flex;justify-content:space-between;align-items:center;';
            div.innerHTML = `
                <span><strong>${s.name}</strong> <span style="color:#888;font-size:10px;">HP:${s.health}</span></span>
                <select onchange="assignRole(${i}, this.value)" style="background:#2a2a4a;color:#fff;border:1px solid #4a4a6a;padding:4px 8px;border-radius:3px;cursor:pointer;">
                    ${ROLES.map(r => `<option value="${r}" ${s.role === r ? 'selected' : ''}>${r}</option>`).join('')}
                </select>
            `;
            container.appendChild(div);
        });
    }

    menu.style.display = 'block';
    gameState.paused = true;
}

function assignRole(idx, role) {
    survivors[idx].role = role;
    updateSurvivorList();
}

function updateSurvivorList() {
    const list = document.getElementById('survivorList');
    list.innerHTML = '';

    survivors.slice(0, 6).forEach(s => {
        const div = document.createElement('div');
        div.className = 'survivor-item';
        const iconColor = s.isPlayer ? '#4488ff' : '#88aa66';
        div.innerHTML = `
            <div class="survivor-icon" style="background:${iconColor}"></div>
            <span>${s.name.split(' ')[0]}</span>
            <span style="color:#666;font-size:12px;margin-left:auto;">${s.role}</span>
        `;
        list.appendChild(div);
    });

    if (survivors.length > 6) {
        const more = document.createElement('div');
        more.style.cssText = 'color:#888;font-size:12px;padding:2px;';
        more.textContent = `+${survivors.length - 6} more...`;
        list.appendChild(more);
    }

    document.getElementById('survivorCount').textContent = survivors.length;
}

// ============= CANVAS UI RENDERERS =============

function renderDamageNumbers(ctx, camX, camY) {
    if (!damageNumbers) return;

    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    damageNumbers.forEach(d => {
        const sx = d.x * TILE_SIZE * SCALE - camX;
        const sy = d.y * TILE_SIZE * SCALE - camY;
        ctx.globalAlpha = d.life;
        ctx.fillStyle = '#000';
        ctx.fillText(d.amount, sx + 1, sy + 1);
        ctx.fillStyle = d.color;
        ctx.fillText(d.amount, sx, sy);
    });
    ctx.globalAlpha = 1;
}

function renderMinimap() {
    if (!minimapCtx || !minimapCanvas) return;

    const size = minimapCanvas.width;
    minimapCtx.fillStyle = '#0a1a0a';
    minimapCtx.fillRect(0, 0, size, size);

    const mapScale = 2;
    const halfSize = size / 2;
    const range = Math.floor(halfSize / mapScale);

    // Use ImageData for much faster tile rendering
    const imgData = minimapCtx.createImageData(size, size);
    const data = imgData.data;

    // Helper to set pixel in ImageData
    const setPixel = (x, y, r, g, b) => {
        if (x < 0 || x >= size || y < 0 || y >= size) return;
        const idx = (y * size + x) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
    };

    const colors = {
        [TILES.GRASS]: [42, 74, 26],
        [TILES.TREE]: [26, 58, 10],
        [TILES.WATER]: [42, 74, 122],
        [TILES.WALL]: [90, 74, 58],
        [TILES.WALL_BROKEN]: [90, 74, 58],
        [TILES.FLOOR]: [106, 90, 74],
        [TILES.HOUSE]: [106, 90, 74],
        [TILES.STONE]: [90, 90, 90],
        [TILES.IRON]: [90, 90, 90],
        [TILES.CAMPFIRE]: [170, 68, 0],
        [TILES.TOWER]: [74, 74, 106],
        [TILES.CANNON]: [74, 74, 106],
        [TILES.BUSH]: [34, 139, 34]
    };

    for (let dy = -range; dy < range; dy++) {
        for (let dx = -range; dx < range; dx++) {
            const wx = Math.floor(player.x + dx);
            const wy = Math.floor(player.y + dy);
            const tile = getTile(wx, wy);

            const color = colors[tile] || [42, 74, 26];

            // Draw mapScale x mapScale block
            for (let py = 0; py < mapScale; py++) {
                for (let px = 0; px < mapScale; px++) {
                    setPixel(
                        Math.floor(halfSize + dx * mapScale + px),
                        Math.floor(halfSize + dy * mapScale + py),
                        color[0], color[1], color[2]
                    );
                }
            }
        }
    }

    minimapCtx.putImageData(imgData, 0, 0);

    // Zombies
    minimapCtx.fillStyle = '#ff4444';
    zombies.forEach(z => {
        const dx = z.x - player.x;
        const dy = z.y - player.y;
        if (Math.abs(dx) < range && Math.abs(dy) < range) {
            minimapCtx.fillRect(halfSize + dx * mapScale - 1, halfSize + dy * mapScale - 1, 3, 3);
        }
    });

    // Survivors
    minimapCtx.fillStyle = '#44ff44';
    survivors.forEach(s => {
        if (s.isPlayer) return;
        const dx = s.x - player.x;
        const dy = s.y - player.y;
        if (Math.abs(dx) < range && Math.abs(dy) < range) {
            minimapCtx.fillRect(halfSize + dx * mapScale - 1, halfSize + dy * mapScale - 1, 2, 2);
        }
    });

    // Player
    minimapCtx.fillStyle = '#4488ff';
    minimapCtx.fillRect(halfSize - 2, halfSize - 2, 4, 4);

    // Border
    minimapCtx.strokeStyle = '#4a4a6a';
    minimapCtx.lineWidth = 2;
    minimapCtx.strokeRect(0, 0, size, size);
}
