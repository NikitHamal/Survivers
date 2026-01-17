// ============= ANIMAL SPRITES =============
// Modular pixel-art sprites for sheep, chickens, pigs, and slimes

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

    const typeId = animal.type?.id || animal.typeId || 'sheep';

    switch (typeId) {
        case 'sheep':
            renderSheepSprite(ctx, animal, screenX, screenY, s);
            break;
        case 'chicken':
            renderChickenSprite(ctx, animal, screenX, screenY, s);
            break;
        case 'pig':
            renderPigSprite(ctx, animal, screenX, screenY, s);
            break;
        case 'slime':
            renderSlimeSprite(ctx, animal, screenX, screenY, s);
            break;
        default:
            renderSheepSprite(ctx, animal, screenX, screenY, s);
    }

    if (animal.isTamed) {
        renderTamedCollar(ctx, animal, screenX, screenY, s);
    }

    // Health bar if damaged
    if (animal.health < animal.maxHealth) {
        renderAnimalHealthBar(ctx, animal, screenX, screenY, s);
    }

    ctx.restore();
};

function renderTamedCollar(ctx, animal, sx, sy, s) {
    const size = animal.size || 0.6;
    const w = s * size;
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.55;

    ctx.fillStyle = '#ffcc55';
    ctx.fillRect(cx - w * 0.12, cy - w * 0.05, w * 0.24, w * 0.05);
    ctx.fillStyle = '#d4942f';
    ctx.fillRect(cx - w * 0.02, cy - w * 0.02, w * 0.04, w * 0.04);
}

// ============= SHEEP SPRITE =============
function renderSheepSprite(ctx, animal, sx, sy, s) {
    const p = ANIMAL_PALETTE.sheep;
    const size = animal.size || 0.7;
    const w = s * size;
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.55;
    const dir = animal.direction || 1;

    // Animation
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

    // Fluffy body (wool) - multiple circles for fluffy effect
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

    // Head base (dark face)
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(headX, headY, w * 0.2, w * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.face;
    ctx.beginPath();
    ctx.ellipse(headX, headY, w * 0.17, w * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wool tuft on head
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

    // Nose/mouth
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.12, headY + w * 0.05, w * 0.04, w * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();
}

// ============= CHICKEN SPRITE =============
function renderChickenSprite(ctx, animal, sx, sy, s) {
    const p = ANIMAL_PALETTE.chicken;
    const size = animal.size || 0.4;
    const w = s * size;
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.6;
    const dir = animal.direction || 1;

    // Animation - pecking and walking
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

    // Left leg
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.15, cy + w * 0.1);
    ctx.lineTo(cx - w * 0.2 - legSwing * 0.3, cy + w * 0.35);
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(cx + w * 0.15, cy + w * 0.1);
    ctx.lineTo(cx + w * 0.2 + legSwing * 0.3, cy + w * 0.35);
    ctx.stroke();

    // Feet
    ctx.lineWidth = w * 0.05;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.25 - legSwing * 0.3, cy + w * 0.35);
    ctx.lineTo(cx - w * 0.15 - legSwing * 0.3, cy + w * 0.38);
    ctx.moveTo(cx + w * 0.25 + legSwing * 0.3, cy + w * 0.35);
    ctx.lineTo(cx + w * 0.15 + legSwing * 0.3, cy + w * 0.38);
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

    // Tail feathers
    ctx.fillStyle = p.dark;
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
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.09, headY - w * 0.03, w * 0.015, 0, Math.PI * 2);
    ctx.fill();
}

