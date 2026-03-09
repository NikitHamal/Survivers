// ============= ENTITY SPRITES =============

function renderPlayerEnhanced(renderX, renderY, camX, camY) {
    const s = TILE_SIZE * SCALE;
    // Ground point of the tile
    const sx = renderX * s - camX;
    const sy = (renderY + 0.5) * s - camY;

    // Player-controlled shadow to keep body/shadow alignment consistent.
    renderEntityShadow(ctx, sx, sy, s * 0.34);

    // Hit flash
    if (player.hitTimer > 0) {
        ctx.globalAlpha = 0.5 + Math.sin(player.hitTimer * 30) * 0.3;
    }

    // Dust Puff
    if (player.isMoving && Math.random() < 0.1) {
        spawnParticles(player.x, player.y + 0.3, 'dust', 1, 'dust', { speed: 0.5, size: 1.5 });
    }

    // Determine state
    let state = 'i'; // idle
    let cols = 12;
    if (player.attackCooldown > 0.05) {
        state = 'a'; // attack
        cols = 8;
    } else if (player.isMoving) {
        state = 'w'; // walk
        cols = 6;
    }

    // Only show sword if equipped
    let hasSword = false;
    if (typeof EquipmentSystem !== 'undefined') {
        const weapon = EquipmentSystem.getEquippedItem('weapon');
        if (weapon && (weapon.id.includes('sword') || weapon.id.includes('blade') || weapon.id.includes('cleaver'))) {
            hasSword = true;
        }
    }

    // Render layers
    const scale = 2.6; // Reduced again as requested
    const drawSize = s * scale;
    const rows = 4;

    const parts = ['body', 'head'];
    if (hasSword) parts.unshift('swordback'); // Behind
    if (hasSword) parts.push('sword'); // In front

    const animSpeed = (cols === 12) ? 14 : 10;
    // For attack, we want consistent frame advancement based on cooldown
    let frame = 0;
    if (state === 'a') {
        // Attack is roughly 0.4s long. Map [0.4, 0] to [0, 7]
        const progress = Math.min(1, Math.max(0, (0.4 - player.attackCooldown) / 0.4));
        frame = Math.floor(progress * cols) % cols;
    } else {
        frame = Math.floor((player.animTimer || 0) * animSpeed) % cols;
    }

    let dir = player.direction; // 0=Right, 1=Down, 2=Left, 3=Up
    let row = 0;
    if (dir === 1) row = 0;        // Down
    else if (dir === 2) row = 1;   // Left
    else if (dir === 0) row = 2;   // Right
    else if (dir === 3) row = 3;   // Up

    parts.forEach(part => {
        const key = `p_${part}_${state}`;
        const img = AssetManager.get(key);
        if (img && img.complete && img.naturalWidth > 0) {
            const frameW = img.width / cols;
            const frameH = img.height / rows;
            const sourceX = frame * frameW;
            const sourceY = row * frameH;

            // Anchoring at feet: Bottom center of frame is at (sx, sy)
            const dx = sx - drawSize / 2;
            const dy = sy - drawSize * 0.69; // Match swordsman sheet foot anchor

            ctx.drawImage(img, sourceX, sourceY, frameW, frameH, dx, dy, drawSize, drawSize);
        }
    });

    // Procedural Fallback if no parts loaded
    if (!AssetManager.get('p_body_i')) {
        renderProceduralPlayer(sx, sy, s);
    }

    ctx.globalAlpha = 1;
}

