// ============================================
// UPGRADE VISUAL SYSTEM - Tiered Building Appearances
// ============================================
// Production-grade visual progression for upgraded buildings
// Shows material quality, decorations, and effects per tier

const UpgradeVisuals = (function() {
    'use strict';

    // ============= TIER PALETTES =============
    const TIER_PALETTES = {
        1: { // Basic - Wood/Simple
            primary: '#6a5a4a',
            secondary: '#5a4a3a',
            accent: '#8a7a6a',
            trim: '#4a3a2a',
            glow: null,
            particle: null
        },
        2: { // Reinforced - Stone additions
            primary: '#7a6a5a',
            secondary: '#6a6a6a',
            accent: '#9a8a7a',
            trim: '#5a5a5a',
            glow: null,
            particle: '#aaaaaa'
        },
        3: { // Advanced - Iron/Steel
            primary: '#8a7a6a',
            secondary: '#707080',
            accent: '#aaaaaa',
            trim: '#505060',
            glow: 'rgba(150, 150, 180, 0.2)',
            particle: '#ccccff'
        },
        4: { // Fortified - Enhanced metals
            primary: '#9a8a7a',
            secondary: '#8a8a9a',
            accent: '#ccbb99',
            trim: '#606070',
            glow: 'rgba(200, 180, 100, 0.25)',
            particle: '#ffdd88'
        },
        5: { // Legendary - Magical/Mystical
            primary: '#aa9a8a',
            secondary: '#9a9aaa',
            accent: '#ffeecc',
            trim: '#707080',
            glow: 'rgba(255, 220, 100, 0.35)',
            particle: '#ffff88'
        }
    };

    // ============= TIER DECORATIONS =============
    const TIER_DECORATIONS = {
        1: [], // No decorations
        2: ['reinforced_corners'],
        3: ['metal_bands', 'reinforced_corners'],
        4: ['ornate_trim', 'metal_bands', 'banners'],
        5: ['ornate_trim', 'glowing_runes', 'aura', 'particles']
    };

    // ============= MATERIAL TEXTURES =============
    function drawWoodTexture(ctx, x, y, w, h, tier) {
        const palette = TIER_PALETTES[tier];

        // Base wood color
        ctx.fillStyle = palette.primary;
        ctx.fillRect(x, y, w, h);

        // Wood grain lines
        ctx.fillStyle = palette.secondary;
        const grainCount = Math.floor(h / 8);
        for (let i = 0; i < grainCount; i++) {
            const grainY = y + (i + 0.5) * (h / grainCount);
            ctx.fillRect(x + 2, grainY, w - 4, 1);
        }

        // Highlights for higher tiers
        if (tier >= 3) {
            ctx.fillStyle = palette.accent;
            ctx.fillRect(x, y, w, 2);
        }

        // Polished shine for tier 4+
        if (tier >= 4) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(x + 2, y + 2, w * 0.3, h * 0.2);
        }
    }

    function drawStoneTexture(ctx, x, y, w, h, tier) {
        const palette = TIER_PALETTES[tier];

        // Base stone
        ctx.fillStyle = palette.secondary;
        ctx.fillRect(x, y, w, h);

        // Stone brick pattern
        const brickH = Math.max(8, h / 4);
        const brickW = Math.max(12, w / 3);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        for (let row = 0; row < Math.ceil(h / brickH); row++) {
            const offset = (row % 2) * brickW * 0.5;
            for (let col = 0; col < Math.ceil(w / brickW) + 1; col++) {
                const bx = x + col * brickW - offset;
                const by = y + row * brickH;

                // Mortar lines
                ctx.fillRect(bx, by, 2, brickH);
                ctx.fillRect(bx, by + brickH - 2, brickW, 2);
            }
        }

        // Stone highlights for higher tiers
        if (tier >= 3) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            for (let row = 0; row < Math.ceil(h / brickH); row++) {
                const offset = (row % 2) * brickW * 0.5;
                for (let col = 0; col < Math.ceil(w / brickW); col++) {
                    const bx = x + col * brickW - offset + 2;
                    const by = y + row * brickH + 2;
                    ctx.fillRect(bx, by, brickW * 0.4, 2);
                }
            }
        }

        // Polished stone for tier 4+
        if (tier >= 4) {
            const gradient = ctx.createLinearGradient(x, y, x + w, y);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, w, h);
        }
    }

    function drawMetalTexture(ctx, x, y, w, h, tier) {
        const palette = TIER_PALETTES[tier];

        // Metal gradient
        const gradient = ctx.createLinearGradient(x, y, x + w, y);
        gradient.addColorStop(0, palette.secondary);
        gradient.addColorStop(0.3, palette.accent);
        gradient.addColorStop(0.7, palette.accent);
        gradient.addColorStop(1, palette.secondary);
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, w, h);

        // Metal rivets
        if (tier >= 3) {
            ctx.fillStyle = '#555555';
            const rivetSpacing = Math.max(10, w / 4);
            for (let i = 0; i < Math.ceil(w / rivetSpacing); i++) {
                const rx = x + i * rivetSpacing + rivetSpacing * 0.5;
                ctx.beginPath();
                ctx.arc(rx, y + h / 2, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Shine streak
        if (tier >= 4) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(x + w * 0.1, y + 1, w * 0.2, 2);
        }
    }

    // ============= DECORATION RENDERERS =============
    function drawReinforcedCorners(ctx, x, y, w, h, tier) {
        const palette = TIER_PALETTES[tier];
        const cornerSize = Math.min(w, h) * 0.15;

        // Corner plates
        ctx.fillStyle = tier >= 3 ? palette.accent : '#555555';

        // Top-left
        ctx.fillRect(x, y, cornerSize, cornerSize);
        ctx.fillRect(x, y, cornerSize + 4, 3);
        ctx.fillRect(x, y, 3, cornerSize + 4);

        // Top-right
        ctx.fillRect(x + w - cornerSize, y, cornerSize, cornerSize);
        ctx.fillRect(x + w - cornerSize - 4, y, cornerSize + 4, 3);
        ctx.fillRect(x + w - 3, y, 3, cornerSize + 4);

        // Bottom-left
        ctx.fillRect(x, y + h - cornerSize, cornerSize, cornerSize);
        ctx.fillRect(x, y + h - 3, cornerSize + 4, 3);
        ctx.fillRect(x, y + h - cornerSize - 4, 3, cornerSize + 4);

        // Bottom-right
        ctx.fillRect(x + w - cornerSize, y + h - cornerSize, cornerSize, cornerSize);
        ctx.fillRect(x + w - cornerSize - 4, y + h - 3, cornerSize + 4, 3);
        ctx.fillRect(x + w - 3, y + h - cornerSize - 4, 3, cornerSize + 4);

        // Rivets on corners
        if (tier >= 4) {
            ctx.fillStyle = '#777777';
            const rivetOffset = cornerSize * 0.5;
            ctx.beginPath();
            ctx.arc(x + rivetOffset, y + rivetOffset, 2, 0, Math.PI * 2);
            ctx.arc(x + w - rivetOffset, y + rivetOffset, 2, 0, Math.PI * 2);
            ctx.arc(x + rivetOffset, y + h - rivetOffset, 2, 0, Math.PI * 2);
            ctx.arc(x + w - rivetOffset, y + h - rivetOffset, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawMetalBands(ctx, x, y, w, h, tier) {
        const palette = TIER_PALETTES[tier];
        const bandHeight = 4;
        const bandCount = tier >= 4 ? 3 : 2;

        ctx.fillStyle = tier >= 4 ? palette.accent : '#555555';

        for (let i = 0; i < bandCount; i++) {
            const bandY = y + ((i + 1) / (bandCount + 1)) * h - bandHeight / 2;

            // Band shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(x + 2, bandY + 2, w - 4, bandHeight);

            // Band body
            ctx.fillStyle = tier >= 4 ? palette.accent : '#666666';
            ctx.fillRect(x, bandY, w, bandHeight);

            // Band highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fillRect(x + 2, bandY, w - 4, 1);
        }
    }

    function drawOrnateTrim(ctx, x, y, w, h, tier) {
        const palette = TIER_PALETTES[tier];
        const trimWidth = 6;

        // Gold/ornate trim
        ctx.fillStyle = tier === 5 ? '#ddaa44' : '#aa8833';

        // Top trim with pattern
        ctx.fillRect(x, y, w, trimWidth);

        // Pattern on trim
        ctx.fillStyle = tier === 5 ? '#ffcc66' : '#ccaa44';
        for (let i = 0; i < Math.floor(w / 8); i++) {
            const px = x + i * 8 + 2;
            ctx.fillRect(px, y + 2, 4, 2);
        }

        // Bottom trim
        ctx.fillStyle = tier === 5 ? '#ddaa44' : '#aa8833';
        ctx.fillRect(x, y + h - trimWidth, w, trimWidth);

        // Side trims
        ctx.fillRect(x, y, trimWidth, h);
        ctx.fillRect(x + w - trimWidth, y, trimWidth, h);

        // Corner ornaments for tier 5
        if (tier === 5) {
            ctx.fillStyle = '#ffdd66';
            const ornamentSize = 8;

            // Diamond pattern at corners
            const corners = [
                [x + trimWidth / 2, y + trimWidth / 2],
                [x + w - trimWidth / 2, y + trimWidth / 2],
                [x + trimWidth / 2, y + h - trimWidth / 2],
                [x + w - trimWidth / 2, y + h - trimWidth / 2]
            ];

            corners.forEach(([cx, cy]) => {
                ctx.beginPath();
                ctx.moveTo(cx, cy - ornamentSize / 2);
                ctx.lineTo(cx + ornamentSize / 2, cy);
                ctx.lineTo(cx, cy + ornamentSize / 2);
                ctx.lineTo(cx - ornamentSize / 2, cy);
                ctx.closePath();
                ctx.fill();
            });
        }
    }

    function drawGlowingRunes(ctx, x, y, w, h, tier, time) {
        if (tier < 5) return;

        const runeGlow = Math.sin(time * 3) * 0.3 + 0.7;
        const runeColor = `rgba(255, 220, 100, ${runeGlow * 0.8})`;

        ctx.fillStyle = runeColor;
        ctx.shadowColor = '#ffdd66';
        ctx.shadowBlur = 8;

        // Rune positions
        const runeSpacing = w / 4;
        for (let i = 0; i < 3; i++) {
            const rx = x + runeSpacing * (i + 0.5);
            const ry = y + h * 0.5;

            // Simple rune shapes
            ctx.beginPath();
            switch (i % 3) {
                case 0: // Vertical line with branches
                    ctx.fillRect(rx - 1, ry - 6, 2, 12);
                    ctx.fillRect(rx - 4, ry - 3, 4, 2);
                    ctx.fillRect(rx, ry + 1, 4, 2);
                    break;
                case 1: // Diamond
                    ctx.moveTo(rx, ry - 5);
                    ctx.lineTo(rx + 4, ry);
                    ctx.lineTo(rx, ry + 5);
                    ctx.lineTo(rx - 4, ry);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 2: // Cross
                    ctx.fillRect(rx - 1, ry - 5, 2, 10);
                    ctx.fillRect(rx - 4, ry - 1, 8, 2);
                    break;
            }
        }

        ctx.shadowBlur = 0;
    }

    function drawBanners(ctx, x, y, w, h, tier, time) {
        if (tier < 4) return;

        const bannerColor = tier === 5 ? '#cc3333' : '#aa4444';
        const trimColor = tier === 5 ? '#ffdd44' : '#ddaa33';

        // Banner on front
        const bannerWidth = w * 0.3;
        const bannerHeight = h * 0.4;
        const bannerX = x + (w - bannerWidth) / 2;
        const bannerY = y + h * 0.1;

        // Wave animation
        const wave = Math.sin(time * 2) * 2;

        // Banner shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(bannerX + 2, bannerY + 2, bannerWidth, bannerHeight + wave);

        // Banner pole
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(bannerX - 2, bannerY - 4, bannerWidth + 4, 4);

        // Banner fabric
        ctx.fillStyle = bannerColor;
        ctx.fillRect(bannerX, bannerY, bannerWidth, bannerHeight + wave);

        // Banner trim
        ctx.fillStyle = trimColor;
        ctx.fillRect(bannerX, bannerY + bannerHeight + wave - 4, bannerWidth, 4);

        // Emblem
        ctx.fillStyle = trimColor;
        const emblemSize = bannerWidth * 0.4;
        const emblemX = bannerX + (bannerWidth - emblemSize) / 2;
        const emblemY = bannerY + bannerHeight * 0.3;

        // Simple shield emblem
        ctx.beginPath();
        ctx.moveTo(emblemX + emblemSize / 2, emblemY);
        ctx.lineTo(emblemX + emblemSize, emblemY + emblemSize * 0.3);
        ctx.lineTo(emblemX + emblemSize, emblemY + emblemSize * 0.7);
        ctx.lineTo(emblemX + emblemSize / 2, emblemY + emblemSize);
        ctx.lineTo(emblemX, emblemY + emblemSize * 0.7);
        ctx.lineTo(emblemX, emblemY + emblemSize * 0.3);
        ctx.closePath();
        ctx.fill();
    }

    function drawAura(ctx, x, y, w, h, tier, time) {
        if (tier < 5) return;

        const auraPulse = Math.sin(time * 2) * 0.15 + 0.85;
        const auraRadius = Math.max(w, h) * 0.7 * auraPulse;

        const gradient = ctx.createRadialGradient(
            x + w / 2, y + h / 2, 0,
            x + w / 2, y + h / 2, auraRadius
        );
        gradient.addColorStop(0, 'rgba(255, 220, 100, 0.25)');
        gradient.addColorStop(0.5, 'rgba(255, 180, 50, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 150, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x - auraRadius + w / 2, y - auraRadius + h / 2, auraRadius * 2, auraRadius * 2);
    }

    function drawParticleEffects(ctx, x, y, w, h, tier, time) {
        if (tier < 5) return;

        const particleColor = TIER_PALETTES[tier].particle;
        if (!particleColor) return;

        // Floating particles
        for (let i = 0; i < 6; i++) {
            const particlePhase = (time + i * 0.8) % 3;
            const px = x + w * (0.2 + (i % 3) * 0.3) + Math.sin(time * 2 + i) * 4;
            const py = y + h * 0.8 - particlePhase * h * 0.3;
            const particleSize = 2 + Math.sin(time * 4 + i * 2);

            ctx.fillStyle = particleColor;
            ctx.globalAlpha = 1 - particlePhase / 3;
            ctx.beginPath();
            ctx.arc(px, py, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    // ============= TIER BADGE =============
    function drawTierBadge(ctx, x, y, tier) {
        if (tier <= 1) return;

        const badgeSize = 14;
        const badgeX = x - badgeSize * 0.3;
        const badgeY = y - badgeSize * 0.3;

        // Badge colors by tier
        const badgeColors = {
            2: { bg: '#666666', border: '#888888', star: '#aaaaaa' },
            3: { bg: '#6080a0', border: '#80a0c0', star: '#aaccff' },
            4: { bg: '#806020', border: '#a08040', star: '#ffcc44' },
            5: { bg: '#8040a0', border: '#a060c0', star: '#ffdd88' }
        };

        const colors = badgeColors[tier];

        // Badge shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(badgeX + badgeSize / 2 + 1, badgeY + badgeSize / 2 + 1, badgeSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Badge border
        ctx.fillStyle = colors.border;
        ctx.beginPath();
        ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Badge background
        ctx.fillStyle = colors.bg;
        ctx.beginPath();
        ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2 - 2, 0, Math.PI * 2);
        ctx.fill();

        // Star or number
        ctx.fillStyle = colors.star;
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (tier === 5) {
            // Draw star for max tier
            const cx = badgeX + badgeSize / 2;
            const cy = badgeY + badgeSize / 2;
            const spikes = 5;
            const outerRadius = 4;
            const innerRadius = 2;

            ctx.beginPath();
            for (let i = 0; i < spikes * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI / spikes) - Math.PI / 2;
                const px = cx + Math.cos(angle) * radius;
                const py = cy + Math.sin(angle) * radius;

                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillText(tier.toString(), badgeX + badgeSize / 2, badgeY + badgeSize / 2 + 1);
        }
    }

    // ============= BUILDING-SPECIFIC TIER RENDERERS =============

    function renderTieredWall(ctx, x, y, s, tier, wx, wy, time) {
        const palette = TIER_PALETTES[tier];

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x + 2, y + 2, s, s);

        // Base material changes with tier
        if (tier <= 2) {
            drawWoodTexture(ctx, x, y, s, s, tier);
        } else {
            drawStoneTexture(ctx, x, y, s, s, tier);
        }

        // Apply decorations
        const decorations = TIER_DECORATIONS[tier];
        if (decorations.includes('reinforced_corners')) {
            drawReinforcedCorners(ctx, x, y, s, s, tier);
        }
        if (decorations.includes('metal_bands')) {
            drawMetalBands(ctx, x, y, s, s, tier);
        }
        if (decorations.includes('ornate_trim')) {
            drawOrnateTrim(ctx, x, y, s, s, tier);
        }
        if (decorations.includes('glowing_runes')) {
            drawGlowingRunes(ctx, x, y, s, s, tier, time);
        }
        if (decorations.includes('aura')) {
            drawAura(ctx, x, y, s, s, tier, time);
        }
        if (decorations.includes('particles')) {
            drawParticleEffects(ctx, x, y, s, s, tier, time);
        }

        // Tier badge
        drawTierBadge(ctx, x + s - 4, y + 4, tier);
    }

    function renderTieredTower(ctx, x, y, s, tier, time) {
        const palette = TIER_PALETTES[tier];

        // Aura for high tiers
        if (tier >= 4) {
            drawAura(ctx, x, y, s, s, tier, time);
        }

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(x + s / 2, y + s + 2, s * 0.45, s * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tower body with tier materials
        ctx.fillStyle = PALETTE.outline;
        ctx.fillRect(x + s * 0.1, y + s * 0.02, s * 0.8, s);

        if (tier <= 2) {
            drawWoodTexture(ctx, x + s * 0.13, y + s * 0.05, s * 0.74, s * 0.95, tier);
        } else {
            drawStoneTexture(ctx, x + s * 0.13, y + s * 0.05, s * 0.74, s * 0.95, tier);
        }

        // Battlements
        const battleWidth = s * 0.2;
        const battlePositions = [
            { bx: x + s * 0.06, by: y - s * 0.02 },
            { bx: x + s * 0.4, by: y - s * 0.05 },
            { bx: x + s * 0.74, by: y - s * 0.02 }
        ];

        battlePositions.forEach(({ bx, by }) => {
            ctx.fillStyle = PALETTE.outline;
            ctx.fillRect(bx - 2, by - 2, battleWidth + 4, s * 0.17);
            ctx.fillStyle = palette.secondary;
            ctx.fillRect(bx, by, battleWidth, s * 0.13);
            ctx.fillStyle = palette.accent;
            ctx.fillRect(bx, by, battleWidth, 2);
        });

        // Arrow slits with tier glow
        ctx.fillStyle = tier >= 4 ? palette.glow || '#3a3a4a' : '#3a3a4a';
        ctx.fillRect(x + s * 0.3, y + s * 0.35, s * 0.1, s * 0.2);
        ctx.fillRect(x + s * 0.6, y + s * 0.55, s * 0.1, s * 0.2);

        // Inner darkness
        ctx.fillStyle = '#1a1a2a';
        ctx.fillRect(x + s * 0.32, y + s * 0.37, s * 0.06, s * 0.16);
        ctx.fillRect(x + s * 0.62, y + s * 0.57, s * 0.06, s * 0.16);

        // Flag
        const flagWave = Math.sin(time * 4) * 2;
        const flagColor = tier >= 4 ? '#aa2222' : '#cc3333';

        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(x + s * 0.49, y - s * 0.35, 3, s * 0.35);

        ctx.fillStyle = flagColor;
        ctx.beginPath();
        ctx.moveTo(x + s * 0.52, y - s * 0.33);
        ctx.quadraticCurveTo(x + s * 0.65 + flagWave, y - s * 0.28, x + s * 0.72, y - s * 0.25);
        ctx.lineTo(x + s * 0.72, y - s * 0.15);
        ctx.quadraticCurveTo(x + s * 0.65 + flagWave * 0.5, y - s * 0.18, x + s * 0.52, y - s * 0.2);
        ctx.closePath();
        ctx.fill();

        // Tier 5 special: lightning effect on spire
        if (tier === 5 && Math.sin(time * 10) > 0.8) {
            ctx.strokeStyle = '#aaddff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + s * 0.5, y - s * 0.1);
            ctx.lineTo(x + s * 0.55, y + s * 0.1);
            ctx.lineTo(x + s * 0.45, y + s * 0.2);
            ctx.lineTo(x + s * 0.52, y + s * 0.35);
            ctx.stroke();
        }

        // Decorations
        if (tier >= 4) {
            drawBanners(ctx, x + s * 0.1, y + s * 0.4, s * 0.3, s * 0.35, tier, time);
        }

        // Particles
        if (tier >= 5) {
            drawParticleEffects(ctx, x, y - s * 0.2, s, s * 0.5, tier, time);
        }

        // Tier badge
        drawTierBadge(ctx, x + s - 4, y + s * 0.1, tier);
    }

    function renderTieredCampfire(ctx, x, y, s, tier, time) {
        const palette = TIER_PALETTES[tier];

        // Enhanced glow for higher tiers
        const glowIntensity = 0.3 + tier * 0.1;
        const glowRadius = s * (0.6 + tier * 0.1);
        const pulseGlow = Math.sin(time * 4) * 0.15 + 0.85;

        const groundGlow = ctx.createRadialGradient(
            x + s / 2, y + s / 2, 0,
            x + s / 2, y + s / 2, glowRadius * pulseGlow
        );

        const glowColor = tier >= 4 ? '200, 150, 50' : '255, 100, 20';
        groundGlow.addColorStop(0, `rgba(${glowColor}, ${glowIntensity})`);
        groundGlow.addColorStop(0.5, `rgba(${glowColor}, ${glowIntensity * 0.4})`);
        groundGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = groundGlow;
        ctx.fillRect(x - s * 0.3, y - s * 0.3, s * 1.6, s * 1.6);

        // Stone ring gets nicer with tier
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + 0.15;
            const dist = s * 0.38;
            const stoneX = x + s / 2 + Math.cos(angle) * dist;
            const stoneY = y + s / 2 + Math.sin(angle) * dist * 0.7;
            const stoneW = 7 + seededRandom(i, 1) * 3;
            const stoneH = 5 + seededRandom(i, 2) * 2;

            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(stoneX - stoneW / 2 + 1, stoneY - stoneH / 2 + 1, stoneW, stoneH);

            const stoneColor = tier >= 3 ? palette.secondary :
                `rgb(${Math.floor(70 * (0.5 + seededRandom(i, 3) * 0.3))}, ${Math.floor(65 * (0.5 + seededRandom(i, 3) * 0.3))}, ${Math.floor(60 * (0.5 + seededRandom(i, 3) * 0.3))})`;
            ctx.fillStyle = stoneColor;
            ctx.fillRect(stoneX - stoneW / 2, stoneY - stoneH / 2, stoneW, stoneH);

            // Ornate stones for tier 4+
            if (tier >= 4) {
                ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
                ctx.fillRect(stoneX - stoneW / 2 + 1, stoneY - stoneH / 2, stoneW - 2, 2);
            }
        }

        // Ash bed
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.ellipse(x + s / 2, y + s / 2 + s * 0.05, s * 0.25, s * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Logs
        const logColor1 = tier >= 3 ? '#4a3525' : '#3d2817';
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(x + s * 0.22 + 1, y + s * 0.52 + 1, s * 0.56, s * 0.12);
        ctx.fillStyle = logColor1;
        ctx.fillRect(x + s * 0.22, y + s * 0.5, s * 0.56, s * 0.12);

        // Flames - size and color based on tier
        const flameHeight = s * (0.35 + tier * 0.05);
        const f1 = Math.sin(time * 12) * 2.5;
        const f2 = Math.cos(time * 15 + 1) * 2;

        // Flame colors by tier
        const flameColors = tier >= 4
            ? ['#cc6600', '#ff8800', '#ffaa00', '#ffcc44', '#ffffaa']
            : ['#cc2200', '#ff4400', '#ff7700', '#ffaa00', '#ffdd44'];

        flameColors.forEach((color, i) => {
            ctx.fillStyle = color;
            const fw = s * (0.2 - i * 0.03);
            const fh = flameHeight * (1 - i * 0.15);
            const fy = y + s * (0.6 - i * 0.02);
            drawFlameShape(ctx, x + s / 2, fy, fw, fh, f1 * (1 - i * 0.1), f2 * (1 - i * 0.1));
        });

        // Tier 5: Eternal flame sparkles
        if (tier === 5) {
            for (let i = 0; i < 8; i++) {
                const sparkPhase = (time * 4 + i * 0.5) % 2;
                const sparkX = x + s * 0.5 + Math.sin(time * 3 + i * 2) * s * 0.2;
                const sparkY = y + s * 0.3 - sparkPhase * s * 0.2;

                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = 1 - sparkPhase * 0.5;
                ctx.fillRect(sparkX - 1, sparkY - 1, 2, 2);
            }
            ctx.globalAlpha = 1;
        }

        // Tier badge
        drawTierBadge(ctx, x + s - 4, y + 4, tier);
    }

    function drawFlameShape(ctx, cx, bottomY, width, height, offset1, offset2) {
        ctx.beginPath();
        ctx.moveTo(cx - width, bottomY);
        ctx.quadraticCurveTo(
            cx - width * 0.8 + offset1 * 0.5, bottomY - height * 0.3,
            cx - width * 0.3 + offset1, bottomY - height * 0.6
        );
        ctx.quadraticCurveTo(
            cx + offset1 * 0.5, bottomY - height * 1.1,
            cx, bottomY - height
        );
        ctx.quadraticCurveTo(
            cx - offset2 * 0.5, bottomY - height * 1.1,
            cx + width * 0.3 + offset2, bottomY - height * 0.6
        );
        ctx.quadraticCurveTo(
            cx + width * 0.8 + offset1 * 0.5, bottomY - height * 0.3,
            cx + width, bottomY
        );
        ctx.closePath();
        ctx.fill();
    }

    // ============= HEALTH BAR WITH TIER STYLING =============
    function drawTieredHealthBar(ctx, x, y, width, health, maxHealth, tier) {
        const healthPercent = health / maxHealth;
        const barHeight = 4;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, width, barHeight);

        // Health color based on percentage and tier
        let healthColor;
        if (healthPercent > 0.6) {
            healthColor = tier >= 4 ? '#44dd44' : '#22aa22';
        } else if (healthPercent > 0.3) {
            healthColor = tier >= 4 ? '#dddd44' : '#aaaa22';
        } else {
            healthColor = tier >= 4 ? '#dd4444' : '#aa2222';
        }

        // Health fill
        ctx.fillStyle = healthColor;
        ctx.fillRect(x + 1, y + 1, (width - 2) * healthPercent, barHeight - 2);

        // Shine for high tiers
        if (tier >= 3) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(x + 1, y + 1, (width - 2) * healthPercent, 1);
        }

        // Border color by tier
        const borderColor = TIER_PALETTES[tier].trim;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, barHeight);
    }

    // ============= UPGRADE PROGRESS INDICATOR =============
    function drawUpgradeProgress(ctx, x, y, width, height, progress, tier) {
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(x, y, width, height);

        // Progress fill
        const progressColor = TIER_PALETTES[Math.min(tier + 1, 5)].accent;
        ctx.fillStyle = progressColor;
        ctx.fillRect(x + 2, y + 2, (width - 4) * progress, height - 4);

        // Animated shine
        const time = Date.now() / 1000;
        const shineX = x + 2 + ((time * 50) % (width - 4));
        if (shineX < x + 2 + (width - 4) * progress) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(shineX, y + 2, 4, height - 4);
        }

        // Border
        ctx.strokeStyle = progressColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Hammer icon
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('', x + width / 2, y + height / 2 + 3);
    }

    // ============= MAIN RENDER FUNCTION =============
    function renderBuildingWithTier(ctx, buildingType, x, y, s, tier, wx, wy, time) {
        time = time || Date.now() / 1000;
        tier = Math.max(1, Math.min(5, tier || 1));

        switch (buildingType) {
            case 'wall':
            case TILES?.WALL:
                renderTieredWall(ctx, x, y, s, tier, wx, wy, time);
                break;
            case 'tower':
            case TILES?.TOWER:
                renderTieredTower(ctx, x, y, s, tier, time);
                break;
            case 'campfire':
            case TILES?.CAMPFIRE:
                renderTieredCampfire(ctx, x, y, s, tier, time);
                break;
            default:
                // Fallback - draw tier badge on existing sprite
                drawTierBadge(ctx, x + s - 4, y + 4, tier);
                break;
        }
    }

    // ============= HELPER FUNCTION =============
    function seededRandom(x, y) {
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        return n - Math.floor(n);
    }

    // ============= PUBLIC API =============
    return {
        TIER_PALETTES,
        TIER_DECORATIONS,

        // Textures
        drawWoodTexture,
        drawStoneTexture,
        drawMetalTexture,

        // Decorations
        drawReinforcedCorners,
        drawMetalBands,
        drawOrnateTrim,
        drawGlowingRunes,
        drawBanners,
        drawAura,
        drawParticleEffects,

        // Building renderers
        renderTieredWall,
        renderTieredTower,
        renderTieredCampfire,
        renderBuildingWithTier,

        // UI elements
        drawTierBadge,
        drawTieredHealthBar,
        drawUpgradeProgress,

        // Utility
        seededRandom
    };
})();

window.UpgradeVisuals = UpgradeVisuals;
