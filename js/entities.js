// ============================================
// CONFIGURATION CONSTANTS
// ============================================
const ZOMBIE_CONFIG = {
    MAX_BASE: 30,
    MAX_PER_DAY: 5,
    SPAWN_DIST_MIN: 18,
    SPAWN_DIST_MAX: 26,
    SPAWN_MAX_ATTEMPTS: 10,
    SPAWN_MIN_SEPARATION: 1,
    BASE_HEALTH: 25,
    HEALTH_PER_DAY: 8,
    BASE_SPEED: 1.2,
    SPEED_PER_DAY: 0.08,
    BASE_DAMAGE: 8,
    DAMAGE_PER_DAY: 2,
    ATTACK_COOLDOWN: 1.2,
    ATTACK_RANGE: 0.8,
    FLEE_RANGE: 40,
    DESPAWN_RANGE: 50,
    FLEE_SPEED_MULT: 0.3,
    WALL_DAMAGE_TIME: 1.0, // Seconds to break wall
    LOOT_DROP_CHANCE: 0.35,
    EXP_BASE: 15,
    EXP_PER_DAY: 2
};

const SURVIVOR_CONFIG = {
    FOLLOW_DISTANCE: 1.5,
    FOLLOW_SPEED: 2.5,
    FOLLOW_THRESHOLD: 0.5,
    COMBAT_RANGE: 2.5,
    COMBAT_DAMAGE: 8,
    COMBAT_COOLDOWN: 0.5,
    GUARD_RANGE: 3,
    GUARD_DPS: 5,
    WANDER_RANGE: 5,
    WANDER_SPEED: 1.2,
    // Resource rates per second
    FARMER_RATE: 0.03,
    WOODCUTTER_RATE: 0.024,
    MINER_STONE_RATE: 0.018,
    MINER_IRON_CHANCE: 0.3,
    MEDIC_HEAL_RATE: 0.018,

    // Role efficiency bonuses (accumulated with experience)
    SKILL_GAIN_RATE: 0.01,          // Skill points gained per work cycle
    MAX_SKILL_LEVEL: 10,            // Max skill level per role
    SKILL_EFFICIENCY_BONUS: 0.08,   // 8% bonus per skill level

    // Role-specific bonuses at max level
    ROLE_BONUSES: {
        Woodcutter: { yieldBonus: 1, speedBonus: 0.5 },
        Miner: { yieldBonus: 1, ironChanceBonus: 0.2 },
        Farmer: { yieldBonus: 2, growthBonus: 0.3 },
        Guard: { damageBonus: 5, rangeBonus: 1.5 },
        Soldier: { damageBonus: 8, armorBonus: 0.2 },
        Hunter: { damageBonus: 6, critBonus: 0.15 },
        Medic: { healBonus: 5, rangeBonus: 2 },
        Builder: { speedBonus: 0.5, costReduction: 0.1 },
        Scout: { visionBonus: 3, speedBonus: 0.8 }
    },

    // Night behavior
    NIGHT_AGGRESSION_BOOST: 1.3,    // Combat roles more aggressive at night
    NIGHT_WORK_PENALTY: 0.5,        // Workers less efficient at night

    // Morale effects
    LOW_MORALE_THRESHOLD: 30,
    LOW_MORALE_PENALTY: 0.5,
    HIGH_MORALE_THRESHOLD: 80,
    HIGH_MORALE_BONUS: 1.25
};

const TOWER_CONFIG = {
    ARROW_RANGE: 7,
    CANNON_RANGE: 10,
    ARROW_DAMAGE: 18,
    CANNON_DAMAGE: 35,
    ARROW_COOLDOWN: 0.6,
    CANNON_COOLDOWN: 1.5,
    PROJECTILE_SPEED: 12,
    ARROW_SIZE: 2,
    CANNON_SIZE: 4,
    SPLASH_RADIUS: 1.5,
    SPLASH_DAMAGE_MULT: 0.3
};

// Tower position tracking for efficient updates
const activeTowers = new Map(); // key: "x,y", value: { type, cooldown }

// ============================================
// ZOMBIE SPAWNING
// ============================================
function spawnZombie() {
    const currentDay = dayCount || 0;
    const maxZombies = ZOMBIE_CONFIG.MAX_BASE + currentDay * ZOMBIE_CONFIG.MAX_PER_DAY;

    if (!Array.isArray(zombies)) {
        console.warn('spawnZombie: zombies array is invalid');
        return false;
    }

    if (zombies.length >= maxZombies) return false;

    // Try multiple spawn attempts to find valid position
    for (let attempt = 0; attempt < ZOMBIE_CONFIG.SPAWN_MAX_ATTEMPTS; attempt++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = ZOMBIE_CONFIG.SPAWN_DIST_MIN +
            Math.random() * (ZOMBIE_CONFIG.SPAWN_DIST_MAX - ZOMBIE_CONFIG.SPAWN_DIST_MIN);

        const zx = player.x + Math.cos(angle) * dist;
        const zy = player.y + Math.sin(angle) * dist;

        // Validate spawn position
        if (!isValidZombieSpawn(zx, zy)) continue;

        const health = ZOMBIE_CONFIG.BASE_HEALTH + currentDay * ZOMBIE_CONFIG.HEALTH_PER_DAY;

        // Determine variant based on day and time
        const variant = getRandomZombieVariant ? getRandomZombieVariant(currentDay, isNight) : 'normal';
        const variantData = (typeof ZOMBIE_VARIANTS !== 'undefined' && ZOMBIE_VARIANTS[variant])
            ? ZOMBIE_VARIANTS[variant]
            : { size: 1.0, speed: 1.0, name: 'Zombie' };

        // Apply variant modifiers to stats
        const sizeMultiplier = variantData.size || 1.0;
        const speedMultiplier = variantData.speed || 1.0;
        const baseSpeed = ZOMBIE_CONFIG.BASE_SPEED + currentDay * ZOMBIE_CONFIG.SPEED_PER_DAY;
        const baseDamage = ZOMBIE_CONFIG.BASE_DAMAGE + currentDay * ZOMBIE_CONFIG.DAMAGE_PER_DAY;

        // Variant stat adjustments
        let healthMult = 1.0, damageMult = 1.0;
        if (variant === 'brute') { healthMult = 2.0; damageMult = 1.5; }
        else if (variant === 'runner') { healthMult = 0.7; damageMult = 0.8; }
        else if (variant === 'spitter') { healthMult = 0.9; damageMult = 1.2; }
        else if (variant === 'crawler') { healthMult = 0.6; damageMult = 0.6; }
        else if (variant === 'screamer') { healthMult = 0.8; damageMult = 0.5; }
        else if (variant === 'armored') { healthMult = 1.8; damageMult = 1.0; }
        else if (variant === 'boss') { healthMult = 5.0; damageMult = 2.5; }

        const finalHealth = Math.floor(health * healthMult * sizeMultiplier);

        const newZombie = {
            x: zx,
            y: zy,
            health: finalHealth,
            maxHealth: finalHealth,
            speed: baseSpeed * speedMultiplier,
            damage: Math.floor(baseDamage * damageMult),
            attackCooldown: 0,
            frame: 0,
            animTimer: Math.random() * 10, // Randomize start animation
            variant: variant,
            // Visual properties from variant
            bodyColor: variantData.bodyColor,
            skinColor: variantData.skinColor,
            eyeColor: variantData.eyeColor,
            // Variant-specific flags for AI
            canSpit: variant === 'spitter',
            canScream: variant === 'screamer',
            isBoss: variant === 'boss',
            armorReduction: variant === 'armored' ? 0.5 : 0 // 50% damage reduction
        };

        // Attach AI
        newZombie.ai = new ZombieAI(newZombie);

        zombies.push(newZombie);

        return true;
    }

    return false;
}

