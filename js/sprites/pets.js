// ============= ANIMAL SPRITES =============
// Modular pixel-art sprites for all pet/animal types

// Animal color palettes
const ANIMAL_PALETTE = {
    sheep: {
        body: '#f5f5f5', light: '#ffffff', dark: '#d0d0d0',
        face: '#3a3a3a', legs: '#2a2a2a', eyes: '#111111'
    },
    chicken: {
        body: '#f5f0e0', light: '#fffaf0', dark: '#d4c8a8',
        comb: '#dd3333', beak: '#ffaa22', legs: '#ffaa44', eyes: '#111111'
    },
    pig: {
        body: '#ffb0b0', light: '#ffd0d0', dark: '#dd9090',
        snout: '#ffcccc', eyes: '#2a2a2a', hooves: '#4a3a3a'
    },
    cow: {
        body: '#f0e8e0', spots: '#4a3a2a', dark: '#c0b8b0',
        snout: '#ffccbb', eyes: '#2a2a2a', hooves: '#3a2a2a', horns: '#e8dcc8'
    },
    horse: {
        body: '#8b6b4a', light: '#a07858', dark: '#6a5038',
        mane: '#3a2a1a', eyes: '#1a1a1a', hooves: '#2a2020', blaze: '#e8dcc8'
    },
    wolf: {
        body: '#7a7a80', light: '#9a9aa0', dark: '#5a5a60',
        belly: '#c0c0c8', eyes: '#ffcc44', nose: '#2a2a2a', ears: '#4a4a50'
    },
    rabbit: {
        body: '#d8c8b8', light: '#f0e8e0', dark: '#b8a898',
        ears: '#e8c8c0', eyes: '#2a2020', nose: '#ffaaaa', tail: '#ffffff'
    },
    bee: {
        body: '#ffcc00', stripes: '#222222', wings: 'rgba(200, 220, 255, 0.6)',
        eyes: '#111111', stinger: '#3a3020', legs: '#2a2a2a', fuzz: '#ffdd44'
    }
};

// Main render function - called from pet-system.js
window.renderAnimalSprite = function (ctx, animal, cam) {
    const s = TILE_SIZE * SCALE;
    const screenX = (animal.x - 0.5) * s - cam.x;
    const screenY = (animal.y - 0.5) * s - cam.y;

    // Skip if off-screen
    if (screenX < -s * 2 || screenX > ctx.canvas.width + s * 2 ||
        screenY < -s * 2 || screenY > ctx.canvas.height + s * 2) return;

    ctx.save();

    // Hit flash effect
    if (animal.hitTimer > 0) {
        ctx.globalAlpha = 0.5 + Math.sin(animal.hitTimer * 30) * 0.3;
    }

    // Baby animals are smaller
    const sizeMultiplier = animal.isAdult === false ? 0.5 : 1;
    const typeId = animal.type?.id || animal.typeId || 'sheep';

    switch (typeId.toLowerCase()) {
        case 'sheep': renderSheepSprite(ctx, animal, screenX, screenY, s, sizeMultiplier); break;
        case 'chicken': renderChickenSprite(ctx, animal, screenX, screenY, s, sizeMultiplier); break;
        case 'pig': renderPigSprite(ctx, animal, screenX, screenY, s, sizeMultiplier); break;
        case 'slime': renderSlimeSprite(ctx, animal, screenX, screenY, s, sizeMultiplier); break;
        case 'cow': renderCowSprite(ctx, animal, screenX, screenY, s, sizeMultiplier); break;
        case 'horse': renderHorseSprite(ctx, animal, screenX, screenY, s, sizeMultiplier); break;
        case 'wolf': renderWolfSprite(ctx, animal, screenX, screenY, s, sizeMultiplier); break;
        case 'rabbit': renderRabbitSprite(ctx, animal, screenX, screenY, s, sizeMultiplier); break;
        case 'bee': renderBeeSprite(ctx, animal, screenX, screenY, s, sizeMultiplier); break;
        default: renderSheepSprite(ctx, animal, screenX, screenY, s, sizeMultiplier);
    }

    // Tamed indicator
    if (animal.isTamed) {
        renderTamedIndicator(ctx, animal, screenX, screenY, s);
    }

    // Health bar if damaged
    if (animal.health < animal.maxHealth) {
        renderAnimalHealthBar(ctx, animal, screenX, screenY, s);
    }

    ctx.restore();
};

