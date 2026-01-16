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
    MEDIC_HEAL_RATE: 0.018
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

        zombies.push({
            x: zx,
            y: zy,
            health: health,
            maxHealth: health,
            speed: ZOMBIE_CONFIG.BASE_SPEED + currentDay * ZOMBIE_CONFIG.SPEED_PER_DAY,
            damage: ZOMBIE_CONFIG.BASE_DAMAGE + currentDay * ZOMBIE_CONFIG.DAMAGE_PER_DAY,
            attackCooldown: 0,
            wallDamageTimer: 0,
            frame: 0,
            animTimer: 0,
            // Pathfinding state
            path: null,
            pathIndex: 0,
            repathTimer: 0
        });

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
    // Validate delta time
    dt = validateDeltaTime(dt);

    if (!Array.isArray(zombies)) return;

    const currentDay = dayCount || 0;
    const deadZombies = [];
    const killedSurvivors = [];

    zombies = zombies.filter(z => {
        // Handle dead zombies
        if (z.health <= 0) {
            deadZombies.push(z);
            return false;
        }

        // Daytime behavior - flee and despawn
        if (!isNight) {
            return updateZombieDaytime(z, dt);
        }

        // Nighttime behavior - hunt and attack
        return updateZombieNighttime(z, dt, killedSurvivors);
    });

    // Process dead zombies (after filter to avoid issues)
    processDeadZombies(deadZombies, currentDay);

    // Process killed survivors (deferred to avoid array mutation during iteration)
    processKilledSurvivors(killedSurvivors);
}

function updateZombieDaytime(z, dt) {
    const dx = z.x - player.x;
    const dy = z.y - player.y;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);

    // Flee from player
    if (dist < ZOMBIE_CONFIG.FLEE_RANGE && dist > 0.01) {
        const fleeSpeed = z.speed * ZOMBIE_CONFIG.FLEE_SPEED_MULT * dt;
        const newX = z.x + (dx / dist) * fleeSpeed;
        const newY = z.y + (dy / dist) * fleeSpeed;

        if (!isSolidAt(newX, newY, 0.3)) {
            z.x = newX;
            z.y = newY;
        }
    }

    // Despawn if too far
    return dist < ZOMBIE_CONFIG.DESPAWN_RANGE;
}

function updateZombieNighttime(z, dt, killedSurvivors) {
    // Throttled targeting: only update target once per second
    z.targetTimer = (z.targetTimer || 0) - dt;
    z.repathTimer = (z.repathTimer || 0) - dt;

    // Find target (Player or Survivor)
    if (z.targetTimer <= 0 || !z.cachedTarget) {
        z.cachedTarget = findNearestTarget(z);
        z.targetTimer = 0.5 + Math.random(); // Jittered update
    }

    const target = z.cachedTarget;
    const dx = target.x - z.x;
    const dy = target.y - z.y;
    const distToTargetSq = dx * dx + dy * dy;

    // Movement Logic
    let moveTargetX = target.x;
    let moveTargetY = target.y;
    let shouldUseDirect = true;

    // Use pathfinding if target is far enough or we have a path
    if (distToTargetSq > 4) { // Don't pathfind in immediate melee range
        // Calculate new path if needed
        if (z.repathTimer <= 0) {
            z.path = pathfinder.findPath(z.x, z.y, target.x, target.y);
            z.pathIndex = 0;
            z.repathTimer = PATHFINDING_CONFIG.REPATH_BOREDOM + Math.random();
        }

        // Follow path if valid
        if (z.path && z.pathIndex < z.path.length) {
            const node = z.path[z.pathIndex];
            const distToNodeSq = (node.x - z.x) ** 2 + (node.y - z.y) ** 2;

            // Advance to next node if close
            if (distToNodeSq < 0.1) {
                z.pathIndex++;
                if (z.pathIndex < z.path.length) {
                    moveTargetX = z.path[z.pathIndex].x;
                    moveTargetY = z.path[z.pathIndex].y;
                    shouldUseDirect = false;
                }
            } else {
                moveTargetX = node.x;
                moveTargetY = node.y;
                shouldUseDirect = false;
            }
        }
    }

    // fallback to direct if path finished or invalid
    if (shouldUseDirect) {
        moveTargetX = target.x;
        moveTargetY = target.y;
    }

    const moveDx = moveTargetX - z.x;
    const moveDy = moveTargetY - z.y;
    const moveDist = Math.sqrt(moveDx * moveDx + moveDy * moveDy);

    // Stop moving if in attack range of actual target (not path node)
    const distToActualTarget = Math.sqrt(distToTargetSq);

    if (distToActualTarget > ZOMBIE_CONFIG.ATTACK_RANGE * 0.75) {
        moveZombieTowards(z, moveTargetX, moveTargetY, moveDist, dt);
    } else {
        z.wallDamageTimer = 0;
    }

    // Update animation
    z.animTimer += dt * 5;
    z.frame = Math.floor(z.animTimer) % 2;

    // Update cooldown
    if (z.attackCooldown > 0) {
        z.attackCooldown = Math.max(0, z.attackCooldown - dt);
    }

    // Attack if in range of ACTUAL target
    if (z.attackCooldown <= 0 && distToActualTarget < ZOMBIE_CONFIG.ATTACK_RANGE) {
        performZombieAttack(z, killedSurvivors);
    }

    return true;
}

