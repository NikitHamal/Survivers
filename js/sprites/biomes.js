// ============================================
// BIOME SPRITES - Terrain and Environment Rendering
// ============================================
// Production-grade biome-specific sprite rendering for
// diverse terrain types, environmental objects, and visual effects

const BiomeSprites = (function() {
    'use strict';

    // ============= BIOME COLOR PALETTES =============
    const PALETTES = {
        jungle: {
            grass: ['#2d5a27', '#3d6a37', '#4d7a47'],
            dirt: ['#5a4020', '#4a3015'],
            water: '#2a5a4a',
            trunk: '#5d4037',
            leaves: ['#1b5e20', '#2e7d32', '#4caf50']
        },
        desert: {
            sand: ['#c4a35a', '#d4b36a', '#e4c37a'],
            rock: ['#a4833a', '#94732a'],
            water: '#4a9a7a',
            trunk: '#8d6e63',
            leaves: ['#6b8e23', '#7a9a33']
        },
        swamp: {
            mud: ['#3a4a2a', '#4a5a3a', '#2a3a1a'],
            water: '#2a4a2a',
            trunk: '#3e2723',
            leaves: ['#4a5a3a', '#3a4a2a'],
            mushroom: ['#8b4513', '#a0522d', '#cd853f']
        },
        snow: {
            snow: ['#d8e8f8', '#e8f8ff', '#f0f8ff'],
            ice: ['#a0d8ef', '#b0e8ff'],
            rock: ['#7888a8', '#8898b8'],
            trunk: '#5d4037',
            leaves: ['#2e5a4a', '#3e6a5a']
        },
        volcanic: {
            rock: ['#3a2a2a', '#4a3a3a', '#2a1a1a'],
            lava: ['#ff4400', '#ff6600', '#ff8800'],
            ash: ['#4a4a4a', '#5a5a5a'],
            obsidian: ['#1a1a2a', '#2a2a3a']
        },
        ruins: {
            stone: ['#6a6a6a', '#7a7a7a', '#5a5a5a'],
            moss: ['#4a6a4a', '#3a5a3a'],
            dirt: ['#5a5a4a', '#4a4a3a']
        }
    };

    // ============= GROUND RENDERERS =============
    function renderSand(ctx, x, y, s, wx, wy) {
        const palette = PALETTES.desert;
        const variation = seededRandom(wx, wy);
        const colorIndex = Math.floor(variation * palette.sand.length);

        // Base sand
        ctx.fillStyle = palette.sand[colorIndex];
        ctx.fillRect(x, y, s, s);

        // Sand texture - small dots and dunes
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        const dotCount = 4 + Math.floor(variation * 4);
        for (let i = 0; i < dotCount; i++) {
            const dx = seededRandom(wx + i, wy) * s;
            const dy = seededRandom(wx, wy + i) * s;
            ctx.fillRect(x + dx, y + dy, 1, 1);
        }

        // Occasional wind ripples
        if (variation > 0.7) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            const rippleY = y + s * 0.3 + variation * s * 0.4;
            ctx.fillRect(x + 2, rippleY, s - 4, 1);
            ctx.fillRect(x + 4, rippleY + 3, s - 8, 1);
        }
    }

    function renderMud(ctx, x, y, s, wx, wy) {
        const palette = PALETTES.swamp;
        const variation = seededRandom(wx, wy);
        const colorIndex = Math.floor(variation * palette.mud.length);

        // Base mud
        ctx.fillStyle = palette.mud[colorIndex];
        ctx.fillRect(x, y, s, s);

        // Mud texture - wet patches
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        if (variation > 0.5) {
            ctx.beginPath();
            ctx.ellipse(
                x + s * 0.3 + variation * s * 0.4,
                y + s * 0.4 + variation * s * 0.2,
                s * 0.2,
                s * 0.15,
                0, 0, Math.PI * 2
            );
            ctx.fill();
        }

        // Small puddles
        if (variation > 0.8) {
            ctx.fillStyle = palette.water;
            ctx.beginPath();
            ctx.ellipse(x + s * 0.6, y + s * 0.7, s * 0.15, s * 0.1, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function renderSnowGround(ctx, x, y, s, wx, wy) {
        const palette = PALETTES.snow;
        const variation = seededRandom(wx, wy);
        const colorIndex = Math.floor(variation * palette.snow.length);

        // Base snow
        ctx.fillStyle = palette.snow[colorIndex];
        ctx.fillRect(x, y, s, s);

        // Snow sparkles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        if (variation > 0.6) {
            const sparkleCount = 2 + Math.floor(variation * 3);
            for (let i = 0; i < sparkleCount; i++) {
                const sx = x + seededRandom(wx + i * 10, wy) * s;
                const sy = y + seededRandom(wx, wy + i * 10) * s;
                ctx.fillRect(sx, sy, 1, 1);
            }
        }

        // Subtle shadows for depth
        ctx.fillStyle = 'rgba(150, 180, 200, 0.1)';
        if (variation > 0.4) {
            ctx.fillRect(x + s * 0.2, y + s * 0.6, s * 0.3, s * 0.2);
        }
    }

    function renderVolcanicRock(ctx, x, y, s, wx, wy) {
        const palette = PALETTES.volcanic;
        const variation = seededRandom(wx, wy);
        const colorIndex = Math.floor(variation * palette.rock.length);

        // Base volcanic rock
        ctx.fillStyle = palette.rock[colorIndex];
        ctx.fillRect(x, y, s, s);

        // Cracks with lava glow
        if (variation > 0.6) {
            ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
            ctx.fillRect(x + s * variation * 0.8, y + 2, 2, s - 4);
        }

        // Ash patches
        ctx.fillStyle = palette.ash[0];
        if (variation > 0.5) {
            ctx.fillRect(x + s * 0.1, y + s * 0.7, s * 0.3, s * 0.2);
        }
    }

    function renderCobblestone(ctx, x, y, s, wx, wy) {
        const palette = PALETTES.ruins;
        const variation = seededRandom(wx, wy);

        // Base stone
        ctx.fillStyle = palette.stone[0];
        ctx.fillRect(x, y, s, s);

        // Stone brick pattern
        const brickH = s / 3;
        const brickW = s / 2;
        const offset = (Math.floor(wy) % 2) * brickW * 0.5;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';

        // Horizontal mortar lines
        for (let i = 1; i < 3; i++) {
            ctx.fillRect(x, y + brickH * i - 1, s, 2);
        }

        // Vertical mortar lines (staggered)
        ctx.fillRect(x + brickW - offset - 1, y, 2, brickH);
        ctx.fillRect(x + brickW - offset + brickW - 1, y + brickH, 2, brickH);
        ctx.fillRect(x + brickW - offset - 1, y + brickH * 2, 2, brickH);

        // Moss growth
        if (variation > 0.7) {
            ctx.fillStyle = palette.moss[0];
            ctx.fillRect(x + s * 0.1, y + s * 0.8, s * 0.2, s * 0.15);
            ctx.fillRect(x + s * 0.6, y + s * 0.1, s * 0.15, s * 0.1);
        }
    }

    function renderIce(ctx, x, y, s, wx, wy) {
        const palette = PALETTES.snow;
        const variation = seededRandom(wx, wy);

        // Base ice (semi-transparent looking)
        const gradient = ctx.createLinearGradient(x, y, x + s, y + s);
        gradient.addColorStop(0, palette.ice[0]);
        gradient.addColorStop(0.5, palette.ice[1]);
        gradient.addColorStop(1, palette.ice[0]);
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, s, s);

        // Ice cracks
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;

        if (variation > 0.3) {
            ctx.beginPath();
            ctx.moveTo(x + s * 0.2, y + s * 0.3);
            ctx.lineTo(x + s * 0.5, y + s * 0.5);
            ctx.lineTo(x + s * 0.4, y + s * 0.8);
            ctx.stroke();
        }

        if (variation > 0.6) {
            ctx.beginPath();
            ctx.moveTo(x + s * 0.7, y + s * 0.2);
            ctx.lineTo(x + s * 0.6, y + s * 0.6);
            ctx.stroke();
        }

        // Shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x + s * 0.1, y + s * 0.1, s * 0.15, s * 0.1);
    }

    // ============= WATER RENDERERS =============
    function renderMurkyWater(ctx, x, y, s, wx, wy, time) {
        time = time || Date.now() / 1000;

        // Dark murky base
        ctx.fillStyle = '#2a3a2a';
        ctx.fillRect(x, y, s, s);

        // Slow, subtle waves
        const wave1 = Math.sin(time * 0.8 + wx * 0.3) * s * 0.1;
        const wave2 = Math.cos(time * 0.6 + wy * 0.3) * s * 0.1;

        ctx.fillStyle = 'rgba(60, 80, 60, 0.4)';
        ctx.fillRect(x, y + s * 0.3 + wave1, s, s * 0.15);
        ctx.fillRect(x, y + s * 0.6 + wave2, s, s * 0.1);

        // Bubbles
        if (seededRandom(wx, wy) > 0.7) {
            const bubblePhase = (time + wx + wy) % 3;
            if (bubblePhase < 1) {
                ctx.fillStyle = 'rgba(100, 120, 100, 0.5)';
                ctx.beginPath();
                ctx.arc(x + s * 0.5, y + s * (0.8 - bubblePhase * 0.3), 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    function renderLava(ctx, x, y, s, wx, wy, time) {
        time = time || Date.now() / 1000;
        const palette = PALETTES.volcanic;

        // Hot lava base
        const lavaGradient = ctx.createRadialGradient(
            x + s / 2, y + s / 2, 0,
            x + s / 2, y + s / 2, s * 0.7
        );
        lavaGradient.addColorStop(0, palette.lava[2]);
        lavaGradient.addColorStop(0.5, palette.lava[1]);
        lavaGradient.addColorStop(1, palette.lava[0]);

        ctx.fillStyle = lavaGradient;
        ctx.fillRect(x, y, s, s);

        // Flowing animation
        const flow1 = Math.sin(time * 2 + wx) * s * 0.1;
        const flow2 = Math.cos(time * 1.5 + wy) * s * 0.1;

        ctx.fillStyle = 'rgba(255, 200, 50, 0.4)';
        ctx.fillRect(x + s * 0.2, y + s * 0.2 + flow1, s * 0.6, s * 0.15);
        ctx.fillRect(x + s * 0.3, y + s * 0.5 + flow2, s * 0.4, s * 0.1);

        // Hot spots (brighter)
        ctx.fillStyle = '#ffdd88';
        const spotX = x + s * (0.3 + Math.sin(time + wx) * 0.2);
        const spotY = y + s * (0.4 + Math.cos(time + wy) * 0.2);
        ctx.beginPath();
        ctx.arc(spotX, spotY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Crust forming at edges
        ctx.fillStyle = 'rgba(50, 30, 20, 0.3)';
        ctx.fillRect(x, y, 2, s);
        ctx.fillRect(x + s - 2, y, 2, s);
        ctx.fillRect(x, y, s, 2);
        ctx.fillRect(x, y + s - 2, s, 2);
    }

    function renderFrozenWater(ctx, x, y, s, wx, wy) {
        // Ice surface
        renderIce(ctx, x, y, s, wx, wy);

        // Frozen water hints beneath
        ctx.fillStyle = 'rgba(80, 120, 160, 0.2)';
        if (seededRandom(wx, wy) > 0.5) {
            ctx.fillRect(x + s * 0.2, y + s * 0.4, s * 0.3, s * 0.3);
        }
    }

    // ============= TREE RENDERERS =============
    function renderPalmTree(ctx, x, y, s, wx, wy, time) {
        time = time || Date.now() / 1000;
        const sway = Math.sin(time * 1.5 + wx) * 3;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(x + s / 2, y + s - 2, s * 0.35, s * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Curved trunk
        ctx.fillStyle = '#8d6e63';
        ctx.beginPath();
        ctx.moveTo(x + s * 0.4, y + s - 4);
        ctx.quadraticCurveTo(
            x + s * 0.5 + sway * 0.3,
            y + s * 0.5,
            x + s * 0.5 + sway,
            y + s * 0.25
        );
        ctx.lineTo(x + s * 0.55 + sway, y + s * 0.25);
        ctx.quadraticCurveTo(
            x + s * 0.55 + sway * 0.3,
            y + s * 0.5,
            x + s * 0.5, y + s - 4
        );
        ctx.fill();

        // Trunk rings
        ctx.fillStyle = '#6d4e43';
        for (let i = 0; i < 4; i++) {
            const ringY = y + s * 0.4 + i * s * 0.12;
            const ringX = x + s * 0.42 + sway * (0.3 + i * 0.15);
            ctx.fillRect(ringX, ringY, s * 0.16, 2);
        }

        // Palm fronds
        const frondCount = 6;
        const centerX = x + s * 0.5 + sway;
        const centerY = y + s * 0.2;

        for (let i = 0; i < frondCount; i++) {
            const angle = (i / frondCount) * Math.PI * 2 + time * 0.3;
            const frondSway = Math.sin(time * 2 + i) * 2;

            ctx.fillStyle = i % 2 === 0 ? '#6b8e23' : '#7a9a33';

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.quadraticCurveTo(
                centerX + Math.cos(angle) * s * 0.3 + frondSway,
                centerY + Math.sin(angle) * s * 0.2,
                centerX + Math.cos(angle) * s * 0.5,
                centerY + Math.sin(angle) * s * 0.4 + 5
            );
            ctx.lineTo(centerX + Math.cos(angle) * s * 0.45, centerY + Math.sin(angle) * s * 0.35 + 5);
            ctx.quadraticCurveTo(
                centerX + Math.cos(angle) * s * 0.25 + frondSway,
                centerY + Math.sin(angle) * s * 0.15,
                centerX, centerY
            );
            ctx.fill();
        }

        // Coconuts
        if (seededRandom(wx, wy) > 0.5) {
            ctx.fillStyle = '#5d4037';
            ctx.beginPath();
            ctx.arc(centerX - 3, centerY + 3, 3, 0, Math.PI * 2);
            ctx.arc(centerX + 2, centerY + 4, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function renderPineTree(ctx, x, y, s, wx, wy, time) {
        time = time || Date.now() / 1000;
        const sway = Math.sin(time * 1.2 + wx) * 1.5;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(x + s / 2, y + s - 2, s * 0.25, s * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();

        // Trunk
        const trunkW = s * 0.15;
        const trunkH = s * 0.3;
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(x + s / 2 - trunkW / 2, y + s - trunkH - 2, trunkW, trunkH);

        // Snow-covered pine layers (triangles)
        const layers = 4;
        const baseWidth = s * 0.7;
        const layerHeight = s * 0.2;

        for (let i = layers - 1; i >= 0; i--) {
            const layerY = y + s * 0.15 + i * layerHeight * 0.6;
            const layerW = baseWidth * (1 - i * 0.2);
            const centerX = x + s / 2 + sway * (1 - i * 0.2);

            // Dark green base
            ctx.fillStyle = '#2e5a4a';
            ctx.beginPath();
            ctx.moveTo(centerX, layerY);
            ctx.lineTo(centerX - layerW / 2, layerY + layerHeight);
            ctx.lineTo(centerX + layerW / 2, layerY + layerHeight);
            ctx.closePath();
            ctx.fill();

            // Snow on top
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.moveTo(centerX, layerY);
            ctx.lineTo(centerX - layerW * 0.3, layerY + layerHeight * 0.4);
            ctx.lineTo(centerX + layerW * 0.3, layerY + layerHeight * 0.4);
            ctx.closePath();
            ctx.fill();
        }
    }

    function renderDeadTree(ctx, x, y, s, wx, wy) {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(x + s / 2, y + s - 2, s * 0.3, s * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Gnarled trunk
        ctx.fillStyle = '#3e2723';
        ctx.beginPath();
        ctx.moveTo(x + s * 0.35, y + s - 4);
        ctx.lineTo(x + s * 0.4, y + s * 0.4);
        ctx.lineTo(x + s * 0.45, y + s * 0.15);
        ctx.lineTo(x + s * 0.55, y + s * 0.15);
        ctx.lineTo(x + s * 0.6, y + s * 0.4);
        ctx.lineTo(x + s * 0.65, y + s - 4);
        ctx.closePath();
        ctx.fill();

        // Bare branches
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 2;

        // Left branch
        ctx.beginPath();
        ctx.moveTo(x + s * 0.42, y + s * 0.35);
        ctx.lineTo(x + s * 0.2, y + s * 0.2);
        ctx.lineTo(x + s * 0.15, y + s * 0.1);
        ctx.stroke();

        // Right branch
        ctx.beginPath();
        ctx.moveTo(x + s * 0.58, y + s * 0.35);
        ctx.lineTo(x + s * 0.8, y + s * 0.25);
        ctx.lineTo(x + s * 0.9, y + s * 0.15);
        ctx.stroke();

        // Small twigs
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + s * 0.25, y + s * 0.25);
        ctx.lineTo(x + s * 0.2, y + s * 0.15);
        ctx.moveTo(x + s * 0.75, y + s * 0.28);
        ctx.lineTo(x + s * 0.85, y + s * 0.2);
        ctx.stroke();
    }

    // ============= VEGETATION RENDERERS =============
    function renderCactus(ctx, x, y, s, wx, wy) {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(x + s / 2, y + s - 2, s * 0.25, s * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main body
        ctx.fillStyle = '#228b22';
        ctx.fillRect(x + s * 0.35, y + s * 0.3, s * 0.3, s * 0.65);

        // Rounded top
        ctx.beginPath();
        ctx.arc(x + s * 0.5, y + s * 0.32, s * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Left arm
        if (seededRandom(wx, wy) > 0.3) {
            ctx.fillRect(x + s * 0.15, y + s * 0.5, s * 0.2, s * 0.1);
            ctx.fillRect(x + s * 0.15, y + s * 0.35, s * 0.1, s * 0.25);
            ctx.beginPath();
            ctx.arc(x + s * 0.2, y + s * 0.37, s * 0.05, 0, Math.PI * 2);
            ctx.fill();
        }

        // Right arm
        if (seededRandom(wx + 1, wy) > 0.3) {
            ctx.fillRect(x + s * 0.65, y + s * 0.45, s * 0.2, s * 0.1);
            ctx.fillRect(x + s * 0.75, y + s * 0.3, s * 0.1, s * 0.25);
            ctx.beginPath();
            ctx.arc(x + s * 0.8, y + s * 0.32, s * 0.05, 0, Math.PI * 2);
            ctx.fill();
        }

        // Highlight
        ctx.fillStyle = '#32cd32';
        ctx.fillRect(x + s * 0.38, y + s * 0.35, s * 0.05, s * 0.5);

        // Spines
        ctx.fillStyle = '#90ee90';
        for (let i = 0; i < 6; i++) {
            const spineY = y + s * 0.35 + i * s * 0.1;
            ctx.fillRect(x + s * 0.33, spineY, 2, 1);
            ctx.fillRect(x + s * 0.63, spineY, 2, 1);
        }

        // Flower on top (rare)
        if (seededRandom(wx * 2, wy * 2) > 0.85) {
            ctx.fillStyle = '#ff69b4';
            ctx.beginPath();
            ctx.arc(x + s * 0.5, y + s * 0.2, s * 0.08, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(x + s * 0.5, y + s * 0.2, s * 0.03, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function renderMushroom(ctx, x, y, s, wx, wy) {
        const palette = PALETTES.swamp;
        const variation = seededRandom(wx, wy);
        const colorIndex = Math.floor(variation * palette.mushroom.length);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(x + s / 2, y + s - 2, s * 0.2, s * 0.06, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stem
        ctx.fillStyle = '#f5f5dc';
        ctx.fillRect(x + s * 0.4, y + s * 0.5, s * 0.2, s * 0.45);

        // Cap
        ctx.fillStyle = palette.mushroom[colorIndex];
        ctx.beginPath();
        ctx.ellipse(x + s / 2, y + s * 0.5, s * 0.35, s * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cap top (lighter)
        ctx.fillStyle = palette.mushroom[(colorIndex + 1) % palette.mushroom.length];
        ctx.beginPath();
        ctx.ellipse(x + s / 2, y + s * 0.45, s * 0.25, s * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Spots
        if (variation > 0.5) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(x + s * 0.4, y + s * 0.45, 3, 0, Math.PI * 2);
            ctx.arc(x + s * 0.6, y + s * 0.5, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Glow effect for swamp mushrooms
        ctx.fillStyle = 'rgba(150, 255, 150, 0.1)';
        ctx.beginPath();
        ctx.arc(x + s / 2, y + s * 0.5, s * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }

    function renderFlowerPatch(ctx, x, y, s, wx, wy, time) {
        time = time || Date.now() / 1000;

        // Base grass
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(x, y, s, s);

        // Flower colors
        const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff9f43', '#ee5a24'];

        // Multiple small flowers
        const flowerCount = 4 + Math.floor(seededRandom(wx, wy) * 4);

        for (let i = 0; i < flowerCount; i++) {
            const fx = x + seededRandom(wx + i, wy) * s * 0.8 + s * 0.1;
            const fy = y + seededRandom(wx, wy + i) * s * 0.8 + s * 0.1;
            const colorIndex = Math.floor(seededRandom(wx + i, wy + i) * colors.length);
            const sway = Math.sin(time * 2 + i) * 1.5;

            // Stem
            ctx.fillStyle = '#2e7d32';
            ctx.fillRect(fx + sway * 0.3, fy + 3, 1, 5);

            // Petals
            ctx.fillStyle = colors[colorIndex];
            ctx.beginPath();
            ctx.arc(fx + sway, fy, 3, 0, Math.PI * 2);
            ctx.fill();

            // Center
            ctx.fillStyle = '#ffeb3b';
            ctx.beginPath();
            ctx.arc(fx + sway, fy, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ============= SPECIAL TILES =============
    function renderObsidian(ctx, x, y, s, wx, wy) {
        const palette = PALETTES.volcanic;

        // Dark obsidian base
        ctx.fillStyle = palette.obsidian[0];
        ctx.fillRect(x, y, s, s);

        // Reflective surfaces
        ctx.fillStyle = 'rgba(100, 100, 150, 0.3)';
        ctx.fillRect(x + s * 0.1, y + s * 0.2, s * 0.25, s * 0.4);
        ctx.fillRect(x + s * 0.5, y + s * 0.4, s * 0.35, s * 0.3);

        // Sharp edges highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.moveTo(x + s * 0.1, y + s * 0.3);
        ctx.lineTo(x + s * 0.3, y + s * 0.1);
        ctx.lineTo(x + s * 0.35, y + s * 0.15);
        ctx.lineTo(x + s * 0.15, y + s * 0.35);
        ctx.fill();
    }

    function renderPillar(ctx, x, y, s, wx, wy) {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(x + s / 2, y + s - 2, s * 0.35, s * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pillar base
        ctx.fillStyle = '#7a7a7a';
        ctx.fillRect(x + s * 0.15, y + s * 0.85, s * 0.7, s * 0.12);

        // Main pillar
        ctx.fillStyle = '#8a8a8a';
        ctx.fillRect(x + s * 0.25, y + s * 0.1, s * 0.5, s * 0.75);

        // Pillar capital (top decoration)
        ctx.fillStyle = '#7a7a7a';
        ctx.fillRect(x + s * 0.15, y + s * 0.05, s * 0.7, s * 0.1);

        // Fluting (vertical grooves)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        for (let i = 0; i < 4; i++) {
            const grooveX = x + s * 0.3 + i * s * 0.12;
            ctx.fillRect(grooveX, y + s * 0.15, 2, s * 0.65);
        }

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x + s * 0.27, y + s * 0.15, s * 0.1, s * 0.7);

        // Crack/damage
        if (seededRandom(wx, wy) > 0.6) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.moveTo(x + s * 0.4, y + s * 0.3);
            ctx.lineTo(x + s * 0.45, y + s * 0.5);
            ctx.lineTo(x + s * 0.4, y + s * 0.55);
            ctx.lineTo(x + s * 0.35, y + s * 0.45);
            ctx.closePath();
            ctx.fill();
        }
    }

    // ============= MAIN RENDER FUNCTION =============
    function renderBiomeTile(ctx, tile, x, y, s, wx, wy, time) {
        time = time || Date.now() / 1000;

        // Check if WorldVariation is available for biome tiles
        const biomeTiles = typeof WorldVariation !== 'undefined' ? WorldVariation.BIOME_TILES : {};

        switch (tile) {
            // Ground tiles
            case biomeTiles.SAND:
            case 20:
                renderSand(ctx, x, y, s, wx, wy);
                break;
            case biomeTiles.MUD:
            case biomeTiles.MARSH:
            case 25:
            case 48:
                renderMud(ctx, x, y, s, wx, wy);
                break;
            case biomeTiles.SNOW:
            case 30:
                renderSnowGround(ctx, x, y, s, wx, wy);
                break;
            case biomeTiles.VOLCANIC_ROCK:
            case biomeTiles.ASH:
            case 35:
            case 36:
                renderVolcanicRock(ctx, x, y, s, wx, wy);
                break;
            case biomeTiles.COBBLESTONE:
            case biomeTiles.CRACKED_STONE:
            case 40:
            case 41:
                renderCobblestone(ctx, x, y, s, wx, wy);
                break;
            case biomeTiles.ICE:
            case 31:
                renderIce(ctx, x, y, s, wx, wy);
                break;

            // Water tiles
            case biomeTiles.MURKY_WATER:
            case 26:
                renderMurkyWater(ctx, x, y, s, wx, wy, time);
                break;
            case biomeTiles.LAVA:
            case 37:
                renderLava(ctx, x, y, s, wx, wy, time);
                break;
            case biomeTiles.FROZEN_WATER:
            case 32:
                renderFrozenWater(ctx, x, y, s, wx, wy);
                break;

            // Trees
            case biomeTiles.PALM_TREE:
            case 23:
                renderPalmTree(ctx, x, y, s, wx, wy, time);
                break;
            case biomeTiles.PINE_TREE:
            case 33:
                renderPineTree(ctx, x, y, s, wx, wy, time);
                break;
            case biomeTiles.DEAD_TREE:
            case 27:
                renderDeadTree(ctx, x, y, s, wx, wy);
                break;

            // Vegetation
            case biomeTiles.CACTUS:
            case 22:
                renderCactus(ctx, x, y, s, wx, wy);
                break;
            case biomeTiles.MUSHROOM:
            case 28:
                renderMushroom(ctx, x, y, s, wx, wy);
                break;
            case biomeTiles.FLOWER_PATCH:
            case 45:
                renderFlowerPatch(ctx, x, y, s, wx, wy, time);
                break;

            // Special
            case biomeTiles.OBSIDIAN:
            case 38:
                renderObsidian(ctx, x, y, s, wx, wy);
                break;
            case biomeTiles.PILLAR:
            case 42:
                renderPillar(ctx, x, y, s, wx, wy);
                break;

            default:
                return false; // Not a biome tile, use default renderer
        }

        return true; // Successfully rendered
    }

    // ============= PUBLIC API =============
    return {
        // Palettes
        PALETTES,

        // Ground renderers
        renderSand,
        renderMud,
        renderSnowGround,
        renderVolcanicRock,
        renderCobblestone,
        renderIce,

        // Water renderers
        renderMurkyWater,
        renderLava,
        renderFrozenWater,

        // Tree renderers
        renderPalmTree,
        renderPineTree,
        renderDeadTree,

        // Vegetation renderers
        renderCactus,
        renderMushroom,
        renderFlowerPatch,

        // Special tile renderers
        renderObsidian,
        renderPillar,

        // Main render function
        renderBiomeTile
    };
})();

// Export globally
window.BiomeSprites = BiomeSprites;
