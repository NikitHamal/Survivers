// ============= GAME LOOP CONFIGURATION =============
const LOOP_CONFIG = {
    MAX_DT: 0.1,                    // Maximum delta time (100ms)
    FIXED_DT: 1 / 60,               // Fixed timestep (60 Hz)
    MAX_FIXED_STEPS: 10,            // Maximum fixed updates per frame (increased to handle MAX_DT)
    TARGET_FPS: 60,

    // Camera
    CAMERA_SMOOTH_SPEED: 8,         // Camera interpolation speed
    CAMERA_SHAKE_DECAY: 10,         // Shake decay rate per second
    CAMERA_SHAKE_MIN: 0.01,         // Minimum shake before zeroing

    // Time events (in seconds)
    HUNGER_INTERVAL: 15,
    SURVIVOR_FOOD_INTERVAL: 30,
    CHUNK_CLEANUP_INTERVAL: 10,

    // Spawning
    ZOMBIE_SPAWN_BASE_RATE: 0.5,    // Base spawns per second at night
    ZOMBIE_SPAWN_DAY_MULT: 0.3,     // Additional rate multiplier per day
};

// Timing state
let timing = {
    lastFrameTime: 0,
    accumulator: 0,
    gameTime: 0,
    frameCount: 0,
    fpsTimer: 0,
    fps: 0,
    lastVisibilityTime: 0
};

// Time-based event accumulators
let eventTimers = {
    hunger: 0,
    survivorFood: 0,
    chunkCleanup: 0,
    zombieSpawn: 0
};

// Input state with cleanup tracking
let inputState = {
    keys: {},
    keysPressedThisFrame: new Set(),
    keysReleasedThisFrame: new Set()
};

// Animation frame ID for cancellation
let animationFrameId = null;

// Event listener references for cleanup
let eventListeners = [];

// ============= MAIN GAME LOOP =============
function gameLoop(currentTime) {
    if (!gameState.running) {
        animationFrameId = null;
        return;
    }

    try {
        // Calculate delta time
        let dt = (currentTime - timing.lastFrameTime) / 1000;
        timing.lastFrameTime = currentTime;

        // Handle tab visibility (large dt from being inactive)
        if (dt > LOOP_CONFIG.MAX_DT) {
            // Cap dt and don't try to simulate missed time
            dt = LOOP_CONFIG.MAX_DT;
            console.debug('Frame skip detected, capping dt');
        }

        // Validate dt
        if (!Number.isFinite(dt) || dt <= 0) {
            dt = LOOP_CONFIG.FIXED_DT;
        }

        // Update FPS counter
        updateFPSCounter(dt);

        if (!gameState.paused) {
            // Fixed timestep physics with spiral prevention
            timing.accumulator += dt;
            let steps = 0;

            while (timing.accumulator >= LOOP_CONFIG.FIXED_DT && steps < LOOP_CONFIG.MAX_FIXED_STEPS) {
                // Store previous positions for interpolation
                storePreviousPositions();

                fixedUpdate(LOOP_CONFIG.FIXED_DT);
                timing.accumulator -= LOOP_CONFIG.FIXED_DT;
                steps++;
            }

            // If we hit max steps, discard remaining accumulator to prevent spiral
            if (steps >= LOOP_CONFIG.MAX_FIXED_STEPS && timing.accumulator > LOOP_CONFIG.FIXED_DT) {
                console.warn(`Physics spiral detected, discarding ${timing.accumulator.toFixed(3)}s`);
                timing.accumulator = 0;
            }

            // Variable update for rendering/animations
            variableUpdate(dt);
        }

        // Always render (even when paused for UI responsiveness)
        // Pass interpolation factor (0.0 to 1.0)
        const alpha = timing.accumulator / LOOP_CONFIG.FIXED_DT;
        render(alpha);

        // Clear per-frame input state
        inputState.keysPressedThisFrame.clear();
        inputState.keysReleasedThisFrame.clear();

    } catch (error) {
        console.error('Game loop error:', error);
        handleGameError(error);
    }

    // Schedule next frame
    animationFrameId = requestAnimationFrame(gameLoop);
}

