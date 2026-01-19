// ============= ENHANCED BUILDING & STRUCTURE SPRITES =============

// Helper function for pixel-perfect patterns
function seededRandom(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
}

// Enhanced Wall with weathering and depth - now with sprite support
function renderWall(x, y, s, wx, wy, level = 1) {
    const pattern = seededRandom(wx, wy);
    const pattern2 = seededRandom(wx + 100, wy + 100);

    // Try to use sprite-based wall first
    const wallsSprite = AssetManager.get('walls');
    if (wallsSprite && wallsSprite.complete && wallsSprite.naturalWidth > 0) {
        // The LPC walls tileset has 32x32 tiles
        // Use different tiles based on level
        const tileSize = 32;

        // Select different wall styles based on level
        // Row 0-2: Decorative walls, Row 3-5: Stone walls, Row 6+: Wood walls
        let tileX, tileY;
        if (level === 1) {
            // Basic stone wall - use row 3-4
            tileX = (Math.floor(pattern * 4)) * tileSize;
            tileY = (3 + Math.floor(pattern2 * 2)) * tileSize;
        } else if (level === 2) {
            // Metal/reinforced wall - use decorative walls row 1-2
            tileX = (Math.floor(pattern * 6)) * tileSize;
            tileY = (1 + Math.floor(pattern2 * 2)) * tileSize;
        } else {
            // Level 3 obsidian - use dark decorative row 0
            tileX = (Math.floor(pattern * 8)) * tileSize;
            tileY = 0;
        }

        // Ensure we don't go out of bounds
        if (tileX + tileSize <= wallsSprite.width && tileY + tileSize <= wallsSprite.height) {
            // Draw shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(x + 2, y + 2, s, s);

            // Draw wall sprite
            ctx.drawImage(wallsSprite, tileX, tileY, tileSize, tileSize, x, y, s, s);

            // Add level-specific overlays
            if (level > 1) {
                ctx.fillStyle = level > 2 ? 'rgba(255, 215, 0, 0.15)' : 'rgba(150, 200, 255, 0.1)';
                ctx.fillRect(x, y, s, s);
            }
            return;
        }
    }

    // Fallback to procedural rendering
    // Deep shadow for 3D effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(x + 2, y + 2, s, s);

    // Outline
    ctx.fillStyle = level > 1 ? (level > 2 ? '#ffd700' : '#bdc3c7') : PALETTE.outline;
    ctx.fillRect(x - 1, y - 1, s + 2, s + 2);

    // Main wall base with variation
    const wallColors = level === 1
        ? ['#6a6a6a', '#707070', '#656565', '#727272'] // Stone
        : (level === 2
            ? ['#7f8c8d', '#95a5a6', '#707b7c', '#839192'] // Iron/Steel
            : ['#2c3e50', '#34495e', '#212f3d', '#283747']); // Obsidian/Dark Steel

    ctx.fillStyle = wallColors[Math.floor(pattern * 4)];
    ctx.fillRect(x, y, s, s);

    // Stone brick pattern
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    // Horizontal mortar lines
    ctx.fillRect(x, y + s * 0.33, s, 2);
    ctx.fillRect(x, y + s * 0.66, s, 2);

    // Vertical mortar lines (offset per row)
    ctx.fillRect(x + s * 0.5, y, 2, s * 0.33);
    ctx.fillRect(x + s * 0.25, y + s * 0.33, 2, s * 0.33);
    ctx.fillRect(x + s * 0.75, y + s * 0.33, 2, s * 0.33);
    ctx.fillRect(x + s * 0.5, y + s * 0.66, 2, s * 0.34);

    // Level-specific highlights
    if (level > 1) {
        // Metallic sheen
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(x + 2, y + 2, s - 4, 2);
        ctx.fillRect(x + 2, y + 2, 2, s - 4);

        if (level > 2) {
            // Gold trim/runes
            ctx.fillStyle = 'rgba(241, 196, 15, 0.5)';
            ctx.fillRect(x + s * 0.4, y + s * 0.1, 2, s * 0.8);
            ctx.fillRect(x + s * 0.1, y + s * 0.4, s * 0.8, 2);
        }
    } else {
        // Stone texture highlights
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(x + 3, y + 3, s * 0.4, 2);
        ctx.fillRect(x + s * 0.55, y + s * 0.36, s * 0.35, 2);
        ctx.fillRect(x + 3, y + s * 0.69, s * 0.2, 2);
    }

    // Weathering and cracks (less common on higher levels)
    if (pattern > (0.6 + (level - 1) * 0.1)) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(x + s * 0.2, y + s * 0.1, 1, s * 0.15);
        ctx.fillRect(x + s * 0.21, y + s * 0.25, 1, s * 0.08);
    }

    // Moss patches (occasional)
    if (pattern2 > 0.85 && level === 1) {
        ctx.fillStyle = 'rgba(60, 90, 50, 0.4)';
        ctx.fillRect(x + s * 0.7, y + s * 0.8, 4, 3);
        ctx.fillRect(x + s * 0.75, y + s * 0.75, 3, 3);
    }

    // Top edge highlight
    ctx.fillStyle = level > 2 ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(x, y, s, 1);

    // Bottom edge shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(x, y + s - 1, s, 1);
}

