// ============= AI SYSTEM =============
const AI_CONFIG = {
    SEPARATION_RADIUS: 0.8,
    SEPARATION_FORCE: 2.5,
    ALIGNMENT_FORCE: 0.8,
    COHESION_FORCE: 0.4,
    OBSTACLE_AVOIDANCE_FORCE: 4.0,
    PATH_FOLLOW_FORCE: 2.0,
    MAX_STEER_FORCE: 5.0,

    // Pack behavior settings
    PACK_RADIUS: 6.0,
    PACK_MIN_SIZE: 3,
    PACK_COHESION_MULT: 1.5,
    PACK_AGGRESSION_BONUS: 0.2,

    // Special attack settings
    SPITTER_RANGE: 6.0,
    SPITTER_COOLDOWN: 3.0,
    SPITTER_DAMAGE: 12,
    SPITTER_PROJECTILE_SPEED: 8,

    SCREAMER_RANGE: 8.0,
    SCREAMER_COOLDOWN: 8.0,
    SCREAMER_BUFF_DURATION: 5.0,
    SCREAMER_BUFF_DAMAGE: 1.3,
    SCREAMER_BUFF_SPEED: 1.2,

    BRUTE_CHARGE_RANGE: 4.0,
    BRUTE_CHARGE_SPEED: 6.0,
    BRUTE_CHARGE_DAMAGE: 25,
    BRUTE_CHARGE_COOLDOWN: 6.0,

    CRAWLER_DODGE_CHANCE: 0.3,
    CRAWLER_SNEAK_SPEED_MULT: 1.4,

    BOSS_SLAM_RANGE: 2.5,
    BOSS_SLAM_DAMAGE: 40,
    BOSS_SLAM_COOLDOWN: 4.0,
    BOSS_SUMMON_COOLDOWN: 15.0,
    BOSS_SUMMON_COUNT: 3
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

    // Pack cohesion - move toward center of nearby pack members
    static cohesion(entity, neighbors, radius = AI_CONFIG.PACK_RADIUS) {
        let centerX = 0;
        let centerY = 0;
        let count = 0;
        const radiusSq = radius * radius;

        for (const other of neighbors) {
            if (other === entity) continue;

            const dx = other.x - entity.x;
            const dy = other.y - entity.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < radiusSq) {
                centerX += other.x;
                centerY += other.y;
                count++;
            }
        }

        if (count > 0) {
            centerX /= count;
            centerY /= count;

            const dx = centerX - entity.x;
            const dy = centerY - entity.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0.1) {
                return {
                    x: (dx / dist) * AI_CONFIG.COHESION_FORCE,
                    y: (dy / dist) * AI_CONFIG.COHESION_FORCE
                };
            }
        }

        return { x: 0, y: 0 };
    }

    // Pack alignment - match velocity of nearby pack members
    static alignment(entity, neighbors, radius = AI_CONFIG.PACK_RADIUS) {
        let avgVX = 0;
        let avgVY = 0;
        let count = 0;
        const radiusSq = radius * radius;

        for (const other of neighbors) {
            if (other === entity) continue;

            const dx = other.x - entity.x;
            const dy = other.y - entity.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < radiusSq && other.vx !== undefined) {
                avgVX += other.vx || 0;
                avgVY += other.vy || 0;
                count++;
            }
        }

        if (count > 0) {
            avgVX /= count;
            avgVY /= count;

            const mag = Math.sqrt(avgVX * avgVX + avgVY * avgVY);
            if (mag > 0.1) {
                return {
                    x: (avgVX / mag) * AI_CONFIG.ALIGNMENT_FORCE,
                    y: (avgVY / mag) * AI_CONFIG.ALIGNMENT_FORCE
                };
            }
        }

        return { x: 0, y: 0 };
    }

    // Flank target - try to approach from the side
    static flank(entity, target, neighbors) {
        const dx = target.x - entity.x;
        const dy = target.y - entity.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.5) return { x: 0, y: 0 };

        // Perpendicular direction for flanking
        const perpX = -dy / dist;
        const perpY = dx / dist;

        // Determine which side to flank based on entity position
        const side = (entity.x * 13 + entity.y * 17) % 2 === 0 ? 1 : -1;

        // Blend direct approach with flanking
        const flankWeight = Math.min(1.0, dist / 5.0);
        const directWeight = 1.0 - flankWeight * 0.5;

        return {
            x: (dx / dist) * directWeight + perpX * side * flankWeight * 0.5,
            y: (dy / dist) * directWeight + perpY * side * flankWeight * 0.5
        };
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

        // Special ability cooldowns
        this.spitCooldown = AI_CONFIG.SPITTER_COOLDOWN * (0.8 + Math.random() * 0.4);
        this.screamCooldown = AI_CONFIG.SCREAMER_COOLDOWN * (0.8 + Math.random() * 0.4);
        this.chargeCooldown = AI_CONFIG.BRUTE_CHARGE_COOLDOWN;
        this.slamCooldown = AI_CONFIG.BOSS_SLAM_COOLDOWN;
        this.summonCooldown = AI_CONFIG.BOSS_SUMMON_COOLDOWN;

        // State flags
        this.isCharging = false;
        this.chargeTarget = null;
        this.chargeSpeed = 0;
        this.buffTimer = 0;
        this.buffDamageMult = 1.0;
        this.buffSpeedMult = 1.0;

        // Pack awareness
        this.packSize = 0;
        this.isInPack = false;
        this.packLeader = null;
    }

    update(dt, neighbors) {
        if (this.entity.health <= 0) return;

        // Update buff timers
        this.updateBuffs(dt);

        // Update special cooldowns
        this.spitCooldown = Math.max(0, this.spitCooldown - dt);
        this.screamCooldown = Math.max(0, this.screamCooldown - dt);
        this.chargeCooldown = Math.max(0, this.chargeCooldown - dt);
        this.slamCooldown = Math.max(0, this.slamCooldown - dt);
        this.summonCooldown = Math.max(0, this.summonCooldown - dt);

        // Calculate pack size for behavior bonuses
        this.calculatePackStatus(neighbors);

        // Reset forces
        let accX = 0;
        let accY = 0;

        if (isNight) {
            this.updateNightBehavior(dt, neighbors);
        } else {
            this.updateDayBehavior(dt);
        }

        // Handle special charge state
        if (this.isCharging && this.chargeTarget) {
            this.updateCharge(dt);
            return;
        }

        // Apply separation
        const separation = SteeringBehavior.separate(this.entity, neighbors);
        accX += separation.x;
        accY += separation.y;

        // Apply pack behavior when in a group (cohesion + alignment)
        if (this.isInPack && this.packSize >= AI_CONFIG.PACK_MIN_SIZE) {
            const cohesion = SteeringBehavior.cohesion(this.entity, neighbors);
            const alignment = SteeringBehavior.alignment(this.entity, neighbors);

            // Pack cohesion is stronger at night
            const cohesionMult = isNight ? AI_CONFIG.PACK_COHESION_MULT : 0.5;
            accX += cohesion.x * cohesionMult;
            accY += cohesion.y * cohesionMult;
            accX += alignment.x;
            accY += alignment.y;
        }

        // Apply Movement from AI behavior
        if (this.moveTarget) {
            // Use flanking for larger packs
            if (this.target && this.isInPack && this.packSize >= 4) {
                const flank = SteeringBehavior.flank(this.entity, this.target, neighbors);
                accX += flank.x * 2.0;
                accY += flank.y * 2.0;
            } else {
                const seek = SteeringBehavior.seek(this.entity, this.moveTarget.x, this.moveTarget.y, dt);
                accX += seek.x * 2.0;
                accY += seek.y * 2.0;
            }
        }

        // Apply buff speed multiplier
        const effectiveSpeed = this.entity.speed * this.buffSpeedMult;

        // Limit force
        const forceMag = Math.sqrt(accX * accX + accY * accY);
        if (forceMag > AI_CONFIG.MAX_STEER_FORCE) {
            accX = (accX / forceMag) * AI_CONFIG.MAX_STEER_FORCE;
            accY = (accY / forceMag) * AI_CONFIG.MAX_STEER_FORCE;
        }

        // Scale by effective speed
        accX *= (effectiveSpeed / this.entity.speed);
        accY *= (effectiveSpeed / this.entity.speed);

        // Store velocity for alignment behavior
        this.entity.vx = accX;
        this.entity.vy = accY;

        // Apply velocity (simplified physics)
        const newX = this.entity.x + accX * dt;
        const newY = this.entity.y + accY * dt;

        // Handle collisions and movement
        this.handleMovement(newX, newY, dt);
    }

    updateBuffs(dt) {
        if (this.buffTimer > 0) {
            this.buffTimer -= dt;
            if (this.buffTimer <= 0) {
                this.buffDamageMult = 1.0;
                this.buffSpeedMult = 1.0;
            }
        }
    }

    calculatePackStatus(neighbors) {
        let count = 0;
        const radiusSq = AI_CONFIG.PACK_RADIUS * AI_CONFIG.PACK_RADIUS;

        for (const other of neighbors) {
            if (other === this.entity) continue;
            const dx = other.x - this.entity.x;
            const dy = other.y - this.entity.y;
            if (dx * dx + dy * dy < radiusSq) {
                count++;
            }
        }

        this.packSize = count;
        this.isInPack = count >= 2;
    }

    applyBuff(damageMult, speedMult, duration) {
        this.buffDamageMult = Math.max(this.buffDamageMult, damageMult);
        this.buffSpeedMult = Math.max(this.buffSpeedMult, speedMult);
        this.buffTimer = Math.max(this.buffTimer, duration);
    }

    updateNightBehavior(dt, neighbors) {
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

        // Try special attacks based on zombie variant
        if (this.target) {
            const dist = Math.sqrt((this.entity.x - this.target.x) ** 2 + (this.entity.y - this.target.y) ** 2);

            // Spitter zombie - ranged acid attack
            if (this.entity.canSpit && dist <= AI_CONFIG.SPITTER_RANGE && dist > 2) {
                this.trySpitterAttack(this.target);
            }

            // Screamer zombie - buff nearby zombies
            if (this.entity.canScream && neighbors && neighbors.length >= 2) {
                this.tryScreamerAlert(neighbors);
            }

            // Brute zombie - charge attack
            if (this.entity.variant === 'brute' && dist <= AI_CONFIG.BRUTE_CHARGE_RANGE && dist > 1.5) {
                this.tryBruteCharge(this.target);
            }

            // Boss zombie - special attacks
            if (this.entity.isBoss) {
                if (dist <= AI_CONFIG.BOSS_SLAM_RANGE) {
                    this.tryBossSlam(this.target);
                }
                this.tryBossSummon(neighbors);
            }

            // Regular melee attack
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

    // ============= SPECIAL ATTACK METHODS =============

    trySpitterAttack(target) {
        if (this.spitCooldown > 0) return false;
        if (!this.hasLineOfSight(target)) return false;

        // Create acid projectile
        const dx = target.x - this.entity.x;
        const dy = target.y - this.entity.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (typeof projectiles !== 'undefined') {
            projectiles.push({
                x: this.entity.x,
                y: this.entity.y,
                vx: (dx / dist) * AI_CONFIG.SPITTER_PROJECTILE_SPEED,
                vy: (dy / dist) * AI_CONFIG.SPITTER_PROJECTILE_SPEED,
                damage: AI_CONFIG.SPITTER_DAMAGE * this.buffDamageMult,
                type: 'acid',
                owner: this.entity,
                color: '#7fff00',
                radius: 0.2,
                lifetime: 3.0
            });
        }

        // Visual effect
        if (typeof spawnParticles === 'function') {
            spawnParticles(this.entity.x, this.entity.y, '#7fff00', 8);
        }

        this.spitCooldown = AI_CONFIG.SPITTER_COOLDOWN;
        return true;
    }

    tryScreamerAlert(neighbors) {
        if (this.screamCooldown > 0) return false;

        // Buff all nearby zombies
        let buffedCount = 0;
        for (const other of neighbors) {
            if (other === this.entity) continue;
            if (!other.ai) continue;

            const dx = other.x - this.entity.x;
            const dy = other.y - this.entity.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= AI_CONFIG.SCREAMER_RANGE) {
                other.ai.applyBuff(
                    AI_CONFIG.SCREAMER_BUFF_DAMAGE,
                    AI_CONFIG.SCREAMER_BUFF_SPEED,
                    AI_CONFIG.SCREAMER_BUFF_DURATION
                );
                buffedCount++;

                // Visual indicator on buffed zombie
                if (typeof spawnParticles === 'function') {
                    spawnParticles(other.x, other.y, '#ff00ff', 3);
                }
            }
        }

        if (buffedCount > 0) {
            // Scream visual and sound
            if (typeof spawnParticles === 'function') {
                spawnParticles(this.entity.x, this.entity.y, '#ff00ff', 15);
            }
            if (typeof triggerScreenShake === 'function') {
                triggerScreenShake(3);
            }

            this.screamCooldown = AI_CONFIG.SCREAMER_COOLDOWN;
            return true;
        }
        return false;
    }

    tryBruteCharge(target) {
        if (this.chargeCooldown > 0) return false;
        if (this.isCharging) return false;
        if (!this.hasLineOfSight(target)) return false;

        // Start charge
        this.isCharging = true;
        this.chargeTarget = { x: target.x, y: target.y };
        this.chargeSpeed = AI_CONFIG.BRUTE_CHARGE_SPEED;
        this.chargeCooldown = AI_CONFIG.BRUTE_CHARGE_COOLDOWN;

        // Visual indicator
        if (typeof spawnParticles === 'function') {
            spawnParticles(this.entity.x, this.entity.y, '#ff6600', 10);
        }

        return true;
    }

    updateCharge(dt) {
        if (!this.isCharging || !this.chargeTarget) return;

        const dx = this.chargeTarget.x - this.entity.x;
        const dy = this.chargeTarget.y - this.entity.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Check if we hit something or reached target
        if (dist < 0.5) {
            this.endCharge(true);
            return;
        }

        // Move in charge direction
        const moveX = (dx / dist) * this.chargeSpeed * dt;
        const moveY = (dy / dist) * this.chargeSpeed * dt;
        const newX = this.entity.x + moveX;
        const newY = this.entity.y + moveY;

        // Check collision with player/survivors
        if (typeof player !== 'undefined') {
            const playerDist = Math.sqrt((player.x - newX) ** 2 + (player.y - newY) ** 2);
            if (playerDist < 0.8) {
                this.chargeHit(player);
                this.endCharge(true);
                return;
            }
        }

        if (typeof survivors !== 'undefined') {
            for (const s of survivors) {
                if (s.isPlayer || s.health <= 0) continue;
                const sDist = Math.sqrt((s.x - newX) ** 2 + (s.y - newY) ** 2);
                if (sDist < 0.8) {
                    this.chargeHit(s);
                    this.endCharge(true);
                    return;
                }
            }
        }

        // Check wall collision
        if (typeof isSolidAt === 'function' && isSolidAt(newX, newY, 0.4)) {
            // Damage wall on impact
            if (typeof getCollidingTile === 'function') {
                const col = getCollidingTile(newX, newY, 0.4);
                if (col && col.tile === TILES.WALL) {
                    if (typeof setTile === 'function') {
                        setTile(col.x, col.y, TILES.GRASS);
                    }
                    if (typeof spawnParticles === 'function') {
                        spawnParticles(col.x + 0.5, col.y + 0.5, '#8b7355', 15);
                    }
                    if (typeof triggerScreenShake === 'function') {
                        triggerScreenShake(5);
                    }
                }
            }
            this.endCharge(false);
            return;
        }

        // Move
        this.entity.x = newX;
        this.entity.y = newY;

        // Charge dust particles
        if (typeof spawnParticles === 'function' && Math.random() < 0.3) {
            spawnParticles(this.entity.x, this.entity.y, '#996633', 2);
        }

        // Decay charge speed slightly
        this.chargeSpeed *= 0.98;
        if (this.chargeSpeed < 2) {
            this.endCharge(false);
        }
    }

    chargeHit(target) {
        if (target.isPlayer && window.godMode) return;

        const damage = AI_CONFIG.BRUTE_CHARGE_DAMAGE * this.buffDamageMult;
        target.health -= damage;

        // Knockback target
        const dx = target.x - this.entity.x;
        const dy = target.y - this.entity.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        if (target.knockbackX !== undefined) {
            target.knockbackX = (dx / dist) * 8;
            target.knockbackY = (dy / dist) * 8;
        }

        if (typeof spawnParticles === 'function') {
            spawnParticles(target.x, target.y, '#ff4444', 15);
        }
        if (typeof addDamageNumber === 'function') {
            addDamageNumber(target.x, target.y - 0.5, Math.floor(damage), '#ff6600');
        }
        if (typeof triggerScreenShake === 'function') {
            triggerScreenShake(8);
        }
    }

    endCharge(hitTarget) {
        this.isCharging = false;
        this.chargeTarget = null;
        this.chargeSpeed = 0;

        // Stun briefly after charge
        this.entity.attackCooldown = 0.5;
    }

    tryBossSlam(target) {
        if (this.slamCooldown > 0) return false;

        const dist = Math.sqrt((this.entity.x - target.x) ** 2 + (this.entity.y - target.y) ** 2);
        if (dist > AI_CONFIG.BOSS_SLAM_RANGE) return false;

        // Area damage
        const damage = AI_CONFIG.BOSS_SLAM_DAMAGE * this.buffDamageMult;

        // Hit player
        if (typeof player !== 'undefined' && !window.godMode) {
            const playerDist = Math.sqrt((player.x - this.entity.x) ** 2 + (player.y - this.entity.y) ** 2);
            if (playerDist <= AI_CONFIG.BOSS_SLAM_RANGE) {
                player.health -= damage;
                if (typeof addDamageNumber === 'function') {
                    addDamageNumber(player.x, player.y - 0.5, Math.floor(damage), '#ff0000');
                }
            }
        }

        // Hit survivors
        if (typeof survivors !== 'undefined') {
            for (const s of survivors) {
                if (s.isPlayer || s.health <= 0) continue;
                const sDist = Math.sqrt((s.x - this.entity.x) ** 2 + (s.y - this.entity.y) ** 2);
                if (sDist <= AI_CONFIG.BOSS_SLAM_RANGE) {
                    s.health -= damage;
                    if (typeof addDamageNumber === 'function') {
                        addDamageNumber(s.x, s.y - 0.5, Math.floor(damage), '#ff0000');
                    }
                }
            }
        }

        // Visual effects
        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 20; i++) {
                const angle = (i / 20) * Math.PI * 2;
                const px = this.entity.x + Math.cos(angle) * AI_CONFIG.BOSS_SLAM_RANGE;
                const py = this.entity.y + Math.sin(angle) * AI_CONFIG.BOSS_SLAM_RANGE;
                spawnParticles(px, py, '#ff4400', 3);
            }
        }
        if (typeof triggerScreenShake === 'function') {
            triggerScreenShake(10);
        }

        this.slamCooldown = AI_CONFIG.BOSS_SLAM_COOLDOWN;
        return true;
    }

    tryBossSummon(neighbors) {
        if (this.summonCooldown > 0) return false;

        // Only summon if not too many zombies nearby
        const nearbyCount = neighbors ? neighbors.length : 0;
        if (nearbyCount > 10) return false;

        // Summon minion zombies
        if (typeof spawnZombie === 'function') {
            for (let i = 0; i < AI_CONFIG.BOSS_SUMMON_COUNT; i++) {
                const angle = (i / AI_CONFIG.BOSS_SUMMON_COUNT) * Math.PI * 2;
                const dist = 2 + Math.random();
                const sx = this.entity.x + Math.cos(angle) * dist;
                const sy = this.entity.y + Math.sin(angle) * dist;

                // Spawn a regular zombie
                spawnZombie(sx, sy, 'normal');
            }
        }

        // Visual effect
        if (typeof spawnParticles === 'function') {
            spawnParticles(this.entity.x, this.entity.y, '#8800ff', 25);
        }
        if (typeof triggerScreenShake === 'function') {
            triggerScreenShake(5);
        }

        this.summonCooldown = AI_CONFIG.BOSS_SUMMON_COOLDOWN;
        return true;
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

        // Apply buff damage multiplier
        const damage = Math.floor(this.entity.damage * this.buffDamageMult);

        // Pack aggression bonus - deal more damage when in a pack
        const packBonus = this.isInPack ? (1 + AI_CONFIG.PACK_AGGRESSION_BONUS * Math.min(this.packSize, 5)) : 1;
        const finalDamage = Math.floor(damage * packBonus);

        target.health -= finalDamage;

        if (typeof spawnParticles === 'function') {
            const color = this.buffTimer > 0 ? '#ff00ff' : '#ff4444';
            spawnParticles(target.x, target.y, color, 5);
        }
        if (typeof addDamageNumber === 'function') {
            const color = this.buffTimer > 0 ? '#ff00ff' : '#ff4444';
            addDamageNumber(target.x, target.y - 0.5, finalDamage, color);
        }

        // Crawler dodge chance - can evade next attack
        if (this.entity.variant === 'crawler' && Math.random() < AI_CONFIG.CRAWLER_DODGE_CHANCE) {
            // Quick repositioning
            const dodgeAngle = Math.random() * Math.PI * 2;
            this.entity.x += Math.cos(dodgeAngle) * 0.5;
            this.entity.y += Math.sin(dodgeAngle) * 0.5;
        }
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