function updateFPSCounter(dt) {
    timing.frameCount++;
    timing.fpsTimer += dt;

    if (timing.fpsTimer >= 1) {
        timing.fps = timing.frameCount;
        timing.frameCount = 0;
        timing.fpsTimer -= 1; // Subtract instead of reset to preserve accuracy

        const fpsElement = document.getElementById('fpsCounter');
        if (fpsElement) {
            fpsElement.textContent = `FPS: ${timing.fps}`;
        }
    }
}

function storePreviousPositions() {
    if (player) {
        player.prevX = player.x;
        player.prevY = player.y;
    }

    survivors.forEach(s => {
        s.prevX = s.x;
        s.prevY = s.y;
    });

    zombies.forEach(z => {
        z.prevX = z.x;
        z.prevY = z.y;
    });
}

// ============= FIXED UPDATE (PHYSICS) =============
function fixedUpdate(dt) {
    timing.gameTime += dt;

    // Update time of day
    updateTimeOfDay(dt);

    // Update day/night visuals
    updateDayNight();

    // Player movement and actions
    updatePlayerMovement(dt);
    updatePlayerCooldowns(dt);

    // Entity updates
    updateZombies(dt);
    updateSurvivors(dt);
    updateProjectiles(dt);

    // New Systems Update
    if (typeof WeatherSystem !== 'undefined') WeatherSystem.update(dt);
    if (typeof BiomeSystem !== 'undefined') BiomeSystem.update(dt);
    if (typeof BossSystem !== 'undefined') BossSystem.update(dt);
    if (typeof HordeSystem !== 'undefined') HordeSystem.update(dt);
    if (typeof MoraleSystem !== 'undefined') MoraleSystem.update(dt);
    if (typeof EventSystem !== 'undefined') EventSystem.update(dt);
    if (typeof SkillSystem !== 'undefined') SkillSystem.updateAbilityCooldowns(dt);
    if (typeof BuildingUpgradeSystem !== 'undefined') BuildingUpgradeSystem.update(dt);
    if (typeof CraftingSystem !== 'undefined') CraftingSystem.updateCrafting(dt);
    if (typeof EquipmentSystem !== 'undefined') EquipmentSystem.updateBuffs(dt);

    // Tower updates (always check, let tower system decide based on night)
    updateTowers(dt);

    // Zombie spawning (time-based, not random per frame)
    updateZombieSpawning(dt);

    // Periodic events using accumulators
    updatePeriodicEvents(dt);

    // Check player death
    checkPlayerDeath();
}

function updateTimeOfDay(dt) {
    const previousTimeOfDay = timeOfDay;

    timeOfDay += dt / (DAY_LENGTH / 1000);

    if (timeOfDay >= 1) {
        timeOfDay -= 1; // Wrap around preserving fraction
        dayCount++;

        onNewDay();
    }
}

function onNewDay() {
    showNotification(
        `<i class="material-icons">wb_sunny</i> Day ${dayCount} begins!`,
        [{ text: 'OK', action: () => { } }]
    );

    // Could add other new day events here
    // e.g., survivor morale boost, resource generation, etc.
}

