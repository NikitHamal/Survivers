// ============= ENHANCED BUILDING & STRUCTURE SPRITES =============
// All buildings now support 5 upgrade levels with distinct visual appearances

// Helper function for pixel-perfect patterns
function seededRandom(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
}

// Building level color palettes for progression
const BUILDING_LEVEL_COLORS = {
    wall: [
        { main: '#6a5a4a', light: '#8a7a6a', dark: '#4a3a2a', accent: '#5a4a3a' }, // Level 1: Wooden
        { main: '#7a7a7a', light: '#9a9a9a', dark: '#5a5a5a', accent: '#6a6a6a' }, // Level 2: Reinforced
        { main: '#808090', light: '#a0a0b0', dark: '#606070', accent: '#707080' }, // Level 3: Stone
        { main: '#707888', light: '#909aa8', dark: '#505868', accent: '#606878' }, // Level 4: Fortified
        { main: '#8090a8', light: '#a0b0c8', dark: '#607088', accent: '#7088a0', glow: '#aaccff' } // Level 5: Legendary
    ],
    tower: [
        { main: '#606060', light: '#808080', dark: '#404040', flag: '#cc3333' }, // Level 1: Watchtower
        { main: '#707070', light: '#909090', dark: '#505050', flag: '#3366cc' }, // Level 2: Guard Tower
        { main: '#606878', light: '#808898', dark: '#404858', flag: '#33cc33' }, // Level 3: Archer Tower
        { main: '#707888', light: '#909aa8', dark: '#505868', flag: '#cc9933' }, // Level 4: Fortress Tower
        { main: '#8090a0', light: '#a0b0c0', dark: '#607080', flag: '#cc33cc', glow: '#ffaaff' } // Level 5: Legendary
    ],
    cannon: [
        { barrel: '#4a4a4a', platform: '#6a5a4a', metal: '#555555' }, // Level 1: Wooden Cannon
        { barrel: '#555555', platform: '#5a5a5a', metal: '#666666' }, // Level 2: Iron Cannon
        { barrel: '#606060', platform: '#606060', metal: '#777777' }, // Level 3: Steel Cannon
        { barrel: '#505860', platform: '#505860', metal: '#888888' }, // Level 4: Siege Cannon
        { barrel: '#607080', platform: '#607080', metal: '#99aacc', glow: '#aaccff' } // Level 5: Legendary
    ],
    house: [
        { wall: '#8a7a6a', roof: '#7a4030', door: '#4a3020' }, // Level 1: Wooden Shack
        { wall: '#9a8a7a', roof: '#6a3525', door: '#3a2515' }, // Level 2: Small House
        { wall: '#a09080', roof: '#5a3020', door: '#2a1a10' }, // Level 3: Comfortable Home
        { wall: '#8a8890', roof: '#4a2a20', door: '#1a1015' }, // Level 4: Manor
        { wall: '#90a0b0', roof: '#3a2a30', door: '#101020', glow: '#aaccff' } // Level 5: Legendary Estate
    ],
    farm: [
        { soil: '#5a4030', crops: ['#3a7a30'], fence: '#7a6a5a' }, // Level 1: Small Plot
        { soil: '#5a4535', crops: ['#3a7a30', '#4a8a40'], fence: '#8a7a6a' }, // Level 2: Garden
        { soil: '#5a4a3a', crops: ['#3a7a30', '#4a8a40', '#5a9a50'], fence: '#9a8a7a' }, // Level 3: Field
        { soil: '#604540', crops: ['#3a7a30', '#4a8a40', '#5a9a50', '#6aaa60'], fence: '#aa9a8a' }, // Level 4: Plantation
        { soil: '#655045', crops: ['#4a9a40', '#5aaa50', '#6aba60', '#7aca70'], fence: '#bbaaa0', glow: '#aaffaa' } // Level 5: Legendary
    ]
};

// ============= WALL - 5 LEVELS =============
function renderWall(x, y, s, wx, wy, level = 1) {
    const lvl = Math.min(5, Math.max(1, level || 1)) - 1;
    const colors = BUILDING_LEVEL_COLORS.wall[lvl];
    const pattern = seededRandom(wx, wy);
    const pattern2 = seededRandom(wx + 100, wy + 100);

    // Deep shadow for 3D effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(x + 2, y + 2, s, s);

    // Legendary glow effect
    if (lvl === 4) {
        const time = pixelTime || Date.now() / 1000;
        const glowPulse = Math.sin(time * 3) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(170, 204, 255, ${0.3 * glowPulse})`;
        ctx.fillRect(x - 3, y - 3, s + 6, s + 6);
    }

    // Outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x - 1, y - 1, s + 2, s + 2);

    // Main wall base with level-appropriate color
    ctx.fillStyle = colors.main;
    ctx.fillRect(x, y, s, s);

    // Level-specific patterns and details
    if (lvl === 0) {
        // Level 1: Wooden planks
        ctx.fillStyle = colors.dark;
        ctx.fillRect(x, y + s * 0.25, s, 2);
        ctx.fillRect(x, y + s * 0.5, s, 2);
        ctx.fillRect(x, y + s * 0.75, s, 2);
        ctx.fillStyle = colors.light;
        ctx.fillRect(x + 2, y + 3, s * 0.3, 2);
        ctx.fillRect(x + s * 0.5, y + s * 0.3, s * 0.4, 2);
        // Nail heads
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 4, y + s * 0.15, 2, 2);
        ctx.fillRect(x + s - 6, y + s * 0.6, 2, 2);
    } else if (lvl === 1) {
        // Level 2: Reinforced wood with metal bands
        ctx.fillStyle = colors.dark;
        ctx.fillRect(x, y + s * 0.33, s, 2);
        ctx.fillRect(x, y + s * 0.66, s, 2);
        // Metal reinforcement bands
        ctx.fillStyle = '#555';
        ctx.fillRect(x, y + s * 0.1, s, 4);
        ctx.fillRect(x, y + s * 0.85, s, 4);
        ctx.fillStyle = '#777';
        ctx.fillRect(x, y + s * 0.1, s, 1);
        ctx.fillRect(x, y + s * 0.85, s, 1);
        // Rivets
        ctx.fillStyle = '#666';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(x + s * (0.1 + i * 0.25), y + s * 0.11, 3, 3);
            ctx.fillRect(x + s * (0.1 + i * 0.25), y + s * 0.86, 3, 3);
        }
    } else if (lvl === 2) {
        // Level 3: Stone brick pattern
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.fillRect(x, y + s * 0.33, s, 2);
        ctx.fillRect(x, y + s * 0.66, s, 2);
        ctx.fillRect(x + s * 0.5, y, 2, s * 0.33);
        ctx.fillRect(x + s * 0.25, y + s * 0.33, 2, s * 0.33);
        ctx.fillRect(x + s * 0.75, y + s * 0.33, 2, s * 0.33);
        ctx.fillRect(x + s * 0.5, y + s * 0.66, 2, s * 0.34);
        // Stone texture
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(x + 3, y + 3, s * 0.4, 2);
        ctx.fillRect(x + s * 0.55, y + s * 0.36, s * 0.35, 2);
    } else if (lvl === 3) {
        // Level 4: Fortified with battlements
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        for (let row = 0; row < 3; row++) {
            const offset = row % 2 === 0 ? 0 : s * 0.16;
            for (let col = 0; col < 3; col++) {
                ctx.fillRect(x + offset + col * s * 0.32, y + row * s * 0.33, s * 0.28, s * 0.3);
            }
        }
        // Metal reinforcements
        ctx.fillStyle = '#666';
        ctx.fillRect(x, y, s, 3);
        ctx.fillRect(x, y + s - 3, s, 3);
        ctx.fillRect(x, y, 3, s);
        ctx.fillRect(x + s - 3, y, 3, s);
        // Corner plates
        ctx.fillStyle = '#777';
        ctx.fillRect(x, y, 6, 6);
        ctx.fillRect(x + s - 6, y, 6, 6);
        ctx.fillRect(x, y + s - 6, 6, 6);
        ctx.fillRect(x + s - 6, y + s - 6, 6, 6);
    } else {
        // Level 5: Legendary with magical runes
        ctx.fillStyle = colors.dark;
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                ctx.fillRect(x + 2 + col * s * 0.32, y + 2 + row * s * 0.32, s * 0.28, s * 0.28);
            }
        }
        // Glowing runes
        const time = pixelTime || Date.now() / 1000;
        const runeGlow = Math.sin(time * 2) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(170, 204, 255, ${runeGlow})`;
        ctx.fillRect(x + s * 0.45, y + s * 0.1, s * 0.1, s * 0.25);
        ctx.fillRect(x + s * 0.4, y + s * 0.25, s * 0.2, s * 0.05);
        ctx.fillRect(x + s * 0.45, y + s * 0.65, s * 0.1, s * 0.25);
        ctx.fillRect(x + s * 0.4, y + s * 0.7, s * 0.2, s * 0.05);
        // Gold trim
        ctx.fillStyle = '#ccaa44';
        ctx.fillRect(x, y, s, 2);
        ctx.fillRect(x, y + s - 2, s, 2);
        ctx.fillRect(x, y, 2, s);
        ctx.fillRect(x + s - 2, y, 2, s);
    }

    // Weathering (higher levels have less)
    if (pattern > 0.6 + lvl * 0.1) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(x + s * 0.2, y + s * 0.1, 1, s * 0.15);
    }

    // Moss (lower levels only)
    if (lvl < 3 && pattern2 > 0.85) {
        ctx.fillStyle = 'rgba(60, 90, 50, 0.4)';
        ctx.fillRect(x + s * 0.7, y + s * 0.8, 4, 3);
    }

    // Top/bottom edge effects
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(x, y, s, 1);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(x, y + s - 1, s, 1);
}