// Enhanced Campfire with smoke and better flames
function renderCampfire(x, y, s) {
    const time = pixelTime || Date.now() / 1000;

    // 1. Ground scorch mark
    ctx.fillStyle = 'rgba(30, 20, 15, 0.5)';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s / 2 + s * 0.15, s * 0.5, s * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Ambient glow on ground
    const pulseGlow = Math.sin(time * 4) * 0.15 + 0.85;
    const groundGlow = ctx.createRadialGradient(
        x + s / 2, y + s / 2, 0,
        x + s / 2, y + s / 2, s * 0.7 * pulseGlow
    );
    groundGlow.addColorStop(0, 'rgba(255, 100, 20, 0.35)');
    groundGlow.addColorStop(0.5, 'rgba(255, 50, 0, 0.15)');
    groundGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = groundGlow;
    ctx.fillRect(x - s * 0.2, y - s * 0.2, s * 1.4, s * 1.4);

    // 3. Stone ring - outer dark edge
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + 0.15;
        const dist = s * 0.38;
        const stoneX = x + s / 2 + Math.cos(angle) * dist;
        const stoneY = y + s / 2 + Math.sin(angle) * dist * 0.7;
        const stoneW = 7 + seededRandom(i, 1) * 3;
        const stoneH = 5 + seededRandom(i, 2) * 2;

        // Stone shadow
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(stoneX - stoneW / 2 + 1, stoneY - stoneH / 2 + 1, stoneW, stoneH);

        // Stone body
        const stoneShade = 0.5 + seededRandom(i, 3) * 0.3;
        ctx.fillStyle = `rgb(${Math.floor(70 * stoneShade)}, ${Math.floor(65 * stoneShade)}, ${Math.floor(60 * stoneShade)})`;
        ctx.fillRect(stoneX - stoneW / 2, stoneY - stoneH / 2, stoneW, stoneH);

        // Stone highlight
        ctx.fillStyle = 'rgba(255, 150, 50, 0.2)';
        ctx.fillRect(stoneX - stoneW / 2, stoneY - stoneH / 2, stoneW - 1, 1);
    }

    // 4. Ash bed
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s / 2 + s * 0.05, s * 0.25, s * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing embers in ash
    for (let i = 0; i < 6; i++) {
        const emberPhase = (time * 2 + i * 1.5) % 3;
        if (emberPhase < 2) {
            const ex = x + s * 0.35 + seededRandom(i, 10) * s * 0.3;
            const ey = y + s * 0.45 + seededRandom(i, 11) * s * 0.15;
            ctx.fillStyle = emberPhase < 1 ? '#ff6600' : '#ff3300';
            ctx.globalAlpha = 0.8 - emberPhase * 0.3;
            ctx.fillRect(ex, ey, 2, 2);
            ctx.globalAlpha = 1;
        }
    }

    // 5. Logs (crossed)
    const logColor1 = '#3d2817';
    const logColor2 = '#4a3020';
    const logHighlight = '#5a4030';

    // Main horizontal log
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + s * 0.22 + 1, y + s * 0.52 + 1, s * 0.56, s * 0.12);
    ctx.fillStyle = logColor1;
    ctx.fillRect(x + s * 0.22, y + s * 0.5, s * 0.56, s * 0.12);
    ctx.fillStyle = logHighlight;
    ctx.fillRect(x + s * 0.22, y + s * 0.5, s * 0.56, 2);

    // Crossed logs
    ctx.save();
    ctx.translate(x + s / 2, y + s / 2);
    ctx.rotate(Math.PI / 3.5);
    ctx.fillStyle = logColor2;
    ctx.fillRect(-s * 0.28, -s * 0.05, s * 0.56, s * 0.1);
    ctx.fillStyle = logHighlight;
    ctx.fillRect(-s * 0.28, -s * 0.05, s * 0.56, 2);
    ctx.restore();

    ctx.save();
    ctx.translate(x + s / 2, y + s / 2);
    ctx.rotate(-Math.PI / 3.5);
    ctx.fillStyle = logColor2;
    ctx.fillRect(-s * 0.28, -s * 0.05, s * 0.56, s * 0.1);
    ctx.restore();

    // 6. Multi-layer flames
    const f1 = Math.sin(time * 12) * 2.5;
    const f2 = Math.cos(time * 15 + 1) * 2;
    const f3 = Math.sin(time * 9 + 2) * 1.5;

    // Outer flame (dark red)
    ctx.fillStyle = '#cc2200';
    drawFlame(ctx, x + s / 2 - 3, y + s * 0.62, s * 0.15, s * 0.35 + f3, f1 * 0.5);
    drawFlame(ctx, x + s / 2 + 4, y + s * 0.62, s * 0.12, s * 0.3 + f2, -f1 * 0.3);

    // Main flame (red-orange)
    ctx.fillStyle = '#ff4400';
    drawFlame(ctx, x + s / 2, y + s * 0.6, s * 0.2, s * 0.45 + f1, f2);

    // Inner flame (orange)
    ctx.fillStyle = '#ff7700';
    drawFlame(ctx, x + s / 2, y + s * 0.58, s * 0.15, s * 0.38 + f2, f1 * 0.6);

    // Core flame (yellow-orange)
    ctx.fillStyle = '#ffaa00';
    drawFlame(ctx, x + s / 2, y + s * 0.56, s * 0.1, s * 0.3 + f1 * 0.5, f3);

    // Hot core (yellow)
    ctx.fillStyle = '#ffdd44';
    drawFlame(ctx, x + s / 2, y + s * 0.54, s * 0.06, s * 0.2 + f2 * 0.4, 0);

    // White hot center
    ctx.fillStyle = '#ffffaa';
    ctx.globalAlpha = 0.7 + Math.sin(time * 18) * 0.3;
    ctx.fillRect(x + s * 0.46, y + s * 0.48, s * 0.08, s * 0.08);
    ctx.globalAlpha = 1;

    // 7. Sparks
    for (let i = 0; i < 6; i++) {
        const sparkLife = (time * 3 + i * 0.8) % 3;
        if (sparkLife < 2.5) {
            const sparkX = x + s * 0.5 + Math.sin(time * 5 + i * 2) * s * 0.15;
            const sparkY = y + s * 0.35 - sparkLife * s * 0.15;
            const sparkSize = sparkLife < 1 ? 2 : 1;
            ctx.fillStyle = i % 2 === 0 ? '#ffcc00' : '#ff8800';
            ctx.globalAlpha = 1 - sparkLife * 0.4;
            ctx.fillRect(sparkX, sparkY, sparkSize, sparkSize);
            ctx.globalAlpha = 1;
        }
    }

    // 8. Smoke particles
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 4; i++) {
        const smokeLife = (time * 0.8 + i * 1.2) % 4;
        const smokeX = x + s * 0.5 + Math.sin(time + i * 1.5) * s * 0.1;
        const smokeY = y + s * 0.2 - smokeLife * s * 0.25;
        const smokeSize = 4 + smokeLife * 3;
        ctx.fillStyle = '#888888';
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

// Enhanced Flame Helper with better curves
function drawFlame(ctx, cx, bottomY, width, height, offset) {
    ctx.beginPath();
    ctx.moveTo(cx - width, bottomY);
    ctx.quadraticCurveTo(
        cx - width * 0.8 + offset * 0.5, bottomY - height * 0.3,
        cx - width * 0.3 + offset, bottomY - height * 0.6
    );
    ctx.quadraticCurveTo(
        cx + offset * 0.5, bottomY - height * 1.1,
        cx, bottomY - height
    );
    ctx.quadraticCurveTo(
        cx - offset * 0.5, bottomY - height * 1.1,
        cx + width * 0.3 + offset, bottomY - height * 0.6
    );
    ctx.quadraticCurveTo(
        cx + width * 0.8 + offset * 0.5, bottomY - height * 0.3,
        cx + width, bottomY
    );
    ctx.closePath();
    ctx.fill();
}

// Enhanced House with chimney, better details
function renderHouse(x, y, s, level = 1) {
    const s2 = s * 2;
    const time = pixelTime || Date.now() / 1000;

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + s2 / 2, y + s2 + 4, s2 * 0.55, s2 * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Building shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + 6, y + s2 * 0.28 + 6, s2, s2 * 0.72);

    // Main building outline
    ctx.fillStyle = level > 1 ? (level > 2 ? '#ffd700' : '#bdc3c7') : PALETTE.outline;
    ctx.fillRect(x - 2, y + s2 * 0.25, s2 + 4, s2 * 0.77);

    // Main building body
    const wallGradient = ctx.createLinearGradient(x, 0, x + s2, 0);
    if (level === 1) {
        wallGradient.addColorStop(0, '#8a7a6a');
        wallGradient.addColorStop(1, '#857565');
    } else if (level === 2) {
        wallGradient.addColorStop(0, '#7f8c8d');
        wallGradient.addColorStop(1, '#4b5758');
    } else {
        wallGradient.addColorStop(0, '#2c3e50');
        wallGradient.addColorStop(1, '#1b2631');
    }
    ctx.fillStyle = wallGradient;
    ctx.fillRect(x, y + s2 * 0.28, s2, s2 * 0.72);

    // Wall texture details
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(x + s2 * 0.1, y + s2 * 0.4, s2 * 0.15, s2 * 0.5);
    ctx.fillRect(x + s2 * 0.75, y + s2 * 0.35, s2 * 0.15, s2 * 0.55);

    // Roof
    ctx.fillStyle = level === 3 ? '#212f3d' : (level === 2 ? '#34495e' : '#7a4030');
    ctx.beginPath();
    ctx.moveTo(x - 8, y + s2 * 0.3);
    ctx.lineTo(x + s2 / 2, y - 4);
    ctx.lineTo(x + s2 + 8, y + s2 * 0.3);
    ctx.closePath();
    ctx.fill();

    // Chimney smoke
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 3; i++) {
        const smokeY = y - 8 - (time * 15 + i * 12) % 30;
        const smokeX = x + s2 * 0.78 + Math.sin(time * 2 + i) * 3;
        ctx.fillStyle = level === 3 ? '#3498db' : '#aaaaaa';
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, 4 + i * 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Windows
    const winSize = s2 * 0.18;
    const windowPositions = [
        { wx: x + s2 * 0.08, lit: true },
        { wx: x + s2 * 0.74, lit: Math.sin(time) > 0 }
    ];

    windowPositions.forEach(({ wx, lit }) => {
        ctx.fillStyle = PALETTE.outline;
        ctx.fillRect(wx - 2, y + s2 * 0.38 - 2, winSize + 4, winSize + 4);
        if (lit) {
            ctx.fillStyle = level === 3 ? '#3498db' : (level === 2 ? '#00d2ff' : '#ffeeaa');
            if (level > 1) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = level === 3 ? '#3498db' : '#00d2ff';
            }
        } else {
            ctx.fillStyle = '#1a1a1a';
        }
        ctx.fillRect(wx, y + s2 * 0.38, winSize, winSize);
        ctx.shadowBlur = 0;
    });

    // Foundation stones
    ctx.fillStyle = level === 3 ? '#d4af37' : '#5a5a5a';
    ctx.fillRect(x, y + s2 * 0.92, s2, s2 * 0.08);
}

