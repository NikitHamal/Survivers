// ============================================
// ANIMAL SPRITE SYSTEM - Modular Pixel Art Animals
// ============================================
// Production-grade procedural pixel art sprites for all animal types
// Supports animations, directions, and visual variations

const AnimalSprites = (function () {
    'use strict';

    // ============= COLOR PALETTES =============
    const ANIMAL_PALETTES = {
        wolf: {
            body: '#6a6a6a',
            bodyDark: '#4a4a4a',
            bodyLight: '#8a8a8a',
            belly: '#9a9a9a',
            eyes: '#ffcc00',
            nose: '#1a1a1a',
            outline: '#1a1a2e'
        },
        bear: {
            body: '#4a3520',
            bodyDark: '#2a1510',
            bodyLight: '#6a4530',
            belly: '#5a4530',
            eyes: '#1a1a1a',
            nose: '#1a1a1a',
            outline: '#1a1a2e'
        },
        tiger: {
            body: '#d4881a',
            bodyDark: '#a4580a',
            bodyLight: '#f4a82a',
            stripes: '#1a1a1a',
            belly: '#f8e8c8',
            eyes: '#44aa44',
            nose: '#1a1a1a',
            outline: '#1a1a2e'
        },
        fox: {
            body: '#d4642a',
            bodyDark: '#a4441a',
            bodyLight: '#f4843a',
            belly: '#f8e8d8',
            tailTip: '#f8f8f8',
            eyes: '#1a1a1a',
            nose: '#1a1a1a',
            outline: '#1a1a2e'
        },
        hawk: {
            body: '#8b6914',
            bodyDark: '#5b3904',
            bodyLight: '#ab8924',
            belly: '#c8b888',
            wings: '#6b4914',
            beak: '#f4a82a',
            eyes: '#1a1a1a',
            outline: '#1a1a2e'
        },
        horse: {
            body: '#8b4513',
            bodyDark: '#5b2503',
            bodyLight: '#ab6523',
            mane: '#2a1a0a',
            hooves: '#1a1a1a',
            eyes: '#1a1a1a',
            nose: '#3a2a1a',
            outline: '#1a1a2e'
        },
        camel: {
            body: '#c4a35a',
            bodyDark: '#947330',
            bodyLight: '#d4b36a',
            hump: '#b4934a',
            belly: '#d4c38a',
            eyes: '#1a1a1a',
            nose: '#6a5a3a',
            outline: '#1a1a2e'
        },
        boar: {
            body: '#5a4030',
            bodyDark: '#3a2010',
            bodyLight: '#7a5040',
            snout: '#d4a888',
            tusks: '#f8f8e8',
            eyes: '#1a1a1a',
            outline: '#1a1a2e'
        },
        beaver: {
            body: '#4a3020',
            bodyDark: '#2a1010',
            bodyLight: '#6a4030',
            belly: '#8a7060',
            tail: '#3a2515',
            teeth: '#f8f8e8',
            eyes: '#1a1a1a',
            outline: '#1a1a2e'
        },
        wolfAlpha: {
            body: '#2a2a2a',
            bodyDark: '#1a1a1a',
            bodyLight: '#4a4a4a',
            belly: '#3a3a3a',
            eyes: '#ff4444',
            nose: '#1a1a1a',
            glow: '#ff4444',
            outline: '#1a1a2e'
        }
    };

    // ============= SPRITE CACHE =============
    const spriteCache = new Map();
    const CACHE_SIZE = 100;

    function getCacheKey(type, direction, frame, scale, variant) {
        return `${type}_${direction}_${frame}_${scale}_${variant || 'default'}`;
    }

    function getCachedSprite(key) {
        if (spriteCache.has(key)) {
            const cached = spriteCache.get(key);
            cached.lastAccess = Date.now();
            return cached.canvas;
        }
        return null;
    }

    function setCachedSprite(key, canvas) {
        if (spriteCache.size >= CACHE_SIZE) {
            let oldestKey = null;
            let oldestTime = Infinity;
            for (const [k, v] of spriteCache) {
                if (v.lastAccess < oldestTime) {
                    oldestTime = v.lastAccess;
                    oldestKey = k;
                }
            }
            if (oldestKey) {
                spriteCache.delete(oldestKey);
            }
        }
        spriteCache.set(key, { canvas, lastAccess: Date.now() });
    }

    // ============= UTILITY FUNCTIONS =============
    function createOffscreenCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    function drawPixel(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    }

    function drawRect(ctx, x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
    }

    function drawEllipse(ctx, cx, cy, rx, ry, color) {
        ctx.fillStyle = color;
        for (let dy = -ry; dy <= ry; dy++) {
            for (let dx = -rx; dx <= rx; dx++) {
                if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1) {
                    ctx.fillRect(Math.floor(cx + dx), Math.floor(cy + dy), 1, 1);
                }
            }
        }
    }

    function drawOutlinedEllipse(ctx, cx, cy, rx, ry, fillColor, outlineColor) {
        // Draw outline first (1 pixel larger)
        drawEllipse(ctx, cx, cy, rx + 1, ry + 1, outlineColor);
        // Draw fill
        drawEllipse(ctx, cx, cy, rx, ry, fillColor);
    }

    // ============= WOLF SPRITE =============
    function renderWolfSprite(canvas, direction, frame, palette) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const p = palette || ANIMAL_PALETTES.wolf;

        ctx.clearRect(0, 0, w, h);

        const walkOffset = Math.sin(frame * Math.PI / 2) * 1;
        const legOffset = Math.sin(frame * Math.PI / 2) * 2;

        // Facing direction determines sprite flip
        const flip = direction === 2; // Left
        const facingDown = direction === 1;
        const facingUp = direction === 3;

        ctx.save();
        if (flip) {
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
        }

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        drawEllipse(ctx, w / 2, h - 3, 6, 2, 'rgba(0,0,0,0.25)');

        // Back legs
        drawRect(ctx, w / 2 - 5 + legOffset, h - 8, 3, 6, p.outline);
        drawRect(ctx, w / 2 - 4 + legOffset, h - 7, 2, 4, p.bodyDark);
        drawRect(ctx, w / 2 + 3 - legOffset, h - 8, 3, 6, p.outline);
        drawRect(ctx, w / 2 + 4 - legOffset, h - 7, 2, 4, p.bodyDark);

        // Tail
        if (!facingDown) {
            drawRect(ctx, w / 2 + 5, h / 2 + 2, 5, 4, p.outline);
            drawRect(ctx, w / 2 + 6, h / 2 + 3, 3, 2, p.body);
        }

        // Body outline
        drawOutlinedEllipse(ctx, w / 2, h / 2 + 2 + walkOffset, 7, 5, p.body, p.outline);

        // Body highlight
        drawEllipse(ctx, w / 2 - 2, h / 2 + 1 + walkOffset, 3, 2, p.bodyLight);

        // Belly
        drawEllipse(ctx, w / 2, h / 2 + 4 + walkOffset, 4, 2, p.belly);

        // Front legs
        drawRect(ctx, w / 2 - 4 - legOffset, h - 7, 3, 6, p.outline);
        drawRect(ctx, w / 2 - 3 - legOffset, h - 6, 2, 4, p.body);
        drawRect(ctx, w / 2 + 2 + legOffset, h - 7, 3, 6, p.outline);
        drawRect(ctx, w / 2 + 3 + legOffset, h - 6, 2, 4, p.body);

        // Head
        const headY = h / 2 - 4 + walkOffset;
        const headX = facingDown ? w / 2 : (facingUp ? w / 2 : w / 2 - 3);

        drawOutlinedEllipse(ctx, headX, headY, 5, 4, p.body, p.outline);

        // Ears
        if (facingDown || facingUp) {
            // Both ears visible
            drawRect(ctx, headX - 5, headY - 4, 3, 4, p.outline);
            drawRect(ctx, headX - 4, headY - 3, 2, 3, p.body);
            drawRect(ctx, headX + 3, headY - 4, 3, 4, p.outline);
            drawRect(ctx, headX + 4, headY - 3, 2, 3, p.body);
        } else {
            // Side view - one prominent ear
            drawRect(ctx, headX - 2, headY - 5, 4, 5, p.outline);
            drawRect(ctx, headX - 1, headY - 4, 3, 4, p.body);
            drawRect(ctx, headX, headY - 3, 1, 2, p.bodyDark);
        }

        // Snout
        if (facingDown) {
            drawRect(ctx, headX - 2, headY + 1, 5, 3, p.outline);
            drawRect(ctx, headX - 1, headY + 2, 3, 1, p.bodyLight);
            // Nose
            drawRect(ctx, headX - 1, headY + 3, 3, 2, p.nose);
        } else if (!facingUp) {
            drawRect(ctx, headX - 6, headY, 4, 3, p.outline);
            drawRect(ctx, headX - 5, headY + 1, 2, 1, p.bodyLight);
            // Nose
            drawRect(ctx, headX - 6, headY, 2, 2, p.nose);
        }

        // Eyes
        if (facingDown) {
            drawPixel(ctx, headX - 2, headY - 1, p.eyes);
            drawPixel(ctx, headX + 2, headY - 1, p.eyes);
        } else if (!facingUp) {
            drawPixel(ctx, headX - 3, headY - 1, p.eyes);
            drawPixel(ctx, headX - 2, headY - 1, '#000');
        }

        ctx.restore();
    }

    // ============= BEAR SPRITE =============
    function renderBearSprite(canvas, direction, frame, palette) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const p = palette || ANIMAL_PALETTES.bear;

        ctx.clearRect(0, 0, w, h);

        const walkOffset = Math.sin(frame * Math.PI / 2) * 1;
        const legOffset = Math.sin(frame * Math.PI / 2) * 1.5;

        const flip = direction === 2;
        const facingDown = direction === 1;
        const facingUp = direction === 3;

        ctx.save();
        if (flip) {
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
        }

        // Shadow (larger for bear)
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        drawEllipse(ctx, w / 2, h - 2, 9, 3, 'rgba(0,0,0,0.3)');

        // Back legs (thick)
        drawRect(ctx, w / 2 - 7 + legOffset, h - 10, 5, 8, p.outline);
        drawRect(ctx, w / 2 - 6 + legOffset, h - 9, 3, 6, p.bodyDark);
        drawRect(ctx, w / 2 + 3 - legOffset, h - 10, 5, 8, p.outline);
        drawRect(ctx, w / 2 + 4 - legOffset, h - 9, 3, 6, p.bodyDark);

        // Body (large and round)
        drawOutlinedEllipse(ctx, w / 2, h / 2 + 2 + walkOffset, 10, 7, p.body, p.outline);

        // Body shading
        drawEllipse(ctx, w / 2 - 3, h / 2 + walkOffset, 4, 3, p.bodyLight);

        // Belly
        drawEllipse(ctx, w / 2, h / 2 + 5 + walkOffset, 5, 3, p.belly);

        // Front legs
        drawRect(ctx, w / 2 - 6 - legOffset, h - 9, 5, 8, p.outline);
        drawRect(ctx, w / 2 - 5 - legOffset, h - 8, 3, 6, p.body);
        drawRect(ctx, w / 2 + 2 + legOffset, h - 9, 5, 8, p.outline);
        drawRect(ctx, w / 2 + 3 + legOffset, h - 8, 3, 6, p.body);

        // Head
        const headY = h / 2 - 6 + walkOffset;
        const headX = facingDown ? w / 2 : (facingUp ? w / 2 : w / 2 - 4);

        drawOutlinedEllipse(ctx, headX, headY, 7, 6, p.body, p.outline);

        // Ears (round)
        if (facingDown || facingUp) {
            drawOutlinedEllipse(ctx, headX - 5, headY - 4, 3, 3, p.body, p.outline);
            drawEllipse(ctx, headX - 5, headY - 4, 1, 1, p.bodyDark);
            drawOutlinedEllipse(ctx, headX + 5, headY - 4, 3, 3, p.body, p.outline);
            drawEllipse(ctx, headX + 5, headY - 4, 1, 1, p.bodyDark);
        } else {
            drawOutlinedEllipse(ctx, headX, headY - 6, 3, 3, p.body, p.outline);
            drawEllipse(ctx, headX, headY - 6, 1, 1, p.bodyDark);
        }

        // Snout
        if (facingDown) {
            drawRect(ctx, headX - 3, headY + 2, 7, 4, p.outline);
            drawRect(ctx, headX - 2, headY + 3, 5, 2, p.bodyLight);
            drawRect(ctx, headX - 1, headY + 5, 3, 2, p.nose);
        } else if (!facingUp) {
            drawRect(ctx, headX - 9, headY, 5, 4, p.outline);
            drawRect(ctx, headX - 8, headY + 1, 3, 2, p.bodyLight);
            drawRect(ctx, headX - 9, headY + 1, 2, 2, p.nose);
        }

        // Eyes
        if (facingDown) {
            drawRect(ctx, headX - 3, headY - 1, 2, 2, p.eyes);
            drawRect(ctx, headX + 2, headY - 1, 2, 2, p.eyes);
        } else if (!facingUp) {
            drawRect(ctx, headX - 4, headY - 1, 2, 2, p.eyes);
        }

        ctx.restore();
    }

    // ============= TIGER SPRITE =============
    function renderTigerSprite(canvas, direction, frame, palette) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const p = palette || ANIMAL_PALETTES.tiger;

        ctx.clearRect(0, 0, w, h);

        const walkOffset = Math.sin(frame * Math.PI / 2) * 1;
        const legOffset = Math.sin(frame * Math.PI / 2) * 2;

        const flip = direction === 2;
        const facingDown = direction === 1;
        const facingUp = direction === 3;

        ctx.save();
        if (flip) {
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
        }

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        drawEllipse(ctx, w / 2, h - 3, 7, 2, 'rgba(0,0,0,0.25)');

        // Back legs
        drawRect(ctx, w / 2 - 5 + legOffset, h - 9, 3, 7, p.outline);
        drawRect(ctx, w / 2 - 4 + legOffset, h - 8, 2, 5, p.bodyDark);
        drawRect(ctx, w / 2 + 3 - legOffset, h - 9, 3, 7, p.outline);
        drawRect(ctx, w / 2 + 4 - legOffset, h - 8, 2, 5, p.bodyDark);

        // Tail (long and curved)
        if (!facingDown) {
            for (let i = 0; i < 8; i++) {
                const tx = w / 2 + 6 + i;
                const ty = h / 2 + 1 + Math.sin(i * 0.5 + frame) * 2;
                drawRect(ctx, tx, ty, 2, 3, p.outline);
                drawRect(ctx, tx, ty + 1, 2, 1, i % 2 === 0 ? p.body : p.stripes);
            }
        }

        // Body
        drawOutlinedEllipse(ctx, w / 2, h / 2 + 2 + walkOffset, 8, 5, p.body, p.outline);

        // Tiger stripes on body
        for (let i = -2; i <= 2; i++) {
            const stripeX = w / 2 + i * 3;
            drawRect(ctx, stripeX, h / 2 + walkOffset, 1, 4, p.stripes);
        }

        // Body highlight
        drawEllipse(ctx, w / 2 - 2, h / 2 + walkOffset, 3, 2, p.bodyLight);

        // Belly
        drawEllipse(ctx, w / 2, h / 2 + 4 + walkOffset, 4, 2, p.belly);

        // Front legs
        drawRect(ctx, w / 2 - 4 - legOffset, h - 8, 3, 7, p.outline);
        drawRect(ctx, w / 2 - 3 - legOffset, h - 7, 2, 5, p.body);
        drawRect(ctx, w / 2 + 2 + legOffset, h - 8, 3, 7, p.outline);
        drawRect(ctx, w / 2 + 3 + legOffset, h - 7, 2, 5, p.body);

        // Head
        const headY = h / 2 - 5 + walkOffset;
        const headX = facingDown ? w / 2 : (facingUp ? w / 2 : w / 2 - 3);

        drawOutlinedEllipse(ctx, headX, headY, 6, 5, p.body, p.outline);

        // Head stripes
        drawRect(ctx, headX - 1, headY - 3, 1, 3, p.stripes);
        drawRect(ctx, headX + 1, headY - 3, 1, 3, p.stripes);

        // Ears
        if (facingDown || facingUp) {
            drawRect(ctx, headX - 5, headY - 4, 3, 4, p.outline);
            drawRect(ctx, headX - 4, headY - 3, 2, 2, p.body);
            drawRect(ctx, headX + 3, headY - 4, 3, 4, p.outline);
            drawRect(ctx, headX + 4, headY - 3, 2, 2, p.body);
        } else {
            drawRect(ctx, headX - 1, headY - 6, 4, 4, p.outline);
            drawRect(ctx, headX, headY - 5, 2, 2, p.body);
        }

        // Muzzle
        if (facingDown) {
            drawRect(ctx, headX - 2, headY + 1, 5, 4, p.outline);
            drawRect(ctx, headX - 1, headY + 2, 3, 2, p.belly);
            drawRect(ctx, headX - 1, headY + 4, 3, 1, p.nose);
        } else if (!facingUp) {
            drawRect(ctx, headX - 7, headY, 4, 4, p.outline);
            drawRect(ctx, headX - 6, headY + 1, 2, 2, p.belly);
            drawRect(ctx, headX - 7, headY + 1, 2, 1, p.nose);
        }

        // Eyes
        if (facingDown) {
            drawPixel(ctx, headX - 2, headY - 1, '#fff');
            drawPixel(ctx, headX - 2, headY, p.eyes);
            drawPixel(ctx, headX + 2, headY - 1, '#fff');
            drawPixel(ctx, headX + 2, headY, p.eyes);
        } else if (!facingUp) {
            drawPixel(ctx, headX - 3, headY - 1, '#fff');
            drawPixel(ctx, headX - 3, headY, p.eyes);
        }

        // Whiskers
        if (!facingUp) {
            const whiskerColor = '#888';
            if (facingDown) {
                drawRect(ctx, headX - 5, headY + 2, 2, 1, whiskerColor);
                drawRect(ctx, headX + 4, headY + 2, 2, 1, whiskerColor);
            } else {
                drawRect(ctx, headX - 9, headY + 1, 2, 1, whiskerColor);
                drawRect(ctx, headX - 9, headY + 3, 2, 1, whiskerColor);
            }
        }

        ctx.restore();
    }

    // ============= FOX SPRITE =============
    function renderFoxSprite(canvas, direction, frame, palette) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const p = palette || ANIMAL_PALETTES.fox;

        ctx.clearRect(0, 0, w, h);

        const walkOffset = Math.sin(frame * Math.PI / 2) * 1;
        const legOffset = Math.sin(frame * Math.PI / 2) * 2;

        const flip = direction === 2;
        const facingDown = direction === 1;
        const facingUp = direction === 3;

        ctx.save();
        if (flip) {
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
        }

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        drawEllipse(ctx, w / 2, h - 3, 5, 2, 'rgba(0,0,0,0.2)');

        // Back legs (thin)
        drawRect(ctx, w / 2 - 4 + legOffset, h - 7, 2, 5, p.outline);
        drawRect(ctx, w / 2 - 3 + legOffset, h - 6, 1, 4, p.bodyDark);
        drawRect(ctx, w / 2 + 2 - legOffset, h - 7, 2, 5, p.outline);
        drawRect(ctx, w / 2 + 3 - legOffset, h - 6, 1, 4, p.bodyDark);

        // Tail (fluffy with white tip)
        if (!facingDown) {
            for (let i = 0; i < 7; i++) {
                const tx = w / 2 + 4 + i;
                const ty = h / 2 - 1 + Math.sin(i * 0.4 + frame) * 2;
                const tw = 4 - Math.floor(i / 2);
                const color = i > 4 ? p.tailTip : p.body;
                drawRect(ctx, tx, ty - 1, 2, tw + 2, p.outline);
                drawRect(ctx, tx, ty, 2, tw, color);
            }
        }

        // Body
        drawOutlinedEllipse(ctx, w / 2, h / 2 + 2 + walkOffset, 6, 4, p.body, p.outline);

        // Body highlight
        drawEllipse(ctx, w / 2 - 2, h / 2 + 1 + walkOffset, 2, 2, p.bodyLight);

        // Belly
        drawEllipse(ctx, w / 2, h / 2 + 4 + walkOffset, 3, 2, p.belly);

        // Front legs
        drawRect(ctx, w / 2 - 3 - legOffset, h - 6, 2, 5, p.outline);
        drawRect(ctx, w / 2 - 2 - legOffset, h - 5, 1, 4, p.body);
        drawRect(ctx, w / 2 + 1 + legOffset, h - 6, 2, 5, p.outline);
        drawRect(ctx, w / 2 + 2 + legOffset, h - 5, 1, 4, p.body);

        // Head (pointed)
        const headY = h / 2 - 4 + walkOffset;
        const headX = facingDown ? w / 2 : (facingUp ? w / 2 : w / 2 - 2);

        drawOutlinedEllipse(ctx, headX, headY, 5, 4, p.body, p.outline);

        // White face markings
        if (facingDown) {
            drawEllipse(ctx, headX, headY + 1, 2, 2, p.belly);
        }

        // Ears (large and pointy)
        if (facingDown || facingUp) {
            drawRect(ctx, headX - 5, headY - 5, 3, 5, p.outline);
            drawRect(ctx, headX - 4, headY - 4, 2, 4, p.body);
            drawPixel(ctx, headX - 4, headY - 2, p.bodyDark);
            drawRect(ctx, headX + 3, headY - 5, 3, 5, p.outline);
            drawRect(ctx, headX + 4, headY - 4, 2, 4, p.body);
            drawPixel(ctx, headX + 4, headY - 2, p.bodyDark);
        } else {
            drawRect(ctx, headX - 1, headY - 6, 4, 5, p.outline);
            drawRect(ctx, headX, headY - 5, 2, 4, p.body);
            drawPixel(ctx, headX, headY - 3, p.bodyDark);
        }

        // Snout (pointed)
        if (facingDown) {
            drawRect(ctx, headX - 1, headY + 2, 3, 3, p.outline);
            drawRect(ctx, headX, headY + 3, 1, 1, p.belly);
            drawRect(ctx, headX, headY + 4, 1, 1, p.nose);
        } else if (!facingUp) {
            drawRect(ctx, headX - 6, headY, 4, 3, p.outline);
            drawRect(ctx, headX - 5, headY + 1, 2, 1, p.belly);
            drawRect(ctx, headX - 6, headY + 1, 1, 1, p.nose);
        }

        // Eyes
        if (facingDown) {
            drawPixel(ctx, headX - 2, headY, p.eyes);
            drawPixel(ctx, headX + 2, headY, p.eyes);
        } else if (!facingUp) {
            drawPixel(ctx, headX - 2, headY, p.eyes);
        }

        ctx.restore();
    }

    // ============= HAWK SPRITE =============
    function renderHawkSprite(canvas, direction, frame, palette) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const p = palette || ANIMAL_PALETTES.hawk;

        ctx.clearRect(0, 0, w, h);

        const flapOffset = Math.sin(frame * Math.PI) * 3;
        const flip = direction === 2;
        const facingDown = direction === 1;
        const facingUp = direction === 3;

        ctx.save();
        if (flip) {
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
        }

        // Shadow (small for flying)
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        drawEllipse(ctx, w / 2, h - 2, 3, 1, 'rgba(0,0,0,0.15)');

        // Wings (extended)
        if (facingDown || facingUp) {
            // Left wing
            drawRect(ctx, w / 2 - 10, h / 2 - 1 + flapOffset, 8, 4, p.outline);
            drawRect(ctx, w / 2 - 9, h / 2 + flapOffset, 6, 2, p.wings);
            // Right wing
            drawRect(ctx, w / 2 + 3, h / 2 - 1 - flapOffset, 8, 4, p.outline);
            drawRect(ctx, w / 2 + 4, h / 2 - flapOffset, 6, 2, p.wings);
        } else {
            // Side view - one wing visible
            drawRect(ctx, w / 2 - 2, h / 2 - 3 + flapOffset, 6, 6, p.outline);
            drawRect(ctx, w / 2 - 1, h / 2 - 2 + flapOffset, 4, 4, p.wings);
        }

        // Body
        drawOutlinedEllipse(ctx, w / 2, h / 2 + 2, 4, 5, p.body, p.outline);

        // Body highlight
        drawEllipse(ctx, w / 2 - 1, h / 2 + 1, 2, 2, p.bodyLight);

        // Belly
        drawEllipse(ctx, w / 2, h / 2 + 4, 2, 2, p.belly);

        // Tail feathers
        if (!facingDown) {
            drawRect(ctx, w / 2 - 2, h / 2 + 5, 5, 4, p.outline);
            drawRect(ctx, w / 2 - 1, h / 2 + 6, 3, 2, p.wings);
        }

        // Legs (thin)
        drawRect(ctx, w / 2 - 2, h - 5, 1, 4, p.outline);
        drawRect(ctx, w / 2 + 1, h - 5, 1, 4, p.outline);
        // Talons
        drawRect(ctx, w / 2 - 3, h - 2, 2, 1, p.beak);
        drawRect(ctx, w / 2, h - 2, 2, 1, p.beak);

        // Head
        const headY = h / 2 - 4;
        const headX = facingDown ? w / 2 : (facingUp ? w / 2 : w / 2 - 1);

        drawOutlinedEllipse(ctx, headX, headY, 4, 3, p.body, p.outline);

        // Beak
        if (facingDown) {
            drawRect(ctx, headX - 1, headY + 1, 3, 3, p.outline);
            drawRect(ctx, headX, headY + 2, 1, 2, p.beak);
        } else if (!facingUp) {
            drawRect(ctx, headX - 5, headY, 4, 2, p.outline);
            drawRect(ctx, headX - 4, headY, 3, 1, p.beak);
        }

        // Eyes
        if (facingDown) {
            drawPixel(ctx, headX - 2, headY - 1, p.eyes);
            drawPixel(ctx, headX + 2, headY - 1, p.eyes);
        } else if (!facingUp) {
            drawPixel(ctx, headX - 2, headY - 1, '#fff');
            drawPixel(ctx, headX - 1, headY - 1, p.eyes);
        }

        ctx.restore();
    }

    // ============= HORSE SPRITE =============
    function renderHorseSprite(canvas, direction, frame, palette) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const p = palette || ANIMAL_PALETTES.horse;

        ctx.clearRect(0, 0, w, h);

        const walkOffset = Math.sin(frame * Math.PI / 2) * 1;
        const legOffset = Math.sin(frame * Math.PI / 2) * 2;

        const flip = direction === 2;
        const facingDown = direction === 1;
        const facingUp = direction === 3;

        ctx.save();
        if (flip) {
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
        }

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        drawEllipse(ctx, w / 2, h - 2, 8, 3, 'rgba(0,0,0,0.25)');

        // Back legs
        drawRect(ctx, w / 2 - 6 + legOffset, h - 12, 3, 10, p.outline);
        drawRect(ctx, w / 2 - 5 + legOffset, h - 11, 2, 8, p.bodyDark);
        drawRect(ctx, w / 2 - 5 + legOffset, h - 3, 2, 2, p.hooves);
        drawRect(ctx, w / 2 + 4 - legOffset, h - 12, 3, 10, p.outline);
        drawRect(ctx, w / 2 + 5 - legOffset, h - 11, 2, 8, p.bodyDark);
        drawRect(ctx, w / 2 + 5 - legOffset, h - 3, 2, 2, p.hooves);

        // Tail
        if (!facingDown) {
            for (let i = 0; i < 6; i++) {
                const tx = w / 2 + 6 + i / 2;
                const ty = h / 2 + 3 + i;
                drawRect(ctx, tx - 1, ty, 3, 2, p.outline);
                drawRect(ctx, tx, ty, 1, 2, p.mane);
            }
        }

        // Body (elongated)
        drawOutlinedEllipse(ctx, w / 2, h / 2 + 1 + walkOffset, 9, 6, p.body, p.outline);

        // Body highlight
        drawEllipse(ctx, w / 2 - 3, h / 2 - 1 + walkOffset, 4, 3, p.bodyLight);

        // Front legs
        drawRect(ctx, w / 2 - 5 - legOffset, h - 11, 3, 10, p.outline);
        drawRect(ctx, w / 2 - 4 - legOffset, h - 10, 2, 8, p.body);
        drawRect(ctx, w / 2 - 4 - legOffset, h - 3, 2, 2, p.hooves);
        drawRect(ctx, w / 2 + 3 + legOffset, h - 11, 3, 10, p.outline);
        drawRect(ctx, w / 2 + 4 + legOffset, h - 10, 2, 8, p.body);
        drawRect(ctx, w / 2 + 4 + legOffset, h - 3, 2, 2, p.hooves);

        // Neck
        const neckX = w / 2 - 5;
        const neckY = h / 2 - 4 + walkOffset;
        drawRect(ctx, neckX - 1, neckY - 1, 6, 8, p.outline);
        drawRect(ctx, neckX, neckY, 4, 6, p.body);

        // Mane on neck
        for (let i = 0; i < 4; i++) {
            drawRect(ctx, neckX + 3, neckY + i * 2, 2, 2, p.mane);
        }

        // Head
        const headY = h / 2 - 8 + walkOffset;
        const headX = neckX - 2;

        drawRect(ctx, headX - 5, headY - 1, 8, 6, p.outline);
        drawRect(ctx, headX - 4, headY, 6, 4, p.body);

        // Ears
        drawRect(ctx, headX - 2, headY - 4, 2, 4, p.outline);
        drawRect(ctx, headX - 1, headY - 3, 1, 2, p.body);
        drawRect(ctx, headX + 1, headY - 4, 2, 4, p.outline);
        drawRect(ctx, headX + 2, headY - 3, 1, 2, p.body);

        // Mane between ears
        drawRect(ctx, headX - 1, headY - 3, 3, 2, p.mane);

        // Muzzle
        drawRect(ctx, headX - 7, headY + 1, 4, 4, p.outline);
        drawRect(ctx, headX - 6, headY + 2, 2, 2, p.nose);

        // Eyes
        drawPixel(ctx, headX - 2, headY + 1, '#fff');
        drawPixel(ctx, headX - 1, headY + 1, p.eyes);

        // Nostril
        drawPixel(ctx, headX - 6, headY + 3, '#000');

        ctx.restore();
    }

    // ============= CAMEL SPRITE =============
    function renderCamelSprite(canvas, direction, frame, palette) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const p = palette || ANIMAL_PALETTES.camel;

        ctx.clearRect(0, 0, w, h);

        const walkOffset = Math.sin(frame * Math.PI / 2) * 1;
        const legOffset = Math.sin(frame * Math.PI / 2) * 1.5;

        const flip = direction === 2;
        const facingDown = direction === 1;

        ctx.save();
        if (flip) {
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
        }

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        drawEllipse(ctx, w / 2, h - 2, 9, 3, 'rgba(0,0,0,0.25)');

        // Back legs (long)
        drawRect(ctx, w / 2 - 6 + legOffset, h - 14, 3, 12, p.outline);
        drawRect(ctx, w / 2 - 5 + legOffset, h - 13, 2, 10, p.bodyDark);
        drawRect(ctx, w / 2 + 4 - legOffset, h - 14, 3, 12, p.outline);
        drawRect(ctx, w / 2 + 5 - legOffset, h - 13, 2, 10, p.bodyDark);

        // Body
        drawOutlinedEllipse(ctx, w / 2, h / 2 + 2 + walkOffset, 9, 5, p.body, p.outline);

        // Hump
        drawOutlinedEllipse(ctx, w / 2, h / 2 - 3 + walkOffset, 5, 4, p.hump, p.outline);

        // Belly
        drawEllipse(ctx, w / 2, h / 2 + 5 + walkOffset, 5, 2, p.belly);

        // Front legs
        drawRect(ctx, w / 2 - 5 - legOffset, h - 13, 3, 12, p.outline);
        drawRect(ctx, w / 2 - 4 - legOffset, h - 12, 2, 10, p.body);
        drawRect(ctx, w / 2 + 3 + legOffset, h - 13, 3, 12, p.outline);
        drawRect(ctx, w / 2 + 4 + legOffset, h - 12, 2, 10, p.body);

        // Neck (long)
        const neckX = w / 2 - 6;
        const neckY = h / 2 - 6 + walkOffset;
        drawRect(ctx, neckX - 2, neckY - 6, 5, 10, p.outline);
        drawRect(ctx, neckX - 1, neckY - 5, 3, 8, p.body);

        // Head
        const headY = neckY - 9;
        const headX = neckX - 1;

        drawRect(ctx, headX - 5, headY - 1, 8, 5, p.outline);
        drawRect(ctx, headX - 4, headY, 6, 3, p.body);

        // Ears (small)
        drawRect(ctx, headX - 2, headY - 3, 2, 3, p.outline);
        drawRect(ctx, headX - 1, headY - 2, 1, 2, p.body);
        drawRect(ctx, headX + 1, headY - 3, 2, 3, p.outline);
        drawRect(ctx, headX + 2, headY - 2, 1, 2, p.body);

        // Muzzle
        drawRect(ctx, headX - 7, headY, 4, 4, p.outline);
        drawRect(ctx, headX - 6, headY + 1, 2, 2, p.bodyLight);

        // Eyes
        drawPixel(ctx, headX - 2, headY + 1, p.eyes);

        // Nostrils
        drawPixel(ctx, headX - 6, headY + 2, p.nose);

        ctx.restore();
    }

    // ============= BOAR SPRITE =============
    function renderBoarSprite(canvas, direction, frame, palette) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const p = palette || ANIMAL_PALETTES.boar;

        ctx.clearRect(0, 0, w, h);

        const walkOffset = Math.sin(frame * Math.PI / 2) * 1;
        const legOffset = Math.sin(frame * Math.PI / 2) * 1.5;

        const flip = direction === 2;
        const facingDown = direction === 1;
        const facingUp = direction === 3;

        ctx.save();
        if (flip) {
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
        }

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        drawEllipse(ctx, w / 2, h - 3, 6, 2, 'rgba(0,0,0,0.25)');

        // Back legs (short and thick)
        drawRect(ctx, w / 2 - 5 + legOffset, h - 6, 3, 5, p.outline);
        drawRect(ctx, w / 2 - 4 + legOffset, h - 5, 2, 3, p.bodyDark);
        drawRect(ctx, w / 2 + 3 - legOffset, h - 6, 3, 5, p.outline);
        drawRect(ctx, w / 2 + 4 - legOffset, h - 5, 2, 3, p.bodyDark);

        // Tail (curly)
        if (!facingDown) {
            drawRect(ctx, w / 2 + 5, h / 2 + 1, 2, 2, p.outline);
            drawRect(ctx, w / 2 + 6, h / 2, 2, 2, p.outline);
            drawRect(ctx, w / 2 + 7, h / 2 + 1, 2, 2, p.outline);
        }

        // Body (stocky)
        drawOutlinedEllipse(ctx, w / 2, h / 2 + 2 + walkOffset, 7, 5, p.body, p.outline);

        // Body highlight
        drawEllipse(ctx, w / 2 - 2, h / 2 + 1 + walkOffset, 3, 2, p.bodyLight);

        // Mane ridge
        for (let i = -2; i <= 2; i++) {
            drawRect(ctx, w / 2 + i * 2, h / 2 - 3 + walkOffset, 2, 2, p.bodyDark);
        }

        // Front legs
        drawRect(ctx, w / 2 - 4 - legOffset, h - 5, 3, 5, p.outline);
        drawRect(ctx, w / 2 - 3 - legOffset, h - 4, 2, 3, p.body);
        drawRect(ctx, w / 2 + 2 + legOffset, h - 5, 3, 5, p.outline);
        drawRect(ctx, w / 2 + 3 + legOffset, h - 4, 2, 3, p.body);

        // Head
        const headY = h / 2 - 2 + walkOffset;
        const headX = facingDown ? w / 2 : (facingUp ? w / 2 : w / 2 - 4);

        drawOutlinedEllipse(ctx, headX, headY, 5, 4, p.body, p.outline);

        // Ears
        if (facingDown || facingUp) {
            drawRect(ctx, headX - 5, headY - 3, 3, 3, p.outline);
            drawRect(ctx, headX - 4, headY - 2, 2, 2, p.body);
            drawRect(ctx, headX + 3, headY - 3, 3, 3, p.outline);
            drawRect(ctx, headX + 4, headY - 2, 2, 2, p.body);
        } else {
            drawRect(ctx, headX - 1, headY - 4, 3, 3, p.outline);
            drawRect(ctx, headX, headY - 3, 2, 2, p.body);
        }

        // Snout (large)
        if (facingDown) {
            drawRect(ctx, headX - 3, headY + 1, 7, 5, p.outline);
            drawRect(ctx, headX - 2, headY + 2, 5, 3, p.snout);
            // Nostrils
            drawPixel(ctx, headX - 1, headY + 3, p.eyes);
            drawPixel(ctx, headX + 1, headY + 3, p.eyes);
        } else if (!facingUp) {
            drawRect(ctx, headX - 8, headY - 1, 6, 5, p.outline);
            drawRect(ctx, headX - 7, headY, 4, 3, p.snout);
            // Nostril
            drawPixel(ctx, headX - 7, headY + 1, p.eyes);
        }

        // Tusks
        if (facingDown) {
            drawRect(ctx, headX - 4, headY + 4, 2, 3, p.tusks);
            drawRect(ctx, headX + 3, headY + 4, 2, 3, p.tusks);
        } else if (!facingUp) {
            drawRect(ctx, headX - 9, headY + 2, 3, 2, p.tusks);
        }

        // Eyes
        if (facingDown) {
            drawPixel(ctx, headX - 2, headY - 1, p.eyes);
            drawPixel(ctx, headX + 2, headY - 1, p.eyes);
        } else if (!facingUp) {
            drawPixel(ctx, headX - 3, headY - 1, p.eyes);
        }

        ctx.restore();
    }

    // ============= BEAVER SPRITE =============
    function renderBeaverSprite(canvas, direction, frame, palette) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const p = palette || ANIMAL_PALETTES.beaver;

        ctx.clearRect(0, 0, w, h);

        const walkOffset = Math.sin(frame * Math.PI / 2) * 1;
        const legOffset = Math.sin(frame * Math.PI / 2) * 1;

        const flip = direction === 2;
        const facingDown = direction === 1;
        const facingUp = direction === 3;

        ctx.save();
        if (flip) {
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
        }

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        drawEllipse(ctx, w / 2, h - 3, 5, 2, 'rgba(0,0,0,0.2)');

        // Tail (flat and paddle-shaped)
        if (!facingDown) {
            drawRect(ctx, w / 2 + 4, h / 2 + 3, 7, 3, p.outline);
            drawRect(ctx, w / 2 + 5, h / 2 + 4, 5, 1, p.tail);
            // Scale pattern on tail
            for (let i = 0; i < 4; i++) {
                drawPixel(ctx, w / 2 + 6 + i, h / 2 + 4, p.bodyDark);
            }
        }

        // Back legs (webbed feet)
        drawRect(ctx, w / 2 - 4 + legOffset, h - 5, 3, 4, p.outline);
        drawRect(ctx, w / 2 - 3 + legOffset, h - 4, 2, 2, p.bodyDark);
        drawRect(ctx, w / 2 + 2 - legOffset, h - 5, 3, 4, p.outline);
        drawRect(ctx, w / 2 + 3 - legOffset, h - 4, 2, 2, p.bodyDark);

        // Body (round)
        drawOutlinedEllipse(ctx, w / 2, h / 2 + 2 + walkOffset, 6, 5, p.body, p.outline);

        // Body highlight
        drawEllipse(ctx, w / 2 - 2, h / 2 + 1 + walkOffset, 2, 2, p.bodyLight);

        // Belly
        drawEllipse(ctx, w / 2, h / 2 + 4 + walkOffset, 3, 2, p.belly);

        // Front legs (small paws)
        drawRect(ctx, w / 2 - 3 - legOffset, h - 4, 2, 3, p.outline);
        drawRect(ctx, w / 2 - 2 - legOffset, h - 3, 1, 2, p.body);
        drawRect(ctx, w / 2 + 1 + legOffset, h - 4, 2, 3, p.outline);
        drawRect(ctx, w / 2 + 2 + legOffset, h - 3, 1, 2, p.body);

        // Head
        const headY = h / 2 - 3 + walkOffset;
        const headX = facingDown ? w / 2 : (facingUp ? w / 2 : w / 2 - 2);

        drawOutlinedEllipse(ctx, headX, headY, 5, 4, p.body, p.outline);

        // Ears (small and round)
        if (facingDown || facingUp) {
            drawOutlinedEllipse(ctx, headX - 4, headY - 2, 2, 2, p.body, p.outline);
            drawOutlinedEllipse(ctx, headX + 4, headY - 2, 2, 2, p.body, p.outline);
        } else {
            drawOutlinedEllipse(ctx, headX, headY - 4, 2, 2, p.body, p.outline);
        }

        // Snout
        if (facingDown) {
            drawRect(ctx, headX - 2, headY + 1, 5, 4, p.outline);
            drawRect(ctx, headX - 1, headY + 2, 3, 2, p.belly);
            // Nose
            drawRect(ctx, headX - 1, headY + 4, 3, 1, '#3a2010');
        } else if (!facingUp) {
            drawRect(ctx, headX - 6, headY, 4, 4, p.outline);
            drawRect(ctx, headX - 5, headY + 1, 2, 2, p.belly);
            // Nose
            drawRect(ctx, headX - 6, headY + 1, 1, 2, '#3a2010');
        }

        // Teeth (prominent)
        if (facingDown) {
            drawRect(ctx, headX - 1, headY + 5, 1, 2, p.teeth);
            drawRect(ctx, headX + 1, headY + 5, 1, 2, p.teeth);
        } else if (!facingUp) {
            drawRect(ctx, headX - 5, headY + 3, 1, 2, p.teeth);
        }

        // Eyes
        if (facingDown) {
            drawPixel(ctx, headX - 2, headY, p.eyes);
            drawPixel(ctx, headX + 2, headY, p.eyes);
        } else if (!facingUp) {
            drawPixel(ctx, headX - 2, headY, p.eyes);
        }

        ctx.restore();
    }

    // ============= ALPHA WOLF SPRITE =============
    function renderAlphaWolfSprite(canvas, direction, frame, palette) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const p = palette || ANIMAL_PALETTES.wolfAlpha;

        ctx.clearRect(0, 0, w, h);

        // Draw base wolf with alpha colors
        renderWolfSprite(canvas, direction, frame, p);

        // Add glow effect
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(255, 68, 68, ${0.2 + Math.sin(frame * Math.PI) * 0.1})`;
        drawEllipse(ctx, w / 2, h / 2, 10, 8, ctx.fillStyle);

        // Add eye glow
        const flip = direction === 2;
        const facingDown = direction === 1;
        const facingUp = direction === 3;
        const walkOffset = Math.sin(frame * Math.PI / 2) * 1;
        const headY = h / 2 - 4 + walkOffset;
        const headX = facingDown ? w / 2 : (facingUp ? w / 2 : w / 2 - 3);

        const actualHeadX = flip ? (w - headX) : headX;

        ctx.fillStyle = 'rgba(255, 68, 68, 0.5)';
        if (facingDown) {
            drawEllipse(ctx, actualHeadX - 2, headY - 1, 3, 3, ctx.fillStyle);
            drawEllipse(ctx, actualHeadX + 2, headY - 1, 3, 3, ctx.fillStyle);
        } else if (!facingUp) {
            drawEllipse(ctx, actualHeadX - 3, headY - 1, 3, 3, ctx.fillStyle);
        }

        ctx.globalCompositeOperation = 'source-over';

        // Add scars/battle marks
        ctx.fillStyle = p.bodyLight;
        if (!facingUp && !facingDown) {
            drawRect(ctx, w / 2 - 2, h / 2 + 1, 4, 1, '#666');
            drawRect(ctx, w / 2 - 1, h / 2 + 2, 2, 1, '#666');
        }
    }

    // ============= MAIN RENDER FUNCTION =============
    function renderAnimalSprite(typeId, direction, frame, scale) {
        const normalizedType = typeId.toLowerCase().replace('_', '');
        const cacheKey = getCacheKey(normalizedType, direction, frame, scale);

        let cached = getCachedSprite(cacheKey);
        if (cached) {
            return cached;
        }

        // Determine canvas size based on animal type
        let baseSize = 24;
        const sizes = {
            bear: 32,
            horse: 32,
            camel: 32,
            tiger: 28,
            wolf: 24,
            wolfalpha: 28,
            fox: 22,
            hawk: 20,
            boar: 24,
            beaver: 22
        };

        baseSize = sizes[normalizedType] || 24;
        const canvasSize = Math.ceil(baseSize * scale);

        const canvas = createOffscreenCanvas(canvasSize, canvasSize);
        const ctx = canvas.getContext('2d');

        // Scale the context
        ctx.scale(scale, scale);

        // Render the appropriate animal
        const renderFunctions = {
            wolf: renderWolfSprite,
            bear: renderBearSprite,
            tiger: renderTigerSprite,
            fox: renderFoxSprite,
            hawk: renderHawkSprite,
            horse: renderHorseSprite,
            camel: renderCamelSprite,
            boar: renderBoarSprite,
            beaver: renderBeaverSprite,
            wolfalpha: renderAlphaWolfSprite
        };

        const renderFn = renderFunctions[normalizedType];
        if (renderFn) {
            // Create a temporary canvas at base size
            const tempCanvas = createOffscreenCanvas(baseSize, baseSize);
            renderFn(tempCanvas, direction, frame);

            // Draw scaled version
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(tempCanvas, 0, 0);
        }

        setCachedSprite(cacheKey, canvas);
        return canvas;
    }

    // ============= PUBLIC API =============
    return {
        renderAnimalSprite,
        ANIMAL_PALETTES,

        // Expose individual render functions for customization
        renderWolfSprite,
        renderBearSprite,
        renderTigerSprite,
        renderFoxSprite,
        renderHawkSprite,
        renderHorseSprite,
        renderCamelSprite,
        renderBoarSprite,
        renderBeaverSprite,
        renderAlphaWolfSprite,

        // Utility
        clearCache: () => spriteCache.clear()
    };
})();

window.AnimalSprites = AnimalSprites;