function findNearestTarget(z) {
    let targetX = player.x;
    let targetY = player.y;
    let minDistSq = (player.x - z.x) ** 2 + (player.y - z.y) ** 2;

    if (Array.isArray(survivors)) {
        for (const s of survivors) {
            if (s.isPlayer || s.health <= 0) continue;
            const dSq = (s.x - z.x) ** 2 + (s.y - z.y) ** 2;
            if (dSq < minDistSq) {
                minDistSq = dSq;
                targetX = s.x;
                targetY = s.y;
            }
        }
    }

    return { x: targetX, y: targetY, distSq: minDistSq };
}

function moveZombieTowards(z, targetX, targetY, dist, dt) {
    const dx = targetX - z.x;
    const dy = targetY - z.y;
    const moveSpeed = z.speed * dt;
    const newX = z.x + (dx / dist) * moveSpeed;
    const newY = z.y + (dy / dist) * moveSpeed;

    const collision = getCollidingTile(newX, newY, 0.3);

    if (collision) {
        const tile = collision.tile;
        if (tile === TILES.WALL || tile === TILES.WALL_BROKEN) {
            // Accumulate wall damage over time (frame-rate independent)
            z.wallDamageTimer = (z.wallDamageTimer || 0) + dt;

            if (z.wallDamageTimer >= ZOMBIE_CONFIG.WALL_DAMAGE_TIME) {
                z.wallDamageTimer = 0;
                const tileX = collision.x;
                const tileY = collision.y;

                if (tile === TILES.WALL) {
                    setTile(tileX, tileY, TILES.WALL_BROKEN);
                    spawnParticles(tileX + 0.5, tileY + 0.5, '#8b7355', 5);
                } else if (tile === TILES.WALL_BROKEN) {
                    setTile(tileX, tileY, TILES.GRASS);
                    spawnParticles(tileX + 0.5, tileY + 0.5, '#8b7355', 8);
                }
            }
        } else {
            // Hit other solid object (tree, rock), try to slide around it
            tryMoveEntity(z, (dx / dist) * moveSpeed, (dy / dist) * moveSpeed, 0.3);
            z.wallDamageTimer = 0;
        }
    } else {
        // No solid collision, check for damaging tiles like spikes
        const tile = getTile(newX, newY);
        if (tile === TILES.SPIKES) {
            // Trap damage
            z.health -= 15 * dt;
            if (Math.random() < 0.05) {
                spawnParticles(z.x, z.y, '#888888', 2);
                // Find the trap in buildings list and reduce durability
                const trap = buildings.find(b => b.x === Math.floor(newX) && b.y === Math.floor(newY));
                if (trap) {
                    trap.durability = (trap.durability || 50) - 1;
                    if (trap.durability <= 0) {
                        setTile(trap.x, trap.y, TILES.FLOOR);
                        showNotification('A spike trap has broken!', []);
                    }
                }
            }
        }

        z.x = newX;
        z.y = newY;
        z.wallDamageTimer = 0;
    }
}

