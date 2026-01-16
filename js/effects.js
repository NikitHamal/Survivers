// ============= ENHANCED EFFECTS & ANIMATION SYSTEM =============

const EFFECTS_CONFIG = {
    PARTICLE_MAX_COUNT: 500,
    PARTICLE_MAX_SPAWN: 50,
    BASE_LIFETIME: 0.6,
    LIFETIME_VARIANCE: 0.4,

    // New effect settings
    DAMAGE_NUMBER_LIFETIME: 1.2,
    DAMAGE_NUMBER_RISE_SPEED: 60,
    SCREEN_FLASH_DECAY: 3.0,
    WEATHER_PARTICLE_MAX: 200
};

// Color palettes for effects
const EFFECT_COLORS = {
    blood: ['#cc2222', '#aa1111', '#881111', '#661111'],
    heal: ['#44ff44', '#22dd22', '#00bb00', '#009900'],
    fire: ['#ff4400', '#ff8800', '#ffcc00', '#ffff88'],
    ice: ['#88ddff', '#44bbff', '#2299dd', '#ffffff'],
    electric: ['#ffff44', '#ffff88', '#ffffcc', '#ffffff'],
    poison: ['#88ff44', '#44dd22', '#22aa00', '#448822'],
    magic: ['#cc44ff', '#aa22dd', '#8800bb', '#ff88ff'],
    wood: ['#8b6914', '#6b4f0f', '#4a3a2a', '#3a2a1a'],
    stone: ['#888888', '#666666', '#444444', '#aaaaaa'],
    water: ['#4488ff', '#2266dd', '#1144aa', '#88bbff'],
    dust: ['#aa9977', '#887755', '#665544', '#ccbb99'],
    spark: ['#ffff88', '#ffdd44', '#ffaa00', '#ffffff'],
    smoke: ['#444444', '#555555', '#666666', '#333333'],
    leaf: ['#44aa44', '#228822', '#116611', '#66cc66']
};

// --- ENHANCED PARTICLES ---

let screenFlash = { active: false, color: '#ffffff', alpha: 0 };
let weatherParticles = [];
let currentWeather = 'none'; // 'none', 'rain', 'snow', 'fog', 'storm'

// Particle types with different behaviors
const PARTICLE_TYPES = {
    default: {
        gravity: 0,
        friction: 0.98,
        fadeSpeed: 1,
        shrink: true
    },
    blood: {
        gravity: 8,
        friction: 0.95,
        fadeSpeed: 1.2,
        shrink: true,
        bounce: 0.3
    },
    fire: {
        gravity: -3,
        friction: 0.96,
        fadeSpeed: 1.5,
        shrink: true,
        flicker: true
    },
    smoke: {
        gravity: -1,
        friction: 0.99,
        fadeSpeed: 0.8,
        shrink: false,
        grow: true
    },
    spark: {
        gravity: 2,
        friction: 0.92,
        fadeSpeed: 2,
        shrink: true,
        trail: true
    },
    dust: {
        gravity: 0.5,
        friction: 0.97,
        fadeSpeed: 0.6,
        shrink: false
    },
    leaf: {
        gravity: 1,
        friction: 0.99,
        fadeSpeed: 0.5,
        shrink: false,
        sway: true
    },
    magic: {
        gravity: -0.5,
        friction: 0.98,
        fadeSpeed: 1,
        shrink: true,
        orbit: true
    },
    bubble: {
        gravity: -2,
        friction: 0.99,
        fadeSpeed: 0.8,
        shrink: false,
        wobble: true
    }
};