// ============= TAMED INDICATOR =============
function renderTamedIndicator(ctx, animal, sx, sy, s) {
    const size = animal.size || 0.5;
    if (animal.isFollowing) {
        ctx.fillStyle = 'rgba(100, 200, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(sx + s * 0.5, sy + s * size * 0.1, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ============= SHEEP SPRITE =============
function renderSheepSprite(ctx, animal, sx, sy, s, sizeMult = 1) {
    const p = ANIMAL_PALETTE.sheep;
    const size = (animal.size || 0.7) * sizeMult;
    const w = s * size;
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.55;
    const dir = animal.direction || 1;

    const walkCycle = animal.isMoving ? Math.sin(animal.animTimer * 10) : 0;
    const bobY = animal.isMoving ? Math.sin(animal.animTimer * 10) * 2 : 0;
    const legSwing = walkCycle * w * 0.08;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + w * 0.35, w * 0.4, w * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Back legs
    ctx.fillStyle = p.legs;
    ctx.fillRect(cx - w * 0.25 - legSwing, cy + w * 0.15, w * 0.1, w * 0.22);
    ctx.fillRect(cx + w * 0.15 + legSwing, cy + w * 0.15, w * 0.1, w * 0.22);

    // Body
    ctx.fillStyle = p.dark;
    ctx.beginPath();
    ctx.ellipse(cx, cy + bobY, w * 0.48, w * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(cx, cy + bobY, w * 0.45, w * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wool puffs
    ctx.fillStyle = p.light;
    const puffPositions = [
        { x: -0.2, y: -0.15 }, { x: 0.2, y: -0.15 }, { x: 0, y: -0.2 },
        { x: -0.25, y: 0.05 }, { x: 0.25, y: 0.05 }, { x: 0, y: 0.1 }
    ];
    for (const puff of puffPositions) {
        ctx.beginPath();
        ctx.arc(cx + puff.x * w, cy + puff.y * w + bobY, w * 0.12, 0, Math.PI * 2);
        ctx.fill();
    }

    // Front legs
    ctx.fillStyle = p.legs;
    ctx.fillRect(cx - w * 0.2 + legSwing, cy + w * 0.18, w * 0.1, w * 0.2);
    ctx.fillRect(cx + w * 0.1 - legSwing, cy + w * 0.18, w * 0.1, w * 0.2);

    // Head
    const headX = cx + dir * w * 0.35;
    const headY = cy - w * 0.1 + bobY;

    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(headX, headY, w * 0.2, w * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.face;
    ctx.beginPath();
    ctx.ellipse(headX, headY, w * 0.17, w * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wool tuft
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.arc(headX - dir * w * 0.05, headY - w * 0.15, w * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = p.face;
    ctx.beginPath();
    ctx.ellipse(headX - w * 0.15, headY - w * 0.05, w * 0.08, w * 0.05, -0.4, 0, Math.PI * 2);
    ctx.ellipse(headX + w * 0.15, headY - w * 0.05, w * 0.08, w * 0.05, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = p.eyes;
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.06, headY - w * 0.02, w * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.12, headY + w * 0.05, w * 0.04, w * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();
}

// ============= CHICKEN SPRITE =============
function renderChickenSprite(ctx, animal, sx, sy, s, sizeMult = 1) {
    const p = ANIMAL_PALETTE.chicken;
    const size = (animal.size || 0.4) * sizeMult;
    const w = s * size;
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.6;
    const dir = animal.direction || 1;

    const walkCycle = animal.isMoving ? Math.sin(animal.animTimer * 15) : 0;
    const bobY = Math.sin(animal.animTimer * 8) * w * 0.05;
    const headBob = Math.sin(animal.animTimer * 12) * w * 0.1;
    const legSwing = walkCycle * w * 0.15;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + w * 0.4, w * 0.35, w * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.strokeStyle = p.legs;
    ctx.lineWidth = w * 0.08;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.15, cy + w * 0.1);
    ctx.lineTo(cx - w * 0.2 - legSwing * 0.3, cy + w * 0.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + w * 0.15, cy + w * 0.1);
    ctx.lineTo(cx + w * 0.2 + legSwing * 0.3, cy + w * 0.35);
    ctx.stroke();

    // Body
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(cx, cy + bobY, w * 0.42, w * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(cx, cy + bobY, w * 0.38, w * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wing
    ctx.fillStyle = p.dark;
    ctx.beginPath();
    ctx.ellipse(cx - dir * w * 0.1, cy + w * 0.05 + bobY, w * 0.22, w * 0.18, dir * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.beginPath();
    ctx.moveTo(cx - dir * w * 0.3, cy - w * 0.1 + bobY);
    ctx.lineTo(cx - dir * w * 0.5, cy - w * 0.3 + bobY);
    ctx.lineTo(cx - dir * w * 0.4, cy - w * 0.35 + bobY);
    ctx.lineTo(cx - dir * w * 0.3, cy - w * 0.25 + bobY);
    ctx.lineTo(cx - dir * w * 0.2, cy + bobY);
    ctx.closePath();
    ctx.fill();

    // Head
    const headX = cx + dir * w * 0.35 + headBob * dir;
    const headY = cy - w * 0.2 + bobY;

    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.arc(headX, headY, w * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.arc(headX, headY, w * 0.19, 0, Math.PI * 2);
    ctx.fill();

    // Comb
    ctx.fillStyle = p.comb;
    ctx.beginPath();
    ctx.arc(headX, headY - w * 0.18, w * 0.08, 0, Math.PI * 2);
    ctx.arc(headX - w * 0.08, headY - w * 0.14, w * 0.06, 0, Math.PI * 2);
    ctx.arc(headX + w * 0.08, headY - w * 0.14, w * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // Wattle
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.08, headY + w * 0.12, w * 0.05, w * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = p.beak;
    ctx.beginPath();
    ctx.moveTo(headX + dir * w * 0.15, headY);
    ctx.lineTo(headX + dir * w * 0.3, headY + w * 0.02);
    ctx.lineTo(headX + dir * w * 0.15, headY + w * 0.06);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = p.eyes;
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.08, headY - w * 0.02, w * 0.04, 0, Math.PI * 2);
    ctx.fill();
}

// ============= PIG SPRITE =============
function renderPigSprite(ctx, animal, sx, sy, s, sizeMult = 1) {
    const p = ANIMAL_PALETTE.pig;
    const size = (animal.size || 0.65) * sizeMult;
    const w = s * size;
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.55;
    const dir = animal.direction || 1;

    const walkCycle = animal.isMoving ? Math.sin(animal.animTimer * 8) : 0;
    const bobY = animal.isMoving ? Math.sin(animal.animTimer * 8) * 2 : 0;
    const legSwing = walkCycle * w * 0.1;
    const earWiggle = Math.sin(animal.animTimer * 5) * 0.1;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + w * 0.35, w * 0.45, w * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Back legs
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(cx - w * 0.28 - legSwing, cy + w * 0.12, w * 0.14, w * 0.26);
    ctx.fillRect(cx + w * 0.14 + legSwing, cy + w * 0.12, w * 0.14, w * 0.26);
    ctx.fillStyle = p.body;
    ctx.fillRect(cx - w * 0.26 - legSwing, cy + w * 0.14, w * 0.1, w * 0.22);
    ctx.fillRect(cx + w * 0.16 + legSwing, cy + w * 0.14, w * 0.1, w * 0.22);

    // Hooves
    ctx.fillStyle = p.hooves;
    ctx.fillRect(cx - w * 0.26 - legSwing, cy + w * 0.32, w * 0.1, w * 0.05);
    ctx.fillRect(cx + w * 0.16 + legSwing, cy + w * 0.32, w * 0.1, w * 0.05);

    // Body
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(cx, cy + bobY, w * 0.5, w * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(cx, cy + bobY, w * 0.47, w * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly highlight
    ctx.fillStyle = p.light;
    ctx.beginPath();
    ctx.ellipse(cx, cy + w * 0.1 + bobY, w * 0.3, w * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Front legs
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(cx - w * 0.2 + legSwing, cy + w * 0.15, w * 0.12, w * 0.24);
    ctx.fillRect(cx + w * 0.08 - legSwing, cy + w * 0.15, w * 0.12, w * 0.24);
    ctx.fillStyle = p.body;
    ctx.fillRect(cx - w * 0.18 + legSwing, cy + w * 0.17, w * 0.08, w * 0.2);
    ctx.fillRect(cx + w * 0.1 - legSwing, cy + w * 0.17, w * 0.08, w * 0.2);

    // Curly tail
    ctx.strokeStyle = p.body;
    ctx.lineWidth = w * 0.06;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - dir * w * 0.45, cy - w * 0.1 + bobY);
    ctx.bezierCurveTo(cx - dir * w * 0.55, cy - w * 0.2 + bobY, cx - dir * w * 0.45, cy - w * 0.25 + bobY, cx - dir * w * 0.5, cy - w * 0.15 + bobY);
    ctx.stroke();

    // Head
    const headX = cx + dir * w * 0.4;
    const headY = cy - w * 0.05 + bobY;

    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(headX, headY, w * 0.28, w * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(headX, headY, w * 0.25, w * 0.21, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = p.dark;
    ctx.beginPath();
    ctx.ellipse(headX - w * 0.15, headY - w * 0.18, w * 0.1, w * 0.08, -0.5 + earWiggle, 0, Math.PI * 2);
    ctx.ellipse(headX + w * 0.15, headY - w * 0.18, w * 0.1, w * 0.08, 0.5 - earWiggle, 0, Math.PI * 2);
    ctx.fill();

    // Snout
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.18, headY + w * 0.05, w * 0.14, w * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.snout;
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.18, headY + w * 0.05, w * 0.12, w * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nostrils
    ctx.fillStyle = p.dark;
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.2, headY + w * 0.03, w * 0.03, w * 0.025, 0, 0, Math.PI * 2);
    ctx.ellipse(headX + dir * w * 0.2, headY + w * 0.08, w * 0.03, w * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.05, headY - w * 0.05, w * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.eyes;
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.06, headY - w * 0.05, w * 0.035, 0, Math.PI * 2);
    ctx.fill();
}

// ============= SLIME SPRITE =============
function renderSlimeSprite(ctx, animal, sx, sy, s, sizeMult = 1) {
    const size = (animal.size || 0.5) * sizeMult;
    const w = s * size;
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.55;

    const colors = animal.slimeColor || { body: '#44dd44', light: '#66ff66', dark: '#22aa22' };
    const bounceHeight = (animal.bounceHeight || 0) * s;
    const squash = animal.squashAmount || 0;
    const squashY = 1 + squash * 0.4;
    const squashX = 1 - squash * 0.2;
    const wobble = Math.sin(animal.animTimer * 4) * w * 0.02;
    const drawY = cy - bounceHeight;

    // Shadow
    const shadowScale = Math.max(0.3, 1 - bounceHeight / (s * 0.5));
    ctx.fillStyle = `rgba(0, 0, 0, ${0.25 * shadowScale})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy + w * 0.35, w * 0.4 * shadowScale, w * 0.12 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = colors.dark;
    ctx.beginPath();
    ctx.ellipse(cx + wobble, drawY + w * 0.05, w * 0.48 * squashX, w * 0.42 / squashY, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colors.body;
    ctx.beginPath();
    ctx.ellipse(cx + wobble, drawY, w * 0.45 * squashX, w * 0.4 / squashY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = colors.light;
    ctx.beginPath();
    ctx.ellipse(cx - w * 0.12 + wobble, drawY - w * 0.15 / squashY, w * 0.2 * squashX, w * 0.15 / squashY, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(cx - w * 0.15 + wobble, drawY - w * 0.18 / squashY, w * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Eyes
    const eyeY = drawY - w * 0.05 / squashY;
    const eyeSpacing = w * 0.15 * squashX;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx - eyeSpacing + wobble, eyeY, w * 0.1 * squashX, w * 0.12 / squashY, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + eyeSpacing + wobble, eyeY, w * 0.1 * squashX, w * 0.12 / squashY, 0, 0, Math.PI * 2);
    ctx.fill();

    const pupilOffsetX = (animal.direction || 1) * w * 0.02;
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(cx - eyeSpacing + pupilOffsetX + wobble, eyeY, w * 0.05, 0, Math.PI * 2);
    ctx.arc(cx + eyeSpacing + pupilOffsetX + wobble, eyeY, w * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = w * 0.03;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx + wobble, drawY + w * 0.12 / squashY, w * 0.08, 0.2, Math.PI - 0.2);
    ctx.stroke();
}

// ============= COW SPRITE =============
function renderCowSprite(ctx, animal, sx, sy, s, sizeMult = 1) {
    const p = ANIMAL_PALETTE.cow;
    const size = (animal.size || 0.85) * sizeMult;
    const w = s * size;
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.5;
    const dir = animal.direction || 1;

    const walkCycle = animal.isMoving ? Math.sin(animal.animTimer * 6) : 0;
    const bobY = animal.isMoving ? Math.sin(animal.animTimer * 6) * 2 : 0;
    const legSwing = walkCycle * w * 0.08;
    const tailSwing = Math.sin(animal.animTimer * 3) * 0.3;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + w * 0.42, w * 0.5, w * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Back legs
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(cx - w * 0.32 - legSwing, cy + w * 0.15, w * 0.12, w * 0.3);
    ctx.fillRect(cx + w * 0.2 + legSwing, cy + w * 0.15, w * 0.12, w * 0.3);
    ctx.fillStyle = p.body;
    ctx.fillRect(cx - w * 0.3 - legSwing, cy + w * 0.17, w * 0.08, w * 0.26);
    ctx.fillRect(cx + w * 0.22 + legSwing, cy + w * 0.17, w * 0.08, w * 0.26);

    // Hooves
    ctx.fillStyle = p.hooves;
    ctx.fillRect(cx - w * 0.3 - legSwing, cy + w * 0.4, w * 0.08, w * 0.05);
    ctx.fillRect(cx + w * 0.22 + legSwing, cy + w * 0.4, w * 0.08, w * 0.05);

    // Body
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(cx, cy + bobY, w * 0.52, w * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(cx, cy + bobY, w * 0.48, w * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spots
    ctx.fillStyle = p.spots;
    ctx.beginPath();
    ctx.ellipse(cx - w * 0.15, cy - w * 0.1 + bobY, w * 0.12, w * 0.1, 0.3, 0, Math.PI * 2);
    ctx.ellipse(cx + w * 0.2, cy + w * 0.05 + bobY, w * 0.1, w * 0.08, -0.2, 0, Math.PI * 2);
    ctx.ellipse(cx - w * 0.05, cy + w * 0.15 + bobY, w * 0.08, w * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // Udder
    ctx.fillStyle = p.snout;
    ctx.beginPath();
    ctx.ellipse(cx + w * 0.05, cy + w * 0.28 + bobY, w * 0.12, w * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Front legs
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(cx - w * 0.22 + legSwing, cy + w * 0.18, w * 0.12, w * 0.28);
    ctx.fillRect(cx + w * 0.1 - legSwing, cy + w * 0.18, w * 0.12, w * 0.28);
    ctx.fillStyle = p.body;
    ctx.fillRect(cx - w * 0.2 + legSwing, cy + w * 0.2, w * 0.08, w * 0.24);
    ctx.fillRect(cx + w * 0.12 - legSwing, cy + w * 0.2, w * 0.08, w * 0.24);

    // Front hooves
    ctx.fillStyle = p.hooves;
    ctx.fillRect(cx - w * 0.2 + legSwing, cy + w * 0.41, w * 0.08, w * 0.05);
    ctx.fillRect(cx + w * 0.12 - legSwing, cy + w * 0.41, w * 0.08, w * 0.05);

    // Tail
    ctx.strokeStyle = p.body;
    ctx.lineWidth = w * 0.04;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - dir * w * 0.48, cy - w * 0.05 + bobY);
    ctx.quadraticCurveTo(cx - dir * w * 0.55 + Math.sin(tailSwing) * w * 0.1, cy + w * 0.15 + bobY, cx - dir * w * 0.5 + Math.sin(tailSwing) * w * 0.15, cy + w * 0.35 + bobY);
    ctx.stroke();

    // Tail tuft
    ctx.fillStyle = p.spots;
    ctx.beginPath();
    ctx.ellipse(cx - dir * w * 0.5 + Math.sin(tailSwing) * w * 0.15, cy + w * 0.38 + bobY, w * 0.06, w * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    const headX = cx + dir * w * 0.42;
    const headY = cy - w * 0.12 + bobY;

    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(headX, headY, w * 0.22, w * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(headX, headY, w * 0.19, w * 0.17, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head spot
    ctx.fillStyle = p.spots;
    ctx.beginPath();
    ctx.ellipse(headX - dir * w * 0.05, headY - w * 0.08, w * 0.08, w * 0.06, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Horns
    ctx.fillStyle = p.horns;
    ctx.beginPath();
    ctx.moveTo(headX - w * 0.12, headY - w * 0.12);
    ctx.quadraticCurveTo(headX - w * 0.18, headY - w * 0.22, headX - w * 0.1, headY - w * 0.25);
    ctx.lineTo(headX - w * 0.08, headY - w * 0.12);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(headX + w * 0.12, headY - w * 0.12);
    ctx.quadraticCurveTo(headX + w * 0.18, headY - w * 0.22, headX + w * 0.1, headY - w * 0.25);
    ctx.lineTo(headX + w * 0.08, headY - w * 0.12);
    ctx.fill();

    // Ears
    ctx.fillStyle = p.dark;
    ctx.beginPath();
    ctx.ellipse(headX - w * 0.18, headY - w * 0.02, w * 0.08, w * 0.05, -0.6, 0, Math.PI * 2);
    ctx.ellipse(headX + w * 0.18, headY - w * 0.02, w * 0.08, w * 0.05, 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Snout
    ctx.fillStyle = p.snout;
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.12, headY + w * 0.08, w * 0.1, w * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nostrils
    ctx.fillStyle = p.hooves;
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.14, headY + w * 0.06, w * 0.025, w * 0.02, 0, 0, Math.PI * 2);
    ctx.ellipse(headX + dir * w * 0.14, headY + w * 0.1, w * 0.025, w * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.05, headY - w * 0.02, w * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.eyes;
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.06, headY - w * 0.02, w * 0.03, 0, Math.PI * 2);
    ctx.fill();
}

// ============= HORSE SPRITE =============
function renderHorseSprite(ctx, animal, sx, sy, s, sizeMult = 1) {
    const p = ANIMAL_PALETTE.horse;
    const size = (animal.size || 0.9) * sizeMult;
    const w = s * size;
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.45;
    const dir = animal.direction || 1;

    const walkCycle = animal.isMoving ? Math.sin(animal.animTimer * 10) : 0;
    const bobY = animal.isMoving ? Math.abs(Math.sin(animal.animTimer * 10)) * 3 : 0;
    const legSwing = walkCycle * w * 0.15;
    const maneWave = Math.sin(animal.animTimer * 4) * 0.1;
    const tailWave = Math.sin(animal.animTimer * 3) * 0.2;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + w * 0.5, w * 0.45, w * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Back legs
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(cx - w * 0.28 - legSwing, cy + w * 0.2, w * 0.1, w * 0.35);
    ctx.fillRect(cx + w * 0.18 + legSwing, cy + w * 0.2, w * 0.1, w * 0.35);
    ctx.fillStyle = p.body;
    ctx.fillRect(cx - w * 0.26 - legSwing, cy + w * 0.22, w * 0.06, w * 0.31);
    ctx.fillRect(cx + w * 0.2 + legSwing, cy + w * 0.22, w * 0.06, w * 0.31);

    // Hooves
    ctx.fillStyle = p.hooves;
    ctx.fillRect(cx - w * 0.27 - legSwing, cy + w * 0.5, w * 0.08, w * 0.05);
    ctx.fillRect(cx + w * 0.19 + legSwing, cy + w * 0.5, w * 0.08, w * 0.05);

    // Body
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(cx, cy + bobY, w * 0.45, w * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(cx, cy + bobY, w * 0.42, w * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = p.light;
    ctx.beginPath();
    ctx.ellipse(cx, cy + w * 0.12 + bobY, w * 0.3, w * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Front legs
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(cx - w * 0.18 + legSwing, cy + w * 0.22, w * 0.1, w * 0.33);
    ctx.fillRect(cx + w * 0.08 - legSwing, cy + w * 0.22, w * 0.1, w * 0.33);
    ctx.fillStyle = p.body;
    ctx.fillRect(cx - w * 0.16 + legSwing, cy + w * 0.24, w * 0.06, w * 0.29);
    ctx.fillRect(cx + w * 0.1 - legSwing, cy + w * 0.24, w * 0.06, w * 0.29);

    // Front hooves
    ctx.fillStyle = p.hooves;
    ctx.fillRect(cx - w * 0.17 + legSwing, cy + w * 0.5, w * 0.08, w * 0.05);
    ctx.fillRect(cx + w * 0.09 - legSwing, cy + w * 0.5, w * 0.08, w * 0.05);

    // Tail
    ctx.fillStyle = p.mane;
    ctx.beginPath();
    ctx.moveTo(cx - dir * w * 0.42, cy - w * 0.1 + bobY);
    ctx.quadraticCurveTo(cx - dir * w * 0.55 + Math.sin(tailWave) * w * 0.1, cy + w * 0.1 + bobY, cx - dir * w * 0.6 + Math.sin(tailWave) * w * 0.2, cy + w * 0.4 + bobY);
    ctx.quadraticCurveTo(cx - dir * w * 0.5 + Math.sin(tailWave) * w * 0.15, cy + w * 0.2 + bobY, cx - dir * w * 0.4, cy - w * 0.05 + bobY);
    ctx.fill();

    // Neck
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.moveTo(cx + dir * w * 0.35, cy - w * 0.1 + bobY);
    ctx.quadraticCurveTo(cx + dir * w * 0.45, cy - w * 0.25 + bobY, cx + dir * w * 0.4, cy - w * 0.4 + bobY);
    ctx.lineTo(cx + dir * w * 0.3, cy - w * 0.35 + bobY);
    ctx.quadraticCurveTo(cx + dir * w * 0.35, cy - w * 0.2 + bobY, cx + dir * w * 0.25, cy - w * 0.05 + bobY);
    ctx.fill();

    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.moveTo(cx + dir * w * 0.33, cy - w * 0.08 + bobY);
    ctx.quadraticCurveTo(cx + dir * w * 0.42, cy - w * 0.23 + bobY, cx + dir * w * 0.38, cy - w * 0.38 + bobY);
    ctx.lineTo(cx + dir * w * 0.32, cy - w * 0.33 + bobY);
    ctx.quadraticCurveTo(cx + dir * w * 0.35, cy - w * 0.18 + bobY, cx + dir * w * 0.27, cy - w * 0.03 + bobY);
    ctx.fill();

    // Mane
    ctx.fillStyle = p.mane;
    for (let i = 0; i < 6; i++) {
        const my = cy - w * (0.35 - i * 0.07) + bobY;
        const mx = cx + dir * w * (0.38 - i * 0.02);
        const wave = Math.sin(maneWave + i * 0.5) * w * 0.03;
        ctx.beginPath();
        ctx.ellipse(mx + wave, my, w * 0.06, w * 0.04, dir * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Head
    const headX = cx + dir * w * 0.42;
    const headY = cy - w * 0.45 + bobY;

    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(headX, headY, w * 0.18, w * 0.12, dir * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(headX, headY, w * 0.15, w * 0.1, dir * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Blaze (face marking)
    ctx.fillStyle = p.blaze;
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.02, headY, w * 0.04, w * 0.08, dir * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Muzzle
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.12, headY + w * 0.08, w * 0.1, w * 0.07, dir * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.light;
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.12, headY + w * 0.08, w * 0.08, w * 0.05, dir * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Nostrils
    ctx.fillStyle = p.dark;
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.15, headY + w * 0.08, w * 0.02, w * 0.015, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.moveTo(headX - w * 0.08, headY - w * 0.08);
    ctx.lineTo(headX - w * 0.12, headY - w * 0.18);
    ctx.lineTo(headX - w * 0.04, headY - w * 0.1);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(headX + w * 0.08, headY - w * 0.08);
    ctx.lineTo(headX + w * 0.12, headY - w * 0.18);
    ctx.lineTo(headX + w * 0.04, headY - w * 0.1);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.02, headY - w * 0.02, w * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.eyes;
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.03, headY - w * 0.02, w * 0.025, 0, Math.PI * 2);
    ctx.fill();
}

// ============= WOLF SPRITE =============
function renderWolfSprite(ctx, animal, sx, sy, s, sizeMult = 1) {
    const p = ANIMAL_PALETTE.wolf;
    const size = (animal.size || 0.6) * sizeMult;
    const w = s * size;
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.55;
    const dir = animal.direction || 1;

    const walkCycle = animal.isMoving ? Math.sin(animal.animTimer * 12) : 0;
    const bobY = animal.isMoving ? Math.sin(animal.animTimer * 12) * 2 : 0;
    const legSwing = walkCycle * w * 0.12;
    const tailWag = Math.sin(animal.animTimer * 6) * 0.3;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + w * 0.4, w * 0.45, w * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Back legs
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(cx - w * 0.3 - legSwing, cy + w * 0.15, w * 0.1, w * 0.28);
    ctx.fillRect(cx + w * 0.2 + legSwing, cy + w * 0.15, w * 0.1, w * 0.28);
    ctx.fillStyle = p.body;
    ctx.fillRect(cx - w * 0.28 - legSwing, cy + w * 0.17, w * 0.06, w * 0.24);
    ctx.fillRect(cx + w * 0.22 + legSwing, cy + w * 0.17, w * 0.06, w * 0.24);

    // Paws
    ctx.fillStyle = p.dark;
    ctx.fillRect(cx - w * 0.29 - legSwing, cy + w * 0.38, w * 0.08, w * 0.06);
    ctx.fillRect(cx + w * 0.21 + legSwing, cy + w * 0.38, w * 0.08, w * 0.06);

    // Tail
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.moveTo(cx - dir * w * 0.4, cy - w * 0.05 + bobY);
    ctx.quadraticCurveTo(cx - dir * w * 0.5 + Math.sin(tailWag) * w * 0.15, cy - w * 0.1 + bobY, cx - dir * w * 0.55 + Math.sin(tailWag) * w * 0.2, cy - w * 0.2 + bobY);
    ctx.quadraticCurveTo(cx - dir * w * 0.45 + Math.sin(tailWag) * w * 0.1, cy - w * 0.05 + bobY, cx - dir * w * 0.38, cy + w * 0.05 + bobY);
    ctx.fill();

    // Tail tip
    ctx.fillStyle = p.light;
    ctx.beginPath();
    ctx.arc(cx - dir * w * 0.55 + Math.sin(tailWag) * w * 0.2, cy - w * 0.22 + bobY, w * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(cx, cy + bobY, w * 0.45, w * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(cx, cy + bobY, w * 0.42, w * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = p.belly;
    ctx.beginPath();
    ctx.ellipse(cx, cy + w * 0.1 + bobY, w * 0.28, w * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Front legs
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(cx - w * 0.18 + legSwing, cy + w * 0.18, w * 0.1, w * 0.26);
    ctx.fillRect(cx + w * 0.08 - legSwing, cy + w * 0.18, w * 0.1, w * 0.26);
    ctx.fillStyle = p.body;
    ctx.fillRect(cx - w * 0.16 + legSwing, cy + w * 0.2, w * 0.06, w * 0.22);
    ctx.fillRect(cx + w * 0.1 - legSwing, cy + w * 0.2, w * 0.06, w * 0.22);

    // Front paws
    ctx.fillStyle = p.dark;
    ctx.fillRect(cx - w * 0.17 + legSwing, cy + w * 0.39, w * 0.08, w * 0.06);
    ctx.fillRect(cx + w * 0.09 - legSwing, cy + w * 0.39, w * 0.08, w * 0.06);

    // Neck/chest
    ctx.fillStyle = p.light;
    ctx.beginPath();
    ctx.ellipse(cx + dir * w * 0.25, cy - w * 0.1 + bobY, w * 0.15, w * 0.18, dir * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Head
    const headX = cx + dir * w * 0.38;
    const headY = cy - w * 0.15 + bobY;

    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(headX, headY, w * 0.2, w * 0.16, dir * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(headX, headY, w * 0.17, w * 0.14, dir * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Snout
    ctx.fillStyle = p.light;
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.15, headY + w * 0.04, w * 0.1, w * 0.08, dir * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = p.nose;
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.22, headY + w * 0.04, w * 0.04, w * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = p.ears;
    ctx.beginPath();
    ctx.moveTo(headX - w * 0.1, headY - w * 0.1);
    ctx.lineTo(headX - w * 0.15, headY - w * 0.25);
    ctx.lineTo(headX - w * 0.02, headY - w * 0.1);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(headX + w * 0.1, headY - w * 0.1);
    ctx.lineTo(headX + w * 0.15, headY - w * 0.25);
    ctx.lineTo(headX + w * 0.02, headY - w * 0.1);
    ctx.fill();

    // Inner ears
    ctx.fillStyle = p.light;
    ctx.beginPath();
    ctx.moveTo(headX - w * 0.08, headY - w * 0.12);
    ctx.lineTo(headX - w * 0.12, headY - w * 0.2);
    ctx.lineTo(headX - w * 0.04, headY - w * 0.12);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(headX + w * 0.08, headY - w * 0.12);
    ctx.lineTo(headX + w * 0.12, headY - w * 0.2);
    ctx.lineTo(headX + w * 0.04, headY - w * 0.12);
    ctx.fill();

    // Eyes (yellow/amber for wolves)
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.05, headY - w * 0.02, w * 0.045, w * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.eyes;
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.05, headY - w * 0.02, w * 0.03, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.055, headY - w * 0.02, w * 0.015, 0, Math.PI * 2);
    ctx.fill();
}

// ============= RABBIT SPRITE =============
function renderRabbitSprite(ctx, animal, sx, sy, s, sizeMult = 1) {
    const p = ANIMAL_PALETTE.rabbit;
    const size = (animal.size || 0.35) * sizeMult;
    const w = s * size;
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.6;
    const dir = animal.direction || 1;

    const hopCycle = animal.isMoving ? Math.abs(Math.sin(animal.animTimer * 12)) : 0;
    const hopY = hopCycle * w * 0.3;
    const legTuck = hopCycle * 0.3;
    const earWiggle = Math.sin(animal.animTimer * 5) * 0.15;

    // Shadow
    const shadowScale = 1 - hopCycle * 0.3;
    ctx.fillStyle = `rgba(0, 0, 0, ${0.2 * shadowScale})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy + w * 0.35, w * 0.35 * shadowScale, w * 0.1 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Back legs
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(cx - w * 0.2, cy + w * 0.15 - hopY + legTuck * w * 0.1, w * 0.15, w * 0.1, -0.3 - legTuck, 0, Math.PI * 2);
    ctx.ellipse(cx + w * 0.2, cy + w * 0.15 - hopY + legTuck * w * 0.1, w * 0.15, w * 0.1, 0.3 + legTuck, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.fillStyle = p.tail;
    ctx.beginPath();
    ctx.arc(cx - dir * w * 0.35, cy - w * 0.05 - hopY, w * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(cx, cy - hopY, w * 0.38, w * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(cx, cy - hopY, w * 0.35, w * 0.27, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = p.light;
    ctx.beginPath();
    ctx.ellipse(cx, cy + w * 0.08 - hopY, w * 0.2, w * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Front paws
    ctx.fillStyle = p.dark;
    ctx.beginPath();
    ctx.ellipse(cx - w * 0.1, cy + w * 0.2 - hopY - legTuck * w * 0.15, w * 0.06, w * 0.04, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + w * 0.1, cy + w * 0.2 - hopY - legTuck * w * 0.15, w * 0.06, w * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    const headX = cx + dir * w * 0.25;
    const headY = cy - w * 0.25 - hopY;

    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(headX, headY, w * 0.22, w * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(headX, headY, w * 0.19, w * 0.17, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cheeks
    ctx.fillStyle = p.light;
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.08, headY + w * 0.05, w * 0.1, w * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(headX - w * 0.08, headY - w * 0.35 + earWiggle * w * 0.1, w * 0.06, w * 0.2, -0.15 + earWiggle, 0, Math.PI * 2);
    ctx.ellipse(headX + w * 0.08, headY - w * 0.35 - earWiggle * w * 0.1, w * 0.06, w * 0.2, 0.15 - earWiggle, 0, Math.PI * 2);
    ctx.fill();

    // Inner ears
    ctx.fillStyle = p.ears;
    ctx.beginPath();
    ctx.ellipse(headX - w * 0.08, headY - w * 0.33 + earWiggle * w * 0.1, w * 0.035, w * 0.14, -0.15 + earWiggle, 0, Math.PI * 2);
    ctx.ellipse(headX + w * 0.08, headY - w * 0.33 - earWiggle * w * 0.1, w * 0.035, w * 0.14, 0.15 - earWiggle, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.06, headY - w * 0.02, w * 0.055, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.eyes;
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.07, headY - w * 0.02, w * 0.035, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.08, headY - w * 0.03, w * 0.015, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = p.nose;
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.15, headY + w * 0.02, w * 0.04, w * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();

    // Whiskers
    ctx.strokeStyle = p.dark;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(headX + dir * w * 0.12, headY + w * 0.04);
    ctx.lineTo(headX + dir * w * 0.25, headY + w * 0.02);
    ctx.moveTo(headX + dir * w * 0.12, headY + w * 0.06);
    ctx.lineTo(headX + dir * w * 0.25, headY + w * 0.08);
    ctx.moveTo(headX + dir * w * 0.12, headY + w * 0.08);
    ctx.lineTo(headX + dir * w * 0.25, headY + w * 0.12);
    ctx.stroke();
}

// ============= BEE SPRITE =============
function renderBeeSprite(ctx, animal, sx, sy, s, sizeMult = 1) {
    const p = ANIMAL_PALETTE.bee;
    const size = (animal.size || 0.25) * sizeMult;
    const w = s * size;
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.5;
    const dir = animal.direction || 1;

    // Bee-specific animation values
    const wingPhase = animal.wingPhase || (animal.animTimer * 40);
    const hoverOffset = animal.hoverOffset || Math.sin(animal.animTimer * 5) * w * 0.3;
    const flyHeight = (animal.flyHeight || 0.3) * w;

    // Actual draw position (floating above ground)
    const drawY = cy - flyHeight - hoverOffset;

    // Shadow on ground (smaller when higher)
    const shadowScale = Math.max(0.4, 1 - (flyHeight + hoverOffset) / (w * 2));
    ctx.fillStyle = `rgba(0, 0, 0, ${0.2 * shadowScale})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy + w * 0.4, w * 0.35 * shadowScale, w * 0.1 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings (behind body, flapping)
    const wingFlap = Math.sin(wingPhase) * 0.4;
    ctx.fillStyle = p.wings;

    // Left wing
    ctx.save();
    ctx.translate(cx - w * 0.1, drawY - w * 0.1);
    ctx.rotate(-0.3 - wingFlap);
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.35, w * 0.15, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right wing
    ctx.save();
    ctx.translate(cx + w * 0.1, drawY - w * 0.1);
    ctx.rotate(0.3 + wingFlap);
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.35, w * 0.15, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Body (oval with stripes)
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(cx, drawY, w * 0.42, w * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(cx, drawY, w * 0.38, w * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();

    // Black stripes
    ctx.fillStyle = p.stripes;
    for (let i = 0; i < 3; i++) {
        const stripeX = cx - w * 0.15 + i * w * 0.15;
        ctx.fillRect(stripeX, drawY - w * 0.22, w * 0.08, w * 0.44);
    }

    // Fuzzy texture
    ctx.fillStyle = p.fuzz;
    ctx.beginPath();
    ctx.ellipse(cx - w * 0.15, drawY - w * 0.1, w * 0.12, w * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    const headX = cx + dir * w * 0.35;
    const headY = drawY - w * 0.05;

    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.arc(headX, headY, w * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.arc(headX, headY, w * 0.17, 0, Math.PI * 2);
    ctx.fill();

    // Antennae
    ctx.strokeStyle = p.stripes;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(headX - w * 0.08, headY - w * 0.12);
    ctx.quadraticCurveTo(headX - w * 0.12, headY - w * 0.25, headX - w * 0.05, headY - w * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(headX + w * 0.08, headY - w * 0.12);
    ctx.quadraticCurveTo(headX + w * 0.12, headY - w * 0.25, headX + w * 0.05, headY - w * 0.3);
    ctx.stroke();

    // Antenna tips
    ctx.fillStyle = p.stripes;
    ctx.beginPath();
    ctx.arc(headX - w * 0.05, headY - w * 0.3, w * 0.04, 0, Math.PI * 2);
    ctx.arc(headX + w * 0.05, headY - w * 0.3, w * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (compound eyes)
    ctx.fillStyle = p.eyes;
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.08, headY - w * 0.02, w * 0.07, w * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.1, headY - w * 0.04, w * 0.025, 0, Math.PI * 2);
    ctx.fill();

    // Legs (tiny, dangling)
    ctx.fillStyle = p.legs;
    const legWiggle = Math.sin(animal.animTimer * 8) * w * 0.03;
    for (let i = 0; i < 3; i++) {
        const legX = cx - w * 0.15 + i * w * 0.15;
        ctx.fillRect(legX + legWiggle * (i - 1), drawY + w * 0.15, 2, w * 0.2);
    }

    // Stinger (back)
    ctx.fillStyle = p.stinger;
    ctx.beginPath();
    ctx.moveTo(cx - dir * w * 0.35, drawY);
    ctx.lineTo(cx - dir * w * 0.5, drawY + w * 0.05);
    ctx.lineTo(cx - dir * w * 0.35, drawY + w * 0.1);
    ctx.closePath();
    ctx.fill();

    // Pollen particles if pollinating
    if (animal.isPollinatiing) {
        ctx.fillStyle = '#ffee44';
        for (let i = 0; i < 5; i++) {
            const px = cx + Math.sin(animal.animTimer * 3 + i * 1.3) * w * 0.5;
            const py = drawY + w * 0.3 + Math.cos(animal.animTimer * 2 + i) * w * 0.2;
            ctx.globalAlpha = 0.6 + Math.sin(animal.animTimer * 5 + i) * 0.3;
            ctx.fillRect(px, py, 3, 3);
        }
        ctx.globalAlpha = 1;
    }
}

// ============= HEALTH BAR =============
function renderAnimalHealthBar(ctx, animal, sx, sy, s) {
    const size = animal.size || 0.5;
    const barWidth = s * size * 0.8;
    const barHeight = 4;
    const barX = sx + s * 0.5 - barWidth / 2;
    const barY = sy + s * 0.1;

    const healthPercent = Math.max(0, animal.health / animal.maxHealth);
    const healthColor = healthPercent > 0.5 ? '#44dd44' : healthPercent > 0.25 ? '#dddd44' : '#dd4444';

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = healthColor;
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight / 2);
}