// Enhanced Farm with water, more crops, fence
function renderFarm(x, y, s) {
    const time = pixelTime || Date.now() / 1000;

    // Tilled soil base
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(x, y, s, s);

    // Soil texture
    ctx.fillStyle = '#4a3525';
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (seededRandom(i, j) > 0.5) {
                ctx.fillRect(x + i * s / 8, y + j * s / 8, 2, 2);
            }
        }
    }

    // Soil rows with depth
    for (let i = 0; i < 3; i++) {
        const rowY = y + s * (0.12 + i * 0.3);

        // Row shadow
        ctx.fillStyle = '#3a2515';
        ctx.fillRect(x + s * 0.08, rowY + 3, s * 0.84, s * 0.12);

        // Row mound
        ctx.fillStyle = '#6a4a35';
        ctx.fillRect(x + s * 0.08, rowY, s * 0.84, s * 0.12);

        // Row highlight
        ctx.fillStyle = '#7a5a45';
        ctx.fillRect(x + s * 0.08, rowY, s * 0.84, 2);
    }

    // Water puddle (corner irrigation)
    ctx.fillStyle = 'rgba(70, 130, 180, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x + s * 0.1, y + s * 0.9, s * 0.08, s * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(150, 200, 255, 0.3)';
    ctx.fillRect(x + s * 0.06, y + s * 0.88, 3, 2);

    // Crops with growth stages
    const cropColors = ['#3a7a30', '#4a8a40', '#5a9a50'];

    for (let i = 0; i < 3; i++) {
        const rowY = y + s * (0.12 + i * 0.3);
        const growthStage = (Math.sin(time * 0.5 + i) + 1) / 2;
        const cropSway = Math.sin(time * 2.5 + i) * 1.5;

        for (let j = 0; j < 5; j++) {
            const cropX = x + s * 0.12 + j * s * 0.17;
            const cropSwayOffset = cropSway * (j % 2 === 0 ? 1 : -1);
            const cropHeight = s * (0.12 + growthStage * 0.08);

            // Stem
            ctx.fillStyle = '#2a5a20';
            ctx.fillRect(cropX + cropSwayOffset, rowY - cropHeight, 2, cropHeight);

            // Leaves
            ctx.fillStyle = cropColors[j % 3];
            ctx.fillRect(cropX - 3 + cropSwayOffset * 0.5, rowY - cropHeight * 0.8, 4, 3);
            ctx.fillRect(cropX + 1 + cropSwayOffset * 0.5, rowY - cropHeight * 0.6, 4, 3);
            ctx.fillRect(cropX - 2 + cropSwayOffset, rowY - cropHeight - 2, 6, 4);

            // Crop head (wheat/vegetable)
            if (growthStage > 0.5) {
                ctx.fillStyle = '#c4a44a';
                ctx.fillRect(cropX - 1 + cropSwayOffset, rowY - cropHeight - 4, 4, 4);
            }
        }
    }

    // Corner fence posts
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x, y, 5, s * 0.2);
    ctx.fillRect(x + s - 5, y, 5, s * 0.2);
    ctx.fillStyle = '#7a6a5a';
    ctx.fillRect(x + 1, y + 1, 3, s * 0.18);
    ctx.fillRect(x + s - 4, y + 1, 3, s * 0.18);

    // Fence rail
    ctx.fillStyle = '#6a5a4a';
    ctx.fillRect(x, y + s * 0.08, s, 3);
}

