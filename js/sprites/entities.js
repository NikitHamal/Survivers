// ============= ENTITY SPRITES =============

function renderPlayerEnhanced(renderX, renderY, camX, camY) {
    const s = TILE_SIZE * SCALE;
    const sx = (renderX - 0.5) * s - camX;
    // Grounding: (renderY - 0.6) instead of -0.9 to bring the feet to the shadow
    const sy = (renderY - 0.6) * s - camY;

    // Hit flash
    if (player.hitTimer > 0) {
        ctx.globalAlpha = 0.5 + Math.sin(player.hitTimer * 30) * 0.3;
    }

    // 2. Dust Puff (if moving)
    if (player.isMoving && Math.random() < 0.1) {
        spawnParticles(player.x, player.y + 0.3, 'dust', 1, 'dust', { speed: 0.5, size: 1.5 });
    }

    const bobY = player.isMoving ? Math.sin(player.animTimer * 2) * 2 : 0;
    const armSwing = player.isMoving ? Math.sin(player.animTimer * 2) * s * 0.08 : 0;
    const legSwing = player.isMoving ? Math.sin(player.animTimer * 2) * s * 0.06 : 0;

    // Directional offsets for eyes/face
    let faceOffX = 0;
    if (player.direction === 0) faceOffX = s * 0.1; // Facing Right
    if (player.direction === 2) faceOffX = -s * 0.1; // Facing Left

    // ======= BODY =======
    // Body outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.26, sy + s * 0.38 + bobY, s * 0.48, s * 0.44);

    // Body
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(sx + s * 0.28, sy + s * 0.4 + bobY, s * 0.44, s * 0.4);

    // Shirt detail
    ctx.fillStyle = '#5599ff';
    ctx.fillRect(sx + s * 0.32 + faceOffX * 0.5, sy + s * 0.45 + bobY, s * 0.36, s * 0.12);

    // ======= ARMS =======
    // Left arm outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.15, sy + s * 0.4 + bobY + armSwing, s * 0.16, s * 0.28);
    // Left arm
    ctx.fillStyle = PALETTE.skin1;
    ctx.fillRect(sx + s * 0.17, sy + s * 0.42 + bobY + armSwing, s * 0.12, s * 0.24);

    // Right arm outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.69, sy + s * 0.4 + bobY - armSwing, s * 0.16, s * 0.28);
    // Right arm
    ctx.fillStyle = PALETTE.skin1;
    ctx.fillRect(sx + s * 0.71, sy + s * 0.42 + bobY - armSwing, s * 0.12, s * 0.24);

    // ======= HEAD =======
    // Head outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.30, sy + s * 0.15 + bobY, s * 0.40, s * 0.32);

    // Head
    ctx.fillStyle = PALETTE.skin1;
    ctx.fillRect(sx + s * 0.32, sy + s * 0.18 + bobY, s * 0.36, s * 0.28);

    // ======= HAIR =======
    // Hair outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.28, sy + s * 0.08 + bobY, s * 0.44, s * 0.18);

    // Hair
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(sx + s * 0.30, sy + s * 0.1 + bobY, s * 0.40, s * 0.14);

    // ======= EYES =======
    if (player.direction !== 3) { // Not facing away (Up)
        ctx.fillStyle = '#222';
        if (player.direction === 0 || player.direction === 2) {
            // Facing Left or Right - render one eye shifted
            const eyeX = player.direction === 0 ? sx + s * 0.54 : sx + s * 0.4;
            ctx.fillRect(eyeX, sy + s * 0.26 + bobY, s * 0.06, s * 0.08);
        } else {
            // Facing Down - render both eyes
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(sx + s * 0.36, sy + s * 0.26 + bobY, s * 0.1, s * 0.08);
            ctx.fillRect(sx + s * 0.54, sy + s * 0.26 + bobY, s * 0.1, s * 0.08);
            ctx.fillStyle = '#222';
            ctx.fillRect(sx + s * 0.39, sy + s * 0.27 + bobY, s * 0.05, s * 0.06);
            ctx.fillRect(sx + s * 0.56, sy + s * 0.27 + bobY, s * 0.05, s * 0.06);
        }
    }

    // ======= LEGS =======
    // Left leg outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.30, sy + s * 0.76 + legSwing, s * 0.17, s * 0.22);
    // Left leg
    ctx.fillStyle = '#3355aa';
    ctx.fillRect(sx + s * 0.32, sy + s * 0.78 + legSwing, s * 0.13, s * 0.18);

    // Right leg outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.53, sy + s * 0.76 - legSwing, s * 0.17, s * 0.22);
    // Right leg
    ctx.fillStyle = '#3355aa';
    ctx.fillRect(sx + s * 0.55, sy + s * 0.78 - legSwing, s * 0.13, s * 0.18);

    ctx.globalAlpha = 1;
}

