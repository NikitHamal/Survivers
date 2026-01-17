// Initialize debug states
window.godMode = false;
window.debugCollision = false;
window.speedHack = false;
window.invisibility = false;

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
    const speedEl = document.getElementById('debugSpeed');
    const invisEl = document.getElementById('debugInvisibility');

    if (invincEl) invincEl.innerText = window.godMode ? 'ON' : 'OFF';
    if (collEl) collEl.innerText = window.debugCollision ? 'ON' : 'OFF';
    if (speedEl) speedEl.innerText = window.speedHack ? 'ON' : 'OFF';
    if (invisEl) invisEl.innerText = window.invisibility ? 'ON' : 'OFF';
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
    gameTime = isDay ? 10 : (typeof DAY_LENGTH !== 'undefined' ? DAY_LENGTH : 240) * 0.75;
    if (typeof updateUI === 'function') updateUI();
}

function debugAdvanceTime(hours = 1) {
    timeOfDay += (hours / 24);
    if (timeOfDay >= 1) {
        timeOfDay -= 1;
        dayCount++;
    }
    if (typeof updateUI === 'function') updateUI();
    if (typeof showNotification === 'function') showNotification(`Advanced time by ${hours} hours`);
}

function debugSpawnSurvivor() {
    if (typeof spawnNewSurvivor === 'function') {
        spawnNewSurvivor(true);
        if (typeof updateUI === 'function') updateUI();
    }
}

function debugSpawnZombie() {
    if (typeof spawnZombie === 'function') {
        spawnZombie(true);
    }
}

function debugKillAllZombies() {
    const count = zombies.length;
    zombies.length = 0;
    if (typeof showNotification === 'function') showNotification(`Debug: ${count} zombies disintegrated!`);
    spawnParticles(player.x, player.y, '#ff4444', 30);
}

function debugMaxStats() {
    if (player) {
        player.health = player.maxHealth;
        player.hunger = 100;
        player.exp = 0;
        player.level = 20;
        player.expToLevel = 999999; // Practically maxed
    }

    // Skill system integration
    if (typeof SkillSystem !== 'undefined') {
        const skillsObj = SkillSystem.getPlayerSkills();
        Object.keys(SkillSystem.SKILLS).forEach(s => {
            skillsObj.skills[s] = 10;
            skillsObj.skillXP[s] = 0;
        });
        SkillSystem.setPlayerSkills(skillsObj);
        SkillSystem.addSkillPoints(50);
        SkillSystem.addPerkPoints(50);
    }

    if (typeof updateUI === 'function') updateUI();
    if (typeof showNotification === 'function') showNotification("Max Level & Stats!");
}

function debugTameNearby() {
    if (typeof PetSystem !== 'undefined') {
        const wild = PetSystem.getWildAnimals();
        let count = 0;
        for (const animal of [...wild]) {
            const dist = Math.sqrt((animal.x - player.x) ** 2 + (animal.y - player.y) ** 2);
            if (dist < 15) {
                PetSystem.addPet(animal.type.id);
                // Remove from wild array manually
                const idx = wild.indexOf(animal);
                if (idx !== -1) wild.splice(idx, 1);
                count++;
            }
        }
        if (typeof showNotification === 'function') showNotification(`Debug: ${count} wild animals tamed!`);
    }
}

function debugSpawnPet() {
    if (typeof PetSystem !== 'undefined') {
        const types = ['WOLF', 'BEAR', 'TIGER', 'HAWK', 'FOX', 'HORSE', 'CAMEL', 'BOAR', 'BEAVER'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        PetSystem.addPet(randomType);
    }
}

function debugUnlockAll() {
    // Crafting & Research
    if (typeof CraftingSystem !== 'undefined') {
        const researchIds = Object.keys(CraftingSystem.RESEARCH);
        const state = CraftingSystem.getState();
        state.unlockedResearch = researchIds;
        CraftingSystem.setState(state);

        // Ensure all recipes are unlocked too
        const recipes = CraftingSystem.RECIPES;
        Object.keys(recipes).forEach(id => {
            recipes[id].unlocked = true;
        });
    }

    // Achievements
    if (typeof AchievementSystem !== 'undefined') {
        AchievementSystem.unlockAll();
    }

    if (typeof showNotification === 'function') showNotification("Everything Unlocked!");
}

function debugToggleSpeedHack() {
    window.speedHack = !window.speedHack;
    if (player) {
        // Significantly faster than normal (4.5)
        player.speed = window.speedHack ? 15.0 : 4.5;
    }
    updateDebugUI();
}

function debugToggleInvisibility() {
    window.invisibility = !window.invisibility;
    if (typeof showNotification === 'function') {
        showNotification(window.invisibility ? "INVISIBILITY ON - Zombies will ignore you" : "Invisibility Off");
    }
    updateDebugUI();
}

function debugToggleGodMode() {
    window.godMode = !window.godMode;
    if (window.godMode) {
        if (player) {
            player.health = player.maxHealth;
            player.hunger = 100;
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
        player.hunger = 100;
    }
    if (Array.isArray(survivors)) {
        survivors.forEach(s => s.health = s.maxHealth);
    }
    if (typeof updateUI === 'function') updateUI();
    if (typeof showNotification === 'function') showNotification("All Healed!");
}

function debugRainToggle() {
    if (typeof WeatherSystem !== 'undefined') {
        const current = WeatherSystem.getCurrentWeather().id;
        if (current === 'rain' || current === 'storm') {
            WeatherSystem.setWeather('clear');
            if (typeof showNotification === 'function') showNotification("Skies cleared!");
        } else {
            WeatherSystem.setWeather('rain');
            if (typeof showNotification === 'function') showNotification("It's raining!");
        }
    }
}

// Helper to spawn survivor immediately
function spawnNewSurvivor(force = false) {
    if (typeof survivors === 'undefined') return;

    const s = {
        id: survivors.length + Date.now(),
        x: player.x + (Math.random() - 0.5) * 4,
        y: player.y + (Math.random() - 0.5) * 4,
        role: 'None',
        health: 100,
        maxHealth: 100,
        name: "Debug Survivor",
        attackCooldown: 0,
        state: 'IDLE',
        gender: Math.random() > 0.5 ? 'male' : 'female',
        skinColor: '#ddb088',
        hairColor: '#5a4030',
        clothingColor: '#666',
        isFollowing: false
    };

    survivors.push(s);
    if (typeof updateSurvivorList === 'function') updateSurvivorList();
    if (typeof showNotification === 'function') showNotification(`Debug: Survivor ${s.name} joined!`);
}

function spawnZombie(force = false) {
    if (typeof zombies === 'undefined') return;

    const angle = Math.random() * Math.PI * 2;
    const dist = 6;
    const zx = player.x + Math.cos(angle) * dist;
    const zy = player.y + Math.sin(angle) * dist;

    const newZombie = {
        x: zx,
        y: zy,
        health: 40,
        maxHealth: 40,
        speed: 1.5 + Math.random() * 0.5,
        attackCooldown: 0,
        animTimer: Math.random() * 100
    };

    if (typeof ZombieAI !== 'undefined') {
        newZombie.ai = new ZombieAI(newZombie);
    }

    zombies.push(newZombie);
    if (typeof showNotification === 'function') showNotification('Debug: Zombie Spawned');
}
