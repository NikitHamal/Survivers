// ============= DEBUG / GOD MODE =============

// Initialize debug states
window.godMode = false;
window.debugCollision = false;

function toggleDebugMenu() {
    const menu = document.getElementById('debugMenu');
    if (!menu) return;

    if (menu.style.display === 'block') {
        menu.style.display = 'none';
        gameState.paused = false;
    } else {
        menu.style.display = 'block';
        gameState.paused = true;
        updateDebugUI();
    }
}

function updateDebugUI() {
    const invincEl = document.getElementById('debugInvincible');
    const collEl = document.getElementById('debugCollision');
    if (invincEl) invincEl.innerText = window.godMode ? 'ON' : 'OFF';
    if (collEl) collEl.innerText = window.debugCollision ? 'ON' : 'OFF';
}

// --- CHEAT FUNCTIONS ---

function debugResource(type, amount) {
    if (resources && resources[type] !== undefined) {
        resources[type] += amount;
        if (resources[type] < 0) resources[type] = 0;
        if (typeof updateUI === 'function') updateUI();
        if (typeof spawnParticles === 'function') {
            spawnParticles(player.x, player.y, type === 'food' ? '#ffaa00' : '#888888', 10);
        }
    }
}

function debugTime(isDay) {
    timeOfDay = isDay ? 0.3 : 0.8;
    gameTime = isDay ? 10 : DAY_LENGTH * 0.75;
    if (typeof updateUI === 'function') updateUI();
}

function debugSpawnSurvivor() {
    if (typeof spawnNewSurvivor === 'function') {
        spawnNewSurvivor(true);
        if (typeof updateUI === 'function') updateUI();
        toggleDebugMenu();
    }
}

function debugSpawnZombie() {
    if (typeof spawnZombie === 'function') {
        spawnZombie(true);
        toggleDebugMenu();
    }
}

function debugToggleGodMode() {
    window.godMode = !window.godMode;
    if (window.godMode) {
        if (player) {
            player.health = player.maxHealth;
            player.hunger = player.maxHunger;
        }
        if (typeof showNotification === 'function') showNotification("GOD MODE ACTIVATED");
    } else {
        if (typeof showNotification === 'function') showNotification("God Mode Deactivated");
    }
    updateDebugUI();
    if (typeof updateUI === 'function') updateUI();
}

function debugToggleCollision() {
    window.debugCollision = !window.debugCollision;
    updateDebugUI();
}

function debugHealAll() {
    if (player) {
        player.health = player.maxHealth;
        player.hunger = player.maxHunger;
    }
    if (Array.isArray(survivors)) {
        survivors.forEach(s => s.health = s.maxHealth);
    }
    if (typeof updateUI === 'function') updateUI();
    if (typeof showNotification === 'function') showNotification("All Healed!");
}

// Helper to spawn survivor immediately
function spawnNewSurvivor(force = false) {
    const s = {
        x: player.x + (Math.random() - 0.5) * 4,
        y: player.y + (Math.random() - 0.5) * 4,
        role: 'None',
        health: 50,
        maxHealth: 50,
        name: typeof getRandomName === 'function' ? getRandomName() : "Survivor",
        attackCooldown: 0,
        state: 'IDLE',
        gender: Math.random() > 0.5 ? 'male' : 'female',
        skinColor: typeof getRandomSkinColor === 'function' ? getRandomSkinColor() : '#ddb088',
        hairColor: typeof getRandomHairColor === 'function' ? getRandomHairColor() : '#5a4030',
        clothingColor: typeof getRandomClothingColor === 'function' ? getRandomClothingColor() : '#666'
    };
    survivors.push(s);
    if (typeof updateSurvivorList === 'function') updateSurvivorList();
    if (typeof showNotification === 'function') showNotification(`Debug: Survivor ${s.name} joined!`);
}

function spawnZombie(force = false) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 10;
    const zx = player.x + Math.cos(angle) * dist;
    const zy = player.y + Math.sin(angle) * dist;

    const newZombie = {
        x: zx,
        y: zy,
        health: 30 + (typeof dayCount !== 'undefined' ? dayCount * 2 : 0),
        maxHealth: 30 + (typeof dayCount !== 'undefined' ? dayCount * 2 : 0),
        speed: 1.5 + Math.random() * 0.5,
        attackCooldown: 0,
        animTimer: Math.random() * 100
    };

    // Attach AI if ZombieAI exists
    if (typeof ZombieAI !== 'undefined') {
        newZombie.ai = new ZombieAI(newZombie);
    }

    zombies.push(newZombie);
    if (typeof showNotification === 'function') showNotification('Debug: Zombie Spawned');
}
