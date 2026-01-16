// ============================================
// HORDE EVENT SYSTEM - Special Zombie Waves
// ============================================
// Complete horde event system with wave mechanics,
// special events, escalating difficulty, and rewards

const HordeSystem = (function() {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        MIN_NIGHT_FOR_HORDE: 3,         // First horde night
        HORDE_INTERVAL_NIGHTS: 3,        // Nights between hordes
        BASE_WAVE_COUNT: 3,              // Starting wave count
        MAX_WAVE_COUNT: 10,              // Maximum waves
        WAVE_INTERVAL: 45,               // Seconds between waves
        ZOMBIE_SPAWN_INTERVAL: 0.5,      // Seconds between zombie spawns
        BASE_ZOMBIES_PER_WAVE: 10,       // Starting zombies per wave
        ZOMBIE_SCALING: 1.3,             // Zombie count multiplier per wave
        DAY_SCALING: 0.15,               // Difficulty scaling per day
        SPECIAL_ZOMBIE_CHANCE: 0.15,     // Chance for special zombies
        ELITE_ZOMBIE_CHANCE: 0.05,       // Chance for elite zombies
        BOSS_WAVE_INTERVAL: 5,           // Boss spawns every X waves
        WARNING_TIME: 30                 // Seconds of warning before horde
    };

    // ============= HORDE EVENT TYPES =============
    const HORDE_TYPES = {
        STANDARD: {
            id: 'standard',
            name: 'Zombie Horde',
            description: 'A massive wave of undead approaches!',
            icon: '💀',
            zombieTypes: ['NORMAL', 'RUNNER', 'TANK'],
            specialChance: 0.15,
            eliteChance: 0.05,
            bossChance: 0.1,
            waveMultiplier: 1.0,
            rewardMultiplier: 1.0
        },

        RUNNER_SWARM: {
            id: 'runner_swarm',
            name: 'Runner Swarm',
            description: 'Fast zombies are rushing your position!',
            icon: '🏃',
            zombieTypes: ['RUNNER'],
            specialChance: 0.3,
            eliteChance: 0.02,
            bossChance: 0.05,
            waveMultiplier: 1.5,
            speedMultiplier: 1.3,
            rewardMultiplier: 1.2
        },

        TANK_ASSAULT: {
            id: 'tank_assault',
            name: 'Tank Assault',
            description: 'Heavily armored zombies are attacking!',
            icon: '🛡️',
            zombieTypes: ['TANK', 'BRUTE'],
            specialChance: 0.4,
            eliteChance: 0.15,
            bossChance: 0.15,
            waveMultiplier: 0.6,
            healthMultiplier: 1.5,
            rewardMultiplier: 1.5
        },

        ACID_RAIN: {
            id: 'acid_rain',
            name: 'Acid Rain',
            description: 'Spitters are coating the area in acid!',
            icon: '☣️',
            zombieTypes: ['SPITTER', 'NORMAL'],
            specialChance: 0.35,
            eliteChance: 0.1,
            bossChance: 0.08,
            waveMultiplier: 0.8,
            rangedChance: 0.5,
            rewardMultiplier: 1.3
        },

        EXPLOSIVE_NIGHTMARE: {
            id: 'explosive_nightmare',
            name: 'Explosive Nightmare',
            description: 'Exploding zombies are everywhere!',
            icon: '💥',
            zombieTypes: ['EXPLODER', 'NORMAL'],
            specialChance: 0.4,
            eliteChance: 0.05,
            bossChance: 0.05,
            waveMultiplier: 0.7,
            explosionDamage: 1.5,
            rewardMultiplier: 1.4
        },

        SHADOW_HUNT: {
            id: 'shadow_hunt',
            name: 'Shadow Hunt',
            description: 'Shadow stalkers emerge from the darkness!',
            icon: '👻',
            zombieTypes: ['SHADOW', 'RUNNER'],
            specialChance: 0.3,
            eliteChance: 0.2,
            bossChance: 0.1,
            waveMultiplier: 0.5,
            visibilityReduction: 0.5,
            rewardMultiplier: 1.6
        },

        NECROMANCER_SIEGE: {
            id: 'necromancer_siege',
            name: 'Necromancer Siege',
            description: 'Necromancers are raising an army!',
            icon: '🧙',
            zombieTypes: ['NECROMANCER', 'NORMAL', 'RUNNER'],
            specialChance: 0.25,
            eliteChance: 0.25,
            bossChance: 0.2,
            waveMultiplier: 0.8,
            summonRate: 2.0,
            rewardMultiplier: 1.8
        },

        BLOOD_MOON_HORDE: {
            id: 'blood_moon_horde',
            name: 'Blood Moon Horde',
            description: 'The blood moon brings forth endless undead!',
            icon: '🌑',
            zombieTypes: ['NORMAL', 'RUNNER', 'TANK', 'SPITTER', 'EXPLODER'],
            specialChance: 0.25,
            eliteChance: 0.15,
            bossChance: 0.25,
            waveMultiplier: 2.0,
            damageMultiplier: 1.3,
            healthMultiplier: 1.3,
            rewardMultiplier: 2.5,
            weatherRequired: 'blood_moon'
        },

        MEGA_HORDE: {
            id: 'mega_horde',
            name: 'MEGA HORDE',
            description: 'THE ULTIMATE ZOMBIE WAVE APPROACHES!',
            icon: '☠️',
            zombieTypes: ['NORMAL', 'RUNNER', 'TANK', 'SPITTER', 'EXPLODER', 'SCREAMER'],
            specialChance: 0.35,
            eliteChance: 0.2,
            bossChance: 0.4,
            waveMultiplier: 2.5,
            damageMultiplier: 1.5,
            healthMultiplier: 1.5,
            rewardMultiplier: 4.0,
            minDay: 20
        }
    };

    // ============= STATE =============
    let isHordeActive = false;
    let currentHorde = null;
    let currentWave = 0;
    let totalWaves = 0;
    let waveTimer = 0;
    let spawnTimer = 0;
    let zombiesToSpawn = 0;
    let zombiesSpawned = 0;
    let zombiesKilledThisWave = 0;
    let zombiesKilledThisHorde = 0;
    let hordeStartTime = 0;
    let lastHordeNight = 0;
    let hordesCompleted = 0;
    let warningActive = false;
    let warningTimer = 0;
    let nextHordeType = null;

    // ============= HORDE SCHEDULING =============
    function checkHordeSchedule() {
        if (isHordeActive) return;
        if (warningActive) return;

        const currentNight = dayCount || 0;

        // Check if it's horde night
        if (currentNight < CONFIG.MIN_NIGHT_FOR_HORDE) return;
        if (currentNight <= lastHordeNight) return;

        const nightsSinceLastHorde = currentNight - lastHordeNight;
        const isHordeNight = nightsSinceLastHorde >= CONFIG.HORDE_INTERVAL_NIGHTS;

        // Also check for Blood Moon triggering a horde
        const weatherType = typeof WeatherSystem !== 'undefined'
            ? WeatherSystem.getCurrentWeather()?.id
            : null;

        if (isHordeNight && isNight) {
            startWarning();
        } else if (weatherType === 'blood_moon' && !lastHordeNight) {
            // Blood Moon forces a horde
            nextHordeType = HORDE_TYPES.BLOOD_MOON_HORDE;
            startWarning();
        }
    }

    function startWarning() {
        warningActive = true;
        warningTimer = CONFIG.WARNING_TIME;

        // Select horde type
        if (!nextHordeType) {
            nextHordeType = selectHordeType();
        }

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">warning</i> <strong style="color: #ff4444">${nextHordeType.name}</strong> incoming in ${CONFIG.WARNING_TIME} seconds!`,
                [{ text: 'Prepare!', action: () => {}, class: 'reject' }]
            );
        }

        // Screen warning effect
        if (camera) {
            camera.shake = 3;
        }
    }

    function selectHordeType() {
        const currentDay = dayCount || 0;
        const availableTypes = Object.values(HORDE_TYPES).filter(type => {
            if (type.minDay && currentDay < type.minDay) return false;
            if (type.weatherRequired) {
                const weather = typeof WeatherSystem !== 'undefined'
                    ? WeatherSystem.getCurrentWeather()?.id
                    : null;
                if (weather !== type.weatherRequired) return false;
            }
            return true;
        });

        // Weight selection towards harder types later in game
        const weights = availableTypes.map(type => {
            let weight = 1;
            if (type.id === 'standard') weight = 3;
            if (type.rewardMultiplier > 1.5) weight = 0.5 + currentDay * 0.05;
            if (type.id === 'mega_horde') weight = 0.1 + currentDay * 0.02;
            return weight;
        });

        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let roll = Math.random() * totalWeight;

        for (let i = 0; i < availableTypes.length; i++) {
            roll -= weights[i];
            if (roll <= 0) {
                return availableTypes[i];
            }
        }

        return HORDE_TYPES.STANDARD;
    }

    // ============= HORDE MANAGEMENT =============
    function startHorde(hordeType = null) {
        if (isHordeActive) return;

        currentHorde = hordeType || nextHordeType || selectHordeType();
        nextHordeType = null;
        isHordeActive = true;
        warningActive = false;
        currentWave = 0;
        zombiesKilledThisHorde = 0;
        hordeStartTime = Date.now();

        // Calculate waves based on day
        const dayScale = 1 + (dayCount || 0) * CONFIG.DAY_SCALING;
        totalWaves = Math.min(
            CONFIG.MAX_WAVE_COUNT,
            Math.floor(CONFIG.BASE_WAVE_COUNT + (dayCount || 0) / 3)
        );

        lastHordeNight = dayCount || 0;

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">local_fire_department</i> <strong style="color: #ff0000">${currentHorde.icon} ${currentHorde.name} BEGINS!</strong>`,
                []
            );
        }

        // Big screen shake
        if (camera) {
            camera.shake = 10;
        }

        // Track stats
        if (window.gameStats) {
            window.gameStats.hordesStarted = (window.gameStats.hordesStarted || 0) + 1;
        }

        // Start first wave
        startNextWave();
    }

    function startNextWave() {
        currentWave++;
        zombiesKilledThisWave = 0;

        // Calculate zombies for this wave
        const baseZombies = CONFIG.BASE_ZOMBIES_PER_WAVE;
        const waveScale = Math.pow(CONFIG.ZOMBIE_SCALING, currentWave - 1);
        const dayScale = 1 + (dayCount || 0) * CONFIG.DAY_SCALING;
        const typeMultiplier = currentHorde.waveMultiplier || 1.0;

        zombiesToSpawn = Math.floor(baseZombies * waveScale * dayScale * typeMultiplier);
        zombiesSpawned = 0;
        spawnTimer = 0;

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">waves</i> Wave ${currentWave}/${totalWaves} - ${zombiesToSpawn} zombies incoming!`,
                []
            );
        }

        if (camera) {
            camera.shake = 5;
        }
    }

    function completeWave() {
        // Award wave completion rewards
        const baseXP = 50 * currentWave;
        const xpMultiplier = currentHorde.rewardMultiplier || 1.0;
        player.exp += Math.floor(baseXP * xpMultiplier);

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">check_circle</i> Wave ${currentWave} Complete! +${Math.floor(baseXP * xpMultiplier)} XP`,
                []
            );
        }

        if (typeof spawnParticles === 'function') {
            spawnParticles(player.x, player.y, '#00ff00', 15);
        }

        // Check if horde is complete
        if (currentWave >= totalWaves) {
            completeHorde();
        } else {
            // Start timer for next wave
            waveTimer = CONFIG.WAVE_INTERVAL;
        }
    }

    function completeHorde() {
        isHordeActive = false;
        hordesCompleted++;

        const hordeDuration = (Date.now() - hordeStartTime) / 1000;

        // Calculate rewards
        const baseXP = 500 * totalWaves * (currentHorde.rewardMultiplier || 1.0);
        const baseResources = {
            food: Math.floor(20 * totalWaves),
            iron: Math.floor(10 * totalWaves),
            stone: Math.floor(15 * totalWaves)
        };

        // Grant rewards
        player.exp += baseXP;
        for (const [resource, amount] of Object.entries(baseResources)) {
            resources[resource] = (resources[resource] || 0) + amount;
        }

        // Chance for rare item drop
        if (Math.random() < 0.3 * (currentHorde.rewardMultiplier || 1.0)) {
            if (typeof EquipmentSystem !== 'undefined') {
                const rareItems = ['health_potion', 'stamina_elixir', 'hunters_ring', 'warriors_pendant'];
                const itemId = rareItems[Math.floor(Math.random() * rareItems.length)];
                const item = EquipmentSystem.createItem(itemId);
                if (item) EquipmentSystem.addToInventory(item);
            }
        }

        if (typeof checkLevelUp === 'function') {
            checkLevelUp();
        }

        // Celebration
        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">emoji_events</i> <strong>${currentHorde.name} SURVIVED!</strong><br>
                 Waves: ${totalWaves} | Kills: ${zombiesKilledThisHorde} | Time: ${Math.floor(hordeDuration)}s<br>
                 +${Math.floor(baseXP)} XP | +${baseResources.food} food | +${baseResources.iron} iron`,
                [{ text: 'Victory!', action: () => {}, class: 'accept' }]
            );
        }

        // Epic particle celebration
        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 50; i++) {
                setTimeout(() => {
                    spawnParticles(
                        player.x + (Math.random() - 0.5) * 5,
                        player.y + (Math.random() - 0.5) * 5,
                        '#ffd700', 5
                    );
                }, i * 30);
            }
        }

        // Track stats
        if (window.gameStats) {
            window.gameStats.hordesCompleted = (window.gameStats.hordesCompleted || 0) + 1;
            window.gameStats.hordeZombiesKilled = (window.gameStats.hordeZombiesKilled || 0) + zombiesKilledThisHorde;
        }

        // Quest integration
        if (typeof QuestSystem !== 'undefined') {
            QuestSystem.updateObjective('survive', 'horde', 1);
        }

        currentHorde = null;
    }

    function failHorde() {
        isHordeActive = false;

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">dangerous</i> <strong>Horde Failed!</strong> You were overwhelmed...`,
                []
            );
        }

        currentHorde = null;
    }

    // ============= ZOMBIE SPAWNING =============
    function spawnHordeZombie() {
        if (!isHordeActive || !currentHorde) return;
        if (zombiesSpawned >= zombiesToSpawn) return;

        // Determine zombie type
        let zombieType = 'NORMAL';
        const roll = Math.random();

        // Check for boss on boss waves
        const isBossWave = currentWave % CONFIG.BOSS_WAVE_INTERVAL === 0;
        if (isBossWave && zombiesSpawned === zombiesToSpawn - 1 && Math.random() < currentHorde.bossChance) {
            // Spawn boss instead
            if (typeof BossSystem !== 'undefined') {
                const bossTypes = ['TITAN', 'QUEEN'];
                const bossType = bossTypes[Math.floor(Math.random() * bossTypes.length)];
                const angle = Math.random() * Math.PI * 2;
                const dist = ZOMBIE_CONFIG.SPAWN_DIST_MIN + Math.random() * 10;
                BossSystem.spawnZombieWithType(bossType, player.x + Math.cos(angle) * dist, player.y + Math.sin(angle) * dist);
                zombiesSpawned++;
                return;
            }
        }

        // Normal type selection
        if (roll < currentHorde.eliteChance) {
            const eliteTypes = ['BRUTE', 'SHADOW', 'NECROMANCER'];
            zombieType = eliteTypes[Math.floor(Math.random() * eliteTypes.length)];
        } else if (roll < currentHorde.eliteChance + currentHorde.specialChance) {
            zombieType = currentHorde.zombieTypes[Math.floor(Math.random() * currentHorde.zombieTypes.length)];
        } else {
            // Standard types from horde definition
            const standardTypes = currentHorde.zombieTypes.filter(t =>
                !['BRUTE', 'SHADOW', 'NECROMANCER'].includes(t)
            );
            zombieType = standardTypes.length > 0
                ? standardTypes[Math.floor(Math.random() * standardTypes.length)]
                : 'NORMAL';
        }

        // Spawn position - from random direction around player
        const angle = Math.random() * Math.PI * 2;
        const dist = ZOMBIE_CONFIG.SPAWN_DIST_MIN + Math.random() * (ZOMBIE_CONFIG.SPAWN_DIST_MAX - ZOMBIE_CONFIG.SPAWN_DIST_MIN);
        const x = player.x + Math.cos(angle) * dist;
        const y = player.y + Math.sin(angle) * dist;

        // Spawn the zombie
        let zombie;
        if (typeof BossSystem !== 'undefined') {
            zombie = BossSystem.spawnZombieWithType(zombieType, x, y);
        } else {
            // Fallback spawn
            zombie = {
                x: x,
                y: y,
                health: ZOMBIE_CONFIG.BASE_HEALTH * (currentHorde.healthMultiplier || 1),
                maxHealth: ZOMBIE_CONFIG.BASE_HEALTH * (currentHorde.healthMultiplier || 1),
                speed: ZOMBIE_CONFIG.BASE_SPEED * (currentHorde.speedMultiplier || 1),
                damage: ZOMBIE_CONFIG.BASE_DAMAGE * (currentHorde.damageMultiplier || 1),
                attackCooldown: 0,
                frame: 0,
                animTimer: 0,
                isHordeZombie: true
            };
            zombies.push(zombie);
        }

        // Mark as horde zombie
        if (zombie) {
            zombie.isHordeZombie = true;

            // Apply horde modifiers
            if (currentHorde.healthMultiplier) {
                zombie.health *= currentHorde.healthMultiplier;
                zombie.maxHealth *= currentHorde.healthMultiplier;
            }
            if (currentHorde.speedMultiplier) {
                zombie.speed *= currentHorde.speedMultiplier;
            }
            if (currentHorde.damageMultiplier) {
                zombie.damage *= currentHorde.damageMultiplier;
            }
        }

        zombiesSpawned++;

        // Spawn particle effect
        if (typeof spawnParticles === 'function') {
            spawnParticles(x, y, '#550000', 5);
        }
    }

    function onZombieKilled(zombie) {
        if (!isHordeActive) return;
        if (!zombie.isHordeZombie) return;

        zombiesKilledThisWave++;
        zombiesKilledThisHorde++;

        // Check if wave is complete
        if (zombiesSpawned >= zombiesToSpawn && zombiesKilledThisWave >= zombiesToSpawn) {
            completeWave();
        }
    }

    // ============= UPDATE =============
    function update(dt) {
        // Check for horde schedule
        if (!isHordeActive && !warningActive) {
            checkHordeSchedule();
        }

        // Update warning
        if (warningActive) {
            warningTimer -= dt;

            // Periodic warning pulses
            if (Math.floor(warningTimer) % 5 === 0 && Math.floor(warningTimer + dt) % 5 !== 0) {
                if (camera) camera.shake = 2;
            }

            if (warningTimer <= 0) {
                startHorde();
            }
            return;
        }

        // Update active horde
        if (isHordeActive) {
            // Wave interval timer
            if (waveTimer > 0) {
                waveTimer -= dt;
                if (waveTimer <= 0) {
                    startNextWave();
                }
                return;
            }

            // Spawn zombies
            if (zombiesSpawned < zombiesToSpawn) {
                spawnTimer += dt;
                if (spawnTimer >= CONFIG.ZOMBIE_SPAWN_INTERVAL) {
                    spawnTimer = 0;
                    spawnHordeZombie();
                }
            }

            // Apply horde-specific effects
            if (currentHorde.visibilityReduction) {
                // Reduce visibility during shadow hunt
                // This would integrate with the lighting system
            }
        }
    }

    // ============= MANUAL TRIGGERS =============
    function triggerHorde(hordeTypeId = null) {
        if (isHordeActive) {
            console.log('Horde already active');
            return false;
        }

        const hordeType = hordeTypeId ? HORDE_TYPES[hordeTypeId.toUpperCase()] : null;
        nextHordeType = hordeType;
        startWarning();
        return true;
    }

    function skipToNextWave() {
        if (!isHordeActive) return false;
        if (waveTimer > 0) {
            waveTimer = 0;
            return true;
        }
        return false;
    }

    function endHorde() {
        if (!isHordeActive) return false;
        completeHorde();
        return true;
    }

    // ============= UI =============
    function getHordeStatus() {
        if (!isHordeActive && !warningActive) {
            return null;
        }

        if (warningActive) {
            return {
                active: false,
                warning: true,
                warningTime: Math.ceil(warningTimer),
                hordeType: nextHordeType
            };
        }

        return {
            active: true,
            hordeType: currentHorde,
            currentWave: currentWave,
            totalWaves: totalWaves,
            zombiesSpawned: zombiesSpawned,
            zombiesToSpawn: zombiesToSpawn,
            zombiesKilled: zombiesKilledThisWave,
            totalKills: zombiesKilledThisHorde,
            waveTimer: waveTimer > 0 ? Math.ceil(waveTimer) : null
        };
    }

    function drawHordeUI(ctx) {
        const status = getHordeStatus();
        if (!status) return;

        const centerX = ctx.canvas.width / 2;

        ctx.save();
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';

        if (status.warning) {
            // Warning display
            ctx.fillStyle = `rgba(255, 0, 0, ${0.5 + Math.sin(Date.now() / 200) * 0.5})`;
            ctx.fillText(`⚠️ ${status.hordeType.name} in ${status.warningTime}s! ⚠️`, centerX, 80);
        } else if (status.active) {
            // Horde status bar
            const barWidth = 300;
            const barHeight = 20;
            const barX = centerX - barWidth / 2;
            const barY = 50;

            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(barX - 10, barY - 25, barWidth + 20, 70);

            // Title
            ctx.fillStyle = '#ff4444';
            ctx.fillText(`${status.hordeType.icon} ${status.hordeType.name}`, centerX, barY - 5);

            // Wave info
            ctx.font = '14px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`Wave ${status.currentWave}/${status.totalWaves}`, centerX, barY + 15);

            // Progress bar
            const progress = status.zombiesKilled / status.zombiesToSpawn;
            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY + 25, barWidth, barHeight);
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(barX, barY + 25, barWidth * progress, barHeight);
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(barX, barY + 25, barWidth, barHeight);

            // Kill count
            ctx.fillStyle = '#fff';
            ctx.fillText(`${status.zombiesKilled}/${status.zombiesToSpawn} killed`, centerX, barY + 38);

            // Next wave timer
            if (status.waveTimer) {
                ctx.fillStyle = '#ffff00';
                ctx.fillText(`Next wave in ${status.waveTimer}s`, centerX, barY + 60);
            }
        }

        ctx.restore();
    }

    // ============= SERIALIZATION =============
    function getState() {
        return {
            isHordeActive,
            currentHorde: currentHorde?.id || null,
            currentWave,
            totalWaves,
            waveTimer,
            zombiesToSpawn,
            zombiesSpawned,
            zombiesKilledThisWave,
            zombiesKilledThisHorde,
            lastHordeNight,
            hordesCompleted,
            warningActive,
            warningTimer,
            nextHordeType: nextHordeType?.id || null
        };
    }

    function setState(state) {
        if (!state) return;

        isHordeActive = state.isHordeActive || false;
        currentHorde = state.currentHorde ? HORDE_TYPES[state.currentHorde.toUpperCase()] : null;
        currentWave = state.currentWave || 0;
        totalWaves = state.totalWaves || 0;
        waveTimer = state.waveTimer || 0;
        zombiesToSpawn = state.zombiesToSpawn || 0;
        zombiesSpawned = state.zombiesSpawned || 0;
        zombiesKilledThisWave = state.zombiesKilledThisWave || 0;
        zombiesKilledThisHorde = state.zombiesKilledThisHorde || 0;
        lastHordeNight = state.lastHordeNight || 0;
        hordesCompleted = state.hordesCompleted || 0;
        warningActive = state.warningActive || false;
        warningTimer = state.warningTimer || 0;
        nextHordeType = state.nextHordeType ? HORDE_TYPES[state.nextHordeType.toUpperCase()] : null;
    }

    // ============= PUBLIC API =============
    return {
        // Constants
        HORDE_TYPES,
        CONFIG,

        // Core functions
        update,
        checkHordeSchedule,
        startHorde,
        triggerHorde,
        endHorde,
        skipToNextWave,

        // Event hooks
        onZombieKilled,

        // Getters
        isHordeActive: () => isHordeActive,
        isWarningActive: () => warningActive,
        getHordeStatus,
        getCurrentWave: () => currentWave,
        getTotalWaves: () => totalWaves,
        getHordesCompleted: () => hordesCompleted,
        getLastHordeNight: () => lastHordeNight,

        // UI
        drawHordeUI,

        // State
        getState,
        setState
    };
})();

// Export globally
window.HordeSystem = HordeSystem;
