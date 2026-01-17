// ============= PET SPRITES =============

function renderPetSprite(ctx, pet, cam) {
    const s = TILE_SIZE * SCALE;
    const screenX = (pet.x - 0.5) * s - cam.x;
    const screenY = (pet.y - 0.5) * s - cam.y;

    // Skip if off-screen
    if (screenX < -s || screenX > ctx.canvas.width + s || screenY < -s || screenY > ctx.canvas.height + s) return;

    const size = pet.size * s * 0.8;

    ctx.save();

    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(screenX + s * 0.5, screenY + size * 0.4 + s * 0.5, size * 0.4, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    renderPetBody(ctx, pet, screenX + s * 0.5, screenY + s * 0.6, size);

    // Status indicators
    if (!pet.isWild) {
        // Health bar
        const healthPercent = pet.health / pet.getMaxHealth();
        const barWidth = size;
        const barHeight = 4;
        const barY = screenY + s * 0.5 - size * 0.9;

        ctx.fillStyle = '#333';
        ctx.fillRect(screenX + s * 0.5 - barWidth / 2, barY, barWidth, barHeight);
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(screenX + s * 0.5 - barWidth / 2, barY, barWidth * healthPercent, barHeight);

        // Hunger indicator
        if (pet.hunger < CONFIG.HUNGER_CRITICAL) {
            ctx.font = '12px Arial';
            ctx.fillStyle = '#ff0000';
            ctx.fillText('⚠️', screenX + s * 0.5 + size * 0.5, barY);
        }
    }

    // Draw taming UI if active
    if (typeof tamingSession !== 'undefined' && tamingSession && tamingSession.pet === pet) {
        renderTamingUI(ctx, screenX + s * 0.5, screenY + s * 0.5 - size);
    }

    ctx.restore();
}

function renderPetBody(ctx, pet, cx, cy, size) {
    const facing = pet.direction === 2 ? -1 : 1;
    const bob = Math.sin(pet.animTimer * 6) * 1.5;

    ctx.save();
    ctx.translate(cx, cy + bob);
    ctx.scale(facing, 1);

    const typeId = (pet.typeId || pet.type?.id || '').toLowerCase();

    if (typeId === 'hawk') {
        renderHawk(ctx, size);
    } else if (typeId === 'bear') {
        renderQuadruped(ctx, size, {
            body: '#4a3520',
            mane: '#2c1c12',
            accent: '#6a4a2a',
            eye: '#ffe8c7'
        }, 1.1);
    } else if (typeId === 'tiger') {
        renderQuadruped(ctx, size, {
            body: '#d4881a',
            mane: '#8a4a0f',
            accent: '#f2c56b',
            eye: '#f7f2d0',
            stripes: '#5a2c12'
        }, 0.95);
    } else if (typeId === 'wolf' || typeId === 'wolf_alpha') {
        renderQuadruped(ctx, size, {
            body: '#6a6a6a',
            mane: '#3a3a3a',
            accent: '#9a9a9a',
            eye: '#e8f0ff'
        }, 0.9);
    } else if (typeId === 'fox') {
        renderQuadruped(ctx, size, {
            body: '#d4642a',
            mane: '#8a3a1a',
            accent: '#f2b58a',
            eye: '#f7f2d0',
            tail: '#f7f2d0'
        }, 0.75);
    } else if (typeId === 'boar') {
        renderQuadruped(ctx, size, {
            body: '#5a3a24',
            mane: '#2a1a10',
            accent: '#7a5a44',
            eye: '#f1e6d0'
        }, 0.85);
    } else if (typeId === 'beaver') {
        renderQuadruped(ctx, size, {
            body: '#7a4a2a',
            mane: '#3a2315',
            accent: '#9a6a4a',
            eye: '#f1e6d0',
            tail: '#5a2a12'
        }, 0.8);
    } else if (typeId === 'horse') {
        renderQuadruped(ctx, size, {
            body: '#8b4513',
            mane: '#3a2315',
            accent: '#b46a3a',
            eye: '#f7f2d0'
        }, 1.1, true);
    } else if (typeId === 'camel') {
        renderQuadruped(ctx, size, {
            body: '#c4a35a',
            mane: '#8a6a3a',
            accent: '#e3c87a',
            eye: '#f7f2d0'
        }, 1.15, true, true);
    } else {
        renderQuadruped(ctx, size, {
            body: pet.type?.color || '#6a6a6a',
            mane: '#2a2a2a',
            accent: '#9a9a9a',
            eye: '#ffffff'
        }, 0.85);
    }

    ctx.restore();
}

function renderQuadruped(ctx, size, palette, scale = 1, isMount = false, hasHump = false) {
    const bodyW = size * 0.9 * scale;
    const bodyH = size * 0.42 * scale;
    const headW = size * 0.35 * scale;
    const headH = size * 0.28 * scale;
    const legW = size * 0.12 * scale;
    const legH = size * 0.3 * scale;
    const legSwing = Math.sin(pixelTime * 8) * size * 0.05;

    // Body shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(-bodyW * 0.5 + 2, -bodyH * 0.2 + 2, bodyW, bodyH * 0.7);

    // Body
    ctx.fillStyle = palette.body;
    ctx.fillRect(-bodyW * 0.5, -bodyH * 0.2, bodyW, bodyH);

    // Back hump for camel
    if (hasHump) {
        ctx.fillStyle = palette.accent;
        ctx.fillRect(-bodyW * 0.1, -bodyH * 0.45, bodyW * 0.35, bodyH * 0.4);
    }

    // Mane/back stripe
    ctx.fillStyle = palette.mane;
    ctx.fillRect(-bodyW * 0.45, -bodyH * 0.2, bodyW * 0.2, bodyH);

    // Legs
    ctx.fillStyle = palette.mane;
    ctx.fillRect(-bodyW * 0.35, bodyH * 0.3 + legSwing, legW, legH);
    ctx.fillRect(-bodyW * 0.05, bodyH * 0.3 - legSwing, legW, legH);
    ctx.fillRect(bodyW * 0.2, bodyH * 0.3 + legSwing, legW, legH);
    ctx.fillRect(bodyW * 0.4, bodyH * 0.3 - legSwing, legW, legH);

    // Head
    ctx.fillStyle = palette.body;
    ctx.fillRect(bodyW * 0.35, -bodyH * 0.25, headW, headH);

    // Snout
    ctx.fillStyle = palette.accent;
    ctx.fillRect(bodyW * 0.55, -bodyH * 0.18, headW * 0.45, headH * 0.45);

    // Eye
    ctx.fillStyle = palette.eye;
    ctx.fillRect(bodyW * 0.48, -bodyH * 0.18, 2, 2);

    // Tail
    ctx.fillStyle = palette.tail || palette.mane;
    ctx.fillRect(-bodyW * 0.58, -bodyH * 0.05, bodyW * 0.18, bodyH * 0.2);

    // Saddle hint for mounts
    if (isMount) {
        ctx.fillStyle = 'rgba(30,30,30,0.5)';
        ctx.fillRect(-bodyW * 0.1, -bodyH * 0.2, bodyW * 0.25, bodyH * 0.35);
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillRect(-bodyW * 0.05, -bodyH * 0.18, bodyW * 0.15, 2);
    }

    // Stripes for tiger
    if (palette.stripes) {
        ctx.fillStyle = palette.stripes;
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(-bodyW * 0.2 + i * bodyW * 0.15, -bodyH * 0.15, 2, bodyH * 0.6);
        }
    }
}