function isValidZombieSpawn(x, y) {
    // Check tile validity
    const tile = getTile(x, y);
    if (tile === TILES.WATER || isSolid(tile)) return false;

    // Check distance from other zombies
    const minSepSq = ZOMBIE_CONFIG.SPAWN_MIN_SEPARATION ** 2;
    for (const z of zombies) {
        const dx = z.x - x;
        const dy = z.y - y;
        if (dx * dx + dy * dy < minSepSq) return false;
    }

    // Check distance from survivors
    const survivorMinDistSq = 4; // 2 tiles squared
    for (const s of survivors) {
        const dx = s.x - x;
        const dy = s.y - y;
        if (dx * dx + dy * dy < survivorMinDistSq) return false;
    }

    return true;
}

// ============================================
// ZOMBIE UPDATE
// ============================================
function updateZombies(dt) {
    dt = validateDeltaTime(dt);

    if (!Array.isArray(zombies)) return;

    const currentDay = dayCount || 0;
    const deadZombies = [];

    // Performance: Only check neighbors within range
    // A simple grid hash or quadtree would be better, but loop is fine for < 100 entities

    zombies = zombies.filter(z => {
        if (z.health <= 0) {
            deadZombies.push(z);
            return false;
        }

        if (z.ai) {
            // Find neighbors for separation (simple O(N^2) for now)
            const neighbors = [];
            for (const other of zombies) {
                if (z !== other && Math.abs(z.x - other.x) < 2 && Math.abs(z.y - other.y) < 2) {
                    neighbors.push(other);
                }
            }
            z.ai.update(dt, neighbors);
        }

        // Check despawn range
        const distToPlayer = Math.sqrt((z.x - player.x) ** 2 + (z.y - player.y) ** 2);
        if (distToPlayer > ZOMBIE_CONFIG.DESPAWN_RANGE) return false;

        return true;
    });

    processDeadZombies(deadZombies, currentDay);
}

function processDeadZombies(deadZombies, currentDay) {
    if (deadZombies.length === 0) return;

    for (const z of deadZombies) {
        // Loot drop
        if (Math.random() < ZOMBIE_CONFIG.LOOT_DROP_CHANCE) {
            resources.food += 1 + Math.floor(Math.random() * 2);
        }

        // Experience
        player.exp += ZOMBIE_CONFIG.EXP_BASE + currentDay * ZOMBIE_CONFIG.EXP_PER_DAY;

        // Visual feedback
        spawnParticles(z.x, z.y, '#5a8a5a', 8);
    }

    checkLevelUp();
}


// ============================================
// SURVIVOR UPDATE
// ============================================
function updateSurvivors(dt) {
    dt = validateDeltaTime(dt);

    if (!Array.isArray(survivors)) return;

    for (let i = 0; i < survivors.length; i++) {
        const s = survivors[i];

        if (s.isPlayer) {
            s.x = player.x;
            s.y = player.y;
            continue;
        }

        if (s.health <= 0) continue;

        // Initialize survivor properties if missing
        initializeSurvivorProperties(s);
        s.isMoving = false; // Reset movement flag for this frame

        // --- AI LOGIC ---
        // 1. Check Follow Mode (Individual or Global override if we kept it, but user wants specific)
        // We prioritize individual setting, but maybe 'F' key toggles all for convenience? 
        // For now, let's assume 'isFollowing' is the source of truth.
        const isFollowing = s.isFollowing || false;

        if (isFollowing) {
            s.state = 'FOLLOWING';
            // Formation offset
            const offsetDist = 1.5;
            const angle = (i * (Math.PI * 2 / 6)) + (pixelTime || 0) * 0.1; // Rotate slowly
            const targetX = player.x + Math.cos(angle) * offsetDist;
            const targetY = player.y + Math.sin(angle) * offsetDist;

            const distToTarget = Math.sqrt((targetX - s.x) ** 2 + (targetY - s.y) ** 2);

            if (distToTarget > 5) {
                // Too far, use pathfinding
                if (!s.path || s.pathIndex >= s.path.length || s.repathTimer <= 0) {
                    s.path = pathfinder.findPath(s.x, s.y, targetX, targetY);
                    s.pathIndex = 0;
                    s.repathTimer = 2.0;
                }
                if (followPath(s, dt)) {
                    s.isMoving = true;
                }
                s.repathTimer -= dt;
            } else if (distToTarget > 0.5) {
                // Close enough for direct steering
                const speed = SURVIVOR_CONFIG.FOLLOW_SPEED * dt;
                const dx = targetX - s.x;
                const dy = targetY - s.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Separation from other survivors to avoid stacking
                let sepX = 0, sepY = 0;
                survivors.forEach(other => {
                    if (other === s) return;
                    const odx = s.x - other.x;
                    const ody = s.y - other.y;
                    const odistSq = odx * odx + ody * ody;
                    if (odistSq < 1.0 && odistSq > 0) { // Slightly larger separation
                        const odist = Math.sqrt(odistSq);
                        sepX += (odx / odist) / odist;
                        sepY += (ody / odist) / odist;
                    }
                });

                const moveX = (dx / dist) + sepX * 1.5;
                const moveY = (dy / dist) + sepY * 1.5;

                // Normalize
                const moveMag = Math.sqrt(moveX * moveX + moveY * moveY);
                if (moveMag > 0) {
                    if (tryMoveEntity(s, (moveX / moveMag) * speed, (moveY / moveMag) * speed)) {
                        s.isMoving = true;
                    }
                }
            }
        } else {
            // Standard worker AI
            updateSurvivorIdleMode(s, dt);
        }

        // Stuck detection
        if (s.state === 'MOVING' || s.state === 'FOLLOWING') {
            const lastX = s.lastPosX || s.x;
            const lastY = s.lastPosY || s.y;
            const distMoved = Math.sqrt((s.x - lastX) ** 2 + (s.y - lastY) ** 2);

            if (distMoved < 0.01) {
                s.stuckTimer = (s.stuckTimer || 0) + dt;
            } else {
                s.stuckTimer = 0;
            }
            s.lastPosX = s.x;
            s.lastPosY = s.y;

            if (s.stuckTimer > 3) {
                // Reset if stuck
                s.state = 'IDLE';
                s.taskTarget = null;
                s.path = null;
                s.stuckTimer = 0;
            }
        } else {
            s.stuckTimer = 0;
        }

        // Update animation timer
        s.animTimer = (s.animTimer || 0) + dt;

        // Combat (Always active if in range)
        if (isCombatRole(s.role) || isFollowing) { // Followers also fight self-defense
            updateSurvivorCombat(s, dt);
        }

        // Update morale periodically
        updateSurvivorMorale(s, dt);
    }
}

