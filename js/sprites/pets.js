// ============= PET SPRITES =============

function renderPetSprite(ctx, pet, cam) {
    const s = TILE_SIZE * SCALE;
    const screenX = (pet.x - 0.5) * s - cam.x;
    const screenY = (pet.y - 0.5) * s - cam.y;

    if (screenX < -s || screenX > ctx.canvas.width + s || screenY < -s || screenY > ctx.canvas.height + s) return;

    const size = pet.size * s * 0.8;
    const facing = pet.direction >= 0 ? 1 : -1;

    ctx.save();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(screenX + s * 0.5, screenY + size * 0.45 + s * 0.5, size * 0.45, size * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flip for direction
    ctx.translate(screenX + s * 0.5, screenY + s * 0.55);
    ctx.scale(facing, 1);
    ctx.translate(-s * 0.5, -s * 0.55);

    drawPetSprite(ctx, pet, s, size);

    ctx.restore();

    // Status indicators
    if (!pet.isWild) {
        const healthPercent = pet.health / pet.getMaxHealth();
        const barWidth = size;
        const barHeight = 4;
        const barY = screenY + s * 0.5 - size * 0.9;

        ctx.fillStyle = '#333';
        ctx.fillRect(screenX + s * 0.5 - barWidth / 2, barY, barWidth, barHeight);
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(screenX + s * 0.5 - barWidth / 2, barY, barWidth * healthPercent, barHeight);

        const hungerCritical = typeof PetSystem !== 'undefined'
            ? PetSystem.CONFIG.HUNGER_CRITICAL
            : 20;
        if (pet.hunger < hungerCritical) {
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(screenX + s * 0.5 + size * 0.45, barY - 2, 4, 4);
            ctx.fillRect(screenX + s * 0.5 + size * 0.43, barY, 8, 2);
        }
    }

    if (typeof PetSystem !== 'undefined') {
        const session = PetSystem.getTamingSession();
        if (session && session.pet === pet) {
            renderTamingUI(ctx, screenX + s * 0.5, screenY + s * 0.5 - size);
        }
    }
}

function drawPetSprite(ctx, pet, s, size) {
    const typeId = (pet.typeId || pet.type?.id || '').toLowerCase();
    const baseColor = pet.type?.color || '#777777';
    const dark = shadeColor(baseColor, -28);
    const light = shadeColor(baseColor, 28);
    const accent = shadeColor(baseColor, 45);
    const step = Math.sin((pet.animTimer || 0) * 6) * size * 0.04;

    const sprite = PET_SPRITES[typeId] || PET_SPRITES.default;

    if (sprite.family === 'bird') {
        drawBird(ctx, size, baseColor, dark, light, accent, step);
    } else if (sprite.family === 'mount') {
        drawMount(ctx, size, baseColor, dark, light, accent, sprite, step);
    } else {
        drawQuadruped(ctx, size, baseColor, dark, light, accent, sprite, step);
    }

    if (typeId === 'wolf_alpha') {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(s * 0.5, s * 0.25, size * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function drawQuadruped(ctx, size, base, dark, light, accent, sprite, step) {
    const bodyW = size * (sprite.bodyScale || 0.9);
    const bodyH = size * (sprite.bodyHeight || 0.55);
    const bodyX = size * 0.2;
    const bodyY = size * 0.35;

    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.ellipse(bodyX + bodyW * 0.5, bodyY + bodyH * 0.55, bodyW * 0.55, bodyH * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(bodyX + bodyW * 0.5, bodyY + bodyH * 0.5, bodyW * 0.5, bodyH * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    const legW = size * 0.08;
    const legH = size * (sprite.legLength || 0.25);
    const legY = bodyY + bodyH * 0.6;
    const legOffsets = [0.3, 0.55, 0.7, 0.85];
    legOffsets.forEach((offset, i) => {
        const swing = (i % 2 === 0 ? step : -step);
        ctx.fillStyle = dark;
        ctx.fillRect(size * offset, legY + swing, legW, legH);
        ctx.fillStyle = accent;
        ctx.fillRect(size * offset, legY + legH + swing, legW, 2);
    });

    // Head
    const headSize = size * (sprite.headScale || 0.35);
    const headX = size * 0.08;
    const headY = size * 0.3 + step * 0.3;
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.ellipse(headX + headSize * 0.6, headY + headSize * 0.6, headSize * 0.6, headSize * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(headX + headSize * 0.6, headY + headSize * 0.55, headSize * 0.5, headSize * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    if (sprite.earType === 'round') {
        ctx.fillStyle = dark;
        ctx.beginPath();
        ctx.arc(headX + headSize * 0.4, headY + headSize * 0.2, headSize * 0.15, 0, Math.PI * 2);
        ctx.arc(headX + headSize * 0.75, headY + headSize * 0.2, headSize * 0.15, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillStyle = dark;
        ctx.beginPath();
        ctx.moveTo(headX + headSize * 0.35, headY + headSize * 0.1);
        ctx.lineTo(headX + headSize * 0.25, headY - headSize * 0.2);
        ctx.lineTo(headX + headSize * 0.5, headY + headSize * 0.05);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(headX + headSize * 0.7, headY + headSize * 0.1);
        ctx.lineTo(headX + headSize * 0.65, headY - headSize * 0.2);
        ctx.lineTo(headX + headSize * 0.85, headY + headSize * 0.05);
        ctx.fill();
    }

    // Snout
    ctx.fillStyle = light;
    ctx.fillRect(headX + headSize * 0.05, headY + headSize * 0.55, headSize * 0.35, headSize * 0.25);
    ctx.fillStyle = '#111111';
    ctx.fillRect(headX + headSize * 0.05, headY + headSize * 0.6, headSize * 0.18, headSize * 0.12);

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(headX + headSize * 0.55, headY + headSize * 0.45, 4, 3);
    ctx.fillStyle = '#222222';
    ctx.fillRect(headX + headSize * 0.58, headY + headSize * 0.46, 2, 2);

    // Tail
    ctx.fillStyle = dark;
    if (sprite.tailType === 'flat') {
        ctx.fillRect(bodyX + bodyW * 0.85, bodyY + bodyH * 0.6, bodyW * 0.35, bodyH * 0.2);
    } else if (sprite.tailType === 'bushy') {
        ctx.beginPath();
        ctx.ellipse(bodyX + bodyW * 0.95, bodyY + bodyH * 0.45, bodyW * 0.25, bodyH * 0.2, -0.3, 0, Math.PI * 2);
        ctx.fill();
        if (sprite.tailTip) {
            ctx.fillStyle = sprite.tailTip;
            ctx.beginPath();
            ctx.ellipse(bodyX + bodyW * 1.02, bodyY + bodyH * 0.45, bodyW * 0.12, bodyH * 0.12, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    } else {
        ctx.fillRect(bodyX + bodyW * 0.9, bodyY + bodyH * 0.45, bodyW * 0.25, 3);
    }

    if (sprite.pattern === 'stripes') {
        ctx.fillStyle = 'rgba(40, 40, 40, 0.6)';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(bodyX + bodyW * (0.2 + i * 0.15), bodyY + bodyH * (0.15 + i * 0.1), 3, bodyH * 0.4);
        }
    }

    if (sprite.tusks) {
        ctx.fillStyle = '#dddddd';
        ctx.fillRect(headX - 2, headY + headSize * 0.65, 2, 4);
        ctx.fillRect(headX + 2, headY + headSize * 0.7, 2, 4);
    }
}

function drawMount(ctx, size, base, dark, light, accent, sprite, step) {
    drawQuadruped(ctx, size, base, dark, light, accent, {
        bodyScale: 1.0,
        bodyHeight: 0.6,
        headScale: 0.4,
        legLength: 0.35,
        tailType: 'long',
        earType: 'pointed'
    }, step);

    // Mane or hump
    if (sprite.hump) {
        ctx.fillStyle = dark;
        ctx.beginPath();
        ctx.ellipse(size * 0.6, size * 0.25, size * 0.2, size * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillStyle = dark;
        ctx.fillRect(size * 0.35, size * 0.2, size * 0.2, size * 0.08);
    }

    // Saddle hint for mounts
    ctx.fillStyle = '#5a3a2a';
    ctx.fillRect(size * 0.42, size * 0.42, size * 0.22, size * 0.08);
    ctx.fillStyle = '#6a4a3a';
    ctx.fillRect(size * 0.45, size * 0.4, size * 0.16, size * 0.04);
}

function drawBird(ctx, size, base, dark, light, accent, step) {
    const bodyW = size * 0.7;
    const bodyH = size * 0.45;
    const bodyX = size * 0.15;
    const bodyY = size * 0.35;

    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.ellipse(bodyX + bodyW * 0.5, bodyY + bodyH * 0.55, bodyW * 0.5, bodyH * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(bodyX + bodyW * 0.5, bodyY + bodyH * 0.5, bodyW * 0.45, bodyH * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(size * 0.15, size * 0.5 + step);
    ctx.lineTo(size * 0.45, size * 0.35 + step);
    ctx.lineTo(size * 0.4, size * 0.6 + step);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(size * 0.85, size * 0.5 - step);
    ctx.lineTo(size * 0.55, size * 0.35 - step);
    ctx.lineTo(size * 0.6, size * 0.6 - step);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(size * 0.25, size * 0.3, size * 0.18, size * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#d4a13a';
    ctx.beginPath();
    ctx.moveTo(size * 0.08, size * 0.3);
    ctx.lineTo(size * 0.18, size * 0.26);
    ctx.lineTo(size * 0.18, size * 0.34);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = '#111111';
    ctx.fillRect(size * 0.23, size * 0.27, 2, 2);

    // Tail feathers
    ctx.fillStyle = dark;
    ctx.fillRect(size * 0.78, size * 0.55, size * 0.12, 2);
    ctx.fillRect(size * 0.78, size * 0.6, size * 0.1, 2);
}

function shadeColor(color, amount) {
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    const r = Math.max(0, Math.min(255, rgb.r + amount));
    const g = Math.max(0, Math.min(255, rgb.g + amount));
    const b = Math.max(0, Math.min(255, rgb.b + amount));
    return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex) {
    if (typeof hex !== 'string') return null;
    const normalized = hex.startsWith('#') ? hex.slice(1) : hex;
    if (normalized.length !== 6) return null;
    const num = parseInt(normalized, 16);
    if (Number.isNaN(num)) return null;
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

const PET_SPRITES = {
    wolf: { family: 'quadruped', bodyScale: 0.9, headScale: 0.35, legLength: 0.28, tailType: 'bushy', earType: 'pointed' },
    bear: { family: 'quadruped', bodyScale: 1.05, headScale: 0.4, legLength: 0.3, tailType: 'stub', earType: 'round' },
    tiger: { family: 'quadruped', bodyScale: 0.95, headScale: 0.38, legLength: 0.3, tailType: 'bushy', earType: 'pointed', pattern: 'stripes' },
    hawk: { family: 'bird' },
    fox: { family: 'quadruped', bodyScale: 0.85, headScale: 0.33, legLength: 0.25, tailType: 'bushy', earType: 'pointed', tailTip: '#fff3c2' },
    horse: { family: 'mount' },
    camel: { family: 'mount', hump: true },
    boar: { family: 'quadruped', bodyScale: 0.9, headScale: 0.34, legLength: 0.25, tailType: 'stub', earType: 'pointed', tusks: true },
    beaver: { family: 'quadruped', bodyScale: 0.8, headScale: 0.3, legLength: 0.22, tailType: 'flat', earType: 'round' },
    wolf_alpha: { family: 'quadruped', bodyScale: 1.0, headScale: 0.4, legLength: 0.3, tailType: 'bushy', earType: 'pointed' },
    default: { family: 'quadruped', bodyScale: 0.9, headScale: 0.35, legLength: 0.25, tailType: 'bushy', earType: 'pointed' }
};

function renderTamingUI(ctx, x, y) {
    const barWidth = 100;
    const barHeight = 10;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x - barWidth / 2 - 5, y - 30, barWidth + 10, 45);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Taming...', x, y - 18);

    const session = typeof PetSystem !== 'undefined' ? PetSystem.getTamingSession() : null;
    const maxPatience = typeof PetSystem !== 'undefined' ? PetSystem.CONFIG.TAMING_MAX_PATIENCE : 100;
    const patiencePercent = session ? session.patience / maxPatience : 0;
    ctx.fillStyle = '#333';
    ctx.fillRect(x - barWidth / 2, y - 5, barWidth, barHeight);
    ctx.fillStyle = patiencePercent > 0.5 ? '#00ff00' : patiencePercent > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillRect(x - barWidth / 2, y - 5, barWidth * patiencePercent, barHeight);

    ctx.fillStyle = '#aaaaaa';
    ctx.font = '10px Arial';
    ctx.fillText('Feed & approach slowly', x, y + 12);
}
