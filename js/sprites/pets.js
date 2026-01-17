// ============= PET & ANIMAL SPRITES =============
// Modular pixel-art sprites for all pet/animal types

// Animal color palettes
const ANIMAL_PALETTE = {
    wolf: { body: '#6a6a6a', light: '#8a8a8a', dark: '#4a4a4a', nose: '#222', eyes: '#ffa500' },
    bear: { body: '#4a3520', light: '#6a4530', dark: '#2a1510', nose: '#111', eyes: '#442200' },
    tiger: { body: '#d4881a', light: '#f4a83a', dark: '#a46800', stripes: '#222', eyes: '#44aa00' },
    hawk: { body: '#8b6914', light: '#ab8934', dark: '#5b4904', beak: '#f4a020', eyes: '#111' },
    fox: { body: '#d4642a', light: '#f4844a', dark: '#a4440a', white: '#fff8f0', nose: '#111' },
    horse: { body: '#8b4513', light: '#ab6533', dark: '#5b2503', mane: '#2a1a0a', eyes: '#222' },
    camel: { body: '#c4a35a', light: '#e4c37a', dark: '#94733a', hump: '#b4934a', eyes: '#442200' },
    boar: { body: '#5a4030', light: '#7a6050', dark: '#3a2010', tusks: '#f0f0e0', eyes: '#881100' },
    beaver: { body: '#4a3020', light: '#6a5040', dark: '#2a1000', tail: '#3a2515', teeth: '#fff8e0' },
    wolf_alpha: { body: '#2a2a2a', light: '#4a4a4a', dark: '#0a0a0a', eyes: '#ff4400', aura: '#6644ff' }
};