// Update survivor morale based on various conditions
function updateSurvivorMorale(s, dt) {
    if (!s.moraleTimer) s.moraleTimer = 0;
    s.moraleTimer += dt;

    // Only update morale every 5 seconds to avoid overhead
    if (s.moraleTimer < 5) return;
    s.moraleTimer = 0;

    let moraleChange = 0;

    // Base decay
    moraleChange -= 0.5;

    // Positive factors
    if (s.health >= s.maxHealth * 0.8) moraleChange += 0.3; // Healthy
    if (s.state === 'WORKING') moraleChange += 0.2; // Has purpose
    if (typeof resources !== 'undefined' && resources.food > 20) moraleChange += 0.2; // Food security

    // Check for nearby survivors (social bonus)
    let nearbySurvivors = 0;
    for (const other of survivors) {
        if (other === s || other.isPlayer) continue;
        const dist = Math.sqrt((other.x - s.x) ** 2 + (other.y - s.y) ** 2);
        if (dist < 5) nearbySurvivors++;
    }
    if (nearbySurvivors > 0 && s.personality !== 'loner') {
        moraleChange += Math.min(nearbySurvivors * 0.15, 0.5);
    }
    if (nearbySurvivors === 0 && s.personality === 'loner') {
        moraleChange += 0.3; // Loners like solitude
    }

    // Negative factors
    if (s.health < s.maxHealth * 0.3) moraleChange -= 1.0; // Badly hurt
    if (typeof isNight !== 'undefined' && isNight) moraleChange -= 0.3; // Night fear
    if (typeof resources !== 'undefined' && resources.food < 5) moraleChange -= 0.5; // Hunger fear

    // Check for nearby zombies (fear)
    if (typeof zombies !== 'undefined') {
        let nearbyZombies = 0;
        for (const z of zombies) {
            const dist = Math.sqrt((z.x - s.x) ** 2 + (z.y - s.y) ** 2);
            if (dist < 8) nearbyZombies++;
        }
        if (nearbyZombies > 0) {
            const fearPenalty = Math.min(nearbyZombies * 0.3, 1.5);
            if (s.personality === 'brave') {
                moraleChange -= fearPenalty * 0.5; // Brave characters less affected
            } else if (s.personality === 'cautious') {
                moraleChange -= fearPenalty * 1.5; // Cautious more affected
            } else {
                moraleChange -= fearPenalty;
            }
        }
    }

    // Check for shelter bonus
    if (typeof ShelterSystem !== 'undefined') {
        const comfort = ShelterSystem.getComfortAt?.(s.x, s.y) || 0;
        moraleChange += comfort * 0.1;
    }

    // Apply morale change
    s.morale = Math.max(0, Math.min(100, s.morale + moraleChange));

    // Low morale effects
    if (s.morale < 20 && Math.random() < 0.05) {
        // Chance to become idle (refusing to work)
        if (s.state === 'WORKING' || s.state === 'MOVING') {
            s.state = 'IDLE';
            s.taskTarget = null;
            s.path = null;
            if (typeof showNotification === 'function' && Math.random() < 0.2) {
                showNotification(`${s.name} is demoralized and stopped working.`, []);
            }
        }
    }

    // High morale occasional bonus
    if (s.morale > 90 && Math.random() < 0.1) {
        // Chance for inspiration - small skill boost
        const role = s.role;
        if (role && role !== 'None' && s.skills?.[role] !== undefined) {
            gainSkillExperience(s, 0.2);
        }
    }
}

function followPath(entity, dt) {
    if (!entity.path || entity.pathIndex >= entity.path.length) return false;

    const target = entity.path[entity.pathIndex];
    if (!target) return false;

    const dx = target.x - entity.x;
    const dy = target.y - entity.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.2) {
        entity.pathIndex++;
        return false;
    }

    const speed = SURVIVOR_CONFIG.WANDER_SPEED * 1.5 * dt; // Faster when pathing
    return tryMoveEntity(entity, (dx / dist) * speed, (dy / dist) * speed);
}

function initializeSurvivorProperties(s) {
    if (s.attackCooldown === undefined) s.attackCooldown = 0;
    if (s.maxHealth === undefined) s.maxHealth = 50;
    if (s.state === undefined) s.state = 'IDLE';

    // Skill system - survivors gain experience in their role
    if (s.skills === undefined) {
        s.skills = {
            Woodcutter: 0, Miner: 0, Farmer: 0,
            Guard: 0, Soldier: 0, Hunter: 0,
            Medic: 0, Builder: 0, Scout: 0
        };
    }

    // Morale system
    if (s.morale === undefined) s.morale = 70;

    // Work efficiency multiplier (calculated from skills and morale)
    if (s.efficiency === undefined) s.efficiency = 1.0;

    // Combat stats
    if (s.critChance === undefined) s.critChance = 0.05;
    if (s.armorReduction === undefined) s.armorReduction = 0;

    // Personality traits (affect behavior)
    if (s.personality === undefined) {
        const traits = ['brave', 'cautious', 'diligent', 'lazy', 'friendly', 'loner'];
        s.personality = traits[Math.floor(Math.random() * traits.length)];
    }
}

