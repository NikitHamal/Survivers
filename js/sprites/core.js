// ============= SPRITE CORE & UTILS =============

// Color palettes (Pokemon GBC inspired)
const PALETTE = {
    // Grass colors
    grass1: '#3d8c40',
    grass2: '#4aa84d',
    grass3: '#2d6e30',
    grassDark: '#1d4e20',

    // Earth/dirt
    dirt1: '#8b6914',
    dirt2: '#a67c00',
    dirt3: '#6b4f0f',

    // Water
    water1: '#3890d8',
    water2: '#5cb0f8',
    water3: '#2070b0',
    waterDeep: '#185890',

    // Wood
    wood1: '#6b4423',
    wood2: '#8b5a2b',
    wood3: '#4a2f17',

    // Stone
    stone1: '#808080',
    stone2: '#a0a0a0',
    stone3: '#606060',
    stoneDark: '#404040',

    // Foliage
    leaf1: '#228b22',
    leaf2: '#32a852',
    leaf3: '#145214',

    // Skin tones
    skin1: '#ffd4a8',
    skin2: '#e8b888',
    skinShadow: '#c89868',

    // Zombie
    zombie1: '#5a8a5a',
    zombie2: '#4a6a4a',
    zombie3: '#3a5a3a',
    zombieEye: '#ff2222',

    // UI
    outline: '#1a1a2e',
    white: '#f8f8f8',
    black: '#0a0a0a'
};

function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Pixel-perfect drawing helpers
function drawPixelRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
}

function drawPixelCircle(cx, cy, r, color) {
    ctx.fillStyle = color;
    const x0 = Math.floor(cx);
    const y0 = Math.floor(cy);
    const ri = Math.floor(r);

    for (let dy = -ri; dy <= ri; dy++) {
        for (let dx = -ri; dx <= ri; dx++) {
            if (dx * dx + dy * dy <= ri * ri) {
                ctx.fillRect(x0 + dx, y0 + dy, 1, 1);
            }
        }
    }
}

// Dithering pattern for retro gradients
function drawDitheredRect(x, y, w, h, color1, color2, pattern = 'checker') {
    ctx.fillStyle = color1;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color2;

    for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
            let draw = false;
            if (pattern === 'checker') {
                draw = (px + py) % 2 === 0;
            } else if (pattern === 'horizontal') {
                draw = py % 2 === 0;
            } else if (pattern === 'vertical') {
                draw = px % 2 === 0;
            } else if (pattern === 'sparse') {
                draw = (px + py) % 4 === 0;
            }
            if (draw) {
                ctx.fillRect(x + px, y + py, 1, 1);
            }
        }
    }
}

// Outline drawing for that classic Pokemon look
function drawOutlinedRect(x, y, w, h, fillColor, outlineColor = PALETTE.outline) {
    ctx.fillStyle = outlineColor;
    ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, w, h);
}

// Helper function for seeded random
function seededRandom(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
}

// Simple shadow rendering
function renderEntityShadow(ctx, cx, cy, radius) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius, radius * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
}