function performZombieAttack(z, killedSurvivors) {
    const playerDist = Math.sqrt((player.x - z.x) ** 2 + (player.y - z.y) ** 2);

    if (playerDist < ZOMBIE_CONFIG.ATTACK_RANGE) {
        // Attack player
        player.health -= z.damage;
        player.hitTimer = 0.2;
        camera.shake = 10;
        spawnParticles(player.x, player.y, '#ff4444', 5);
        addDamageNumber(player.x, player.y - 0.5, z.damage, '#ff4444');
    } else {
        // Attack nearest survivor in range
        for (const s of survivors) {
            if (s.isPlayer || s.health <= 0) continue;

            const sd = Math.sqrt((s.x - z.x) ** 2 + (s.y - z.y) ** 2);
            if (sd < ZOMBIE_CONFIG.ATTACK_RANGE) {
                s.health -= z.damage;
                spawnParticles(s.x, s.y, '#ff4444', 4);
                addDamageNumber(s.x, s.y - 0.5, z.damage, '#ff4444');

                if (s.health <= 0) {
                    killedSurvivors.push(s);
                }
                break; // Only attack one target per attack
            }
        }
    }

    z.attackCooldown = ZOMBIE_CONFIG.ATTACK_COOLDOWN;
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

function processKilledSurvivors(killedSurvivors) {
    if (killedSurvivors.length === 0) return;

    for (const s of killedSurvivors) {
        showNotification(`<i class="material-icons">skull</i> ${s.name} was killed!`, []);
        spawnParticles(s.x, s.y, '#ff4444', 10);
    }

    // Remove dead survivors
    survivors = survivors.filter(s => s.isPlayer || s.health > 0);
}

// ============================================
// SURVIVOR UPDATE
// ============================================
function updateSurvivors(dt) {
    dt = validateDeltaTime(dt);

    if (!Array.isArray(survivors)) return;

    const survivorCount = survivors.filter(s => !s.isPlayer).length;

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

        if (followMode) {
            updateSurvivorFollowMode(s, i, survivorCount, dt);
        } else {
            updateSurvivorIdleMode(s, dt);
        }
    }
}

function initializeSurvivorProperties(s) {
    if (s.attackCooldown === undefined) s.attackCooldown = 0;
    if (s.maxHealth === undefined) s.maxHealth = 50;
}

function updateSurvivorFollowMode(s, index, totalCount, dt) {
    // Calculate formation position
    const formationAngle = (index / Math.max(totalCount, 1)) * Math.PI * 2;
    const targetX = player.x + Math.cos(formationAngle) * SURVIVOR_CONFIG.FOLLOW_DISTANCE;
    const targetY = player.y + Math.sin(formationAngle) * SURVIVOR_CONFIG.FOLLOW_DISTANCE;

    // Move towards formation position
    const dx = targetX - s.x;
    const dy = targetY - s.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > SURVIVOR_CONFIG.FOLLOW_THRESHOLD) {
        const moveSpeed = SURVIVOR_CONFIG.FOLLOW_SPEED * dt;
        const moveX = (dx / dist) * moveSpeed;
        const moveY = (dy / dist) * moveSpeed;

        // Try full movement first, then axis-separated
        tryMoveEntity(s, moveX, moveY);
    }

    // Combat behavior for combat roles
    if (isCombatRole(s.role)) {
        updateSurvivorCombat(s, dt);
    }
}

function updateSurvivorIdleMode(s, dt) {
    if (s.state === undefined) s.state = 'IDLE';
    if (s.taskTimer === undefined) s.taskTimer = 0;

    // State Machine
    switch (s.state) {
        case 'IDLE':
            // Look for work
            const target = findTaskTarget(s);
            if (target) {
                s.taskTarget = target;
                s.state = 'MOVING';
                s.repathTimer = 0;
            } else {
                // Wander if no work found
                const wanderAmount = SURVIVOR_CONFIG.WANDER_SPEED * dt;
                const newX = s.x + (Math.random() - 0.5) * wanderAmount;
                const newY = s.y + (Math.random() - 0.5) * wanderAmount;
                if (!isSolidAt(newX, newY, 0.3)) {
                    s.x = clamp(newX, -10, 10);
                    s.y = clamp(newY, -10, 10);
                }
            }
            break;

        case 'MOVING':
            if (!s.taskTarget) {
                s.state = 'IDLE';
                return;
            }

            const dx = s.taskTarget.x - s.x;
            const dy = s.taskTarget.y - s.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < 1.0) { // Reached target
                s.state = 'WORKING';
                s.taskTimer = 0;
            } else {
                // Move towards target
                moveEntityResilient(s, s.taskTarget.x, s.taskTarget.y, dt);
            }
            break;

        case 'WORKING':
            s.taskTimer += dt;

            // Visuals for working
            if (Math.random() < 0.1) {
                const type = s.role === 'Woodcutter' ? '#8B4513' :
                    s.role === 'Miner' ? '#707070' : '#ffff00';
                spawnParticles(s.x, s.y, type, 1);
            }

            // Complete work (every 2-4 seconds)
            if (s.taskTimer > 3) {
                performTaskWork(s);
                s.taskTimer = 0;
                // Chance to find new target
                if (Math.random() > 0.7) {
                    s.state = 'IDLE';
                    s.taskTarget = null;
                }
            }
            break;
    }
}