// Calculate survivor efficiency based on skills, morale, and time of day
function calculateSurvivorEfficiency(s) {
    const role = s.role || 'None';
    const skillLevel = s.skills?.[role] || 0;
    const skillBonus = 1 + (skillLevel * SURVIVOR_CONFIG.SKILL_EFFICIENCY_BONUS);

    // Morale effects
    let moraleMultiplier = 1.0;
    if (s.morale < SURVIVOR_CONFIG.LOW_MORALE_THRESHOLD) {
        moraleMultiplier = SURVIVOR_CONFIG.LOW_MORALE_PENALTY;
    } else if (s.morale > SURVIVOR_CONFIG.HIGH_MORALE_THRESHOLD) {
        moraleMultiplier = SURVIVOR_CONFIG.HIGH_MORALE_BONUS;
    }

    // Time of day effects
    let timeMultiplier = 1.0;
    if (typeof isNight !== 'undefined' && isNight) {
        if (isCombatRole(role)) {
            timeMultiplier = SURVIVOR_CONFIG.NIGHT_AGGRESSION_BOOST;
        } else if (role !== 'None') {
            timeMultiplier = SURVIVOR_CONFIG.NIGHT_WORK_PENALTY;
        }
    }

    // Personality modifiers
    let personalityMultiplier = 1.0;
    if (s.personality === 'diligent') personalityMultiplier = 1.15;
    else if (s.personality === 'lazy') personalityMultiplier = 0.85;

    s.efficiency = skillBonus * moraleMultiplier * timeMultiplier * personalityMultiplier;
    return s.efficiency;
}

// Gain skill experience when performing role tasks
function gainSkillExperience(s, amount = 1) {
    const role = s.role;
    if (!role || role === 'None' || !s.skills) return;

    const currentLevel = s.skills[role] || 0;
    if (currentLevel >= SURVIVOR_CONFIG.MAX_SKILL_LEVEL) return;

    s.skills[role] = Math.min(
        SURVIVOR_CONFIG.MAX_SKILL_LEVEL,
        currentLevel + (SURVIVOR_CONFIG.SKILL_GAIN_RATE * amount)
    );

    // Level up notification
    const newLevel = Math.floor(s.skills[role]);
    const oldLevel = Math.floor(currentLevel);
    if (newLevel > oldLevel && typeof showNotification === 'function') {
        showNotification(`${s.name} reached ${role} level ${newLevel}!`, []);
        if (typeof spawnParticles === 'function') {
            spawnParticles(s.x, s.y, '#ffd700', 8);
        }
    }
}

function updateSurvivorIdleMode(s, dt) {
    // State Machine
    switch (s.state) {
        case 'IDLE':
            // Optimization: Don't search for tasks every frame
            if ((s.searchTimer || 0) > 0) {
                s.searchTimer -= dt;
            } else {
                s.searchTimer = 2.0; // Check every 2 seconds
                const target = findTaskTarget(s);
                if (target) {
                    s.taskTarget = target;
                    s.state = 'MOVING';
                    s.path = pathfinder.findPath(s.x, s.y, target.x, target.y);
                    s.pathIndex = 0;
                    break; // Stop processing IDLE
                }
            }

            // Wander if idle
            if (s.state === 'IDLE' && s.role !== 'None') {
                // Wander
                if (Math.random() < 0.02) {
                    const wx = s.x + (Math.random() - 0.5) * 5;
                    const wy = s.y + (Math.random() - 0.5) * 5;
                    if (!isSolidAt(wx, wy, 0.3)) {
                        s.taskTarget = { x: wx, y: wy };
                        s.state = 'MOVING';
                        s.path = pathfinder.findPath(s.x, s.y, wx, wy);
                        s.pathIndex = 0;
                    }
                }
            }
            break;

        case 'MOVING':
            if (!s.taskTarget) {
                s.state = 'IDLE';
                return;
            }

            // Move along path
            let moveTarget = s.taskTarget;

            // Strict Validation: If we are a worker, check if our target is still what we want
            const targetTile = getTile(Math.floor(s.taskTarget.x), Math.floor(s.taskTarget.y));
            let isTargetStillValid = true;
            if (s.role === 'Woodcutter') isTargetStillValid = (targetTile === TILES.TREE);
            else if (s.role === 'Miner') isTargetStillValid = (targetTile === TILES.STONE || targetTile === TILES.IRON);
            else if (s.role === 'Farmer') isTargetStillValid = (targetTile === TILES.FARM);

            if (!isTargetStillValid) {
                s.state = 'IDLE';
                s.taskTarget = null;
                s.path = null;
                return;
            }

            if (s.path && s.pathIndex < s.path.length) {
                const node = s.path[s.pathIndex];
                const dNode = (node.x - s.x) ** 2 + (node.y - s.y) ** 2;
                if (dNode < 0.1) {
                    s.pathIndex++;
                    if (s.pathIndex < s.path.length) moveTarget = s.path[s.pathIndex];
                } else {
                    moveTarget = node;
                }
            }

            const dx = moveTarget.x - s.x;
            const dy = moveTarget.y - s.y;
            const distSq = (s.taskTarget.x - s.x) ** 2 + (s.taskTarget.y - s.y) ** 2;

            if (distSq < 1.0) { // Reached target
                s.state = 'WORKING';
                s.taskTimer = 0;
            } else {
                const dist = Math.sqrt((moveTarget.x - s.x) ** 2 + (moveTarget.y - s.y) ** 2);
                if (dist > 0.1) {
                    const speed = SURVIVOR_CONFIG.WANDER_SPEED * dt;
                    if (tryMoveEntity(s, (dx / dist) * speed, (dy / dist) * speed)) {
                        s.isMoving = true;
                    }
                }
            }
            break;

        case 'WORKING':
            s.taskTimer += dt;

            // Check if target is still valid while working
            if (s.taskTarget) {
                const currentTile = getTile(Math.floor(s.taskTarget.x), Math.floor(s.taskTarget.y));
                let expectedType = null;
                if (s.role === 'Woodcutter') expectedType = TILES.TREE;
                else if (s.role === 'Miner') expectedType = (currentTile === TILES.STONE || currentTile === TILES.IRON) ? currentTile : TILES.STONE;
                else if (s.role === 'Farmer') expectedType = TILES.FARM;

                if (expectedType !== null && currentTile !== expectedType) {
                    s.state = 'IDLE';
                    s.taskTarget = null;
                    s.path = null;
                    break;
                }
            }

            // Particles only when hitting (simulated swing)
            if (s.taskTimer % 0.8 < 0.1) {
                const type = s.role === 'Woodcutter' ? '#deb887' :
                    s.role === 'Miner' ? '#a9a9a9' : '#ffff00';
                spawnParticles(s.x, s.y, type, 2);
            }
            if (s.taskTimer > 3) {
                performTaskWork(s);
                s.taskTimer = 0;
                s.state = 'IDLE';
                s.taskTarget = null;
                s.path = null;
            }
            break;
    }
}