// ============= TOWER - 5 LEVELS =============
function renderTower(x, y, s, wx, wy, level = 1) {
    const lvl = Math.min(5, Math.max(1, level || 1)) - 1;
    const colors = BUILDING_LEVEL_COLORS.tower[lvl];
    const time = pixelTime || Date.now() / 1000;

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s + 2, s * 0.45, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legendary glow
    if (lvl === 4) {
        const glowPulse = Math.sin(time * 3) * 0.2 + 0.8;
        const glow = ctx.createRadialGradient(x + s / 2, y + s / 2, 0, x + s / 2, y + s / 2, s * 0.8);
        glow.addColorStop(0, `rgba(255, 170, 255, ${0.3 * glowPulse})`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(x - s * 0.2, y - s * 0.3, s * 1.4, s * 1.4);
    }

    // Tower shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x + s * 0.15 + 5, y + s * 0.05 + 5, s * 0.75, s * 0.95);

    // Outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.1, y + s * 0.02, s * 0.8, s);

    // Main tower body
    const towerGrad = ctx.createLinearGradient(x + s * 0.1, 0, x + s * 0.9, 0);
    towerGrad.addColorStop(0, colors.dark);
    towerGrad.addColorStop(0.3, colors.main);
    towerGrad.addColorStop(0.7, colors.main);
    towerGrad.addColorStop(1, colors.dark);
    ctx.fillStyle = towerGrad;
    ctx.fillRect(x + s * 0.13, y + s * 0.08, s * 0.74, s * 0.92);

    // Level-specific tower details
    if (lvl === 0) {
        // Level 1: Basic wooden watchtower
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(x + s * 0.15, y + s * (0.15 + i * 0.16), s * 0.7, 2);
        }
    } else if (lvl >= 1) {
        // Level 2+: Stone brick pattern
        for (let row = 0; row < 5; row++) {
            const offsetX = row % 2 === 0 ? 0 : s * 0.12;
            for (let col = 0; col < 3; col++) {
                const brickX = x + s * 0.16 + offsetX + col * s * 0.24;
                const brickY = y + s * (0.12 + row * 0.17);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                ctx.fillRect(brickX, brickY + s * 0.12, s * 0.2, 2);
                ctx.fillRect(brickX + s * 0.18, brickY, 2, s * 0.14);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.fillRect(brickX, brickY, s * 0.2, 2);
            }
        }
    }

    // Arrow slits (more at higher levels)
    const slitCount = Math.min(lvl + 1, 3);
    for (let i = 0; i < slitCount; i++) {
        const slitY = y + s * (0.3 + i * 0.2);
        ctx.fillStyle = '#3a3a4a';
        ctx.fillRect(x + s * 0.42, slitY, s * 0.16, s * 0.15);
        ctx.fillStyle = '#1a1a2a';
        ctx.fillRect(x + s * 0.44, slitY + 2, s * 0.12, s * 0.11);
    }

    // Battlements (more elaborate at higher levels)
    const battleWidth = s * (0.18 - lvl * 0.01);
    const battleCount = 3 + Math.floor(lvl / 2);
    for (let i = 0; i < battleCount; i++) {
        const bx = x + s * 0.06 + i * (s * 0.88 / battleCount);
        const by = y - s * 0.02 - (i === Math.floor(battleCount / 2) ? s * 0.03 : 0);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(bx + 2, by + 2, battleWidth, s * 0.15);
        ctx.fillStyle = PALETTE.outline;
        ctx.fillRect(bx - 2, by - 2, battleWidth + 4, s * 0.17);
        ctx.fillStyle = colors.light;
        ctx.fillRect(bx, by, battleWidth, s * 0.13);
    }

    // Flag pole and flag
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(x + s * 0.49, y - s * (0.25 + lvl * 0.05), 3, s * (0.3 + lvl * 0.05));

    const flagWave = Math.sin(time * 4) * 2;
    const flagSize = s * (0.12 + lvl * 0.02);
    ctx.fillStyle = colors.flag;
    ctx.beginPath();
    ctx.moveTo(x + s * 0.52, y - s * (0.23 + lvl * 0.05));
    ctx.quadraticCurveTo(x + s * 0.65 + flagWave, y - s * (0.2 + lvl * 0.05), x + s * 0.72, y - s * (0.18 + lvl * 0.05) + flagWave * 0.3);
    ctx.lineTo(x + s * 0.72, y - s * (0.08 + lvl * 0.05) + flagWave * 0.3);
    ctx.quadraticCurveTo(x + s * 0.65 + flagWave * 0.5, y - s * (0.11 + lvl * 0.05), x + s * 0.52, y - s * (0.13 + lvl * 0.05));
    ctx.closePath();
    ctx.fill();

    // Flag emblem (varies by level)
    ctx.fillStyle = '#ffcc00';
    if (lvl === 4) {
        // Star for legendary
        ctx.beginPath();
        const cx = x + s * 0.6;
        const cy = y - s * 0.17;
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const r = i % 2 === 0 ? 4 : 2;
            ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
    } else {
        ctx.fillRect(x + s * 0.58, y - s * (0.19 + lvl * 0.05), 4, 4);
    }

    // Magical particles for legendary
    if (lvl === 4) {
        for (let i = 0; i < 5; i++) {
            const px = x + s * 0.2 + Math.sin(time * 2 + i) * s * 0.3;
            const py = y + s * 0.3 + Math.cos(time * 2 + i * 1.5) * s * 0.3;
            ctx.fillStyle = `rgba(255, 170, 255, ${0.5 + Math.sin(time * 3 + i) * 0.3})`;
            ctx.fillRect(px, py, 3, 3);
        }
    }

    // Base stones
    ctx.fillStyle = colors.dark;
    ctx.fillRect(x + s * 0.08, y + s * 0.85, s * 0.84, s * 0.15);
}

