// ============= EFFECTS & ANIMATION SYSTEM =============

const EFFECTS_CONFIG = {
    PARTICLE_MAX_COUNT: 500,
    PARTICLE_MAX_SPAWN: 50,
    BASE_LIFETIME: 0.6,
    LIFETIME_VARIANCE: 0.4
};

// --- PARTICLES ---

function spawnParticles(x, y, color, count) {
    if (!particles) particles = [];

    // Limit spawned particles
    const availableSlots = EFFECTS_CONFIG.PARTICLE_MAX_COUNT - particles.length;
    const actualCount = Math.min(
        count,
        availableSlots,
        EFFECTS_CONFIG.PARTICLE_MAX_SPAWN
    );

    if (actualCount <= 0) return;

    for (let i = 0; i < actualCount; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4 - 2, // Slight upward bias
            color: color,
            life: EFFECTS_CONFIG.BASE_LIFETIME + Math.random() * EFFECTS_CONFIG.LIFETIME_VARIANCE,
            size: 2 + Math.random() * 2
        });
    }
}

function updateParticles(dt) {
    if (!Array.isArray(particles)) return;

    particles = particles.filter(p => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        return p.life > 0;
    });
}

function renderParticles(ctx, camX, camY) {
    if (!particles) return;

    particles.forEach(p => {
        const sx = p.x * TILE_SIZE * SCALE - camX;
        const sy = p.y * TILE_SIZE * SCALE - camY;
        ctx.globalAlpha = Math.min(1, p.life * 2);
        ctx.fillStyle = p.color;

        const size = p.size * SCALE;
        ctx.fillRect(sx - size / 2, sy - size / 2, size, size);
    });
    ctx.globalAlpha = 1;
}

// --- LIGHTING / DARKNESS ---

function renderDarkness(ctx, camX, camY, alpha = 1) {
    // Determine darkness intensity based on time of day
    let darkness = 0;
    // timeOfDay: 0 to 1
    // Day phases (roughly): Dawn (0.15-0.25), Night (0.75-1.0)
    if (timeOfDay > 0.70) {
        // Evening to Night
        darkness = Math.min(0.85, (timeOfDay - 0.70) * 4);
    } else if (timeOfDay < 0.30) {
        // Dawn to Morning
        darkness = Math.max(0, 0.85 - (timeOfDay / 0.30) * 0.85);
    }

    if (darkness <= 0) return;

    // Use a temp canvas to "carve" out light from a darkness overlay
    // If performance is an issue, this can be optimized further
    const tempCanvas = document.createElement('canvas'); // Optimization: Could cache this canvas
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tCtx = tempCanvas.getContext('2d');

    // 1. Fill with darkness
    tCtx.fillStyle = `rgba(5, 5, 15, ${darkness})`;
    tCtx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Prepare to cut out light
    tCtx.globalCompositeOperation = 'destination-out';

    // A. Light around Player
    // Use interpolated visual position for light source
    const pX = lerp(player.prevX ?? player.x, player.x, alpha) * TILE_SIZE * SCALE - camX;
    const pY = lerp(player.prevY ?? player.y, player.y, alpha) * TILE_SIZE * SCALE - camY;

    // Add offset for center of player visually (approximate)
    // pX, pY is the feet/center position. Light should come from body center ~ -0.5 tile height
    const lightY = pY - (TILE_SIZE * SCALE * 0.5);

    const pRadius = 100 * SCALE;

    const pGradient = tCtx.createRadialGradient(pX, lightY, 0, pX, lightY, pRadius);
    pGradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    pGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    tCtx.fillStyle = pGradient;
    tCtx.beginPath();
    tCtx.arc(pX, lightY, pRadius, 0, Math.PI * 2);
    tCtx.fill();

    // B. Light around Campfires
    const flicker = Math.sin(gameTime * 8) * 5;
    const fireRadius = (140 + flicker) * SCALE;

    buildings.forEach(b => {
        // Optimization: only process buildings on screen
        const fX = (b.x + 0.5) * TILE_SIZE * SCALE - camX;
        const fY = (b.y + 0.5) * TILE_SIZE * SCALE - camY;

        if (fX > -fireRadius && fX < canvas.width + fireRadius &&
            fY > -fireRadius && fY < canvas.height + fireRadius) {

            // Check if it's actually a campfire (could use b.type if available)
            if (getTile(b.x, b.y) === TILES.CAMPFIRE) {
                const fGradient = tCtx.createRadialGradient(fX, fY, 0, fX, fY, fireRadius);
                fGradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
                fGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                tCtx.fillStyle = fGradient;
                tCtx.beginPath();
                tCtx.arc(fX, fY, fireRadius, 0, Math.PI * 2);
                tCtx.fill();
            }
        }
    });

    // 3. Render the result back
    ctx.drawImage(tempCanvas, 0, 0);
}

// --- ANIMATION HELPERS ---

const Animation = {
    // Values for bobbing effect (walking)
    getBobY: (animTimer, speed = 2, amplitude = 1.5) => {
        return Math.sin(animTimer * speed) * amplitude;
    },

    // Values for swinging limbs
    getSwing: (animTimer, size, speed = 2, multiplier = 0.08) => {
        return Math.sin(animTimer * speed) * size * multiplier;
    }
};
