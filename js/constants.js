// ============= GAME CONSTANTS =============
const TILE_SIZE = 16;
const CHUNK_SIZE = 16;
const SCALE = 3;
const DAY_LENGTH = 300000; // 5 minutes per day
const FIXED_DT = 1 / 60; // Fixed timestep for physics
const MAX_DT = 0.1; // Max delta time to prevent spiral

// Tile types
const TILES = {
    GRASS: 0, TREE: 1, STONE: 2, IRON: 3, WATER: 4,
    WALL: 5, FLOOR: 7, CAMPFIRE: 8,
    HOUSE: 9, FARM: 10, TOWER: 11, CANNON: 12,
    WORKBENCH: 13, CHEST: 14, BED: 15, BUSH: 16,
    SPIKES: 17, HOUSE_BASE: 18,
    JUNGLE: 19,
    SAND: 20, SANDSTONE: 21, MUD: 22, MARSH: 23, MURKY_WATER: 24,
    SNOW: 25, ICE: 26, FROZEN_WATER: 27, VOLCANIC_ROCK: 28, ASH: 29, LAVA: 30,
    COBBLESTONE: 31, CRACKED_STONE: 32,
    BERRY_BUSH: 33, HEALING_HERB: 34, CACTUS: 35, DEAD_TREE: 36,
    SWAMP_HERB: 37, GLOWING_MUSHROOM: 38, ICE_BLOCK: 39, OBSIDIAN: 40,
    FIRE_GEM: 41, CARVED_STONE: 42, TREASURE_CHEST: 43, METAL_SCRAP: 44
};

const ROLES = ['None', 'Builder', 'Soldier', 'Guard', 'Farmer', 'Woodcutter', 'Miner', 'Hunter', 'Medic'];

const BUILDINGS = [
    { name: 'Wall', icon: '🧱', cost: { wood: 5 }, tile: TILES.WALL, desc: 'Block zombies' },
    { name: 'Floor', icon: '🟫', cost: { wood: 2 }, tile: TILES.FLOOR, desc: 'Walkable floor' },
    { name: 'Spikes', icon: '🌵', cost: { wood: 8, stone: 2 }, tile: TILES.SPIKES, desc: 'Damages zombies' },
    { name: 'House', icon: '🏠', cost: { wood: 20, stone: 10 }, tile: TILES.HOUSE, desc: '+2 survivor cap' },
    { name: 'Farm', icon: '🌾', cost: { wood: 10 }, tile: TILES.FARM, desc: 'Produces food' },
    { name: 'Campfire', icon: '🔥', cost: { wood: 5, stone: 3 }, tile: TILES.CAMPFIRE, desc: 'Heal nearby' },
    { name: 'Tower', icon: '🗼', cost: { wood: 30, stone: 20, iron: 10 }, tile: TILES.TOWER, desc: 'Auto-attacks' },
    { name: 'Cannon', icon: '💣', cost: { stone: 25, iron: 20 }, tile: TILES.CANNON, desc: 'Heavy damage' },
    { name: 'Workbench', icon: '🔧', cost: { wood: 15 }, tile: TILES.WORKBENCH, desc: 'Crafting' },
    { name: 'Chest', icon: '📦', cost: { wood: 10 }, tile: TILES.CHEST, desc: 'Storage' },
    { name: 'Bed', icon: '🛏️', cost: { wood: 15 }, tile: TILES.BED, desc: 'Rest & heal' }
];
