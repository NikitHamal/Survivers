// ============================================
// ELITE ENEMY & MINI-BOSS SYSTEM
// ============================================
// Production-grade system for elite variants, mini-bosses,
// unique mechanics, special attacks, and enhanced rewards

const EliteSystem = (function() {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        ELITE_SPAWN_CHANCE: 0.08,        // 8% chance for zombie to be elite
        MINIBOSS_SPAWN_INTERVAL: 180,    // seconds between mini-boss spawns
        ELITE_BONUS_DAMAGE: 0.5,         // +50% damage
        ELITE_BONUS_HEALTH: 1.5,         // +150% health
        ELITE_BONUS_SPEED: 0.2,          // +20% speed
        ELITE_BONUS_XP: 3.0,             // 3x XP
        ELITE_BONUS_LOOT: 2.0,           // 2x loot
        MINIBOSS_BONUS_DAMAGE: 1.0,      // +100% damage
        MINIBOSS_BONUS_HEALTH: 5.0,      // +500% health
        MINIBOSS_BONUS_XP: 10.0,         // 10x XP
        MAX_ACTIVE_MINIBOSSES: 3,
        ABILITY_COOLDOWN_BASE: 5.0       // seconds
    };

    // ============= ELITE MODIFIERS =============
    const ELITE_MODIFIERS = {
        // === OFFENSIVE MODIFIERS ===
        berserker: {
            id: 'berserker',
            name: 'Berserker',
            icon: '🔥',
            color: '#ff4444',
            description: 'Deals more damage and attacks faster',
            statMods: {
                damage: 1.5,
                attackSpeed: 1.3,
                health: 0.8
            },
            ability: null,
            visualEffect: 'flame_aura'
        },

        venomous: {
            id: 'venomous',
            name: 'Venomous',
            icon: '☠️',
            color: '#44ff44',
            description: 'Attacks apply poison damage over time',
            statMods: {
                damage: 0.8
            },
            ability: 'poison_attack',
            abilityParams: {
                poisonDamage: 3,
                poisonDuration: 5
            },
            visualEffect: 'poison_drip'
        },

        explosive: {
            id: 'explosive',
            name: 'Explosive',
            icon: '💥',
            color: '#ff8800',
            description: 'Explodes on death dealing area damage',
            statMods: {
                health: 1.2
            },
            ability: 'death_explosion',
            abilityParams: {
                explosionRadius: 3,
                explosionDamage: 40
            },
            visualEffect: 'sparking'
        },

        // === DEFENSIVE MODIFIERS ===
        armored: {
            id: 'armored',
            name: 'Armored',
            icon: '🛡️',
            color: '#888888',
            description: 'Takes reduced damage from all sources',
            statMods: {
                armor: 30,
                speed: 0.8
            },
            ability: null,
            visualEffect: 'metal_sheen'
        },

        regenerating: {
            id: 'regenerating',
            name: 'Regenerating',
            icon: '💚',
            color: '#00ff88',
            description: 'Slowly regenerates health over time',
            statMods: {
                health: 1.3
            },
            ability: 'regeneration',
            abilityParams: {
                healRate: 5,
                healInterval: 1.0
            },
            visualEffect: 'healing_glow'
        },

        phasing: {
            id: 'phasing',
            name: 'Phasing',
            icon: '👻',
            color: '#8888ff',
            description: 'Periodically becomes invulnerable',
            statMods: {
                health: 0.9
            },
            ability: 'phase_shift',
            abilityParams: {
                phaseDuration: 2,
                phaseCooldown: 8
            },
            visualEffect: 'ghostly'
        },

        // === UTILITY MODIFIERS ===
        swift: {
            id: 'swift',
            name: 'Swift',
            icon: '⚡',
            color: '#ffff44',
            description: 'Moves and attacks much faster',
            statMods: {
                speed: 1.6,
                attackSpeed: 1.4,
                health: 0.7
            },
            ability: null,
            visualEffect: 'speed_trail'
        },

        teleporter: {
            id: 'teleporter',
            name: 'Teleporter',
            icon: '🌀',
            color: '#ff44ff',
            description: 'Can teleport short distances',
            statMods: {},
            ability: 'teleport',
            abilityParams: {
                teleportRange: 5,
                teleportCooldown: 6
            },
            visualEffect: 'distortion'
        },

        summoner: {
            id: 'summoner',
            name: 'Summoner',
            icon: '💀',
            color: '#aa44aa',
            description: 'Periodically summons weaker zombies',
            statMods: {
                health: 1.5,
                speed: 0.7
            },
            ability: 'summon_minions',
            abilityParams: {
                summonCount: 2,
                summonCooldown: 10
            },
            visualEffect: 'dark_aura'
        },

        // === SPECIAL MODIFIERS ===
        vampiric: {
            id: 'vampiric',
            name: 'Vampiric',
            icon: '🧛',
            color: '#cc0000',
            description: 'Heals when dealing damage',
            statMods: {
                damage: 1.2
            },
            ability: 'lifesteal',
            abilityParams: {
                lifestealPercent: 0.3
            },
            visualEffect: 'blood_aura'
        },

        freezing: {
            id: 'freezing',
            name: 'Freezing',
            icon: '❄️',
            color: '#44ffff',
            description: 'Attacks slow targets',
            statMods: {},
            ability: 'freeze_attack',
            abilityParams: {
                slowAmount: 0.5,
                slowDuration: 3
            },
            visualEffect: 'frost_aura'
        },

        electric: {
            id: 'electric',
            name: 'Electric',
            icon: '⚡',
            color: '#88ccff',
            description: 'Attacks chain to nearby targets',
            statMods: {
                damage: 0.7
            },
            ability: 'chain_lightning',
            abilityParams: {
                chainRange: 3,
                chainTargets: 2,
                chainDamage: 0.5
            },
            visualEffect: 'electric_sparks'
        }
    };

    // ============= MINI-BOSS DEFINITIONS =============
    const MINI_BOSSES = {
        // === TIER 1 MINI-BOSSES ===
        hulk: {
            id: 'hulk',
            name: 'The Hulk',
            title: 'Mutated Brute',
            icon: '🦍',
            tier: 1,
            description: 'Massive zombie with devastating ground pound',
            baseStats: {
                health: 500,
                damage: 35,
                speed: 0.6,
                armor: 20,
                attackRange: 1.8,
                attackSpeed: 0.5
            },
            size: 2.0,
            abilities: ['ground_pound', 'enrage', 'charge'],
            phases: [
                { healthPercent: 1.0, speed: 1.0, damage: 1.0 },
                { healthPercent: 0.5, speed: 1.3, damage: 1.2, trigger: 'enrage' }
            ],
            rewards: {
                xp: 200,
                resources: { wood: 20, stone: 15, iron: 10 },
                guaranteedDrop: 'hulk_trophy'
            },
            spawnConditions: { minDay: 3, biomes: ['jungle', 'forest', 'swamp'] }
        },

        shadowstalker: {
            id: 'shadowstalker',
            name: 'Shadowstalker',
            title: 'Night Predator',
            icon: '👤',
            tier: 1,
            description: 'Fast, stealthy hunter that ambushes from darkness',
            baseStats: {
                health: 300,
                damage: 45,
                speed: 1.4,
                armor: 5,
                attackRange: 1.2,
                attackSpeed: 1.5
            },
            size: 1.2,
            abilities: ['shadow_step', 'backstab', 'vanish'],
            phases: [
                { healthPercent: 1.0, speed: 1.0, damage: 1.0 },
                { healthPercent: 0.3, speed: 1.5, damage: 1.5, trigger: 'desperation' }
            ],
            rewards: {
                xp: 180,
                resources: { wood: 10, iron: 15 },
                guaranteedDrop: 'shadow_essence'
            },
            spawnConditions: { minDay: 2, biomes: ['jungle', 'forest'], requiresNight: true }
        },

        // === TIER 2 MINI-BOSSES ===
        plaguebearer: {
            id: 'plaguebearer',
            name: 'Plaguebearer',
            title: 'Walking Pestilence',
            icon: '🦠',
            tier: 2,
            description: 'Spreads disease and summons plague zombies',
            baseStats: {
                health: 600,
                damage: 25,
                speed: 0.7,
                armor: 10,
                attackRange: 2.5,
                attackSpeed: 0.8
            },
            size: 1.6,
            abilities: ['plague_cloud', 'infectious_touch', 'spawn_plagued'],
            phases: [
                { healthPercent: 1.0, speed: 1.0, damage: 1.0 },
                { healthPercent: 0.6, speed: 1.0, damage: 1.0, trigger: 'plague_burst' },
                { healthPercent: 0.3, speed: 0.8, damage: 1.5, trigger: 'final_plague' }
            ],
            rewards: {
                xp: 300,
                resources: { wood: 25, stone: 20, iron: 15, food: 10 },
                guaranteedDrop: 'plague_heart'
            },
            spawnConditions: { minDay: 5, biomes: ['swamp', 'jungle'] }
        },

        crystallord: {
            id: 'crystallord',
            name: 'Crystal Lord',
            title: 'Frozen Monarch',
            icon: '💎',
            tier: 2,
            description: 'Creates ice barriers and freezes attackers',
            baseStats: {
                health: 550,
                damage: 30,
                speed: 0.5,
                armor: 25,
                attackRange: 3.0,
                attackSpeed: 0.6
            },
            size: 1.8,
            abilities: ['ice_barrier', 'frost_nova', 'summon_shards'],
            phases: [
                { healthPercent: 1.0, speed: 1.0, damage: 1.0 },
                { healthPercent: 0.5, speed: 0.8, damage: 1.3, trigger: 'ice_armor' }
            ],
            rewards: {
                xp: 350,
                resources: { stone: 30, iron: 25 },
                guaranteedDrop: 'frost_core'
            },
            spawnConditions: { minDay: 6, biomes: ['tundra', 'mountain'] }
        },

        // === TIER 3 MINI-BOSSES ===
        necromancer: {
            id: 'necromancer',
            name: 'The Necromancer',
            title: 'Master of Undeath',
            icon: '🧙',
            tier: 3,
            description: 'Raises fallen zombies and casts death magic',
            baseStats: {
                health: 450,
                damage: 40,
                speed: 0.6,
                armor: 15,
                attackRange: 6.0,
                attackSpeed: 0.7
            },
            size: 1.5,
            abilities: ['raise_dead', 'death_bolt', 'soul_drain', 'bone_shield'],
            phases: [
                { healthPercent: 1.0, speed: 1.0, damage: 1.0, summonRate: 1.0 },
                { healthPercent: 0.6, speed: 1.0, damage: 1.2, summonRate: 1.5, trigger: 'dark_ritual' },
                { healthPercent: 0.25, speed: 0.7, damage: 2.0, summonRate: 2.0, trigger: 'undeath_surge' }
            ],
            rewards: {
                xp: 500,
                resources: { wood: 30, stone: 25, iron: 30 },
                guaranteedDrop: 'necromancer_staff'
            },
            spawnConditions: { minDay: 8, biomes: ['swamp', 'jungle', 'forest'] }
        },

        inferno: {
            id: 'inferno',
            name: 'Inferno',
            title: 'Living Flame',
            icon: '🔥',
            tier: 3,
            description: 'Burns everything around it and leaves fire trails',
            baseStats: {
                health: 400,
                damage: 35,
                speed: 1.0,
                armor: 0,
                attackRange: 2.0,
                attackSpeed: 1.2
            },
            size: 1.7,
            abilities: ['fire_trail', 'flame_burst', 'meteor', 'heat_wave'],
            phases: [
                { healthPercent: 1.0, speed: 1.0, damage: 1.0 },
                { healthPercent: 0.5, speed: 1.2, damage: 1.3, trigger: 'overheat' },
                { healthPercent: 0.2, speed: 1.5, damage: 1.5, trigger: 'supernova' }
            ],
            rewards: {
                xp: 450,
                resources: { stone: 35, iron: 35 },
                guaranteedDrop: 'ember_heart'
            },
            spawnConditions: { minDay: 10, biomes: ['desert', 'volcanic'] }
        }
    };

    // ============= ABILITY DEFINITIONS =============
    const ABILITIES = {
        // === COMMON ABILITIES ===
        poison_attack: {
            execute: (enemy, target, params) => {
                applyStatusToTarget(target, 'poison', params.poisonDuration, {
                    damage: params.poisonDamage
                });
            }
        },

        death_explosion: {
            execute: (enemy, target, params) => {
                createExplosion(enemy.x, enemy.y, params.explosionRadius, params.explosionDamage, true);
            },
            trigger: 'onDeath'
        },

        regeneration: {
            execute: (enemy, target, params) => {
                if (enemy.health < enemy.maxHealth) {
                    enemy.health = Math.min(enemy.maxHealth, enemy.health + params.healRate);
                    spawnHealParticles(enemy.x, enemy.y);
                }
            },
            interval: true
        },

        phase_shift: {
            execute: (enemy, target, params) => {
                enemy.invulnerable = true;
                enemy.phasing = true;
                setTimeout(() => {
                    enemy.invulnerable = false;
                    enemy.phasing = false;
                }, params.phaseDuration * 1000);
            }
        },

        teleport: {
            execute: (enemy, target, params) => {
                const angle = Math.random() * Math.PI * 2;
                const dist = params.teleportRange * (0.5 + Math.random() * 0.5);
                const newX = target.x + Math.cos(angle) * dist;
                const newY = target.y + Math.sin(angle) * dist;

                // Check if position is valid
                const tile = getTile(Math.floor(newX), Math.floor(newY));
                if (!isSolid(tile)) {
                    spawnTeleportParticles(enemy.x, enemy.y);
                    enemy.x = newX;
                    enemy.y = newY;
                    spawnTeleportParticles(newX, newY);
                }
            }
        },

        summon_minions: {
            execute: (enemy, target, params) => {
                for (let i = 0; i < params.summonCount; i++) {
                    const angle = (Math.PI * 2 * i) / params.summonCount;
                    const dist = 2;
                    const x = enemy.x + Math.cos(angle) * dist;
                    const y = enemy.y + Math.sin(angle) * dist;
                    spawnSummonedZombie(x, y, enemy);
                }
            }
        },

        lifesteal: {
            execute: (enemy, target, params, damageDealt) => {
                const heal = damageDealt * params.lifestealPercent;
                enemy.health = Math.min(enemy.maxHealth, enemy.health + heal);
            },
            trigger: 'onHit'
        },

        freeze_attack: {
            execute: (enemy, target, params) => {
                applyStatusToTarget(target, 'slow', params.slowDuration, {
                    amount: params.slowAmount
                });
            }
        },

        chain_lightning: {
            execute: (enemy, target, params, damageDealt) => {
                const nearbyTargets = findNearbyTargets(target, params.chainRange, params.chainTargets);
                for (const t of nearbyTargets) {
                    t.health -= damageDealt * params.chainDamage;
                    spawnLightningParticles(target.x, target.y, t.x, t.y);
                }
            },
            trigger: 'onHit'
        },

        // === MINI-BOSS ABILITIES ===
        ground_pound: {
            cooldown: 8,
            execute: (boss, target, phase) => {
                const radius = 4;
                const damage = boss.damage * 1.5;

                // Windup
                boss.isChanneling = true;
                boss.channelTime = 1.0;

                setTimeout(() => {
                    boss.isChanneling = false;
                    createGroundPound(boss.x, boss.y, radius, damage);
                }, 1000);
            }
        },

        enrage: {
            cooldown: 0,
            execute: (boss, target, phase) => {
                boss.enraged = true;
                boss.currentSpeed *= 1.3;
                boss.damage *= 1.2;
                spawnEnrageParticles(boss.x, boss.y);
            },
            trigger: 'phase'
        },

        charge: {
            cooldown: 10,
            execute: (boss, target, phase) => {
                const dx = target.x - boss.x;
                const dy = target.y - boss.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                boss.charging = true;
                boss.chargeDir = { x: dx / dist, y: dy / dist };
                boss.chargeTime = 1.5;
                boss.chargeSpeed = boss.currentSpeed * 3;
                boss.chargeDamage = boss.damage * 2;
            }
        },

        shadow_step: {
            cooldown: 5,
            execute: (boss, target, phase) => {
                // Teleport behind target
                const angle = Math.atan2(target.y - boss.y, target.x - boss.x);
                const behindX = target.x + Math.cos(angle + Math.PI) * 1.5;
                const behindY = target.y + Math.sin(angle + Math.PI) * 1.5;

                spawnShadowParticles(boss.x, boss.y);
                boss.x = behindX;
                boss.y = behindY;
                spawnShadowParticles(behindX, behindY);

                // Bonus damage on next attack
                boss.backstabReady = true;
            }
        },

        backstab: {
            cooldown: 0,
            execute: (boss, target, phase) => {
                if (boss.backstabReady) {
                    boss.backstabReady = false;
                    return boss.damage * 2;
                }
                return boss.damage;
            },
            trigger: 'onAttack'
        },

        vanish: {
            cooldown: 15,
            execute: (boss, target, phase) => {
                boss.invisible = true;
                boss.invulnerable = true;

                setTimeout(() => {
                    boss.invisible = false;
                    boss.invulnerable = false;
                }, 3000);
            }
        },

        plague_cloud: {
            cooldown: 12,
            execute: (boss, target, phase) => {
                createPoisonCloud(boss.x, boss.y, 4, 8, 6);
            }
        },

        infectious_touch: {
            cooldown: 0,
            execute: (boss, target, phase) => {
                applyStatusToTarget(target, 'plague', 10, { damage: 5, spread: true });
            },
            trigger: 'onHit'
        },

        spawn_plagued: {
            cooldown: 15,
            execute: (boss, target, phase) => {
                for (let i = 0; i < 3; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 3 + Math.random() * 2;
                    spawnPlaguedZombie(
                        boss.x + Math.cos(angle) * dist,
                        boss.y + Math.sin(angle) * dist
                    );
                }
            }
        },

        ice_barrier: {
            cooldown: 20,
            execute: (boss, target, phase) => {
                boss.iceBarrier = {
                    health: 100,
                    duration: 8
                };
                spawnIceBarrierParticles(boss.x, boss.y);
            }
        },

        frost_nova: {
            cooldown: 10,
            execute: (boss, target, phase) => {
                const radius = 5;
                const targets = findTargetsInRadius(boss.x, boss.y, radius);

                for (const t of targets) {
                    t.health -= 20;
                    applyStatusToTarget(t, 'freeze', 2, {});
                }

                spawnFrostNovaParticles(boss.x, boss.y, radius);
            }
        },

        summon_shards: {
            cooldown: 8,
            execute: (boss, target, phase) => {
                for (let i = 0; i < 4; i++) {
                    const angle = (Math.PI * 2 * i) / 4;
                    spawnIceShard(boss.x, boss.y, angle, target);
                }
            }
        },

        raise_dead: {
            cooldown: 12,
            execute: (boss, target, phase) => {
                const count = Math.floor(2 * (phase.summonRate || 1));
                for (let i = 0; i < count; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 4 + Math.random() * 3;
                    spawnUndeadMinion(
                        boss.x + Math.cos(angle) * dist,
                        boss.y + Math.sin(angle) * dist
                    );
                }
                spawnNecromancyParticles(boss.x, boss.y);
            }
        },

        death_bolt: {
            cooldown: 3,
            execute: (boss, target, phase) => {
                spawnDeathBolt(boss.x, boss.y, target);
            }
        },

        soul_drain: {
            cooldown: 15,
            execute: (boss, target, phase) => {
                const drainDamage = 30;
                target.health -= drainDamage;
                boss.health = Math.min(boss.maxHealth, boss.health + drainDamage);
                spawnSoulDrainParticles(target.x, target.y, boss.x, boss.y);
            }
        },

        bone_shield: {
            cooldown: 25,
            execute: (boss, target, phase) => {
                boss.boneShield = {
                    charges: 5,
                    duration: 10
                };
            }
        },

        fire_trail: {
            cooldown: 0,
            execute: (boss, target, phase) => {
                createFireTile(boss.prevX || boss.x, boss.prevY || boss.y, 5);
            },
            trigger: 'onMove'
        },

        flame_burst: {
            cooldown: 6,
            execute: (boss, target, phase) => {
                const radius = 3;
                const targets = findTargetsInRadius(boss.x, boss.y, radius);

                for (const t of targets) {
                    t.health -= 25;
                    applyStatusToTarget(t, 'burn', 4, { damage: 8 });
                }

                spawnFlameBurstParticles(boss.x, boss.y, radius);
            }
        },

        meteor: {
            cooldown: 15,
            execute: (boss, target, phase) => {
                // Target position with delay
                const targetX = target.x;
                const targetY = target.y;

                spawnMeteorWarning(targetX, targetY, 3);

                setTimeout(() => {
                    createExplosion(targetX, targetY, 3, 60, true);
                    spawnMeteorImpactParticles(targetX, targetY);
                }, 1500);
            }
        },

        heat_wave: {
            cooldown: 20,
            execute: (boss, target, phase) => {
                boss.heatWaveActive = true;
                boss.heatWaveRadius = 6;
                boss.heatWaveDuration = 5;
                boss.heatWaveDamage = 10;
            }
        }
    };

    // ============= STATE =============
    let activeElites = [];
    let activeMiniBosses = [];
    let miniBossSpawnTimer = CONFIG.MINIBOSS_SPAWN_INTERVAL;
    let eliteIdCounter = 0;
    let defeatedMiniBosses = new Set();

    // ============= ELITE CREATION =============
    function makeElite(zombie) {
        if (zombie.isElite || zombie.isMiniBoss) return zombie;

        // Select random modifier
        const modifierIds = Object.keys(ELITE_MODIFIERS);
        const modifierId = modifierIds[Math.floor(Math.random() * modifierIds.length)];
        const modifier = ELITE_MODIFIERS[modifierId];

        // Apply elite bonuses
        zombie.isElite = true;
        zombie.eliteId = eliteIdCounter++;
        zombie.eliteModifier = modifier;
        zombie.eliteColor = modifier.color;

        // Apply stat modifiers
        zombie.maxHealth *= CONFIG.ELITE_BONUS_HEALTH * (modifier.statMods.health || 1);
        zombie.health = zombie.maxHealth;
        zombie.damage *= CONFIG.ELITE_BONUS_DAMAGE * (modifier.statMods.damage || 1);
        zombie.speed *= CONFIG.ELITE_BONUS_SPEED + (modifier.statMods.speed || 1);
        zombie.armor = (zombie.armor || 0) + (modifier.statMods.armor || 0);
        zombie.attackSpeed = (zombie.attackSpeed || 1) * (modifier.statMods.attackSpeed || 1);

        // Set up ability
        if (modifier.ability) {
            zombie.eliteAbility = modifier.ability;
            zombie.eliteAbilityParams = modifier.abilityParams;
            zombie.abilityTimer = 0;
            zombie.abilityCooldown = CONFIG.ABILITY_COOLDOWN_BASE;
        }

        // XP and loot bonuses
        zombie.xpMultiplier = CONFIG.ELITE_BONUS_XP;
        zombie.lootMultiplier = CONFIG.ELITE_BONUS_LOOT;

        // Visual
        zombie.visualEffect = modifier.visualEffect;

        activeElites.push(zombie);
        return zombie;
    }

    function shouldBeElite() {
        return Math.random() < CONFIG.ELITE_SPAWN_CHANCE;
    }

    // ============= MINI-BOSS CREATION =============
    function spawnMiniBoss(bossId = null, x = null, y = null) {
        if (activeMiniBosses.length >= CONFIG.MAX_ACTIVE_MINIBOSSES) {
            return null;
        }

        // Select boss based on conditions
        let bossDef;
        if (bossId && MINI_BOSSES[bossId]) {
            bossDef = MINI_BOSSES[bossId];
        } else {
            bossDef = selectAppropriateMiniBoss();
        }

        if (!bossDef) return null;

        // Determine spawn position
        if (x === null || y === null) {
            const spawnPos = findMiniBossSpawnPosition();
            if (!spawnPos) return null;
            x = spawnPos.x;
            y = spawnPos.y;
        }

        // Create mini-boss entity
        const boss = {
            id: `miniboss_${eliteIdCounter++}`,
            bossId: bossDef.id,
            type: bossDef,
            name: bossDef.name,
            title: bossDef.title,

            // Position
            x: x,
            y: y,
            prevX: x,
            prevY: y,

            // Stats
            health: bossDef.baseStats.health,
            maxHealth: bossDef.baseStats.health,
            damage: bossDef.baseStats.damage,
            speed: bossDef.baseStats.speed,
            currentSpeed: bossDef.baseStats.speed,
            armor: bossDef.baseStats.armor,
            attackRange: bossDef.baseStats.attackRange,
            attackSpeed: bossDef.baseStats.attackSpeed,

            // Size
            size: bossDef.size,

            // State
            isMiniBoss: true,
            isAlive: true,
            currentPhase: 0,
            phaseTriggered: [false, false, false],

            // Abilities
            abilityCooldowns: {},
            activeAbilities: [],

            // Combat state
            target: null,
            attackTimer: 0,
            isChanneling: false,
            channelTime: 0,

            // Special states
            enraged: false,
            charging: false,
            invisible: false,
            invulnerable: false,
            iceBarrier: null,
            boneShield: null,
            heatWaveActive: false,

            // Rewards
            rewards: bossDef.rewards,
            xpMultiplier: CONFIG.MINIBOSS_BONUS_XP
        };

        // Initialize ability cooldowns
        for (const abilityId of bossDef.abilities) {
            boss.abilityCooldowns[abilityId] = 0;
        }

        activeMiniBosses.push(boss);

        // Notification
        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">warning</i> ${bossDef.icon} ${bossDef.name} has appeared!`,
                []
            );
        }

        // Sound
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('boss_spawn', { position: { x, y } });
        }

        // Spawn particles
        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 30; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 3;
                spawnParticles(
                    x + Math.cos(angle) * dist,
                    y + Math.sin(angle) * dist,
                    '#ff4444',
                    5
                );
            }
        }

        return boss;
    }

    function selectAppropriateMiniBoss() {
        const currentDay = typeof dayCount !== 'undefined' ? dayCount : 1;
        let currentBiome = 'jungle';
        if (typeof BiomeSystem !== 'undefined' && BiomeSystem.getCurrentBiome) {
            currentBiome = BiomeSystem.getCurrentBiome() || 'jungle';
        }

        // Filter valid bosses
        const validBosses = Object.values(MINI_BOSSES).filter(boss => {
            const conditions = boss.spawnConditions;

            // Check day requirement
            if (conditions.minDay && currentDay < conditions.minDay) return false;

            // Check biome
            if (conditions.biomes && !conditions.biomes.includes(currentBiome)) return false;

            // Check night requirement
            if (conditions.requiresNight && typeof isNight !== 'undefined' && !isNight) return false;

            // Don't spawn same boss twice in same session
            if (defeatedMiniBosses.has(boss.id)) return false;

            return true;
        });

        if (validBosses.length === 0) return null;

        // Weight by tier (lower tier more likely early)
        const weighted = [];
        for (const boss of validBosses) {
            const weight = Math.max(1, 4 - boss.tier);
            for (let i = 0; i < weight; i++) {
                weighted.push(boss);
            }
        }

        return weighted[Math.floor(Math.random() * weighted.length)];
    }

    function findMiniBossSpawnPosition() {
        if (typeof player === 'undefined') return null;

        // Spawn at edge of visible area
        const angle = Math.random() * Math.PI * 2;
        const distance = 15 + Math.random() * 10;

        const x = player.x + Math.cos(angle) * distance;
        const y = player.y + Math.sin(angle) * distance;

        // Validate position
        const tile = getTile(Math.floor(x), Math.floor(y));
        if (isSolid(tile)) return null;

        return { x, y };
    }

    // ============= UPDATE LOOP =============
    function update(dt) {
        // Update spawn timer
        miniBossSpawnTimer -= dt;
        if (miniBossSpawnTimer <= 0) {
            miniBossSpawnTimer = CONFIG.MINIBOSS_SPAWN_INTERVAL;
            trySpawnMiniBoss();
        }

        // Update elites
        updateElites(dt);

        // Update mini-bosses
        updateMiniBosses(dt);
    }

    function trySpawnMiniBoss() {
        // Only spawn during appropriate conditions
        if (typeof dayCount !== 'undefined' && dayCount < 2) return;

        // Higher chance at night
        let spawnChance = 0.3;
        if (typeof isNight !== 'undefined' && isNight) {
            spawnChance = 0.5;
        }

        if (Math.random() < spawnChance) {
            spawnMiniBoss();
        }
    }

    function updateElites(dt) {
        for (let i = activeElites.length - 1; i >= 0; i--) {
            const elite = activeElites[i];

            // Remove dead elites
            if (elite.health <= 0) {
                handleEliteDeath(elite);
                activeElites.splice(i, 1);
                continue;
            }

            // Update ability cooldown
            if (elite.abilityTimer > 0) {
                elite.abilityTimer -= dt;
            }

            // Update interval abilities
            if (elite.eliteAbility) {
                const ability = ABILITIES[elite.eliteAbility];
                if (ability && ability.interval && elite.abilityTimer <= 0) {
                    ability.execute(elite, null, elite.eliteAbilityParams);
                    elite.abilityTimer = elite.abilityCooldown;
                }
            }
        }
    }

    function updateMiniBosses(dt) {
        for (let i = activeMiniBosses.length - 1; i >= 0; i--) {
            const boss = activeMiniBosses[i];

            // Remove dead bosses
            if (boss.health <= 0 && boss.isAlive) {
                handleMiniBossDeath(boss);
                boss.isAlive = false;
                activeMiniBosses.splice(i, 1);
                continue;
            }

            // Check phase transitions
            checkPhaseTransition(boss);

            // Update ability cooldowns
            for (const abilityId of Object.keys(boss.abilityCooldowns)) {
                if (boss.abilityCooldowns[abilityId] > 0) {
                    boss.abilityCooldowns[abilityId] -= dt;
                }
            }

            // Update channeling
            if (boss.isChanneling) {
                boss.channelTime -= dt;
                if (boss.channelTime <= 0) {
                    boss.isChanneling = false;
                }
                continue; // Don't do anything else while channeling
            }

            // Update charge
            if (boss.charging) {
                updateBossCharge(boss, dt);
                continue;
            }

            // Update heat wave
            if (boss.heatWaveActive) {
                updateHeatWave(boss, dt);
            }

            // Update ice barrier
            if (boss.iceBarrier) {
                boss.iceBarrier.duration -= dt;
                if (boss.iceBarrier.duration <= 0) {
                    boss.iceBarrier = null;
                }
            }

            // Update bone shield
            if (boss.boneShield) {
                boss.boneShield.duration -= dt;
                if (boss.boneShield.duration <= 0) {
                    boss.boneShield = null;
                }
            }

            // AI: Find target and use abilities
            updateMiniBossAI(boss, dt);
        }
    }

    function checkPhaseTransition(boss) {
        const healthPercent = boss.health / boss.maxHealth;
        const phases = boss.type.phases;

        for (let i = phases.length - 1; i >= 0; i--) {
            const phase = phases[i];
            if (healthPercent <= phase.healthPercent && !boss.phaseTriggered[i]) {
                boss.phaseTriggered[i] = true;
                boss.currentPhase = i;

                // Apply phase modifiers
                boss.currentSpeed = boss.speed * phase.speed;
                boss.damage = boss.type.baseStats.damage * phase.damage;

                // Trigger phase ability
                if (phase.trigger) {
                    triggerPhaseAbility(boss, phase.trigger);
                }

                break;
            }
        }
    }

    function triggerPhaseAbility(boss, triggerName) {
        // Visual feedback
        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                spawnParticles(
                    boss.x + Math.cos(angle) * 2,
                    boss.y + Math.sin(angle) * 2,
                    '#ff8800',
                    5
                );
            }
        }

        // Sound
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('boss_spawn', { position: { x: boss.x, y: boss.y }, volumeMultiplier: 0.7 });
        }

        // Execute trigger-specific logic
        switch (triggerName) {
            case 'enrage':
                boss.enraged = true;
                break;
            case 'ice_armor':
                boss.armor += 20;
                break;
            case 'dark_ritual':
            case 'plague_burst':
            case 'final_plague':
                // Trigger the ability immediately
                const ability = ABILITIES[triggerName.replace('_', '_')];
                if (ability) {
                    ability.execute(boss, player, boss.type.phases[boss.currentPhase]);
                }
                break;
        }
    }

    function updateMiniBossAI(boss, dt) {
        if (typeof player === 'undefined') return;

        boss.target = player;
        const dx = player.x - boss.x;
        const dy = player.y - boss.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Try to use abilities
        const phase = boss.type.phases[boss.currentPhase];
        for (const abilityId of boss.type.abilities) {
            const ability = ABILITIES[abilityId];
            if (!ability || ability.trigger) continue; // Skip trigger abilities

            if (boss.abilityCooldowns[abilityId] <= 0) {
                // Check if ability should be used
                if (shouldUseAbility(boss, abilityId, dist)) {
                    ability.execute(boss, player, phase);
                    boss.abilityCooldowns[abilityId] = ability.cooldown || CONFIG.ABILITY_COOLDOWN_BASE;
                }
            }
        }

        // Movement
        if (dist > boss.attackRange && !boss.invisible) {
            boss.prevX = boss.x;
            boss.prevY = boss.y;

            const moveSpeed = boss.currentSpeed * (typeof player !== 'undefined' ? player.speed : 3) * dt;
            boss.x += (dx / dist) * moveSpeed;
            boss.y += (dy / dist) * moveSpeed;

            // Fire trail for Inferno
            if (boss.bossId === 'inferno') {
                const fireTrail = ABILITIES.fire_trail;
                if (fireTrail) {
                    fireTrail.execute(boss, player, phase);
                }
            }
        }

        // Attack
        if (dist <= boss.attackRange) {
            boss.attackTimer -= dt;
            if (boss.attackTimer <= 0) {
                performMiniBossAttack(boss, player);
                boss.attackTimer = 1 / boss.attackSpeed;
            }
        }
    }

    function shouldUseAbility(boss, abilityId, distToTarget) {
        switch (abilityId) {
            case 'charge':
                return distToTarget > 5 && distToTarget < 12;
            case 'ground_pound':
            case 'flame_burst':
            case 'frost_nova':
                return distToTarget < 4;
            case 'shadow_step':
                return distToTarget > 3;
            case 'meteor':
            case 'death_bolt':
            case 'summon_shards':
                return distToTarget > 2;
            case 'vanish':
                return boss.health < boss.maxHealth * 0.3;
            case 'ice_barrier':
            case 'bone_shield':
                return boss.health < boss.maxHealth * 0.5;
            default:
                return Math.random() < 0.3;
        }
    }

    function updateBossCharge(boss, dt) {
        boss.chargeTime -= dt;

        if (boss.chargeTime <= 0) {
            boss.charging = false;
            return;
        }

        // Move in charge direction
        boss.prevX = boss.x;
        boss.prevY = boss.y;
        boss.x += boss.chargeDir.x * boss.chargeSpeed * dt;
        boss.y += boss.chargeDir.y * boss.chargeSpeed * dt;

        // Check for collision with player
        const dx = player.x - boss.x;
        const dy = player.y - boss.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < boss.size) {
            player.health -= boss.chargeDamage;
            boss.charging = false;

            if (typeof addDamageNumber === 'function') {
                addDamageNumber(player.x, player.y - 0.5, boss.chargeDamage, '#ff4444');
            }
            if (typeof spawnParticles === 'function') {
                spawnParticles(player.x, player.y, '#ff4444', 15);
            }
        }

        // Check for wall collision
        const tile = getTile(Math.floor(boss.x), Math.floor(boss.y));
        if (isSolid(tile)) {
            boss.charging = false;
            // Stun briefly
            boss.isChanneling = true;
            boss.channelTime = 0.5;
        }
    }

    function updateHeatWave(boss, dt) {
        boss.heatWaveDuration -= dt;

        if (boss.heatWaveDuration <= 0) {
            boss.heatWaveActive = false;
            return;
        }

        // Damage nearby targets
        const targets = findTargetsInRadius(boss.x, boss.y, boss.heatWaveRadius);
        for (const t of targets) {
            t.health -= boss.heatWaveDamage * dt;
            applyStatusToTarget(t, 'burn', 2, { damage: 5 });
        }
    }

    function performMiniBossAttack(boss, target) {
        let damage = boss.damage;

        // Check for backstab
        if (boss.backstabReady) {
            damage *= 2;
            boss.backstabReady = false;
        }

        target.health -= damage;

        // Trigger on-hit abilities
        for (const abilityId of boss.type.abilities) {
            const ability = ABILITIES[abilityId];
            if (ability && ability.trigger === 'onHit') {
                ability.execute(boss, target, boss.type.phases[boss.currentPhase], damage);
            }
        }

        if (typeof addDamageNumber === 'function') {
            addDamageNumber(target.x, target.y - 0.5, damage, '#ff4444');
        }
        if (typeof spawnParticles === 'function') {
            spawnParticles(target.x, target.y, '#ff4444', 8);
        }
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('player_hit', { position: { x: target.x, y: target.y } });
        }
    }

    // ============= DEATH HANDLING =============
    function handleEliteDeath(elite) {
        // Death explosion if applicable
        if (elite.eliteAbility === 'death_explosion') {
            const ability = ABILITIES.death_explosion;
            ability.execute(elite, null, elite.eliteAbilityParams);
        }

        // Enhanced loot
        if (typeof resources !== 'undefined') {
            const lootMultiplier = elite.lootMultiplier || CONFIG.ELITE_BONUS_LOOT;
            resources.wood += Math.floor(2 * lootMultiplier);
            resources.iron += Math.floor(1 * lootMultiplier);
        }

        // XP
        if (typeof player !== 'undefined') {
            player.exp += Math.floor(20 * (elite.xpMultiplier || CONFIG.ELITE_BONUS_XP));
            if (typeof checkLevelUp === 'function') {
                checkLevelUp();
            }
        }

        // Notification
        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">star</i> Elite ${elite.eliteModifier.name} defeated!`,
                []
            );
        }

        // Particles
        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 20; i++) {
                spawnParticles(elite.x, elite.y, elite.eliteColor, 5);
            }
        }

        // Achievement check
        if (typeof AchievementSystem !== 'undefined') {
            AchievementSystem.recordStat('elitesKilled', 1);
        }
    }

    function handleMiniBossDeath(boss) {
        defeatedMiniBosses.add(boss.bossId);

        // Grant rewards
        const rewards = boss.rewards;

        // Resources
        if (typeof resources !== 'undefined' && rewards.resources) {
            for (const [resource, amount] of Object.entries(rewards.resources)) {
                resources[resource] = (resources[resource] || 0) + amount;
            }
        }

        // XP
        if (typeof player !== 'undefined') {
            player.exp += rewards.xp;
            if (typeof checkLevelUp === 'function') {
                checkLevelUp();
            }
        }

        // Guaranteed drop
        if (rewards.guaranteedDrop && typeof EquipmentSystem !== 'undefined') {
            EquipmentSystem.addToInventory({
                id: rewards.guaranteedDrop,
                name: formatDropName(rewards.guaranteedDrop),
                type: 'trophy',
                icon: boss.type.icon,
                rarity: 'legendary',
                description: `Trophy from defeating ${boss.name}`
            });
        }

        // Notification
        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">emoji_events</i> ${boss.type.icon} ${boss.name} defeated! (+${rewards.xp} XP)`,
                []
            );
        }

        // Sound
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('achievement');
        }

        // Massive particle effect
        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 50; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 4;
                spawnParticles(
                    boss.x + Math.cos(angle) * dist,
                    boss.y + Math.sin(angle) * dist,
                    ['#ffdd00', '#ff8800', '#ff4400'][Math.floor(Math.random() * 3)],
                    6
                );
            }
        }

        // Screen shake
        if (typeof camera !== 'undefined') {
            camera.shake = 15;
        }

        // Achievement
        if (typeof AchievementSystem !== 'undefined') {
            AchievementSystem.recordStat('miniBossesKilled', 1);
            AchievementSystem.recordStat(`miniBoss_${boss.bossId}`, 1);
        }
    }

    // ============= DAMAGE HANDLING =============
    function handleDamageToElite(elite, damage, source) {
        // Check phasing
        if (elite.phasing || elite.invulnerable) {
            return 0;
        }

        // Apply armor reduction
        const armor = elite.armor || 0;
        const reducedDamage = damage * (100 / (100 + armor));

        elite.health -= reducedDamage;
        elite.damageFlash = 0.2;

        return reducedDamage;
    }

    function handleDamageToMiniBoss(boss, damage, source) {
        // Check invulnerability
        if (boss.invulnerable) {
            if (typeof addDamageNumber === 'function') {
                addDamageNumber(boss.x, boss.y - 0.5, 'IMMUNE', '#888888');
            }
            return 0;
        }

        // Check ice barrier
        if (boss.iceBarrier) {
            boss.iceBarrier.health -= damage;
            if (boss.iceBarrier.health <= 0) {
                boss.iceBarrier = null;
            }
            if (typeof spawnParticles === 'function') {
                spawnParticles(boss.x, boss.y, '#88ccff', 6);
            }
            return 0;
        }

        // Check bone shield
        if (boss.boneShield) {
            boss.boneShield.charges--;
            if (boss.boneShield.charges <= 0) {
                boss.boneShield = null;
            }
            if (typeof spawnParticles === 'function') {
                spawnParticles(boss.x, boss.y, '#cccccc', 6);
            }
            return 0;
        }

        // Apply armor reduction
        const reducedDamage = damage * (100 / (100 + boss.armor));
        boss.health -= reducedDamage;

        if (typeof addDamageNumber === 'function') {
            addDamageNumber(boss.x, boss.y - 0.5, Math.floor(reducedDamage), '#ffaa00');
        }

        return reducedDamage;
    }

    // ============= HELPER FUNCTIONS =============
    function applyStatusToTarget(target, statusType, duration, params) {
        if (!target.statusEffects) target.statusEffects = {};

        target.statusEffects[statusType] = {
            duration,
            remaining: duration,
            ...params
        };

        // Apply immediate effects
        switch (statusType) {
            case 'freeze':
                target.frozen = true;
                break;
            case 'slow':
                target.speedModifier = (target.speedModifier || 1) * (1 - (params.amount || 0.5));
                break;
        }
    }

    function findTargetsInRadius(x, y, radius) {
        const targets = [];

        if (typeof player !== 'undefined') {
            const dist = Math.sqrt((player.x - x) ** 2 + (player.y - y) ** 2);
            if (dist <= radius) targets.push(player);
        }

        if (typeof survivors !== 'undefined') {
            for (const s of survivors) {
                if (s.isPlayer) continue;
                const dist = Math.sqrt((s.x - x) ** 2 + (s.y - y) ** 2);
                if (dist <= radius) targets.push(s);
            }
        }

        return targets;
    }

    function findNearbyTargets(source, range, maxCount) {
        const targets = [];
        const allies = [player, ...survivors.filter(s => !s.isPlayer)];

        for (const ally of allies) {
            if (ally === source) continue;
            const dist = Math.sqrt((ally.x - source.x) ** 2 + (ally.y - source.y) ** 2);
            if (dist <= range) {
                targets.push(ally);
                if (targets.length >= maxCount) break;
            }
        }

        return targets;
    }

    function createExplosion(x, y, radius, damage, friendlyFire) {
        const targets = findTargetsInRadius(x, y, radius);

        for (const t of targets) {
            const dist = Math.sqrt((t.x - x) ** 2 + (t.y - y) ** 2);
            const falloff = 1 - (dist / radius);
            t.health -= damage * falloff;

            if (typeof addDamageNumber === 'function') {
                addDamageNumber(t.x, t.y - 0.5, Math.floor(damage * falloff), '#ff6622');
            }
        }

        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 25; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * radius;
                spawnParticles(
                    x + Math.cos(angle) * dist,
                    y + Math.sin(angle) * dist,
                    ['#ff4400', '#ffaa00', '#ff6622'][Math.floor(Math.random() * 3)],
                    4
                );
            }
        }

        if (typeof camera !== 'undefined') {
            camera.shake = Math.max(camera.shake, 8);
        }

        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('explosion', { position: { x, y } });
        }
    }

    function createGroundPound(x, y, radius, damage) {
        createExplosion(x, y, radius, damage, true);

        // Stun targets
        const targets = findTargetsInRadius(x, y, radius);
        for (const t of targets) {
            applyStatusToTarget(t, 'stun', 1, {});
        }
    }

    function createPoisonCloud(x, y, radius, duration, damage) {
        if (typeof TrapSystem !== 'undefined') {
            // Reuse trap system's poison cloud
            TrapSystem.createTrap('poison_cloud', x, y, { free: true });
        }
    }

    function createFireTile(x, y, duration) {
        // Create temporary fire hazard
        if (typeof spawnParticles === 'function') {
            spawnParticles(x, y, '#ff4400', 3);
        }
    }

    function spawnSummonedZombie(x, y, summoner) {
        if (typeof zombies === 'undefined') return;

        const zombie = {
            x, y,
            health: 30,
            maxHealth: 30,
            damage: 5,
            speed: 0.8,
            isSummoned: true,
            summoner: summoner.id
        };

        zombies.push(zombie);

        if (typeof spawnParticles === 'function') {
            spawnParticles(x, y, '#aa44aa', 10);
        }
    }

    function spawnPlaguedZombie(x, y) {
        if (typeof zombies === 'undefined') return;

        const zombie = {
            x, y,
            health: 40,
            maxHealth: 40,
            damage: 8,
            speed: 0.6,
            isPlagued: true,
            poisonOnHit: true
        };

        zombies.push(zombie);
    }

    function spawnUndeadMinion(x, y) {
        spawnSummonedZombie(x, y, { id: 'necromancer' });
    }

    function spawnIceShard(x, y, angle, target) {
        if (typeof projectiles === 'undefined') return;

        const speed = 8;
        projectiles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            damage: 20,
            life: 2,
            source: 'miniboss',
            effect: 'freeze'
        });
    }

    function spawnDeathBolt(x, y, target) {
        if (typeof projectiles === 'undefined') return;

        const dx = target.x - x;
        const dy = target.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = 10;

        projectiles.push({
            x, y,
            vx: (dx / dist) * speed,
            vy: (dy / dist) * speed,
            damage: 30,
            life: 3,
            source: 'miniboss',
            color: '#aa00aa'
        });
    }

    // Particle helper functions
    function spawnHealParticles(x, y) {
        if (typeof spawnParticles === 'function') {
            spawnParticles(x, y, '#44ff44', 5);
        }
    }

    function spawnTeleportParticles(x, y) {
        if (typeof spawnParticles === 'function') {
            spawnParticles(x, y, '#ff44ff', 10);
        }
    }

    function spawnShadowParticles(x, y) {
        if (typeof spawnParticles === 'function') {
            spawnParticles(x, y, '#440044', 8);
        }
    }

    function spawnEnrageParticles(x, y) {
        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 15; i++) {
                spawnParticles(x, y, '#ff4400', 5);
            }
        }
    }

    function spawnLightningParticles(fromX, fromY, toX, toY) {
        if (typeof spawnParticles === 'function') {
            const dx = toX - fromX;
            const dy = toY - fromY;
            const steps = 5;
            for (let i = 0; i <= steps; i++) {
                spawnParticles(
                    fromX + dx * (i / steps),
                    fromY + dy * (i / steps),
                    '#88ccff',
                    2
                );
            }
        }
    }

    function spawnIceBarrierParticles(x, y) {
        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                spawnParticles(x + Math.cos(angle) * 1.5, y + Math.sin(angle) * 1.5, '#88ccff', 4);
            }
        }
    }

    function spawnFrostNovaParticles(x, y, radius) {
        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 30; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * radius;
                spawnParticles(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, '#88ffff', 4);
            }
        }
    }

    function spawnNecromancyParticles(x, y) {
        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 20; i++) {
                spawnParticles(x, y, '#aa00aa', 5);
            }
        }
    }

    function spawnSoulDrainParticles(fromX, fromY, toX, toY) {
        spawnLightningParticles(fromX, fromY, toX, toY);
    }

    function spawnFlameBurstParticles(x, y, radius) {
        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 25; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * radius;
                spawnParticles(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, '#ff4400', 4);
            }
        }
    }

    function spawnMeteorWarning(x, y, radius) {
        // Visual warning circle (handled by render)
    }

    function spawnMeteorImpactParticles(x, y) {
        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 40; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 3;
                spawnParticles(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, '#ff6600', 5);
            }
        }
    }

    function formatDropName(dropId) {
        return dropId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    // ============= RENDERING =============
    function draw(ctx, camX, camY) {
        const s = TILE_SIZE * SCALE;

        // Draw elite auras
        for (const elite of activeElites) {
            drawEliteAura(ctx, elite, camX, camY, s);
        }

        // Draw mini-boss health bars and effects
        for (const boss of activeMiniBosses) {
            drawMiniBoss(ctx, boss, camX, camY, s);
        }
    }

    function drawEliteAura(ctx, elite, camX, camY, s) {
        const sx = elite.x * s - camX;
        const sy = elite.y * s - camY;

        // Skip if off-screen
        if (sx < -s * 2 || sx > ctx.canvas.width + s || sy < -s * 2 || sy > ctx.canvas.height + s) {
            return;
        }

        ctx.save();

        // Draw aura based on visual effect
        const time = Date.now() / 1000;
        const pulse = 0.8 + Math.sin(time * 4) * 0.2;

        ctx.globalAlpha = 0.4 * pulse;
        ctx.fillStyle = elite.eliteColor;
        ctx.beginPath();
        ctx.arc(sx, sy, s * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Draw modifier icon
        ctx.globalAlpha = 1;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(elite.eliteModifier.icon, sx, sy - s * 0.6);

        ctx.restore();
    }

    function drawMiniBoss(ctx, boss, camX, camY, s) {
        const sx = boss.x * s - camX;
        const sy = boss.y * s - camY;

        // Skip if off-screen
        if (sx < -s * 3 || sx > ctx.canvas.width + s * 3 || sy < -s * 3 || sy > ctx.canvas.height + s * 3) {
            return;
        }

        ctx.save();

        // Draw boss body (larger than normal zombies)
        const bossSize = s * boss.size;

        // Invisibility effect
        if (boss.invisible) {
            ctx.globalAlpha = 0.2;
        }

        // Draw boss icon
        ctx.font = `${bossSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(boss.type.icon, sx, sy);

        ctx.globalAlpha = 1;

        // Draw name and title
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#ff4444';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText(boss.name, sx, sy - bossSize / 2 - 20);
        ctx.fillText(boss.name, sx, sy - bossSize / 2 - 20);

        ctx.font = '10px Arial';
        ctx.fillStyle = '#ffaa44';
        ctx.strokeText(boss.title, sx, sy - bossSize / 2 - 8);
        ctx.fillText(boss.title, sx, sy - bossSize / 2 - 8);

        // Draw health bar
        const barWidth = bossSize * 1.5;
        const barHeight = 8;
        const barX = sx - barWidth / 2;
        const barY = sy + bossSize / 2 + 10;

        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health
        const healthPercent = boss.health / boss.maxHealth;
        const healthColor = healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffff44' : '#ff4444';
        ctx.fillStyle = healthColor;
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Draw phase indicator
        const phase = boss.currentPhase;
        if (phase > 0) {
            ctx.fillStyle = '#ff8800';
            ctx.font = '10px Arial';
            ctx.fillText(`Phase ${phase + 1}`, sx, barY + barHeight + 12);
        }

        // Draw special state indicators
        if (boss.enraged) {
            ctx.fillStyle = '#ff4400';
            ctx.font = '10px Arial';
            ctx.fillText('🔥 ENRAGED', sx, sy - bossSize / 2 - 35);
        }

        if (boss.charging) {
            ctx.fillStyle = '#ffaa00';
            ctx.font = '10px Arial';
            ctx.fillText('⚡ CHARGING', sx, sy - bossSize / 2 - 35);
        }

        if (boss.isChanneling) {
            ctx.fillStyle = '#8888ff';
            ctx.font = '10px Arial';
            ctx.fillText('🔮 CHANNELING', sx, sy - bossSize / 2 - 35);
        }

        // Draw ice barrier
        if (boss.iceBarrier) {
            ctx.strokeStyle = '#88ccff';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(sx, sy, bossSize * 0.7, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Draw bone shield
        if (boss.boneShield) {
            ctx.fillStyle = '#cccccc';
            ctx.font = '10px Arial';
            ctx.fillText(`🦴 x${boss.boneShield.charges}`, sx + bossSize / 2, sy);
        }

        // Draw heat wave
        if (boss.heatWaveActive) {
            ctx.strokeStyle = '#ff4400';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(sx, sy, boss.heatWaveRadius * s, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        ctx.restore();
    }

    // ============= SERIALIZATION =============
    function getState() {
        return {
            defeatedMiniBosses: Array.from(defeatedMiniBosses),
            miniBossSpawnTimer,
            activeMiniBosses: activeMiniBosses.map(b => ({
                bossId: b.bossId,
                x: b.x,
                y: b.y,
                health: b.health,
                currentPhase: b.currentPhase
            }))
        };
    }

    function setState(data) {
        if (!data) return;

        defeatedMiniBosses = new Set(data.defeatedMiniBosses || []);
        miniBossSpawnTimer = data.miniBossSpawnTimer || CONFIG.MINIBOSS_SPAWN_INTERVAL;

        // Restore active mini-bosses
        activeMiniBosses = [];
        if (data.activeMiniBosses) {
            for (const bossData of data.activeMiniBosses) {
                const boss = spawnMiniBoss(bossData.bossId, bossData.x, bossData.y);
                if (boss) {
                    boss.health = bossData.health;
                    boss.currentPhase = bossData.currentPhase;
                }
            }
        }
    }

    // ============= PUBLIC API =============
    return {
        // Core
        update,
        draw,

        // Elite management
        makeElite,
        shouldBeElite,
        handleDamageToElite,

        // Mini-boss management
        spawnMiniBoss,
        handleDamageToMiniBoss,

        // Queries
        getActiveElites: () => activeElites,
        getActiveMiniBosses: () => activeMiniBosses,
        isMiniBossActive: () => activeMiniBosses.length > 0,
        getDefeatedMiniBosses: () => defeatedMiniBosses,

        // Serialization
        getState,
        setState,

        // Constants
        ELITE_MODIFIERS,
        MINI_BOSSES,
        CONFIG
    };
})();

// Export globally
window.EliteSystem = EliteSystem;
