// ============================================
// WORLD VARIATION SYSTEM - Dynamic World Generation
// ============================================
// Production-grade world variation with biome integration,
// procedural landmarks, environmental features, and visual variety

const WorldVariation = (function() {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        // Noise scales for different features
        NOISE: {
            BIOME: 0.008,
            TEMPERATURE: 0.005,
            MOISTURE: 0.006,
            DETAIL: 0.1,
            ELEVATION: 0.02,
            RIVER: 0.03,
            FOREST: 0.04
        },

        // Feature generation
        FEATURES: {
            RIVER_THRESHOLD_MIN: 0.48,
            RIVER_THRESHOLD_MAX: 0.52,
            LAKE_THRESHOLD: 0.3,
            FOREST_DENSITY_BASE: 0.3,
            RESOURCE_SPAWN_RATE: 0.15,
            LANDMARK_CHANCE: 0.0005,
            POI_RADIUS: 15
        },

        // Elevation zones
        ELEVATION: {
            DEEP_WATER: 0.2,
            SHALLOW_WATER: 0.3,
            BEACH: 0.35,
            LOWLAND: 0.5,
            MIDLAND: 0.7,
            HIGHLAND: 0.85,
            MOUNTAIN: 1.0
        }
    };

    // ============= EXTENDED TILE TYPES =============
    // These supplement the base TILES constant
    const BIOME_TILES = {
        // Desert
        SAND: 20,
        SANDSTONE: 21,
        CACTUS: 22,
        PALM_TREE: 23,
        OASIS: 24,

        // Swamp
        MUD: 25,
        MURKY_WATER: 26,
        DEAD_TREE: 27,
        MUSHROOM: 28,
        VINE: 29,

        // Snow/Arctic
        SNOW: 30,
        ICE: 31,
        FROZEN_WATER: 32,
        PINE_TREE: 33,
        SNOW_ROCK: 34,

        // Volcanic
        VOLCANIC_ROCK: 35,
        ASH: 36,
        LAVA: 37,
        OBSIDIAN: 38,
        MAGMA_VENT: 39,

        // Ruins
        COBBLESTONE: 40,
        CRACKED_STONE: 41,
        PILLAR: 42,
        RUBBLE: 43,
        TREASURE: 44,

        // Special
        FLOWER_PATCH: 45,
        TALL_GRASS: 46,
        PEBBLES: 47,
        MARSH: 48,
        CLIFF: 49
    };

    // ============= BIOME DEFINITIONS =============
    const BIOMES = {
        JUNGLE: {
            id: 'jungle',
            name: 'Jungle',
            tempRange: [0.5, 1.0],
            moistRange: [0.6, 1.0],
            groundTiles: [TILES.GRASS],
            treeTile: TILES.TREE,
            bushTile: TILES.BUSH,
            stoneTile: TILES.STONE,
            waterTile: TILES.WATER,
            colors: {
                ground: ['#2d5a27', '#3d6a37', '#4d7a47'],
                accent: ['#1a4a1a', '#2a5a2a']
            },
            features: {
                treeDensity: 1.5,
                bushDensity: 1.2,
                stoneDensity: 0.8,
                flowerChance: 0.1,
                hazardChance: 0.02
            },
            ambiance: {
                particles: 'fireflies',
                fog: 0.1,
                tint: null
            }
        },

        DESERT: {
            id: 'desert',
            name: 'Desert',
            tempRange: [0.7, 1.0],
            moistRange: [0.0, 0.3],
            groundTiles: [BIOME_TILES.SAND],
            treeTile: BIOME_TILES.PALM_TREE,
            bushTile: BIOME_TILES.CACTUS,
            stoneTile: BIOME_TILES.SANDSTONE,
            waterTile: BIOME_TILES.OASIS,
            colors: {
                ground: ['#c4a35a', '#d4b36a', '#b4934a'],
                accent: ['#a4833a', '#94732a']
            },
            features: {
                treeDensity: 0.2,
                bushDensity: 0.3,
                stoneDensity: 1.3,
                flowerChance: 0.0,
                hazardChance: 0.03
            },
            ambiance: {
                particles: 'dust',
                fog: 0.0,
                tint: 'rgba(255, 200, 100, 0.05)'
            }
        },

        SWAMP: {
            id: 'swamp',
            name: 'Swamp',
            tempRange: [0.3, 0.7],
            moistRange: [0.7, 1.0],
            groundTiles: [BIOME_TILES.MUD, BIOME_TILES.MARSH],
            treeTile: BIOME_TILES.DEAD_TREE,
            bushTile: BIOME_TILES.MUSHROOM,
            stoneTile: TILES.STONE,
            waterTile: BIOME_TILES.MURKY_WATER,
            colors: {
                ground: ['#3a4a2a', '#4a5a3a', '#2a3a1a'],
                accent: ['#2a3a2a', '#3a4a3a']
            },
            features: {
                treeDensity: 0.8,
                bushDensity: 1.5,
                stoneDensity: 0.5,
                flowerChance: 0.02,
                hazardChance: 0.05
            },
            ambiance: {
                particles: 'bubbles',
                fog: 0.4,
                tint: 'rgba(50, 80, 50, 0.08)'
            }
        },

        SNOW: {
            id: 'snow',
            name: 'Frozen Tundra',
            tempRange: [0.0, 0.3],
            moistRange: [0.3, 0.7],
            groundTiles: [BIOME_TILES.SNOW],
            treeTile: BIOME_TILES.PINE_TREE,
            bushTile: TILES.BUSH,
            stoneTile: BIOME_TILES.SNOW_ROCK,
            waterTile: BIOME_TILES.FROZEN_WATER,
            colors: {
                ground: ['#d8e8f8', '#c8d8e8', '#e8f8ff'],
                accent: ['#a8c8d8', '#b8d8e8']
            },
            features: {
                treeDensity: 0.6,
                bushDensity: 0.3,
                stoneDensity: 1.0,
                flowerChance: 0.0,
                hazardChance: 0.04
            },
            ambiance: {
                particles: 'snow',
                fog: 0.2,
                tint: 'rgba(200, 220, 255, 0.08)'
            }
        },

        VOLCANIC: {
            id: 'volcanic',
            name: 'Volcanic Wasteland',
            tempRange: [0.8, 1.0],
            moistRange: [0.0, 0.2],
            groundTiles: [BIOME_TILES.VOLCANIC_ROCK, BIOME_TILES.ASH],
            treeTile: BIOME_TILES.DEAD_TREE,
            bushTile: null,
            stoneTile: BIOME_TILES.OBSIDIAN,
            waterTile: BIOME_TILES.LAVA,
            colors: {
                ground: ['#3a2a2a', '#4a3a3a', '#2a1a1a'],
                accent: ['#5a3a2a', '#4a2a1a']
            },
            features: {
                treeDensity: 0.1,
                bushDensity: 0.0,
                stoneDensity: 1.5,
                flowerChance: 0.0,
                hazardChance: 0.08
            },
            ambiance: {
                particles: 'embers',
                fog: 0.1,
                tint: 'rgba(255, 100, 50, 0.1)'
            }
        },

        RUINS: {
            id: 'ruins',
            name: 'Ancient Ruins',
            tempRange: [0.3, 0.7],
            moistRange: [0.3, 0.6],
            groundTiles: [BIOME_TILES.COBBLESTONE, BIOME_TILES.CRACKED_STONE],
            treeTile: TILES.TREE,
            bushTile: BIOME_TILES.VINE,
            stoneTile: BIOME_TILES.PILLAR,
            waterTile: TILES.WATER,
            colors: {
                ground: ['#5a6a5a', '#4a5a4a', '#6a7a6a'],
                accent: ['#6a6a6a', '#5a5a5a']
            },
            features: {
                treeDensity: 0.4,
                bushDensity: 0.6,
                stoneDensity: 1.8,
                flowerChance: 0.05,
                hazardChance: 0.06
            },
            ambiance: {
                particles: 'dust',
                fog: 0.15,
                tint: 'rgba(100, 100, 120, 0.05)'
            }
        },

        PLAINS: {
            id: 'plains',
            name: 'Plains',
            tempRange: [0.4, 0.6],
            moistRange: [0.4, 0.6],
            groundTiles: [TILES.GRASS, BIOME_TILES.TALL_GRASS],
            treeTile: TILES.TREE,
            bushTile: TILES.BUSH,
            stoneTile: TILES.STONE,
            waterTile: TILES.WATER,
            colors: {
                ground: ['#5a8a4a', '#6a9a5a', '#4a7a3a'],
                accent: ['#7aaa6a', '#8aba7a']
            },
            features: {
                treeDensity: 0.4,
                bushDensity: 0.8,
                stoneDensity: 0.6,
                flowerChance: 0.15,
                hazardChance: 0.01
            },
            ambiance: {
                particles: null,
                fog: 0.0,
                tint: null
            }
        }
    };

    // ============= LANDMARK TYPES =============
    const LANDMARKS = {
        TEMPLE: {
            id: 'temple',
            name: 'Ancient Temple',
            size: 7,
            biomes: ['jungle', 'ruins'],
            tiles: [
                [0, 0, 40, 40, 40, 0, 0],
                [0, 40, 40, 42, 40, 40, 0],
                [40, 40, 7, 7, 7, 40, 40],
                [40, 42, 7, 44, 7, 42, 40],
                [40, 40, 7, 7, 7, 40, 40],
                [0, 40, 40, 7, 40, 40, 0],
                [0, 0, 40, 40, 40, 0, 0]
            ],
            loot: { wood: 30, stone: 50, iron: 20, food: 15 }
        },

        OASIS: {
            id: 'oasis',
            name: 'Desert Oasis',
            size: 5,
            biomes: ['desert'],
            tiles: [
                [0, 23, 23, 23, 0],
                [23, 4, 4, 4, 23],
                [23, 4, 4, 4, 23],
                [23, 4, 4, 4, 23],
                [0, 23, 23, 23, 0]
            ],
            loot: { food: 40, wood: 15 }
        },

        WITCH_HUT: {
            id: 'witch_hut',
            name: 'Witch Hut',
            size: 5,
            biomes: ['swamp'],
            tiles: [
                [0, 27, 0, 27, 0],
                [27, 7, 7, 7, 27],
                [0, 7, 14, 7, 0],
                [0, 7, 7, 7, 0],
                [0, 0, 7, 0, 0]
            ],
            loot: { food: 20, iron: 10 }
        },

        ICE_CAVE: {
            id: 'ice_cave',
            name: 'Ice Cave',
            size: 5,
            biomes: ['snow'],
            tiles: [
                [34, 34, 31, 34, 34],
                [34, 31, 7, 31, 34],
                [31, 7, 44, 7, 31],
                [34, 31, 7, 31, 34],
                [34, 34, 31, 34, 34]
            ],
            loot: { iron: 40, stone: 30 }
        },

        LAVA_FORGE: {
            id: 'lava_forge',
            name: 'Ancient Forge',
            size: 5,
            biomes: ['volcanic'],
            tiles: [
                [35, 35, 35, 35, 35],
                [35, 37, 38, 37, 35],
                [35, 38, 44, 38, 35],
                [35, 37, 38, 37, 35],
                [35, 35, 35, 35, 35]
            ],
            loot: { iron: 60, stone: 40 }
        },

        SURVIVOR_CAMP: {
            id: 'survivor_camp',
            name: 'Abandoned Camp',
            size: 5,
            biomes: ['jungle', 'plains'],
            tiles: [
                [0, 0, 0, 0, 0],
                [0, 7, 7, 7, 0],
                [0, 7, 8, 7, 0],
                [0, 7, 7, 14, 0],
                [0, 0, 0, 0, 0]
            ],
            loot: { wood: 25, food: 30, stone: 15 }
        }
    };

    // ============= STATE =============
    let biomeCache = new Map();
    let landmarkCache = new Map();
    let generatedLandmarks = new Set();

    // ============= NOISE FUNCTIONS =============
    function getNoise(x, y, scale, offset = 0) {
        if (typeof noise2D === 'function') {
            return (noise2D(x * scale + offset, y * scale + offset) + 1) / 2;
        }
        // Fallback simplex-like noise
        const n = Math.sin(x * scale * 12.9898 + y * scale * 78.233 + offset) * 43758.5453;
        return n - Math.floor(n);
    }

    function getOctaveNoise(x, y, scale, octaves = 4, persistence = 0.5) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            total += getNoise(x, y, scale * frequency, i * 1000) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }

        return total / maxValue;
    }

    // ============= BIOME DETERMINATION =============
    function getTemperature(x, y) {
        // Base temperature from noise
        let temp = getOctaveNoise(x, y, CONFIG.NOISE.TEMPERATURE, 3);

        // Latitude effect (farther from origin = colder in one direction)
        const latitudeEffect = Math.abs(y) / 500;
        temp -= latitudeEffect * 0.3;

        return Math.max(0, Math.min(1, temp));
    }

    function getMoisture(x, y) {
        // Base moisture from noise
        let moisture = getOctaveNoise(x, y, CONFIG.NOISE.MOISTURE, 3);

        // Distance from water bodies increases moisture
        const elevation = getElevation(x, y);
        if (elevation < CONFIG.ELEVATION.SHALLOW_WATER) {
            moisture = Math.min(1, moisture + 0.3);
        }

        return Math.max(0, Math.min(1, moisture));
    }

    function getElevation(x, y) {
        return getOctaveNoise(x, y, CONFIG.NOISE.ELEVATION, 4, 0.6);
    }

    function determineBiome(x, y) {
        // Check cache first (chunk-level caching)
        const cacheKey = `${Math.floor(x / 16)},${Math.floor(y / 16)}`;
        if (biomeCache.has(cacheKey)) {
            return biomeCache.get(cacheKey);
        }

        const temp = getTemperature(x, y);
        const moisture = getMoisture(x, y);
        const elevation = getElevation(x, y);

        // Special elevation-based biome overrides
        if (elevation < CONFIG.ELEVATION.DEEP_WATER) {
            // Ocean/deep water - use nearest land biome's water
            return BIOMES.JUNGLE;
        }

        // Find best matching biome
        let bestBiome = BIOMES.JUNGLE;
        let bestScore = -Infinity;

        for (const biome of Object.values(BIOMES)) {
            const tempMatch = temp >= biome.tempRange[0] && temp <= biome.tempRange[1];
            const moistMatch = moisture >= biome.moistRange[0] && moisture <= biome.moistRange[1];

            if (tempMatch && moistMatch) {
                const tempCenter = (biome.tempRange[0] + biome.tempRange[1]) / 2;
                const moistCenter = (biome.moistRange[0] + biome.moistRange[1]) / 2;
                const score = 1 - (Math.abs(temp - tempCenter) + Math.abs(moisture - moistCenter));

                if (score > bestScore) {
                    bestScore = score;
                    bestBiome = biome;
                }
            }
        }

        // Limit cache size
        if (biomeCache.size > 2000) {
            const firstKey = biomeCache.keys().next().value;
            biomeCache.delete(firstKey);
        }

        biomeCache.set(cacheKey, bestBiome);
        return bestBiome;
    }

    // ============= TILE GENERATION =============
    function generateTileWithVariation(wx, wy) {
        const biome = determineBiome(wx, wy);
        const elevation = getElevation(wx, wy);
        const detailNoise = getNoise(wx, wy, CONFIG.NOISE.DETAIL);
        const forestNoise = getNoise(wx, wy, CONFIG.NOISE.FOREST, 500);

        // Check for landmark tiles first
        const landmarkTile = getLandmarkTile(wx, wy);
        if (landmarkTile !== null) {
            return landmarkTile;
        }

        // Water generation
        const riverNoise = getNoise(wx, wy, CONFIG.NOISE.RIVER);
        const isRiver = riverNoise > CONFIG.FEATURES.RIVER_THRESHOLD_MIN &&
                       riverNoise < CONFIG.FEATURES.RIVER_THRESHOLD_MAX;

        if (elevation < CONFIG.ELEVATION.SHALLOW_WATER || isRiver) {
            return biome.waterTile;
        }

        // Beach/shore transition
        if (elevation < CONFIG.ELEVATION.BEACH) {
            if (biome.id === 'desert') return BIOME_TILES.SAND;
            if (biome.id === 'snow') return BIOME_TILES.SNOW;
            return TILES.GRASS;
        }

        // Resource generation with seeded random
        const resourceRand = seededRandom(wx, wy);

        // Adjusted forest density based on biome
        const treeDensity = CONFIG.FEATURES.FOREST_DENSITY_BASE * biome.features.treeDensity;
        const treeThreshold = treeDensity * (0.5 + forestNoise * 0.5);

        if (resourceRand < treeThreshold && biome.treeTile !== null) {
            return biome.treeTile;
        }

        // Bush/vegetation
        const bushThreshold = treeThreshold + 0.15 * biome.features.bushDensity;
        if (resourceRand < bushThreshold && biome.bushTile !== null) {
            return biome.bushTile;
        }

        // Stone/ore
        const stoneThreshold = bushThreshold + 0.08 * biome.features.stoneDensity;
        if (resourceRand < stoneThreshold) {
            // Iron is rarer - secondary check
            const ironRand = seededRandom(wx + 500, wy + 500);
            if (ironRand > 0.7) {
                return TILES.IRON;
            }
            return biome.stoneTile;
        }

        // Decorative elements
        if (detailNoise > 0.8 && biome.features.flowerChance > 0) {
            if (Math.random() < biome.features.flowerChance) {
                return BIOME_TILES.FLOWER_PATCH;
            }
        }

        // Ground variation
        const groundIndex = Math.floor(detailNoise * biome.groundTiles.length);
        return biome.groundTiles[Math.min(groundIndex, biome.groundTiles.length - 1)];
    }

    // ============= LANDMARK GENERATION =============
    function getLandmarkTile(wx, wy) {
        // Check if this position is part of a landmark
        const chunkX = Math.floor(wx / 32);
        const chunkY = Math.floor(wy / 32);
        const landmarkKey = `${chunkX},${chunkY}`;

        // Check if we need to generate landmark for this area
        if (!landmarkCache.has(landmarkKey)) {
            generateLandmarkForArea(chunkX, chunkY);
        }

        const landmark = landmarkCache.get(landmarkKey);
        if (!landmark) return null;

        // Check if wx, wy is within landmark bounds
        const relX = wx - landmark.x;
        const relY = wy - landmark.y;

        if (relX >= 0 && relX < landmark.size && relY >= 0 && relY < landmark.size) {
            const tile = landmark.tiles[relY]?.[relX];
            if (tile !== 0 && tile !== undefined) {
                return tile;
            }
        }

        return null;
    }

    function generateLandmarkForArea(chunkX, chunkY) {
        const key = `${chunkX},${chunkY}`;

        // Use deterministic random to decide if landmark spawns
        const landmarkSeed = seededRandom(chunkX * 1000, chunkY * 1000);

        if (landmarkSeed > CONFIG.FEATURES.LANDMARK_CHANCE * 100) {
            landmarkCache.set(key, null);
            return;
        }

        // Get biome at chunk center
        const centerX = chunkX * 32 + 16;
        const centerY = chunkY * 32 + 16;
        const biome = determineBiome(centerX, centerY);

        // Find valid landmarks for this biome
        const validLandmarks = Object.values(LANDMARKS).filter(l =>
            l.biomes.includes(biome.id)
        );

        if (validLandmarks.length === 0) {
            landmarkCache.set(key, null);
            return;
        }

        // Select landmark
        const landmarkIndex = Math.floor(seededRandom(chunkX + 100, chunkY + 100) * validLandmarks.length);
        const landmarkType = validLandmarks[landmarkIndex];

        // Position within chunk
        const offsetX = Math.floor(seededRandom(chunkX + 200, chunkY + 200) * (32 - landmarkType.size));
        const offsetY = Math.floor(seededRandom(chunkX + 300, chunkY + 300) * (32 - landmarkType.size));

        const landmark = {
            type: landmarkType.id,
            x: chunkX * 32 + offsetX,
            y: chunkY * 32 + offsetY,
            size: landmarkType.size,
            tiles: landmarkType.tiles,
            loot: { ...landmarkType.loot },
            discovered: false
        };

        landmarkCache.set(key, landmark);

        // Track for game state
        if (!generatedLandmarks.has(`${landmark.x},${landmark.y}`)) {
            generatedLandmarks.add(`${landmark.x},${landmark.y}`);
        }
    }

    // ============= BIOME COLORS =============
    function getBiomeGroundColor(wx, wy, biome) {
        const variation = getNoise(wx, wy, 0.3);
        const colorIndex = Math.floor(variation * biome.colors.ground.length);
        return biome.colors.ground[colorIndex % biome.colors.ground.length];
    }

    function getBiomeAccentColor(wx, wy, biome) {
        const variation = getNoise(wx, wy, 0.5);
        const colorIndex = Math.floor(variation * biome.colors.accent.length);
        return biome.colors.accent[colorIndex % biome.colors.accent.length];
    }

    // ============= ENVIRONMENTAL EFFECTS =============
    function getEnvironmentalEffects(wx, wy) {
        const biome = determineBiome(wx, wy);
        return {
            particles: biome.ambiance.particles,
            fog: biome.ambiance.fog,
            tint: biome.ambiance.tint,
            movementModifier: getMovementModifier(wx, wy, biome),
            hazardDamage: getHazardDamage(wx, wy, biome)
        };
    }

    function getMovementModifier(wx, wy, biome) {
        let modifier = 1.0;

        // Swamp slows movement
        if (biome.id === 'swamp') {
            const mudNoise = getNoise(wx, wy, 0.2);
            if (mudNoise > 0.6) {
                modifier *= 0.7;
            }
        }

        // Snow slows movement slightly
        if (biome.id === 'snow') {
            modifier *= 0.9;
        }

        // Volcanic terrain is difficult
        if (biome.id === 'volcanic') {
            modifier *= 0.85;
        }

        return modifier;
    }

    function getHazardDamage(wx, wy, biome) {
        const hazardNoise = getNoise(wx, wy, 0.15, 2000);

        if (hazardNoise > 1 - biome.features.hazardChance) {
            switch (biome.id) {
                case 'volcanic':
                    return { type: 'fire', damage: 5, interval: 1 };
                case 'swamp':
                    return { type: 'poison', damage: 2, interval: 2 };
                case 'snow':
                    return { type: 'cold', damage: 1, interval: 3 };
                case 'desert':
                    return { type: 'heat', damage: 1, interval: 4 };
                default:
                    return null;
            }
        }

        return null;
    }

    // ============= INTEGRATION WITH EXISTING SYSTEMS =============
    function integrateWithWorldGeneration() {
        // Override generateTileAt if it exists
        if (typeof window.generateTileAt === 'function') {
            const originalGenerate = window.generateTileAt;

            window.generateTileAt = function(wx, wy) {
                // Skip base area - use original generation
                if (wx >= -8 && wx <= 8 && wy >= -8 && wy <= 8) {
                    return originalGenerate(wx, wy);
                }

                return generateTileWithVariation(wx, wy);
            };
        }

        // Enhance BiomeSystem if available
        if (typeof BiomeSystem !== 'undefined') {
            BiomeSystem.getDetailedBiome = function(x, y) {
                return determineBiome(x, y);
            };

            BiomeSystem.getBiomeColor = function(x, y) {
                const biome = determineBiome(x, y);
                return getBiomeGroundColor(x, y, biome);
            };
        }
    }

    // ============= DISCOVERY SYSTEM =============
    function checkLandmarkDiscovery(playerX, playerY) {
        const nearbyLandmarks = [];

        // Check 3x3 chunk area around player
        const chunkX = Math.floor(playerX / 32);
        const chunkY = Math.floor(playerY / 32);

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const key = `${chunkX + dx},${chunkY + dy}`;
                const landmark = landmarkCache.get(key);

                if (landmark && !landmark.discovered) {
                    const dist = Math.sqrt(
                        (playerX - (landmark.x + landmark.size / 2)) ** 2 +
                        (playerY - (landmark.y + landmark.size / 2)) ** 2
                    );

                    if (dist < CONFIG.FEATURES.POI_RADIUS) {
                        landmark.discovered = true;
                        nearbyLandmarks.push(landmark);

                        // Notification
                        if (typeof showNotification === 'function') {
                            const landmarkInfo = LANDMARKS[landmark.type.toUpperCase()];
                            showNotification(
                                `<i class="material-icons">explore</i> Discovered: ${landmarkInfo?.name || landmark.type}!`,
                                []
                            );
                        }

                        // Achievement tracking
                        if (typeof AchievementSystem !== 'undefined') {
                            AchievementSystem.trackDiscovery(landmark.type);
                        }
                    }
                }
            }
        }

        return nearbyLandmarks;
    }

    // ============= SERIALIZATION =============
    function getState() {
        return {
            generatedLandmarks: Array.from(generatedLandmarks),
            discoveredLandmarks: Array.from(landmarkCache.entries())
                .filter(([, l]) => l?.discovered)
                .map(([key, l]) => ({ key, type: l.type, x: l.x, y: l.y }))
        };
    }

    function setState(state) {
        if (!state) return;

        if (state.generatedLandmarks) {
            generatedLandmarks = new Set(state.generatedLandmarks);
        }

        if (state.discoveredLandmarks) {
            state.discoveredLandmarks.forEach(l => {
                const existing = landmarkCache.get(l.key);
                if (existing) {
                    existing.discovered = true;
                }
            });
        }
    }

    // ============= DEBUG =============
    function debugShowBiomes(playerX, playerY, radius = 50) {
        const biomeMap = {};

        for (let y = playerY - radius; y <= playerY + radius; y += 5) {
            for (let x = playerX - radius; x <= playerX + radius; x += 5) {
                const biome = determineBiome(x, y);
                biomeMap[biome.id] = (biomeMap[biome.id] || 0) + 1;
            }
        }

        console.log('Biome distribution around player:', biomeMap);
        return biomeMap;
    }

    function clearCaches() {
        biomeCache.clear();
        landmarkCache.clear();
    }

    // ============= CONVENIENCE ACCESSORS =============
    function getBiomeAt(wx, wy) {
        return determineBiome(wx, wy);
    }

    // ============= PUBLIC API =============
    return {
        // Configuration
        CONFIG,
        BIOMES,
        BIOME_TILES,
        LANDMARKS,

        // Core functions
        generateTileWithVariation,
        determineBiome,
        getBiomeAt, // Alias for convenience
        getTemperature,
        getMoisture,
        getElevation,

        // Colors
        getBiomeGroundColor,
        getBiomeAccentColor,

        // Environmental
        getEnvironmentalEffects,
        getMovementModifier,
        getHazardDamage,

        // Landmarks
        getLandmarkTile,
        checkLandmarkDiscovery,

        // Integration
        integrateWithWorldGeneration,

        // State
        getState,
        setState,
        clearCaches,

        // Debug
        debugShowBiomes
    };
})();

// Export globally
window.WorldVariation = WorldVariation;

// Auto-integrate on load
if (document.readyState === 'complete') {
    WorldVariation.integrateWithWorldGeneration();
} else {
    window.addEventListener('load', () => {
        WorldVariation.integrateWithWorldGeneration();
    });
}