// Enhanced Tower with flag and better stonework
function renderTower(x, y, s, level = 1) {
    const time = pixelTime || Date.now() / 1000;

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s + 2, s * 0.45, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tower shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x + s * 0.15 + 5, y + s * 0.05 + 5, s * 0.75, s * 0.95);

    // Outline
    ctx.fillStyle = level > 1 ? (level > 2 ? '#ffd700' : '#bdc3c7') : PALETTE.outline;
    ctx.fillRect(x + s * 0.1, y + s * 0.02, s * 0.8, s);

    // Main tower body gradient
    const towerGrad = ctx.createLinearGradient(x + s * 0.1, 0, x + s * 0.9, 0);
    if (level === 1) {
        towerGrad.addColorStop(0, '#606070');
        towerGrad.addColorStop(1, '#555565');
    } else if (level === 2) {
        towerGrad.addColorStop(0, '#7f8c8d');
        towerGrad.addColorStop(1, '#4b5758');
    } else {
        towerGrad.addColorStop(0, '#2c3e50');
        towerGrad.addColorStop(1, '#1b2631');
    }
    ctx.fillStyle = towerGrad;
    ctx.fillRect(x + s * 0.13, y + s * 0.08, s * 0.74, s * 0.92);

    // Stone brick pattern
    for (let row = 0; row < 5; row++) {
        const offsetX = row % 2 === 0 ? 0 : s * 0.12;
        for (let col = 0; col < 3; col++) {
            const brickX = x + s * 0.16 + offsetX + col * s * 0.24;
            const brickY = y + s * (0.12 + row * 0.17);
            const brickW = s * 0.2;
            const brickH = s * 0.14;

            ctx.fillStyle = level > 2 ? 'rgba(241, 196, 15, 0.1)' : 'rgba(0, 0, 0, 0.15)';
            ctx.fillRect(brickX, brickY + brickH - 2, brickW, 2);
            ctx.fillRect(brickX + brickW - 2, brickY, 2, brickH);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.fillRect(brickX, brickY, brickW, 2);
        }
    }

    // Arrow slits (multiple slits for higher levels)
    const slitsCount = level;
    for (let i = 0; i < slitsCount; i++) {
        const sx = x + s * (0.2 + (i * 0.2) % 0.6);
        const sy = y + s * (0.3 + (i * 0.2) % 0.4);
        ctx.fillStyle = level > 2 ? '#f1c40f' : '#1a1a2a';
        ctx.fillRect(sx, sy, s * 0.08, s * 0.18);
        if (level > 2) {
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#f1c40f';
            ctx.fillRect(sx + 1, sy + 1, s * 0.05, s * 0.14);
            ctx.shadowBlur = 0;
        }
    }

    // Battlements
    const battleWidth = s * 0.2;
    const count = 3;
    for (let i = 0; i < count; i++) {
        const bx = x + s * (0.06 + i * 0.34);
        const by = y - s * (i === 1 ? 0.05 : 0.02);
        ctx.fillStyle = PALETTE.outline;
        ctx.fillRect(bx - 2, by - 2, battleWidth + 4, s * 0.17);
        ctx.fillStyle = level > 2 ? '#d4af37' : (level > 1 ? '#95a5a6' : '#7a7a8a');
        ctx.fillRect(bx, by, battleWidth, s * 0.13);
    }

    // Flag
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(x + s * 0.49, y - s * 0.35, 3, s * 0.35);
    const flagWave = Math.sin(time * 4) * 2;
    ctx.fillStyle = level === 3 ? '#f1c40f' : (level === 2 ? '#3498db' : '#cc3333');
    ctx.beginPath();
    ctx.moveTo(x + s * 0.52, y - s * 0.33);
    ctx.quadraticCurveTo(x + s * 0.65 + flagWave, y - s * 0.28, x + s * 0.72, y - s * 0.25 + flagWave * 0.3);
    ctx.lineTo(x + s * 0.72, y - s * 0.15 + flagWave * 0.3);
    ctx.quadraticCurveTo(x + s * 0.65 + flagWave * 0.5, y - s * 0.18, x + s * 0.52, y - s * 0.2);
    ctx.closePath();
    ctx.fill();

    // Base stones
    ctx.fillStyle = level > 2 ? '#34495e' : '#5a5a6a';
    ctx.fillRect(x + s * 0.08, y + s * 0.85, s * 0.84, s * 0.15);
}

