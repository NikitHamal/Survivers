// ============= GAME STATE =============
let canvas, ctx, minimapCanvas, minimapCtx;
let gameRunning = false;
let gamePaused = false;
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
    targetX: 0, targetY: 0,
    health: 100, maxHealth: 100,
    hunger: 100, maxHunger: 100,
    exp: 0, level: 1, expToLevel: 100,
    speed: 3.5, // Tiles per second - FIXED SPEED
    attackCooldown: 0,
    direction: 1, // 0=right, 1=down, 2=left, 3=up
    frame: 0, animTimer: 0,
    isMoving: false,
    hitTimer: 0
};

let survivors = [];
let followMode = false;

let resources = { wood: 0, stone: 0, iron: 0, food: 20 };

let dayCount = 1;
let timeOfDay = 0.1; // Start in morning
let isNight = false;
let gameTime = 0;

let camera = { x: 0, y: 0, targetX: 0, targetY: 0 };
let keys = {};
let buildMode = false;
let selectedBuilding = null;
let buildPreviewX = 0, buildPreviewY = 0;

let towerCooldowns = new Map();

// Seeded random for world gen
let seed = Date.now() % 100000;
