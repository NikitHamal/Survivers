// ============================================
// ADVANCED TRAP SYSTEM
// ============================================
// Production-grade trap system with multiple trap types,
// chain reactions, upgrade paths, and strategic mechanics

const TrapSystem = (function() {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        MAX_TRAPS: 100,
        UPDATE_INTERVAL: 0.1,        // seconds
        TRAP_DETECTION_RADIUS: 0.6,  // tiles
        CHAIN_REACTION_DELAY: 0.15,  // seconds
        TRAP_RENDER_PRIORITY: 50
    };

    // ============= TRAP DEFINITIONS =============
    const TRAP_TYPES = {
        // === BASIC TRAPS ===
        spike_trap: {
            id: 'spike_trap',
            name: 'Spike Trap',
            icon: '🌵',
            description: 'Sharp spikes that damage enemies walking over them',
            category: 'damage',
            tier: 1,
            cost: { wood: 8, iron: 2 },
            stats: {
                damage: 25,
                armorPenetration: 0.1,
                triggerRadius: 0.5,
                cooldown: 2.0,
                durability: 5,      // Number of uses
                maxDurability: 5
            },
            effects: ['bleed'],
            size: { width: 1, height: 1 },
            canChainReact: false,
            friendlyFire: false
        },

        bear_trap: {
            id: 'bear_trap',
            name: 'Bear Trap',
            icon: '🪤',
            description: 'Heavy trap that immobilizes and damages enemies',
            category: 'control',
            tier: 1,
            cost: { iron: 8, stone: 4 },
            stats: {
                damage: 40,
                armorPenetration: 0.2,
                triggerRadius: 0.4,
                cooldown: 8.0,
                durability: 3,
                maxDurability: 3,
                rootDuration: 3.0,   // Immobilize duration
                slowAmount: 0.7      // 70% slow after root
            },
            effects: ['root', 'slow'],
            size: { width: 1, height: 1 },
            canChainReact: false,
            friendlyFire: true       // Can trap players/survivors
        },

        tripwire: {
            id: 'tripwire',
            name: 'Tripwire Alarm',
            icon: '🔔',
            description: 'Triggers connected traps when enemies pass through',
            category: 'trigger',
            tier: 1,
            cost: { wood: 4, iron: 4 },
            stats: {
                damage: 0,
                triggerRadius: 1.5,  // Wide detection
                cooldown: 0.5,
                durability: 10,
                maxDurability: 10,
                connectionRange: 6   // Can connect to traps this far away
            },
            effects: ['alert', 'chain_trigger'],
            size: { width: 2, height: 1 },
            canChainReact: true,
            friendlyFire: false
        },

        // === EXPLOSIVE TRAPS ===
        explosive_barrel: {
            id: 'explosive_barrel',
            name: 'Explosive Barrel',
            icon: '🛢️',
            description: 'Explodes when damaged or triggered, dealing massive AoE damage',
            category: 'explosive',
            tier: 2,
            cost: { wood: 15, iron: 10, stone: 5 },
            stats: {
                damage: 80,
                armorPenetration: 0.4,
                triggerRadius: 0.8,
                explosionRadius: 3.0,
                cooldown: 0,         // One-time use
                durability: 1,
                maxDurability: 1,
                chainReactionRadius: 4.0
            },
            effects: ['explosion', 'knockback', 'fire'],
            size: { width: 1, height: 1 },
            canChainReact: true,
            friendlyFire: true
        },

        landmine: {
            id: 'landmine',
            name: 'Landmine',
            icon: '💣',
            description: 'Hidden explosive that detonates when stepped on',
            category: 'explosive',
            tier: 2,
            cost: { iron: 15, stone: 8 },
            stats: {
                damage: 60,
                armorPenetration: 0.5,
                triggerRadius: 0.4,
                explosionRadius: 2.0,
                cooldown: 0,
                durability: 1,
                maxDurability: 1,
                armingTime: 2.0,     // Time before active
                isHidden: true
            },
            effects: ['explosion'],
            size: { width: 1, height: 1 },
            canChainReact: true,
            friendlyFire: true
        },

        // === ELEMENTAL TRAPS ===
        flame_geyser: {
            id: 'flame_geyser',
            name: 'Flame Geyser',
            icon: '🔥',
            description: 'Erupts with fire, burning all enemies in range',
            category: 'elemental',
            tier: 2,
            cost: { stone: 12, iron: 8, wood: 6 },
            stats: {
                damage: 15,
                armorPenetration: 0,
                triggerRadius: 0.6,
                effectRadius: 2.0,
                cooldown: 4.0,
                durability: 8,
                maxDurability: 8,
                burnDuration: 4.0,
                burnDamage: 5         // per second
            },
            effects: ['burn', 'area_denial'],
            size: { width: 1, height: 1 },
            canChainReact: true,
            friendlyFire: true
        },

        frost_trap: {
            id: 'frost_trap',
            name: 'Frost Trap',
            icon: '❄️',
            description: 'Releases freezing cold, slowing and damaging enemies',
            category: 'elemental',
            tier: 2,
            cost: { stone: 10, iron: 10, wood: 4 },
            stats: {
                damage: 20,
                armorPenetration: 0,
                triggerRadius: 0.6,
                effectRadius: 2.5,
                cooldown: 5.0,
                durability: 6,
                maxDurability: 6,
                slowAmount: 0.6,
                slowDuration: 4.0,
                freezeChance: 0.15    // 15% to freeze solid
            },
            effects: ['slow', 'freeze'],
            size: { width: 1, height: 1 },
            canChainReact: false,
            friendlyFire: false
        },

        poison_cloud: {
            id: 'poison_cloud',
            name: 'Poison Cloud Trap',
            icon: '☠️',
            description: 'Releases toxic gas that poisons enemies over time',
            category: 'elemental',
            tier: 2,
            cost: { wood: 8, stone: 6, iron: 6 },
            stats: {
                damage: 5,
                armorPenetration: 1.0, // Ignores armor
                triggerRadius: 0.5,
                effectRadius: 3.0,
                cooldown: 6.0,
                durability: 5,
                maxDurability: 5,
                cloudDuration: 5.0,
                poisonDamage: 8,       // per second
                poisonDuration: 6.0
            },
            effects: ['poison', 'area_denial'],
            size: { width: 1, height: 1 },
            canChainReact: false,
            friendlyFire: true
        },

        // === ADVANCED TRAPS ===
        tesla_coil: {
            id: 'tesla_coil',
            name: 'Tesla Coil',
            icon: '⚡',
            description: 'Emits electrical arcs that chain between nearby enemies',
            category: 'energy',
            tier: 3,
            cost: { iron: 25, stone: 15, wood: 10 },
            stats: {
                damage: 35,
                armorPenetration: 0.3,
                triggerRadius: 4.0,   // Auto-targets in range
                chainRange: 3.0,       // Chain lightning range
                maxChains: 4,          // Max targets per activation
                cooldown: 1.5,
                durability: 15,
                maxDurability: 15,
                stunChance: 0.25,
                stunDuration: 0.5
            },
            effects: ['chain_lightning', 'stun'],
            size: { width: 1, height: 1 },
            canChainReact: false,
            friendlyFire: false,
            isAutomatic: true         // Triggers automatically
        },

        turret_trap: {
            id: 'turret_trap',
            name: 'Auto-Turret',
            icon: '🎯',
            description: 'Automated turret that fires at nearby enemies',
            category: 'projectile',
            tier: 3,
            cost: { iron: 30, stone: 20, wood: 15 },
            stats: {
                damage: 20,
                armorPenetration: 0.2,
                range: 8.0,
                fireRate: 2.0,         // shots per second
                projectileSpeed: 15,
                cooldown: 0.5,
                durability: 20,
                maxDurability: 20,
                rotationSpeed: 180     // degrees per second
            },
            effects: [],
            size: { width: 1, height: 1 },
            canChainReact: false,
            friendlyFire: false,
            isAutomatic: true
        },

        gravity_trap: {
            id: 'gravity_trap',
            name: 'Gravity Well',
            icon: '🌀',
            description: 'Creates a gravity field that pulls enemies in',
            category: 'control',
            tier: 3,
            cost: { iron: 20, stone: 25 },
            stats: {
                damage: 10,
                armorPenetration: 0,
                effectRadius: 4.0,
                pullStrength: 3.0,     // tiles per second
                cooldown: 8.0,
                durability: 6,
                maxDurability: 6,
                activeDuration: 3.0
            },
            effects: ['pull', 'slow'],
            size: { width: 1, height: 1 },
            canChainReact: false,
            friendlyFire: false
        },

        // === SUPPORT TRAPS ===
        healing_totem: {
            id: 'healing_totem',
            name: 'Healing Totem',
            icon: '💚',
            description: 'Periodically heals nearby allies',
            category: 'support',
            tier: 2,
            cost: { wood: 20, stone: 10 },
            stats: {
                healAmount: 10,
                healRadius: 4.0,
                cooldown: 3.0,
                durability: 10,
                maxDurability: 10
            },
            effects: ['heal_allies'],
            size: { width: 1, height: 1 },
            canChainReact: false,
            friendlyFire: false,
            isAutomatic: true,
            targetsFriendlies: true
        },

        buff_beacon: {
            id: 'buff_beacon',
            name: 'War Banner',
            icon: '🚩',
            description: 'Grants attack and speed bonuses to nearby allies',
            category: 'support',
            tier: 3,
            cost: { wood: 25, iron: 15, stone: 10 },
            stats: {
                buffRadius: 5.0,
                damageBonus: 0.25,     // +25% damage
                speedBonus: 0.15,      // +15% speed
                cooldown: 0,           // Always active
                durability: 15,
                maxDurability: 15
            },
            effects: ['damage_buff', 'speed_buff'],
            size: { width: 1, height: 1 },
            canChainReact: false,
            friendlyFire: false,
            isAutomatic: true,
            targetsFriendlies: true
        }
    };

    // ============= UPGRADE DEFINITIONS =============
    const TRAP_UPGRADES = {
        reinforced: {
            id: 'reinforced',
            name: 'Reinforced',
            description: '+50% durability',
            cost: { iron: 5 },
            effect: { stat: 'durability', multiplier: 1.5 }
        },
        enhanced_damage: {
            id: 'enhanced_damage',
            name: 'Enhanced',
            description: '+30% damage',
            cost: { iron: 8 },
            effect: { stat: 'damage', multiplier: 1.3 }
        },
        extended_range: {
            id: 'extended_range',
            name: 'Extended Range',
            description: '+40% trigger radius',
            cost: { iron: 6, stone: 4 },
            effect: { stat: 'triggerRadius', multiplier: 1.4 }
        },
        quick_reset: {
            id: 'quick_reset',
            name: 'Quick Reset',
            description: '-30% cooldown',
            cost: { iron: 10 },
            effect: { stat: 'cooldown', multiplier: 0.7 }
        },
        armor_piercing: {
            id: 'armor_piercing',
            name: 'Armor Piercing',
            description: '+20% armor penetration',
            cost: { iron: 12 },
            effect: { stat: 'armorPenetration', add: 0.2 }
        }
    };

    // ============= STATE =============
    let traps = [];
    let trapIdCounter = 0;
    let activeEffects = [];       // Active area effects (clouds, flames, etc.)
    let chainReactionQueue = [];  // Pending chain reactions
    let trapConnections = new Map(); // Tripwire connections

    // ============= CORE FUNCTIONS =============
    function createTrap(trapTypeId, x, y, options = {}) {
        const trapType = TRAP_TYPES[trapTypeId];
        if (!trapType) {
            console.warn(`Unknown trap type: ${trapTypeId}`);
            return null;
        }

        // Check if we can afford it
        if (!options.free && !canAffordTrap(trapType)) {
            if (typeof showNotification === 'function') {
                showNotification('<i class="material-icons">warning</i> Not enough resources!', []);
            }
            return null;
        }

        // Check placement validity
        if (!canPlaceTrap(x, y, trapType)) {
            if (typeof showNotification === 'function') {
                showNotification('<i class="material-icons">block</i> Cannot place trap here!', []);
            }
            return null;
        }

        // Check trap limit
        if (traps.length >= CONFIG.MAX_TRAPS) {
            if (typeof showNotification === 'function') {
                showNotification('<i class="material-icons">warning</i> Maximum traps reached!', []);
            }
            return null;
        }

        // Deduct resources
        if (!options.free) {
            for (const [resource, amount] of Object.entries(trapType.cost)) {
                resources[resource] -= amount;
            }
        }

        // Create trap instance
        const trap = {
            id: trapIdCounter++,
            typeId: trapTypeId,
            type: trapType,
            x: Math.floor(x) + 0.5,
            y: Math.floor(y) + 0.5,
            tileX: Math.floor(x),
            tileY: Math.floor(y),

            // Stats (can be modified by upgrades)
            stats: { ...trapType.stats },

            // State
            active: !trapType.stats.armingTime,
            armed: !trapType.stats.armingTime,
            armingTimer: trapType.stats.armingTime || 0,
            cooldownTimer: 0,
            durability: trapType.stats.durability,
            destroyed: false,

            // Upgrade state
            upgrades: [],

            // Connection state (for tripwires)
            connections: [],

            // Targeting state (for auto traps)
            currentTarget: null,
            rotation: 0,

            // Effect state
            activeEffect: null,
            effectTimer: 0,

            // Visual state
            triggerAnimation: 0,
            damageFlash: 0
        };

        traps.push(trap);

        // Play placement sound
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('build_place', { position: { x, y } });
        }

        // Spawn placement particles
        if (typeof spawnParticles === 'function') {
            spawnParticles(x + 0.5, y + 0.5, '#ffd700', 8);
        }

        // Update UI
        if (typeof updateUI === 'function') {
            updateUI();
        }

        return trap;
    }

    function canAffordTrap(trapType) {
        for (const [resource, amount] of Object.entries(trapType.cost)) {
            if ((resources[resource] || 0) < amount) {
                return false;
            }
        }
        return true;
    }

    function canPlaceTrap(x, y, trapType) {
        const tileX = Math.floor(x);
        const tileY = Math.floor(y);

        // Check tile walkability
        const tile = getTile(tileX, tileY);
        if (tile !== TILES.GRASS && tile !== TILES.FLOOR) {
            return false;
        }

        // Check distance from player
        const dist = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);
        if (dist > 10) {
            return false;
        }

        // Check for existing traps
        for (const trap of traps) {
            if (trap.tileX === tileX && trap.tileY === tileY) {
                return false;
            }
        }

        // Check for buildings
        const building = buildingMap?.get(`${tileX},${tileY}`);
        if (building) {
            return false;
        }

        return true;
    }

    function removeTrap(trapId) {
        const index = traps.findIndex(t => t.id === trapId);
        if (index === -1) return false;

        const trap = traps[index];

        // Remove connections
        trapConnections.delete(trap.id);
        for (const [otherId, connections] of trapConnections) {
            const connIndex = connections.indexOf(trap.id);
            if (connIndex !== -1) {
                connections.splice(connIndex, 1);
            }
        }

        traps.splice(index, 1);
        return true;
    }

    function destroyTrap(trap, triggeredBy = null) {
        if (trap.destroyed) return;

        trap.destroyed = true;
        trap.active = false;

        // Check for chain reactions
        if (trap.type.canChainReact && triggeredBy !== 'chain') {
            queueChainReaction(trap);
        }

        // Spawn destruction particles
        if (typeof spawnParticles === 'function') {
            spawnParticles(trap.x, trap.y, '#ff6644', 12);
        }

        // Play destruction sound
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('build_destroy', { position: { x: trap.x, y: trap.y } });
        }

        // Remove after delay for visual effect
        setTimeout(() => {
            removeTrap(trap.id);
        }, 500);
    }

    // ============= UPDATE LOOP =============
    function update(dt) {
        // Process chain reactions
        processChainReactions(dt);

        // Update active effects
        updateActiveEffects(dt);

        // Update each trap
        for (const trap of traps) {
            if (trap.destroyed) continue;

            // Update arming
            if (!trap.armed) {
                trap.armingTimer -= dt;
                if (trap.armingTimer <= 0) {
                    trap.armed = true;
                    trap.active = true;
                }
                continue;
            }

            // Update cooldown
            if (trap.cooldownTimer > 0) {
                trap.cooldownTimer -= dt;
                if (trap.cooldownTimer <= 0) {
                    trap.cooldownTimer = 0;
                    trap.active = true;
                }
            }

            // Update visual timers
            if (trap.triggerAnimation > 0) {
                trap.triggerAnimation -= dt * 3;
            }
            if (trap.damageFlash > 0) {
                trap.damageFlash -= dt * 5;
            }

            // Update automatic traps
            if (trap.type.isAutomatic && trap.active) {
                updateAutomaticTrap(trap, dt);
            }

            // Update effect timers
            if (trap.effectTimer > 0) {
                trap.effectTimer -= dt;
                if (trap.effectTimer <= 0) {
                    trap.activeEffect = null;
                }
            }
        }

        // Check trap triggers (non-automatic)
        checkTrapTriggers();
    }

    function updateAutomaticTrap(trap, dt) {
        switch (trap.typeId) {
            case 'tesla_coil':
                updateTeslaCoil(trap, dt);
                break;
            case 'turret_trap':
                updateTurret(trap, dt);
                break;
            case 'healing_totem':
                updateHealingTotem(trap, dt);
                break;
            case 'buff_beacon':
                updateBuffBeacon(trap, dt);
                break;
        }
    }

    function updateTeslaCoil(trap, dt) {
        if (trap.cooldownTimer > 0) return;

        // Find targets in range
        const targets = findEnemiesInRange(trap.x, trap.y, trap.stats.triggerRadius);
        if (targets.length === 0) return;

        // Trigger chain lightning
        triggerChainLightning(trap, targets[0]);

        trap.cooldownTimer = trap.stats.cooldown;
        trap.triggerAnimation = 1;
        consumeDurability(trap);
    }

    function triggerChainLightning(trap, initialTarget) {
        const stats = trap.stats;
        const hitTargets = new Set();
        let currentTarget = initialTarget;
        let chainCount = 0;

        while (currentTarget && chainCount < stats.maxChains) {
            hitTargets.add(currentTarget);

            // Deal damage
            const damage = calculateTrapDamage(trap, currentTarget);
            applyTrapDamage(currentTarget, damage, trap);

            // Check stun
            if (Math.random() < stats.stunChance) {
                applyStatusEffect(currentTarget, 'stun', stats.stunDuration);
            }

            // Visual effect
            if (chainCount > 0) {
                createLightningEffect(trap.x, trap.y, currentTarget.x, currentTarget.y);
            }

            // Find next target
            const nextTargets = findEnemiesInRange(
                currentTarget.x, currentTarget.y, stats.chainRange
            ).filter(t => !hitTargets.has(t));

            currentTarget = nextTargets.length > 0 ? nextTargets[0] : null;
            chainCount++;
        }

        // Play sound
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('tower_shoot', { position: { x: trap.x, y: trap.y } });
        }
    }

    function updateTurret(trap, dt) {
        if (trap.cooldownTimer > 0) return;

        // Find nearest target
        const targets = findEnemiesInRange(trap.x, trap.y, trap.stats.range);
        if (targets.length === 0) {
            trap.currentTarget = null;
            return;
        }

        // Sort by distance
        targets.sort((a, b) => {
            const distA = (a.x - trap.x) ** 2 + (a.y - trap.y) ** 2;
            const distB = (b.x - trap.x) ** 2 + (b.y - trap.y) ** 2;
            return distA - distB;
        });

        trap.currentTarget = targets[0];

        // Rotate towards target
        const targetAngle = Math.atan2(
            trap.currentTarget.y - trap.y,
            trap.currentTarget.x - trap.x
        ) * 180 / Math.PI;

        const angleDiff = ((targetAngle - trap.rotation + 540) % 360) - 180;
        const maxRotation = trap.stats.rotationSpeed * dt;

        if (Math.abs(angleDiff) <= maxRotation) {
            trap.rotation = targetAngle;
        } else {
            trap.rotation += Math.sign(angleDiff) * maxRotation;
        }

        // Fire if aimed
        if (Math.abs(angleDiff) < 10) {
            fireTurretProjectile(trap);
            trap.cooldownTimer = 1 / trap.stats.fireRate;
            trap.triggerAnimation = 1;
            consumeDurability(trap);
        }
    }

    function fireTurretProjectile(trap) {
        if (typeof projectiles === 'undefined') return;

        const angle = trap.rotation * Math.PI / 180;
        const speed = trap.stats.projectileSpeed;

        projectiles.push({
            x: trap.x,
            y: trap.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            damage: trap.stats.damage,
            armorPen: trap.stats.armorPenetration,
            life: 2,
            source: 'trap',
            trapId: trap.id
        });

        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('tower_shoot', { position: { x: trap.x, y: trap.y } });
        }
    }

    function updateHealingTotem(trap, dt) {
        if (trap.cooldownTimer > 0) return;

        // Find allies in range
        const allies = findAlliesInRange(trap.x, trap.y, trap.stats.healRadius);
        if (allies.length === 0) return;

        // Heal allies
        for (const ally of allies) {
            if (ally.health < ally.maxHealth) {
                ally.health = Math.min(ally.maxHealth, ally.health + trap.stats.healAmount);

                if (typeof spawnParticles === 'function') {
                    spawnParticles(ally.x, ally.y, '#44ff44', 4);
                }
                if (typeof addDamageNumber === 'function') {
                    addDamageNumber(ally.x, ally.y - 0.5, `+${trap.stats.healAmount}`, '#44ff44');
                }
            }
        }

        trap.cooldownTimer = trap.stats.cooldown;
        trap.triggerAnimation = 1;
        consumeDurability(trap);

        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('player_heal', { position: { x: trap.x, y: trap.y } });
        }
    }

    function updateBuffBeacon(trap, dt) {
        // Buff beacon is always active, no cooldown needed
        // Buffs are checked and applied when calculating combat stats
    }

    // ============= TRIGGER HANDLING =============
    function checkTrapTriggers() {
        for (const trap of traps) {
            if (!trap.active || trap.destroyed || trap.type.isAutomatic) continue;

            // Check for enemies in trigger range
            const triggerRadius = trap.stats.triggerRadius;

            for (const zombie of zombies) {
                const dist = Math.sqrt((zombie.x - trap.x) ** 2 + (zombie.y - trap.y) ** 2);

                if (dist <= triggerRadius) {
                    triggerTrap(trap, zombie);
                    break;
                }
            }

            // Check for players/survivors if friendly fire
            if (trap.type.friendlyFire) {
                // Check player
                const playerDist = Math.sqrt((player.x - trap.x) ** 2 + (player.y - trap.y) ** 2);
                if (playerDist <= triggerRadius) {
                    triggerTrap(trap, player);
                }

                // Check survivors
                for (const survivor of survivors) {
                    if (survivor.isPlayer) continue;
                    const survDist = Math.sqrt((survivor.x - trap.x) ** 2 + (survivor.y - trap.y) ** 2);
                    if (survDist <= triggerRadius) {
                        triggerTrap(trap, survivor);
                        break;
                    }
                }
            }
        }
    }

    function triggerTrap(trap, target) {
        if (!trap.active || trap.cooldownTimer > 0) return;

        trap.triggerAnimation = 1;
        trap.active = false;

        // Apply trap effects based on type
        switch (trap.typeId) {
            case 'spike_trap':
                triggerSpikeTrap(trap, target);
                break;
            case 'bear_trap':
                triggerBearTrap(trap, target);
                break;
            case 'tripwire':
                triggerTripwire(trap, target);
                break;
            case 'explosive_barrel':
            case 'landmine':
                triggerExplosive(trap, target);
                break;
            case 'flame_geyser':
                triggerFlameGeyser(trap, target);
                break;
            case 'frost_trap':
                triggerFrostTrap(trap, target);
                break;
            case 'poison_cloud':
                triggerPoisonCloud(trap, target);
                break;
            case 'gravity_trap':
                triggerGravityTrap(trap, target);
                break;
            default:
                triggerGenericTrap(trap, target);
        }

        // Consume durability
        consumeDurability(trap);

        // Set cooldown
        if (trap.stats.cooldown > 0 && trap.durability > 0) {
            trap.cooldownTimer = trap.stats.cooldown;
        }
    }

    function triggerSpikeTrap(trap, target) {
        const damage = calculateTrapDamage(trap, target);
        applyTrapDamage(target, damage, trap);

        // Apply bleed
        applyStatusEffect(target, 'bleed', 3, { damage: damage * 0.1 });

        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('player_hit', { position: { x: trap.x, y: trap.y } });
        }

        if (typeof spawnParticles === 'function') {
            spawnParticles(trap.x, trap.y, '#ff4444', 8);
        }
    }

    function triggerBearTrap(trap, target) {
        const damage = calculateTrapDamage(trap, target);
        applyTrapDamage(target, damage, trap);

        // Apply root (immobilize)
        applyStatusEffect(target, 'root', trap.stats.rootDuration);

        // Apply slow after root expires
        setTimeout(() => {
            if (target.health > 0) {
                applyStatusEffect(target, 'slow', 3, { amount: trap.stats.slowAmount });
            }
        }, trap.stats.rootDuration * 1000);

        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('zombie_hit', { position: { x: trap.x, y: trap.y } });
        }

        if (typeof spawnParticles === 'function') {
            spawnParticles(trap.x, trap.y, '#888888', 10);
        }
    }

    function triggerTripwire(trap, target) {
        // Alert player
        if (typeof showNotification === 'function') {
            showNotification('<i class="material-icons">warning</i> Tripwire triggered!', []);
        }

        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('notification', { position: { x: trap.x, y: trap.y } });
        }

        // Trigger connected traps
        const connections = trapConnections.get(trap.id) || [];
        for (const connectedId of connections) {
            const connectedTrap = traps.find(t => t.id === connectedId);
            if (connectedTrap && connectedTrap.active && !connectedTrap.destroyed) {
                setTimeout(() => {
                    triggerTrap(connectedTrap, target);
                }, CONFIG.CHAIN_REACTION_DELAY * 1000);
            }
        }
    }

    function triggerExplosive(trap, target) {
        const stats = trap.stats;

        // Create explosion
        createExplosion(
            trap.x, trap.y,
            stats.explosionRadius,
            stats.damage,
            stats.armorPenetration,
            trap.type.friendlyFire
        );

        // Fire visual
        if (trap.type.effects.includes('fire')) {
            createFireEffect(trap.x, trap.y, stats.explosionRadius);
        }

        // Knockback
        if (trap.type.effects.includes('knockback')) {
            applyKnockback(trap.x, trap.y, stats.explosionRadius, 3);
        }

        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('explosion', { position: { x: trap.x, y: trap.y } });
        }

        // Destroy the trap
        destroyTrap(trap);
    }

    function triggerFlameGeyser(trap, target) {
        const stats = trap.stats;

        // Create fire area effect
        activeEffects.push({
            type: 'fire',
            x: trap.x,
            y: trap.y,
            radius: stats.effectRadius,
            damage: stats.burnDamage,
            duration: stats.burnDuration,
            elapsed: 0,
            tickInterval: 0.5,
            lastTick: 0,
            friendlyFire: trap.type.friendlyFire
        });

        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('explosion', { position: { x: trap.x, y: trap.y }, volumeMultiplier: 0.5 });
        }

        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * stats.effectRadius;
                spawnParticles(
                    trap.x + Math.cos(angle) * dist,
                    trap.y + Math.sin(angle) * dist,
                    '#ff6622',
                    3
                );
            }
        }
    }

    function triggerFrostTrap(trap, target) {
        const stats = trap.stats;

        // Find all enemies in effect radius
        const targets = findEnemiesInRange(trap.x, trap.y, stats.effectRadius);

        for (const t of targets) {
            // Deal damage
            const damage = calculateTrapDamage(trap, t);
            applyTrapDamage(t, damage, trap);

            // Apply slow
            applyStatusEffect(t, 'slow', stats.slowDuration, { amount: stats.slowAmount });

            // Check freeze
            if (Math.random() < stats.freezeChance) {
                applyStatusEffect(t, 'freeze', 2);
            }
        }

        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('player_hit', { position: { x: trap.x, y: trap.y } });
        }

        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 15; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * stats.effectRadius;
                spawnParticles(
                    trap.x + Math.cos(angle) * dist,
                    trap.y + Math.sin(angle) * dist,
                    '#88ccff',
                    4
                );
            }
        }
    }

    function triggerPoisonCloud(trap, target) {
        const stats = trap.stats;

        // Create poison cloud area effect
        activeEffects.push({
            type: 'poison',
            x: trap.x,
            y: trap.y,
            radius: stats.effectRadius,
            damage: stats.poisonDamage,
            duration: stats.cloudDuration,
            elapsed: 0,
            tickInterval: 1.0,
            lastTick: 0,
            friendlyFire: trap.type.friendlyFire,
            statusDuration: stats.poisonDuration
        });

        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('zombie_death', { position: { x: trap.x, y: trap.y }, volumeMultiplier: 0.3 });
        }
    }

    function triggerGravityTrap(trap, target) {
        const stats = trap.stats;

        // Create gravity well effect
        activeEffects.push({
            type: 'gravity',
            x: trap.x,
            y: trap.y,
            radius: stats.effectRadius,
            pullStrength: stats.pullStrength,
            duration: stats.activeDuration,
            elapsed: 0,
            friendlyFire: false
        });

        trap.activeEffect = 'gravity';
        trap.effectTimer = stats.activeDuration;

        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('boss_spawn', { position: { x: trap.x, y: trap.y }, volumeMultiplier: 0.4 });
        }
    }

    function triggerGenericTrap(trap, target) {
        const damage = calculateTrapDamage(trap, target);
        applyTrapDamage(target, damage, trap);
    }

    // ============= EFFECT PROCESSING =============
    function updateActiveEffects(dt) {
        for (let i = activeEffects.length - 1; i >= 0; i--) {
            const effect = activeEffects[i];
            effect.elapsed += dt;

            // Check expiration
            if (effect.elapsed >= effect.duration) {
                activeEffects.splice(i, 1);
                continue;
            }

            // Process effect
            switch (effect.type) {
                case 'fire':
                case 'poison':
                    processTickingEffect(effect, dt);
                    break;
                case 'gravity':
                    processGravityEffect(effect, dt);
                    break;
            }
        }
    }

    function processTickingEffect(effect, dt) {
        effect.lastTick += dt;

        if (effect.lastTick >= effect.tickInterval) {
            effect.lastTick = 0;

            // Find targets in area
            const targets = findEnemiesInRange(effect.x, effect.y, effect.radius);

            if (effect.friendlyFire) {
                // Add player
                const playerDist = Math.sqrt((player.x - effect.x) ** 2 + (player.y - effect.y) ** 2);
                if (playerDist <= effect.radius) {
                    targets.push(player);
                }

                // Add survivors
                for (const s of survivors) {
                    if (s.isPlayer) continue;
                    const dist = Math.sqrt((s.x - effect.x) ** 2 + (s.y - effect.y) ** 2);
                    if (dist <= effect.radius) {
                        targets.push(s);
                    }
                }
            }

            // Deal damage to all targets
            for (const target of targets) {
                target.health -= effect.damage;

                if (effect.type === 'poison' && effect.statusDuration) {
                    applyStatusEffect(target, 'poison', effect.statusDuration, { damage: effect.damage * 0.5 });
                }

                // Visual feedback
                if (typeof spawnParticles === 'function') {
                    const color = effect.type === 'fire' ? '#ff6622' : '#88ff44';
                    spawnParticles(target.x, target.y, color, 3);
                }
            }
        }
    }

    function processGravityEffect(effect, dt) {
        // Find enemies in range
        const targets = findEnemiesInRange(effect.x, effect.y, effect.radius);

        for (const target of targets) {
            // Calculate pull direction
            const dx = effect.x - target.x;
            const dy = effect.y - target.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0.5) { // Don't pull if very close
                const pullX = (dx / dist) * effect.pullStrength * dt;
                const pullY = (dy / dist) * effect.pullStrength * dt;

                // Apply pull
                target.x += pullX;
                target.y += pullY;
            }
        }
    }

    // ============= CHAIN REACTIONS =============
    function queueChainReaction(sourceTrap) {
        const chainRadius = sourceTrap.stats.chainReactionRadius || 3;

        // Find nearby chain-reactive traps
        for (const trap of traps) {
            if (trap.id === sourceTrap.id || trap.destroyed || !trap.type.canChainReact) continue;

            const dist = Math.sqrt((trap.x - sourceTrap.x) ** 2 + (trap.y - sourceTrap.y) ** 2);
            if (dist <= chainRadius) {
                chainReactionQueue.push({
                    trap,
                    delay: dist * CONFIG.CHAIN_REACTION_DELAY,
                    elapsed: 0
                });
            }
        }
    }

    function processChainReactions(dt) {
        for (let i = chainReactionQueue.length - 1; i >= 0; i--) {
            const reaction = chainReactionQueue[i];
            reaction.elapsed += dt;

            if (reaction.elapsed >= reaction.delay) {
                chainReactionQueue.splice(i, 1);

                if (!reaction.trap.destroyed) {
                    // Trigger the trap (passing 'chain' to prevent infinite loops)
                    if (reaction.trap.type.category === 'explosive') {
                        triggerExplosive(reaction.trap, null);
                    }
                }
            }
        }
    }

    // ============= UTILITY FUNCTIONS =============
    function calculateTrapDamage(trap, target) {
        let damage = trap.stats.damage;

        // Apply armor penetration
        const armorPen = trap.stats.armorPenetration || 0;
        const targetArmor = target.armor || 0;
        const effectiveArmor = targetArmor * (1 - armorPen);

        // Simple armor reduction formula
        damage = damage * (100 / (100 + effectiveArmor));

        return Math.floor(damage);
    }

    function applyTrapDamage(target, damage, trap) {
        target.health -= damage;

        // Damage number
        if (typeof addDamageNumber === 'function') {
            addDamageNumber(target.x, target.y - 0.5, damage, '#ffaa00');
        }

        // Check for kill
        if (target.health <= 0 && !target.isPlayer) {
            // Award XP to player
            if (typeof player !== 'undefined') {
                player.exp += 10;
                if (typeof checkLevelUp === 'function') {
                    checkLevelUp();
                }
            }
        }
    }

    function applyStatusEffect(target, effectType, duration, params = {}) {
        if (!target.statusEffects) {
            target.statusEffects = {};
        }

        target.statusEffects[effectType] = {
            duration,
            remaining: duration,
            ...params
        };

        // Apply immediate effects
        switch (effectType) {
            case 'root':
            case 'freeze':
                target.immobilized = true;
                break;
            case 'slow':
                target.speedModifier = (target.speedModifier || 1) * (1 - params.amount);
                break;
            case 'stun':
                target.stunned = true;
                break;
        }
    }

    function consumeDurability(trap) {
        trap.durability--;

        if (trap.durability <= 0) {
            destroyTrap(trap);
        }
    }

    function findEnemiesInRange(x, y, range) {
        const enemies = [];

        for (const zombie of zombies) {
            const dist = Math.sqrt((zombie.x - x) ** 2 + (zombie.y - y) ** 2);
            if (dist <= range && zombie.health > 0) {
                enemies.push(zombie);
            }
        }

        return enemies;
    }

    function findAlliesInRange(x, y, range) {
        const allies = [];

        // Check player
        const playerDist = Math.sqrt((player.x - x) ** 2 + (player.y - y) ** 2);
        if (playerDist <= range) {
            allies.push(player);
        }

        // Check survivors
        for (const survivor of survivors) {
            const dist = Math.sqrt((survivor.x - x) ** 2 + (survivor.y - y) ** 2);
            if (dist <= range) {
                allies.push(survivor);
            }
        }

        return allies;
    }

    function createExplosion(x, y, radius, damage, armorPen, friendlyFire) {
        // Find all entities in explosion radius
        const targets = findEnemiesInRange(x, y, radius);

        if (friendlyFire) {
            const playerDist = Math.sqrt((player.x - x) ** 2 + (player.y - y) ** 2);
            if (playerDist <= radius) {
                targets.push(player);
            }

            for (const s of survivors) {
                if (s.isPlayer) continue;
                const dist = Math.sqrt((s.x - x) ** 2 + (s.y - y) ** 2);
                if (dist <= radius) {
                    targets.push(s);
                }
            }
        }

        // Deal damage based on distance from center
        for (const target of targets) {
            const dist = Math.sqrt((target.x - x) ** 2 + (target.y - y) ** 2);
            const falloff = 1 - (dist / radius);
            const finalDamage = Math.floor(damage * falloff);

            target.health -= finalDamage;

            if (typeof addDamageNumber === 'function') {
                addDamageNumber(target.x, target.y - 0.5, finalDamage, '#ff6622');
            }
        }

        // Explosion particles
        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 30; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * radius;
                spawnParticles(
                    x + Math.cos(angle) * dist,
                    y + Math.sin(angle) * dist,
                    i % 2 === 0 ? '#ff6622' : '#ffaa00',
                    4
                );
            }
        }

        // Screen shake
        if (typeof camera !== 'undefined') {
            camera.shake = Math.max(camera.shake, 10);
        }
    }

    function applyKnockback(x, y, radius, strength) {
        const targets = findEnemiesInRange(x, y, radius);

        for (const target of targets) {
            const dx = target.x - x;
            const dy = target.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0) {
                const knockbackX = (dx / dist) * strength;
                const knockbackY = (dy / dist) * strength;

                target.x += knockbackX;
                target.y += knockbackY;
            }
        }
    }

    function createLightningEffect(fromX, fromY, toX, toY) {
        // Create visual lightning arc (using particles)
        if (typeof spawnParticles === 'function') {
            const dx = toX - fromX;
            const dy = toY - fromY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const steps = Math.floor(dist * 3);

            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const px = fromX + dx * t + (Math.random() - 0.5) * 0.3;
                const py = fromY + dy * t + (Math.random() - 0.5) * 0.3;
                spawnParticles(px, py, '#88ccff', 2);
            }
        }
    }

    function createFireEffect(x, y, radius) {
        // Fire particles spread
        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 25; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * radius;
                spawnParticles(
                    x + Math.cos(angle) * dist,
                    y + Math.sin(angle) * dist,
                    Math.random() > 0.5 ? '#ff4400' : '#ffaa00',
                    4
                );
            }
        }
    }

    // ============= TRIPWIRE CONNECTIONS =============
    function connectTraps(trap1Id, trap2Id) {
        // Validate both traps exist
        const trap1 = traps.find(t => t.id === trap1Id);
        const trap2 = traps.find(t => t.id === trap2Id);

        if (!trap1 || !trap2) return false;

        // Check if trap1 is a tripwire
        if (trap1.typeId !== 'tripwire') return false;

        // Check range
        const dist = Math.sqrt((trap1.x - trap2.x) ** 2 + (trap1.y - trap2.y) ** 2);
        if (dist > trap1.stats.connectionRange) return false;

        // Add connection
        if (!trapConnections.has(trap1Id)) {
            trapConnections.set(trap1Id, []);
        }

        const connections = trapConnections.get(trap1Id);
        if (!connections.includes(trap2Id)) {
            connections.push(trap2Id);
        }

        return true;
    }

    // ============= UPGRADE SYSTEM =============
    function upgradeTrap(trapId, upgradeId) {
        const trap = traps.find(t => t.id === trapId);
        if (!trap) return false;

        const upgrade = TRAP_UPGRADES[upgradeId];
        if (!upgrade) return false;

        // Check if already has upgrade
        if (trap.upgrades.includes(upgradeId)) return false;

        // Check cost
        for (const [resource, amount] of Object.entries(upgrade.cost)) {
            if ((resources[resource] || 0) < amount) {
                if (typeof showNotification === 'function') {
                    showNotification('<i class="material-icons">warning</i> Not enough resources!', []);
                }
                return false;
            }
        }

        // Deduct cost
        for (const [resource, amount] of Object.entries(upgrade.cost)) {
            resources[resource] -= amount;
        }

        // Apply upgrade
        trap.upgrades.push(upgradeId);

        if (upgrade.effect.multiplier) {
            trap.stats[upgrade.effect.stat] *= upgrade.effect.multiplier;
        } else if (upgrade.effect.add) {
            trap.stats[upgrade.effect.stat] += upgrade.effect.add;
        }

        // Update max durability if durability was upgraded
        if (upgrade.effect.stat === 'durability') {
            trap.stats.maxDurability = trap.stats.durability;
        }

        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('build_upgrade', { position: { x: trap.x, y: trap.y } });
        }

        return true;
    }

    function repairTrap(trapId) {
        const trap = traps.find(t => t.id === trapId);
        if (!trap || trap.destroyed) return false;

        // Calculate repair cost (half of original)
        const repairCost = {};
        for (const [resource, amount] of Object.entries(trap.type.cost)) {
            repairCost[resource] = Math.ceil(amount * 0.5);
        }

        // Check cost
        for (const [resource, amount] of Object.entries(repairCost)) {
            if ((resources[resource] || 0) < amount) {
                if (typeof showNotification === 'function') {
                    showNotification('<i class="material-icons">warning</i> Not enough resources!', []);
                }
                return false;
            }
        }

        // Deduct cost
        for (const [resource, amount] of Object.entries(repairCost)) {
            resources[resource] -= amount;
        }

        // Repair
        trap.durability = trap.stats.maxDurability;

        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('build_place', { position: { x: trap.x, y: trap.y } });
        }

        return true;
    }

    // ============= BUFF CHECKS =============
    function getBuffsAtPosition(x, y) {
        const buffs = {
            damageBonus: 0,
            speedBonus: 0
        };

        for (const trap of traps) {
            if (trap.typeId !== 'buff_beacon' || trap.destroyed) continue;

            const dist = Math.sqrt((x - trap.x) ** 2 + (y - trap.y) ** 2);
            if (dist <= trap.stats.buffRadius) {
                buffs.damageBonus += trap.stats.damageBonus;
                buffs.speedBonus += trap.stats.speedBonus;
            }
        }

        return buffs;
    }

    // ============= RENDERING =============
    function draw(ctx, camX, camY) {
        // Draw active effects first (under traps)
        drawActiveEffects(ctx, camX, camY);

        // Draw traps
        for (const trap of traps) {
            drawTrap(ctx, trap, camX, camY);
        }

        // Draw connections
        drawTrapConnections(ctx, camX, camY);
    }

    function drawTrap(ctx, trap, camX, camY) {
        const s = TILE_SIZE * SCALE;
        const sx = (trap.x - 0.5) * s - camX;
        const sy = (trap.y - 0.5) * s - camY;

        // Skip if off-screen
        if (sx < -s || sx > ctx.canvas.width || sy < -s || sy > ctx.canvas.height) {
            return;
        }

        // Draw based on trap type
        ctx.save();

        // Trigger animation (flash)
        if (trap.triggerAnimation > 0) {
            ctx.globalAlpha = 0.5 + trap.triggerAnimation * 0.5;
        }

        // Not armed yet (transparent)
        if (!trap.armed) {
            ctx.globalAlpha = 0.5;
        }

        // Cooldown indicator (dim)
        if (trap.cooldownTimer > 0) {
            ctx.globalAlpha = 0.6;
        }

        // Draw trap icon
        ctx.font = `${s * 0.7}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(trap.type.icon, sx + s / 2, sy + s / 2);

        // Draw durability bar
        if (trap.durability < trap.stats.maxDurability) {
            const barWidth = s * 0.8;
            const barHeight = 4;
            const barX = sx + (s - barWidth) / 2;
            const barY = sy + s - 6;

            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            const durabilityPercent = trap.durability / trap.stats.maxDurability;
            ctx.fillStyle = durabilityPercent > 0.5 ? '#44ff44' : durabilityPercent > 0.25 ? '#ffff44' : '#ff4444';
            ctx.fillRect(barX, barY, barWidth * durabilityPercent, barHeight);
        }

        // Draw cooldown indicator
        if (trap.cooldownTimer > 0 && trap.stats.cooldown > 0) {
            const cooldownPercent = trap.cooldownTimer / trap.stats.cooldown;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.moveTo(sx + s / 2, sy + s / 2);
            ctx.arc(sx + s / 2, sy + s / 2, s / 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * cooldownPercent);
            ctx.closePath();
            ctx.fill();
        }

        // Draw rotation for turrets
        if (trap.typeId === 'turret_trap') {
            const angle = trap.rotation * Math.PI / 180;
            const barrelLength = s * 0.4;
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(sx + s / 2, sy + s / 2);
            ctx.lineTo(
                sx + s / 2 + Math.cos(angle) * barrelLength,
                sy + s / 2 + Math.sin(angle) * barrelLength
            );
            ctx.stroke();
        }

        ctx.restore();
    }

    function drawActiveEffects(ctx, camX, camY) {
        const s = TILE_SIZE * SCALE;

        for (const effect of activeEffects) {
            const sx = effect.x * s - camX;
            const sy = effect.y * s - camY;
            const radius = effect.radius * s;

            ctx.save();

            // Calculate alpha based on remaining duration
            const alpha = 0.3 * (1 - effect.elapsed / effect.duration);

            switch (effect.type) {
                case 'fire':
                    ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case 'poison':
                    ctx.fillStyle = `rgba(100, 255, 100, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case 'gravity':
                    ctx.strokeStyle = `rgba(150, 100, 255, ${alpha + 0.2})`;
                    ctx.lineWidth = 2;
                    for (let i = 0; i < 3; i++) {
                        const r = radius * (1 - i * 0.3) * (1 + Math.sin(Date.now() / 200 + i) * 0.1);
                        ctx.beginPath();
                        ctx.arc(sx, sy, r, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                    break;
            }

            ctx.restore();
        }
    }

    function drawTrapConnections(ctx, camX, camY) {
        const s = TILE_SIZE * SCALE;

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 200, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        for (const [tripwireId, connectedIds] of trapConnections) {
            const tripwire = traps.find(t => t.id === tripwireId);
            if (!tripwire || tripwire.destroyed) continue;

            const tx = tripwire.x * s - camX;
            const ty = tripwire.y * s - camY;

            for (const connectedId of connectedIds) {
                const connected = traps.find(t => t.id === connectedId);
                if (!connected || connected.destroyed) continue;

                const cx = connected.x * s - camX;
                const cy = connected.y * s - camY;

                ctx.beginPath();
                ctx.moveTo(tx, ty);
                ctx.lineTo(cx, cy);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    // ============= SERIALIZATION =============
    function getTrapsState() {
        return traps.map(trap => ({
            typeId: trap.typeId,
            x: trap.tileX,
            y: trap.tileY,
            durability: trap.durability,
            upgrades: trap.upgrades,
            connections: trapConnections.get(trap.id) || []
        }));
    }

    function setTrapsState(data) {
        traps = [];
        trapConnections.clear();
        trapIdCounter = 0;

        if (!data) return;

        for (const trapData of data) {
            const trap = createTrap(trapData.typeId, trapData.x, trapData.y, { free: true });
            if (trap) {
                trap.durability = trapData.durability;
                trap.upgrades = trapData.upgrades || [];

                // Re-apply upgrades
                for (const upgradeId of trap.upgrades) {
                    const upgrade = TRAP_UPGRADES[upgradeId];
                    if (upgrade && upgrade.effect.multiplier) {
                        trap.stats[upgrade.effect.stat] *= upgrade.effect.multiplier;
                    } else if (upgrade && upgrade.effect.add) {
                        trap.stats[upgrade.effect.stat] += upgrade.effect.add;
                    }
                }
            }
        }
    }

    // ============= PUBLIC API =============
    return {
        // Core functions
        createTrap,
        removeTrap,
        destroyTrap,
        update,
        draw,

        // Trap management
        upgradeTrap,
        repairTrap,
        connectTraps,
        canAffordTrap,
        canPlaceTrap,

        // Queries
        getBuffsAtPosition,
        getTrapAt: (x, y) => traps.find(t => t.tileX === Math.floor(x) && t.tileY === Math.floor(y)),
        getTraps: () => traps,
        getTrapById: (id) => traps.find(t => t.id === id),

        // Serialization
        getTrapsState,
        setTrapsState,

        // Constants
        TRAP_TYPES,
        TRAP_UPGRADES,
        CONFIG
    };
})();

// Export globally
window.TrapSystem = TrapSystem;
