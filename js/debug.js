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

// ============= BUILDING UPGRADE DEBUG =============
function debugUpgradeNearbyBuildings(tier = 5) {
    if (typeof BuildingUpgradeSystem === 'undefined') {
        if (typeof showNotification === 'function') showNotification("BuildingUpgradeSystem not loaded!");
        return;
    }

    tier = Math.max(1, Math.min(5, tier));
    const radius = 10;
    let count = 0;

    // Get chunks around player
    const chunkSize = typeof CHUNK_SIZE !== 'undefined' ? CHUNK_SIZE : 16;
    const playerChunkX = Math.floor(player.x / chunkSize);
    const playerChunkY = Math.floor(player.y / chunkSize);

    for (let cx = playerChunkX - 1; cx <= playerChunkX + 1; cx++) {
        for (let cy = playerChunkY - 1; cy <= playerChunkY + 1; cy++) {
            const chunkKey = `${cx},${cy}`;
            const chunk = chunks.get(chunkKey);
            if (!chunk) continue;

            for (let lx = 0; lx < chunkSize; lx++) {
                for (let ly = 0; ly < chunkSize; ly++) {
                    const wx = cx * chunkSize + lx;
                    const wy = cy * chunkSize + ly;
                    const tile = chunk[ly * chunkSize + lx];

                    // Check if it's a building
                    const buildingTiles = [TILES.WALL, TILES.TOWER, TILES.CAMPFIRE, TILES.CANNON,
                                          TILES.WORKBENCH, TILES.BED, TILES.CHEST, TILES.FARM];
                    if (!buildingTiles.includes(tile)) continue;

                    // Check distance
                    const dist = Math.sqrt((wx - player.x) ** 2 + (wy - player.y) ** 2);
                    if (dist > radius) continue;

                    // Use proper API to set building level
                    BuildingUpgradeSystem.setBuildingLevel(wx, wy, tier);
                    count++;
                }
            }
        }
    }

    if (typeof showNotification === 'function') {
        showNotification(`Debug: ${count} buildings upgraded to tier ${tier}!`);
    }
}

function debugSpawnTieredBuilding(buildingType = 'wall', tier = 3) {
    if (typeof BuildingUpgradeSystem === 'undefined') {
        if (typeof showNotification === 'function') showNotification("BuildingUpgradeSystem not loaded!");
        return;
    }

    tier = Math.max(1, Math.min(5, tier));

    // Map building type string to TILES constant
    const buildingMap = {
        'wall': TILES.WALL,
        'tower': TILES.TOWER,
        'campfire': TILES.CAMPFIRE,
        'cannon': TILES.CANNON,
        'workbench': TILES.WORKBENCH,
        'bed': TILES.BED,
        'chest': TILES.CHEST,
        'farm': TILES.FARM
    };

    const tileType = buildingMap[buildingType.toLowerCase()];
    if (!tileType) {
        if (typeof showNotification === 'function') {
            showNotification(`Unknown building type: ${buildingType}. Use: wall, tower, campfire, cannon, workbench, bed, chest, farm`);
        }
        return;
    }

    // Place building in front of player
    const px = Math.floor(player.x) + (player.direction === 0 ? 2 : player.direction === 2 ? -2 : 0);
    const py = Math.floor(player.y) + (player.direction === 1 ? 2 : player.direction === 3 ? -2 : 0);

    // Set tile
    if (typeof setTileAt === 'function') {
        setTileAt(px, py, tileType);
    }

    // Use proper API to set building level
    BuildingUpgradeSystem.setBuildingLevel(px, py, tier);

    if (typeof showNotification === 'function') {
        showNotification(`Debug: Spawned tier ${tier} ${buildingType} at (${px}, ${py})`);
    }
}

function debugShowAllTiers() {
    // Spawn a row of walls at all 5 tiers for comparison
    const startX = Math.floor(player.x) + 3;
    const startY = Math.floor(player.y);

    for (let tier = 1; tier <= 5; tier++) {
        const wx = startX + (tier - 1) * 2;
        const wy = startY;

        if (typeof setTileAt === 'function') {
            setTileAt(wx, wy, TILES.WALL);
        }

        if (typeof BuildingUpgradeSystem !== 'undefined') {
            BuildingUpgradeSystem.setBuildingLevel(wx, wy, tier);
        }
    }

    if (typeof showNotification === 'function') {
        showNotification("Debug: Spawned walls at tiers 1-5 for comparison!");
    }
}

