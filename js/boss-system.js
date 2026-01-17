// ============================================
// BOSS & SPECIAL ZOMBIE SYSTEM
// ============================================
// Complete boss system with unique zombie types,
// special abilities, mechanics, and loot drops

const BossSystem = (function () {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        BOSS_SPAWN_START_DAY: 5,
        BOSS_SPAWN_INTERVAL_DAYS: 3,
        ELITE_SPAWN_CHANCE: 0.08,
        SPECIAL_SPAWN_CHANCE: 0.15,
        BOSS_ANNOUNCE_TIME: 5000,
        BOSS_DESPAWN_RANGE: 100,
        MIN_PLAYER_LEVEL_FOR_BOSS: 3
    };

    // ============= ZOMBIE TYPES =============
    const ZOMBIE_TYPES = {
        // === NORMAL VARIANTS ===
        NORMAL: {
            id: 'normal',
            name: 'Zombie',
            tier: 'normal',
            color: '#5a8a5a',
            healthMultiplier: 1.0,
            damageMultiplier: 1.0,
            speedMultiplier: 1.0,
            sizeMultiplier: 1.0,
            xpMultiplier: 1.0,
            lootMultiplier: 1.0,
            abilities: []
        },

        // === SPECIAL VARIANTS ===
        RUNNER: {
            id: 'runner',
            name: 'Runner Zombie',
            tier: 'special',
            color: '#7a5a3a',
            healthMultiplier: 0.7,
            damageMultiplier: 0.8,
            speedMultiplier: 2.0,
            sizeMultiplier: 0.9,
            xpMultiplier: 1.5,
            lootMultiplier: 1.2,
            abilities: ['sprint']
        },
        TANK: {
            id: 'tank',
            name: 'Tank Zombie',
            tier: 'special',
            color: '#4a6a4a',
            healthMultiplier: 3.0,
            damageMultiplier: 1.5,
            speedMultiplier: 0.6,
            sizeMultiplier: 1.4,
            xpMultiplier: 2.0,
            lootMultiplier: 2.0,
            abilities: ['knockback']
        },
        SPITTER: {
            id: 'spitter',
            name: 'Spitter Zombie',
            tier: 'special',
            color: '#6a8a3a',
            healthMultiplier: 0.8,
            damageMultiplier: 0.6,
            speedMultiplier: 0.9,
            sizeMultiplier: 1.0,
            xpMultiplier: 1.8,
            lootMultiplier: 1.5,
            abilities: ['acid_spit'],
            rangedAttack: { damage: 10, range: 6, cooldown: 3.0, projectileSpeed: 8 }
        },
        EXPLODER: {
            id: 'exploder',
            name: 'Exploder Zombie',
            tier: 'special',
            color: '#aa5555',
            healthMultiplier: 0.5,
            damageMultiplier: 3.0,
            speedMultiplier: 1.1,
            sizeMultiplier: 1.1,
            xpMultiplier: 2.5,
            lootMultiplier: 1.8,
            abilities: ['explode_on_death'],
            explosionRadius: 2.5,
            explosionDamage: 40
        },
        SCREAMER: {
            id: 'screamer',
            name: 'Screamer Zombie',
            tier: 'special',
            color: '#8a6aaa',
            healthMultiplier: 0.6,
            damageMultiplier: 0.5,
            speedMultiplier: 1.0,
            sizeMultiplier: 0.95,
            xpMultiplier: 2.0,
            lootMultiplier: 1.5,
            abilities: ['scream'],
            screamRadius: 8,
            screamCooldown: 10.0
        },

        // === ELITE VARIANTS ===
        BRUTE: {
            id: 'brute',
            name: 'Brute',
            tier: 'elite',
            color: '#3a5a3a',
            healthMultiplier: 5.0,
            damageMultiplier: 2.5,
            speedMultiplier: 0.7,
            sizeMultiplier: 1.6,
            xpMultiplier: 5.0,
            lootMultiplier: 4.0,
            abilities: ['ground_pound', 'enrage'],
            groundPoundRadius: 3,
            groundPoundDamage: 25,
            groundPoundCooldown: 8.0
        },
        SHADOW: {
            id: 'shadow',
            name: 'Shadow Stalker',
            tier: 'elite',
            color: '#2a2a3a',
            healthMultiplier: 2.0,
            damageMultiplier: 2.0,
            speedMultiplier: 1.8,
            sizeMultiplier: 1.0,
            xpMultiplier: 5.0,
            lootMultiplier: 4.0,
            abilities: ['teleport', 'backstab'],
            teleportCooldown: 5.0,
            backstabMultiplier: 2.0
        },
        NECROMANCER: {
            id: 'necromancer',
            name: 'Necromancer',
            tier: 'elite',
            color: '#5a3a6a',
            healthMultiplier: 2.5,
            damageMultiplier: 1.0,
            speedMultiplier: 0.8,
            sizeMultiplier: 1.1,
            xpMultiplier: 6.0,
            lootMultiplier: 5.0,
            abilities: ['summon_minions', 'heal_undead'],
            summonCooldown: 12.0,
            summonCount: 3,
            healRadius: 5,
            healAmount: 5,
            healCooldown: 4.0
        },

        // === BOSS VARIANTS ===
        TITAN: {
            id: 'titan',
            name: 'Zombie Titan',
            tier: 'boss',
            color: '#2a4a2a',
            healthMultiplier: 20.0,
            damageMultiplier: 4.0,
            speedMultiplier: 0.5,
            sizeMultiplier: 2.5,
            xpMultiplier: 50.0,
            lootMultiplier: 20.0,
            abilities: ['ground_pound', 'summon_minions', 'enrage', 'stomp'],
            phases: [
                { healthPercent: 100, abilities: ['ground_pound'] },
                { healthPercent: 66, abilities: ['summon_minions', 'enrage'] },
                { healthPercent: 33, abilities: ['stomp', 'berserk'] }
            ],
            guaranteedDrops: ['titan_heart'],
            bossMusic: true
        },
        QUEEN: {
            id: 'queen',
            name: 'Zombie Queen',
            tier: 'boss',
            color: '#6a2a4a',
            healthMultiplier: 15.0,
            damageMultiplier: 2.5,
            speedMultiplier: 0.7,
            sizeMultiplier: 2.0,
            xpMultiplier: 50.0,
            lootMultiplier: 20.0,
            abilities: ['summon_swarm', 'poison_cloud', 'regenerate'],
            phases: [
                { healthPercent: 100, abilities: ['summon_swarm'] },
                { healthPercent: 50, abilities: ['poison_cloud', 'heal_minions'] },
                { healthPercent: 25, abilities: ['frenzy'] }
            ],
            guaranteedDrops: ['queens_crown'],
            bossMusic: true
        },
        ABOMINATION: {
            id: 'abomination',
            name: 'The Abomination',
            tier: 'boss',
            color: '#4a3a2a',
            healthMultiplier: 25.0,
            damageMultiplier: 5.0,
            speedMultiplier: 0.4,
            sizeMultiplier: 3.0,
            xpMultiplier: 75.0,
            lootMultiplier: 30.0,
            abilities: ['cleave', 'devour', 'spawn_parts', 'regenerate'],
            phases: [
                { healthPercent: 100, abilities: ['cleave', 'devour'] },
                { healthPercent: 60, abilities: ['spawn_parts'] },
                { healthPercent: 30, abilities: ['regenerate', 'berserk'] }
            ],
            guaranteedDrops: ['doom_cleaver', 'abomination_essence'],
            bossMusic: true
        }
    };

    // ============= BOSS LOOT TABLES =============
    const BOSS_LOOT = {
        titan_heart: {
            id: 'titan_heart',
            name: 'Titan Heart',
            type: 'material',
            icon: '💜',
            rarity: 'LEGENDARY',
            description: 'The corrupted heart of a Zombie Titan. Used in legendary crafting.'
        },
        queens_crown: {
            id: 'queens_crown',
            name: "Queen's Crown",
            type: 'accessory',
            icon: '👑',
            rarity: 'LEGENDARY',
            stats: { maxHealth: 75, healthRegen: 1.0, summonDamage: 0.2 },
            description: 'A crown of twisted beauty. Empowers the wearer.'
        },
        abomination_essence: {
            id: 'abomination_essence',
            name: 'Abomination Essence',
            type: 'material',
            icon: '🧪',
            rarity: 'LEGENDARY',
            description: 'Dark essence from the Abomination. Used for forbidden crafting.'
        }
    };

    // ============= STATE =============
    let activeBosses = [];
    let bossSpawnCooldown = 0;
    let lastBossDay = 0;
    let bossesDefeated = 0;
    let currentBossPhases = new Map();

    // ============= SPAWN FUNCTIONS =============
    function spawnZombieWithType(type, x, y, dayMultiplier = 1) {
        const zombieType = ZOMBIE_TYPES[type] || ZOMBIE_TYPES.NORMAL;
        const baseHealth = ZOMBIE_CONFIG.BASE_HEALTH + (dayCount || 0) * ZOMBIE_CONFIG.HEALTH_PER_DAY;
        const baseSpeed = ZOMBIE_CONFIG.BASE_SPEED + (dayCount || 0) * ZOMBIE_CONFIG.SPEED_PER_DAY;
        const baseDamage = ZOMBIE_CONFIG.BASE_DAMAGE + (dayCount || 0) * ZOMBIE_CONFIG.DAMAGE_PER_DAY;

        const speedValue = baseSpeed * zombieType.speedMultiplier;
        const zombie = {
            x: x,
            y: y,
            health: baseHealth * zombieType.healthMultiplier * dayMultiplier,
            maxHealth: baseHealth * zombieType.healthMultiplier * dayMultiplier,
            baseSpeed: speedValue,
            speed: speedValue,
            damage: baseDamage * zombieType.damageMultiplier,
            attackCooldown: 0,
            frame: 0,
            animTimer: 0,
            burnTimer: 0,
            burnDps: 0,
            slowTimer: 0,
            slowAmount: 0,
            // Type info
            zombieType: zombieType,
            typeId: type,
            tier: zombieType.tier,
            color: zombieType.color,
            sizeMultiplier: zombieType.sizeMultiplier,
            // Ability cooldowns
            abilityCooldowns: {},
            // State
            currentPhase: 0,
            isEnraged: false,
            lastTargetPos: null
        };

        // Initialize ability cooldowns
        for (const ability of zombieType.abilities) {
            zombie.abilityCooldowns[ability] = 0;
        }

        // Attach AI
        zombie.ai = new ZombieAI(zombie);

        // Special setup for bosses
        if (zombieType.tier === 'boss') {
            activeBosses.push(zombie);
            currentBossPhases.set(zombie, 0);
            announceBoss(zombie);
        }

        zombies.push(zombie);
        return zombie;
    }

    function spawnBoss(bossType = null) {
        if (activeBosses.length > 0) {
            console.log('Boss already active');
            return null;
        }

        // Select boss type
        const bossTypes = Object.entries(ZOMBIE_TYPES)
            .filter(([_, type]) => type.tier === 'boss')
            .map(([id]) => id);

        const selectedType = bossType || bossTypes[Math.floor(Math.random() * bossTypes.length)];

        // Find spawn position (far from player but within range)
        const angle = Math.random() * Math.PI * 2;
        const distance = 25 + Math.random() * 15;
        const x = player.x + Math.cos(angle) * distance;
        const y = player.y + Math.sin(angle) * distance;

        // Spawn with day multiplier
        const dayMultiplier = 1 + (dayCount - CONFIG.BOSS_SPAWN_START_DAY) * 0.1;

        return spawnZombieWithType(selectedType, x, y, dayMultiplier);
    }

    function spawnSpecialZombie() {
        const roll = Math.random();
        let type = 'NORMAL';

        if (roll < CONFIG.ELITE_SPAWN_CHANCE && dayCount >= 7) {
            // Elite spawn
            const eliteTypes = Object.entries(ZOMBIE_TYPES)
                .filter(([_, t]) => t.tier === 'elite')
                .map(([id]) => id);
            type = eliteTypes[Math.floor(Math.random() * eliteTypes.length)];
        } else if (roll < CONFIG.SPECIAL_SPAWN_CHANCE && dayCount >= 3) {
            // Special spawn
            const specialTypes = Object.entries(ZOMBIE_TYPES)
                .filter(([_, t]) => t.tier === 'special')
                .map(([id]) => id);
            type = specialTypes[Math.floor(Math.random() * specialTypes.length)];
        }

        // Find spawn position
        const angle = Math.random() * Math.PI * 2;
        const dist = ZOMBIE_CONFIG.SPAWN_DIST_MIN +
            Math.random() * (ZOMBIE_CONFIG.SPAWN_DIST_MAX - ZOMBIE_CONFIG.SPAWN_DIST_MIN);

        const x = player.x + Math.cos(angle) * dist;
        const y = player.y + Math.sin(angle) * dist;

        return spawnZombieWithType(type, x, y);
    }

    // ============= BOSS MECHANICS =============
    function announceBoss(boss) {
        const type = boss.zombieType;

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">warning</i> <strong style="color: ${type.color}">${type.name}</strong> has appeared!`,
                [{ text: 'Prepare!', action: () => { }, class: 'reject' }]
            );
        }

        // Screen shake
        if (camera) {
            camera.shake = 15;
        }

        // Spawn announcement particles
        if (typeof spawnParticles === 'function') {
            spawnParticles(boss.x, boss.y, type.color, 30);
        }

        // Play boss music if audio system exists
        if (typeof AudioSystem !== 'undefined' && type.bossMusic) {
            AudioSystem.playBossMusic();
        }
    }

    function updateBossPhase(boss) {
        const type = boss.zombieType;
        if (!type.phases) return;

        const healthPercent = (boss.health / boss.maxHealth) * 100;
        const currentPhase = currentBossPhases.get(boss) || 0;

        // Check for phase transition
        for (let i = type.phases.length - 1; i > currentPhase; i--) {
            if (healthPercent <= type.phases[i].healthPercent) {
                currentBossPhases.set(boss, i);
                onBossPhaseChange(boss, i);
                break;
            }
        }
    }

    function onBossPhaseChange(boss, newPhase) {
        const type = boss.zombieType;
        const phase = type.phases[newPhase];

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">bolt</i> ${type.name} enters phase ${newPhase + 1}!`,
                []
            );
        }

        // Visual feedback
        if (camera) {
            camera.shake = 10;
        }

        if (typeof spawnParticles === 'function') {
            spawnParticles(boss.x, boss.y, type.color, 20);
        }

        // Enable phase abilities
        for (const ability of phase.abilities) {
            if (ability === 'enrage' || ability === 'berserk') {
                boss.isEnraged = true;
                boss.speed *= 1.3;
                boss.damage *= 1.5;
            }
        }
    }

    // ============= ABILITY EXECUTION =============
    function updateBossAbilities(boss, dt) {
        const type = boss.zombieType;
        if (!type) return;

        // Update cooldowns
        for (const ability of Object.keys(boss.abilityCooldowns)) {
            if (boss.abilityCooldowns[ability] > 0) {
                boss.abilityCooldowns[ability] -= dt;
            }
        }

        // Get current phase abilities
        let availableAbilities = [...type.abilities];
        if (type.phases) {
            const phaseIndex = currentBossPhases.get(boss) || 0;
            const phase = type.phases[phaseIndex];
            if (phase) {
                availableAbilities = [...new Set([...availableAbilities, ...phase.abilities])];
            }
        }

        // Try to execute abilities
        for (const ability of availableAbilities) {
            if (boss.abilityCooldowns[ability] <= 0) {
                if (tryExecuteAbility(boss, ability)) {
                    break; // Only execute one ability per update
                }
            }
        }
    }

    function tryExecuteAbility(boss, ability) {
        const type = boss.zombieType;
        const distToPlayer = Math.sqrt((boss.x - player.x) ** 2 + (boss.y - player.y) ** 2);

        switch (ability) {
            case 'ground_pound':
                if (distToPlayer < (type.groundPoundRadius || 3)) {
                    executeGroundPound(boss);
                    boss.abilityCooldowns[ability] = type.groundPoundCooldown || 8;
                    return true;
                }
                break;

            case 'summon_minions':
            case 'summon_swarm':
                if (zombies.length < 50) { // Limit total zombies
                    executeSummon(boss, type.summonCount || 3);
                    boss.abilityCooldowns[ability] = type.summonCooldown || 12;
                    return true;
                }
                break;

            case 'acid_spit':
                if (distToPlayer < (type.rangedAttack?.range || 6)) {
                    executeRangedAttack(boss);
                    boss.abilityCooldowns[ability] = type.rangedAttack?.cooldown || 3;
                    return true;
                }
                break;

            case 'teleport':
                if (distToPlayer > 5 && distToPlayer < 20) {
                    executeTeleport(boss);
                    boss.abilityCooldowns[ability] = type.teleportCooldown || 5;
                    return true;
                }
                break;

            case 'scream':
                if (distToPlayer < (type.screamRadius || 8)) {
                    executeScream(boss);
                    boss.abilityCooldowns[ability] = type.screamCooldown || 10;
                    return true;
                }
                break;

            case 'heal_undead':
                executeHealUndead(boss);
                boss.abilityCooldowns[ability] = type.healCooldown || 4;
                return true;

            case 'poison_cloud':
                if (distToPlayer < 8) {
                    executePoisonCloud(boss);
                    boss.abilityCooldowns[ability] = 15;
                    return true;
                }
                break;

            case 'cleave':
                if (distToPlayer < 3) {
                    executeCleave(boss);
                    boss.abilityCooldowns[ability] = 4;
                    return true;
                }
                break;

            case 'devour':
                // Devour dead zombies to heal
                const nearbyDead = zombies.filter(z =>
                    z.health <= 0 &&
                    Math.sqrt((z.x - boss.x) ** 2 + (z.y - boss.y) ** 2) < 3
                );
                if (nearbyDead.length > 0) {
                    executeDevour(boss, nearbyDead[0]);
                    boss.abilityCooldowns[ability] = 5;
                    return true;
                }
                break;

            case 'stomp':
                if (distToPlayer < 4) {
                    executeStomp(boss);
                    boss.abilityCooldowns[ability] = 6;
                    return true;
                }
                break;

            case 'regenerate':
                if (boss.health < boss.maxHealth * 0.8) {
                    executeRegenerate(boss);
                    boss.abilityCooldowns[ability] = 20;
                    return true;
                }
                break;
        }

        return false;
    }

    // ============= ABILITY IMPLEMENTATIONS =============
    function executeGroundPound(boss) {
        const radius = boss.zombieType.groundPoundRadius || 3;
        const damage = boss.zombieType.groundPoundDamage || 25;

        // Damage player if in range
        const distToPlayer = Math.sqrt((boss.x - player.x) ** 2 + (boss.y - player.y) ** 2);
        if (distToPlayer < radius) {
            const actualDamage = calculateDamageToPlayer(damage);
            player.health -= actualDamage;
            if (typeof addDamageNumber === 'function') {
                addDamageNumber(player.x, player.y - 0.5, actualDamage, '#ff0000');
            }
        }

        // Damage survivors
        for (const survivor of survivors) {
            if (survivor.isPlayer) continue;
            const dist = Math.sqrt((boss.x - survivor.x) ** 2 + (boss.y - survivor.y) ** 2);
            if (dist < radius) {
                survivor.health -= damage * 0.7;
            }
        }

        // Visual effects
        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 360; i += 30) {
                const rad = i * Math.PI / 180;
                const px = boss.x + Math.cos(rad) * radius;
                const py = boss.y + Math.sin(rad) * radius;
                spawnParticles(px, py, '#8B4513', 3);
            }
        }

        // Screen shake
        if (camera) {
            camera.shake = 8;
        }
    }

    function executeSummon(boss, count) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const dist = 2 + Math.random() * 2;
            const x = boss.x + Math.cos(angle) * dist;
            const y = boss.y + Math.sin(angle) * dist;

            // Spawn normal or runner zombies
            const type = Math.random() < 0.3 ? 'RUNNER' : 'NORMAL';
            spawnZombieWithType(type, x, y, 0.7);
        }

        // Visual effect
        if (typeof spawnParticles === 'function') {
            spawnParticles(boss.x, boss.y, '#5a3a6a', 15);
        }
    }

    function executeRangedAttack(boss) {
        const attack = boss.zombieType.rangedAttack;
        const dx = player.x - boss.x;
        const dy = player.y - boss.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        projectiles.push({
            x: boss.x,
            y: boss.y,
            vx: (dx / dist) * attack.projectileSpeed,
            vy: (dy / dist) * attack.projectileSpeed,
            damage: attack.damage,
            size: 4,
            color: '#6a8a3a',
            life: 3.0,
            isEnemyProjectile: true,
            causesPoison: true
        });

        if (typeof spawnParticles === 'function') {
            spawnParticles(boss.x, boss.y, '#6a8a3a', 5);
        }
    }

    function executeTeleport(boss) {
        // Teleport behind player
        const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
        const behindAngle = angle + Math.PI;
        const dist = 2;

        const newX = player.x + Math.cos(behindAngle) * dist;
        const newY = player.y + Math.sin(behindAngle) * dist;

        // Check if valid position
        if (!isSolidAt(newX, newY, 0.3)) {
            // Particles at old position
            if (typeof spawnParticles === 'function') {
                spawnParticles(boss.x, boss.y, '#2a2a3a', 10);
            }

            boss.x = newX;
            boss.y = newY;

            // Particles at new position
            if (typeof spawnParticles === 'function') {
                spawnParticles(boss.x, boss.y, '#2a2a3a', 10);
            }
        }
    }

    function executeScream(boss) {
        const radius = boss.zombieType.screamRadius || 8;

        // Alert all zombies in radius to player position
        for (const zombie of zombies) {
            if (zombie === boss) continue;
            const dist = Math.sqrt((zombie.x - boss.x) ** 2 + (zombie.y - boss.y) ** 2);
            if (dist < radius) {
                zombie.alertedToPlayer = true;
                if (zombie.ai) {
                    zombie.ai.lastKnownPlayerPos = { x: player.x, y: player.y };
                }
            }
        }

        // Spawn more zombies
        for (let i = 0; i < 2; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spawnDist = radius + 2;
            spawnZombieWithType('NORMAL', boss.x + Math.cos(angle) * spawnDist, boss.y + Math.sin(angle) * spawnDist);
        }

        // Visual/audio feedback
        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2;
                spawnParticles(boss.x + Math.cos(angle) * 1.5, boss.y + Math.sin(angle) * 1.5, '#8a6aaa', 3);
            }
        }
    }

    function executeHealUndead(boss) {
        const type = boss.zombieType;
        const radius = type.healRadius || 5;
        const healAmount = type.healAmount || 5;

        for (const zombie of zombies) {
            if (zombie === boss) continue;
            const dist = Math.sqrt((zombie.x - boss.x) ** 2 + (zombie.y - boss.y) ** 2);
            if (dist < radius && zombie.health < zombie.maxHealth) {
                zombie.health = Math.min(zombie.maxHealth, zombie.health + healAmount);
                if (typeof spawnParticles === 'function') {
                    spawnParticles(zombie.x, zombie.y, '#00ff00', 3);
                }
            }
        }
    }

    function executePoisonCloud(boss) {
        // Create poison area effect
        const cloudX = player.x;
        const cloudY = player.y;
        const cloudRadius = 3;
        const duration = 5;

        // Store cloud as temporary hazard
        if (!window.activeHazards) window.activeHazards = [];
        window.activeHazards.push({
            type: 'poison_cloud',
            x: cloudX,
            y: cloudY,
            radius: cloudRadius,
            damage: 5,
            duration: duration,
            remaining: duration,
            tickRate: 0.5,
            tickTimer: 0
        });

        if (typeof spawnParticles === 'function') {
            spawnParticles(cloudX, cloudY, '#00ff00', 20);
        }
    }

    function executeCleave(boss) {
        // Damage in arc in front of boss
        const bossAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
        const cleaveRange = 3;
        const cleaveArc = Math.PI / 2; // 90 degrees

        // Check player
        const playerAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
        const angleDiff = Math.abs(normalizeAngle(playerAngle - bossAngle));
        const distToPlayer = Math.sqrt((boss.x - player.x) ** 2 + (boss.y - player.y) ** 2);

        if (distToPlayer < cleaveRange && angleDiff < cleaveArc / 2) {
            const damage = calculateDamageToPlayer(boss.damage * 1.5);
            player.health -= damage;
            if (typeof addDamageNumber === 'function') {
                addDamageNumber(player.x, player.y - 0.5, damage, '#ff0000');
            }
        }

        // Check survivors
        for (const survivor of survivors) {
            if (survivor.isPlayer) continue;
            const sAngle = Math.atan2(survivor.y - boss.y, survivor.x - boss.x);
            const sAngleDiff = Math.abs(normalizeAngle(sAngle - bossAngle));
            const sDist = Math.sqrt((boss.x - survivor.x) ** 2 + (boss.y - survivor.y) ** 2);

            if (sDist < cleaveRange && sAngleDiff < cleaveArc / 2) {
                survivor.health -= boss.damage * 1.2;
            }
        }

        // Visual effect
        if (typeof spawnParticles === 'function') {
            for (let i = -3; i <= 3; i++) {
                const angle = bossAngle + (i / 3) * (cleaveArc / 2);
                const px = boss.x + Math.cos(angle) * cleaveRange;
                const py = boss.y + Math.sin(angle) * cleaveRange;
                spawnParticles(px, py, '#ff4444', 2);
            }
        }
    }

    function executeDevour(boss, deadZombie) {
        // Heal boss
        const healAmount = deadZombie.maxHealth * 0.3;
        boss.health = Math.min(boss.maxHealth, boss.health + healAmount);

        // Remove dead zombie
        const idx = zombies.indexOf(deadZombie);
        if (idx !== -1) {
            zombies.splice(idx, 1);
        }

        if (typeof spawnParticles === 'function') {
            spawnParticles(boss.x, boss.y, '#ff0000', 10);
        }
        if (typeof addDamageNumber === 'function') {
            addDamageNumber(boss.x, boss.y - 0.5, `+${Math.floor(healAmount)}`, '#00ff00');
        }
    }

    function executeStomp(boss) {
        const radius = 4;

        // Knockback all entities
        const knockbackForce = 5;

        // Player knockback
        const distToPlayer = Math.sqrt((boss.x - player.x) ** 2 + (boss.y - player.y) ** 2);
        if (distToPlayer < radius && distToPlayer > 0) {
            const dx = player.x - boss.x;
            const dy = player.y - boss.y;
            const knockX = (dx / distToPlayer) * knockbackForce;
            const knockY = (dy / distToPlayer) * knockbackForce;

            if (!isSolidAt(player.x + knockX * 0.1, player.y + knockY * 0.1, 0.25)) {
                player.x += knockX * 0.1;
                player.y += knockY * 0.1;
            }
        }

        // Survivor knockback
        for (const survivor of survivors) {
            if (survivor.isPlayer) continue;
            const dist = Math.sqrt((boss.x - survivor.x) ** 2 + (boss.y - survivor.y) ** 2);
            if (dist < radius && dist > 0) {
                const dx = survivor.x - boss.x;
                const dy = survivor.y - boss.y;
                survivor.x += (dx / dist) * knockbackForce * 0.08;
                survivor.y += (dy / dist) * knockbackForce * 0.08;
            }
        }

        if (camera) {
            camera.shake = 12;
        }

        if (typeof spawnParticles === 'function') {
            spawnParticles(boss.x, boss.y, '#8B4513', 25);
        }
    }

    function executeRegenerate(boss) {
        const healPercent = 0.1;
        const healAmount = boss.maxHealth * healPercent;
        boss.health = Math.min(boss.maxHealth, boss.health + healAmount);

        if (typeof spawnParticles === 'function') {
            spawnParticles(boss.x, boss.y, '#00ff00', 15);
        }
        if (typeof addDamageNumber === 'function') {
            addDamageNumber(boss.x, boss.y - 0.5, `+${Math.floor(healAmount)}`, '#00ff00');
        }
    }

    // ============= DEATH HANDLING =============
    function onZombieDeath(zombie) {
        const type = zombie.zombieType;
        if (!type) return;

        // Handle special death effects
        if (type.abilities.includes('explode_on_death')) {
            executeExplosion(zombie);
        }

        // Handle boss death
        if (type.tier === 'boss') {
            onBossDeath(zombie);
        }

        // Drop loot
        dropLoot(zombie);
    }

    function executeExplosion(zombie) {
        const type = zombie.zombieType;
        const radius = type.explosionRadius || 2.5;
        const damage = type.explosionDamage || 40;

        // Damage player
        const distToPlayer = Math.sqrt((zombie.x - player.x) ** 2 + (zombie.y - player.y) ** 2);
        if (distToPlayer < radius) {
            const actualDamage = calculateDamageToPlayer(damage * (1 - distToPlayer / radius));
            player.health -= actualDamage;
            if (typeof addDamageNumber === 'function') {
                addDamageNumber(player.x, player.y - 0.5, actualDamage, '#ff6600');
            }
        }

        // Damage survivors
        for (const survivor of survivors) {
            if (survivor.isPlayer) continue;
            const dist = Math.sqrt((zombie.x - survivor.x) ** 2 + (zombie.y - survivor.y) ** 2);
            if (dist < radius) {
                survivor.health -= damage * 0.8 * (1 - dist / radius);
            }
        }

        // Visual explosion
        if (typeof spawnParticles === 'function') {
            spawnParticles(zombie.x, zombie.y, '#ff6600', 30);
            spawnParticles(zombie.x, zombie.y, '#ffff00', 20);
        }

        if (camera) {
            camera.shake = 6;
        }
    }

    function onBossDeath(boss) {
        const type = boss.zombieType;

        // Remove from active bosses
        const idx = activeBosses.indexOf(boss);
        if (idx !== -1) {
            activeBosses.splice(idx, 1);
        }
        currentBossPhases.delete(boss);

        bossesDefeated++;
        lastBossDay = dayCount;

        // Celebration
        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">emoji_events</i> <strong>${type.name}</strong> defeated! Glory to the survivors!`,
                [{ text: 'Victory!', action: () => { }, class: 'accept' }]
            );
        }

        // Massive XP
        const xpGain = type.xpMultiplier * (ZOMBIE_CONFIG.EXP_BASE + dayCount * ZOMBIE_CONFIG.EXP_PER_DAY);
        player.exp += xpGain;
        if (typeof checkLevelUp === 'function') {
            checkLevelUp();
        }

        // Visual celebration
        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 50; i++) {
                setTimeout(() => {
                    spawnParticles(
                        boss.x + (Math.random() - 0.5) * 4,
                        boss.y + (Math.random() - 0.5) * 4,
                        '#ffd700', 5
                    );
                }, i * 50);
            }
        }

        // Screen shake
        if (camera) {
            camera.shake = 15;
        }

        // Track achievement
        if (window.gameStats) {
            window.gameStats.bossesDefeated = (window.gameStats.bossesDefeated || 0) + 1;
        }

        // Stop boss music
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.stopBossMusic();
        }
    }

    function dropLoot(zombie) {
        const type = zombie.zombieType;
        if (!type) return;

        // Guaranteed drops for bosses
        if (type.guaranteedDrops && typeof EquipmentSystem !== 'undefined') {
            for (const dropId of type.guaranteedDrops) {
                const lootItem = BOSS_LOOT[dropId];
                if (lootItem) {
                    // Add to inventory or create on ground
                    if (EquipmentSystem.ITEMS[dropId]) {
                        const item = EquipmentSystem.createItem(dropId);
                        EquipmentSystem.addToInventory(item);
                    } else {
                        // Material drop - add to resources or special storage
                        if (typeof showNotification === 'function') {
                            showNotification(
                                `<i class="material-icons">star</i> Obtained: ${lootItem.name}!`,
                                []
                            );
                        }
                    }
                }
            }
        }

        // Regular loot drops based on multiplier
        const baseLootChance = ZOMBIE_CONFIG.LOOT_DROP_CHANCE * type.lootMultiplier;
        if (Math.random() < baseLootChance) {
            const foodDrop = Math.floor(1 + Math.random() * 2 * type.lootMultiplier);
            resources.food += foodDrop;
        }

        // Rare item drops for elites
        if (type.tier === 'elite' && Math.random() < 0.3 && typeof EquipmentSystem !== 'undefined') {
            const rareItems = ['health_potion', 'stamina_elixir', 'hunters_ring'];
            const dropItem = rareItems[Math.floor(Math.random() * rareItems.length)];
            const item = EquipmentSystem.createItem(dropItem);
            if (item) {
                EquipmentSystem.addToInventory(item);
                if (typeof showNotification === 'function') {
                    showNotification(
                        `<i class="material-icons">inventory_2</i> Found: ${item.name}!`,
                        []
                    );
                }
            }
        }
    }

    // ============= UPDATE FUNCTIONS =============
    function update(dt) {
        // Update boss spawn cooldown
        if (bossSpawnCooldown > 0) {
            bossSpawnCooldown -= dt;
        }

        // Check for boss spawn conditions
        checkBossSpawn();

        // Update active bosses
        for (const boss of activeBosses) {
            updateBossPhase(boss);
            updateBossAbilities(boss, dt);

            // Check despawn (boss ran too far)
            const distToPlayer = Math.sqrt((boss.x - player.x) ** 2 + (boss.y - player.y) ** 2);
            if (distToPlayer > CONFIG.BOSS_DESPAWN_RANGE) {
                // Teleport boss closer
                const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
                boss.x = player.x - Math.cos(angle) * 30;
                boss.y = player.y - Math.sin(angle) * 30;
            }
        }

        // Update hazards
        updateHazards(dt);
    }

    function checkBossSpawn() {
        if (activeBosses.length > 0) return;
        if (dayCount < CONFIG.BOSS_SPAWN_START_DAY) return;
        if ((player.level || 1) < CONFIG.MIN_PLAYER_LEVEL_FOR_BOSS) return;
        if (dayCount - lastBossDay < CONFIG.BOSS_SPAWN_INTERVAL_DAYS) return;
        if (!isNight) return;
        if (bossSpawnCooldown > 0) return;

        // Spawn boss
        spawnBoss();
        bossSpawnCooldown = 60; // Prevent immediate respawn
    }

    function updateHazards(dt) {
        if (!window.activeHazards) return;

        window.activeHazards = window.activeHazards.filter(hazard => {
            hazard.remaining -= dt;
            if (hazard.remaining <= 0) return false;

            hazard.tickTimer += dt;
            if (hazard.tickTimer >= hazard.tickRate) {
                hazard.tickTimer = 0;

                // Apply hazard damage
                const distToPlayer = Math.sqrt((hazard.x - player.x) ** 2 + (hazard.y - player.y) ** 2);
                if (distToPlayer < hazard.radius) {
                    const damage = calculateDamageToPlayer(hazard.damage);
                    player.health -= damage;

                    if (hazard.type === 'poison_cloud') {
                        // Apply poison status
                        applyPoisonToPlayer(3, 2);
                    }

                    if (typeof addDamageNumber === 'function') {
                        addDamageNumber(player.x, player.y - 0.5, damage, '#00ff00');
                    }
                }

                // Visual effect
                if (typeof spawnParticles === 'function') {
                    spawnParticles(hazard.x, hazard.y, '#00ff00', 3);
                }
            }

            return true;
        });
    }

    // ============= HELPER FUNCTIONS =============
    function calculateDamageToPlayer(baseDamage) {
        let damage = baseDamage;

        // Apply player defense
        const stats = typeof EquipmentSystem !== 'undefined'
            ? EquipmentSystem.getPlayerStats()
            : player.calculatedStats || {};

        if (stats.defense) {
            damage *= (100 / (100 + stats.defense));
        }

        if (stats.damageReduction) {
            damage *= (1 - stats.damageReduction);
        }

        // Apply skill bonuses
        if (typeof SkillSystem !== 'undefined') {
            const defenseBonus = SkillSystem.getSkillBonus('damageReduction');
            damage *= (1 - defenseBonus);
        }

        return Math.max(1, Math.floor(damage));
    }

    function applyPoisonToPlayer(damage, duration) {
        // Check immunity
        if (player.immunities?.has('poison')) return;

        if (!player.statusEffects) player.statusEffects = [];

        // Check for existing poison
        const existingPoison = player.statusEffects.find(e => e.type === 'poison');
        if (existingPoison) {
            existingPoison.duration = Math.max(existingPoison.duration, duration);
            existingPoison.damage = Math.max(existingPoison.damage, damage);
        } else {
            player.statusEffects.push({
                type: 'poison',
                damage: damage,
                duration: duration,
                remaining: duration,
                tickRate: 1.0,
                tickTimer: 0
            });
        }
    }

    function normalizeAngle(angle) {
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        return angle;
    }

    // ============= PUBLIC API =============
    return {
        // Constants
        ZOMBIE_TYPES,
        BOSS_LOOT,
        CONFIG,

        // Spawning
        spawnZombieWithType,
        spawnBoss,
        spawnSpecialZombie,

        // Updates
        update,
        onZombieDeath,

        // State
        getActiveBosses: () => [...activeBosses],
        getBossesDefeated: () => bossesDefeated,
        isBossActive: () => activeBosses.length > 0,

        // Helpers
        calculateDamageToPlayer,
        applyPoisonToPlayer,

        // UI
        drawBossUI: (ctx) => {
            if (activeBosses.length === 0) return;

            const barWidth = 400;
            const barHeight = 25;
            const x = (ctx.canvas.width - barWidth) / 2;
            let y = 30;

            for (const boss of activeBosses) {
                const type = boss.zombieType;

                // Draw background
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(x - 5, y - 25, barWidth + 10, 45);

                // Draw name
                ctx.fillStyle = type.color || '#ff0000';
                ctx.font = 'bold 18px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(type.name.toUpperCase(), x + barWidth / 2, y - 5);

                // Draw health bar
                const healthPercent = boss.health / boss.maxHealth;
                ctx.fillStyle = '#333';
                ctx.fillRect(x, y, barWidth, barHeight);

                const gradient = ctx.createLinearGradient(x, 0, x + barWidth, 0);
                gradient.addColorStop(0, '#8e0000');
                gradient.addColorStop(1, '#ff0000');

                ctx.fillStyle = gradient;
                ctx.fillRect(x, y, barWidth * healthPercent, barHeight);

                // Border
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, barWidth, barHeight);

                // HP Text
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px Arial';
                ctx.fillText(`${Math.ceil(boss.health)} / ${Math.ceil(boss.maxHealth)}`, x + barWidth / 2, y + 17);

                y += 60;
            }
        }
    };
})();

// Export globally
window.BossSystem = BossSystem;