function updatePlayerMovement(dt) {
    if (!player) return;

    let moveX = 0;
    let moveY = 0;
    let usingKeyboard = false;

    // Check movement keys
    if (isKeyDown('KeyW') || isKeyDown('ArrowUp')) { moveY = -1; usingKeyboard = true; }
    if (isKeyDown('KeyS') || isKeyDown('ArrowDown')) { moveY = 1; usingKeyboard = true; }
    if (isKeyDown('KeyA') || isKeyDown('ArrowLeft')) { moveX = -1; usingKeyboard = true; }
    if (isKeyDown('KeyD') || isKeyDown('ArrowRight')) { moveX = 1; usingKeyboard = true; }

    // Keyboard input cancels click-to-move path
    if (usingKeyboard && player.path) {
        cancelPlayerPath();
    }

    // If not using keyboard, follow click-to-move path
    if (!usingKeyboard && player.path && player.path.length > 0) {
        // CRITICAL FIX: Loop to handle reaching multiple waypoints in one frame
        // and immediately start moving to the next one
        while (player.pathIndex < player.path.length) {
            const node = player.path[player.pathIndex];
            const dx = node.x - player.x;
            const dy = node.y - player.y;
            const distToNode = Math.sqrt(dx * dx + dy * dy);

            if (distToNode < PATHFINDING_CONFIG.NODE_REACH_THRESHOLD) {
                // Reached this node, advance to next
                player.pathIndex++;

                // Check if we've completed the path
                if (player.pathIndex >= player.path.length) {
                    cancelPlayerPath();
                    break;
                }
                // Continue loop to get direction to next node immediately
            } else {
                // Not at node yet - set movement direction
                moveX = dx / distToNode;
                moveY = dy / distToNode;
                break;
            }
        }
    }

    // Normalize diagonal movement (for keyboard only)
    if (usingKeyboard && moveX !== 0 && moveY !== 0) {
        const invSqrt2 = 1 / Math.sqrt(2);
        moveX *= invSqrt2;
        moveY *= invSqrt2;
    }

    player.isMoving = (moveX !== 0 || moveY !== 0);

    if (player.isMoving) {
        // Update facing direction
        updatePlayerDirection(moveX, moveY);

        // Calculate movement
        const speed = (player.speed || 4.5) * dt;
        const newX = player.x + moveX * speed;
        const newY = player.y + moveY * speed;

        // Smaller collision radius allows passing through 1-tile gaps
        const PLAYER_RADIUS = 0.25;

        // Try full movement first
        let movedX = false;
        let movedY = false;

        // Apply X movement with collision
        if (!isSolidAt(newX, player.y, PLAYER_RADIUS)) {
            player.x = newX;
            movedX = true;
        } else {
            // Try sliding with reduced speed
            const slideX = player.x + moveX * speed * 0.5;
            if (!isSolidAt(slideX, player.y, PLAYER_RADIUS)) {
                player.x = slideX;
                movedX = true;
            }
        }

        // Apply Y movement with collision
        if (!isSolidAt(player.x, newY, PLAYER_RADIUS)) {
            player.y = newY;
            movedY = true;
        } else {
            // Try sliding with reduced speed
            const slideY = player.y + moveY * speed * 0.5;
            if (!isSolidAt(player.x, slideY, PLAYER_RADIUS)) {
                player.y = slideY;
                movedY = true;
            }
        }

        // CRITICAL: If completely blocked while following path, try to repath
        if (!movedX && !movedY && player.path && player.pathIndex < player.path.length) {
            player.stuckTime = (player.stuckTime || 0) + dt;

            if (player.stuckTime > 0.5) {
                // Stuck for too long, try to repath
                console.debug('Player stuck, attempting repath');
                const target = player.moveTarget;
                if (target) {
                    cancelPlayerPath();
                    // Small delay before repathing to avoid spam
                    setTimeout(() => {
                        if (!player.path && target) {
                            setPlayerMoveTarget(target.x, target.y);
                        }
                    }, 100);
                }
                player.stuckTime = 0;
            }
        } else {
            player.stuckTime = 0;
        }
    }
}

function updatePlayerDirection(moveX, moveY) {
    // 0 = right, 1 = down, 2 = left, 3 = up
    if (Math.abs(moveX) > Math.abs(moveY)) {
        player.direction = moveX > 0 ? 0 : 2;
    } else {
        player.direction = moveY > 0 ? 1 : 3;
    }
}

function updatePlayerCooldowns(dt) {
    if (!player) return;

    if (player.attackCooldown > 0) {
        player.attackCooldown = Math.max(0, player.attackCooldown - dt);
    }

    if (player.hitTimer > 0) {
        player.hitTimer = Math.max(0, player.hitTimer - dt);
    }

    // Could add other cooldowns here (dash, special abilities, etc.)
}

function updateZombieSpawning(dt) {
    if (!isNight) {
        eventTimers.zombieSpawn = 0;
        return;
    }

    // Calculate spawn rate based on day
    const currentDay = dayCount || 0;
    const spawnRate = LOOP_CONFIG.ZOMBIE_SPAWN_BASE_RATE * (1 + currentDay * LOOP_CONFIG.ZOMBIE_SPAWN_DAY_MULT);

    // Accumulate spawn time
    eventTimers.zombieSpawn += dt * spawnRate;

    // Spawn zombies based on accumulated time
    while (eventTimers.zombieSpawn >= 1) {
        eventTimers.zombieSpawn -= 1;
        spawnZombie();
    }
}

