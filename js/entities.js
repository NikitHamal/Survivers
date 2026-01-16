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

        const newZombie = {
            x: zx,
            y: zy,
            health: health,
            maxHealth: health,
            speed: ZOMBIE_CONFIG.BASE_SPEED + currentDay * ZOMBIE_CONFIG.SPEED_PER_DAY,
            damage: ZOMBIE_CONFIG.BASE_DAMAGE + currentDay * ZOMBIE_CONFIG.DAMAGE_PER_DAY,
            attackCooldown: 0,
            frame: 0,
            animTimer: 0
        };

        // Attach AI
        newZombie.ai = new ZombieAI(newZombie);

        // Elite Check
        if (typeof EliteSystem !== 'undefined' && EliteSystem.shouldBeElite()) {
            EliteSystem.makeElite(newZombie);
        }

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
        // Audio
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play(z.isMiniBoss ? 'boss_death' : 'zombie_death', { position: { x: z.x, y: z.y } });
        }

        // Elite/Mini-Boss Handling
        if (typeof EliteSystem !== 'undefined') {
            if (z.isElite) EliteSystem.handleEliteDeath(z);
            if (z.isMiniBoss) EliteSystem.handleMiniBossDeath(z);
        }

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

    switch (s.role) {
        case 'Woodcutter':
            resources.wood += 2;
            setTile(tx, ty, TILES.GRASS); // Harvest the tree
            spawnParticles(s.x, s.y - 0.5, '#deb887', 5);
            addDamageNumber(s.x, s.y - 0.5, '+2', '#deb887');
            break;
        case 'Miner':
            const currentTile = getTile(tx, ty);
            if (currentTile === TILES.STONE || currentTile === TILES.IRON) {
                resources.stone += 2;
                if (currentTile === TILES.IRON || Math.random() < 0.4) resources.iron++;
                setTile(tx, ty, TILES.GRASS); // Harvest the stone/ore
                spawnParticles(s.x, s.y - 0.5, '#a9a9a9', 5);
                addDamageNumber(s.x, s.y - 0.5, '+2', '#a9a9a9');
            }
            break;
        case 'Farmer':
            resources.food += 1;
            // Farms stay but give food
            spawnParticles(s.x, s.y - 0.5, '#90ee90', 5);
            addDamageNumber(s.x, s.y - 0.5, '+1', '#90ee90');
            break;
        case 'Medic':
            // Heal nearby target
            if (s.taskTarget.health !== undefined) {
                s.taskTarget.health = Math.min(s.taskTarget.maxHealth, s.taskTarget.health + 10);
                showNotification(`Medic ${s.name} healed someone!`);
            } else if (distSq(s, player) < 4) {
                player.health = Math.min(player.maxHealth, player.health + 10);
            }
            break;
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
        p.life -= dt;

        if (p.life <= 0) return false;

        const maxDist = 100;
        if (Math.abs(p.x - player.x) > maxDist || Math.abs(p.y - player.y) > maxDist) {
            return false;
        }

        const tile = getTile(p.x, p.y);
        if (isSolid(tile) && tile !== TILES.WATER && tile !== TILES.TOWER && tile !== TILES.CANNON) {
            spawnParticles(p.x, p.y, '#888888', 3);
            return false;
        }

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
            z.health -= p.damage;
            spawnParticles(z.x, z.y, '#ff8844', 4);
            addDamageNumber(z.x, z.y - 0.5, p.damage, '#ffff00');

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

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
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
