// ============= ADDITIONAL BUILDING SPRITES =============
// New buildings with 5 upgrade levels each
// Keeps main buildings.js under size limit

// Color palettes for new buildings
const EXTRA_BUILDING_COLORS = {
    armory: [
        { wall: '#5a5a5a', metal: '#6a6a6a', rack: '#4a3a2a' },
        { wall: '#606068', metal: '#707078', rack: '#5a4a3a' },
        { wall: '#686878', metal: '#808090', rack: '#6a5a4a' },
        { wall: '#707888', metal: '#909aa8', rack: '#7a6a5a' },
        { wall: '#7888a0', metal: '#a0b0c8', rack: '#8a7a6a', glow: '#aaccff' }
    ],
    hospital: [
        { wall: '#e8e8e8', cross: '#cc4444', trim: '#aaaaaa' },
        { wall: '#f0f0f0', cross: '#dd3333', trim: '#bbbbbb' },
        { wall: '#f4f4f4', cross: '#ee2222', trim: '#cccccc' },
        { wall: '#f8f8f8', cross: '#ff1111', trim: '#dddddd' },
        { wall: '#ffffff', cross: '#ff0000', trim: '#eeeeee', glow: '#ffaaaa' }
    ],
    brewery: [
        { wood: '#6a4a30', barrel: '#5a3a20', copper: '#aa7744' },
        { wood: '#7a5a40', barrel: '#6a4a30', copper: '#bb8855' },
        { wood: '#8a6a50', barrel: '#7a5a40', copper: '#cc9966' },
        { wood: '#9a7a60', barrel: '#8a6a50', copper: '#ddaa77' },
        { wood: '#aa8a70', barrel: '#9a7a60', copper: '#eebb88', glow: '#ffdd88' }
    ],
    well: [
        { stone: '#6a6a6a', water: '#4488cc', roof: '#5a4a3a' },
        { stone: '#7a7a7a', water: '#5599dd', roof: '#6a5a4a' },
        { stone: '#8a8a8a', water: '#66aaee', roof: '#7a6a5a' },
        { stone: '#9a9a9a', water: '#77bbff', roof: '#8a7a6a' },
        { stone: '#aaaaaa', water: '#88ccff', roof: '#9a8a7a', glow: '#aaddff' }
    ],
    stable: [
        { wood: '#7a5a3a', hay: '#ccaa44', door: '#5a4030' },
        { wood: '#8a6a4a', hay: '#ddbb55', door: '#6a5040' },
        { wood: '#9a7a5a', hay: '#eecc66', door: '#7a6050' },
        { wood: '#aa8a6a', hay: '#ffdd77', door: '#8a7060' },
        { wood: '#ba9a7a', hay: '#ffee88', door: '#9a8070', glow: '#ffeeaa' }
    ],
    mine: [
        { rock: '#5a5a5a', beam: '#5a4030', track: '#4a4a4a' },
        { rock: '#6a6a6a', beam: '#6a5040', track: '#5a5a5a' },
        { rock: '#7a7a7a', beam: '#7a6050', track: '#6a6a6a' },
        { rock: '#8a8a8a', beam: '#8a7060', track: '#7a7a7a' },
        { rock: '#9a9a9a', beam: '#9a8070', track: '#8a8a8a', glow: '#ccccff' }
    ],
    barricade: [
        { wood: '#5a4030', spike: '#4a3020', rope: '#8a7a5a' },
        { wood: '#6a5040', spike: '#5a4030', rope: '#9a8a6a' },
        { wood: '#7a6050', spike: '#6a5040', rope: '#aa9a7a' },
        { wood: '#8a7060', spike: '#7a6050', rope: '#baaa8a', metal: '#666666' },
        { wood: '#9a8070', spike: '#8a7060', rope: '#caba9a', metal: '#888888', glow: '#aaccaa' }
    ],
    watchtower: [
        { wood: '#6a5040', platform: '#5a4030', ladder: '#4a3020' },
        { wood: '#7a6050', platform: '#6a5040', ladder: '#5a4030' },
        { wood: '#8a7060', platform: '#7a6050', ladder: '#6a5040', stone: '#6a6a6a' },
        { wood: '#9a8070', platform: '#8a7060', ladder: '#7a6050', stone: '#7a7a7a' },
        { wood: '#aa9080', platform: '#9a8070', ladder: '#8a7060', stone: '#8a8a8a', glow: '#aaffaa' }
    ],
    storage: [
        { wall: '#7a6a5a', door: '#5a4a3a', roof: '#5a4030' },
        { wall: '#8a7a6a', door: '#6a5a4a', roof: '#6a5040' },
        { wall: '#9a8a7a', door: '#7a6a5a', roof: '#7a6050' },
        { wall: '#aa9a8a', door: '#8a7a6a', roof: '#8a7060' },
        { wall: '#baaa9a', door: '#9a8a7a', roof: '#9a8070', glow: '#ffddaa' }
    ],
    altar: [
        { stone: '#6a6a7a', crystal: '#aa44aa', glow: '#cc66cc' },
        { stone: '#7a7a8a', crystal: '#bb55bb', glow: '#dd77dd' },
        { stone: '#8a8a9a', crystal: '#cc66cc', glow: '#ee88ee' },
        { stone: '#9a9aaa', crystal: '#dd77dd', glow: '#ff99ff' },
        { stone: '#aaaaba', crystal: '#ee88ee', glow: '#ffaaff', legendary: true }
    ],
    forge: [
        { brick: '#8a4a3a', metal: '#4a4a4a', fire: '#ff6600' },
        { brick: '#9a5a4a', metal: '#5a5a5a', fire: '#ff7711' },
        { brick: '#aa6a5a', metal: '#6a6a6a', fire: '#ff8822' },
        { brick: '#ba7a6a', metal: '#7a7a7a', fire: '#ff9933' },
        { brick: '#ca8a7a', metal: '#8a8a8a', fire: '#ffaa44', glow: '#ffcc66' }
    ],
    garden: [
        { soil: '#5a4030', flowers: ['#ff6699', '#ffcc33'], fence: '#6a5a4a' },
        { soil: '#5a4535', flowers: ['#ff6699', '#ffcc33', '#99ccff'], fence: '#7a6a5a' },
        { soil: '#5a4a3a', flowers: ['#ff6699', '#ffcc33', '#99ccff', '#cc99ff'], fence: '#8a7a6a' },
        { soil: '#604540', flowers: ['#ff6699', '#ffcc33', '#99ccff', '#cc99ff', '#99ff99'], fence: '#9a8a7a' },
        { soil: '#655045', flowers: ['#ff99aa', '#ffdd66', '#aaddff', '#ddaaff', '#aaffaa', '#ffffff'], fence: '#aa9a8a', glow: '#ffeecc' }
    ]
};