function renderPetSprite(ctx, pet, cam) {
    const s = TILE_SIZE * SCALE;
    const screenX = (pet.x - 0.5) * s - cam.x;
    const screenY = (pet.y - 0.5) * s - cam.y;

    if (screenX < -s * 2 || screenX > ctx.canvas.width + s || screenY < -s * 2 || screenY > ctx.canvas.height + s) return;

    const size = pet.size || 0.8;
    const typeId = pet.type?.id || pet.typeId || 'wolf';
    const palette = ANIMAL_PALETTE[typeId] || ANIMAL_PALETTE.wolf;

    // Animation
    const animTimer = pet.animTimer || 0;
    const isMoving = pet.aiState === 'follow' || pet.aiState === 'wander';
    const bob = isMoving ? Math.sin(animTimer * 10) * 2 : Math.sin(animTimer * 2) * 0.5;
    const legAnim = isMoving ? Math.sin(animTimer * 12) * s * 0.04 : 0;
    const dir = pet.direction || 1;

    ctx.save();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(screenX + s * 0.5, screenY + s * 0.85, s * size * 0.35, s * size * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Render based on type
    switch (typeId) {
        case 'wolf':
        case 'wolf_alpha':
            renderWolfSprite(ctx, screenX, screenY, s, size, palette, bob, legAnim, dir, typeId === 'wolf_alpha');
            break;
        case 'bear':
            renderBearSprite(ctx, screenX, screenY, s, size, palette, bob, legAnim, dir);
            break;
        case 'tiger':
            renderTigerSprite(ctx, screenX, screenY, s, size, palette, bob, legAnim, dir);
            break;
        case 'hawk':
            renderHawkSprite(ctx, screenX, screenY, s, size, palette, animTimer, dir);
            break;
        case 'fox':
            renderFoxSprite(ctx, screenX, screenY, s, size, palette, bob, legAnim, dir);
            break;
        case 'horse':
            renderHorseSprite(ctx, screenX, screenY, s, size, palette, bob, legAnim, dir);
            break;
        case 'camel':
            renderCamelSprite(ctx, screenX, screenY, s, size, palette, bob, legAnim, dir);
            break;
        case 'boar':
            renderBoarSprite(ctx, screenX, screenY, s, size, palette, bob, legAnim, dir);
            break;
        case 'beaver':
            renderBeaverSprite(ctx, screenX, screenY, s, size, palette, bob, legAnim, dir);
            break;
        default:
            renderGenericAnimal(ctx, screenX, screenY, s, size, palette, bob, dir);
    }

    // Status indicators for tamed pets
    if (!pet.isWild && pet.health !== undefined) {
        renderPetStatusBars(ctx, screenX, screenY, s, size, pet);
    }

    // Wild indicator
    if (pet.isWild) {
        ctx.fillStyle = '#ffcc00';
        ctx.font = `bold ${Math.floor(s * 0.15)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('★', screenX + s * 0.5, screenY + s * 0.1);
    }

    ctx.restore();
}

// ============= WOLF SPRITE =============
function renderWolfSprite(ctx, sx, sy, s, size, p, bob, legAnim, dir, isAlpha) {
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.5 + bob;
    const w = s * size;

    // Alpha aura
    if (isAlpha) {
        ctx.fillStyle = 'rgba(100, 68, 255, 0.2)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, w * 0.6, w * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Back legs
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(cx - w * 0.25 + legAnim, cy + w * 0.15, w * 0.12, w * 0.25);
    ctx.fillRect(cx + w * 0.15 - legAnim, cy + w * 0.15, w * 0.12, w * 0.25);
    ctx.fillStyle = p.dark;
    ctx.fillRect(cx - w * 0.23 + legAnim, cy + w * 0.17, w * 0.08, w * 0.21);
    ctx.fillRect(cx + w * 0.17 - legAnim, cy + w * 0.17, w * 0.08, w * 0.21);

    // Body outline
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.38, w * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.35, w * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body highlight
    ctx.fillStyle = p.light;
    ctx.beginPath();
    ctx.ellipse(cx, cy - w * 0.05, w * 0.2, w * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    const headX = cx + dir * w * 0.25;
    const headY = cy - w * 0.15;

    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(headX, headY, w * 0.22, w * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(headX, headY, w * 0.19, w * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Snout
    ctx.fillStyle = p.light;
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.12, headY + w * 0.05, w * 0.1, w * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = p.nose;
    ctx.fillRect(headX + dir * w * 0.18 - w * 0.03, headY + w * 0.03, w * 0.06, w * 0.04);

    // Ears
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.moveTo(headX - w * 0.1, headY - w * 0.1);
    ctx.lineTo(headX - w * 0.05, headY - w * 0.25);
    ctx.lineTo(headX + w * 0.02, headY - w * 0.1);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(headX + w * 0.1, headY - w * 0.1);
    ctx.lineTo(headX + w * 0.05, headY - w * 0.25);
    ctx.lineTo(headX - w * 0.02, headY - w * 0.1);
    ctx.fill();

    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.moveTo(headX - w * 0.08, headY - w * 0.1);
    ctx.lineTo(headX - w * 0.05, headY - w * 0.2);
    ctx.lineTo(headX, headY - w * 0.1);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(headX + w * 0.08, headY - w * 0.1);
    ctx.lineTo(headX + w * 0.05, headY - w * 0.2);
    ctx.lineTo(headX, headY - w * 0.1);
    ctx.fill();

    // Eyes
    ctx.fillStyle = p.eyes;
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.02, headY - w * 0.02, w * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.03, headY - w * 0.02, w * 0.02, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    const tailX = cx - dir * w * 0.35;
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.moveTo(tailX, cy);
    ctx.quadraticCurveTo(tailX - dir * w * 0.15, cy - w * 0.2, tailX - dir * w * 0.05, cy - w * 0.3);
    ctx.lineTo(tailX + w * 0.05, cy - w * 0.25);
    ctx.quadraticCurveTo(tailX - dir * w * 0.05, cy - w * 0.1, tailX, cy + w * 0.05);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.moveTo(tailX, cy);
    ctx.quadraticCurveTo(tailX - dir * w * 0.12, cy - w * 0.15, tailX - dir * w * 0.03, cy - w * 0.25);
    ctx.lineTo(tailX + w * 0.03, cy - w * 0.22);
    ctx.quadraticCurveTo(tailX - dir * w * 0.03, cy - w * 0.08, tailX, cy + w * 0.03);
    ctx.fill();
}

// ============= BEAR SPRITE =============
function renderBearSprite(ctx, sx, sy, s, size, p, bob, legAnim, dir) {
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.55 + bob;
    const w = s * size;

    // Legs
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(cx - w * 0.32, cy + w * 0.1 + legAnim, w * 0.18, w * 0.3);
    ctx.fillRect(cx + w * 0.14, cy + w * 0.1 - legAnim, w * 0.18, w * 0.3);
    ctx.fillStyle = p.dark;
    ctx.fillRect(cx - w * 0.3, cy + w * 0.12 + legAnim, w * 0.14, w * 0.26);
    ctx.fillRect(cx + w * 0.16, cy + w * 0.12 - legAnim, w * 0.14, w * 0.26);

    // Body
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.42, w * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.38, w * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = p.light;
    ctx.beginPath();
    ctx.ellipse(cx, cy + w * 0.08, w * 0.22, w * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    const headY = cy - w * 0.35;
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(cx + dir * w * 0.05, headY, w * 0.28, w * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(cx + dir * w * 0.05, headY, w * 0.25, w * 0.21, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.arc(cx - w * 0.18, headY - w * 0.15, w * 0.1, 0, Math.PI * 2);
    ctx.arc(cx + w * 0.18, headY - w * 0.15, w * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.arc(cx - w * 0.18, headY - w * 0.15, w * 0.07, 0, Math.PI * 2);
    ctx.arc(cx + w * 0.18, headY - w * 0.15, w * 0.07, 0, Math.PI * 2);
    ctx.fill();

    // Snout
    ctx.fillStyle = p.light;
    ctx.beginPath();
    ctx.ellipse(cx + dir * w * 0.12, headY + w * 0.06, w * 0.12, w * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = p.nose;
    ctx.beginPath();
    ctx.ellipse(cx + dir * w * 0.18, headY + w * 0.04, w * 0.05, w * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = p.eyes;
    ctx.beginPath();
    ctx.arc(cx + dir * w * 0.05, headY - w * 0.04, w * 0.04, 0, Math.PI * 2);
    ctx.fill();
}

// ============= TIGER SPRITE =============
function renderTigerSprite(ctx, sx, sy, s, size, p, bob, legAnim, dir) {
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.5 + bob;
    const w = s * size;

    // Legs
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(cx - w * 0.28 + legAnim, cy + w * 0.12, w * 0.14, w * 0.28);
    ctx.fillRect(cx + w * 0.14 - legAnim, cy + w * 0.12, w * 0.14, w * 0.28);
    ctx.fillStyle = p.body;
    ctx.fillRect(cx - w * 0.26 + legAnim, cy + w * 0.14, w * 0.1, w * 0.24);
    ctx.fillRect(cx + w * 0.16 - legAnim, cy + w * 0.14, w * 0.1, w * 0.24);

    // Body
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.4, w * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.37, w * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stripes
    ctx.fillStyle = p.stripes;
    for (let i = -2; i <= 2; i++) {
        ctx.fillRect(cx + i * w * 0.12 - w * 0.02, cy - w * 0.15, w * 0.04, w * 0.3);
    }

    // Belly
    ctx.fillStyle = '#fff8e8';
    ctx.beginPath();
    ctx.ellipse(cx, cy + w * 0.1, w * 0.2, w * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    const headX = cx + dir * w * 0.3;
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(headX, cy - w * 0.1, w * 0.22, w * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(headX, cy - w * 0.1, w * 0.19, w * 0.17, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.arc(headX - w * 0.12, cy - w * 0.25, w * 0.07, 0, Math.PI * 2);
    ctx.arc(headX + w * 0.12, cy - w * 0.25, w * 0.07, 0, Math.PI * 2);
    ctx.fill();

    // White muzzle
    ctx.fillStyle = '#fff8e8';
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.08, cy - w * 0.02, w * 0.1, w * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#ff8888';
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.14, cy - w * 0.04, w * 0.04, w * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = p.eyes;
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.02, cy - w * 0.14, w * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.03, cy - w * 0.14, w * 0.02, 0, Math.PI * 2);
    ctx.fill();

    // Tail with stripes
    const tailX = cx - dir * w * 0.4;
    ctx.strokeStyle = PALETTE.outline;
    ctx.lineWidth = w * 0.1;
    ctx.beginPath();
    ctx.moveTo(tailX, cy);
    ctx.quadraticCurveTo(tailX - dir * w * 0.2, cy - w * 0.3, tailX - dir * w * 0.1, cy - w * 0.5);
    ctx.stroke();
    ctx.strokeStyle = p.body;
    ctx.lineWidth = w * 0.07;
    ctx.stroke();
}

// ============= HAWK SPRITE =============
function renderHawkSprite(ctx, sx, sy, s, size, p, animTimer, dir) {
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.45;
    const w = s * size;
    const wingFlap = Math.sin(animTimer * 15) * w * 0.15;

    // Wings
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(cx - w * 0.4, cy + wingFlap, w * 0.35, w * 0.12, -0.3, 0, Math.PI * 2);
    ctx.ellipse(cx + w * 0.4, cy - wingFlap, w * 0.35, w * 0.12, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(cx - w * 0.4, cy + wingFlap, w * 0.32, w * 0.1, -0.3, 0, Math.PI * 2);
    ctx.ellipse(cx + w * 0.4, cy - wingFlap, w * 0.32, w * 0.1, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.25, w * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.22, w * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    // Chest
    ctx.fillStyle = p.light;
    ctx.beginPath();
    ctx.ellipse(cx, cy + w * 0.05, w * 0.15, w * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.arc(cx, cy - w * 0.35, w * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.arc(cx, cy - w * 0.35, w * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = p.beak;
    ctx.beginPath();
    ctx.moveTo(cx + dir * w * 0.1, cy - w * 0.35);
    ctx.lineTo(cx + dir * w * 0.25, cy - w * 0.32);
    ctx.lineTo(cx + dir * w * 0.1, cy - w * 0.28);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = p.eyes;
    ctx.beginPath();
    ctx.arc(cx + dir * w * 0.05, cy - w * 0.38, w * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // Tail feathers
    ctx.fillStyle = p.dark;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.08, cy + w * 0.3);
    ctx.lineTo(cx, cy + w * 0.55);
    ctx.lineTo(cx + w * 0.08, cy + w * 0.3);
    ctx.closePath();
    ctx.fill();
}

// ============= FOX SPRITE =============
function renderFoxSprite(ctx, sx, sy, s, size, p, bob, legAnim, dir) {
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.55 + bob;
    const w = s * size;

    // Legs
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(cx - w * 0.22 + legAnim, cy + w * 0.08, w * 0.1, w * 0.25);
    ctx.fillRect(cx + w * 0.12 - legAnim, cy + w * 0.08, w * 0.1, w * 0.25);
    ctx.fillStyle = p.dark;
    ctx.fillRect(cx - w * 0.2 + legAnim, cy + w * 0.1, w * 0.06, w * 0.21);
    ctx.fillRect(cx + w * 0.14 - legAnim, cy + w * 0.1, w * 0.06, w * 0.21);

    // Tail
    const tailX = cx - dir * w * 0.35;
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(tailX, cy - w * 0.1, w * 0.2, w * 0.12, dir * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(tailX, cy - w * 0.1, w * 0.17, w * 0.1, dir * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.white;
    ctx.beginPath();
    ctx.ellipse(tailX - dir * w * 0.12, cy - w * 0.12, w * 0.08, w * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.32, w * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.29, w * 0.19, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = p.white;
    ctx.beginPath();
    ctx.ellipse(cx, cy + w * 0.05, w * 0.15, w * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    const headX = cx + dir * w * 0.22;
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(headX, cy - w * 0.12, w * 0.2, w * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(headX, cy - w * 0.12, w * 0.17, w * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.moveTo(headX - w * 0.1, cy - w * 0.18);
    ctx.lineTo(headX - w * 0.08, cy - w * 0.38);
    ctx.lineTo(headX + w * 0.02, cy - w * 0.18);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(headX + w * 0.1, cy - w * 0.18);
    ctx.lineTo(headX + w * 0.08, cy - w * 0.38);
    ctx.lineTo(headX - w * 0.02, cy - w * 0.18);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.moveTo(headX - w * 0.08, cy - w * 0.18);
    ctx.lineTo(headX - w * 0.06, cy - w * 0.32);
    ctx.lineTo(headX, cy - w * 0.18);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(headX + w * 0.08, cy - w * 0.18);
    ctx.lineTo(headX + w * 0.06, cy - w * 0.32);
    ctx.lineTo(headX, cy - w * 0.18);
    ctx.fill();

    // White muzzle
    ctx.fillStyle = p.white;
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.1, cy - w * 0.06, w * 0.1, w * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = p.nose;
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.16, cy - w * 0.08, w * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.04, cy - w * 0.16, w * 0.035, 0, Math.PI * 2);
    ctx.fill();
}

// ============= HORSE SPRITE =============
function renderHorseSprite(ctx, sx, sy, s, size, p, bob, legAnim, dir) {
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.5 + bob;
    const w = s * size;

    // Legs
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(cx - w * 0.28 + legAnim, cy + w * 0.15, w * 0.1, w * 0.35);
    ctx.fillRect(cx - w * 0.1 - legAnim, cy + w * 0.15, w * 0.1, w * 0.35);
    ctx.fillRect(cx + w * 0.08 + legAnim, cy + w * 0.15, w * 0.1, w * 0.35);
    ctx.fillRect(cx + w * 0.2 - legAnim, cy + w * 0.15, w * 0.1, w * 0.35);
    ctx.fillStyle = p.body;
    ctx.fillRect(cx - w * 0.26 + legAnim, cy + w * 0.17, w * 0.06, w * 0.31);
    ctx.fillRect(cx - w * 0.08 - legAnim, cy + w * 0.17, w * 0.06, w * 0.31);
    ctx.fillRect(cx + w * 0.1 + legAnim, cy + w * 0.17, w * 0.06, w * 0.31);
    ctx.fillRect(cx + w * 0.22 - legAnim, cy + w * 0.17, w * 0.06, w * 0.31);

    // Hooves
    ctx.fillStyle = '#222';
    ctx.fillRect(cx - w * 0.26 + legAnim, cy + w * 0.45, w * 0.06, w * 0.05);
    ctx.fillRect(cx - w * 0.08 - legAnim, cy + w * 0.45, w * 0.06, w * 0.05);
    ctx.fillRect(cx + w * 0.1 + legAnim, cy + w * 0.45, w * 0.06, w * 0.05);
    ctx.fillRect(cx + w * 0.22 - legAnim, cy + w * 0.45, w * 0.06, w * 0.05);

    // Body
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.4, w * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.37, w * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    const neckX = cx + dir * w * 0.3;
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(neckX, cy - w * 0.2, w * 0.15, w * 0.25, dir * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(neckX, cy - w * 0.2, w * 0.12, w * 0.22, dir * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Head
    const headX = neckX + dir * w * 0.15;
    const headY = cy - w * 0.4;
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(headX, headY, w * 0.18, w * 0.12, dir * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(headX, headY, w * 0.15, w * 0.1, dir * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(headX - w * 0.08, headY - w * 0.12, w * 0.04, w * 0.08, -0.3, 0, Math.PI * 2);
    ctx.ellipse(headX + w * 0.08, headY - w * 0.12, w * 0.04, w * 0.08, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Mane
    ctx.fillStyle = p.mane;
    ctx.beginPath();
    ctx.moveTo(headX - w * 0.05, headY - w * 0.08);
    ctx.quadraticCurveTo(neckX - dir * w * 0.1, cy - w * 0.35, cx - dir * w * 0.1, cy - w * 0.15);
    ctx.lineTo(cx + dir * w * 0.05, cy - w * 0.12);
    ctx.quadraticCurveTo(neckX, cy - w * 0.3, headX + w * 0.05, headY - w * 0.05);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = p.eyes;
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.05, headY - w * 0.02, w * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // Nostril
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.12, headY + w * 0.04, w * 0.02, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.fillStyle = p.mane;
    ctx.beginPath();
    ctx.moveTo(cx - dir * w * 0.35, cy);
    ctx.quadraticCurveTo(cx - dir * w * 0.5, cy + w * 0.2, cx - dir * w * 0.45, cy + w * 0.4);
    ctx.lineTo(cx - dir * w * 0.35, cy + w * 0.35);
    ctx.quadraticCurveTo(cx - dir * w * 0.4, cy + w * 0.15, cx - dir * w * 0.3, cy + w * 0.05);
    ctx.closePath();
    ctx.fill();
}

// ============= CAMEL SPRITE =============
function renderCamelSprite(ctx, sx, sy, s, size, p, bob, legAnim, dir) {
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.5 + bob;
    const w = s * size;

    // Legs (tall)
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(cx - w * 0.25 + legAnim, cy + w * 0.1, w * 0.1, w * 0.4);
    ctx.fillRect(cx + w * 0.15 - legAnim, cy + w * 0.1, w * 0.1, w * 0.4);
    ctx.fillStyle = p.body;
    ctx.fillRect(cx - w * 0.23 + legAnim, cy + w * 0.12, w * 0.06, w * 0.36);
    ctx.fillRect(cx + w * 0.17 - legAnim, cy + w * 0.12, w * 0.06, w * 0.36);

    // Body
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.38, w * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.35, w * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hump
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(cx, cy - w * 0.2, w * 0.18, w * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.hump;
    ctx.beginPath();
    ctx.ellipse(cx, cy - w * 0.2, w * 0.15, w * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    const neckX = cx + dir * w * 0.3;
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(neckX, cy - w * 0.15, w * 0.12, w * 0.3, dir * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(neckX, cy - w * 0.15, w * 0.1, w * 0.27, dir * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Head
    const headX = neckX + dir * w * 0.12;
    const headY = cy - w * 0.42;
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(headX, headY, w * 0.15, w * 0.1, dir * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(headX, headY, w * 0.12, w * 0.08, dir * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.arc(headX - w * 0.08, headY - w * 0.08, w * 0.04, 0, Math.PI * 2);
    ctx.arc(headX + w * 0.08, headY - w * 0.08, w * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = p.eyes;
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.04, headY - w * 0.02, w * 0.025, 0, Math.PI * 2);
    ctx.fill();

    // Snout
    ctx.fillStyle = p.light;
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.1, headY + w * 0.03, w * 0.06, w * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
}

// ============= BOAR SPRITE =============
function renderBoarSprite(ctx, sx, sy, s, size, p, bob, legAnim, dir) {
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.55 + bob;
    const w = s * size;

    // Legs
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(cx - w * 0.28 + legAnim, cy + w * 0.1, w * 0.12, w * 0.22);
    ctx.fillRect(cx + w * 0.16 - legAnim, cy + w * 0.1, w * 0.12, w * 0.22);
    ctx.fillStyle = p.dark;
    ctx.fillRect(cx - w * 0.26 + legAnim, cy + w * 0.12, w * 0.08, w * 0.18);
    ctx.fillRect(cx + w * 0.18 - legAnim, cy + w * 0.12, w * 0.08, w * 0.18);

    // Body
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.4, w * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.37, w * 0.27, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bristles
    ctx.fillStyle = p.dark;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const bx = cx - w * 0.2 + i * w * 0.1;
        ctx.moveTo(bx, cy - w * 0.25);
        ctx.lineTo(bx - w * 0.02, cy - w * 0.35);
        ctx.lineTo(bx + w * 0.02, cy - w * 0.35);
    }
    ctx.fill();

    // Head
    const headX = cx + dir * w * 0.32;
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(headX, cy - w * 0.05, w * 0.22, w * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(headX, cy - w * 0.05, w * 0.19, w * 0.17, 0, 0, Math.PI * 2);
    ctx.fill();

    // Snout
    ctx.fillStyle = p.light;
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.15, cy, w * 0.1, w * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff9999';
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.2, cy - w * 0.02, w * 0.02, 0, Math.PI * 2);
    ctx.arc(headX + dir * w * 0.2, cy + w * 0.02, w * 0.02, 0, Math.PI * 2);
    ctx.fill();

    // Tusks
    ctx.fillStyle = p.tusks;
    ctx.beginPath();
    ctx.moveTo(headX + dir * w * 0.1, cy + w * 0.08);
    ctx.lineTo(headX + dir * w * 0.18, cy + w * 0.15);
    ctx.lineTo(headX + dir * w * 0.12, cy + w * 0.1);
    ctx.fill();

    // Ears
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(headX - w * 0.1, cy - w * 0.2, w * 0.06, w * 0.08, -0.3, 0, Math.PI * 2);
    ctx.ellipse(headX + w * 0.1, cy - w * 0.2, w * 0.06, w * 0.08, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = p.eyes;
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.05, cy - w * 0.1, w * 0.03, 0, Math.PI * 2);
    ctx.fill();
}

// ============= BEAVER SPRITE =============
function renderBeaverSprite(ctx, sx, sy, s, size, p, bob, legAnim, dir) {
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.55 + bob;
    const w = s * size;

    // Tail (flat)
    const tailX = cx - dir * w * 0.35;
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(tailX, cy + w * 0.1, w * 0.18, w * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.tail;
    ctx.beginPath();
    ctx.ellipse(tailX, cy + w * 0.1, w * 0.15, w * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(cx - w * 0.2 + legAnim, cy + w * 0.12, w * 0.1, w * 0.18);
    ctx.fillRect(cx + w * 0.1 - legAnim, cy + w * 0.12, w * 0.1, w * 0.18);
    ctx.fillStyle = p.dark;
    ctx.fillRect(cx - w * 0.18 + legAnim, cy + w * 0.14, w * 0.06, w * 0.14);
    ctx.fillRect(cx + w * 0.12 - legAnim, cy + w * 0.14, w * 0.06, w * 0.14);

    // Body
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.32, w * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.29, w * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = p.light;
    ctx.beginPath();
    ctx.ellipse(cx, cy + w * 0.05, w * 0.18, w * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    const headX = cx + dir * w * 0.25;
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(headX, cy - w * 0.1, w * 0.18, w * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(headX, cy - w * 0.1, w * 0.15, w * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.arc(headX - w * 0.1, cy - w * 0.22, w * 0.05, 0, Math.PI * 2);
    ctx.arc(headX + w * 0.1, cy - w * 0.22, w * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Snout
    ctx.fillStyle = p.light;
    ctx.beginPath();
    ctx.ellipse(headX + dir * w * 0.1, cy - w * 0.05, w * 0.08, w * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // Teeth
    ctx.fillStyle = p.teeth;
    ctx.fillRect(headX + dir * w * 0.08, cy - w * 0.02, w * 0.04, w * 0.08);
    ctx.fillRect(headX + dir * w * 0.12, cy - w * 0.02, w * 0.04, w * 0.08);

    // Nose
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.14, cy - w * 0.08, w * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(headX + dir * w * 0.04, cy - w * 0.14, w * 0.03, 0, Math.PI * 2);
    ctx.fill();
}

// ============= GENERIC ANIMAL (fallback) =============
function renderGenericAnimal(ctx, sx, sy, s, size, p, bob, dir) {
    const cx = sx + s * 0.5;
    const cy = sy + s * 0.5 + bob;
    const w = s * size;

    // Body
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.4, w * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body || '#888';
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.37, w * 0.27, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.arc(cx + dir * w * 0.3, cy - w * 0.1, w * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.body || '#888';
    ctx.beginPath();
    ctx.arc(cx + dir * w * 0.3, cy - w * 0.1, w * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(cx + dir * w * 0.35, cy - w * 0.15, w * 0.03, 0, Math.PI * 2);
    ctx.fill();
}

// ============= STATUS BARS =============
function renderPetStatusBars(ctx, sx, sy, s, size, pet) {
    const barWidth = s * size * 0.8;
    const barHeight = 4;
    const barY = sy + s * 0.05;
    const barX = sx + s * 0.5 - barWidth / 2;

    // Health bar background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

    // Health bar
    const healthPercent = Math.max(0, pet.health / (pet.maxHealth || 100));
    const healthColor = healthPercent > 0.5 ? '#44dd44' : healthPercent > 0.25 ? '#dddd44' : '#dd4444';
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = healthColor;
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    // Hunger warning
    if (pet.hunger !== undefined && pet.hunger < 30) {
        ctx.fillStyle = '#ff6666';
        ctx.font = `bold ${Math.floor(s * 0.12)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('🍖', sx + s * 0.5 + barWidth / 2 + s * 0.1, barY + barHeight);
    }

    // Level indicator
    if (pet.level && pet.level > 1) {
        ctx.fillStyle = '#ffcc00';
        ctx.font = `bold ${Math.floor(s * 0.1)}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText(`Lv${pet.level}`, barX, barY - 3);
    }
}

function renderTamingUI(ctx, x, y) {
    if (typeof tamingSession === 'undefined' || !tamingSession) return;

    const barWidth = 100;
    const barHeight = 10;

    // Background panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - barWidth / 2 - 10, y - 35, barWidth + 20, 55, 8);
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎯 Taming...', x, y - 20);

    // Patience bar
    const patiencePercent = (tamingSession.patience || 0) / 100;
    ctx.fillStyle = '#333';
    ctx.fillRect(x - barWidth / 2, y - 5, barWidth, barHeight);

    const gradient = ctx.createLinearGradient(x - barWidth / 2, 0, x + barWidth / 2, 0);
    gradient.addColorStop(0, '#ff4444');
    gradient.addColorStop(0.5, '#ffcc00');
    gradient.addColorStop(1, '#44ff44');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - barWidth / 2, y - 5, barWidth * patiencePercent, barHeight);

    // Border
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - barWidth / 2, y - 5, barWidth, barHeight);

    // Instructions
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '10px Arial';
    ctx.fillText('Feed & approach slowly', x, y + 15);
}
