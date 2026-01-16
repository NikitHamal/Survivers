function spawnZombie() {
    if (zombies.length >= 30 + dayCount * 5) return;

    const angle = Math.random() * Math.PI * 2;
    const dist = 18 + Math.random() * 8;

    const zx = player.x + Math.cos(angle) * dist;
    const zy = player.y + Math.sin(angle) * dist;

    // Don't spawn in water
    if (getTile(zx, zy) === TILES.WATER) return;

    zombies.push({
        x: zx, y: zy,
        health: 25 + dayCount * 8,
        maxHealth: 25 + dayCount * 8,
        speed: 1.2 + dayCount * 0.08,
        damage: 8 + dayCount * 2,
        attackCooldown: 0,
        frame: 0, animTimer: 0
    });
}

function updateZombies(dt) {
    zombies = zombies.filter(z => {
        if (z.health <= 0) {
            // Loot drop
            if (Math.random() < 0.35) resources.food += 1 + Math.floor(Math.random() * 2);
            player.exp += 15 + dayCount * 2;
            checkLevelUp();
            spawnParticles(z.x, z.y, '#5a8a5a', 8);
            return false;
        }

        // Daytime - zombies flee
        if (!isNight) {
            const dx = z.x - player.x;
            const dy = z.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 40 && dist > 0) {
                z.x += (dx / dist) * z.speed * 0.3 * dt;
                z.y += (dy / dist) * z.speed * 0.3 * dt;
            }
            // Despawn far zombies during day
            return dist < 50;
        }

        // Find nearest target
        let targetX = player.x, targetY = player.y;
        let minDist = Math.sqrt((player.x - z.x) ** 2 + (player.y - z.y) ** 2);

        survivors.forEach(s => {
            if (s.isPlayer) return;
            const d = Math.sqrt((s.x - z.x) ** 2 + (s.y - z.y) ** 2);
            if (d < minDist) {
                minDist = d;
                targetX = s.x;
                targetY = s.y;
            }
        });

        // Move towards target
        if (minDist > 0.6) {
            const dx = targetX - z.x;
            const dy = targetY - z.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const moveSpeed = z.speed * dt;
            const newX = z.x + (dx / dist) * moveSpeed;
            const newY = z.y + (dy / dist) * moveSpeed;

            // Simple collision for zombies
            const tile = getTile(newX, newY);
            if (tile === TILES.WALL) {
                // Damage wall
                if (Math.random() < 0.01) {
                    setTile(Math.floor(newX), Math.floor(newY), TILES.WALL_BROKEN);
                }
            } else if (!isSolid(tile)) {
                z.x = newX;
                z.y = newY;
            }
        }

        // Animation
        z.animTimer += dt * 5;
        z.frame = Math.floor(z.animTimer) % 2;

        // Attack
        if (z.attackCooldown <= 0 && minDist < 0.8) {
            // Check who is closest
            const playerDist = Math.sqrt((player.x - z.x) ** 2 + (player.y - z.y) ** 2);
            if (playerDist < 0.8) {
                player.health -= z.damage;
                player.hitTimer = 0.2;
                spawnParticles(player.x, player.y, '#ff4444', 5);
                addDamageNumber(player.x, player.y - 0.5, z.damage, '#ff4444');
            } else {
                // Attack survivor
                survivors.forEach(s => {
                    if (s.isPlayer) return;
                    const sd = Math.sqrt((s.x - z.x) ** 2 + (s.y - z.y) ** 2);
                    if (sd < 0.8) {
                        s.health -= z.damage;
                        if (s.health <= 0) {
                            survivors = survivors.filter(sv => sv !== s);
                            showNotification(`💀 ${s.name} was killed!`, []);
                        }
                    }
                });
            }
            z.attackCooldown = 1.2;
        }

        if (z.attackCooldown > 0) z.attackCooldown -= dt;

        return true;
    });
}