function renderProceduralPlayer(sx, sy, s) {
    const bobY = player.isMoving ? Math.sin(player.animTimer * 12) * 2 : 0;
    const armSwing = player.isMoving ? Math.sin(player.animTimer * 12) * s * 0.08 : 0;
    const legSwing = player.isMoving ? Math.sin(player.animTimer * 12) * s * 0.06 : 0;

    const fsx = sx - s / 2;
    const fsy = sy - s * 0.9;

    let faceOffX = 0;
    if (player.direction === 0) faceOffX = s * 0.1;
    if (player.direction === 2) faceOffX = -s * 0.1;

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(fsx + s * 0.26, fsy + s * 0.38 + bobY, s * 0.48, s * 0.44);
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(fsx + s * 0.28, fsy + s * 0.4 + bobY, s * 0.44, s * 0.4);
    ctx.fillStyle = '#5599ff';
    ctx.fillRect(fsx + s * 0.32 + faceOffX * 0.5, fsy + s * 0.45 + bobY, s * 0.36, s * 0.12);

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(fsx + s * 0.15, fsy + s * 0.4 + bobY + armSwing, s * 0.16, s * 0.28);
    ctx.fillStyle = PALETTE.skin1;
    ctx.fillRect(fsx + s * 0.17, fsy + s * 0.42 + bobY + armSwing, s * 0.12, s * 0.24);

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(fsx + s * 0.69, fsy + s * 0.4 + bobY - armSwing, s * 0.16, s * 0.28);
    ctx.fillStyle = PALETTE.skin1;
    ctx.fillRect(fsx + s * 0.71, fsy + s * 0.42 + bobY - armSwing, s * 0.12, s * 0.24);

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(fsx + s * 0.30, fsy + s * 0.15 + bobY, s * 0.40, s * 0.32);
    ctx.fillStyle = PALETTE.skin1;
    ctx.fillRect(fsx + s * 0.32, fsy + s * 0.18 + bobY, s * 0.36, s * 0.28);

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(fsx + s * 0.28, fsy + s * 0.08 + bobY, s * 0.44, s * 0.18);
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(fsx + s * 0.30, fsy + s * 0.1 + bobY, s * 0.40, s * 0.14);

    if (player.direction !== 3) {
        ctx.fillStyle = '#222';
        if (player.direction === 0 || player.direction === 2) {
            const eyeX = player.direction === 0 ? fsx + s * 0.54 : fsx + s * 0.4;
            ctx.fillRect(eyeX, fsy + s * 0.26 + bobY, s * 0.06, s * 0.08);
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(fsx + s * 0.36, fsy + s * 0.26 + bobY, s * 0.1, s * 0.08);
            ctx.fillRect(fsx + s * 0.54, fsy + s * 0.26 + bobY, s * 0.1, s * 0.08);
            ctx.fillStyle = '#222';
            ctx.fillRect(fsx + s * 0.39, fsy + s * 0.27 + bobY, s * 0.05, s * 0.06);
            ctx.fillRect(fsx + s * 0.56, fsy + s * 0.27 + bobY, s * 0.05, s * 0.06);
        }
    }

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(fsx + s * 0.30, fsy + s * 0.76 + legSwing, s * 0.17, s * 0.22);
    ctx.fillStyle = '#3355aa';
    ctx.fillRect(fsx + s * 0.32, fsy + s * 0.78 + legSwing, s * 0.13, s * 0.18);
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(fsx + s * 0.53, fsy + s * 0.76 - legSwing, s * 0.17, s * 0.22);
    ctx.fillStyle = '#3355aa';
    ctx.fillRect(fsx + s * 0.55, fsy + s * 0.78 - legSwing, s * 0.13, s * 0.18);
}

function renderSimpleDirectionalSprite(ctx, entity, img, sx, sy, s, scale = 1.0, cols = 6) {
    const drawSize = s * scale;
    const rows = 4;
    const frameW = img.width / cols;
    const frameH = img.height / rows;

    let dir = entity.direction; // 0=Right, 1=Down, 2=Left, 3=Up
    let row = 0;
    if (dir === 1) row = 0;        // Down
    else if (dir === 2) row = 1;   // Left
    else if (dir === 0) row = 2;   // Right
    else if (dir === 3) row = 3;   // Up

    const frameCount = cols;
    const animSpeed = (cols > 10) ? 12 : 8; // Faster animation for high frame count sheets
    const frame = Math.floor((entity.animTimer || 0) * animSpeed) % frameCount;

    const sourceX = frame * frameW;
    const sourceY = row * frameH;

    const dx = sx - drawSize / 2;
    const dy = sy - drawSize * 0.82; // Adjusted for better grounding

    if (sourceY + frameH <= img.height && sourceX + frameW <= img.width) {
        ctx.drawImage(img, sourceX, sourceY, frameW, frameH, dx, dy, drawSize, drawSize);
    } else {
        ctx.drawImage(img, 0, 0, frameW, frameH, dx, dy, drawSize, drawSize);
    }
}

