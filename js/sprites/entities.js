// ============= ENTITY SPRITES =============
// Enhanced procedural sprites for player, zombies, and survivors
// Includes equipment visualization and zombie variants

// ============= EQUIPMENT VISUAL DEFINITIONS =============
const WEAPON_VISUALS = {
    wooden_sword: { color: '#8a6a4a', glowColor: null, type: 'sword', length: 0.3 },
    stone_sword: { color: '#7a7a7a', glowColor: null, type: 'sword', length: 0.32 },
    iron_sword: { color: '#aaaaaa', glowColor: null, type: 'sword', length: 0.35 },
    steel_sword: { color: '#c0c0c0', glowColor: '#e0e0ff', type: 'sword', length: 0.38 },
    flame_blade: { color: '#ff6644', glowColor: '#ff4400', type: 'sword', length: 0.4, flame: true },
    doom_cleaver: { color: '#4a2a4a', glowColor: '#aa44aa', type: 'greatsword', length: 0.5 },
    legendary_sword: { color: '#ffdd44', glowColor: '#ffffff', type: 'sword', length: 0.45, legendary: true },
    bow: { color: '#6a4a2a', glowColor: null, type: 'bow' },
    crossbow: { color: '#5a5a5a', glowColor: null, type: 'crossbow' }
};

const ARMOR_VISUALS = {
    // HEAD
    leather_cap: { color: '#8a6a4a', type: 'cap', tier: 1 },
    iron_helmet: { color: '#8a8a8a', type: 'helmet', tier: 2 },
    steel_helmet: { color: '#a0a0b0', type: 'helmet', tier: 3 },
    queens_crown: { color: '#ffcc44', type: 'crown', tier: 4 },
    golden_crown: { color: '#ffdd66', type: 'crown', tier: 5, legendary: true },

    // CHEST
    leather_vest: { color: '#7a5a3a', type: 'vest', tier: 1 },
    iron_chestplate: { color: '#7a7a8a', type: 'plate', tier: 2 },
    steel_chestplate: { color: '#909098', type: 'plate', tier: 3 },
    dragon_mail: { color: '#cc4444', type: 'mail', tier: 4, scales: true },
    hero_armor: { color: '#4488cc', type: 'plate', tier: 4 },
    legendary_armor: { color: '#ffcc44', type: 'plate', tier: 5, legendary: true },

    // LEGS
    leather_pants: { color: '#7a5a3a', type: 'pants', tier: 1 },
    iron_greaves: { color: '#7a7a8a', type: 'greaves', tier: 2 },
    explorers_boots: { color: '#6a5a4a', type: 'boots', tier: 3 }
};

// ============= ZOMBIE VARIANT DEFINITIONS =============
const ZOMBIE_VARIANTS = {
    normal: {
        name: 'Zombie',
        bodyColor: '#5a7a5a',
        skinColor: '#6a8a6a',
        eyeColor: '#ff3333',
        size: 1.0,
        speed: 1.0
    },
    runner: {
        name: 'Runner',
        bodyColor: '#5a6a5a',
        skinColor: '#6a7a6a',
        eyeColor: '#ffaa33',
        size: 0.85,
        speed: 1.6,
        hunched: true
    },
    brute: {
        name: 'Brute',
        bodyColor: '#4a5a4a',
        skinColor: '#5a6a5a',
        eyeColor: '#ff0000',
        size: 1.4,
        speed: 0.7,
        bulky: true
    },
    spitter: {
        name: 'Spitter',
        bodyColor: '#5a8a5a',
        skinColor: '#6a9a6a',
        eyeColor: '#44ff44',
        size: 0.9,
        speed: 0.9,
        bloated: true
    },
    crawler: {
        name: 'Crawler',
        bodyColor: '#6a6a5a',
        skinColor: '#7a7a6a',
        eyeColor: '#ff6666',
        size: 0.7,
        speed: 1.2,
        crawling: true
    },
    screamer: {
        name: 'Screamer',
        bodyColor: '#7a7a8a',
        skinColor: '#8a8a9a',
        eyeColor: '#ff44ff',
        size: 0.95,
        speed: 0.8,
        glowing: true
    },
    armored: {
        name: 'Armored',
        bodyColor: '#5a5a5a',
        skinColor: '#6a6a6a',
        eyeColor: '#ff2222',
        size: 1.15,
        speed: 0.85,
        armored: true
    },
    boss: {
        name: 'Zombie King',
        bodyColor: '#3a4a3a',
        skinColor: '#4a5a4a',
        eyeColor: '#ff0000',
        size: 2.0,
        speed: 0.5,
        boss: true,
        crown: true
    }
};