// Resource scanning helper
function findTaskTarget(s) {
    let targetType = null;
    let target = null;

    switch (s.role) {
        case 'Woodcutter': targetType = TILES.TREE; break;
        case 'Miner': targetType = TILES.STONE; break; // Scan stone primarily
        case 'Farmer': targetType = TILES.FARM; break;
        case 'Medic':
            // Heal player if needed
            if (player.health < player.maxHealth * 0.8) return { x: player.x, y: player.y };
            // Or heal other survivors
            for (const other of survivors) {
                if (other !== s && other.health < other.maxHealth * 0.8) return { x: other.x, y: other.y };
            }
            return null;
        case 'Guard':
            // Guards patrol near buildings or player
            if (isNight) {
                // Stay close to base/buildings
                if (buildings.length > 0) {
                    const b = buildings[Math.floor(Math.random() * buildings.length)];
                    return { x: b.x + (Math.random() - 0.5) * 4, y: b.y + (Math.random() - 0.5) * 4 };
                }
                return { x: s.x + (Math.random() - 0.5) * 2, y: s.y + (Math.random() - 0.5) * 2 };
            }
            // Patrol random
            return { x: s.x + (Math.random() - 0.5) * 10, y: s.y + (Math.random() - 0.5) * 10 };
    }

    if (targetType !== null) {
        // Spiral search for nearest resource
        target = findNearestTile(s.x, s.y, targetType, 40); // 40 radius
        // Special case for miners - check iron too if stone not found
        if (!target && s.role === 'Miner') {
            target = findNearestTile(s.x, s.y, TILES.IRON, 40);
        }
    }
    return target;
}

// Simple breadth-first or spiral search for tiles
function findNearestTile(cx, cy, tileType, radius) {
    const startX = Math.floor(cx);
    const startY = Math.floor(cy);

    // Check known chunks first (optimization)
    let bestDist = Infinity;
    let best = null;

    // Scan a box area
    for (let y = startY - radius; y <= startY + radius; y++) {
        for (let x = startX - radius; x <= startX + radius; x++) {
            if (getTile(x, y) === tileType) {
                const dx = x - cx;
                const dy = y - cy;
                const d = dx * dx + dy * dy;
                if (d < bestDist) {
                    bestDist = d;
                    best = { x: x + 0.5, y: y + 0.5 }; // Center of tile
                }
            }
        }
    }
    return best;
}

function performTaskWork(s) {
    if (!s.taskTarget) return;

    const tx = Math.floor(s.taskTarget.x);
    const ty = Math.floor(s.taskTarget.y);

    // Calculate efficiency for yield bonuses
    const efficiency = calculateSurvivorEfficiency(s);
    const skillLevel = Math.floor(s.skills?.[s.role] || 0);
    const roleBonus = SURVIVOR_CONFIG.ROLE_BONUSES[s.role] || {};

    // Gain skill experience
    gainSkillExperience(s, 1);

    switch (s.role) {
        case 'Woodcutter': {
            // Base yield + skill bonus
            const baseYield = 2;
            const skillYield = Math.floor(skillLevel * (roleBonus.yieldBonus || 0) / SURVIVOR_CONFIG.MAX_SKILL_LEVEL);
            const totalYield = Math.ceil((baseYield + skillYield) * efficiency);

            resources.wood += totalYield;
            setTile(tx, ty, TILES.GRASS);
            spawnParticles(s.x, s.y - 0.5, '#deb887', 5 + skillLevel);
            addDamageNumber(s.x, s.y - 0.5, `+${totalYield}`, '#deb887');

            // Chance to find bonus items at high skill
            if (skillLevel >= 5 && Math.random() < 0.1 * efficiency) {
                resources.food = (resources.food || 0) + 1;
                addDamageNumber(s.x, s.y - 0.8, '+1 fruit', '#ff6b6b');
            }
            break;
        }
        case 'Miner': {
            const currentTile = getTile(tx, ty);
            if (currentTile === TILES.STONE || currentTile === TILES.IRON) {
                const baseStone = 2;
                const skillYield = Math.floor(skillLevel * (roleBonus.yieldBonus || 0) / SURVIVOR_CONFIG.MAX_SKILL_LEVEL);
                const totalStone = Math.ceil((baseStone + skillYield) * efficiency);

                resources.stone += totalStone;

                // Iron chance with skill bonus
                const ironChance = 0.4 + (skillLevel * (roleBonus.ironChanceBonus || 0) / SURVIVOR_CONFIG.MAX_SKILL_LEVEL);
                if (currentTile === TILES.IRON || Math.random() < ironChance) {
                    const ironYield = Math.ceil(efficiency);
                    resources.iron += ironYield;
                    addDamageNumber(s.x + 0.3, s.y - 0.5, `+${ironYield}`, '#c0c0c0');
                }

                setTile(tx, ty, TILES.GRASS);
                spawnParticles(s.x, s.y - 0.5, '#a9a9a9', 5 + skillLevel);
                addDamageNumber(s.x, s.y - 0.5, `+${totalStone}`, '#a9a9a9');

                // Rare gem find at high skill
                if (skillLevel >= 7 && Math.random() < 0.05) {
                    resources.gem = (resources.gem || 0) + 1;
                    addDamageNumber(s.x, s.y - 1, '+1 gem!', '#ff00ff');
                    spawnParticles(s.x, s.y, '#ff00ff', 10);
                }
            }
            break;
        }
        case 'Farmer': {
            const baseYield = 1;
            const skillYield = Math.floor(skillLevel * (roleBonus.yieldBonus || 0) / SURVIVOR_CONFIG.MAX_SKILL_LEVEL);
            const totalYield = Math.ceil((baseYield + skillYield) * efficiency);

            resources.food += totalYield;
            spawnParticles(s.x, s.y - 0.5, '#90ee90', 5 + skillLevel);
            addDamageNumber(s.x, s.y - 0.5, `+${totalYield}`, '#90ee90');

            // High skill farmers can produce seeds
            if (skillLevel >= 4 && Math.random() < 0.15) {
                resources.seed = (resources.seed || 0) + 1;
                addDamageNumber(s.x + 0.3, s.y - 0.5, '+1 seed', '#8b4513');
            }

            // Expert farmers boost nearby crop growth
            if (skillLevel >= 8) {
                boostNearbyCrops(s.x, s.y, roleBonus.growthBonus || 0.3);
            }
            break;
        }
        case 'Medic': {
            const baseHeal = 10;
            const skillHeal = Math.floor(skillLevel * (roleBonus.healBonus || 0) / SURVIVOR_CONFIG.MAX_SKILL_LEVEL);
            const totalHeal = Math.ceil((baseHeal + skillHeal) * efficiency);

            if (s.taskTarget.health !== undefined) {
                s.taskTarget.health = Math.min(s.taskTarget.maxHealth, s.taskTarget.health + totalHeal);
                showNotification(`Medic ${s.name} healed for ${totalHeal}!`);
                spawnParticles(s.taskTarget.x, s.taskTarget.y, '#00ff00', 5);
            } else if (distSq(s, player) < 4) {
                player.health = Math.min(player.maxHealth, player.health + totalHeal);
                addDamageNumber(player.x, player.y - 0.5, `+${totalHeal}`, '#00ff00');
            }

            // High skill medics can cure debuffs
            if (skillLevel >= 6 && s.taskTarget?.debuffs) {
                s.taskTarget.debuffs = [];
                addDamageNumber(s.taskTarget.x, s.taskTarget.y - 0.8, 'Cured!', '#00ffff');
            }
            break;
        }
        case 'Guard':
        case 'Soldier':
        case 'Hunter': {
            // Combat roles gain experience from fighting (handled in combat function)
            // But if they complete a patrol, they gain a little experience
            gainSkillExperience(s, 0.5);
            break;
        }
    }

    // Morale boost from successful work
    s.morale = Math.min(100, (s.morale || 70) + 1);
}