function updatePeriodicEvents(dt) {
    // Hunger decay
    eventTimers.hunger += dt;
    while (eventTimers.hunger >= LOOP_CONFIG.HUNGER_INTERVAL) {
        eventTimers.hunger -= LOOP_CONFIG.HUNGER_INTERVAL;
        processHungerDecay();
    }

    // Survivor food consumption
    eventTimers.survivorFood += dt;
    while (eventTimers.survivorFood >= LOOP_CONFIG.SURVIVOR_FOOD_INTERVAL) {
        eventTimers.survivorFood -= LOOP_CONFIG.SURVIVOR_FOOD_INTERVAL;
        processSurvivorFoodConsumption();
    }

    // Chunk cleanup
    eventTimers.chunkCleanup += dt;
    while (eventTimers.chunkCleanup >= LOOP_CONFIG.CHUNK_CLEANUP_INTERVAL) {
        eventTimers.chunkCleanup -= LOOP_CONFIG.CHUNK_CLEANUP_INTERVAL;
        cleanupChunks();
    }
}

function processHungerDecay() {
    if (!player) return;
    if (window.godMode) return; // God mode check

    player.hunger = Math.max(0, (player.hunger || 100) - 1);

    if (player.hunger <= 0) {
        player.health -= 1;

        // Visual feedback for starvation damage
        if (player.health > 0) {
            spawnParticles(player.x, player.y, '#ffaa00', 3);
            addDamageNumber(player.x, player.y - 0.5, 1, '#ffaa00');
        }
    }

    // Low hunger warning
    if (player.hunger === 10) {
        showNotification(
            `<i class="material-icons">warning</i> You're getting hungry!`,
            []
        );
    }
}

function processSurvivorFoodConsumption() {
    if (!Array.isArray(survivors)) return;

    const nonPlayerSurvivors = survivors.filter(s => !s.isPlayer).length;
    const foodNeeded = Math.floor(nonPlayerSurvivors * 0.5);

    if (foodNeeded <= 0) return;

    if (resources.food >= foodNeeded) {
        resources.food -= foodNeeded;
    } else {
        // Not enough food - survivors get unhappy/take damage
        const shortage = foodNeeded - resources.food;
        resources.food = 0;

        // Damage random survivors for food shortage
        const vulnerableSurvivors = survivors.filter(s => !s.isPlayer && s.health > 0);
        for (let i = 0; i < Math.min(shortage, vulnerableSurvivors.length); i++) {
            const idx = Math.floor(Math.random() * vulnerableSurvivors.length);
            vulnerableSurvivors[idx].health -= 5;

            if (vulnerableSurvivors[idx].health <= 0) {
                showNotification(
                    `<i class="material-icons">sentiment_very_dissatisfied</i> ${vulnerableSurvivors[idx].name} starved!`,
                    []
                );
            }
        }
    }
}

function checkPlayerDeath() {
    if (!player) return;

    if (player.health <= 0) {
        gameOver('You succumbed to the apocalypse!');
    }
}

// ============= VARIABLE UPDATE (RENDERING) =============
function variableUpdate(dt) {
    // Validate dt
    if (!Number.isFinite(dt) || dt <= 0) {
        dt = 1 / 60;
    }

    updatePlayerAnimation(dt);
    updateCamera(dt);
    updateParticles(dt);
    updateDamageNumbers(dt);
    updateUI();

    // System Specific UI Updates
    if (typeof QuestSystem !== 'undefined' && timing.frameCount % 60 === 0) {
        QuestSystem.updateQuestUI();
    }
    if (typeof AchievementSystem !== 'undefined' && timing.frameCount % 300 === 0) {
        // Achievements check periodically
        AchievementSystem.checkAchievements();
    }
}