function findTaskTarget(s) {
    let targetType = null;
    switch (s.role) {
        case 'Woodcutter': targetType = TILES.TREE; break;
        case 'Miner': targetType = Math.random() > 0.5 ? TILES.STONE : TILES.IRON; break;
        case 'Farmer': targetType = TILES.FARM; break;
        case 'Medic': return player.health < player.maxHealth ? { x: player.x, y: player.y } : null;
        case 'Guard':
            // Guards stay near player
            if (isNight) {
                // Night: guard the base (stay put)
                return null;
            }
            // Day: patrol randomly near base
            return {
                x: (Math.random() - 0.5) * 6,
                y: (Math.random() - 0.5) * 6
            };
        case 'Soldier':
        case 'Hunter':
            // Combat roles patrol when no enemies
            return null;
    }

    if (targetType !== null) {
        // Search for nearest tile of type
        return findNearestTile(s.x, s.y, targetType, 30);
    }
    return null;
}

function performTaskWork(s) {
    switch (s.role) {
        case 'Woodcutter':
            resources.wood++;
            spawnParticles(s.x, s.y - 0.5, '#deb887', 5);
            addDamageNumber(s.x, s.y - 0.5, '+1', '#deb887');
            break;
        case 'Miner':
            resources.stone++;
            if (Math.random() < 0.3) resources.iron++;
            spawnParticles(s.x, s.y - 0.5, '#a9a9a9', 5);
            addDamageNumber(s.x, s.y - 0.5, '+1', '#a9a9a9');
            break;
        case 'Farmer':
            resources.food++;
            spawnParticles(s.x, s.y - 0.5, '#90ee90', 5);
            addDamageNumber(s.x, s.y - 0.5, '+1', '#90ee90');
            break;
    }
}

function moveEntityResilient(entity, targetX, targetY, dt) {
    // Direct path or pathfinding could go here
    // For now, robust direct movement with slide
    const dx = targetX - entity.x;
    const dy = targetY - entity.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = SURVIVOR_CONFIG.WANDER_SPEED * 1.5; // Move faster when working

    if (dist > 0.1) {
        tryMoveEntity(entity, (dx / dist) * speed * dt, (dy / dist) * speed * dt);
    }
}

function isCombatRole(role) {
    return role === 'Soldier' || role === 'Guard' || role === 'Hunter';
}

function updateSurvivorCombat(s, dt) {
    // Update cooldown
    if (s.attackCooldown > 0) {
        s.attackCooldown -= dt;
        return;
    }

    // Find and attack nearest zombie in range
    for (const z of zombies) {
        const dist = Math.sqrt((z.x - s.x) ** 2 + (z.y - s.y) ** 2);
        if (dist < SURVIVOR_CONFIG.COMBAT_RANGE) {
            z.health -= SURVIVOR_CONFIG.COMBAT_DAMAGE;
            addDamageNumber(z.x, z.y - 0.3, SURVIVOR_CONFIG.COMBAT_DAMAGE, '#00ff00');
            s.attackCooldown = SURVIVOR_CONFIG.COMBAT_COOLDOWN;
            break;
        }
    }
}

function updateGuardCombat(s, dt) {
    for (const z of zombies) {
        const dist = Math.sqrt((z.x - s.x) ** 2 + (z.y - s.y) ** 2);
        if (dist < SURVIVOR_CONFIG.GUARD_RANGE) {
            z.health -= SURVIVOR_CONFIG.GUARD_DPS * dt;
        }
    }
}

function healNearestWounded(s) {
    // Prioritize player
    if (player.health < player.maxHealth) {
        player.health = Math.min(player.health + 1, player.maxHealth);
        return;
    }

    // Then heal other survivors
    for (const other of survivors) {
        if (other === s || other.isPlayer) continue;
        if (other.health < (other.maxHealth || 50)) {
            other.health = Math.min(other.health + 1, other.maxHealth || 50);
            return;
        }
    }
}