function spawnParticles(x, y, color, count, type = 'default', options = {}) {
    if (!particles) particles = [];

    const availableSlots = EFFECTS_CONFIG.PARTICLE_MAX_COUNT - particles.length;
    const actualCount = Math.min(count, availableSlots, EFFECTS_CONFIG.PARTICLE_MAX_SPAWN);

    if (actualCount <= 0) return;

    const particleType = PARTICLE_TYPES[type] || PARTICLE_TYPES.default;
    const colors = EFFECT_COLORS[color] || [color];

    for (let i = 0; i < actualCount; i++) {
        const angle = options.angle !== undefined ?
            options.angle + (Math.random() - 0.5) * (options.spread || 0.5) :
            Math.random() * Math.PI * 2;

        const speed = options.speed !== undefined ?
            options.speed * (0.5 + Math.random() * 0.5) :
            2 + Math.random() * 3;

        particles.push({
            x: x + (options.offsetX || 0) + (Math.random() - 0.5) * (options.spreadX || 0),
            y: y + (options.offsetY || 0) + (Math.random() - 0.5) * (options.spreadY || 0),
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - (options.upward ? 2 : 0),
            color: colors[Math.floor(Math.random() * colors.length)],
            life: EFFECTS_CONFIG.BASE_LIFETIME + Math.random() * EFFECTS_CONFIG.LIFETIME_VARIANCE,
            maxLife: EFFECTS_CONFIG.BASE_LIFETIME + EFFECTS_CONFIG.LIFETIME_VARIANCE,
            size: (options.size || 2) + Math.random() * (options.sizeVariance || 2),
            originalSize: (options.size || 2) + Math.random() * (options.sizeVariance || 2),
            type: type,
            config: particleType,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 5,
            phase: Math.random() * Math.PI * 2, // For oscillating effects
            trail: particleType.trail ? [] : null
        });
    }
}

// Specialized spawn functions for common effects
function spawnBloodEffect(x, y, count = 8) {
    spawnParticles(x, y, 'blood', count, 'blood', {
        speed: 4,
        upward: true,
        sizeVariance: 1.5
    });
}

function spawnHitEffect(x, y, color = '#ffffff') {
    // Impact flash
    spawnParticles(x, y, null, 6, 'spark', {
        speed: 5,
        size: 1.5,
        sizeVariance: 1
    });
    particles.slice(-6).forEach(p => p.color = color);

    // Dust
    spawnParticles(x, y, 'dust', 4, 'dust', {
        speed: 2,
        size: 3
    });
}

function spawnFireEffect(x, y, intensity = 1) {
    const count = Math.floor(3 * intensity);
    spawnParticles(x, y, 'fire', count, 'fire', {
        speed: 2,
        upward: true,
        size: 2,
        sizeVariance: 2,
        spreadX: 0.3,
        spreadY: 0.1
    });

    // Occasional smoke
    if (Math.random() < 0.3 * intensity) {
        spawnParticles(x, y - 0.3, 'smoke', 1, 'smoke', {
            speed: 0.5,
            size: 3,
            sizeVariance: 2
        });
    }

    // Sparks
    if (Math.random() < 0.2 * intensity) {
        spawnParticles(x, y, 'spark', 1, 'spark', {
            speed: 4,
            upward: true,
            size: 1
        });
    }
}

function spawnExplosionEffect(x, y, radius = 1, color = 'fire') {
    // Core flash
    triggerScreenFlash('#ffffff', 0.3);

    // Main explosion particles
    spawnParticles(x, y, color, 20, 'spark', {
        speed: 6 * radius,
        size: 3,
        sizeVariance: 2
    });

    // Smoke ring
    spawnParticles(x, y, 'smoke', 12, 'smoke', {
        speed: 3 * radius,
        size: 4,
        sizeVariance: 3
    });

    // Debris
    spawnParticles(x, y, 'dust', 8, 'blood', {
        speed: 5 * radius,
        size: 2
    });
}

function spawnHealEffect(x, y) {
    // Rising sparkles
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            spawnParticles(x + (Math.random() - 0.5) * 0.5, y, 'heal', 1, 'magic', {
                speed: 1.5,
                upward: true,
                size: 2
            });
        }, i * 50);
    }

    // Plus signs (using special spawn)
    spawnParticles(x, y - 0.3, null, 1, 'magic', {
        speed: 0.5,
        upward: true,
        size: 4
    });
    particles[particles.length - 1].isPlus = true;
    particles[particles.length - 1].color = '#44ff44';
}

function spawnBuildEffect(x, y) {
    // Dust cloud
    spawnParticles(x + 0.5, y + 0.8, 'dust', 8, 'dust', {
        speed: 2,
        size: 3,
        spreadX: 0.5,
        spreadY: 0.2
    });

    // Wood chips
    spawnParticles(x + 0.5, y + 0.5, 'wood', 5, 'blood', {
        speed: 3,
        size: 2,
        upward: true
    });
}