function updatePlayerAnimation(dt) {
    if (!player) return;

    if (player.isMoving) {
        player.animTimer = (player.animTimer || 0) + dt * 8;
        player.frame = Math.floor(player.animTimer) % 4;
    } else {
        player.frame = 0;
        player.animTimer = 0;
    }
}

function updateCamera(dt) {
    if (!camera || !player) return;

    const tileScale = (TILE_SIZE || 16) * (SCALE || 2);

    // Calculate target position (centered on player)
    camera.targetX = player.x * tileScale - canvas.width / 2;
    camera.targetY = player.y * tileScale - canvas.height / 2;

    // Smooth camera movement (frame-rate independent exponential smoothing)
    const smoothFactor = 1 - Math.exp(-LOOP_CONFIG.CAMERA_SMOOTH_SPEED * dt);
    camera.x += (camera.targetX - camera.x) * smoothFactor;
    camera.y += (camera.targetY - camera.y) * smoothFactor;

    // Decay screen shake (frame-rate independent)
    if (camera.shake > LOOP_CONFIG.CAMERA_SHAKE_MIN) {
        camera.shake *= Math.exp(-LOOP_CONFIG.CAMERA_SHAKE_DECAY * dt);

        if (camera.shake < LOOP_CONFIG.CAMERA_SHAKE_MIN) {
            camera.shake = 0;
        }
    }
}

function updateDamageNumbers(dt) {
    if (!Array.isArray(damageNumbers)) return;

    // Update in place to avoid array allocation
    let writeIndex = 0;
    for (let i = 0; i < damageNumbers.length; i++) {
        const d = damageNumbers[i];
        d.y -= dt * 30;
        d.life -= dt;

        if (d.life > 0) {
            damageNumbers[writeIndex++] = d;
        }
    }
    damageNumbers.length = writeIndex;
}

// ============= DAY/NIGHT SYSTEM =============
const DAY_PHASES = [
    { maxTime: 0.20, name: '🌅 Dawn', night: false, getOverlay: t => `rgba(255,200,150,${0.15 * (1 - t / 0.2)})` },
    { maxTime: 0.40, name: '☀️ Morning', night: false, getOverlay: t => 'rgba(255,255,220,0.05)' },
    { maxTime: 0.55, name: '🌞 Noon', night: false, getOverlay: t => 'rgba(255,255,200,0.03)' },
    { maxTime: 0.70, name: '🌅 Evening', night: false, getOverlay: t => `rgba(255,100,50,${((t - 0.55) / 0.15) * 0.2})` },
    { maxTime: 0.75, name: '🌙 Dusk', night: true, getOverlay: t => 'rgba(50,30,80,0.3)' },
    { maxTime: 1.00, name: '🌑 Night', night: true, getOverlay: t => `rgba(10,10,40,${0.4 + Math.min((t - 0.75) * 2, 0.5)})` }
];

function updateDayNight() {
    let phase = DAY_PHASES[DAY_PHASES.length - 1]; // Default to last phase

    for (const p of DAY_PHASES) {
        if (timeOfDay < p.maxTime) {
            phase = p;
            break;
        }
    }

    isNight = phase.night;

    // Update UI elements (with null checks)
    const timeElement = document.getElementById('timeOfDay');
    if (timeElement) {
        timeElement.textContent = phase.name;
    }

    const timeFill = document.getElementById('timeFill');
    if (timeFill) {
        timeFill.style.width = `${timeOfDay * 100}%`;
    }

    const overlay = document.getElementById('dayNightOverlay');
    if (overlay) {
        overlay.style.background = phase.getOverlay(timeOfDay);
    }
}

// ============= INPUT HANDLING =============
function isKeyDown(code) {
    return inputState.keys[code] === true;
}

function wasKeyPressed(code) {
    return inputState.keysPressedThisFrame.has(code);
}

function wasKeyReleased(code) {
    return inputState.keysReleasedThisFrame.has(code);
}

function handleKeyDown(e) {
    if (e.repeat) return;

    inputState.keys[e.code] = true;
    inputState.keysPressedThisFrame.add(e.code);

    handleKeyPress(e);
}

function handleKeyUp(e) {
    inputState.keys[e.code] = false;
    inputState.keysReleasedThisFrame.add(e.code);
}

