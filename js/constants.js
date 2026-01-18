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
    // New buildings
    ARMORY: 19, HOSPITAL: 20, BREWERY: 21, WELL: 22,
    STABLE: 23, MINE: 24, BARRICADE: 25, WATCHTOWER: 26,
    STORAGE: 27, ALTAR: 28, FORGE: 29, GARDEN: 30
};

const ROLES = ['None', 'Builder', 'Soldier', 'Guard', 'Farmer', 'Woodcutter', 'Miner', 'Hunter', 'Medic'];

const BUILDINGS = [
    // Tier 1 - Basic structures
    { name: 'Wall', icon: '🧱', cost: { wood: 5 }, tile: TILES.WALL, desc: 'Block zombies', tier: 1 },
    { name: 'Floor', icon: '🟫', cost: { wood: 2 }, tile: TILES.FLOOR, desc: 'Walkable floor', tier: 1 },
    { name: 'Barricade', icon: '🪵', cost: { wood: 3 }, tile: TILES.BARRICADE, desc: 'Quick defense', tier: 1 },
    { name: 'Campfire', icon: '🔥', cost: { wood: 5, stone: 3 }, tile: TILES.CAMPFIRE, desc: 'Heal nearby', tier: 1 },

    // Tier 2 - Essential buildings
    { name: 'Spikes', icon: '🌵', cost: { wood: 8, stone: 2 }, tile: TILES.SPIKES, desc: 'Damages zombies', tier: 2 },
    { name: 'Farm', icon: '🌾', cost: { wood: 10 }, tile: TILES.FARM, desc: 'Produces food', tier: 2 },
    { name: 'Well', icon: '🪣', cost: { stone: 15 }, tile: TILES.WELL, desc: 'Water source +10% crops', tier: 2 },
    { name: 'Workbench', icon: '🔧', cost: { wood: 15 }, tile: TILES.WORKBENCH, desc: 'Crafting station', tier: 2 },
    { name: 'Chest', icon: '📦', cost: { wood: 10 }, tile: TILES.CHEST, desc: 'Storage +50 items', tier: 2 },

    // Tier 3 - Advanced structures
    { name: 'House', icon: '🏠', cost: { wood: 20, stone: 10 }, tile: TILES.HOUSE, desc: '+2 survivor cap', tier: 3 },
    { name: 'Bed', icon: '🛏️', cost: { wood: 15 }, tile: TILES.BED, desc: 'Rest & heal faster', tier: 3 },
    { name: 'Storage', icon: '🏪', cost: { wood: 25, stone: 5 }, tile: TILES.STORAGE, desc: '+200 item capacity', tier: 3 },
    { name: 'Garden', icon: '🌻', cost: { wood: 8, food: 5 }, tile: TILES.GARDEN, desc: 'Flowers boost morale', tier: 3 },
    { name: 'Watchtower', icon: '🔭', cost: { wood: 25, stone: 10 }, tile: TILES.WATCHTOWER, desc: 'Extended vision', tier: 3 },

    // Tier 4 - Military & production
    { name: 'Tower', icon: '🗼', cost: { wood: 30, stone: 20, iron: 10 }, tile: TILES.TOWER, desc: 'Auto-attacks', tier: 4 },
    { name: 'Cannon', icon: '💣', cost: { stone: 25, iron: 20 }, tile: TILES.CANNON, desc: 'Heavy damage', tier: 4 },
    { name: 'Armory', icon: '⚔️', cost: { wood: 20, iron: 25 }, tile: TILES.ARMORY, desc: 'Equip survivors', tier: 4 },
    { name: 'Forge', icon: '🔨', cost: { stone: 30, iron: 15 }, tile: TILES.FORGE, desc: 'Smelt iron +50%', tier: 4 },
    { name: 'Mine', icon: '⛏️', cost: { wood: 20, stone: 25 }, tile: TILES.MINE, desc: 'Auto-mine stone', tier: 4 },

    // Tier 5 - Specialized
    { name: 'Hospital', icon: '🏥', cost: { wood: 30, stone: 20, iron: 10 }, tile: TILES.HOSPITAL, desc: 'Heals +3/sec', tier: 5 },
    { name: 'Brewery', icon: '🍺', cost: { wood: 25, food: 20 }, tile: TILES.BREWERY, desc: 'Boost survivor stats', tier: 5 },
    { name: 'Stable', icon: '🐴', cost: { wood: 35, food: 15 }, tile: TILES.STABLE, desc: 'Tame & store pets', tier: 5 },
    { name: 'Altar', icon: '⛩️', cost: { stone: 40, iron: 20 }, tile: TILES.ALTAR, desc: 'Mystical bonuses', tier: 5 }
];