// ============= ARMORY - 5 LEVELS =============
function renderArmory(x, y, s, wx, wy, level = 1) {
    const lvl = Math.min(5, Math.max(1, level || 1)) - 1;
    const colors = EXTRA_BUILDING_COLORS.armory[lvl];
    const time = pixelTime || Date.now() / 1000;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x + 4, y + 4, s, s);

    // Legendary glow
    if (lvl === 4) {
        const glowPulse = Math.sin(time * 3) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(170, 204, 255, ${0.25 * glowPulse})`;
        ctx.fillRect(x - 4, y - 4, s + 8, s + 8);
    }

    // Main building
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x - 1, y - 1, s + 2, s + 2);
    ctx.fillStyle = colors.wall;
    ctx.fillRect(x, y, s, s);

    // Metal reinforcements (more with level)
    ctx.fillStyle = colors.metal;
    ctx.fillRect(x, y, s, 4);
    ctx.fillRect(x, y + s - 4, s, 4);
    if (lvl >= 1) {
        ctx.fillRect(x, y, 4, s);
        ctx.fillRect(x + s - 4, y, 4, s);
    }
    if (lvl >= 2) {
        ctx.fillRect(x + s * 0.3, y, s * 0.4, 2);
        ctx.fillRect(x + s * 0.3, y + s - 2, s * 0.4, 2);
    }

    // Weapon racks
    ctx.fillStyle = colors.rack;
    const rackCount = 2 + Math.floor(lvl / 2);
    for (let i = 0; i < rackCount; i++) {
        const rx = x + s * (0.15 + i * 0.7 / rackCount);
        ctx.fillRect(rx, y + s * 0.25, 3, s * 0.5);
    }

    // Weapons on racks (swords, spears based on level)
    const weaponCount = 2 + lvl;
    for (let i = 0; i < weaponCount; i++) {
        const wx = x + s * (0.1 + i * 0.8 / weaponCount);
        const wy = y + s * 0.3 + (i % 2) * s * 0.15;

        ctx.fillStyle = lvl >= 3 ? '#aaaaaa' : '#888888';
        ctx.fillRect(wx, wy, 2, s * 0.25);
        ctx.fillStyle = colors.rack;
        ctx.fillRect(wx - 1, wy + s * 0.25, 4, s * 0.06);
    }

    // Shield on wall for level 3+
    if (lvl >= 2) {
        ctx.fillStyle = '#cc4444';
        ctx.beginPath();
        ctx.arc(x + s * 0.75, y + s * 0.4, s * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffcc44';
        ctx.fillRect(x + s * 0.73, y + s * 0.35, s * 0.04, s * 0.1);
    }

    // Anvil for level 4+
    if (lvl >= 3) {
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(x + s * 0.4, y + s * 0.7, s * 0.2, s * 0.15);
        ctx.fillRect(x + s * 0.35, y + s * 0.65, s * 0.3, s * 0.08);
    }

    // Door
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.35, y + s * 0.6, s * 0.3, s * 0.42);
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(x + s * 0.37, y + s * 0.62, s * 0.26, s * 0.38);
    ctx.fillStyle = colors.metal;
    ctx.fillRect(x + s * 0.55, y + s * 0.75, s * 0.04, s * 0.06);
}

// ============= HOSPITAL - 5 LEVELS =============
function renderHospital(x, y, s, wx, wy, level = 1) {
    const lvl = Math.min(5, Math.max(1, level || 1)) - 1;
    const colors = EXTRA_BUILDING_COLORS.hospital[lvl];
    const time = pixelTime || Date.now() / 1000;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x + 4, y + 4, s, s);

    // Legendary glow
    if (lvl === 4) {
        const glowPulse = Math.sin(time * 2) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(255, 170, 170, ${0.2 * glowPulse})`;
        ctx.fillRect(x - 4, y - 4, s + 8, s + 8);
    }

    // Main building
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x - 1, y - 1, s + 2, s + 2);
    ctx.fillStyle = colors.wall;
    ctx.fillRect(x, y, s, s);

    // Trim
    ctx.fillStyle = colors.trim;
    ctx.fillRect(x, y, s, 3);
    ctx.fillRect(x, y + s - 3, s, 3);

    // Red cross (central, pulsing at high levels)
    const crossSize = s * (0.25 + lvl * 0.02);
    const crossPulse = lvl >= 3 ? Math.sin(time * 3) * 0.1 + 0.9 : 1;

    ctx.fillStyle = colors.cross;
    ctx.globalAlpha = crossPulse;
    ctx.fillRect(x + s * 0.5 - crossSize * 0.15, y + s * 0.15, crossSize * 0.3, crossSize);
    ctx.fillRect(x + s * 0.5 - crossSize * 0.5, y + s * 0.15 + crossSize * 0.35, crossSize, crossSize * 0.3);
    ctx.globalAlpha = 1;

    // Windows (more with level)
    const windowCount = 1 + Math.floor(lvl / 2);
    for (let i = 0; i < windowCount; i++) {
        const winX = x + s * (0.1 + i * 0.3);
        ctx.fillStyle = '#9acfff';
        ctx.fillRect(winX, y + s * 0.55, s * 0.15, s * 0.2);
        ctx.fillStyle = colors.trim;
        ctx.fillRect(winX + s * 0.06, y + s * 0.55, 2, s * 0.2);
        ctx.fillRect(winX, y + s * 0.63, s * 0.15, 2);
    }

    // Door
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.38, y + s * 0.7, s * 0.24, s * 0.32);
    ctx.fillStyle = '#eeeeee';
    ctx.fillRect(x + s * 0.4, y + s * 0.72, s * 0.2, s * 0.28);

    // Door cross
    ctx.fillStyle = colors.cross;
    ctx.fillRect(x + s * 0.48, y + s * 0.74, s * 0.04, s * 0.12);
    ctx.fillRect(x + s * 0.44, y + s * 0.78, s * 0.12, s * 0.04);

    // Beds visible through window for level 3+
    if (lvl >= 2) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + s * 0.75, y + s * 0.6, s * 0.15, s * 0.08);
    }

    // Healing particles for legendary
    if (lvl === 4) {
        for (let i = 0; i < 4; i++) {
            const px = x + s * (0.2 + Math.sin(time * 2 + i * 1.5) * 0.3);
            const py = y - s * 0.1 - (time * 20 + i * 10) % 30;
            ctx.fillStyle = `rgba(255, 100, 100, ${0.6 - ((time * 20 + i * 10) % 30) / 50})`;
            ctx.fillRect(px, py, 3, 3);
        }
    }
}