function clearAllInput() {
    inputState.keys = {};
    inputState.keysPressedThisFrame.clear();
    inputState.keysReleasedThisFrame.clear();
}

// ============= VISIBILITY HANDLING =============
function handleVisibilityChange() {
    if (document.hidden) {
        // Tab became hidden
        timing.lastVisibilityTime = performance.now();

        // Optionally pause the game
        // gameState.paused = true;
    } else {
        // Tab became visible
        const hiddenDuration = performance.now() - timing.lastVisibilityTime;

        if (hiddenDuration > 1000) {
            // Reset timing to prevent huge dt
            timing.lastFrameTime = performance.now();
            timing.accumulator = 0;

            console.debug(`Tab was hidden for ${(hiddenDuration / 1000).toFixed(1)}s, resetting timing`);
        }

        // Clear any stuck keys
        clearAllInput();
    }
}

// ============= INITIALIZATION =============
function init() {
    // Prevent double initialization
    if (gameState.initialized) {
        console.warn('Game already initialized');
        return;
    }

    // Get canvas elements
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Game canvas not found');
        return;
    }

    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Failed to get 2D context');
        return;
    }

    // Minimap (optional)
    minimapCanvas = document.getElementById('minimapCanvas');
    if (minimapCanvas) {
        minimapCtx = minimapCanvas.getContext('2d');

        minimapCacheCanvas = document.createElement('canvas');
        minimapCacheCanvas.width = 200;
        minimapCacheCanvas.height = 200;
        minimapCacheCtx = minimapCacheCanvas.getContext('2d');

        if (minimapCtx) {
            minimapCtx.imageSmoothingEnabled = false;
        }
    }

    // Disable image smoothing for pixel art
    ctx.imageSmoothingEnabled = false;

    // Add event listeners with tracking for cleanup
    addEventListenerTracked(window, 'resize', resize);
    addEventListenerTracked(window, 'keydown', handleKeyDown);
    addEventListenerTracked(window, 'keyup', handleKeyUp);
    addEventListenerTracked(document, 'visibilitychange', handleVisibilityChange);
    addEventListenerTracked(canvas, 'click', handleClick);
    addEventListenerTracked(canvas, 'mousemove', handleMouseMove);

    // Right-click for move-to command
    addEventListenerTracked(canvas, 'contextmenu', handleRightClick);

    // Handle window blur (alt-tab, etc.)
    addEventListenerTracked(window, 'blur', clearAllInput);

    // Initial resize
    resize();

    // Setup UI
    if (typeof setupInventoryUI === 'function') {
        setupInventoryUI();
    }

    gameState.initialized = true;
    console.log('Game initialized');
}

function addEventListenerTracked(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    eventListeners.push({ target, event, handler, options });
}

function removeAllEventListeners() {
    for (const { target, event, handler, options } of eventListeners) {
        target.removeEventListener(event, handler, options);
    }
    eventListeners = [];
}

function resize() {
    if (!canvas) return;

    // Get device pixel ratio for high DPI support
    const dpr = window.devicePixelRatio || 1;

    // Set display size
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    // Set actual size in memory (scaled for DPI)
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    // Scale canvas CSS to fit display
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';

    // Scale context to match DPI
    if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = false;

        // Fill background to prevent flickering
        ctx.fillStyle = '#1a2a1a';
        ctx.fillRect(0, 0, displayWidth, displayHeight);
    }

    // Store dimensions for rendering
    if (!canvas._displaySize) canvas._displaySize = {};
    canvas._displaySize.width = displayWidth;
    canvas._displaySize.height = displayHeight;
    canvas._displaySize.dpr = dpr;
}

// ============= GAME START/STOP =============
function startGame() {
    const startScreen = document.getElementById('startScreen');
    if (startScreen) {
        startScreen.style.display = 'none';
    }

    // Reset game state
    resetGameState();

    // Generate world
    seed = Date.now() % 100000;
    chunks.clear();
    generateStartingBase();

    // Initialize player survivor entry
    survivors = [{
        id: 0,
        name: 'You (Leader)',
        role: 'Leader',
        x: player.x,
        y: player.y,
        health: player.maxHealth,
        maxHealth: player.maxHealth,
        isPlayer: true
    }];

    // Update UI
    if (typeof updateSurvivorList === 'function') {
        updateSurvivorList();
    }

    // Start game loop
    gameState.running = true;
    gameState.paused = false;
    timing.lastFrameTime = performance.now();
    timing.accumulator = 0;

    animationFrameId = requestAnimationFrame(gameLoop);

    console.log('Game started');
}