// ============= PIG SPRITE =============
function renderPigSprite(ctx, animal, sx, sy, s) {
    const p = ANIMAL_PALETTE.pig;
    const size = animal.size || 0.65;
    const w = s * size;
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.55;
    const dir = animal.direction || 1;

    // Animation
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

    // Front hooves
    ctx.fillStyle = p.hooves;
    ctx.fillRect(cx - w * 0.18 + legSwing, cy + w * 0.33, w * 0.08, w * 0.05);
    ctx.fillRect(cx + w * 0.1 - legSwing, cy + w * 0.33, w * 0.08, w * 0.05);

    // Tail (curly)
    ctx.strokeStyle = p.body;
    ctx.lineWidth = w * 0.06;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - dir * w * 0.45, cy - w * 0.1 + bobY);
    ctx.bezierCurveTo(
        cx - dir * w * 0.55, cy - w * 0.2 + bobY,
        cx - dir * w * 0.45, cy - w * 0.25 + bobY,
        cx - dir * w * 0.5, cy - w * 0.15 + bobY
    );
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

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.05, headY - w * 0.05, w * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.eyes;
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.06, headY - w * 0.05, w * 0.035, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.07, headY - w * 0.06, w * 0.015, 0, Math.PI * 2);
    ctx.fill();
}

// ============= SLIME SPRITE =============
function renderSlimeSprite(ctx, animal, sx, sy, s) {
    const size = animal.size || 0.5;
    const w = s * size;
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.55;

    // Get slime color or default to green
    const colors = animal.slimeColor || { body: '#44dd44', light: '#66ff66', dark: '#22aa22' };

    // Animation values
    const bounceHeight = (animal.bounceHeight || 0) * s;
    const squash = animal.squashAmount || 0;

    // Calculate dimensions based on squash
    const squashY = 1 + squash * 0.4;
    const squashX = 1 - squash * 0.2;

    // Idle wobble
    const wobble = Math.sin(animal.animTimer * 4) * w * 0.02;

    // Draw position (adjusted for bounce)
    const drawY = cy - bounceHeight;

    // Shadow (smaller when jumping)
    const shadowScale = Math.max(0.3, 1 - bounceHeight / (s * 0.5));
    ctx.fillStyle = `rgba(0, 0, 0, ${0.25 * shadowScale})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy + w * 0.35, w * 0.4 * shadowScale, w * 0.12 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main body - gel-like shape
    ctx.fillStyle = colors.dark;
    ctx.beginPath();
    ctx.ellipse(cx + wobble, drawY + w * 0.05, w * 0.48 * squashX, w * 0.42 / squashY, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colors.body;
    ctx.beginPath();
    ctx.ellipse(cx + wobble, drawY, w * 0.45 * squashX, w * 0.4 / squashY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glossy highlight
    ctx.fillStyle = colors.light;
    ctx.beginPath();
    ctx.ellipse(cx - w * 0.12 + wobble, drawY - w * 0.15 / squashY, w * 0.2 * squashX, w * 0.15 / squashY, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Small highlight dot
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(cx - w * 0.15 + wobble, drawY - w * 0.18 / squashY, w * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Eyes
    const eyeY = drawY - w * 0.05 / squashY;
    const eyeSpacing = w * 0.15 * squashX;

    // Eye whites
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx - eyeSpacing + wobble, eyeY, w * 0.1 * squashX, w * 0.12 / squashY, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + eyeSpacing + wobble, eyeY, w * 0.1 * squashX, w * 0.12 / squashY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupils - look in movement direction
    const pupilOffsetX = (animal.direction || 1) * w * 0.02;
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(cx - eyeSpacing + pupilOffsetX + wobble, eyeY, w * 0.05, 0, Math.PI * 2);
    ctx.arc(cx + eyeSpacing + pupilOffsetX + wobble, eyeY, w * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - eyeSpacing - w * 0.02 + wobble, eyeY - w * 0.03, w * 0.02, 0, Math.PI * 2);
    ctx.arc(cx + eyeSpacing - w * 0.02 + wobble, eyeY - w * 0.03, w * 0.02, 0, Math.PI * 2);
    ctx.fill();

    // Cute mouth
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = w * 0.03;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx + wobble, drawY + w * 0.12 / squashY, w * 0.08, 0.2, Math.PI - 0.2);
    ctx.stroke();
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

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

    // Health bar
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = healthColor;
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    // Shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight / 2);
}