// ============= BREWERY - 5 LEVELS =============
function renderBrewery(x, y, s, wx, wy, level = 1) {
    const lvl = Math.min(5, Math.max(1, level || 1)) - 1;
    const colors = EXTRA_BUILDING_COLORS.brewery[lvl];
    const time = pixelTime || Date.now() / 1000;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x + 4, y + 4, s, s);

    // Legendary glow
    if (lvl === 4) {
        const glowPulse = Math.sin(time * 2) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(255, 221, 136, ${0.2 * glowPulse})`;
        ctx.fillRect(x - 4, y - 4, s + 8, s + 8);
    }

    // Main building
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x - 1, y + s * 0.2 - 1, s + 2, s * 0.82);
    ctx.fillStyle = colors.wood;
    ctx.fillRect(x, y + s * 0.22, s, s * 0.78);

    // Roof
    ctx.fillStyle = colors.barrel;
    ctx.beginPath();
    ctx.moveTo(x - 4, y + s * 0.25);
    ctx.lineTo(x + s / 2, y - s * 0.05);
    ctx.lineTo(x + s + 4, y + s * 0.25);
    ctx.closePath();
    ctx.fill();

    // Chimney with steam
    ctx.fillStyle = colors.barrel;
    ctx.fillRect(x + s * 0.7, y - s * 0.1, s * 0.12, s * 0.25);

    // Steam
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 3; i++) {
        const steamY = y - s * 0.15 - (time * 15 + i * 8) % 20;
        const steamX = x + s * 0.74 + Math.sin(time * 2 + i) * 3;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(steamX, steamY, 3 + i, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Barrels (more with level)
    const barrelCount = 1 + lvl;
    for (let i = 0; i < Math.min(barrelCount, 3); i++) {
        const bx = x + s * (0.1 + i * 0.28);
        const by = y + s * 0.55;

        ctx.fillStyle = PALETTE.outline;
        ctx.beginPath();
        ctx.ellipse(bx + s * 0.1, by + s * 0.35, s * 0.12, s * 0.04, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = colors.barrel;
        ctx.fillRect(bx, by, s * 0.2, s * 0.35);
        ctx.fillStyle = colors.copper;
        ctx.fillRect(bx, by + s * 0.08, s * 0.2, 3);
        ctx.fillRect(bx, by + s * 0.25, s * 0.2, 3);
    }

    // Copper still for level 3+
    if (lvl >= 2) {
        ctx.fillStyle = colors.copper;
        ctx.beginPath();
        ctx.arc(x + s * 0.8, y + s * 0.45, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x + s * 0.78, y + s * 0.45, s * 0.04, s * 0.2);
    }

    // Door
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.38, y + s * 0.65, s * 0.24, s * 0.37);
    ctx.fillStyle = colors.barrel;
    ctx.fillRect(x + s * 0.4, y + s * 0.67, s * 0.2, s * 0.33);
}

// ============= WELL - 5 LEVELS =============
function renderWellBuilding(x, y, s, wx, wy, level = 1) {
    const lvl = Math.min(5, Math.max(1, level || 1)) - 1;
    const colors = EXTRA_BUILDING_COLORS.well[lvl];
    const time = pixelTime || Date.now() / 1000;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + s / 2 + 3, y + s * 0.85 + 3, s * 0.45, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legendary glow
    if (lvl === 4) {
        const glowPulse = Math.sin(time * 2) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(170, 221, 255, ${0.2 * glowPulse})`;
        ctx.fillRect(x - 4, y - 4, s + 8, s + 8);
    }

    // Stone base
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s * 0.8, s * 0.48, s * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colors.stone;
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s * 0.8, s * 0.44, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stone wall
    ctx.fillStyle = colors.stone;
    ctx.fillRect(x + s * 0.1, y + s * 0.45, s * 0.8, s * 0.35);

    // Stone pattern (more detailed with level)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3 + lvl; col++) {
            const offset = row % 2 === 0 ? 0 : s * 0.08;
            ctx.fillRect(x + s * 0.12 + offset + col * s * (0.7 / (3 + lvl)), y + s * (0.48 + row * 0.15), s * (0.6 / (3 + lvl)), s * 0.12);
        }
    }

    // Water inside
    ctx.fillStyle = colors.water;
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s * 0.52, s * 0.32, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Water sparkle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(x + s * 0.35, y + s * 0.5, s * 0.1, 2);

    // Wooden posts
    ctx.fillStyle = colors.roof;
    ctx.fillRect(x + s * 0.15, y + s * 0.15, s * 0.08, s * 0.55);
    ctx.fillRect(x + s * 0.77, y + s * 0.15, s * 0.08, s * 0.55);

    // Roof
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.moveTo(x + s * 0.05, y + s * 0.2);
    ctx.lineTo(x + s * 0.5, y - s * 0.05);
    ctx.lineTo(x + s * 0.95, y + s * 0.2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = colors.roof;
    ctx.beginPath();
    ctx.moveTo(x + s * 0.08, y + s * 0.18);
    ctx.lineTo(x + s * 0.5, y - s * 0.02);
    ctx.lineTo(x + s * 0.92, y + s * 0.18);
    ctx.closePath();
    ctx.fill();

    // Rope and bucket
    ctx.fillStyle = '#8a7a5a';
    ctx.fillRect(x + s * 0.49, y + s * 0.1, 2, s * 0.4);

    // Bucket
    ctx.fillStyle = colors.roof;
    ctx.fillRect(x + s * 0.42, y + s * 0.42, s * 0.16, s * 0.12);
    ctx.fillStyle = '#555555';
    ctx.fillRect(x + s * 0.42, y + s * 0.44, s * 0.16, 2);
    ctx.fillRect(x + s * 0.42, y + s * 0.5, s * 0.16, 2);

    // Crank handle
    ctx.fillStyle = colors.roof;
    ctx.fillRect(x + s * 0.82, y + s * 0.25, s * 0.1, s * 0.04);
    ctx.fillRect(x + s * 0.88, y + s * 0.2, s * 0.04, s * 0.12);
}

