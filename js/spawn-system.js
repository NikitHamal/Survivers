// ============================================
// SPAWN SYSTEM - Advanced Enemy & Entity Spawning
// ============================================
// Production-grade spawn system with difficulty curves,
// biome awareness, strategic positioning, and varied patterns

const SpawnSystem = (function () {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        // Difficulty scaling (S-curve parameters)
        DIFFICULTY: {
            MIN_MULT: 0.5,          // Minimum difficulty multiplier
            MAX_MULT: 4.0,          // Maximum difficulty multiplier
            INFLECTION_DAY: 15,     // Day where difficulty ramps fastest
            CURVE_STEEPNESS: 0.25,  // How sharp the S-curve is
            NIGHT_BONUS: 1.5,       // Night difficulty multiplier
            BLOOD_MOON_BONUS: 2.5   // Blood moon multiplier
        },

        // Spawn distances
        DISTANCE: {
            MIN: 16,                // Minimum spawn distance from player
            MAX: 28,                // Maximum spawn distance from player
            OPTIMAL: 22,            // Preferred spawn distance
            VARIANCE: 4,            // Random variance range
            LOS_CHECK_DIST: 12      // Line of sight avoidance distance
        },

        // Spawn rates (per second at night)
        RATES: {
            BASE: 0.3,              // Base spawn rate
            MAX: 2.5,               // Maximum spawn rate
            DAY_SCALING: 0.08,      // Rate increase per day
            HORDE_MULT: 3.0,        // Rate during horde events
            BIOME_VARIANCE: 0.3     // How much biomes affect rate
        },

        // Population limits
        POPULATION: {
            BASE_MAX: 25,           // Starting max zombies
            PER_DAY: 3,             // Additional max per day
            ABSOLUTE_MAX: 100,      // Hard cap
            CLUSTER_MAX: 8,         // Max zombies in a cluster
            MIN_SEPARATION: 1.5     // Minimum distance between spawns
        },

        // Spawn patterns
        PATTERNS: {
            CLUSTER_CHANCE: 0.3,    // Chance of cluster spawn
            SURROUND_CHANCE: 0.15,  // Chance of surround pattern
            WAVE_CHANCE: 0.2,       // Chance of directional wave
            AMBUSH_CHANCE: 0.1      // Chance of ambush spawn
        },

        // Special spawn conditions
        SPECIAL: {
            ELITE_BASE_CHANCE: 0.05,
            ELITE_DAY_BONUS: 0.005,
            ELITE_MAX_CHANCE: 0.25,
            BOSS_MIN_DAY: 7,
            BOSS_CHANCE_PER_DAY: 0.02,
            MINI_BOSS_MIN_DAY: 4
        }
    };

    // ============= ZOMBIE VARIANTS =============
    const ZOMBIE_VARIANTS = {
        STANDARD: {
            id: 'standard',
            name: 'Zombie',
            healthMult: 1.0,
            speedMult: 1.0,
            damageMult: 1.0,
            xpMult: 1.0,
            color: '#2d5a2d',
            spawnWeight: 100,
            biomes: ['all']
        },
        RUNNER: {
            id: 'runner',
            name: 'Runner',
            healthMult: 0.6,
            speedMult: 1.8,
            damageMult: 0.8,
            xpMult: 1.3,
            color: '#4a7a4a',
            spawnWeight: 30,
            minDay: 2,
            biomes: ['all']
        },
        BRUTE: {
            id: 'brute',
            name: 'Brute',
            healthMult: 2.5,
            speedMult: 0.6,
            damageMult: 1.8,
            xpMult: 2.0,
            color: '#1a3a1a',
            size: 1.4,
            spawnWeight: 15,
            minDay: 4,
            biomes: ['all']
        },
        SPITTER: {
            id: 'spitter',
            name: 'Spitter',
            healthMult: 0.8,
            speedMult: 0.9,
            damageMult: 1.2,
            xpMult: 1.5,
            color: '#4a8a2a',
            ranged: true,
            rangeDistance: 8,
            spawnWeight: 20,
            minDay: 5,
            biomes: ['swamp', 'jungle']
        },
        FROZEN: {
            id: 'frozen',
            name: 'Frozen Dead',
            healthMult: 1.3,
            speedMult: 0.7,
            damageMult: 1.0,
            xpMult: 1.4,
            color: '#6a9aaa',
            slowOnHit: 0.3,
            spawnWeight: 25,
            minDay: 3,
            biomes: ['arctic', 'mountain']
        },
        BURNING: {
            id: 'burning',
            name: 'Burning Husk',
            healthMult: 0.9,
            speedMult: 1.1,
            damageMult: 1.3,
            xpMult: 1.5,
            color: '#aa4a2a',
            burnDamage: 2,
            explodeOnDeath: true,
            spawnWeight: 20,
            minDay: 6,
            biomes: ['desert', 'volcanic']
        },
        STALKER: {
            id: 'stalker',
            name: 'Stalker',
            healthMult: 0.7,
            speedMult: 1.3,
            damageMult: 1.5,
            xpMult: 1.8,
            color: '#3a3a4a',
            stealth: true,
            ambushBonus: 2.0,
            spawnWeight: 15,
            minDay: 8,
            biomes: ['jungle', 'forest', 'swamp']
        },
        ARMORED: {
            id: 'armored',
            name: 'Armored',
            healthMult: 1.8,
            speedMult: 0.8,
            damageMult: 1.2,
            xpMult: 2.0,
            color: '#5a5a6a',
            armor: 0.4,
            spawnWeight: 12,
            minDay: 7,
            biomes: ['all']
        },
        BLOATER: {
            id: 'bloater',
            name: 'Bloater',
            healthMult: 2.0,
            speedMult: 0.5,
            damageMult: 0.8,
            xpMult: 2.2,
            color: '#5a7a3a',
            size: 1.6,
            explodeOnDeath: true,
            explosionRadius: 3,
            explosionDamage: 30,
            spawnWeight: 10,
            minDay: 9,
            biomes: ['swamp', 'jungle']
        },
        SCREAMER: {
            id: 'screamer',
            name: 'Screamer',
            healthMult: 0.5,
            speedMult: 1.0,
            damageMult: 0.5,
            xpMult: 2.5,
            color: '#7a6a8a',
            callReinforcements: true,
            callRadius: 15,
            callCooldown: 10,
            spawnWeight: 8,
            minDay: 10,
            biomes: ['all']
        }
    };

    // ============= ELITE MODIFIERS =============
    const ELITE_MODIFIERS = {
        ENRAGED: {
            id: 'enraged',
            name: 'Enraged',
            healthMult: 1.3,
            speedMult: 1.2,
            damageMult: 1.4,
            color: '#ff4444',
            glow: true
        },
        REGENERATING: {
            id: 'regenerating',
            name: 'Regenerating',
            healthMult: 1.5,
            regenRate: 3,
            color: '#44ff44',
            glow: true
        },
        VAMPIRIC: {
            id: 'vampiric',
            name: 'Vampiric',
            healthMult: 1.2,
            lifesteal: 0.3,
            color: '#aa44aa',
            glow: true
        },
        EXPLOSIVE: {
            id: 'explosive',
            name: 'Explosive',
            explodeOnDeath: true,
            explosionRadius: 4,
            explosionDamage: 40,
            color: '#ffaa44',
            glow: true
        },
        TOXIC: {
            id: 'toxic',
            name: 'Toxic',
            poisonOnHit: 5,
            poisonDuration: 5,
            toxicAura: 2,
            color: '#44aa44',
            glow: true
        }
    };

    // ============= STATE =============
    let spawnAccumulator = 0;
    let lastSpawnTime = 0;
    let spawnHistory = [];
    let activeSpawnPattern = null;
    let patternProgress = 0;
    let currentDifficulty = 1.0;
    let bloodMoonActive = false;
    let spawnedThisNight = 0;

    // ============= DIFFICULTY CALCULATION =============
    function calculateDifficulty(day, isNight, isBloodMoon) {
        // S-curve difficulty scaling
        const x = day - CONFIG.DIFFICULTY.INFLECTION_DAY;
        const sigmoid = 1 / (1 + Math.exp(-CONFIG.DIFFICULTY.CURVE_STEEPNESS * x));

        // Map sigmoid (0-1) to difficulty range
        const range = CONFIG.DIFFICULTY.MAX_MULT - CONFIG.DIFFICULTY.MIN_MULT;
        let difficulty = CONFIG.DIFFICULTY.MIN_MULT + sigmoid * range;

        // Apply time-of-day modifiers
        if (isNight) {
            difficulty *= CONFIG.DIFFICULTY.NIGHT_BONUS;
        }
        if (isBloodMoon) {
            difficulty *= CONFIG.DIFFICULTY.BLOOD_MOON_BONUS;
        }

        currentDifficulty = difficulty;
        return difficulty;
    }

    function getDifficultyTier(day) {
        if (day <= 3) return 'easy';
        if (day <= 7) return 'normal';
        if (day <= 14) return 'hard';
        if (day <= 21) return 'nightmare';
        return 'apocalypse';
    }

    // ============= SPAWN RATE CALCULATION =============
    function calculateSpawnRate(day, biome, isHorde) {
        let rate = CONFIG.RATES.BASE;

        // Day scaling (diminishing returns)
        const dayBonus = CONFIG.RATES.DAY_SCALING * Math.sqrt(day);
        rate += dayBonus;

        // Biome modifier
        const biomeModifier = getBiomeSpawnModifier(biome);
        rate *= biomeModifier;

        // Horde modifier
        if (isHorde) {
            rate *= CONFIG.RATES.HORDE_MULT;
        }

        // Difficulty modifier
        rate *= Math.sqrt(currentDifficulty);

        // Cap at max rate
        return Math.min(rate, CONFIG.RATES.MAX);
    }

    function getBiomeSpawnModifier(biome) {
        const modifiers = {
            jungle: 1.2,
            swamp: 1.3,
            forest: 1.0,
            desert: 0.8,
            arctic: 0.7,
            mountain: 0.9,
            volcanic: 1.4,
            plains: 1.0
        };
        return modifiers[biome] || 1.0;
    }

    // ============= POPULATION MANAGEMENT =============
    function getMaxPopulation(day) {
        const max = CONFIG.POPULATION.BASE_MAX + day * CONFIG.POPULATION.PER_DAY;
        return Math.min(max, CONFIG.POPULATION.ABSOLUTE_MAX);
    }

    function getCurrentPopulation() {
        return typeof zombies !== 'undefined' ? zombies.length : 0;
    }

    function canSpawn(day) {
        return getCurrentPopulation() < getMaxPopulation(day);
    }

    // ============= POSITION CALCULATION =============
    function calculateSpawnPosition(pattern, index, total) {
        if (typeof player === 'undefined') return null;

        const baseAngle = Math.random() * Math.PI * 2;
        let x, y, attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            let angle, distance;

            switch (pattern) {
                case 'cluster':
                    // Spawn in a tight group
                    const clusterAngle = baseAngle + (Math.random() - 0.5) * 0.5;
                    const clusterDist = CONFIG.DISTANCE.OPTIMAL + (Math.random() - 0.5) * 4;
                    angle = clusterAngle;
                    distance = clusterDist + index * 0.8;
                    break;

                case 'surround':
                    // Evenly distributed around player
                    angle = baseAngle + (index / total) * Math.PI * 2;
                    distance = CONFIG.DISTANCE.OPTIMAL + (Math.random() - 0.5) * CONFIG.DISTANCE.VARIANCE;
                    break;

                case 'wave':
                    // Directional wave from one side
                    const waveSpread = Math.PI * 0.4;
                    angle = baseAngle + (index / total - 0.5) * waveSpread;
                    distance = CONFIG.DISTANCE.MIN + (index / total) * (CONFIG.DISTANCE.MAX - CONFIG.DISTANCE.MIN);
                    break;

                case 'ambush':
                    // Behind player, out of view
                    const playerDir = typeof player.direction !== 'undefined' ? player.direction : 0;
                    angle = playerDir + Math.PI + (Math.random() - 0.5) * 0.8;
                    distance = CONFIG.DISTANCE.MIN + Math.random() * 4;
                    break;

                default:
                    // Random distribution
                    angle = Math.random() * Math.PI * 2;
                    distance = CONFIG.DISTANCE.MIN + Math.random() * (CONFIG.DISTANCE.MAX - CONFIG.DISTANCE.MIN);
            }

            x = player.x + Math.cos(angle) * distance;
            y = player.y + Math.sin(angle) * distance;

            if (isValidSpawnPosition(x, y)) {
                return { x, y, angle };
            }

            attempts++;
        }

        // Fallback to basic random spawn
        return getFallbackSpawnPosition();
    }

    function isValidSpawnPosition(x, y) {
        // Check tile solidity
        if (typeof isSolidAt === 'function' && isSolidAt(x, y, 0.5)) {
            return false;
        }

        // Check distance from player
        if (typeof player !== 'undefined') {
            const distToPlayer = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);
            if (distToPlayer < CONFIG.DISTANCE.MIN || distToPlayer > CONFIG.DISTANCE.MAX) {
                return false;
            }
        }

        // Check separation from other zombies
        if (typeof zombies !== 'undefined') {
            for (const zombie of zombies) {
                const dist = Math.sqrt((x - zombie.x) ** 2 + (y - zombie.y) ** 2);
                if (dist < CONFIG.POPULATION.MIN_SEPARATION) {
                    return false;
                }
            }
        }

        // Check line of sight (avoid spawning in plain view)
        if (!checkLineOfSightBlock(x, y)) {
            return false;
        }

        return true;
    }

    function checkLineOfSightBlock(x, y) {
        if (typeof player === 'undefined') return true;

        const dist = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);
        if (dist > CONFIG.DISTANCE.LOS_CHECK_DIST) return true;

        // Check if there's terrain blocking line of sight
        const steps = Math.floor(dist);
        const dx = (x - player.x) / steps;
        const dy = (y - player.y) / steps;

        for (let i = 1; i < steps; i++) {
            const checkX = player.x + dx * i;
            const checkY = player.y + dy * i;

            if (typeof isSolidAt === 'function' && isSolidAt(checkX, checkY, 0.3)) {
                return true; // Blocked, good spawn
            }
        }

        // No blocking terrain, 50% chance to allow anyway
        return Math.random() < 0.5;
    }

    function getFallbackSpawnPosition() {
        if (typeof player === 'undefined') return null;

        const angle = Math.random() * Math.PI * 2;
        const distance = CONFIG.DISTANCE.OPTIMAL;
        return {
            x: player.x + Math.cos(angle) * distance,
            y: player.y + Math.sin(angle) * distance,
            angle
        };
    }

    // ============= VARIANT SELECTION =============
    function selectZombieVariant(day, biome) {
        const availableVariants = [];
        let totalWeight = 0;

        for (const [key, variant] of Object.entries(ZOMBIE_VARIANTS)) {
            // Check minimum day requirement
            if (variant.minDay && day < variant.minDay) continue;

            // Check biome compatibility
            if (!variant.biomes.includes('all') && !variant.biomes.includes(biome)) continue;

            // Add to pool with weight
            const weight = variant.spawnWeight * (variant.biomes.includes(biome) ? 1.5 : 1.0);
            availableVariants.push({ key, variant, weight });
            totalWeight += weight;
        }

        // Random weighted selection
        let roll = Math.random() * totalWeight;
        for (const { key, variant, weight } of availableVariants) {
            roll -= weight;
            if (roll <= 0) {
                return variant;
            }
        }

        return ZOMBIE_VARIANTS.STANDARD;
    }

    function shouldBeElite(day) {
        const chance = Math.min(
            CONFIG.SPECIAL.ELITE_BASE_CHANCE + day * CONFIG.SPECIAL.ELITE_DAY_BONUS,
            CONFIG.SPECIAL.ELITE_MAX_CHANCE
        );
        return Math.random() < chance;
    }

    function selectEliteModifier() {
        const modifiers = Object.values(ELITE_MODIFIERS);
        return modifiers[Math.floor(Math.random() * modifiers.length)];
    }

    // ============= SPAWN PATTERN SELECTION =============
    function selectSpawnPattern(day) {
        const rand = Math.random();
        let threshold = 0;

        // Higher days increase pattern variety
        const dayBonus = Math.min(day * 0.02, 0.3);

        threshold += CONFIG.PATTERNS.CLUSTER_CHANCE + dayBonus;
        if (rand < threshold) return 'cluster';

        threshold += CONFIG.PATTERNS.SURROUND_CHANCE + dayBonus * 0.5;
        if (rand < threshold && day >= 5) return 'surround';

        threshold += CONFIG.PATTERNS.WAVE_CHANCE + dayBonus * 0.3;
        if (rand < threshold && day >= 3) return 'wave';

        threshold += CONFIG.PATTERNS.AMBUSH_CHANCE + dayBonus * 0.2;
        if (rand < threshold && day >= 7) return 'ambush';

        return 'random';
    }

    // ============= MAIN SPAWN FUNCTION =============
    function spawnZombie(variant, position, isElite, eliteModifier) {
        if (typeof zombies === 'undefined' || typeof player === 'undefined') return null;

        const baseHealth = 25;
        const baseSpeed = 1.8;
        const baseDamage = 8;

        // Calculate stats with variant and difficulty
        let health = baseHealth * variant.healthMult * currentDifficulty;
        let speed = baseSpeed * variant.speedMult;
        let damage = baseDamage * variant.damageMult * Math.sqrt(currentDifficulty);
        let xpReward = 15 * variant.xpMult;

        // Apply elite modifier
        if (isElite && eliteModifier) {
            health *= eliteModifier.healthMult || 1.0;
            speed *= eliteModifier.speedMult || 1.0;
            damage *= eliteModifier.damageMult || 1.0;
            xpReward *= 2.0;
        }

        const zombie = {
            id: Date.now() + Math.random(),
            x: position.x,
            y: position.y,
            health: health,
            maxHealth: health,
            speed: speed,
            damage: damage,
            xpReward: Math.floor(xpReward),
            variant: variant,
            isElite: isElite,
            eliteModifier: eliteModifier,
            color: isElite && eliteModifier ? eliteModifier.color : variant.color,
            size: variant.size || 1.0,
            glow: isElite && eliteModifier?.glow,

            // Variant abilities
            ranged: variant.ranged || false,
            rangeDistance: variant.rangeDistance || 0,
            slowOnHit: variant.slowOnHit || 0,
            burnDamage: variant.burnDamage || 0,
            explodeOnDeath: variant.explodeOnDeath || eliteModifier?.explodeOnDeath || false,
            explosionRadius: variant.explosionRadius || eliteModifier?.explosionRadius || 0,
            explosionDamage: variant.explosionDamage || eliteModifier?.explosionDamage || 0,
            stealth: variant.stealth || false,
            ambushBonus: variant.ambushBonus || 1.0,
            armor: variant.armor || 0,
            callReinforcements: variant.callReinforcements || false,
            callRadius: variant.callRadius || 0,
            callCooldown: variant.callCooldown || 0,
            lastCallTime: 0,

            // Elite abilities
            regenRate: eliteModifier?.regenRate || 0,
            lifesteal: eliteModifier?.lifesteal || 0,
            poisonOnHit: eliteModifier?.poisonOnHit || 0,
            poisonDuration: eliteModifier?.poisonDuration || 0,
            toxicAura: eliteModifier?.toxicAura || 0,

            // State
            target: null,
            state: 'chase',
            stateTimer: 0,
            attackCooldown: 0,
            stunned: 0,
            frame: 0,
            animTimer: 0
        };

        // Attach AI if available
        if (typeof ZombieAI !== 'undefined') {
            zombie.ai = new ZombieAI(zombie);
        }

        zombies.push(zombie);
        spawnedThisNight++;

        // Track spawn for analytics
        spawnHistory.push({
            time: Date.now(),
            variant: variant.id,
            isElite,
            position: { x: position.x, y: position.y }
        });

        // Emit event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('zombie:spawned', {
                zombie,
                variant: variant.id,
                isElite,
                eliteModifier: eliteModifier?.id
            });
        }

        return zombie;
    }

    // ============= UPDATE FUNCTION =============
    function update(dt) {
        if (typeof player === 'undefined' || typeof dayCount === 'undefined') return;
        if (typeof isNight === 'undefined' || !isNight) {
            spawnedThisNight = 0;
            return;
        }

        // Calculate current difficulty
        const difficulty = calculateDifficulty(dayCount, isNight, bloodMoonActive);

        // Check if we can spawn
        if (!canSpawn(dayCount)) return;

        // Get current biome
        const biome = typeof BiomeSystem !== 'undefined'
            ? BiomeSystem.getBiomeAt(player.x, player.y)
            : 'jungle';

        // Check if in horde event
        const isHorde = typeof HordeSystem !== 'undefined' && HordeSystem.isHordeActive();

        // Calculate spawn rate
        const spawnRate = calculateSpawnRate(dayCount, biome, isHorde);

        // Accumulate spawn time
        spawnAccumulator += dt * spawnRate;

        // Handle pattern spawning
        if (activeSpawnPattern && patternProgress < activeSpawnPattern.count) {
            if (spawnAccumulator >= 1.0) {
                spawnAccumulator -= 1.0;
                executePatternSpawn(dayCount, biome);
            }
            return;
        }

        // Regular spawning
        while (spawnAccumulator >= 1.0 && canSpawn(dayCount)) {
            spawnAccumulator -= 1.0;

            // Decide on spawn pattern
            if (Math.random() < 0.3) {
                startSpawnPattern(dayCount);
            } else {
                // Single spawn
                const variant = selectZombieVariant(dayCount, biome);
                const isElite = shouldBeElite(dayCount);
                const eliteModifier = isElite ? selectEliteModifier() : null;
                const position = calculateSpawnPosition('random', 0, 1);

                if (position) {
                    spawnZombie(variant, position, isElite, eliteModifier);
                }
            }
        }

        // Clean old spawn history
        const historyLimit = Date.now() - 60000;
        spawnHistory = spawnHistory.filter(s => s.time > historyLimit);
    }

    function startSpawnPattern(day) {
        const pattern = selectSpawnPattern(day);
        const count = pattern === 'cluster'
            ? Math.min(3 + Math.floor(Math.random() * 4), CONFIG.POPULATION.CLUSTER_MAX)
            : pattern === 'surround'
                ? 4 + Math.floor(Math.random() * 4)
                : pattern === 'wave'
                    ? 5 + Math.floor(Math.random() * 5)
                    : 2 + Math.floor(Math.random() * 3);

        activeSpawnPattern = {
            type: pattern,
            count,
            baseAngle: Math.random() * Math.PI * 2
        };
        patternProgress = 0;
    }

    function executePatternSpawn(day, biome) {
        if (!activeSpawnPattern) return;

        const variant = selectZombieVariant(day, biome);
        const isElite = patternProgress === 0 && shouldBeElite(day);
        const eliteModifier = isElite ? selectEliteModifier() : null;
        const position = calculateSpawnPosition(
            activeSpawnPattern.type,
            patternProgress,
            activeSpawnPattern.count
        );

        if (position) {
            spawnZombie(variant, position, isElite, eliteModifier);
        }

        patternProgress++;

        if (patternProgress >= activeSpawnPattern.count) {
            activeSpawnPattern = null;
            patternProgress = 0;
        }
    }

    // ============= SPECIAL SPAWNS =============
    function spawnBoss(bossType, x, y) {
        const bosses = {
            ALPHA_ZOMBIE: {
                name: 'Alpha Zombie',
                healthMult: 20,
                speedMult: 0.8,
                damageMult: 3,
                size: 2.5,
                color: '#1a1a3a',
                abilities: ['summon', 'roar', 'charge']
            },
            NECROMANCER: {
                name: 'Necromancer',
                healthMult: 15,
                speedMult: 0.6,
                damageMult: 2,
                size: 2.0,
                color: '#4a2a6a',
                abilities: ['resurrect', 'curse', 'teleport']
            },
            BEHEMOTH: {
                name: 'Behemoth',
                healthMult: 40,
                speedMult: 0.4,
                damageMult: 5,
                size: 3.5,
                color: '#3a3a2a',
                abilities: ['stomp', 'throw', 'rage']
            }
        };

        const boss = bosses[bossType] || bosses.ALPHA_ZOMBIE;

        return spawnZombie(
            {
                ...ZOMBIE_VARIANTS.STANDARD,
                ...boss,
                xpMult: 10,
                isBoss: true
            },
            { x, y },
            true,
            ELITE_MODIFIERS.ENRAGED
        );
    }

    function triggerBloodMoon() {
        bloodMoonActive = true;

        if (typeof showNotification === 'function') {
            showNotification('🌑 BLOOD MOON RISES! 🌑', []);
        }

        if (typeof EventBus !== 'undefined') {
            EventBus.emit('bloodmoon:start');
        }
    }

    function endBloodMoon() {
        bloodMoonActive = false;

        if (typeof EventBus !== 'undefined') {
            EventBus.emit('bloodmoon:end');
        }
    }

    // ============= PUBLIC API =============
    return {
        CONFIG,
        ZOMBIE_VARIANTS,
        ELITE_MODIFIERS,

        update,
        spawnZombie,
        spawnBoss,

        calculateDifficulty,
        getDifficultyTier,
        getCurrentPopulation,
        getMaxPopulation,
        canSpawn,

        triggerBloodMoon,
        endBloodMoon,
        isBloodMoonActive: () => bloodMoonActive,

        getCurrentDifficulty: () => currentDifficulty,
        getSpawnedThisNight: () => spawnedThisNight,
        getSpawnHistory: () => [...spawnHistory],

        selectZombieVariant,
        selectSpawnPattern,
        calculateSpawnPosition
    };
})();

window.SpawnSystem = SpawnSystem;
