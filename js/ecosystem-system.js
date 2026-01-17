// ============================================
// ECOSYSTEM SYSTEM - Integrated Food Chain & Population Dynamics
// ============================================
// Production-grade ecosystem management with food chains,
// population control, migration patterns, and environmental interactions

const EcosystemSystem = (function() {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        // Update intervals
        UPDATE_INTERVAL: 1.0,
        POPULATION_CHECK_INTERVAL: 10.0,
        MIGRATION_CHECK_INTERVAL: 30.0,

        // Population limits per biome
        POPULATION: {
            MAX_PREY_PER_BIOME: 8,
            MAX_PREDATORS_PER_BIOME: 4,
            MAX_TOTAL_ANIMALS: 40,
            MIN_PREY_FOR_PREDATORS: 3,
            SPAWN_COOLDOWN: 15.0
        },

        // Food chain
        FOOD_CHAIN: {
            HUNT_SUCCESS_RATE: 0.6,
            SCAVENGE_RADIUS: 15,
            CORPSE_DECAY_TIME: 60,
            HUNGER_THRESHOLD: 0.4,
            STARVATION_TIME: 120
        },

        // Migration
        MIGRATION: {
            TRIGGER_OVERPOPULATION: 0.8,
            TRIGGER_UNDERPOPULATION: 0.2,
            DISTANCE: 50,
            GROUP_SIZE: 3
        },

        // Environmental effects
        ENVIRONMENT: {
            WEATHER_SPAWN_MODIFIER: 0.5,
            NIGHT_PREDATOR_BOOST: 1.5,
            BIOME_PREFERENCE_WEIGHT: 2.0
        }
    };

    // ============= FOOD CHAIN DEFINITIONS =============
    const FOOD_CHAIN = {
        // Predators and their prey
        PREDATOR_PREY: {
            wolf: ['rabbit', 'deer', 'fox'],
            bear: ['deer', 'boar', 'rabbit', 'fish'],
            tiger: ['deer', 'boar', 'rabbit'],
            snake: ['rabbit', 'mouse'],
            hawk: ['rabbit', 'mouse', 'snake'],
            fox: ['rabbit', 'mouse']
        },

        // Scavengers that eat corpses
        SCAVENGERS: ['fox', 'bear', 'hawk'],

        // Herbivores and their food sources
        HERBIVORE_FOOD: {
            rabbit: ['grass', 'berry_bush', 'farm'],
            deer: ['grass', 'tree', 'berry_bush'],
            boar: ['grass', 'berry_bush', 'mushroom'],
            camel: ['cactus', 'grass'],
            beaver: ['tree']
        },

        // Prey alertness levels (affects hunt difficulty)
        PREY_ALERTNESS: {
            rabbit: 0.9,    // Very alert
            deer: 0.7,      // Alert
            boar: 0.4,      // Less alert, aggressive
            fox: 0.8,       // Alert
            mouse: 0.6      // Moderate
        }
    };

    // ============= BIOME ANIMAL DISTRIBUTIONS =============
    const BIOME_ANIMALS = {
        plains: {
            prey: ['rabbit', 'deer'],
            predators: ['wolf', 'fox', 'hawk'],
            weights: { rabbit: 0.4, deer: 0.3, wolf: 0.15, fox: 0.1, hawk: 0.05 }
        },
        jungle: {
            prey: ['rabbit', 'deer', 'boar'],
            predators: ['tiger', 'snake'],
            weights: { rabbit: 0.25, deer: 0.2, boar: 0.25, tiger: 0.2, snake: 0.1 }
        },
        snow: {
            prey: ['rabbit', 'deer'],
            predators: ['wolf', 'bear'],
            weights: { rabbit: 0.3, deer: 0.3, wolf: 0.25, bear: 0.15 }
        },
        desert: {
            prey: ['rabbit', 'camel'],
            predators: ['snake', 'hawk'],
            weights: { rabbit: 0.3, camel: 0.3, snake: 0.25, hawk: 0.15 }
        },
        swamp: {
            prey: ['boar', 'beaver'],
            predators: ['snake', 'bear'],
            weights: { boar: 0.35, beaver: 0.25, snake: 0.25, bear: 0.15 }
        },
        volcanic: {
            prey: ['boar'],
            predators: ['snake'],
            weights: { boar: 0.6, snake: 0.4 }
        },
        ruins: {
            prey: ['rabbit'],
            predators: ['snake', 'hawk'],
            weights: { rabbit: 0.5, snake: 0.3, hawk: 0.2 }
        }
    };

    // ============= STATE =============
    let state = {
        animals: [],
        corpses: [],
        populations: new Map(),
        biomePopulations: new Map(),
        lastUpdate: 0,
        lastPopulationCheck: 0,
        lastMigrationCheck: 0,
        spawnCooldowns: new Map(),
        huntEvents: [],
        migrationGroups: []
    };

    // ============= ANIMAL CLASS =============
    class EcosystemAnimal {
        constructor(type, x, y, biome) {
            this.id = Date.now() + Math.random();
            this.type = type;
            this.x = x;
            this.y = y;
            this.biome = biome;
            this.health = this.getMaxHealth();
            this.maxHealth = this.health;
            this.hunger = 1.0;
            this.age = 0;
            this.state = 'idle';
            this.target = null;
            this.lastHuntTime = 0;
            this.lastFeedTime = 0;
            this.direction = Math.floor(Math.random() * 4);
            this.isMoving = false;
            this.animTimer = 0;
            this.frame = 0;

            // Link to AI system
            this.ai = null;
        }

        getMaxHealth() {
            if (typeof AnimalAISystem !== 'undefined') {
                const typeData = AnimalAISystem.ANIMAL_TYPES[this.type.toUpperCase()];
                if (typeData) return typeData.health;
            }
            return 20;
        }

        isPredator() {
            return Object.keys(FOOD_CHAIN.PREDATOR_PREY).includes(this.type);
        }

        isPrey() {
            for (const preyList of Object.values(FOOD_CHAIN.PREDATOR_PREY)) {
                if (preyList.includes(this.type)) return true;
            }
            return false;
        }

        isScavenger() {
            return FOOD_CHAIN.SCAVENGERS.includes(this.type);
        }

        canEat(targetType) {
            const preyList = FOOD_CHAIN.PREDATOR_PREY[this.type];
            return preyList && preyList.includes(targetType);
        }

        update(dt) {
            this.age += dt;

            // Hunger increases over time
            this.hunger = Math.max(0, this.hunger - dt * 0.005);

            // Starvation damage
            if (this.hunger <= 0) {
                this.health -= dt * 0.5;
            }

            // Link to animal AI if available
            if (!this.ai && typeof AnimalAISystem !== 'undefined') {
                this.ai = AnimalAISystem.getAI(this);
            }
        }

        feed(amount) {
            this.hunger = Math.min(1.0, this.hunger + amount);
            this.lastFeedTime = state.lastUpdate;
        }

        takeDamage(amount, attacker) {
            this.health -= amount;

            if (typeof addDamageNumber === 'function') {
                addDamageNumber(this.x, this.y - 0.3, Math.floor(amount), '#ff4444');
            }
            if (typeof spawnParticles === 'function') {
                spawnParticles(this.x, this.y, '#cc0000', 4);
            }

            return this.health <= 0;
        }
    }

    // ============= CORPSE CLASS =============
    class Corpse {
        constructor(animal, x, y) {
            this.id = Date.now() + Math.random();
            this.animalType = animal.type;
            this.x = x;
            this.y = y;
            this.foodValue = this.calculateFoodValue(animal);
            this.timeRemaining = CONFIG.FOOD_CHAIN.CORPSE_DECAY_TIME;
            this.isBeingEaten = false;
        }

        calculateFoodValue(animal) {
            const healthBase = animal.maxHealth || 20;
            return Math.floor(healthBase * 0.5);
        }

        update(dt) {
            this.timeRemaining -= dt;
            return this.timeRemaining <= 0 || this.foodValue <= 0;
        }

        consume(amount) {
            const consumed = Math.min(amount, this.foodValue);
            this.foodValue -= consumed;
            return consumed;
        }
    }

    // ============= POPULATION MANAGEMENT =============
    function updatePopulations() {
        state.populations.clear();
        state.biomePopulations.clear();

        for (const animal of state.animals) {
            // Count by type
            const typeCount = state.populations.get(animal.type) || 0;
            state.populations.set(animal.type, typeCount + 1);

            // Count by biome
            const biomeKey = animal.biome || 'plains';
            if (!state.biomePopulations.has(biomeKey)) {
                state.biomePopulations.set(biomeKey, { prey: 0, predators: 0, total: 0 });
            }
            const biomePop = state.biomePopulations.get(biomeKey);
            biomePop.total++;

            if (animal.isPredator()) {
                biomePop.predators++;
            }
            if (animal.isPrey()) {
                biomePop.prey++;
            }
        }
    }

    function shouldSpawnInBiome(biome) {
        const biomePop = state.biomePopulations.get(biome);
        if (!biomePop) return true;

        const maxTotal = CONFIG.POPULATION.MAX_PREY_PER_BIOME + CONFIG.POPULATION.MAX_PREDATORS_PER_BIOME;
        return biomePop.total < maxTotal;
    }

    function getSpawnTypeForBiome(biome) {
        const biomeData = BIOME_ANIMALS[biome] || BIOME_ANIMALS.plains;
        const biomePop = state.biomePopulations.get(biome) || { prey: 0, predators: 0 };

        // Determine if we need prey or predators
        const needPrey = biomePop.prey < CONFIG.POPULATION.MAX_PREY_PER_BIOME;
        const needPredators = biomePop.predators < CONFIG.POPULATION.MAX_PREDATORS_PER_BIOME &&
            biomePop.prey >= CONFIG.POPULATION.MIN_PREY_FOR_PREDATORS;

        // Build weighted pool
        const pool = [];
        const weights = biomeData.weights;

        if (needPrey) {
            for (const type of biomeData.prey) {
                pool.push({ type, weight: weights[type] || 0.1 });
            }
        }

        if (needPredators) {
            // Night bonus for predators
            const nightMult = (typeof isNight !== 'undefined' && isNight) ?
                CONFIG.ENVIRONMENT.NIGHT_PREDATOR_BOOST : 1.0;

            for (const type of biomeData.predators) {
                pool.push({ type, weight: (weights[type] || 0.1) * nightMult });
            }
        }

        if (pool.length === 0) return null;

        // Weighted random selection
        const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
        let random = Math.random() * totalWeight;

        for (const entry of pool) {
            random -= entry.weight;
            if (random <= 0) {
                return entry.type;
            }
        }

        return pool[0].type;
    }

    // ============= SPAWNING =============
    function spawnAnimal(type, x, y, biome) {
        if (state.animals.length >= CONFIG.POPULATION.MAX_TOTAL_ANIMALS) {
            return null;
        }

        const animal = new EcosystemAnimal(type, x, y, biome);
        state.animals.push(animal);

        // Create in AnimalAISystem if available
        if (typeof AnimalAISystem !== 'undefined') {
            const aiAnimal = AnimalAISystem.createAnimal(type, x, y);
            if (aiAnimal) {
                animal.ai = AnimalAISystem.getAI(aiAnimal);
                // Sync properties
                aiAnimal.ecosystemRef = animal;
            }
        }

        return animal;
    }

    function spawnNearPlayer(type, minDist = 15, maxDist = 30) {
        if (typeof player === 'undefined') return null;

        const angle = Math.random() * Math.PI * 2;
        const dist = minDist + Math.random() * (maxDist - minDist);
        const x = player.x + Math.cos(angle) * dist;
        const y = player.y + Math.sin(angle) * dist;

        // Determine biome
        let biome = 'plains';
        if (typeof WorldVariation !== 'undefined') {
            biome = WorldVariation.getBiomeAt(x, y) || 'plains';
        }

        return spawnAnimal(type, x, y, biome);
    }

    function tryNaturalSpawn() {
        if (state.animals.length >= CONFIG.POPULATION.MAX_TOTAL_ANIMALS) {
            return;
        }

        // Find biomes that need animals
        const biomes = Object.keys(BIOME_ANIMALS);
        const eligibleBiomes = biomes.filter(b => {
            const cooldown = state.spawnCooldowns.get(b) || 0;
            return cooldown <= 0 && shouldSpawnInBiome(b);
        });

        if (eligibleBiomes.length === 0) return;

        // Pick a random eligible biome
        const biome = eligibleBiomes[Math.floor(Math.random() * eligibleBiomes.length)];
        const type = getSpawnTypeForBiome(biome);

        if (!type) return;

        // Find spawn position in biome
        const spawnPos = findSpawnPositionInBiome(biome);
        if (spawnPos) {
            spawnAnimal(type, spawnPos.x, spawnPos.y, biome);
            state.spawnCooldowns.set(biome, CONFIG.POPULATION.SPAWN_COOLDOWN);
        }
    }

    function findSpawnPositionInBiome(biome) {
        if (typeof player === 'undefined') return null;

        // Search for valid position
        for (let attempts = 0; attempts < 20; attempts++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 20 + Math.random() * 40;
            const x = player.x + Math.cos(angle) * dist;
            const y = player.y + Math.sin(angle) * dist;

            // Check biome
            let tileBiome = 'plains';
            if (typeof WorldVariation !== 'undefined') {
                tileBiome = WorldVariation.getBiomeAt(x, y) || 'plains';
            }

            if (tileBiome === biome && !isSolidAt(x, y, 0.5)) {
                return { x, y };
            }
        }

        return null;
    }

    // ============= HUNTING & FOOD CHAIN =============
    function processHunting(dt) {
        for (const predator of state.animals) {
            if (!predator.isPredator()) continue;
            if (predator.hunger > CONFIG.FOOD_CHAIN.HUNGER_THRESHOLD) continue;

            // Find nearby prey
            const prey = findNearbyPrey(predator);
            if (prey) {
                attemptHunt(predator, prey);
            } else if (predator.isScavenger()) {
                // Try scavenging
                const corpse = findNearbyCorpse(predator);
                if (corpse) {
                    scavengeCorpse(predator, corpse);
                }
            }
        }
    }

    function findNearbyPrey(predator) {
        const huntRange = 10;
        let nearestPrey = null;
        let nearestDist = huntRange;

        for (const animal of state.animals) {
            if (animal === predator) continue;
            if (!predator.canEat(animal.type)) continue;

            const dx = animal.x - predator.x;
            const dy = animal.y - predator.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < nearestDist) {
                nearestDist = dist;
                nearestPrey = animal;
            }
        }

        return nearestPrey;
    }

    function findNearbyCorpse(scavenger) {
        let nearestCorpse = null;
        let nearestDist = CONFIG.FOOD_CHAIN.SCAVENGE_RADIUS;

        for (const corpse of state.corpses) {
            if (corpse.foodValue <= 0) continue;

            const dx = corpse.x - scavenger.x;
            const dy = corpse.y - scavenger.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < nearestDist) {
                nearestDist = dist;
                nearestCorpse = corpse;
            }
        }

        return nearestCorpse;
    }

    function attemptHunt(predator, prey) {
        const dx = prey.x - predator.x;
        const dy = prey.y - predator.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Must be close to attack
        if (dist > 1.5) return;

        // Hunt success based on alertness
        const alertness = FOOD_CHAIN.PREY_ALERTNESS[prey.type] || 0.5;
        const successChance = CONFIG.FOOD_CHAIN.HUNT_SUCCESS_RATE * (1 - alertness * 0.5);

        if (Math.random() < successChance) {
            // Successful kill
            const damage = prey.health;
            const killed = prey.takeDamage(damage, predator);

            if (killed) {
                onAnimalKilled(prey, predator);
            }
        }

        predator.lastHuntTime = state.lastUpdate;
    }

    function scavengeCorpse(scavenger, corpse) {
        const dx = corpse.x - scavenger.x;
        const dy = corpse.y - scavenger.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1.5) return;

        const consumed = corpse.consume(5);
        scavenger.feed(consumed * 0.05);

        if (typeof spawnParticles === 'function') {
            spawnParticles(corpse.x, corpse.y, '#884422', 2);
        }
    }

    function onAnimalKilled(prey, killer) {
        // Remove from animals list
        const index = state.animals.indexOf(prey);
        if (index > -1) {
            state.animals.splice(index, 1);
        }

        // Create corpse
        const corpse = new Corpse(prey, prey.x, prey.y);
        state.corpses.push(corpse);

        // Killer feeds
        if (killer) {
            killer.feed(corpse.foodValue * 0.02);
        }

        // Drop loot
        if (typeof AnimalAISystem !== 'undefined') {
            const typeData = AnimalAISystem.ANIMAL_TYPES[prey.type.toUpperCase()];
            if (typeData && typeData.loot) {
                dropLoot(prey.x, prey.y, typeData.loot);
            }
        }

        // Record hunt event
        state.huntEvents.push({
            time: state.lastUpdate,
            predator: killer ? killer.type : 'player',
            prey: prey.type,
            x: prey.x,
            y: prey.y
        });

        // Trim old events
        while (state.huntEvents.length > 50) {
            state.huntEvents.shift();
        }

        // Notify event bus
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('animalKilled', {
                animal: prey,
                killer: killer,
                loot: typeData?.loot
            });
        }
    }

    function dropLoot(x, y, loot) {
        if (typeof resources === 'undefined') return;

        for (const [resource, amount] of Object.entries(loot)) {
            if (resources[resource] !== undefined) {
                resources[resource] += amount;

                if (typeof addDamageNumber === 'function') {
                    addDamageNumber(x, y - 0.5, `+${amount}`, '#88ff88');
                }
            }
        }
    }

    // ============= MIGRATION =============
    function checkMigration() {
        for (const [biome, pop] of state.biomePopulations) {
            const maxPop = CONFIG.POPULATION.MAX_PREY_PER_BIOME + CONFIG.POPULATION.MAX_PREDATORS_PER_BIOME;
            const populationRatio = pop.total / maxPop;

            // Overpopulation triggers emigration
            if (populationRatio > CONFIG.MIGRATION.TRIGGER_OVERPOPULATION) {
                triggerEmigration(biome);
            }
        }
    }

    function triggerEmigration(fromBiome) {
        // Find animals in this biome
        const animalsInBiome = state.animals.filter(a => a.biome === fromBiome);
        if (animalsInBiome.length < CONFIG.MIGRATION.GROUP_SIZE) return;

        // Select migration group (prefer prey)
        const prey = animalsInBiome.filter(a => a.isPrey());
        const migrants = prey.slice(0, CONFIG.MIGRATION.GROUP_SIZE);

        if (migrants.length === 0) return;

        // Find destination biome
        const destBiome = findMigrationDestination(fromBiome, migrants[0].type);
        if (!destBiome) return;

        // Create migration group
        const migration = {
            animals: migrants,
            fromBiome,
            toBiome: destBiome,
            progress: 0,
            targetX: 0,
            targetY: 0
        };

        // Calculate destination
        if (typeof player !== 'undefined') {
            const angle = Math.random() * Math.PI * 2;
            migration.targetX = player.x + Math.cos(angle) * CONFIG.MIGRATION.DISTANCE;
            migration.targetY = player.y + Math.sin(angle) * CONFIG.MIGRATION.DISTANCE;
        }

        state.migrationGroups.push(migration);

        // Update animal biomes
        for (const animal of migrants) {
            animal.biome = destBiome;
            animal.state = 'migrating';
        }
    }

    function findMigrationDestination(fromBiome, animalType) {
        // Find biomes that support this animal type and need population
        for (const [biome, data] of Object.entries(BIOME_ANIMALS)) {
            if (biome === fromBiome) continue;

            const hasType = data.prey.includes(animalType) || data.predators.includes(animalType);
            if (!hasType) continue;

            const pop = state.biomePopulations.get(biome);
            if (!pop || pop.total < CONFIG.POPULATION.MAX_PREY_PER_BIOME) {
                return biome;
            }
        }

        return null;
    }

    function updateMigrations(dt) {
        for (let i = state.migrationGroups.length - 1; i >= 0; i--) {
            const migration = state.migrationGroups[i];
            migration.progress += dt * 0.1;

            if (migration.progress >= 1.0) {
                // Migration complete
                for (const animal of migration.animals) {
                    animal.state = 'idle';
                }
                state.migrationGroups.splice(i, 1);
            }
        }
    }

    // ============= HERBIVORE GRAZING =============
    function processGrazing(dt) {
        for (const animal of state.animals) {
            if (animal.isPredator()) continue;
            if (animal.hunger > 0.7) continue;

            const foodSources = FOOD_CHAIN.HERBIVORE_FOOD[animal.type];
            if (!foodSources) continue;

            // Check nearby tiles for food
            const food = findNearbyFoodSource(animal, foodSources);
            if (food) {
                graze(animal, food);
            }
        }
    }

    function findNearbyFoodSource(animal, foodTypes) {
        if (typeof getTile !== 'function') return null;

        const searchRadius = 3;
        const ax = Math.floor(animal.x);
        const ay = Math.floor(animal.y);

        for (let dy = -searchRadius; dy <= searchRadius; dy++) {
            for (let dx = -searchRadius; dx <= searchRadius; dx++) {
                const tile = getTile(ax + dx, ay + dy);
                const tileName = getTileName(tile);

                if (foodTypes.includes(tileName)) {
                    return { x: ax + dx + 0.5, y: ay + dy + 0.5, tile, tileName };
                }
            }
        }

        return null;
    }

    function getTileName(tile) {
        if (typeof TILES === 'undefined') return '';

        for (const [name, value] of Object.entries(TILES)) {
            if (value === tile) return name.toLowerCase();
        }
        return '';
    }

    function graze(animal, food) {
        const dx = food.x - animal.x;
        const dy = food.y - animal.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1.0) return;

        // Feed from food source
        animal.feed(0.1);

        // Occasionally deplete food source
        if (Math.random() < 0.1 && food.tileName === 'berry_bush') {
            if (typeof setTile === 'function' && typeof TILES !== 'undefined') {
                setTile(Math.floor(food.x), Math.floor(food.y), TILES.GRASS || 0);
            }
        }

        if (typeof spawnParticles === 'function') {
            spawnParticles(animal.x, animal.y, '#88cc44', 2);
        }
    }

    // ============= UPDATE =============
    function update(dt) {
        state.lastUpdate += dt;

        // Update spawn cooldowns
        for (const [biome, cooldown] of state.spawnCooldowns) {
            state.spawnCooldowns.set(biome, Math.max(0, cooldown - dt));
        }

        // Update animals
        for (let i = state.animals.length - 1; i >= 0; i--) {
            const animal = state.animals[i];
            animal.update(dt);

            // Remove dead animals
            if (animal.health <= 0) {
                onAnimalKilled(animal, null);
            }
        }

        // Update corpses
        for (let i = state.corpses.length - 1; i >= 0; i--) {
            const expired = state.corpses[i].update(dt);
            if (expired) {
                state.corpses.splice(i, 1);
            }
        }

        // Periodic population check
        if (state.lastUpdate - state.lastPopulationCheck > CONFIG.POPULATION_CHECK_INTERVAL) {
            updatePopulations();
            tryNaturalSpawn();
            state.lastPopulationCheck = state.lastUpdate;
        }

        // Process food chain
        processHunting(dt);
        processGrazing(dt);

        // Periodic migration check
        if (state.lastUpdate - state.lastMigrationCheck > CONFIG.MIGRATION_CHECK_INTERVAL) {
            checkMigration();
            state.lastMigrationCheck = state.lastUpdate;
        }

        updateMigrations(dt);
    }

    // ============= PLAYER INTERACTIONS =============
    function onPlayerAttackAnimal(animal, damage) {
        if (!animal) return;

        const killed = animal.takeDamage(damage, null);
        if (killed) {
            onAnimalKilled(animal, null);

            // Player exp
            if (typeof player !== 'undefined' && typeof AnimalAISystem !== 'undefined') {
                const typeData = AnimalAISystem.ANIMAL_TYPES[animal.type.toUpperCase()];
                if (typeData && typeData.exp) {
                    if (typeof givePlayerExp === 'function') {
                        givePlayerExp(typeData.exp);
                    }
                }
            }
        }
    }

    function getAnimalsNearPoint(x, y, radius) {
        return state.animals.filter(a => {
            const dx = a.x - x;
            const dy = a.y - y;
            return Math.sqrt(dx * dx + dy * dy) < radius;
        });
    }

    function getAnimalAt(x, y, tolerance = 0.5) {
        for (const animal of state.animals) {
            const dx = Math.abs(animal.x - x);
            const dy = Math.abs(animal.y - y);
            if (dx < tolerance && dy < tolerance) {
                return animal;
            }
        }
        return null;
    }

    // ============= PUBLIC API =============
    return {
        CONFIG,
        FOOD_CHAIN,
        BIOME_ANIMALS,

        // Core
        update,
        spawnAnimal,
        spawnNearPlayer,

        // Queries
        getAnimals: () => [...state.animals],
        getCorpses: () => [...state.corpses],
        getPopulations: () => new Map(state.populations),
        getBiomePopulations: () => new Map(state.biomePopulations),
        getAnimalsNearPoint,
        getAnimalAt,

        // Interactions
        onPlayerAttackAnimal,
        onAnimalKilled,

        // State management
        getState: () => ({
            animalCount: state.animals.length,
            corpseCount: state.corpses.length,
            populations: Object.fromEntries(state.populations),
            recentHunts: state.huntEvents.slice(-10)
        }),

        setState(newState) {
            if (newState.animals) {
                state.animals = newState.animals.map(a => {
                    const animal = new EcosystemAnimal(a.type, a.x, a.y, a.biome);
                    Object.assign(animal, a);
                    return animal;
                });
            }
        },

        // Debug
        debugSpawn(type, count = 1) {
            for (let i = 0; i < count; i++) {
                spawnNearPlayer(type);
            }
        },

        debugKillAll() {
            while (state.animals.length > 0) {
                onAnimalKilled(state.animals[0], null);
            }
        },

        getStats() {
            return {
                totalAnimals: state.animals.length,
                totalCorpses: state.corpses.length,
                populations: Object.fromEntries(state.populations),
                biomePopulations: Object.fromEntries(state.biomePopulations),
                migrationGroups: state.migrationGroups.length,
                recentHunts: state.huntEvents.length
            };
        }
    };
})();

// Export globally
window.EcosystemSystem = EcosystemSystem;
