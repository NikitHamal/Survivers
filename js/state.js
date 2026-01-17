// ============= GAME STATE =============
let canvas, ctx, minimapCanvas, minimapCtx;
let minimapCacheCanvas, minimapCacheCtx;
let lastMinimapX = -999, lastMinimapY = -999;
let gameState = {
    running: false,
    paused: false,
    initialized: false
};
let chunks = new Map();
let zombies = [];
let projectiles = [];
let particles = [];
let damageNumbers = [];

let accumulator = 0;
let lastFrameTime = 0;
let frameCount = 0;
let fps = 60;
let fpsTimer = 0;

let player = {
    x: 0, y: 0,
    prevX: 0, prevY: 0,
    targetX: 0, targetY: 0,
    health: 100, maxHealth: 100,
    hunger: 100, maxHunger: 100,
    exp: 0, level: 1, expToLevel: 100,
    speed: 4.5, // Tiles per second
    attackCooldown: 0,
    direction: 1, // 0=right, 1=down, 2=left, 3=up
    frame: 0, animTimer: 0,
    isMoving: false,
    hitTimer: 0,
    // Click-to-move pathfinding
    path: null,
    pathIndex: 0,
    moveTarget: null // {x, y} world coords
};

let survivors = [];
let followMode = false;

let buildings = []; // Track all placed structures
let activeChunks = new Set(); // Track which chunks should stay in memory

let resources = { wood: 0, stone: 0, iron: 0, food: 20 };

let dayCount = 1;
let timeOfDay = 0.1; // Start in morning
let isNight = false;
let gameTime = 0;

let camera = { x: 0, y: 0, targetX: 0, targetY: 0, shake: 0 };
let keys = {};
let buildMode = false;
let selectedBuilding = null;
let buildPreviewX = 0, buildPreviewY = 0;

// Seeded random for world gen
let seed = Date.now() % 100000;

// Building Drag State
let isDraggingBuilding = false;
let draggedBuilding = null;
let dragHoverTile = { x: 0, y: 0 };
let mouseDown = false;
let mouseDownTime = 0;
let dragStartTile = { x: 0, y: 0 };

// Input state
let inputState = {
    keys: {},
    keysPressedThisFrame: new Set(),
    keysReleasedThisFrame: new Set()
};

// Global timing state
let timing = {
    lastFrameTime: 0,
    accumulator: 0,
    gameTime: 0,
    frameCount: 0,
    fpsTimer: 0,
    fps: 0,
    lastVisibilityTime: 0
};

// Time-based event accumulators
let eventTimers = {
    hunger: 0,
    survivorFood: 0,
    chunkCleanup: 0,
    zombieSpawn: 0
};