// Helper function to boost nearby crops
function boostNearbyCrops(x, y, bonus) {
    if (typeof FarmingSystem === 'undefined') return;

    const range = 3;
    for (let dy = -range; dy <= range; dy++) {
        for (let dx = -range; dx <= range; dx++) {
            const cropX = Math.floor(x) + dx;
            const cropY = Math.floor(y) + dy;
            // FarmingSystem would handle the boost
            if (typeof FarmingSystem.boostCrop === 'function') {
                FarmingSystem.boostCrop(cropX, cropY, bonus);
            }
        }
    }
}

function distSq(a, b) {
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

function isCombatRole(role) {
    return role === 'Soldier' || role === 'Guard' || role === 'Hunter';
}

function updateSurvivorCombat(s, dt) {
    if (s.attackCooldown > 0) {
        s.attackCooldown -= dt;
        return;
    }

    // Calculate combat efficiency
    const efficiency = calculateSurvivorEfficiency(s);
    const role = s.role || 'None';
    const skillLevel = Math.floor(s.skills?.[role] || 0);
    const roleBonus = SURVIVOR_CONFIG.ROLE_BONUSES[role] || {};

    // Calculate combat range with potential skill bonus
    let combatRange = SURVIVOR_CONFIG.COMBAT_RANGE;
    if (roleBonus.rangeBonus) {
        combatRange += (skillLevel / SURVIVOR_CONFIG.MAX_SKILL_LEVEL) * roleBonus.rangeBonus;
    }

    // Calculate base damage with skill bonus
    let baseDamage = SURVIVOR_CONFIG.COMBAT_DAMAGE;
    if (roleBonus.damageBonus) {
        baseDamage += (skillLevel / SURVIVOR_CONFIG.MAX_SKILL_LEVEL) * roleBonus.damageBonus;
    }

    // Apply efficiency multiplier
    baseDamage = Math.floor(baseDamage * efficiency);

    // Calculate critical hit chance
    let critChance = s.critChance || 0.05;
    if (roleBonus.critBonus) {
        critChance += (skillLevel / SURVIVOR_CONFIG.MAX_SKILL_LEVEL) * roleBonus.critBonus;
    }

    // Find and attack nearest zombie
    let nearestZombie = null;
    let nearestDist = combatRange;

    for (const z of zombies) {
        const dist = Math.sqrt((z.x - s.x) ** 2 + (z.y - s.y) ** 2);
        if (dist < nearestDist) {
            nearestDist = dist;
            nearestZombie = z;
        }
    }

    if (nearestZombie) {
        // Check for critical hit
        const isCrit = Math.random() < critChance;
        const finalDamage = isCrit ? Math.floor(baseDamage * 2) : baseDamage;

        const actualDamage = applyZombieDamage(nearestZombie, finalDamage);

        // Visual feedback
        const damageColor = isCrit ? '#ffff00' : '#00ff00';
        const damageText = isCrit ? `${actualDamage}!` : actualDamage;
        addDamageNumber(nearestZombie.x, nearestZombie.y - 0.3, damageText, damageColor);

        if (isCrit && typeof spawnParticles === 'function') {
            spawnParticles(nearestZombie.x, nearestZombie.y, '#ffff00', 6);
        }

        // Gain combat skill experience
        if (isCombatRole(role)) {
            gainSkillExperience(s, 0.5);
        }

        // Calculate cooldown (faster with skill)
        let cooldown = SURVIVOR_CONFIG.COMBAT_COOLDOWN;
        if (roleBonus.speedBonus) {
            cooldown *= (1 - (skillLevel / SURVIVOR_CONFIG.MAX_SKILL_LEVEL) * roleBonus.speedBonus * 0.3);
        }
        s.attackCooldown = Math.max(0.2, cooldown);

        // Face the enemy
        s.direction = nearestZombie.x > s.x ? 0 : 2;

        // Brave personality: occasional double attack
        if (s.personality === 'brave' && Math.random() < 0.1) {
            s.attackCooldown *= 0.5;
        }
    }
}

function tryMoveEntity(entity, moveX, moveY, radius = 0.3) {
    const newX = entity.x + moveX;
    const newY = entity.y + moveY;

    // Update direction based on major vector
    if (Math.abs(moveX) > Math.abs(moveY)) {
        entity.direction = moveX > 0 ? 0 : 2; // Right or Left
    } else if (Math.abs(moveY) > 0.001) {
        entity.direction = moveY > 0 ? 1 : 3; // Down or Up
    }

    // Try full movement
    if (!isSolidAt(newX, newY, radius)) {
        entity.x = newX;
        entity.y = newY;
        return true;
    }

    // Try axis-separated movement for smoother wall sliding
    let moved = false;
    if (!isSolidAt(newX, entity.y, radius)) {
        entity.x = newX;
        moved = true;
    } else if (!isSolidAt(entity.x, newY, radius)) {
        entity.y = newY;
        moved = true;
    }
    return moved;
}

// ============================================
// TOWER UPDATE
// ============================================
function updateTowers(dt) {
    for (const [key, tower] of activeTowers) {
        if (tower.cooldown > 0) {
            tower.cooldown -= dt;
            continue;
        }

        const [tx, ty] = key.split(',').map(Number);
        const range = tower.type === TILES.CANNON ? 10 : 7;
        let nearest = null;
        let nearestDist = range;

        for (const z of zombies) {
            const d = Math.sqrt((z.x - tx - 0.5) ** 2 + (z.y - ty - 0.5) ** 2);
            if (d < nearestDist) {
                nearestDist = d;
                nearest = z;
            }
        }

        if (nearest) {
            const angle = Math.atan2(nearest.y - ty - 0.5, nearest.x - tx - 0.5);
            projectiles.push({
                x: tx + 0.5, y: ty + 0.5,
                vx: Math.cos(angle) * 12,
                vy: Math.sin(angle) * 12,
                damage: tower.type === TILES.CANNON ? 35 : 18,
                size: tower.type === TILES.CANNON ? 4 : 2,
                color: tower.type === TILES.CANNON ? '#ff6600' : '#ffff00',
                life: 1.5,
                isCannon: tower.type === TILES.CANNON
            });
            tower.cooldown = tower.type === TILES.CANNON ? 1.5 : 0.6;
        }
    }
}

function registerTower(x, y, type) {
    activeTowers.set(`${x},${y}`, { type, cooldown: 0 });
}

function unregisterTower(x, y) {
    const key = `${x},${y}`;
    activeTowers.delete(key);
}

// ============================================
// PROJECTILE UPDATE
// ============================================
function updateProjectiles(dt) {
    dt = validateDeltaTime(dt);

    if (!Array.isArray(projectiles)) return;

    projectiles = projectiles.filter(p => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Handle lifetime (some use 'life', some use 'lifetime')
        if (p.life !== undefined) p.life -= dt;
        if (p.lifetime !== undefined) p.lifetime -= dt;

        const lifeRemaining = p.life ?? p.lifetime ?? 1;
        if (lifeRemaining <= 0) return false;

        const maxDist = 100;
        if (Math.abs(p.x - player.x) > maxDist || Math.abs(p.y - player.y) > maxDist) {
            return false;
        }

        const tile = getTile(p.x, p.y);
        if (isSolid(tile) && tile !== TILES.WATER && tile !== TILES.TOWER && tile !== TILES.CANNON) {
            spawnParticles(p.x, p.y, p.color || '#888888', 3);
            return false;
        }

        // Check if this is an enemy projectile (from zombies)
        if (p.type === 'acid' || p.owner?.ai) {
            return !checkEnemyProjectileCollision(p);
        }

        // Friendly projectile - check zombie collision
        return !checkProjectileZombieCollision(p);
    });
}

