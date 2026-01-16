// ============================================
// MOUNT & VEHICLE SYSTEM
// ============================================
// Production-grade mount system with tameable creatures,
// rideable vehicles, combat bonuses, and stamina mechanics

const MountSystem = (function() {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        MAX_OWNED_MOUNTS: 10,
        TAMING_BASE_TIME: 5.0,       // seconds
        TAMING_RANGE: 2.0,            // tiles
        MOUNT_SUMMON_COOLDOWN: 30,    // seconds
        STAMINA_REGEN_RATE: 5,        // per second when dismounted
        STAMINA_REGEN_MOUNTED: 1,     // per second when mounted
        LOYALTY_DECAY_RATE: 0.5,      // per minute
        LOYALTY_GAIN_RATE: 2.0,       // per minute when fed
        MAX_LOYALTY: 100,
        MIN_LOYALTY_TO_RIDE: 30
    };

    // ============= MOUNT DEFINITIONS =============
    const MOUNT_TYPES = {
        // === BASIC MOUNTS ===
        horse: {
            id: 'horse',
            name: 'Wild Horse',
            icon: '🐴',
            description: 'A reliable steed with good speed and stamina',
            category: 'beast',
            tier: 1,
            rarity: 'common',
            tamingDifficulty: 1.0,
            spawnBiomes: ['jungle', 'plains', 'forest'],
            stats: {
                maxHealth: 80,
                speed: 2.0,            // Multiplier to player speed
                acceleration: 8,       // How fast it reaches top speed
                turnRate: 180,         // Degrees per second
                maxStamina: 100,
                staminaDrain: 5,       // Per second while sprinting
                jumpHeight: 0,
                carryCapacity: 50      // Extra inventory slots
            },
            abilities: ['sprint', 'kick'],
            preferredFood: ['apple', 'carrot', 'grain'],
            loyaltyDecay: 1.0
        },

        war_horse: {
            id: 'war_horse',
            name: 'War Horse',
            icon: '🏇',
            description: 'Armored warhorse trained for combat',
            category: 'beast',
            tier: 2,
            rarity: 'uncommon',
            tamingDifficulty: 1.5,
            spawnBiomes: ['plains', 'forest'],
            stats: {
                maxHealth: 150,
                speed: 1.8,
                acceleration: 6,
                turnRate: 150,
                maxStamina: 120,
                staminaDrain: 6,
                jumpHeight: 0,
                carryCapacity: 30,
                armor: 15,
                chargeDamage: 30
            },
            abilities: ['sprint', 'charge', 'trample'],
            preferredFood: ['apple', 'meat'],
            loyaltyDecay: 0.8
        },

        wolf: {
            id: 'wolf',
            name: 'Dire Wolf',
            icon: '🐺',
            description: 'Fast and agile predator with combat abilities',
            category: 'beast',
            tier: 2,
            rarity: 'uncommon',
            tamingDifficulty: 2.0,
            spawnBiomes: ['jungle', 'forest', 'tundra'],
            stats: {
                maxHealth: 60,
                speed: 2.5,
                acceleration: 12,
                turnRate: 240,
                maxStamina: 80,
                staminaDrain: 8,
                jumpHeight: 1.5,
                carryCapacity: 20,
                attackDamage: 25,
                attackSpeed: 1.5
            },
            abilities: ['sprint', 'pounce', 'howl', 'bite'],
            preferredFood: ['meat', 'bone'],
            loyaltyDecay: 1.5
        },

        boar: {
            id: 'boar',
            name: 'Giant Boar',
            icon: '🐗',
            description: 'Tough and aggressive mount with charging ability',
            category: 'beast',
            tier: 1,
            rarity: 'common',
            tamingDifficulty: 1.3,
            spawnBiomes: ['jungle', 'forest', 'swamp'],
            stats: {
                maxHealth: 120,
                speed: 1.6,
                acceleration: 10,
                turnRate: 120,
                maxStamina: 90,
                staminaDrain: 4,
                jumpHeight: 0,
                carryCapacity: 40,
                armor: 10,
                chargeDamage: 40
            },
            abilities: ['sprint', 'charge', 'gore'],
            preferredFood: ['mushroom', 'root', 'fruit'],
            loyaltyDecay: 0.6
        },

        // === EXOTIC MOUNTS ===
        raptor: {
            id: 'raptor',
            name: 'Jungle Raptor',
            icon: '🦖',
            description: 'Deadly predator with incredible speed and attack power',
            category: 'beast',
            tier: 3,
            rarity: 'rare',
            tamingDifficulty: 3.0,
            spawnBiomes: ['jungle'],
            stats: {
                maxHealth: 90,
                speed: 3.0,
                acceleration: 15,
                turnRate: 300,
                maxStamina: 70,
                staminaDrain: 10,
                jumpHeight: 2.0,
                carryCapacity: 15,
                attackDamage: 40,
                attackSpeed: 2.0
            },
            abilities: ['sprint', 'pounce', 'slash', 'screech'],
            preferredFood: ['meat', 'fish'],
            loyaltyDecay: 2.0
        },

        bear: {
            id: 'bear',
            name: 'Cave Bear',
            icon: '🐻',
            description: 'Massive beast with incredible strength and durability',
            category: 'beast',
            tier: 3,
            rarity: 'rare',
            tamingDifficulty: 2.5,
            spawnBiomes: ['forest', 'tundra', 'mountain'],
            stats: {
                maxHealth: 200,
                speed: 1.4,
                acceleration: 5,
                turnRate: 100,
                maxStamina: 150,
                staminaDrain: 3,
                jumpHeight: 0,
                carryCapacity: 80,
                armor: 20,
                attackDamage: 50,
                attackSpeed: 0.8
            },
            abilities: ['sprint', 'maul', 'roar', 'swipe'],
            preferredFood: ['meat', 'fish', 'honey', 'berry'],
            loyaltyDecay: 0.5
        },

        // === VEHICLES ===
        cart: {
            id: 'cart',
            name: 'Wooden Cart',
            icon: '🛒',
            description: 'Simple cart for transporting large amounts of resources',
            category: 'vehicle',
            tier: 1,
            rarity: 'common',
            craftable: true,
            craftCost: { wood: 40, iron: 10 },
            stats: {
                maxHealth: 100,
                speed: 1.2,
                acceleration: 3,
                turnRate: 60,
                maxStamina: 999,       // No stamina for vehicles
                staminaDrain: 0,
                jumpHeight: 0,
                carryCapacity: 150
            },
            abilities: [],
            loyaltyDecay: 0,
            requiresTerrain: ['grass', 'floor', 'dirt']
        },

        siege_tower: {
            id: 'siege_tower',
            name: 'Mobile Tower',
            icon: '🏰',
            description: 'Armored mobile platform with mounted crossbow',
            category: 'vehicle',
            tier: 3,
            rarity: 'rare',
            craftable: true,
            craftCost: { wood: 100, iron: 50, stone: 30 },
            stats: {
                maxHealth: 300,
                speed: 0.6,
                acceleration: 2,
                turnRate: 30,
                maxStamina: 999,
                staminaDrain: 0,
                jumpHeight: 0,
                carryCapacity: 50,
                armor: 30,
                turretDamage: 35,
                turretRange: 10,
                turretFireRate: 1.5
            },
            abilities: ['turret_fire', 'fortify'],
            loyaltyDecay: 0,
            requiresTerrain: ['grass', 'floor']
        },

        war_chariot: {
            id: 'war_chariot',
            name: 'War Chariot',
            icon: '🏎️',
            description: 'Fast war vehicle with scythe wheels',
            category: 'vehicle',
            tier: 2,
            rarity: 'uncommon',
            craftable: true,
            craftCost: { wood: 60, iron: 30 },
            stats: {
                maxHealth: 120,
                speed: 2.2,
                acceleration: 6,
                turnRate: 90,
                maxStamina: 999,
                staminaDrain: 0,
                jumpHeight: 0,
                carryCapacity: 30,
                armor: 10,
                wheelDamage: 25       // Damage to enemies when driving past
            },
            abilities: ['sprint', 'wheel_attack'],
            loyaltyDecay: 0,
            requiresTerrain: ['grass', 'floor', 'dirt']
        }
    };

    // ============= ABILITY DEFINITIONS =============
    const ABILITIES = {
        sprint: {
            id: 'sprint',
            name: 'Sprint',
            description: 'Temporarily increase speed at cost of stamina',
            cooldown: 0,
            staminaCost: 0,            // Continuous cost
            duration: 0,               // Toggle ability
            effects: { speedMultiplier: 1.5 }
        },
        kick: {
            id: 'kick',
            name: 'Kick',
            description: 'Kick enemies behind you',
            cooldown: 3,
            staminaCost: 15,
            damage: 20,
            knockback: 3,
            range: 1.5,
            direction: 'back'
        },
        charge: {
            id: 'charge',
            name: 'Charge',
            description: 'Charge forward dealing damage to enemies in path',
            cooldown: 8,
            staminaCost: 30,
            duration: 1.5,
            effects: { speedMultiplier: 2.0, damageMultiplier: 1.5 }
        },
        trample: {
            id: 'trample',
            name: 'Trample',
            description: 'Stomp the ground dealing AoE damage',
            cooldown: 6,
            staminaCost: 25,
            damage: 35,
            radius: 2.0,
            stunDuration: 1.0
        },
        pounce: {
            id: 'pounce',
            name: 'Pounce',
            description: 'Leap to target location',
            cooldown: 5,
            staminaCost: 20,
            range: 6,
            damage: 30,
            effects: { invulnerable: true }
        },
        howl: {
            id: 'howl',
            name: 'Howl',
            description: 'Frighten nearby enemies, reducing their damage',
            cooldown: 15,
            staminaCost: 20,
            radius: 6,
            duration: 8,
            effects: { enemyDamageReduction: 0.3 }
        },
        bite: {
            id: 'bite',
            name: 'Bite',
            description: 'Powerful bite attack',
            cooldown: 1.5,
            staminaCost: 10,
            damage: 35,
            range: 1.2,
            effects: { bleed: { damage: 5, duration: 3 } }
        },
        gore: {
            id: 'gore',
            name: 'Gore',
            description: 'Thrust tusks dealing piercing damage',
            cooldown: 4,
            staminaCost: 20,
            damage: 45,
            range: 1.5,
            effects: { armorPenetration: 0.5 }
        },
        slash: {
            id: 'slash',
            name: 'Slash',
            description: 'Quick claw attack',
            cooldown: 0.8,
            staminaCost: 8,
            damage: 30,
            range: 1.3,
            hits: 2
        },
        screech: {
            id: 'screech',
            name: 'Screech',
            description: 'Stunning screech that interrupts enemies',
            cooldown: 12,
            staminaCost: 25,
            radius: 4,
            stunDuration: 2.0
        },
        maul: {
            id: 'maul',
            name: 'Maul',
            description: 'Devastating multi-hit attack',
            cooldown: 5,
            staminaCost: 30,
            damage: 25,
            hits: 3,
            range: 1.5
        },
        roar: {
            id: 'roar',
            name: 'Roar',
            description: 'Intimidating roar that boosts allies',
            cooldown: 20,
            staminaCost: 20,
            radius: 8,
            duration: 10,
            effects: { allyDamageBoost: 0.2, allySpeedBoost: 0.1 }
        },
        swipe: {
            id: 'swipe',
            name: 'Swipe',
            description: 'Wide sweeping attack',
            cooldown: 2,
            staminaCost: 15,
            damage: 40,
            arc: 120,                 // degrees
            range: 2
        },
        turret_fire: {
            id: 'turret_fire',
            name: 'Turret Fire',
            description: 'Fire mounted crossbow',
            cooldown: 0,              // Uses fire rate
            staminaCost: 0,
            automatic: true
        },
        fortify: {
            id: 'fortify',
            name: 'Fortify',
            description: 'Deploy shields, becoming immobile but gaining armor',
            cooldown: 30,
            staminaCost: 0,
            duration: 10,
            effects: { armor: 50, speed: 0 }
        },
        wheel_attack: {
            id: 'wheel_attack',
            name: 'Scythe Wheels',
            description: 'Damage enemies when driving past',
            cooldown: 0,
            staminaCost: 0,
            automatic: true,
            range: 1.5
        }
    };

    // ============= STATE =============
    let ownedMounts = [];
    let wildMounts = [];
    let currentMount = null;
    let isMounted = false;
    let mountIdCounter = 0;

    // Taming state
    let tamingTarget = null;
    let tamingProgress = 0;
    let tamingInterrupted = false;

    // Ability state
    let abilityCooldowns = {};
    let activeAbilityEffects = [];

    // Sprinting state
    let isSprinting = false;

    // ============= MOUNT INSTANCE CREATION =============
    function createMountInstance(typeId, x, y, isWild = true) {
        const mountType = MOUNT_TYPES[typeId];
        if (!mountType) return null;

        const mount = {
            id: mountIdCounter++,
            typeId: typeId,
            type: mountType,
            name: generateMountName(mountType),

            // Position
            x: x,
            y: y,
            prevX: x,
            prevY: y,

            // Stats
            health: mountType.stats.maxHealth,
            maxHealth: mountType.stats.maxHealth,
            stamina: mountType.stats.maxStamina,
            maxStamina: mountType.stats.maxStamina,

            // Loyalty (for beasts)
            loyalty: isWild ? 0 : CONFIG.MAX_LOYALTY,
            maxLoyalty: CONFIG.MAX_LOYALTY,

            // State
            isWild: isWild,
            isTamed: !isWild,
            isFollowing: false,
            state: isWild ? 'wandering' : 'idle',

            // Movement
            direction: 0,
            velocity: { x: 0, y: 0 },
            targetPosition: null,

            // Animation
            frame: 0,
            animTimer: 0,

            // Experience (for leveling)
            level: 1,
            exp: 0,
            expToLevel: 100,

            // Equipment
            saddle: null,
            armor: null,
            accessories: [],

            // Ability cooldowns
            abilityCooldowns: {},

            // Active effects
            activeEffects: [],

            // Combat stats modifiers
            bonusStats: {
                speed: 0,
                damage: 0,
                armor: 0,
                stamina: 0
            }
        };

        return mount;
    }

    function generateMountName(mountType) {
        const prefixes = ['Shadow', 'Storm', 'Thunder', 'Swift', 'Mighty', 'Noble', 'Wild', 'Fierce'];
        const suffixes = ['Runner', 'Striker', 'Heart', 'Claw', 'Fury', 'Spirit', 'Blaze', 'Wind'];

        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

        return `${prefix} ${suffix}`;
    }

    // ============= WILD MOUNT SPAWNING =============
    function spawnWildMount(typeId, x, y) {
        const mount = createMountInstance(typeId, x, y, true);
        if (mount) {
            wildMounts.push(mount);
        }
        return mount;
    }

    function spawnRandomWildMount() {
        // Get current biome
        let currentBiome = 'jungle';
        if (typeof BiomeSystem !== 'undefined' && BiomeSystem.getCurrentBiome) {
            currentBiome = BiomeSystem.getCurrentBiome() || 'jungle';
        }

        // Find mounts that can spawn in this biome
        const validMounts = Object.values(MOUNT_TYPES).filter(m =>
            m.category === 'beast' && m.spawnBiomes.includes(currentBiome)
        );

        if (validMounts.length === 0) return null;

        // Weight by rarity (common more likely)
        const weightedMounts = [];
        for (const mount of validMounts) {
            const weight = mount.rarity === 'common' ? 10 :
                           mount.rarity === 'uncommon' ? 5 :
                           mount.rarity === 'rare' ? 2 : 1;
            for (let i = 0; i < weight; i++) {
                weightedMounts.push(mount);
            }
        }

        const selectedType = weightedMounts[Math.floor(Math.random() * weightedMounts.length)];

        // Find spawn position away from player
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 15;
        const x = player.x + Math.cos(angle) * distance;
        const y = player.y + Math.sin(angle) * distance;

        // Check if position is valid
        const tile = getTile(Math.floor(x), Math.floor(y));
        if (tile !== TILES.GRASS) return null;

        return spawnWildMount(selectedType.id, x, y);
    }

    // ============= TAMING SYSTEM =============
    function startTaming(mount) {
        if (!mount || !mount.isWild) return false;

        // Check if in range
        const dist = Math.sqrt((mount.x - player.x) ** 2 + (mount.y - player.y) ** 2);
        if (dist > CONFIG.TAMING_RANGE) {
            if (typeof showNotification === 'function') {
                showNotification('<i class="material-icons">warning</i> Too far away to tame!', []);
            }
            return false;
        }

        // Check if we have food the mount likes
        const hasFood = checkForPreferredFood(mount.type);
        if (!hasFood) {
            if (typeof showNotification === 'function') {
                showNotification('<i class="material-icons">warning</i> Need food to tame this creature!', []);
            }
            return false;
        }

        // Check owned mounts limit
        if (ownedMounts.length >= CONFIG.MAX_OWNED_MOUNTS) {
            if (typeof showNotification === 'function') {
                showNotification('<i class="material-icons">warning</i> Too many mounts owned!', []);
            }
            return false;
        }

        tamingTarget = mount;
        tamingProgress = 0;
        tamingInterrupted = false;
        mount.state = 'being_tamed';

        if (typeof showNotification === 'function') {
            showNotification(`<i class="material-icons">pets</i> Taming ${mount.type.name}...`, []);
        }

        return true;
    }

    function updateTaming(dt) {
        if (!tamingTarget) return;

        // Check if still in range
        const dist = Math.sqrt((tamingTarget.x - player.x) ** 2 + (tamingTarget.y - player.y) ** 2);
        if (dist > CONFIG.TAMING_RANGE + 1) {
            cancelTaming('Too far away!');
            return;
        }

        // Check if interrupted (player or mount took damage)
        if (tamingInterrupted) {
            cancelTaming('Taming interrupted!');
            return;
        }

        // Progress taming
        const tamingTime = CONFIG.TAMING_BASE_TIME * tamingTarget.type.tamingDifficulty;
        tamingProgress += dt / tamingTime;

        if (tamingProgress >= 1) {
            completeTaming();
        }
    }

    function cancelTaming(reason) {
        if (!tamingTarget) return;

        tamingTarget.state = 'fleeing';
        tamingTarget = null;
        tamingProgress = 0;

        if (typeof showNotification === 'function' && reason) {
            showNotification(`<i class="material-icons">cancel</i> ${reason}`, []);
        }
    }

    function completeTaming() {
        if (!tamingTarget) return;

        // Consume food
        consumePreferredFood(tamingTarget.type);

        // Convert to tamed mount
        tamingTarget.isWild = false;
        tamingTarget.isTamed = true;
        tamingTarget.loyalty = 50;
        tamingTarget.state = 'idle';

        // Remove from wild mounts
        const wildIndex = wildMounts.indexOf(tamingTarget);
        if (wildIndex !== -1) {
            wildMounts.splice(wildIndex, 1);
        }

        // Add to owned mounts
        ownedMounts.push(tamingTarget);

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">celebration</i> ${tamingTarget.name} tamed!`,
                []
            );
        }

        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('achievement');
        }

        if (typeof spawnParticles === 'function') {
            spawnParticles(tamingTarget.x, tamingTarget.y, '#ffdd00', 20);
        }

        tamingTarget = null;
        tamingProgress = 0;
    }

    function checkForPreferredFood(mountType) {
        // Check inventory for preferred foods
        if (typeof EquipmentSystem !== 'undefined') {
            const inventory = EquipmentSystem.getInventory();
            for (const food of mountType.preferredFood) {
                const item = inventory.find(i => i && i.id === food);
                if (item && item.quantity > 0) {
                    return true;
                }
            }
        }

        // Fallback: check resources.food
        if (resources.food >= 5) {
            return true;
        }

        return false;
    }

    function consumePreferredFood(mountType) {
        // Try to consume from inventory first
        if (typeof EquipmentSystem !== 'undefined') {
            const inventory = EquipmentSystem.getInventory();
            for (const food of mountType.preferredFood) {
                const itemIndex = inventory.findIndex(i => i && i.id === food && i.quantity > 0);
                if (itemIndex !== -1) {
                    inventory[itemIndex].quantity--;
                    if (inventory[itemIndex].quantity <= 0) {
                        inventory[itemIndex] = null;
                    }
                    return true;
                }
            }
        }

        // Fallback: consume resources.food
        if (resources.food >= 5) {
            resources.food -= 5;
            return true;
        }

        return false;
    }

    // ============= MOUNTING/DISMOUNTING =============
    function mountUp(mount) {
        if (!mount || isMounted) return false;

        // Check if tamed
        if (!mount.isTamed) {
            if (typeof showNotification === 'function') {
                showNotification('<i class="material-icons">warning</i> Must tame this creature first!', []);
            }
            return false;
        }

        // Check loyalty
        if (mount.loyalty < CONFIG.MIN_LOYALTY_TO_RIDE) {
            if (typeof showNotification === 'function') {
                showNotification('<i class="material-icons">warning</i> Loyalty too low to ride!', []);
            }
            return false;
        }

        // Check if in range
        const dist = Math.sqrt((mount.x - player.x) ** 2 + (mount.y - player.y) ** 2);
        if (dist > 2) {
            if (typeof showNotification === 'function') {
                showNotification('<i class="material-icons">warning</i> Too far away!', []);
            }
            return false;
        }

        currentMount = mount;
        isMounted = true;
        mount.state = 'mounted';

        // Move player to mount position
        player.x = mount.x;
        player.y = mount.y;

        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('ui_click');
        }

        if (typeof showNotification === 'function') {
            showNotification(`<i class="material-icons">directions_bike</i> Mounted ${mount.name}`, []);
        }

        return true;
    }

    function dismount() {
        if (!isMounted || !currentMount) return false;

        // Find safe dismount position
        const dismountPos = findSafeDismountPosition();
        if (!dismountPos) {
            if (typeof showNotification === 'function') {
                showNotification('<i class="material-icons">warning</i> No safe place to dismount!', []);
            }
            return false;
        }

        currentMount.state = 'idle';
        currentMount.x = player.x;
        currentMount.y = player.y;

        player.x = dismountPos.x;
        player.y = dismountPos.y;

        isMounted = false;
        currentMount = null;
        isSprinting = false;

        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('ui_click');
        }

        return true;
    }

    function findSafeDismountPosition() {
        const directions = [
            { x: 1, y: 0 }, { x: -1, y: 0 },
            { x: 0, y: 1 }, { x: 0, y: -1 },
            { x: 1, y: 1 }, { x: -1, y: -1 },
            { x: 1, y: -1 }, { x: -1, y: 1 }
        ];

        for (const dir of directions) {
            const testX = player.x + dir.x;
            const testY = player.y + dir.y;
            const tile = getTile(Math.floor(testX), Math.floor(testY));

            if (!isSolid(tile)) {
                return { x: testX, y: testY };
            }
        }

        return null;
    }

    // ============= MOVEMENT =============
    function updateMountedMovement(dt) {
        if (!isMounted || !currentMount) return;

        const mount = currentMount;
        const stats = mount.type.stats;

        // Get movement input
        let moveX = 0, moveY = 0;

        if (inputState.up) moveY -= 1;
        if (inputState.down) moveY += 1;
        if (inputState.left) moveX -= 1;
        if (inputState.right) moveX += 1;

        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            const len = Math.sqrt(moveX * moveX + moveY * moveY);
            moveX /= len;
            moveY /= len;
        }

        // Calculate speed
        let speed = player.speed * stats.speed;

        // Apply sprint
        if (isSprinting && mount.stamina > 0) {
            speed *= ABILITIES.sprint.effects.speedMultiplier;
            mount.stamina -= stats.staminaDrain * dt;
        }

        // Apply active effects
        for (const effect of mount.activeEffects) {
            if (effect.speedMultiplier) {
                speed *= effect.speedMultiplier;
            }
        }

        // Apply bonus stats
        speed *= (1 + mount.bonusStats.speed);

        // Acceleration
        const targetVelX = moveX * speed;
        const targetVelY = moveY * speed;

        mount.velocity.x += (targetVelX - mount.velocity.x) * stats.acceleration * dt;
        mount.velocity.y += (targetVelY - mount.velocity.y) * stats.acceleration * dt;

        // Store previous position
        mount.prevX = mount.x;
        mount.prevY = mount.y;

        // Apply movement with collision
        const newX = mount.x + mount.velocity.x * dt;
        const newY = mount.y + mount.velocity.y * dt;

        // Check terrain requirements for vehicles
        if (mount.type.requiresTerrain) {
            const tile = getTile(Math.floor(newX), Math.floor(newY));
            const tileAllowed = mount.type.requiresTerrain.some(t => {
                if (t === 'grass') return tile === TILES.GRASS;
                if (t === 'floor') return tile === TILES.FLOOR;
                if (t === 'dirt') return tile === TILES.GRASS;
                return false;
            });

            if (!tileAllowed) {
                mount.velocity.x *= 0.5;
                mount.velocity.y *= 0.5;
            }
        }

        // Collision detection
        if (!isSolid(getTile(Math.floor(newX), Math.floor(mount.y)))) {
            mount.x = newX;
        } else {
            mount.velocity.x = 0;
        }

        if (!isSolid(getTile(Math.floor(mount.x), Math.floor(newY)))) {
            mount.y = newY;
        } else {
            mount.velocity.y = 0;
        }

        // Update player position
        player.x = mount.x;
        player.y = mount.y;

        // Update direction
        if (moveX !== 0 || moveY !== 0) {
            mount.direction = Math.atan2(moveY, moveX);
        }

        // Stamina regeneration (slow while mounted)
        if (!isSprinting && mount.stamina < mount.maxStamina) {
            mount.stamina = Math.min(
                mount.maxStamina,
                mount.stamina + CONFIG.STAMINA_REGEN_MOUNTED * dt
            );
        }

        // Wheel attack for chariots
        if (mount.typeId === 'war_chariot') {
            updateWheelAttack(mount, dt);
        }
    }

    function updateUnmountedMounts(dt) {
        // Update wild mounts
        for (const mount of wildMounts) {
            if (mount === tamingTarget) continue; // Don't update if being tamed

            updateWildMountAI(mount, dt);
            updateMountPosition(mount, dt);
        }

        // Update owned mounts that aren't mounted
        for (const mount of ownedMounts) {
            if (mount === currentMount && isMounted) continue;

            updateOwnedMountAI(mount, dt);
            updateMountPosition(mount, dt);

            // Loyalty decay
            if (mount.type.category === 'beast') {
                mount.loyalty = Math.max(0, mount.loyalty - CONFIG.LOYALTY_DECAY_RATE * dt / 60);
            }
        }
    }

    function updateWildMountAI(mount, dt) {
        switch (mount.state) {
            case 'wandering':
                // Random wandering
                if (!mount.targetPosition || Math.random() < 0.01) {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 3 + Math.random() * 5;
                    mount.targetPosition = {
                        x: mount.x + Math.cos(angle) * distance,
                        y: mount.y + Math.sin(angle) * distance
                    };
                }
                break;

            case 'fleeing':
                // Run away from player
                const fleeAngle = Math.atan2(mount.y - player.y, mount.x - player.x);
                mount.targetPosition = {
                    x: mount.x + Math.cos(fleeAngle) * 10,
                    y: mount.y + Math.sin(fleeAngle) * 10
                };

                // Check if far enough
                const dist = Math.sqrt((mount.x - player.x) ** 2 + (mount.y - player.y) ** 2);
                if (dist > 25) {
                    mount.state = 'wandering';
                }
                break;
        }
    }

    function updateOwnedMountAI(mount, dt) {
        if (mount.isFollowing) {
            // Follow player
            const dx = player.x - mount.x;
            const dy = player.y - mount.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 3) {
                mount.targetPosition = {
                    x: player.x - (dx / dist) * 2,
                    y: player.y - (dy / dist) * 2
                };
            } else {
                mount.targetPosition = null;
            }
        }

        // Stamina regeneration when not mounted
        if (mount.stamina < mount.maxStamina) {
            mount.stamina = Math.min(
                mount.maxStamina,
                mount.stamina + CONFIG.STAMINA_REGEN_RATE * dt
            );
        }
    }

    function updateMountPosition(mount, dt) {
        if (!mount.targetPosition) return;

        const dx = mount.targetPosition.x - mount.x;
        const dy = mount.targetPosition.y - mount.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.3) {
            mount.targetPosition = null;
            return;
        }

        // Move towards target
        const speed = mount.type.stats.speed * player.speed * 0.5;
        const moveX = (dx / dist) * speed * dt;
        const moveY = (dy / dist) * speed * dt;

        mount.prevX = mount.x;
        mount.prevY = mount.y;

        // Check collision
        const newX = mount.x + moveX;
        const newY = mount.y + moveY;

        if (!isSolid(getTile(Math.floor(newX), Math.floor(mount.y)))) {
            mount.x = newX;
        }
        if (!isSolid(getTile(Math.floor(mount.x), Math.floor(newY)))) {
            mount.y = newY;
        }

        // Update direction
        mount.direction = Math.atan2(dy, dx);
    }

    // ============= ABILITIES =============
    function useAbility(abilityId) {
        if (!isMounted || !currentMount) return false;

        const ability = ABILITIES[abilityId];
        if (!ability) return false;

        // Check if mount has ability
        if (!currentMount.type.abilities.includes(abilityId)) return false;

        // Check cooldown
        if (currentMount.abilityCooldowns[abilityId] > 0) {
            if (typeof showNotification === 'function') {
                showNotification('<i class="material-icons">hourglass_empty</i> Ability on cooldown!', []);
            }
            return false;
        }

        // Check stamina
        if (currentMount.stamina < ability.staminaCost) {
            if (typeof showNotification === 'function') {
                showNotification('<i class="material-icons">warning</i> Not enough stamina!', []);
            }
            return false;
        }

        // Execute ability
        executeAbility(currentMount, ability);

        // Set cooldown and consume stamina
        currentMount.abilityCooldowns[abilityId] = ability.cooldown;
        currentMount.stamina -= ability.staminaCost;

        return true;
    }

    function executeAbility(mount, ability) {
        switch (ability.id) {
            case 'kick':
                executeKick(mount, ability);
                break;
            case 'charge':
                executeCharge(mount, ability);
                break;
            case 'trample':
                executeTrample(mount, ability);
                break;
            case 'pounce':
                executePounce(mount, ability);
                break;
            case 'howl':
            case 'roar':
                executeAreaBuff(mount, ability);
                break;
            case 'bite':
            case 'slash':
            case 'gore':
            case 'swipe':
            case 'maul':
                executeMeleeAttack(mount, ability);
                break;
            case 'screech':
                executeScreech(mount, ability);
                break;
            case 'fortify':
                executeFortify(mount, ability);
                break;
        }

        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('player_attack', { position: { x: mount.x, y: mount.y } });
        }
    }

    function executeKick(mount, ability) {
        // Find enemies behind mount
        const backAngle = mount.direction + Math.PI;

        for (const zombie of zombies) {
            const dx = zombie.x - mount.x;
            const dy = zombie.y - mount.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > ability.range) continue;

            // Check if behind
            const angle = Math.atan2(dy, dx);
            const angleDiff = Math.abs(((angle - backAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);

            if (angleDiff < Math.PI / 3) {
                // Hit!
                zombie.health -= ability.damage;

                // Knockback
                zombie.x += Math.cos(backAngle) * ability.knockback;
                zombie.y += Math.sin(backAngle) * ability.knockback;

                if (typeof addDamageNumber === 'function') {
                    addDamageNumber(zombie.x, zombie.y - 0.5, ability.damage, '#ffaa00');
                }
                if (typeof spawnParticles === 'function') {
                    spawnParticles(zombie.x, zombie.y, '#ff6644', 6);
                }
            }
        }
    }

    function executeCharge(mount, ability) {
        // Add charge effect
        mount.activeEffects.push({
            id: 'charge',
            speedMultiplier: ability.effects.speedMultiplier,
            damageMultiplier: ability.effects.damageMultiplier,
            duration: ability.duration,
            remaining: ability.duration
        });
    }

    function executeTrample(mount, ability) {
        // AoE damage around mount
        for (const zombie of zombies) {
            const dist = Math.sqrt((zombie.x - mount.x) ** 2 + (zombie.y - mount.y) ** 2);

            if (dist <= ability.radius) {
                zombie.health -= ability.damage;

                // Stun
                if (!zombie.statusEffects) zombie.statusEffects = {};
                zombie.statusEffects.stun = {
                    duration: ability.stunDuration,
                    remaining: ability.stunDuration
                };
                zombie.stunned = true;

                if (typeof addDamageNumber === 'function') {
                    addDamageNumber(zombie.x, zombie.y - 0.5, ability.damage, '#ffaa00');
                }
            }
        }

        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * ability.radius;
                spawnParticles(
                    mount.x + Math.cos(angle) * dist,
                    mount.y + Math.sin(angle) * dist,
                    '#888888',
                    4
                );
            }
        }

        if (typeof camera !== 'undefined') {
            camera.shake = 8;
        }
    }

    function executePounce(mount, ability) {
        // Jump to mouse/target position
        // For simplicity, jump in facing direction
        const distance = Math.min(ability.range, 5);
        const targetX = mount.x + Math.cos(mount.direction) * distance;
        const targetY = mount.y + Math.sin(mount.direction) * distance;

        // Instant teleport with invulnerability
        mount.activeEffects.push({
            id: 'pounce_invuln',
            invulnerable: true,
            duration: 0.3,
            remaining: 0.3
        });

        // Animate to position
        mount.x = targetX;
        mount.y = targetY;
        player.x = mount.x;
        player.y = mount.y;

        // Damage at landing position
        for (const zombie of zombies) {
            const dist = Math.sqrt((zombie.x - mount.x) ** 2 + (zombie.y - mount.y) ** 2);
            if (dist <= 1.5) {
                zombie.health -= ability.damage;
                if (typeof addDamageNumber === 'function') {
                    addDamageNumber(zombie.x, zombie.y - 0.5, ability.damage, '#ffaa00');
                }
            }
        }

        if (typeof spawnParticles === 'function') {
            spawnParticles(mount.x, mount.y, '#ffdd00', 15);
        }
    }

    function executeAreaBuff(mount, ability) {
        // Apply buffs to allies in range
        const allies = [player, ...survivors];

        for (const ally of allies) {
            const dist = Math.sqrt((ally.x - mount.x) ** 2 + (ally.y - mount.y) ** 2);
            if (dist <= ability.radius) {
                if (!ally.activeBuffs) ally.activeBuffs = [];

                if (ability.effects.allyDamageBoost) {
                    ally.activeBuffs.push({
                        id: ability.id + '_damage',
                        damageBoost: ability.effects.allyDamageBoost,
                        duration: ability.duration,
                        remaining: ability.duration
                    });
                }
                if (ability.effects.allySpeedBoost) {
                    ally.activeBuffs.push({
                        id: ability.id + '_speed',
                        speedBoost: ability.effects.allySpeedBoost,
                        duration: ability.duration,
                        remaining: ability.duration
                    });
                }
            }
        }

        // Debuff enemies (for howl)
        if (ability.effects.enemyDamageReduction) {
            for (const zombie of zombies) {
                const dist = Math.sqrt((zombie.x - mount.x) ** 2 + (zombie.y - mount.y) ** 2);
                if (dist <= ability.radius) {
                    if (!zombie.statusEffects) zombie.statusEffects = {};
                    zombie.statusEffects.fear = {
                        damageReduction: ability.effects.enemyDamageReduction,
                        duration: ability.duration,
                        remaining: ability.duration
                    };
                }
            }
        }

        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 15; i++) {
                const angle = Math.random() * Math.PI * 2;
                spawnParticles(
                    mount.x + Math.cos(angle) * 2,
                    mount.y + Math.sin(angle) * 2,
                    '#88ff88',
                    4
                );
            }
        }
    }

    function executeMeleeAttack(mount, ability) {
        const hits = ability.hits || 1;
        const damage = ability.damage + (mount.type.stats.attackDamage || 0);

        for (let hit = 0; hit < hits; hit++) {
            setTimeout(() => {
                // Find enemies in range and arc
                for (const zombie of zombies) {
                    const dx = zombie.x - mount.x;
                    const dy = zombie.y - mount.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist > ability.range) continue;

                    // Check arc if specified
                    if (ability.arc) {
                        const angle = Math.atan2(dy, dx);
                        const angleDiff = Math.abs(((angle - mount.direction + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
                        if (angleDiff > (ability.arc / 2) * Math.PI / 180) continue;
                    }

                    // Apply damage
                    let finalDamage = damage;
                    if (ability.effects?.armorPenetration) {
                        finalDamage *= (1 + ability.effects.armorPenetration);
                    }

                    zombie.health -= finalDamage;

                    // Apply bleed
                    if (ability.effects?.bleed) {
                        if (!zombie.statusEffects) zombie.statusEffects = {};
                        zombie.statusEffects.bleed = {
                            damage: ability.effects.bleed.damage,
                            duration: ability.effects.bleed.duration,
                            remaining: ability.effects.bleed.duration
                        };
                    }

                    if (typeof addDamageNumber === 'function') {
                        addDamageNumber(zombie.x, zombie.y - 0.5, finalDamage, '#ff6644');
                    }
                    if (typeof spawnParticles === 'function') {
                        spawnParticles(zombie.x, zombie.y, '#ff4444', 6);
                    }
                }
            }, hit * 150);
        }
    }

    function executeScreech(mount, ability) {
        // Stun all enemies in radius
        for (const zombie of zombies) {
            const dist = Math.sqrt((zombie.x - mount.x) ** 2 + (zombie.y - mount.y) ** 2);
            if (dist <= ability.radius) {
                if (!zombie.statusEffects) zombie.statusEffects = {};
                zombie.statusEffects.stun = {
                    duration: ability.stunDuration,
                    remaining: ability.stunDuration
                };
                zombie.stunned = true;
            }
        }

        if (typeof camera !== 'undefined') {
            camera.shake = 5;
        }
    }

    function executeFortify(mount, ability) {
        mount.activeEffects.push({
            id: 'fortify',
            armor: ability.effects.armor,
            speed: ability.effects.speed,
            duration: ability.duration,
            remaining: ability.duration
        });
    }

    function updateWheelAttack(mount, dt) {
        const speed = Math.sqrt(mount.velocity.x ** 2 + mount.velocity.y ** 2);
        if (speed < 3) return; // Only damage when moving fast

        const wheelDamage = mount.type.stats.wheelDamage || 0;
        if (wheelDamage === 0) return;

        for (const zombie of zombies) {
            const dist = Math.sqrt((zombie.x - mount.x) ** 2 + (zombie.y - mount.y) ** 2);
            if (dist <= 1.5) {
                // Check if we haven't hit this zombie recently
                if (!zombie.wheelHitCooldown || zombie.wheelHitCooldown <= 0) {
                    zombie.health -= wheelDamage;
                    zombie.wheelHitCooldown = 0.5;

                    if (typeof addDamageNumber === 'function') {
                        addDamageNumber(zombie.x, zombie.y - 0.5, wheelDamage, '#ffaa00');
                    }
                    if (typeof spawnParticles === 'function') {
                        spawnParticles(zombie.x, zombie.y, '#ff4444', 4);
                    }
                }
            }
        }
    }

    // ============= MAIN UPDATE =============
    function update(dt) {
        // Update taming
        updateTaming(dt);

        // Update mounted movement
        if (isMounted) {
            updateMountedMovement(dt);
        }

        // Update all non-mounted mounts
        updateUnmountedMounts(dt);

        // Update ability cooldowns
        if (currentMount) {
            for (const abilityId of Object.keys(currentMount.abilityCooldowns)) {
                if (currentMount.abilityCooldowns[abilityId] > 0) {
                    currentMount.abilityCooldowns[abilityId] -= dt;
                }
            }

            // Update active effects
            for (let i = currentMount.activeEffects.length - 1; i >= 0; i--) {
                const effect = currentMount.activeEffects[i];
                effect.remaining -= dt;
                if (effect.remaining <= 0) {
                    currentMount.activeEffects.splice(i, 1);
                }
            }
        }

        // Update zombie wheel hit cooldowns
        for (const zombie of zombies) {
            if (zombie.wheelHitCooldown) {
                zombie.wheelHitCooldown -= dt;
            }
        }
    }

    // ============= FEEDING & LOYALTY =============
    function feedMount(mount, foodId) {
        if (!mount || !mount.isTamed) return false;

        // Check if it's preferred food
        const isPreferred = mount.type.preferredFood.includes(foodId);
        const loyaltyGain = isPreferred ? 15 : 5;

        // Consume food from inventory
        if (typeof EquipmentSystem !== 'undefined') {
            const inventory = EquipmentSystem.getInventory();
            const itemIndex = inventory.findIndex(i => i && i.id === foodId && i.quantity > 0);
            if (itemIndex !== -1) {
                inventory[itemIndex].quantity--;
                if (inventory[itemIndex].quantity <= 0) {
                    inventory[itemIndex] = null;
                }
            } else {
                return false;
            }
        } else if (foodId === 'food' && resources.food >= 1) {
            resources.food--;
        } else {
            return false;
        }

        mount.loyalty = Math.min(CONFIG.MAX_LOYALTY, mount.loyalty + loyaltyGain);

        // Also heal if injured
        if (mount.health < mount.maxHealth) {
            mount.health = Math.min(mount.maxHealth, mount.health + 10);
        }

        if (typeof spawnParticles === 'function') {
            spawnParticles(mount.x, mount.y, '#ff8888', 8);
        }

        if (typeof showNotification === 'function') {
            showNotification(`<i class="material-icons">favorite</i> ${mount.name} is happy! (+${loyaltyGain} loyalty)`, []);
        }

        return true;
    }

    // ============= CRAFTING VEHICLES =============
    function craftVehicle(vehicleId) {
        const vehicleType = MOUNT_TYPES[vehicleId];
        if (!vehicleType || !vehicleType.craftable) return false;

        // Check resources
        for (const [resource, amount] of Object.entries(vehicleType.craftCost)) {
            if ((resources[resource] || 0) < amount) {
                if (typeof showNotification === 'function') {
                    showNotification('<i class="material-icons">warning</i> Not enough resources!', []);
                }
                return false;
            }
        }

        // Deduct resources
        for (const [resource, amount] of Object.entries(vehicleType.craftCost)) {
            resources[resource] -= amount;
        }

        // Create vehicle at player position
        const vehicle = createMountInstance(vehicleId, player.x + 1, player.y, false);
        if (vehicle) {
            ownedMounts.push(vehicle);

            if (typeof showNotification === 'function') {
                showNotification(`<i class="material-icons">build</i> ${vehicleType.name} crafted!`, []);
            }
            if (typeof AudioSystem !== 'undefined') {
                AudioSystem.play('build_place');
            }

            return true;
        }

        return false;
    }

    // ============= RENDERING =============
    function draw(ctx, camX, camY) {
        const s = TILE_SIZE * SCALE;

        // Draw wild mounts
        for (const mount of wildMounts) {
            drawMount(ctx, mount, camX, camY, s, false);
        }

        // Draw owned mounts (except current if mounted)
        for (const mount of ownedMounts) {
            if (isMounted && mount === currentMount) continue;
            drawMount(ctx, mount, camX, camY, s, true);
        }

        // Draw taming progress
        if (tamingTarget) {
            drawTamingProgress(ctx, camX, camY, s);
        }
    }

    function drawMount(ctx, mount, camX, camY, s, isTamed) {
        const sx = (mount.x - 0.5) * s - camX;
        const sy = (mount.y - 0.5) * s - camY;

        // Skip if off-screen
        if (sx < -s * 2 || sx > ctx.canvas.width || sy < -s * 2 || sy > ctx.canvas.height) {
            return;
        }

        ctx.save();

        // Draw shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(sx + s / 2, sy + s * 0.9, s * 0.4, s * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw mount icon
        const iconSize = mount.type.tier >= 2 ? s * 0.9 : s * 0.7;
        ctx.font = `${iconSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(mount.type.icon, sx + s / 2, sy + s / 2);

        // Draw health bar if injured
        if (mount.health < mount.maxHealth) {
            const barWidth = s * 0.8;
            const barHeight = 4;
            const barX = sx + (s - barWidth) / 2;
            const barY = sy - 8;

            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            const healthPercent = mount.health / mount.maxHealth;
            ctx.fillStyle = healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffff44' : '#ff4444';
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        }

        // Draw tamed indicator
        if (isTamed) {
            ctx.fillStyle = '#44ff44';
            ctx.beginPath();
            ctx.arc(sx + s - 8, sy + 8, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw name for owned mounts
        if (isTamed) {
            ctx.font = '10px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeText(mount.name, sx + s / 2, sy + s + 10);
            ctx.fillText(mount.name, sx + s / 2, sy + s + 10);
        }

        ctx.restore();
    }

    function drawTamingProgress(ctx, camX, camY, s) {
        const mount = tamingTarget;
        const sx = (mount.x - 0.5) * s - camX;
        const sy = (mount.y - 0.5) * s - camY;

        // Progress bar
        const barWidth = s;
        const barHeight = 8;
        const barX = sx;
        const barY = sy - 20;

        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(barX, barY, barWidth * tamingProgress, barHeight);

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Text
        ctx.font = '10px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('Taming...', sx + s / 2, barY - 5);
    }

    // ============= SERIALIZATION =============
    function getMountState() {
        return {
            ownedMounts: ownedMounts.map(m => ({
                typeId: m.typeId,
                name: m.name,
                x: m.x,
                y: m.y,
                health: m.health,
                stamina: m.stamina,
                loyalty: m.loyalty,
                level: m.level,
                exp: m.exp,
                upgrades: m.upgrades,
                isFollowing: m.isFollowing
            })),
            currentMountId: currentMount ? currentMount.id : null,
            isMounted: isMounted
        };
    }

    function setMountState(data) {
        if (!data) return;

        ownedMounts = [];
        wildMounts = [];
        currentMount = null;
        isMounted = false;

        if (data.ownedMounts) {
            for (const mountData of data.ownedMounts) {
                const mount = createMountInstance(mountData.typeId, mountData.x, mountData.y, false);
                if (mount) {
                    mount.name = mountData.name;
                    mount.health = mountData.health;
                    mount.stamina = mountData.stamina;
                    mount.loyalty = mountData.loyalty;
                    mount.level = mountData.level || 1;
                    mount.exp = mountData.exp || 0;
                    mount.isFollowing = mountData.isFollowing;
                    ownedMounts.push(mount);

                    if (data.isMounted && mount.id === data.currentMountId) {
                        currentMount = mount;
                        isMounted = true;
                    }
                }
            }
        }
    }

    // ============= PUBLIC API =============
    return {
        // Core functions
        update,
        draw,

        // Mount management
        spawnWildMount,
        spawnRandomWildMount,
        startTaming,
        cancelTaming,
        mountUp,
        dismount,
        feedMount,

        // Vehicles
        craftVehicle,

        // Abilities
        useAbility,
        toggleSprint: () => { isSprinting = !isSprinting; return isSprinting; },

        // Queries
        isMounted: () => isMounted,
        getCurrentMount: () => currentMount,
        getOwnedMounts: () => ownedMounts,
        getWildMounts: () => wildMounts,
        getTamingProgress: () => tamingTarget ? tamingProgress : 0,
        isSprinting: () => isSprinting,

        // Interaction
        interruptTaming: () => { tamingInterrupted = true; },

        // Serialization
        getMountState,
        setMountState,

        // Constants
        MOUNT_TYPES,
        ABILITIES,
        CONFIG
    };
})();

// Export globally
window.MountSystem = MountSystem;
