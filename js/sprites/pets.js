// ============================================
// PET SPRITES - Enhanced Rendering System
// ============================================
// Integrates with AnimalSprites for proper pixel art pets
// Includes status bars, effects, and taming UI

const PetSprites = (function () {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        HEALTH_BAR_WIDTH: 32,
        HEALTH_BAR_HEIGHT: 4,
        HEALTH_BAR_OFFSET: 8,
        STATUS_ICON_SIZE: 8,
        TAMING_BAR_WIDTH: 50,
        TAMING_BAR_HEIGHT: 6,
        NAME_FONT_SIZE: 8,
        LEVEL_BADGE_SIZE: 10
    };

    // ============= STATUS COLORS =============
    const STATUS_COLORS = {
        health: {
            high: '#4ade4a',
            medium: '#facc15',
            low: '#f87171',
            background: '#333333'
        },
        hunger: {
            full: '#4ade4a',
            hungry: '#facc15',
            starving: '#f87171'
        },
        happiness: {
            happy: '#4ade4a',
            neutral: '#facc15',
            sad: '#f87171'
        },
        trust: {
            high: '#4ade4a',
            medium: '#facc15',
            low: '#f87171'
        }
    };

    // ============= EFFECT PARTICLES =============
    const activeEffects = new Map();

    function addEffect(petId, effectType, duration) {
        if (!activeEffects.has(petId)) {
            activeEffects.set(petId, []);
        }
        activeEffects.get(petId).push({
            type: effectType,
            startTime: Date.now(),
            duration: duration,
            particles: []
        });
    }

    function updateEffects(dt) {
        const now = Date.now();
        for (const [petId, effects] of activeEffects) {
            const remaining = effects.filter(e => now - e.startTime < e.duration);
            if (remaining.length === 0) {
                activeEffects.delete(petId);
            } else {
                activeEffects.set(petId, remaining);
            }
        }
    }

    // ============= DIRECTION CALCULATION =============
    function getDirectionFromVelocity(vx, vy) {
        if (Math.abs(vx) < 0.01 && Math.abs(vy) < 0.01) {
            return 1; // Default facing down
        }

        const angle = Math.atan2(vy, vx);

        // Convert angle to 4-direction (0=right, 1=down, 2=left, 3=up)
        if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
            return 0; // Right
        } else if (angle >= Math.PI / 4 && angle < 3 * Math.PI / 4) {
            return 1; // Down
        } else if (angle >= -3 * Math.PI / 4 && angle < -Math.PI / 4) {
            return 3; // Up
        } else {
            return 2; // Left
        }
    }

    // ============= MAIN RENDER FUNCTION =============
    function renderPetSprite(ctx, pet, cam) {
        if (!pet || !pet.type) return;

        const s = TILE_SIZE * SCALE;
        const screenX = (pet.x - 0.5) * s - cam.x;
        const screenY = (pet.y - 0.5) * s - cam.y;

        // Viewport culling
        if (screenX < -s * 2 || screenX > ctx.canvas.width + s ||
            screenY < -s * 2 || screenY > ctx.canvas.height + s) {
            return;
        }

        // Calculate animation frame
        const animFrame = Math.floor((pet.animTimer || 0) * 4) % 4;

        // Get direction from pet state
        let direction = pet.direction || 1;
        if (typeof pet.lastVx !== 'undefined' && typeof pet.lastVy !== 'undefined') {
            direction = getDirectionFromVelocity(pet.lastVx, pet.lastVy);
        }

        // Map pet type to sprite type
        const typeMapping = {
            'wolf': 'wolf',
            'bear': 'bear',
            'tiger': 'tiger',
            'fox': 'fox',
            'hawk': 'hawk',
            'horse': 'horse',
            'camel': 'camel',
            'boar': 'boar',
            'beaver': 'beaver',
            'wolf_alpha': 'wolfalpha'
        };

        const spriteType = typeMapping[pet.type.id] || pet.type.id || 'wolf';

        // Render the animal sprite
        if (typeof AnimalSprites !== 'undefined') {
            const spriteScale = (pet.size || 1) * 2;
            const spriteCanvas = AnimalSprites.renderAnimalSprite(spriteType, direction, animFrame, spriteScale);

            if (spriteCanvas) {
                const spriteX = screenX + s / 2 - spriteCanvas.width / 2;
                const spriteY = screenY + s / 2 - spriteCanvas.height / 2;

                // Draw shadow first
                renderPetShadow(ctx, screenX + s / 2, screenY + s * 0.8, pet.size || 1);

                // Apply hit flash effect
                if (pet.hitTimer && pet.hitTimer > 0) {
                    ctx.globalAlpha = 0.5 + Math.sin(pet.hitTimer * 30) * 0.3;
                }

                // Draw the sprite
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(spriteCanvas, spriteX, spriteY);

                // Reset alpha
                ctx.globalAlpha = 1;
            }
        } else {
            // Fallback to basic rendering if AnimalSprites not loaded
            renderFallbackPet(ctx, pet, screenX, screenY, s);
        }

        // Render status indicators for tamed pets
        if (!pet.isWild) {
            renderPetStatusBars(ctx, pet, screenX + s / 2, screenY - 5, s);
            renderPetLevelBadge(ctx, pet, screenX + s - 5, screenY);
        }

        // Render taming UI if active
        if (typeof tamingSession !== 'undefined' && tamingSession && tamingSession.pet === pet) {
            renderTamingUI(ctx, screenX + s / 2, screenY - 30);
        }

        // Render wild indicator
        if (pet.isWild) {
            renderWildIndicator(ctx, pet, screenX + s / 2, screenY - 5);
        }

        // Render state indicator
        renderStateIndicator(ctx, pet, screenX + s / 2, screenY + s + 8);

        // Render effects
        renderPetEffects(ctx, pet, screenX + s / 2, screenY + s / 2);
    }

    // ============= SHADOW RENDERING =============
    function renderPetShadow(ctx, x, y, size) {
        const shadowWidth = 12 * size;
        const shadowHeight = 4 * size;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(x, y, shadowWidth, shadowHeight, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // ============= FALLBACK RENDERING =============
    function renderFallbackPet(ctx, pet, screenX, screenY, s) {
        const size = (pet.size || 1) * s * 0.6;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(screenX + s * 0.5, screenY + s * 0.8, size * 0.4, size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body outline
        ctx.strokeStyle = PALETTE.outline;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(screenX + s * 0.5, screenY + s * 0.5, size * 0.4 + 1, size * 0.5 + 1, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Body fill
        ctx.fillStyle = pet.type.color || '#888888';
        ctx.beginPath();
        ctx.ellipse(screenX + s * 0.5, screenY + s * 0.5, size * 0.4, size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        const eyeOffset = (pet.direction === 2 ? -1 : 1) * size * 0.15;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(screenX + s * 0.5 + eyeOffset, screenY + s * 0.4, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(screenX + s * 0.5 + eyeOffset + 1, screenY + s * 0.4, size * 0.05, 0, Math.PI * 2);
        ctx.fill();
    }

    // ============= STATUS BAR RENDERING =============
    function renderPetStatusBars(ctx, pet, x, y, s) {
        const barWidth = CONFIG.HEALTH_BAR_WIDTH;
        const barHeight = CONFIG.HEALTH_BAR_HEIGHT;
        const barY = y - CONFIG.HEALTH_BAR_OFFSET;

        // Health bar background
        ctx.fillStyle = STATUS_COLORS.health.background;
        ctx.fillRect(x - barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2);

        // Health bar fill
        const healthPercent = Math.max(0, Math.min(1, pet.health / pet.getMaxHealth()));
        let healthColor = STATUS_COLORS.health.high;
        if (healthPercent <= 0.25) {
            healthColor = STATUS_COLORS.health.low;
        } else if (healthPercent <= 0.5) {
            healthColor = STATUS_COLORS.health.medium;
        }

        ctx.fillStyle = healthColor;
        ctx.fillRect(x - barWidth / 2, barY, barWidth * healthPercent, barHeight);

        // Health bar shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x - barWidth / 2, barY, barWidth * healthPercent, 1);

        // Status icons
        let iconX = x + barWidth / 2 + 4;

        // Hunger warning
        if (pet.hunger < 30) {
            renderStatusIcon(ctx, iconX, barY, 'hunger', pet.hunger);
            iconX += 10;
        }

        // Happiness indicator
        if (pet.happiness < 40) {
            renderStatusIcon(ctx, iconX, barY, 'sad', pet.happiness);
            iconX += 10;
        }

        // Low trust indicator
        if (pet.trust < 30) {
            renderStatusIcon(ctx, iconX, barY, 'trust', pet.trust);
        }
    }

    // ============= STATUS ICON RENDERING =============
    function renderStatusIcon(ctx, x, y, type, value) {
        const size = CONFIG.STATUS_ICON_SIZE;

        ctx.save();

        switch (type) {
            case 'hunger':
                // Bone icon for hunger
                ctx.fillStyle = value < 15 ? '#ff4444' : '#ffaa44';
                ctx.fillRect(x, y + 1, size, 2);
                ctx.fillRect(x, y, 2, 4);
                ctx.fillRect(x + size - 2, y, 2, 4);
                break;

            case 'sad':
                // Sad face for low happiness
                ctx.fillStyle = value < 20 ? '#ff4444' : '#ffaa44';
                ctx.beginPath();
                ctx.arc(x + size / 2, y + size / 2, size / 2 - 1, 0, Math.PI * 2);
                ctx.fill();
                // Eyes
                ctx.fillStyle = '#000';
                ctx.fillRect(x + 2, y + 1, 1, 2);
                ctx.fillRect(x + size - 3, y + 1, 1, 2);
                // Frown
                ctx.beginPath();
                ctx.arc(x + size / 2, y + size - 1, 2, Math.PI, 0);
                ctx.stroke();
                break;

            case 'trust':
                // Heart icon for trust
                ctx.fillStyle = value < 15 ? '#ff4444' : '#ffaa44';
                ctx.beginPath();
                ctx.moveTo(x + size / 2, y + 2);
                ctx.bezierCurveTo(x + size / 2 - 3, y - 1, x - 1, y + 2, x + size / 2, y + size - 1);
                ctx.bezierCurveTo(x + size + 1, y + 2, x + size / 2 + 3, y - 1, x + size / 2, y + 2);
                ctx.fill();
                break;
        }

        ctx.restore();
    }

    // ============= LEVEL BADGE RENDERING =============
    function renderPetLevelBadge(ctx, pet, x, y) {
        const size = CONFIG.LEVEL_BADGE_SIZE;
        const level = pet.level || 1;

        // Badge background
        ctx.fillStyle = PALETTE.outline;
        ctx.beginPath();
        ctx.arc(x, y, size / 2 + 1, 0, Math.PI * 2);
        ctx.fill();

        // Badge fill based on rarity
        const rarityColors = {
            common: '#4ade4a',
            uncommon: '#60a5fa',
            rare: '#c084fc',
            legendary: '#fbbf24'
        };
        ctx.fillStyle = rarityColors[pet.type.rarity] || rarityColors.common;
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Level text
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${size - 3}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(level.toString(), x, y);
    }

    // ============= WILD INDICATOR RENDERING =============
    function renderWildIndicator(ctx, pet, x, y) {
        // Small paw print icon for wild animals
        ctx.fillStyle = '#8b6914';

        // Main pad
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Toe pads
        const toePositions = [
            { x: -3, y: -4 },
            { x: 0, y: -5 },
            { x: 3, y: -4 }
        ];

        for (const pos of toePositions) {
            ctx.beginPath();
            ctx.arc(x + pos.x, y + pos.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // "Wild" text
        ctx.fillStyle = '#ffaa44';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('WILD', x, y - 12);
    }

    // ============= STATE INDICATOR RENDERING =============
    function renderStateIndicator(ctx, pet, x, y) {
        if (pet.isWild) return;

        const state = pet.state || 'follow';
        const stateIcons = {
            follow: '👣',
            attack: '⚔️',
            gather: '🌿',
            stay: '🛑'
        };

        const stateColors = {
            follow: '#4ade4a',
            attack: '#f87171',
            gather: '#60a5fa',
            stay: '#facc15'
        };

        // State background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x - 12, y - 6, 24, 12);

        // State text (use abbreviated text instead of emoji for consistency)
        const stateText = {
            follow: 'FLW',
            attack: 'ATK',
            gather: 'GTH',
            stay: 'STP'
        };

        ctx.fillStyle = stateColors[state] || '#ffffff';
        ctx.font = 'bold 7px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(stateText[state] || state.toUpperCase().slice(0, 3), x, y);
    }

    // ============= EFFECTS RENDERING =============
    function renderPetEffects(ctx, pet, x, y) {
        const effects = activeEffects.get(pet.id);
        if (!effects) return;

        for (const effect of effects) {
            const elapsed = Date.now() - effect.startTime;
            const progress = elapsed / effect.duration;

            switch (effect.type) {
                case 'heal':
                    renderHealEffect(ctx, x, y, progress);
                    break;
                case 'levelup':
                    renderLevelUpEffect(ctx, x, y, progress);
                    break;
                case 'attack':
                    renderAttackEffect(ctx, x, y, progress);
                    break;
                case 'buff':
                    renderBuffEffect(ctx, x, y, progress);
                    break;
            }
        }
    }

    function renderHealEffect(ctx, x, y, progress) {
        const particles = 5;
        for (let i = 0; i < particles; i++) {
            const angle = (i / particles) * Math.PI * 2;
            const radius = 10 + progress * 15;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius - progress * 20;
            const alpha = 1 - progress;

            ctx.fillStyle = `rgba(74, 222, 74, ${alpha})`;
            ctx.fillRect(px - 1, py - 2, 2, 4);
            ctx.fillRect(px - 2, py - 1, 4, 2);
        }
    }

    function renderLevelUpEffect(ctx, x, y, progress) {
        const radius = 15 + progress * 20;
        const alpha = 1 - progress;

        ctx.strokeStyle = `rgba(251, 191, 36, ${alpha})`;
        ctx.lineWidth = 3 - progress * 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Stars
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + progress * Math.PI;
            const starX = x + Math.cos(angle) * (radius + 5);
            const starY = y + Math.sin(angle) * (radius + 5) - progress * 10;

            ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
            drawStar(ctx, starX, starY, 3, 5, 0.5);
        }
    }

    function renderAttackEffect(ctx, x, y, progress) {
        const slashLength = 20;
        const alpha = 1 - progress;

        ctx.strokeStyle = `rgba(248, 113, 113, ${alpha})`;
        ctx.lineWidth = 3 - progress * 2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(x - slashLength / 2, y - slashLength / 2 + progress * 10);
        ctx.lineTo(x + slashLength / 2, y + slashLength / 2 + progress * 10);
        ctx.stroke();
    }

    function renderBuffEffect(ctx, x, y, progress) {
        const time = Date.now() / 1000;
        const alpha = 0.5 + Math.sin(time * 5) * 0.3;

        ctx.strokeStyle = `rgba(96, 165, 250, ${alpha * (1 - progress)})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 2]);

        ctx.beginPath();
        ctx.arc(x, y, 15 + Math.sin(time * 3) * 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.setLineDash([]);
    }

    function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }

        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }

    // ============= TAMING UI RENDERING =============
    function renderTamingUI(ctx, x, y) {
        const barWidth = CONFIG.TAMING_BAR_WIDTH;
        const barHeight = CONFIG.TAMING_BAR_HEIGHT;

        // Background panel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x - barWidth / 2 - 8, y - 8, barWidth + 16, 40);

        // Border
        ctx.strokeStyle = '#8b6914';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - barWidth / 2 - 8, y - 8, barWidth + 16, 40);

        // Title
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('TAMING', x, y + 2);

        // Patience bar background
        ctx.fillStyle = '#333';
        ctx.fillRect(x - barWidth / 2, y + 8, barWidth, barHeight);

        // Patience bar fill
        if (typeof tamingSession !== 'undefined' && tamingSession) {
            const patiencePercent = Math.max(0, Math.min(1,
                tamingSession.patience / (typeof PetSystem !== 'undefined' ? PetSystem.CONFIG.TAMING_MAX_PATIENCE : 100)
            ));

            let patienceColor = '#4ade4a';
            if (patiencePercent <= 0.25) {
                patienceColor = '#f87171';
            } else if (patiencePercent <= 0.5) {
                patienceColor = '#facc15';
            }

            ctx.fillStyle = patienceColor;
            ctx.fillRect(x - barWidth / 2, y + 8, barWidth * patiencePercent, barHeight);

            // Patience bar shine
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(x - barWidth / 2, y + 8, barWidth * patiencePercent, 2);
        }

        // Instructions
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '8px Arial';
        ctx.fillText('Approach slowly & feed', x, y + 26);
    }

    // ============= PUBLIC API =============
    return {
        renderPetSprite,
        renderTamingUI,
        addEffect,
        updateEffects,
        CONFIG,
        STATUS_COLORS
    };
})();

// Global function for backward compatibility
function renderPetSprite(ctx, pet, cam) {
    PetSprites.renderPetSprite(ctx, pet, cam);
}

function renderTamingUI(ctx, x, y) {
    PetSprites.renderTamingUI(ctx, x, y);
}

window.PetSprites = PetSprites;