// Check enemy projectile (acid spit, etc.) collision with player and survivors
function checkEnemyProjectileCollision(p) {
    const hitRadius = 0.5 + (p.radius || 0.2);
    const hitRadiusSq = hitRadius * hitRadius;

    // Check player collision
    if (typeof player !== 'undefined' && !window.godMode) {
        const dx = player.x - p.x;
        const dy = player.y - p.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < hitRadiusSq) {
            const damage = p.damage || 10;
            player.health -= damage;

            if (typeof spawnParticles === 'function') {
                spawnParticles(player.x, player.y, p.color || '#7fff00', 6);
            }
            if (typeof addDamageNumber === 'function') {
                addDamageNumber(player.x, player.y - 0.5, damage, p.color || '#7fff00');
            }
            if (typeof triggerScreenShake === 'function') {
                triggerScreenShake(3);
            }

            // Acid leaves a lingering effect (optional - slow/DoT)
            if (p.type === 'acid') {
                // Apply acid debuff visual
                if (typeof spawnParticles === 'function') {
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => {
                            if (typeof spawnParticles === 'function') {
                                spawnParticles(player.x, player.y, '#7fff00', 2);
                            }
                        }, i * 200);
                    }
                }
            }
            return true;
        }
    }

    // Check survivor collision
    if (typeof survivors !== 'undefined') {
        for (const s of survivors) {
            if (s.isPlayer || s.health <= 0) continue;

            const dx = s.x - p.x;
            const dy = s.y - p.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < hitRadiusSq) {
                const damage = p.damage || 10;
                s.health -= damage;

                if (typeof spawnParticles === 'function') {
                    spawnParticles(s.x, s.y, p.color || '#7fff00', 5);
                }
                if (typeof addDamageNumber === 'function') {
                    addDamageNumber(s.x, s.y - 0.5, damage, p.color || '#7fff00');
                }
                return true;
            }
        }
    }

    return false;
}

function checkProjectileZombieCollision(p) {
    const hitRadius = 0.4 + (p.size || 2) * 0.02;
    const hitRadiusSq = hitRadius * hitRadius;

    for (const z of zombies) {
        const dx = z.x - p.x;
        const dy = z.y - p.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < hitRadiusSq) {
            const damage = applyZombieDamage(z, p.damage);
            spawnParticles(z.x, z.y, '#ff8844', 4);
            addDamageNumber(z.x, z.y - 0.5, damage, '#ffff00');

            if (p.isCannon) {
                applySplashDamage(p.x, p.y, z, p.damage);
            }
            return true;
        }
    }
    return false;
}

