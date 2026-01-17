// ============================================
// PET SYSTEM - Companions, Mounts & Wildlife
// ============================================
// Complete pet system with taming, AI, equipment,
// breeding, and special abilities

const PetSystem = (function () {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        TAMING_MAX_PATIENCE: 100,
        TAMING_FOOD_BONUS: 15,
        TAMING_SUCCESS_BONUS: 25,
        TAMING_PATIENCE_DECAY: 2,
        TAMING_APPROACH_SPEED: 0.5,
        TAMING_MIN_DISTANCE: 2,
        TAMING_MAX_DISTANCE: 8,

        TRUST_DECAY_RATE: 0.5,
        TRUST_FEED_BONUS: 10,
        TRUST_PLAY_BONUS: 5,
        TRUST_MAX: 100,

        HAPPINESS_DECAY: 0.3,
        HAPPINESS_FEED_BONUS: 20,
        HAPPINESS_PLAY_BONUS: 15,
        HAPPINESS_MAX: 100,

        HUNGER_MAX: 100,
        HUNGER_DECAY_RATE: 2,
        HUNGER_CRITICAL: 20,

        LOYALTY_DECAY: 0.2,
        LOYALTY_MAX: 100,

        XP_PER_LEVEL: 100,
        MAX_LEVEL: 20,

        FOLLOW_DISTANCE_MIN: 2,
        FOLLOW_DISTANCE_MAX: 5,

        ATTACK_RANGE: 4,
        GATHER_RANGE: 3,

        BREEDING_MIN_AGE: 5,
        BREEDING_COOLDOWN: 72,
        BREEDING_TRUST_THRESHOLD: 70,
        BREEDING_HAPPINESS_THRESHOLD: 60,

        // Wildlife spawning
        SPAWN_INTERVAL: 30,             // Try to spawn every 30 seconds
        SPAWN_CHANCE: 0.7,              // 70% chance to spawn on each interval
        MAX_WILD_ANIMALS: 10,           // Maximum wild animals in current area
        DESPAWN_DISTANCE: 25            // Distance at which animals despawn
    };

    // ============= PET DEFINITIONS =============
    const PET_TYPES = {
        WOLF: {
            id: 'wolf',
            name: 'Wolf',
            type: 'combat',
            description: 'Loyal combat companion that hunts with you',
            icon: '🐺',
            baseStats: {
                health: 100,
                damage: 15,
                speed: 6,
                defense: 5
            },
            size: 0.8,
            color: '#6a6a6a',
            foodPreferences: ['meat', 'fish'],
            abilities: ['pack_howl', 'bite', 'fear_aura'],
            canMount: false,
            canGather: false,
            canBreed: true,
            rarity: 'common'
        },

        BEAR: {
            id: 'bear',
            name: 'Bear',
            type: 'combat',
            description: 'Powerful tank pet that absorbs damage',
            icon: '🐻',
            baseStats: {
                health: 250,
                damage: 25,
                speed: 3.5,
                defense: 20
            },
            size: 1.5,
            color: '#4a3520',
            foodPreferences: ['meat', 'fish', 'honey'],
            abilities: ['maul', 'roar', 'thick_fur'],
            canMount: false,
            canGather: true,
            canBreed: true,
            rarity: 'uncommon'
        },

        TIGER: {
            id: 'tiger',
            name: 'Tiger',
            type: 'combat',
            description: 'Fast and deadly predator',
            icon: '🐅',
            baseStats: {
                health: 120,
                damage: 30,
                speed: 8,
                defense: 3
            },
            size: 1.1,
            color: '#d4881a',
            foodPreferences: ['meat'],
            abilities: ['pounce', 'claw_strike', 'stealth'],
            canMount: false,
            canGather: false,
            canBreed: true,
            rarity: 'rare'
        },

        HAWK: {
            id: 'hawk',
            name: 'Hawk',
            type: 'scout',
            description: 'Reveals enemies and marks them',
            icon: '🦅',
            baseStats: {
                health: 50,
                damage: 5,
                speed: 10,
                defense: 1
            },
            size: 0.4,
            color: '#8b6914',
            foodPreferences: ['seeds', 'meat'],
            abilities: ['scout_vision', 'mark_enemy', 'aerial_recon'],
            canMount: false,
            canGather: true,
            canBreed: true,
            rarity: 'uncommon'
        },

        FOX: {
            id: 'fox',
            name: 'Fox',
            type: 'scout',
            description: 'Detects hidden treasures and resources',
            icon: '🦊',
            baseStats: {
                health: 60,
                damage: 8,
                speed: 7,
                defense: 2
            },
            size: 0.5,
            color: '#d4642a',
            foodPreferences: ['meat', 'eggs', 'berries'],
            abilities: ['treasure_sense', 'dig', 'evasion'],
            canMount: false,
            canGather: true,
            canBreed: true,
            rarity: 'common'
        },

        HORSE: {
            id: 'horse',
            name: 'Horse',
            type: 'mount',
            description: 'Fast mount for travel',
            icon: '🐴',
            baseStats: {
                health: 150,
                damage: 10,
                speed: 12,
                defense: 8
            },
            size: 1.3,
            color: '#8b4513',
            foodPreferences: ['grass', 'hay', 'apples'],
            abilities: ['gallop', 'sprint', 'endurance'],
            canMount: true,
            canGather: false,
            canBreed: true,
            rarity: 'common'
        },

        CAMEL: {
            id: 'camel',
            name: 'Camel',
            type: 'mount',
            description: 'Desert mount with large inventory',
            icon: '🐪',
            baseStats: {
                health: 180,
                damage: 12,
                speed: 9,
                defense: 10
            },
            size: 1.4,
            color: '#c4a35a',
            foodPreferences: ['cactus', 'dates', 'water'],
            abilities: ['desert_adaptation', 'caravan', 'water_storage'],
            canMount: true,
            canGather: false,
            canBreed: true,
            rarity: 'uncommon'
        },

        BOAR: {
            id: 'boar',
            name: 'Boar',
            type: 'resource',
            description: 'Digs up roots and truffles',
            icon: '🐗',
            baseStats: {
                health: 80,
                damage: 12,
                speed: 5,
                defense: 4
            },
            size: 0.7,
            color: '#5a4030',
            foodPreferences: ['roots', 'mushrooms', 'truffles'],
            abilities: ['forage', 'dig', 'tusk_charge'],
            canMount: false,
            canGather: true,
            canBreed: true,
            rarity: 'common'
        },

        BEAVER: {
            id: 'beaver',
            name: 'Beaver',
            type: 'resource',
            description: 'Chops wood and builds',
            icon: '🦫',
            baseStats: {
                health: 70,
                damage: 8,
                speed: 4,
                defense: 6
            },
            size: 0.6,
            color: '#4a3020',
            foodPreferences: ['wood', 'bark', 'leaves'],
            abilities: ['woodchop', 'dam_builder', 'aquatic'],
            canMount: false,
            canGather: true,
            canBreed: true,
            rarity: 'uncommon'
        },

        WOLF_ALPHA: {
            id: 'wolf_alpha',
            name: 'Alpha Wolf',
            type: 'combat',
            description: 'Legendary pack leader',
            icon: '🐺✨',
            baseStats: {
                health: 200,
                damage: 35,
                speed: 7,
                defense: 15
            },
            size: 1.0,
            color: '#2a2a2a',
            foodPreferences: ['meat', 'fish'],
            abilities: ['pack_leader', 'summon_wolves', 'howl_of_power'],
            canMount: false,
            canGather: false,
            canBreed: false,
            rarity: 'legendary'
        }
    };

    // ============= PET EQUIPMENT =============
    const PET_EQUIPMENT = {
        COLLAR: {
            id: 'collar',
            name: 'Collar',
            slot: 'collar',
            icon: '📿',
            stats: { healthBonus: 20, defenseBonus: 3 },
            rarity: 'common',
            cost: { leather: 5, iron: 2 }
        },

        HEAVY_COLLAR: {
            id: 'heavy_collar',
            name: 'Heavy Collar',
            slot: 'collar',
            icon: '⛓️',
            stats: { healthBonus: 40, defenseBonus: 8 },
            rarity: 'uncommon',
            cost: { iron: 8, steel: 3 }
        },

        SPIKED_COLLAR: {
            id: 'spiked_collar',
            name: 'Spiked Collar',
            slot: 'collar',
            icon: '💠',
            stats: { healthBonus: 30, defenseBonus: 5, damageBonus: 5 },
            rarity: 'rare',
            cost: { steel: 5, leather: 10 }
        },

        SADDLE_BASIC: {
            id: 'saddle_basic',
            name: 'Basic Saddle',
            slot: 'saddle',
            icon: '🪑',
            stats: { speedBonus: 10, carryingBonus: 20 },
            rarity: 'common',
            cost: { leather: 15, wood: 10 }
        },

        SADDLE_MOUNTED: {
            id: 'saddle_mounted',
            name: 'Mounted Saddle',
            slot: 'saddle',
            icon: '🏇',
            stats: { speedBonus: 25, carryingBonus: 40, defenseBonus: 10 },
            rarity: 'rare',
            cost: { leather: 30, steel: 10, obsidian: 5 }
        },

        ARMOR_LEATHER: {
            id: 'armor_leather',
            name: 'Leather Armor',
            slot: 'armor',
            icon: '🥋',
            stats: { defenseBonus: 15, healthBonus: 30 },
            rarity: 'common',
            cost: { leather: 25 }
        },

        ARMOR_STEEL: {
            id: 'armor_steel',
            name: 'Steel Armor',
            slot: 'armor',
            icon: '🛡️',
            stats: { defenseBonus: 30, healthBonus: 50 },
            rarity: 'rare',
            cost: { steel: 20, leather: 10 }
        },

        ARMOR_MITHRIL: {
            id: 'armor_mithril',
            name: 'Mithril Armor',
            slot: 'armor',
            icon: '💎',
            stats: { defenseBonus: 50, healthBonus: 100, speedBonus: 10 },
            rarity: 'legendary',
            cost: { mithril: 15, leather: 30 }
        }
    };

    // ============= ABILITY DEFINITIONS =============
    const PET_ABILITIES = {
        pack_howl: {
            id: 'pack_howl',
            name: 'Pack Howl',
            type: 'active',
            cooldown: 30,
            description: 'Increase nearby allies damage by 25%',
            effect: () => {
                emitToNearbyPets('howl_buff', 10);
                return true;
            }
        },
        bite: {
            id: 'bite',
            name: 'Bite',
            type: 'passive',
            trigger: 'on_attack',
            description: 'Basic attack with chance to bleed',
            effect: (target) => {
                if (Math.random() < 0.3) {
                    target.bleedDamage = (target.bleedDamage || 0) + 5;
                }
                return true;
            }
        },
        fear_aura: {
            id: 'fear_aura',
            name: 'Fear Aura',
            type: 'passive',
            trigger: 'on_spawn',
            description: 'Nearby enemies have reduced damage',
            effect: () => {
                emitToNearbyEnemies('fear_effect', 5);
            }
        },
        maul: {
            id: 'maul',
            name: 'Maul',
            type: 'active',
            cooldown: 15,
            description: 'Heavy attack dealing 200% damage',
            effect: (target) => {
                return 2.0;
            }
        },
        roar: {
            id: 'roar',
            name: 'Roar',
            type: 'active',
            cooldown: 45,
            description: 'Stun enemies for 2 seconds',
            effect: (target) => {
                target.stunned = (target.stunned || 0) + 2;
                return true;
            }
        },
        thick_fur: {
            id: 'thick_fur',
            name: 'Thick Fur',
            type: 'passive',
            trigger: 'always',
            description: '25% damage reduction',
            effect: () => {
                return 0.75;
            }
        },
        pounce: {
            id: 'pounce',
            name: 'Pounce',
            type: 'active',
            cooldown: 10,
            description: 'Leap at target dealing bonus damage',
            effect: (target) => {
                const dist = getPetDistanceTo(target);
                if (dist > 3 && dist < 15) {
                    return 1.5;
                }
                return 1.0;
            }
        },
        claw_strike: {
            id: 'claw_strike',
            name: 'Claw Strike',
            type: 'active',
            cooldown: 8,
            description: 'Quick attack with attack speed bonus',
            effect: () => {
                return 1.2;
            }
        },
        stealth: {
            id: 'stealth',
            name: 'Stealth',
            type: 'active',
            cooldown: 60,
            description: 'Become invisible for 10 seconds',
            effect: () => {
                return true;
            }
        },
        scout_vision: {
            id: 'scout_vision',
            name: 'Scout Vision',
            type: 'passive',
            trigger: 'always',
            description: 'Increases player radar range by 50%',
            effect: () => {
                return true;
            }
        },
        mark_enemy: {
            id: 'mark_enemy',
            name: 'Mark Enemy',
            type: 'active',
            cooldown: 20,
            description: 'Mark enemy taking 10% more damage',
            effect: (target) => {
                target.marked = (target.marked || 0) + 10;
                return true;
            }
        },
        gallop: {
            id: 'gallop',
            name: 'Gallop',
            type: 'active',
            cooldown: 30,
            description: 'Double speed for 5 seconds',
            effect: () => {
                return true;
            }
        },
        sprint: {
            id: 'sprint',
            name: 'Sprint',
            type: 'active',
            cooldown: 45,
            description: 'Triple speed for 3 seconds',
            effect: () => {
                return true;
            }
        },
        forage: {
            id: 'forage',
            name: 'Forage',
            type: 'active',
            cooldown: 60,
            description: 'Gather nearby resources automatically',
            effect: () => {
                gatherNearbyResources();
                return true;
            }
        },
        dig: {
            id: 'dig',
            name: 'Dig',
            type: 'active',
            cooldown: 45,
            description: 'Dig up buried items and truffles',
            effect: () => {
                digForItems();
                return true;
            }
        },
        woodchop: {
            id: 'woodchop',
            name: 'Woodchop',
            type: 'active',
            cooldown: 30,
            description: 'Chops trees faster and yields more wood',
            effect: () => {
                return 1.5;
            }
        },
        aquatic: {
            id: 'aquatic',
            name: 'Aquatic',
            type: 'passive',
            trigger: 'always',
            description: 'Can swim and gather water resources',
            effect: () => {
                return true;
            }
        }
    };

    // ============= STATE =============
    let pets = [];
    let wildAnimals = [];
    let tamingSession = null;
    let playerMount = null;
    let nextPetId = 1;

    let spawnTimer = 0;                 // Current spawn cooldown timer
    let nextAnimalId = 1;

    // ============= HELPER FUNCTIONS =============
    function getPetDistanceTo(entity) {
        if (!entity || !entity.x || !entity.y) return Infinity;
        return Math.sqrt((currentPet.x - entity.x) ** 2 + (currentPet.y - entity.y) ** 2);
    }

    function emitToNearbyPets(effectName, radius) {
        const effect = PET_ABILITIES[effectName];
        if (!effect) return;

        for (const pet of pets) {
            const dist = Math.sqrt((pet.x - currentPet.x) ** 2 + (pet.y - currentPet.y) ** 2);
            if (dist < radius) {
                effect.effect();
            }
        }
    }

    function emitToNearbyEnemies(effectName, radius) {
        if (typeof zombies === 'undefined') return;

        for (const zombie of zombies) {
            const dist = Math.sqrt((zombie.x - currentPet.x) ** 2 + (zombie.y - currentPet.y) ** 2);
            if (dist < radius) {
                zombie[effectName] = (zombie[effectName] || 0) + 5;
            }
        }
    }

    function gatherNearbyResources() {
        if (typeof resources === 'undefined') return;

        const gatherTypes = ['wood', 'stone', 'iron', 'food'];
        for (const type of gatherTypes) {
            if (Math.random() < 0.3) {
                const amount = Math.floor(Math.random() * 3) + 1;
                resources[type] = (resources[type] || 0) + amount;
            }
        }
    }

    function digForItems() {
        const buriedItems = ['truffle', 'rare_metal', 'ancient_coin', 'gem'];
        const foundItem = buriedItems[Math.floor(Math.random() * buriedItems.length)];
        const amount = Math.floor(Math.random() * 3) + 1;

        if (typeof resources !== 'undefined') {
            resources[foundItem] = (resources[foundItem] || 0) + amount;
        }

        if (typeof showNotification === 'function') {
            showNotification(`Your pet dug up ${amount}x ${foundItem}!`, []);
        }
    }

    // ============= PET CLASS =============
    class Pet {
        constructor(typeId, x, y, isWild = false) {
            const type = PET_TYPES[typeId] || PET_TYPES[typeId?.toUpperCase()];
            if (!type) {
                console.error(`Invalid pet type: ${typeId}`);
                this.isValid = false;
                return;
            }

            this.isValid = true;
            this.id = nextPetId++;
            this.typeId = typeId;
            this.type = type;
            this.x = x !== undefined ? x : (typeof player !== 'undefined' ? player.x : 0);
            this.y = y !== undefined ? y : (typeof player !== 'undefined' ? player.y : 0);
            this.isWild = isWild;
            this.isTamed = !isWild;

            // Stats
            this.health = type.baseStats.health;
            this.maxHealth = type.baseStats.health;
            this.damage = type.baseStats.damage;
            this.speed = type.baseStats.speed;
            this.defense = type.baseStats.defense;
            this.size = type.size;

            // State
            this.level = 1;
            this.xp = 0;
            this.xpToLevel = CONFIG.XP_PER_LEVEL;
            this.state = 'follow';
            this.target = null;
            this.attackCooldown = 0;

            // Needs
            this.hunger = CONFIG.HUNGER_MAX;
            this.happiness = 70;
            this.trust = isWild ? 0 : 50;
            this.loyalty = 50;

            // Equipment
            this.equipment = {
                collar: null,
                saddle: null,
                armor: null
            };

            // Abilities
            this.abilities = [...type.abilities];
            this.abilityCooldowns = {};

            // AI State
            this.aiState = isWild ? 'wander' : 'follow';
            this.wanderTarget = null;
            this.wanderTimer = 0;
            this.lastAttackTime = 0;

            // Breeding
            this.breedingCooldown = 0;
            this.offspringCount = 0;
            this.geneticTraits = this.generateGenetics();

            // Visual
            this.frame = 0;
            this.animTimer = 0;
            this.direction = 1;

            // Effects
            this.statusEffects = [];
            this.buffs = [];
        }

        generateGenetics() {
            return {
                strength: 0.5 + Math.random() * 0.5,
                endurance: 0.5 + Math.random() * 0.5,
                intelligence: 0.5 + Math.random() * 0.5,
                aggression: 0.3 + Math.random() * 0.7,
                sociability: 0.3 + Math.random() * 0.7
            };
        }

        getStat(statName) {
            let value = this.type.baseStats[statName] || 0;

            // Add equipment bonuses
            for (const slot of Object.values(this.equipment)) {
                if (slot && slot.stats) {
                    const bonusStat = statName + 'Bonus';
                    if (slot.stats[bonusStat]) {
                        value += slot.stats[bonusStat];
                    }
                }
            }

            // Add level bonus
            const levelBonus = (this.level - 1) * 0.05;
            value *= (1 + levelBonus);

            // Apply buffs
            for (const buff of this.buffs) {
                if (buff.stats && buff.stats[statName]) {
                    value *= (1 + buff.stats[statName]);
                }
            }

            return Math.max(0, value);
        }

        getMaxHealth() {
            return this.getStat('health');
        }

        getDamage() {
            return this.getStat('damage');
        }

        getSpeed() {
            let speed = this.getStat('speed');

            // Mount penalty if carrying player
            if (this.type.canMount && playerMount === this) {
                speed *= 0.7;
            }

            return speed;
        }

        getDefense() {
            return this.getStat('defense');
        }

        takeDamage(amount) {
            const defense = this.getDefense();
            const actualDamage = Math.max(1, amount * (100 / (100 + defense)));

            this.health -= actualDamage;

            if (typeof addDamageNumber === 'function') {
                addDamageNumber(this.x, this.y - 0.5, Math.floor(actualDamage), '#ff0000');
            }

            if (this.health <= 0) {
                this.die();
            }

            return actualDamage;
        }

        heal(amount) {
            this.health = Math.min(this.getMaxHealth(), this.health + amount);
        }

        feed(foodType) {
            const isFavorite = this.type.foodPreferences.includes(foodType);
            const hungerRestore = isFavorite ? 40 : 20;
            const happinessBonus = isFavorite ? 15 : 5;
            const trustBonus = isFavorite ? 8 : 3;

            this.hunger = Math.min(CONFIG.HUNGER_MAX, this.hunger + hungerRestore);
            this.happiness = Math.min(CONFIG.HAPPINESS_MAX, this.happiness + happinessBonus);
            this.trust = Math.min(CONFIG.TRUST_MAX, this.trust + trustBonus);

            if (typeof spawnParticles === 'function') {
                spawnParticles(this.x, this.y, '#00ff00', 5);
            }

            return isFavorite;
        }

        gainXP(amount) {
            this.xp += amount;

            while (this.xp >= this.xpToLevel && this.level < CONFIG.MAX_LEVEL) {
                this.levelUp();
            }
        }

        levelUp() {
            this.xp -= this.xpToLevel;
            this.level++;
            this.xpToLevel = Math.floor(CONFIG.XP_PER_LEVEL * (1 + (this.level - 1) * 0.2));

            // Stat increases
            this.maxHealth += 20;
            this.health = this.maxHealth;
            this.damage += 2;
            this.defense += 1;

            // Unlock random ability if available
            if (this.level % 5 === 0 && this.abilities.length < 6) {
                this.unlockRandomAbility();
            }

            if (typeof showNotification === 'function') {
                showNotification(`${this.type.name} grew to level ${this.level}!`, []);
            }

            EventBus.emit('pet:levelup', { pet: this, newLevel: this.level });
        }

        unlockRandomAbility() {
            const allAbilities = Object.keys(PET_ABILITIES);
            const availableAbilities = allAbilities.filter(
                a => !this.abilities.includes(a) &&
                    PET_TYPES[this.typeId].abilities.includes(a.split('_')[0]) === false
            );

            if (availableAbilities.length > 0) {
                const newAbility = availableAbilities[Math.floor(Math.random() * availableAbilities.length)];
                this.abilities.push(newAbility);
            }
        }

        equip(itemId) {
            const item = PET_EQUIPMENT[itemId];
            if (!item) return false;

            const currentSlot = item.slot;
            const oldItem = this.equipment[currentSlot];

            if (oldItem) {
                this.unequip(currentSlot);
            }

            this.equipment[currentSlot] = item;
            EventBus.emit('pet:equipped', { pet: this, item: item, slot: currentSlot });
            return true;
        }

        unequip(slot) {
            if (!this.equipment[slot]) return false;

            const item = this.equipment[slot];
            this.equipment[slot] = null;
            EventBus.emit('pet:unequipped', { pet: this, item: item, slot: slot });
            return true;
        }

        die() {
            EventBus.emit('pet:death', { pet: this });

            const idx = pets.indexOf(this);
            if (idx !== -1) {
                pets.splice(idx, 1);
            }

            if (playerMount === this) {
                playerMount = null;
            }

            if (typeof showNotification === 'function') {
                showNotification(`${this.type.name} has died...`, []);
            }
        }

        update(dt) {
            // Update needs
            this.hunger = Math.max(0, this.hunger - CONFIG.HUNGER_DECAY_RATE * dt);
            this.happiness = Math.max(0, this.happiness - CONFIG.HAPPINESS_DECAY * dt);
            this.trust = Math.max(0, this.trust - CONFIG.TRUST_DECAY_RATE * dt);
            this.loyalty = Math.max(0, this.loyalty - CONFIG.LOYALTY_DECAY * dt);

            // Update cooldowns
            for (const ability of this.abilities) {
                if (this.abilityCooldowns[ability] > 0) {
                    this.abilityCooldowns[ability] -= dt;
                }
            }

            // Update breeding cooldown
            if (this.breedingCooldown > 0) {
                this.breedingCooldown -= dt;
            }

            // Update AI
            this.updateAI(dt);

            // Update animation
            this.animTimer += dt;
            if (this.animTimer > 0.15) {
                this.animTimer = 0;
                this.frame = (this.frame + 1) % 4;
            }
        }

        updateAI(dt) {
            if (this.isWild) {
                this.updateWildAI(dt);
                return;
            }

            switch (this.state) {
                case 'follow':
                    this.updateFollowAI(dt);
                    break;
                case 'attack':
                    this.updateAttackAI(dt);
                    break;
                case 'gather':
                    this.updateGatherAI(dt);
                    break;
                case 'stay':
                    this.updateStayAI(dt);
                    break;
                default:
                    this.updateFollowAI(dt);
            }
        }

        updateWildAI(dt) {
            this.wanderTimer -= dt;
            if (this.wanderTimer <= 0) {
                this.wanderTimer = Math.random() * 10 + 5;
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 5;
                this.wanderTarget = {
                    x: this.x + Math.cos(angle) * dist,
                    y: this.y + Math.sin(angle) * dist
                };
            }

            if (this.wanderTarget) {
                this.moveToward(this.wanderTarget.x, this.wanderTarget.y, dt);
            }

            // Flee from player if low trust
            if (this.trust < 30) {
                const distToPlayer = Math.sqrt(
                    (this.x - player.x) ** 2 + (this.y - player.y) ** 2
                );
                if (distToPlayer < 5) {
                    const angle = Math.atan2(this.y - player.y, this.x - player.x);
                    this.moveToward(
                        this.x + Math.cos(angle) * 10,
                        this.y + Math.sin(angle) * 10,
                        dt
                    );
                }
            }
        }

        updateFollowAI(dt) {
            if (typeof player === 'undefined' || !player.x) return;

            const distToPlayer = Math.sqrt(
                (this.x - player.x) ** 2 + (this.y - player.y) ** 2
            );

            if (distToPlayer > CONFIG.FOLLOW_DISTANCE_MAX) {
                this.moveToward(player.x, player.y, dt);
            } else if (distToPlayer < CONFIG.FOLLOW_DISTANCE_MIN) {
                this.moveAwayFrom(player.x, player.y, dt);
            }
        }

        updateAttackAI(dt) {
            if (!this.target || this.target.health <= 0) {
                this.state = 'follow';
                this.target = null;
                return;
            }

            const dist = Math.sqrt(
                (this.x - this.target.x) ** 2 + (this.y - this.target.y) ** 2
            );

            if (dist > CONFIG.ATTACK_RANGE) {
                this.moveToward(this.target.x, this.target.y, dt);
            } else {
                this.attack(this.target);
            }
        }

        updateGatherAI(dt) {
            if (this.hunger < 50) {
                this.state = 'follow';
                return;
            }

            const nearbyResources = this.findNearbyResources(CONFIG.GATHER_RANGE);
            if (nearbyResources.length > 0) {
                const target = nearbyResources[0];
                const dist = Math.sqrt(
                    (this.x - target.x) ** 2 + (this.y - target.y) ** 2
                );

                if (dist > 1) {
                    this.moveToward(target.x, target.y, dt);
                } else {
                    this.gatherResource(target);
                }
            } else {
                this.state = 'follow';
            }
        }

        updateStayAI(dt) {
            // Stay in place, just idle
            this.animTimer += dt;
            if (this.animTimer > 0.3) {
                this.frame = (this.frame + 1) % 2;
            }
        }

        moveToward(targetX, targetY, dt) {
            const angle = Math.atan2(targetY - this.y, targetX - this.x);
            const speed = this.getSpeed() * dt;

            const newX = this.x + Math.cos(angle) * speed;
            const newY = this.y + Math.sin(angle) * speed;

            if (!isSolidAt(newX, newY, this.size * 0.3)) {
                this.x = newX;
                this.y = newY;
                this.direction = Math.cos(angle) > 0 ? 1 : -1;
            }
        }

        moveAwayFrom(targetX, targetY, dt) {
            const angle = Math.atan2(this.y - targetY, this.x - targetX);
            const speed = this.getSpeed() * dt;

            const newX = this.x + Math.cos(angle) * speed;
            const newY = this.y + Math.sin(angle) * speed;

            if (!isSolidAt(newX, newY, this.size * 0.3)) {
                this.x = newX;
                this.y = newY;
                this.direction = Math.cos(angle) > 0 ? 1 : -1;
            }
        }

        attack(target) {
            if (this.attackCooldown > 0) return;

            this.attackCooldown = 1.0;
            this.lastAttackTime = Date.now();

            // Calculate damage
            let damage = this.getDamage();

            // Apply ability modifiers
            for (const ability of this.abilities) {
                const abilityData = PET_ABILITIES[ability];
                if (abilityData && abilityData.type === 'active') {
                    const mod = abilityData.effect(target);
                    if (typeof mod === 'number') {
                        damage *= mod;
                    }
                }
            }

            // Apply to target
            if (target.health !== undefined) {
                target.health -= damage;
                if (typeof addDamageNumber === 'function') {
                    addDamageNumber(target.x, target.y - 0.5, Math.floor(damage), '#ff6600');
                }
            }

            // Gain XP
            this.gainXP(10);

            // Event
            EventBus.emit('pet:attack', { pet: this, target: target, damage: damage });
        }

        findNearbyResources(radius) {
            if (typeof resources === 'undefined') return [];

            const resourceTypes = this.type.foodPreferences;
            const nearbyResources = [];

            // Check world resources
            for (const resource of worldResources || []) {
                const dist = Math.sqrt(
                    (this.x - resource.x) ** 2 + (this.y - resource.y) ** 2
                );
                if (dist < radius && resourceTypes.includes(resource.type)) {
                    nearbyResources.push(resource);
                }
            }

            return nearbyResources;
        }

        gatherResource(resource) {
            const amount = Math.floor(Math.random() * 3) + 1;
            resources[resource.type] = (resources[resource.type] || 0) + amount;

            this.hunger = Math.max(0, this.hunger - 5);

            if (typeof spawnParticles === 'function') {
                spawnParticles(this.x, this.y, '#00ff00', 10);
            }

            EventBus.emit('pet:gather', { pet: this, resource: resource, amount: amount });
        }

        setState(newState) {
            const oldState = this.state;
            this.state = newState;
            EventBus.emit('pet:statechange', { pet: this, oldState: oldState, newState: newState });
        }
    }

    // ============= TAMING SYSTEM =============
    class TamingSession {
        constructor(pet, player) {
            this.pet = pet;
            this.player = player;
            this.patience = CONFIG.TAMING_MAX_PATIENCE;
            this.foodGiven = 0;
            this.successfulApproaches = 0;
            this.approachAngle = 0;
            this.isActive = true;
            this.startTime = Date.now();
        }

        giveFood(foodType) {
            if (!this.isActive) return false;

            const isFavorite = this.pet.type.foodPreferences.includes(foodType);
            const bonus = isFavorite ? CONFIG.TAMING_FOOD_BONUS : CONFIG.TAMING_FOOD_BONUS * 0.5;
            this.patience = Math.min(CONFIG.TAMING_MAX_PATIENCE, this.patience + bonus);
            this.foodGiven++;

            this.pet.feed(foodType);

            if (this.patience >= CONFIG.TAMING_MAX_PATIENCE * 0.8) {
                this.successfulApproaches++;
            }

            return isFavorite;
        }

        approach(angle) {
            if (!this.isActive) return false;

            const dist = Math.sqrt(
                (this.pet.x - this.player.x) ** 2 + (this.pet.y - this.player.y) ** 2
            );

            if (dist < CONFIG.TAMING_MIN_DISTANCE || dist > CONFIG.TAMING_MAX_DISTANCE) {
                this.patience -= 10;
                return false;
            }

            const idealAngle = Math.atan2(
                this.pet.y - this.player.y,
                this.pet.x - this.player.x
            );

            const angleDiff = Math.abs(normalizeAngle(angle - idealAngle));
            const approachQuality = 1 - (angleDiff / Math.PI);

            if (approachQuality > 0.7) {
                this.patience = Math.min(
                    CONFIG.TAMING_MAX_PATIENCE,
                    this.patience + CONFIG.TAMING_SUCCESS_BONUS * approachQuality
                );
                this.successfulApproaches++;
            } else {
                this.patience -= CONFIG.TAMING_PATIENCE_DECAY;
            }

            return approachQuality > 0.7;
        }

        complete() {
            this.isActive = false;

            if (this.patience >= CONFIG.TAMING_MAX_PATIENCE * 0.5) {
                // Taming successful
                this.pet.isWild = false;
                this.pet.trust = this.patience;
                this.pet.happiness = 70;

                const newPets = pets.filter(p => p !== this.pet);
                pets = [...newPets, this.pet];

                EventBus.emit('pet:tamed', { pet: this.pet });
                return true;
            }

            // Taming failed - pet flees
            const angle = Math.random() * Math.PI * 2;
            this.pet.x += Math.cos(angle) * 20;
            this.pet.y += Math.sin(angle) * 20;

            EventBus.emit('taming:failed', { pet: this.pet });
            return false;
        }

        update(dt) {
            if (!this.isActive) return;

            this.patience -= CONFIG.TAMING_PATIENCE_DECAY * dt;

            if (this.patience <= 0) {
                this.complete();
            }
        }
    }

    function normalizeAngle(angle) {
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        return angle;
    }

    // ============= BREEDING SYSTEM =============
    function breedPets(pet1, pet2) {
        if (!pet1.canBreed || !pet2.canBreed) return null;
        if (pet1.breedingCooldown > 0 || pet2.breedingCooldown > 0) return null;
        if (pet1.typeId !== pet2.typeId) return null;
        if (pet1.trust < CONFIG.BREEDING_TRUST_THRESHOLD || pet2.trust < CONFIG.BREEDING_TRUST_THRESHOLD) return null;
        if (pet1.happiness < CONFIG.BREEDING_HAPPINESS_THRESHOLD || pet2.happiness < CONFIG.BREEDING_HAPPINESS_THRESHOLD) return null;

        const offspring = new Pet(pet1.typeId, pet1.x, pet1.y, false);

        // Inherit genetics
        offspring.geneticTraits = {
            strength: (pet1.geneticTraits.strength + pet2.geneticTraits.strength) / 2 + (Math.random() - 0.5) * 0.2,
            endurance: (pet1.geneticTraits.endurance + pet2.geneticTraits.endurance) / 2 + (Math.random() - 0.5) * 0.2,
            intelligence: (pet1.geneticTraits.intelligence + pet2.geneticTraits.intelligence) / 2 + (Math.random() - 0.5) * 0.2,
            aggression: (pet1.geneticTraits.aggression + pet2.geneticTraits.aggression) / 2 + (Math.random() - 0.5) * 0.2,
            sociability: (pet1.geneticTraits.sociability + pet2.geneticTraits.sociability) / 2 + (Math.random() - 0.5) * 0.2
        };

        // Stat bonuses from genetics
        offspring.maxHealth *= (0.9 + offspring.geneticTraits.endurance * 0.2);
        offspring.damage *= (0.9 + offspring.geneticTraits.strength * 0.2);

        // Set cooldowns
        pet1.breedingCooldown = CONFIG.BREEDING_COOLDOWN;
        pet2.breedingCooldown = CONFIG.BREEDING_COOLDOWN;
        pet1.offspringCount++;
        pet2.offspringCount++;

        // Give bonus stats
        pet1.trust += 10;
        pet2.trust += 10;

        EventBus.emit('pet:bred', { parent1: pet1, parent2: pet2, offspring: offspring });
        return offspring;
    }

    // ============= WILD ANIMAL SPAWNING =============
    function spawnWildAnimal(typeId, x, y) {
        const type = PET_TYPES[typeId];
        if (!type) return null;

        const animal = new Pet(typeId, x, y, true);
        wildAnimals.push(animal);

        EventBus.emit('animal:spawned', { animal: animal, type: type });
        return animal;
    }

    function getWildlifeSpawnSettings(biomeId) {
        const settings = {
            jungle: { chance: 0.8, distance: [9, 16], maxMultiplier: 1.2 },
            desert: { chance: 0.6, distance: [12, 18], maxMultiplier: 0.9 },
            swamp: { chance: 0.7, distance: [10, 16], maxMultiplier: 1.1 },
            snow: { chance: 0.6, distance: [12, 18], maxMultiplier: 0.8 },
            volcanic: { chance: 0.5, distance: [12, 20], maxMultiplier: 0.7 },
            ruins: { chance: 0.65, distance: [10, 17], maxMultiplier: 0.9 }
        };
        return settings[biomeId] || settings.jungle;
    }

    function pickWildPetType(biomeId) {
        const pools = {
            jungle: ['WOLF', 'TIGER', 'FOX', 'BOAR', 'BEAR', 'HAWK'],
            desert: ['CAMEL', 'FOX', 'BOAR', 'HAWK'],
            swamp: ['BEAVER', 'BOAR', 'BEAR', 'FOX'],
            snow: ['WOLF', 'BEAR', 'HAWK'],
            volcanic: ['WOLF', 'BEAR', 'BOAR'],
            ruins: ['FOX', 'WOLF', 'BOAR', 'BEAVER']
        };
        const pool = pools[biomeId] || pools.jungle;
        const roll = Math.random();
        if (biomeId === 'volcanic' && roll > 0.97) return 'WOLF_ALPHA';
        return pool[Math.floor(Math.random() * pool.length)];
    }

    function isValidWildlifeSpawn(x, y) {
        const tile = getTile(x, y);
        if (typeof isPassable === 'function' && !isPassable(tile)) return false;
        if (typeof isInBaseArea === 'function' && isInBaseArea(Math.floor(x), Math.floor(y))) return false;

        if (Array.isArray(buildings)) {
            const tooClose = buildings.some(b => Math.abs(b.x - x) < 2 && Math.abs(b.y - y) < 2);
            if (tooClose) return false;
        }

        return true;
    }

    function spawnNearbyWildAnimals(centerX, centerY, count = 3) {
        const biomeId = typeof BiomeSystem !== 'undefined'
            ? BiomeSystem.getBiomeAt(centerX, centerY)?.id
            : 'jungle';
        const spawnedAnimals = [];
        const settings = getWildlifeSpawnSettings(biomeId);

        for (let i = 0; i < count; i++) {
            let attempts = 0;
            while (attempts < 6) {
                attempts++;
                const typeId = pickWildPetType(biomeId);
                const angle = Math.random() * Math.PI * 2;
                const dist = settings.distance[0] + Math.random() * (settings.distance[1] - settings.distance[0]);
                const x = centerX + Math.cos(angle) * dist;
                const y = centerY + Math.sin(angle) * dist;

                if (!isValidWildlifeSpawn(x, y)) continue;

                const animal = spawnWildAnimal(typeId, x, y);
                if (animal) {
                    spawnedAnimals.push(animal);
                }
                break;
            }
        }

        return spawnedAnimals;
    }

    function getWildAnimalsNear(x, y, radius) {
        return wildAnimals.filter(animal => {
            const dist = Math.sqrt((animal.x - x) ** 2 + (animal.y - y) ** 2);
            return dist < radius;
        });
    }

    // ============= MOUNT SYSTEM =============
    function mountPet(pet) {
        if (!pet || !pet.type.canMount) return false;
        if (playerMount === pet) {
            dismountPet();
            return true;
        }

        playerMount = pet;
        EventBus.emit('pet:mounted', { pet: pet });
        return true;
    }

    function dismountPet() {
        if (!playerMount) return false;

        const dismountOffset = 1;
        const angle = Math.random() * Math.PI * 2;
        player.x = playerMount.x + Math.cos(angle) * dismountOffset;
        player.y = playerMount.y + Math.sin(angle) * dismountOffset;

        EventBus.emit('pet:dismounted', { pet: playerMount });
        playerMount = null;
        return true;
    }

    function getMountSpeed() {
        if (!playerMount) return player.speed || 5;

        const baseSpeed = playerMount.getSpeed();
        const fatigueMod = playerMount.hunger < 30 ? 0.7 : 1.0;
        return baseSpeed * fatigueMod;
    }

    // ============= UPDATE FUNCTIONS =============
    function update(dt) {
        // Update spawn timer
        spawnTimer += dt;
        if (spawnTimer >= CONFIG.SPAWN_INTERVAL) {
            spawnTimer = 0;
            const biomeId = typeof BiomeSystem !== 'undefined'
                ? BiomeSystem.getBiomeAt(player.x, player.y)?.id
                : 'jungle';
            const settings = getWildlifeSpawnSettings(biomeId);
            const nightModifier = isNight ? 0.7 : 1.0;
            const spawnChance = CONFIG.SPAWN_CHANCE * settings.chance * nightModifier;
            const maxWild = Math.max(3, Math.floor(CONFIG.MAX_WILD_ANIMALS * settings.maxMultiplier));

            if (wildAnimals.length < maxWild && Math.random() < spawnChance) {
                // Spawn 1-3 animals nearby
                const count = 1 + Math.floor(Math.random() * (isNight ? 2 : 3));
                spawnNearbyWildAnimals(player.x, player.y, count);
            }
        }

        // Update taming session
        if (tamingSession && tamingSession.isActive) {
            tamingSession.update(dt);
            if (!tamingSession.isActive) {
                tamingSession = null;
            }
        }

        // Update pets
        for (const pet of [...pets]) {
            pet.update(dt);

            // Combat behavior for combat pets
            if (pet.type.type === 'combat' && pet.state === 'follow') {
                const nearbyZombies = getNearbyZombies(pet.x, pet.y, CONFIG.ATTACK_RANGE);
                if (nearbyZombies.length > 0 && pet.hunger > 30) {
                    pet.setState('attack');
                    pet.target = nearbyZombies[0];
                }
            }
        }

        // Update wild animals
        for (const animal of [...wildAnimals]) {
            animal.update(dt);

            // Despawn if too far from player
            const dist = Math.sqrt((animal.x - player.x) ** 2 + (animal.y - player.y) ** 2);
            if (dist > CONFIG.DESPAWN_DISTANCE) {
                const idx = wildAnimals.indexOf(animal);
                if (idx !== -1) {
                    wildAnimals.splice(idx, 1);
                }
                continue;
            }

            // Remove dead animals
            if (animal.health <= 0) {
                const idx = wildAnimals.indexOf(animal);
                if (idx !== -1) {
                    wildAnimals.splice(idx, 1);
                }
            }
        }
    }

    function getNearbyZombies(x, y, radius) {
        if (typeof zombies === 'undefined') return [];

        return zombies.filter(zombie => {
            const dist = Math.sqrt((zombie.x - x) ** 2 + (zombie.y - y) ** 2);
            return dist < radius;
        });
    }

    // ============= TAMING INTERACTION =============
    function startTaming(pet) {
        if (tamingSession && tamingSession.isActive) {
            return false;
        }

        if (!pet.isWild) {
            return false;
        }

        tamingSession = new TamingSession(pet, player);
        return true;
    }

    function feedTamingPet(foodType) {
        if (!tamingSession || !tamingSession.isActive) return false;
        return tamingSession.giveFood(foodType);
    }

    function approachTamingPet(movementAngle) {
        if (!tamingSession || !tamingSession.isActive) return false;
        return tamingSession.approach(movementAngle);
    }

    function completeTaming() {
        if (!tamingSession || !tamingSession.isActive) return null;
        return tamingSession.complete();
    }

    function cancelTaming() {
        if (!tamingSession) return false;
        tamingSession.isActive = false;
        tamingSession = null;
        return true;
    }

    // ============= PET MANAGEMENT =============
    function addPet(typeId, x, y) {
        const pet = new Pet(typeId, x, y, false);
        if (!pet.isValid) return null;
        pets.push(pet);
        if (typeof showNotification === 'function') {
            showNotification(`Debug: Added ${pet.type.name} at (${pet.x.toFixed(1)}, ${pet.y.toFixed(1)})`, []);
        }
        EventBus.emit('pet:added', { pet: pet });
        return pet;
    }

    function removePet(petId) {
        const pet = pets.find(p => p.id === petId);
        if (!pet) return false;

        if (playerMount === pet) {
            playerMount = null;
        }

        const idx = pets.indexOf(pet);
        if (idx !== -1) {
            pets.splice(idx, 1);
        }

        EventBus.emit('pet:removed', { petId: petId });
        return true;
    }

    function getPet(petId) {
        return pets.find(p => p.id === petId);
    }

    function getAllPets() {
        return [...pets];
    }

    function getTamedPets() {
        return pets.filter(p => !p.isWild);
    }

    function getWildAnimals() {
        return [...wildAnimals];
    }

    function getMountedPet() {
        return playerMount;
    }

    function getTamingSession() {
        return tamingSession;
    }

    // ============= RENDERING =============
    function renderPets(ctx) {
        for (const pet of pets) {
            renderPet(ctx, pet);
        }

        for (const animal of wildAnimals) {
            renderPet(ctx, animal);
        }
    }

    function renderPet(ctx, pet) {
        if (!pet || !pet.type) return;
        const cam = typeof camera !== 'undefined' ? camera : { x: 0, y: 0 };
        renderPetSprite(ctx, pet, cam);
    }

    // ============= SERIALIZATION =============
    function getState() {
        return {
            pets: pets.map(pet => ({
                id: pet.id,
                typeId: pet.typeId,
                x: pet.x,
                y: pet.y,
                isWild: pet.isWild,
                health: pet.health,
                maxHealth: pet.maxHealth,
                level: pet.level,
                xp: pet.xp,
                xpToLevel: pet.xpToLevel,
                hunger: pet.hunger,
                happiness: pet.happiness,
                trust: pet.trust,
                loyalty: pet.loyalty,
                state: pet.state,
                equipment: {
                    collar: pet.equipment.collar?.id || null,
                    saddle: pet.equipment.saddle?.id || null,
                    armor: pet.equipment.armor?.id || null
                },
                abilities: [...pet.abilities],
                breedingCooldown: pet.breedingCooldown,
                offspringCount: pet.offspringCount,
                geneticTraits: { ...pet.geneticTraits }
            })),
            nextPetId: nextPetId,
            playerMountId: playerMount?.id || null
        };
    }

    function setState(state) {
        if (!state) return;

        pets = [];
        wildAnimals = [];

        if (state.pets) {
            for (const petState of state.pets) {
                const pet = new Pet(petState.typeId, petState.x, petState.y, petState.isWild);
                pet.id = petState.id;
                pet.health = petState.health;
                pet.maxHealth = petState.maxHealth;
                pet.level = petState.level;
                pet.xp = petState.xp;
                pet.xpToLevel = petState.xpToLevel;
                pet.hunger = petState.hunger;
                pet.happiness = petState.happiness;
                pet.trust = petState.trust;
                pet.loyalty = petState.loyalty;
                pet.state = petState.state;
                pet.breedingCooldown = petState.breedingCooldown;
                pet.offspringCount = petState.offspringCount;
                pet.geneticTraits = petState.geneticTraits || {};

                if (petState.equipment) {
                    if (petState.equipment.collar) {
                        pet.equipment.collar = PET_EQUIPMENT[petState.equipment.collar];
                    }
                    if (petState.equipment.saddle) {
                        pet.equipment.saddle = PET_EQUIPMENT[petState.equipment.saddle];
                    }
                    if (petState.equipment.armor) {
                        pet.equipment.armor = PET_EQUIPMENT[petState.equipment.armor];
                    }
                }

                if (petState.abilities) {
                    pet.abilities = petState.abilities;
                }

                pets.push(pet);
            }
        }

        nextPetId = state.nextPetId || 1;

        if (state.playerMountId) {
            playerMount = pets.find(p => p.id === state.playerMountId);
        }
    }

    // ============= PUBLIC API =============
    return {
        // Configuration
        CONFIG,
        PET_TYPES,
        PET_EQUIPMENT,
        PET_ABILITIES,

        // Pet Management
        addPet,
        removePet,
        getPet,
        getAllPets,
        getTamedPets,

        // Mount System
        mountPet,
        dismountPet,
        getMountedPet,
        getMountSpeed,

        // Taming System
        startTaming,
        feedTamingPet,
        approachTamingPet,
        completeTaming,
        cancelTaming,
        getTamingSession,

        // Wild Animals
        spawnWildAnimal,
        spawnNearbyWildAnimals,
        getWildAnimalsNear,
        getWildAnimals,

        // Breeding
        breedPets,

        // Update & Render
        update,
        renderPets,

        // State
        getState,
        setState
    };
})();

window.PetSystem = PetSystem;
