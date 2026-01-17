// ============================================
// PET AI SYSTEM - Advanced Behaviors & State Machine
// ============================================
// Production-grade AI system for pet companions
// Implements proper state machines, behaviors, and decision making

const PetAI = (function () {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        // Movement
        FOLLOW_DISTANCE_MIN: 1.5,
        FOLLOW_DISTANCE_IDEAL: 3.0,
        FOLLOW_DISTANCE_MAX: 6.0,
        TELEPORT_DISTANCE: 15.0,
        WANDER_RADIUS: 8.0,
        WANDER_INTERVAL_MIN: 3.0,
        WANDER_INTERVAL_MAX: 8.0,

        // Combat
        ATTACK_RANGE: 1.5,
        AGGRO_RANGE: 8.0,
        FLEE_RANGE: 6.0,
        ATTACK_COOLDOWN: 1.0,
        PURSUIT_TIMEOUT: 10.0,

        // Behaviors
        GATHERING_RANGE: 5.0,
        GATHERING_TIME: 2.0,
        IDLE_DURATION_MIN: 1.0,
        IDLE_DURATION_MAX: 4.0,

        // AI Updates
        DECISION_INTERVAL: 0.5,
        PATH_UPDATE_INTERVAL: 1.0,
        STUCK_THRESHOLD: 0.5,
        STUCK_TIMEOUT: 2.0,

        // Steering
        SEPARATION_RADIUS: 1.2,
        SEPARATION_FORCE: 3.0,
        OBSTACLE_AVOIDANCE_FORCE: 5.0,
        MAX_FORCE: 8.0
    };

    // ============= STATE DEFINITIONS =============
    const PET_STATES = {
        IDLE: 'idle',
        FOLLOW: 'follow',
        ATTACK: 'attack',
        FLEE: 'flee',
        GATHER: 'gather',
        WANDER: 'wander',
        STAY: 'stay',
        PATROL: 'patrol',
        RETURN: 'return',
        PLAY: 'play'
    };

    // ============= BEHAVIOR PRIORITIES =============
    const BEHAVIOR_PRIORITIES = {
        survival: 100,    // Health/hunger critical
        combat: 80,       // Active combat
        owner: 60,        // Following owner
        task: 40,         // Gathering/patrolling
        social: 20,       // Playing with other pets
        idle: 0           // Default idle behavior
    };

    // ============= PET AI CLASS =============
    class PetAIController {
        constructor(pet) {
            this.pet = pet;
            this.state = PET_STATES.IDLE;
            this.previousState = null;
            this.stateTimer = 0;

            // Movement
            this.targetPosition = null;
            this.path = null;
            this.pathIndex = 0;
            this.velocity = { x: 0, y: 0 };
            this.lastPosition = { x: pet.x, y: pet.y };

            // Tracking
            this.lastVx = 0;
            this.lastVy = 0;

            // Timers
            this.decisionTimer = 0;
            this.pathUpdateTimer = 0;
            this.stuckTimer = 0;
            this.attackCooldown = 0;
            this.wanderTimer = 0;
            this.idleTimer = 0;
            this.gatherTimer = 0;

            // Targets
            this.combatTarget = null;
            this.gatherTarget = null;
            this.fleeSource = null;

            // Behavior modifiers
            this.aggressionLevel = 0.5;
            this.loyaltyBonus = 0;
            this.fearLevel = 0;

            // Memory
            this.knownThreats = new Map();
            this.knownResources = [];
            this.visitedPositions = [];

            // Patrol
            this.patrolPoints = [];
            this.patrolIndex = 0;
        }

        // ============= MAIN UPDATE =============
        update(dt) {
            // Update timers
            this.updateTimers(dt);

            // Check for stuck condition
            this.checkStuck(dt);

            // Make decisions periodically
            if (this.decisionTimer <= 0) {
                this.makeDecision();
                this.decisionTimer = CONFIG.DECISION_INTERVAL;
            }

            // Execute current state behavior
            this.executeState(dt);

            // Update movement
            this.updateMovement(dt);

            // Update pet velocity tracking for sprite direction
            this.pet.lastVx = this.lastVx;
            this.pet.lastVy = this.lastVy;
        }

        updateTimers(dt) {
            this.decisionTimer -= dt;
            this.pathUpdateTimer -= dt;
            this.stateTimer += dt;
            this.attackCooldown = Math.max(0, this.attackCooldown - dt);
            this.wanderTimer -= dt;
            this.idleTimer -= dt;
            this.gatherTimer -= dt;

            // Decay fear level
            this.fearLevel = Math.max(0, this.fearLevel - dt * 0.1);

            // Clean up old threats
            const now = Date.now();
            for (const [id, threat] of this.knownThreats) {
                if (now - threat.lastSeen > 10000) {
                    this.knownThreats.delete(id);
                }
            }
        }

        checkStuck(dt) {
            const dx = this.pet.x - this.lastPosition.x;
            const dy = this.pet.y - this.lastPosition.y;
            const moved = Math.sqrt(dx * dx + dy * dy);

            if (moved < 0.01 && this.targetPosition) {
                this.stuckTimer += dt;
                if (this.stuckTimer > CONFIG.STUCK_TIMEOUT) {
                    this.handleStuck();
                    this.stuckTimer = 0;
                }
            } else {
                this.stuckTimer = 0;
            }

            this.lastPosition.x = this.pet.x;
            this.lastPosition.y = this.pet.y;
        }

        handleStuck() {
            // Clear current path and find alternative
            this.path = null;
            this.pathIndex = 0;

            // Try random direction
            const angle = Math.random() * Math.PI * 2;
            const dist = 2 + Math.random() * 3;
            this.targetPosition = {
                x: this.pet.x + Math.cos(angle) * dist,
                y: this.pet.y + Math.sin(angle) * dist
            };

            // If severely stuck, teleport to owner
            if (this.state === PET_STATES.FOLLOW && !this.pet.isWild) {
                const ownerDist = this.getDistanceToOwner();
                if (ownerDist > CONFIG.TELEPORT_DISTANCE) {
                    this.teleportToOwner();
                }
            }
        }

        teleportToOwner() {
            if (typeof player === 'undefined') return;

            const angle = Math.random() * Math.PI * 2;
            const dist = CONFIG.FOLLOW_DISTANCE_IDEAL;
            this.pet.x = player.x + Math.cos(angle) * dist;
            this.pet.y = player.y + Math.sin(angle) * dist;

            // Spawn teleport effect
            if (typeof spawnParticles === 'function') {
                spawnParticles(this.pet.x, this.pet.y, '#aa88ff', 10);
            }
        }

        // ============= DECISION MAKING =============
        makeDecision() {
            // Wild animals have different decision tree
            if (this.pet.isWild) {
                this.makeWildDecision();
                return;
            }

            // Priority-based decision making
            const behaviors = this.evaluateBehaviors();
            const topBehavior = behaviors.reduce((a, b) =>
                b.priority > a.priority ? b : a
            );

            if (topBehavior.state !== this.state) {
                this.transitionToState(topBehavior.state);
            }
        }

        evaluateBehaviors() {
            const behaviors = [];

            // Survival check - low health flee
            if (this.pet.health < this.pet.getMaxHealth() * 0.2) {
                const threat = this.findNearestThreat();
                if (threat && this.getDistanceTo(threat) < CONFIG.FLEE_RANGE) {
                    behaviors.push({
                        state: PET_STATES.FLEE,
                        priority: BEHAVIOR_PRIORITIES.survival,
                        target: threat
                    });
                }
            }

            // Combat check
            if (this.pet.type.type === 'combat' && this.pet.hunger > 30) {
                const threat = this.findNearestThreat();
                if (threat && this.getDistanceTo(threat) < CONFIG.AGGRO_RANGE) {
                    behaviors.push({
                        state: PET_STATES.ATTACK,
                        priority: BEHAVIOR_PRIORITIES.combat + this.aggressionLevel * 20,
                        target: threat
                    });
                }
            }

            // Follow owner when commanded
            if (this.pet.state === 'follow') {
                const ownerDist = this.getDistanceToOwner();
                if (ownerDist > CONFIG.FOLLOW_DISTANCE_MAX) {
                    behaviors.push({
                        state: PET_STATES.FOLLOW,
                        priority: BEHAVIOR_PRIORITIES.owner + 10
                    });
                } else if (ownerDist > CONFIG.FOLLOW_DISTANCE_IDEAL) {
                    behaviors.push({
                        state: PET_STATES.FOLLOW,
                        priority: BEHAVIOR_PRIORITIES.owner
                    });
                }
            }

            // Stay command
            if (this.pet.state === 'stay') {
                behaviors.push({
                    state: PET_STATES.STAY,
                    priority: BEHAVIOR_PRIORITIES.owner
                });
            }

            // Gathering behavior for resource pets
            if (this.pet.type.canGather && this.pet.state === 'gather') {
                const resource = this.findNearestResource();
                if (resource) {
                    behaviors.push({
                        state: PET_STATES.GATHER,
                        priority: BEHAVIOR_PRIORITIES.task,
                        target: resource
                    });
                }
            }

            // Default to idle or wander
            behaviors.push({
                state: PET_STATES.IDLE,
                priority: BEHAVIOR_PRIORITIES.idle
            });

            return behaviors;
        }

        makeWildDecision() {
            // Wild animals primarily wander and flee
            const playerDist = this.getDistanceToOwner();

            // Flee from player if too close and not trusting
            if (playerDist < CONFIG.FLEE_RANGE && this.pet.trust < 50) {
                if (this.state !== PET_STATES.FLEE) {
                    this.transitionToState(PET_STATES.FLEE);
                    this.fleeSource = { x: player.x, y: player.y };
                }
                return;
            }

            // Wander when idle
            if (this.state === PET_STATES.IDLE && this.idleTimer <= 0) {
                this.transitionToState(PET_STATES.WANDER);
            }

            // Return to idle after wandering
            if (this.state === PET_STATES.WANDER && this.wanderTimer <= 0) {
                this.transitionToState(PET_STATES.IDLE);
            }
        }

        // ============= STATE TRANSITIONS =============
        transitionToState(newState) {
            // Exit current state
            this.exitState(this.state);

            // Store previous state
            this.previousState = this.state;
            this.state = newState;
            this.stateTimer = 0;

            // Enter new state
            this.enterState(newState);
        }

        enterState(state) {
            switch (state) {
                case PET_STATES.IDLE:
                    this.idleTimer = CONFIG.IDLE_DURATION_MIN +
                        Math.random() * (CONFIG.IDLE_DURATION_MAX - CONFIG.IDLE_DURATION_MIN);
                    this.targetPosition = null;
                    break;

                case PET_STATES.WANDER:
                    this.setWanderTarget();
                    this.wanderTimer = CONFIG.WANDER_INTERVAL_MIN +
                        Math.random() * (CONFIG.WANDER_INTERVAL_MAX - CONFIG.WANDER_INTERVAL_MIN);
                    break;

                case PET_STATES.FOLLOW:
                    this.updateFollowTarget();
                    break;

                case PET_STATES.ATTACK:
                    // Combat target should be set by evaluateBehaviors
                    break;

                case PET_STATES.FLEE:
                    this.setFleeTarget();
                    break;

                case PET_STATES.GATHER:
                    this.gatherTimer = CONFIG.GATHERING_TIME;
                    break;

                case PET_STATES.STAY:
                    this.targetPosition = { x: this.pet.x, y: this.pet.y };
                    break;
            }
        }

        exitState(state) {
            switch (state) {
                case PET_STATES.ATTACK:
                    this.combatTarget = null;
                    break;

                case PET_STATES.GATHER:
                    this.gatherTarget = null;
                    break;

                case PET_STATES.FLEE:
                    this.fleeSource = null;
                    break;
            }
        }

        // ============= STATE EXECUTION =============
        executeState(dt) {
            switch (this.state) {
                case PET_STATES.IDLE:
                    this.executeIdle(dt);
                    break;

                case PET_STATES.WANDER:
                    this.executeWander(dt);
                    break;

                case PET_STATES.FOLLOW:
                    this.executeFollow(dt);
                    break;

                case PET_STATES.ATTACK:
                    this.executeAttack(dt);
                    break;

                case PET_STATES.FLEE:
                    this.executeFlee(dt);
                    break;

                case PET_STATES.GATHER:
                    this.executeGather(dt);
                    break;

                case PET_STATES.STAY:
                    this.executeStay(dt);
                    break;

                case PET_STATES.PATROL:
                    this.executePatrol(dt);
                    break;
            }
        }

        executeIdle(dt) {
            // Random idle animations/behaviors
            if (Math.random() < 0.01) {
                // Look around
                this.pet.direction = Math.floor(Math.random() * 4);
            }
        }

        executeWander(dt) {
            if (!this.targetPosition) {
                this.setWanderTarget();
            }

            const distToTarget = this.getDistanceToTarget();
            if (distToTarget < 0.5) {
                this.setWanderTarget();
            }
        }

        executeFollow(dt) {
            const ownerDist = this.getDistanceToOwner();

            if (ownerDist > CONFIG.TELEPORT_DISTANCE) {
                this.teleportToOwner();
                return;
            }

            if (ownerDist > CONFIG.FOLLOW_DISTANCE_MAX) {
                // Run to catch up
                this.updateFollowTarget();
            } else if (ownerDist < CONFIG.FOLLOW_DISTANCE_MIN) {
                // Move away slightly
                const angle = Math.atan2(
                    this.pet.y - player.y,
                    this.pet.x - player.x
                );
                this.targetPosition = {
                    x: player.x + Math.cos(angle) * CONFIG.FOLLOW_DISTANCE_IDEAL,
                    y: player.y + Math.sin(angle) * CONFIG.FOLLOW_DISTANCE_IDEAL
                };
            } else if (ownerDist < CONFIG.FOLLOW_DISTANCE_IDEAL * 0.8) {
                // Close enough, clear target
                this.targetPosition = null;
            } else {
                this.updateFollowTarget();
            }
        }

        executeAttack(dt) {
            // Validate combat target
            if (!this.combatTarget || this.combatTarget.health <= 0) {
                this.combatTarget = this.findNearestThreat();
                if (!this.combatTarget) {
                    this.transitionToState(PET_STATES.FOLLOW);
                    return;
                }
            }

            const dist = this.getDistanceTo(this.combatTarget);

            if (dist > CONFIG.AGGRO_RANGE * 1.5) {
                // Lost target
                this.transitionToState(PET_STATES.FOLLOW);
                return;
            }

            if (dist <= CONFIG.ATTACK_RANGE) {
                // In attack range
                this.targetPosition = null;

                if (this.attackCooldown <= 0) {
                    this.performAttack();
                    this.attackCooldown = CONFIG.ATTACK_COOLDOWN;
                }
            } else {
                // Move toward target
                this.targetPosition = {
                    x: this.combatTarget.x,
                    y: this.combatTarget.y
                };
            }
        }

        executeFlee(dt) {
            if (!this.fleeSource) {
                this.transitionToState(PET_STATES.WANDER);
                return;
            }

            const distFromThreat = Math.sqrt(
                (this.pet.x - this.fleeSource.x) ** 2 +
                (this.pet.y - this.fleeSource.y) ** 2
            );

            if (distFromThreat > CONFIG.FLEE_RANGE * 1.5) {
                // Safe, stop fleeing
                this.transitionToState(PET_STATES.WANDER);
                return;
            }

            this.setFleeTarget();
        }

        executeGather(dt) {
            if (!this.gatherTarget) {
                this.gatherTarget = this.findNearestResource();
                if (!this.gatherTarget) {
                    this.transitionToState(PET_STATES.FOLLOW);
                    return;
                }
            }

            const dist = this.getDistanceTo(this.gatherTarget);

            if (dist > 1.0) {
                this.targetPosition = {
                    x: this.gatherTarget.x,
                    y: this.gatherTarget.y
                };
            } else {
                // At resource, gather
                this.targetPosition = null;

                if (this.gatherTimer <= 0) {
                    this.performGather();
                    this.gatherTarget = null;
                    this.gatherTimer = CONFIG.GATHERING_TIME;
                }
            }
        }

        executeStay(dt) {
            // Stay in place, just idle animations
            this.targetPosition = null;

            // Look toward threats occasionally
            const threat = this.findNearestThreat();
            if (threat && Math.random() < 0.05) {
                const angle = Math.atan2(
                    threat.y - this.pet.y,
                    threat.x - this.pet.x
                );
                if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
                    this.pet.direction = 0; // Right
                } else if (angle >= Math.PI / 4 && angle < 3 * Math.PI / 4) {
                    this.pet.direction = 1; // Down
                } else if (angle >= -3 * Math.PI / 4 && angle < -Math.PI / 4) {
                    this.pet.direction = 3; // Up
                } else {
                    this.pet.direction = 2; // Left
                }
            }
        }

        executePatrol(dt) {
            if (this.patrolPoints.length === 0) {
                this.transitionToState(PET_STATES.IDLE);
                return;
            }

            const target = this.patrolPoints[this.patrolIndex];
            const dist = Math.sqrt(
                (this.pet.x - target.x) ** 2 + (this.pet.y - target.y) ** 2
            );

            if (dist < 1.0) {
                this.patrolIndex = (this.patrolIndex + 1) % this.patrolPoints.length;
            }

            this.targetPosition = this.patrolPoints[this.patrolIndex];
        }

        // ============= MOVEMENT =============
        updateMovement(dt) {
            if (!this.targetPosition) {
                this.velocity.x = 0;
                this.velocity.y = 0;
                this.lastVx = 0;
                this.lastVy = 0;
                return;
            }

            // Calculate steering forces
            let forceX = 0;
            let forceY = 0;

            // Seek target
            const seekForce = this.calculateSeek(this.targetPosition);
            forceX += seekForce.x * 2.0;
            forceY += seekForce.y * 2.0;

            // Separation from other pets
            const sepForce = this.calculateSeparation();
            forceX += sepForce.x;
            forceY += sepForce.y;

            // Obstacle avoidance
            const avoidForce = this.calculateObstacleAvoidance();
            forceX += avoidForce.x;
            forceY += avoidForce.y;

            // Limit force
            const forceMag = Math.sqrt(forceX * forceX + forceY * forceY);
            if (forceMag > CONFIG.MAX_FORCE) {
                forceX = (forceX / forceMag) * CONFIG.MAX_FORCE;
                forceY = (forceY / forceMag) * CONFIG.MAX_FORCE;
            }

            // Apply to velocity
            this.velocity.x = forceX;
            this.velocity.y = forceY;

            // Calculate new position
            const speed = this.pet.getSpeed ? this.pet.getSpeed() : (this.pet.speed || 5);
            const moveX = this.velocity.x * dt * speed * 0.1;
            const moveY = this.velocity.y * dt * speed * 0.1;

            // Store velocity for sprite direction
            this.lastVx = moveX;
            this.lastVy = moveY;

            // Check collisions and apply movement
            const newX = this.pet.x + moveX;
            const newY = this.pet.y + moveY;

            if (typeof isSolidAt === 'function') {
                const radius = (this.pet.size || 1) * 0.3;

                // Try full movement
                if (!isSolidAt(newX, newY, radius)) {
                    this.pet.x = newX;
                    this.pet.y = newY;
                } else {
                    // Try sliding
                    if (!isSolidAt(newX, this.pet.y, radius)) {
                        this.pet.x = newX;
                    } else if (!isSolidAt(this.pet.x, newY, radius)) {
                        this.pet.y = newY;
                    }
                }
            } else {
                this.pet.x = newX;
                this.pet.y = newY;
            }
        }

        calculateSeek(target) {
            const dx = target.x - this.pet.x;
            const dy = target.y - this.pet.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 0.1) return { x: 0, y: 0 };

            return {
                x: dx / dist,
                y: dy / dist
            };
        }

        calculateSeparation() {
            let steerX = 0;
            let steerY = 0;

            // Separate from other pets
            if (typeof PetSystem !== 'undefined') {
                const allPets = [...PetSystem.getAllPets(), ...PetSystem.getWildAnimals()];
                for (const other of allPets) {
                    if (other === this.pet) continue;

                    const dx = this.pet.x - other.x;
                    const dy = this.pet.y - other.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist > 0 && dist < CONFIG.SEPARATION_RADIUS) {
                        const strength = 1.0 / dist;
                        steerX += (dx / dist) * strength;
                        steerY += (dy / dist) * strength;
                    }
                }
            }

            // Also separate from player
            if (typeof player !== 'undefined') {
                const dx = this.pet.x - player.x;
                const dy = this.pet.y - player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 0 && dist < CONFIG.SEPARATION_RADIUS * 0.8) {
                    steerX += (dx / dist) * 0.5;
                    steerY += (dy / dist) * 0.5;
                }
            }

            const mag = Math.sqrt(steerX * steerX + steerY * steerY);
            if (mag > 0) {
                steerX = (steerX / mag) * CONFIG.SEPARATION_FORCE;
                steerY = (steerY / mag) * CONFIG.SEPARATION_FORCE;
            }

            return { x: steerX, y: steerY };
        }

        calculateObstacleAvoidance() {
            // Simple look-ahead obstacle detection
            const lookAhead = 2.0;
            const dx = this.velocity.x;
            const dy = this.velocity.y;
            const mag = Math.sqrt(dx * dx + dy * dy);

            if (mag < 0.1) return { x: 0, y: 0 };

            // Normalize direction
            const ndx = dx / mag;
            const ndy = dy / mag;

            // Check ahead
            const checkX = this.pet.x + ndx * lookAhead;
            const checkY = this.pet.y + ndy * lookAhead;

            if (typeof isSolidAt === 'function' && isSolidAt(checkX, checkY, 0.3)) {
                // Calculate avoidance vector (perpendicular to direction)
                return {
                    x: -ndy * CONFIG.OBSTACLE_AVOIDANCE_FORCE,
                    y: ndx * CONFIG.OBSTACLE_AVOIDANCE_FORCE
                };
            }

            return { x: 0, y: 0 };
        }

        // ============= TARGET MANAGEMENT =============
        setWanderTarget() {
            const angle = Math.random() * Math.PI * 2;
            const dist = 2 + Math.random() * (CONFIG.WANDER_RADIUS - 2);

            this.targetPosition = {
                x: this.pet.x + Math.cos(angle) * dist,
                y: this.pet.y + Math.sin(angle) * dist
            };
        }

        setFleeTarget() {
            if (!this.fleeSource) return;

            const angle = Math.atan2(
                this.pet.y - this.fleeSource.y,
                this.pet.x - this.fleeSource.x
            );

            // Add some randomness to flee direction
            const variance = (Math.random() - 0.5) * Math.PI * 0.5;
            const fleeAngle = angle + variance;

            this.targetPosition = {
                x: this.pet.x + Math.cos(fleeAngle) * CONFIG.FLEE_RANGE,
                y: this.pet.y + Math.sin(fleeAngle) * CONFIG.FLEE_RANGE
            };
        }

        updateFollowTarget() {
            if (typeof player === 'undefined') return;

            // Position behind and to the side of player
            const offsetAngle = Math.PI + (this.pet.id % 4) * 0.5 - 1.0;
            const angle = (player.direction || 1) * Math.PI / 2 + offsetAngle;

            this.targetPosition = {
                x: player.x + Math.cos(angle) * CONFIG.FOLLOW_DISTANCE_IDEAL,
                y: player.y + Math.sin(angle) * CONFIG.FOLLOW_DISTANCE_IDEAL
            };
        }

        // ============= ACTIONS =============
        performAttack() {
            if (!this.combatTarget) return;

            const damage = this.pet.getDamage ? this.pet.getDamage() : (this.pet.damage || 10);

            if (this.combatTarget.health !== undefined) {
                this.combatTarget.health -= damage;

                if (typeof addDamageNumber === 'function') {
                    addDamageNumber(
                        this.combatTarget.x,
                        this.combatTarget.y - 0.5,
                        Math.floor(damage),
                        '#ff6600'
                    );
                }

                if (typeof spawnParticles === 'function') {
                    spawnParticles(this.combatTarget.x, this.combatTarget.y, '#ff4444', 5);
                }
            }

            // Gain XP
            if (this.pet.gainXP) {
                this.pet.gainXP(10);
            }

            // Add attack effect
            if (typeof PetSprites !== 'undefined' && PetSprites.addEffect) {
                PetSprites.addEffect(this.pet.id, 'attack', 300);
            }

            // Emit event
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('pet:attack', {
                    pet: this.pet,
                    target: this.combatTarget,
                    damage: damage
                });
            }
        }

        performGather() {
            if (!this.gatherTarget) return;

            const amount = Math.floor(Math.random() * 3) + 1;
            const resourceType = this.gatherTarget.type || 'wood';

            if (typeof resources !== 'undefined') {
                resources[resourceType] = (resources[resourceType] || 0) + amount;
            }

            if (typeof spawnParticles === 'function') {
                spawnParticles(this.pet.x, this.pet.y, '#00ff00', 8);
            }

            if (typeof showNotification === 'function') {
                showNotification(`${this.pet.type.name} gathered ${amount}x ${resourceType}!`, []);
            }

            // Emit event
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('pet:gather', {
                    pet: this.pet,
                    resource: this.gatherTarget,
                    amount: amount
                });
            }
        }

        // ============= HELPERS =============
        getDistanceTo(target) {
            if (!target) return Infinity;
            return Math.sqrt(
                (this.pet.x - target.x) ** 2 + (this.pet.y - target.y) ** 2
            );
        }

        getDistanceToTarget() {
            if (!this.targetPosition) return 0;
            return this.getDistanceTo(this.targetPosition);
        }

        getDistanceToOwner() {
            if (typeof player === 'undefined') return Infinity;
            return Math.sqrt(
                (this.pet.x - player.x) ** 2 + (this.pet.y - player.y) ** 2
            );
        }

        findNearestThreat() {
            if (typeof zombies === 'undefined') return null;

            let nearest = null;
            let minDist = Infinity;

            for (const zombie of zombies) {
                if (zombie.health <= 0) continue;

                const dist = this.getDistanceTo(zombie);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = zombie;

                    // Update known threats
                    this.knownThreats.set(zombie.id || Math.random(), {
                        entity: zombie,
                        lastSeen: Date.now()
                    });
                }
            }

            return nearest;
        }

        findNearestResource() {
            // Simple resource finding based on world
            // This would be enhanced with proper world resource tracking
            const searchRadius = CONFIG.GATHERING_RANGE;

            // Check nearby tiles for gatherable resources
            for (let dx = -searchRadius; dx <= searchRadius; dx++) {
                for (let dy = -searchRadius; dy <= searchRadius; dy++) {
                    const checkX = Math.floor(this.pet.x + dx);
                    const checkY = Math.floor(this.pet.y + dy);

                    if (typeof getTileAt === 'function') {
                        const tile = getTileAt(checkX, checkY);

                        // Check for tree, stone, etc.
                        if (tile === TILES.TREE || tile === TILES.STONE) {
                            return {
                                x: checkX + 0.5,
                                y: checkY + 0.5,
                                type: tile === TILES.TREE ? 'wood' : 'stone'
                            };
                        }
                    }
                }
            }

            return null;
        }

        // ============= PATROL SYSTEM =============
        setPatrolPoints(points) {
            this.patrolPoints = points;
            this.patrolIndex = 0;
        }

        addPatrolPoint(x, y) {
            this.patrolPoints.push({ x, y });
        }

        clearPatrolPoints() {
            this.patrolPoints = [];
            this.patrolIndex = 0;
        }
    }

    // ============= AI MANAGER =============
    const aiControllers = new Map();

    function getController(pet) {
        if (!aiControllers.has(pet.id)) {
            aiControllers.set(pet.id, new PetAIController(pet));
        }
        return aiControllers.get(pet.id);
    }

    function removeController(petId) {
        aiControllers.delete(petId);
    }

    function updateAll(dt) {
        for (const [petId, controller] of aiControllers) {
            if (!controller.pet || controller.pet.health <= 0) {
                aiControllers.delete(petId);
                continue;
            }
            controller.update(dt);
        }
    }

    // ============= PUBLIC API =============
    return {
        CONFIG,
        PET_STATES,
        PetAIController,
        getController,
        removeController,
        updateAll
    };
})();

window.PetAI = PetAI;