function spawnDestroyEffect(x, y, material = 'stone') {
    const colors = material === 'wood' ? 'wood' :
        material === 'stone' ? 'stone' : 'dust';

    // Debris
    spawnParticles(x + 0.5, y + 0.5, colors, 15, 'blood', {
        speed: 5,
        size: 3,
        sizeVariance: 2
    });

    // Dust cloud
    spawnParticles(x + 0.5, y + 0.5, 'dust', 10, 'smoke', {
        speed: 2,
        size: 4
    });

    triggerScreenFlash('#ffffff', 0.15);
}

function spawnWaterSplash(x, y) {
    // Water droplets
    spawnParticles(x, y, 'water', 10, 'blood', {
        speed: 4,
        upward: true,
        size: 2
    });

    // Bubbles
    spawnParticles(x, y, null, 5, 'bubble', {
        speed: 1,
        size: 2,
        sizeVariance: 1
    });
    particles.slice(-5).forEach(p => p.color = '#88ddff');
}

function spawnLeafEffect(x, y, count = 5) {
    spawnParticles(x, y, 'leaf', count, 'leaf', {
        speed: 2,
        size: 3,
        spreadX: 0.5,
        spreadY: 0.3
    });
}

function updateParticles(dt) {
    if (!Array.isArray(particles)) return;

    particles = particles.filter(p => {
        const config = p.config || PARTICLE_TYPES.default;

        // Apply gravity
        p.vy += (config.gravity || 0) * dt;

        // Apply friction
        p.vx *= config.friction || 0.98;
        p.vy *= config.friction || 0.98;

        // Special behaviors
        if (config.sway) {
            p.vx += Math.sin(p.phase + gameTime * 3) * dt * 2;
            p.phase += dt;
        }

        if (config.wobble) {
            p.vx += Math.sin(p.phase + gameTime * 5) * dt * 3;
            p.phase += dt * 2;
        }

        if (config.orbit) {
            const orbitSpeed = 3;
            p.vx += Math.cos(p.phase + gameTime * orbitSpeed) * dt;
            p.vy += Math.sin(p.phase + gameTime * orbitSpeed) * dt;
        }

        // Update position
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Update trail
        if (p.trail) {
            p.trail.unshift({ x: p.x, y: p.y });
            if (p.trail.length > 5) p.trail.pop();
        }

        // Rotation
        p.rotation += (p.rotationSpeed || 0) * dt;

        // Life and size
        p.life -= dt * (config.fadeSpeed || 1);

        if (config.shrink) {
            p.size = p.originalSize * (p.life / p.maxLife);
        }

        if (config.grow) {
            p.size = p.originalSize * (1 + (1 - p.life / p.maxLife) * 0.5);
        }

        // Bounce off ground (simplified)
        if (config.bounce && p.vy > 0 && p.y > 0) {
            // Simplified ground check
            p.vy *= -config.bounce;
            p.vx *= 0.8;
        }

        return p.life > 0;
    });
}