function renderSurvivorEnhanced(survivor, renderX, renderY, camX, camY) {
    const s = TILE_SIZE * SCALE;
    const sx = (renderX - 0.5) * s - camX;
    const sy = (renderY - 0.6) * s - camY;

    if (sx < -s || sx > canvas.width + s || sy < -s || sy > canvas.height + s) return;

    // Role badge colors
    const colors = {
        'Soldier': { main: '#aa4444', light: '#cc5555' },
        'Guard': { main: '#6666aa', light: '#8888cc' },
        'Builder': { main: '#aa8844', light: '#ccaa66' },
        'Farmer': { main: '#44aa44', light: '#66cc66' },
        'Woodcutter': { main: '#8a5a2a', light: '#aa7a4a' },
        'Miner': { main: '#666666', light: '#888888' },
        'Hunter': { main: '#668844', light: '#88aa66' },
        'Medic': { main: '#aa88cc', light: '#ccaaee' },
        'None': { main: '#888888', light: '#aaaaaa' },
        'Leader': { main: '#aaaaaa', light: '#ffffff' }
    };

    const skinColor = survivor.skinColor || '#ddb088';
    const hairColor = survivor.hairColor || '#5a4030';
    const clColors = colors[survivor.role] || colors['None'];
    const clothingColor = survivor.clothingColor || clColors.main;
    const isFemale = survivor.gender === 'female';

    // Animation states
    const isMoving = !!survivor.isMoving; // Use explicit movement flag
    const isWorking = survivor.state === 'WORKING';
    const animTimer = survivor.animTimer || 0;

    let bobY = 0;
    let armSwing = 0;
    let legSwing = 0;
    let toolAngle = 0;

    if (isMoving) {
        bobY = Math.sin(animTimer * 12) * 1.5;
        armSwing = Math.sin(animTimer * 12) * s * 0.1;
        legSwing = Math.sin(animTimer * 12) * s * 0.12;
    } else if (isWorking) {
        bobY = Math.sin(animTimer * 15) * 1;
        armSwing = Math.sin(animTimer * 15) * s * 0.15;
        toolAngle = Math.sin(animTimer * 15) * 0.5;
    }

    // ======= SHADOW =======
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(sx + s * 0.5, sy + s * 0.9, s * 0.3, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // ======= LEGS & SHOES =======
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(sx + s * 0.30, sy + s * 0.88 + legSwing, s * 0.16, s * 0.08);
    ctx.fillRect(sx + s * 0.54, sy + s * 0.88 - legSwing, s * 0.16, s * 0.08);

    ctx.fillStyle = '#3355aa';
    ctx.fillRect(sx + s * 0.30, sy + s * 0.76 + legSwing, s * 0.16, s * 0.14);
    ctx.fillRect(sx + s * 0.54, sy + s * 0.76 - legSwing, s * 0.16, s * 0.14);

    // ======= BODY =======
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.26, sy + s * 0.38 + bobY, s * 0.48, s * 0.42);

    ctx.fillStyle = clothingColor;
    ctx.fillRect(sx + s * 0.28, sy + s * 0.40 + bobY, s * 0.44, s * 0.38);

    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(sx + s * 0.28, sy + s * 0.40 + bobY, s * 0.1, s * 0.38);
    ctx.fillRect(sx + s * 0.62, sy + s * 0.40 + bobY, s * 0.1, s * 0.38);
    ctx.fillRect(sx + s * 0.38, sy + s * 0.65 + bobY, s * 0.24, s * 0.13);

    // ======= ARMS =======
    const leftArmX = sx + s * 0.14;
    const rightArmX = sx + s * 0.72;
    const armY = sy + s * 0.42 + bobY;

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(leftArmX - 1, armY + armSwing - 1, s * 0.14, s * 0.24);
    ctx.fillStyle = skinColor;
    ctx.fillRect(leftArmX, armY + armSwing, s * 0.12, s * 0.22);

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(rightArmX - 1, armY - armSwing - 1, s * 0.14, s * 0.24);
    ctx.fillStyle = skinColor;
    ctx.fillRect(rightArmX, armY - armSwing, s * 0.12, s * 0.22);

    if (isWorking) {
        ctx.save();
        ctx.translate(rightArmX + s * 0.06, armY - armSwing + s * 0.15);
        ctx.rotate(toolAngle);
        if (survivor.role === 'Woodcutter') {
            ctx.fillStyle = '#835c39'; ctx.fillRect(0, -s * 0.2, 2, s * 0.45);
            ctx.fillStyle = '#aaa'; ctx.fillRect(-2, -s * 0.3, 8, 8);
        } else if (survivor.role === 'Miner') {
            ctx.fillStyle = '#555'; ctx.fillRect(0, -s * 0.2, 2, s * 0.45);
            ctx.fillStyle = '#888'; ctx.fillRect(-6, -s * 0.25, 14, 4);
        } else if (survivor.role === 'Farmer') {
            ctx.fillStyle = '#835c39'; ctx.fillRect(0, -s * 0.25, 2, s * 0.5);
            ctx.fillStyle = '#90ee90'; ctx.fillRect(-4, -s * 0.25, 10, 2);
        }
        ctx.restore();
    }

    // ======= HEAD & HAIR =======
    const headX = sx + s * 0.31;
    const headY = sy + s * 0.16 + bobY;

    // Directional face offset
    let faceOffX = 0;
    if (survivor.direction === 0) faceOffX = s * 0.08; // Right
    if (survivor.direction === 2) faceOffX = -s * 0.08; // Left

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(headX - 1, headY - 1, s * 0.38 + 2, s * 0.28 + 2);
    ctx.fillStyle = skinColor;
    ctx.fillRect(headX, headY, s * 0.38, s * 0.28);

    ctx.fillStyle = hairColor;
    if (isFemale) {
        ctx.fillRect(sx + s * 0.28, sy + s * 0.08 + bobY, s * 0.44, s * 0.12);
        ctx.fillRect(sx + s * 0.26, sy + s * 0.18 + bobY, s * 0.08, s * 0.3);
        ctx.fillRect(sx + s * 0.66, sy + s * 0.18 + bobY, s * 0.08, s * 0.3);
    } else {
        ctx.fillRect(sx + s * 0.28, sy + s * 0.08 + bobY, s * 0.44, s * 0.1);
    }

    // ======= EYES =======
    if (survivor.direction !== 3) { // Not Up
        ctx.fillStyle = '#fff';
        if (survivor.direction === 0 || survivor.direction === 2) {
            // Side eye
            const eyeX = survivor.direction === 0 ? sx + s * 0.54 : sx + s * 0.38;
            ctx.fillRect(eyeX, sy + s * 0.26 + bobY, s * 0.08, s * 0.06);
            ctx.fillStyle = '#222';
            const pupilX = survivor.direction === 0 ? sx + s * 0.57 : sx + s * 0.39;
            ctx.fillRect(pupilX, sy + s * 0.27 + bobY, s * 0.04, s * 0.04);
        } else {
            // Facing Down (Frontal)
            ctx.fillRect(sx + s * 0.38, sy + s * 0.26 + bobY, s * 0.08, s * 0.06);
            ctx.fillRect(sx + s * 0.54, sy + s * 0.26 + bobY, s * 0.08, s * 0.06);
            ctx.fillStyle = '#222';
            ctx.fillRect(sx + s * 0.40, sy + s * 0.27 + bobY, s * 0.04, s * 0.04);
            ctx.fillRect(sx + s * 0.56, sy + s * 0.27 + bobY, s * 0.04, s * 0.04);

            // Cheek blush
            ctx.fillStyle = 'rgba(255, 100, 100, 0.2)';
            ctx.fillRect(sx + s * 0.34, sy + s * 0.32 + bobY, s * 0.08, s * 0.04);
            ctx.fillRect(sx + s * 0.58, sy + s * 0.32 + bobY, s * 0.08, s * 0.04);
        }
    }

    // ======= STATS =======
    const barWidth = s * 0.7;
    const healthPercent = Math.max(0, (survivor.health || 0) / (survivor.maxHealth || 100));
    const hpColor = healthPercent > 0.5 ? '#4ade4a' : healthPercent > 0.25 ? '#facc15' : '#f87171';

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(sx + s * 0.15, sy - 12, barWidth, 5);
    ctx.fillStyle = hpColor;
    ctx.fillRect(sx + s * 0.15, sy - 12, barWidth * healthPercent, 5);

    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.arc(sx + s * 0.85, sy + s * 0.82, s * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = clColors.main;
    ctx.beginPath();
    ctx.arc(sx + s * 0.85, sy + s * 0.82, s * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.floor(s * 0.11)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(survivor.role ? survivor.role[0] : '?', sx + s * 0.85, sy + s * 0.82);
}

function renderZombieEnhanced(z, renderX, renderY, camX, camY) {
    const s = TILE_SIZE * SCALE;
    const sx = (renderX - 0.5) * s - camX;
    const sy = (renderY - 0.6) * s - camY;

    if (sx < -s * 2 || sx > canvas.width + s || sy < -s * 2 || sy > canvas.height + s) return;

    const bob = Math.sin(z.animTimer * 3) * 1.5;
    const shamble = Math.sin(z.animTimer * 2) * 2;
    const armReach = Math.sin(z.animTimer * 4) * s * 0.08;

    // 2. Glowing Red Eyes Glow (Atmospheric)
    if (isNight) {
        const eyeGlow = ctx.createRadialGradient(sx + s * 0.5, sy + s * 0.3, 0, sx + s * 0.5, sy + s * 0.3, s * 0.4);
        eyeGlow.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
        eyeGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = eyeGlow;
        ctx.fillRect(sx + s * 0.1, sy + s * 0.1, s * 0.8, s * 0.6);
    }

    // ======= BODY =======
    // Body outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.20, sy + s * 0.33 + bob, s * 0.60, s * 0.50);

    // Body
    ctx.fillStyle = PALETTE.zombie2;
    ctx.fillRect(sx + s * 0.22, sy + s * 0.35 + bob, s * 0.56, s * 0.46);

    // ======= ARMS (reaching forward) =======
    // Left arm
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.02 + armReach, sy + s * 0.36 + bob, s * 0.22, s * 0.14);
    ctx.fillStyle = PALETTE.zombie1;
    ctx.fillRect(sx + s * 0.04 + armReach, sy + s * 0.38 + bob, s * 0.18, s * 0.10);

    // Right arm
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.76 - armReach, sy + s * 0.40 + bob, s * 0.22, s * 0.14);
    ctx.fillStyle = PALETTE.zombie1;
    ctx.fillRect(sx + s * 0.78 - armReach, sy + s * 0.42 + bob, s * 0.18, s * 0.10);

    // ======= HEAD =======
    // Head outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.26, sy + s * 0.10 + bob, s * 0.48, s * 0.32);

    // Head
    ctx.fillStyle = PALETTE.zombie1;
    ctx.fillRect(sx + s * 0.28, sy + s * 0.12 + bob, s * 0.44, s * 0.28);

    // ======= EYES (glowing red) =======
    ctx.fillStyle = PALETTE.zombieEye;
    ctx.fillRect(sx + s * 0.33, sy + s * 0.20 + bob, s * 0.12, s * 0.08);
    ctx.fillRect(sx + s * 0.55, sy + s * 0.20 + bob, s * 0.12, s * 0.08);

    // ======= LEGS =======
    // Left leg
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.28 + shamble * 0.5, sy + s * 0.78, s * 0.18, s * 0.22);
    ctx.fillStyle = PALETTE.zombie2;
    ctx.fillRect(sx + s * 0.30 + shamble * 0.5, sy + s * 0.80, s * 0.14, s * 0.18);

    // Right leg
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.54 - shamble * 0.5, sy + s * 0.78, s * 0.18, s * 0.22);
    ctx.fillStyle = PALETTE.zombie2;
    ctx.fillRect(sx + s * 0.56 - shamble * 0.5, sy + s * 0.80, s * 0.14, s * 0.18);

    // ======= HEALTH BAR =======
    if (z.health < z.maxHealth) {
        const barWidth = s * 0.8;
        const healthPercent = z.health / z.maxHealth;

        // Background
        ctx.fillStyle = PALETTE.outline;
        ctx.fillRect(sx + s * 0.1 - 1, sy - 6, barWidth + 2, 7);

        ctx.fillStyle = '#333';
        ctx.fillRect(sx + s * 0.1, sy - 5, barWidth, 5);

        // Health gradient
        const healthColor = healthPercent > 0.5 ? '#44dd44' : healthPercent > 0.25 ? '#dddd44' : '#dd4444';
        ctx.fillStyle = healthColor;
        ctx.fillRect(sx + s * 0.1, sy - 5, barWidth * healthPercent, 5);

        // Shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(sx + s * 0.1, sy - 5, barWidth * healthPercent, 2);
    }
}

