// ============================================
// SHELTER & TEMPERATURE SYSTEM
// ============================================
// Complete shelter system with temperature mechanics,
// insulation, comfort, sleep, and building management

const ShelterSystem = (function() {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        COMFORT_MAX: 100,
        COMFORT_BASE: 20,

        TEMPERATURE_OPTIMAL: 22,
        TEMPERATURE_FREEZING: 0,
        TEMPERATURE_HEATSTROKE: 35,

        HYPOTHERMIA_RATE: 0.5,
        HYPOTHERMIA_MAX: 100,
        HYPOTHERMIA_HEAL_RATE: 0.3,

        HEATSTROKE_RATE: 0.3,
        HEATSTROKE_MAX: 100,
        HEATSTROKE_HEAL_RATE: 0.2,

        COMFORT_HEAL_BONUS: 0.5,
        WELL_RESTED_BONUS: 1.5,
        WELL_RESTED_DURATION: 300,

        FIRE_WARMTH_RADIUS: 5,
        FIRE_WARMTH_INTENSITY: 15,
        FIRE_FUEL_RATE: 1,

        SHELTER_INSULATION_MIN: 0,
        SHELTER_INSULATION_MAX: 30,

        SLEEP_HP_REGEN: 2,
        SLEEP_STAMINA_REGEN: 5,
        SLEEP_DURATION: 8,

        COMFORT_DECAY: 0.1,
        FURNITURE_COMFORT: {
            basic_bed: 15,
            quality_bed: 25,
            luxury_bed: 40,
            chair: 5,
            table: 5,
            rug: 8,
            chest: 3,
            furnace: 10,
            decoration: 5
        }
    };

    // ============= BUILDING DEFINITIONS =============
    const BUILDINGS = {
        TENT: {
            id: 'tent',
            name: 'Tent',
            type: 'shelter',
            icon: '⛺',
            description: 'Basic portable shelter',
            size: 3,
            insulation: 5,
            capacity: 2,
            materials: { cloth: 10, wood: 5 },
            buildTime: 30,
            health: 100,
            requiresGround: ['grass', 'dirt', 'sand'],
            portable: true,
            comfort: 10,
            furnitureSlots: 1
        },

        SHACK: {
            id: 'shack',
            name: 'Shack',
            type: 'shelter',
            icon: '🛖',
            description: 'Basic permanent shelter',
            size: 5,
            insulation: 12,
            capacity: 4,
            materials: { wood: 30, stone: 10, cloth: 5 },
            buildTime: 120,
            health: 200,
            requiresGround: ['grass', 'dirt', 'sand'],
            portable: false,
            comfort: 25,
            furnitureSlots: 3
        },

        CABIN: {
            id: 'cabin',
            name: 'Cabin',
            type: 'shelter',
            icon: '🏠',
            description: 'Comfortable wooden shelter',
            size: 7,
            insulation: 18,
            capacity: 6,
            materials: { wood: 80, stone: 30, iron: 10, glass: 5 },
            buildTime: 300,
            health: 500,
            requiresGround: ['grass', 'dirt'],
            portable: false,
            comfort: 45,
            furnitureSlots: 6
        },

        BUNKER: {
            id: 'bunker',
            name: 'Bunker',
            type: 'shelter',
            icon: '🏰',
            description: 'Fortified underground shelter',
            size: 9,
            insulation: 30,
            capacity: 8,
            materials: { concrete: 100, steel: 50, iron: 20, electronics: 5 },
            buildTime: 600,
            health: 2000,
            requiresGround: ['dirt', 'stone'],
            underground: true,
            portable: false,
            comfort: 35,
            furnitureSlots: 8,
            zombieProof: true
        },

        TOWER: {
            id: 'tower',
            name: 'Watch Tower',
            type: 'shelter',
            icon: '🗼',
            description: 'Elevated vantage point',
            size: 4,
            insulation: 8,
            capacity: 3,
            materials: { wood: 50, stone: 30, iron: 15 },
            buildTime: 240,
            health: 400,
            requiresGround: ['grass', 'dirt', 'stone'],
            portable: false,
            comfort: 20,
            furnitureSlots: 2,
            watchtower: true
        },

        GREENHOUSE: {
            id: 'greenhouse',
            name: 'Greenhouse',
            type: 'shelter',
            icon: '🏡',
            description: 'Glass shelter for farming',
            size: 6,
            insulation: 10,
            capacity: 4,
            materials: { glass: 40, wood: 30, iron: 10 },
            buildTime: 200,
            health: 300,
            requiresGround: ['grass', 'dirt'],
            portable: false,
            comfort: 30,
            furnitureSlots: 4,
            farmingBonus: 1.5
        }
    };

    // ============= FURNITURE DEFINITIONS =============
    const FURNITURE = {
        BASIC_BED: {
            id: 'basic_bed',
            name: 'Basic Bed',
            type: 'bed',
            icon: '🛏️',
            comfort: 15,
            materials: { wood: 10, cloth: 8 },
            buildTime: 60,
            size: 2
        },

        QUALITY_BED: {
            id: 'quality_bed',
            name: 'Quality Bed',
            type: 'bed',
            icon: '🛏️✨',
            comfort: 25,
            materials: { wood: 15, cloth: 15, feathers: 5 },
            buildTime: 120,
            size: 2
        },

        LUXURY_BED: {
            id: 'luxury_bed',
            name: 'Luxury Bed',
            type: 'bed',
            icon: '🛏️💎',
            comfort: 40,
            materials: { wood: 20, silk: 20, down: 10, gold: 2 },
            buildTime: 300,
            size: 2
        },

        CHAIR: {
            id: 'chair',
            name: 'Chair',
            type: 'seating',
            icon: '🪑',
            comfort: 5,
            materials: { wood: 5 },
            buildTime: 30,
            size: 1
        },

        TABLE: {
            id: 'table',
            name: 'Table',
            type: 'surface',
            icon: '🪵',
            comfort: 5,
            materials: { wood: 10 },
            buildTime: 45,
            size: 2
        },

        RUG: {
            id: 'rug',
            name: 'Rug',
            type: 'decoration',
            icon: '🧶',
            comfort: 8,
            materials: { cloth: 8, wool: 5 },
            buildTime: 40,
            size: 2
        },

        CHEST: {
            id: 'chest',
            name: 'Storage Chest',
            type: 'storage',
            icon: '📦',
            comfort: 3,
            storageBonus: 10,
            materials: { wood: 15, iron: 3 },
            buildTime: 60,
            size: 2
        },

        FURNACE: {
            id: 'furnace',
            name: 'Furnace',
            type: 'appliance',
            icon: '🔥',
            comfort: 10,
            providesHeat: true,
            fuelEfficiency: 1.5,
            materials: { stone: 30, iron: 10 },
            buildTime: 120,
            size: 2
        },

        STOVE: {
            id: 'stove',
            name: 'Cooking Stove',
            type: 'appliance',
            icon: '🍳',
            comfort: 8,
            cookingBonus: 1.2,
            materials: { iron: 15, stone: 10 },
            buildTime: 100,
            size: 2
        },

        LAMP: {
            id: 'lamp',
            name: 'Oil Lamp',
            type: 'lighting',
            icon: '💡',
            comfort: 5,
            lightRadius: 8,
            fuelConsumption: 0.5,
            materials: { glass: 3, iron: 2, oil: 2 },
            buildTime: 30,
            size: 1
        },

        TORCH: {
            id: 'torch',
            name: 'Wall Torch',
            type: 'lighting',
            icon: '🔦',
            comfort: 3,
            lightRadius: 6,
            fuelConsumption: 0.3,
            materials: { wood: 2, coal: 1 },
            buildTime: 15,
            size: 1
        },

        PICTURE: {
            id: 'picture',
            name: 'Picture Frame',
            type: 'decoration',
            icon: '🖼️',
            comfort: 5,
            materials: { wood: 3, cloth: 2 },
            buildTime: 20,
            size: 1
        },

        PLANT: {
            id: 'plant',
            name: 'Potted Plant',
            type: 'decoration',
            icon: '🪴',
            comfort: 5,
            airQuality: 1,
            materials: { clay: 3, seeds: 1 },
            buildTime: 25,
            size: 1
        }
    };

    // ============= FIRE DEFINITIONS =============
    const FIRES = {
        CAMPFIRE: {
            id: 'campfire',
            name: 'Campfire',
            icon: '🔥',
            warmthRadius: CONFIG.FIRE_WARMTH_RADIUS,
            warmthIntensity: CONFIG.FIRE_WARMTH_INTENSITY,
            fuelTypes: ['wood', 'logs', 'coal'],
            fuelRate: 1,
            lightRadius: 10,
            duration: 300,
            materials: { wood: 3, tinder: 1 },
            buildTime: 15
        },

        STONE_RING: {
            id: 'stone_ring',
            name: 'Stone Fire Ring',
            icon: '⭕',
            warmthRadius: CONFIG.FIRE_WARMTH_RADIUS * 1.2,
            warmthIntensity: CONFIG.FIRE_WARMTH_INTENSITY * 1.3,
            fuelTypes: ['wood', 'logs', 'coal', 'charcoal'],
            fuelRate: 0.8,
            lightRadius: 12,
            duration: 600,
            materials: { stone: 10, wood: 2, tinder: 1 },
            buildTime: 30
        },

        FIREPLACE: {
            id: 'fireplace',
            name: 'Fireplace',
            icon: '🏮',
            warmthRadius: CONFIG.FIRE_WARMTH_RADIUS * 1.5,
            warmthIntensity: CONFIG.FIRE_WARMTH_INTENSITY * 1.5,
            fuelTypes: ['logs', 'coal', 'charcoal', 'wood'],
            fuelRate: 0.6,
            lightRadius: 15,
            duration: null,
            materials: { stone: 20, brick: 10, iron: 3 },
            buildTime: 120,
            requiresBuilding: true
        },

        TORCH: {
            id: 'torch',
            name: 'Hand Torch',
            icon: '🕯️',
            warmthRadius: 3,
            warmthIntensity: CONFIG.FIRE_WARMTH_INTENSITY * 0.3,
            fuelTypes: ['wood', 'oil'],
            fuelRate: 0.2,
            lightRadius: 8,
            duration: 180,
            materials: { wood: 1, cloth: 1, oil: 1 },
            buildTime: 10,
            handheld: true
        }
    };

    // ============= STATE =============
    let buildings = [];
    let activeFires = [];
    let furniture = [];
    let nextBuildingId = 1;
    let nextFireId = 1;
    let nextFurnitureId = 1;

    let playerTemperature = CONFIG.TEMPERATURE_OPTIMAL;
    let playerHypothermia = 0;
    let playerHeatstroke = 0;
    let playerComfort = 0;
    let wellRestedTimer = 0;
    let lastSleepQuality = 0;
    let isSleeping = false;
    let sleepTimer = 0;

    // ============= BUILDING CLASS =============
    class Building {
        constructor(typeId, x, y) {
            const type = BUILDINGS[typeId];
            if (!type) {
                console.error(`Invalid building type: ${typeId}`);
                return null;
            }

            this.id = nextBuildingId++;
            this.typeId = typeId;
            this.type = type;
            this.x = x;
            this.y = y;
            this.level = 1;
            this.health = type.health;
            this.maxHealth = type.health;

            this.furniture = [];
            this.fire = null;
            this.occupants = 0;

            this.buildProgress = 0;
            this.isComplete = this.buildProgress >= type.buildTime;

            this.insulation = type.insulation;
            this.comfort = type.comfort;

            // Door state
            this.doorOpen = false;
            this.doorX = x + Math.floor(type.size / 2);
            this.doorY = y;

            // Upgrades
            this.upgradeProgress = 0;
        }

        addFurniture(furnitureId) {
            const furnitureType = FURNITURE[furnitureId];
            if (!furnitureType) return false;

            if (this.furniture.length >= this.type.furnitureSlots) {
                return false;
            }

            const furnitureItem = new Furniture(furnitureId, this.x, this.y);
            this.furniture.push(furnitureItem);
            this.comfort += furnitureType.comfort;

            return true;
        }

        removeFurniture(furnitureId) {
            const idx = this.furniture.findIndex(f => f.typeId === furnitureId);
            if (idx === -1) return false;

            const furniture = this.furniture[idx];
            this.comfort -= furniture.type.comfort;
            this.furniture.splice(idx, 1);
            return true;
        }

        getTotalComfort() {
            let comfort = this.comfort;

            // Furniture comfort
            for (const item of this.furniture) {
                comfort += item.type.comfort;
            }

            // Fire bonus
            if (this.fire) {
                comfort += 10;
            }

            // Occupancy bonus
            if (this.occupants > 1) {
                comfort += Math.min(15, this.occupants * 3);
            }

            return Math.min(CONFIG.COMFORT_MAX, comfort);
        }

        getInsulation() {
            let insulation = this.insulation;

            // Upgrade bonus
            insulation += (this.level - 1) * 5;

            // Fire bonus
            if (this.fire) {
                insulation += 5;
            }

            return Math.min(CONFIG.SHELTER_INSULATION_MAX, insulation);
        }

        takeDamage(amount) {
            this.health -= amount;

            if (this.health <= 0) {
                this.destroy();
            }

            return this.health;
        }

        destroy() {
            EventBus.emit('building:destroyed', { building: this });

            // Drop materials
            const dropAmount = 0.5;
            for (const [material, amount] of Object.entries(this.type.materials)) {
                const drop = Math.ceil(amount * dropAmount);
                if (resources[material]) {
                    resources[material] += drop;
                }
            }

            // Remove from buildings
            const idx = buildings.indexOf(this);
            if (idx !== -1) {
                buildings.splice(idx, 1);
            }
        }

        upgrade() {
            if (this.level >= 5) return false;

            const upgradeCost = this.getUpgradeCost();
            for (const [material, amount] of Object.entries(upgradeCost)) {
                if ((resources[material] || 0) < amount) {
                    return false;
                }
            }

            for (const [material, amount] of Object.entries(upgradeCost)) {
                resources[material] -= amount;
            }

            this.level++;
            this.health += this.type.health * 0.3;
            this.maxHealth = this.health;
            this.insulation += 3;

            EventBus.emit('building:upgraded', { building: this, newLevel: this.level });
            return true;
        }

        getUpgradeCost() {
            const cost = {};
            for (const [material, amount] of Object.entries(this.type.materials)) {
                cost[material] = Math.ceil(amount * this.level * 0.5);
            }
            return cost;
        }

        isPlayerInside(px, py) {
            const halfSize = this.type.size / 2;
            return px >= this.x - halfSize && px <= this.x + halfSize &&
                   py >= this.y - halfSize && py <= this.y + halfSize;
        }
    }

    // ============= FIRE CLASS =============
    class Fire {
        constructor(typeId, x, y, parentBuilding = null) {
            const type = FIRES[typeId];
            if (!type) {
                console.error(`Invalid fire type: ${typeId}`);
                return null;
            }

            this.id = nextFireId++;
            this.typeId = typeId;
            this.type = type;
            this.x = x;
            this.y = y;
            this.parentBuilding = parentBuilding;

            this.fuel = type.duration || 300;
            this.maxFuel = this.fuel;
            this.intensity = 1;

            this.isActive = true;
            this.flickerTimer = 0;
            this.flickerOffset = Math.random() * 100;
        }

        addFuel(fuelType, amount = 1) {
            if (!this.type.fuelTypes.includes(fuelType)) return false;

            const fuelValue = getFuelValue(fuelType);
            this.fuel = Math.min(this.maxFuel, this.fuel + amount * fuelValue);
            return true;
        }

        update(dt) {
            if (!this.isActive) return;

            // Consume fuel
            const consumption = this.type.fuelRate * dt * this.intensity;
            this.fuel -= consumption;

            // Update intensity based on fuel
            this.intensity = Math.max(0.3, this.fuel / this.maxFuel);

            // Check if fire died
            if (this.fuel <= 0) {
                this.extinguish();
            }

            // Flicker effect
            this.flickerTimer += dt;
        }

        extinguish() {
            this.isActive = false;

            if (this.parentBuilding) {
                this.parentBuilding.fire = null;
            }

            const idx = activeFires.indexOf(this);
            if (idx !== -1) {
                activeFires.splice(idx, 1);
            }

            EventBus.emit('fire:extinguished', { fire: this });
        }

        getWarmthAt(x, y) {
            const dist = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);

            if (dist > this.type.warmthRadius) return 0;

            const falloff = 1 - (dist / this.type.warmthRadius);
            return this.type.warmthIntensity * falloff * this.intensity;
        }
    }

    function getFuelValue(fuelType) {
        const values = {
            wood: 30,
            logs: 60,
            coal: 90,
            charcoal: 70,
            tinder: 10,
            oil: 45
        };
        return values[fuelType] || 20;
    }

    // ============= FURNITURE CLASS =============
    class Furniture {
        constructor(typeId, buildingX, buildingY) {
            const type = FURNITURE[typeId];
            if (!type) {
                console.error(`Invalid furniture type: ${typeId}`);
                return null;
            }

            this.id = nextFurnitureId++;
            this.typeId = typeId;
            this.type = type;
            this.x = buildingX;
            this.y = buildingY;

            this.orientation = Math.floor(Math.random() * 4);
        }
    }

    // ============= TEMPERATURE SYSTEM =============
    function getEnvironmentalTemperature() {
        let baseTemp = 22;

        // Time of day effect
        if (typeof dayNightCycle !== 'undefined') {
            const time = dayNightCycle.time || 0.5;
            if (time < 0.25 || time > 0.75) {
                baseTemp -= 8;
            } else {
                baseTemp += 3;
            }
        }

        // Season effect
        if (typeof SeasonSystem !== 'undefined') {
            const season = SeasonSystem.getCurrentSeason();
            if (season) {
                switch (season.id) {
                    case 'summer':
                        baseTemp += 10;
                        break;
                    case 'winter':
                        baseTemp -= 15;
                        break;
                    case 'spring':
                    case 'fall':
                        baseTemp += 0;
                        break;
                }
            }
        }

        // Weather effect
        if (typeof WeatherSystem !== 'undefined') {
            const weather = WeatherSystem.getCurrentWeather();
            if (weather) {
                switch (weather.id) {
                    case 'rain':
                        baseTemp -= 3;
                        break;
                    case 'snow':
                        baseTemp -= 10;
                        break;
                    case 'storm':
                        baseTemp -= 5;
                        break;
                    case 'heatwave':
                        baseTemp += 8;
                        break;
                }
            }
        }

        // Biome effect
        if (typeof BiomeSystem !== 'undefined') {
            const biome = BiomeSystem.getBiomeAt(player.x, player.y);
            if (biome) {
                switch (biome.id) {
                    case 'desert':
                        baseTemp += 15;
                        break;
                    case 'snow':
                        baseTemp -= 20;
                        break;
                    case 'volcanic':
                        baseTemp += 20;
                        break;
                }
            }
        }

        return baseTemp;
    }

    function getPlayerTemperature() {
        const envTemp = getEnvironmentalTemperature();
        const shelterBonus = getShelterInsulation();
        const fireBonus = getNearbyFireWarmth();

        let effectiveTemp = envTemp + shelterBonus + fireBonus;

        // Clamp to reasonable range
        effectiveTemp = Math.max(-30, Math.min(50, effectiveTemp));

        return effectiveTemp;
    }

    function updatePlayerTemperature(dt) {
        const temp = getPlayerTemperature();
        playerTemperature = temp;

        // Hypothermia
        if (temp < CONFIG.TEMPERATURE_FREEZING) {
            const severity = (CONFIG.TEMPERATURE_FREEZING - temp) / 20;
            playerHypothermia += CONFIG.HYPOTHERMIA_RATE * severity * dt * 10;
        } else if (temp > CONFIG.TEMPERATURE_FREEZING + 5) {
            playerHypothermia = Math.max(0, playerHypothermia - CONFIG.HYPOTHERMIA_HEAL_RATE * dt);
        }

        // Heatstroke
        if (temp > CONFIG.TEMPERATURE_HEATSTROKE) {
            const severity = (temp - CONFIG.TEMPERATURE_HEATSTROKE) / 20;
            playerHeatstroke += CONFIG.HEATSTROKE_RATE * severity * dt * 10;
        } else if (temp < CONFIG.TEMPERATURE_HEATSTROKE - 5) {
            playerHeatstroke = Math.max(0, playerHeatstroke - CONFIG.HEATSTROKE_HEAL_RATE * dt);
        }

        // Apply status effects
        if (playerHypothermia > 0) {
            const damage = playerHypothermia * 0.01 * dt;
            player.health -= damage;
            player.speed *= 0.95;

            if (typeof addDamageNumber === 'function' && Math.random() < 0.05) {
                addDamageNumber(player.x, player.y - 0.5, Math.ceil(damage), '#88ccff');
            }
        }

        if (playerHeatstroke > 0) {
            const damage = playerHeatstroke * 0.01 * dt;
            player.health -= damage;
            player.hunger -= damage * 2;

            if (typeof addDamageNumber === 'function' && Math.random() < 0.05) {
                addDamageNumber(player.x, player.y - 0.5, Math.ceil(damage), '#ff8844');
            }
        }

        // Reset speed modifier
        if (typeof player.speed === 'number') {
            player.speed = player.baseSpeed || 5;
        }

        // Clamp values
        playerHypothermia = Math.min(CONFIG.HYPOTHERMIA_MAX, playerHypothermia);
        playerHeatstroke = Math.min(CONFIG.HEATSTROKE_MAX, playerHeatstroke);
    }

    function getShelterInsulation() {
        let maxInsulation = 0;

        for (const building of buildings) {
            if (building.isPlayerInside(player.x, player.y)) {
                maxInsulation = Math.max(maxInsulation, building.getInsulation());
            }
        }

        return maxInsulation;
    }

    function getNearbyFireWarmth() {
        let maxWarmth = 0;

        for (const fire of activeFires) {
            const warmth = fire.getWarmthAt(player.x, player.y);
            maxWarmth = Math.max(maxWarmth, warmth);
        }

        return maxWarmth;
    }

    // ============= COMFORT SYSTEM =============
    function updatePlayerComfort(dt) {
        if (isSleeping) return;

        let targetComfort = CONFIG.COMFORT_BASE;

        // Building comfort
        for (const building of buildings) {
            if (building.isPlayerInside(player.x, player.y)) {
                targetComfort = Math.max(targetComfort, building.getTotalComfort());
            }
        }

        // Well rested bonus
        if (wellRestedTimer > 0) {
            targetComfort *= CONFIG.WELL_RESTED_BONUS;
            wellRestedTimer -= dt;
        }

        // Apply decay
        playerComfort = Math.max(0, playerComfort - CONFIG.COMFORT_DECAY * dt);
        playerComfort = (playerComfort + targetComfort * dt) / (1 + dt);
    }

    function getHealthRegenRate() {
        let regen = 0;

        if (playerComfort > 50) {
            regen += CONFIG.COMFORT_HEAL_BONUS * (playerComfort / 50);
        }

        if (wellRestedTimer > 0) {
            regen *= CONFIG.WELL_RESTED_BONUS;
        }

        return regen;
    }

    // ============= SLEEP SYSTEM =============
    function startSleep(building = null) {
        if (isSleeping) return false;

        // Check for bed
        let hasBed = false;
        if (building) {
            hasBed = building.furniture.some(f => f.type.type === 'bed');
        } else {
            for (const b of buildings) {
                if (b.isPlayerInside(player.x, player.y)) {
                    hasBed = b.furniture.some(f => f.type.type === 'bed');
                    if (hasBed) {
                        building = b;
                        break;
                    }
                }
            }
        }

        if (!hasBed) {
            if (typeof showNotification === 'function') {
                showNotification('Need a bed to sleep!', []);
            }
            return false;
        }

        isSleeping = true;
        sleepTimer = CONFIG.SLEEP_DURATION;
        lastSleepQuality = 0;

        EventBus.emit('sleep:started', { building: building });
        return true;
    }

    function stopSleep() {
        if (!isSleeping) return false;

        // Calculate quality
        const quality = Math.min(1, sleepTimer / CONFIG.SLEEP_DURATION);

        // Apply benefits
        if (quality > 0.5) {
            player.health = Math.min(player.maxHealth, player.health + CONFIG.SLEEP_HP_REGEN * sleepTimer);
            wellRestedTimer = CONFIG.WELL_RESTED_DURATION * quality;
        }

        // Consume hunger
        player.hunger -= sleepTimer * 0.5;

        lastSleepQuality = quality;
        isSleeping = false;

        EventBus.emit('sleep:ended', { duration: CONFIG.SLEEP_DURATION - sleepTimer, quality: quality });
        return true;
    }

    function updateSleep(dt) {
        if (!isSleeping) return;

        sleepTimer -= dt;

        // Skip night if sleeping
        if (typeof skipNight === 'function') {
            skipNight(dt);
        }

        // Wake up if timer done or player wakes
        if (sleepTimer <= 0 || player.health <= 0) {
            stopSleep();
        }
    }

    // ============= BUILDING MANAGEMENT =============
    function canBuild(buildingTypeId, x, y) {
        const type = BUILDINGS[buildingTypeId];
        if (!type) return false;

        // Check materials
        for (const [material, amount] of Object.entries(type.materials)) {
            if ((resources[material] || 0) < amount) {
                return false;
            }
        }

        // Check ground type
        if (type.requiresGround && type.requiresGround.length > 0) {
            const tile = getTileAt(x, y);
            if (!type.requiresGround.includes(tile)) {
                return false;
            }
        }

        // Check overlap
        for (const building of buildings) {
            const dist = Math.sqrt((building.x - x) ** 2 + (building.y - y) ** 2);
            if (dist < (type.size + building.type.size) / 2) {
                return false;
            }
        }

        return true;
    }

    function build(buildingTypeId, x, y) {
        const type = BUILDINGS[buildingTypeId];
        if (!type) return false;

        // Consume materials
        for (const [material, amount] of Object.entries(type.materials)) {
            resources[material] -= amount;
        }

        // Create building
        const building = new Building(buildingTypeId, x, y);
        buildings.push(building);

        EventBus.emit('building:built', { building: building });
        return true;
    }

    function getBuildingAt(x, y) {
        for (const building of buildings) {
            if (building.isPlayerInside(x, y)) {
                return building;
            }
        }
        return null;
    }

    function getBuildings() {
        return [...buildings];
    }

    function demolishBuilding(buildingId) {
        const building = buildings.find(b => b.id === buildingId);
        if (!building) return false;

        building.destroy();
        return true;
    }

    function upgradeBuilding(buildingId) {
        const building = buildings.find(b => b.id === buildingId);
        if (!building) return false;

        return building.upgrade();
    }

    // ============= FIRE MANAGEMENT =============
    function canPlaceFire(fireTypeId, x, y) {
        const type = FIRES[fireTypeId];
        if (!type) return false;

        if (type.handheld) return true;

        // Check materials
        for (const [material, amount] of Object.entries(type.materials)) {
            if ((resources[material] || 0) < amount) {
                return false;
            }
        }

        // Check if near building if required
        if (type.requiresBuilding) {
            let hasFireplace = false;
            for (const building of buildings) {
                if (building.isPlayerInside(x, y) && building.typeId === 'cabin') {
                    hasFireplace = true;
                    break;
                }
            }
            if (!hasFireplace) return false;
        }

        return true;
    }

    function placeFire(fireTypeId, x, y) {
        const type = FIRES[fireTypeId];
        if (!type) return false;

        // Consume materials
        for (const [material, amount] of Object.entries(type.materials)) {
            resources[material] -= amount;
        }

        // Create fire
        const fire = new Fire(fireTypeId, x, y);
        activeFires.push(fire);

        // Check if inside building
        for (const building of buildings) {
            if (building.isPlayerInside(x, y)) {
                fire.parentBuilding = building;
                building.fire = fire;
                break;
            }
        }

        EventBus.emit('fire:placed', { fire: fire });
        return fire;
    }

    function getActiveFires() {
        return [...activeFires];
    }

    // ============= UPDATE FUNCTIONS =============
    function update(dt) {
        // Update temperature
        updatePlayerTemperature(dt);

        // Update comfort
        updatePlayerComfort(dt);

        // Update sleep
        updateSleep(dt);

        // Update fires
        for (const fire of [...activeFires]) {
            fire.update(dt);
        }

        // Update buildings
        for (const building of buildings) {
            // Update occupants
            building.occupants = 0;
            for (const survivor of survivors || []) {
                if (building.isPlayerInside(survivor.x, survivor.y)) {
                    building.occupants++;
                }
            }
        }
    }

    // ============= RENDERING =============
    function renderShelters(ctx) {
        // Render buildings
        for (const building of buildings) {
            renderBuilding(ctx, building);
        }

        // Render fires
        for (const fire of activeFires) {
            renderFire(ctx, fire);
        }
    }

    function renderBuilding(ctx, building) {
        const screenX = (building.x - camera.x) * TILE_SIZE + ctx.canvas.width / 2;
        const screenY = (building.y - camera.y) * TILE_SIZE + ctx.canvas.height / 2;
        const size = building.type.size * TILE_SIZE;

        // Building shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(screenX - size / 2 + 5, screenY - size / 2 + 5, size, size);

        // Building body
        const gradient = ctx.createLinearGradient(
            screenX - size / 2, screenY - size / 2,
            screenX + size / 2, screenY + size / 2
        );

        if (building.type.underground) {
            gradient.addColorStop(0, '#4a4a4a');
            gradient.addColorStop(1, '#2a2a2a');
        } else {
            gradient.addColorStop(0, '#8b6914');
            gradient.addColorStop(1, '#5a4510');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size);

        // Building border
        ctx.strokeStyle = building.level > 1 ? '#ffd700' : '#333';
        ctx.lineWidth = building.level > 1 ? 3 : 1;
        ctx.strokeRect(screenX - size / 2, screenY - size / 2, size, size);

        // Building icon
        ctx.font = `${size * 0.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(building.type.icon, screenX, screenY);

        // Door indicator
        if (building.doorOpen) {
            ctx.fillStyle = '#333';
            ctx.fillRect(screenX + size / 2 - 5, screenY - 10, 10, 20);
        }

        // Health bar if damaged
        if (building.health < building.maxHealth) {
            const healthPercent = building.health / building.maxHealth;
            const barWidth = size * 0.8;
            const barHeight = 4;

            ctx.fillStyle = '#333';
            ctx.fillRect(screenX - barWidth / 2, screenY - size / 2 - 10, barWidth, barHeight);
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(screenX - barWidth / 2, screenY - size / 2 - 10, barWidth * healthPercent, barHeight);
        }
    }

    function renderFire(ctx, fire) {
        const screenX = (fire.x - camera.x) * TILE_SIZE + ctx.canvas.width / 2;
        const screenY = (fire.y - camera.y) * TILE_SIZE + ctx.canvas.height / 2;

        // Fire flicker
        const flicker = Math.sin(Date.now() / 100 + fire.flickerOffset) * 0.2 + 0.8;
        const size = 16 * fire.intensity * flicker;

        // Fire glow
        const glowGradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, fire.type.lightRadius * TILE_SIZE);
        glowGradient.addColorStop(0, 'rgba(255, 150, 50, 0.3)');
        glowGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(screenX - fire.type.lightRadius * TILE_SIZE, screenY - fire.type.lightRadius * TILE_SIZE,
                     fire.type.lightRadius * 2 * TILE_SIZE, fire.type.lightRadius * 2 * TILE_SIZE);

        // Fire core
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(screenX, screenY, size / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(screenX, screenY, size / 3, 0, Math.PI * 2);
        ctx.fill();

        // Fire icon
        ctx.font = `${size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(fire.type.icon, screenX, screenY);
    }

    // ============= UI FUNCTIONS =============
    function getTemperatureStatus() {
        const temp = getPlayerTemperature();

        if (temp < CONFIG.TEMPERATURE_FREEZING) {
            return { status: 'freezing', color: '#00ccff', message: 'Freezing!' };
        } else if (temp < 10) {
            return { status: 'cold', color: '#88ccff', message: 'Cold' };
        } else if (temp < CONFIG.TEMPERATURE_HEATSTROKE - 5) {
            return { status: 'optimal', color: '#00ff00', message: 'Comfortable' };
        } else if (temp < CONFIG.TEMPERATURE_HEATSTROKE) {
            return { status: 'warm', color: '#ffcc00', message: 'Warm' };
        } else {
            return { status: 'hot', color: '#ff4400', message: 'Hot!' };
        }
    }

    function getHypothermiaSeverity() {
        if (playerHypothermia < 25) return null;
        if (playerHypothermia < 50) return { level: 'mild', color: '#88ccff' };
        if (playerHypothermia < 75) return { level: 'moderate', color: '#4488ff' };
        return { level: 'severe', color: '#0044ff' };
    }

    function getHeatstrokeSeverity() {
        if (playerHeatstroke < 25) return null;
        if (playerHeatstroke < 50) return { level: 'mild', color: '#ffcc88' };
        if (playerHeatstroke < 75) return { level: 'moderate', color: '#ff8844' };
        return { level: 'severe', color: '#ff4400' };
    }

    function getComfortLevel() {
        if (playerComfort < 25) return { level: 'uncomfortable', color: '#ff4444' };
        if (playerComfort < 50) return { level: 'basic', color: '#ffaa44' };
        if (playerComfort < 75) return { level: 'comfortable', color: '#aacc44' };
        return { level: 'luxurious', color: '#44ff44' };
    }

    function getWellRestedStatus() {
        if (wellRestedTimer <= 0) return null;
        const minutes = Math.floor(wellRestedTimer / 60);
        return { duration: minutes, active: true };
    }

    // ============= SERIALIZATION =============
    function getState() {
        return {
            buildings: buildings.map(b => ({
                id: b.id,
                typeId: b.typeId,
                x: b.x,
                y: b.y,
                level: b.level,
                health: b.health,
                maxHealth: b.maxHealth,
                insulation: b.insulation,
                comfort: b.comfort,
                furniture: b.furniture.map(f => f.typeId),
                doorOpen: b.doorOpen
            })),
            fires: activeFires.map(f => ({
                id: f.id,
                typeId: f.typeId,
                x: f.x,
                y: f.y,
                fuel: f.fuel,
                maxFuel: f.maxFuel,
                intensity: f.intensity,
                parentBuildingId: f.parentBuilding?.id || null
            })),
            playerTemperature: playerTemperature,
            playerHypothermia: playerHypothermia,
            playerHeatstroke: playerHeatstroke,
            playerComfort: playerComfort,
            wellRestedTimer: wellRestedTimer,
            isSleeping: isSleeping,
            sleepTimer: sleepTimer,
            nextBuildingId: nextBuildingId,
            nextFireId: nextFireId,
            nextFurnitureId: nextFurnitureId
        };
    }

    function setState(state) {
        if (!state) return;

        buildings = [];
        activeFires = [];
        const buildingMap = new Map();

        if (state.buildings) {
            for (const bState of state.buildings) {
                const building = new Building(bState.typeId, bState.x, bState.y);
                building.id = bState.id;
                building.level = bState.level;
                building.health = bState.health;
                building.maxHealth = bState.maxHealth;
                building.insulation = bState.insulation;
                building.comfort = bState.comfort;
                building.doorOpen = bState.doorOpen;

                buildingMap.set(bState.id, building);
                buildings.push(building);
            }
        }

        if (state.fires) {
            for (const fState of state.fires) {
                const fire = new Fire(fState.typeId, fState.x, fState.y);
                fire.id = fState.id;
                fire.fuel = fState.fuel;
                fire.maxFuel = fState.maxFuel;
                fire.intensity = fState.intensity;

                if (fState.parentBuildingId) {
                    fire.parentBuilding = buildingMap.get(fState.parentBuildingId);
                    if (fire.parentBuilding) {
                        fire.parentBuilding.fire = fire;
                    }
                }

                activeFires.push(fire);
            }
        }

        playerTemperature = state.playerTemperature || CONFIG.TEMPERATURE_OPTIMAL;
        playerHypothermia = state.playerHypothermia || 0;
        playerHeatstroke = state.playerHeatstroke || 0;
        playerComfort = state.playerComfort || 0;
        wellRestedTimer = state.wellRestedTimer || 0;
        isSleeping = state.isSleeping || false;
        sleepTimer = state.sleepTimer || 0;
        nextBuildingId = state.nextBuildingId || 1;
        nextFireId = state.nextFireId || 1;
        nextFurnitureId = state.nextFurnitureId || 1;
    }

    // ============= PUBLIC API =============
    return {
        // Configuration
        CONFIG,
        BUILDINGS,
        FURNITURE,
        FIRES,

        // Temperature
        getEnvironmentalTemperature,
        getPlayerTemperature,
        getTemperatureStatus,
        getHypothermiaSeverity,
        getHeatstrokeSeverity,

        // Comfort
        updatePlayerComfort,
        getComfortLevel,
        getHealthRegenRate,

        // Sleep
        startSleep,
        stopSleep,
        getWellRestedStatus,

        // Building
        canBuild,
        build,
        getBuildingAt,
        getBuildings,
        demolishBuilding,
        upgradeBuilding,

        // Fire
        canPlaceFire,
        placeFire,
        getActiveFires,

        // Update & Render
        update,
        renderShelters,

        // State
        getState,
        setState
    };
})();

window.ShelterSystem = ShelterSystem;
