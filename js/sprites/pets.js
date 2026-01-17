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

    // Draw outline
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(screenX + s * 0.5, screenY + s * 0.5, size * 0.5 + 1, size * 0.6 + 1, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Draw pet body
    ctx.fillStyle = pet.type.color;
    ctx.beginPath();
    ctx.ellipse(screenX + s * 0.5, screenY + s * 0.5, size * 0.5, size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw direction indicator
    const eyeOffset = (pet.direction || 1) * size * 0.2;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(screenX + s * 0.5 + eyeOffset, screenY + s * 0.5 - size * 0.2, size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Draw pet icon
    ctx.font = `${Math.floor(size)}px Pixelify Sans, Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pet.type.icon, screenX + s * 0.5, screenY + s * 0.5);

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