// Enhanced Cannon with more detail and smoke
function renderCannon(x, y, s, level = 1) {
    const time = pixelTime || Date.now() / 1000;

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s * 0.92, s * 0.45, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Platform outline and body
    ctx.fillStyle = level > 2 ? '#d4af37' : PALETTE.outline;
    ctx.fillRect(x + s * 0.06, y + s * 0.55, s * 0.88, s * 0.44);
    ctx.fillStyle = level === 1 ? '#6a5a4a' : (level === 2 ? '#454e52' : '#2c3e50');
    ctx.fillRect(x + s * 0.08, y + s * 0.58, s * 0.84, s * 0.38);

    // Wheels
    const wheelPositions = [x + s * 0.22, x + s * 0.78];
    wheelPositions.forEach(wx => {
        ctx.fillStyle = PALETTE.outline;
        ctx.beginPath();
        ctx.arc(wx, y + s * 0.82, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = level > 1 ? '#7f8c8d' : '#5a4a3a';
        ctx.beginPath();
        ctx.arc(wx, y + s * 0.82, s * 0.12, 0, Math.PI * 2);
        ctx.fill();
    });

    // Cannon barrel
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.23, y + s * 0.18, s * 0.54, s * 0.42);
    const barrelGrad = ctx.createLinearGradient(x, y + s * 0.2, x, y + s * 0.58);
    if (level === 1) {
        barrelGrad.addColorStop(0, '#5a5a5a');
        barrelGrad.addColorStop(1, '#3a3a3a');
    } else if (level === 2) {
        barrelGrad.addColorStop(0, '#7f8c8d');
        barrelGrad.addColorStop(1, '#2c3e50');
    } else {
        barrelGrad.addColorStop(0, '#2c3e50');
        barrelGrad.addColorStop(1, '#000000');
    }
    ctx.fillStyle = barrelGrad;
    ctx.fillRect(x + s * 0.26, y + s * 0.22, s * 0.48, s * 0.36);

    // Muzzle
    ctx.fillStyle = level > 2 ? '#f1c40f' : PALETTE.outline;
    ctx.fillRect(x + s * 0.36, y + s * 0.06, s * 0.28, s * 0.2);

    if (level > 2) {
        // Energy glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#f1c40f';
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + s * 0.42, y + s * 0.02, s * 0.16, s * 0.1);
        ctx.shadowBlur = 0;
    } else {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(x + s * 0.42, y + s * 0.02, s * 0.16, s * 0.1);
    }

    // Smoke wisps
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 2; i++) {
        const smokeOffset = (time * 20 + i * 15) % 20;
        const smokeY = y - smokeOffset;
        ctx.fillStyle = level === 3 ? '#f1c40f' : '#888888';
        ctx.beginPath();
        ctx.arc(x + s * 0.5 + Math.sin(time + i) * 4, smokeY, 3 + i * 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

// Enhanced Workbench with more tools and drawers
function renderWorkbench(x, y, s) {
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + s * 0.08 + 3, y + s * 0.35 + 3, s * 0.88, s * 0.65);

    // Back panel
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.04, y + s * 0.1, s * 0.92, s * 0.22);
    ctx.fillStyle = '#6a5a4a';
    ctx.fillRect(x + s * 0.06, y + s * 0.12, s * 0.88, s * 0.18);

    // Pegboard holes
    ctx.fillStyle = '#5a4a3a';
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 2; j++) {
            ctx.fillRect(x + s * (0.15 + i * 0.15), y + s * (0.15 + j * 0.08), 3, 3);
        }
    }

    // Legs
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.08, y + s * 0.5, s * 0.14, s * 0.52);
    ctx.fillRect(x + s * 0.78, y + s * 0.5, s * 0.14, s * 0.52);
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(x + s * 0.1, y + s * 0.52, s * 0.1, s * 0.48);
    ctx.fillRect(x + s * 0.8, y + s * 0.52, s * 0.1, s * 0.48);

    // Leg stretcher
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(x + s * 0.18, y + s * 0.8, s * 0.64, s * 0.06);

    // Table top outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x, y + s * 0.28, s, s * 0.25);

    // Table top
    const topGrad = ctx.createLinearGradient(x, y + s * 0.3, x + s, y + s * 0.3);
    topGrad.addColorStop(0, '#7a6a5a');
    topGrad.addColorStop(0.5, '#8a7a6a');
    topGrad.addColorStop(1, '#7a6a5a');
    ctx.fillStyle = topGrad;
    ctx.fillRect(x + s * 0.02, y + s * 0.3, s * 0.96, s * 0.2);

    // Wood grain
    ctx.fillStyle = '#6a5a4a';
    ctx.fillRect(x + s * 0.08, y + s * 0.36, s * 0.35, 2);
    ctx.fillRect(x + s * 0.5, y + s * 0.4, s * 0.4, 2);
    ctx.fillRect(x + s * 0.15, y + s * 0.44, s * 0.25, 1);

    // Top edge highlight
    ctx.fillStyle = '#9a8a7a';
    ctx.fillRect(x + s * 0.02, y + s * 0.3, s * 0.96, 2);

    // Drawer
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.35, y + s * 0.52, s * 0.3, s * 0.18);
    ctx.fillStyle = '#6a5a4a';
    ctx.fillRect(x + s * 0.37, y + s * 0.54, s * 0.26, s * 0.14);
    ctx.fillStyle = '#8a7a6a';
    ctx.fillRect(x + s * 0.47, y + s * 0.6, s * 0.06, s * 0.04);

    // Tools on pegboard
    // Hammer
    ctx.fillStyle = '#666666';
    ctx.fillRect(x + s * 0.12, y + s * 0.05, s * 0.1, s * 0.2);
    ctx.fillStyle = PALETTE.wood3;
    ctx.fillRect(x + s * 0.15, y + s * 0.15, s * 0.04, s * 0.18);
    ctx.fillStyle = '#777777';
    ctx.fillRect(x + s * 0.13, y + s * 0.05, s * 0.08, 2);

    // Saw
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(x + s * 0.55, y + s * 0.02, s * 0.25, s * 0.08);
    ctx.fillStyle = PALETTE.wood3;
    ctx.fillRect(x + s * 0.76, y, s * 0.1, s * 0.2);
    // Saw teeth
    ctx.fillStyle = '#888888';
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(x + s * (0.57 + i * 0.045), y + s * 0.1);
        ctx.lineTo(x + s * (0.59 + i * 0.045), y + s * 0.13);
        ctx.lineTo(x + s * (0.57 + i * 0.045) + 3, y + s * 0.1);
        ctx.fill();
    }

    // Wrench on table
    ctx.fillStyle = '#707070';
    ctx.fillRect(x + s * 0.7, y + s * 0.32, s * 0.2, s * 0.06);
    ctx.fillRect(x + s * 0.7, y + s * 0.3, s * 0.06, s * 0.1);
    ctx.fillRect(x + s * 0.86, y + s * 0.3, s * 0.06, s * 0.1);

    // Nails scattered
    ctx.fillStyle = '#888888';
    ctx.fillRect(x + s * 0.25, y + s * 0.35, 1, 6);
    ctx.fillRect(x + s * 0.28, y + s * 0.36, 1, 5);
    ctx.fillRect(x + s * 0.32, y + s * 0.34, 1, 6);
    ctx.fillRect(x + s * 0.22, y + s * 0.38, 5, 1);

    // Wood plank
    ctx.fillStyle = '#9a8a6a';
    ctx.fillRect(x + s * 0.4, y + s * 0.33, s * 0.22, s * 0.08);
    ctx.fillStyle = '#8a7a5a';
    ctx.fillRect(x + s * 0.42, y + s * 0.36, s * 0.18, 2);
}