function renderProjectile(p, camX, camY) {
    const sx = p.x * TILE_SIZE * SCALE - camX;
    const sy = p.y * TILE_SIZE * SCALE - camY;

    // Trail effect
    ctx.fillStyle = p.color + '44';
    for (let i = 1; i <= 3; i++) {
        const trailX = sx - p.vx * TILE_SIZE * SCALE * 0.1 * i;
        const trailY = sy - p.vy * TILE_SIZE * SCALE * 0.1 * i;
        ctx.beginPath();
        ctx.arc(trailX, trailY, p.size * SCALE * (1 - i * 0.2), 0, Math.PI * 2);
        ctx.fill();
    }

    // Outline
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.arc(sx, sy, p.size * SCALE + 1, 0, Math.PI * 2);
    ctx.fill();

    // Main projectile
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(sx, sy, p.size * SCALE, 0, Math.PI * 2);
    ctx.fill();
}

// ============= ANIMAL RENDERING =============
function renderAnimal(animal, renderX, renderY, camX, camY) {
    if (!animal || !animal.type) return;

    const s = TILE_SIZE * SCALE;
    const sx = (renderX - 0.5) * s - camX;
    const sy = (renderY - 0.6) * s - camY;

    // Use AnimalSprites if available
    if (typeof AnimalSprites !== 'undefined' && AnimalSprites.renderAnimalSprite) {
        const direction = animal.direction || 0;
        const frame = Math.floor((animal.animTimer || 0) * 4) % 4;
        const spriteScale = SCALE * 0.8;

        try {
            const sprite = AnimalSprites.renderAnimalSprite(animal.type, direction, frame, spriteScale);
            if (sprite) {
                ctx.drawImage(sprite, sx, sy);

                // Health bar for damaged animals
                if (animal.health < animal.maxHealth) {
                    renderEntityHealthBar(sx, sy - 8, s, animal.health, animal.maxHealth);
                }
                return;
            }
        } catch (e) {
            // Fallback to simple rendering
        }
    }

    // Fallback simple rendering
    renderSimpleAnimal(animal, sx, sy, s);
}

