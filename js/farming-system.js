// ============================================
// FARMING & AGRICULTURE SYSTEM
// ============================================
// Complete farming system with crops, livestock,
// seasons, irrigation, and food processing

const FarmingSystem = (function() {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        GROWTH_TICK_RATE: 1,
        NUTRIENT_DEPLETION_RATE: 0.5,
        WATER_DEPLETION_RATE: 0.3,
        IRRIGATION_MULTIPLIER: 2,
        DISEASE_CHANCE: 0.01,
        PEST_CHANCE: 0.02,
        CURE_CHANCE: 0.3,

        SEASON_MODIFIERS: {
            spring: { growthRate: 1.3, waterNeed: 1.0 },
            summer: { growthRate: 0.9, waterNeed: 1.5 },
            fall: { growthRate: 1.1, waterNeed: 0.8 },
            winter: { growthRate: 0.3, waterNeed: 0.5 }
        },

        SOIL_QUALITY: {
            poor: { multiplier: 0.6, name: 'Poor Soil' },
            average: { multiplier: 1.0, name: 'Average Soil' },
            rich: { multiplier: 1.4, name: 'Rich Soil' },
            fertile: { multiplier: 1.8, name: 'Fertile Soil' }
        },

        NUTRIENTS: {
            nitrogen: { name: 'Nitrogen', color: '#ff4444' },
            phosphorus: { name: 'Phosphorus', color: '#ffaa00' },
            potassium: { name: 'Potassium', color: '#44aaff' }
        }
    };

    // ============= CROP DEFINITIONS =============
    const CROPS = {
        WHEAT: {
            id: 'wheat',
            name: 'Wheat',
            icon: '🌾',
            type: 'grain',
            stages: 5,
            baseGrowthTime: 120,
            waterNeed: 1.0,
            nutrientNeed: { nitrogen: 1.5, phosphorus: 1.0, potassium: 1.0 },
            outputs: { wheat: 3, straw: 2 },
            seasons: ['spring', 'summer', 'fall'],
            canGreenhouse: true,
            diseaseResistance: 0.7,
            seedOutput: 2,
            nutrition: { calories: 120, protein: 4, carbs: 25, vitamins: 1 }
        },

        CORN: {
            id: 'corn',
            name: 'Corn',
            icon: '🌽',
            type: 'vegetable',
            stages: 6,
            baseGrowthTime: 150,
            waterNeed: 1.2,
            nutrientNeed: { nitrogen: 1.8, phosphorus: 1.2, potassium: 1.5 },
            outputs: { corn: 4, corn_cob: 1 },
            seasons: ['summer', 'fall'],
            canGreenhouse: true,
            diseaseResistance: 0.6,
            seedOutput: 2,
            nutrition: { calories: 140, protein: 5, carbs: 30, vitamins: 3 }
        },

        CARROT: {
            id: 'carrot',
            name: 'Carrot',
            icon: '🥕',
            type: 'vegetable',
            stages: 4,
            baseGrowthTime: 80,
            waterNeed: 1.1,
            nutrientNeed: { nitrogen: 0.8, phosphorus: 1.5, potassium: 1.2 },
            outputs: { carrot: 5, carrot_seeds: 2 },
            seasons: ['spring', 'fall'],
            canGreenhouse: true,
            diseaseResistance: 0.8,
            seedOutput: 3,
            nutrition: { calories: 50, protein: 1, carbs: 12, vitamins: 8 }
        },

        TOMATO: {
            id: 'tomato',
            name: 'Tomato',
            icon: '🍅',
            type: 'vegetable',
            stages: 5,
            baseGrowthTime: 110,
            waterNeed: 1.3,
            nutrientNeed: { nitrogen: 1.2, phosphorus: 1.3, potassium: 1.8 },
            outputs: { tomato: 6, tomato_seeds: 2 },
            seasons: ['summer'],
            canGreenhouse: true,
            diseaseResistance: 0.5,
            seedOutput: 2,
            nutrition: { calories: 40, protein: 2, carbs: 9, vitamins: 5 }
        },

        POTATO: {
            id: 'potato',
            name: 'Potato',
            icon: '🥔',
            type: 'vegetable',
            stages: 4,
            baseGrowthTime: 140,
            waterNeed: 0.8,
            nutrientNeed: { nitrogen: 0.6, phosphorus: 1.0, potassium: 1.4 },
            outputs: { potato: 8, potato_eyes: 2 },
            seasons: ['spring', 'fall'],
            canGreenhouse: true,
            diseaseResistance: 0.9,
            seedOutput: 3,
            nutrition: { calories: 160, protein: 4, carbs: 37, vitamins: 2 }
        },

        BERRY_BUSH: {
            id: 'berry_bush',
            name: 'Berry Bush',
            icon: '🫐',
            type: 'fruit',
            stages: 4,
            baseGrowthTime: 180,
            waterNeed: 1.0,
            nutrientNeed: { nitrogen: 1.0, phosphorus: 1.0, potassium: 1.2 },
            outputs: { berries: 10, berry_seeds: 3 },
            seasons: ['spring', 'summer'],
            canGreenhouse: false,
            diseaseResistance: 0.7,
            seedOutput: 4,
            nutrition: { calories: 80, protein: 1, carbs: 20, vitamins: 10 }
        },

        APPLE_TREE: {
            id: 'apple_tree',
            name: 'Apple Tree',
            icon: '🍎',
            type: 'fruit',
            stages: 5,
            baseGrowthTime: 300,
            waterNeed: 1.0,
            nutrientNeed: { nitrogen: 1.5, phosphorus: 1.2, potassium: 1.5 },
            outputs: { apple: 15, apple_seeds: 2, wood: 5 },
            seasons: ['spring', 'summer', 'fall'],
            canGreenhouse: false,
            diseaseResistance: 0.6,
            seedOutput: 3,
            nutrition: { calories: 100, protein: 0.5, carbs: 25, vitamins: 4 }
        },

        COTTON: {
            id: 'cotton',
            name: 'Cotton',
            icon: '☁️',
            type: 'industrial',
            stages: 5,
            baseGrowthTime: 160,
            waterNeed: 0.9,
            nutrientNeed: { nitrogen: 1.2, phosphorus: 1.0, potassium: 0.8 },
            outputs: { cotton: 6, cotton_seeds: 2 },
            seasons: ['summer', 'fall'],
            canGreenhouse: false,
            diseaseResistance: 0.8,
            seedOutput: 2,
            nutrition: { calories: 0, protein: 0, carbs: 0, vitamins: 0 }
        },

        HOP: {
            id: 'hop',
            name: 'Hops',
            icon: '🌿',
            type: 'industrial',
            stages: 4,
            baseGrowthTime: 100,
            waterNeed: 1.4,
            nutrientNeed: { nitrogen: 2.0, phosphorus: 1.0, potassium: 1.0 },
            outputs: { hops: 8, hop_seeds: 2 },
            seasons: ['summer'],
            canGreenhouse: true,
            diseaseResistance: 0.7,
            seedOutput: 2,
            nutrition: { calories: 0, protein: 0, carbs: 0, vitamins: 0 }
        },

        MUSHROOM: {
            id: 'mushroom',
            name: 'Mushroom',
            icon: '🍄',
            type: 'fungus',
            stages: 3,
            baseGrowthTime: 60,
            waterNeed: 1.5,
            nutrientNeed: { nitrogen: 0.5, phosphorus: 0.8, potassium: 0.6 },
            outputs: { mushroom: 8, mushroom_spores: 3 },
            seasons: ['spring', 'fall', 'winter'],
            canGreenhouse: true,
            diseaseResistance: 0.4,
            seedOutput: 4,
            nutrition: { calories: 30, protein: 4, carbs: 5, vitamins: 2 },
            requiresShade: true
        },

        HERB: {
            id: 'herb',
            name: 'Medicinal Herb',
            icon: '🌿',
            type: 'herb',
            stages: 3,
            baseGrowthTime: 50,
            waterNeed: 0.7,
            nutrientNeed: { nitrogen: 0.4, phosphorus: 0.6, potassium: 0.8 },
            outputs: { herb: 4, herb_seeds: 3 },
            seasons: ['spring', 'summer', 'fall'],
            canGreenhouse: true,
            diseaseResistance: 0.9,
            seedOutput: 5,
            nutrition: { calories: 5, protein: 0, carbs: 1, vitamins: 2 }
        },

        SUGAR_CANE: {
            id: 'sugar_cane',
            name: 'Sugar Cane',
            icon: '🎋',
            type: 'industrial',
            stages: 5,
            baseGrowthTime: 200,
            waterNeed: 1.8,
            nutrientNeed: { nitrogen: 0.8, phosphorus: 0.6, potassium: 0.8 },
            outputs: { sugar: 6, sugar_cane: 4 },
            seasons: ['summer', 'fall'],
            canGreenhouse: false,
            diseaseResistance: 0.8,
            seedOutput: 2,
            nutrition: { calories: 0, protein: 0, carbs: 0, vitamins: 0 }
        },

        RICE: {
            id: 'rice',
            name: 'Rice',
            icon: '🍚',
            type: 'grain',
            stages: 5,
            baseGrowthTime: 130,
            waterNeed: 2.0,
            nutrientNeed: { nitrogen: 1.8, phosphorus: 1.2, potassium: 1.0 },
            outputs: { rice: 4, rice_straw: 2 },
            seasons: ['spring', 'summer'],
            canGreenhouse: false,
            diseaseResistance: 0.7,
            seedOutput: 2,
            nutrition: { calories: 130, protein: 3, carbs: 28, vitamins: 1 }
        },

        PUMPKIN: {
            id: 'pumpkin',
            name: 'Pumpkin',
            icon: '🎃',
            type: 'vegetable',
            stages: 5,
            baseGrowthTime: 200,
            waterNeed: 1.1,
            nutrientNeed: { nitrogen: 1.5, phosphorus: 1.5, potassium: 1.5 },
            outputs: { pumpkin: 3, pumpkin_seeds: 4 },
            seasons: ['fall'],
            canGreenhouse: true,
            diseaseResistance: 0.8,
            seedOutput: 3,
            nutrition: { calories: 80, protein: 2, carbs: 20, vitamins: 5 }
        },

        PEPPER: {
            id: 'pepper',
            name: 'Hot Pepper',
            icon: '🌶️',
            type: 'vegetable',
            stages: 4,
            baseGrowthTime: 100,
            waterNeed: 1.0,
            nutrientNeed: { nitrogen: 1.0, phosphorus: 1.2, potassium: 1.4 },
            outputs: { pepper: 8, pepper_seeds: 3 },
            seasons: ['summer', 'fall'],
            canGreenhouse: true,
            diseaseResistance: 0.6,
            seedOutput: 3,
            nutrition: { calories: 40, protein: 2, carbs: 9, vitamins: 8 }
        }
    };

    // ============= LIVESTOCK DEFINITIONS =============
    const LIVESTOCK = {
        CHICKEN: {
            id: 'chicken',
            name: 'Chicken',
            icon: '🐔',
            type: 'poultry',
            size: 0.5,
            health: 30,
            produces: ['egg', 'feather', 'meat'],
            produceRate: { egg: 0.3, feather: 0.1, meat: 0 },
            feedTypes: ['seeds', 'grain', 'corn', 'bread'],
            feedAmount: 1,
            produceQuality: 1.0,
            breedingRate: 0.02,
            gestationTime: 72,
            offspringPerBirth: 4,
            housing: 'coop',
            space: 1,
            tameable: true
        },

        COW: {
            id: 'cow',
            name: 'Cow',
            icon: '🐄',
            type: 'livestock',
            size: 1.2,
            health: 150,
            produces: ['milk', 'leather', 'meat', 'manure'],
            produceRate: { milk: 0.15, leather: 0.02, meat: 0, manure: 0.2 },
            feedTypes: ['grass', 'hay', 'wheat', 'corn'],
            feedAmount: 3,
            produceQuality: 1.0,
            breedingRate: 0.015,
            gestationTime: 168,
            offspringPerBirth: 1,
            housing: 'barn',
            space: 4,
            tameable: true
        },

        PIG: {
            id: 'pig',
            name: 'Pig',
            icon: '🐷',
            type: 'livestock',
            size: 0.9,
            health: 100,
            produces: ['meat', 'leather', 'truffle', 'manure'],
            produceRate: { meat: 0, leather: 0.03, truffle: 0.02, manure: 0.25 },
            feedTypes: ['potato', 'corn', 'food_waste', 'mushroom'],
            feedAmount: 2,
            produceQuality: 1.0,
            breedingRate: 0.018,
            gestationTime: 96,
            offspringPerBirth: 6,
            housing: 'pen',
            space: 2,
            tameable: true
        },

        SHEEP: {
            id: 'sheep',
            name: 'Sheep',
            icon: '🐑',
            type: 'livestock',
            size: 0.8,
            health: 80,
            produces: ['wool', 'milk', 'meat', 'manure'],
            produceRate: { wool: 0.1, milk: 0.08, meat: 0, manure: 0.15 },
            feedTypes: ['grass', 'hay', 'leaves'],
            feedAmount: 2,
            produceQuality: 1.0,
            breedingRate: 0.02,
            gestationTime: 120,
            offspringPerBirth: 1,
            housing: 'pen',
            space: 2,
            tameable: true
        },

        RABBIT: {
            id: 'rabbit',
            name: 'Rabbit',
            icon: '🐰',
            type: 'small_animal',
            size: 0.3,
            health: 20,
            produces: ['meat', 'fur', 'manure'],
            produceRate: { meat: 0, fur: 0.08, manure: 0.3 },
            feedTypes: ['carrot', 'grass', 'leaves', 'berry'],
            feedAmount: 0.5,
            produceQuality: 1.2,
            breedingRate: 0.05,
            gestationTime: 24,
            offspringPerBirth: 4,
            housing: 'hutch',
            space: 0.5,
            tameable: true
        },

        BEE: {
            id: 'bee',
            name: 'Beehive',
            icon: '🐝',
            type: 'insect',
            size: 0.3,
            health: 50,
            produces: ['honey', 'wax', 'royal_jelly'],
            produceRate: { honey: 0.1, wax: 0.05, royal_jelly: 0.01 },
            feedTypes: ['nectar', 'flower'],
            feedAmount: 0,
            produceQuality: 1.5,
            breedingRate: 0.03,
            gestationTime: 16,
            offspringPerBirth: 1,
            housing: 'apiary',
            space: 0.5,
            tameable: false,
            requiresFlowers: true
        }
    };

    // ============= PROCESSING BUILDINGS =============
    const PROCESSORS = {
        MILL: {
            id: 'mill',
            name: 'Windmill',
            icon: '🌬️',
            type: 'processor',
            materials: { wood: 50, stone: 30, iron: 10, cloth: 5 },
            processes: [
                { input: 'wheat', output: 'flour', ratio: 2, time: 10 },
                { input: 'corn', output: 'cornmeal', ratio: 2, time: 10 },
                { input: 'rice', output: 'rice_flour', ratio: 2, time: 10 },
                { input: 'sugar_cane', output: 'sugar', ratio: 1.5, time: 8 }
            ],
            buildTime: 180,
            powerUsage: 0,
            automation: true
        },

        DAIRY: {
            id: 'dairy',
            name: 'Dairy Station',
            icon: '🥛',
            type: 'processor',
            materials: { wood: 30, stone: 20, iron: 15, bucket: 2 },
            processes: [
                { input: 'milk', output: 'cheese', ratio: 2, time: 20 },
                { input: 'milk', output: 'butter', ratio: 3, time: 15 },
                { input: 'milk', output: 'cream', ratio: 2, time: 10 }
            ],
            buildTime: 120,
            powerUsage: 0,
            automation: false
        },

        SMOKER: {
            id: 'smoker',
            name: 'Food Smoker',
            icon: '🔥',
            type: 'processor',
            materials: { wood: 20, iron: 10, stone: 15 },
            processes: [
                { input: 'meat', output: 'smoked_meat', ratio: 1, time: 30, fuel: 'wood' },
                { input: 'fish', output: 'smoked_fish', ratio: 1, time: 20, fuel: 'wood' },
                { input: 'cheese', output: 'smoked_cheese', ratio: 1, time: 25, fuel: 'wood' }
            ],
            buildTime: 100,
            powerUsage: 0,
            automation: false,
            fuelType: 'wood'
        },

        BREWERY: {
            id: 'brewery',
            name: 'Brewery',
            icon: '🍺',
            type: 'processor',
            materials: { wood: 40, stone: 30, iron: 15, clay: 20 },
            processes: [
                { input: 'water', output: 'beer', ratio: 3, time: 60, ingredients: ['hops', 'wheat'] },
                { input: 'honey', output: 'mead', ratio: 2, time: 45 },
                { input: 'fruit', output: 'wine', ratio: 3, time: 90 }
            ],
            buildTime: 240,
            powerUsage: 0,
            automation: false
        },

        BAKERY: {
            id: 'bakery',
            name: 'Bakery Oven',
            icon: '🍞',
            type: 'processor',
            materials: { clay: 50, stone: 30, iron: 10 },
            processes: [
                { input: 'flour', output: 'bread', ratio: 2, time: 30, fuel: 'wood' },
                { input: 'flour', output: 'cake', ratio: 3, time: 45, fuel: 'wood', ingredients: ['sugar', 'egg'] },
                { input: 'cornmeal', output: 'tortilla', ratio: 2, time: 15, fuel: 'wood' }
            ],
            buildTime: 150,
            powerUsage: 0,
            automation: false,
            fuelType: 'wood'
        },

        TANNERY: {
            id: 'tannery',
            name: 'Tannery',
            icon: '🟤',
            type: 'processor',
            materials: { wood: 30, stone: 40, iron: 10, water: 10 },
            processes: [
                { input: 'leather', output: 'treated_leather', ratio: 1, time: 60 },
                { input: 'fur', output: 'treated_fur', ratio: 1, time: 45 },
                { input: 'hide', output: 'rawhide', ratio: 1, time: 30 }
            ],
            buildTime: 180,
            powerUsage: 0,
            automation: false
        },

        SAWMILL: {
            id: 'sawmill',
            name: 'Sawmill',
            icon: '🪚',
            type: 'processor',
            materials: { wood: 60, iron: 20, stone: 20 },
            processes: [
                { input: 'wood', output: 'plank', ratio: 2, time: 15 },
                { input: 'wood', output: 'beam', ratio: 3, time: 20 },
                { input: 'plank', output: 'furniture_wood', ratio: 1.5, time: 25 }
            ],
            buildTime: 200,
            powerUsage: 0,
            automation: true
        }
    };

    // ============= STATE =============
    let farmTiles = [];
    let livestock = [];
    let processors = [];
    let nextFarmTileId = 1;
    let nextLivestockId = 1;
    let nextProcessorId = 1;

    let irrigationNetwork = [];
    let greenhouses = [];

    // ============= FARM TILE CLASS =============
    class FarmTile {
        constructor(x, y) {
            this.id = nextFarmTileId++;
            this.x = x;
            this.y = y;
            this.crop = null;
            this.growthStage = 0;
            this.growthProgress = 0;
            this.health = 100;

            this.soilQuality = this.determineSoilQuality();

            this.nutrients = {
                nitrogen: 50,
                phosphorus: 50,
                potassium: 50
            };

            this.waterLevel = 50;
            this.isIrrigated = false;
            this.isGreenhouse = false;

            this.disease = null;
            this.pestInfestation = 0;
            this.weedGrowth = 0;

            this.lastGrowthTick = 0;
            this.harvestCount = 0;
        }

        determineSoilQuality() {
            const roll = Math.random();
            if (roll < 0.15) return 'poor';
            if (roll < 0.55) return 'average';
            if (roll < 0.85) return 'rich';
            return 'fertile';
        }

        plant(cropId) {
            if (this.crop) return false;

            const crop = CROPS[cropId.toUpperCase()];
            if (!crop) return false;

            this.crop = {
                type: crop,
                typeId: cropId.toUpperCase(),
                stage: 0,
                progress: 0,
                health: 100,
                waterStress: 0,
                nutrientStress: 0,
                daysPlanted: 0
            };

            return true;
        }

        harvest() {
            if (!this.crop || this.crop.stage < this.crop.type.stages - 1) return null;

            const outputs = {};
            const crop = this.crop;

            // Calculate yield based on health and conditions
            const yieldMultiplier = (crop.health / 100) *
                                   this.soilQualityMultiplier() *
                                   (1 - crop.waterStress * 0.1) *
                                   (1 - crop.nutrientStress * 0.1);

            for (const [output, amount] of Object.entries(crop.type.outputs)) {
                const yieldAmount = Math.ceil(amount * yieldMultiplier);
                outputs[output] = yieldAmount;
            }

            // Seeds
            if (crop.type.seedOutput > 0) {
                outputs[`${crop.typeId.toLowerCase()}_seeds`] = Math.ceil(crop.type.seedOutput * yieldMultiplier);
            }

            this.harvestCount++;
            this.crop = null;
            this.growthStage = 0;
            this.growthProgress = 0;

            // Soil exhaustion
            this.nutrients.nitrogen *= 0.7;
            this.nutrients.phosphorus *= 0.8;
            this.nutrients.potassium *= 0.8;

            EventBus.emit('farm:harvested', { tile: this, outputs: outputs, crop: crop.type });
            return outputs;
        }

        soilQualityMultiplier() {
            return CONFIG.SOIL_QUALITY[this.soilQuality]?.multiplier || 1.0;
        }

        update(dt, season) {
            if (!this.crop) return;

            // Update stress levels
            const waterNeed = this.crop.type.waterNeed * (CONFIG.SEASON_MODIFIERS[season]?.waterNeed || 1);
            this.crop.waterStress = Math.max(0, (waterNeed - this.waterLevel / 50) * 0.5);

            const nutrientTotal = this.nutrients.nitrogen + this.nutrients.phosphorus + this.nutrients.potassium;
            const nutrientNeed = (this.crop.type.nutrientNeed.nitrogen || 1) +
                                (this.crop.type.nutrientNeed.phosphorus || 1) +
                                (this.crop.type.nutrientNeed.potassium || 1);
            this.crop.nutrientStress = Math.max(0, (nutrientNeed - nutrientTotal / 50) / 10);

            // Check for disease
            if (!this.crop.disease && Math.random() < CONFIG.DISEASE_CHANCE * (1 - this.crop.type.diseaseResistance)) {
                const diseases = ['blight', 'mildew', 'rot', 'rust'];
                this.crop.disease = diseases[Math.floor(Math.random() * diseases.length)];
            }

            // Check for pests
            if (Math.random() < CONFIG.PEST_CHANCE) {
                this.pestInfestation = Math.min(100, this.pestInfestation + 10);
            }

            // Weeds
            if (Math.random() < 0.005) {
                this.weedGrowth = Math.min(100, this.weedGrowth + 5);
            }

            // Calculate growth rate
            const seasonModifier = CONFIG.SEASON_MODIFIERS[season]?.growthRate || 1.0;
            const greenhouseModifier = this.isGreenhouse ? 1.5 : 1.0;
            const irrigationModifier = this.isIrrigated ? CONFIG.IRRIGATION_MULTIPLIER : 1.0;

            const growthRate = (1 / this.crop.type.baseGrowthTime) *
                              this.soilQualityMultiplier() *
                              seasonModifier *
                              greenhouseModifier *
                              irrigationModifier *
                              (1 - this.pestInfestation * 0.01) *
                              (1 - this.weedGrowth * 0.01) *
                              (1 - (this.crop.disease ? 0.3 : 0));

            this.crop.progress += growthRate * dt;

            // Advance stages
            while (this.crop.progress >= 1 && this.crop.stage < this.crop.type.stages - 1) {
                this.crop.progress -= 1;
                this.crop.stage++;
            }

            // Health effects from stress
            if (this.crop.waterStress > 0.5 || this.crop.nutrientStress > 0.5) {
                this.crop.health -= (this.crop.waterStress + this.crop.nutrientStress) * 0.1 * dt;
            }

            if (this.crop.disease) {
                this.crop.health -= 0.2 * dt;
            }

            if (this.pestInfestation > 0) {
                this.crop.health -= this.pestInfestation * 0.01 * dt;
            }

            // Deplete nutrients and water
            if (this.crop.stage > 0) {
                this.nutrients.nitrogen -= CONFIG.NUTRIENT_DEPLETION_RATE * dt * (this.crop.type.nutrientNeed.nitrogen || 1);
                this.nutrients.phosphorus -= CONFIG.NUTRIENT_DEPLETION_RATE * dt * (this.crop.type.nutrientNeed.phosphorus || 1);
                this.nutrients.potassium -= CONFIG.NUTRIENT_DEPLETION_RATE * dt * (this.crop.type.nutrientNeed.potassium || 1);

                if (!this.isIrrigated) {
                    this.waterLevel = Math.max(0, this.waterLevel - CONFIG.WATER_DEPLETION_RATE * dt);
                }
            }

            // Death
            if (this.crop.health <= 0) {
                this.crop = null;
                EventBus.emit('farm:crop_died', { tile: this, cause: 'health' });
            }
        }

        addWater(amount) {
            this.waterLevel = Math.min(100, this.waterLevel + amount);
            this.isIrigated = true;
        }

        addNutrient(nutrientType, amount) {
            if (this.nutrients[nutrientType] !== undefined) {
                this.nutrients[nutrientType] = Math.min(100, this.nutrients[nutrientType] + amount);
            }
        }

        fertilize(amount) {
            for (const nutrient of Object.keys(this.nutrients)) {
                this.addNutrient(nutrient, amount);
            }
        }

        applyCure() {
            if (this.crop && this.crop.disease) {
                if (Math.random() < CONFIG.CURE_CHANCE) {
                    this.crop.disease = null;
                    this.crop.health = Math.min(100, this.crop.health + 30);
                    return true;
                }
            }
            return false;
        }

        removePests() {
            if (this.pestInfestation > 0) {
                this.pestInfestation = 0;
                return true;
            }
            return false;
        }

        removeWeeds() {
            if (this.weedGrowth > 0) {
                this.weedGrowth = 0;
                return true;
            }
            return false;
        }
    }

    // ============= LIVESTOCK CLASS =============
    class Livestock {
        constructor(typeId, x, y) {
            const type = LIVESTOCK[typeId.toUpperCase()];
            if (!type) {
                console.error(`Invalid livestock type: ${typeId}`);
                return null;
            }

            this.id = nextLivestockId++;
            this.typeId = typeId.toUpperCase();
            this.type = type;
            this.x = x;
            this.y = y;

            this.health = type.health;
            this.maxHealth = type.health;
            this.hunger = 50;
            this.happiness = 70;
            this.thirst = 50;

            this.age = 0;
            this.isAdult = false;
            this.isPregnant = false;
            this.pregnancyTimer = 0;
            this.lastProduced = 0;
            this.producedToday = 0;

            this.breedingCooldown = 0;
            this.offspringCount = 0;

            this.housing = null;
            this.inPen = false;

            this.species = typeId.toUpperCase();
            this.offspring = [];

            this.frame = 0;
            this.animTimer = 0;
        }

        feed(foodType) {
            if (!this.type.feedTypes.includes(foodType)) return false;

            const isFavorite = this.type.feedTypes[0] === foodType;
            const hungerRestore = isFavorite ? 30 : 15;

            this.hunger = Math.min(100, this.hunger + hungerRestore);
            this.happiness = Math.min(100, this.happiness + (isFavorite ? 10 : 3));

            if (typeof spawnParticles === 'function') {
                spawnParticles(this.x, this.y, '#00ff00', 5);
            }

            return true;
        }

        produce() {
            if (this.isPregnant) return null;

            const now = Date.now();
            const daySeconds = 86400;
            const timeSinceLast = (now - this.lastProduced) / 1000;

            if (timeSinceLast < daySeconds / this.type.produceRate[this.getPrimaryProduct()]) {
                return null;
            }

            if (this.producedToday >= 3) return null;

            const products = [];
            for (const [product, rate] of Object.entries(this.type.produceRate)) {
                if (rate > 0 && Math.random() < rate) {
                    const quality = this.type.produceQuality * (this.happiness / 100);
                    products.push({ type: product, quality: quality });
                }
            }

            if (products.length > 0) {
                this.lastProduced = now;
                this.producedToday++;

                EventBus.emit('livestock:produced', { livestock: this, products: products });
                return products;
            }

            return null;
        }

        getPrimaryProduct() {
            const products = Object.entries(this.type.produceRate)
                .filter(([_, rate]) => rate > 0)
                .sort((a, b) => b[1] - a[1]);
            return products[0]?.[0] || null;
        }

        breed(partner) {
            if (!this.canBreed() || !partner.canBreed()) return null;
            if (this.typeId !== partner.typeId) return null;

            this.isPregnant = true;
            this.pregnancyTimer = 0;
            this.breedingCooldown = this.type.gestationTime;

            EventBus.emit('livestock:bred', { parent: this, partner: partner });
            return true;
        }

        canBreed() {
            if (this.isPregnant) return false;
            if (this.breedingCooldown > 0) return false;
            if (!this.isAdult) return false;
            if (this.hunger < 30) return false;
            if (this.happiness < 50) return false;
            return true;
        }

        update(dt) {
            // Age
            this.age += dt;

            // Adult status
            if (!this.isAdult && this.age > 72) {
                this.isAdult = true;
                EventBus.emit('livestock:adult', { livestock: this });
            }

            // Needs decay
            this.hunger = Math.max(0, this.hunger - dt * 2);
            this.thirst = Math.max(0, this.thirst - dt * 3);
            this.happiness = Math.max(0, this.happiness - dt * 0.5);

            // Pregnancy
            if (this.isPregnant) {
                this.pregnancyTimer += dt;
                if (this.pregnancyTimer >= this.type.gestationTime) {
                    this.giveBirth();
                }
            }

            // Breeding cooldown
            if (this.breedingCooldown > 0) {
                this.breedingCooldown -= dt;
            }

            // Reset daily production
            if (typeof dayNightCycle !== 'undefined') {
                if (dayNightCycle.time < 0.1 && this.producedToday > 0) {
                    this.producedToday = 0;
                }
            }

            // Production
            this.produce();

            // Health from needs
            if (this.hunger < 20 || this.thirst < 20) {
                this.health -= dt * 5;
            } else if (this.hunger > 70 && this.thirst > 70) {
                this.health = Math.min(this.maxHealth, this.health + dt * 2);
            }

            // Death
            if (this.health <= 0) {
                this.die();
            }

            // Animation
            this.animTimer += dt;
            if (this.animTimer > 0.2) {
                this.animTimer = 0;
                this.frame = (this.frame + 1) % 4;
            }
        }

        giveBirth() {
            this.isPregnant = false;
            this.pregnancyTimer = 0;
            this.offspringCount++;

            const offspring = [];
            for (let i = 0; i < this.type.offspringPerBirth; i++) {
                const baby = new Livestock(this.typeId, this.x, this.y);
                offspring.push(baby);
            }

            this.offspring = offspring;
            EventBus.emit('livestock:birth', { parent: this, offspring: offspring });
            return offspring;
        }

        die() {
            EventBus.emit('livestock:death', { livestock: this });

            const idx = livestock.indexOf(this);
            if (idx !== -1) {
                livestock.splice(idx, 1);
            }
        }
    }

    // ============= PROCESSOR CLASS =============
    class Processor {
        constructor(typeId, x, y) {
            const type = PROCESSORS[typeId.toUpperCase()];
            if (!type) {
                console.error(`Invalid processor type: ${typeId}`);
                return null;
            }

            this.id = nextProcessorId++;
            this.typeId = typeId.toUpperCase();
            this.type = type;
            this.x = x;
            this.y = y;

            this.inventory = {
                input: {},
                output: {},
                fuel: 100
            };

            this.currentProcess = null;
            this.processProgress = 0;
            this.isRunning = false;

            this.buildProgress = 0;
            this.isComplete = this.buildProgress >= type.buildTime;
        }

        startProcess(processIndex) {
            const process = this.type.processes[processIndex];
            if (!process) return false;

            // Check requirements
            const inputAmount = this.inventory.input[process.input] || 0;
            if (inputAmount < 1) return false;

            if (process.ingredients) {
                for (const ingredient of process.ingredients) {
                    if ((this.inventory.input[ingredient] || 0) < 1) return false;
                }
            }

            if (process.fuel && this.inventory.fuel < 10) return false;

            // Start process
            this.currentProcess = { ...process, index: processIndex };
            this.processProgress = 0;
            this.isRunning = true;

            return true;
        }

        update(dt) {
            if (!this.isRunning || !this.currentProcess) return;

            this.processProgress += dt;

            // Consume fuel
            if (this.currentProcess.fuel && this.type.fuelType) {
                this.inventory.fuel -= dt * 0.5;
            }

            // Complete process
            if (this.processProgress >= this.currentProcess.time) {
                this.completeProcess();
            }
        }

        completeProcess() {
            if (!this.currentProcess) return;

            const process = this.currentProcess;

            // Consume input
            this.inventory.input[process.input] -= 1;

            if (process.ingredients) {
                for (const ingredient of process.ingredients) {
                    this.inventory.input[ingredient] -= 1;
                }
            }

            // Add output
            const outputKey = process.output;
            const outputAmount = process.ratio;
            this.inventory.output[outputKey] = (this.inventory.output[outputKey] || 0) + outputAmount;

            EventBus.emit('processor:produced', { processor: this, output: outputKey, amount: outputAmount });

            this.processProgress = 0;
            this.currentProcess = null;
            this.isRunning = false;

            // Auto-restart if automation enabled
            if (this.type.automation) {
                for (let i = 0; i < this.type.processes.length; i++) {
                    if (this.startProcess(i)) break;
                }
            }
        }

        addInput(itemType, amount) {
            this.inventory.input[itemType] = (this.inventory.input[itemType] || 0) + amount;
        }

        addFuel(amount) {
            this.inventory.fuel = Math.min(100, this.inventory.fuel + amount);
        }

        takeOutput(itemType) {
            const amount = this.inventory.output[itemType];
            if (!amount || amount <= 0) return 0;

            this.inventory.output[itemType] = 0;
            return amount;
        }
    }

    // ============= FARM MANAGEMENT =============
    function createFarmTile(x, y) {
        const tile = new FarmTile(x, y);
        farmTiles.push(tile);
        return tile;
    }

    function getFarmTile(x, y) {
        return farmTiles.find(t => t.x === x && t.y === y);
    }

    function getAllFarmTiles() {
        return [...farmTiles];
    }

    function removeFarmTile(tileId) {
        const idx = farmTiles.findIndex(t => t.id === tileId);
        if (idx === -1) return false;

        farmTiles.splice(idx, 1);
        return true;
    }

    function getNearbyFarmTiles(x, y, radius) {
        return farmTiles.filter(tile => {
            const dist = Math.sqrt((tile.x - x) ** 2 + (tile.y - y) ** 2);
            return dist < radius;
        });
    }

    // ============= IRRIGATION SYSTEM =============
    function setupIrrigation(tileIds) {
        const tiles = tileIds.map(id => farmTiles.find(t => t.id === id)).filter(t => t);
        if (tiles.length < 2) return false;

        const waterSource = tiles.find(t => t.waterLevel >= 80);
        if (!waterSource) return false;

        for (const tile of tiles) {
            tile.isIrrigated = true;
        }

        irrigationNetwork.push({
            tiles: tiles.map(t => t.id),
            waterSource: waterSource.id
        });

        EventBus.emit('farm:irrigation_setup', { tileCount: tiles.length });
        return true;
    }

    function getIrrigationForTile(tileId) {
        for (const network of irrigationNetwork) {
            if (network.tiles.includes(tileId)) {
                return network;
            }
        }
        return null;
    }

    // ============= GREENHOUSE SYSTEM =============
    function buildGreenhouse(x, y) {
        const building = {
            x: x,
            y: y,
            type: 'greenhouse',
            active: true,
            tiles: []
        };

        // Mark surrounding tiles as greenhouse
        for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
                const tile = getFarmTile(x + dx, y + dy);
                if (tile) {
                    tile.isGreenhouse = true;
                    building.tiles.push(tile.id);
                }
            }
        }

        greenhouses.push(building);
        EventBus.emit('farm:greenhouse_built', { x: x, y: y });
        return building;
    }

    // ============= LIVESTOCK MANAGEMENT =============
    function addLivestock(typeId, x, y) {
        const animal = new Livestock(typeId, x, y);
        livestock.push(animal);
        EventBus.emit('livestock:added', { livestock: animal });
        return animal;
    }

    function getLivestock(livestockId) {
        return livestock.find(a => a.id === livestockId);
    }

    function getAllLivestock() {
        return [...livestock];
    }

    function removeLivestock(livestockId) {
        const idx = livestock.findIndex(a => a.id === livestockId);
        if (idx === -1) return false;

        livestock.splice(idx, 1);
        return true;
    }

    function getNearbyLivestock(x, y, radius) {
        return livestock.filter(animal => {
            const dist = Math.sqrt((animal.x - x) ** 2 + (animal.y - y) ** 2);
            return dist < radius;
        });
    }

    // ============= PROCESSOR MANAGEMENT =============
    function buildProcessor(typeId, x, y) {
        const type = PROCESSORS[typeId.toUpperCase()];
        if (!type) return false;

        // Check materials
        for (const [material, amount] of Object.entries(type.materials)) {
            if ((resources[material] || 0) < amount) {
                return false;
            }
        }

        // Consume materials
        for (const [material, amount] of Object.entries(type.materials)) {
            resources[material] -= amount;
        }

        const processor = new Processor(typeId, x, y);
        processors.push(processor);

        EventBus.emit('processor:built', { processor: processor });
        return processor;
    }

    function getProcessor(processorId) {
        return processors.find(p => p.id === processorId);
    }

    function getAllProcessors() {
        return [...processors];
    }

    // ============= UPDATE FUNCTIONS =============
    function update(dt) {
        // Get current season
        const season = typeof SeasonSystem !== 'undefined'
            ? (SeasonSystem.getCurrentSeason()?.id || 'spring')
            : 'spring';

        // Update farm tiles
        for (const tile of farmTiles) {
            tile.update(dt, season);

            // Greenhouse effect
            if (tile.isGreenhouse) {
                tile.waterLevel = Math.min(100, tile.waterLevel + dt * 0.5);
            }

            // Irrigation effect
            if (tile.isIrrigated) {
                tile.waterLevel = Math.min(100, tile.waterLevel + dt * 2);
            }
        }

        // Update livestock
        for (const animal of [...livestock]) {
            animal.update(dt);
        }

        // Update processors
        for (const processor of processors) {
            if (processor.isComplete) {
                processor.update(dt);
            }
        }
    }

    // ============= RENDERING =============
    function renderFarming(ctx) {
        // Render farm tiles
        for (const tile of farmTiles) {
            renderFarmTile(ctx, tile);
        }

        // Render livestock
        for (const animal of livestock) {
            renderLivestock(ctx, animal);
        }

        // Render processors
        for (const processor of processors) {
            renderProcessor(ctx, processor);
        }
    }

    function renderFarmTile(ctx, tile) {
        const screenX = (tile.x - camera.x) * TILE_SIZE + ctx.canvas.width / 2;
        const screenY = (tile.y - camera.y) * TILE_SIZE + ctx.canvas.height / 2;

        // Soil color based on quality
        const soilColors = {
            poor: '#8b6914',
            average: '#6a5010',
            rich: '#5a4010',
            fertile: '#4a3010'
        };
        ctx.fillStyle = soilColors[tile.soilQuality] || soilColors.average;
        ctx.fillRect(screenX - TILE_SIZE / 2, screenY - TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);

        // Border for irrigated tiles
        if (tile.isIrrigated) {
            ctx.strokeStyle = '#4488ff';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX - TILE_SIZE / 2 + 2, screenY - TILE_SIZE / 2 + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        }

        // Greenhouse indicator
        if (tile.isGreenhouse) {
            ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
            ctx.fillRect(screenX - TILE_SIZE / 2, screenY - TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
        }

        // Render crop
        if (tile.crop) {
            const crop = tile.crop;
            const stageProgress = crop.stage / (crop.type.stages - 1);
            const size = TILE_SIZE * (0.3 + stageProgress * 0.5);

            ctx.fillStyle = '#228822';
            ctx.beginPath();
            ctx.arc(screenX, screenY - 5, size, 0, Math.PI * 2);
            ctx.fill();

            // Crop icon
            ctx.font = `${size * 1.5}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(crop.type.icon, screenX, screenY - 5);

            // Health bar
            if (crop.health < 100) {
                const healthPercent = crop.health / 100;
                ctx.fillStyle = '#333';
                ctx.fillRect(screenX - 10, screenY + TILE_SIZE / 2 - 8, 20, 4);
                ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : '#ff0000';
                ctx.fillRect(screenX - 10, screenY + TILE_SIZE / 2 - 8, 20 * healthPercent, 4);
            }

            // Disease indicator
            if (crop.disease) {
                ctx.font = '12px Arial';
                ctx.fillStyle = '#ff0000';
                ctx.fillText('⚠️', screenX + TILE_SIZE / 3, screenY - TILE_SIZE / 3);
            }
        }

        // Water level indicator
        const waterPercent = tile.waterLevel / 100;
        ctx.fillStyle = `rgba(50, 100, 255, ${waterPercent * 0.5})`;
        ctx.fillRect(screenX - TILE_SIZE / 2, screenY + TILE_SIZE / 2 - 4, TILE_SIZE * waterPercent, 4);
    }

    function renderLivestock(ctx, animal) {
        const screenX = (animal.x - camera.x) * TILE_SIZE + ctx.canvas.width / 2;
        const screenY = (animal.y - camera.y) * TILE_SIZE + ctx.canvas.height / 2;
        const size = animal.type.size * TILE_SIZE;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(screenX, screenY + size * 0.3, size * 0.4, size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = animal.isPregnant ? '#ffaa88' : animal.type.color || '#8b4513';
        ctx.beginPath();
        ctx.ellipse(screenX, screenY, size * 0.5, size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Icon
        ctx.font = `${size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(animal.type.icon, screenX, screenY);

        // Status indicators
        if (animal.isPregnant) {
            ctx.font = '10px Arial';
            ctx.fillStyle = '#ff69b4';
            ctx.fillText('❤️', screenX + size * 0.5, screenY - size * 0.5);
        }

        if (animal.hunger < 30) {
            ctx.font = '10px Arial';
            ctx.fillStyle = '#ff0000';
            ctx.fillText('🍖', screenX - size * 0.5, screenY - size * 0.5);
        }
    }

    function renderProcessor(ctx, processor) {
        if (!processor.isComplete) return;

        const screenX = (processor.x - camera.x) * TILE_SIZE + ctx.canvas.width / 2;
        const screenY = (processor.y - camera.y) * TILE_SIZE + ctx.canvas.height / 2;

        // Building
        ctx.fillStyle = '#555555';
        ctx.fillRect(screenX - TILE_SIZE / 2, screenY - TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);

        // Icon
        ctx.font = `${TILE_SIZE * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(processor.type.icon, screenX, screenY);

        // Running indicator
        if (processor.isRunning) {
            const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 200, 50, ${pulse})`;
            ctx.beginPath();
            ctx.arc(screenX + TILE_SIZE / 3, screenY - TILE_SIZE / 3, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ============= SERIALIZATION =============
    function getState() {
        return {
            farmTiles: farmTiles.map(t => ({
                id: t.id,
                x: t.x,
                y: t.y,
                crop: t.crop ? {
                    typeId: t.crop.typeId,
                    stage: t.crop.stage,
                    progress: t.crop.progress,
                    health: t.crop.health,
                    waterStress: t.crop.waterStress,
                    nutrientStress: t.crop.nutrientStress,
                    disease: t.crop.disease
                } : null,
                soilQuality: t.soilQuality,
                nutrients: { ...t.nutrients },
                waterLevel: t.waterLevel,
                isIrrigated: t.isIrrigated,
                isGreenhouse: t.isGreenhouse,
                pestInfestation: t.pestInfestation,
                weedGrowth: t.weedGrowth,
                harvestCount: t.harvestCount
            })),
            livestock: livestock.map(l => ({
                id: l.id,
                typeId: l.typeId,
                x: l.x,
                y: l.y,
                health: l.health,
                hunger: l.hunger,
                happiness: l.happiness,
                thirst: l.thirst,
                age: l.age,
                isAdult: l.isAdult,
                isPregnant: l.isPregnant,
                pregnancyTimer: l.pregnancyTimer,
                lastProduced: l.lastProduced,
                breedingCooldown: l.breedingCooldown,
                offspringCount: l.offspringCount
            })),
            processors: processors.map(p => ({
                id: p.id,
                typeId: p.typeId,
                x: p.x,
                y: p.y,
                isComplete: p.isComplete,
                inventory: { ...p.inventory },
                currentProcess: p.currentProcess,
                processProgress: p.processProgress
            })),
            irrigationNetwork: irrigationNetwork.map(n => ({
                tiles: [...n.tiles],
                waterSource: n.waterSource
            })),
            greenhouses: greenhouses.map(g => ({
                x: g.x,
                y: g.y,
                tiles: [...g.tiles]
            })),
            nextFarmTileId: nextFarmTileId,
            nextLivestockId: nextLivestockId,
            nextProcessorId: nextProcessorId
        };
    }

    function setState(state) {
        if (!state) return;

        farmTiles = [];
        livestock = [];
        processors = [];
        irrigationNetwork = [];
        greenhouses = [];

        if (state.farmTiles) {
            for (const tState of state.farmTiles) {
                const tile = new FarmTile(tState.x, tState.y);
                tile.id = tState.id;
                tile.soilQuality = tState.soilQuality;
                tile.nutrients = tState.nutrients;
                tile.waterLevel = tState.waterLevel;
                tile.isIrrigated = tState.isIrrigated;
                tile.isGreenhouse = tState.isGreenhouse;
                tile.pestInfestation = tState.pestInfestation;
                tile.weedGrowth = tState.weedGrowth;
                tile.harvestCount = tState.harvestCount;

                if (tState.crop) {
                    const cropType = CROPS[tState.crop.typeId];
                    tile.crop = {
                        type: cropType,
                        typeId: tState.crop.typeId,
                        stage: tState.crop.stage,
                        progress: tState.crop.progress,
                        health: tState.crop.health,
                        waterStress: tState.crop.waterStress,
                        nutrientStress: tState.crop.nutrientStress,
                        disease: tState.crop.disease
                    };
                }

                farmTiles.push(tile);
            }
        }

        if (state.livestock) {
            for (const lState of state.livestock) {
                const animal = new Livestock(lState.typeId, lState.x, lState.y);
                animal.id = lState.id;
                animal.health = lState.health;
                animal.hunger = lState.hunger;
                animal.happiness = lState.happiness;
                animal.thirst = lState.thirst;
                animal.age = lState.age;
                animal.isAdult = lState.isAdult;
                animal.isPregnant = lState.isPregnant;
                animal.pregnancyTimer = lState.pregnancyTimer;
                animal.lastProduced = lState.lastProduced;
                animal.breedingCooldown = lState.breedingCooldown;
                animal.offspringCount = lState.offspringCount;

                livestock.push(animal);
            }
        }

        if (state.processors) {
            for (const pState of state.processors) {
                const processor = new Processor(pState.typeId, pState.x, pState.y);
                processor.id = pState.id;
                processor.isComplete = pState.isComplete;
                processor.inventory = pState.inventory;
                processor.currentProcess = pState.currentProcess;
                processor.processProgress = pState.processProgress;

                processors.push(processor);
            }
        }

        irrigationNetwork = state.irrigationNetwork || [];
        greenhouses = state.greenhouses || [];

        nextFarmTileId = state.nextFarmTileId || 1;
        nextLivestockId = state.nextLivestockId || 1;
        nextProcessorId = state.nextProcessorId || 1;
    }

    // ============= PUBLIC API =============
    return {
        // Configuration
        CONFIG,
        CROPS,
        LIVESTOCK,
        PROCESSORS,

        // Farm Tiles
        createFarmTile,
        getFarmTile,
        getAllFarmTiles,
        removeFarmTile,
        getNearbyFarmTiles,

        // Irrigation
        setupIrrigation,
        getIrrigationForTile,

        // Greenhouse
        buildGreenhouse,

        // Livestock
        addLivestock,
        getLivestock,
        getAllLivestock,
        removeLivestock,
        getNearbyLivestock,

        // Processors
        buildProcessor,
        getProcessor,
        getAllProcessors,

        // Update & Render
        update,
        renderFarming,

        // State
        getState,
        setState
    };
})();

window.FarmingSystem = FarmingSystem;