function updateSurvivors(dt) {
    survivors.forEach(s => {
        if (s.isPlayer) {
            s.x = player.x;
            s.y = player.y;
            return;
        }

        if (followMode) {
            // Follow player with some offset
            const idx = survivors.indexOf(s);
            const angle = (idx / survivors.length) * Math.PI * 2;
            const targetX = player.x + Math.cos(angle) * 1.5;
            const targetY = player.y + Math.sin(angle) * 1.5;

            const dx = targetX - s.x;
            const dy = targetY - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0.5) {
                s.x += (dx / dist) * 2.5 * dt;
                s.y += (dy / dist) * 2.5 * dt;
            }

            // Combat roles attack zombies
            if (s.role === 'Soldier' || s.role === 'Guard' || s.role === 'Hunter') {
                zombies.forEach(z => {
                    const zd = Math.sqrt((z.x - s.x) ** 2 + (z.y - s.y) ** 2);
                    if (zd < 2.5) {
                        z.health -= 8 * dt;
                    }
                });
            }
        } else {
            // Role-based tasks
            if (s.role === 'Guard' && isNight) {
                zombies.forEach(z => {
                    const zd = Math.sqrt((z.x - s.x) ** 2 + (z.y - s.y) ** 2);
                    if (zd < 3) z.health -= 5 * dt;
                });
            } else if (s.role === 'Farmer' && Math.random() < 0.0005) {
                resources.food++;
            } else if (s.role === 'Woodcutter' && Math.random() < 0.0004) {
                resources.wood++;
            } else if (s.role === 'Miner' && Math.random() < 0.0003) {
                resources.stone++;
                if (Math.random() < 0.3) resources.iron++;
            } else if (s.role === 'Medic' && Math.random() < 0.0003) {
                player.health = Math.min(player.health + 1, player.maxHealth);
            }

            // Wander near base
            s.x += (Math.random() - 0.5) * 0.02;
            s.y += (Math.random() - 0.5) * 0.02;
            s.x = Math.max(-5, Math.min(5, s.x));
            s.y = Math.max(-5, Math.min(5, s.y));
        }
    });
}

function updateTowers(dt) {
    for (let y = -15; y < 15; y++) {
        for (let x = -15; x < 15; x++) {
            const tile = getTile(x, y);
            if (tile !== TILES.TOWER && tile !== TILES.CANNON) continue;

            const key = `${x},${y}`;
            let cooldown = towerCooldowns.get(key) || 0;

            if (cooldown > 0) {
                towerCooldowns.set(key, cooldown - dt);
                continue;
            }

            // Find target
            const range = tile === TILES.TOWER ? 7 : 10;
            let nearest = null, nearestDist = range;

            zombies.forEach(z => {
                const d = Math.sqrt((z.x - x - 0.5) ** 2 + (z.y - y - 0.5) ** 2);
                if (d < nearestDist) {
                    nearestDist = d;
                    nearest = z;
                }
            });

            if (nearest) {
                const angle = Math.atan2(nearest.y - y - 0.5, nearest.x - x - 0.5);
                projectiles.push({
                    x: x + 0.5, y: y + 0.5,
                    vx: Math.cos(angle) * 12,
                    vy: Math.sin(angle) * 12,
                    damage: tile === TILES.CANNON ? 35 : 18,
                    size: tile === TILES.CANNON ? 4 : 2,
                    color: tile === TILES.CANNON ? '#ff6600' : '#ffff00',
                    life: 1.5
                });
                towerCooldowns.set(key, tile === TILES.CANNON ? 1.5 : 0.6);
            }
        }
    }
}

function updateProjectiles(dt) {
    projectiles = projectiles.filter(p => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;

        // Hit zombies
        for (const z of zombies) {
            const d = Math.sqrt((z.x - p.x) ** 2 + (z.y - p.y) ** 2);
            if (d < 0.6) {
                z.health -= p.damage;
                spawnParticles(z.x, z.y, '#ff8844', 4);
                addDamageNumber(z.x, z.y - 0.5, p.damage, '#ffff00');
                return false;
            }
        }

        return p.life > 0;
    });
}

function updateParticles(dt) {
    particles = particles.filter(p => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 5 * dt; // gravity
        p.life -= dt * 1.5;
        return p.life > 0;
    });
}

function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4 - 2,
            color,
            size: 2 + Math.random() * 2,
            life: 0.6 + Math.random() * 0.4
        });
    }
}

function checkLevelUp() {
    while (player.exp >= player.expToLevel) {
        player.exp -= player.expToLevel;
        player.level++;
        player.expToLevel = Math.floor(player.expToLevel * 1.4);
        player.maxHealth += 15;
        player.health = player.maxHealth;
        showNotification(`🎉 Level Up! Now level ${player.level}!`, []);
        spawnParticles(player.x, player.y, '#ffd700', 15);
    }
}
