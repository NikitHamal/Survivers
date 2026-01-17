// ============================================
// ANIMAL AI SYSTEM - Ecosystem Behaviors
// ============================================
// Production-grade animal AI with predator/prey dynamics,
// pack behaviors, territorial systems, and natural lifecycles

const AnimalAISystem = (function() {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        // General
        UPDATE_INTERVAL: 0.1,
        MAX_ANIMALS_ACTIVE: 50,
        SPAWN_CHECK_INTERVAL: 5.0,

        // Behavior ranges
        PERCEPTION: {
            SIGHT_RANGE: 10,
            HEARING_RANGE: 15,
            SMELL_RANGE: 8,
            PREDATOR_DETECTION: 12
        },

        // Movement
        MOVEMENT: {
            WANDER_RADIUS: 8,
            FLEE_DISTANCE: 15,
            CHASE_DISTANCE: 12,
            TERRITORY_RADIUS: 20,
            PACK_SPACING: 1.5
        },

        // Combat
        COMBAT: {
            ATTACK_RANGE: 1.0,
            ATTACK_COOLDOWN: 1.5,
            FLEE_HEALTH_THRESHOLD: 0.3
        }
    };

    // ============= ANIMAL DEFINITIONS =============
    const ANIMAL_TYPES = {
        // Passive prey
        RABBIT: {
            id: 'rabbit',
            name: 'Rabbit',
            category: 'prey',
            health: 10,
            speed: 2.5,
            damage: 0,
            loot: { food: 2 },
            exp: 5,
            fleeSpeed: 1.5,
            packSize: 0,
            territorial: false,
            nocturnal: false,
            biomes: ['plains', 'jungle', 'snow']
        },

        DEER: {
            id: 'deer',
            name: 'Deer',
            category: 'prey',
            health: 25,
            speed: 2.0,
            damage: 5,
            loot: { food: 5, leather: 1 },
            exp: 15,
            fleeSpeed: 1.4,
            packSize: 3,
            territorial: false,
            nocturnal: false,
            biomes: ['plains', 'jungle']
        },

        BOAR: {
            id: 'boar',
            name: 'Wild Boar',
            category: 'aggressive_prey',
            health: 40,
            speed: 1.8,
            damage: 12,
            loot: { food: 6, leather: 2 },
            exp: 25,
            fleeSpeed: 1.2,
            packSize: 2,
            territorial: true,
            nocturnal: false,
            biomes: ['jungle', 'swamp']
        },

        // Predators
        WOLF: {
            id: 'wolf',
            name: 'Wolf',
            category: 'predator',
            health: 35,
            speed: 2.2,
            damage: 15,
            loot: { food: 4, pelt: 1 },
            exp: 30,
            chaseSpeed: 1.3,
            packSize: 4,
            territorial: true,
            nocturnal: true,
            biomes: ['plains', 'snow']
        },

        BEAR: {
            id: 'bear',
            name: 'Bear',
            category: 'predator',
            health: 80,
            speed: 1.5,
            damage: 25,
            loot: { food: 8, pelt: 2 },
            exp: 50,
            chaseSpeed: 1.2,
            packSize: 0,
            territorial: true,
            nocturnal: false,
            biomes: ['jungle', 'snow']
        },

        TIGER: {
            id: 'tiger',
            name: 'Tiger',
            category: 'predator',
            health: 60,
            speed: 2.4,
            damage: 20,
            loot: { food: 6, pelt: 2 },
            exp: 45,
            chaseSpeed: 1.5,
            packSize: 0,
            territorial: true,
            nocturnal: true,
            biomes: ['jungle']
        },

        SNAKE: {
            id: 'snake',
            name: 'Snake',
            category: 'predator',
            health: 15,
            speed: 1.2,
            damage: 8,
            poisonDamage: 3,
            loot: { food: 2 },
            exp: 20,
            chaseSpeed: 1.0,
            packSize: 0,
            territorial: false,
            nocturnal: true,
            biomes: ['jungle', 'desert', 'swamp']
        },

        // Neutral
        FOX: {
            id: 'fox',
            name: 'Fox',
            category: 'opportunist',
            health: 20,
            speed: 2.3,
            damage: 8,
            loot: { food: 3, pelt: 1 },
            exp: 18,
            fleeSpeed: 1.4,
            packSize: 0,
            territorial: false,
            nocturnal: true,
            biomes: ['plains', 'snow']
        },

        HAWK: {
            id: 'hawk',
            name: 'Hawk',
            category: 'aerial_predator',
            health: 18,
            speed: 3.0,
            damage: 10,
            loot: { food: 2, feather: 2 },
            exp: 22,
            chaseSpeed: 1.6,
            packSize: 0,
            territorial: true,
            nocturnal: false,
            biomes: ['plains', 'desert']
        },

        // Desert
        CAMEL: {
            id: 'camel',
            name: 'Camel',
            category: 'neutral',
            health: 50,
            speed: 1.3,
            damage: 8,
            loot: { food: 7, leather: 2 },
            exp: 20,
            fleeSpeed: 1.1,
            packSize: 2,
            territorial: false,
            nocturnal: false,
            biomes: ['desert']
        },

        // Aquatic
        BEAVER: {
            id: 'beaver',
            name: 'Beaver',
            category: 'neutral',
            health: 25,
            speed: 1.4,
            damage: 6,
            loot: { food: 3, wood: 3 },
            exp: 15,
            fleeSpeed: 1.2,
            packSize: 0,
            territorial: true,
            nocturnal: false,
            biomes: ['swamp', 'plains']
        }
    };

    // ============= AI STATES =============
    const STATES = {
        IDLE: 'IDLE',
        WANDERING: 'WANDERING',
        GRAZING: 'GRAZING',
        FLEEING: 'FLEEING',
        HUNTING: 'HUNTING',
        CHASING: 'CHASING',
        ATTACKING: 'ATTACKING',
        RESTING: 'RESTING',
        PACK_FOLLOWING: 'PACK_FOLLOWING',
        TERRITORIAL_PATROL: 'TERRITORIAL_PATROL',
        RETURNING_HOME: 'RETURNING_HOME'
    };

    // ============= ANIMAL AI CLASS =============
    class AnimalAI {
        constructor(animal, typeData) {
            this.animal = animal;
            this.type = typeData;
            this.state = STATES.IDLE;
            this.stateTimer = 0;
            this.target = null;
            this.homePosition = { x: animal.x, y: animal.y };
            this.wanderTarget = null;
            this.packLeader = null;
            this.packMembers = [];
            this.territory = null;
            this.alertLevel = 0;
            this.lastSeenThreat = null;
            this.lastSeenPrey = null;
            this.attackCooldown = 0;

            // Initialize territory for territorial animals
            if (typeData.territorial) {
                this.territory = {
                    x: animal.x,
                    y: animal.y,
                    radius: CONFIG.MOVEMENT.TERRITORY_RADIUS
                };
            }
        }

        update(dt) {
            if (this.animal.health <= 0) return;

            this.stateTimer += dt;
            this.attackCooldown = Math.max(0, this.attackCooldown - dt);

            // Perception update
            this.updatePerception();

            // State machine
            this.evaluateStateTransition();
            this.executeState(dt);

            // Update animation
            this.animal.animTimer = (this.animal.animTimer || 0) + dt;
        }

        updatePerception() {
            const category = this.type.category;

            // Reset perception
            this.lastSeenThreat = null;
            this.lastSeenPrey = null;

            // Scan for threats (player and zombies for prey)
            if (category === 'prey' || category === 'aggressive_prey' || category === 'neutral') {
                this.scanForThreats();
            }

            // Scan for prey (for predators)
            if (category === 'predator' || category === 'aerial_predator' || category === 'opportunist') {
                this.scanForPrey();
            }

            // Update alert level decay
            this.alertLevel = Math.max(0, this.alertLevel - 0.1);
        }

        scanForThreats() {
            let nearestThreat = null;
            let nearestDist = CONFIG.PERCEPTION.PREDATOR_DETECTION;

            // Check player
            if (typeof player !== 'undefined') {
                const dist = this.distanceTo(player);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestThreat = player;
                }
            }

            // Check zombies
            if (typeof zombies !== 'undefined' && Array.isArray(zombies)) {
                for (const z of zombies) {
                    const dist = this.distanceTo(z);
                    if (dist < nearestDist) {
                        nearestDist = dist;
                        nearestThreat = z;
                    }
                }
            }

            // Check predators
            if (typeof animals !== 'undefined' && Array.isArray(animals)) {
                for (const a of animals) {
                    if (a === this.animal) continue;
                    const aType = ANIMAL_TYPES[a.type?.toUpperCase()];
                    if (aType && (aType.category === 'predator' || aType.category === 'aerial_predator')) {
                        const dist = this.distanceTo(a);
                        if (dist < nearestDist) {
                            nearestDist = dist;
                            nearestThreat = a;
                        }
                    }
                }
            }

            if (nearestThreat) {
                this.lastSeenThreat = nearestThreat;
                this.alertLevel = Math.min(1, this.alertLevel + 0.3);
            }
        }

        scanForPrey() {
            let nearestPrey = null;
            let nearestDist = CONFIG.PERCEPTION.SIGHT_RANGE;

            // Only hunt when hungry or territorial
            if (this.state === STATES.RESTING) return;

            // Scan animals
            if (typeof animals !== 'undefined' && Array.isArray(animals)) {
                for (const a of animals) {
                    if (a === this.animal) continue;
                    const aType = ANIMAL_TYPES[a.type?.toUpperCase()];
                    if (aType && (aType.category === 'prey' || aType.category === 'aggressive_prey')) {
                        const dist = this.distanceTo(a);
                        if (dist < nearestDist) {
                            nearestDist = dist;
                            nearestPrey = a;
                        }
                    }
                }
            }

            // Opportunists also target player when weak
            if (this.type.category === 'opportunist' && typeof player !== 'undefined') {
                if (player.health < player.maxHealth * 0.3) {
                    const dist = this.distanceTo(player);
                    if (dist < nearestDist) {
                        nearestDist = dist;
                        nearestPrey = player;
                    }
                }
            }

            if (nearestPrey) {
                this.lastSeenPrey = nearestPrey;
            }
        }

        evaluateStateTransition() {
            const category = this.type.category;

            // Check health for fleeing
            const healthPercent = this.animal.health / this.type.health;
            if (healthPercent < CONFIG.COMBAT.FLEE_HEALTH_THRESHOLD && this.lastSeenThreat) {
                this.transitionTo(STATES.FLEEING);
                return;
            }

            // Prey behaviors
            if (category === 'prey') {
                if (this.lastSeenThreat) {
                    this.transitionTo(STATES.FLEEING);
                    return;
                }
                if (this.packLeader && this.packLeader !== this.animal) {
                    this.transitionTo(STATES.PACK_FOLLOWING);
                    return;
                }
            }

            // Aggressive prey (like boars)
            if (category === 'aggressive_prey') {
                if (this.lastSeenThreat) {
                    const dist = this.distanceTo(this.lastSeenThreat);
                    if (dist < 3) {
                        this.transitionTo(STATES.ATTACKING);
                        return;
                    }
                    this.transitionTo(STATES.FLEEING);
                    return;
                }
            }

            // Predator behaviors
            if (category === 'predator' || category === 'aerial_predator') {
                // Check for territorial intruders
                if (this.territory && this.lastSeenThreat) {
                    const distToHome = this.distanceToPoint(this.territory.x, this.territory.y);
                    if (distToHome < this.territory.radius) {
                        this.transitionTo(STATES.CHASING);
                        this.target = this.lastSeenThreat;
                        return;
                    }
                }

                // Hunt prey
                if (this.lastSeenPrey) {
                    this.transitionTo(STATES.HUNTING);
                    this.target = this.lastSeenPrey;
                    return;
                }

                // Night activity for nocturnal
                if (this.type.nocturnal && typeof isNight !== 'undefined' && isNight) {
                    if (this.state === STATES.RESTING) {
                        this.transitionTo(STATES.WANDERING);
                    }
                } else if (this.type.nocturnal && typeof isNight !== 'undefined' && !isNight) {
                    this.transitionTo(STATES.RESTING);
                    return;
                }
            }

            // Opportunist behaviors
            if (category === 'opportunist') {
                if (this.lastSeenThreat) {
                    this.transitionTo(STATES.FLEEING);
                    return;
                }
                if (this.lastSeenPrey) {
                    this.transitionTo(STATES.HUNTING);
                    this.target = this.lastSeenPrey;
                    return;
                }
            }

            // Neutral animals
            if (category === 'neutral') {
                if (this.lastSeenThreat) {
                    const dist = this.distanceTo(this.lastSeenThreat);
                    if (dist < 2) {
                        this.transitionTo(STATES.ATTACKING);
                        return;
                    }
                    if (dist < 5) {
                        this.transitionTo(STATES.FLEEING);
                        return;
                    }
                }
            }

            // Default behaviors
            if (this.stateTimer > 5 && Math.random() < 0.1) {
                if (Math.random() < 0.3) {
                    this.transitionTo(STATES.GRAZING);
                } else {
                    this.transitionTo(STATES.WANDERING);
                }
            }

            // Territorial patrol
            if (this.type.territorial && this.territory) {
                const distFromHome = this.distanceToPoint(this.territory.x, this.territory.y);
                if (distFromHome > this.territory.radius) {
                    this.transitionTo(STATES.RETURNING_HOME);
                } else if (this.state === STATES.IDLE && Math.random() < 0.05) {
                    this.transitionTo(STATES.TERRITORIAL_PATROL);
                }
            }
        }

        transitionTo(newState) {
            if (this.state === newState) return;

            this.state = newState;
            this.stateTimer = 0;
            this.animal.state = newState;

            // State entry actions
            switch (newState) {
                case STATES.WANDERING:
                    this.generateWanderTarget();
                    break;
                case STATES.TERRITORIAL_PATROL:
                    this.generatePatrolTarget();
                    break;
            }
        }

        executeState(dt) {
            switch (this.state) {
                case STATES.IDLE:
                    this.executeIdle(dt);
                    break;
                case STATES.WANDERING:
                    this.executeWandering(dt);
                    break;
                case STATES.GRAZING:
                    this.executeGrazing(dt);
                    break;
                case STATES.FLEEING:
                    this.executeFleeing(dt);
                    break;
                case STATES.HUNTING:
                    this.executeHunting(dt);
                    break;
                case STATES.CHASING:
                    this.executeChasing(dt);
                    break;
                case STATES.ATTACKING:
                    this.executeAttacking(dt);
                    break;
                case STATES.RESTING:
                    this.executeResting(dt);
                    break;
                case STATES.PACK_FOLLOWING:
                    this.executePackFollowing(dt);
                    break;
                case STATES.TERRITORIAL_PATROL:
                    this.executeTerritorialPatrol(dt);
                    break;
                case STATES.RETURNING_HOME:
                    this.executeReturningHome(dt);
                    break;
            }
        }

        // ============= STATE BEHAVIORS =============

        executeIdle(dt) {
            // Occasional look around
            if (Math.random() < 0.02) {
                this.animal.direction = Math.floor(Math.random() * 4);
            }
        }

        executeWandering(dt) {
            if (!this.wanderTarget) {
                this.generateWanderTarget();
                return;
            }

            const dist = this.distanceToPoint(this.wanderTarget.x, this.wanderTarget.y);

            if (dist > 0.5) {
                this.moveTowards(this.wanderTarget, dt, 0.6);
            } else {
                this.wanderTarget = null;
                this.transitionTo(STATES.IDLE);
            }
        }

        executeGrazing(dt) {
            // Stay still, occasionally move slightly
            if (this.stateTimer > 3 && Math.random() < 0.05) {
                const offsetX = (Math.random() - 0.5) * 2;
                const offsetY = (Math.random() - 0.5) * 2;
                this.wanderTarget = {
                    x: this.animal.x + offsetX,
                    y: this.animal.y + offsetY
                };
                this.transitionTo(STATES.WANDERING);
            }
        }

        executeFleeing(dt) {
            if (!this.lastSeenThreat) {
                this.transitionTo(STATES.WANDERING);
                return;
            }

            const threat = this.lastSeenThreat;
            const dist = this.distanceTo(threat);

            if (dist > CONFIG.MOVEMENT.FLEE_DISTANCE) {
                this.alertLevel = 0;
                this.transitionTo(STATES.WANDERING);
                return;
            }

            // Flee away from threat
            this.fleeFrom(threat, dt);
        }

        executeHunting(dt) {
            if (!this.target || this.target.health <= 0) {
                this.target = null;
                this.transitionTo(STATES.WANDERING);
                return;
            }

            const dist = this.distanceTo(this.target);

            if (dist < CONFIG.COMBAT.ATTACK_RANGE) {
                this.transitionTo(STATES.ATTACKING);
            } else if (dist < CONFIG.MOVEMENT.CHASE_DISTANCE) {
                this.transitionTo(STATES.CHASING);
            } else {
                // Stalking - move slowly towards prey
                this.moveTowards(this.target, dt, 0.5);
            }
        }

        executeChasing(dt) {
            if (!this.target || this.target.health <= 0) {
                this.target = null;
                this.transitionTo(STATES.WANDERING);
                return;
            }

            const dist = this.distanceTo(this.target);

            if (dist < CONFIG.COMBAT.ATTACK_RANGE) {
                this.transitionTo(STATES.ATTACKING);
            } else if (dist > CONFIG.MOVEMENT.CHASE_DISTANCE * 1.5) {
                // Lost target
                this.target = null;
                this.transitionTo(STATES.RETURNING_HOME);
            } else {
                const speedMult = this.type.chaseSpeed || 1.2;
                this.moveTowards(this.target, dt, speedMult);
            }
        }

        executeAttacking(dt) {
            if (!this.target && !this.lastSeenThreat) {
                this.transitionTo(STATES.IDLE);
                return;
            }

            const attackTarget = this.target || this.lastSeenThreat;
            if (!attackTarget || attackTarget.health <= 0) {
                this.target = null;
                this.transitionTo(STATES.WANDERING);
                return;
            }

            const dist = this.distanceTo(attackTarget);

            if (dist > CONFIG.COMBAT.ATTACK_RANGE * 1.5) {
                this.transitionTo(STATES.CHASING);
                return;
            }

            // Move closer if needed
            if (dist > CONFIG.COMBAT.ATTACK_RANGE * 0.8) {
                this.moveTowards(attackTarget, dt, 0.8);
            }

            // Attack
            if (this.attackCooldown <= 0 && dist <= CONFIG.COMBAT.ATTACK_RANGE) {
                this.performAttack(attackTarget);
            }
        }

        executeResting(dt) {
            // Nocturnal animals rest during day
            // Heal slowly
            if (this.animal.health < this.type.health) {
                this.animal.health = Math.min(this.type.health, this.animal.health + dt * 0.5);
            }

            if (this.stateTimer > 10) {
                if (this.type.nocturnal && typeof isNight !== 'undefined' && isNight) {
                    this.transitionTo(STATES.WANDERING);
                }
            }
        }

        executePackFollowing(dt) {
            if (!this.packLeader || this.packLeader === this.animal) {
                this.transitionTo(STATES.WANDERING);
                return;
            }

            const dist = this.distanceTo(this.packLeader);

            if (dist > 1.5) {
                this.moveTowardsWithSeparation(this.packLeader, dt, 0.9);
            }
        }

        executeTerritorialPatrol(dt) {
            if (!this.wanderTarget) {
                this.generatePatrolTarget();
            }

            const dist = this.distanceToPoint(this.wanderTarget.x, this.wanderTarget.y);

            if (dist > 0.5) {
                this.moveTowards(this.wanderTarget, dt, 0.7);
            } else {
                if (Math.random() < 0.3) {
                    this.transitionTo(STATES.IDLE);
                } else {
                    this.generatePatrolTarget();
                }
            }
        }

        executeReturningHome(dt) {
            const dist = this.distanceToPoint(this.homePosition.x, this.homePosition.y);

            if (dist > 1) {
                this.moveTowards(this.homePosition, dt, 0.8);
            } else {
                this.transitionTo(STATES.IDLE);
            }
        }

        // ============= HELPER METHODS =============

        generateWanderTarget() {
            const radius = CONFIG.MOVEMENT.WANDER_RADIUS;
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * radius;

            const baseX = this.territory ? this.territory.x : this.animal.x;
            const baseY = this.territory ? this.territory.y : this.animal.y;

            const targetX = baseX + Math.cos(angle) * dist;
            const targetY = baseY + Math.sin(angle) * dist;

            if (!isSolidAt(targetX, targetY, 0.3)) {
                this.wanderTarget = { x: targetX, y: targetY };
            } else {
                this.wanderTarget = { x: this.animal.x, y: this.animal.y };
            }
        }

        generatePatrolTarget() {
            if (!this.territory) {
                this.generateWanderTarget();
                return;
            }

            const angle = Math.random() * Math.PI * 2;
            const dist = this.territory.radius * (0.5 + Math.random() * 0.5);

            const targetX = this.territory.x + Math.cos(angle) * dist;
            const targetY = this.territory.y + Math.sin(angle) * dist;

            this.wanderTarget = { x: targetX, y: targetY };
        }

        moveTowards(target, dt, speedMult = 1.0) {
            const dx = target.x - this.animal.x;
            const dy = target.y - this.animal.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 0.1) return;

            const speed = this.type.speed * speedMult * dt;
            const moveX = (dx / dist) * speed;
            const moveY = (dy / dist) * speed;

            this.tryMove(moveX, moveY);
            this.animal.isMoving = true;
        }

        moveTowardsWithSeparation(target, dt, speedMult = 1.0) {
            const dx = target.x - this.animal.x;
            const dy = target.y - this.animal.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 0.1) return;

            // Separation from pack members
            let sepX = 0, sepY = 0;
            if (this.packMembers) {
                for (const member of this.packMembers) {
                    if (member === this.animal) continue;
                    const odx = this.animal.x - member.x;
                    const ody = this.animal.y - member.y;
                    const odist = Math.sqrt(odx * odx + ody * ody);
                    if (odist < CONFIG.MOVEMENT.PACK_SPACING && odist > 0) {
                        sepX += (odx / odist) / odist;
                        sepY += (ody / odist) / odist;
                    }
                }
            }

            const speed = this.type.speed * speedMult * dt;
            let moveX = (dx / dist) + sepX;
            let moveY = (dy / dist) + sepY;

            const moveMag = Math.sqrt(moveX * moveX + moveY * moveY);
            if (moveMag > 0) {
                moveX = (moveX / moveMag) * speed;
                moveY = (moveY / moveMag) * speed;
            }

            this.tryMove(moveX, moveY);
            this.animal.isMoving = true;
        }

        fleeFrom(threat, dt) {
            const dx = this.animal.x - threat.x;
            const dy = this.animal.y - threat.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 0.1) {
                // Random direction if too close
                const angle = Math.random() * Math.PI * 2;
                this.tryMove(Math.cos(angle) * 0.1, Math.sin(angle) * 0.1);
                return;
            }

            const fleeSpeed = (this.type.fleeSpeed || 1.3) * this.type.speed * dt;
            const moveX = (dx / dist) * fleeSpeed;
            const moveY = (dy / dist) * fleeSpeed;

            this.tryMove(moveX, moveY);
            this.animal.isMoving = true;
        }

        tryMove(moveX, moveY) {
            const newX = this.animal.x + moveX;
            const newY = this.animal.y + moveY;

            // Update direction
            if (Math.abs(moveX) > Math.abs(moveY)) {
                this.animal.direction = moveX > 0 ? 0 : 2;
            } else if (Math.abs(moveY) > 0.001) {
                this.animal.direction = moveY > 0 ? 1 : 3;
            }

            if (!isSolidAt(newX, newY, 0.3)) {
                this.animal.x = newX;
                this.animal.y = newY;
                return true;
            }

            // Wall sliding
            if (!isSolidAt(newX, this.animal.y, 0.3)) {
                this.animal.x = newX;
                return true;
            }
            if (!isSolidAt(this.animal.x, newY, 0.3)) {
                this.animal.y = newY;
                return true;
            }

            return false;
        }

        performAttack(target) {
            const damage = this.type.damage;
            target.health -= damage;

            if (typeof addDamageNumber === 'function') {
                addDamageNumber(target.x, target.y - 0.3, damage, '#ff6644');
            }
            if (typeof spawnParticles === 'function') {
                spawnParticles(target.x, target.y, '#ff4444', 4);
            }

            // Poison damage for snakes
            if (this.type.poisonDamage && target.poisonTimer === undefined) {
                target.poisonTimer = 5;
                target.poisonDamage = this.type.poisonDamage;
            }

            this.attackCooldown = CONFIG.COMBAT.ATTACK_COOLDOWN;
        }

        distanceTo(entity) {
            if (!entity) return Infinity;
            return Math.sqrt(
                (this.animal.x - entity.x) ** 2 +
                (this.animal.y - entity.y) ** 2
            );
        }

        distanceToPoint(x, y) {
            return Math.sqrt(
                (this.animal.x - x) ** 2 +
                (this.animal.y - y) ** 2
            );
        }
    }

    // ============= SYSTEM STATE =============
    const aiInstances = new Map();
    let spawnTimer = 0;

    // ============= PUBLIC API =============
    function createAnimal(type, x, y) {
        const typeData = ANIMAL_TYPES[type.toUpperCase()];
        if (!typeData) {
            console.warn(`Unknown animal type: ${type}`);
            return null;
        }

        const animal = {
            id: Date.now() + Math.random(),
            type: typeData.id,
            x, y,
            health: typeData.health,
            maxHealth: typeData.health,
            speed: typeData.speed,
            damage: typeData.damage,
            direction: Math.floor(Math.random() * 4),
            animTimer: 0,
            isMoving: false,
            frame: 0
        };

        const ai = new AnimalAI(animal, typeData);
        aiInstances.set(animal, ai);

        return animal;
    }

    function update(dt) {
        // Update all animal AIs
        for (const [animal, ai] of aiInstances) {
            if (animal.health <= 0) {
                aiInstances.delete(animal);
                continue;
            }
            ai.update(dt);
        }

        // Spawn check
        spawnTimer += dt;
        if (spawnTimer >= CONFIG.SPAWN_CHECK_INTERVAL) {
            spawnTimer = 0;
            // Spawning handled by spawn-system.js
        }
    }

    function removeAnimal(animal) {
        aiInstances.delete(animal);
    }

    function getAI(animal) {
        return aiInstances.get(animal);
    }

    function formPack(animals) {
        if (!animals || animals.length < 2) return;

        const leader = animals[0];
        const leaderAI = aiInstances.get(leader);
        if (!leaderAI) return;

        leaderAI.packMembers = animals;

        for (let i = 1; i < animals.length; i++) {
            const memberAI = aiInstances.get(animals[i]);
            if (memberAI) {
                memberAI.packLeader = leader;
                memberAI.packMembers = animals;
            }
        }
    }

    return {
        CONFIG,
        ANIMAL_TYPES,
        STATES,
        AnimalAI,

        createAnimal,
        update,
        removeAnimal,
        getAI,
        formPack,

        getActiveCount() {
            return aiInstances.size;
        }
    };
})();

// Export globally
window.AnimalAISystem = AnimalAISystem;