function debugShowAllTieredBuildings() {
    // Spawn walls, towers, and campfires at all 5 tiers for comparison
    const startX = Math.floor(player.x) + 3;
    const startY = Math.floor(player.y);

    const buildingTypes = [TILES.WALL, TILES.TOWER, TILES.CAMPFIRE];
    const buildingNames = ['Wall', 'Tower', 'Campfire'];

    for (let row = 0; row < buildingTypes.length; row++) {
        for (let tier = 1; tier <= 5; tier++) {
            const wx = startX + (tier - 1) * 2;
            const wy = startY + row * 2;

            if (typeof setTileAt === 'function') {
                setTileAt(wx, wy, buildingTypes[row]);
            }

            if (typeof BuildingUpgradeSystem !== 'undefined') {
                BuildingUpgradeSystem.setBuildingLevel(wx, wy, tier);
            }
        }
    }

    if (typeof showNotification === 'function') {
        showNotification("Debug: Spawned all building types at tiers 1-5!");
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

// ============= ECOSYSTEM DEBUG =============
function debugSpawnEcosystemAnimal(type = 'random') {
    if (typeof EcosystemSystem === 'undefined') {
        if (typeof showNotification === 'function') showNotification("EcosystemSystem not loaded!");
        return;
    }

    const types = ['wolf', 'bear', 'tiger', 'fox', 'hawk', 'rabbit', 'deer', 'boar', 'snake', 'camel', 'beaver'];
    const spawnType = type === 'random' ? types[Math.floor(Math.random() * types.length)] : type;

    const animal = EcosystemSystem.spawnNearPlayer(spawnType);
    if (animal) {
        if (typeof showNotification === 'function') {
            showNotification(`Debug: Spawned ${spawnType} at (${animal.x.toFixed(1)}, ${animal.y.toFixed(1)})`);
        }
        if (typeof spawnParticles === 'function') {
            spawnParticles(animal.x, animal.y, '#88ff88', 8);
        }
    }
}

function debugSpawnPredators(count = 3) {
    const predators = ['wolf', 'bear', 'tiger', 'snake', 'hawk', 'fox'];
    for (let i = 0; i < count; i++) {
        const type = predators[Math.floor(Math.random() * predators.length)];
        debugSpawnEcosystemAnimal(type);
    }
}

function debugSpawnPrey(count = 5) {
    const prey = ['rabbit', 'deer', 'boar', 'camel', 'beaver'];
    for (let i = 0; i < count; i++) {
        const type = prey[Math.floor(Math.random() * prey.length)];
        debugSpawnEcosystemAnimal(type);
    }
}

function debugKillAllAnimals() {
    if (typeof EcosystemSystem === 'undefined') {
        if (typeof showNotification === 'function') showNotification("EcosystemSystem not loaded!");
        return;
    }

    const count = EcosystemSystem.getAnimals().length;
    EcosystemSystem.debugKillAll();
    if (typeof showNotification === 'function') {
        showNotification(`Debug: ${count} ecosystem animals removed!`);
    }
}

function debugShowEcosystemStats() {
    if (typeof EcosystemSystem === 'undefined') {
        console.log("EcosystemSystem not loaded!");
        return;
    }

    const stats = EcosystemSystem.getStats();
    console.log("=== ECOSYSTEM STATS ===");
    console.log(`Total Animals: ${stats.totalAnimals}`);
    console.log(`Total Corpses: ${stats.totalCorpses}`);
    console.log(`Migration Groups: ${stats.migrationGroups}`);
    console.log(`Recent Hunts: ${stats.recentHunts}`);
    console.log("\nPopulations by Type:");
    for (const [type, count] of Object.entries(stats.populations)) {
        console.log(`  ${type}: ${count}`);
    }
    console.log("\nPopulations by Biome:");
    for (const [biome, pop] of Object.entries(stats.biomePopulations)) {
        console.log(`  ${biome}: ${pop.total} (prey: ${pop.prey}, predators: ${pop.predators})`);
    }

    if (typeof showNotification === 'function') {
        showNotification(`Ecosystem: ${stats.totalAnimals} animals, ${stats.totalCorpses} corpses`);
    }
}

function debugTriggerHunt() {
    if (typeof EcosystemSystem === 'undefined') {
        if (typeof showNotification === 'function') showNotification("EcosystemSystem not loaded!");
        return;
    }

    // Spawn a predator and prey close together
    const prey = EcosystemSystem.spawnNearPlayer('rabbit', 3, 5);
    if (prey) {
        const predator = EcosystemSystem.spawnAnimal('wolf', prey.x + 1, prey.y, prey.biome);
        if (predator) {
            predator.hunger = 0.1; // Very hungry, will hunt
            if (typeof showNotification === 'function') {
                showNotification("Debug: Spawned hungry wolf near rabbit - watch the hunt!");
            }
        }
    }
}

// ============= SURVIVOR AI DEBUG =============
function debugShowSurvivorAIStats() {
    if (typeof SurvivorAISystem === 'undefined') {
        console.log("SurvivorAISystem not loaded!");
        return;
    }

    console.log("=== SURVIVOR AI STATS ===");
    for (const survivor of survivors) {
        if (survivor.isPlayer) continue;
        const ai = SurvivorAISystem.getAI(survivor);
        if (ai) {
            console.log(`${survivor.name} (${survivor.role}):`);
            console.log(`  State: ${survivor.state}`);
            console.log(`  Position: (${survivor.x.toFixed(1)}, ${survivor.y.toFixed(1)})`);
            console.log(`  Health: ${survivor.health}/${survivor.maxHealth}`);
            console.log(`  Is Following: ${survivor.isFollowing}`);
        }
    }
}

function debugSetAllSurvivorsFollowing(follow = true) {
    if (!Array.isArray(survivors)) return;

    for (const survivor of survivors) {
        if (survivor.isPlayer) continue;
        survivor.isFollowing = follow;
        survivor.state = follow ? 'FOLLOWING' : 'IDLE';
    }

    if (typeof showNotification === 'function') {
        showNotification(follow ? "All survivors now following!" : "All survivors stopped following.");
    }
}

function debugAssignRandomRoles() {
    if (!Array.isArray(survivors)) return;

    const roles = ['Soldier', 'Guard', 'Builder', 'Farmer', 'Woodcutter', 'Miner', 'Hunter', 'Medic'];

    for (const survivor of survivors) {
        if (survivor.isPlayer) continue;
        survivor.role = roles[Math.floor(Math.random() * roles.length)];
    }

    if (typeof updateSurvivorList === 'function') updateSurvivorList();
    if (typeof showNotification === 'function') {
        showNotification("Assigned random roles to all survivors!");
    }
}

// ============= ANIMAL AI DEBUG =============
function debugShowAnimalAIStats() {
    if (typeof AnimalAISystem === 'undefined') {
        console.log("AnimalAISystem not loaded!");
        return;
    }

    console.log("=== ANIMAL AI STATS ===");
    const animals = AnimalAISystem.getAnimals();
    for (const animal of animals) {
        console.log(`${animal.type} at (${animal.x.toFixed(1)}, ${animal.y.toFixed(1)}):`);
        console.log(`  Health: ${animal.health}/${animal.maxHealth}`);
        console.log(`  State: ${animal.state}`);
        const ai = AnimalAISystem.getAI(animal);
        if (ai) {
            console.log(`  AI State: ${ai.currentState}`);
        }
    }

    if (typeof showNotification === 'function') {
        showNotification(`Animal AI: ${animals.length} animals tracked`);
    }
}

// ============= BIOME DEBUG =============
function debugShowBiomeAt(x, y) {
    if (typeof WorldVariation === 'undefined') {
        console.log("WorldVariation not loaded!");
        return;
    }

    x = x ?? player.x;
    y = y ?? player.y;

    const biome = WorldVariation.getBiomeAt(x, y);
    const biomeData = WorldVariation.getBiomeDataAt(x, y);

    console.log(`Biome at (${x.toFixed(1)}, ${y.toFixed(1)}): ${biome}`);
    if (biomeData) {
        console.log("Biome Data:", biomeData);
    }

    if (typeof showNotification === 'function') {
        showNotification(`Current biome: ${biome}`);
    }
}

function debugTeleportToBiome(biome) {
    if (typeof WorldVariation === 'undefined') {
        if (typeof showNotification === 'function') showNotification("WorldVariation not loaded!");
        return;
    }

    // Search outward from player for target biome
    for (let radius = 10; radius < 200; radius += 10) {
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
            const x = player.x + Math.cos(angle) * radius;
            const y = player.y + Math.sin(angle) * radius;
            const foundBiome = WorldVariation.getBiomeAt(x, y);

            if (foundBiome === biome) {
                player.x = x;
                player.y = y;
                if (typeof showNotification === 'function') {
                    showNotification(`Teleported to ${biome} biome!`);
                }
                return;
            }
        }
    }

    if (typeof showNotification === 'function') {
        showNotification(`Could not find ${biome} biome nearby.`);
    }
}

// ============= FULL SYSTEM STATUS =============
function debugSystemStatus() {
    console.log("=== GAME SYSTEM STATUS ===");

    const systems = [
        { name: 'WeatherSystem', obj: typeof WeatherSystem !== 'undefined' ? WeatherSystem : null },
        { name: 'BiomeSystem', obj: typeof BiomeSystem !== 'undefined' ? BiomeSystem : null },
        { name: 'BossSystem', obj: typeof BossSystem !== 'undefined' ? BossSystem : null },
        { name: 'HordeSystem', obj: typeof HordeSystem !== 'undefined' ? HordeSystem : null },
        { name: 'MoraleSystem', obj: typeof MoraleSystem !== 'undefined' ? MoraleSystem : null },
        { name: 'EventSystem', obj: typeof EventSystem !== 'undefined' ? EventSystem : null },
        { name: 'SkillSystem', obj: typeof SkillSystem !== 'undefined' ? SkillSystem : null },
        { name: 'QuestSystem', obj: typeof QuestSystem !== 'undefined' ? QuestSystem : null },
        { name: 'CraftingSystem', obj: typeof CraftingSystem !== 'undefined' ? CraftingSystem : null },
        { name: 'EquipmentSystem', obj: typeof EquipmentSystem !== 'undefined' ? EquipmentSystem : null },
        { name: 'BuildingUpgradeSystem', obj: typeof BuildingUpgradeSystem !== 'undefined' ? BuildingUpgradeSystem : null },
        { name: 'SpawnSystem', obj: typeof SpawnSystem !== 'undefined' ? SpawnSystem : null },
        { name: 'PetSystem', obj: typeof PetSystem !== 'undefined' ? PetSystem : null },
        { name: 'ShelterSystem', obj: typeof ShelterSystem !== 'undefined' ? ShelterSystem : null },
        { name: 'FarmingSystem', obj: typeof FarmingSystem !== 'undefined' ? FarmingSystem : null },
        { name: 'CookingSystem', obj: typeof CookingSystem !== 'undefined' ? CookingSystem : null },
        { name: 'WorldVariation', obj: typeof WorldVariation !== 'undefined' ? WorldVariation : null },
        { name: 'SurvivorAISystem', obj: typeof SurvivorAISystem !== 'undefined' ? SurvivorAISystem : null },
        { name: 'AnimalAISystem', obj: typeof AnimalAISystem !== 'undefined' ? AnimalAISystem : null },
        { name: 'EcosystemSystem', obj: typeof EcosystemSystem !== 'undefined' ? EcosystemSystem : null },
        { name: 'EventBus', obj: typeof EventBus !== 'undefined' ? EventBus : null }
    ];

    let loaded = 0;
    for (const sys of systems) {
        const status = sys.obj ? '✓ LOADED' : '✗ NOT LOADED';
        console.log(`  ${sys.name}: ${status}`);
        if (sys.obj) loaded++;
    }

    console.log(`\nTotal: ${loaded}/${systems.length} systems loaded`);

    if (typeof showNotification === 'function') {
        showNotification(`Systems: ${loaded}/${systems.length} loaded`);
    }
}

// Make debug functions globally accessible
window.debugSpawnEcosystemAnimal = debugSpawnEcosystemAnimal;
window.debugSpawnPredators = debugSpawnPredators;
window.debugSpawnPrey = debugSpawnPrey;
window.debugKillAllAnimals = debugKillAllAnimals;
window.debugShowEcosystemStats = debugShowEcosystemStats;
window.debugTriggerHunt = debugTriggerHunt;
window.debugShowSurvivorAIStats = debugShowSurvivorAIStats;
window.debugSetAllSurvivorsFollowing = debugSetAllSurvivorsFollowing;
window.debugAssignRandomRoles = debugAssignRandomRoles;
window.debugShowAnimalAIStats = debugShowAnimalAIStats;
window.debugShowBiomeAt = debugShowBiomeAt;
window.debugTeleportToBiome = debugTeleportToBiome;
window.debugSystemStatus = debugSystemStatus;