// ============= CANNON - 5 LEVELS =============
function renderCannon(x, y, s, wx, wy, level = 1) {
    const lvl = Math.min(5, Math.max(1, level || 1)) - 1;
    const colors = BUILDING_LEVEL_COLORS.cannon[lvl];
    const time = pixelTime || Date.now() / 1000;

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s * 0.92, s * 0.45, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legendary glow
    if (lvl === 4) {
        const glowPulse = Math.sin(time * 3) * 0.2 + 0.8;
        const glow = ctx.createRadialGradient(x + s / 2, y + s * 0.4, 0, x + s / 2, y + s * 0.4, s * 0.6);
        glow.addColorStop(0, `rgba(170, 204, 255, ${0.3 * glowPulse})`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(x - s * 0.1, y - s * 0.1, s * 1.2, s * 1.2);
    }

    // Platform
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + s * 0.08 + 3, y + s * 0.58 + 3, s * 0.84, s * 0.4);
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.06, y + s * 0.55, s * 0.88, s * 0.44);
    ctx.fillStyle = colors.platform;
    ctx.fillRect(x + s * 0.08, y + s * 0.58, s * 0.84, s * 0.38);

    // Platform details vary by level
    if (lvl >= 2) {
        ctx.fillStyle = colors.metal;
        ctx.fillRect(x + s * 0.1, y + s * 0.6, s * 0.8, 3);
        ctx.fillRect(x + s * 0.1, y + s * 0.85, s * 0.8, 3);
    }

    // Wheels (size increases with level)
    const wheelRadius = s * (0.12 + lvl * 0.01);
    const wheelPositions = [x + s * 0.22, x + s * 0.78];
    wheelPositions.forEach(wx => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(wx + 2, y + s * 0.82 + 2, wheelRadius + 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = PALETTE.outline;
        ctx.beginPath();
        ctx.arc(wx, y + s * 0.82, wheelRadius + 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = colors.platform;
        ctx.beginPath();
        ctx.arc(wx, y + s * 0.82, wheelRadius, 0, Math.PI * 2);
        ctx.fill();

        // Wheel spokes (more at higher levels)
        ctx.fillStyle = colors.metal;
        const spokeCount = 4 + lvl;
        for (let i = 0; i < spokeCount; i++) {
            const angle = (i / spokeCount) * Math.PI * 2;
            ctx.save();
            ctx.translate(wx, y + s * 0.82);
            ctx.rotate(angle);
            ctx.fillRect(-1, -wheelRadius, 2, wheelRadius * 2);
            ctx.restore();
        }

        ctx.fillStyle = '#3a3a3a';
        ctx.beginPath();
        ctx.arc(wx, y + s * 0.82, s * 0.03, 0, Math.PI * 2);
        ctx.fill();
    });

    // Cannon barrel (larger at higher levels)
    const barrelWidth = s * (0.4 + lvl * 0.03);
    const barrelHeight = s * (0.3 + lvl * 0.02);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + s * 0.5 - barrelWidth / 2 + 3, y + s * 0.2 + 3, barrelWidth, barrelHeight);

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.5 - barrelWidth / 2 - 3, y + s * 0.18, barrelWidth + 6, barrelHeight + 4);

    const barrelGrad = ctx.createLinearGradient(x, y + s * 0.2, x, y + s * 0.2 + barrelHeight);
    barrelGrad.addColorStop(0, colors.metal);
    barrelGrad.addColorStop(0.3, colors.barrel);
    barrelGrad.addColorStop(0.7, colors.barrel);
    barrelGrad.addColorStop(1, colors.metal);
    ctx.fillStyle = barrelGrad;
    ctx.fillRect(x + s * 0.5 - barrelWidth / 2, y + s * 0.2, barrelWidth, barrelHeight);

    // Barrel bands (more at higher levels)
    ctx.fillStyle = colors.metal;
    for (let i = 0; i <= lvl; i++) {
        const bandY = y + s * 0.22 + i * (barrelHeight / (lvl + 2));
        ctx.fillRect(x + s * 0.5 - barrelWidth / 2, bandY, barrelWidth, 3);
    }

    // Muzzle (more ornate at higher levels)
    const muzzleWidth = s * (0.2 + lvl * 0.02);
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.5 - muzzleWidth / 2, y + s * 0.04, muzzleWidth, s * 0.18);
    ctx.fillStyle = colors.barrel;
    ctx.fillRect(x + s * 0.5 - muzzleWidth / 2 + 2, y + s * 0.06, muzzleWidth - 4, s * 0.14);

    if (lvl >= 3) {
        // Ornate muzzle ring
        ctx.fillStyle = lvl === 4 ? '#ccaa44' : colors.metal;
        ctx.fillRect(x + s * 0.5 - muzzleWidth / 2 - 2, y + s * 0.04, muzzleWidth + 4, 4);
    }

    // Muzzle opening
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + s * 0.5 - muzzleWidth / 4, y, muzzleWidth / 2, s * 0.08);

    // Magical runes for legendary
    if (lvl === 4) {
        const runeGlow = Math.sin(time * 2) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(170, 204, 255, ${runeGlow})`;
        ctx.fillRect(x + s * 0.35, y + s * 0.28, 4, barrelHeight * 0.6);
        ctx.fillRect(x + s * 0.61, y + s * 0.28, 4, barrelHeight * 0.6);
    }

    // Cannonballs (more at higher levels)
    for (let i = 0; i <= lvl; i++) {
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.arc(x + s * (0.82 + i * 0.04), y + s * (0.68 + (i % 2) * 0.08), s * 0.05, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ============= CAMPFIRE - 5 LEVELS =============
function renderCampfire(x, y, s, wx, wy, level = 1) {
    const lvl = Math.min(5, Math.max(1, level || 1)) - 1;
    const time = pixelTime || Date.now() / 1000;

    // Ground scorch (larger at higher levels)
    ctx.fillStyle = 'rgba(30, 20, 15, 0.5)';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s / 2 + s * 0.15, s * (0.4 + lvl * 0.05), s * (0.25 + lvl * 0.03), 0, 0, Math.PI * 2);
    ctx.fill();

    // Ambient glow (stronger at higher levels)
    const glowIntensity = 0.25 + lvl * 0.08;
    const glowSize = s * (0.6 + lvl * 0.1);
    const pulseGlow = Math.sin(time * 4) * 0.15 + 0.85;
    const groundGlow = ctx.createRadialGradient(
        x + s / 2, y + s / 2, 0,
        x + s / 2, y + s / 2, glowSize * pulseGlow
    );
    groundGlow.addColorStop(0, `rgba(255, 100, 20, ${glowIntensity})`);
    groundGlow.addColorStop(0.5, `rgba(255, 50, 0, ${glowIntensity * 0.5})`);
    groundGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = groundGlow;
    ctx.fillRect(x - s * 0.3, y - s * 0.3, s * 1.6, s * 1.6);

    // Stone ring (more stones at higher levels)
    const stoneCount = 8 + lvl * 2;
    for (let i = 0; i < stoneCount; i++) {
        const angle = (i / stoneCount) * Math.PI * 2 + 0.15;
        const dist = s * (0.35 + lvl * 0.02);
        const stoneX = x + s / 2 + Math.cos(angle) * dist;
        const stoneY = y + s / 2 + Math.sin(angle) * dist * 0.7;
        const stoneW = 6 + seededRandom(i, 1) * 3 + lvl;
        const stoneH = 4 + seededRandom(i, 2) * 2 + lvl * 0.5;

        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(stoneX - stoneW / 2 + 1, stoneY - stoneH / 2 + 1, stoneW, stoneH);

        const stoneShade = 0.5 + seededRandom(i, 3) * 0.3;
        ctx.fillStyle = lvl >= 3 ? `rgb(${Math.floor(80 * stoneShade)}, ${Math.floor(75 * stoneShade)}, ${Math.floor(90 * stoneShade)})` :
            `rgb(${Math.floor(70 * stoneShade)}, ${Math.floor(65 * stoneShade)}, ${Math.floor(60 * stoneShade)})`;
        ctx.fillRect(stoneX - stoneW / 2, stoneY - stoneH / 2, stoneW, stoneH);

        ctx.fillStyle = 'rgba(255, 150, 50, 0.2)';
        ctx.fillRect(stoneX - stoneW / 2, stoneY - stoneH / 2, stoneW - 1, 1);
    }

    // Ash bed
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s / 2 + s * 0.05, s * 0.22 + lvl * 0.02, s * 0.12 + lvl * 0.01, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing embers (more at higher levels)
    for (let i = 0; i < 4 + lvl * 2; i++) {
        const emberPhase = (time * 2 + i * 1.5) % 3;
        if (emberPhase < 2) {
            const ex = x + s * 0.32 + seededRandom(i, 10) * s * 0.36;
            const ey = y + s * 0.42 + seededRandom(i, 11) * s * 0.18;
            ctx.fillStyle = emberPhase < 1 ? '#ff6600' : '#ff3300';
            ctx.globalAlpha = 0.8 - emberPhase * 0.3;
            ctx.fillRect(ex, ey, 2, 2);
            ctx.globalAlpha = 1;
        }
    }

    // Logs (more elaborate at higher levels)
    const logCount = 2 + Math.floor(lvl / 2);
    for (let i = 0; i < logCount; i++) {
        const angle = (i / logCount) * Math.PI + Math.PI / 4;
        ctx.save();
        ctx.translate(x + s / 2, y + s / 2);
        ctx.rotate(angle);
        ctx.fillStyle = '#3d2817';
        ctx.fillRect(-s * 0.28, -s * 0.05, s * 0.56, s * 0.1);
        ctx.fillStyle = '#5a4030';
        ctx.fillRect(-s * 0.28, -s * 0.05, s * 0.56, 2);
        ctx.restore();
    }

    // Flames (larger at higher levels)
    const flameHeight = s * (0.35 + lvl * 0.06);
    const f1 = Math.sin(time * 12) * 2.5;
    const f2 = Math.cos(time * 15 + 1) * 2;
    const f3 = Math.sin(time * 9 + 2) * 1.5;

    ctx.fillStyle = '#cc2200';
    drawFlame(ctx, x + s / 2 - 3, y + s * 0.62, s * 0.15, flameHeight * 0.8 + f3, f1 * 0.5);
    drawFlame(ctx, x + s / 2 + 4, y + s * 0.62, s * 0.12, flameHeight * 0.7 + f2, -f1 * 0.3);

    ctx.fillStyle = '#ff4400';
    drawFlame(ctx, x + s / 2, y + s * 0.6, s * (0.18 + lvl * 0.02), flameHeight + f1, f2);

    ctx.fillStyle = '#ff7700';
    drawFlame(ctx, x + s / 2, y + s * 0.58, s * (0.14 + lvl * 0.015), flameHeight * 0.85 + f2, f1 * 0.6);

    ctx.fillStyle = '#ffaa00';
    drawFlame(ctx, x + s / 2, y + s * 0.56, s * 0.1, flameHeight * 0.7 + f1 * 0.5, f3);

    ctx.fillStyle = '#ffdd44';
    drawFlame(ctx, x + s / 2, y + s * 0.54, s * 0.06, flameHeight * 0.5 + f2 * 0.4, 0);

    // Hot core
    ctx.fillStyle = '#ffffaa';
    ctx.globalAlpha = 0.7 + Math.sin(time * 18) * 0.3;
    ctx.fillRect(x + s * 0.46, y + s * 0.48, s * 0.08, s * 0.08);
    ctx.globalAlpha = 1;

    // Magical flames for legendary
    if (lvl === 4) {
        ctx.fillStyle = `rgba(100, 200, 255, ${0.5 + Math.sin(time * 5) * 0.3})`;
        drawFlame(ctx, x + s / 2 - 5, y + s * 0.55, s * 0.08, flameHeight * 0.6, f1);
        drawFlame(ctx, x + s / 2 + 5, y + s * 0.55, s * 0.08, flameHeight * 0.6, -f2);
    }

    // Sparks (more at higher levels)
    for (let i = 0; i < 4 + lvl * 2; i++) {
        const sparkLife = (time * 3 + i * 0.8) % 3;
        if (sparkLife < 2.5) {
            const sparkX = x + s * 0.5 + Math.sin(time * 5 + i * 2) * s * (0.12 + lvl * 0.02);
            const sparkY = y + s * 0.35 - sparkLife * s * 0.15;
            const sparkSize = sparkLife < 1 ? 2 : 1;
            ctx.fillStyle = i % 2 === 0 ? '#ffcc00' : '#ff8800';
            ctx.globalAlpha = 1 - sparkLife * 0.4;
            ctx.fillRect(sparkX, sparkY, sparkSize, sparkSize);
            ctx.globalAlpha = 1;
        }
    }

    // Smoke
    ctx.globalAlpha = 0.12 + lvl * 0.02;
    for (let i = 0; i < 3 + lvl; i++) {
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

    // Cooking pot for level 3+
    if (lvl >= 2) {
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.arc(x + s * 0.7, y + s * 0.55, s * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3a3a3a';
        ctx.beginPath();
        ctx.arc(x + s * 0.7, y + s * 0.55, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
        // Steam
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 2; i++) {
            const steamY = y + s * 0.45 - (time * 10 + i * 8) % 15;
            ctx.fillRect(x + s * 0.68 + Math.sin(time * 3 + i) * 2, steamY, 3, 3);
        }
        ctx.globalAlpha = 1;
    }
}

// Enhanced Flame Helper
function drawFlame(ctx, cx, bottomY, width, height, offset) {
    ctx.beginPath();
    ctx.moveTo(cx - width, bottomY);
    ctx.quadraticCurveTo(cx - width * 0.8 + offset * 0.5, bottomY - height * 0.3, cx - width * 0.3 + offset, bottomY - height * 0.6);
    ctx.quadraticCurveTo(cx + offset * 0.5, bottomY - height * 1.1, cx, bottomY - height);
    ctx.quadraticCurveTo(cx - offset * 0.5, bottomY - height * 1.1, cx + width * 0.3 + offset, bottomY - height * 0.6);
    ctx.quadraticCurveTo(cx + width * 0.8 + offset * 0.5, bottomY - height * 0.3, cx + width, bottomY);
    ctx.closePath();
    ctx.fill();
}

// ============= HOUSE - 5 LEVELS =============
function renderHouse(x, y, s, wx, wy, level = 1) {
    const lvl = Math.min(5, Math.max(1, level || 1)) - 1;
    const colors = BUILDING_LEVEL_COLORS.house[lvl];
    const time = pixelTime || Date.now() / 1000;
    const s2 = s * 2;

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + s2 / 2, y + s2 + 4, s2 * (0.5 + lvl * 0.03), s2 * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legendary glow
    if (lvl === 4) {
        const glowPulse = Math.sin(time * 3) * 0.2 + 0.8;
        const glow = ctx.createRadialGradient(x + s2 / 2, y + s2 / 2, 0, x + s2 / 2, y + s2 / 2, s2 * 0.8);
        glow.addColorStop(0, `rgba(170, 204, 255, ${0.25 * glowPulse})`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(x - s2 * 0.2, y - s2 * 0.2, s2 * 1.4, s2 * 1.4);
    }

    // Building shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + 6, y + s2 * 0.28 + 6, s2 + lvl * 4, s2 * 0.72);

    // Main building outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x - 2, y + s2 * 0.25, s2 + 4 + lvl * 2, s2 * 0.77);

    // Main building body
    const wallGradient = ctx.createLinearGradient(x, 0, x + s2, 0);
    wallGradient.addColorStop(0, colors.wall);
    wallGradient.addColorStop(0.5, `hsl(${lvl * 10 + 30}, 15%, ${55 + lvl * 3}%)`);
    wallGradient.addColorStop(1, colors.wall);
    ctx.fillStyle = wallGradient;
    ctx.fillRect(x, y + s2 * 0.28, s2 + lvl * 2, s2 * 0.72);

    // Wall details based on level
    if (lvl === 0) {
        // Level 1: Simple planks
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(x + 2, y + s2 * 0.32 + i * s2 * 0.13, s2 - 4, 1);
        }
    } else if (lvl >= 1 && lvl < 4) {
        // Level 2-4: Better planks with highlights
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(x + 2, y + s2 * 0.32 + i * s2 * 0.11, s2 - 4 + lvl * 2, 1);
        }
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(x + 2, y + s2 * 0.33 + i * s2 * 0.11, s2 - 4 + lvl * 2, 1);
        }
    } else {
        // Level 5: Stone/marble walls
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let row = 0; row < 4; row++) {
            const offset = row % 2 === 0 ? 0 : s2 * 0.15;
            for (let col = 0; col < 4; col++) {
                ctx.fillRect(x + 4 + offset + col * s2 * 0.25, y + s2 * 0.32 + row * s2 * 0.16, s2 * 0.22, s2 * 0.14);
            }
        }
    }

    // Roof - changes shape with level
    const roofOverhang = 8 + lvl * 2;
    const roofPeak = 10 + lvl * 3;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.moveTo(x - roofOverhang + 4, y + s2 * 0.32);
    ctx.lineTo(x + s2 / 2 + lvl, y - roofPeak + 6);
    ctx.lineTo(x + s2 + roofOverhang + lvl * 2 - 4, y + s2 * 0.32);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.moveTo(x - roofOverhang - 4, y + s2 * 0.34);
    ctx.lineTo(x + s2 / 2 + lvl, y - roofPeak - 4);
    ctx.lineTo(x + s2 + roofOverhang + lvl * 2 + 4, y + s2 * 0.34);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = colors.roof;
    ctx.beginPath();
    ctx.moveTo(x - roofOverhang, y + s2 * 0.3);
    ctx.lineTo(x + s2 / 2 + lvl, y - roofPeak);
    ctx.lineTo(x + s2 + roofOverhang + lvl * 2, y + s2 * 0.3);
    ctx.closePath();
    ctx.fill();

    // Roof tiles (more elaborate at higher levels)
    if (lvl >= 1) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        for (let row = 0; row < 2 + lvl; row++) {
            const rowY = y + s2 * 0.08 + row * s2 * (0.07 - lvl * 0.005);
            const rowWidth = s2 * (0.3 + row * 0.15);
            const startX = x + s2 / 2 + lvl - rowWidth / 2;
            for (let i = 0; i < 3 + row + lvl; i++) {
                ctx.fillRect(startX + i * (rowWidth / (3 + row + lvl)), rowY, 1, s2 * 0.06);
            }
        }
    }

    // Chimney (bigger at higher levels)
    const chimneyWidth = s2 * (0.12 + lvl * 0.02);
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s2 * 0.7 - 2, y - roofPeak * 0.5 - 2, chimneyWidth + 4, s2 * 0.18 + lvl * 2);
    ctx.fillStyle = lvl >= 3 ? '#5a5a6a' : '#5a4a4a';
    ctx.fillRect(x + s2 * 0.7, y - roofPeak * 0.5, chimneyWidth, s2 * 0.16 + lvl * 2);

    // Chimney smoke
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 2 + lvl; i++) {
        const smokeY = y - roofPeak * 0.5 - 8 - (time * 15 + i * 12) % 30;
        const smokeX = x + s2 * 0.7 + chimneyWidth / 2 + Math.sin(time * 2 + i) * 3;
        ctx.fillStyle = '#aaaaaa';
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, 4 + i * 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Door
    const doorWidth = s2 * (0.2 + lvl * 0.02);
    const doorHeight = s2 * (0.4 + lvl * 0.02);
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s2 * 0.4 - 2, y + s2 * 0.98 - doorHeight - 2, doorWidth + 4, doorHeight + 4);
    ctx.fillStyle = colors.door;
    ctx.fillRect(x + s2 * 0.4, y + s2 * 0.98 - doorHeight, doorWidth, doorHeight);

    // Door panels (more elaborate at higher levels)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    const panelCount = 2 + Math.floor(lvl / 2);
    for (let i = 0; i < panelCount; i++) {
        ctx.fillRect(x + s2 * 0.42, y + s2 * 0.98 - doorHeight + doorHeight * (0.1 + i * 0.35 / panelCount), doorWidth * 0.35, doorHeight * 0.25 / panelCount);
        ctx.fillRect(x + s2 * 0.4 + doorWidth * 0.55, y + s2 * 0.98 - doorHeight + doorHeight * (0.1 + i * 0.35 / panelCount), doorWidth * 0.35, doorHeight * 0.25 / panelCount);
    }

    // Door handle
    ctx.fillStyle = lvl >= 3 ? '#ccaa44' : '#aa8844';
    ctx.fillRect(x + s2 * 0.4 + doorWidth * 0.75, y + s2 * 0.98 - doorHeight * 0.5, s2 * 0.03, s2 * 0.06);

    // Windows (more at higher levels)
    const windowCount = 1 + Math.floor(lvl / 2);
    const winSize = s2 * (0.14 + lvl * 0.01);

    for (let w = 0; w < windowCount; w++) {
        const winX = w === 0 ? x + s2 * 0.08 : x + s2 * 0.7 + (w - 1) * s2 * 0.15;
        const lit = w === 0 || Math.sin(time + w) > 0;

        ctx.fillStyle = PALETTE.outline;
        ctx.fillRect(winX - 3, y + s2 * 0.38 - 3, winSize + 6, winSize + 6);
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(winX - 2, y + s2 * 0.38 - 2, winSize + 4, winSize + 4);

        if (lit) {
            const glowGrad = ctx.createRadialGradient(
                winX + winSize / 2, y + s2 * 0.38 + winSize / 2, 0,
                winX + winSize / 2, y + s2 * 0.38 + winSize / 2, winSize
            );
            glowGrad.addColorStop(0, lvl === 4 ? '#aaccff' : '#ffeeaa');
            glowGrad.addColorStop(1, lvl === 4 ? '#6699cc' : '#ddaa44');
            ctx.fillStyle = glowGrad;
        } else {
            ctx.fillStyle = '#6699bb';
        }
        ctx.fillRect(winX, y + s2 * 0.38, winSize, winSize);

        // Window cross frame
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(winX + winSize / 2 - 1.5, y + s2 * 0.38, 3, winSize);
        ctx.fillRect(winX, y + s2 * 0.38 + winSize / 2 - 1.5, winSize, 3);
    }

    // Foundation
    ctx.fillStyle = lvl >= 3 ? '#6a6a7a' : '#5a5a5a';
    ctx.fillRect(x, y + s2 * 0.92, s2 + lvl * 2, s2 * 0.08);

    // Decorations for higher levels
    if (lvl >= 2) {
        // Flower boxes
        ctx.fillStyle = '#6a4a3a';
        ctx.fillRect(x + s2 * 0.06, y + s2 * 0.54, winSize + 4, 4);
        ctx.fillStyle = '#ff6699';
        ctx.fillRect(x + s2 * 0.08, y + s2 * 0.52, 4, 4);
        ctx.fillRect(x + s2 * 0.13, y + s2 * 0.51, 4, 5);
        ctx.fillRect(x + s2 * 0.18, y + s2 * 0.52, 4, 4);
    }

    if (lvl >= 3) {
        // Lanterns
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(x + s2 * 0.35, y + s2 * 0.45, 4, 8);
        ctx.fillStyle = '#ffcc66';
        ctx.globalAlpha = 0.8 + Math.sin(time * 5) * 0.2;
        ctx.fillRect(x + s2 * 0.34, y + s2 * 0.42, 6, 5);
        ctx.globalAlpha = 1;
    }
}

// ============= FARM - 5 LEVELS =============
function renderFarm(x, y, s, wx, wy, level = 1) {
    const lvl = Math.min(5, Math.max(1, level || 1)) - 1;
    const colors = BUILDING_LEVEL_COLORS.farm[lvl];
    const time = pixelTime || Date.now() / 1000;

    // Tilled soil base
    ctx.fillStyle = colors.soil;
    ctx.fillRect(x, y, s, s);

    // Soil texture (richer at higher levels)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (seededRandom(i, j) > 0.5 - lvl * 0.05) {
                ctx.fillRect(x + i * s / 8, y + j * s / 8, 2, 2);
            }
        }
    }

    // Soil rows (more at higher levels)
    const rowCount = 2 + lvl;
    for (let i = 0; i < rowCount; i++) {
        const rowY = y + s * (0.1 + i * (0.8 / rowCount));
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(x + s * 0.08, rowY + 3, s * 0.84, s * (0.6 / rowCount));
        ctx.fillStyle = `hsl(25, ${40 + lvl * 5}%, ${35 + lvl * 3}%)`;
        ctx.fillRect(x + s * 0.08, rowY, s * 0.84, s * (0.6 / rowCount));
        ctx.fillStyle = `hsl(25, ${45 + lvl * 5}%, ${40 + lvl * 3}%)`;
        ctx.fillRect(x + s * 0.08, rowY, s * 0.84, 2);
    }

    // Irrigation for level 2+
    if (lvl >= 1) {
        ctx.fillStyle = 'rgba(70, 130, 180, 0.4)';
        ctx.beginPath();
        ctx.ellipse(x + s * 0.1, y + s * 0.9, s * (0.06 + lvl * 0.01), s * 0.04, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(150, 200, 255, 0.3)';
        ctx.fillRect(x + s * 0.06, y + s * 0.88, 3, 2);
    }

    // Crops with growth stages
    for (let i = 0; i < rowCount; i++) {
        const rowY = y + s * (0.1 + i * (0.8 / rowCount));
        const growthStage = (Math.sin(time * 0.5 + i) + 1) / 2;
        const cropSway = Math.sin(time * 2.5 + i) * 1.5;

        const cropsPerRow = 4 + lvl;
        for (let j = 0; j < cropsPerRow; j++) {
            const cropX = x + s * 0.1 + j * (s * 0.8 / cropsPerRow);
            const cropSwayOffset = cropSway * (j % 2 === 0 ? 1 : -1);
            const cropHeight = s * (0.1 + growthStage * (0.06 + lvl * 0.01));

            // Stem
            ctx.fillStyle = '#2a5a20';
            ctx.fillRect(cropX + cropSwayOffset, rowY - cropHeight, 2, cropHeight);

            // Leaves
            const cropColor = colors.crops[j % colors.crops.length];
            ctx.fillStyle = cropColor;
            ctx.fillRect(cropX - 3 + cropSwayOffset * 0.5, rowY - cropHeight * 0.8, 4, 3);
            ctx.fillRect(cropX + 1 + cropSwayOffset * 0.5, rowY - cropHeight * 0.6, 4, 3);
            ctx.fillRect(cropX - 2 + cropSwayOffset, rowY - cropHeight - 2, 6, 4);

            // Crop head (varies by level)
            if (growthStage > 0.4) {
                if (lvl >= 3) {
                    // Golden crops for high level
                    ctx.fillStyle = '#dda844';
                    ctx.fillRect(cropX - 2 + cropSwayOffset, rowY - cropHeight - 5, 6, 5);
                } else {
                    ctx.fillStyle = '#c4a44a';
                    ctx.fillRect(cropX - 1 + cropSwayOffset, rowY - cropHeight - 4, 4, 4);
                }
            }
        }
    }

    // Fence (better quality at higher levels)
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x, y, 5, s * (0.15 + lvl * 0.02));
    ctx.fillRect(x + s - 5, y, 5, s * (0.15 + lvl * 0.02));
    ctx.fillStyle = colors.fence;
    ctx.fillRect(x + 1, y + 1, 3, s * (0.13 + lvl * 0.02));
    ctx.fillRect(x + s - 4, y + 1, 3, s * (0.13 + lvl * 0.02));

    // Fence rail
    ctx.fillStyle = colors.fence;
    ctx.fillRect(x, y + s * 0.06, s, 3);

    // Scarecrow for level 3+
    if (lvl >= 2) {
        const scX = x + s * 0.85;
        const scY = y + s * 0.3;
        // Post
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(scX, scY, 3, s * 0.5);
        // Arms
        ctx.fillRect(scX - 6, scY + 5, 15, 2);
        // Head
        ctx.fillStyle = '#c4a44a';
        ctx.beginPath();
        ctx.arc(scX + 1.5, scY - 3, 5, 0, Math.PI * 2);
        ctx.fill();
        // Hat
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(scX - 4, scY - 10, 11, 3);
        ctx.fillRect(scX - 2, scY - 15, 7, 6);
    }

    // Magical sparkles for legendary
    if (lvl === 4) {
        for (let i = 0; i < 5; i++) {
            const px = x + s * (0.2 + Math.sin(time + i) * 0.3);
            const py = y + s * (0.3 + Math.cos(time * 1.5 + i) * 0.2);
            ctx.fillStyle = `rgba(170, 255, 170, ${0.5 + Math.sin(time * 3 + i) * 0.3})`;
            ctx.fillRect(px, py, 2, 2);
        }
    }
}

// ============= WORKBENCH - 5 LEVELS =============
function renderWorkbench(x, y, s, wx, wy, level = 1) {
    const lvl = Math.min(5, Math.max(1, level || 1)) - 1;
    const time = pixelTime || Date.now() / 1000;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + s * 0.08 + 3, y + s * 0.35 + 3, s * 0.88, s * 0.65);

    // Legendary glow
    if (lvl === 4) {
        const glowPulse = Math.sin(time * 3) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(255, 200, 100, ${0.2 * glowPulse})`;
        ctx.fillRect(x - 5, y - 5, s + 10, s + 10);
    }

    // Back panel (taller at higher levels)
    const panelHeight = s * (0.18 + lvl * 0.03);
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.04, y + s * 0.1, s * 0.92, panelHeight + 4);
    ctx.fillStyle = `hsl(25, ${30 + lvl * 5}%, ${40 + lvl * 3}%)`;
    ctx.fillRect(x + s * 0.06, y + s * 0.12, s * 0.88, panelHeight);

    // Pegboard holes (more organized at higher levels)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    const holeRows = 2 + Math.floor(lvl / 2);
    for (let i = 0; i < 5 + lvl; i++) {
        for (let j = 0; j < holeRows; j++) {
            ctx.fillRect(x + s * (0.12 + i * 0.12), y + s * (0.14 + j * 0.06), 3, 3);
        }
    }

    // Legs (sturdier at higher levels)
    const legWidth = s * (0.1 + lvl * 0.01);
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.08, y + s * 0.5, legWidth + 4, s * 0.52);
    ctx.fillRect(x + s * 0.88 - legWidth, y + s * 0.5, legWidth + 4, s * 0.52);
    ctx.fillStyle = `hsl(25, 25%, ${35 + lvl * 2}%)`;
    ctx.fillRect(x + s * 0.1, y + s * 0.52, legWidth, s * 0.48);
    ctx.fillRect(x + s * 0.9 - legWidth, y + s * 0.52, legWidth, s * 0.48);

    // Cross brace for level 2+
    if (lvl >= 1) {
        ctx.fillStyle = `hsl(25, 20%, ${30 + lvl * 2}%)`;
        ctx.fillRect(x + s * 0.18, y + s * 0.78, s * 0.64, s * (0.04 + lvl * 0.01));
    }

    // Drawers for level 3+
    if (lvl >= 2) {
        const drawerCount = 1 + Math.floor((lvl - 2) / 2);
        for (let d = 0; d < drawerCount; d++) {
            const drawerX = x + s * 0.3 + d * s * 0.25;
            ctx.fillStyle = PALETTE.outline;
            ctx.fillRect(drawerX, y + s * 0.52, s * 0.2, s * 0.14);
            ctx.fillStyle = `hsl(25, 25%, ${40 + lvl * 2}%)`;
            ctx.fillRect(drawerX + 2, y + s * 0.54, s * 0.16, s * 0.1);
            ctx.fillStyle = lvl === 4 ? '#ccaa44' : '#8a7a6a';
            ctx.fillRect(drawerX + s * 0.07, y + s * 0.58, s * 0.06, s * 0.03);
        }
    }

    // Table top
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x, y + s * 0.28, s, s * 0.25);
    const topGrad = ctx.createLinearGradient(x, y + s * 0.3, x + s, y + s * 0.3);
    topGrad.addColorStop(0, `hsl(25, ${25 + lvl * 3}%, ${45 + lvl * 3}%)`);
    topGrad.addColorStop(0.5, `hsl(25, ${25 + lvl * 3}%, ${52 + lvl * 3}%)`);
    topGrad.addColorStop(1, `hsl(25, ${25 + lvl * 3}%, ${45 + lvl * 3}%)`);
    ctx.fillStyle = topGrad;
    ctx.fillRect(x + s * 0.02, y + s * 0.3, s * 0.96, s * 0.2);

    // Wood grain
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(x + s * 0.08, y + s * 0.36, s * 0.35, 2);
    ctx.fillRect(x + s * 0.5, y + s * 0.4, s * 0.4, 2);

    // Top edge highlight
    ctx.fillStyle = `hsl(25, ${20 + lvl * 3}%, ${55 + lvl * 3}%)`;
    ctx.fillRect(x + s * 0.02, y + s * 0.3, s * 0.96, 2);

    // Tools on pegboard (more at higher levels)
    // Hammer
    ctx.fillStyle = '#666666';
    ctx.fillRect(x + s * 0.12, y + s * 0.05, s * 0.1, s * 0.2);
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(x + s * 0.15, y + s * 0.15, s * 0.04, s * 0.18);

    // Saw (level 2+)
    if (lvl >= 1) {
        ctx.fillStyle = '#aaaaaa';
        ctx.fillRect(x + s * 0.55, y + s * 0.02, s * 0.25, s * 0.08);
        ctx.fillStyle = '#5a4030';
        ctx.fillRect(x + s * 0.76, y, s * 0.1, s * 0.2);
    }

    // Additional tools for higher levels
    if (lvl >= 2) {
        // Wrench
        ctx.fillStyle = '#707070';
        ctx.fillRect(x + s * 0.28, y + s * 0.06, s * 0.15, s * 0.05);
    }

    if (lvl >= 3) {
        // Pliers
        ctx.fillStyle = '#606060';
        ctx.fillRect(x + s * 0.4, y + s * 0.08, s * 0.08, s * 0.12);
    }

    // Items on table (more at higher levels)
    // Nails
    ctx.fillStyle = '#888888';
    for (let i = 0; i < 2 + lvl; i++) {
        ctx.fillRect(x + s * (0.22 + i * 0.03), y + s * 0.34 + (i % 2) * 2, 1, 5);
    }

    // Wood plank
    ctx.fillStyle = '#9a8a6a';
    ctx.fillRect(x + s * 0.4, y + s * 0.33, s * (0.18 + lvl * 0.02), s * 0.08);

    // Blueprint for level 4+
    if (lvl >= 3) {
        ctx.fillStyle = '#6688aa';
        ctx.fillRect(x + s * 0.65, y + s * 0.32, s * 0.2, s * 0.14);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + s * 0.67, y + s * 0.35, s * 0.04, s * 0.02);
        ctx.fillRect(x + s * 0.73, y + s * 0.38, s * 0.06, s * 0.02);
        ctx.fillRect(x + s * 0.68, y + s * 0.42, s * 0.1, s * 0.02);
    }

    // Magical tools glow for legendary
    if (lvl === 4) {
        ctx.fillStyle = `rgba(255, 200, 100, ${0.4 + Math.sin(time * 3) * 0.2})`;
        ctx.fillRect(x + s * 0.11, y + s * 0.04, s * 0.12, s * 0.22);
    }
}

