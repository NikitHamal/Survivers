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

// Cache per-image non-transparent bounds so large sprites can be grounded by
// their visible pixels instead of transparent padding.
const trimmedImageCache = new WeakMap();
const trimProbeCanvas = document.createElement('canvas');
const trimProbeCtx = trimProbeCanvas.getContext('2d', { willReadFrequently: true });

function getTrimmedImageMetrics(img) {
    if (!img || !img.complete || img.naturalWidth <= 0 || img.naturalHeight <= 0) return null;

    const cached = trimmedImageCache.get(img);
    if (cached) return cached;

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    trimProbeCanvas.width = w;
    trimProbeCanvas.height = h;
    trimProbeCtx.clearRect(0, 0, w, h);

    try {
        trimProbeCtx.drawImage(img, 0, 0, w, h);
        const pixels = trimProbeCtx.getImageData(0, 0, w, h).data;

        let minX = w, minY = h, maxX = -1, maxY = -1;
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) continue;
            const p = (i - 3) / 4;
            const x = p % w;
            const y = Math.floor(p / w);
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }

        const metrics = (maxX < minX || maxY < minY)
            ? { srcX: 0, srcY: 0, srcW: w, srcH: h }
            : { srcX: minX, srcY: minY, srcW: maxX - minX + 1, srcH: maxY - minY + 1 };

        trimmedImageCache.set(img, metrics);
        return metrics;
    } catch (err) {
        console.warn('Sprite trim probe failed:', err);
        return { srcX: 0, srcY: 0, srcW: w, srcH: h };
    }
}