// Enhanced Chest with metalwork and shine
function renderChest(x, y, s) {
    const time = pixelTime || Date.now() / 1000;

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s * 0.95, s * 0.4, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + s * 0.12 + 3, y + s * 0.32 + 3, s * 0.76, s * 0.62);

    // Outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.08, y + s * 0.28, s * 0.84, s * 0.68);

    // Chest body
    const bodyGrad = ctx.createLinearGradient(x + s * 0.1, 0, x + s * 0.9, 0);
    bodyGrad.addColorStop(0, '#6a4525');
    bodyGrad.addColorStop(0.3, '#8a5535');
    bodyGrad.addColorStop(0.7, '#8a5535');
    bodyGrad.addColorStop(1, '#6a4525');
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(x + s * 0.12, y + s * 0.42, s * 0.76, s * 0.52);

    // Wood grain on body
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(x + s * 0.15, y + s * 0.5, s * 0.7, 2);
    ctx.fillRect(x + s * 0.15, y + s * 0.65, s * 0.7, 2);
    ctx.fillRect(x + s * 0.15, y + s * 0.8, s * 0.7, 2);

    // Chest lid
    const lidGrad = ctx.createLinearGradient(x, y + s * 0.3, x, y + s * 0.45);
    lidGrad.addColorStop(0, '#9a6545');
    lidGrad.addColorStop(1, '#7a5535');
    ctx.fillStyle = lidGrad;
    ctx.fillRect(x + s * 0.12, y + s * 0.32, s * 0.76, s * 0.14);

    // Lid curve highlight
    ctx.fillStyle = '#aa7555';
    ctx.fillRect(x + s * 0.15, y + s * 0.34, s * 0.7, 3);

    // Corner reinforcements
    const corners = [
        { cx: x + s * 0.12, cy: y + s * 0.32 },
        { cx: x + s * 0.8, cy: y + s * 0.32 },
        { cx: x + s * 0.12, cy: y + s * 0.86 },
        { cx: x + s * 0.8, cy: y + s * 0.86 }
    ];
    corners.forEach(({ cx, cy }) => {
        ctx.fillStyle = '#555555';
        ctx.fillRect(cx, cy, s * 0.08, s * 0.08);
        ctx.fillStyle = '#666666';
        ctx.fillRect(cx + 1, cy + 1, s * 0.06, s * 0.06);
    });

    // Metal bands
    ctx.fillStyle = '#555555';
    ctx.fillRect(x + s * 0.12, y + s * 0.44, s * 0.76, 4);
    ctx.fillRect(x + s * 0.12, y + s * 0.72, s * 0.76, 4);

    // Band highlights
    ctx.fillStyle = '#777777';
    ctx.fillRect(x + s * 0.15, y + s * 0.44, s * 0.7, 1);
    ctx.fillRect(x + s * 0.15, y + s * 0.72, s * 0.7, 1);

    // Lock plate
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.4, y + s * 0.5, s * 0.2, s * 0.18);

    // Lock body
    const lockGrad = ctx.createRadialGradient(
        x + s * 0.5, y + s * 0.58, 0,
        x + s * 0.5, y + s * 0.58, s * 0.12
    );
    lockGrad.addColorStop(0, '#ddaa44');
    lockGrad.addColorStop(0.5, '#cc9933');
    lockGrad.addColorStop(1, '#aa7722');
    ctx.fillStyle = lockGrad;
    ctx.fillRect(x + s * 0.42, y + s * 0.52, s * 0.16, s * 0.14);

    // Keyhole
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(x + s * 0.5, y + s * 0.57, s * 0.025, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + s * 0.49, y + s * 0.58, s * 0.02, s * 0.05);

    // Shine effect (animated)
    const shinePos = (Math.sin(time * 0.5) + 1) / 2;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(x + s * 0.2 + shinePos * s * 0.4, y + s * 0.35, s * 0.08, s * 0.08);

    // Lock shine
    ctx.fillStyle = 'rgba(255, 255, 200, 0.3)';
    ctx.fillRect(x + s * 0.43, y + s * 0.53, 3, 3);
}

