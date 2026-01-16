// ============================================
// WEATHER SYSTEM - Dynamic Environmental Effects
// ============================================
// Complete weather system with various weather types,
// gameplay effects, visual effects, and biome integration

const WeatherSystem = (function() {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        WEATHER_CHECK_INTERVAL: 60,     // Seconds between weather checks
        MIN_WEATHER_DURATION: 120,      // Minimum weather duration in seconds
        MAX_WEATHER_DURATION: 600,      // Maximum weather duration
        TRANSITION_DURATION: 30,        // Weather transition time in seconds
        STORM_LIGHTNING_CHANCE: 0.02,   // Chance per second for lightning
        PARTICLE_LIMIT: 500,            // Max weather particles
        WIND_CHANGE_SPEED: 0.5          // How fast wind direction changes
    };

    // ============= WEATHER TYPES =============
    const WEATHER_TYPES = {
        CLEAR: {
            id: 'clear',
            name: 'Clear',
            description: 'Clear skies',
            rarity: 0.4,
            duration: { min: 180, max: 600 },
            effects: {
                visibility: 1.0,
                speedModifier: 1.0,
                hungerModifier: 1.0,
                zombieSpawnModifier: 1.0
            },
            visual: {
                skyColor: '#87CEEB',
                ambientLight: 1.0,
                particleType: null,
                particleDensity: 0
            },
            sounds: ['birds', 'wind_light']
        },

        CLOUDY: {
            id: 'cloudy',
            name: 'Cloudy',
            description: 'Overcast skies',
            rarity: 0.25,
            duration: { min: 120, max: 400 },
            effects: {
                visibility: 0.9,
                speedModifier: 1.0,
                hungerModifier: 1.0,
                zombieSpawnModifier: 1.1
            },
            visual: {
                skyColor: '#9CACBC',
                ambientLight: 0.85,
                particleType: null,
                particleDensity: 0,
                cloudCover: 0.6
            },
            sounds: ['wind_medium']
        },

        RAIN: {
            id: 'rain',
            name: 'Rain',
            description: 'Light to moderate rainfall',
            rarity: 0.15,
            duration: { min: 60, max: 300 },
            effects: {
                visibility: 0.75,
                speedModifier: 0.9,
                hungerModifier: 1.1,
                zombieSpawnModifier: 0.8,
                fireSpreadModifier: 0.3,
                soundRadius: 0.8
            },
            visual: {
                skyColor: '#708090',
                ambientLight: 0.7,
                particleType: 'rain',
                particleDensity: 0.8,
                screenOverlay: 'rgba(100, 120, 140, 0.1)'
            },
            sounds: ['rain', 'thunder_distant'],
            puddleChance: 0.01
        },

        STORM: {
            id: 'storm',
            name: 'Thunderstorm',
            description: 'Heavy rain with lightning',
            rarity: 0.08,
            duration: { min: 60, max: 180 },
            effects: {
                visibility: 0.5,
                speedModifier: 0.75,
                hungerModifier: 1.2,
                zombieSpawnModifier: 0.5,
                fireSpreadModifier: 0.1,
                soundRadius: 0.5,
                lightningDamage: 50
            },
            visual: {
                skyColor: '#404850',
                ambientLight: 0.5,
                particleType: 'heavy_rain',
                particleDensity: 1.5,
                screenOverlay: 'rgba(60, 80, 100, 0.2)',
                lightningFlash: true
            },
            sounds: ['rain_heavy', 'thunder', 'wind_strong'],
            puddleChance: 0.03
        },

        FOG: {
            id: 'fog',
            name: 'Dense Fog',
            description: 'Thick fog reduces visibility',
            rarity: 0.08,
            duration: { min: 90, max: 240 },
            effects: {
                visibility: 0.3,
                speedModifier: 0.95,
                hungerModifier: 1.0,
                zombieSpawnModifier: 1.3,
                detectionRadius: 0.5
            },
            visual: {
                skyColor: '#C8C8C8',
                ambientLight: 0.75,
                particleType: 'fog',
                particleDensity: 0.4,
                screenOverlay: 'rgba(200, 200, 200, 0.4)',
                fogDistance: 5
            },
            sounds: ['wind_light', 'ambient_eerie']
        },

        SNOW: {
            id: 'snow',
            name: 'Snowfall',
            description: 'Light snowfall',
            rarity: 0.05,
            biomeRequired: ['snow'],
            duration: { min: 120, max: 360 },
            effects: {
                visibility: 0.7,
                speedModifier: 0.85,
                hungerModifier: 1.3,
                zombieSpawnModifier: 0.7,
                coldDamage: 1
            },
            visual: {
                skyColor: '#B8C8D8',
                ambientLight: 0.9,
                particleType: 'snow',
                particleDensity: 0.6,
                groundAccumulation: true
            },
            sounds: ['wind_cold', 'snow_crunch']
        },

        BLIZZARD: {
            id: 'blizzard',
            name: 'Blizzard',
            description: 'Severe snowstorm',
            rarity: 0.03,
            biomeRequired: ['snow'],
            duration: { min: 60, max: 180 },
            effects: {
                visibility: 0.2,
                speedModifier: 0.6,
                hungerModifier: 1.8,
                zombieSpawnModifier: 0.3,
                coldDamage: 3,
                frostbiteChance: 0.1
            },
            visual: {
                skyColor: '#D8E8F8',
                ambientLight: 0.6,
                particleType: 'blizzard',
                particleDensity: 2.0,
                screenOverlay: 'rgba(220, 240, 255, 0.4)',
                screenShake: 0.5
            },
            sounds: ['wind_howling', 'blizzard']
        },

        SANDSTORM: {
            id: 'sandstorm',
            name: 'Sandstorm',
            description: 'Blinding desert sandstorm',
            rarity: 0.05,
            biomeRequired: ['desert'],
            duration: { min: 60, max: 180 },
            effects: {
                visibility: 0.25,
                speedModifier: 0.7,
                hungerModifier: 1.5,
                zombieSpawnModifier: 0.4,
                abrasionDamage: 1
            },
            visual: {
                skyColor: '#C4A060',
                ambientLight: 0.65,
                particleType: 'sand',
                particleDensity: 1.8,
                screenOverlay: 'rgba(180, 140, 80, 0.3)',
                screenShake: 0.3
            },
            sounds: ['wind_howling', 'sand_pelting']
        },

        HEATWAVE: {
            id: 'heatwave',
            name: 'Heat Wave',
            description: 'Extreme heat',
            rarity: 0.04,
            biomeRequired: ['desert', 'volcanic'],
            duration: { min: 120, max: 300 },
            effects: {
                visibility: 0.85,
                speedModifier: 0.85,
                hungerModifier: 2.0,
                thirstModifier: 2.5,
                zombieSpawnModifier: 0.6,
                heatDamage: 1
            },
            visual: {
                skyColor: '#F0C080',
                ambientLight: 1.2,
                particleType: 'heat_shimmer',
                particleDensity: 0.3,
                screenOverlay: 'rgba(255, 200, 100, 0.1)',
                heatDistortion: true
            },
            sounds: ['heat_sizzle', 'wind_hot']
        },

        ASH_FALL: {
            id: 'ash_fall',
            name: 'Ash Fall',
            description: 'Volcanic ash clouds',
            rarity: 0.03,
            biomeRequired: ['volcanic'],
            duration: { min: 90, max: 240 },
            effects: {
                visibility: 0.4,
                speedModifier: 0.8,
                hungerModifier: 1.3,
                zombieSpawnModifier: 1.2,
                suffocationDamage: 2
            },
            visual: {
                skyColor: '#605050',
                ambientLight: 0.5,
                particleType: 'ash',
                particleDensity: 1.0,
                screenOverlay: 'rgba(80, 60, 60, 0.3)'
            },
            sounds: ['rumble', 'wind_ash']
        },

        BLOOD_MOON: {
            id: 'blood_moon',
            name: 'Blood Moon',
            description: 'The dead rise in greater numbers',
            rarity: 0.02,
            nightOnly: true,
            duration: { min: 180, max: 300 },
            effects: {
                visibility: 0.6,
                speedModifier: 1.0,
                hungerModifier: 1.2,
                zombieSpawnModifier: 3.0,
                zombieDamageModifier: 1.5,
                zombieHealthModifier: 1.5
            },
            visual: {
                skyColor: '#300000',
                ambientLight: 0.4,
                particleType: 'embers',
                particleDensity: 0.2,
                screenOverlay: 'rgba(100, 0, 0, 0.15)',
                moonColor: '#FF2020'
            },
            sounds: ['ominous_wind', 'distant_screams']
        }
    };

    // ============= STATE =============
    let currentWeather = WEATHER_TYPES.CLEAR;
    let previousWeather = null;
    let weatherDuration = 0;
    let weatherTimer = 0;
    let transitionProgress = 1.0; // 0 = start transition, 1 = complete
    let windDirection = 0;
    let windSpeed = 0;
    let weatherParticles = [];
    let lightningTimer = 0;
    let isLightningFlashing = false;
    let lightningFlashIntensity = 0;
    let puddleLocations = [];

    // ============= WEATHER SELECTION =============
    function selectNextWeather() {
        const currentBiome = typeof BiomeSystem !== 'undefined'
            ? BiomeSystem.getCurrentBiome()
            : null;
        const biomeId = currentBiome?.id || 'jungle';

        // Filter weather types by biome requirements and time of day
        const availableWeather = Object.values(WEATHER_TYPES).filter(weather => {
            // Check biome requirements
            if (weather.biomeRequired && !weather.biomeRequired.includes(biomeId)) {
                return false;
            }

            // Check night-only
            if (weather.nightOnly && !isNight) {
                return false;
            }

            return true;
        });

        // Calculate weighted probabilities
        const totalRarity = availableWeather.reduce((sum, w) => sum + w.rarity, 0);
        let roll = Math.random() * totalRarity;

        for (const weather of availableWeather) {
            roll -= weather.rarity;
            if (roll <= 0) {
                return weather;
            }
        }

        return WEATHER_TYPES.CLEAR;
    }

    function startWeather(weatherType) {
        previousWeather = currentWeather;
        currentWeather = weatherType;
        transitionProgress = 0;

        // Calculate duration
        const duration = weatherType.duration;
        weatherDuration = duration.min + Math.random() * (duration.max - duration.min);
        weatherTimer = 0;

        // Set wind
        windDirection = Math.random() * Math.PI * 2;
        windSpeed = 0.5 + Math.random() * 1.5;

        // Clear old particles
        weatherParticles = [];

        // Notify player
        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">cloud</i> Weather: ${weatherType.name}`,
                []
            );
        }

        // Track for statistics
        if (window.gameStats) {
            if (!window.gameStats.weatherExperienced) {
                window.gameStats.weatherExperienced = {};
            }
            window.gameStats.weatherExperienced[weatherType.id] =
                (window.gameStats.weatherExperienced[weatherType.id] || 0) + 1;
        }
    }

    // ============= UPDATE FUNCTIONS =============
    function update(dt) {
        weatherTimer += dt;

        // Update transition
        if (transitionProgress < 1.0) {
            transitionProgress = Math.min(1.0, transitionProgress + dt / CONFIG.TRANSITION_DURATION);
        }

        // Check if weather should change
        if (weatherTimer >= weatherDuration) {
            startWeather(selectNextWeather());
        }

        // Update wind
        updateWind(dt);

        // Update particles
        updateParticles(dt);

        // Update lightning
        if (currentWeather.visual.lightningFlash) {
            updateLightning(dt);
        }

        // Apply weather effects
        applyWeatherEffects(dt);

        // Update puddles
        if (currentWeather.puddleChance) {
            updatePuddles(dt);
        }
    }

    function updateWind(dt) {
        // Slowly change wind direction
        windDirection += (Math.random() - 0.5) * CONFIG.WIND_CHANGE_SPEED * dt;

        // Vary wind speed
        const targetSpeed = currentWeather.effects.visibility < 0.5 ? 2.0 : 1.0;
        windSpeed = lerp(windSpeed, targetSpeed + (Math.random() - 0.5) * 0.5, dt * 0.1);
    }

    function updateParticles(dt) {
        const visual = currentWeather.visual;

        // Spawn new particles
        if (visual.particleType && weatherParticles.length < CONFIG.PARTICLE_LIMIT) {
            const spawnCount = Math.floor(visual.particleDensity * 10 * dt * 60);

            for (let i = 0; i < spawnCount; i++) {
                spawnWeatherParticle(visual.particleType);
            }
        }

        // Update existing particles
        weatherParticles = weatherParticles.filter(particle => {
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.life -= dt;

            // Add wind effect
            particle.x += Math.cos(windDirection) * windSpeed * dt * 0.5;

            return particle.life > 0 && isParticleVisible(particle);
        });
    }

    function spawnWeatherParticle(type) {
        // Spawn relative to camera/player
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = -15 + Math.random() * 5;

        const particle = {
            x: player.x + offsetX,
            y: player.y + offsetY,
            vx: 0,
            vy: 0,
            life: 2 + Math.random() * 2,
            size: 2,
            color: '#ffffff',
            alpha: 1.0
        };

        switch (type) {
            case 'rain':
                particle.vy = 8 + Math.random() * 4;
                particle.vx = windSpeed * Math.cos(windDirection) * 2;
                particle.size = 1;
                particle.color = '#8899aa';
                particle.type = 'rain';
                break;

            case 'heavy_rain':
                particle.vy = 12 + Math.random() * 6;
                particle.vx = windSpeed * Math.cos(windDirection) * 3;
                particle.size = 2;
                particle.color = '#667788';
                particle.type = 'rain';
                break;

            case 'snow':
                particle.vy = 1 + Math.random() * 1.5;
                particle.vx = (Math.random() - 0.5) * 2 + windSpeed * Math.cos(windDirection);
                particle.size = 2 + Math.random() * 2;
                particle.color = '#ffffff';
                particle.type = 'snow';
                particle.wobble = Math.random() * Math.PI * 2;
                break;

            case 'blizzard':
                particle.vy = 2 + Math.random() * 3;
                particle.vx = windSpeed * 3 * Math.cos(windDirection) + (Math.random() - 0.5) * 4;
                particle.size = 2 + Math.random() * 3;
                particle.color = '#eeffff';
                particle.type = 'snow';
                break;

            case 'sand':
                particle.vy = 0.5 + Math.random() * 1;
                particle.vx = windSpeed * 4 * Math.cos(windDirection);
                particle.size = 1 + Math.random() * 2;
                particle.color = '#c4a060';
                particle.type = 'sand';
                break;

            case 'fog':
                particle.vy = (Math.random() - 0.5) * 0.5;
                particle.vx = windSpeed * 0.3 * Math.cos(windDirection);
                particle.size = 20 + Math.random() * 30;
                particle.color = '#cccccc';
                particle.alpha = 0.2 + Math.random() * 0.2;
                particle.type = 'fog';
                particle.life = 5 + Math.random() * 5;
                break;

            case 'ash':
                particle.vy = 0.8 + Math.random() * 1.2;
                particle.vx = (Math.random() - 0.5) * 2 + windSpeed * Math.cos(windDirection);
                particle.size = 2 + Math.random() * 3;
                particle.color = '#555555';
                particle.type = 'ash';
                break;

            case 'embers':
                particle.vy = -0.5 - Math.random() * 1;
                particle.vx = (Math.random() - 0.5) * 2;
                particle.size = 2 + Math.random() * 2;
                particle.color = '#ff6622';
                particle.type = 'ember';
                break;

            case 'heat_shimmer':
                particle.vy = -0.3;
                particle.vx = (Math.random() - 0.5) * 0.5;
                particle.size = 10 + Math.random() * 10;
                particle.alpha = 0.05;
                particle.type = 'shimmer';
                particle.life = 3 + Math.random() * 3;
                break;
        }

        weatherParticles.push(particle);
    }

    function isParticleVisible(particle) {
        const dx = particle.x - player.x;
        const dy = particle.y - player.y;
        return Math.abs(dx) < 20 && Math.abs(dy) < 20;
    }

    function updateLightning(dt) {
        // Decay flash
        if (isLightningFlashing) {
            lightningFlashIntensity -= dt * 3;
            if (lightningFlashIntensity <= 0) {
                isLightningFlashing = false;
                lightningFlashIntensity = 0;
            }
        }

        // Check for new lightning
        lightningTimer += dt;
        if (lightningTimer >= 1.0 && Math.random() < CONFIG.STORM_LIGHTNING_CHANCE) {
            triggerLightning();
            lightningTimer = 0;
        }
    }

    function triggerLightning() {
        isLightningFlashing = true;
        lightningFlashIntensity = 0.8 + Math.random() * 0.2;

        // Screen shake
        if (camera) {
            camera.shake = 5;
        }

        // Chance to strike near player
        if (Math.random() < 0.1) {
            const strikeX = player.x + (Math.random() - 0.5) * 20;
            const strikeY = player.y + (Math.random() - 0.5) * 20;
            createLightningStrike(strikeX, strikeY);
        }
    }

    function createLightningStrike(x, y) {
        // Damage nearby entities
        const damage = currentWeather.effects.lightningDamage || 50;
        const radius = 2;

        // Check player
        const playerDist = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);
        if (playerDist < radius) {
            const actualDamage = damage * (1 - playerDist / radius);
            player.health -= actualDamage;
            if (typeof addDamageNumber === 'function') {
                addDamageNumber(player.x, player.y - 0.5, Math.floor(actualDamage), '#ffff00');
            }
        }

        // Check zombies
        if (typeof zombies !== 'undefined') {
            for (const zombie of zombies) {
                const dist = Math.sqrt((x - zombie.x) ** 2 + (y - zombie.y) ** 2);
                if (dist < radius) {
                    zombie.health -= damage * (1 - dist / radius);
                }
            }
        }

        // Visual effect
        if (typeof spawnParticles === 'function') {
            spawnParticles(x, y, '#ffffff', 20);
            spawnParticles(x, y, '#ffff88', 15);
        }
    }

    function updatePuddles(dt) {
        // Add new puddles during rain
        if (Math.random() < currentWeather.puddleChance * dt) {
            const px = player.x + (Math.random() - 0.5) * 30;
            const py = player.y + (Math.random() - 0.5) * 30;

            // Check if valid ground
            if (typeof isSolidAt === 'function' && !isSolidAt(px, py, 0.5)) {
                puddleLocations.push({
                    x: px,
                    y: py,
                    size: 0.5 + Math.random() * 1,
                    life: 60 + Math.random() * 120 // Puddles last 1-3 minutes
                });
            }
        }

        // Decay puddles
        puddleLocations = puddleLocations.filter(puddle => {
            puddle.life -= dt;
            return puddle.life > 0;
        });

        // Limit puddle count
        if (puddleLocations.length > 50) {
            puddleLocations = puddleLocations.slice(-50);
        }
    }

    // ============= EFFECTS =============
    function applyWeatherEffects(dt) {
        const effects = currentWeather.effects;

        // Cold damage
        if (effects.coldDamage && !player.immunities?.has('cold')) {
            player.health -= effects.coldDamage * dt;
        }

        // Heat damage
        if (effects.heatDamage && !player.immunities?.has('heat')) {
            player.health -= effects.heatDamage * dt;
            player.hunger -= effects.heatDamage * 0.5 * dt;
        }

        // Abrasion damage (sandstorm)
        if (effects.abrasionDamage) {
            player.health -= effects.abrasionDamage * dt;
        }

        // Suffocation damage (ash)
        if (effects.suffocationDamage) {
            player.health -= effects.suffocationDamage * dt;
        }

        // Hunger modifier
        if (effects.hungerModifier !== 1.0) {
            // Applied to hunger decay rate in main game loop
        }
    }

    function getSpeedModifier() {
        const baseModifier = currentWeather.effects.speedModifier || 1.0;

        if (transitionProgress < 1.0 && previousWeather) {
            const prevModifier = previousWeather.effects.speedModifier || 1.0;
            return lerp(prevModifier, baseModifier, transitionProgress);
        }

        return baseModifier;
    }

    function getVisibilityModifier() {
        const baseModifier = currentWeather.effects.visibility || 1.0;

        if (transitionProgress < 1.0 && previousWeather) {
            const prevModifier = previousWeather.effects.visibility || 1.0;
            return lerp(prevModifier, baseModifier, transitionProgress);
        }

        return baseModifier;
    }

    function getZombieSpawnModifier() {
        return currentWeather.effects.zombieSpawnModifier || 1.0;
    }

    function getHungerModifier() {
        return currentWeather.effects.hungerModifier || 1.0;
    }

    function getDetectionRadius() {
        return currentWeather.effects.detectionRadius || 1.0;
    }

    function getSoundRadius() {
        return currentWeather.effects.soundRadius || 1.0;
    }

    // ============= VISUAL EFFECTS =============
    function getAmbientLight() {
        const base = currentWeather.visual.ambientLight || 1.0;

        // Add lightning flash
        if (isLightningFlashing) {
            return Math.min(1.5, base + lightningFlashIntensity);
        }

        if (transitionProgress < 1.0 && previousWeather) {
            const prev = previousWeather.visual.ambientLight || 1.0;
            return lerp(prev, base, transitionProgress);
        }

        return base;
    }

    function getSkyColor() {
        const base = currentWeather.visual.skyColor || '#87CEEB';

        if (transitionProgress < 1.0 && previousWeather) {
            const prev = previousWeather.visual.skyColor || '#87CEEB';
            return lerpColor(prev, base, transitionProgress);
        }

        return base;
    }

    function getScreenOverlay() {
        if (isLightningFlashing) {
            return `rgba(255, 255, 255, ${lightningFlashIntensity * 0.5})`;
        }
        return currentWeather.visual.screenOverlay || null;
    }

    function getScreenShake() {
        return currentWeather.visual.screenShake || 0;
    }

    function lerpColor(color1, color2, t) {
        // Parse hex colors
        const c1 = parseInt(color1.slice(1), 16);
        const c2 = parseInt(color2.slice(1), 16);

        const r1 = (c1 >> 16) & 255;
        const g1 = (c1 >> 8) & 255;
        const b1 = c1 & 255;

        const r2 = (c2 >> 16) & 255;
        const g2 = (c2 >> 8) & 255;
        const b2 = c2 & 255;

        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);

        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    // ============= RENDERING HELPERS =============
    function drawWeatherEffects(ctx) {
        // Draw puddles
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#4a6a8a';
        for (const puddle of puddleLocations) {
            const screenX = (puddle.x - camera.x / (TILE_SIZE * SCALE)) * TILE_SIZE * SCALE;
            const screenY = (puddle.y - camera.y / (TILE_SIZE * SCALE)) * TILE_SIZE * SCALE;
            ctx.beginPath();
            ctx.ellipse(screenX, screenY, puddle.size * TILE_SIZE * SCALE, puddle.size * 0.5 * TILE_SIZE * SCALE, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // Draw weather particles
        for (const particle of weatherParticles) {
            const screenX = (particle.x - camera.x / (TILE_SIZE * SCALE)) * TILE_SIZE * SCALE;
            const screenY = (particle.y - camera.y / (TILE_SIZE * SCALE)) * TILE_SIZE * SCALE;

            ctx.globalAlpha = particle.alpha || 1.0;
            ctx.fillStyle = particle.color;

            if (particle.type === 'rain') {
                ctx.fillRect(screenX, screenY, 1, particle.size * 4);
            } else if (particle.type === 'fog') {
                ctx.beginPath();
                ctx.arc(screenX, screenY, particle.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(screenX, screenY, particle.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1.0;

        // Draw screen overlay
        const overlay = getScreenOverlay();
        if (overlay) {
            ctx.fillStyle = overlay;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    }

    function getWeatherParticles() {
        return weatherParticles;
    }

    // ============= SERIALIZATION =============
    function getState() {
        return {
            currentWeather: currentWeather.id,
            weatherDuration: weatherDuration,
            weatherTimer: weatherTimer,
            windDirection: windDirection,
            windSpeed: windSpeed,
            puddleLocations: puddleLocations.slice(0, 20) // Limit saved puddles
        };
    }

    function setState(state) {
        if (!state) return;

        if (state.currentWeather && WEATHER_TYPES[state.currentWeather.toUpperCase()]) {
            currentWeather = WEATHER_TYPES[state.currentWeather.toUpperCase()];
        }

        weatherDuration = state.weatherDuration || 300;
        weatherTimer = state.weatherTimer || 0;
        windDirection = state.windDirection || 0;
        windSpeed = state.windSpeed || 1;
        puddleLocations = state.puddleLocations || [];
        transitionProgress = 1.0;
    }

    // ============= MANUAL CONTROLS =============
    function setWeather(weatherId) {
        const weather = WEATHER_TYPES[weatherId.toUpperCase()];
        if (weather) {
            startWeather(weather);
            return true;
        }
        return false;
    }

    function forceWeatherChange() {
        startWeather(selectNextWeather());
    }

    // ============= PUBLIC API =============
    return {
        // Constants
        WEATHER_TYPES,
        CONFIG,

        // Core functions
        update,
        selectNextWeather,
        startWeather,

        // Getters
        getCurrentWeather: () => currentWeather,
        getWeatherDuration: () => weatherDuration,
        getWeatherTimer: () => weatherTimer,
        getTimeRemaining: () => weatherDuration - weatherTimer,
        getWindDirection: () => windDirection,
        getWindSpeed: () => windSpeed,
        isTransitioning: () => transitionProgress < 1.0,

        // Effect modifiers
        getSpeedModifier,
        getVisibilityModifier,
        getZombieSpawnModifier,
        getHungerModifier,
        getDetectionRadius,
        getSoundRadius,

        // Visual effects
        getAmbientLight,
        getSkyColor,
        getScreenOverlay,
        getScreenShake,
        isLightning: () => isLightningFlashing,
        getLightningIntensity: () => lightningFlashIntensity,

        // Rendering
        drawWeatherEffects,
        getWeatherParticles,
        getPuddles: () => puddleLocations,

        // Manual control
        setWeather,
        forceWeatherChange,

        // State
        getState,
        setState
    };
})();

// Export globally
window.WeatherSystem = WeatherSystem;