function renderSimpleAnimal(animal, sx, sy, s) {
    const type = animal.type.toLowerCase();

    // Simple color-coded shapes
    const animalColors = {
        wolf: '#6a6a6a',
        bear: '#4a3520',
        tiger: '#d4881a',
        fox: '#d4642a',
        hawk: '#8b6914',
        rabbit: '#aa9988',
        deer: '#b8865a',
        boar: '#5a4030',
        snake: '#4a6a3a',
        camel: '#c4a35a',
        beaver: '#4a3020'
    };

    const color = animalColors[type] || '#888888';

    // Body
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(sx + s * 0.2, sy + s * 0.3, s * 0.6, s * 0.5);
    ctx.fillStyle = color;
    ctx.fillRect(sx + s * 0.22, sy + s * 0.32, s * 0.56, s * 0.46);

    // Head (smaller, offset based on direction)
    const headOffsetX = animal.direction === 0 ? 0.15 : animal.direction === 2 ? -0.15 : 0;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(sx + s * (0.35 + headOffsetX), sy + s * 0.15, s * 0.3, s * 0.25);
    ctx.fillStyle = color;
    ctx.fillRect(sx + s * (0.37 + headOffsetX), sy + s * 0.17, s * 0.26, s * 0.21);

    // Eyes
    if (animal.direction !== 3) {
        ctx.fillStyle = '#222';
        ctx.fillRect(sx + s * (0.42 + headOffsetX), sy + s * 0.22, s * 0.04, s * 0.04);
        if (animal.direction === 1) {
            ctx.fillRect(sx + s * 0.54, sy + s * 0.22, s * 0.04, s * 0.04);
        }
    }

    // Legs (simple)
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(sx + s * 0.25, sy + s * 0.7, s * 0.12, s * 0.2);
    ctx.fillRect(sx + s * 0.63, sy + s * 0.7, s * 0.12, s * 0.2);

    // Health bar for damaged animals
    if (animal.health < animal.maxHealth) {
        renderEntityHealthBar(sx, sy - 8, s, animal.health, animal.maxHealth);
    }
}