function resetGameState() {
    // Reset timing
    timing.gameTime = 0;
    timing.frameCount = 0;
    timing.fpsTimer = 0;
    timing.fps = 0;
    timing.accumulator = 0;

    // Reset event timers
    eventTimers.hunger = 0;
    eventTimers.survivorFood = 0;
    eventTimers.chunkCleanup = 0;
    eventTimers.zombieSpawn = 0;

    // Reset player
    if (player) {
        player.x = 0;
        player.y = 0;
        player.prevX = 0;
        player.prevY = 0;
        player.health = player.maxHealth || 100;
        player.hunger = 100;
        player.exp = 0;
        player.level = 1;
        player.expToLevel = 100;
        player.attackCooldown = 0;
        player.hitTimer = 0;
        player.direction = 0;
        player.frame = 0;
        player.animTimer = 0;
        player.isMoving = false;
    }

    // Reset resources
    if (resources) {
        resources.wood = 20;
        resources.stone = 10;
        resources.food = 10;
        resources.iron = 0;
    }

    // Reset day/night
    timeOfDay = 0.25; // Start in morning
    dayCount = 1;
    isNight = false;

    // Clear entities
    zombies = [];
    projectiles = [];
    particles = [];
    damageNumbers = [];
    buildings = [];
    if (typeof activeTowers !== 'undefined') activeTowers.clear();

    // Clear input
    clearAllInput();

    // Reset camera
    if (camera) {
        camera.x = 0;
        camera.y = 0;
        camera.targetX = 0;
        camera.targetY = 0;
        camera.shake = 0;
    }
}

function stopGame() {
    gameState.running = false;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function pauseGame() {
    gameState.paused = true;
}

function resumeGame() {
    gameState.paused = false;
    // Reset timing to prevent jump
    timing.lastFrameTime = performance.now();
    timing.accumulator = 0;
}

function togglePause() {
    if (gameState.paused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

// ============= ERROR HANDLING =============
function handleGameError(error) {
    console.error('Game error:', error);

    // Attempt recovery
    try {
        // Reset timing to prevent spiral
        timing.accumulator = 0;
        timing.lastFrameTime = performance.now();

        // Clear potentially corrupted state
        particles = particles?.slice(0, 100) || [];
        projectiles = projectiles?.slice(0, 50) || [];
        damageNumbers = damageNumbers?.slice(0, 20) || [];

    } catch (recoveryError) {
        console.error('Recovery failed:', recoveryError);

        // Last resort - stop the game
        stopGame();

        showNotification(
            `<i class="material-icons">error</i> An error occurred. Please refresh.`,
            [{ text: 'Refresh', action: () => location.reload() }]
        );
    }
}

function gameOver(reason) {
    gameState.running = false;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // Show game over screen
    const gameOverEl = document.getElementById('gameOver');
    if (gameOverEl) {
        document.getElementById('deathReason').textContent = reason;
        document.getElementById('finalDays').textContent = dayCount;
        gameOverEl.style.display = 'flex';
    } else {
        // Fallback
        showNotification(`Game Over: ${reason}. You survived ${dayCount} days.`, [
            { text: 'Try Again', action: () => location.reload() }
        ]);
    }
}

// ============= UTILITY =============
function getGameTime() {
    return timing.gameTime;
}

function getFPS() {
    return timing.fps;
}

function isGameRunning() {
    return gameState.running && !gameState.paused;
}

function isGamePaused() {
    return gameState.paused;
}

// ============= CLEANUP =============
function cleanup() {
    stopGame();
    removeAllEventListeners();
    clearAllInput();
    gameState.initialized = false;
    console.log('Game cleaned up');
}

// Handle page unload
window.addEventListener('beforeunload', cleanup);