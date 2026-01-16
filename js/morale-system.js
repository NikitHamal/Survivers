// ============================================
// SURVIVOR MORALE & HAPPINESS SYSTEM
// ============================================
// Complete morale system affecting survivor behavior,
// productivity, loyalty, and base efficiency

const MoraleSystem = (function() {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        BASE_MORALE: 50,                // Starting morale (0-100)
        MORALE_DECAY_RATE: 0.5,         // Natural decay per minute
        MORALE_UPDATE_INTERVAL: 10,     // Seconds between morale updates
        MIN_MORALE: 0,
        MAX_MORALE: 100,
        CRITICAL_MORALE: 20,            // Below this, survivors may leave
        LOW_MORALE: 35,                 // Below this, reduced efficiency
        HIGH_MORALE: 70,                // Above this, bonus effects
        EXCELLENT_MORALE: 90,           // Above this, major bonuses
        DESERTION_CHECK_INTERVAL: 60,   // Seconds between desertion checks
        DESERTION_CHANCE_PER_POINT: 0.005 // Per point below critical
    };

    // ============= MORALE FACTORS =============
    const MORALE_FACTORS = {
        // === POSITIVE FACTORS ===
        food_abundance: {
            id: 'food_abundance',
            name: 'Well Fed',
            category: 'positive',
            description: 'Plenty of food available',
            baseValue: 5,
            condition: () => (resources.food || 0) >= survivors.length * 20,
            icon: '🍖'
        },
        secure_shelter: {
            id: 'secure_shelter',
            name: 'Safe Haven',
            category: 'positive',
            description: 'Good walls and defenses',
            baseValue: 8,
            condition: () => {
                const walls = buildings.filter(b => b.type === TILES.WALL).length;
                const towers = buildings.filter(b => b.type === TILES.TOWER).length;
                return walls >= 10 && towers >= 2;
            },
            icon: '🏰'
        },
        comfortable_beds: {
            id: 'comfortable_beds',
            name: 'Rest Well',
            category: 'positive',
            description: 'Everyone has a bed',
            baseValue: 6,
            condition: () => {
                const beds = buildings.filter(b => b.type === TILES.BED).length;
                return beds >= survivors.length;
            },
            icon: '🛏️'
        },
        campfire_warmth: {
            id: 'campfire_warmth',
            name: 'Warm & Cozy',
            category: 'positive',
            description: 'Campfire provides comfort',
            baseValue: 4,
            condition: () => buildings.some(b => b.type === TILES.CAMPFIRE),
            icon: '🔥'
        },
        recent_victory: {
            id: 'recent_victory',
            name: 'Recent Victory',
            category: 'positive',
            description: 'Defeated enemies recently',
            baseValue: 10,
            duration: 300, // 5 minutes
            icon: '⚔️'
        },
        horde_survived: {
            id: 'horde_survived',
            name: 'Horde Survivors',
            category: 'positive',
            description: 'Survived a zombie horde',
            baseValue: 15,
            duration: 600, // 10 minutes
            icon: '🎖️'
        },
        boss_defeated: {
            id: 'boss_defeated',
            name: 'Boss Slayer',
            category: 'positive',
            description: 'Defeated a powerful boss',
            baseValue: 20,
            duration: 900, // 15 minutes
            icon: '👑'
        },
        upgraded_buildings: {
            id: 'upgraded_buildings',
            name: 'Modern Comforts',
            category: 'positive',
            description: 'Upgraded buildings',
            baseValue: 5,
            condition: () => {
                if (typeof BuildingUpgradeSystem === 'undefined') return false;
                const upgradedCount = buildings.filter(b => {
                    const level = BuildingUpgradeSystem.getBuildingLevel(b.x, b.y);
                    return level >= 3;
                }).length;
                return upgradedCount >= 5;
            },
            icon: '🏗️'
        },
        good_weather: {
            id: 'good_weather',
            name: 'Beautiful Day',
            category: 'positive',
            description: 'Clear skies boost spirits',
            baseValue: 3,
            condition: () => {
                if (typeof WeatherSystem === 'undefined') return false;
                const weather = WeatherSystem.getCurrentWeather();
                return weather?.id === 'clear';
            },
            icon: '☀️'
        },
        quest_completed: {
            id: 'quest_completed',
            name: 'Mission Success',
            category: 'positive',
            description: 'Completed a quest',
            baseValue: 8,
            duration: 300,
            icon: '✅'
        },
        new_survivor: {
            id: 'new_survivor',
            name: 'New Friends',
            category: 'positive',
            description: 'Welcomed new survivors',
            baseValue: 12,
            duration: 600,
            icon: '👋'
        },

        // === NEGATIVE FACTORS ===
        food_shortage: {
            id: 'food_shortage',
            name: 'Hungry',
            category: 'negative',
            description: 'Not enough food',
            baseValue: -10,
            condition: () => (resources.food || 0) < survivors.length * 5,
            icon: '😫'
        },
        no_shelter: {
            id: 'no_shelter',
            name: 'Exposed',
            category: 'negative',
            description: 'No defensive structures',
            baseValue: -8,
            condition: () => {
                const walls = buildings.filter(b => b.type === TILES.WALL).length;
                return walls < 4;
            },
            icon: '🚨'
        },
        overcrowded: {
            id: 'overcrowded',
            name: 'Overcrowded',
            category: 'negative',
            description: 'Not enough beds',
            baseValue: -6,
            condition: () => {
                const beds = buildings.filter(b => b.type === TILES.BED).length;
                return beds < survivors.length;
            },
            icon: '😤'
        },
        recent_death: {
            id: 'recent_death',
            name: 'In Mourning',
            category: 'negative',
            description: 'Lost a survivor recently',
            baseValue: -15,
            duration: 600,
            icon: '💔'
        },
        horde_failure: {
            id: 'horde_failure',
            name: 'Defeated',
            category: 'negative',
            description: 'Failed to survive a horde',
            baseValue: -20,
            duration: 900,
            icon: '☠️'
        },
        bad_weather: {
            id: 'bad_weather',
            name: 'Terrible Weather',
            category: 'negative',
            description: 'Weather is miserable',
            baseValue: -5,
            condition: () => {
                if (typeof WeatherSystem === 'undefined') return false;
                const weather = WeatherSystem.getCurrentWeather();
                return ['storm', 'blizzard', 'sandstorm', 'ash_fall'].includes(weather?.id);
            },
            icon: '⛈️'
        },
        blood_moon_fear: {
            id: 'blood_moon_fear',
            name: 'Blood Moon Terror',
            category: 'negative',
            description: 'The blood moon brings fear',
            baseValue: -10,
            condition: () => {
                if (typeof WeatherSystem === 'undefined') return false;
                return WeatherSystem.getCurrentWeather()?.id === 'blood_moon';
            },
            icon: '🌑'
        },
        damaged_buildings: {
            id: 'damaged_buildings',
            name: 'Base Damaged',
            category: 'negative',
            description: 'Buildings need repair',
            baseValue: -4,
            condition: () => {
                const damagedCount = buildings.filter(b => b.health < b.maxHealth * 0.5).length;
                return damagedCount >= 3;
            },
            icon: '🔨'
        },
        night_danger: {
            id: 'night_danger',
            name: 'Night Terrors',
            category: 'negative',
            description: 'Darkness brings danger',
            baseValue: -3,
            condition: () => isNight,
            icon: '🌙'
        },
        injury: {
            id: 'injury',
            name: 'Injuries',
            category: 'negative',
            description: 'Player is badly hurt',
            baseValue: -5,
            condition: () => player.health < player.maxHealth * 0.3,
            icon: '🩹'
        }
    };

    // ============= MORALE EFFECTS =============
    const MORALE_EFFECTS = {
        critical: {
            threshold: CONFIG.CRITICAL_MORALE,
            name: 'Desperate',
            effects: {
                workSpeed: -0.5,
                combatEfficiency: -0.4,
                resourceGathering: -0.5,
                desertionRisk: true
            }
        },
        low: {
            threshold: CONFIG.LOW_MORALE,
            name: 'Discouraged',
            effects: {
                workSpeed: -0.25,
                combatEfficiency: -0.2,
                resourceGathering: -0.2
            }
        },
        normal: {
            threshold: 50,
            name: 'Stable',
            effects: {
                workSpeed: 0,
                combatEfficiency: 0,
                resourceGathering: 0
            }
        },
        high: {
            threshold: CONFIG.HIGH_MORALE,
            name: 'Content',
            effects: {
                workSpeed: 0.15,
                combatEfficiency: 0.1,
                resourceGathering: 0.15
            }
        },
        excellent: {
            threshold: CONFIG.EXCELLENT_MORALE,
            name: 'Thriving',
            effects: {
                workSpeed: 0.35,
                combatEfficiency: 0.25,
                resourceGathering: 0.30,
                bonusXP: 0.1,
                healthRegen: 0.5
            }
        }
    };

    // ============= STATE =============
    let baseMorale = CONFIG.BASE_MORALE;
    let activeFactors = new Map();          // Active morale modifiers
    let temporaryBuffs = [];                // Timed morale effects
    let updateTimer = 0;
    let desertionTimer = 0;
    let moraleHistory = [];                 // Track morale over time

    // ============= MORALE CALCULATION =============
    function calculateMorale() {
        let totalMorale = baseMorale;

        // Apply conditional factors
        for (const [factorId, factor] of Object.entries(MORALE_FACTORS)) {
            if (factor.condition && factor.condition()) {
                totalMorale += factor.baseValue;
                activeFactors.set(factorId, {
                    ...factor,
                    active: true,
                    value: factor.baseValue
                });
            } else if (!factor.duration) {
                activeFactors.delete(factorId);
            }
        }

        // Apply temporary buffs
        for (const buff of temporaryBuffs) {
            totalMorale += buff.value;
            activeFactors.set(buff.id, {
                ...MORALE_FACTORS[buff.id],
                active: true,
                value: buff.value,
                remaining: buff.remaining
            });
        }

        // Apply leadership skill bonus
        if (typeof SkillSystem !== 'undefined') {
            const leadershipLevel = SkillSystem.getSkillLevel('leadership');
            totalMorale += leadershipLevel * 2;
        }

        // Clamp morale
        totalMorale = Math.max(CONFIG.MIN_MORALE, Math.min(CONFIG.MAX_MORALE, totalMorale));

        return totalMorale;
    }

    function getMoraleLevel() {
        const morale = calculateMorale();

        if (morale >= CONFIG.EXCELLENT_MORALE) return 'excellent';
        if (morale >= CONFIG.HIGH_MORALE) return 'high';
        if (morale >= CONFIG.LOW_MORALE) return 'normal';
        if (morale >= CONFIG.CRITICAL_MORALE) return 'low';
        return 'critical';
    }

    function getMoraleEffects() {
        const level = getMoraleLevel();
        return MORALE_EFFECTS[level].effects;
    }

    // ============= MORALE MODIFIERS =============
    function addTemporaryBuff(factorId, customValue = null) {
        const factor = MORALE_FACTORS[factorId];
        if (!factor || !factor.duration) return false;

        // Remove existing buff of same type
        temporaryBuffs = temporaryBuffs.filter(b => b.id !== factorId);

        temporaryBuffs.push({
            id: factorId,
            value: customValue || factor.baseValue,
            remaining: factor.duration,
            startTime: Date.now()
        });

        if (typeof showNotification === 'function') {
            const isPositive = factor.baseValue > 0;
            showNotification(
                `<i class="material-icons">${isPositive ? 'mood' : 'mood_bad'}</i> ${factor.icon} ${factor.name}`,
                []
            );
        }

        return true;
    }

    function modifyBaseMorale(amount) {
        baseMorale = Math.max(CONFIG.MIN_MORALE, Math.min(CONFIG.MAX_MORALE, baseMorale + amount));
    }

    // ============= EVENT HANDLERS =============
    function onSurvivorDeath() {
        addTemporaryBuff('recent_death');
    }

    function onSurvivorRescued() {
        addTemporaryBuff('new_survivor');
    }

    function onHordeSurvived() {
        addTemporaryBuff('horde_survived');
        modifyBaseMorale(5);
    }

    function onHordeFailed() {
        addTemporaryBuff('horde_failure');
        modifyBaseMorale(-10);
    }

    function onBossDefeated() {
        addTemporaryBuff('boss_defeated');
        modifyBaseMorale(8);
    }

    function onQuestCompleted() {
        addTemporaryBuff('quest_completed');
        modifyBaseMorale(3);
    }

    function onVictoryInBattle() {
        addTemporaryBuff('recent_victory');
    }

    // ============= UPDATE =============
    function update(dt) {
        // Update timer
        updateTimer += dt;

        // Update temporary buffs
        temporaryBuffs = temporaryBuffs.filter(buff => {
            buff.remaining -= dt;
            return buff.remaining > 0;
        });

        // Periodic morale updates
        if (updateTimer >= CONFIG.MORALE_UPDATE_INTERVAL) {
            updateTimer = 0;

            // Natural morale decay/recovery
            const currentMorale = calculateMorale();
            if (currentMorale > 50) {
                baseMorale = Math.max(50, baseMorale - CONFIG.MORALE_DECAY_RATE * 0.1);
            } else if (currentMorale < 50) {
                baseMorale = Math.min(50, baseMorale + CONFIG.MORALE_DECAY_RATE * 0.05);
            }

            // Track morale history
            moraleHistory.push({
                time: Date.now(),
                morale: currentMorale
            });

            // Keep only last hour of history
            const oneHourAgo = Date.now() - 3600000;
            moraleHistory = moraleHistory.filter(h => h.time > oneHourAgo);

            // Apply morale effects to survivors
            applyMoraleToSurvivors();
        }

        // Desertion check
        desertionTimer += dt;
        if (desertionTimer >= CONFIG.DESERTION_CHECK_INTERVAL) {
            desertionTimer = 0;
            checkDesertion();
        }
    }

    function applyMoraleToSurvivors() {
        const effects = getMoraleEffects();

        for (const survivor of survivors) {
            if (survivor.isPlayer) continue;

            // Apply work speed modifier
            survivor.moraleWorkModifier = 1 + (effects.workSpeed || 0);

            // Apply combat efficiency modifier
            survivor.moraleCombatModifier = 1 + (effects.combatEfficiency || 0);

            // Apply health regen if applicable
            if (effects.healthRegen && survivor.health < survivor.maxHealth) {
                survivor.health = Math.min(
                    survivor.maxHealth,
                    survivor.health + effects.healthRegen
                );
            }
        }
    }

    function checkDesertion() {
        const morale = calculateMorale();

        if (morale >= CONFIG.CRITICAL_MORALE) return;

        const pointsBelowCritical = CONFIG.CRITICAL_MORALE - morale;
        const desertionChance = pointsBelowCritical * CONFIG.DESERTION_CHANCE_PER_POINT;

        // Check each non-player survivor
        for (let i = survivors.length - 1; i >= 0; i--) {
            const survivor = survivors[i];
            if (survivor.isPlayer) continue;

            // Individual loyalty check
            const loyalty = survivor.loyalty || 50;
            const adjustedChance = desertionChance * (100 - loyalty) / 100;

            if (Math.random() < adjustedChance) {
                // Survivor deserts
                survivorDeserts(survivor, i);
            }
        }
    }

    function survivorDeserts(survivor, index) {
        survivors.splice(index, 1);

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">directions_run</i> A survivor has deserted due to low morale!`,
                []
            );
        }

        // Track stats
        if (window.gameStats) {
            window.gameStats.survivorsDeserted = (window.gameStats.survivorsDeserted || 0) + 1;
        }

        // This triggers mourning
        addTemporaryBuff('recent_death', -8);
    }

    // ============= GETTERS =============
    function getWorkSpeedBonus() {
        const effects = getMoraleEffects();
        return effects.workSpeed || 0;
    }

    function getCombatBonus() {
        const effects = getMoraleEffects();
        return effects.combatEfficiency || 0;
    }

    function getGatheringBonus() {
        const effects = getMoraleEffects();
        return effects.resourceGathering || 0;
    }

    function getXPBonus() {
        const effects = getMoraleEffects();
        return effects.bonusXP || 0;
    }

    // ============= UI =============
    function getMoraleDisplay() {
        const morale = calculateMorale();
        const level = getMoraleLevel();
        const levelInfo = MORALE_EFFECTS[level];

        return {
            value: Math.round(morale),
            level: level,
            name: levelInfo.name,
            effects: levelInfo.effects,
            activeFactors: Array.from(activeFactors.values()).filter(f => f.active),
            color: getMoraleColor(morale)
        };
    }

    function getMoraleColor(morale) {
        if (morale >= CONFIG.EXCELLENT_MORALE) return '#00ff00';
        if (morale >= CONFIG.HIGH_MORALE) return '#88ff00';
        if (morale >= CONFIG.LOW_MORALE) return '#ffff00';
        if (morale >= CONFIG.CRITICAL_MORALE) return '#ff8800';
        return '#ff0000';
    }

    function drawMoraleUI(ctx, x, y) {
        const display = getMoraleDisplay();

        ctx.save();

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x, y, 150, 60);

        // Title
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Morale', x + 5, y + 15);

        // Value bar
        const barWidth = 140;
        const barHeight = 12;
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 5, y + 22, barWidth, barHeight);

        ctx.fillStyle = display.color;
        ctx.fillRect(x + 5, y + 22, barWidth * (display.value / 100), barHeight);

        ctx.strokeStyle = '#fff';
        ctx.strokeRect(x + 5, y + 22, barWidth, barHeight);

        // Value text
        ctx.font = '10px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`${display.value}% - ${display.name}`, x + 75, y + 32);

        // Active modifiers (icons)
        ctx.textAlign = 'left';
        let iconX = x + 5;
        const positiveFactors = display.activeFactors.filter(f => f.baseValue > 0).slice(0, 5);
        const negativeFactors = display.activeFactors.filter(f => f.baseValue < 0).slice(0, 5);

        ctx.font = '12px Arial';
        for (const factor of positiveFactors) {
            ctx.fillText(factor.icon, iconX, y + 52);
            iconX += 14;
        }

        iconX = x + 80;
        for (const factor of negativeFactors) {
            ctx.fillText(factor.icon, iconX, y + 52);
            iconX += 14;
        }

        ctx.restore();
    }

    function showMoraleDetails() {
        const display = getMoraleDisplay();

        let content = `<strong>Base Morale: ${display.value}%</strong><br>`;
        content += `Status: <span style="color: ${display.color}">${display.name}</span><br><br>`;

        content += '<strong>Active Factors:</strong><br>';

        const positiveFactors = display.activeFactors.filter(f => f.baseValue > 0);
        const negativeFactors = display.activeFactors.filter(f => f.baseValue < 0);

        if (positiveFactors.length > 0) {
            content += '<span style="color: #00ff00">Positive:</span><br>';
            for (const factor of positiveFactors) {
                content += `${factor.icon} ${factor.name}: +${factor.baseValue}<br>`;
            }
        }

        if (negativeFactors.length > 0) {
            content += '<span style="color: #ff4444">Negative:</span><br>';
            for (const factor of negativeFactors) {
                content += `${factor.icon} ${factor.name}: ${factor.baseValue}<br>`;
            }
        }

        content += '<br><strong>Effects:</strong><br>';
        const effects = display.effects;
        if (effects.workSpeed) content += `Work Speed: ${effects.workSpeed > 0 ? '+' : ''}${(effects.workSpeed * 100).toFixed(0)}%<br>`;
        if (effects.combatEfficiency) content += `Combat: ${effects.combatEfficiency > 0 ? '+' : ''}${(effects.combatEfficiency * 100).toFixed(0)}%<br>`;
        if (effects.resourceGathering) content += `Gathering: ${effects.resourceGathering > 0 ? '+' : ''}${(effects.resourceGathering * 100).toFixed(0)}%<br>`;

        if (typeof showNotification === 'function') {
            showNotification(content, []);
        }
    }

    // ============= SERIALIZATION =============
    function getState() {
        return {
            baseMorale,
            temporaryBuffs: temporaryBuffs.map(b => ({
                id: b.id,
                value: b.value,
                remaining: b.remaining
            })),
            moraleHistory: moraleHistory.slice(-20) // Keep last 20 entries
        };
    }

    function setState(state) {
        if (!state) return;

        baseMorale = state.baseMorale || CONFIG.BASE_MORALE;
        temporaryBuffs = (state.temporaryBuffs || []).filter(b => b.remaining > 0);
        moraleHistory = state.moraleHistory || [];
    }

    // ============= PUBLIC API =============
    return {
        // Constants
        MORALE_FACTORS,
        MORALE_EFFECTS,
        CONFIG,

        // Core functions
        update,
        calculateMorale,
        getMoraleLevel,
        getMoraleEffects,

        // Modifiers
        addTemporaryBuff,
        modifyBaseMorale,

        // Event handlers
        onSurvivorDeath,
        onSurvivorRescued,
        onHordeSurvived,
        onHordeFailed,
        onBossDefeated,
        onQuestCompleted,
        onVictoryInBattle,

        // Getters
        getWorkSpeedBonus,
        getCombatBonus,
        getGatheringBonus,
        getXPBonus,
        getMoraleDisplay,
        getMoraleHistory: () => [...moraleHistory],

        // UI
        drawMoraleUI,
        showMoraleDetails,

        // State
        getState,
        setState
    };
})();

// Export globally
window.MoraleSystem = MoraleSystem;
