// ============= GAME LOOP =============
function gameLoop(currentTime) {
    if (!gameRunning) return;

    let dt = (currentTime - lastFrameTime) / 1000;
    lastFrameTime = currentTime;

    // Clamp delta time
    if (dt > MAX_DT) dt = MAX_DT;

    // FPS counter
    frameCount++;
    fpsTimer += dt;
    if (fpsTimer >= 1) {
        fps = frameCount;
        frameCount = 0;
        fpsTimer = 0;
        document.getElementById('fpsCounter').textContent = `FPS: ${fps}`;
    }

    if (!gamePaused) {
        // Fixed timestep for physics
        accumulator += dt;
        while (accumulator >= FIXED_DT) {
            fixedUpdate(FIXED_DT);
            accumulator -= FIXED_DT;
        }

        // Variable update for rendering stuff
        variableUpdate(dt);
    }

    render();

    requestAnimationFrame(gameLoop);
}

// Physics update - fixed timestep
function fixedUpdate(dt) {
    gameTime += dt;

    // Update time of day
    timeOfDay += dt / (DAY_LENGTH / 1000);
    if (timeOfDay >= 1) {
        timeOfDay = 0;
        dayCount++;
        showNotification(`☀️ Day ${dayCount} begins!`, [{ text: 'OK', action: () => { } }]);
    }

    updateDayNight();

    // Player movement
    let moveX = 0, moveY = 0;

    if (keys['KeyW'] || keys['ArrowUp']) moveY = -1;
    if (keys['KeyS'] || keys['ArrowDown']) moveY = 1;
    if (keys['KeyA'] || keys['ArrowLeft']) moveX = -1;
    if (keys['KeyD'] || keys['ArrowRight']) moveX = 1;

    // Normalize diagonal
    if (moveX !== 0 && moveY !== 0) {
        moveX *= 0.7071;
        moveY *= 0.7071;
    }

    player.isMoving = (moveX !== 0 || moveY !== 0);

    if (player.isMoving) {
        // Update direction
        if (Math.abs(moveX) > Math.abs(moveY)) {
            player.direction = moveX > 0 ? 0 : 2;
        } else {
            player.direction = moveY > 0 ? 1 : 3;
        }

        // Move with collision
        const speed = player.speed * dt;
        const newX = player.x + moveX * speed;
        const newY = player.y + moveY * speed;

        // X movement
        if (!isSolidAt(newX, player.y)) {
            player.x = newX;
        }
        // Y movement
        if (!isSolidAt(player.x, newY)) {
            player.y = newY;
        }
    }

    // Attack cooldown
    if (player.attackCooldown > 0) player.attackCooldown -= dt;
    if (player.hitTimer > 0) player.hitTimer -= dt;

    // Update zombies
    updateZombies(dt);

    // Update survivors
    updateSurvivors(dt);

    // Update projectiles
    updateProjectiles(dt);

    // Update towers
    if (isNight) updateTowers(dt);

    // Spawn zombies at night
    if (isNight && Math.random() < 0.008 * (1 + dayCount * 0.3)) {
        spawnZombie();
    }

    // Hunger decay (every ~15 seconds of game time)
    if (Math.floor(gameTime) % 15 === 0 && Math.floor(gameTime) !== Math.floor(gameTime - dt)) {
        player.hunger = Math.max(0, player.hunger - 1);
        if (player.hunger <= 0) {
            player.health -= 1;
        }
    }

    // Survivor food consumption
    if (Math.floor(gameTime) % 30 === 0 && Math.floor(gameTime) !== Math.floor(gameTime - dt)) {
        const foodNeeded = Math.floor((survivors.length - 1) * 0.5);
        if (resources.food >= foodNeeded) {
            resources.food -= foodNeeded;
        }
    }

    // Check death
    if (player.health <= 0) {
        gameOver('You succumbed to the apocalypse!');
    }
}

// Variable update for animations/effects
function variableUpdate(dt) {
    // Player animation
    if (player.isMoving) {
        player.animTimer += dt * 8;
        player.frame = Math.floor(player.animTimer) % 4;
    } else {
        player.frame = 0;
        player.animTimer = 0;
    }

    // Camera smoothing
    camera.targetX = player.x * TILE_SIZE * SCALE - canvas.width / 2;
    camera.targetY = player.y * TILE_SIZE * SCALE - canvas.height / 2;
    camera.x += (camera.targetX - camera.x) * 0.1;
    camera.y += (camera.targetY - camera.y) * 0.1;

    // Update particles
    updateParticles(dt);

    // Update damage numbers
    damageNumbers = damageNumbers.filter(d => {
        d.y -= dt * 30;
        d.life -= dt;
        return d.life > 0;
    });

    // Update UI
    updateUI();
}

function updateDayNight() {
    let timeText, overlay;

    if (timeOfDay < 0.2) {
        timeText = '🌅 Dawn';
        overlay = `rgba(255,200,150,${0.15 - timeOfDay * 0.5})`;
        isNight = false;
    } else if (timeOfDay < 0.4) {
        timeText = '☀️ Morning';
        overlay = 'rgba(255,255,220,0.05)';
        isNight = false;
    } else if (timeOfDay < 0.55) {
        timeText = '🌞 Noon';
        overlay = 'rgba(255,255,200,0.03)';
        isNight = false;
    } else if (timeOfDay < 0.7) {
        timeText = '🌅 Evening';
        const t = (timeOfDay - 0.55) / 0.15;
        overlay = `rgba(255,100,50,${t * 0.2})`;
        isNight = false;
    } else if (timeOfDay < 0.75) {
        timeText = '🌙 Dusk';
        overlay = 'rgba(50,30,80,0.3)';
        isNight = true;
    } else {
        timeText = '🌑 Night';
        const nightDepth = Math.min((timeOfDay - 0.75) * 2, 0.5);
        overlay = `rgba(10,10,40,${0.4 + nightDepth})`;
        isNight = true;
    }

    document.getElementById('timeOfDay').textContent = timeText;
    document.getElementById('timeFill').style.width = (timeOfDay * 100) + '%';
    document.getElementById('dayNightOverlay').style.background = overlay;
}

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    minimapCanvas = document.getElementById('minimapCanvas');
    minimapCtx = minimapCanvas.getContext('2d');

    ctx.imageSmoothingEnabled = false;
    minimapCtx.imageSmoothingEnabled = false;

    // Resize event
    window.addEventListener('resize', resize);
    resize();

    // Keyboard events
    window.addEventListener('keydown', e => {
        if (e.repeat) return;
        keys[e.code] = true;
        handleKeyPress(e);
    });
    window.addEventListener('keyup', e => {
        keys[e.code] = false;
    });

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousemove', handleMouseMove);

    setupInventoryUI();
}

function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (ctx) ctx.imageSmoothingEnabled = false;

    // Background fill after resize to prevent flickering
    if (ctx) {
        ctx.fillStyle = '#1a2a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    gameRunning = true;

    seed = Date.now() % 100000;
    chunks.clear();

    generateStartingBase();

    survivors = [{
        id: 0, name: 'You (Leader)', role: 'Leader',
        x: player.x, y: player.y,
        health: 100, maxHealth: 100,
        isPlayer: true
    }];

    updateSurvivorList();
    lastFrameTime = performance.now();
    gameLoop(lastFrameTime);
}