// ============= STABLE - 5 LEVELS =============
function renderStable(x, y, s, wx, wy, level = 1) {
    const lvl = Math.min(5, Math.max(1, level || 1)) - 1;
    const colors = EXTRA_BUILDING_COLORS.stable[lvl];
    const time = pixelTime || Date.now() / 1000;
    const s2 = s * 1.5; // Stable is larger

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x + 4, y + 4, s, s);

    // Legendary glow
    if (lvl === 4) {
        const glowPulse = Math.sin(time * 2) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(255, 238, 170, ${0.2 * glowPulse})`;
        ctx.fillRect(x - 4, y - 4, s + 8, s + 8);
    }

    // Main building
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x - 1, y + s * 0.15 - 1, s + 2, s * 0.87);
    ctx.fillStyle = colors.wood;
    ctx.fillRect(x, y + s * 0.17, s, s * 0.83);

    // Horizontal planks
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(x, y + s * (0.25 + i * 0.14), s, 2);
    }

    // Roof
    ctx.fillStyle = colors.door;
    ctx.beginPath();
    ctx.moveTo(x - 6, y + s * 0.2);
    ctx.lineTo(x + s / 2, y - s * 0.1);
    ctx.lineTo(x + s + 6, y + s * 0.2);
    ctx.closePath();
    ctx.fill();

    // Stall doors (more with level)
    const stallCount = 1 + Math.floor(lvl / 2);
    const stallWidth = s * 0.8 / stallCount;
    for (let i = 0; i < stallCount; i++) {
        const sx = x + s * 0.1 + i * stallWidth;

        ctx.fillStyle = PALETTE.outline;
        ctx.fillRect(sx, y + s * 0.45, stallWidth - 4, s * 0.57);
        ctx.fillStyle = colors.door;
        ctx.fillRect(sx + 2, y + s * 0.47, stallWidth - 8, s * 0.53);

        // X pattern on door
        ctx.fillStyle = colors.wood;
        ctx.fillRect(sx + 4, y + s * 0.5, stallWidth - 12, 3);
        ctx.fillRect(sx + stallWidth / 2 - 4, y + s * 0.5, 3, s * 0.25);
    }

    // Hay pile
    ctx.fillStyle = colors.hay;
    ctx.fillRect(x + s * 0.75, y + s * 0.8, s * 0.2, s * 0.15);
    ctx.fillRect(x + s * 0.78, y + s * 0.75, s * 0.14, s * 0.08);

    // Horseshoe for level 3+
    if (lvl >= 2) {
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + s * 0.15, y + s * 0.3, s * 0.06, 0.5, Math.PI * 2 - 0.5);
        ctx.stroke();
    }

    // Feed trough for level 4+
    if (lvl >= 3) {
        ctx.fillStyle = colors.door;
        ctx.fillRect(x + s * 0.05, y + s * 0.7, s * 0.15, s * 0.08);
        ctx.fillStyle = colors.hay;
        ctx.fillRect(x + s * 0.06, y + s * 0.68, s * 0.13, s * 0.04);
    }
}

// ============= MINE - 5 LEVELS =============
function renderMine(x, y, s, wx, wy, level = 1) {
    const lvl = Math.min(5, Math.max(1, level || 1)) - 1;
    const colors = EXTRA_BUILDING_COLORS.mine[lvl];
    const time = pixelTime || Date.now() / 1000;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + 4, y + 4, s, s);

    // Legendary glow
    if (lvl === 4) {
        const glowPulse = Math.sin(time * 2) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(204, 204, 255, ${0.2 * glowPulse})`;
        ctx.fillRect(x - 4, y - 4, s + 8, s + 8);
    }

    // Rock face background
    ctx.fillStyle = colors.rock;
    ctx.fillRect(x, y, s, s);

    // Rock texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let i = 0; i < 8; i++) {
        const rx = x + seededRandom(wx + i, wy) * s * 0.8;
        const ry = y + seededRandom(wx, wy + i) * s * 0.8;
        ctx.fillRect(rx, ry, s * 0.15, s * 0.1);
    }

    // Mine entrance (dark hole)
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.2, y + s * 0.35, s * 0.6, s * 0.67);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + s * 0.22, y + s * 0.37, s * 0.56, s * 0.63);

    // Support beams
    ctx.fillStyle = colors.beam;
    ctx.fillRect(x + s * 0.18, y + s * 0.3, s * 0.08, s * 0.72);
    ctx.fillRect(x + s * 0.74, y + s * 0.3, s * 0.08, s * 0.72);
    ctx.fillRect(x + s * 0.15, y + s * 0.28, s * 0.7, s * 0.08);

    // Cross beams for higher levels
    if (lvl >= 1) {
        ctx.fillRect(x + s * 0.2, y + s * 0.5, s * 0.6, s * 0.04);
    }
    if (lvl >= 2) {
        ctx.fillRect(x + s * 0.2, y + s * 0.7, s * 0.6, s * 0.04);
    }

    // Mine cart tracks
    ctx.fillStyle = colors.track;
    ctx.fillRect(x + s * 0.28, y + s * 0.85, s * 0.44, s * 0.04);
    ctx.fillRect(x + s * 0.3, y + s * 0.92, s * 0.08, s * 0.06);
    ctx.fillRect(x + s * 0.62, y + s * 0.92, s * 0.08, s * 0.06);

    // Mine cart for level 3+
    if (lvl >= 2) {
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(x + s * 0.38, y + s * 0.78, s * 0.24, s * 0.12);
        ctx.fillStyle = '#666666';
        ctx.beginPath();
        ctx.arc(x + s * 0.42, y + s * 0.92, s * 0.04, 0, Math.PI * 2);
        ctx.arc(x + s * 0.58, y + s * 0.92, s * 0.04, 0, Math.PI * 2);
        ctx.fill();

        // Ore in cart
        ctx.fillStyle = '#888899';
        ctx.fillRect(x + s * 0.4, y + s * 0.76, s * 0.06, s * 0.04);
        ctx.fillRect(x + s * 0.48, y + s * 0.75, s * 0.08, s * 0.05);
    }

    // Pickaxe leaning
    ctx.fillStyle = colors.beam;
    ctx.save();
    ctx.translate(x + s * 0.1, y + s * 0.9);
    ctx.rotate(-0.4);
    ctx.fillRect(0, -s * 0.4, 3, s * 0.4);
    ctx.fillStyle = colors.track;
    ctx.fillRect(-4, -s * 0.42, 12, 5);
    ctx.restore();

    // Ore deposits visible (more with level)
    for (let i = 0; i < lvl; i++) {
        const ox = x + s * 0.25 + i * s * 0.15;
        const oy = y + s * 0.5 + seededRandom(i, wx) * s * 0.2;
        ctx.fillStyle = '#aabbcc';
        ctx.fillRect(ox, oy, s * 0.06, s * 0.04);
    }

    // Lantern for level 4+
    if (lvl >= 3) {
        ctx.fillStyle = '#ffaa44';
        ctx.globalAlpha = 0.6 + Math.sin(time * 5) * 0.2;
        ctx.fillRect(x + s * 0.45, y + s * 0.42, s * 0.1, s * 0.08);
        ctx.globalAlpha = 1;
    }
}