function renderPet(pet, renderX, renderY, camX, camY) {
    if (!pet || !pet.type) return;

    const s = TILE_SIZE * SCALE;
    const sx = (renderX - 0.5) * s - camX;
    const sy = (renderY - 0.6) * s - camY;

    // Use PetSprites if available
    if (typeof PetSprites !== 'undefined' && PetSprites.renderPetSprite) {
        const direction = pet.direction || 0;
        const frame = Math.floor((pet.animTimer || 0) * 4) % 4;

        try {
            PetSprites.renderPetSprite(ctx, pet, { x: camX, y: camY });
            return;
        } catch (e) {
            // Fallback
        }
    }

    // Fallback to AnimalSprites with pet indicator
    if (typeof AnimalSprites !== 'undefined') {
        renderAnimal(pet, renderX, renderY, camX, camY);

        // Add pet indicator (heart for tamed)
        if (!pet.isWild) {
            ctx.fillStyle = '#ff6688';
            ctx.beginPath();
            const hx = sx + s * 0.5;
            const hy = sy - 4;
            // Simple heart shape
            ctx.arc(hx - 3, hy, 3, Math.PI, 0);
            ctx.arc(hx + 3, hy, 3, Math.PI, 0);
            ctx.lineTo(hx, hy + 6);
            ctx.closePath();
            ctx.fill();
        }
        return;
    }

    // Ultimate fallback
    renderSimpleAnimal(pet, sx, sy, s);
}

function renderEntityHealthBar(sx, sy, width, health, maxHealth) {
    const barWidth = width * 0.8;
    const barHeight = 4;
    const barX = sx + (width - barWidth) / 2;

    // Background
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, sy, barWidth, barHeight);

    // Health fill
    const healthPercent = Math.max(0, health / maxHealth);
    const fillColor = healthPercent > 0.5 ? '#44ff44' :
        healthPercent > 0.25 ? '#ffaa00' : '#ff4444';
    ctx.fillStyle = fillColor;
    ctx.fillRect(barX, sy, barWidth * healthPercent, barHeight);

    // Border
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, sy, barWidth, barHeight);
}
