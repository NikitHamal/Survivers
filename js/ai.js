// ============= AI SYSTEM =============
const AI_CONFIG = {
    SEPARATION_RADIUS: 0.8,
    SEPARATION_FORCE: 2.5,
    ALIGNMENT_FORCE: 0.5,
    COHESION_FORCE: 0.1,
    OBSTACLE_AVOIDANCE_FORCE: 4.0,
    PATH_FOLLOW_FORCE: 2.0,
    MAX_STEER_FORCE: 5.0
};

class SteeringBehavior {
    static seek(entity, targetX, targetY, dt) {
        const dx = targetX - entity.x;
        const dy = targetY - entity.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.01) return { x: 0, y: 0 };

        // Desired velocity
        const desiredX = (dx / dist) * entity.speed;
        const desiredY = (dy / dist) * entity.speed;

        return { x: desiredX, y: desiredY };
    }

    static arrive(entity, targetX, targetY, radius = 1.0) {
        const dx = targetX - entity.x;
        const dy = targetY - entity.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.1) return { x: 0, y: 0 };

        let speed = entity.speed;
        if (dist < radius) {
            speed = speed * (dist / radius);
        }

        const desiredX = (dx / dist) * speed;
        const desiredY = (dy / dist) * speed;

        return { x: desiredX, y: desiredY };
    }

    static separate(entity, neighbors, radius = AI_CONFIG.SEPARATION_RADIUS) {
        let steerX = 0;
        let steerY = 0;
        let count = 0;
        const radiusSq = radius * radius;

        for (const other of neighbors) {
            if (other === entity) continue;

            const dx = entity.x - other.x;
            const dy = entity.y - other.y;
            const distSq = dx * dx + dy * dy;

            if (distSq > 0 && distSq < radiusSq) {
                const dist = Math.sqrt(distSq);

                // Vector pointing away from neighbor
                // Weighted by distance (closer = stronger)
                const strength = 1.0 / dist;
                steerX += (dx / dist) * strength;
                steerY += (dy / dist) * strength;
                count++;
            }
        }

        if (count > 0) {
            steerX /= count;
            steerY /= count;

            // Normalize and scale to max speed
            const mag = Math.sqrt(steerX * steerX + steerY * steerY);
            if (mag > 0) {
                steerX = (steerX / mag) * AI_CONFIG.SEPARATION_FORCE;
                steerY = (steerY / mag) * AI_CONFIG.SEPARATION_FORCE;
            }
        }

        return { x: steerX, y: steerY };
    }
}

class EntityAI {
    constructor(entity) {
        this.entity = entity;
        this.path = null;
        this.pathIndex = 0;
        this.state = 'IDLE';
        this.target = null;
        this.repathTimer = 0;
        this.stuckTimer = 0;
        this.lastPos = { x: 0, y: 0 };
    }

    update(dt) {
        // Base update method
    }

    followPath(dt) {
        if (!this.path || this.pathIndex >= this.path.length) return null;

        const node = this.path[this.pathIndex];
        const distSq = (node.x - this.entity.x) ** 2 + (node.y - this.entity.y) ** 2;

        if (distSq < 0.25) { // Reached node
            this.pathIndex++;
            if (this.pathIndex >= this.path.length) return null; // Path complete
            return this.path[this.pathIndex];
        }

        return node;
    }

    checkStuck(dt) {
        const dx = this.entity.x - this.lastPos.x;
        const dy = this.entity.y - this.lastPos.y;
        const movedDist = dx * dx + dy * dy;

        if (movedDist < 0.0001) {
            this.stuckTimer += dt;
        } else {
            this.stuckTimer = 0;
        }

        this.lastPos.x = this.entity.x;
        this.lastPos.y = this.entity.y;

        return this.stuckTimer > 1.0; // Stuck for 1 second
    }
}

class ZombieAI extends EntityAI {
    constructor(entity) {
        super(entity);
        this.wallDamageTimer = 0;
    }

    update(dt, neighbors) {
        if (this.entity.health <= 0) return;

        // Reset forces
        let accX = 0;
        let accY = 0;

        if (isNight) {
            this.updateNightBehavior(dt);
        } else {
            this.updateDayBehavior(dt);
        }

        // Apply separation
        const separation = SteeringBehavior.separate(this.entity, neighbors);
        accX += separation.x;
        accY += separation.y;

        // Apply Movement from AI behavior
        if (this.moveTarget) {
            const seek = SteeringBehavior.seek(this.entity, this.moveTarget.x, this.moveTarget.y, dt);
            accX += seek.x * 2.0; // Seek is stronger
            accY += seek.y * 2.0;
        }

        // Limit force
        const forceMag = Math.sqrt(accX * accX + accY * accY);
        if (forceMag > AI_CONFIG.MAX_STEER_FORCE) {
            accX = (accX / forceMag) * AI_CONFIG.MAX_STEER_FORCE;
            accY = (accY / forceMag) * AI_CONFIG.MAX_STEER_FORCE;
        }

        // Apply velocity (simplified physics)
        const newX = this.entity.x + accX * dt;
        const newY = this.entity.y + accY * dt;

        // Handle collisions and movement
        this.handleMovement(newX, newY, dt);
    }