// ============= BARRICADE - 5 LEVELS =============
function renderBarricade(x, y, s, wx, wy, level = 1) {
    const lvl = Math.min(5, Math.max(1, level || 1)) - 1;
    const colors = EXTRA_BUILDING_COLORS.barricade[lvl];
    const time = pixelTime || Date.now() / 1000;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + 2, y + 2, s, s);

    // Legendary glow
    if (lvl === 4) {
        const glowPulse = Math.sin(time * 3) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(170, 204, 170, ${0.2 * glowPulse})`;
        ctx.fillRect(x - 3, y - 3, s + 6, s + 6);
    }

    // Main posts (more with level)
    const postCount = 3 + lvl;
    for (let i = 0; i < postCount; i++) {
        const px = x + i * (s / postCount);
        const height = s * (0.5 + seededRandom(i, wx) * 0.3);
        const tilt = (seededRandom(i + 1, wy) - 0.5) * 0.2;

        ctx.save();
        ctx.translate(px + s / postCount / 2, y + s);
        ctx.rotate(tilt);

        // Post shadow
        ctx.fillStyle = PALETTE.outline;
        ctx.fillRect(-s * 0.06, -height - 2, s * 0.12 + 2, height + 2);

        // Post
        ctx.fillStyle = colors.wood;
        ctx.fillRect(-s * 0.05, -height, s * 0.1, height);

        // Sharpened top
        ctx.fillStyle = colors.spike;
        ctx.beginPath();
        ctx.moveTo(-s * 0.05, -height);
        ctx.lineTo(0, -height - s * 0.15);
        ctx.lineTo(s * 0.05, -height);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // Horizontal support beam
    ctx.fillStyle = colors.wood;
    ctx.fillRect(x, y + s * 0.6, s, s * 0.06);
    if (lvl >= 2) {
        ctx.fillRect(x, y + s * 0.75, s, s * 0.05);
    }

    // Rope binding
    ctx.fillStyle = colors.rope;
    for (let i = 0; i < 2 + lvl; i++) {
        const rx = x + s * (0.15 + i * 0.2);
        ctx.fillRect(rx, y + s * 0.58, 3, s * 0.1);
    }

    // Metal reinforcements for level 4+
    if (lvl >= 3 && colors.metal) {
        ctx.fillStyle = colors.metal;
        ctx.fillRect(x + s * 0.1, y + s * 0.55, s * 0.15, 3);
        ctx.fillRect(x + s * 0.75, y + s * 0.55, s * 0.15, 3);
    }

    // Blood stains
    if (seededRandom(wx, wy) > 0.7) {
        ctx.fillStyle = 'rgba(100, 30, 30, 0.4)';
        ctx.fillRect(x + s * 0.3, y + s * 0.4, s * 0.08, s * 0.15);
    }
}

// ============= WATCHTOWER (tall) - 5 LEVELS =============
function renderWatchtower(x, y, s, wx, wy, level = 1) {
    const lvl = Math.min(5, Math.max(1, level || 1)) - 1;
    const colors = EXTRA_BUILDING_COLORS.watchtower[lvl];
    const time = pixelTime || Date.now() / 1000;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x + s * 0.2 + 4, y + s * 0.15 + 4, s * 0.65, s * 0.85);

    // Legendary glow
    if (lvl === 4) {
        const glowPulse = Math.sin(time * 2) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(170, 255, 170, ${0.2 * glowPulse})`;
        ctx.fillRect(x - 4, y - s * 0.2, s + 8, s * 1.2 + 8);
    }

    // Support legs (A-frame)
    ctx.fillStyle = colors.wood;
    ctx.save();
    ctx.translate(x + s * 0.2, y + s);
    ctx.rotate(-0.15);
    ctx.fillRect(0, -s * 0.9, s * 0.08, s * 0.9);
    ctx.restore();

    ctx.save();
    ctx.translate(x + s * 0.8, y + s);
    ctx.rotate(0.15);
    ctx.fillRect(-s * 0.08, -s * 0.9, s * 0.08, s * 0.9);
    ctx.restore();

    // Cross braces
    ctx.fillStyle = colors.ladder;
    ctx.fillRect(x + s * 0.25, y + s * 0.5, s * 0.5, s * 0.04);
    ctx.fillRect(x + s * 0.28, y + s * 0.7, s * 0.44, s * 0.04);

    // Platform
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.1, y + s * 0.15, s * 0.8, s * 0.38);
    ctx.fillStyle = colors.platform;
    ctx.fillRect(x + s * 0.12, y + s * 0.17, s * 0.76, s * 0.34);

    // Platform floor planks
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(x + s * 0.15, y + s * 0.45, s * 0.7, 2);

    // Railing
    ctx.fillStyle = colors.wood;
    ctx.fillRect(x + s * 0.1, y + s * 0.15, s * 0.8, s * 0.04);
    ctx.fillRect(x + s * 0.1, y + s * 0.15, s * 0.04, s * 0.2);
    ctx.fillRect(x + s * 0.86, y + s * 0.15, s * 0.04, s * 0.2);

    // Stone base for level 3+
    if (lvl >= 2 && colors.stone) {
        ctx.fillStyle = colors.stone;
        ctx.fillRect(x + s * 0.15, y + s * 0.85, s * 0.7, s * 0.15);
    }

    // Ladder
    ctx.fillStyle = colors.ladder;
    ctx.fillRect(x + s * 0.45, y + s * 0.35, s * 0.03, s * 0.6);
    ctx.fillRect(x + s * 0.55, y + s * 0.35, s * 0.03, s * 0.6);
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(x + s * 0.45, y + s * (0.4 + i * 0.1), s * 0.13, s * 0.02);
    }

    // Roof for level 2+
    if (lvl >= 1) {
        ctx.fillStyle = colors.ladder;
        ctx.beginPath();
        ctx.moveTo(x + s * 0.05, y + s * 0.18);
        ctx.lineTo(x + s * 0.5, y - s * 0.05);
        ctx.lineTo(x + s * 0.95, y + s * 0.18);
        ctx.closePath();
        ctx.fill();
    }

    // Torch/lantern for level 4+
    if (lvl >= 3) {
        ctx.fillStyle = '#ffaa44';
        ctx.globalAlpha = 0.7 + Math.sin(time * 6) * 0.2;
        ctx.fillRect(x + s * 0.7, y + s * 0.22, s * 0.08, s * 0.1);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(x + s * 0.72, y + s * 0.3, s * 0.04, s * 0.08);
    }

    // Flag for level 5
    if (lvl === 4) {
        const flagWave = Math.sin(time * 4) * 2;
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(x + s * 0.48, y - s * 0.15, 3, s * 0.2);
        ctx.fillStyle = '#44aa44';
        ctx.beginPath();
        ctx.moveTo(x + s * 0.51, y - s * 0.13);
        ctx.quadraticCurveTo(x + s * 0.6 + flagWave, y - s * 0.1, x + s * 0.65, y - s * 0.08 + flagWave * 0.3);
        ctx.lineTo(x + s * 0.65, y - s * 0.02 + flagWave * 0.3);
        ctx.quadraticCurveTo(x + s * 0.6 + flagWave * 0.5, y - s * 0.04, x + s * 0.51, y - s * 0.05);
        ctx.closePath();
        ctx.fill();
    }
}