function applySplashDamage(x, y, hitZombie, baseDamage) {
    const splashRadiusSq = TOWER_CONFIG.SPLASH_RADIUS ** 2;
    const splashDamage = Math.floor(baseDamage * TOWER_CONFIG.SPLASH_DAMAGE_MULT);

    for (const z of zombies) {
        if (z === hitZombie) continue;
        const dx = z.x - x;
        const dy = z.y - y;
        if (dx * dx + dy * dy < splashRadiusSq) {
            const actualDamage = applyZombieDamage(z, splashDamage);
            addDamageNumber(z.x, z.y - 0.3, actualDamage, '#ffaa00');
        }
    }
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Apply damage to zombie with armor reduction
function applyZombieDamage(zombie, baseDamage) {
    const reduction = zombie.armorReduction || 0;
    const finalDamage = Math.max(1, Math.floor(baseDamage * (1 - reduction)));
    zombie.health -= finalDamage;
    return finalDamage;
}

function checkLevelUp() {
    if (!player.exp || !player.expToLevel) return;

    let leveledUp = false;
    while (player.exp >= player.expToLevel) {
        player.exp -= player.expToLevel;
        player.level = (player.level || 1) + 1;
        player.expToLevel = Math.floor(player.expToLevel * 1.4);
        player.maxHealth += 15;
        const healAmount = Math.floor(player.maxHealth * 0.5);
        player.health = Math.min(player.health + healAmount, player.maxHealth);
        leveledUp = true;
    }

    if (leveledUp) {
        showNotification(
            `<i class="material-icons">military_tech</i> Level Up! Now level ${player.level}!`,
            []
        );
        spawnParticles(player.x, player.y, '#ffd700', 15);
    }
}

function validateDeltaTime(dt) {
    if (typeof dt !== 'number' || isNaN(dt) || dt <= 0) {
        return 0.016;
    }
    return Math.min(dt, 0.1);
}

// ============================================
// SURVIVOR UTILITY FUNCTIONS
// ============================================

// Get survivor stats for UI display
function getSurvivorStats(s) {
    if (!s || s.isPlayer) return null;

    const role = s.role || 'None';
    const skillLevel = Math.floor(s.skills?.[role] || 0);
    const skillProgress = ((s.skills?.[role] || 0) % 1) * 100;
    const efficiency = calculateSurvivorEfficiency(s);

    return {
        name: s.name || 'Survivor',
        role: role,
        health: s.health,
        maxHealth: s.maxHealth,
        morale: Math.floor(s.morale || 70),
        personality: s.personality || 'unknown',
        skillLevel: skillLevel,
        skillProgress: skillProgress.toFixed(0),
        efficiency: (efficiency * 100).toFixed(0),
        state: s.state || 'IDLE',
        isFollowing: s.isFollowing || false,
        allSkills: s.skills || {}
    };
}

// Get team-wide bonuses from all survivors
function getTeamBonuses() {
    const bonuses = {
        totalWorkers: 0,
        totalCombat: 0,
        avgMorale: 0,
        woodBonus: 0,
        stoneBonus: 0,
        foodBonus: 0,
        combatDamageBonus: 0,
        healingBonus: 0,
        visionBonus: 0
    };

    if (!Array.isArray(survivors)) return bonuses;

    let totalMorale = 0;
    let survivorCount = 0;

    for (const s of survivors) {
        if (s.isPlayer) continue;
        survivorCount++;
        totalMorale += s.morale || 70;

        const role = s.role;
        const skillLevel = s.skills?.[role] || 0;

        if (isCombatRole(role)) {
            bonuses.totalCombat++;
            bonuses.combatDamageBonus += skillLevel * 0.5;
        } else if (role !== 'None') {
            bonuses.totalWorkers++;
        }

        // Role-specific team bonuses
        switch (role) {
            case 'Woodcutter':
                bonuses.woodBonus += 0.05 + skillLevel * 0.01;
                break;
            case 'Miner':
                bonuses.stoneBonus += 0.05 + skillLevel * 0.01;
                break;
            case 'Farmer':
                bonuses.foodBonus += 0.05 + skillLevel * 0.01;
                break;
            case 'Medic':
                bonuses.healingBonus += 0.1 + skillLevel * 0.02;
                break;
            case 'Scout':
                bonuses.visionBonus += 1 + skillLevel * 0.3;
                break;
        }
    }

    bonuses.avgMorale = survivorCount > 0 ? Math.floor(totalMorale / survivorCount) : 0;

    return bonuses;
}

// Get formatted skill display for a survivor
function getSkillDisplay(s) {
    if (!s || !s.skills) return [];

    const skillList = [];
    for (const [skill, level] of Object.entries(s.skills)) {
        if (level > 0) {
            skillList.push({
                name: skill,
                level: Math.floor(level),
                progress: ((level % 1) * 100).toFixed(0),
                isCurrentRole: skill === s.role
            });
        }
    }

    // Sort by level, then by current role
    skillList.sort((a, b) => {
        if (a.isCurrentRole !== b.isCurrentRole) return b.isCurrentRole ? 1 : -1;
        return b.level - a.level;
    });

    return skillList;
}

// Check if any survivor has a specific role
function hasRoleInTeam(role) {
    if (!Array.isArray(survivors)) return false;
    return survivors.some(s => !s.isPlayer && s.role === role);
}

// Get count of survivors by role
function getRoleCounts() {
    const counts = {};
    if (!Array.isArray(survivors)) return counts;

    for (const s of survivors) {
        if (s.isPlayer) continue;
        const role = s.role || 'None';
        counts[role] = (counts[role] || 0) + 1;
    }
    return counts;
}

// Apply team morale boost (from events, buildings, etc.)
function boostTeamMorale(amount, duration = 0) {
    if (!Array.isArray(survivors)) return;

    for (const s of survivors) {
        if (s.isPlayer) continue;
        s.morale = Math.min(100, (s.morale || 70) + amount);
    }

    if (typeof showNotification === 'function' && amount > 5) {
        showNotification(`Team morale ${amount > 0 ? 'boosted' : 'dropped'} by ${Math.abs(amount)}!`, []);
    }
}

// Get best survivor for a specific role
function getBestSurvivorForRole(role) {
    if (!Array.isArray(survivors)) return null;

    let best = null;
    let bestLevel = -1;

    for (const s of survivors) {
        if (s.isPlayer || s.health <= 0) continue;
        const level = s.skills?.[role] || 0;
        if (level > bestLevel) {
            bestLevel = level;
            best = s;
        }
    }
    return best;
}

// Export functions for global access
window.getSurvivorStats = getSurvivorStats;
window.getTeamBonuses = getTeamBonuses;
window.getSkillDisplay = getSkillDisplay;
window.hasRoleInTeam = hasRoleInTeam;
window.getRoleCounts = getRoleCounts;
window.boostTeamMorale = boostTeamMorale;
window.getBestSurvivorForRole = getBestSurvivorForRole;
