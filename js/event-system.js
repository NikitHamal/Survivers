// ============================================
// EVENT SYSTEM - Day/Night Events & Random Encounters
// ============================================
// Complete event system with timed events, random encounters,
// special day/night occurrences, and world events

const EventSystem = (function() {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        EVENT_CHECK_INTERVAL: 30,       // Seconds between event checks
        MIN_TIME_BETWEEN_EVENTS: 120,   // Minimum seconds between events
        MAX_ACTIVE_EVENTS: 3,           // Maximum simultaneous events
        ENCOUNTER_SPAWN_RANGE: 15,      // How far encounters spawn from player
        EVENT_MARKER_DURATION: 60,      // How long event markers last
        MERCHANT_STAY_DURATION: 300,    // How long merchants stay
        SUPPLY_DROP_LIFETIME: 180       // How long supply drops last
    };

    // ============= EVENT CATEGORIES =============
    const EVENT_CATEGORIES = {
        ENCOUNTER: 'encounter',     // Random world encounters
        TIMED: 'timed',            // Time-based events (dawn, dusk, etc.)
        WORLD: 'world',            // World state changes
        SPECIAL: 'special'         // Rare special events
    };

    // ============= RANDOM ENCOUNTER DEFINITIONS =============
    const ENCOUNTERS = {
        // ========== POSITIVE ENCOUNTERS ==========
        traveling_merchant: {
            id: 'traveling_merchant',
            name: 'Traveling Merchant',
            category: EVENT_CATEGORIES.ENCOUNTER,
            description: 'A brave merchant has arrived with rare goods!',
            icon: '🛒',
            rarity: 0.08,
            dayOnly: true,
            duration: CONFIG.MERCHANT_STAY_DURATION,
            onStart: (event) => {
                // Spawn merchant NPC
                event.merchant = spawnMerchant(event.x, event.y);
            },
            onEnd: (event) => {
                // Remove merchant
                if (event.merchant) {
                    removeMerchant(event.merchant);
                }
            },
            interaction: (event) => {
                openMerchantShop(event.merchant);
            }
        },

        supply_drop: {
            id: 'supply_drop',
            name: 'Supply Drop',
            category: EVENT_CATEGORIES.ENCOUNTER,
            description: 'A supply crate has been spotted nearby!',
            icon: '📦',
            rarity: 0.12,
            duration: CONFIG.SUPPLY_DROP_LIFETIME,
            rewards: {
                resources: { wood: 50, stone: 30, iron: 20, food: 40 },
                itemChance: 0.3,
                items: ['health_potion', 'stamina_elixir', 'iron_sword']
            },
            onStart: (event) => {
                event.collected = false;
                if (typeof spawnParticles === 'function') {
                    spawnParticles(event.x, event.y, '#ffff00', 20);
                }
            },
            interaction: (event) => {
                if (event.collected) return;
                event.collected = true;
                collectSupplyDrop(event);
            }
        },

        survivor_group: {
            id: 'survivor_group',
            name: 'Stranded Survivors',
            category: EVENT_CATEGORIES.ENCOUNTER,
            description: 'A group of survivors needs rescue!',
            icon: '👥',
            rarity: 0.10,
            duration: 300,
            survivorCount: { min: 1, max: 3 },
            zombieGuards: { min: 5, max: 15 },
            onStart: (event) => {
                const count = event.survivorCount.min +
                    Math.floor(Math.random() * (event.survivorCount.max - event.survivorCount.min + 1));
                event.survivorsToRescue = count;
                event.survivorsRescued = 0;

                // Spawn zombie guards
                const zombieCount = event.zombieGuards.min +
                    Math.floor(Math.random() * (event.zombieGuards.max - event.zombieGuards.min + 1));
                spawnEventZombies(event.x, event.y, zombieCount, event);
            },
            interaction: (event) => {
                if (event.survivorsRescued < event.survivorsToRescue) {
                    rescueSurvivor(event);
                }
            },
            checkComplete: (event) => {
                return event.survivorsRescued >= event.survivorsToRescue;
            }
        },

        resource_cache: {
            id: 'resource_cache',
            name: 'Hidden Cache',
            category: EVENT_CATEGORIES.ENCOUNTER,
            description: 'An abandoned cache of supplies!',
            icon: '💎',
            rarity: 0.15,
            duration: 240,
            rewards: {
                resources: { wood: 30, stone: 40, iron: 25 }
            },
            onStart: (event) => {
                event.looted = false;
            },
            interaction: (event) => {
                if (event.looted) return;
                event.looted = true;
                lootCache(event);
            }
        },

        mysterious_stranger: {
            id: 'mysterious_stranger',
            name: 'Mysterious Stranger',
            category: EVENT_CATEGORIES.ENCOUNTER,
            description: 'A cloaked figure offers a deal...',
            icon: '🎭',
            rarity: 0.05,
            nightOnly: true,
            duration: 120,
            onStart: (event) => {
                event.dealAccepted = false;
                event.dealType = selectDealType();
            },
            interaction: (event) => {
                if (event.dealAccepted) return;
                showStrangerDeal(event);
            }
        },

        wandering_trader: {
            id: 'wandering_trader',
            name: 'Wandering Trader',
            category: EVENT_CATEGORIES.ENCOUNTER,
            description: 'A trader offers unique items!',
            icon: '🎒',
            rarity: 0.07,
            dayOnly: true,
            duration: 180,
            trades: [],
            onStart: (event) => {
                event.trades = generateTraderOffers();
            },
            interaction: (event) => {
                showTraderUI(event);
            }
        },

        // ========== NEGATIVE ENCOUNTERS ==========
        zombie_ambush: {
            id: 'zombie_ambush',
            name: 'Zombie Ambush!',
            category: EVENT_CATEGORIES.ENCOUNTER,
            description: 'Zombies are converging on your position!',
            icon: '💀',
            rarity: 0.10,
            nightOnly: true,
            hostile: true,
            zombieCount: { min: 8, max: 20 },
            onStart: (event) => {
                const dayScale = 1 + (dayCount || 0) * 0.1;
                const count = Math.floor((event.zombieCount.min +
                    Math.random() * (event.zombieCount.max - event.zombieCount.min)) * dayScale);
                spawnAmbushZombies(count);

                if (camera) camera.shake = 5;
            },
            duration: 60
        },

        screamer_alert: {
            id: 'screamer_alert',
            name: 'Screamer Alert!',
            category: EVENT_CATEGORIES.ENCOUNTER,
            description: 'A Screamer is attracting a horde!',
            icon: '📢',
            rarity: 0.06,
            nightOnly: true,
            hostile: true,
            onStart: (event) => {
                // Spawn screamer zombie
                if (typeof BossSystem !== 'undefined') {
                    BossSystem.spawnZombieWithType('SCREAMER', event.x, event.y);
                }
                // Spawn reinforcements over time
                event.reinforcementTimer = 0;
                event.reinforcementsSpawned = 0;
                event.maxReinforcements = 15 + Math.floor((dayCount || 0) * 0.5);
            },
            onUpdate: (event, dt) => {
                event.reinforcementTimer += dt;
                if (event.reinforcementTimer >= 3 && event.reinforcementsSpawned < event.maxReinforcements) {
                    event.reinforcementTimer = 0;
                    event.reinforcementsSpawned += 2;
                    spawnEventZombies(event.x, event.y, 2, event);
                }
            },
            duration: 90
        },

        infected_wildlife: {
            id: 'infected_wildlife',
            name: 'Infected Wildlife',
            category: EVENT_CATEGORIES.ENCOUNTER,
            description: 'Infected creatures are approaching!',
            icon: '🐺',
            rarity: 0.08,
            hostile: true,
            onStart: (event) => {
                // Spawn fast, weak infected
                const count = 5 + Math.floor(Math.random() * 8);
                for (let i = 0; i < count; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 10 + Math.random() * 5;
                    const x = event.x + Math.cos(angle) * dist;
                    const y = event.y + Math.sin(angle) * dist;

                    const infected = {
                        x, y,
                        health: 20,
                        maxHealth: 20,
                        speed: ZOMBIE_CONFIG.BASE_SPEED * 1.8,
                        damage: 5,
                        attackCooldown: 0,
                        frame: 0,
                        animTimer: 0,
                        isInfected: true
                    };
                    zombies.push(infected);
                }
            },
            duration: 60
        },

        bandit_raid: {
            id: 'bandit_raid',
            name: 'Bandit Raid!',
            category: EVENT_CATEGORIES.ENCOUNTER,
            description: 'Bandits are attacking your base!',
            icon: '🏴‍☠️',
            rarity: 0.04,
            dayOnly: true,
            hostile: true,
            onStart: (event) => {
                event.banditsRemaining = 3 + Math.floor((dayCount || 0) * 0.2);
                event.stolenResources = {};
                spawnBandits(event);
            },
            onUpdate: (event, dt) => {
                // Bandits steal resources over time
                if (event.banditsRemaining > 0) {
                    const stealRate = 0.5 * dt;
                    const resourceTypes = ['wood', 'stone', 'food', 'iron'];
                    for (const res of resourceTypes) {
                        if (resources[res] > 0) {
                            const stolen = Math.min(resources[res], stealRate);
                            resources[res] -= stolen;
                            event.stolenResources[res] = (event.stolenResources[res] || 0) + stolen;
                        }
                    }
                }
            },
            duration: 120
        },

        // ========== NEUTRAL ENCOUNTERS ==========
        abandoned_vehicle: {
            id: 'abandoned_vehicle',
            name: 'Abandoned Vehicle',
            category: EVENT_CATEGORIES.ENCOUNTER,
            description: 'A wrecked vehicle might have supplies...',
            icon: '🚗',
            rarity: 0.12,
            duration: 300,
            searchTime: 5,
            rewards: {
                resources: { iron: 15, food: 10 },
                itemChance: 0.2,
                items: ['health_potion', 'iron_axe']
            },
            onStart: (event) => {
                event.searched = false;
                event.searching = false;
                event.searchProgress = 0;
            },
            interaction: (event) => {
                if (event.searched) return;
                startSearching(event);
            }
        },

        weather_phenomenon: {
            id: 'weather_phenomenon',
            name: 'Strange Weather',
            category: EVENT_CATEGORIES.ENCOUNTER,
            description: 'Unusual weather patterns detected...',
            icon: '🌪️',
            rarity: 0.06,
            duration: 60,
            onStart: (event) => {
                // Random weather effect
                const effects = ['fog', 'storm', 'clear'];
                const effect = effects[Math.floor(Math.random() * effects.length)];
                if (typeof WeatherSystem !== 'undefined') {
                    WeatherSystem.setWeather(effect);
                }
            }
        },

        shrine_discovery: {
            id: 'shrine_discovery',
            name: 'Ancient Shrine',
            category: EVENT_CATEGORIES.ENCOUNTER,
            description: 'A mysterious shrine radiates power...',
            icon: '⛩️',
            rarity: 0.04,
            duration: 180,
            blessings: [
                { name: 'Strength', effect: 'damage', value: 0.2, duration: 300 },
                { name: 'Swiftness', effect: 'speed', value: 0.15, duration: 300 },
                { name: 'Vitality', effect: 'health_regen', value: 2, duration: 300 },
                { name: 'Fortune', effect: 'luck', value: 0.3, duration: 300 }
            ],
            onStart: (event) => {
                event.blessingReceived = false;
                event.blessing = event.blessings[Math.floor(Math.random() * event.blessings.length)];
            },
            interaction: (event) => {
                if (event.blessingReceived) return;
                event.blessingReceived = true;
                applyBlessing(event.blessing);
            }
        }
    };

    // ============= TIMED EVENTS =============
    const TIMED_EVENTS = {
        dawn_chorus: {
            id: 'dawn_chorus',
            name: 'Dawn',
            category: EVENT_CATEGORIES.TIMED,
            description: 'The sun rises, zombies retreat',
            icon: '🌅',
            triggerTime: 'dawn',
            effects: {
                zombieSpawnReduction: 0.5,
                moraleBoost: 5,
                visibility: 1.2
            },
            duration: 60,
            onStart: () => {
                if (typeof MoraleSystem !== 'undefined') {
                    MoraleSystem.modifyBaseMorale(2);
                }
            }
        },

        dusk_danger: {
            id: 'dusk_danger',
            name: 'Nightfall',
            category: EVENT_CATEGORIES.TIMED,
            description: 'Darkness falls, danger rises',
            icon: '🌆',
            triggerTime: 'dusk',
            effects: {
                zombieSpawnIncrease: 1.5,
                visibility: 0.7
            },
            duration: 60,
            onStart: () => {
                if (typeof showNotification === 'function') {
                    showNotification(
                        '<i class="material-icons">nights_stay</i> Night is falling. Seek shelter!',
                        []
                    );
                }
            }
        },

        midnight_surge: {
            id: 'midnight_surge',
            name: 'Midnight Surge',
            category: EVENT_CATEGORIES.TIMED,
            description: 'The witching hour brings danger',
            icon: '🌙',
            triggerTime: 'midnight',
            rarity: 0.3,
            effects: {
                zombieSpawnIncrease: 2.0,
                zombieDamageBoost: 1.2
            },
            duration: 120,
            onStart: () => {
                // Spawn extra zombies
                const count = 5 + Math.floor((dayCount || 0) * 0.3);
                for (let i = 0; i < count; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 15 + Math.random() * 10;
                    spawnZombieAtPosition(
                        player.x + Math.cos(angle) * dist,
                        player.y + Math.sin(angle) * dist
                    );
                }
            }
        },

        golden_hour: {
            id: 'golden_hour',
            name: 'Golden Hour',
            category: EVENT_CATEGORIES.TIMED,
            description: 'Perfect conditions for gathering',
            icon: '✨',
            triggerTime: 'afternoon',
            rarity: 0.2,
            effects: {
                gatheringBonus: 1.5,
                expBonus: 1.2
            },
            duration: 180,
            onStart: () => {
                if (typeof showNotification === 'function') {
                    showNotification(
                        '<i class="material-icons">wb_sunny</i> Golden Hour! Bonus gathering and XP!',
                        []
                    );
                }
            }
        }
    };

    // ============= WORLD EVENTS =============
    const WORLD_EVENTS = {
        resource_boom: {
            id: 'resource_boom',
            name: 'Resource Abundance',
            category: EVENT_CATEGORIES.WORLD,
            description: 'Resources regenerate faster!',
            icon: '🌿',
            rarity: 0.05,
            duration: 300,
            effects: {
                resourceRegenMultiplier: 2.0
            },
            onStart: () => {
                if (typeof showNotification === 'function') {
                    showNotification(
                        '<i class="material-icons">eco</i> Resource Boom! Double resource regeneration!',
                        []
                    );
                }
            }
        },

        zombie_mutation: {
            id: 'zombie_mutation',
            name: 'Zombie Mutation',
            category: EVENT_CATEGORIES.WORLD,
            description: 'Zombies are mutating, becoming stronger!',
            icon: '☣️',
            rarity: 0.04,
            duration: 240,
            effects: {
                zombieHealthMultiplier: 1.5,
                zombieDamageMultiplier: 1.3,
                zombieDropBonus: 1.5
            },
            onStart: () => {
                if (typeof showNotification === 'function') {
                    showNotification(
                        '<i class="material-icons">warning</i> Zombie Mutation! Stronger enemies, better loot!',
                        []
                    );
                }
            }
        },

        peaceful_period: {
            id: 'peaceful_period',
            name: 'Peaceful Period',
            category: EVENT_CATEGORIES.WORLD,
            description: 'A temporary lull in zombie activity',
            icon: '🕊️',
            rarity: 0.06,
            dayOnly: true,
            duration: 180,
            effects: {
                zombieSpawnMultiplier: 0.2
            },
            onStart: () => {
                if (typeof showNotification === 'function') {
                    showNotification(
                        '<i class="material-icons">spa</i> Peaceful Period. Build and gather safely!',
                        []
                    );
                }
            }
        },

        experience_surge: {
            id: 'experience_surge',
            name: 'Experience Surge',
            category: EVENT_CATEGORIES.WORLD,
            description: 'Double XP from all sources!',
            icon: '⭐',
            rarity: 0.05,
            duration: 240,
            effects: {
                expMultiplier: 2.0
            },
            onStart: () => {
                if (typeof showNotification === 'function') {
                    showNotification(
                        '<i class="material-icons">star</i> Experience Surge! Double XP for 4 minutes!',
                        []
                    );
                }
            }
        }
    };

    // ============= SPECIAL RARE EVENTS =============
    const SPECIAL_EVENTS = {
        eclipse: {
            id: 'eclipse',
            name: 'Solar Eclipse',
            category: EVENT_CATEGORIES.SPECIAL,
            description: 'The sun goes dark... zombies emerge!',
            icon: '🌑',
            rarity: 0.01,
            dayOnly: true,
            duration: 120,
            effects: {
                visibility: 0.3,
                zombieSpawnMultiplier: 3.0,
                zombieSpeedBoost: 1.2
            },
            onStart: () => {
                if (camera) camera.shake = 10;
                if (typeof showNotification === 'function') {
                    showNotification(
                        '<i class="material-icons">brightness_3</i> <strong>SOLAR ECLIPSE!</strong> The dead rise in darkness!',
                        []
                    );
                }
            },
            visual: {
                screenOverlay: 'rgba(0, 0, 0, 0.6)',
                ambientLight: 0.3
            }
        },

        meteor_shower: {
            id: 'meteor_shower',
            name: 'Meteor Shower',
            category: EVENT_CATEGORIES.SPECIAL,
            description: 'Meteors rain from the sky!',
            icon: '☄️',
            rarity: 0.02,
            nightOnly: true,
            duration: 90,
            onStart: (event) => {
                event.meteorTimer = 0;
            },
            onUpdate: (event, dt) => {
                event.meteorTimer += dt;
                if (event.meteorTimer >= 2) {
                    event.meteorTimer = 0;
                    spawnMeteor(event);
                }
            },
            visual: {
                particleType: 'meteor'
            }
        },

        super_moon: {
            id: 'super_moon',
            name: 'Super Moon',
            category: EVENT_CATEGORIES.SPECIAL,
            description: 'The moon amplifies all effects!',
            icon: '🌕',
            rarity: 0.03,
            nightOnly: true,
            duration: 300,
            effects: {
                allEffectsMultiplier: 1.5,
                visibility: 0.8
            },
            onStart: () => {
                if (typeof showNotification === 'function') {
                    showNotification(
                        '<i class="material-icons">brightness_2</i> Super Moon! All effects amplified!',
                        []
                    );
                }
            },
            visual: {
                ambientLight: 0.6,
                moonSize: 2.0
            }
        },

        aurora: {
            id: 'aurora',
            name: 'Northern Lights',
            category: EVENT_CATEGORIES.SPECIAL,
            description: 'Beautiful aurora brings good fortune!',
            icon: '🌌',
            rarity: 0.02,
            nightOnly: true,
            duration: 240,
            effects: {
                luckMultiplier: 2.0,
                moraleBoost: 15,
                expBonus: 1.3
            },
            onStart: () => {
                if (typeof MoraleSystem !== 'undefined') {
                    MoraleSystem.modifyBaseMorale(10);
                }
                if (typeof showNotification === 'function') {
                    showNotification(
                        '<i class="material-icons">auto_awesome</i> Aurora Borealis! Fortune smiles upon you!',
                        []
                    );
                }
            },
            visual: {
                skyEffect: 'aurora'
            }
        }
    };

    // ============= STATE =============
    let activeEvents = [];
    let eventHistory = [];
    let lastEventTime = 0;
    let eventCheckTimer = 0;
    let currentTimeOfDay = 'day';
    let lastTimeOfDay = 'day';
    let activeEffects = {};
    let eventMarkers = [];

    // ============= EVENT MANAGEMENT =============
    function checkForEvents(dt) {
        eventCheckTimer += dt;

        if (eventCheckTimer < CONFIG.EVENT_CHECK_INTERVAL) return;
        eventCheckTimer = 0;

        // Check time since last event
        const timeSinceLastEvent = Date.now() - lastEventTime;
        if (timeSinceLastEvent < CONFIG.MIN_TIME_BETWEEN_EVENTS * 1000) return;

        // Check max active events
        if (activeEvents.length >= CONFIG.MAX_ACTIVE_EVENTS) return;

        // Check for timed events
        checkTimedEvents();

        // Roll for random encounter
        if (Math.random() < 0.15) {
            rollRandomEncounter();
        }

        // Roll for world event
        if (Math.random() < 0.05) {
            rollWorldEvent();
        }

        // Roll for special event
        if (Math.random() < 0.02) {
            rollSpecialEvent();
        }
    }

    function checkTimedEvents() {
        const newTimeOfDay = getTimeOfDay();

        if (newTimeOfDay !== lastTimeOfDay) {
            lastTimeOfDay = currentTimeOfDay;
            currentTimeOfDay = newTimeOfDay;

            // Trigger time-based events
            for (const event of Object.values(TIMED_EVENTS)) {
                if (event.triggerTime === newTimeOfDay) {
                    if (!event.rarity || Math.random() < event.rarity) {
                        startEvent(event);
                    }
                }
            }
        }
    }

    function getTimeOfDay() {
        // Based on game's day/night cycle
        if (typeof isNight !== 'undefined') {
            if (isNight) {
                // Check for midnight (assuming 12-hour night cycle)
                const nightProgress = typeof nightTimer !== 'undefined' ? nightTimer : 0;
                const nightDuration = typeof NIGHT_DURATION !== 'undefined' ? NIGHT_DURATION : 180;
                if (nightProgress > nightDuration * 0.4 && nightProgress < nightDuration * 0.6) {
                    return 'midnight';
                }
                return 'night';
            } else {
                // Check for dawn, afternoon, dusk
                const dayProgress = typeof dayTimer !== 'undefined' ? dayTimer : 0;
                const dayDuration = typeof DAY_DURATION !== 'undefined' ? DAY_DURATION : 300;
                const progress = dayProgress / dayDuration;

                if (progress < 0.1) return 'dawn';
                if (progress > 0.9) return 'dusk';
                if (progress > 0.4 && progress < 0.6) return 'afternoon';
                return 'day';
            }
        }
        return 'day';
    }

    function rollRandomEncounter() {
        const availableEncounters = Object.values(ENCOUNTERS).filter(enc => {
            if (enc.dayOnly && isNight) return false;
            if (enc.nightOnly && !isNight) return false;
            return true;
        });

        const totalRarity = availableEncounters.reduce((sum, e) => sum + e.rarity, 0);
        let roll = Math.random() * totalRarity;

        for (const encounter of availableEncounters) {
            roll -= encounter.rarity;
            if (roll <= 0) {
                // Determine spawn location
                const angle = Math.random() * Math.PI * 2;
                const dist = CONFIG.ENCOUNTER_SPAWN_RANGE;
                const x = player.x + Math.cos(angle) * dist;
                const y = player.y + Math.sin(angle) * dist;

                startEvent(encounter, x, y);
                return;
            }
        }
    }

    function rollWorldEvent() {
        const availableEvents = Object.values(WORLD_EVENTS).filter(evt => {
            if (evt.dayOnly && isNight) return false;
            if (evt.nightOnly && !isNight) return false;
            return true;
        });

        for (const event of availableEvents) {
            if (Math.random() < event.rarity) {
                startEvent(event);
                return;
            }
        }
    }

    function rollSpecialEvent() {
        const availableEvents = Object.values(SPECIAL_EVENTS).filter(evt => {
            if (evt.dayOnly && isNight) return false;
            if (evt.nightOnly && !isNight) return false;
            return true;
        });

        for (const event of availableEvents) {
            if (Math.random() < event.rarity) {
                startEvent(event);
                return;
            }
        }
    }

    function startEvent(eventDef, x = null, y = null) {
        const event = {
            ...eventDef,
            startTime: Date.now(),
            timeRemaining: eventDef.duration,
            x: x,
            y: y,
            active: true
        };

        activeEvents.push(event);
        lastEventTime = Date.now();

        // Apply effects
        if (event.effects) {
            for (const [key, value] of Object.entries(event.effects)) {
                activeEffects[key] = (activeEffects[key] || 1) * (typeof value === 'number' ? value : 1);
            }
        }

        // Add event marker
        if (x !== null && y !== null) {
            eventMarkers.push({
                x, y,
                icon: event.icon,
                name: event.name,
                eventId: event.id,
                timeRemaining: CONFIG.EVENT_MARKER_DURATION
            });
        }

        // Call onStart
        if (event.onStart) {
            event.onStart(event);
        }

        // Notify player
        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">event</i> ${event.icon} ${event.name}: ${event.description}`,
                x !== null ? [{ text: 'Mark on Map', action: () => {}, class: 'accept' }] : []
            );
        }

        // Track stats
        if (window.gameStats) {
            window.gameStats.eventsExperienced = (window.gameStats.eventsExperienced || 0) + 1;
        }

        return event;
    }

    function endEvent(event) {
        event.active = false;

        // Remove effects
        if (event.effects) {
            for (const key of Object.keys(event.effects)) {
                delete activeEffects[key];
            }
            recalculateEffects();
        }

        // Call onEnd
        if (event.onEnd) {
            event.onEnd(event);
        }

        // Add to history
        eventHistory.push({
            id: event.id,
            name: event.name,
            startTime: event.startTime,
            endTime: Date.now()
        });

        // Keep history limited
        if (eventHistory.length > 50) {
            eventHistory = eventHistory.slice(-50);
        }
    }

    function recalculateEffects() {
        activeEffects = {};
        for (const event of activeEvents) {
            if (event.active && event.effects) {
                for (const [key, value] of Object.entries(event.effects)) {
                    if (typeof value === 'number') {
                        activeEffects[key] = (activeEffects[key] || 1) * value;
                    }
                }
            }
        }
    }

    // ============= UPDATE =============
    function update(dt) {
        // Check for new events
        checkForEvents(dt);

        // Update active events
        for (let i = activeEvents.length - 1; i >= 0; i--) {
            const event = activeEvents[i];

            event.timeRemaining -= dt;

            // Call onUpdate if exists
            if (event.onUpdate) {
                event.onUpdate(event, dt);
            }

            // Check completion
            if (event.checkComplete && event.checkComplete(event)) {
                endEvent(event);
                activeEvents.splice(i, 1);
                continue;
            }

            // Check expiration
            if (event.timeRemaining <= 0) {
                endEvent(event);
                activeEvents.splice(i, 1);
            }
        }

        // Update markers
        eventMarkers = eventMarkers.filter(marker => {
            marker.timeRemaining -= dt;
            return marker.timeRemaining > 0;
        });
    }

    // ============= INTERACTION HELPERS =============
    function checkEventInteraction(x, y) {
        for (const event of activeEvents) {
            if (event.x === null || event.y === null) continue;

            const dist = Math.sqrt((x - event.x) ** 2 + (y - event.y) ** 2);
            if (dist < 2) {
                if (event.interaction) {
                    event.interaction(event);
                    return true;
                }
            }
        }
        return false;
    }

    // ============= HELPER FUNCTIONS =============
    function spawnMerchant(x, y) {
        return { x, y, type: 'merchant', inventory: generateMerchantInventory() };
    }

    function removeMerchant(merchant) {
        // Clean up merchant
    }

    function openMerchantShop(merchant) {
        if (typeof showNotification === 'function') {
            let content = '<strong>Traveling Merchant</strong><br><br>';
            for (const item of merchant.inventory) {
                content += `${item.name}: ${item.price} resources<br>`;
            }
            showNotification(content, [{ text: 'Close', action: () => {}, class: 'reject' }]);
        }
    }

    function generateMerchantInventory() {
        return [
            { id: 'health_potion', name: 'Health Potion', price: 30 },
            { id: 'stamina_elixir', name: 'Stamina Elixir', price: 25 },
            { id: 'iron_sword', name: 'Iron Sword', price: 50 },
            { id: 'hunters_ring', name: "Hunter's Ring", price: 100 }
        ];
    }

    function collectSupplyDrop(event) {
        // Grant resources
        for (const [resource, amount] of Object.entries(event.rewards.resources)) {
            resources[resource] = (resources[resource] || 0) + amount;
        }

        // Chance for item
        if (Math.random() < event.rewards.itemChance) {
            const itemId = event.rewards.items[Math.floor(Math.random() * event.rewards.items.length)];
            if (typeof EquipmentSystem !== 'undefined') {
                const item = EquipmentSystem.createItem(itemId);
                if (item) EquipmentSystem.addToInventory(item);
            }
        }

        if (typeof showNotification === 'function') {
            showNotification('<i class="material-icons">inventory</i> Supply Drop collected!', []);
        }

        if (typeof spawnParticles === 'function') {
            spawnParticles(event.x, event.y, '#00ff00', 15);
        }
    }

    function spawnEventZombies(x, y, count, event) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 2 + Math.random() * 3;
            spawnZombieAtPosition(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist);
        }
    }

    function spawnZombieAtPosition(x, y) {
        const zombie = {
            x, y,
            health: ZOMBIE_CONFIG.BASE_HEALTH * (1 + (dayCount || 0) * 0.05),
            maxHealth: ZOMBIE_CONFIG.BASE_HEALTH * (1 + (dayCount || 0) * 0.05),
            speed: ZOMBIE_CONFIG.BASE_SPEED,
            damage: ZOMBIE_CONFIG.BASE_DAMAGE,
            attackCooldown: 0,
            frame: 0,
            animTimer: 0
        };
        zombies.push(zombie);
        return zombie;
    }

    function rescueSurvivor(event) {
        event.survivorsRescued++;
        survivors.push({
            x: event.x,
            y: event.y,
            health: 50,
            maxHealth: 50,
            state: 'idle',
            task: null
        });

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">person_add</i> Survivor Rescued! (${event.survivorsRescued}/${event.survivorsToRescue})`,
                []
            );
        }

        if (typeof QuestSystem !== 'undefined') {
            QuestSystem.onSurvivorRescued();
        }

        if (typeof MoraleSystem !== 'undefined') {
            MoraleSystem.onSurvivorRescued();
        }
    }

    function lootCache(event) {
        for (const [resource, amount] of Object.entries(event.rewards.resources)) {
            resources[resource] = (resources[resource] || 0) + amount;
        }

        if (typeof showNotification === 'function') {
            showNotification('<i class="material-icons">card_giftcard</i> Cache looted!', []);
        }

        if (typeof spawnParticles === 'function') {
            spawnParticles(event.x, event.y, '#ffd700', 10);
        }
    }

    function selectDealType() {
        const deals = [
            { type: 'health_for_resources', give: 'health', receive: 'resources' },
            { type: 'resources_for_item', give: 'resources', receive: 'item' },
            { type: 'gamble', risk: 50, reward: 200 }
        ];
        return deals[Math.floor(Math.random() * deals.length)];
    }

    function showStrangerDeal(event) {
        const deal = event.dealType;
        let content = '<strong>Mysterious Stranger</strong><br><br>';

        if (deal.type === 'gamble') {
            content += `"Care to test your luck? Risk ${deal.risk} resources for a chance at ${deal.reward}..."`;
        } else {
            content += '"I have something you might want..."';
        }

        if (typeof showNotification === 'function') {
            showNotification(content, [
                { text: 'Accept Deal', action: () => acceptStrangerDeal(event), class: 'accept' },
                { text: 'Decline', action: () => {}, class: 'reject' }
            ]);
        }
    }

    function acceptStrangerDeal(event) {
        event.dealAccepted = true;
        const deal = event.dealType;

        if (deal.type === 'gamble') {
            const totalResources = (resources.wood || 0) + (resources.stone || 0) + (resources.iron || 0);
            if (totalResources < deal.risk) {
                if (typeof showNotification === 'function') {
                    showNotification('<i class="material-icons">error</i> Not enough resources!', []);
                }
                return;
            }

            // Deduct risk
            let remaining = deal.risk;
            for (const res of ['wood', 'stone', 'iron']) {
                const take = Math.min(resources[res] || 0, remaining);
                resources[res] -= take;
                remaining -= take;
            }

            // 50% chance to win
            if (Math.random() < 0.5) {
                resources.wood += deal.reward / 3;
                resources.stone += deal.reward / 3;
                resources.iron += deal.reward / 3;
                if (typeof showNotification === 'function') {
                    showNotification('<i class="material-icons">casino</i> You won! +' + deal.reward + ' resources!', []);
                }
            } else {
                if (typeof showNotification === 'function') {
                    showNotification('<i class="material-icons">casino</i> You lost...', []);
                }
            }
        }
    }

    function generateTraderOffers() {
        return [
            { give: { wood: 50 }, receive: { iron: 20 } },
            { give: { stone: 40 }, receive: { food: 30 } },
            { give: { iron: 30 }, receive: { item: 'health_potion' } }
        ];
    }

    function showTraderUI(event) {
        let content = '<strong>Wandering Trader</strong><br><br>';
        for (const trade of event.trades) {
            const giveStr = Object.entries(trade.give).map(([k, v]) => `${v} ${k}`).join(', ');
            const receiveStr = trade.receive.item || Object.entries(trade.receive).map(([k, v]) => `${v} ${k}`).join(', ');
            content += `Trade ${giveStr} for ${receiveStr}<br>`;
        }

        if (typeof showNotification === 'function') {
            showNotification(content, [{ text: 'Close', action: () => {}, class: 'reject' }]);
        }
    }

    function spawnAmbushZombies(count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 8 + Math.random() * 5;
            spawnZombieAtPosition(
                player.x + Math.cos(angle) * dist,
                player.y + Math.sin(angle) * dist
            );
        }
    }

    function spawnBandits(event) {
        // Bandits are represented as special zombies for simplicity
        for (let i = 0; i < event.banditsRemaining; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 12 + Math.random() * 5;
            const bandit = {
                x: player.x + Math.cos(angle) * dist,
                y: player.y + Math.sin(angle) * dist,
                health: 40,
                maxHealth: 40,
                speed: ZOMBIE_CONFIG.BASE_SPEED * 1.2,
                damage: 8,
                attackCooldown: 0,
                frame: 0,
                animTimer: 0,
                isBandit: true
            };
            zombies.push(bandit);
        }
    }

    function startSearching(event) {
        event.searching = true;

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">search</i> Searching vehicle... (${event.searchTime}s)`,
                []
            );
        }

        // Simulate search with timeout
        setTimeout(() => {
            if (!event.searched) {
                event.searched = true;
                event.searching = false;

                for (const [resource, amount] of Object.entries(event.rewards.resources)) {
                    resources[resource] = (resources[resource] || 0) + amount;
                }

                if (Math.random() < event.rewards.itemChance && typeof EquipmentSystem !== 'undefined') {
                    const itemId = event.rewards.items[Math.floor(Math.random() * event.rewards.items.length)];
                    const item = EquipmentSystem.createItem(itemId);
                    if (item) EquipmentSystem.addToInventory(item);
                }

                if (typeof showNotification === 'function') {
                    showNotification('<i class="material-icons">check</i> Vehicle searched!', []);
                }
            }
        }, event.searchTime * 1000);
    }

    function applyBlessing(blessing) {
        // Apply temporary buff
        player.blessings = player.blessings || {};
        player.blessings[blessing.effect] = {
            value: blessing.value,
            remaining: blessing.duration
        };

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">auto_awesome</i> Blessing of ${blessing.name} received!`,
                []
            );
        }

        if (typeof spawnParticles === 'function') {
            spawnParticles(player.x, player.y, '#ffd700', 25);
        }
    }

    function spawnMeteor(event) {
        const x = player.x + (Math.random() - 0.5) * 20;
        const y = player.y + (Math.random() - 0.5) * 20;

        // Impact damage
        const impactRadius = 2;
        const damage = 30;

        // Check player
        const playerDist = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);
        if (playerDist < impactRadius) {
            player.health -= damage * (1 - playerDist / impactRadius);
        }

        // Check zombies
        for (const zombie of zombies) {
            const dist = Math.sqrt((x - zombie.x) ** 2 + (y - zombie.y) ** 2);
            if (dist < impactRadius) {
                zombie.health -= damage * 2;
            }
        }

        // Drop resources
        resources.iron = (resources.iron || 0) + 5;
        resources.stone = (resources.stone || 0) + 10;

        if (typeof spawnParticles === 'function') {
            spawnParticles(x, y, '#ff4400', 20);
            spawnParticles(x, y, '#ffaa00', 15);
        }

        if (camera) camera.shake = 3;
    }

    // ============= EFFECT GETTERS =============
    function getZombieSpawnModifier() {
        return activeEffects.zombieSpawnMultiplier ||
               activeEffects.zombieSpawnIncrease ||
               activeEffects.zombieSpawnReduction ||
               1.0;
    }

    function getExpMultiplier() {
        return activeEffects.expMultiplier || activeEffects.expBonus || 1.0;
    }

    function getGatheringBonus() {
        return activeEffects.gatheringBonus || 1.0;
    }

    function getVisibilityModifier() {
        return activeEffects.visibility || 1.0;
    }

    // ============= UI =============
    function drawEventMarkers(ctx) {
        ctx.save();
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';

        for (const marker of eventMarkers) {
            const screenX = (marker.x - camera.x / (TILE_SIZE * SCALE)) * TILE_SIZE * SCALE;
            const screenY = (marker.y - camera.y / (TILE_SIZE * SCALE)) * TILE_SIZE * SCALE;

            // Pulse effect
            const pulse = 1 + Math.sin(Date.now() / 200) * 0.2;

            ctx.globalAlpha = 0.8;
            ctx.fillText(marker.icon, screenX, screenY - 10 * pulse);

            ctx.font = '10px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(marker.name, screenX, screenY + 15);
        }

        ctx.restore();
    }

    function getActiveEventsList() {
        return activeEvents.map(e => ({
            id: e.id,
            name: e.name,
            icon: e.icon,
            timeRemaining: Math.ceil(e.timeRemaining),
            hostile: e.hostile || false
        }));
    }

    // ============= SERIALIZATION =============
    function getState() {
        return {
            activeEvents: activeEvents.map(e => ({
                id: e.id,
                startTime: e.startTime,
                timeRemaining: e.timeRemaining,
                x: e.x,
                y: e.y,
                // Save event-specific state
                collected: e.collected,
                searched: e.searched,
                survivorsRescued: e.survivorsRescued,
                dealAccepted: e.dealAccepted
            })),
            lastEventTime,
            eventHistory: eventHistory.slice(-20),
            currentTimeOfDay
        };
    }

    function setState(state) {
        if (!state) return;

        lastEventTime = state.lastEventTime || 0;
        eventHistory = state.eventHistory || [];
        currentTimeOfDay = state.currentTimeOfDay || 'day';
        lastTimeOfDay = currentTimeOfDay;

        // Restore active events
        activeEvents = [];
        for (const savedEvent of (state.activeEvents || [])) {
            const eventDef = ENCOUNTERS[savedEvent.id] ||
                            TIMED_EVENTS[savedEvent.id] ||
                            WORLD_EVENTS[savedEvent.id] ||
                            SPECIAL_EVENTS[savedEvent.id];

            if (eventDef && savedEvent.timeRemaining > 0) {
                const event = {
                    ...eventDef,
                    startTime: savedEvent.startTime,
                    timeRemaining: savedEvent.timeRemaining,
                    x: savedEvent.x,
                    y: savedEvent.y,
                    active: true,
                    collected: savedEvent.collected,
                    searched: savedEvent.searched,
                    survivorsRescued: savedEvent.survivorsRescued,
                    dealAccepted: savedEvent.dealAccepted
                };
                activeEvents.push(event);
            }
        }

        recalculateEffects();
    }

    // ============= MANUAL TRIGGERS =============
    function triggerEvent(eventId) {
        const eventDef = ENCOUNTERS[eventId] ||
                        TIMED_EVENTS[eventId] ||
                        WORLD_EVENTS[eventId] ||
                        SPECIAL_EVENTS[eventId];

        if (eventDef) {
            const angle = Math.random() * Math.PI * 2;
            const dist = CONFIG.ENCOUNTER_SPAWN_RANGE;
            startEvent(eventDef, player.x + Math.cos(angle) * dist, player.y + Math.sin(angle) * dist);
            return true;
        }
        return false;
    }

    // ============= PUBLIC API =============
    return {
        // Constants
        ENCOUNTERS,
        TIMED_EVENTS,
        WORLD_EVENTS,
        SPECIAL_EVENTS,
        CONFIG,

        // Core
        update,
        checkEventInteraction,

        // Effect getters
        getZombieSpawnModifier,
        getExpMultiplier,
        getGatheringBonus,
        getVisibilityModifier,
        getActiveEffects: () => ({ ...activeEffects }),

        // UI
        drawEventMarkers,
        getActiveEventsList,
        getEventMarkers: () => [...eventMarkers],

        // Manual control
        triggerEvent,

        // State
        getState,
        setState,
        getEventHistory: () => [...eventHistory],
        getCurrentTimeOfDay: () => currentTimeOfDay
    };
})();

// Export globally
window.EventSystem = EventSystem;
