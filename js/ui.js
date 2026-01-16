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
    const items = ['🪓', '⛏️', '🗡️', '🍖', '💊'];
    for (let i = 0; i < 5; i++) {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        slot.innerHTML = `<span style="font-size:14px;">${items[i]}</span><span class="inv-count">${i + 1}</span>`;
        slot.onclick = () => selectInventorySlot(i);
        container.appendChild(slot);
    }
}

function selectInventorySlot(idx) {
    document.querySelectorAll('.inv-slot').forEach((s, i) => {
        s.classList.toggle('selected', i === idx);
    });
}

function showNotification(text, buttons) {
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
            gamePaused = false;
        };
        btnContainer.appendChild(btn);
    });

    if (buttons.length > 0) {
        gamePaused = true;
    }

    notif.style.display = 'block';
}

function gameOver(reason) {
    gameRunning = false;
    document.getElementById('deathReason').textContent = reason;
    document.getElementById('finalDays').textContent = dayCount;
    document.getElementById('gameOver').style.display = 'flex';
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
            <div style="font-size:22px;margin-bottom:4px;">${b.icon}</div>
            <div style="font-weight:bold;">${b.name}</div>
            <div style="font-size:8px;color:#888;margin:3px 0;">${b.desc}</div>
            <div style="font-size:8px;color:#aaa;">
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
    gamePaused = true;
}

function closeBuildMenu() {
    document.getElementById('buildMenu').style.display = 'none';
    gamePaused = false;
    buildMode = false;
    selectedBuilding = null;
}

function selectBuilding(idx) {
    selectedBuilding = BUILDINGS[idx];
    buildMode = true;
    document.getElementById('buildMenu').style.display = 'none';
    gamePaused = false;
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
        gamePaused = false;
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
    gamePaused = true;
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
            <span style="color:#666;font-size:8px;">${s.role}</span>
        `;
        list.appendChild(div);
    });

    if (survivors.length > 6) {
        const more = document.createElement('div');
        more.style.cssText = 'color:#888;font-size:9px;padding:2px;';
        more.textContent = `+${survivors.length - 6} more...`;
        list.appendChild(more);
    }

    document.getElementById('survivorCount').textContent = survivors.length;
}