function renderParticles(ctx, camX, camY) {
    if (!particles || particles.length === 0) return;

    particles.forEach(p => {
        const sx = p.x * TILE_SIZE * SCALE - camX;
        const sy = p.y * TILE_SIZE * SCALE - camY;

        // Skip if off screen
        if (sx < -50 || sx > canvas.width + 50 || sy < -50 || sy > canvas.height + 50) return;

        const lifeRatio = p.life / p.maxLife;
        ctx.globalAlpha = Math.min(1, lifeRatio * 2);

        // Render trail first
        if (p.trail && p.trail.length > 0) {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size * SCALE * 0.5;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            p.trail.forEach((t, i) => {
                const tx = t.x * TILE_SIZE * SCALE - camX;
                const ty = t.y * TILE_SIZE * SCALE - camY;
                ctx.globalAlpha = (1 - i / p.trail.length) * lifeRatio;
                ctx.lineTo(tx, ty);
            });
            ctx.stroke();
            ctx.globalAlpha = Math.min(1, lifeRatio * 2);
        }

        const size = Math.max(1, p.size * SCALE);

        // Special rendering for plus signs (heal effect)
        if (p.isPlus) {
            ctx.fillStyle = p.color;
            const plusSize = size * 0.8;
            ctx.fillRect(sx - plusSize / 2, sy - plusSize / 6, plusSize, plusSize / 3);
            ctx.fillRect(sx - plusSize / 6, sy - plusSize / 2, plusSize / 3, plusSize);
            return;
        }

        // Flicker effect for fire
        if (p.config && p.config.flicker) {
            ctx.globalAlpha *= 0.7 + Math.sin(gameTime * 20 + p.phase) * 0.3;
        }

        ctx.fillStyle = p.color;

        // Different shapes based on particle type
        if (p.type === 'leaf') {
            // Leaf shape (rotated ellipse)
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(p.rotation);
            ctx.beginPath();
            ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else if (p.type === 'spark') {
            // Diamond/star shape
            ctx.beginPath();
            ctx.moveTo(sx, sy - size);
            ctx.lineTo(sx + size * 0.5, sy);
            ctx.lineTo(sx, sy + size);
            ctx.lineTo(sx - size * 0.5, sy);
            ctx.closePath();
            ctx.fill();
        } else if (p.type === 'bubble') {
            // Circle with highlight
            ctx.beginPath();
            ctx.arc(sx, sy, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(sx - size * 0.3, sy - size * 0.3, size * 0.3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Default square (pixel style)
            ctx.fillRect(
                Math.floor(sx - size / 2),
                Math.floor(sy - size / 2),
                Math.ceil(size),
                Math.ceil(size)
            );
        }
    });

    ctx.globalAlpha = 1;
}

// --- DAMAGE NUMBERS ---

function spawnDamageNumber(x, y, amount, type = 'damage') {
    if (!damageNumbers) damageNumbers = [];

    const colors = {
        damage: { fill: '#ff4444', stroke: '#880000' },
        heal: { fill: '#44ff44', stroke: '#008800' },
        crit: { fill: '#ffff00', stroke: '#ff8800' },
        miss: { fill: '#888888', stroke: '#444444' },
        xp: { fill: '#88ffff', stroke: '#4488aa' },
        gold: { fill: '#ffdd44', stroke: '#aa8800' }
    };

    const colorSet = colors[type] || colors.damage;

    damageNumbers.push({
        x: x,
        y: y,
        amount: type === 'miss' ? 'MISS' : (type === 'crit' ? amount + '!' : amount.toString()),
        life: EFFECTS_CONFIG.DAMAGE_NUMBER_LIFETIME,
        maxLife: EFFECTS_CONFIG.DAMAGE_NUMBER_LIFETIME,
        vx: (Math.random() - 0.5) * 30,
        vy: -EFFECTS_CONFIG.DAMAGE_NUMBER_RISE_SPEED,
        color: colorSet.fill,
        strokeColor: colorSet.stroke,
        type: type,
        scale: type === 'crit' ? 1.5 : 1
    });
}

function updateDamageNumbers(dt) {
    if (!Array.isArray(damageNumbers)) return;

    damageNumbers = damageNumbers.filter(dn => {
        dn.x += dn.vx * dt;
        dn.y += dn.vy * dt;
        dn.vy += 80 * dt; // Gravity on text
        dn.vx *= 0.98; // Friction
        dn.life -= dt;
        return dn.life > 0;
    });
}

function renderDamageNumbers(ctx, camX, camY) {
    if (!damageNumbers || damageNumbers.length === 0) return;

    damageNumbers.forEach(dn => {
        const sx = dn.x * TILE_SIZE * SCALE - camX;
        const sy = dn.y * TILE_SIZE * SCALE - camY;

        const lifeRatio = dn.life / dn.maxLife;
        const alpha = Math.min(1, lifeRatio * 2);
        const scale = dn.scale * (1 + (1 - lifeRatio) * 0.3);

        const fontSize = Math.floor(14 * scale * SCALE);
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.globalAlpha = alpha;

        // Outline/stroke
        ctx.fillStyle = dn.strokeColor;
        for (let ox = -2; ox <= 2; ox++) {
            for (let oy = -2; oy <= 2; oy++) {
                if (ox !== 0 || oy !== 0) {
                    ctx.fillText(dn.amount, sx + ox, sy + oy);
                }
            }
        }

        // Main text
        ctx.fillStyle = dn.color;
        ctx.fillText(dn.amount, sx, sy);

        // Shine effect for crits
        if (dn.type === 'crit' && lifeRatio > 0.5) {
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = alpha * 0.5 * Math.sin(gameTime * 20);
            ctx.fillText(dn.amount, sx, sy);
        }
    });

    ctx.globalAlpha = 1;
}

// --- SCREEN EFFECTS ---

function triggerScreenFlash(color = '#ffffff', intensity = 0.5) {
    screenFlash = {
        active: true,
        color: color,
        alpha: intensity
    };
}

function triggerScreenShake(intensity = 5, duration = 0.2) {
    camera.shake = intensity;
    camera.shakeDuration = duration;
}

function updateScreenEffects(dt) {
    // Update screen flash
    if (screenFlash.active) {
        screenFlash.alpha -= dt * EFFECTS_CONFIG.SCREEN_FLASH_DECAY;
        if (screenFlash.alpha <= 0) {
            screenFlash.active = false;
            screenFlash.alpha = 0;
        }
    }

    // Update screen shake (if managed here)
    if (camera.shakeDuration !== undefined && camera.shakeDuration > 0) {
        camera.shakeDuration -= dt;
        if (camera.shakeDuration <= 0) {
            camera.shake = 0;
        }
    }
}

function renderScreenFlash(ctx) {
    if (!screenFlash.active || screenFlash.alpha <= 0) return;

    ctx.globalAlpha = screenFlash.alpha;
    ctx.fillStyle = screenFlash.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
}

// --- WEATHER SYSTEM ---

function setWeather(type) {
    currentWeather = type;
    weatherParticles = [];
}

function updateWeather(dt) {
    if (currentWeather === 'none') {
        weatherParticles = [];
        return;
    }

    // Spawn new weather particles
    const spawnRate = currentWeather === 'storm' ? 10 :
        currentWeather === 'rain' ? 5 :
            currentWeather === 'snow' ? 2 : 0;

    for (let i = 0; i < spawnRate && weatherParticles.length < EFFECTS_CONFIG.WEATHER_PARTICLE_MAX; i++) {
        const screenX = Math.random() * (canvas.width + 200) - 100;

        switch (currentWeather) {
            case 'rain':
            case 'storm':
                weatherParticles.push({
                    x: screenX,
                    y: -10,
                    vx: currentWeather === 'storm' ? -100 : -20,
                    vy: currentWeather === 'storm' ? 600 : 400,
                    length: 10 + Math.random() * 10,
                    type: 'rain'
                });
                break;
            case 'snow':
                weatherParticles.push({
                    x: screenX,
                    y: -10,
                    vx: (Math.random() - 0.5) * 30,
                    vy: 30 + Math.random() * 20,
                    size: 2 + Math.random() * 3,
                    phase: Math.random() * Math.PI * 2,
                    type: 'snow'
                });
                break;
        }
    }

    // Update existing particles
    weatherParticles = weatherParticles.filter(p => {
        if (p.type === 'snow') {
            p.x += (p.vx + Math.sin(p.phase + gameTime * 2) * 20) * dt;
            p.phase += dt;
        } else {
            p.x += p.vx * dt;
        }
        p.y += p.vy * dt;

        return p.y < canvas.height + 20 && p.x > -50 && p.x < canvas.width + 50;
    });
}

function renderWeather(ctx) {
    if (currentWeather === 'none' || weatherParticles.length === 0) return;

    weatherParticles.forEach(p => {
        if (p.type === 'rain') {
            ctx.strokeStyle = 'rgba(150, 180, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.vx * 0.02, p.y + p.length);
            ctx.stroke();
        } else if (p.type === 'snow') {
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    });

    // Fog overlay for fog weather
    if (currentWeather === 'fog') {
        ctx.fillStyle = 'rgba(200, 200, 210, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Lightning for storms
    if (currentWeather === 'storm' && Math.random() < 0.002) {
        triggerScreenFlash('#ffffff', 0.8);
        // Could add thunder sound here
    }
}

// --- ENHANCED LIGHTING / DARKNESS ---

// Cache for darkness canvas
let darkCanvas = null;
let darkCtx = null;

function initDarknessCanvas() {
    if (!darkCanvas) {
        darkCanvas = document.createElement('canvas');
        darkCanvas.width = canvas.width;
        darkCanvas.height = canvas.height;
        darkCtx = darkCanvas.getContext('2d');
    }

    // Resize if needed
    if (darkCanvas.width !== canvas.width || darkCanvas.height !== canvas.height) {
        darkCanvas.width = canvas.width;
        darkCanvas.height = canvas.height;
    }
}

function renderDarkness(ctx, camX, camY, alpha = 1) {
    // Determine darkness intensity based on time of day
    let darkness = 0;
    let nightTint = { r: 10, g: 10, b: 30 }; // Blueish night

    if (timeOfDay > 0.65) {
        // Evening to Night (0.65 - 0.85 starts darkening, 0.85+ is full night)
        const transition = Math.max(0, (timeOfDay - 0.65) / 0.20);
        darkness = Math.min(0.70, transition * 0.70); // Max 0.70 for visibility

        const t = Math.min(1, (timeOfDay - 0.65) / 0.35);
        nightTint = {
            r: Math.floor(lerp(60, 5, t)),
            g: Math.floor(lerp(40, 5, t)),
            b: Math.floor(lerp(20, 20, t))
        };
    } else if (timeOfDay < 0.25) {
        // Late Night to Dawn (0.0 - 0.25)
        darkness = Math.max(0, 0.70 * (1 - timeOfDay / 0.25));

        const t = timeOfDay / 0.25;
        nightTint = {
            r: Math.floor(lerp(5, 70, t)),
            g: Math.floor(lerp(5, 50, t)),
            b: Math.floor(lerp(20, 15, t))
        };
    } else {
        // Broad Daylight (0.25 - 0.65)
        darkness = 0;
    }

    if (darkness <= 0) return;

    initDarknessCanvas();

    // 1. Fill with darkness color
    const darkColor = `rgba(${nightTint.r}, ${nightTint.g}, ${nightTint.b}, ${darkness})`;
    darkCtx.fillStyle = darkColor;
    darkCtx.fillRect(0, 0, darkCanvas.width, darkCanvas.height);

    // 2. Prepare to cut out lights
    darkCtx.globalCompositeOperation = 'destination-out';

    // Collect all light sources
    const lights = [];

    // Player light (Smaller "sight" area, plus larger "soft" area)
    const pX = lerp(player.prevX ?? player.x, player.x, alpha) * TILE_SIZE * SCALE - camX;
    const pY = lerp(player.prevY ?? player.y, player.y, alpha) * TILE_SIZE * SCALE - camY;
    const playerLightY = pY - (TILE_SIZE * SCALE * 0.5);

    const flicker = Math.sin(gameTime * 4) * 2;

    // 1. Inner "Sight" Circle (Opaque in destination-out)
    lights.push({
        x: pX,
        y: playerLightY,
        radius: (50 + flicker) * SCALE, // ~3 blocks
        intensity: 0.9,
        color: { r: 255, g: 255, b: 240 }
    });

    // 2. Soft "Ambient" Circle Around Player
    lights.push({
        x: pX,
        y: playerLightY,
        radius: (180 + flicker) * SCALE, // ~10 blocks
        intensity: 0.25,
        color: { r: 255, g: 255, b: 240 }
    });

    // Campfire lights
    const fireFlicker = Math.sin(gameTime * 8) * 5 + Math.sin(gameTime * 13) * 3;
    const fireRadius = (140 + fireFlicker) * SCALE;

    buildings.forEach(b => {
        const fX = (b.x + 0.5) * TILE_SIZE * SCALE - camX;
        const fY = (b.y + 0.5) * TILE_SIZE * SCALE - camY;

        // Only process if on screen
        if (fX > -fireRadius * 2 && fX < canvas.width + fireRadius * 2 &&
            fY > -fireRadius * 2 && fY < canvas.height + fireRadius * 2) {

            if (getTile(b.x, b.y) === TILES.CAMPFIRE) {
                lights.push({
                    x: fX,
                    y: fY,
                    radius: fireRadius * 1.2,
                    intensity: 1.0 + Math.sin(gameTime * 12) * 0.15,
                    color: { r: 255, g: 120, b: 30 } // Very Warm Orange
                });
            }

            // Houses could have window lights
            if (getTile(b.x, b.y) === TILES.HOUSE) {
                lights.push({
                    x: fX - TILE_SIZE * SCALE * 0.2,
                    y: fY - TILE_SIZE * SCALE * 0.1,
                    radius: 40 * SCALE,
                    intensity: 0.6,
                    color: { r: 255, g: 200, b: 100 }
                });
            }

            // Towers have torch lights
            if (getTile(b.x, b.y) === TILES.TOWER) {
                lights.push({
                    x: fX,
                    y: fY - TILE_SIZE * SCALE * 0.3,
                    radius: 60 * SCALE,
                    intensity: 0.7 + Math.sin(gameTime * 6 + b.x) * 0.1,
                    color: { r: 255, g: 180, b: 80 }
                });
            }
        }
    });

    // Render all lights
    lights.forEach(light => {
        const gradient = darkCtx.createRadialGradient(
            light.x, light.y, 0,
            light.x, light.y, light.radius
        );

        // Stronger cut-out for light sources
        gradient.addColorStop(0, `rgba(255, 255, 255, ${light.intensity})`);
        gradient.addColorStop(0.2, `rgba(255, 255, 255, ${light.intensity * 0.9})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${light.intensity * 0.6})`);
        gradient.addColorStop(0.8, `rgba(255, 255, 255, ${light.intensity * 0.2})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        darkCtx.fillStyle = gradient;
        darkCtx.beginPath();
        darkCtx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
        darkCtx.fill();
    });

    // 3. Reset composite operation and draw to main canvas
    darkCtx.globalCompositeOperation = 'source-over';
    ctx.drawImage(darkCanvas, 0, 0);

    // 4. Add colored light overlays (additive blending simulation)
    ctx.globalCompositeOperation = 'screen';
    lights.forEach(light => {
        if (light.color.r === 255 && light.color.g === 240) return; // Skip player's white light

        const gradient = ctx.createRadialGradient(
            light.x, light.y, 0,
            light.x, light.y, light.radius * 0.7
        );

        const colorStr = `rgba(${light.color.r}, ${light.color.g}, ${light.color.b},`;
        // Much stronger additive glow for that "warm campfire" feel
        gradient.addColorStop(0, colorStr + `${0.6 * light.intensity * darkness})`);
        gradient.addColorStop(0.3, colorStr + `${0.3 * light.intensity * darkness})`);
        gradient.addColorStop(1, colorStr + '0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(light.x, light.y, light.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
}

// --- AMBIENT EFFECTS ---

let ambientParticleTimer = 0;

function updateAmbientEffects(dt, playerX, playerY) {
    ambientParticleTimer += dt;

    // Spawn ambient particles based on environment
    if (ambientParticleTimer > 0.5) {
        ambientParticleTimer = 0;

        // Random fireflies at night
        if (timeOfDay > 0.65 || timeOfDay < 0.3) {
            if (Math.random() < 0.45) { // More fireflies
                const fx = playerX + (Math.random() - 0.5) * 14;
                const fy = playerY + (Math.random() - 0.5) * 12;
                spawnParticles(fx, fy, null, 1, 'magic', {
                    speed: 0.4,
                    size: 1.5,
                    sizeVariance: 1
                });
                const lastParticle = particles[particles.length - 1];
                if (lastParticle) {
                    lastParticle.color = '#aaff44';
                    lastParticle.life = 2 + Math.random() * 2;
                    lastParticle.maxLife = lastParticle.life;
                    lastParticle.isFirefly = true;
                }
            }
        }

        // Dust motes in daytime
        if (timeOfDay > 0.3 && timeOfDay < 0.7) {
            if (Math.random() < 0.2) {
                const dx = playerX + (Math.random() - 0.5) * 8;
                const dy = playerY + (Math.random() - 0.5) * 6;
                spawnParticles(dx, dy, 'dust', 1, 'dust', {
                    speed: 0.2,
                    size: 1
                });
                const lastParticle = particles[particles.length - 1];
                if (lastParticle) {
                    lastParticle.life = 3;
                    lastParticle.maxLife = 3;
                }
            }
        }

        // Active Campfire Particles
        if (buildings) {
            buildings.forEach(b => {
                if (getTile(b.x, b.y) === TILES.CAMPFIRE) {
                    // Constant subtle smoke
                    if (Math.random() < 0.4) {
                        spawnParticles(b.x + 0.5, b.y + 0.3, 'smoke', 1, 'smoke', {
                            speed: 0.6,
                            size: 2,
                            sizeVariance: 1,
                            upward: true
                        });
                    }
                    // Fire sparks
                    if (Math.random() < 0.2) {
                        spawnParticles(b.x + 0.5, b.y + 0.4, 'fire', 1, 'fire', {
                            speed: 1.2,
                            size: 1.5,
                            upward: true,
                            spreadX: 0.2
                        });
                    }
                    // Occasional brighter embers
                    if (Math.random() < 0.05) {
                        spawnParticles(b.x + 0.5, b.y + 0.4, 'spark', 1, 'spark', {
                            speed: 2,
                            size: 1,
                            upward: true
                        });
                    }
                }
            });
        }
    }

    // Update firefly glow
    particles.forEach(p => {
        if (p.isFirefly) {
            // Pulsing glow
            p.glowIntensity = 0.5 + Math.sin(gameTime * 3 + p.phase) * 0.5;
        }
    });
}

// --- ANIMATION HELPERS ---

const Animation = {
    // Bobbing effect (walking)
    getBobY: (animTimer, speed = 2, amplitude = 1.5) => {
        return Math.sin(animTimer * speed) * amplitude;
    },

    // Swinging limbs
    getSwing: (animTimer, size, speed = 2, multiplier = 0.08) => {
        return Math.sin(animTimer * speed) * size * multiplier;
    },

    // Pulsing scale
    getPulse: (time, speed = 1, min = 0.9, max = 1.1) => {
        const t = (Math.sin(time * speed) + 1) / 2;
        return min + t * (max - min);
    },

    // Shake/vibrate
    getShake: (time, intensity = 1) => {
        return {
            x: (Math.random() - 0.5) * intensity,
            y: (Math.random() - 0.5) * intensity
        };
    },

    // Smooth step (for transitions)
    smoothStep: (t) => {
        return t * t * (3 - 2 * t);
    },

    // Elastic bounce
    elasticOut: (t) => {
        const p = 0.3;
        return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    },

    // Ease out back (overshoot)
    easeOutBack: (t) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },

    // Color interpolation
    lerpColor: (color1, color2, t) => {
        const c1 = parseInt(color1.slice(1), 16);
        const c2 = parseInt(color2.slice(1), 16);

        const r1 = (c1 >> 16) & 255;
        const g1 = (c1 >> 8) & 255;
        const b1 = c1 & 255;

        const r2 = (c2 >> 16) & 255;
        const g2 = (c2 >> 8) & 255;
        const b2 = c2 & 255;

        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);

        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    },

    // Flash effect helper
    getFlashAlpha: (timer, duration, intensity = 1) => {
        if (timer <= 0) return 0;
        return (timer / duration) * intensity;
    }
};

// --- TEXT EFFECTS ---

function renderFloatingText(ctx, text, x, y, options = {}) {
    const {
        color = '#ffffff',
        strokeColor = '#000000',
        fontSize = 12,
        alpha = 1,
        bounce = false,
        time = 0
    } = options;

    ctx.globalAlpha = alpha;
    ctx.font = `bold ${fontSize * SCALE}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let renderY = y;
    if (bounce) {
        renderY += Math.sin(time * 5) * 3;
    }

    // Stroke
    ctx.fillStyle = strokeColor;
    for (let ox = -1; ox <= 1; ox++) {
        for (let oy = -1; oy <= 1; oy++) {
            if (ox !== 0 || oy !== 0) {
                ctx.fillText(text, x + ox, renderY + oy);
            }
        }
    }

    // Fill
    ctx.fillStyle = color;
    ctx.fillText(text, x, renderY);

    ctx.globalAlpha = 1;
}

// --- SPRITE EFFECTS ---

function renderWithOutline(ctx, renderFunc, outlineColor = '#1a1a2e', thickness = 1) {
    // Render at offsets for outline
    ctx.fillStyle = outlineColor;
    for (let ox = -thickness; ox <= thickness; ox++) {
        for (let oy = -thickness; oy <= thickness; oy++) {
            if (ox !== 0 || oy !== 0) {
                ctx.save();
                ctx.translate(ox, oy);
                renderFunc();
                ctx.restore();
            }
        }
    }
    // Render main
    renderFunc();
}

function applyHitFlash(ctx, isHit, hitTimer) {
    if (isHit && hitTimer > 0) {
        ctx.globalAlpha = 0.5 + Math.sin(hitTimer * 30) * 0.3;
        return true;
    }
    return false;
}

// --- MASTER UPDATE FUNCTION ---

function updateAllEffects(dt) {
    updateParticles(dt);
    updateDamageNumbers(dt);
    updateScreenEffects(dt);
    updateWeather(dt);

    // Ambient effects (pass player position)
    if (player) {
        updateAmbientEffects(dt, player.x, player.y);
    }
}

// --- MASTER RENDER FUNCTION (for overlay effects) ---

function renderAllOverlayEffects(ctx, camX, camY) {
    renderScreenFlash(ctx);
    renderWeather(ctx);
}

// --- UTILITY ---

function clearAllEffects() {
    particles = [];
    damageNumbers = [];
    weatherParticles = [];
    screenFlash = { active: false, color: '#ffffff', alpha: 0 };
}