// ============= PLAYER SPRITE WITH EQUIPMENT =============
function renderPlayerEnhanced(renderX, renderY, camX, camY) {
    const s = TILE_SIZE * SCALE;
    const sx = (renderX - 0.5) * s - camX;
    const sy = (renderY - 0.6) * s - camY;
    const time = pixelTime || Date.now() / 1000;

    // Get equipped items
    let weapon = null, head = null, chest = null, legs = null;
    if (typeof EquipmentSystem !== 'undefined') {
        weapon = EquipmentSystem.getEquippedItem('weapon');
        head = EquipmentSystem.getEquippedItem('head');
        chest = EquipmentSystem.getEquippedItem('chest');
        legs = EquipmentSystem.getEquippedItem('legs');
    }

    // Hit flash effect
    if (player.hitTimer > 0) {
        ctx.globalAlpha = 0.5 + Math.sin(player.hitTimer * 30) * 0.3;
    }

    // Dust particles when moving
    if (player.isMoving && Math.random() < 0.1) {
        if (typeof spawnParticles === 'function') {
            spawnParticles(player.x, player.y + 0.3, 'dust', 1, 'dust', { speed: 0.5, size: 1.5 });
        }
    }

    // Animation values
    const bobY = player.isMoving ? Math.sin(player.animTimer * 12) * 2 : 0;
    const armSwing = player.isMoving ? Math.sin(player.animTimer * 12) * s * 0.1 : 0;
    const legSwing = player.isMoving ? Math.sin(player.animTimer * 12) * s * 0.08 : 0;
    const attackSwing = player.attackCooldown > 0 ? Math.sin(player.attackCooldown * 20) * 0.8 : 0;

    // Direction offsets
    let faceOffX = 0;
    const dir = player.direction;
    if (dir === 0) faceOffX = s * 0.1;  // Right
    if (dir === 2) faceOffX = -s * 0.1; // Left

    // ======= SHADOW =======
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(sx + s * 0.5, sy + s * 0.95, s * 0.35, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // ======= LEGS =======
    const legsVisual = legs ? ARMOR_VISUALS[legs.id] : null;
    const legsColor = legsVisual ? legsVisual.color : '#3355aa';
    const bootsColor = legsVisual && legsVisual.tier >= 2 ? '#4a4a5a' : '#2a2a3a';

    // Boots/Shoes
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.28, sy + s * 0.88 + legSwing, s * 0.18, s * 0.1);
    ctx.fillRect(sx + s * 0.54, sy + s * 0.88 - legSwing, s * 0.18, s * 0.1);
    ctx.fillStyle = bootsColor;
    ctx.fillRect(sx + s * 0.30, sy + s * 0.89 + legSwing, s * 0.14, s * 0.08);
    ctx.fillRect(sx + s * 0.56, sy + s * 0.89 - legSwing, s * 0.14, s * 0.08);

    // Leg armor
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.28, sy + s * 0.74 + legSwing, s * 0.18, s * 0.16);
    ctx.fillRect(sx + s * 0.54, sy + s * 0.74 - legSwing, s * 0.18, s * 0.16);
    ctx.fillStyle = legsColor;
    ctx.fillRect(sx + s * 0.30, sy + s * 0.76 + legSwing, s * 0.14, s * 0.12);
    ctx.fillRect(sx + s * 0.56, sy + s * 0.76 - legSwing, s * 0.14, s * 0.12);

    // Leg armor details for higher tiers
    if (legsVisual && legsVisual.tier >= 2) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(sx + s * 0.30, sy + s * 0.76 + legSwing, s * 0.14, 2);
        ctx.fillRect(sx + s * 0.56, sy + s * 0.76 - legSwing, s * 0.14, 2);
    }

    // ======= BODY / CHEST ARMOR =======
    const chestVisual = chest ? ARMOR_VISUALS[chest.id] : null;
    const chestColor = chestVisual ? chestVisual.color : '#4488ff';
    const chestTier = chestVisual ? chestVisual.tier : 0;

    // Body outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.24, sy + s * 0.36 + bobY, s * 0.52, s * 0.42);

    // Body/Armor main
    ctx.fillStyle = chestColor;
    ctx.fillRect(sx + s * 0.26, sy + s * 0.38 + bobY, s * 0.48, s * 0.38);

    // Armor details based on tier
    if (chestTier >= 2) {
        // Plate armor details
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(sx + s * 0.26, sy + s * 0.5 + bobY, s * 0.48, 2);
        ctx.fillRect(sx + s * 0.26, sy + s * 0.6 + bobY, s * 0.48, 2);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(sx + s * 0.28, sy + s * 0.4 + bobY, s * 0.44, 2);
    }

    if (chestVisual && chestVisual.scales) {
        // Dragon scale pattern
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
                const scX = sx + s * 0.28 + col * s * 0.11 + (row % 2) * s * 0.055;
                const scY = sy + s * 0.42 + row * s * 0.1 + bobY;
                ctx.beginPath();
                ctx.arc(scX, scY, s * 0.04, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    if (chestVisual && chestVisual.legendary) {
        // Legendary glow
        const glowPulse = Math.sin(time * 3) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(255, 220, 100, ${0.2 * glowPulse})`;
        ctx.fillRect(sx + s * 0.24, sy + s * 0.36 + bobY, s * 0.52, s * 0.42);
    }

    // Collar/neckline
    ctx.fillStyle = PALETTE.skin1;
    ctx.fillRect(sx + s * 0.38, sy + s * 0.36 + bobY, s * 0.24, s * 0.06);

    // ======= BACK ARM (left when facing down) =======
    const armY = sy + s * 0.40 + bobY;
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.12, armY + armSwing, s * 0.16, s * 0.26);
    ctx.fillStyle = chestTier >= 1 ? chestColor : PALETTE.skin1;
    ctx.fillRect(sx + s * 0.14, armY + 2 + armSwing, s * 0.12, s * 0.14);
    ctx.fillStyle = PALETTE.skin1;
    ctx.fillRect(sx + s * 0.14, armY + s * 0.16 + armSwing, s * 0.12, s * 0.08);

    // ======= HEAD =======
    // Head outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.28, sy + s * 0.12 + bobY, s * 0.44, s * 0.3);

    // Head/face
    ctx.fillStyle = PALETTE.skin1;
    ctx.fillRect(sx + s * 0.30, sy + s * 0.14 + bobY, s * 0.40, s * 0.26);

    // ======= HAIR / HEAD ARMOR =======
    const headVisual = head ? ARMOR_VISUALS[head.id] : null;

    if (headVisual) {
        // Render helmet/cap/crown
        if (headVisual.type === 'crown') {
            // Crown
            ctx.fillStyle = PALETTE.outline;
            ctx.fillRect(sx + s * 0.26, sy + s * 0.04 + bobY, s * 0.48, s * 0.14);
            ctx.fillStyle = headVisual.color;
            ctx.fillRect(sx + s * 0.28, sy + s * 0.06 + bobY, s * 0.44, s * 0.1);
            // Crown points
            ctx.fillRect(sx + s * 0.3, sy + bobY, s * 0.08, s * 0.08);
            ctx.fillRect(sx + s * 0.46, sy - s * 0.02 + bobY, s * 0.08, s * 0.1);
            ctx.fillRect(sx + s * 0.62, sy + bobY, s * 0.08, s * 0.08);
            // Gems
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(sx + s * 0.48, sy + s * 0.02 + bobY, s * 0.04, s * 0.04);

            if (headVisual.legendary) {
                const glowPulse = Math.sin(time * 4) * 0.3 + 0.7;
                ctx.fillStyle = `rgba(255, 255, 200, ${glowPulse * 0.3})`;
                ctx.fillRect(sx + s * 0.26, sy - s * 0.02 + bobY, s * 0.48, s * 0.2);
            }
        } else if (headVisual.type === 'helmet') {
            // Full helmet
            ctx.fillStyle = PALETTE.outline;
            ctx.fillRect(sx + s * 0.26, sy + s * 0.06 + bobY, s * 0.48, s * 0.2);
            ctx.fillStyle = headVisual.color;
            ctx.fillRect(sx + s * 0.28, sy + s * 0.08 + bobY, s * 0.44, s * 0.16);
            // Visor slit
            ctx.fillStyle = '#1a1a2a';
            ctx.fillRect(sx + s * 0.32, sy + s * 0.18 + bobY, s * 0.36, s * 0.04);
            // Highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(sx + s * 0.28, sy + s * 0.08 + bobY, s * 0.44, 2);
        } else {
            // Cap
            ctx.fillStyle = PALETTE.outline;
            ctx.fillRect(sx + s * 0.26, sy + s * 0.06 + bobY, s * 0.48, s * 0.14);
            ctx.fillStyle = headVisual.color;
            ctx.fillRect(sx + s * 0.28, sy + s * 0.08 + bobY, s * 0.44, s * 0.1);
        }
    } else {
        // Default hair
        ctx.fillStyle = PALETTE.outline;
        ctx.fillRect(sx + s * 0.26, sy + s * 0.06 + bobY, s * 0.48, s * 0.16);
        ctx.fillStyle = '#5a4030';
        ctx.fillRect(sx + s * 0.28, sy + s * 0.08 + bobY, s * 0.44, s * 0.12);
    }

    // ======= EYES =======
    if (dir !== 3 && !(headVisual && headVisual.type === 'helmet')) {
        if (dir === 0 || dir === 2) {
            // Side view - one eye
            const eyeX = dir === 0 ? sx + s * 0.54 : sx + s * 0.38;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(eyeX, sy + s * 0.24 + bobY, s * 0.08, s * 0.06);
            ctx.fillStyle = '#222';
            ctx.fillRect(eyeX + (dir === 0 ? s * 0.03 : s * 0.01), sy + s * 0.25 + bobY, s * 0.04, s * 0.04);
        } else {
            // Front view - both eyes
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(sx + s * 0.34, sy + s * 0.24 + bobY, s * 0.1, s * 0.08);
            ctx.fillRect(sx + s * 0.56, sy + s * 0.24 + bobY, s * 0.1, s * 0.08);
            ctx.fillStyle = '#222';
            ctx.fillRect(sx + s * 0.37, sy + s * 0.25 + bobY, s * 0.05, s * 0.06);
            ctx.fillRect(sx + s * 0.58, sy + s * 0.25 + bobY, s * 0.05, s * 0.06);
            // Eye shine
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(sx + s * 0.38, sy + s * 0.26 + bobY, s * 0.02, s * 0.02);
            ctx.fillRect(sx + s * 0.59, sy + s * 0.26 + bobY, s * 0.02, s * 0.02);
        }
    }

    // ======= FRONT ARM (right when facing down) WITH WEAPON =======
    const frontArmX = sx + s * 0.72;
    const weaponVisual = weapon ? WEAPON_VISUALS[weapon.id] : null;

    // Arm
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(frontArmX, armY - armSwing, s * 0.16, s * 0.26);
    ctx.fillStyle = chestTier >= 1 ? chestColor : PALETTE.skin1;
    ctx.fillRect(frontArmX + 2, armY + 2 - armSwing, s * 0.12, s * 0.14);
    ctx.fillStyle = PALETTE.skin1;
    ctx.fillRect(frontArmX + 2, armY + s * 0.16 - armSwing, s * 0.12, s * 0.08);

    // Weapon rendering
    if (weaponVisual) {
        ctx.save();
        const weaponX = frontArmX + s * 0.08;
        const weaponY = armY + s * 0.2 - armSwing;
        ctx.translate(weaponX, weaponY);
        ctx.rotate(-0.5 + attackSwing);

        if (weaponVisual.type === 'sword' || weaponVisual.type === 'greatsword') {
            const len = s * weaponVisual.length;
            const width = weaponVisual.type === 'greatsword' ? s * 0.08 : s * 0.05;

            // Weapon glow
            if (weaponVisual.glowColor) {
                const glowPulse = Math.sin(time * 4) * 0.3 + 0.7;
                ctx.fillStyle = weaponVisual.glowColor;
                ctx.globalAlpha = 0.3 * glowPulse;
                ctx.fillRect(-width - 2, -len - 4, width * 2 + 4, len + 8);
                ctx.globalAlpha = 1;
            }

            // Handle
            ctx.fillStyle = '#5a4030';
            ctx.fillRect(-width * 0.4, 0, width * 0.8, s * 0.1);

            // Guard
            ctx.fillStyle = '#8a7a5a';
            ctx.fillRect(-width * 1.2, -s * 0.02, width * 2.4, s * 0.04);

            // Blade outline
            ctx.fillStyle = PALETTE.outline;
            ctx.fillRect(-width / 2 - 1, -len - 1, width + 2, len + 2);

            // Blade
            ctx.fillStyle = weaponVisual.color;
            ctx.fillRect(-width / 2, -len, width, len);

            // Blade highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(-width / 2, -len, width * 0.3, len);

            // Flame effect
            if (weaponVisual.flame) {
                ctx.globalAlpha = 0.7 + Math.sin(time * 15) * 0.3;
                for (let i = 0; i < 5; i++) {
                    const flameY = -len + i * (len / 5);
                    const flameSize = (1 - i / 5) * s * 0.06;
                    const flicker = Math.sin(time * 20 + i) * 2;
                    ctx.fillStyle = i % 2 === 0 ? '#ff6600' : '#ffaa00';
                    ctx.fillRect(-width / 2 - flameSize + flicker, flameY, width + flameSize * 2, len / 6);
                }
                ctx.globalAlpha = 1;
            }

            // Legendary sparkles
            if (weaponVisual.legendary) {
                for (let i = 0; i < 3; i++) {
                    const sparkX = Math.sin(time * 5 + i * 2) * width;
                    const sparkY = -len * (0.2 + i * 0.3);
                    ctx.fillStyle = '#ffffff';
                    ctx.globalAlpha = 0.5 + Math.sin(time * 8 + i) * 0.5;
                    ctx.fillRect(sparkX - 1, sparkY - 1, 3, 3);
                }
                ctx.globalAlpha = 1;
            }
        } else if (weaponVisual.type === 'bow') {
            // Bow
            ctx.strokeStyle = weaponVisual.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, -s * 0.15, s * 0.2, Math.PI * 0.3, Math.PI * 1.7);
            ctx.stroke();
            // Bowstring
            ctx.strokeStyle = '#8a7a6a';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(s * 0.12, s * 0.05);
            ctx.lineTo(0, -s * 0.08);
            ctx.lineTo(-s * 0.08, -s * 0.32);
            ctx.stroke();
        } else if (weaponVisual.type === 'crossbow') {
            // Crossbow body
            ctx.fillStyle = weaponVisual.color;
            ctx.fillRect(-s * 0.03, -s * 0.25, s * 0.06, s * 0.3);
            // Crossbow arms
            ctx.fillRect(-s * 0.15, -s * 0.22, s * 0.3, s * 0.04);
            // String
            ctx.strokeStyle = '#6a5a4a';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-s * 0.15, -s * 0.2);
            ctx.lineTo(0, -s * 0.15);
            ctx.lineTo(s * 0.15, -s * 0.2);
            ctx.stroke();
        }

        ctx.restore();
    }

    // ======= HEALTH/EXP UI ABOVE PLAYER =======
    // Only show if damaged
    if (player.health < player.maxHealth) {
        const barWidth = s * 0.8;
        const barX = sx + s * 0.1;
        const barY = sy - 10;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(barX - 1, barY - 1, barWidth + 2, 7);

        const healthPct = player.health / player.maxHealth;
        const hpColor = healthPct > 0.5 ? '#44dd44' : healthPct > 0.25 ? '#dddd44' : '#dd4444';

        ctx.fillStyle = '#222';
        ctx.fillRect(barX, barY, barWidth, 5);
        ctx.fillStyle = hpColor;
        ctx.fillRect(barX, barY, barWidth * healthPct, 5);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(barX, barY, barWidth * healthPct, 2);
    }

    ctx.globalAlpha = 1;
}

// ============= ZOMBIE SPRITES WITH VARIANTS =============
function renderZombieEnhanced(z, renderX, renderY, camX, camY) {
    const s = TILE_SIZE * SCALE;
    const sx = (renderX - 0.5) * s - camX;
    const sy = (renderY - 0.6) * s - camY;
    const time = pixelTime || Date.now() / 1000;

    if (sx < -s * 2 || sx > canvas.width + s * 2 || sy < -s * 2 || sy > canvas.height + s * 2) return;

    // Get variant info
    const variant = ZOMBIE_VARIANTS[z.variant] || ZOMBIE_VARIANTS.normal;
    const size = variant.size;
    const bodyColor = z.bodyColor || variant.bodyColor;
    const skinColor = z.skinColor || variant.skinColor;
    const eyeColor = z.eyeColor || variant.eyeColor;

    // Animation values
    const bob = Math.sin(z.animTimer * 3 * variant.speed) * 1.5;
    const shamble = Math.sin(z.animTimer * 2 * variant.speed) * 2;
    const armReach = Math.sin(z.animTimer * 4 * variant.speed) * s * 0.08;

    ctx.save();

    // Scale for size variants
    if (size !== 1.0) {
        ctx.translate(sx + s * 0.5, sy + s * 0.5);
        ctx.scale(size, size);
        ctx.translate(-sx - s * 0.5, -sy - s * 0.5);
    }

    // Crawler variant - rotate to horizontal
    if (variant.crawling) {
        ctx.translate(sx + s * 0.5, sy + s * 0.7);
        ctx.rotate(Math.PI / 2 * 0.4);
        ctx.translate(-sx - s * 0.5, -sy - s * 0.7);
    }

    // Glowing effect for screamer
    if (variant.glowing) {
        const glowPulse = Math.sin(time * 5) * 0.3 + 0.7;
        const glow = ctx.createRadialGradient(sx + s * 0.5, sy + s * 0.5, 0, sx + s * 0.5, sy + s * 0.5, s * 0.8);
        glow.addColorStop(0, `rgba(255, 100, 255, ${0.3 * glowPulse})`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(sx - s * 0.3, sy - s * 0.3, s * 1.6, s * 1.6);
    }

    // Night eye glow
    if (isNight && !variant.crawling) {
        const eyeGlow = ctx.createRadialGradient(sx + s * 0.5, sy + s * 0.3, 0, sx + s * 0.5, sy + s * 0.3, s * 0.5);
        eyeGlow.addColorStop(0, `${eyeColor}66`);
        eyeGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = eyeGlow;
        ctx.fillRect(sx, sy, s, s * 0.6);
    }

    // ======= SHADOW =======
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(sx + s * 0.5, sy + s * 0.95, s * 0.35 * size, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // ======= LEGS =======
    if (!variant.crawling) {
        ctx.fillStyle = PALETTE.outline;
        ctx.fillRect(sx + s * 0.28 + shamble * 0.5, sy + s * 0.76, s * 0.18, s * 0.22);
        ctx.fillRect(sx + s * 0.54 - shamble * 0.5, sy + s * 0.76, s * 0.18, s * 0.22);

        ctx.fillStyle = bodyColor;
        ctx.fillRect(sx + s * 0.30 + shamble * 0.5, sy + s * 0.78, s * 0.14, s * 0.18);
        ctx.fillRect(sx + s * 0.56 - shamble * 0.5, sy + s * 0.78, s * 0.14, s * 0.18);

        // Torn pants detail
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(sx + s * 0.32 + shamble * 0.5, sy + s * 0.85, s * 0.06, s * 0.08);
    }

    // ======= BODY =======
    const bodyWidth = variant.bulky ? s * 0.7 : (variant.bloated ? s * 0.65 : s * 0.56);
    const bodyHeight = variant.hunched ? s * 0.4 : s * 0.46;
    const bodyX = sx + s * 0.5 - bodyWidth / 2;
    const bodyY = sy + s * 0.33 + (variant.hunched ? s * 0.08 : 0) + bob;

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(bodyX - 2, bodyY - 2, bodyWidth + 4, bodyHeight + 4);

    ctx.fillStyle = bodyColor;
    ctx.fillRect(bodyX, bodyY, bodyWidth, bodyHeight);

    // Torn clothing
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(bodyX + bodyWidth * 0.1, bodyY + 2, bodyWidth * 0.8, bodyHeight * 0.3);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(bodyX + bodyWidth * 0.2, bodyY + bodyHeight * 0.4, bodyWidth * 0.3, bodyHeight * 0.3);

    // Armor for armored variant
    if (variant.armored) {
        ctx.fillStyle = '#5a5a6a';
        ctx.fillRect(bodyX + 4, bodyY + 4, bodyWidth - 8, bodyHeight * 0.5);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(bodyX + 4, bodyY + 4, bodyWidth - 8, 2);
        // Shoulder plates
        ctx.fillStyle = '#6a6a7a';
        ctx.fillRect(bodyX - 4, bodyY, s * 0.12, s * 0.1);
        ctx.fillRect(bodyX + bodyWidth - s * 0.08, bodyY, s * 0.12, s * 0.1);
    }

    // Bloated belly for spitter
    if (variant.bloated) {
        ctx.fillStyle = '#7aaa7a';
        ctx.beginPath();
        ctx.ellipse(sx + s * 0.5, bodyY + bodyHeight * 0.6, s * 0.2, s * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        // Pulsing effect
        const pulse = Math.sin(time * 4) * 0.1 + 0.9;
        ctx.fillStyle = '#8aba8a';
        ctx.beginPath();
        ctx.ellipse(sx + s * 0.5, bodyY + bodyHeight * 0.6, s * 0.15 * pulse, s * 0.1 * pulse, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // ======= ARMS =======
    const armY = bodyY + s * 0.05;

    // Left arm (reaching)
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.02 + armReach, armY, s * 0.22, s * 0.14);
    ctx.fillStyle = skinColor;
    ctx.fillRect(sx + s * 0.04 + armReach, armY + 2, s * 0.18, s * 0.10);

    // Hand with claws
    ctx.fillStyle = skinColor;
    ctx.fillRect(sx - s * 0.02 + armReach, armY + s * 0.02, s * 0.08, s * 0.1);
    ctx.fillStyle = '#4a4a4a';
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(sx - s * 0.04 + armReach + i * s * 0.025, armY + s * 0.02 + i * 2, s * 0.02, s * 0.04);
    }

    // Right arm
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.76 - armReach * 0.5, armY + s * 0.04, s * 0.22, s * 0.14);
    ctx.fillStyle = skinColor;
    ctx.fillRect(sx + s * 0.78 - armReach * 0.5, armY + s * 0.06, s * 0.18, s * 0.10);

    // ======= HEAD =======
    const headY = sy + s * 0.08 + bob + (variant.hunched ? s * 0.06 : 0);
    const headTilt = variant.hunched ? 0.15 : 0;

    ctx.save();
    ctx.translate(sx + s * 0.5, headY + s * 0.15);
    ctx.rotate(headTilt);
    ctx.translate(-sx - s * 0.5, -headY - s * 0.15);

    // Head outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + s * 0.26, headY, s * 0.48, s * 0.32);

    // Head
    ctx.fillStyle = skinColor;
    ctx.fillRect(sx + s * 0.28, headY + 2, s * 0.44, s * 0.28);

    // Decay marks
    ctx.fillStyle = 'rgba(50, 70, 50, 0.4)';
    ctx.fillRect(sx + s * 0.55, headY + s * 0.1, s * 0.1, s * 0.08);
    ctx.fillRect(sx + s * 0.32, headY + s * 0.2, s * 0.06, s * 0.06);

    // ======= EYES =======
    ctx.fillStyle = eyeColor;
    ctx.fillRect(sx + s * 0.33, headY + s * 0.1, s * 0.12, s * 0.1);
    ctx.fillRect(sx + s * 0.55, headY + s * 0.1, s * 0.12, s * 0.1);

    // Eye glow center
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.5 + Math.sin(time * 6) * 0.3;
    ctx.fillRect(sx + s * 0.36, headY + s * 0.12, s * 0.06, s * 0.06);
    ctx.fillRect(sx + s * 0.58, headY + s * 0.12, s * 0.06, s * 0.06);
    ctx.globalAlpha = 1;

    // ======= MOUTH =======
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(sx + s * 0.38, headY + s * 0.22, s * 0.24, s * 0.06);
    // Teeth
    ctx.fillStyle = '#aaaaaa';
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(sx + s * 0.4 + i * s * 0.05, headY + s * 0.22, s * 0.03, s * 0.03);
    }

    ctx.restore();

    // ======= BOSS CROWN =======
    if (variant.crown) {
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(sx + s * 0.3, headY - s * 0.15, s * 0.4, s * 0.12);
        ctx.fillRect(sx + s * 0.32, headY - s * 0.22, s * 0.08, s * 0.1);
        ctx.fillRect(sx + s * 0.46, headY - s * 0.25, s * 0.08, s * 0.13);
        ctx.fillRect(sx + s * 0.60, headY - s * 0.22, s * 0.08, s * 0.1);
        // Gems
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(sx + s * 0.48, headY - s * 0.12, s * 0.04, s * 0.04);
    }

    ctx.restore();

    // ======= HEALTH BAR =======
    if (z.health < z.maxHealth) {
        const barWidth = s * 0.8 * size;
        const healthPercent = z.health / z.maxHealth;
        const barY = sy - 8 - (size > 1.5 ? 10 : 0);

        ctx.fillStyle = PALETTE.outline;
        ctx.fillRect(sx + s * 0.5 - barWidth / 2 - 1, barY - 1, barWidth + 2, 7);

        ctx.fillStyle = '#333';
        ctx.fillRect(sx + s * 0.5 - barWidth / 2, barY, barWidth, 5);

        const healthColor = healthPercent > 0.5 ? '#44dd44' : healthPercent > 0.25 ? '#dddd44' : '#dd4444';
        ctx.fillStyle = healthColor;
        ctx.fillRect(sx + s * 0.5 - barWidth / 2, barY, barWidth * healthPercent, 5);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(sx + s * 0.5 - barWidth / 2, barY, barWidth * healthPercent, 2);

        // Variant name for special zombies
        if (z.variant && z.variant !== 'normal') {
            ctx.fillStyle = eyeColor;
            ctx.font = `bold ${Math.floor(s * 0.12)}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(variant.name, sx + s * 0.5, barY - 4);
        }
    }
}

