// ============================================
// SAVE/LOAD SYSTEM - Persistent Game State
// ============================================
// Handles saving and loading game state to/from LocalStorage
// with compression, versioning, and corruption recovery

const SaveSystem = (function () {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        SAVE_KEY: 'jungle_survivors_save',
        SETTINGS_KEY: 'jungle_survivors_settings',
        AUTOSAVE_KEY: 'jungle_survivors_autosave',
        SAVE_VERSION: 1,
        MAX_SAVE_SLOTS: 5,
        AUTOSAVE_INTERVAL: 60000, // 1 minute
        COMPRESSION_ENABLED: true,
        MAX_CHUNKS_TO_SAVE: 50,
        BACKUP_COUNT: 3
    };

    // ============= STATE =============
    let autosaveTimer = null;
    let lastSaveTime = 0;
    let saveInProgress = false;

    // ============= SAVE DATA STRUCTURE =============
    function createSaveData() {
        return {
            version: CONFIG.SAVE_VERSION,
            timestamp: Date.now(),
            gameTime: timing?.gameTime || 0,
            seed: seed,

            // Player state
            player: {
                x: player.x,
                y: player.y,
                health: player.health,
                maxHealth: player.maxHealth,
                hunger: player.hunger,
                maxHunger: player.maxHunger,
                exp: player.exp,
                level: player.level,
                expToLevel: player.expToLevel,
                direction: player.direction,
                // Equipment (from equipment system)
                equipment: typeof EquipmentSystem !== 'undefined'
                    ? EquipmentSystem.getPlayerEquipment()
                    : null,
                // Skills (from skill system)
                skills: typeof SkillSystem !== 'undefined'
                    ? SkillSystem.getPlayerSkills()
                    : null,
                // Perks (from perk system)
                perks: typeof PerkSystem !== 'undefined'
                    ? PerkSystem.getPlayerPerks()
                    : null
            },

            // Resources
            resources: { ...resources },

            // Time state
            time: {
                dayCount: dayCount,
                timeOfDay: timeOfDay,
                isNight: isNight
            },

            // Survivors
            survivors: survivors.filter(s => !s.isPlayer).map(s => ({
                id: s.id,
                name: s.name,
                role: s.role,
                x: s.x,
                y: s.y,
                health: s.health,
                maxHealth: s.maxHealth,
                isFollowing: s.isFollowing,
                gender: s.gender,
                skinColor: s.skinColor,
                hairColor: s.hairColor,
                clothingColor: s.clothingColor,
                morale: s.morale || 100,
                happiness: s.happiness || 100
            })),

            // Buildings
            buildings: buildings.map(b => ({
                x: b.x,
                y: b.y,
                tile: b.tile,
                level: b.level || 1,
                health: b.health,
                maxHealth: b.maxHealth
            })),

            // Modified chunks (tile changes)
            modifiedTiles: serializeModifiedChunks(),

            // Quests (from quest system)
            quests: typeof QuestSystem !== 'undefined'
                ? QuestSystem.getQuestState()
                : null,

            // Achievements (from achievement system)
            achievements: typeof AchievementSystem !== 'undefined'
                ? AchievementSystem.getUnlockedAchievements()
                : null,

            // Statistics
            stats: {
                zombiesKilled: window.gameStats?.zombiesKilled || 0,
                resourcesGathered: window.gameStats?.resourcesGathered || 0,
                buildingsPlaced: window.gameStats?.buildingsPlaced || 0,
                survivorsRecruited: window.gameStats?.survivorsRecruited || 0,
                distanceTraveled: window.gameStats?.distanceTraveled || 0,
                timePlayed: window.gameStats?.timePlayed || 0,
                bossesDefeated: window.gameStats?.bossesDefeated || 0,
                questsCompleted: window.gameStats?.questsCompleted || 0
            },

            // Phase 1 New Systems State
            petSystem: typeof PetSystem !== 'undefined'
                ? PetSystem.getState()
                : null,
            shelterSystem: typeof ShelterSystem !== 'undefined'
                ? ShelterSystem.getState()
                : null,
            farmingSystem: typeof FarmingSystem !== 'undefined'
                ? FarmingSystem.getState()
                : null,
            cookingSystem: typeof CookingSystem !== 'undefined'
                ? CookingSystem.getState()
                : null
        };
    }

    // ============= SERIALIZATION =============
    function serializeModifiedChunks() {
        const serialized = {};

        // Limit chunks to save for performance
        let chunkCount = 0;

        for (const [key, modifications] of modifiedChunks) {
            if (chunkCount >= CONFIG.MAX_CHUNKS_TO_SAVE) break;

            if (modifications && modifications.size > 0) {
                const chunk = chunks.get(key);
                if (chunk) {
                    // Only save modified tile indices and their values
                    const tileData = {};
                    for (const idx of modifications) {
                        tileData[idx] = chunk[idx];
                    }
                    serialized[key] = tileData;
                    chunkCount++;
                }
            }
        }

        return serialized;
    }

    function deserializeModifiedChunks(data) {
        if (!data) return;

        for (const [key, tileData] of Object.entries(data)) {
            // Parse chunk coordinates
            const [cxStr, cyStr] = key.split(',');
            const cx = parseInt(cxStr, 10);
            const cy = parseInt(cyStr, 10);

            if (isNaN(cx) || isNaN(cy)) continue;

            // Get or create the chunk
            const chunk = getChunk(cx, cy);
            if (!chunk) continue;

            // Apply modifications
            const modSet = new Set();
            for (const [idxStr, tile] of Object.entries(tileData)) {
                const idx = parseInt(idxStr, 10);
                if (!isNaN(idx) && idx >= 0 && idx < CHUNK_SIZE * CHUNK_SIZE) {
                    chunk[idx] = tile;
                    modSet.add(idx);
                }
            }

            // Track modifications
            if (modSet.size > 0) {
                modifiedChunks.set(key, modSet);
            }
        }
    }

    // ============= COMPRESSION =============
    function compress(data) {
        if (!CONFIG.COMPRESSION_ENABLED) return data;

        try {
            const jsonStr = JSON.stringify(data);
            // Simple RLE-like compression for repeated characters
            return btoa(encodeURIComponent(jsonStr));
        } catch (e) {
            console.warn('Compression failed, using raw data:', e);
            return JSON.stringify(data);
        }
    }

    function decompress(data) {
        if (!CONFIG.COMPRESSION_ENABLED) return data;

        try {
            // Check if data is base64 encoded
            if (/^[A-Za-z0-9+/=]+$/.test(data)) {
                const decoded = decodeURIComponent(atob(data));
                return JSON.parse(decoded);
            }
            return JSON.parse(data);
        } catch (e) {
            console.warn('Decompression failed:', e);
            return null;
        }
    }

    // ============= SAVE OPERATIONS =============
    function save(slotIndex = 0) {
        if (saveInProgress) {
            console.warn('Save already in progress');
            return false;
        }

        saveInProgress = true;

        try {
            const saveData = createSaveData();
            const compressed = compress(saveData);

            // Create slot key
            const slotKey = `${CONFIG.SAVE_KEY}_slot${slotIndex}`;

            // Create backup before overwriting
            createBackup(slotKey);

            // Save to localStorage
            localStorage.setItem(slotKey, compressed);

            // Update save metadata
            updateSaveMetadata(slotIndex, saveData);

            lastSaveTime = Date.now();
            saveInProgress = false;

            console.log(`Game saved to slot ${slotIndex}`);

            // Show notification
            if (typeof showNotification === 'function') {
                showNotification(
                    '<i class="material-icons">save</i> Game Saved!',
                    []
                );
            }

            return true;
        } catch (e) {
            console.error('Save failed:', e);
            saveInProgress = false;

            if (e.name === 'QuotaExceededError') {
                // LocalStorage full - try to clear old data
                clearOldSaves();
                return save(slotIndex); // Retry
            }

            return false;
        }
    }

    function autosave() {
        const saveData = createSaveData();
        const compressed = compress(saveData);

        try {
            localStorage.setItem(CONFIG.AUTOSAVE_KEY, compressed);
            console.debug('Autosave complete');
        } catch (e) {
            console.warn('Autosave failed:', e);
        }
    }

    function createBackup(slotKey) {
        try {
            const existing = localStorage.getItem(slotKey);
            if (!existing) return;

            // Rotate backups
            for (let i = CONFIG.BACKUP_COUNT - 1; i > 0; i--) {
                const prevBackup = localStorage.getItem(`${slotKey}_backup${i - 1}`);
                if (prevBackup) {
                    localStorage.setItem(`${slotKey}_backup${i}`, prevBackup);
                }
            }

            // Save current as first backup
            localStorage.setItem(`${slotKey}_backup0`, existing);
        } catch (e) {
            console.warn('Backup creation failed:', e);
        }
    }

    function updateSaveMetadata(slotIndex, saveData) {
        try {
            const metaKey = `${CONFIG.SAVE_KEY}_meta`;
            let meta = JSON.parse(localStorage.getItem(metaKey) || '{}');

            meta[slotIndex] = {
                timestamp: saveData.timestamp,
                dayCount: saveData.time.dayCount,
                playerLevel: saveData.player.level,
                survivorCount: saveData.survivors.length + 1,
                playTime: saveData.stats.timePlayed
            };

            localStorage.setItem(metaKey, JSON.stringify(meta));
        } catch (e) {
            console.warn('Metadata update failed:', e);
        }
    }

    // ============= LOAD OPERATIONS =============
    function load(slotIndex = 0) {
        try {
            const slotKey = `${CONFIG.SAVE_KEY}_slot${slotIndex}`;
            const compressed = localStorage.getItem(slotKey);

            if (!compressed) {
                console.log('No save data found in slot', slotIndex);
                return false;
            }

            const saveData = decompress(compressed);
            if (!saveData) {
                console.error('Failed to decompress save data');
                return tryLoadBackup(slotKey);
            }

            // Validate save version
            if (saveData.version !== CONFIG.SAVE_VERSION) {
                console.log('Save version mismatch, attempting migration');
                migrateSaveData(saveData);
            }

            // Apply save data to game state
            applySaveData(saveData);

            console.log(`Game loaded from slot ${slotIndex}`);

            if (typeof showNotification === 'function') {
                showNotification(
                    '<i class="material-icons">folder_open</i> Game Loaded!',
                    []
                );
            }

            return true;
        } catch (e) {
            console.error('Load failed:', e);
            return tryLoadBackup(`${CONFIG.SAVE_KEY}_slot${slotIndex}`);
        }
    }

    function loadAutosave() {
        try {
            const compressed = localStorage.getItem(CONFIG.AUTOSAVE_KEY);
            if (!compressed) return false;

            const saveData = decompress(compressed);
            if (!saveData) return false;

            applySaveData(saveData);
            console.log('Autosave loaded');
            return true;
        } catch (e) {
            console.error('Autosave load failed:', e);
            return false;
        }
    }

    function tryLoadBackup(slotKey) {
        for (let i = 0; i < CONFIG.BACKUP_COUNT; i++) {
            try {
                const backup = localStorage.getItem(`${slotKey}_backup${i}`);
                if (!backup) continue;

                const saveData = decompress(backup);
                if (saveData) {
                    console.log(`Loaded from backup ${i}`);
                    applySaveData(saveData);
                    return true;
                }
            } catch (e) {
                continue;
            }
        }
        return false;
    }

    function applySaveData(saveData) {
        // Apply seed first for world generation
        seed = saveData.seed;

        // Clear existing state
        chunks.clear();
        modifiedChunks.clear();
        zombies = [];
        projectiles = [];
        particles = [];
        damageNumbers = [];
        buildings = [];
        if (typeof activeTowers !== 'undefined') activeTowers.clear();

        // Apply player state
        Object.assign(player, {
            x: saveData.player.x,
            y: saveData.player.y,
            health: saveData.player.health,
            maxHealth: saveData.player.maxHealth,
            hunger: saveData.player.hunger,
            maxHunger: saveData.player.maxHunger,
            exp: saveData.player.exp,
            level: saveData.player.level,
            expToLevel: saveData.player.expToLevel,
            direction: saveData.player.direction,
            prevX: saveData.player.x,
            prevY: saveData.player.y,
            attackCooldown: 0,
            hitTimer: 0,
            isMoving: false,
            path: null
        });

        // Apply equipment if system exists
        if (saveData.player.equipment && typeof EquipmentSystem !== 'undefined') {
            EquipmentSystem.setPlayerEquipment(saveData.player.equipment);
        }

        // Apply skills if system exists
        if (saveData.player.skills && typeof SkillSystem !== 'undefined') {
            SkillSystem.setPlayerSkills(saveData.player.skills);
        }

        // Apply perks if system exists
        if (saveData.player.perks && typeof PerkSystem !== 'undefined') {
            PerkSystem.setPlayerPerks(saveData.player.perks);
        }

        // Apply resources
        Object.assign(resources, saveData.resources);

        // Apply time state
        dayCount = saveData.time.dayCount;
        timeOfDay = saveData.time.timeOfDay;
        isNight = saveData.time.isNight;

        // Regenerate starting base and apply modifications
        generateStartingBase();
        deserializeModifiedChunks(saveData.modifiedTiles);

        // Rebuild buildings from saved data
        for (const b of saveData.buildings) {
            buildings.push({
                x: b.x,
                y: b.y,
                tile: b.tile,
                type: b.tile,
                level: b.level || 1,
                health: b.health,
                maxHealth: b.maxHealth
            });

            buildingMap.set(`${b.x},${b.y}`, buildings[buildings.length - 1]);

            // Register towers
            if ((b.tile === TILES.TOWER || b.tile === TILES.CANNON) &&
                typeof registerTower === 'function') {
                registerTower(b.x, b.y, b.tile);
            }
        }

        // Rebuild survivors
        survivors = [{
            id: 0,
            name: 'You (Leader)',
            role: 'Leader',
            x: player.x,
            y: player.y,
            health: player.health,
            maxHealth: player.maxHealth,
            isPlayer: true
        }];

        for (const s of saveData.survivors) {
            survivors.push({
                id: s.id,
                name: s.name,
                role: s.role,
                x: s.x,
                y: s.y,
                health: s.health,
                maxHealth: s.maxHealth,
                isPlayer: false,
                isFollowing: s.isFollowing,
                gender: s.gender,
                skinColor: s.skinColor,
                hairColor: s.hairColor,
                clothingColor: s.clothingColor,
                morale: s.morale || 100,
                happiness: s.happiness || 100,
                state: 'IDLE'
            });
        }

        // Apply quests if system exists
        if (saveData.quests && typeof QuestSystem !== 'undefined') {
            QuestSystem.setQuestState(saveData.quests);
        }

        // Apply achievements if system exists
        if (saveData.achievements && typeof AchievementSystem !== 'undefined') {
            AchievementSystem.setUnlockedAchievements(saveData.achievements);
        }

        // Apply statistics
        if (saveData.stats) {
            window.gameStats = { ...saveData.stats };
        }

        // Phase 1 New Systems State
        if (saveData.petSystem && typeof PetSystem !== 'undefined') {
            PetSystem.setState(saveData.petSystem);
        }
        if (saveData.shelterSystem && typeof ShelterSystem !== 'undefined') {
            ShelterSystem.setState(saveData.shelterSystem);
        }
        if (saveData.farmingSystem && typeof FarmingSystem !== 'undefined') {
            FarmingSystem.setState(saveData.farmingSystem);
        }
        if (saveData.cookingSystem && typeof CookingSystem !== 'undefined') {
            CookingSystem.setState(saveData.cookingSystem);
        }

        timing.gameTime = saveData.gameTime;

        // Update UI
        if (typeof updateSurvivorList === 'function') {
            updateSurvivorList();
        }
        if (typeof updateUI === 'function') {
            updateUI();
        }

        // Reset camera to player
        if (camera) {
            camera.x = player.x * TILE_SIZE * SCALE - canvas.width / 2;
            camera.y = player.y * TILE_SIZE * SCALE - canvas.height / 2;
            camera.targetX = camera.x;
            camera.targetY = camera.y;
        }
    }

    // ============= MIGRATION =============
    function migrateSaveData(saveData) {
        // Handle save version migrations
        const version = saveData.version || 0;

        if (version < 1) {
            // Version 0 -> 1 migration
            if (!saveData.stats) {
                saveData.stats = {
                    zombiesKilled: 0,
                    resourcesGathered: 0,
                    buildingsPlaced: 0,
                    survivorsRecruited: 0,
                    distanceTraveled: 0,
                    timePlayed: 0
                };
            }
        }

        saveData.version = CONFIG.SAVE_VERSION;
    }

    // ============= UTILITY FUNCTIONS =============
    function hasSaveData(slotIndex = 0) {
        const slotKey = `${CONFIG.SAVE_KEY}_slot${slotIndex}`;
        return localStorage.getItem(slotKey) !== null;
    }

    function hasAutosave() {
        return localStorage.getItem(CONFIG.AUTOSAVE_KEY) !== null;
    }

    function getSaveMetadata() {
        try {
            const metaKey = `${CONFIG.SAVE_KEY}_meta`;
            return JSON.parse(localStorage.getItem(metaKey) || '{}');
        } catch (e) {
            return {};
        }
    }

    function deleteSave(slotIndex = 0) {
        const slotKey = `${CONFIG.SAVE_KEY}_slot${slotIndex}`;

        localStorage.removeItem(slotKey);

        // Remove backups
        for (let i = 0; i < CONFIG.BACKUP_COUNT; i++) {
            localStorage.removeItem(`${slotKey}_backup${i}`);
        }

        // Update metadata
        try {
            const metaKey = `${CONFIG.SAVE_KEY}_meta`;
            let meta = JSON.parse(localStorage.getItem(metaKey) || '{}');
            delete meta[slotIndex];
            localStorage.setItem(metaKey, JSON.stringify(meta));
        } catch (e) {
            console.warn('Metadata cleanup failed:', e);
        }
    }

    function deleteAllSaves() {
        for (let i = 0; i < CONFIG.MAX_SAVE_SLOTS; i++) {
            deleteSave(i);
        }
        localStorage.removeItem(CONFIG.AUTOSAVE_KEY);
        localStorage.removeItem(`${CONFIG.SAVE_KEY}_meta`);
    }

    function clearOldSaves() {
        // Remove oldest backups to free space
        const meta = getSaveMetadata();
        const slots = Object.entries(meta).sort((a, b) => a[1].timestamp - b[1].timestamp);

        if (slots.length > 0) {
            const [oldestSlot] = slots[0];
            deleteSave(parseInt(oldestSlot, 10));
        }
    }

    function getStorageUsage() {
        let total = 0;
        for (const key of Object.keys(localStorage)) {
            if (key.startsWith('jungle_survivors')) {
                total += localStorage.getItem(key).length;
            }
        }
        return {
            used: total,
            usedKB: (total / 1024).toFixed(2),
            maxKB: 5120 // 5MB typical limit
        };
    }

    // ============= AUTOSAVE MANAGEMENT =============
    function startAutosave() {
        if (autosaveTimer) {
            clearInterval(autosaveTimer);
        }

        autosaveTimer = setInterval(() => {
            if (gameState.running && !gameState.paused) {
                autosave();
            }
        }, CONFIG.AUTOSAVE_INTERVAL);

        console.log('Autosave started');
    }

    function stopAutosave() {
        if (autosaveTimer) {
            clearInterval(autosaveTimer);
            autosaveTimer = null;
        }
    }

    // ============= SETTINGS =============
    function saveSettings(settings) {
        try {
            localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(settings));
            return true;
        } catch (e) {
            console.error('Failed to save settings:', e);
            return false;
        }
    }

    function loadSettings() {
        try {
            const data = localStorage.getItem(CONFIG.SETTINGS_KEY);
            return data ? JSON.parse(data) : getDefaultSettings();
        } catch (e) {
            return getDefaultSettings();
        }
    }

    function getDefaultSettings() {
        return {
            musicVolume: 0.5,
            sfxVolume: 0.7,
            showFPS: true,
            showCoords: true,
            particleQuality: 'high',
            autosaveEnabled: true,
            confirmOnExit: true
        };
    }

    // ============= PUBLIC API =============
    return {
        save,
        load,
        autosave,
        loadAutosave,
        hasSaveData,
        hasAutosave,
        getSaveMetadata,
        deleteSave,
        deleteAllSaves,
        getStorageUsage,
        startAutosave,
        stopAutosave,
        saveSettings,
        loadSettings,
        getDefaultSettings,
        CONFIG
    };
})();

// ============= GLOBAL STATS TRACKING =============
window.gameStats = window.gameStats || {
    zombiesKilled: 0,
    resourcesGathered: 0,
    buildingsPlaced: 0,
    survivorsRecruited: 0,
    distanceTraveled: 0,
    timePlayed: 0,
    bossesDefeated: 0,
    questsCompleted: 0
};

// Track playtime
setInterval(() => {
    if (gameState?.running && !gameState?.paused) {
        window.gameStats.timePlayed += 1;
    }
}, 1000);

// Export for global access
window.SaveSystem = SaveSystem;
