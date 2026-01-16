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

    // Houses are 2x2
    if (selectedBuilding.tile === TILES.HOUSE) {
        for (let dy = 0; dy < 2; dy++) {
            for (let dx = 0; dx < 2; dx++) {
                const nt = getTile(x + dx, y + dy);
                if (nt !== TILES.GRASS && nt !== TILES.FLOOR) return false;
            }
        }
        return dist < 12;
    }

    return (tile === TILES.GRASS || tile === TILES.FLOOR) && dist < 12;
}

function placeBuild(x, y) {
    Object.entries(selectedBuilding.cost).forEach(([r, amt]) => {
        resources[r] -= amt;
    });

    if (selectedBuilding.tile === TILES.HOUSE) {
        setTile(x, y, TILES.HOUSE);
        setTile(x + 1, y, TILES.HOUSE_BASE);
        setTile(x, y + 1, TILES.HOUSE_BASE);
        setTile(x + 1, y + 1, TILES.HOUSE_BASE);
    } else {
        setTile(x, y, selectedBuilding.tile);
    }

    spawnParticles(x + 0.5, y + 0.5, '#ffd700', 8);
    player.exp += 20;
    checkLevelUp();

    buildMode = false;
    selectedBuilding = null;
    updateUI();
}

// ============= SURVIVOR MANAGEMENT =============
// ============= SURVIVOR MANAGEMENT =============
function toggleSurvivorMenu() {
    const menu = document.getElementById('survivorMenu');

    // Toggle
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
        gameState.paused = false;
        return;
    }

    const container = document.getElementById('roleAssignments');
    container.innerHTML = '';

    if (survivors.length <= 1) {
        container.innerHTML = '<p style="color:#888;text-align:center;padding:20px;">No team members yet.<br>Survivors will come during daytime!</p>';
    } else {
        survivors.forEach((s, i) => {
            if (s.isPlayer) return;

            const div = document.createElement('div');
            div.className = 'survivor-manage-item';

            // Health percentage for visual bar
            const hpPercent = (s.health / s.maxHealth) * 100;
            const hpColor = hpPercent > 50 ? '#44ff44' : hpPercent > 25 ? '#ffff44' : '#ff4444';

            div.innerHTML = `
                <div class="survivor-info">
                    <div class="survivor-name">${s.name}</div>
                    <div class="survivor-stats">
                        <span>Role: ${s.role}</span>
                        <span>Lv.1</span>
                    </div>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:4px; align-items:center;">
                    <div class="survivor-hp-bar">
                        <div class="survivor-hp-fill" style="width:${hpPercent}%; background:${hpColor}"></div>
                    </div>
                    <span style="font-size:9px; color:#888">${Math.floor(s.health)}/${s.maxHealth}</span>
                </div>

                <div style="display:flex; align-items:center; gap:12px;">
                    <!-- Custom Select for Role -->
                    <div class="custom-select-wrapper" id="roleSelect_${i}">
                        <div class="custom-select">
                            <div class="custom-select__trigger" onclick="toggleRoleSelect(${i})">
                                <span>${s.role}</span>
                                <i class="material-icons" style="font-size:14px;">arrow_drop_down</i>
                            </div>
                            <div class="custom-select-options">
                                ${ROLES.map(r => `
                                    <span class="custom-option" onclick="assignRole(${i}, '${r}')" data-value="${r}">
                                        ${r}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Follow Toggle -->
                    <div class="follow-toggle ${s.isFollowing ? 'active' : ''}" onclick="toggleIndividualFollow(${i})" title="Toggle Follow">
                        <i class="material-icons">${s.isFollowing ? 'directions_run' : 'front_hand'}</i>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    }

    menu.style.display = 'block';
    gameState.paused = true;

    // Close dropdowns when clicking outside
    window.onclick = function (e) {
        if (!e.target.closest('.custom-select')) {
            document.querySelectorAll('.custom-select').forEach(el => el.classList.remove('open'));
        }
    }
}

// Custom Select Logic
window.toggleRoleSelect = function (idx) {
    const wrapper = document.getElementById(`roleSelect_${idx}`);
    const select = wrapper.querySelector('.custom-select');
    const item = wrapper.closest('.survivor-manage-item');

    // Close others
    document.querySelectorAll('.custom-select').forEach(el => {
        if (el !== select) {
            el.classList.remove('open');
            const otherItem = el.closest('.survivor-manage-item');
            if (otherItem) otherItem.style.zIndex = '1';
        }
    });

    select.classList.toggle('open');
    if (select.classList.contains('open')) {
        item.style.zIndex = '1000'; // Bring this item to top so dropdown is visible
    } else {
        item.style.zIndex = '1';
    }

    // Prevent window.onclick from closing immediately
    if (typeof event !== 'undefined') event.stopPropagation();
}

function assignRole(idx, role) {
    survivors[idx].role = role;
    // Update the UI text immediately
    const wrapper = document.getElementById(`roleSelect_${idx}`);
    if (wrapper) {
        wrapper.querySelector('.custom-select__trigger span').textContent = role;
        wrapper.querySelector('.custom-select').classList.remove('open');
    }
    updateSurvivorList();
    event.stopPropagation();
}

function toggleIndividualFollow(idx) {
    survivors[idx].isFollowing = !survivors[idx].isFollowing;
    // Re-render to update icon state (lazy way, or update class directly)
    toggleSurvivorMenu(); // Just re-open to refresh is easiest for now
    updateSurvivorList(); // If we show follow status in list
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
// ============= NEW SYSTEM UI HANDLERS =============

function toggleQuestMenu() {
    const menu = document.getElementById('questMenu');
    if (!menu) return;

    if (menu.style.display === 'block') {
        menu.style.display = 'none';
        gameState.paused = false;
    } else {
        closeAllMenus();
        menu.style.display = 'block';
        gameState.paused = true;
        if (typeof QuestSystem !== 'undefined') QuestSystem.updateQuestUI();
    }
}

function toggleSkillMenu() {
    const menu = document.getElementById('skillMenu');
    if (!menu) return;

    if (menu.style.display === 'block') {
        menu.style.display = 'none';
        gameState.paused = false;
    } else {
        closeAllMenus();
        menu.style.display = 'block';
        gameState.paused = true;
        if (typeof SkillSystem !== 'undefined') {
            SkillSystem.updateSkillUI();
            SkillSystem.updatePerkUI();
        }
    }
}

function showSkillTab(tab) {
    const skillGrid = document.getElementById('skillTreeGrid');
    const perkGrid = document.getElementById('perkTreeGrid');
    const tabs = document.querySelectorAll('.skill-tabs .tab-btn');

    tabs.forEach(t => t.classList.remove('active'));

    if (tab === 'skills') {
        skillGrid.style.display = 'grid';
        perkGrid.style.display = 'none';
        tabs[0].classList.add('active');
    } else {
        skillGrid.style.display = 'none';
        perkGrid.style.display = 'grid';
        tabs[1].classList.add('active');
    }
}

function toggleAchievementMenu() {
    const menu = document.getElementById('achievementMenu');
    if (!menu) return;

    if (menu.style.display === 'block') {
        menu.style.display = 'none';
        gameState.paused = false;
    } else {
        closeAllMenus();
        menu.style.display = 'block';
        gameState.paused = true;
        updateAchievementUI();
    }
}

function updateAchievementUI() {
    if (typeof AchievementSystem === 'undefined') return;

    const container = document.getElementById('achievementList');
    if (!container) return;

    container.innerHTML = '';

    const achievements = AchievementSystem.getAchievementList();
    const count = AchievementSystem.getUnlockedCount();
    const total = AchievementSystem.getTotalCount();
    const percent = AchievementSystem.getCompletionPercent();

    // These elements exist in index.html
    const countEl = document.getElementById('achievedCount');
    const totalEl = document.getElementById('achievedTotal');
    const percentEl = document.getElementById('achievedPercent');

    if (countEl) countEl.textContent = count;
    if (totalEl) totalEl.textContent = total;
    if (percentEl) percentEl.textContent = Math.round(percent);

    achievements.forEach(a => {
        const div = document.createElement('div');
        div.className = `achievement-item ${a.unlocked ? 'unlocked' : ''}`;

        div.innerHTML = `
            <div class="achievement-icon">${a.unlocked ? a.icon : '❓'}</div>
            <div class="achievement-details">
                <span class="achievement-name">${a.name} ${a.tier > 1 ? '(Tier ' + a.tier + ')' : ''}</span>
                <span class="achievement-desc">${a.description}</span>
                <div class="achievement-progress-container">
                    Progress: ${a.progress}/${a.maxProgress}
                    <div class="achievement-bar">
                        <div class="achievement-fill" style="width: ${a.progressPercent}%"></div>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(div);
    });
}

function toggleCraftingMenu() {
    const menu = document.getElementById('craftingMenu');
    if (!menu) return;

    if (menu.style.display === 'block') {
        menu.style.display = 'none';
        gameState.paused = false;
    } else {
        closeAllMenus();
        menu.style.display = 'block';
        gameState.paused = true;
        if (typeof CraftingSystem !== 'undefined') {
            CraftingSystem.updateRecipeUI();
            CraftingSystem.updateResearchUI();
        }
    }
}

function showCraftingTab(tab) {
    const recipes = document.getElementById('recipeList');
    const research = document.getElementById('researchList');
    const tabs = document.querySelectorAll('#craftingMenu .tab-btn');

    tabs.forEach(t => t.classList.remove('active'));

    if (tab === 'recipes') {
        recipes.style.display = 'grid';
        research.style.display = 'none';
        tabs[0].classList.add('active');
    } else {
        recipes.style.display = 'none';
        research.style.display = 'grid';
        tabs[1].classList.add('active');
    }
}

function toggleEquipmentMenu() {
    const menu = document.getElementById('equipmentMenu');
    if (!menu) return;

    if (menu.style.display === 'block') {
        menu.style.display = 'none';
        gameState.paused = false;
    } else {
        closeAllMenus();
        menu.style.display = 'block';
        gameState.paused = true;
        if (typeof EquipmentSystem !== 'undefined') {
            EquipmentSystem.updateEquipmentUI();
            EquipmentSystem.updateInventoryUI();
            EquipmentSystem.updateStatsUI();
        }
    }
}

function closeAllMenus() {
    const menus = ['buildMenu', 'survivorMenu', 'questMenu', 'skillMenu', 'achievementMenu', 'craftingMenu', 'equipmentMenu'];
    menus.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    if (typeof closeBuildMenu === 'function') closeBuildMenu();
}

function interact() {
    // Basic interaction: eat food if available
    if (resources.food >= 5 && player.health < player.maxHealth) {
        resources.food -= 5;
        player.health = Math.min(player.maxHealth, player.health + 10);
        showNotification("Ate some food. Health +10", []);
    } else if (resources.food < 5) {
        showNotification("Not enough food!", []);
    } else {
        showNotification("Health is full.", []);
    }
}

function attackAction() {
    // Set space key as pressed in input state to trigger attack in game loop
    if (typeof inputState !== 'undefined') {
        inputState.space = true;
        // The attack logic in game.js handles the actual hit
    }
}
