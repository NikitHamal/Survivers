// ============================================
// PET SYSTEM - Taming, Breeding & Pet Management
// ============================================
// Complete pet system with wild animals, taming, and breeding

const PetSystem = (function () {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        // Wildlife spawning
        SPAWN_INTERVAL: 20,
        SPAWN_CHANCE: 0.5,
        MAX_WILD_ANIMALS: 15,
        DESPAWN_DISTANCE: 35,
        SPAWN_RADIUS_MIN: 10,
        SPAWN_RADIUS_MAX: 18,

        // Animal behavior
        WANDER_INTERVAL_MIN: 3,
        WANDER_INTERVAL_MAX: 8,
        WANDER_DISTANCE: 4,
        FLEE_DISTANCE: 8,
        FLEE_SPEED_MULTIPLIER: 1.8,

        // Taming
        TAME_APPROACH_SPEED: 0.3,
        TAME_FEED_TRUST: 25,
        TAME_PET_TRUST: 8,
        TAME_PATIENCE_DECAY: 2,
        TAME_PATIENCE_MAX: 100,
        TAME_TRUST_THRESHOLD: 100,
        TAME_FLEE_TRUST_LOSS: 15,

        // Pet behavior
        PET_FOLLOW_DISTANCE: 2.5,
        PET_FOLLOW_SPEED: 3.5,
        PET_IDLE_DISTANCE: 1.5,
        PET_HUNGER_DECAY: 0.5,
        PET_HAPPINESS_DECAY: 0.3,
        PET_LOYALTY_GAIN: 0.1,

        // Breeding
        BREED_COOLDOWN: 180,
        BREED_HAPPINESS_REQ: 70,
        BREED_HUNGER_REQ: 60,
        OFFSPRING_GROWTH_TIME: 120,

        // Slime behavior
        SLIME_BOUNCE_INTERVAL: 1.5,
        SLIME_BOUNCE_HEIGHT: 0.4,
        SLIME_SQUASH_DURATION: 0.15
    };

    // ============= ANIMAL DEFINITIONS =============
    const ANIMAL_TYPES = {
        SHEEP: {
            id: 'sheep', name: 'Sheep', icon: '🐑',
            baseStats: { health: 30, speed: 2.5 },
            size: 0.7,
            drops: [
                { item: 'wool', min: 1, max: 3, chance: 1.0 },
                { item: 'meat', min: 1, max: 2, chance: 0.8 }
            ],
            tameable: true,
            tameFoods: ['wheat', 'food'],
            tameTime: 60,
            breedable: true,
            fleeOnHit: true,
            spawnWeight: 3,
            petBonus: { type: 'wool', rate: 0.01 }
        },
        CHICKEN: {
            id: 'chicken', name: 'Chicken', icon: '🐔',
            baseStats: { health: 15, speed: 3.5 },
            size: 0.4,
            drops: [
                { item: 'feather', min: 1, max: 3, chance: 1.0 },
                { item: 'meat', min: 1, max: 1, chance: 0.7 }
            ],
            tameable: true,
            tameFoods: ['seed', 'wheat', 'food'],
            tameTime: 40,
            breedable: true,
            fleeOnHit: true,
            spawnWeight: 4,
            petBonus: { type: 'egg', rate: 0.008 }
        },
        PIG: {
            id: 'pig', name: 'Pig', icon: '🐷',
            baseStats: { health: 40, speed: 2.0 },
            size: 0.65,
            drops: [
                { item: 'pork', min: 2, max: 4, chance: 1.0 },
                { item: 'leather', min: 0, max: 1, chance: 0.3 }
            ],
            tameable: true,
            tameFoods: ['carrot', 'food'],
            tameTime: 50,
            breedable: true,
            fleeOnHit: true,
            spawnWeight: 3,
            petBonus: { type: 'truffle', rate: 0.005 }
        },
        COW: {
            id: 'cow', name: 'Cow', icon: '🐄',
            baseStats: { health: 50, speed: 1.8 },
            size: 0.85,
            drops: [
                { item: 'leather', min: 1, max: 2, chance: 1.0 },
                { item: 'meat', min: 2, max: 4, chance: 1.0 }
            ],
            tameable: true,
            tameFoods: ['wheat', 'food'],
            tameTime: 70,
            breedable: true,
            fleeOnHit: true,
            spawnWeight: 2,
            petBonus: { type: 'milk', rate: 0.012 }
        },
        HORSE: {
            id: 'horse', name: 'Horse', icon: '🐴',
            baseStats: { health: 60, speed: 4.5 },
            size: 0.9,
            drops: [{ item: 'leather', min: 2, max: 4, chance: 1.0 }],
            tameable: true,
            tameFoods: ['apple', 'carrot', 'food'],
            tameTime: 90,
            breedable: true,
            fleeOnHit: true,
            spawnWeight: 1,
            rideable: true,
            petBonus: { type: 'speed', value: 1.5 }
        },
        WOLF: {
            id: 'wolf', name: 'Wolf', icon: '🐺',
            baseStats: { health: 35, speed: 4.0, damage: 8 },
            size: 0.6,
            drops: [{ item: 'fur', min: 1, max: 2, chance: 0.8 }],
            tameable: true,
            tameFoods: ['meat', 'pork', 'bone'],
            tameTime: 80,
            breedable: true,
            fleeOnHit: false,
            hostile: false,
            combatPet: true,
            spawnWeight: 1,
            petBonus: { type: 'combat', damage: 10 }
        },
        RABBIT: {
            id: 'rabbit', name: 'Rabbit', icon: '🐰',
            baseStats: { health: 10, speed: 5.0 },
            size: 0.35,
            drops: [
                { item: 'fur', min: 1, max: 1, chance: 0.8 },
                { item: 'meat', min: 1, max: 1, chance: 0.6 }
            ],
            tameable: true,
            tameFoods: ['carrot', 'food'],
            tameTime: 30,
            breedable: true,
            fleeOnHit: true,
            spawnWeight: 3,
            petBonus: { type: 'luck', value: 0.05 }
        },
        SLIME: {
            id: 'slime', name: 'Slime', icon: '🟢',
            baseStats: { health: 25, speed: 1.5 },
            size: 0.5,
            drops: [{ item: 'slimeball', min: 1, max: 3, chance: 1.0 }],
            tameable: true,
            tameFoods: ['slimeball'],
            tameTime: 45,
            breedable: false,
            fleeOnHit: false,
            isSlime: true,
            spawnWeight: 2,
            petBonus: { type: 'slime', rate: 0.006 }
        },
        BEE: {
            id: 'bee', name: 'Bee', icon: '🐝',
            baseStats: { health: 8, speed: 4.5 },
            size: 0.25,
            drops: [
                { item: 'honey', min: 1, max: 2, chance: 0.8 },
                { item: 'wax', min: 0, max: 1, chance: 0.4 }
            ],
            tameable: true,
            tameFoods: ['flower', 'honey', 'food'],
            tameTime: 35,
            breedable: true,
            fleeOnHit: true,
            isBee: true,
            spawnWeight: 2,
            petBonus: { type: 'honey', rate: 0.015 }
        }
    };

    // ============= STATE =============
    let wildAnimals = [];
    let tamedPets = [];
    let spawnTimer = 0;
    let nextAnimalId = 1;
    let activeTamingTarget = null;

    // ============= ANIMAL CLASS =============
    class Animal {
        constructor(typeId, x, y, isTamed = false) {
            const type = ANIMAL_TYPES[typeId] || ANIMAL_TYPES[typeId?.toUpperCase()];
            if (!type) {
                this.isValid = false;
                return;
            }

            this.isValid = true;
            this.id = nextAnimalId++;
            this.typeId = typeId.toUpperCase();
            this.type = type;
            this.x = x;
            this.y = y;

            // Stats
            this.health = type.baseStats.health;
            this.maxHealth = type.baseStats.health;
            this.speed = type.baseStats.speed;
            this.damage = type.baseStats.damage || 0;
            this.size = type.size;

            // Movement
            this.vx = 0;
            this.vy = 0;
            this.direction = Math.random() > 0.5 ? 1 : -1;
            this.isMoving = false;

            // AI State
            this.aiState = 'idle';
            this.wanderTarget = null;
            this.wanderTimer = Math.random() * CONFIG.WANDER_INTERVAL_MAX;
            this.fleeTimer = 0;
            this.fleeFrom = null;

            // Taming state
            this.isTamed = isTamed;
            this.trust = isTamed ? CONFIG.TAME_TRUST_THRESHOLD : 0;
            this.patience = CONFIG.TAME_PATIENCE_MAX;
            this.isBeingTamed = false;
            this.owner = null;

            // Pet stats (for tamed animals)
            this.hunger = 100;
            this.happiness = 100;
            this.loyalty = isTamed ? 50 : 0;
            this.isFollowing = false;
            this.breedCooldown = 0;
            this.age = isTamed ? 1 : 1;
            this.isAdult = true;
            this.growthTimer = 0;
            this.productionTimer = 0;

            // Animation
            this.animTimer = Math.random() * Math.PI * 2;
            this.frame = 0;
            this.hitTimer = 0;
            this.knockbackX = 0;
            this.knockbackY = 0;
            this.heartTimer = 0;

            // Slime-specific
            if (type.isSlime) {
                this.bounceTimer = Math.random() * CONFIG.SLIME_BOUNCE_INTERVAL;
                this.bouncePhase = 0;
                this.bounceHeight = 0;
                this.squashAmount = 0;
                this.slimeColor = this.getRandomSlimeColor();
            }

            // Bee-specific
            if (type.isBee) {
                this.flyHeight = 0.2 + Math.random() * 0.3;
                this.wingPhase = Math.random() * Math.PI * 2;
                this.hoverOffset = 0;
                this.pollinateTimer = 0;
                this.isPollinatiing = false;
            }
        }

        getRandomSlimeColor() {
            const colors = [
                { body: '#44dd44', light: '#66ff66', dark: '#22aa22' },
                { body: '#4488ff', light: '#66aaff', dark: '#2266cc' },
                { body: '#ff88dd', light: '#ffaaee', dark: '#cc66aa' },
                { body: '#ffcc44', light: '#ffee66', dark: '#ccaa22' },
                { body: '#ff6644', light: '#ff8866', dark: '#cc4422' }
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        update(dt) {
            if (!this.isValid) return;

            this.animTimer += dt;
            this.hitTimer = Math.max(0, this.hitTimer - dt);
            this.heartTimer = Math.max(0, this.heartTimer - dt);

            this.applyKnockback(dt);

            if (this.isTamed) {
                this.updateTamedBehavior(dt);
            } else if (this.isBeingTamed) {
                this.updateTamingBehavior(dt);
            } else if (this.type.isSlime) {
                this.updateSlimeAI(dt);
            } else if (this.type.isBee) {
                this.updateBeeAI(dt);
            } else {
                this.updateWildAI(dt);
            }

            // Breeding cooldown
            if (this.breedCooldown > 0) {
                this.breedCooldown -= dt;
            }

            // Growth for baby animals
            if (!this.isAdult) {
                this.growthTimer += dt;
                if (this.growthTimer >= CONFIG.OFFSPRING_GROWTH_TIME) {
                    this.isAdult = true;
                    this.size = this.type.size;
                    if (typeof showNotification === 'function') {
                        showNotification(`Your ${this.type.name} has grown up!`, []);
                    }
                }
            }
        }

        applyKnockback(dt) {
            if (this.knockbackX !== 0 || this.knockbackY !== 0) {
                const decay = 5 * dt;
                this.x += this.knockbackX * dt;
                this.y += this.knockbackY * dt;
                this.knockbackX *= Math.max(0, 1 - decay);
                this.knockbackY *= Math.max(0, 1 - decay);
                if (Math.abs(this.knockbackX) < 0.1) this.knockbackX = 0;
                if (Math.abs(this.knockbackY) < 0.1) this.knockbackY = 0;
            }
        }

        updateTamedBehavior(dt) {
            // Stat decay
            this.hunger = Math.max(0, this.hunger - CONFIG.PET_HUNGER_DECAY * dt);
            this.happiness = Math.max(0, this.happiness - CONFIG.PET_HAPPINESS_DECAY * dt);

            // Loyalty gain when following and happy
            if (this.isFollowing && this.happiness > 50) {
                this.loyalty = Math.min(100, this.loyalty + CONFIG.PET_LOYALTY_GAIN * dt);
            }

            // Production bonus
            if (this.isAdult && this.type.petBonus && this.type.petBonus.rate) {
                this.productionTimer += dt;
                const productionInterval = 10 / (this.happiness / 100);
                if (this.productionTimer >= productionInterval) {
                    this.productionTimer = 0;
                    if (Math.random() < this.type.petBonus.rate * this.loyalty) {
                        const item = this.type.petBonus.type;
                        if (typeof resources !== 'undefined') {
                            resources[item] = (resources[item] || 0) + 1;
                        }
                        if (typeof spawnParticles === 'function') {
                            spawnParticles(this.x, this.y, '#ffff00', 5);
                        }
                    }
                }
            }

            // Combat pets attack nearby zombies
            if (this.type.combatPet && this.isAdult && typeof zombies !== 'undefined') {
                this.updateCombatBehavior(dt);
            }

            // Follow owner or wander near them
            if (this.isFollowing && typeof player !== 'undefined') {
                this.updateFollowBehavior(dt);
            } else {
                this.updateIdlePetBehavior(dt);
            }
        }

        updateCombatBehavior(dt) {
            if (this.attackCooldown > 0) {
                this.attackCooldown -= dt;
                return;
            }

            for (const z of zombies) {
                const dist = Math.sqrt((z.x - this.x) ** 2 + (z.y - this.y) ** 2);
                if (dist < 2.5) {
                    const damage = this.type.petBonus?.damage || 8;
                    if (typeof applyZombieDamage === 'function') {
                        applyZombieDamage(z, damage * (this.loyalty / 100));
                    } else {
                        z.health -= damage * (this.loyalty / 100);
                    }
                    if (typeof addDamageNumber === 'function') {
                        addDamageNumber(z.x, z.y, Math.floor(damage), '#ff8800');
                    }
                    this.attackCooldown = 1.0;
                    break;
                }
            }
        }

        updateFollowBehavior(dt) {
            const target = player;
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > CONFIG.PET_FOLLOW_DISTANCE) {
                const speed = CONFIG.PET_FOLLOW_SPEED * dt;
                this.moveToward(target.x, target.y, dt, CONFIG.PET_FOLLOW_SPEED);
                this.isMoving = true;
            } else if (dist > CONFIG.PET_IDLE_DISTANCE) {
                this.moveToward(target.x, target.y, dt, this.speed);
                this.isMoving = true;
            } else {
                this.isMoving = false;
                // Idle animation near owner
                if (!this.wanderTarget && Math.random() < 0.01) {
                    const angle = Math.random() * Math.PI * 2;
                    const wanderDist = 0.5 + Math.random();
                    this.wanderTarget = {
                        x: target.x + Math.cos(angle) * wanderDist,
                        y: target.y + Math.sin(angle) * wanderDist
                    };
                }
                if (this.wanderTarget) {
                    const wdx = this.wanderTarget.x - this.x;
                    const wdy = this.wanderTarget.y - this.y;
                    const wdist = Math.sqrt(wdx * wdx + wdy * wdy);
                    if (wdist > 0.2) {
                        this.moveToward(this.wanderTarget.x, this.wanderTarget.y, dt, this.speed * 0.5);
                        this.isMoving = true;
                    } else {
                        this.wanderTarget = null;
                    }
                }
            }
        }

        updateIdlePetBehavior(dt) {
            this.wanderTimer -= dt;
            if (this.wanderTimer <= 0) {
                this.pickNewWanderTarget();
                this.wanderTimer = CONFIG.WANDER_INTERVAL_MIN +
                    Math.random() * (CONFIG.WANDER_INTERVAL_MAX - CONFIG.WANDER_INTERVAL_MIN);
            }

            if (this.wanderTarget && this.aiState === 'wander') {
                const dx = this.wanderTarget.x - this.x;
                const dy = this.wanderTarget.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 0.3) {
                    this.moveToward(this.wanderTarget.x, this.wanderTarget.y, dt, this.speed * 0.5);
                    this.isMoving = true;
                } else {
                    this.aiState = 'idle';
                    this.isMoving = false;
                    this.wanderTarget = null;
                }
            } else {
                this.isMoving = false;
            }
        }

        updateTamingBehavior(dt) {
            if (typeof player === 'undefined') return;

            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Patience decays if player approaches too fast
            if (dist < 3 && this.patience > 0) {
                const playerSpeed = Math.sqrt((player.vx || 0) ** 2 + (player.vy || 0) ** 2);
                if (playerSpeed > CONFIG.TAME_APPROACH_SPEED) {
                    this.patience -= CONFIG.TAME_PATIENCE_DECAY * dt * 3;
                    if (this.patience <= 0) {
                        this.fleeFromTaming();
                    }
                }
            }

            // Look at player when being tamed
            this.direction = dx > 0 ? 1 : -1;
            this.isMoving = false;
        }

        fleeFromTaming() {
            this.isBeingTamed = false;
            this.trust = Math.max(0, this.trust - CONFIG.TAME_FLEE_TRUST_LOSS);
            this.patience = CONFIG.TAME_PATIENCE_MAX;
            this.fleeFrom = player;
            this.fleeTimer = 3;
            this.aiState = 'flee';
            activeTamingTarget = null;

            if (typeof spawnParticles === 'function') {
                spawnParticles(this.x, this.y, '#ff4444', 5);
            }
        }

        updateWildAI(dt) {
            if (this.fleeTimer > 0) {
                this.fleeTimer -= dt;
                this.updateFlee(dt);
                return;
            }

            this.wanderTimer -= dt;
            if (this.wanderTimer <= 0) {
                this.pickNewWanderTarget();
                this.wanderTimer = CONFIG.WANDER_INTERVAL_MIN +
                    Math.random() * (CONFIG.WANDER_INTERVAL_MAX - CONFIG.WANDER_INTERVAL_MIN);
            }

            if (this.wanderTarget && this.aiState === 'wander') {
                const dx = this.wanderTarget.x - this.x;
                const dy = this.wanderTarget.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 0.3) {
                    this.moveToward(this.wanderTarget.x, this.wanderTarget.y, dt, this.speed);
                    this.isMoving = true;
                } else {
                    this.aiState = 'idle';
                    this.isMoving = false;
                    this.wanderTarget = null;
                }
            } else {
                this.isMoving = false;
            }
        }

        updateSlimeAI(dt) {
            this.bounceTimer -= dt;

            if (this.bouncePhase === 0) {
                this.squashAmount = 0;
                this.bounceHeight = 0;
                if (this.bounceTimer <= 0) {
                    this.bouncePhase = 1;
                    this.bounceTimer = CONFIG.SLIME_SQUASH_DURATION;
                    this.pickNewWanderTarget();
                }
            } else if (this.bouncePhase === 1) {
                this.squashAmount = 1 - (this.bounceTimer / CONFIG.SLIME_SQUASH_DURATION);
                if (this.bounceTimer <= 0) {
                    this.bouncePhase = 2;
                    this.bounceTimer = 0.3;
                    if (this.wanderTarget) {
                        const dx = this.wanderTarget.x - this.x;
                        const dy = this.wanderTarget.y - this.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist > 0.1) {
                            const jumpDist = Math.min(dist, 2);
                            this.vx = (dx / dist) * jumpDist * 3;
                            this.vy = (dy / dist) * jumpDist * 3;
                            this.direction = dx > 0 ? 1 : -1;
                        }
                    }
                }
            } else if (this.bouncePhase === 2) {
                const jumpProgress = 1 - (this.bounceTimer / 0.3);
                this.bounceHeight = CONFIG.SLIME_BOUNCE_HEIGHT * Math.sin(jumpProgress * Math.PI);
                this.squashAmount = -0.2;
                const newX = this.x + this.vx * dt;
                const newY = this.y + this.vy * dt;
                if (!this.isPositionBlocked(newX, newY)) {
                    this.x = newX;
                    this.y = newY;
                }
                if (this.bounceTimer <= 0) {
                    this.bouncePhase = 3;
                    this.bounceTimer = CONFIG.SLIME_SQUASH_DURATION;
                    this.vx = 0;
                    this.vy = 0;
                }
            } else if (this.bouncePhase === 3) {
                this.bounceHeight = 0;
                this.squashAmount = 0.3 * (this.bounceTimer / CONFIG.SLIME_SQUASH_DURATION);
                if (this.bounceTimer <= 0) {
                    this.bouncePhase = 0;
                    this.bounceTimer = CONFIG.SLIME_BOUNCE_INTERVAL + Math.random();
                    this.wanderTarget = null;
                }
            }
            this.isMoving = this.bouncePhase === 2;
        }

        updateBeeAI(dt) {
            // Update wing animation
            this.wingPhase += dt * 40;

            // Hover bobbing
            this.hoverOffset = Math.sin(this.animTimer * 5) * 0.15;

            // Bee wandering - more erratic flight pattern
            this.wanderTimer -= dt;
            if (this.wanderTimer <= 0) {
                this.pickNewWanderTarget();
                this.wanderTimer = 1 + Math.random() * 2; // Bees change direction frequently
            }

            if (this.wanderTarget && this.aiState === 'wander') {
                const dx = this.wanderTarget.x - this.x;
                const dy = this.wanderTarget.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 0.2) {
                    // Bees fly fast with slight zigzag
                    const zigzag = Math.sin(this.animTimer * 8) * 0.3;
                    const targetX = this.wanderTarget.x + zigzag;
                    this.moveToward(targetX, this.wanderTarget.y, dt, this.speed);
                    this.direction = dx > 0 ? 1 : -1;
                    this.isMoving = true;
                } else {
                    this.aiState = 'idle';
                    this.isMoving = false;
                    this.wanderTarget = null;

                    // Chance to "pollinate" when stopping
                    if (Math.random() < 0.3) {
                        this.isPollinatiing = true;
                        this.pollinateTimer = 1 + Math.random();
                    }
                }
            } else if (this.isPollinatiing) {
                this.pollinateTimer -= dt;
                if (this.pollinateTimer <= 0) {
                    this.isPollinatiing = false;
                }
                this.isMoving = false;
            } else {
                this.isMoving = false;
            }
        }

        pickNewWanderTarget() {
            const angle = Math.random() * Math.PI * 2;
            const dist = 1 + Math.random() * CONFIG.WANDER_DISTANCE;
            const targetX = this.x + Math.cos(angle) * dist;
            const targetY = this.y + Math.sin(angle) * dist;
            if (!this.isPositionBlocked(targetX, targetY)) {
                this.wanderTarget = { x: targetX, y: targetY };
                this.aiState = 'wander';
            }
        }

        updateFlee(dt) {
            if (!this.fleeFrom) return;
            const dx = this.x - this.fleeFrom.x;
            const dy = this.y - this.fleeFrom.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > CONFIG.FLEE_DISTANCE || dist < 0.1) {
                this.fleeTimer = 0;
                this.fleeFrom = null;
                this.aiState = 'idle';
                this.isMoving = false;
                return;
            }

            const fleeSpeed = this.speed * CONFIG.FLEE_SPEED_MULTIPLIER;
            const fleeX = this.x + (dx / dist) * fleeSpeed * dt;
            const fleeY = this.y + (dy / dist) * fleeSpeed * dt;

            if (!this.isPositionBlocked(fleeX, fleeY)) {
                this.x = fleeX;
                this.y = fleeY;
                this.direction = dx > 0 ? 1 : -1;
            }
            this.isMoving = true;
        }

        moveToward(targetX, targetY, dt, speed) {
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.1) return;

            const moveX = (dx / dist) * speed * dt;
            const moveY = (dy / dist) * speed * dt;
            const newX = this.x + moveX;
            const newY = this.y + moveY;

            if (!this.isPositionBlocked(newX, newY)) {
                this.x = newX;
                this.y = newY;
                this.direction = dx > 0 ? 1 : -1;
            }
        }

        isPositionBlocked(x, y) {
            if (typeof isSolidAt === 'function') {
                return isSolidAt(x, y, this.size * 0.3);
            }
            return false;
        }

        feed(foodItem) {
            if (!this.type.tameFoods.includes(foodItem) && foodItem !== 'food') {
                return false;
            }

            if (this.isTamed) {
                this.hunger = Math.min(100, this.hunger + 30);
                this.happiness = Math.min(100, this.happiness + 10);
                this.heartTimer = 1;
                if (typeof spawnParticles === 'function') {
                    spawnParticles(this.x, this.y - 0.5, '#ff69b4', 5);
                }
                return true;
            }

            if (this.type.tameable) {
                this.trust += CONFIG.TAME_FEED_TRUST;
                this.patience = CONFIG.TAME_PATIENCE_MAX;
                this.heartTimer = 1;

                if (typeof spawnParticles === 'function') {
                    spawnParticles(this.x, this.y - 0.5, '#ffff00', 5);
                }

                if (this.trust >= CONFIG.TAME_TRUST_THRESHOLD) {
                    this.tame();
                }
                return true;
            }
            return false;
        }

        pet() {
            if (this.isTamed) {
                this.happiness = Math.min(100, this.happiness + 15);
                this.loyalty = Math.min(100, this.loyalty + 2);
                this.heartTimer = 1;
                if (typeof spawnParticles === 'function') {
                    spawnParticles(this.x, this.y - 0.5, '#ff69b4', 3);
                }
                return true;
            }

            if (this.type.tameable && !this.isBeingTamed) {
                this.trust += CONFIG.TAME_PET_TRUST;
                this.heartTimer = 0.5;
                if (this.trust >= CONFIG.TAME_TRUST_THRESHOLD) {
                    this.tame();
                }
                return true;
            }
            return false;
        }

        tame() {
            this.isTamed = true;
            this.trust = CONFIG.TAME_TRUST_THRESHOLD;
            this.isBeingTamed = false;
            this.owner = 'player';
            this.isFollowing = true;
            this.happiness = 80;
            this.hunger = 80;
            this.loyalty = 30;

            const idx = wildAnimals.indexOf(this);
            if (idx !== -1) {
                wildAnimals.splice(idx, 1);
            }
            if (!tamedPets.includes(this)) {
                tamedPets.push(this);
            }

            activeTamingTarget = null;

            if (typeof showNotification === 'function') {
                showNotification(`${this.type.icon} ${this.type.name} has been tamed!`, []);
            }
            if (typeof spawnParticles === 'function') {
                spawnParticles(this.x, this.y, '#ffd700', 15);
            }

            EventBus.emit('pet:tamed', { pet: this, type: this.type });
        }

        takeDamage(amount, source) {
            this.health -= amount;
            this.hitTimer = 0.3;

            if (source && source.x !== undefined) {
                const dx = this.x - source.x;
                const dy = this.y - source.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                this.knockbackX = (dx / dist) * 5;
                this.knockbackY = (dy / dist) * 5;
            }

            if (this.type.fleeOnHit && source && !this.isTamed) {
                this.fleeFrom = source;
                this.fleeTimer = 3;
                this.aiState = 'flee';
                this.isBeingTamed = false;
                if (activeTamingTarget === this) {
                    activeTamingTarget = null;
                }
            }

            if (typeof addDamageNumber === 'function') {
                addDamageNumber(this.x, this.y - 0.5, Math.floor(amount), '#ff4444');
            }
            if (typeof spawnParticles === 'function') {
                const color = this.type.isSlime ? this.slimeColor?.body || '#44dd44' : '#ff0000';
                spawnParticles(this.x, this.y, color, 5);
            }

            if (this.health <= 0) {
                this.die();
            }
        }

        die() {
            if (this.type.drops && !this.isTamed) {
                for (const drop of this.type.drops) {
                    if (Math.random() <= drop.chance) {
                        const amount = drop.min + Math.floor(Math.random() * (drop.max - drop.min + 1));
                        if (amount > 0 && typeof resources !== 'undefined') {
                            resources[drop.item] = (resources[drop.item] || 0) + amount;
                            if (typeof showNotification === 'function') {
                                showNotification(`+${amount} ${drop.item}`, []);
                            }
                        }
                    }
                }
            }

            if (typeof spawnParticles === 'function') {
                spawnParticles(this.x, this.y, '#ffffff', 15);
            }

            const wildIdx = wildAnimals.indexOf(this);
            if (wildIdx !== -1) wildAnimals.splice(wildIdx, 1);

            const petIdx = tamedPets.indexOf(this);
            if (petIdx !== -1) {
                tamedPets.splice(petIdx, 1);
                if (typeof showNotification === 'function') {
                    showNotification(`Your ${this.type.name} has died...`, []);
                }
            }

            if (activeTamingTarget === this) activeTamingTarget = null;

            EventBus.emit('animal:killed', { animal: this, type: this.type, wasTamed: this.isTamed });
        }
    }

    // ============= BREEDING =============
    function tryBreed(pet1, pet2) {
        if (pet1.typeId !== pet2.typeId) return null;
        if (!pet1.type.breedable || !pet2.type.breedable) return null;
        if (!pet1.isAdult || !pet2.isAdult) return null;
        if (pet1.breedCooldown > 0 || pet2.breedCooldown > 0) return null;
        if (pet1.happiness < CONFIG.BREED_HAPPINESS_REQ || pet2.happiness < CONFIG.BREED_HAPPINESS_REQ) return null;
        if (pet1.hunger < CONFIG.BREED_HUNGER_REQ || pet2.hunger < CONFIG.BREED_HUNGER_REQ) return null;

        const midX = (pet1.x + pet2.x) / 2;
        const midY = (pet1.y + pet2.y) / 2;

        const baby = new Animal(pet1.typeId, midX, midY, true);
        if (!baby.isValid) return null;

        baby.isAdult = false;
        baby.size = pet1.type.size * 0.5;
        baby.growthTimer = 0;
        baby.isFollowing = true;

        pet1.breedCooldown = CONFIG.BREED_COOLDOWN;
        pet2.breedCooldown = CONFIG.BREED_COOLDOWN;
        pet1.happiness -= 20;
        pet2.happiness -= 20;
        pet1.hunger -= 30;
        pet2.hunger -= 30;

        tamedPets.push(baby);

        if (typeof showNotification === 'function') {
            showNotification(`${pet1.type.icon} A baby ${pet1.type.name} was born!`, []);
        }
        if (typeof spawnParticles === 'function') {
            spawnParticles(midX, midY, '#ff69b4', 20);
        }

        EventBus.emit('pet:bred', { parent1: pet1, parent2: pet2, baby: baby });
        return baby;
    }

    // ============= SPAWNING =============
    function spawnAnimal(typeId, x, y) {
        const animal = new Animal(typeId, x, y);
        if (animal.isValid) {
            wildAnimals.push(animal);
            EventBus.emit('animal:spawned', { animal: animal, type: animal.type });
            return animal;
        }
        return null;
    }

    function getWeightedRandomType() {
        const types = Object.values(ANIMAL_TYPES);
        const totalWeight = types.reduce((sum, t) => sum + t.spawnWeight, 0);
        let random = Math.random() * totalWeight;
        for (const type of types) {
            random -= type.spawnWeight;
            if (random <= 0) return type.id.toUpperCase();
        }
        return 'SHEEP';
    }

    function spawnNearbyAnimals(centerX, centerY, count = 2) {
        const spawned = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = CONFIG.SPAWN_RADIUS_MIN + Math.random() * (CONFIG.SPAWN_RADIUS_MAX - CONFIG.SPAWN_RADIUS_MIN);
            const x = centerX + Math.cos(angle) * dist;
            const y = centerY + Math.sin(angle) * dist;

            if (typeof isSolidAt === 'function' && isSolidAt(x, y, 0.5)) continue;

            const typeId = getWeightedRandomType();
            const animal = spawnAnimal(typeId, x, y);
            if (animal) spawned.push(animal);
        }
        return spawned;
    }

    // ============= UPDATE =============
    function update(dt) {
        if (typeof player === 'undefined') return;

        spawnTimer += dt;
        if (spawnTimer >= CONFIG.SPAWN_INTERVAL) {
            spawnTimer = 0;
            if (wildAnimals.length < CONFIG.MAX_WILD_ANIMALS && Math.random() < CONFIG.SPAWN_CHANCE) {
                const count = 1 + Math.floor(Math.random() * 2);
                spawnNearbyAnimals(player.x, player.y, count);
            }
        }

        for (let i = wildAnimals.length - 1; i >= 0; i--) {
            const animal = wildAnimals[i];
            animal.update(dt);
            const distToPlayer = Math.sqrt((animal.x - player.x) ** 2 + (animal.y - player.y) ** 2);
            if (distToPlayer > CONFIG.DESPAWN_DISTANCE) {
                wildAnimals.splice(i, 1);
            }
        }

        for (const pet of tamedPets) {
            pet.update(dt);
        }
    }

    // ============= INTERACTION =============
    function getAnimalAt(x, y, radius = 0.8) {
        for (const animal of wildAnimals) {
            const dist = Math.sqrt((animal.x - x) ** 2 + (animal.y - y) ** 2);
            if (dist < radius) return animal;
        }
        for (const pet of tamedPets) {
            const dist = Math.sqrt((pet.x - x) ** 2 + (pet.y - y) ** 2);
            if (dist < radius) return pet;
        }
        return null;
    }

    function startTaming(animal) {
        if (!animal || animal.isTamed || !animal.type.tameable) return false;
        if (activeTamingTarget && activeTamingTarget !== animal) {
            activeTamingTarget.isBeingTamed = false;
        }
        animal.isBeingTamed = true;
        animal.patience = CONFIG.TAME_PATIENCE_MAX;
        activeTamingTarget = animal;
        return true;
    }

    function feedAnimal(animal, foodItem) {
        if (!animal) return false;
        return animal.feed(foodItem);
    }

    function petAnimal(animal) {
        if (!animal) return false;
        return animal.pet();
    }

    function toggleFollow(pet) {
        if (!pet || !pet.isTamed) return false;
        pet.isFollowing = !pet.isFollowing;
        return true;
    }

    function setAllFollow(follow) {
        for (const pet of tamedPets) {
            pet.isFollowing = follow;
        }
    }

    // ============= RENDERING =============
    function renderAnimals(ctx) {
        const cam = typeof camera !== 'undefined' ? camera : { x: 0, y: 0 };
        const all = [...wildAnimals, ...tamedPets].sort((a, b) => a.y - b.y);

        for (const animal of all) {
            if (typeof window.renderAnimalSprite === 'function') {
                window.renderAnimalSprite(ctx, animal, cam);
            }

            if (animal.isTamed || animal.heartTimer > 0) {
                renderPetIndicators(ctx, animal, cam);
            }

            if (animal.isBeingTamed) {
                renderTamingProgress(ctx, animal, cam);
            }
        }
    }

    function renderPetIndicators(ctx, animal, cam) {
        const s = (typeof TILE_SIZE !== 'undefined' ? TILE_SIZE : 16) * (typeof SCALE !== 'undefined' ? SCALE : 3);
        const screenX = (animal.x - 0.5) * s - cam.x + s * 0.5;
        const screenY = (animal.y - 0.5) * s - cam.y;

        if (animal.heartTimer > 0) {
            ctx.fillStyle = '#ff69b4';
            ctx.font = `${s * 0.4}px Arial`;
            ctx.textAlign = 'center';
            const heartY = screenY - s * 0.3 - Math.sin(animal.heartTimer * 5) * 5;
            ctx.fillText('❤', screenX, heartY);
        }

        if (animal.isTamed && animal.isFollowing) {
            ctx.fillStyle = 'rgba(100, 200, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(screenX, screenY + s * 0.4, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function renderTamingProgress(ctx, animal, cam) {
        const s = (typeof TILE_SIZE !== 'undefined' ? TILE_SIZE : 16) * (typeof SCALE !== 'undefined' ? SCALE : 3);
        const screenX = (animal.x - 0.5) * s - cam.x;
        const screenY = (animal.y - 0.5) * s - cam.y;

        const barWidth = s * 0.8;
        const barHeight = 6;
        const barX = screenX + s * 0.5 - barWidth / 2;
        const barY = screenY - 15;

        const trustPercent = animal.trust / CONFIG.TAME_TRUST_THRESHOLD;
        const patiencePercent = animal.patience / CONFIG.TAME_PATIENCE_MAX;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight * 2 + 5);

        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = '#ff69b4';
        ctx.fillRect(barX, barY, barWidth * trustPercent, barHeight);

        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY + barHeight + 2, barWidth, barHeight);
        ctx.fillStyle = patiencePercent > 0.3 ? '#44dd44' : '#dd4444';
        ctx.fillRect(barX, barY + barHeight + 2, barWidth * patiencePercent, barHeight);
    }

    // ============= GETTERS =============
    function getWildAnimals() { return [...wildAnimals]; }
    function getTamedPets() { return [...tamedPets]; }
    function getAnimalTypes() { return ANIMAL_TYPES; }
    function getActiveTamingTarget() { return activeTamingTarget; }

    // ============= STATE MANAGEMENT =============
    function getState() {
        const serializeAnimal = a => ({
            id: a.id, typeId: a.typeId, x: a.x, y: a.y, health: a.health,
            direction: a.direction, isTamed: a.isTamed, trust: a.trust,
            hunger: a.hunger, happiness: a.happiness, loyalty: a.loyalty,
            isFollowing: a.isFollowing, breedCooldown: a.breedCooldown,
            isAdult: a.isAdult, growthTimer: a.growthTimer, slimeColor: a.slimeColor
        });
        return {
            wild: wildAnimals.map(serializeAnimal),
            pets: tamedPets.map(serializeAnimal),
            nextId: nextAnimalId
        };
    }

    function setState(state) {
        if (!state) return;
        wildAnimals = [];
        tamedPets = [];

        const loadAnimal = (data, tamed) => {
            const a = new Animal(data.typeId, data.x, data.y, tamed);
            if (!a.isValid) return null;
            Object.assign(a, {
                id: data.id, health: data.health, direction: data.direction,
                trust: data.trust, hunger: data.hunger, happiness: data.happiness,
                loyalty: data.loyalty, isFollowing: data.isFollowing,
                breedCooldown: data.breedCooldown, isAdult: data.isAdult,
                growthTimer: data.growthTimer
            });
            if (data.slimeColor) a.slimeColor = data.slimeColor;
            return a;
        };

        if (state.wild) {
            for (const d of state.wild) {
                const a = loadAnimal(d, false);
                if (a) wildAnimals.push(a);
            }
        }
        if (state.pets) {
            for (const d of state.pets) {
                const a = loadAnimal(d, true);
                if (a) tamedPets.push(a);
            }
        }
        nextAnimalId = state.nextId || 1;
    }

    function reset() {
        wildAnimals = [];
        tamedPets = [];
        spawnTimer = 0;
        nextAnimalId = 1;
        activeTamingTarget = null;
    }

    return {
        CONFIG, ANIMAL_TYPES,
        spawnAnimal, spawnNearbyAnimals,
        getAnimalAt, startTaming, feedAnimal, petAnimal,
        toggleFollow, setAllFollow, tryBreed,
        getWildAnimals, getTamedPets, getAnimalTypes, getActiveTamingTarget,
        update, renderAnimals, renderPets: renderAnimals,
        getState, setState, reset
    };
})();

window.PetSystem = PetSystem;