// ============= SURVIVOR SPRITE =============
function renderSurvivorEnhanced(survivor, renderX, renderY, camX, camY) {
    const s = TILE_SIZE * SCALE;
    const sx = (renderX - 0.5) * s - camX;
    const sy = (renderY - 0.6) * s - camY;

    if (sx < -s || sx > canvas.width + s || sy < -s || sy > canvas.height + s) return;

    // Role badge colors
    const roleColors = {
        'Soldier': { main: '#aa4444', light: '#cc5555', tool: 'sword' },
        'Guard': { main: '#6666aa', light: '#8888cc', tool: 'shield' },
        'Builder': { main: '#aa8844', light: '#ccaa66', tool: 'hammer' },
        'Farmer': { main: '#44aa44', light: '#66cc66', tool: 'hoe' },
        'Woodcutter': { main: '#8a5a2a', light: '#aa7a4a', tool: 'axe' },
        'Miner': { main: '#666666', light: '#888888', tool: 'pickaxe' },
        'Hunter': { main: '#668844', light: '#88aa66', tool: 'bow' },
        'Medic': { main: '#aa88cc', light: '#ccaaee', tool: 'bandage' },
        'None': { main: '#888888', light: '#aaaaaa', tool: null },
        'Leader': { main: '#aaaaaa', light: '#ffffff', tool: 'staff' }
    };

    const skinColor = survivor.skinColor || '#ddb088';
    const hairColor = survivor.hairColor || '#5a4030';
    const roleData = roleColors[survivor.role] || roleColors['None'];
    const clothingColor = survivor.clothingColor || roleData.main;
    const isFemale = survivor.gender === 'female';

    // Animation states
    const isMoving = !!survivor.isMoving;
    const isWorking = survivor.state === 'WORKING';
    const animTimer = survivor.animTimer || 0;

    let bobY = 0, armSwing = 0, legSwing = 0, toolAngle = 0;

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
    ctx.ellipse(sx + s * 0.5, sy + s * 0.92, s * 0.3, s * 0.08, 0, 0, Math.PI * 2);
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

    // Body shading
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(sx + s * 0.28, sy + s * 0.40 + bobY, s * 0.1, s * 0.38);
    ctx.fillRect(sx + s * 0.62, sy + s * 0.40 + bobY, s * 0.1, s * 0.38);

    // Belt
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(sx + s * 0.28, sy + s * 0.68 + bobY, s * 0.44, s * 0.05);

    // ======= ARMS =======
    const leftArmX = sx + s * 0.14;
    const rightArmX = sx + s * 0.72;
    const armY = sy + s * 0.42 + bobY;

    // Left arm
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(leftArmX - 1, armY + armSwing - 1, s * 0.14, s * 0.24);
    ctx.fillStyle = clothingColor;
    ctx.fillRect(leftArmX, armY + armSwing, s * 0.12, s * 0.12);
    ctx.fillStyle = skinColor;
    ctx.fillRect(leftArmX, armY + s * 0.12 + armSwing, s * 0.12, s * 0.1);

    // Right arm
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(rightArmX - 1, armY - armSwing - 1, s * 0.14, s * 0.24);
    ctx.fillStyle = clothingColor;
    ctx.fillRect(rightArmX, armY - armSwing, s * 0.12, s * 0.12);
    ctx.fillStyle = skinColor;
    ctx.fillRect(rightArmX, armY + s * 0.12 - armSwing, s * 0.12, s * 0.1);

    // Tool rendering when working
    if (isWorking && roleData.tool) {
        ctx.save();
        ctx.translate(rightArmX + s * 0.06, armY - armSwing + s * 0.15);
        ctx.rotate(toolAngle);

        switch (roleData.tool) {
            case 'axe':
                ctx.fillStyle = '#835c39';
                ctx.fillRect(0, -s * 0.25, 3, s * 0.5);
                ctx.fillStyle = '#aaa';
                ctx.fillRect(-4, -s * 0.32, 12, 10);
                break;
            case 'pickaxe':
                ctx.fillStyle = '#555';
                ctx.fillRect(0, -s * 0.25, 3, s * 0.5);
                ctx.fillStyle = '#888';
                ctx.fillRect(-8, -s * 0.28, 18, 5);
                break;
            case 'hoe':
                ctx.fillStyle = '#835c39';
                ctx.fillRect(0, -s * 0.3, 3, s * 0.55);
                ctx.fillStyle = '#777';
                ctx.fillRect(-5, -s * 0.3, 12, 4);
                break;
            case 'hammer':
                ctx.fillStyle = '#6a5a4a';
                ctx.fillRect(0, -s * 0.2, 3, s * 0.4);
                ctx.fillStyle = '#888';
                ctx.fillRect(-4, -s * 0.25, 10, 8);
                break;
            case 'sword':
                ctx.fillStyle = '#aaa';
                ctx.fillRect(-2, -s * 0.3, 5, s * 0.35);
                ctx.fillStyle = '#6a5a4a';
                ctx.fillRect(-1, 0, 3, s * 0.1);
                break;
            case 'bow':
                ctx.strokeStyle = '#6a4a2a';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, -s * 0.1, s * 0.15, Math.PI * 0.3, Math.PI * 1.7);
                ctx.stroke();
                break;
        }
        ctx.restore();
    }

    // ======= HEAD & HAIR =======
    const headX = sx + s * 0.31;
    const headY = sy + s * 0.16 + bobY;

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(headX - 1, headY - 1, s * 0.38 + 2, s * 0.28 + 2);
    ctx.fillStyle = skinColor;
    ctx.fillRect(headX, headY, s * 0.38, s * 0.28);

    // Hair
    ctx.fillStyle = hairColor;
    if (isFemale) {
        ctx.fillRect(sx + s * 0.28, sy + s * 0.08 + bobY, s * 0.44, s * 0.12);
        ctx.fillRect(sx + s * 0.26, sy + s * 0.18 + bobY, s * 0.08, s * 0.3);
        ctx.fillRect(sx + s * 0.66, sy + s * 0.18 + bobY, s * 0.08, s * 0.3);
    } else {
        ctx.fillRect(sx + s * 0.28, sy + s * 0.08 + bobY, s * 0.44, s * 0.1);
    }

    // ======= EYES =======
    if (survivor.direction !== 3) {
        ctx.fillStyle = '#fff';
        if (survivor.direction === 0 || survivor.direction === 2) {
            const eyeX = survivor.direction === 0 ? sx + s * 0.54 : sx + s * 0.38;
            ctx.fillRect(eyeX, sy + s * 0.26 + bobY, s * 0.08, s * 0.06);
            ctx.fillStyle = '#222';
            const pupilX = survivor.direction === 0 ? sx + s * 0.57 : sx + s * 0.39;
            ctx.fillRect(pupilX, sy + s * 0.27 + bobY, s * 0.04, s * 0.04);
        } else {
            ctx.fillRect(sx + s * 0.38, sy + s * 0.26 + bobY, s * 0.08, s * 0.06);
            ctx.fillRect(sx + s * 0.54, sy + s * 0.26 + bobY, s * 0.08, s * 0.06);
            ctx.fillStyle = '#222';
            ctx.fillRect(sx + s * 0.40, sy + s * 0.27 + bobY, s * 0.04, s * 0.04);
            ctx.fillRect(sx + s * 0.56, sy + s * 0.27 + bobY, s * 0.04, s * 0.04);
        }
    }

    // ======= HEALTH BAR =======
    const barWidth = s * 0.7;
    const healthPercent = Math.max(0, (survivor.health || 0) / (survivor.maxHealth || 100));
    const hpColor = healthPercent > 0.5 ? '#4ade4a' : healthPercent > 0.25 ? '#facc15' : '#f87171';

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(sx + s * 0.15, sy - 12, barWidth, 5);
    ctx.fillStyle = hpColor;
    ctx.fillRect(sx + s * 0.15, sy - 12, barWidth * healthPercent, 5);

    // ======= ROLE BADGE =======
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.arc(sx + s * 0.85, sy + s * 0.82, s * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = roleData.main;
    ctx.beginPath();
    ctx.arc(sx + s * 0.85, sy + s * 0.82, s * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.floor(s * 0.11)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(survivor.role ? survivor.role[0] : '?', sx + s * 0.85, sy + s * 0.82);
}

// ============= PROJECTILE SPRITE =============
function renderProjectile(p, camX, camY) {
    const sx = p.x * TILE_SIZE * SCALE - camX;
    const sy = p.y * TILE_SIZE * SCALE - camY;
    const time = pixelTime || Date.now() / 1000;

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

    // Inner glow
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(sx - p.size * SCALE * 0.2, sy - p.size * SCALE * 0.2, p.size * SCALE * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
}

// ============= UTILITY: GET ZOMBIE VARIANT =============
function getRandomZombieVariant(dayCount, isNight) {
    const rand = Math.random();
    const difficultyBonus = Math.min(dayCount * 0.02, 0.4);

    // Higher chance of special variants at night and later days
    const specialChance = (isNight ? 0.4 : 0.2) + difficultyBonus;

    if (rand > specialChance) return 'normal';

    const variants = ['runner', 'brute', 'spitter', 'crawler', 'screamer', 'armored'];
    const weights = [0.25, 0.2, 0.15, 0.15, 0.1, 0.15];

    let cumulative = 0;
    const roll = Math.random();
    for (let i = 0; i < variants.length; i++) {
        cumulative += weights[i];
        if (roll < cumulative) return variants[i];
    }

    return 'normal';
}

// Export zombie variants for spawn system
window.ZOMBIE_VARIANTS = ZOMBIE_VARIANTS;
window.getRandomZombieVariant = getRandomZombieVariant;
