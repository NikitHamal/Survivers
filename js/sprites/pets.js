// ============= PET SPRITES =============

function renderPetSprite(ctx, pet, cam) {
    const s = TILE_SIZE * SCALE;
    const screenX = (pet.x - 0.5) * s - cam.x;
    const screenY = (pet.y - 0.5) * s - cam.y;

    // Skip if off-screen
    if (screenX < -s || screenX > ctx.canvas.width + s || screenY < -s || screenY > ctx.canvas.height + s) return;

    const size = pet.size * s * 0.8;
    const centerX = screenX + s * 0.5;
    const centerY = screenY + s * 0.55;

    ctx.save();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + size * 0.35, size * 0.4, size * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Render sprite with facing direction
    const facing = pet.direction === 2 ? -1 : 1;
    ctx.translate(centerX, centerY);
    ctx.scale(facing, 1);

    const renderer = PET_RENDERERS[pet.type.id] || renderGenericPet;
    renderer(ctx, size, pet);
    renderPetEquipment(ctx, size, pet);

    if (pet.type.rarity === 'legendary') {
        const glow = 0.4 + Math.sin(pixelTime * 4) * 0.2;
        ctx.fillStyle = `rgba(180, 140, 255, ${glow})`;
        ctx.fillRect(-size * 0.2, -size * 0.75, size * 0.4, size * 0.08);
    }

    ctx.restore();

    // Status indicators
    if (!pet.isWild) {
        const healthPercent = pet.health / pet.getMaxHealth();
        const barWidth = size;
        const barHeight = 4;
        const barY = centerY - size * 0.9;

        ctx.fillStyle = '#333';
        ctx.fillRect(centerX - barWidth / 2, barY, barWidth, barHeight);
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(centerX - barWidth / 2, barY, barWidth * healthPercent, barHeight);

        if (pet.hunger < CONFIG.HUNGER_CRITICAL) {
            ctx.font = '12px Arial';
            ctx.fillStyle = '#ff0000';
            ctx.fillText('⚠️', centerX + size * 0.5, barY);
        }
    }

    // Draw taming UI if active
    if (typeof tamingSession !== 'undefined' && tamingSession && tamingSession.pet === pet) {
        renderTamingUI(ctx, centerX, centerY - size);
    }
}

const PET_RENDERERS = {
    wolf: (ctx, size, pet) => renderQuadruped(ctx, size, pet, { body: '#6a6a6a', accent: '#4a4a4a', ear: '#2f2f2f', snout: '#c2c2c2', tail: '#3a3a3a' }, { muzzle: true }),
    bear: (ctx, size, pet) => renderQuadruped(ctx, size, pet, { body: '#4a3520', accent: '#3a2616', ear: '#2a1a12', snout: '#b89b7a', tail: '#2d1e15' }, { bulk: 1.2 }),
    tiger: (ctx, size, pet) => renderQuadruped(ctx, size, pet, { body: '#d4881a', accent: '#a65b0c', ear: '#4a2a12', snout: '#f5d7b1', tail: '#a65b0c' }, { stripes: true }),
    hawk: (ctx, size, pet) => renderBird(ctx, size, pet, { body: '#8b6914', wing: '#5a3f0b', beak: '#c9a338' }),
    fox: (ctx, size, pet) => renderQuadruped(ctx, size, pet, { body: '#d4642a', accent: '#a84a1f', ear: '#3a2a1a', snout: '#f5e4d2', tail: '#f0d5b2' }, { tailTip: true }),
    horse: (ctx, size, pet) => renderQuadruped(ctx, size, pet, { body: '#8b4513', accent: '#6a3210', ear: '#3a2315', snout: '#c8a07a', tail: '#3a2315' }, { mane: true, legsLong: true }),
    camel: (ctx, size, pet) => renderQuadruped(ctx, size, pet, { body: '#c4a35a', accent: '#a6853e', ear: '#6a4a2a', snout: '#e0c090', tail: '#6a4a2a' }, { hump: true }),
    boar: (ctx, size, pet) => renderQuadruped(ctx, size, pet, { body: '#6a4a2a', accent: '#4a321a', ear: '#2a1a0f', snout: '#cbb79e', tail: '#3a2515' }, { tusk: true, bulk: 1.05 }),
    beaver: (ctx, size, pet) => renderQuadruped(ctx, size, pet, { body: '#7a5a3a', accent: '#5a3a22', ear: '#2f1e12', snout: '#cbb79e', tail: '#4a2e1a' }, { flatTail: true }),
    wolf_alpha: (ctx, size, pet) => renderQuadruped(ctx, size, pet, { body: '#2a2a2a', accent: '#161616', ear: '#0f0f0f', snout: '#c2c2c2', tail: '#1a1a1a' }, { muzzle: true, crest: true })
};

function renderGenericPet(ctx, size, pet) {
    renderQuadruped(ctx, size, pet, { body: pet.type.color || '#777', accent: '#555', ear: '#333', snout: '#ccc', tail: '#444' });
}