function renderAnimatedEntitySprite(ctx, entity, img, sx, sy, s, scale = 1.0) {
    const drawSize = s * scale;
    const cols = 6;
    const rows = img.height > img.width ? 8 : 4;
    const frameW = img.width / cols;
    const frameH = img.height / rows;

    let dir = entity.direction; // 0=Right, 1=Down, 2=Left, 3=Up
    let row = 0;
    if (dir === 1) row = 0;        // Down
    else if (dir === 2) row = 1;   // Left
    else if (dir === 0) row = 2;   // Right
    else if (dir === 3) row = 3;   // Up

    if (entity.isMoving && rows >= 8) {
        row += 4;
    }

    const frameCount = cols;
    const frame = Math.floor((entity.animTimer || 0) * 8) % frameCount;

    const sourceX = frame * frameW;
    const sourceY = row * frameH;

    const dx = sx - drawSize / 2;
    const dy = sy - drawSize * 0.85;

    if (sourceY + frameH <= img.height && sourceX + frameW <= img.width) {
        ctx.drawImage(img, sourceX, sourceY, frameW, frameH, dx, dy, drawSize, drawSize);
    } else {
        ctx.drawImage(img, 0, 0, frameW, frameH, dx, dy, drawSize, drawSize);
    }
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
    // Ground point of the tile
    const sx = renderX * s - camX;
    const sy = (renderY + 0.5) * s - camY;

    if (sx < -s * 2 || sx > canvas.width + s || sy < -s * 2 || sy > canvas.height + s) return;

    // Glowing Red Eyes Glow
    if (isNight) {
        const eyeGlow = ctx.createRadialGradient(sx, sy - s * 0.4, 0, sx, sy - s * 0.4, s * 0.4);
        eyeGlow.addColorStop(0, 'rgba(255, 0, 0, 0.4)');
        eyeGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = eyeGlow;
        ctx.fillRect(sx - s * 0.5, sy - s * 0.8, s, s);
    }

    // Procedural Rendering
    const bob = Math.sin(z.animTimer * 12) * 1.5;
    const shamble = Math.sin(z.animTimer * 8) * 2;
    const armReach = Math.sin(z.animTimer * 8) * s * 0.08;

    const fsx = sx - s / 2;
    const fsy = sy - s * 0.9;

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(fsx + s * 0.20, fsy + s * 0.33 + bob, s * 0.60, s * 0.50);
    ctx.fillStyle = PALETTE.zombie2;
    ctx.fillRect(fsx + s * 0.22, fsy + s * 0.35 + bob, s * 0.56, s * 0.46);

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(fsx + s * 0.02 + armReach, fsy + s * 0.36 + bob, s * 0.22, s * 0.14);
    ctx.fillStyle = PALETTE.zombie1;
    ctx.fillRect(fsx + s * 0.04 + armReach, fsy + s * 0.38 + bob, s * 0.18, s * 0.10);

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(fsx + s * 0.76 - armReach, fsy + s * 0.40 + bob, s * 0.22, s * 0.14);
    ctx.fillStyle = PALETTE.zombie1;
    ctx.fillRect(fsx + s * 0.78 - armReach, fsy + s * 0.42 + bob, s * 0.18, s * 0.10);

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(fsx + s * 0.26, fsy + s * 0.10 + bob, s * 0.48, s * 0.32);
    ctx.fillStyle = PALETTE.zombie1;
    ctx.fillRect(fsx + s * 0.28, fsy + s * 0.12 + bob, s * 0.44, s * 0.28);

    ctx.fillStyle = PALETTE.zombieEye;
    ctx.fillRect(fsx + s * 0.33, fsy + s * 0.20 + bob, s * 0.12, s * 0.08);
    ctx.fillRect(fsx + s * 0.55, fsy + s * 0.20 + bob, s * 0.12, s * 0.08);

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(fsx + s * 0.28 + shamble * 0.5, fsy + s * 0.78, s * 0.18, s * 0.22);
    ctx.fillStyle = PALETTE.zombie2;
    ctx.fillRect(fsx + s * 0.30 + shamble * 0.5, fsy + s * 0.80, s * 0.14, s * 0.18);

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(fsx + s * 0.54 - shamble * 0.5, fsy + s * 0.78, s * 0.18, s * 0.22);
    ctx.fillStyle = PALETTE.zombie2;
    ctx.fillRect(fsx + s * 0.56 - shamble * 0.5, fsy + s * 0.80, s * 0.14, s * 0.18);

    // ======= HEALTH BAR =======
    if (z.health < z.maxHealth) {
        const barWidth = s * 0.8;
        const healthPercent = z.health / z.maxHealth;

        ctx.fillStyle = PALETTE.outline;
        ctx.fillRect(sx + s * 0.1 - 1, sy - 6, barWidth + 2, 7);
        ctx.fillStyle = '#333';
        ctx.fillRect(sx + s * 0.1, sy - 5, barWidth, 5);

        const healthColor = healthPercent > 0.5 ? '#44dd44' : healthPercent > 0.25 ? '#dddd44' : '#dd4444';
        ctx.fillStyle = healthColor;
        ctx.fillRect(sx + s * 0.1, sy - 5, barWidth * healthPercent, 5);

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
