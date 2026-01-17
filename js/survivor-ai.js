// ============================================
// SURVIVOR AI SYSTEM - Advanced NPC Behaviors
// ============================================
// Production-grade survivor AI with state machines,
// threat assessment, tactical behaviors, and role-specific AI

const SurvivorAISystem = (function() {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        // Threat Assessment
        THREAT: {
            SCAN_RADIUS: 12,
            SCAN_INTERVAL: 0.5,
            DANGER_THRESHOLD: 50,
            CRITICAL_THRESHOLD: 100,
            ZOMBIE_THREAT_BASE: 20,
            ZOMBIE_THREAT_HEALTH_MULT: 0.5,
            BOSS_THREAT_MULT: 5
        },

        // Combat
        COMBAT: {
            ENGAGE_RANGE: 3,
            RETREAT_HEALTH_PERCENT: 0.3,
            KITE_DISTANCE: 2.5,
            FORMATION_SPACING: 1.2,
            FOCUS_FIRE_RANGE: 5
        },

        // Movement
        MOVEMENT: {
            PATROL_RADIUS: 8,
            PATROL_POINT_TIME: 5,
            FLEE_DISTANCE: 10,
            REGROUP_DISTANCE: 4,
            STUCK_THRESHOLD: 1.5
        },

        // Roles
        ROLE_PRIORITIES: {
            'Guard': { combat: 1.0, patrol: 0.8, work: 0.2, follow: 0.6 },
            'Soldier': { combat: 1.0, patrol: 0.5, work: 0.1, follow: 0.8 },
            'Hunter': { combat: 0.8, patrol: 0.6, work: 0.3, follow: 0.5 },
            'Woodcutter': { combat: 0.3, patrol: 0.2, work: 1.0, follow: 0.4 },
            'Miner': { combat: 0.3, patrol: 0.2, work: 1.0, follow: 0.4 },
            'Farmer': { combat: 0.2, patrol: 0.3, work: 1.0, follow: 0.5 },
            'Medic': { combat: 0.2, patrol: 0.4, work: 0.8, follow: 0.7 },
            'None': { combat: 0.4, patrol: 0.3, work: 0.0, follow: 0.6 }
        }
    };

    // ============= AI STATES =============
    const STATES = {
        IDLE: 'IDLE',
        FOLLOWING: 'FOLLOWING',
        WORKING: 'WORKING',
        PATROLLING: 'PATROLLING',
        COMBAT: 'COMBAT',
        FLEEING: 'FLEEING',
        RETREATING: 'RETREATING',
        HEALING: 'HEALING',
        REGROUPING: 'REGROUPING'
    };

    // ============= AI STATE MACHINE =============
    class SurvivorStateMachine {
        constructor(survivor) {
            this.survivor = survivor;
            this.state = STATES.IDLE;
            this.previousState = null;
            this.stateTimer = 0;
            this.target = null;
            this.threatLevel = 0;
            this.scanTimer = 0;
            this.path = null;
            this.pathIndex = 0;
            this.repathTimer = 0;
            this.patrolPoints = [];
            this.patrolIndex = 0;
            this.combatTarget = null;
            this.fleeTarget = null;
            this.stuckTimer = 0;
            this.lastPosition = { x: 0, y: 0 };
            this.personality = this.generatePersonality();
        }

        generatePersonality() {
            const seed = this.survivor.id || Math.random() * 1000;
            return {
                aggression: 0.3 + seededRandom(seed, seed + 1) * 0.6,
                caution: 0.3 + seededRandom(seed + 2, seed + 3) * 0.6,
                initiative: 0.3 + seededRandom(seed + 4, seed + 5) * 0.6,
                loyalty: 0.5 + seededRandom(seed + 6, seed + 7) * 0.4
            };
        }

        update(dt) {
            if (this.survivor.health <= 0 || this.survivor.isPlayer) return;

            // Update timers
            this.stateTimer += dt;
            this.scanTimer -= dt;
            this.repathTimer -= dt;

            // Periodic threat assessment
            if (this.scanTimer <= 0) {
                this.assessThreats();
                this.scanTimer = CONFIG.THREAT.SCAN_INTERVAL;
            }

            // Check for state transitions
            this.evaluateStateTransition();

            // Execute current state behavior
            this.executeState(dt);

            // Check if stuck
            this.checkStuck(dt);

            // Update animation state
            this.survivor.animTimer = (this.survivor.animTimer || 0) + dt;
        }

        assessThreats() {
            let totalThreat = 0;
            const nearbyZombies = [];

            if (typeof zombies !== 'undefined' && Array.isArray(zombies)) {
                for (const z of zombies) {
                    const dist = this.distanceTo(z);
                    if (dist < CONFIG.THREAT.SCAN_RADIUS) {
                        const threatValue = CONFIG.THREAT.ZOMBIE_THREAT_BASE +
                            z.health * CONFIG.THREAT.ZOMBIE_THREAT_HEALTH_MULT;
                        const distanceFactor = 1 - (dist / CONFIG.THREAT.SCAN_RADIUS);
                        totalThreat += threatValue * distanceFactor;
                        nearbyZombies.push({ zombie: z, dist, threat: threatValue });
                    }
                }
            }

            // Check for bosses
            if (typeof BossSystem !== 'undefined' && BossSystem.activeBoss) {
                const boss = BossSystem.activeBoss;
                const dist = this.distanceTo(boss);
                if (dist < CONFIG.THREAT.SCAN_RADIUS * 2) {
                    totalThreat += CONFIG.THREAT.ZOMBIE_THREAT_BASE * CONFIG.THREAT.BOSS_THREAT_MULT;
                }
            }

            this.threatLevel = totalThreat;
            this.nearbyThreats = nearbyZombies.sort((a, b) => a.dist - b.dist);
        }

        evaluateStateTransition() {
            const s = this.survivor;
            const isFollowing = s.isFollowing || false;
            const role = s.role || 'None';
            const priorities = CONFIG.ROLE_PRIORITIES[role] || CONFIG.ROLE_PRIORITIES['None'];
            const healthPercent = s.health / (s.maxHealth || 50);

            // Critical health - flee or retreat
            if (healthPercent < CONFIG.COMBAT.RETREAT_HEALTH_PERCENT) {
                if (this.threatLevel > 0) {
                    this.transitionTo(STATES.FLEEING);
                    return;
                } else if (this.state === STATES.COMBAT) {
                    this.transitionTo(STATES.RETREATING);
                    return;
                }
            }

            // Following mode takes priority
            if (isFollowing && this.state !== STATES.COMBAT && this.state !== STATES.FLEEING) {
                if (this.distanceTo(player) > CONFIG.MOVEMENT.REGROUP_DISTANCE) {
                    this.transitionTo(STATES.FOLLOWING);
                    return;
                }
            }

            // Combat assessment
            if (this.threatLevel > 0 && this.nearbyThreats && this.nearbyThreats.length > 0) {
                const shouldFight = this.shouldEngageCombat(priorities, healthPercent);
                if (shouldFight) {
                    this.transitionTo(STATES.COMBAT);
                    return;
                } else if (this.threatLevel > CONFIG.THREAT.DANGER_THRESHOLD) {
                    this.transitionTo(STATES.RETREATING);
                    return;
                }
            }

            // Work roles
            if (!isFollowing && priorities.work > 0.5 && this.state !== STATES.WORKING) {
                if (this.canWork()) {
                    this.transitionTo(STATES.WORKING);
                    return;
                }
            }

            // Patrol for guards
            if (role === 'Guard' && !isFollowing && this.state === STATES.IDLE) {
                if (typeof isNight !== 'undefined' && isNight) {
                    this.transitionTo(STATES.PATROLLING);
                    return;
                }
            }

            // Default to following or idle
            if (isFollowing && this.state !== STATES.FOLLOWING) {
                this.transitionTo(STATES.FOLLOWING);
            } else if (!isFollowing && this.state === STATES.FOLLOWING) {
                this.transitionTo(STATES.IDLE);
            }
        }

        shouldEngageCombat(priorities, healthPercent) {
            const combatPriority = priorities.combat;
            const aggression = this.personality.aggression;
            const caution = this.personality.caution;

            // Combat threshold based on role and personality
            const combatThreshold = combatPriority * aggression;
            const healthFactor = healthPercent > 0.5 ? 1.0 : healthPercent * 2;
            const threatFactor = this.threatLevel < CONFIG.THREAT.DANGER_THRESHOLD ? 1.0 : 0.5;

            // Calculate engagement score
            const engageScore = combatThreshold * healthFactor * threatFactor;

            // Caution reduces engagement
            const cautiousFactor = 1 - (caution * 0.5);

            return engageScore * cautiousFactor > 0.4;
        }

        canWork() {
            const role = this.survivor.role;
            if (!role || role === 'None' || role === 'Guard' || role === 'Soldier') return false;

            // Check if there's work to do
            const target = this.findWorkTarget();
            return target !== null;
        }

        transitionTo(newState) {
            if (this.state === newState) return;

            this.previousState = this.state;
            this.state = newState;
            this.stateTimer = 0;
            this.survivor.state = newState;

            // State entry actions
            switch (newState) {
                case STATES.COMBAT:
                    this.selectCombatTarget();
                    break;
                case STATES.FLEEING:
                    this.calculateFleeTarget();
                    break;
                case STATES.PATROLLING:
                    this.generatePatrolPoints();
                    break;
                case STATES.WORKING:
                    this.target = this.findWorkTarget();
                    break;
            }
        }

        executeState(dt) {
            switch (this.state) {
                case STATES.IDLE:
                    this.executeIdle(dt);
                    break;
                case STATES.FOLLOWING:
                    this.executeFollowing(dt);
                    break;
                case STATES.WORKING:
                    this.executeWorking(dt);
                    break;
                case STATES.PATROLLING:
                    this.executePatrolling(dt);
                    break;
                case STATES.COMBAT:
                    this.executeCombat(dt);
                    break;
                case STATES.FLEEING:
                    this.executeFleeing(dt);
                    break;
                case STATES.RETREATING:
                    this.executeRetreating(dt);
                    break;
                case STATES.HEALING:
                    this.executeHealing(dt);
                    break;
                case STATES.REGROUPING:
                    this.executeRegrouping(dt);
                    break;
            }
        }

        // ============= STATE BEHAVIORS =============

        executeIdle(dt) {
            // Occasional wandering
            if (Math.random() < 0.01) {
                const wx = this.survivor.x + (Math.random() - 0.5) * 4;
                const wy = this.survivor.y + (Math.random() - 0.5) * 4;
                if (!isSolidAt(wx, wy, 0.3)) {
                    this.target = { x: wx, y: wy };
                    this.moveTowards(this.target, dt, 0.8);
                }
            }
        }

        executeFollowing(dt) {
            const s = this.survivor;
            const survIndex = survivors.indexOf(s);

            // Formation position around player
            const formationAngle = (survIndex * (Math.PI * 2 / Math.max(survivors.length - 1, 1)));
            const formationDist = CONFIG.COMBAT.FORMATION_SPACING;
            const targetX = player.x + Math.cos(formationAngle) * formationDist;
            const targetY = player.y + Math.sin(formationAngle) * formationDist;

            const distToTarget = this.distanceToPoint(targetX, targetY);

            if (distToTarget > 6) {
                // Use pathfinding for long distances
                if (this.repathTimer <= 0) {
                    this.path = typeof pathfinder !== 'undefined' ?
                        pathfinder.findPath(s.x, s.y, targetX, targetY) : null;
                    this.pathIndex = 0;
                    this.repathTimer = 2.0;
                }
                this.followPath(dt, 1.2);
            } else if (distToTarget > 0.5) {
                // Direct steering with separation
                this.moveTowardsWithSeparation({ x: targetX, y: targetY }, dt, 1.0);
            }

            // Combat check while following
            if (this.nearbyThreats && this.nearbyThreats.length > 0) {
                const nearest = this.nearbyThreats[0];
                if (nearest.dist < CONFIG.COMBAT.ENGAGE_RANGE) {
                    this.attackTarget(nearest.zombie, dt);
                }
            }
        }

        executeWorking(dt) {
            const s = this.survivor;

            if (!this.target) {
                this.transitionTo(STATES.IDLE);
                return;
            }

            const dist = this.distanceToPoint(this.target.x, this.target.y);

            if (dist > 1.2) {
                // Move to work target
                this.moveTowards(this.target, dt, 0.8);
            } else {
                // Working
                s.taskTimer = (s.taskTimer || 0) + dt;

                // Work particles
                if (s.taskTimer % 0.8 < 0.1) {
                    const colors = {
                        'Woodcutter': '#deb887',
                        'Miner': '#a9a9a9',
                        'Farmer': '#90ee90',
                        'Medic': '#ff69b4'
                    };
                    if (typeof spawnParticles === 'function') {
                        spawnParticles(s.x, s.y, colors[s.role] || '#ffffff', 2);
                    }
                }

                // Complete work
                if (s.taskTimer > 3) {
                    this.completeWork();
                    s.taskTimer = 0;
                    this.target = null;
                    this.transitionTo(STATES.IDLE);
                }
            }
        }

        executePatrolling(dt) {
            if (!this.patrolPoints || this.patrolPoints.length === 0) {
                this.generatePatrolPoints();
                return;
            }

            const currentPoint = this.patrolPoints[this.patrolIndex];
            const dist = this.distanceToPoint(currentPoint.x, currentPoint.y);

            if (dist > 0.8) {
                this.moveTowards(currentPoint, dt, 0.7);
            } else {
                // Reached patrol point, wait then move to next
                if (this.stateTimer > CONFIG.MOVEMENT.PATROL_POINT_TIME) {
                    this.patrolIndex = (this.patrolIndex + 1) % this.patrolPoints.length;
                    this.stateTimer = 0;
                }
            }

            // Check for threats while patrolling
            if (this.nearbyThreats && this.nearbyThreats.length > 0) {
                const nearest = this.nearbyThreats[0];
                if (nearest.dist < CONFIG.COMBAT.ENGAGE_RANGE * 1.5) {
                    this.transitionTo(STATES.COMBAT);
                }
            }
        }

        executeCombat(dt) {
            const s = this.survivor;

            // Validate combat target
            if (!this.combatTarget || this.combatTarget.health <= 0) {
                this.selectCombatTarget();
                if (!this.combatTarget) {
                    this.transitionTo(this.previousState || STATES.IDLE);
                    return;
                }
            }

            const dist = this.distanceTo(this.combatTarget);
            const role = s.role || 'None';

            // Role-specific combat behavior
            if (role === 'Hunter') {
                // Kiting behavior
                if (dist < CONFIG.COMBAT.KITE_DISTANCE) {
                    this.kiteFromTarget(this.combatTarget, dt);
                } else if (dist > CONFIG.COMBAT.ENGAGE_RANGE) {
                    this.moveTowards(this.combatTarget, dt, 0.9);
                }
            } else if (role === 'Guard' || role === 'Soldier') {
                // Aggressive engagement
                if (dist > 0.8) {
                    this.moveTowards(this.combatTarget, dt, 1.1);
                }
            } else {
                // Default combat - maintain distance
                if (dist > CONFIG.COMBAT.ENGAGE_RANGE) {
                    this.moveTowards(this.combatTarget, dt, 0.8);
                } else if (dist < 1.0) {
                    this.kiteFromTarget(this.combatTarget, dt);
                }
            }

            // Attack if in range
            if (dist < CONFIG.COMBAT.ENGAGE_RANGE) {
                this.attackTarget(this.combatTarget, dt);
            }
        }

        executeFleeing(dt) {
            if (!this.fleeTarget) {
                this.calculateFleeTarget();
            }

            const dist = this.distanceToPoint(this.fleeTarget.x, this.fleeTarget.y);

            if (dist > 1) {
                this.moveTowards(this.fleeTarget, dt, 1.3);
            } else {
                // Reached flee target, reassess
                if (this.threatLevel < CONFIG.THREAT.DANGER_THRESHOLD) {
                    this.transitionTo(STATES.RETREATING);
                } else {
                    this.calculateFleeTarget();
                }
            }
        }

        executeRetreating(dt) {
            // Move towards player for safety
            const dist = this.distanceTo(player);

            if (dist > 2) {
                this.moveTowards(player, dt, 1.1);
            } else {
                // Near player, wait for health or threat reduction
                if (this.survivor.health > (this.survivor.maxHealth || 50) * 0.5) {
                    this.transitionTo(STATES.IDLE);
                } else if (this.threatLevel === 0) {
                    this.transitionTo(STATES.HEALING);
                }
            }
        }

        executeHealing(dt) {
            // Stay still and recover
            // Medics can assist
            if (this.survivor.health >= (this.survivor.maxHealth || 50) * 0.8) {
                this.transitionTo(STATES.IDLE);
            }

            // Passive healing when out of combat
            if (this.threatLevel === 0 && this.stateTimer > 2) {
                this.survivor.health = Math.min(
                    (this.survivor.maxHealth || 50),
                    this.survivor.health + dt * 2
                );
            }
        }

        executeRegrouping(dt) {
            const dist = this.distanceTo(player);

            if (dist > CONFIG.MOVEMENT.REGROUP_DISTANCE) {
                this.moveTowards(player, dt, 1.2);
            } else {
                this.transitionTo(STATES.FOLLOWING);
            }
        }

        // ============= HELPER METHODS =============

        moveTowards(target, dt, speedMult = 1.0) {
            const s = this.survivor;
            const dx = target.x - s.x;
            const dy = target.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 0.1) return;

            const speed = (SURVIVOR_CONFIG?.WANDER_SPEED || 1.2) * speedMult * dt;
            const moveX = (dx / dist) * speed;
            const moveY = (dy / dist) * speed;

            this.tryMove(moveX, moveY);
            s.isMoving = true;
        }

        moveTowardsWithSeparation(target, dt, speedMult = 1.0) {
            const s = this.survivor;
            const dx = target.x - s.x;
            const dy = target.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 0.1) return;

            // Calculate separation from other survivors
            let sepX = 0, sepY = 0;
            if (typeof survivors !== 'undefined') {
                for (const other of survivors) {
                    if (other === s || other.isPlayer) continue;
                    const odx = s.x - other.x;
                    const ody = s.y - other.y;
                    const odist = Math.sqrt(odx * odx + ody * ody);
                    if (odist < 1.0 && odist > 0) {
                        sepX += (odx / odist) / odist;
                        sepY += (ody / odist) / odist;
                    }
                }
            }

            const speed = (SURVIVOR_CONFIG?.FOLLOW_SPEED || 2.5) * speedMult * dt;
            let moveX = (dx / dist) + sepX * 1.5;
            let moveY = (dy / dist) + sepY * 1.5;

            // Normalize
            const moveMag = Math.sqrt(moveX * moveX + moveY * moveY);
            if (moveMag > 0) {
                moveX = (moveX / moveMag) * speed;
                moveY = (moveY / moveMag) * speed;
            }

            this.tryMove(moveX, moveY);
            s.isMoving = true;
        }

        kiteFromTarget(target, dt) {
            const s = this.survivor;
            const dx = s.x - target.x;
            const dy = s.y - target.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 0.1) return;

            // Move away while strafing slightly
            const strafeAngle = Math.sin(this.stateTimer * 3) * 0.5;
            const angle = Math.atan2(dy, dx) + strafeAngle;

            const speed = (SURVIVOR_CONFIG?.WANDER_SPEED || 1.2) * dt;
            const moveX = Math.cos(angle) * speed;
            const moveY = Math.sin(angle) * speed;

            this.tryMove(moveX, moveY);
            s.isMoving = true;
        }

        followPath(dt, speedMult = 1.0) {
            if (!this.path || this.pathIndex >= this.path.length) return;

            const node = this.path[this.pathIndex];
            const dist = this.distanceToPoint(node.x, node.y);

            if (dist < 0.3) {
                this.pathIndex++;
                return;
            }

            this.moveTowards(node, dt, speedMult);
        }

        tryMove(moveX, moveY) {
            const s = this.survivor;
            const newX = s.x + moveX;
            const newY = s.y + moveY;

            // Update direction
            if (Math.abs(moveX) > Math.abs(moveY)) {
                s.direction = moveX > 0 ? 0 : 2;
            } else if (Math.abs(moveY) > 0.001) {
                s.direction = moveY > 0 ? 1 : 3;
            }

            // Try full movement
            if (!isSolidAt(newX, newY, 0.3)) {
                s.x = newX;
                s.y = newY;
                return true;
            }

            // Wall sliding
            if (!isSolidAt(newX, s.y, 0.3)) {
                s.x = newX;
                return true;
            }
            if (!isSolidAt(s.x, newY, 0.3)) {
                s.y = newY;
                return true;
            }

            return false;
        }

        attackTarget(target, dt) {
            const s = this.survivor;
            s.attackCooldown = (s.attackCooldown || 0) - dt;

            if (s.attackCooldown <= 0) {
                const damage = SURVIVOR_CONFIG?.COMBAT_DAMAGE || 8;
                target.health -= damage;

                if (typeof addDamageNumber === 'function') {
                    addDamageNumber(target.x, target.y - 0.3, damage, '#00ff00');
                }
                if (typeof spawnParticles === 'function') {
                    spawnParticles(target.x, target.y, '#ff8844', 3);
                }

                s.attackCooldown = SURVIVOR_CONFIG?.COMBAT_COOLDOWN || 0.5;
            }
        }

        selectCombatTarget() {
            if (!this.nearbyThreats || this.nearbyThreats.length === 0) {
                this.combatTarget = null;
                return;
            }

            // Focus fire - attack what player is attacking or lowest health
            let bestTarget = null;
            let bestScore = -Infinity;

            for (const threat of this.nearbyThreats) {
                if (threat.zombie.health <= 0) continue;

                let score = 100 - threat.dist * 10;
                score -= threat.zombie.health;

                // Prefer targets already damaged
                if (threat.zombie.health < threat.zombie.maxHealth) {
                    score += 20;
                }

                if (score > bestScore) {
                    bestScore = score;
                    bestTarget = threat.zombie;
                }
            }

            this.combatTarget = bestTarget;
        }

        calculateFleeTarget() {
            const s = this.survivor;

            // Flee away from threats and towards player
            let fleeX = 0, fleeY = 0;

            if (this.nearbyThreats) {
                for (const threat of this.nearbyThreats) {
                    const dx = s.x - threat.zombie.x;
                    const dy = s.y - threat.zombie.y;
                    const dist = threat.dist || 1;
                    fleeX += (dx / dist) * (1 / dist);
                    fleeY += (dy / dist) * (1 / dist);
                }
            }

            // Add bias towards player
            const toPlayerX = player.x - s.x;
            const toPlayerY = player.y - s.y;
            const playerDist = Math.sqrt(toPlayerX * toPlayerX + toPlayerY * toPlayerY);
            if (playerDist > 0) {
                fleeX += (toPlayerX / playerDist) * 0.5;
                fleeY += (toPlayerY / playerDist) * 0.5;
            }

            const fleeMag = Math.sqrt(fleeX * fleeX + fleeY * fleeY);
            if (fleeMag > 0) {
                this.fleeTarget = {
                    x: s.x + (fleeX / fleeMag) * CONFIG.MOVEMENT.FLEE_DISTANCE,
                    y: s.y + (fleeY / fleeMag) * CONFIG.MOVEMENT.FLEE_DISTANCE
                };
            } else {
                this.fleeTarget = { x: player.x, y: player.y };
            }
        }

        generatePatrolPoints() {
            const s = this.survivor;
            const baseX = s.x;
            const baseY = s.y;

            // Generate 4-6 patrol points in a rough pattern
            const pointCount = 4 + Math.floor(Math.random() * 3);
            this.patrolPoints = [];

            for (let i = 0; i < pointCount; i++) {
                const angle = (i / pointCount) * Math.PI * 2 + Math.random() * 0.5;
                const radius = CONFIG.MOVEMENT.PATROL_RADIUS * (0.5 + Math.random() * 0.5);
                const px = baseX + Math.cos(angle) * radius;
                const py = baseY + Math.sin(angle) * radius;

                if (!isSolidAt(px, py, 0.3)) {
                    this.patrolPoints.push({ x: px, y: py });
                }
            }

            // Fallback
            if (this.patrolPoints.length === 0) {
                this.patrolPoints.push({ x: baseX, y: baseY });
            }

            this.patrolIndex = 0;
        }

        findWorkTarget() {
            const s = this.survivor;
            const role = s.role;

            if (!role) return null;

            let targetType = null;
            switch (role) {
                case 'Woodcutter': targetType = typeof TILES !== 'undefined' ? TILES.TREE : 2; break;
                case 'Miner': targetType = typeof TILES !== 'undefined' ? TILES.STONE : 3; break;
                case 'Farmer': targetType = typeof TILES !== 'undefined' ? TILES.FARM : 12; break;
                case 'Medic':
                    // Find injured ally
                    if (player.health < (player.maxHealth || 100) * 0.8) {
                        return { x: player.x, y: player.y, entity: player };
                    }
                    for (const other of survivors) {
                        if (other !== s && other.health < (other.maxHealth || 50) * 0.8) {
                            return { x: other.x, y: other.y, entity: other };
                        }
                    }
                    return null;
            }

            if (targetType !== null) {
                return this.findNearestTile(s.x, s.y, targetType, 40);
            }

            return null;
        }

        findNearestTile(cx, cy, tileType, radius) {
            if (typeof getTile !== 'function') return null;

            const startX = Math.floor(cx);
            const startY = Math.floor(cy);
            let bestDist = Infinity;
            let best = null;

            for (let y = startY - radius; y <= startY + radius; y++) {
                for (let x = startX - radius; x <= startX + radius; x++) {
                    if (getTile(x, y) === tileType) {
                        const dx = x - cx;
                        const dy = y - cy;
                        const d = dx * dx + dy * dy;
                        if (d < bestDist) {
                            bestDist = d;
                            best = { x: x + 0.5, y: y + 0.5 };
                        }
                    }
                }
            }
            return best;
        }

        completeWork() {
            const s = this.survivor;
            const role = s.role;

            if (!this.target) return;

            const tx = Math.floor(this.target.x);
            const ty = Math.floor(this.target.y);

            switch (role) {
                case 'Woodcutter':
                    if (typeof resources !== 'undefined') resources.wood += 2;
                    if (typeof setTile === 'function') setTile(tx, ty, TILES?.GRASS || 0);
                    if (typeof spawnParticles === 'function') spawnParticles(s.x, s.y - 0.5, '#deb887', 5);
                    if (typeof addDamageNumber === 'function') addDamageNumber(s.x, s.y - 0.5, '+2', '#deb887');
                    break;

                case 'Miner':
                    if (typeof resources !== 'undefined') {
                        resources.stone += 2;
                        if (Math.random() < 0.4) resources.iron++;
                    }
                    if (typeof setTile === 'function') setTile(tx, ty, TILES?.GRASS || 0);
                    if (typeof spawnParticles === 'function') spawnParticles(s.x, s.y - 0.5, '#a9a9a9', 5);
                    if (typeof addDamageNumber === 'function') addDamageNumber(s.x, s.y - 0.5, '+2', '#a9a9a9');
                    break;

                case 'Farmer':
                    if (typeof resources !== 'undefined') resources.food += 1;
                    if (typeof spawnParticles === 'function') spawnParticles(s.x, s.y - 0.5, '#90ee90', 5);
                    if (typeof addDamageNumber === 'function') addDamageNumber(s.x, s.y - 0.5, '+1', '#90ee90');
                    break;

                case 'Medic':
                    if (this.target.entity) {
                        const healTarget = this.target.entity;
                        const healAmount = 10;
                        healTarget.health = Math.min(
                            healTarget.maxHealth || 100,
                            healTarget.health + healAmount
                        );
                        if (typeof spawnParticles === 'function') {
                            spawnParticles(healTarget.x, healTarget.y, '#ff69b4', 5);
                        }
                        if (typeof addDamageNumber === 'function') {
                            addDamageNumber(healTarget.x, healTarget.y - 0.5, '+' + healAmount, '#ff69b4');
                        }
                    }
                    break;
            }
        }

        checkStuck(dt) {
            const s = this.survivor;
            const dx = s.x - this.lastPosition.x;
            const dy = s.y - this.lastPosition.y;
            const movedDist = dx * dx + dy * dy;

            if (movedDist < 0.0001 && s.isMoving) {
                this.stuckTimer += dt;
            } else {
                this.stuckTimer = 0;
            }

            this.lastPosition.x = s.x;
            this.lastPosition.y = s.y;

            if (this.stuckTimer > CONFIG.MOVEMENT.STUCK_THRESHOLD) {
                // Unstick by resetting state
                this.path = null;
                this.target = null;
                this.stuckTimer = 0;
                this.transitionTo(STATES.IDLE);
            }
        }

        distanceTo(entity) {
            if (!entity) return Infinity;
            const dx = this.survivor.x - entity.x;
            const dy = this.survivor.y - entity.y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        distanceToPoint(x, y) {
            const dx = this.survivor.x - x;
            const dy = this.survivor.y - y;
            return Math.sqrt(dx * dx + dy * dy);
        }
    }

    // ============= AI INSTANCES =============
    const aiInstances = new Map();

    function getOrCreateAI(survivor) {
        if (!aiInstances.has(survivor)) {
            aiInstances.set(survivor, new SurvivorStateMachine(survivor));
        }
        return aiInstances.get(survivor);
    }

    function removeAI(survivor) {
        aiInstances.delete(survivor);
    }

    // ============= UPDATE FUNCTION =============
    function update(dt) {
        if (typeof survivors === 'undefined' || !Array.isArray(survivors)) return;

        for (const survivor of survivors) {
            if (survivor.isPlayer || survivor.health <= 0) continue;

            const ai = getOrCreateAI(survivor);
            ai.update(dt);
        }

        // Clean up dead survivors
        for (const [survivor, ai] of aiInstances) {
            if (!survivors.includes(survivor) || survivor.health <= 0) {
                aiInstances.delete(survivor);
            }
        }
    }

    // ============= PUBLIC API =============
    return {
        CONFIG,
        STATES,
        SurvivorStateMachine,

        update,
        getOrCreateAI,
        removeAI,

        // Debug
        getAIState(survivor) {
            const ai = aiInstances.get(survivor);
            return ai ? {
                state: ai.state,
                threatLevel: ai.threatLevel,
                target: ai.target,
                combatTarget: ai.combatTarget,
                personality: ai.personality
            } : null;
        },

        getActiveCount() {
            return aiInstances.size;
        }
    };
})();

// Export globally
window.SurvivorAISystem = SurvivorAISystem;