// ============= STORAGE - 5 LEVELS =============
function renderStorage(x, y, s, wx, wy, level = 1) {
    const lvl = Math.min(5, Math.max(1, level || 1)) - 1;
    const colors = EXTRA_BUILDING_COLORS.storage[lvl];
    const time = pixelTime || Date.now() / 1000;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x + 4, y + 4, s, s);

    // Legendary glow
    if (lvl === 4) {
        const glowPulse = Math.sin(time * 2) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(255, 221, 170, ${0.2 * glowPulse})`;
        ctx.fillRect(x - 4, y - 4, s + 8, s + 8);
    }

    // Main building
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x - 1, y + s * 0.2 - 1, s + 2, s * 0.82);
    ctx.fillStyle = colors.wall;
    ctx.fillRect(x, y + s * 0.22, s, s * 0.78);

    // Horizontal planks
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(x, y + s * (0.3 + i * 0.15), s, 2);
    }

    // Roof
    ctx.fillStyle = colors.roof;
    ctx.beginPath();
    ctx.moveTo(x - 4, y + s * 0.25);
    ctx.lineTo(x + s / 2, y);
    ctx.lineTo(x + s + 4, y + s * 0.25);
    ctx.closePath();
    ctx.fill();

    // Roof shingles
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 4 + lvl; col++) {
            const sx = x + s * 0.1 + col * (s * 0.8 / (4 + lvl));
            const sy = y + s * (0.08 + row * 0.08);
            ctx.fillRect(sx, sy, s * (0.7 / (4 + lvl)), 2);
        }
    }

    // Large doors
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s * 0.15, y + s * 0.4, s * 0.7, s * 0.62);
    ctx.fillStyle = colors.door;
    ctx.fillRect(x + s * 0.17, y + s * 0.42, s * 0.66, s * 0.58);

    // Door split
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + s * 0.49, y + s * 0.42, 3, s * 0.58);

    // Door handles
    ctx.fillStyle = '#555555';
    ctx.fillRect(x + s * 0.42, y + s * 0.65, s * 0.06, s * 0.04);
    ctx.fillRect(x + s * 0.52, y + s * 0.65, s * 0.06, s * 0.04);

    // Cross pattern on doors
    ctx.fillStyle = colors.wall;
    ctx.fillRect(x + s * 0.2, y + s * 0.55, s * 0.25, 3);
    ctx.fillRect(x + s * 0.3, y + s * 0.45, 3, s * 0.25);
    ctx.fillRect(x + s * 0.55, y + s * 0.55, s * 0.25, 3);
    ctx.fillRect(x + s * 0.65, y + s * 0.45, 3, s * 0.25);

    // Crates visible for level 3+
    if (lvl >= 2) {
        ctx.fillStyle = '#8a7a5a';
        ctx.fillRect(x + s * 0.8, y + s * 0.75, s * 0.15, s * 0.2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(x + s * 0.8, y + s * 0.83, s * 0.15, 2);
    }

    // Sign for level 4+
    if (lvl >= 3) {
        ctx.fillStyle = colors.door;
        ctx.fillRect(x + s * 0.35, y + s * 0.28, s * 0.3, s * 0.08);
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.floor(s * 0.06)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('STORAGE', x + s * 0.5, y + s * 0.34);
    }
}

// ============= ALTAR - 5 LEVELS =============
function renderAltar(x, y, s, wx, wy, level = 1) {
    const lvl = Math.min(5, Math.max(1, level || 1)) - 1;
    const colors = EXTRA_BUILDING_COLORS.altar[lvl];
    const time = pixelTime || Date.now() / 1000;

    // Mystical ground glow
    const glowIntensity = 0.15 + lvl * 0.05;
    const glowPulse = Math.sin(time * 2) * 0.1 + 0.9;
    const glow = ctx.createRadialGradient(x + s / 2, y + s / 2, 0, x + s / 2, y + s / 2, s * 0.7);
    glow.addColorStop(0, `rgba(170, 68, 170, ${glowIntensity * glowPulse})`);
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - s * 0.2, y - s * 0.2, s * 1.4, s * 1.4);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + s / 2 + 3, y + s * 0.9 + 3, s * 0.4, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Base platform (larger with level)
    const baseWidth = s * (0.7 + lvl * 0.04);
    const baseHeight = s * 0.12;
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x + s / 2 - baseWidth / 2 - 2, y + s * 0.8, baseWidth + 4, baseHeight + 4);
    ctx.fillStyle = colors.stone;
    ctx.fillRect(x + s / 2 - baseWidth / 2, y + s * 0.82, baseWidth, baseHeight);

    // Runes on base (more with level)
    ctx.fillStyle = colors.glow;
    ctx.globalAlpha = 0.5 + Math.sin(time * 3) * 0.3;
    for (let i = 0; i < 2 + lvl; i++) {
        const rx = x + s / 2 - baseWidth / 2 + s * 0.08 + i * (baseWidth / (3 + lvl));
        ctx.fillRect(rx, y + s * 0.85, s * 0.04, s * 0.06);
    }
    ctx.globalAlpha = 1;

    // Middle pedestal
    const midWidth = s * (0.35 + lvl * 0.02);
    ctx.fillStyle = colors.stone;
    ctx.fillRect(x + s / 2 - midWidth / 2, y + s * 0.55, midWidth, s * 0.28);

    // Pillar details
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(x + s / 2 - midWidth / 2 + 2, y + s * 0.58, midWidth - 4, 2);
    ctx.fillRect(x + s / 2 - midWidth / 2 + 2, y + s * 0.75, midWidth - 4, 2);

    // Crystal
    const crystalSize = s * (0.15 + lvl * 0.02);
    const crystalY = y + s * 0.35;
    const float = Math.sin(time * 2) * 3;

    // Crystal glow
    const crystalGlow = ctx.createRadialGradient(
        x + s / 2, crystalY + float, 0,
        x + s / 2, crystalY + float, crystalSize * 2
    );
    crystalGlow.addColorStop(0, colors.glow);
    crystalGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = crystalGlow;
    ctx.globalAlpha = 0.5 + Math.sin(time * 3) * 0.2;
    ctx.fillRect(x + s * 0.2, y + s * 0.1, s * 0.6, s * 0.5);
    ctx.globalAlpha = 1;

    // Crystal shape
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath();
    ctx.moveTo(x + s / 2, crystalY - crystalSize + float);
    ctx.lineTo(x + s / 2 + crystalSize * 0.6, crystalY + float);
    ctx.lineTo(x + s / 2, crystalY + crystalSize * 0.8 + float);
    ctx.lineTo(x + s / 2 - crystalSize * 0.6, crystalY + float);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = colors.crystal;
    ctx.beginPath();
    ctx.moveTo(x + s / 2, crystalY - crystalSize * 0.9 + float);
    ctx.lineTo(x + s / 2 + crystalSize * 0.5, crystalY + float);
    ctx.lineTo(x + s / 2, crystalY + crystalSize * 0.7 + float);
    ctx.lineTo(x + s / 2 - crystalSize * 0.5, crystalY + float);
    ctx.closePath();
    ctx.fill();

    // Crystal inner highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(x + s / 2 - crystalSize * 0.15, crystalY - crystalSize * 0.5 + float);
    ctx.lineTo(x + s / 2 + crystalSize * 0.1, crystalY - crystalSize * 0.3 + float);
    ctx.lineTo(x + s / 2, crystalY + crystalSize * 0.2 + float);
    ctx.lineTo(x + s / 2 - crystalSize * 0.3, crystalY + float);
    ctx.closePath();
    ctx.fill();

    // Candles for level 2+
    if (lvl >= 1) {
        const candlePositions = [
            { cx: x + s * 0.2, cy: y + s * 0.7 },
            { cx: x + s * 0.8, cy: y + s * 0.7 }
        ];
        candlePositions.forEach(({ cx, cy }) => {
            ctx.fillStyle = '#eeeeee';
            ctx.fillRect(cx - 2, cy, 4, s * 0.1);
            ctx.fillStyle = '#ffaa44';
            ctx.globalAlpha = 0.8 + Math.sin(time * 8 + cx) * 0.2;
            ctx.fillRect(cx - 2, cy - 4, 4, 5);
            ctx.globalAlpha = 1;
        });
    }

    // Floating particles for level 4+
    if (lvl >= 3) {
        for (let i = 0; i < 5; i++) {
            const px = x + s * 0.3 + Math.sin(time * 1.5 + i * 1.2) * s * 0.2;
            const py = y + s * 0.4 + Math.cos(time * 2 + i * 1.5) * s * 0.15;
            ctx.fillStyle = colors.glow;
            ctx.globalAlpha = 0.4 + Math.sin(time * 4 + i) * 0.3;
            ctx.fillRect(px, py, 3, 3);
        }
        ctx.globalAlpha = 1;
    }

    // Energy beam for legendary
    if (colors.legendary) {
        ctx.fillStyle = colors.glow;
        ctx.globalAlpha = 0.3 + Math.sin(time * 5) * 0.15;
        ctx.fillRect(x + s * 0.48, y - s * 0.3, s * 0.04, s * 0.5);
        ctx.globalAlpha = 1;
    }
}

// ============= FORGE - 5 LEVELS =============
function renderForge(x, y, s, wx, wy, level = 1) {
    const lvl = Math.min(5, Math.max(1, level || 1)) - 1;
    const colors = EXTRA_BUILDING_COLORS.forge[lvl];
    const time = pixelTime || Date.now() / 1000;

    // Fire glow
    const glowIntensity = 0.2 + lvl * 0.05;
    const glowPulse = Math.sin(time * 4) * 0.1 + 0.9;
    const glow = ctx.createRadialGradient(x + s * 0.5, y + s * 0.6, 0, x + s * 0.5, y + s * 0.6, s * 0.5);
    glow.addColorStop(0, `rgba(255, 100, 0, ${glowIntensity * glowPulse})`);
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - s * 0.1, y, s * 1.2, s);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x + 4, y + s * 0.3 + 4, s, s * 0.72);

    // Brick structure
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(x - 1, y + s * 0.25 - 1, s + 2, s * 0.77);
    ctx.fillStyle = colors.brick;
    ctx.fillRect(x, y + s * 0.27, s, s * 0.73);

    // Brick pattern
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let row = 0; row < 4; row++) {
        const offset = row % 2 === 0 ? 0 : s * 0.12;
        for (let col = 0; col < 4; col++) {
            ctx.fillRect(x + offset + col * s * 0.24, y + s * (0.3 + row * 0.16), s * 0.2, s * 0.13);
        }
    }

    // Furnace opening
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + s * 0.25, y + s * 0.5, s * 0.5, s * 0.35);

    // Fire inside
    const f1 = Math.sin(time * 12) * 2;
    const f2 = Math.cos(time * 15) * 1.5;

    ctx.fillStyle = colors.fire;
    ctx.beginPath();
    ctx.moveTo(x + s * 0.3, y + s * 0.82);
    ctx.quadraticCurveTo(x + s * 0.4 + f1, y + s * 0.6, x + s * 0.5, y + s * 0.55 + f2);
    ctx.quadraticCurveTo(x + s * 0.6 + f2, y + s * 0.6, x + s * 0.7, y + s * 0.82);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffcc44';
    ctx.beginPath();
    ctx.moveTo(x + s * 0.38, y + s * 0.82);
    ctx.quadraticCurveTo(x + s * 0.45 + f2, y + s * 0.65, x + s * 0.5, y + s * 0.6 + f1);
    ctx.quadraticCurveTo(x + s * 0.55 + f1, y + s * 0.65, x + s * 0.62, y + s * 0.82);
    ctx.closePath();
    ctx.fill();

    // Hot core
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6 + Math.sin(time * 18) * 0.3;
    ctx.fillRect(x + s * 0.46, y + s * 0.7, s * 0.08, s * 0.08);
    ctx.globalAlpha = 1;

    // Chimney
    ctx.fillStyle = colors.brick;
    ctx.fillRect(x + s * 0.65, y - s * 0.1, s * 0.2, s * 0.4);

    // Chimney smoke
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 3; i++) {
        const smokeY = y - s * 0.15 - (time * 20 + i * 10) % 25;
        const smokeX = x + s * 0.73 + Math.sin(time * 2 + i) * 3;
        ctx.fillStyle = '#666666';
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, 4 + i * 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Anvil
    ctx.fillStyle = colors.metal;
    ctx.fillRect(x + s * 0.05, y + s * 0.75, s * 0.15, s * 0.12);
    ctx.fillRect(x + s * 0.02, y + s * 0.7, s * 0.21, s * 0.08);

    // Bellows for level 2+
    if (lvl >= 1) {
        ctx.fillStyle = colors.brick;
        ctx.fillRect(x + s * 0.78, y + s * 0.55, s * 0.18, s * 0.25);
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(x + s * 0.8, y + s * 0.6, s * 0.14, s * 0.04);
        ctx.fillRect(x + s * 0.8, y + s * 0.7, s * 0.14, s * 0.04);
    }

    // Tools for level 3+
    if (lvl >= 2) {
        // Tongs
        ctx.fillStyle = colors.metal;
        ctx.fillRect(x + s * 0.02, y + s * 0.55, s * 0.04, s * 0.15);
        // Hammer
        ctx.fillRect(x + s * 0.08, y + s * 0.5, s * 0.03, s * 0.2);
        ctx.fillRect(x + s * 0.05, y + s * 0.48, s * 0.09, s * 0.05);
    }

    // Heated metal on anvil for level 4+
    if (lvl >= 3) {
        ctx.fillStyle = colors.fire;
        ctx.globalAlpha = 0.8 + Math.sin(time * 6) * 0.2;
        ctx.fillRect(x + s * 0.07, y + s * 0.68, s * 0.08, s * 0.03);
        ctx.globalAlpha = 1;
    }

    // Legendary glow
    if (lvl === 4) {
        ctx.fillStyle = `rgba(255, 204, 102, ${0.2 + Math.sin(time * 3) * 0.1})`;
        ctx.fillRect(x - 3, y - 3, s + 6, s + 6);
    }
}

// ============= GARDEN - 5 LEVELS =============
function renderGarden(x, y, s, wx, wy, level = 1) {
    const lvl = Math.min(5, Math.max(1, level || 1)) - 1;
    const colors = EXTRA_BUILDING_COLORS.garden[lvl];
    const time = pixelTime || Date.now() / 1000;

    // Legendary glow
    if (lvl === 4) {
        const glowPulse = Math.sin(time * 2) * 0.15 + 0.85;
        ctx.fillStyle = `rgba(255, 238, 204, ${0.15 * glowPulse})`;
        ctx.fillRect(x - 3, y - 3, s + 6, s + 6);
    }

    // Soil base
    ctx.fillStyle = colors.soil;
    ctx.fillRect(x, y, s, s);

    // Soil texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
            if (seededRandom(i + wx, j + wy) > 0.6) {
                ctx.fillRect(x + i * s / 6 + 2, y + j * s / 6 + 2, 3, 2);
            }
        }
    }

    // Stone border
    ctx.fillStyle = '#7a7a7a';
    ctx.fillRect(x, y, s, 4);
    ctx.fillRect(x, y + s - 4, s, 4);
    ctx.fillRect(x, y, 4, s);
    ctx.fillRect(x + s - 4, y, 4, s);

    // Flowers
    const flowerCount = 4 + lvl * 2;
    for (let i = 0; i < flowerCount; i++) {
        const fx = x + s * 0.15 + seededRandom(i, wx) * s * 0.7;
        const fy = y + s * 0.15 + seededRandom(wx, i) * s * 0.6;
        const sway = Math.sin(time * 2 + i) * 2;
        const flowerColor = colors.flowers[i % colors.flowers.length];

        // Stem
        ctx.fillStyle = '#2a6a20';
        ctx.fillRect(fx + 1 + sway * 0.3, fy + 4, 2, s * 0.15);

        // Leaves
        ctx.fillStyle = '#3a8a30';
        ctx.fillRect(fx - 2 + sway * 0.2, fy + 8, 4, 3);
        ctx.fillRect(fx + 2 + sway * 0.2, fy + 10, 4, 3);

        // Flower head
        ctx.fillStyle = flowerColor;
        ctx.beginPath();
        ctx.arc(fx + 2 + sway, fy + 2, s * 0.06, 0, Math.PI * 2);
        ctx.fill();

        // Flower center
        ctx.fillStyle = '#ffff88';
        ctx.beginPath();
        ctx.arc(fx + 2 + sway, fy + 2, s * 0.025, 0, Math.PI * 2);
        ctx.fill();
    }

    // Butterflies for level 3+
    if (lvl >= 2) {
        for (let i = 0; i < 1 + Math.floor(lvl / 2); i++) {
            const bx = x + s * 0.3 + Math.sin(time * 1.5 + i * 2) * s * 0.3;
            const by = y + s * 0.25 + Math.cos(time * 2 + i * 2) * s * 0.15;
            const wingFlap = Math.sin(time * 15 + i * 3) * 0.3;

            ctx.fillStyle = i % 2 === 0 ? '#ffaa44' : '#ff88cc';
            ctx.save();
            ctx.translate(bx, by);
            ctx.scale(1, 0.5 + wingFlap);
            ctx.beginPath();
            ctx.arc(-2, 0, 3, 0, Math.PI * 2);
            ctx.arc(2, 0, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Body
            ctx.fillStyle = '#222222';
            ctx.fillRect(bx - 1, by - 1, 2, 4);
        }
    }

    // Decorative fence corner posts for level 4+
    if (lvl >= 3) {
        ctx.fillStyle = colors.fence;
        ctx.fillRect(x, y, 6, 8);
        ctx.fillRect(x + s - 6, y, 6, 8);
        ctx.fillRect(x, y + s - 8, 6, 8);
        ctx.fillRect(x + s - 6, y + s - 8, 6, 8);
    }

    // Fairy lights for legendary
    if (lvl === 4) {
        for (let i = 0; i < 6; i++) {
            const lx = x + s * (0.1 + i * 0.15);
            const ly = y + s * 0.1 + Math.sin(time + i) * 3;
            ctx.fillStyle = `rgba(255, 255, 200, ${0.6 + Math.sin(time * 5 + i) * 0.3})`;
            ctx.beginPath();
            ctx.arc(lx, ly, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Export for use in environment.js render calls
window.renderArmory = renderArmory;
window.renderHospital = renderHospital;
window.renderBrewery = renderBrewery;
window.renderWellBuilding = renderWellBuilding;
window.renderStable = renderStable;
window.renderMine = renderMine;
window.renderBarricade = renderBarricade;
window.renderWatchtower = renderWatchtower;
window.renderStorage = renderStorage;
window.renderAltar = renderAltar;
window.renderForge = renderForge;
window.renderGarden = renderGarden;