function tryMoveEntity(entity, moveX, moveY, radius = 0.3) {
    const newX = entity.x + moveX;
    const newY = entity.y + moveY;

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

function scanForTowers() {
    // Scan area around player
    const scanRadius = 50;
    const px = Math.floor(player.x);
    const py = Math.floor(player.y);

    for (let y = py - scanRadius; y <= py + scanRadius; y++) {
        for (let x = px - scanRadius; x <= px + scanRadius; x++) {
            const tile = getTile(x, y);
            if (tile === TILES.TOWER || tile === TILES.CANNON) {
                const key = `${x},${y}`;
                if (!activeTowers.has(key)) {
                    activeTowers.set(key, {
                        type: tile,
                        cooldown: 0
                    });
                }
            }
        }
    }
}

function findTowerTarget(towerX, towerY, tileType) {
    const range = tileType === TILES.CANNON
        ? TOWER_CONFIG.CANNON_RANGE
        : TOWER_CONFIG.ARROW_RANGE;
    const centerX = towerX + 0.5;
    const centerY = towerY + 0.5;
    const rangeSq = range * range;

    let nearest = null;
    let nearestDistSq = rangeSq;

    for (const z of zombies) {
        const dx = z.x - centerX;
        const dy = z.y - centerY;
        const distSq = dx * dx + dy * dy;

        if (distSq < nearestDistSq) {
            nearestDistSq = distSq;
            nearest = z;
        }
    }

    return nearest;
}

function fireTowerProjectile(towerX, towerY, tileType, target) {
    const centerX = towerX + 0.5;
    const centerY = towerY + 0.5;
    const isCannon = tileType === TILES.CANNON;

    const angle = Math.atan2(target.y - centerY, target.x - centerX);

    projectiles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * TOWER_CONFIG.PROJECTILE_SPEED,
        vy: Math.sin(angle) * TOWER_CONFIG.PROJECTILE_SPEED,
        damage: isCannon ? TOWER_CONFIG.CANNON_DAMAGE : TOWER_CONFIG.ARROW_DAMAGE,
        size: isCannon ? TOWER_CONFIG.CANNON_SIZE : TOWER_CONFIG.ARROW_SIZE,
        color: isCannon ? '#ff6600' : '#ffff00',
        life: 1.5,
        isCannon: isCannon
    });
}

// Helper to register tower when built
function registerTower(x, y, type) {
    activeTowers.set(`${x},${y}`, { type, cooldown: 0 });
}

// Helper to unregister tower when destroyed
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
        // Update position
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;

        // Remove if expired
        if (p.life <= 0) return false;

        // Remove if out of bounds
        const maxDist = 100;
        if (Math.abs(p.x - player.x) > maxDist || Math.abs(p.y - player.y) > maxDist) {
            return false;
        }

        // Check wall collision
        const tile = getTile(p.x, p.y);
        // Don't collide with the tower/cannon itself or water
        if (isSolid(tile) && tile !== TILES.WATER && tile !== TILES.TOWER && tile !== TILES.CANNON) {
            spawnParticles(p.x, p.y, '#888888', 3);
            return false;
        }

        // Check zombie collision
        return !checkProjectileZombieCollision(p);
    });
}

function checkProjectileZombieCollision(p) {
    const hitRadius = 0.4 + (p.size || 2) * 0.02;
    const hitRadiusSq = hitRadius * hitRadius;

    for (const z of zombies) {
        const dx = z.x - p.x;
        const dy = z.y - p.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < hitRadiusSq) {
            // Direct damage
            z.health -= p.damage;
            spawnParticles(z.x, z.y, '#ff8844', 4);
            addDamageNumber(z.x, z.y - 0.5, p.damage, '#ffff00');

            // Splash damage for cannon
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
            z.health -= splashDamage;
            addDamageNumber(z.x, z.y - 0.3, splashDamage, '#ffaa00');
        }
    }
}

// Particle update moved to effects.js

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// ============================================
// LEVEL SYSTEM
// ============================================
function checkLevelUp() {
    if (!player.exp || !player.expToLevel) return;

    let leveledUp = false;

    while (player.exp >= player.expToLevel) {
        player.exp -= player.expToLevel;
        player.level = (player.level || 1) + 1;
        player.expToLevel = Math.floor(player.expToLevel * 1.4);
        player.maxHealth += 15;

        // Heal 50% of max health instead of full (more balanced)
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

// ============================================
// UTILITY FUNCTIONS
// ============================================
function validateDeltaTime(dt) {
    if (typeof dt !== 'number' || isNaN(dt) || dt <= 0) {
        return 0.016; // Default to ~60fps
    }
    // Cap delta time to prevent physics issues on lag spikes
    return Math.min(dt, 0.1);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function distanceSquared(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(distanceSquared(x1, y1, x2, y2));
}