// Enhanced Bed with quilted pattern
function renderBed(x, y, s) {
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + s * 0.03 + 3, y + s * 0.35 + 3, s * 0.94, s * 0.62);

    // Frame outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x, y + s * 0.45, s, s * 0.57);

    // Bed frame
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(x + s * 0.03, y + s * 0.48, s * 0.94, s * 0.52);

    // Frame wood grain
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(x + s * 0.08, y + s * 0.55, s * 0.84, 2);
    ctx.fillRect(x + s * 0.08, y + s * 0.75, s * 0.84, 2);

    // Frame highlight
    ctx.fillStyle = '#6a5a4a';
    ctx.fillRect(x + s * 0.03, y + s * 0.48, s * 0.94, 2);

    // Mattress
    ctx.fillStyle = '#dddddd';
    ctx.fillRect(x + s * 0.08, y + s * 0.38, s * 0.84, s * 0.35);
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(x + s * 0.08, y + s * 0.65, s * 0.84, s * 0.08);

    // Blanket
    const blanketGrad = ctx.createLinearGradient(x, y + s * 0.4, x, y + s * 0.7);
    blanketGrad.addColorStop(0, '#aa4444');
    blanketGrad.addColorStop(1, '#883333');
    ctx.fillStyle = blanketGrad;
    ctx.fillRect(x + s * 0.1, y + s * 0.42, s * 0.8, s * 0.32);

    // Quilted pattern
    ctx.fillStyle = '#993333';
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + s * (0.2 + i * 0.18), y + s * 0.42, 2, s * 0.32);
    }
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(x + s * 0.1, y + s * (0.48 + i * 0.1), s * 0.8, 2);
    }

    // Blanket fold
    ctx.fillStyle = '#bb5555';
    ctx.fillRect(x + s * 0.1, y + s * 0.42, s * 0.8, 4);

    // Pillow
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(x + s * 0.1, y + s * 0.33, s * 0.35, s * 0.18);

    // Pillow puff
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + s * 0.12, y + s * 0.35, s * 0.31, s * 0.08);

    // Pillow shadow
    ctx.fillStyle = '#e5e5e5';
    ctx.fillRect(x + s * 0.1, y + s * 0.46, s * 0.35, s * 0.05);

    // Pillow seam
    ctx.fillStyle = '#dddddd';
    ctx.fillRect(x + s * 0.1 + s * 0.175, y + s * 0.33, 2, s * 0.18);

    // Headboard
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.02, y + s * 0.2, s * 0.48, s * 0.18);
    ctx.fillStyle = '#6a5545';
    ctx.fillRect(x + s * 0.04, y + s * 0.22, s * 0.44, s * 0.14);

    // Headboard design
    ctx.fillStyle = '#5a4535';
    ctx.fillRect(x + s * 0.1, y + s * 0.25, s * 0.14, s * 0.08);
    ctx.fillRect(x + s * 0.28, y + s * 0.25, s * 0.14, s * 0.08);

    // Headboard highlight
    ctx.fillStyle = '#7a6555';
    ctx.fillRect(x + s * 0.04, y + s * 0.22, s * 0.44, 2);

    // Footboard
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.85, y + s * 0.35, s * 0.13, s * 0.3);
    ctx.fillStyle = '#5a4535';
    ctx.fillRect(x + s * 0.87, y + s * 0.37, s * 0.09, s * 0.26);
}

// Enhanced Spikes with rust and danger signs
function renderSpikes(x, y, s) {
    // Base platform
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x - 1, y - 1, s + 2, s + 2);
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(x, y, s, s);

    // Wooden frame with wear
    ctx.fillStyle = '#6a5a4a';
    ctx.fillRect(x + 2, y + 2, s - 4, s - 4);

    // Frame grain
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(x + 4, y + s * 0.3, s - 8, 2);
    ctx.fillRect(x + 4, y + s * 0.6, s - 8, 2);
    ctx.fillRect(x + s * 0.3, y + 4, 2, s - 8);
    ctx.fillRect(x + s * 0.6, y + 4, 2, s - 8);

    // Spikes
    const spikePositions = [
        [0.2, 0.2], [0.5, 0.15], [0.8, 0.2],
        [0.15, 0.5], [0.5, 0.5], [0.85, 0.5],
        [0.2, 0.8], [0.5, 0.85], [0.8, 0.8]
    ];

    spikePositions.forEach(([px, py], i) => {
        const sx = x + s * px;
        const sy = y + s * py;
        const spikeHeight = s * 0.15 + seededRandom(i, 5) * s * 0.03;

        // Spike shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.moveTo(sx - s * 0.06, sy + s * 0.08 + 2);
        ctx.lineTo(sx + 2, sy - spikeHeight + 4);
        ctx.lineTo(sx + s * 0.08, sy + s * 0.08 + 2);
        ctx.closePath();
        ctx.fill();

        // Spike outline
        ctx.fillStyle = PALETTE.outline;
        ctx.beginPath();
        ctx.moveTo(sx - s * 0.08, sy + s * 0.08);
        ctx.lineTo(sx, sy - spikeHeight - 2);
        ctx.lineTo(sx + s * 0.08, sy + s * 0.08);
        ctx.closePath();
        ctx.fill();

        // Spike body
        const spikeGrad = ctx.createLinearGradient(sx - s * 0.05, 0, sx + s * 0.05, 0);
        spikeGrad.addColorStop(0, '#888888');
        spikeGrad.addColorStop(0.4, '#aaaaaa');
        spikeGrad.addColorStop(0.6, '#aaaaaa');
        spikeGrad.addColorStop(1, '#777777');
        ctx.fillStyle = spikeGrad;
        ctx.beginPath();
        ctx.moveTo(sx - s * 0.06, sy + s * 0.06);
        ctx.lineTo(sx, sy - spikeHeight);
        ctx.lineTo(sx + s * 0.06, sy + s * 0.06);
        ctx.closePath();
        ctx.fill();

        // Spike highlight
        ctx.fillStyle = '#cccccc';
        ctx.beginPath();
        ctx.moveTo(sx - s * 0.02, sy + s * 0.02);
        ctx.lineTo(sx, sy - spikeHeight + 2);
        ctx.lineTo(sx + s * 0.01, sy + s * 0.02);
        ctx.closePath();
        ctx.fill();

        // Rust patches (random)
        if (seededRandom(i, 10) > 0.5) {
            ctx.fillStyle = 'rgba(139, 69, 19, 0.4)';
            ctx.fillRect(sx - 2, sy - s * 0.05, 3, 4);
        }

        // Blood stains (some spikes)
        if (seededRandom(i, 20) > 0.7) {
            ctx.fillStyle = 'rgba(120, 20, 20, 0.5)';
            ctx.fillRect(sx - 1, sy - spikeHeight * 0.3, 2, spikeHeight * 0.2);
        }
    });

    // Warning marks on frame
    ctx.fillStyle = '#cc4444';
    ctx.fillRect(x + 3, y + 3, 4, 4);
    ctx.fillRect(x + s - 7, y + 3, 4, 4);
    ctx.fillRect(x + 3, y + s - 7, 4, 4);
    ctx.fillRect(x + s - 7, y + s - 7, 4, 4);
}

