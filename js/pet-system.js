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
        PATH_REPATH_INTERVAL: 1.0,
        PATH_STUCK_TIMEOUT: 0.45,
        PATH_NODE_REACH: 0.2,
        PATH_LOOKAHEAD_RADIUS: 0.24,
        DIRECTION_MIN_DELTA: 0.006,
        DIRECTION_REVERSE_MIN_DELTA: 0.02,

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
            size: 0.85,
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
            size: 0.55,
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
            size: 0.72,
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
            size: 1.5,
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
            this.prevX = x;
            this.prevY = y;

            // Stats
            this.health = type.baseStats.health;
            this.maxHealth = type.baseStats.health;
            this.speed = type.baseStats.speed;
            this.size = type.size;

            // Movement state
            this.vx = 0;
            this.vy = 0;
            this.direction = 1; // Default Down
            this.isMoving = false;

            // AI State
            this.aiState = 'idle';
            this.wanderTarget = null;
            this.wanderTimer = Math.random() * CONFIG.WANDER_INTERVAL_MAX;
            this.fleeTimer = 0;
            this.fleeFrom = null;
            this.path = null;
            this.pathIndex = 0;
            this.repathTimer = 0;
            this.stuckTimer = 0;

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

            this.prevX = this.x;
            this.prevY = this.y;

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
                const dxToGoal = this.wanderTarget.x - this.x;
                const dyToGoal = this.wanderTarget.y - this.y;
                const distToGoal = Math.sqrt(dxToGoal * dxToGoal + dyToGoal * dyToGoal);

                if (distToGoal > 0.3) {
                    this.repathTimer -= dt;
                    if (!this.path || this.pathIndex >= this.path.length || this.repathTimer <= 0) {
                        this.planPathToTarget();
                    }

                    let moveTarget = this.wanderTarget;
                    if (this.path && this.pathIndex < this.path.length) {
                        if (typeof pathfinder !== 'undefined' && this.pathIndex < this.path.length - 1) {
                            for (let i = this.path.length - 1; i > this.pathIndex; i--) {
                                const candidate = this.path[i];
                                if (pathfinder.hasDirectPath(this.x, this.y, candidate.x, candidate.y, CONFIG.PATH_LOOKAHEAD_RADIUS)) {
                                    this.pathIndex = i;
                                    break;
                                }
                            }
                        }

                        while (this.pathIndex < this.path.length) {
                            const node = this.path[this.pathIndex];
                            const ndx = node.x - this.x;
                            const ndy = node.y - this.y;
                            const nDist = Math.sqrt(ndx * ndx + ndy * ndy);
                            if (nDist < CONFIG.PATH_NODE_REACH) {
                                this.pathIndex++;
                            } else {
                                moveTarget = node;
                                break;
                            }
                        }
                    }

                    const moved = this.moveToward(moveTarget.x, moveTarget.y, dt, this.speed);
                    this.isMoving = moved;
                    if (moved) {
                        this.stuckTimer = 0;
                    } else {
                        this.stuckTimer += dt;
                        if (this.stuckTimer >= CONFIG.PATH_STUCK_TIMEOUT) {
                            this.planPathToTarget(true);
                            this.stuckTimer = 0;
                        }
                    }
                } else {
                    this.aiState = 'idle';
                    this.isMoving = false;
                    this.wanderTarget = null;
                    this.path = null;
                    this.pathIndex = 0;
                    this.repathTimer = 0;
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
                            this.updateDirectionFromMotion(this.vx, this.vy, dx, dy);
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

        pickNewWanderTarget() {
            const angle = Math.random() * Math.PI * 2;
            const dist = 1 + Math.random() * CONFIG.WANDER_DISTANCE;
            const targetX = this.x + Math.cos(angle) * dist;
            const targetY = this.y + Math.sin(angle) * dist;

            if (!this.isPositionBlocked(targetX, targetY)) {
                this.wanderTarget = { x: targetX, y: targetY };
                this.aiState = 'wander';
                this.planPathToTarget(true);
            }
        }

        planPathToTarget(force = false) {
            if (!this.wanderTarget) return;
            if (!force && this.repathTimer > 0) return;

            this.repathTimer = CONFIG.PATH_REPATH_INTERVAL + Math.random() * 0.4;

            if (typeof pathfinder === 'undefined' || typeof pathfinder.findPath !== 'function') {
                this.path = null;
                this.pathIndex = 0;
                return;
            }

            const path = pathfinder.findPath(this.x, this.y, this.wanderTarget.x, this.wanderTarget.y);
            if (Array.isArray(path) && path.length > 0) {
                this.path = path;
                this.pathIndex = 0;
            } else {
                this.path = null;
                this.pathIndex = 0;
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
            const moved = this.moveToward(
                this.x + (dx / dist),
                this.y + (dy / dist),
                dt,
                fleeSpeed
            );
            this.isMoving = moved;
        }

        moveToward(targetX, targetY, dt, speed) {
            const startX = this.x;
            const startY = this.y;
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 0.1) return false;

            // Clamp step to avoid overshooting the target and direction flicker near stop.
            const step = Math.min(speed * dt, dist);
            const moveX = (dx / dist) * step;
            const moveY = (dy / dist) * step;
            let moved = false;

            const fullX = this.x + moveX;
            const fullY = this.y + moveY;
            if (!this.isPositionBlocked(fullX, fullY)) {
                this.x = fullX;
                this.y = fullY;
                moved = true;
            } else {
                // Slide on the most promising axis first, then the other axis.
                if (Math.abs(moveX) >= Math.abs(moveY)) {
                    if (!this.isPositionBlocked(this.x + moveX, this.y)) {
                        this.x += moveX;
                        moved = true;
                    } else if (!this.isPositionBlocked(this.x, this.y + moveY)) {
                        this.y += moveY;
                        moved = true;
                    }
                } else {
                    if (!this.isPositionBlocked(this.x, this.y + moveY)) {
                        this.y += moveY;
                        moved = true;
                    } else if (!this.isPositionBlocked(this.x + moveX, this.y)) {
                        this.x += moveX;
                        moved = true;
                    }
                }
            }

            const actualDx = this.x - startX;
            const actualDy = this.y - startY;
            this.updateDirectionFromMotion(actualDx, actualDy, dx, dy);
            return moved;
        }

        updateDirectionFromMotion(actualDx, actualDy, intendedDx, intendedDy) {
            let dirDx = actualDx;
            let dirDy = actualDy;

            const absDx = Math.abs(dirDx);
            const absDy = Math.abs(dirDy);
            if (absDx < CONFIG.DIRECTION_MIN_DELTA && absDy < CONFIG.DIRECTION_MIN_DELTA) return;

            const buffer = 0.12;
            const wasDir = this.direction;
            let nextDir = this.direction;

            if (absDx > absDy * (1 + buffer)) {
                nextDir = dirDx >= 0 ? 0 : 2;
            } else if (absDy > absDx * (1 + buffer)) {
                nextDir = dirDy >= 0 ? 1 : 3;
            } else {
                // In near-diagonal ties, keep current axis preference for visual stability.
                const isHorz = (this.direction === 0 || this.direction === 2);
                nextDir = isHorz ? (dirDx >= 0 ? 0 : 2) : (dirDy >= 0 ? 1 : 3);
            }

            const isReverse =
                (wasDir === 0 && nextDir === 2) ||
                (wasDir === 2 && nextDir === 0) ||
                (wasDir === 1 && nextDir === 3) ||
                (wasDir === 3 && nextDir === 1);

            if (isReverse) {
                const moveMag = Math.sqrt(dirDx * dirDx + dirDy * dirDy);
                if (moveMag < CONFIG.DIRECTION_REVERSE_MIN_DELTA) return;
            }

            this.direction = nextDir;
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

            const typeId = getWeightedRandomType();
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
            if (distToPlayer > CONFIG.DESPAWN_DISTANCE) {
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
        animal.takeDamage(damage, source);
        return true;
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
                slimeColor: a.slimeColor
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

        // Getters
        getWildAnimals,
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