// ============= CHEST - 5 LEVELS =============
function renderChest(x, y, s, wx, wy, level = 1) {
    const lvl = Math.min(5, Math.max(1, level || 1)) - 1;
    const time = pixelTime || Date.now() / 1000;

    // Colors based on level
    const chestColors = [
        { body: '#6a4525', lid: '#7a5535', metal: '#555555', lock: '#aa8833' }, // Wood
        { body: '#5a5560', lid: '#6a6570', metal: '#666666', lock: '#ccaa44' }, // Iron
        { body: '#7a6a5a', lid: '#8a7a6a', metal: '#888888', lock: '#ddbb55' }, // Silver
        { body: '#8a7050', lid: '#9a8060', metal: '#aa9966', lock: '#eedd66' }, // Gold
        { body: '#607080', lid: '#708090', metal: '#99aacc', lock: '#ffee88', glow: '#aaccff' } // Legendary
    ];
    const colors = chestColors[lvl];

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s * 0.95, s * (0.35 + lvl * 0.02), s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legendary glow
    if (lvl === 4) {
        const glowPulse = Math.sin(time * 3) * 0.2 + 0.8;
        const glow = ctx.createRadialGradient(x + s / 2, y + s / 2, 0, x + s / 2, y + s / 2, s * 0.7);
        glow.addColorStop(0, `rgba(170, 204, 255, ${0.3 * glowPulse})`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(x - s * 0.2, y - s * 0.2, s * 1.4, s * 1.4);
    }

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + s * 0.12 + 3, y + s * 0.32 + 3, s * 0.76, s * 0.62);

    // Outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.08, y + s * 0.28, s * 0.84, s * 0.68);

    // Chest body
    const bodyGrad = ctx.createLinearGradient(x + s * 0.1, 0, x + s * 0.9, 0);
    bodyGrad.addColorStop(0, colors.body);
    bodyGrad.addColorStop(0.3, colors.lid);
    bodyGrad.addColorStop(0.7, colors.lid);
    bodyGrad.addColorStop(1, colors.body);
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(x + s * 0.12, y + s * 0.42, s * 0.76, s * 0.52);

    // Wood/metal grain on body
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(x + s * 0.15, y + s * 0.5, s * 0.7, 2);
    ctx.fillRect(x + s * 0.15, y + s * 0.65, s * 0.7, 2);
    ctx.fillRect(x + s * 0.15, y + s * 0.8, s * 0.7, 2);

    // Chest lid
    const lidGrad = ctx.createLinearGradient(x, y + s * 0.3, x, y + s * 0.45);
    lidGrad.addColorStop(0, colors.lid);
    lidGrad.addColorStop(1, colors.body);
    ctx.fillStyle = lidGrad;
    ctx.fillRect(x + s * 0.12, y + s * 0.32, s * 0.76, s * 0.14);

    // Lid curve highlight
    ctx.fillStyle = `rgba(255, 255, 255, 0.15)`;
    ctx.fillRect(x + s * 0.15, y + s * 0.34, s * 0.7, 3);

    // Corner reinforcements (more elaborate at higher levels)
    const corners = [
        { cx: x + s * 0.12, cy: y + s * 0.32 },
        { cx: x + s * 0.8, cy: y + s * 0.32 },
        { cx: x + s * 0.12, cy: y + s * 0.86 },
        { cx: x + s * 0.8, cy: y + s * 0.86 }
    ];
    const cornerSize = s * (0.06 + lvl * 0.01);
    corners.forEach(({ cx, cy }) => {
        ctx.fillStyle = colors.metal;
        ctx.fillRect(cx, cy, cornerSize, cornerSize);
        ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;
        ctx.fillRect(cx + 1, cy + 1, cornerSize - 2, cornerSize - 2);
    });

    // Metal bands (more at higher levels)
    ctx.fillStyle = colors.metal;
    ctx.fillRect(x + s * 0.12, y + s * 0.44, s * 0.76, 4);
    ctx.fillRect(x + s * 0.12, y + s * 0.72, s * 0.76, 4);
    if (lvl >= 2) {
        ctx.fillRect(x + s * 0.12, y + s * 0.58, s * 0.76, 3);
    }

    // Band highlights
    ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;
    ctx.fillRect(x + s * 0.15, y + s * 0.44, s * 0.7, 1);
    ctx.fillRect(x + s * 0.15, y + s * 0.72, s * 0.7, 1);

    // Lock plate (larger at higher levels)
    const lockWidth = s * (0.16 + lvl * 0.02);
    const lockHeight = s * (0.14 + lvl * 0.02);
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.5 - lockWidth / 2 - 2, y + s * 0.5, lockWidth + 4, lockHeight + 4);

    // Lock body
    const lockGrad = ctx.createRadialGradient(
        x + s * 0.5, y + s * 0.57, 0,
        x + s * 0.5, y + s * 0.57, lockWidth
    );
    lockGrad.addColorStop(0, colors.lock);
    lockGrad.addColorStop(1, `hsl(45, 70%, ${35 + lvl * 5}%)`);
    ctx.fillStyle = lockGrad;
    ctx.fillRect(x + s * 0.5 - lockWidth / 2, y + s * 0.52, lockWidth, lockHeight);

    // Keyhole
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(x + s * 0.5, y + s * 0.56, s * (0.02 + lvl * 0.003), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + s * 0.49, y + s * 0.57, s * 0.02, s * (0.04 + lvl * 0.005));

    // Decorations for higher levels
    if (lvl >= 2) {
        // Gem on lock
        ctx.fillStyle = lvl === 4 ? '#aaccff' : lvl === 3 ? '#ffaa44' : '#aa4444';
        ctx.beginPath();
        ctx.arc(x + s * 0.5, y + s * 0.5, s * 0.025, 0, Math.PI * 2);
        ctx.fill();
    }

    if (lvl >= 3) {
        // Side decorations
        ctx.fillStyle = colors.lock;
        ctx.fillRect(x + s * 0.15, y + s * 0.56, s * 0.08, s * 0.08);
        ctx.fillRect(x + s * 0.77, y + s * 0.56, s * 0.08, s * 0.08);
    }

    // Shine effect
    const shinePos = (Math.sin(time * 0.5) + 1) / 2;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + lvl * 0.03})`;
    ctx.fillRect(x + s * 0.2 + shinePos * s * 0.4, y + s * 0.35, s * 0.08, s * 0.08);

    // Lock shine
    ctx.fillStyle = `rgba(255, 255, 200, ${0.2 + lvl * 0.05})`;
    ctx.fillRect(x + s * 0.5 - lockWidth / 2 + 2, y + s * 0.53, 3, 3);

    // Magical particles for legendary
    if (lvl === 4) {
        for (let i = 0; i < 4; i++) {
            const px = x + s * 0.3 + Math.sin(time * 2 + i * 1.5) * s * 0.2;
            const py = y + s * 0.5 + Math.cos(time * 2 + i * 1.5) * s * 0.15;
            ctx.fillStyle = `rgba(170, 204, 255, ${0.5 + Math.sin(time * 3 + i) * 0.3})`;
            ctx.fillRect(px, py, 2, 2);
        }
    }
}

// ============= BED - 5 LEVELS =============
function renderBed(x, y, s, wx, wy, level = 1) {
    const lvl = Math.min(5, Math.max(1, level || 1)) - 1;
    const time = pixelTime || Date.now() / 1000;

    // Colors based on level
    const bedColors = [
        { frame: '#5a4a3a', blanket: '#aa4444', pillow: '#dddddd' }, // Basic
        { frame: '#6a5a4a', blanket: '#4444aa', pillow: '#eeeeee' }, // Comfortable
        { frame: '#7a6a5a', blanket: '#44aa44', pillow: '#ffffff' }, // Luxury
        { frame: '#8a7a6a', blanket: '#aa44aa', pillow: '#ffffff' }, // Royal
        { frame: '#8090a0', blanket: '#4488cc', pillow: '#ffffff', glow: '#aaccff' } // Legendary
    ];
    const colors = bedColors[lvl];

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + s * 0.03 + 3, y + s * 0.35 + 3, s * 0.94, s * 0.62);

    // Legendary glow
    if (lvl === 4) {
        const glowPulse = Math.sin(time * 2) * 0.15 + 0.85;
        ctx.fillStyle = `rgba(170, 204, 255, ${0.15 * glowPulse})`;
        ctx.fillRect(x - 5, y - 5, s + 10, s + 10);
    }

    // Frame outline
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x, y + s * 0.45, s, s * 0.57);

    // Bed frame
    ctx.fillStyle = colors.frame;
    ctx.fillRect(x + s * 0.03, y + s * 0.48, s * 0.94, s * 0.52);

    // Frame details (more elaborate at higher levels)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(x + s * 0.08, y + s * 0.55, s * 0.84, 2);
    ctx.fillRect(x + s * 0.08, y + s * 0.75, s * 0.84, 2);

    if (lvl >= 2) {
        // Carved details
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x + s * 0.1, y + s * 0.6, s * 0.15, s * 0.1);
        ctx.fillRect(x + s * 0.75, y + s * 0.6, s * 0.15, s * 0.1);
    }

    // Frame highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(x + s * 0.03, y + s * 0.48, s * 0.94, 2);

    // Mattress (thicker at higher levels)
    const mattressHeight = s * (0.3 + lvl * 0.02);
    ctx.fillStyle = '#dddddd';
    ctx.fillRect(x + s * 0.08, y + s * 0.45 - mattressHeight * 0.3, s * 0.84, mattressHeight);
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(x + s * 0.08, y + s * 0.45 - mattressHeight * 0.3 + mattressHeight * 0.8, s * 0.84, mattressHeight * 0.2);

    // Blanket
    const blanketGrad = ctx.createLinearGradient(x, y + s * 0.4, x, y + s * 0.7);
    blanketGrad.addColorStop(0, colors.blanket);
    blanketGrad.addColorStop(1, `hsl(${lvl * 30}, 50%, 35%)`);
    ctx.fillStyle = blanketGrad;
    ctx.fillRect(x + s * 0.1, y + s * 0.42, s * 0.8, s * (0.28 + lvl * 0.02));

    // Quilted pattern (more elaborate at higher levels)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    const quiltCols = 3 + lvl;
    for (let i = 0; i < quiltCols; i++) {
        ctx.fillRect(x + s * (0.15 + i * 0.7 / quiltCols), y + s * 0.42, 2, s * 0.28);
    }
    for (let i = 0; i < 2 + Math.floor(lvl / 2); i++) {
        ctx.fillRect(x + s * 0.1, y + s * (0.48 + i * 0.08), s * 0.8, 2);
    }

    // Blanket fold
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x + s * 0.1, y + s * 0.42, s * 0.8, 4);

    // Pillows (more at higher levels)
    const pillowCount = 1 + Math.floor(lvl / 2);
    for (let p = 0; p < pillowCount; p++) {
        const pillowX = x + s * 0.1 + p * s * 0.22;
        const pillowWidth = s * (0.32 - p * 0.05);

        ctx.fillStyle = colors.pillow;
        ctx.fillRect(pillowX, y + s * 0.33, pillowWidth, s * 0.16);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(pillowX + 2, y + s * 0.35, pillowWidth - 4, s * 0.06);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(pillowX, y + s * 0.44, pillowWidth, s * 0.05);
    }

    // Headboard (more elaborate at higher levels)
    const headboardHeight = s * (0.15 + lvl * 0.03);
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.02, y + s * 0.22 - lvl * 2, s * 0.48, headboardHeight + 4);
    ctx.fillStyle = colors.frame;
    ctx.fillRect(x + s * 0.04, y + s * 0.24 - lvl * 2, s * 0.44, headboardHeight);

    // Headboard design
    if (lvl >= 1) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        const panelCount = 2 + Math.floor(lvl / 2);
        const panelWidth = s * 0.4 / panelCount;
        for (let i = 0; i < panelCount; i++) {
            ctx.fillRect(x + s * 0.06 + i * (panelWidth + 2), y + s * 0.27 - lvl * 2, panelWidth - 2, headboardHeight * 0.6);
        }
    }

    // Headboard highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(x + s * 0.04, y + s * 0.24 - lvl * 2, s * 0.44, 2);

    // Decorative posts for level 3+
    if (lvl >= 2) {
        ctx.fillStyle = colors.frame;
        ctx.fillRect(x, y + s * 0.18 - lvl * 3, s * 0.06, headboardHeight + s * 0.1);
        ctx.fillRect(x + s * 0.46, y + s * 0.18 - lvl * 3, s * 0.06, headboardHeight + s * 0.1);
        // Post tops
        ctx.fillStyle = lvl === 4 ? '#ccaa44' : colors.frame;
        ctx.beginPath();
        ctx.arc(x + s * 0.03, y + s * 0.16 - lvl * 3, s * 0.04, 0, Math.PI * 2);
        ctx.arc(x + s * 0.49, y + s * 0.16 - lvl * 3, s * 0.04, 0, Math.PI * 2);
        ctx.fill();
    }

    // Footboard
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.85, y + s * 0.35, s * 0.13, s * 0.3);
    ctx.fillStyle = colors.frame;
    ctx.fillRect(x + s * 0.87, y + s * 0.37, s * 0.09, s * 0.26);

    // Canopy for legendary
    if (lvl === 4) {
        ctx.fillStyle = 'rgba(100, 150, 200, 0.3)';
        ctx.fillRect(x - s * 0.05, y - s * 0.1, s * 0.6, s * 0.05);
        ctx.fillStyle = 'rgba(100, 150, 200, 0.2)';
        ctx.fillRect(x - s * 0.05, y - s * 0.1, s * 0.02, s * 0.35);
        ctx.fillRect(x + s * 0.53, y - s * 0.1, s * 0.02, s * 0.35);
    }
}

// ============= SPIKES - 5 LEVELS =============
function renderSpikes(x, y, s, wx, wy, level = 1) {
    const lvl = Math.min(5, Math.max(1, level || 1)) - 1;
    const time = pixelTime || Date.now() / 1000;

    // Colors based on level
    const spikeColors = [
        { base: '#5a4a3a', spike: '#888888', tip: '#aaaaaa' }, // Wood/Iron
        { base: '#5a5a5a', spike: '#999999', tip: '#bbbbbb' }, // Steel
        { base: '#606060', spike: '#aaaaaa', tip: '#cccccc' }, // Hardened
        { base: '#505058', spike: '#aaaaaa', tip: '#dddddd' }, // Serrated
        { base: '#505868', spike: '#99aacc', tip: '#bbccee', glow: '#aaccff' } // Legendary
    ];
    const colors = spikeColors[lvl];

    // Legendary glow
    if (lvl === 4) {
        const glowPulse = Math.sin(time * 3) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(170, 204, 255, ${0.2 * glowPulse})`;
        ctx.fillRect(x - 3, y - 3, s + 6, s + 6);
    }

    // Base platform
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x - 1, y - 1, s + 2, s + 2);
    ctx.fillStyle = colors.base;
    ctx.fillRect(x, y, s, s);

    // Frame pattern (more reinforced at higher levels)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let i = 1; i <= lvl; i++) {
        ctx.fillRect(x + 4, y + s * (0.2 + i * 0.15), s - 8, 2);
        ctx.fillRect(x + s * (0.2 + i * 0.15), y + 4, 2, s - 8);
    }

    // Spikes (more and taller at higher levels)
    const spikeRows = 3;
    const spikeCols = 3;
    const spikeHeight = s * (0.12 + lvl * 0.03);

    for (let row = 0; row < spikeRows; row++) {
        for (let col = 0; col < spikeCols; col++) {
            const sx = x + s * (0.2 + col * 0.3) + seededRandom(row, col) * s * 0.05;
            const sy = y + s * (0.2 + row * 0.3) + seededRandom(col, row) * s * 0.05;
            const heightVar = spikeHeight + seededRandom(row + col, 5) * s * 0.02;

            // Spike shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.moveTo(sx - s * 0.05, sy + s * 0.06 + 2);
            ctx.lineTo(sx + 2, sy - heightVar + 4);
            ctx.lineTo(sx + s * 0.07, sy + s * 0.06 + 2);
            ctx.closePath();
            ctx.fill();

            // Spike outline
            ctx.fillStyle = PALETTE.outline;
            ctx.beginPath();
            ctx.moveTo(sx - s * 0.07, sy + s * 0.06);
            ctx.lineTo(sx, sy - heightVar - 2);
            ctx.lineTo(sx + s * 0.07, sy + s * 0.06);
            ctx.closePath();
            ctx.fill();

            // Spike body gradient
            const spikeGrad = ctx.createLinearGradient(sx - s * 0.05, 0, sx + s * 0.05, 0);
            spikeGrad.addColorStop(0, colors.spike);
            spikeGrad.addColorStop(0.4, colors.tip);
            spikeGrad.addColorStop(0.6, colors.tip);
            spikeGrad.addColorStop(1, colors.spike);
            ctx.fillStyle = spikeGrad;
            ctx.beginPath();
            ctx.moveTo(sx - s * 0.05, sy + s * 0.04);
            ctx.lineTo(sx, sy - heightVar);
            ctx.lineTo(sx + s * 0.05, sy + s * 0.04);
            ctx.closePath();
            ctx.fill();

            // Spike highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.moveTo(sx - s * 0.02, sy);
            ctx.lineTo(sx, sy - heightVar + 2);
            ctx.lineTo(sx + s * 0.01, sy);
            ctx.closePath();
            ctx.fill();

            // Serrated edges for level 4+
            if (lvl >= 3) {
                ctx.fillStyle = colors.tip;
                ctx.fillRect(sx - s * 0.03, sy - heightVar * 0.4, 2, 2);
                ctx.fillRect(sx + s * 0.01, sy - heightVar * 0.6, 2, 2);
            }

            // Blood stains (some spikes, more at higher levels)
            if (seededRandom(row * 3 + col, 20) > 0.8 - lvl * 0.05) {
                ctx.fillStyle = 'rgba(120, 20, 20, 0.5)';
                ctx.fillRect(sx - 1, sy - heightVar * 0.3, 2, heightVar * 0.2);
            }
        }
    }

    // Warning marks (more prominent at higher levels)
    ctx.fillStyle = '#cc4444';
    const markSize = 3 + lvl;
    ctx.fillRect(x + 2, y + 2, markSize, markSize);
    ctx.fillRect(x + s - 2 - markSize, y + 2, markSize, markSize);
    ctx.fillRect(x + 2, y + s - 2 - markSize, markSize, markSize);
    ctx.fillRect(x + s - 2 - markSize, y + s - 2 - markSize, markSize, markSize);

    // Poison drip for level 4+
    if (lvl >= 3) {
        ctx.fillStyle = 'rgba(100, 200, 100, 0.6)';
        for (let i = 0; i < 3; i++) {
            const dripX = x + s * (0.25 + i * 0.25);
            const dripY = y + s * 0.6 + Math.sin(time * 2 + i) * 3;
            ctx.beginPath();
            ctx.arc(dripX, dripY, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Magical runes for legendary
    if (lvl === 4) {
        const runeGlow = Math.sin(time * 2) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(170, 204, 255, ${runeGlow})`;
        ctx.fillRect(x + s * 0.45, y + s * 0.1, s * 0.1, 3);
        ctx.fillRect(x + s * 0.48, y + s * 0.1, 3, s * 0.1);
        ctx.fillRect(x + s * 0.45, y + s * 0.85, s * 0.1, 3);
        ctx.fillRect(x + s * 0.48, y + s * 0.8, 3, s * 0.1);
    }
}

// ============= BONUS STRUCTURES (kept from original) =============

// Storage Barrel
function renderBarrel(x, y, s) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + s / 2 + 2, y + s * 0.9 + 2, s * 0.35, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s * 0.85, s * 0.4, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + s * 0.1, y + s * 0.2, s * 0.8, s * 0.65);

    const barrelGrad = ctx.createLinearGradient(x + s * 0.1, 0, x + s * 0.9, 0);
    barrelGrad.addColorStop(0, '#6a4a30');
    barrelGrad.addColorStop(0.3, '#8a6a50');
    barrelGrad.addColorStop(0.7, '#8a6a50');
    barrelGrad.addColorStop(1, '#6a4a30');
    ctx.fillStyle = barrelGrad;
    ctx.fillRect(x + s * 0.12, y + s * 0.22, s * 0.76, s * 0.63);

    ctx.fillStyle = '#7a5a40';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s * 0.22, s * 0.38, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#555555';
    ctx.fillRect(x + s * 0.12, y + s * 0.28, s * 0.76, 4);
    ctx.fillRect(x + s * 0.12, y + s * 0.5, s * 0.76, 4);
    ctx.fillRect(x + s * 0.12, y + s * 0.72, s * 0.76, 4);

    ctx.fillStyle = '#777777';
    ctx.fillRect(x + s * 0.15, y + s * 0.28, s * 0.7, 1);
    ctx.fillRect(x + s * 0.15, y + s * 0.5, s * 0.7, 1);
    ctx.fillRect(x + s * 0.15, y + s * 0.72, s * 0.7, 1);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(x + s * 0.2 + i * s * 0.13, y + s * 0.25, 2, s * 0.58);
    }
}

// Lantern/Torch Post
function renderLanternPost(x, y, s) {
    const time = pixelTime || Date.now() / 1000;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + s * 0.45 + 2, y + s * 0.3 + 2, s * 0.12, s * 0.72);

    const glowPulse = Math.sin(time * 4) * 0.1 + 0.9;
    const glow = ctx.createRadialGradient(x + s / 2, y + s * 0.25, 0, x + s / 2, y + s * 0.25, s * 0.5 * glowPulse);
    glow.addColorStop(0, 'rgba(255, 200, 100, 0.4)');
    glow.addColorStop(0.5, 'rgba(255, 150, 50, 0.15)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, s, s);

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.42, y + s * 0.35, s * 0.16, s * 0.67);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x + s * 0.44, y + s * 0.37, s * 0.12, s * 0.63);

    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x + s * 0.35, y + s * 0.28, s * 0.3, s * 0.05);

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.32, y + s * 0.08, s * 0.36, s * 0.25);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x + s * 0.35, y + s * 0.1, s * 0.3, s * 0.21);

    ctx.fillStyle = '#ffcc66';
    ctx.globalAlpha = 0.8 + Math.sin(time * 8) * 0.2;
    ctx.fillRect(x + s * 0.38, y + s * 0.12, s * 0.24, s * 0.17);
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6;
    ctx.fillRect(x + s * 0.46, y + s * 0.15, s * 0.08, s * 0.1);
    ctx.globalAlpha = 1;

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
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + s / 2 + 3, y + s * 0.85 + 3, s * 0.45, s * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s * 0.8, s * 0.48, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#6a6a6a';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s * 0.8, s * 0.44, s * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(x + s * 0.1, y + s * 0.45, s * 0.8, s * 0.35);

    ctx.fillStyle = '#6a6a6a';
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 4; col++) {
            const offset = row % 2 === 0 ? 0 : s * 0.1;
            ctx.fillRect(x + s * 0.12 + offset + col * s * 0.2, y + s * (0.48 + row * 0.15), s * 0.16, s * 0.12);
        }
    }

    ctx.fillStyle = '#2a4a6a';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s * 0.52, s * 0.32, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(150, 200, 255, 0.3)';
    ctx.fillRect(x + s * 0.35, y + s * 0.5, s * 0.15, 3);

    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(x + s * 0.12, y + s * 0.15, s * 0.08, s * 0.55);
    ctx.fillRect(x + s * 0.8, y + s * 0.15, s * 0.08, s * 0.55);

    ctx.fillStyle = '#5a3a25';
    ctx.beginPath();
    ctx.moveTo(x + s * 0.05, y + s * 0.2);
    ctx.lineTo(x + s * 0.5, y);
    ctx.lineTo(x + s * 0.95, y + s * 0.2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#6a4a35';
    ctx.fillRect(x + s * 0.05, y + s * 0.18, s * 0.9, 3);

    ctx.fillStyle = '#8a7a5a';
    ctx.fillRect(x + s * 0.49, y + s * 0.1, 2, s * 0.4);

    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(x + s * 0.42, y + s * 0.42, s * 0.16, s * 0.12);
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(x + s * 0.44, y + s * 0.44, s * 0.12, s * 0.08);
}