    updateNightBehavior(dt) {
        this.repathTimer -= dt;

        // Find target
        if (!this.target || this.repathTimer <= 0) {
            this.target = this.findTarget();
            this.repathTimer = 2.0 + Math.random();

            // Generate path
            if (this.target) {
                // Check direct line of sight first
                if (this.hasLineOfSight(this.target)) {
                    this.path = null;
                    this.moveTarget = { x: this.target.x, y: this.target.y };
                } else {
                    this.path = pathfinder.findPath(this.entity.x, this.entity.y, this.target.x, this.target.y);
                    this.pathIndex = 0;
                }
            }
        }

        // Follow path
        if (this.path) {
            const nextNode = this.followPath(dt);
            if (nextNode) {
                this.moveTarget = nextNode;
            } else if (this.target) {
                this.moveTarget = { x: this.target.x, y: this.target.y };
            }
        } else if (this.target) {
            this.moveTarget = { x: this.target.x, y: this.target.y };
        }

        // Attack logic
        if (this.target) {
            const dist = Math.sqrt((this.entity.x - this.target.x) ** 2 + (this.entity.y - this.target.y) ** 2);
            if (dist < ZOMBIE_CONFIG.ATTACK_RANGE) {
                this.entity.attackCooldown -= dt;
                if (this.entity.attackCooldown <= 0) {
                    this.attack(this.target);
                    this.entity.attackCooldown = ZOMBIE_CONFIG.ATTACK_COOLDOWN;
                }
                this.moveTarget = null; // Stop moving when attacking
            }
        }
    }

    updateDayBehavior(dt) {
        if (window.invisibility) {
            this.moveTarget = null;
            return;
        }

        // Flee from player
        const dx = this.entity.x - player.x;
        const dy = this.entity.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < ZOMBIE_CONFIG.FLEE_RANGE) {
            // Flee target position
            this.moveTarget = {
                x: this.entity.x + (dx / dist) * 10,
                y: this.entity.y + (dy / dist) * 10
            };
        } else {
            this.moveTarget = null; // Idle
        }
    }

    findTarget() {
        // Simple nearest target logic
        let nearest = window.invisibility ? null : player;
        let minDist = nearest ? ((player.x - this.entity.x) ** 2 + (player.y - this.entity.y) ** 2) : Infinity;

        for (const s of survivors) {
            if (s.isPlayer || s.health <= 0) continue;
            const d = (s.x - this.entity.x) ** 2 + (s.y - this.entity.y) ** 2;
            if (d < minDist) {
                minDist = d;
                nearest = s;
            }
        }
        return nearest;
    }

    hasLineOfSight(target) {
        // Raycast check (simplified)
        // Ideally use Bresenham's or step ray
        const steps = 10;
        const dx = (target.x - this.entity.x) / steps;
        const dy = (target.y - this.entity.y) / steps;

        for (let i = 1; i < steps; i++) {
            const tx = this.entity.x + dx * i;
            const ty = this.entity.y + dy * i;
            if (isSolidAt(tx, ty, 0.1)) return false;
        }
        return true;
    }

    handleMovement(targetX, targetY, dt) {
        const dx = targetX - this.entity.x;
        const dy = targetY - this.entity.y;

        // Try move
        const col = getCollidingTile(targetX, targetY, 0.3);

        if (!col) {
            this.entity.x = targetX;
            this.entity.y = targetY;
            this.wallDamageTimer = 0;
        } else if (col.tile === TILES.WALL) {
            // Wall breaking logic
            this.wallDamageTimer += dt;
            if (this.wallDamageTimer > ZOMBIE_CONFIG.WALL_DAMAGE_TIME) {
                setTile(col.x, col.y, TILES.GRASS);
                spawnParticles(col.x + 0.5, col.y + 0.5, '#8b7355', 10);
                triggerScreenShake(2);
                this.wallDamageTimer = 0;
            }
        } else {
            // Slide
            if (!isSolidAt(targetX, this.entity.y, 0.3)) this.entity.x = targetX;
            else if (!isSolidAt(this.entity.x, targetY, 0.3)) this.entity.y = targetY;
        }
    }

    attack(target) {
        if (target.isPlayer && window.godMode) return;
        target.health -= this.entity.damage;
        spawnParticles(target.x, target.y, '#ff4444', 5);
        addDamageNumber(target.x, target.y - 0.5, this.entity.damage, '#ff4444');
    }
}

class SurvivorAI extends EntityAI {
    constructor(entity) {
        super(entity);
    }

    update(dt, neighbors) {
        if (this.entity.health <= 0 || this.entity.isPlayer) return;

        // Logic similar to ZombieAI but for survivors
        // Delegate to existing logic via improved implementation
        // For now, we will use the improved steering for movement in the main entities.js
    }
}