function renderQuadruped(ctx, size, pet, palette, options = {}) {
    const bodyW = size * (options.bulk || 1) * 0.9;
    const bodyH = size * 0.5;
    const headW = size * 0.32;
    const headH = size * 0.28;
    const legW = size * 0.08;
    const legH = size * (options.legsLong ? 0.28 : 0.22);
    const stride = (pet.isMoving ? Math.sin(pixelTime * 8 + (pet.id || 0)) : 0) * size * 0.05;

    // Legs
    ctx.fillStyle = palette.accent;
    ctx.fillRect(-bodyW * 0.25, bodyH * 0.1 + stride, legW, legH);
    ctx.fillRect(-bodyW * 0.05, bodyH * 0.1 - stride, legW, legH);
    ctx.fillRect(bodyW * 0.1, bodyH * 0.1 + stride, legW, legH);
    ctx.fillRect(bodyW * 0.3, bodyH * 0.1 - stride, legW, legH);

    // Body
    ctx.fillStyle = palette.body;
    ctx.fillRect(-bodyW * 0.45, -bodyH * 0.2, bodyW, bodyH);

    // Tail
    ctx.fillStyle = palette.tail;
    if (options.flatTail) {
        ctx.fillRect(-bodyW * 0.55, -bodyH * 0.05, bodyW * 0.2, bodyH * 0.2);
    } else {
        ctx.fillRect(-bodyW * 0.55, -bodyH * 0.1, bodyW * 0.18, bodyH * 0.12);
    }
    if (options.tailTip) {
        ctx.fillStyle = '#f5e4d2';
        ctx.fillRect(-bodyW * 0.55, -bodyH * 0.1, bodyW * 0.08, bodyH * 0.12);
    }

    // Hump or crest
    if (options.hump) {
        ctx.fillStyle = palette.accent;
        ctx.fillRect(-bodyW * 0.1, -bodyH * 0.45, bodyW * 0.25, bodyH * 0.25);
    }
    if (options.crest) {
        ctx.fillStyle = '#5a4a7a';
        ctx.fillRect(-bodyW * 0.05, -bodyH * 0.5, bodyW * 0.2, bodyH * 0.2);
    }

    // Head
    ctx.fillStyle = palette.body;
    ctx.fillRect(bodyW * 0.25, -headH * 0.7, headW, headH);

    // Ears
    ctx.fillStyle = palette.ear;
    ctx.fillRect(bodyW * 0.3, -headH * 0.95, headW * 0.2, headH * 0.25);
    ctx.fillRect(bodyW * 0.45, -headH * 0.95, headW * 0.2, headH * 0.25);

    // Snout
    ctx.fillStyle = palette.snout;
    ctx.fillRect(bodyW * 0.42, -headH * 0.45, headW * 0.3, headH * 0.3);

    if (options.muzzle) {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(bodyW * 0.6, -headH * 0.35, 2, 2);
    }

    // Eyes
    ctx.fillStyle = pet.isWild ? '#ff6666' : '#1a1a1a';
    ctx.fillRect(bodyW * 0.4, -headH * 0.6, 2, 2);

    // Patterns
    if (options.stripes) {
        ctx.fillStyle = '#3a2a1a';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(-bodyW * 0.35 + i * bodyW * 0.18, -bodyH * 0.15, 3, bodyH * 0.4);
        }
    }
    if (options.tusk) {
        ctx.fillStyle = '#f0e6d2';
        ctx.fillRect(bodyW * 0.55, -headH * 0.25, 3, 4);
    }
    if (options.mane) {
        ctx.fillStyle = palette.ear;
        ctx.fillRect(bodyW * 0.15, -bodyH * 0.4, bodyW * 0.3, bodyH * 0.15);
    }
}

function renderBird(ctx, size, pet, palette) {
    const flap = Math.sin(pixelTime * 8 + (pet.id || 0)) * size * 0.1;
    ctx.fillStyle = palette.body;
    ctx.fillRect(-size * 0.2, -size * 0.1, size * 0.4, size * 0.25);

    ctx.fillStyle = palette.wing;
    ctx.fillRect(-size * 0.45, -size * 0.05 - flap, size * 0.25, size * 0.15);
    ctx.fillRect(size * 0.2, -size * 0.05 + flap, size * 0.25, size * 0.15);

    ctx.fillStyle = palette.beak;
    ctx.fillRect(size * 0.2, -size * 0.02, size * 0.12, size * 0.06);

    ctx.fillStyle = pet.isWild ? '#ff6666' : '#1a1a1a';
    ctx.fillRect(size * 0.05, -size * 0.05, 2, 2);
}

function renderPetEquipment(ctx, size, pet) {
    if (!pet.equipment) return;

    const collar = pet.equipment.collar;
    const armor = pet.equipment.armor;
    const saddle = pet.equipment.saddle;

    if (collar) {
        ctx.fillStyle = getRarityColor(collar.rarity);
        ctx.fillRect(size * 0.1, -size * 0.1, size * 0.2, size * 0.05);
    }

    if (armor) {
        ctx.fillStyle = getRarityColor(armor.rarity);
        ctx.fillRect(-size * 0.2, -size * 0.2, size * 0.4, size * 0.15);
    }

    if (saddle) {
        ctx.fillStyle = '#5a3a2a';
        ctx.fillRect(-size * 0.1, -size * 0.28, size * 0.25, size * 0.1);
        ctx.fillStyle = getRarityColor(saddle.rarity);
        ctx.fillRect(-size * 0.08, -size * 0.26, size * 0.2, size * 0.06);
    }
}

function getRarityColor(rarity) {
    switch (rarity) {
        case 'legendary':
            return '#d7b8ff';
        case 'rare':
            return '#7fb6ff';
        case 'uncommon':
            return '#7fffb0';
        default:
            return '#c8a86a';
    }
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
