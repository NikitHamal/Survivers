// ============================================
// PET SYSTEM - Farm Animals & Slimes
// ============================================
// Simplified pet system with sheep, chickens, pigs, and slimes

const PetSystem = (function () {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        // Wildlife spawning
        SPAWN_INTERVAL: 20,
        SPAWN_CHANCE: 0.5,
        MAX_WILD_ANIMALS: 12,
        DESPAWN_DISTANCE: 30,
        SPAWN_RADIUS_MIN: 8,
        SPAWN_RADIUS_MAX: 15,

        // Animal behavior
        WANDER_INTERVAL_MIN: 3,
        WANDER_INTERVAL_MAX: 8,
        WANDER_DISTANCE: 4,
        FLEE_DISTANCE: 6,
        FLEE_SPEED_MULTIPLIER: 1.5,

        // Taming
        TAME_RANGE: 1.4,
        TAME_FOOD_COST: 2,
        TAME_BASE_CHANCE: 0.35,
        TAME_PROGRESS_GAIN: 0.45,
        TAMED_FOLLOW_DISTANCE: 2.2,
        TAMED_TELEPORT_DISTANCE: 14,
        TAMED_SPEED_MULTIPLIER: 1.25,

        // Slime behavior
        SLIME_BOUNCE_INTERVAL: 1.5,
        SLIME_BOUNCE_HEIGHT: 0.4,
        SLIME_SQUASH_DURATION: 0.15
    };

    // ============= ANIMAL DEFINITIONS =============
    const ANIMAL_TYPES = {
        SHEEP: {
            id: 'sheep',
            name: 'Sheep',
            icon: '🐑',
            baseStats: { health: 30, speed: 2.5 },
            size: 0.7,
            tameable: true,
            drops: [
                { item: 'wool', min: 1, max: 3, chance: 1.0 },
                { item: 'meat', min: 1, max: 2, chance: 0.8 }
            ],
            sounds: { idle: 'baa', hurt: 'baa_hurt' },
            fleeOnHit: true,
            spawnWeight: 3,
            spawnBiomes: ['grass', 'plains']
        },

        CHICKEN: {
            id: 'chicken',
            name: 'Chicken',
            icon: '🐔',
            baseStats: { health: 15, speed: 3.5 },
            size: 0.4,
            tameable: true,
            drops: [
                { item: 'feather', min: 1, max: 3, chance: 1.0 },
                { item: 'meat', min: 1, max: 1, chance: 0.7 }
            ],
            sounds: { idle: 'cluck', hurt: 'squawk' },
            fleeOnHit: true,
            spawnWeight: 4,
            spawnBiomes: ['grass', 'plains', 'forest']
        },

        PIG: {
            id: 'pig',
            name: 'Pig',
            icon: '🐷',
            baseStats: { health: 40, speed: 2.0 },
            size: 0.65,
            tameable: true,
            drops: [
                { item: 'pork', min: 2, max: 4, chance: 1.0 },
                { item: 'leather', min: 0, max: 1, chance: 0.3 }
            ],
            sounds: { idle: 'oink', hurt: 'squeal' },
            fleeOnHit: true,
            spawnWeight: 3,
            spawnBiomes: ['grass', 'plains', 'forest']
        },

        SLIME: {
            id: 'slime',
            name: 'Slime',
            icon: '🟢',
            baseStats: { health: 25, speed: 1.5 },
            size: 0.5,
            tameable: false,
            drops: [
                { item: 'slimeball', min: 1, max: 3, chance: 1.0 }
            ],
            sounds: { idle: 'squish', hurt: 'splat' },
            fleeOnHit: false,
            spawnWeight: 2,
            spawnBiomes: ['grass', 'swamp', 'forest'],
            isSlime: true,
            hostile: false // Slimes are NOT hostile
        }
    };

    // ============= STATE =============
    let wildAnimals = [];
    let spawnTimer = 0;
    let nextAnimalId = 1;

    // ============= ANIMAL CLASS =============
    class Animal {
        constructor(typeId, x, y) {
            const type = ANIMAL_TYPES[typeId] || ANIMAL_TYPES[typeId?.toUpperCase()];
            if (!type) {
                console.error(`Invalid animal type: ${typeId}`);
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
            this.size = type.size;

            // Movement state
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

            // Animation
            this.animTimer = Math.random() * Math.PI * 2;
            this.frame = 0;

            // Slime-specific
            if (type.isSlime) {
                this.bounceTimer = Math.random() * CONFIG.SLIME_BOUNCE_INTERVAL;
                this.bouncePhase = 0; // 0 = idle, 1 = squash, 2 = jump, 3 = land
                this.bounceHeight = 0;
                this.squashAmount = 0;
                this.slimeColor = this.getRandomSlimeColor();
            }

            // Hit feedback
            this.hitTimer = 0;
            this.knockbackX = 0;
            this.knockbackY = 0;

            // Taming
            this.isTamed = false;
            this.tameProgress = 0;
            this.followOwner = true;
        }

        getRandomSlimeColor() {
            const colors = [
                { body: '#44dd44', light: '#66ff66', dark: '#22aa22' }, // Green
                { body: '#4488ff', light: '#66aaff', dark: '#2266cc' }, // Blue
                { body: '#ff88dd', light: '#ffaaee', dark: '#cc66aa' }, // Pink
                { body: '#ffcc44', light: '#ffee66', dark: '#ccaa22' }  // Yellow
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        update(dt) {
            if (!this.isValid) return;

            this.animTimer += dt;
            this.hitTimer = Math.max(0, this.hitTimer - dt);

            // Apply knockback
            if (this.knockbackX !== 0 || this.knockbackY !== 0) {
                const decay = 5 * dt;
                this.x += this.knockbackX * dt;
                this.y += this.knockbackY * dt;
                this.knockbackX *= Math.max(0, 1 - decay);
                this.knockbackY *= Math.max(0, 1 - decay);
                if (Math.abs(this.knockbackX) < 0.1) this.knockbackX = 0;
                if (Math.abs(this.knockbackY) < 0.1) this.knockbackY = 0;
            }

            if (this.isTamed) {
                this.updateTamedAI(dt);
                return;
            }

            // Update AI based on type
            if (this.type.isSlime) {
                this.updateSlimeAI(dt);
            } else {
                this.updateAnimalAI(dt);
            }
        }

        updateAnimalAI(dt) {
            // Check for fleeing
            if (this.fleeTimer > 0) {
                this.fleeTimer -= dt;
                this.updateFlee(dt);
                return;
            }

            // Wander behavior
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

            // Bounce phases
            if (this.bouncePhase === 0) { // Idle
                this.squashAmount = 0;
                this.bounceHeight = 0;

                if (this.bounceTimer <= 0) {
                    this.bouncePhase = 1; // Start squash
                    this.bounceTimer = CONFIG.SLIME_SQUASH_DURATION;
                    this.pickNewWanderTarget();
                }
            } else if (this.bouncePhase === 1) { // Squashing down
                this.squashAmount = 1 - (this.bounceTimer / CONFIG.SLIME_SQUASH_DURATION);

                if (this.bounceTimer <= 0) {
                    this.bouncePhase = 2; // Jump
                    this.bounceTimer = 0.3;

                    // Set velocity for jump
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
            } else if (this.bouncePhase === 2) { // In air
                const jumpProgress = 1 - (this.bounceTimer / 0.3);
                this.bounceHeight = CONFIG.SLIME_BOUNCE_HEIGHT * Math.sin(jumpProgress * Math.PI);
                this.squashAmount = -0.2; // Stretch while jumping

                // Move during jump
                const newX = this.x + this.vx * dt;
                const newY = this.y + this.vy * dt;
                if (!this.isPositionBlocked(newX, newY)) {
                    this.x = newX;
                    this.y = newY;
                }

                if (this.bounceTimer <= 0) {
                    this.bouncePhase = 3; // Land
                    this.bounceTimer = CONFIG.SLIME_SQUASH_DURATION;
                    this.vx = 0;
                    this.vy = 0;
                }
            } else if (this.bouncePhase === 3) { // Landing
                this.bounceHeight = 0;
                this.squashAmount = 0.3 * (this.bounceTimer / CONFIG.SLIME_SQUASH_DURATION);

                if (this.bounceTimer <= 0) {
                    this.bouncePhase = 0; // Back to idle
                    this.bounceTimer = CONFIG.SLIME_BOUNCE_INTERVAL + Math.random() * 1;
                    this.wanderTarget = null;
                }
            }

            this.isMoving = this.bouncePhase === 2;
        }

        updateTamedAI(dt) {
            if (typeof player === 'undefined') return;

            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > CONFIG.TAMED_TELEPORT_DISTANCE) {
                const angle = Math.random() * Math.PI * 2;
                this.x = player.x + Math.cos(angle) * 1.5;
                this.y = player.y + Math.sin(angle) * 1.5;
                return;
            }

            if (dist > CONFIG.TAMED_FOLLOW_DISTANCE) {
                this.moveToward(player.x, player.y, dt, this.speed * CONFIG.TAMED_SPEED_MULTIPLIER);
                this.isMoving = true;
            } else {
                this.isMoving = false;
            }
        }

        tryTame() {
            if (!this.type.tameable || this.isTamed) return false;

            const healthRatio = this.health / this.maxHealth;
            const chance = Math.min(0.9, CONFIG.TAME_BASE_CHANCE + (1 - healthRatio) * 0.2);
            const roll = Math.random();
            const progressGain = roll < chance ? CONFIG.TAME_PROGRESS_GAIN : CONFIG.TAME_PROGRESS_GAIN * 0.5;
            this.tameProgress = Math.min(1, this.tameProgress + progressGain);

            if (this.tameProgress >= 1) {
                this.isTamed = true;
                this.followOwner = true;
                this.tameProgress = 1;
                EventBus.emit('animal:tamed', { animal: this, type: this.type });
                return true;
            }

            return false;
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

        takeDamage(amount, source) {
            this.health -= amount;
            this.hitTimer = 0.3;

            // Knockback
            if (source && source.x !== undefined) {
                const dx = this.x - source.x;
                const dy = this.y - source.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                this.knockbackX = (dx / dist) * 5;
                this.knockbackY = (dy / dist) * 5;
            }

            // Flee behavior for animals that flee
            if (this.type.fleeOnHit && source) {
                this.fleeFrom = source;
                this.fleeTimer = 3;
                this.aiState = 'flee';
            }

            // Damage number
            if (typeof addDamageNumber === 'function') {
                addDamageNumber(this.x, this.y - 0.5, Math.floor(amount), '#ff4444');
            }

            // Particles
            if (typeof spawnParticles === 'function') {
                const color = this.type.isSlime ? this.slimeColor?.body || '#44dd44' : '#ff0000';
                spawnParticles(this.x, this.y, color, 5, 'blood');
            }

            if (this.health <= 0) {
                this.die();
            }
        }

        die() {
            // Drop items
            if (this.type.drops) {
                for (const drop of this.type.drops) {
                    if (Math.random() <= drop.chance) {
                        const amount = drop.min + Math.floor(Math.random() * (drop.max - drop.min + 1));
                        if (amount > 0) {
                            // Add to resources
                            if (typeof resources !== 'undefined') {
                                resources[drop.item] = (resources[drop.item] || 0) + amount;
                            }

                            // Show notification
                            if (typeof showNotification === 'function') {
                                showNotification(`+${amount} ${drop.item}`, []);
                            }

                            // Spawn item pickup particles
                            if (typeof spawnParticles === 'function') {
                                const colors = {
                                    wool: '#f0f0f0',
                                    meat: '#cc4444',
                                    pork: '#ffaaaa',
                                    feather: '#ffffff',
                                    leather: '#8b4513',
                                    slimeball: '#44ff44'
                                };
                                spawnParticles(this.x, this.y, colors[drop.item] || '#ffff00', 8, 'item');
                            }
                        }
                    }
                }
            }

            // Death particles
            if (typeof spawnParticles === 'function') {
                const color = this.type.isSlime ? this.slimeColor?.body || '#44dd44' : '#ffffff';
                spawnParticles(this.x, this.y, color, 15, 'death');
            }

            // Remove from array
            const idx = wildAnimals.indexOf(this);
            if (idx !== -1) {
                wildAnimals.splice(idx, 1);
            }

            EventBus.emit('animal:killed', { animal: this, type: this.type });
        }
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
            if (random <= 0) {
                return type.id.toUpperCase();
            }
        }
        return 'SHEEP';
    }

    function getWeightedRandomTypeForBiome(biomeId) {
        const types = Object.values(ANIMAL_TYPES);
        const filtered = biomeId
            ? types.filter(t => !t.spawnBiomes || t.spawnBiomes.includes(biomeId))
            : types;
        const pool = filtered.length ? filtered : types;
        const totalWeight = pool.reduce((sum, t) => sum + t.spawnWeight, 0);
        let random = Math.random() * totalWeight;

        for (const type of pool) {
            random -= type.spawnWeight;
            if (random <= 0) {
                return type.id.toUpperCase();
            }
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

            // Check if spawn position is valid
            if (typeof isSolidAt === 'function' && isSolidAt(x, y, 0.5)) {
                continue;
            }

            const biomeId = (typeof BiomeSystem !== 'undefined' && BiomeSystem.getBiomeAt)
                ? BiomeSystem.getBiomeAt(x, y)?.id
                : null;
            const typeId = getWeightedRandomTypeForBiome(biomeId);
            const animal = spawnAnimal(typeId, x, y);
            if (animal) {
                spawned.push(animal);
            }
        }

        return spawned;
    }

    // ============= UPDATE =============
    function update(dt) {
        if (typeof player === 'undefined') return;

        // Spawn timer
        spawnTimer += dt;
        if (spawnTimer >= CONFIG.SPAWN_INTERVAL) {
            spawnTimer = 0;

            if (wildAnimals.length < CONFIG.MAX_WILD_ANIMALS && Math.random() < CONFIG.SPAWN_CHANCE) {
                const count = 1 + Math.floor(Math.random() * 2);
                spawnNearbyAnimals(player.x, player.y, count);
            }
        }

        // Update all animals
        for (let i = wildAnimals.length - 1; i >= 0; i--) {
            const animal = wildAnimals[i];
            animal.update(dt);

            // Despawn if too far from player
            const distToPlayer = Math.sqrt(
                (animal.x - player.x) ** 2 + (animal.y - player.y) ** 2
            );
            if (!animal.isTamed && distToPlayer > CONFIG.DESPAWN_DISTANCE) {
                wildAnimals.splice(i, 1);
            }
        }
    }

    // ============= INTERACTION =============
    function getAnimalAt(x, y, radius = 0.8) {
        for (const animal of wildAnimals) {
            const dist = Math.sqrt((animal.x - x) ** 2 + (animal.y - y) ** 2);
            if (dist < radius) {
                return animal;
            }
        }
        return null;
    }

    function attackAnimal(animal, damage, source) {
        if (!animal || !animal.isValid) return false;
        if (animal.isTamed && source === player) return false;
        animal.takeDamage(damage, source);
        return true;
    }

    function tryTameNearby(x, y) {
        if (typeof resources === 'undefined') return { success: false, reason: 'No resources available' };
        const animal = getAnimalAt(x, y, CONFIG.TAME_RANGE);
        if (!animal) return { success: false, reason: 'No animal nearby' };
        if (!animal.type.tameable) return { success: false, reason: 'This animal cannot be tamed' };
        if (animal.isTamed) return { success: false, reason: 'Already tamed', animal: animal };
        if ((resources.food || 0) < CONFIG.TAME_FOOD_COST) {
            return { success: false, reason: 'Need more food to tame' };
        }

        resources.food -= CONFIG.TAME_FOOD_COST;
        const tamed = animal.tryTame();
        return { success: tamed, animal: animal, reason: tamed ? 'Tamed!' : 'Gained trust' };
    }

    // ============= RENDERING =============
    function renderAnimals(ctx) {
        const cam = typeof camera !== 'undefined' ? camera : { x: 0, y: 0 };

        // Sort by Y for proper depth
        const sorted = [...wildAnimals].sort((a, b) => a.y - b.y);

        for (const animal of sorted) {
            renderAnimalSprite(ctx, animal, cam);
        }
    }

    function renderAnimalSprite(ctx, animal, cam) {
        if (!animal || !animal.type) return;

        // Use the sprite rendering from pets.js
        if (typeof window.renderAnimalSprite === 'function') {
            window.renderAnimalSprite(ctx, animal, cam);
        } else {
            // Fallback simple render
            const s = TILE_SIZE * SCALE;
            const screenX = (animal.x - 0.5) * s - cam.x;
            const screenY = (animal.y - 0.5) * s - cam.y;

            ctx.fillStyle = animal.type.isSlime ? '#44dd44' : '#888';
            ctx.beginPath();
            ctx.arc(screenX + s * 0.5, screenY + s * 0.5, s * animal.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ============= GETTERS =============
    function getWildAnimals() {
        return [...wildAnimals];
    }

    function getTamedAnimals() {
        return wildAnimals.filter(a => a.isTamed);
    }

    function getAnimalTypes() {
        return ANIMAL_TYPES;
    }

    // ============= STATE MANAGEMENT =============
    function getState() {
        return {
            animals: wildAnimals.map(a => ({
                id: a.id,
                typeId: a.typeId,
                x: a.x,
                y: a.y,
                health: a.health,
                direction: a.direction,
                slimeColor: a.slimeColor,
                isTamed: a.isTamed,
                tameProgress: a.tameProgress,
                followOwner: a.followOwner
            })),
            nextAnimalId: nextAnimalId
        };
    }

    function setState(state) {
        if (!state) return;

        wildAnimals = [];

        if (state.animals) {
            for (const data of state.animals) {
                const animal = new Animal(data.typeId, data.x, data.y);
                if (animal.isValid) {
                    animal.id = data.id;
                    animal.health = data.health;
                    animal.direction = data.direction;
                    if (data.slimeColor) {
                        animal.slimeColor = data.slimeColor;
                    }
                    animal.isTamed = !!data.isTamed;
                    animal.tameProgress = data.tameProgress || 0;
                    animal.followOwner = data.followOwner !== false;
                    wildAnimals.push(animal);
                }
            }
        }

        nextAnimalId = state.nextAnimalId || 1;
    }

    function reset() {
        wildAnimals = [];
        spawnTimer = 0;
        nextAnimalId = 1;
    }

    // ============= PUBLIC API =============
    return {
        CONFIG,
        ANIMAL_TYPES,

        // Spawning
        spawnAnimal,
        spawnNearbyAnimals,

        // Interaction
        getAnimalAt,
        attackAnimal,
        tryTameNearby,

        // Getters
        getWildAnimals,
        getTamedAnimals,
        getAnimalTypes,

        // Update & Render
        update,
        renderAnimals,
        renderPets: renderAnimals, // Alias for compatibility

        // State
        getState,
        setState,
        reset
    };
})();

window.PetSystem = PetSystem;
