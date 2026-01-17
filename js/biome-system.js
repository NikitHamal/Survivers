// ============================================
// BIOME SYSTEM - Diverse World Environments
// ============================================
// Complete biome system with unique terrain types,
// resources, hazards, and visual themes

const BiomeSystem = (function() {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        BIOME_SCALE: 0.008,         // Noise scale for biome determination
        TEMPERATURE_SCALE: 0.005,   // Temperature noise scale
        MOISTURE_SCALE: 0.006,      // Moisture noise scale
        TRANSITION_WIDTH: 0.15,     // Biome transition smoothness
        RESOURCE_DENSITY: 0.03,     // Base resource spawn density
        HAZARD_DENSITY: 0.01,       // Base hazard spawn density
        SPECIAL_STRUCTURE_CHANCE: 0.002 // Chance for special structures
    };

    // ============= BIOME DEFINITIONS =============
    const BIOMES = {
        JUNGLE: {
            id: 'jungle',
            name: 'Jungle',
            description: 'Dense tropical forest with abundant resources',
            temperatureRange: [0.5, 1.0],
            moistureRange: [0.6, 1.0],
            colors: {
                grass: ['#2d5a27', '#3d6a37', '#4d7a47'],
                dirt: ['#5a4020', '#4a3015', '#6a5030'],
                water: '#2a5a4a',
                foliage: '#1a4a1a'
            },
            tiles: {
                primary: TILES.GRASS,
                secondary: TILES.DIRT,
                water: TILES.WATER
            },
            resources: {
                wood: { density: 1.5, type: TILES.TREE },
                food: { density: 1.2, type: TILES.BUSH },
                herbs: { density: 0.8, type: TILES.BUSH }
            },
            hazards: {
                poisonPlant: { density: 0.5, damage: 5, type: 'poison' },
                quicksand: { density: 0.2, slowAmount: 0.5 }
            },
            zombieModifiers: {
                spawnRate: 1.0,
                types: ['NORMAL', 'RUNNER', 'SPITTER'],
                specialChance: 0.15
            },
            ambientEffects: {
                particles: 'fireflies',
                particleDensity: 0.3,
                fogDensity: 0.1
            },
            music: 'jungle_ambience'
        },

        DESERT: {
            id: 'desert',
            name: 'Desert',
            description: 'Scorching sands with scarce water but hidden treasures',
            temperatureRange: [0.7, 1.0],
            moistureRange: [0.0, 0.3],
            colors: {
                grass: ['#c4a35a', '#d4b36a', '#b4934a'],
                dirt: ['#a4833a', '#94732a', '#b4935a'],
                water: '#4a7a6a',
                foliage: '#8a7a3a'
            },
            tiles: {
                primary: TILES.SAND,
                secondary: TILES.SANDSTONE,
                water: TILES.WATER
            },
            resources: {
                stone: { density: 1.3, type: TILES.STONE },
                iron: { density: 1.5, type: TILES.IRON },
                cactus: { density: 0.4, type: TILES.BUSH }
            },
            hazards: {
                heatwave: { density: 0.3, hungerDrain: 1.5 },
                sandstorm: { density: 0.1, visibility: 0.5, speedPenalty: 0.3 },
                scorpion: { density: 0.2, damage: 8, type: 'poison' }
            },
            zombieModifiers: {
                spawnRate: 0.7,
                types: ['NORMAL', 'TANK', 'EXPLODER'],
                specialChance: 0.1
            },
            ambientEffects: {
                particles: 'dust',
                particleDensity: 0.5,
                heatWave: true
            },
            music: 'desert_wind'
        },

        SWAMP: {
            id: 'swamp',
            name: 'Swamp',
            description: 'Murky wetlands with dangerous creatures and rare plants',
            temperatureRange: [0.3, 0.7],
            moistureRange: [0.7, 1.0],
            colors: {
                grass: ['#3a4a2a', '#4a5a3a', '#2a3a1a'],
                dirt: ['#3a3a2a', '#2a2a1a', '#4a4a3a'],
                water: '#2a3a2a',
                foliage: '#2a4a2a'
            },
            tiles: {
                primary: TILES.MUD,
                secondary: TILES.MARSH,
                water: TILES.MURKY_WATER
            },
            resources: {
                wood: { density: 0.8, type: TILES.TREE },
                herbs: { density: 1.5, type: TILES.BUSH },
                mushrooms: { density: 1.2, type: TILES.BUSH }
            },
            hazards: {
                poisonGas: { density: 0.4, damage: 3, type: 'poison', radius: 2 },
                deepWater: { density: 0.3, slowAmount: 0.7 },
                leech: { density: 0.2, healthDrain: 2 }
            },
            zombieModifiers: {
                spawnRate: 1.3,
                types: ['NORMAL', 'SPITTER', 'SCREAMER', 'NECROMANCER'],
                specialChance: 0.2
            },
            ambientEffects: {
                particles: 'bubbles',
                particleDensity: 0.4,
                fogDensity: 0.4
            },
            music: 'swamp_ambience'
        },

        SNOW: {
            id: 'snow',
            name: 'Frozen Tundra',
            description: 'Icy wilderness with harsh conditions but rare ores',
            temperatureRange: [0.0, 0.3],
            moistureRange: [0.3, 0.7],
            colors: {
                grass: ['#d8e8f8', '#c8d8e8', '#e8f8ff'],
                dirt: ['#8898a8', '#7888a8', '#98a8b8'],
                water: '#6898b8',
                foliage: '#4a6a8a'
            },
            tiles: {
                primary: TILES.SNOW,
                secondary: TILES.ICE,
                water: TILES.FROZEN_WATER
            },
            resources: {
                stone: { density: 1.0, type: TILES.STONE },
                iron: { density: 1.8, type: TILES.IRON },
                ice: { density: 0.6, type: TILES.STONE }
            },
            hazards: {
                frostbite: { density: 0.3, damage: 2, type: 'cold', interval: 5 },
                thinIce: { density: 0.2, breakChance: 0.3 },
                blizzard: { density: 0.1, visibility: 0.3, speedPenalty: 0.4 }
            },
            zombieModifiers: {
                spawnRate: 0.8,
                types: ['NORMAL', 'TANK', 'SHADOW'],
                specialChance: 0.12
            },
            ambientEffects: {
                particles: 'snow',
                particleDensity: 0.6,
                fogDensity: 0.2
            },
            music: 'frozen_wind'
        },

        VOLCANIC: {
            id: 'volcanic',
            name: 'Volcanic Wasteland',
            description: 'Dangerous lava fields with powerful resources',
            temperatureRange: [0.8, 1.0],
            moistureRange: [0.0, 0.2],
            colors: {
                grass: ['#3a2a2a', '#4a3a3a', '#2a1a1a'],
                dirt: ['#5a3a2a', '#4a2a1a', '#6a4a3a'],
                water: '#ff6a2a',
                foliage: '#4a3a2a'
            },
            tiles: {
                primary: TILES.VOLCANIC_ROCK,
                secondary: TILES.ASH,
                water: TILES.LAVA
            },
            resources: {
                stone: { density: 1.2, type: TILES.STONE },
                iron: { density: 2.0, type: TILES.IRON },
                gems: { density: 0.3, type: TILES.IRON }
            },
            hazards: {
                lavaPool: { density: 0.3, damage: 25, type: 'fire' },
                eruption: { density: 0.05, damage: 50, radius: 5 },
                ashCloud: { density: 0.2, visibility: 0.4, damage: 1 }
            },
            zombieModifiers: {
                spawnRate: 0.6,
                types: ['EXPLODER', 'BRUTE', 'TITAN'],
                specialChance: 0.25
            },
            ambientEffects: {
                particles: 'embers',
                particleDensity: 0.7,
                screenTint: '#ff220010'
            },
            music: 'volcanic_rumble'
        },

        RUINS: {
            id: 'ruins',
            name: 'Ancient Ruins',
            description: 'Remnants of civilization with valuable loot',
            temperatureRange: [0.3, 0.7],
            moistureRange: [0.3, 0.6],
            colors: {
                grass: ['#5a6a5a', '#4a5a4a', '#6a7a6a'],
                dirt: ['#6a6a6a', '#5a5a5a', '#7a7a7a'],
                water: '#4a6a7a',
                foliage: '#4a5a4a'
            },
            tiles: {
                primary: TILES.COBBLESTONE,
                secondary: TILES.CRACKED_STONE,
                water: TILES.WATER
            },
            resources: {
                stone: { density: 1.5, type: TILES.STONE },
                iron: { density: 0.8, type: TILES.IRON }
            },
            hazards: {
                collapse: { density: 0.1, damage: 20, radius: 2 },
                trap: { density: 0.2, damage: 15, type: 'spike' }
            },
            zombieModifiers: {
                spawnRate: 1.5,
                types: ['NORMAL', 'SHADOW', 'NECROMANCER', 'QUEEN'],
                specialChance: 0.3
            },
            ambientEffects: {
                particles: 'dust',
                particleDensity: 0.2,
                fogDensity: 0.15
            },
            music: 'ruins_echo'
        }
    };

    // ============= SPECIAL TILES =============
    const BIOME_TILES = {
        SAND: TILES.SAND,
        SANDSTONE: TILES.SANDSTONE,
        MUD: TILES.MUD,
        MARSH: TILES.MARSH,
        MURKY_WATER: TILES.MURKY_WATER,
        SNOW: TILES.SNOW,
        ICE: TILES.ICE,
        FROZEN_WATER: TILES.FROZEN_WATER,
        VOLCANIC_ROCK: TILES.VOLCANIC_ROCK,
        ASH: TILES.ASH,
        LAVA: TILES.LAVA,
        COBBLESTONE: TILES.COBBLESTONE,
        CRACKED_STONE: TILES.CRACKED_STONE
    };

    // ============= STATE =============
    let currentBiome = null;
    let biomeCache = new Map();
    let activeHazards = [];
    let biomeTransitions = new Map();

    // ============= NOISE FUNCTIONS =============
    function getBiomeNoise(x, y, scale, offset = 0) {
        // Use existing noise2D from utils if available
        if (typeof noise2D === 'function') {
            return (noise2D(x * scale + offset, y * scale + offset) + 1) / 2;
        }
        // Fallback simple noise
        return (Math.sin(x * scale + offset) * Math.cos(y * scale + offset) + 1) / 2;
    }

    function getTemperature(x, y) {
        return getBiomeNoise(x, y, CONFIG.TEMPERATURE_SCALE, 1000);
    }

    function getMoisture(x, y) {
        return getBiomeNoise(x, y, CONFIG.MOISTURE_SCALE, 2000);
    }

    // ============= BIOME DETERMINATION =============
    function determineBiome(x, y) {
        const cacheKey = `${Math.floor(x / 16)},${Math.floor(y / 16)}`;

        if (biomeCache.has(cacheKey)) {
            return biomeCache.get(cacheKey);
        }

        const temp = getTemperature(x, y);
        const moisture = getMoisture(x, y);

        let bestBiome = BIOMES.JUNGLE;
        let bestScore = -1;

        for (const biome of Object.values(BIOMES)) {
            const tempMatch = temp >= biome.temperatureRange[0] && temp <= biome.temperatureRange[1];
            const moistMatch = moisture >= biome.moistureRange[0] && moisture <= biome.moistureRange[1];

            if (tempMatch && moistMatch) {
                // Calculate how well this biome matches
                const tempCenter = (biome.temperatureRange[0] + biome.temperatureRange[1]) / 2;
                const moistCenter = (biome.moistureRange[0] + biome.moistureRange[1]) / 2;
                const score = 1 - (Math.abs(temp - tempCenter) + Math.abs(moisture - moistCenter)) / 2;

                if (score > bestScore) {
                    bestScore = score;
                    bestBiome = biome;
                }
            }
        }

        // Limit cache size
        if (biomeCache.size > 1000) {
            const firstKey = biomeCache.keys().next().value;
            biomeCache.delete(firstKey);
        }

        biomeCache.set(cacheKey, bestBiome);
        return bestBiome;
    }

    function getBiomeAt(x, y) {
        return determineBiome(x, y);
    }

    function getBiomeBlend(x, y) {
        const biome = determineBiome(x, y);
        const neighbors = [
            determineBiome(x - 8, y),
            determineBiome(x + 8, y),
            determineBiome(x, y - 8),
            determineBiome(x, y + 8)
        ];

        const blendFactors = {};
        blendFactors[biome.id] = 0.6;

        for (const neighbor of neighbors) {
            if (!blendFactors[neighbor.id]) {
                blendFactors[neighbor.id] = 0;
            }
            blendFactors[neighbor.id] += 0.1;
        }

        return { primary: biome, blendFactors };
    }

    // ============= TILE GENERATION =============
    function generateBiomeTile(x, y, baseNoise) {
        const biome = determineBiome(x, y);
        const localNoise = getBiomeNoise(x, y, 0.1);

        // Base tile determination
        let tile = biome.tiles.primary;

        // Water bodies
        if (baseNoise < 0.3) {
            tile = biome.tiles.water;
        } else if (baseNoise < 0.35) {
            // Shore/transition
            tile = biome.tiles.secondary;
        } else if (localNoise > 0.7) {
            // Secondary terrain patches
            tile = biome.tiles.secondary;
        }

        // Resource spawning
        if (baseNoise > 0.4 && baseNoise < 0.8) {
            for (const [resourceType, config] of Object.entries(biome.resources)) {
                const resourceNoise = getBiomeNoise(x + resourceType.length * 100, y, 0.15);
                if (resourceNoise > 1 - config.density * CONFIG.RESOURCE_DENSITY) {
                    if (typeof config.type === 'number') {
                        tile = config.type;
                    }
                    break;
                }
            }
        }

        return tile;
    }

    function getTileColor(tile, x, y) {
        const biome = determineBiome(x, y);
        const variation = getBiomeNoise(x, y, 0.5);
        const colorIndex = Math.floor(variation * biome.colors.grass.length);

        // Return color based on tile type
        if (tile === biome.tiles.water || tile === TILES.WATER) {
            return biome.colors.water;
        }

        if (tile === biome.tiles.secondary) {
            return biome.colors.dirt[colorIndex % biome.colors.dirt.length];
        }

        return biome.colors.grass[colorIndex % biome.colors.grass.length];
    }

    function isWaterTile(tile) {
        return tile === TILES.WATER ||
            tile === TILES.MURKY_WATER ||
            tile === TILES.FROZEN_WATER;
    }

    function isLavaTile(tile) {
        return tile === TILES.LAVA;
    }

    // ============= HAZARD SYSTEM =============
    function updateHazards(dt) {
        const playerBiome = determineBiome(player.x, player.y);

        // Check biome hazards affecting player
        for (const [hazardType, config] of Object.entries(playerBiome.hazards)) {
            const hazardActive = checkHazardActive(player.x, player.y, hazardType, config);

            if (hazardActive) {
                applyHazardEffect(hazardType, config, dt);
            }
        }

        // Update active environmental hazards
        activeHazards = activeHazards.filter(hazard => {
            hazard.duration -= dt;
            if (hazard.duration <= 0) return false;

            // Check player proximity
            const dist = Math.sqrt((hazard.x - player.x) ** 2 + (hazard.y - player.y) ** 2);
            if (dist < hazard.radius) {
                applyHazardEffect(hazard.type, hazard.config, dt);
            }

            return true;
        });
    }

    function checkHazardActive(x, y, hazardType, config) {
        const hazardNoise = getBiomeNoise(x, y, 0.2, hazardType.length * 500);
        return hazardNoise > 1 - config.density * CONFIG.HAZARD_DENSITY;
    }

    function applyHazardEffect(hazardType, config, dt) {
        switch (hazardType) {
            case 'heatwave':
                // Increased hunger drain
                if (player.hunger > 0) {
                    player.hunger -= 0.5 * (config.hungerDrain || 1) * dt;
                }
                break;

            case 'frostbite':
                // Cold damage over time
                if (!player.immunities?.has('cold')) {
                    player.health -= config.damage * dt;
                    if (typeof addDamageNumber === 'function' && Math.random() < 0.1) {
                        addDamageNumber(player.x, player.y - 0.5, Math.ceil(config.damage * dt), '#88ccff');
                    }
                }
                break;

            case 'poisonPlant':
            case 'poisonGas':
                // Poison damage
                if (!player.immunities?.has('poison')) {
                    if (typeof BossSystem !== 'undefined') {
                        BossSystem.applyPoisonToPlayer(config.damage, 3);
                    } else {
                        player.health -= config.damage * dt;
                    }
                }
                break;

            case 'lavaPool':
                // Fire damage
                if (!player.immunities?.has('fire')) {
                    player.health -= config.damage * dt;
                    if (typeof addDamageNumber === 'function' && Math.random() < 0.2) {
                        addDamageNumber(player.x, player.y - 0.5, Math.ceil(config.damage * dt), '#ff6600');
                    }
                    if (typeof spawnParticles === 'function') {
                        spawnParticles(player.x, player.y, '#ff4400', 2);
                    }
                }
                break;

            case 'quicksand':
            case 'deepWater':
                // Movement slow (applied elsewhere)
                break;

            case 'leech':
                // Health drain
                player.health -= config.healthDrain * dt;
                break;
        }
    }

    function getMovementModifier(x, y) {
        const biome = determineBiome(x, y);
        let modifier = 1.0;

        for (const [hazardType, config] of Object.entries(biome.hazards)) {
            if (checkHazardActive(x, y, hazardType, config)) {
                if (config.slowAmount) {
                    modifier *= (1 - config.slowAmount);
                }
                if (config.speedPenalty) {
                    modifier *= (1 - config.speedPenalty);
                }
            }
        }

        return modifier;
    }

    // ============= ZOMBIE MODIFICATIONS =============
    function getZombieSpawnModifiers(x, y) {
        const biome = determineBiome(x, y);
        return biome.zombieModifiers;
    }

    function getZombieTypesForBiome(x, y) {
        const biome = determineBiome(x, y);
        return biome.zombieModifiers.types;
    }

    function shouldSpawnSpecialZombie(x, y) {
        const biome = determineBiome(x, y);
        return Math.random() < biome.zombieModifiers.specialChance;
    }

    // ============= AMBIENT EFFECTS =============
    function spawnAmbientParticles(dt) {
        const biome = determineBiome(player.x, player.y);
        const effects = biome.ambientEffects;

        if (!effects.particles || typeof spawnParticles !== 'function') return;

        const spawnChance = effects.particleDensity * dt;
        if (Math.random() > spawnChance) return;

        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 15;

        switch (effects.particles) {
            case 'fireflies':
                createAmbientParticle(player.x + offsetX, player.y + offsetY, '#ffff88', 'float');
                break;
            case 'dust':
                createAmbientParticle(player.x + offsetX, player.y + offsetY, '#c4a060', 'drift');
                break;
            case 'bubbles':
                createAmbientParticle(player.x + offsetX, player.y + offsetY, '#88aa88', 'rise');
                break;
            case 'snow':
                createAmbientParticle(player.x + offsetX, player.y - 10 + offsetY, '#ffffff', 'fall');
                break;
            case 'embers':
                createAmbientParticle(player.x + offsetX, player.y + offsetY, '#ff6622', 'rise');
                break;
        }
    }

    function createAmbientParticle(x, y, color, behavior) {
        if (typeof particles === 'undefined') return;

        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 0.5,
            vy: behavior === 'fall' ? 0.5 : behavior === 'rise' ? -0.5 : (Math.random() - 0.5) * 0.3,
            life: 3 + Math.random() * 2,
            maxLife: 5,
            color: color,
            size: 2 + Math.random() * 2,
            ambient: true,
            behavior: behavior
        });
    }

    function getFogDensity(x, y) {
        const biome = determineBiome(x, y);
        return biome.ambientEffects.fogDensity || 0;
    }

    function getScreenTint(x, y) {
        const biome = determineBiome(x, y);
        return biome.ambientEffects.screenTint || null;
    }

    // ============= SPECIAL STRUCTURES =============
    function checkSpecialStructure(x, y) {
        const biome = determineBiome(x, y);
        const structureNoise = getBiomeNoise(x, y, 0.01, 5000);

        if (structureNoise > 1 - CONFIG.SPECIAL_STRUCTURE_CHANCE) {
            return generateSpecialStructure(biome, x, y);
        }

        return null;
    }

    function generateSpecialStructure(biome, x, y) {
        const structures = {
            jungle: ['ancient_temple', 'survivor_camp', 'overgrown_bunker'],
            desert: ['pyramid', 'oasis', 'buried_vault'],
            swamp: ['witch_hut', 'sunken_shrine', 'monster_den'],
            snow: ['ice_cave', 'frozen_outpost', 'yeti_lair'],
            volcanic: ['forge_temple', 'obsidian_tower', 'dragon_nest'],
            ruins: ['grand_library', 'armory', 'throne_room']
        };

        const biomeStructures = structures[biome.id] || ['generic_ruin'];
        const structureType = biomeStructures[Math.floor(getBiomeNoise(x, y, 0.5) * biomeStructures.length)];

        return {
            type: structureType,
            x: x,
            y: y,
            biome: biome.id,
            explored: false,
            loot: generateStructureLoot(structureType, biome)
        };
    }

    function generateStructureLoot(structureType, biome) {
        const baseLoot = {
            resources: {
                wood: Math.floor(Math.random() * 50) + 20,
                stone: Math.floor(Math.random() * 40) + 15,
                iron: Math.floor(Math.random() * 30) + 10,
                food: Math.floor(Math.random() * 25) + 10
            },
            items: []
        };

        // Add special items based on structure type
        if (structureType.includes('temple') || structureType.includes('shrine')) {
            baseLoot.items.push({ id: 'health_potion', quantity: 3 });
            if (Math.random() < 0.3) {
                baseLoot.items.push({ id: 'vitality_amulet', quantity: 1 });
            }
        }

        if (structureType.includes('armory') || structureType.includes('vault')) {
            baseLoot.items.push({ id: 'iron_sword', quantity: 1 });
            if (Math.random() < 0.2) {
                baseLoot.items.push({ id: 'steel_sword', quantity: 1 });
            }
        }

        // Biome-specific loot bonuses
        if (biome.id === 'volcanic') {
            baseLoot.resources.iron *= 2;
        } else if (biome.id === 'snow') {
            baseLoot.resources.iron = Math.floor(baseLoot.resources.iron * 1.5);
        } else if (biome.id === 'jungle') {
            baseLoot.resources.wood *= 2;
            baseLoot.resources.food *= 1.5;
        }

        return baseLoot;
    }

    // ============= RESOURCE GATHERING MODIFIERS =============
    function getGatheringModifier(x, y, resourceType) {
        const biome = determineBiome(x, y);
        let modifier = 1.0;

        // Apply biome resource bonuses
        if (biome.resources[resourceType]) {
            modifier *= biome.resources[resourceType].density;
        }

        return modifier;
    }

    // ============= INTEGRATION HOOKS =============
    function onChunkGenerate(cx, cy, chunk) {
        // Called when a new chunk is generated
        // Add biome-specific decorations and features
        const worldX = cx * CHUNK_SIZE;
        const worldY = cy * CHUNK_SIZE;
        const biome = determineBiome(worldX, worldY);

        // Store biome info for the chunk
        if (!chunk.biomeInfo) {
            chunk.biomeInfo = {
                primary: biome.id,
                temperature: getTemperature(worldX, worldY),
                moisture: getMoisture(worldX, worldY)
            };
        }

        return chunk;
    }

    function update(dt) {
        // Update hazards
        updateHazards(dt);

        // Spawn ambient particles
        spawnAmbientParticles(dt);

        // Update current biome
        const newBiome = determineBiome(player.x, player.y);
        if (currentBiome !== newBiome) {
            onBiomeChange(currentBiome, newBiome);
            currentBiome = newBiome;
        }
    }

    function onBiomeChange(oldBiome, newBiome) {
        if (typeof showNotification === 'function' && newBiome) {
            showNotification(
                `<i class="material-icons">terrain</i> Entered ${newBiome.name}`,
                []
            );
        }

        // Track for achievements
        if (window.gameStats && newBiome) {
            if (!window.gameStats.biomesVisited) {
                window.gameStats.biomesVisited = new Set();
            }
            window.gameStats.biomesVisited.add(newBiome.id);
        }
    }

    // ============= SERIALIZATION =============
    function getState() {
        return {
            currentBiome: currentBiome?.id || null,
            activeHazards: activeHazards.map(h => ({
                type: h.type,
                x: h.x,
                y: h.y,
                radius: h.radius,
                duration: h.duration
            })),
            biomesVisited: window.gameStats?.biomesVisited
                ? Array.from(window.gameStats.biomesVisited)
                : []
        };
    }

    function setState(state) {
        if (!state) return;

        if (state.currentBiome && BIOMES[state.currentBiome.toUpperCase()]) {
            currentBiome = BIOMES[state.currentBiome.toUpperCase()];
        }

        activeHazards = state.activeHazards || [];

        if (state.biomesVisited && window.gameStats) {
            window.gameStats.biomesVisited = new Set(state.biomesVisited);
        }
    }

    // ============= PUBLIC API =============
    return {
        // Constants
        BIOMES,
        BIOME_TILES,
        CONFIG,

        // Biome queries
        getBiomeAt,
        determineBiome,
        getBiomeBlend,
        getTemperature,
        getMoisture,

        // Tile generation
        generateBiomeTile,
        getTileColor,
        isWaterTile,
        isLavaTile,

        // Hazards
        updateHazards,
        getMovementModifier,
        checkHazardActive,

        // Zombie modifications
        getZombieSpawnModifiers,
        getZombieTypesForBiome,
        shouldSpawnSpecialZombie,

        // Ambient effects
        spawnAmbientParticles,
        getFogDensity,
        getScreenTint,

        // Structures
        checkSpecialStructure,
        generateStructureLoot,

        // Resources
        getGatheringModifier,

        // Integration
        onChunkGenerate,
        update,

        // State
        getCurrentBiome: () => currentBiome,
        getState,
        setState
    };
})();

// Export globally
window.BiomeSystem = BiomeSystem;