// ============= NEW BONUS STRUCTURES =============

// Storage Barrel
function renderBarrel(x, y, s) {
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + s / 2 + 2, y + s * 0.9 + 2, s * 0.35, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Barrel body outline
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s * 0.85, s * 0.4, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + s * 0.1, y + s * 0.2, s * 0.8, s * 0.65);

    // Barrel body
    const barrelGrad = ctx.createLinearGradient(x + s * 0.1, 0, x + s * 0.9, 0);
    barrelGrad.addColorStop(0, '#6a4a30');
    barrelGrad.addColorStop(0.3, '#8a6a50');
    barrelGrad.addColorStop(0.7, '#8a6a50');
    barrelGrad.addColorStop(1, '#6a4a30');
    ctx.fillStyle = barrelGrad;
    ctx.fillRect(x + s * 0.12, y + s * 0.22, s * 0.76, s * 0.63);

    // Barrel top
    ctx.fillStyle = '#7a5a40';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s * 0.22, s * 0.38, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a6a50';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s * 0.22, s * 0.32, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Metal bands
    ctx.fillStyle = '#555555';
    ctx.fillRect(x + s * 0.12, y + s * 0.28, s * 0.76, 4);
    ctx.fillRect(x + s * 0.12, y + s * 0.5, s * 0.76, 4);
    ctx.fillRect(x + s * 0.12, y + s * 0.72, s * 0.76, 4);

    // Band highlights
    ctx.fillStyle = '#777777';
    ctx.fillRect(x + s * 0.15, y + s * 0.28, s * 0.7, 1);
    ctx.fillRect(x + s * 0.15, y + s * 0.5, s * 0.7, 1);
    ctx.fillRect(x + s * 0.15, y + s * 0.72, s * 0.7, 1);

    // Wood planks
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < 5; i++) {
        const plankX = x + s * 0.2 + i * s * 0.13;
        ctx.fillRect(plankX, y + s * 0.25, 2, s * 0.58);
    }
}

// Lantern/Torch Post
function renderLanternPost(x, y, s) {
    const time = pixelTime || Date.now() / 1000;

    // Post shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + s * 0.45 + 2, y + s * 0.3 + 2, s * 0.12, s * 0.72);

    // Light glow
    const glowPulse = Math.sin(time * 4) * 0.1 + 0.9;
    const glow = ctx.createRadialGradient(
        x + s / 2, y + s * 0.25, 0,
        x + s / 2, y + s * 0.25, s * 0.5 * glowPulse
    );
    glow.addColorStop(0, 'rgba(255, 200, 100, 0.4)');
    glow.addColorStop(0.5, 'rgba(255, 150, 50, 0.15)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, s, s);

    // Post
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.42, y + s * 0.35, s * 0.16, s * 0.67);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x + s * 0.44, y + s * 0.37, s * 0.12, s * 0.63);

    // Lantern bracket
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x + s * 0.35, y + s * 0.28, s * 0.3, s * 0.05);

    // Lantern cage
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.32, y + s * 0.08, s * 0.36, s * 0.25);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x + s * 0.35, y + s * 0.1, s * 0.3, s * 0.21);

    // Lantern glass/flame
    ctx.fillStyle = '#ffcc66';
    ctx.globalAlpha = 0.8 + Math.sin(time * 8) * 0.2;
    ctx.fillRect(x + s * 0.38, y + s * 0.12, s * 0.24, s * 0.17);
    ctx.globalAlpha = 1;

    // Flame core
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6;
    ctx.fillRect(x + s * 0.46, y + s * 0.15, s * 0.08, s * 0.1);
    ctx.globalAlpha = 1;

    // Lantern top
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.moveTo(x + s * 0.35, y + s * 0.1);
    ctx.lineTo(x + s * 0.5, y);
    ctx.lineTo(x + s * 0.65, y + s * 0.1);
    ctx.closePath();
    ctx.fill();
}

// Well
function renderWell(x, y, s) {
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + s / 2 + 3, y + s * 0.85 + 3, s * 0.45, s * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stone base
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s * 0.8, s * 0.48, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#6a6a6a';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s * 0.8, s * 0.44, s * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Well wall
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(x + s * 0.1, y + s * 0.45, s * 0.8, s * 0.35);

    // Stone pattern
    ctx.fillStyle = '#6a6a6a';
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 4; col++) {
            const offset = row % 2 === 0 ? 0 : s * 0.1;
            ctx.fillRect(x + s * 0.12 + offset + col * s * 0.2, y + s * (0.48 + row * 0.15), s * 0.16, s * 0.12);
        }
    }

    // Water inside (dark)
    ctx.fillStyle = '#2a4a6a';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s * 0.52, s * 0.32, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Water reflection
    ctx.fillStyle = 'rgba(150, 200, 255, 0.3)';
    ctx.fillRect(x + s * 0.35, y + s * 0.5, s * 0.15, 3);

    // Wooden frame posts
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(x + s * 0.12, y + s * 0.15, s * 0.08, s * 0.55);
    ctx.fillRect(x + s * 0.8, y + s * 0.15, s * 0.08, s * 0.55);

    // Roof
    ctx.fillStyle = '#5a3a25';
    ctx.beginPath();
    ctx.moveTo(x + s * 0.05, y + s * 0.2);
    ctx.lineTo(x + s * 0.5, y);
    ctx.lineTo(x + s * 0.95, y + s * 0.2);
    ctx.closePath();
    ctx.fill();

    // Roof edge
    ctx.fillStyle = '#6a4a35';
    ctx.fillRect(x + s * 0.05, y + s * 0.18, s * 0.9, 3);

    // Bucket rope
    ctx.fillStyle = '#8a7a5a';
    ctx.fillRect(x + s * 0.49, y + s * 0.1, 2, s * 0.4);

    // Bucket
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(x + s * 0.42, y + s * 0.42, s * 0.16, s * 0.12);
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(x + s * 0.44, y + s * 0.44, s * 0.12, s * 0.08);
}