function renderHawk(ctx, size) {
    const wingSpan = size * 1.1;
    const bodyW = size * 0.35;
    const bodyH = size * 0.2;
    const flap = Math.sin(pixelTime * 10) * size * 0.08;

    // Wings
    ctx.fillStyle = '#5a421a';
    ctx.fillRect(-wingSpan * 0.5, -bodyH, wingSpan * 0.4, bodyH * 0.5 + flap);
    ctx.fillRect(wingSpan * 0.1, -bodyH, wingSpan * 0.4, bodyH * 0.5 - flap);

    // Body
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(-bodyW * 0.5, -bodyH * 0.5, bodyW, bodyH);

    // Head
    ctx.fillStyle = '#b08a2a';
    ctx.fillRect(bodyW * 0.1, -bodyH * 0.7, bodyW * 0.5, bodyH * 0.5);

    // Eye
    ctx.fillStyle = '#f7f2d0';
    ctx.fillRect(bodyW * 0.25, -bodyH * 0.6, 2, 2);

    // Tail
    ctx.fillStyle = '#5a421a';
    ctx.fillRect(-bodyW * 0.8, -bodyH * 0.2, bodyW * 0.3, bodyH * 0.4);
}

function renderTamingUI(ctx, x, y) {
    const barWidth = 100;
    const barHeight = 10;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x - barWidth / 2 - 5, y - 30, barWidth + 10, 45);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Taming...', x, y - 18);

    // Patience bar
    const patiencePercent = tamingSession.patience / CONFIG.TAMING_MAX_PATIENCE;
    ctx.fillStyle = '#333';
    ctx.fillRect(x - barWidth / 2, y - 5, barWidth, barHeight);
    ctx.fillStyle = patiencePercent > 0.5 ? '#00ff00' : patiencePercent > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillRect(x - barWidth / 2, y - 5, barWidth * patiencePercent, barHeight);

    // Instructions
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '10px Arial';
    ctx.fillText('Feed & approach slowly', x, y + 12);
}
