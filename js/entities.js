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
        const distToPlayer = Math.sqrt((z.x - player.x)**2 + (z.y - player.y)**2);
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

        // Movement Logic using Steering (Integrated here or extracted to SurvivorAI)
        // For now, keeping logic here but improved
        
        let targetX = s.x;
        let targetY = s.y;
        let shouldMove = false;
        
        if (followMode) {
            // Calculate formation position
            const formationAngle = (i / Math.max(survivorCount, 1)) * Math.PI * 2;
            targetX = player.x + Math.cos(formationAngle) * SURVIVOR_CONFIG.FOLLOW_DISTANCE;
            targetY = player.y + Math.sin(formationAngle) * SURVIVOR_CONFIG.FOLLOW_DISTANCE;
            shouldMove = true;
        } else {
             // Idle Logic
             updateSurvivorIdleMode(s, dt);
             return; // Idle mode handles its own movement inside
        }
        
        if (shouldMove) {
             const dx = targetX - s.x;
             const dy = targetY - s.y;
             const dist = Math.sqrt(dx*dx + dy*dy);
             
             if (dist > SURVIVOR_CONFIG.FOLLOW_THRESHOLD) {
                 // Use seek behavior
                 const moveSpeed = SURVIVOR_CONFIG.FOLLOW_SPEED * dt;
                 
                 // Apply separation from other survivors
                 const separation = SteeringBehavior.separate(s, survivors);
                 
                 const mx = (dx/dist) * moveSpeed + separation.x * dt;
                 const my = (dy/dist) * moveSpeed + separation.y * dt;
                 
                 tryMoveEntity(s, mx, my);
             }
        }
        
        // Combat
        if (isCombatRole(s.role)) {
            updateSurvivorCombat(s, dt);
        }
    }
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
            const target = findTaskTarget(s);
            if (target) {
                s.taskTarget = target;
                s.state = 'MOVING';
                s.path = pathfinder.findPath(s.x, s.y, target.x, target.y);
                s.pathIndex = 0;
            } else {
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
            if (s.path && s.pathIndex < s.path.length) {
                 const node = s.path[s.pathIndex];
                 const dNode = (node.x - s.x)**2 + (node.y - s.y)**2;
                 if (dNode < 0.1) {
                     s.pathIndex++;
                     if (s.pathIndex < s.path.length) moveTarget = s.path[s.pathIndex];
                 } else {
                     moveTarget = node;
                 }
            }

            const dx = moveTarget.x - s.x;
            const dy = moveTarget.y - s.y;
            const distSq = (s.taskTarget.x - s.x)**2 + (s.taskTarget.y - s.y)**2;

            if (distSq < 1.0) { // Reached target
                s.state = 'WORKING';
                s.taskTimer = 0;
            } else {
                const dist = Math.sqrt((moveTarget.x - s.x)**2 + (moveTarget.y - s.y)**2);
                if (dist > 0.1) {
                    const speed = SURVIVOR_CONFIG.WANDER_SPEED * dt;
                    tryMoveEntity(s, (dx/dist)*speed, (dy/dist)*speed);
                }
            }
            break;

        case 'WORKING':
            s.taskTimer += dt;
            if (Math.random() < 0.1) {
                const type = s.role === 'Woodcutter' ? '#8B4513' :
                    s.role === 'Miner' ? '#707070' : '#ffff00';
                spawnParticles(s.x, s.y, type, 1);
            }
            if (s.taskTimer > 3) {
                performTaskWork(s);
                s.taskTimer = 0;
                if (Math.random() > 0.7) {
                    s.state = 'IDLE';
                    s.taskTarget = null;
                    s.path = null;
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
            if (isNight) return null;
            return {
                x: s.x + (Math.random() - 0.5) * 6,
                y: s.y + (Math.random() - 0.5) * 6
            };
    }

    if (targetType !== null) {
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
