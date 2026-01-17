// ============================================
// BUILDING UPGRADE SYSTEM - Structure Progression
// ============================================
// Complete building upgrade system with tiers,
// bonuses, visual changes, and special abilities

const BuildingUpgradeSystem = (function () {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        MAX_BUILDING_LEVEL: 5,
        UPGRADE_TIME_BASE: 10,           // Base seconds per upgrade
        UPGRADE_TIME_MULTIPLIER: 1.5,    // Time multiplier per level
        RESOURCE_COST_MULTIPLIER: 2.0,   // Cost multiplier per level
        BONUS_PER_LEVEL: 0.25,           // 25% bonus per level
        REPAIR_COST_RATIO: 0.3,          // Repair cost as ratio of upgrade cost
        ADJACENT_BONUS: 0.1              // Bonus from adjacent same-type buildings
    };

    // ============= BUILDING DEFINITIONS =============
    const BUILDING_TYPES = {
        WALL: {
            id: 'wall',
            name: 'Wall',
            tile: TILES.WALL,
            category: 'defense',
            baseCost: { wood: 10, stone: 5 },
            baseHealth: 100,
            upgrades: [
                {
                    level: 1,
                    name: 'Wooden Wall',
                    health: 100,
                    icon: '🪵',
                    description: 'Basic wooden barrier'
                },
                {
                    level: 2,
                    name: 'Reinforced Wall',
                    health: 200,
                    icon: '🧱',
                    description: 'Stone-reinforced wooden wall',
                    cost: { wood: 15, stone: 20 },
                    bonus: { defense: 1.5 }
                },
                {
                    level: 3,
                    name: 'Stone Wall',
                    health: 350,
                    icon: '🏰',
                    description: 'Solid stone construction',
                    cost: { stone: 40, iron: 10 },
                    bonus: { defense: 2.0 }
                },
                {
                    level: 4,
                    name: 'Fortified Wall',
                    health: 500,
                    icon: '🏯',
                    description: 'Iron-reinforced stone wall',
                    cost: { stone: 60, iron: 30 },
                    bonus: { defense: 2.5, damageReflect: 0.1 }
                },
                {
                    level: 5,
                    name: 'Legendary Wall',
                    health: 800,
                    icon: '⚔️',
                    description: 'Impenetrable fortress wall',
                    cost: { stone: 100, iron: 50, food: 20 },
                    bonus: { defense: 3.0, damageReflect: 0.2, regeneration: 1 },
                    special: 'auto_repair'
                }
            ]
        },

        TOWER: {
            id: 'tower',
            name: 'Guard Tower',
            tile: TILES.TOWER,
            category: 'defense',
            baseCost: { wood: 30, stone: 20, iron: 10 },
            baseHealth: 150,
            baseStats: { damage: 15, range: 8, fireRate: 1.0 },
            upgrades: [
                {
                    level: 1,
                    name: 'Watchtower',
                    health: 150,
                    icon: '🗼',
                    description: 'Basic archer tower',
                    stats: { damage: 15, range: 8, fireRate: 1.0 }
                },
                {
                    level: 2,
                    name: 'Archer Tower',
                    health: 200,
                    icon: '🏹',
                    description: 'Improved range and damage',
                    cost: { wood: 40, stone: 30, iron: 15 },
                    stats: { damage: 22, range: 10, fireRate: 1.2 },
                    bonus: { visionRange: 1.2 }
                },
                {
                    level: 3,
                    name: 'Ballista Tower',
                    health: 300,
                    icon: '🎯',
                    description: 'Fires piercing bolts',
                    cost: { wood: 50, stone: 40, iron: 30 },
                    stats: { damage: 35, range: 12, fireRate: 0.8, piercing: true },
                    bonus: { visionRange: 1.5 }
                },
                {
                    level: 4,
                    name: 'Siege Tower',
                    health: 400,
                    icon: '💥',
                    description: 'Heavy damage, splash effect',
                    cost: { stone: 60, iron: 50, food: 30 },
                    stats: { damage: 50, range: 14, fireRate: 0.6, splash: 2 },
                    bonus: { visionRange: 1.8 }
                },
                {
                    level: 5,
                    name: 'Fortress Spire',
                    health: 600,
                    icon: '⚡',
                    description: 'Lightning strikes enemies',
                    cost: { stone: 100, iron: 80, food: 50 },
                    stats: { damage: 75, range: 16, fireRate: 0.5, chainLightning: 3 },
                    bonus: { visionRange: 2.0, slowEnemies: 0.3 },
                    special: 'lightning_chain'
                }
            ]
        },

        CANNON: {
            id: 'cannon',
            name: 'Cannon',
            tile: TILES.CANNON,
            category: 'defense',
            baseCost: { wood: 20, stone: 30, iron: 25 },
            baseHealth: 120,
            baseStats: { damage: 40, range: 6, fireRate: 0.4, splash: 2 },
            upgrades: [
                {
                    level: 1,
                    name: 'Light Cannon',
                    health: 120,
                    icon: '💣',
                    description: 'Basic explosive cannon',
                    stats: { damage: 40, range: 6, fireRate: 0.4, splash: 2 }
                },
                {
                    level: 2,
                    name: 'Field Cannon',
                    health: 180,
                    icon: '🔫',
                    description: 'Improved firepower',
                    cost: { stone: 40, iron: 35 },
                    stats: { damage: 60, range: 7, fireRate: 0.45, splash: 2.5 }
                },
                {
                    level: 3,
                    name: 'Heavy Cannon',
                    health: 250,
                    icon: '🎆',
                    description: 'Devastating explosions',
                    cost: { stone: 60, iron: 50 },
                    stats: { damage: 90, range: 8, fireRate: 0.35, splash: 3 }
                },
                {
                    level: 4,
                    name: 'Mortar',
                    health: 300,
                    icon: '☄️',
                    description: 'Long range bombardment',
                    cost: { stone: 80, iron: 70 },
                    stats: { damage: 120, range: 12, fireRate: 0.25, splash: 4, arcing: true }
                },
                {
                    level: 5,
                    name: 'Doom Cannon',
                    health: 400,
                    icon: '💀',
                    description: 'Apocalyptic destruction',
                    cost: { stone: 120, iron: 100, food: 50 },
                    stats: { damage: 200, range: 14, fireRate: 0.2, splash: 5, burn: 10 },
                    special: 'napalm'
                }
            ]
        },

        CAMPFIRE: {
            id: 'campfire',
            name: 'Campfire',
            tile: TILES.CAMPFIRE,
            category: 'utility',
            baseCost: { wood: 15 },
            baseHealth: 50,
            baseStats: { lightRadius: 5, warmth: 1, cookSpeed: 1.0 },
            upgrades: [
                {
                    level: 1,
                    name: 'Campfire',
                    health: 50,
                    icon: '🔥',
                    description: 'Basic fire for light and cooking',
                    stats: { lightRadius: 5, warmth: 1, cookSpeed: 1.0 }
                },
                {
                    level: 2,
                    name: 'Bonfire',
                    health: 80,
                    icon: '🔥',
                    description: 'Larger fire, more warmth',
                    cost: { wood: 25, stone: 10 },
                    stats: { lightRadius: 7, warmth: 1.5, cookSpeed: 1.3 },
                    bonus: { zombieRepel: 0.1 }
                },
                {
                    level: 3,
                    name: 'Fire Pit',
                    health: 120,
                    icon: '🏕️',
                    description: 'Stone-lined fire pit',
                    cost: { wood: 30, stone: 30 },
                    stats: { lightRadius: 9, warmth: 2.0, cookSpeed: 1.6 },
                    bonus: { zombieRepel: 0.2, moraleBoost: 5 }
                },
                {
                    level: 4,
                    name: 'Hearth',
                    health: 180,
                    icon: '🏠',
                    description: 'Permanent heating structure',
                    cost: { wood: 40, stone: 50, iron: 15 },
                    stats: { lightRadius: 11, warmth: 2.5, cookSpeed: 2.0 },
                    bonus: { zombieRepel: 0.3, moraleBoost: 10, healthRegen: 0.5 }
                },
                {
                    level: 5,
                    name: 'Eternal Flame',
                    health: 250,
                    icon: '✨',
                    description: 'Mystical fire that never dies',
                    cost: { wood: 50, stone: 70, iron: 30 },
                    stats: { lightRadius: 15, warmth: 3.0, cookSpeed: 2.5 },
                    bonus: { zombieRepel: 0.5, moraleBoost: 20, healthRegen: 1.0, expBonus: 0.1 },
                    special: 'never_extinguish'
                }
            ]
        },

        WORKBENCH: {
            id: 'workbench',
            name: 'Workbench',
            tile: TILES.WORKBENCH,
            category: 'production',
            baseCost: { wood: 25, stone: 10 },
            baseHealth: 80,
            baseStats: { craftSpeed: 1.0, qualityBonus: 0 },
            upgrades: [
                {
                    level: 1,
                    name: 'Workbench',
                    health: 80,
                    icon: '🔧',
                    description: 'Basic crafting station',
                    stats: { craftSpeed: 1.0, qualityBonus: 0 }
                },
                {
                    level: 2,
                    name: 'Improved Workbench',
                    health: 100,
                    icon: '🛠️',
                    description: 'Better tools, faster work',
                    cost: { wood: 30, stone: 20, iron: 10 },
                    stats: { craftSpeed: 1.25, qualityBonus: 0.05 }
                },
                {
                    level: 3,
                    name: 'Workshop',
                    health: 150,
                    icon: '⚙️',
                    description: 'Professional crafting station',
                    cost: { wood: 40, stone: 30, iron: 25 },
                    stats: { craftSpeed: 1.5, qualityBonus: 0.1 },
                    bonus: { unlockRecipes: ['advanced_tools'] }
                },
                {
                    level: 4,
                    name: 'Forge Workshop',
                    health: 200,
                    icon: '🔨',
                    description: 'Industrial-grade crafting',
                    cost: { wood: 50, stone: 50, iron: 40 },
                    stats: { craftSpeed: 1.8, qualityBonus: 0.15 },
                    bonus: { unlockRecipes: ['steel_items'], materialSave: 0.1 }
                },
                {
                    level: 5,
                    name: 'Master Forge',
                    health: 300,
                    icon: '👑',
                    description: 'Legendary crafting capabilities',
                    cost: { wood: 60, stone: 80, iron: 60 },
                    stats: { craftSpeed: 2.5, qualityBonus: 0.25 },
                    bonus: { unlockRecipes: ['legendary_items'], materialSave: 0.2, doubleCraft: 0.1 },
                    special: 'legendary_crafting'
                }
            ]
        },

        BED: {
            id: 'bed',
            name: 'Bed',
            tile: TILES.BED,
            category: 'utility',
            baseCost: { wood: 20 },
            baseHealth: 40,
            baseStats: { restQuality: 1.0, survivorCapacity: 1 },
            upgrades: [
                {
                    level: 1,
                    name: 'Bedroll',
                    health: 40,
                    icon: '🛏️',
                    description: 'Basic sleeping spot',
                    stats: { restQuality: 1.0, survivorCapacity: 1 }
                },
                {
                    level: 2,
                    name: 'Cot',
                    health: 60,
                    icon: '🛏️',
                    description: 'Improved comfort',
                    cost: { wood: 25, iron: 5 },
                    stats: { restQuality: 1.3, survivorCapacity: 1 },
                    bonus: { moraleBoost: 3 }
                },
                {
                    level: 3,
                    name: 'Bunk Bed',
                    health: 100,
                    icon: '🛏️',
                    description: 'Space-efficient sleeping',
                    cost: { wood: 40, iron: 15 },
                    stats: { restQuality: 1.5, survivorCapacity: 2 },
                    bonus: { moraleBoost: 5 }
                },
                {
                    level: 4,
                    name: 'Comfortable Bed',
                    health: 120,
                    icon: '🛌',
                    description: 'Quality rest',
                    cost: { wood: 50, iron: 25, food: 10 },
                    stats: { restQuality: 2.0, survivorCapacity: 2 },
                    bonus: { moraleBoost: 10, healthRegen: 0.5 }
                },
                {
                    level: 5,
                    name: 'Royal Quarters',
                    health: 180,
                    icon: '👸',
                    description: 'Luxurious sleeping arrangements',
                    cost: { wood: 70, iron: 40, food: 30 },
                    stats: { restQuality: 3.0, survivorCapacity: 3 },
                    bonus: { moraleBoost: 20, healthRegen: 1.0, expBonus: 0.05 },
                    special: 'full_restore'
                }
            ]
        },

        CHEST: {
            id: 'chest',
            name: 'Storage',
            tile: TILES.CHEST,
            category: 'production',
            baseCost: { wood: 30, stone: 10 },
            baseHealth: 100,
            baseStats: { capacity: 100 },
            upgrades: [
                {
                    level: 1,
                    name: 'Crate',
                    health: 100,
                    icon: '📦',
                    description: 'Basic storage container',
                    stats: { capacity: 100 }
                },
                {
                    level: 2,
                    name: 'Storage Chest',
                    health: 150,
                    icon: '🗃️',
                    description: 'Organized storage',
                    cost: { wood: 40, iron: 15 },
                    stats: { capacity: 200 },
                    bonus: { resourcePreservation: 0.95 }
                },
                {
                    level: 3,
                    name: 'Warehouse',
                    health: 200,
                    icon: '🏭',
                    description: 'Large storage facility',
                    cost: { wood: 60, stone: 40, iron: 25 },
                    stats: { capacity: 400 },
                    bonus: { resourcePreservation: 0.98 }
                },
                {
                    level: 4,
                    name: 'Vault',
                    health: 300,
                    icon: '🔐',
                    description: 'Secure storage vault',
                    cost: { stone: 80, iron: 50 },
                    stats: { capacity: 700 },
                    bonus: { resourcePreservation: 1.0, protected: true }
                },
                {
                    level: 5,
                    name: 'Treasury',
                    health: 400,
                    icon: '💰',
                    description: 'Legendary storage capacity',
                    cost: { stone: 100, iron: 80 },
                    stats: { capacity: 1200 },
                    bonus: { resourcePreservation: 1.0, protected: true, resourceGeneration: 0.01 },
                    special: 'passive_generation'
                }
            ]
        },

        FARM: {
            id: 'farm',
            name: 'Farm Plot',
            tile: TILES.FARM,
            category: 'production',
            baseCost: { wood: 15, stone: 5 },
            baseHealth: 60,
            baseStats: { foodProduction: 1.0, growthSpeed: 1.0 },
            upgrades: [
                {
                    level: 1,
                    name: 'Garden Plot',
                    health: 60,
                    icon: '🌱',
                    description: 'Basic farming',
                    stats: { foodProduction: 1.0, growthSpeed: 1.0 }
                },
                {
                    level: 2,
                    name: 'Farm Plot',
                    health: 80,
                    icon: '🌿',
                    description: 'Improved farming',
                    cost: { wood: 20, stone: 15 },
                    stats: { foodProduction: 1.5, growthSpeed: 1.2 }
                },
                {
                    level: 3,
                    name: 'Irrigated Farm',
                    health: 120,
                    icon: '🌾',
                    description: 'Watered crops grow faster',
                    cost: { wood: 30, stone: 25, iron: 10 },
                    stats: { foodProduction: 2.0, growthSpeed: 1.5 },
                    bonus: { droughtResistance: true }
                },
                {
                    level: 4,
                    name: 'Greenhouse',
                    health: 150,
                    icon: '🏡',
                    description: 'Protected crop growth',
                    cost: { wood: 50, stone: 40, iron: 25 },
                    stats: { foodProduction: 3.0, growthSpeed: 2.0 },
                    bonus: { droughtResistance: true, weatherProtection: true }
                },
                {
                    level: 5,
                    name: 'Abundant Garden',
                    health: 200,
                    icon: '🌈',
                    description: 'Miraculous crop yields',
                    cost: { wood: 70, stone: 60, iron: 40 },
                    stats: { foodProduction: 5.0, growthSpeed: 3.0 },
                    bonus: { droughtResistance: true, weatherProtection: true, autoHarvest: true },
                    special: 'auto_harvest'
                }
            ]
        },

        HOUSE: {
            id: 'house',
            name: 'House',
            tile: TILES.HOUSE,
            category: 'utility',
            baseCost: { wood: 20, stone: 10 },
            baseHealth: 300,
            baseStats: { survivorCapacity: 2 },
            upgrades: [
                {
                    level: 1,
                    name: 'Small Shack',
                    health: 300,
                    icon: '🛖',
                    description: 'Small shelter for survivors',
                    stats: { survivorCapacity: 2 }
                },
                {
                    level: 2,
                    name: 'Wooden House',
                    health: 450,
                    icon: '🏠',
                    description: 'Solid wooden construction',
                    cost: { wood: 30, stone: 20 },
                    stats: { survivorCapacity: 4 }
                },
                {
                    level: 3,
                    name: 'Stone Cottage',
                    health: 600,
                    icon: '🏡',
                    description: 'Comfortable stone house',
                    cost: { wood: 40, stone: 50, iron: 15 },
                    stats: { survivorCapacity: 6 }
                },
                {
                    level: 4,
                    name: 'Large Estate',
                    health: 800,
                    icon: '🏰',
                    description: 'Ample space for a large team',
                    cost: { stone: 80, iron: 40 },
                    stats: { survivorCapacity: 10 }
                },
                {
                    level: 5,
                    name: 'Survivor Mansion',
                    health: 1200,
                    icon: '🏙️',
                    description: 'The ultimate survivor base',
                    cost: { stone: 150, iron: 100, food: 50 },
                    stats: { survivorCapacity: 20 },
                    special: 'luxury_living'
                }
            ]
        }
    };

    // ============= STATE =============
    let buildingLevels = new Map();       // Building position -> level
    let buildingProgress = new Map();     // Building position -> upgrade progress
    let activeUpgrades = [];              // Currently upgrading buildings

    // ============= BUILDING MANAGEMENT =============
    function getBuildingType(tile) {
        for (const [key, type] of Object.entries(BUILDING_TYPES)) {
            if (type.tile === tile) {
                return type;
            }
        }
        return null;
    }

    function getBuildingLevel(x, y) {
        const key = `${x},${y}`;
        return buildingLevels.get(key) || 1;
    }

    function setBuildingLevel(x, y, level) {
        const key = `${x},${y}`;
        buildingLevels.set(key, Math.min(level, CONFIG.MAX_BUILDING_LEVEL));
    }

    function getBuildingData(x, y) {
        const tile = getTile(x, y);
        const type = getBuildingType(tile);
        if (!type) return null;

        const level = getBuildingLevel(x, y);
        const upgradeData = type.upgrades[level - 1];

        return {
            type: type,
            level: level,
            upgrade: upgradeData,
            maxLevel: type.upgrades.length,
            canUpgrade: level < type.upgrades.length,
            nextUpgrade: level < type.upgrades.length ? type.upgrades[level] : null
        };
    }

    // ============= UPGRADE FUNCTIONS =============
    function canUpgradeBuilding(x, y) {
        const data = getBuildingData(x, y);
        if (!data || !data.canUpgrade) {
            return { canUpgrade: false, reason: 'Already at max level or not a building' };
        }

        const nextUpgrade = data.nextUpgrade;
        if (!nextUpgrade.cost) {
            return { canUpgrade: false, reason: 'No upgrade available' };
        }

        // Check resources
        for (const [resource, amount] of Object.entries(nextUpgrade.cost)) {
            if ((resources[resource] || 0) < amount) {
                return {
                    canUpgrade: false,
                    reason: 'Insufficient resources',
                    missing: { [resource]: amount - (resources[resource] || 0) }
                };
            }
        }

        // Check if already upgrading
        const key = `${x},${y}`;
        if (activeUpgrades.find(u => u.key === key)) {
            return { canUpgrade: false, reason: 'Already upgrading' };
        }

        return { canUpgrade: true };
    }

    function startUpgrade(x, y) {
        const check = canUpgradeBuilding(x, y);
        if (!check.canUpgrade) {
            if (typeof showNotification === 'function') {
                showNotification(
                    `<i class="material-icons">warning</i> Cannot upgrade: ${check.reason}`,
                    []
                );
            }
            return false;
        }

        const data = getBuildingData(x, y);
        const nextUpgrade = data.nextUpgrade;

        // Consume resources
        for (const [resource, amount] of Object.entries(nextUpgrade.cost)) {
            resources[resource] -= amount;
        }

        // Calculate upgrade time
        const upgradeTime = CONFIG.UPGRADE_TIME_BASE *
            Math.pow(CONFIG.UPGRADE_TIME_MULTIPLIER, data.level);

        // Apply crafting speed bonuses
        let timeModifier = 1.0;
        if (typeof SkillSystem !== 'undefined') {
            const engineeringLevel = SkillSystem.getSkillLevel('engineering');
            timeModifier -= engineeringLevel * 0.05;
        }

        const key = `${x},${y}`;
        activeUpgrades.push({
            key: key,
            x: x,
            y: y,
            buildingType: data.type,
            currentLevel: data.level,
            targetLevel: data.level + 1,
            progress: 0,
            totalTime: upgradeTime * Math.max(0.3, timeModifier),
            startTime: Date.now()
        });

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">construction</i> Upgrading ${data.type.name} to Level ${data.level + 1}...`,
                []
            );
        }

        return true;
    }

    function cancelUpgrade(x, y) {
        const key = `${x},${y}`;
        const upgradeIndex = activeUpgrades.findIndex(u => u.key === key);

        if (upgradeIndex === -1) return false;

        const upgrade = activeUpgrades[upgradeIndex];
        const data = getBuildingData(x, y);
        const nextUpgrade = data?.nextUpgrade;

        // Refund 50% of resources
        if (nextUpgrade?.cost) {
            for (const [resource, amount] of Object.entries(nextUpgrade.cost)) {
                resources[resource] += Math.floor(amount * 0.5);
            }
        }

        activeUpgrades.splice(upgradeIndex, 1);

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">cancel</i> Upgrade cancelled. 50% resources refunded.`,
                []
            );
        }

        return true;
    }

    function updateUpgrades(dt) {
        activeUpgrades = activeUpgrades.filter(upgrade => {
            upgrade.progress += dt;

            if (upgrade.progress >= upgrade.totalTime) {
                completeUpgrade(upgrade);
                return false;
            }

            return true;
        });
    }

    function completeUpgrade(upgrade) {
        setBuildingLevel(upgrade.x, upgrade.y, upgrade.targetLevel);

        const type = upgrade.buildingType;
        const newLevel = type.upgrades[upgrade.targetLevel - 1];

        // Update building in buildings array
        const building = buildings.find(b => b.x === upgrade.x && b.y === upgrade.y);
        if (building) {
            building.level = upgrade.targetLevel;
            building.maxHealth = newLevel.health;
            building.health = newLevel.health;
        }

        // Apply special effects
        if (newLevel.special) {
            applySpecialEffect(upgrade.x, upgrade.y, newLevel.special);
        }

        // Award XP
        if (typeof SkillSystem !== 'undefined') {
            SkillSystem.addSkillXP('engineering', upgrade.targetLevel * 20);
        }

        // Track stats
        if (window.gameStats) {
            window.gameStats.buildingsUpgraded = (window.gameStats.buildingsUpgraded || 0) + 1;
        }

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">upgrade</i> ${type.name} upgraded to ${newLevel.name}!`,
                []
            );
        }

        if (typeof spawnParticles === 'function') {
            spawnParticles(upgrade.x, upgrade.y, '#ffd700', 20);
        }
    }

    // ============= SPECIAL EFFECTS =============
    function applySpecialEffect(x, y, special) {
        switch (special) {
            case 'auto_repair':
                // Walls slowly regenerate health
                // Handled in update loop
                break;

            case 'lightning_chain':
                // Towers can chain lightning
                // Handled in tower attack logic
                break;

            case 'napalm':
                // Cannons leave burning ground
                // Handled in projectile logic
                break;

            case 'never_extinguish':
                // Campfire never goes out
                // Handled in weather/time logic
                break;

            case 'legendary_crafting':
                // Unlock legendary recipes
                if (typeof CraftingSystem !== 'undefined') {
                    // Would unlock legendary recipes here
                }
                break;

            case 'full_restore':
                // Sleeping fully restores health
                // Handled in sleep logic
                break;

            case 'passive_generation':
                // Storage generates resources
                // Handled in update loop
                break;

            case 'auto_harvest':
                // Farms auto-harvest when ready
                // Handled in farm logic
                break;
        }
    }

    // ============= STAT CALCULATIONS =============
    function getBuildingStats(x, y) {
        const data = getBuildingData(x, y);
        if (!data) return null;

        const upgrade = data.upgrade;
        const baseStats = { ...upgrade.stats };

        // Apply adjacent building bonuses
        const adjacentBonus = calculateAdjacentBonus(x, y, data.type);
        for (const stat of Object.keys(baseStats)) {
            if (typeof baseStats[stat] === 'number') {
                baseStats[stat] *= (1 + adjacentBonus);
            }
        }

        // Apply bonuses from upgrade
        if (upgrade.bonus) {
            for (const [key, value] of Object.entries(upgrade.bonus)) {
                if (!baseStats[key]) {
                    baseStats[key] = value;
                } else if (typeof value === 'number') {
                    baseStats[key] += value;
                }
            }
        }

        return baseStats;
    }

    function calculateAdjacentBonus(x, y, buildingType) {
        let bonus = 0;
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (const [dx, dy] of directions) {
            const neighborTile = getTile(x + dx, y + dy);
            if (neighborTile === buildingType.tile) {
                bonus += CONFIG.ADJACENT_BONUS;
            }
        }

        return bonus;
    }

    function getTowerStats(x, y) {
        const stats = getBuildingStats(x, y);
        if (!stats) {
            // Return default stats
            return { damage: 15, range: 8, fireRate: 1.0 };
        }
        return stats;
    }

    function getCannonStats(x, y) {
        const stats = getBuildingStats(x, y);
        if (!stats) {
            return { damage: 40, range: 6, fireRate: 0.4, splash: 2 };
        }
        return stats;
    }

    // ============= REPAIR SYSTEM =============
    function canRepairBuilding(x, y) {
        const building = buildings.find(b => b.x === x && b.y === y);
        if (!building) return { canRepair: false, reason: 'No building found' };

        if (building.health >= building.maxHealth) {
            return { canRepair: false, reason: 'Building is at full health' };
        }

        const repairCost = calculateRepairCost(x, y);

        for (const [resource, amount] of Object.entries(repairCost)) {
            if ((resources[resource] || 0) < amount) {
                return {
                    canRepair: false,
                    reason: 'Insufficient resources',
                    cost: repairCost
                };
            }
        }

        return { canRepair: true, cost: repairCost };
    }

    function calculateRepairCost(x, y) {
        const building = buildings.find(b => b.x === x && b.y === y);
        const data = getBuildingData(x, y);
        if (!building || !data) return {};

        const missingHealth = building.maxHealth - building.health;
        const repairRatio = missingHealth / building.maxHealth;

        const baseCost = data.type.baseCost;
        const cost = {};

        for (const [resource, amount] of Object.entries(baseCost)) {
            cost[resource] = Math.ceil(amount * repairRatio * CONFIG.REPAIR_COST_RATIO * data.level);
        }

        return cost;
    }

    function repairBuilding(x, y) {
        const check = canRepairBuilding(x, y);
        if (!check.canRepair) {
            if (typeof showNotification === 'function') {
                showNotification(
                    `<i class="material-icons">warning</i> Cannot repair: ${check.reason}`,
                    []
                );
            }
            return false;
        }

        // Consume resources
        for (const [resource, amount] of Object.entries(check.cost)) {
            resources[resource] -= amount;
        }

        // Repair building
        const building = buildings.find(b => b.x === x && b.y === y);
        building.health = building.maxHealth;

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">build</i> Building repaired!`,
                []
            );
        }

        return true;
    }

    // ============= PASSIVE UPDATES =============
    function update(dt) {
        // Update active upgrades
        updateUpgrades(dt);

        // Refresh UI if dialog is open
        if (selectedBuildingPos) updateUI();

        // Process special building effects
        for (const building of buildings) {
            const data = getBuildingData(building.x, building.y);
            if (!data) continue;

            const upgrade = data.upgrade;
            if (!upgrade?.special) continue;

            switch (upgrade.special) {
                case 'auto_repair':
                    // Slowly regenerate wall health
                    if (building.health < building.maxHealth) {
                        building.health = Math.min(
                            building.maxHealth,
                            building.health + (upgrade.bonus?.regeneration || 1) * dt
                        );
                    }
                    break;

                case 'passive_generation':
                    // Generate small amounts of resources
                    const genRate = upgrade.bonus?.resourceGeneration || 0.01;
                    resources.wood += genRate * dt;
                    resources.stone += genRate * 0.5 * dt;
                    break;
            }
        }
    }

    // ============= UI HELPERS =============
    function getUpgradeProgress(x, y) {
        const key = `${x},${y}`;
        const upgrade = activeUpgrades.find(u => u.key === key);
        if (!upgrade) return null;

        return {
            progress: upgrade.progress,
            totalTime: upgrade.totalTime,
            percent: (upgrade.progress / upgrade.totalTime) * 100,
            remaining: upgrade.totalTime - upgrade.progress,
            targetLevel: upgrade.targetLevel
        };
    }

    function showUpgradeUI(x, y) {
        const data = getBuildingData(x, y);
        if (!data) return;

        const building = buildings.find(b => b.x === x && b.y === y);
        const upgradeProgress = getUpgradeProgress(x, y);

        let content = `
            <strong>${data.upgrade.icon} ${data.upgrade.name}</strong><br>
            <small>Level ${data.level}/${data.maxLevel}</small><br>
            <small>Health: ${Math.floor(building?.health || 0)}/${data.upgrade.health}</small>
        `;

        if (upgradeProgress) {
            content += `<br><small>Upgrading: ${Math.floor(upgradeProgress.percent)}%</small>`;
        }

        const buttons = [];

        if (data.canUpgrade && !upgradeProgress) {
            const nextUpgrade = data.nextUpgrade;
            const costStr = Object.entries(nextUpgrade.cost)
                .map(([r, a]) => `${r}: ${a}`)
                .join(', ');

            buttons.push({
                text: `Upgrade (${costStr})`,
                action: () => startUpgrade(x, y),
                class: 'accept'
            });
        }

        if (upgradeProgress) {
            buttons.push({
                text: 'Cancel Upgrade',
                action: () => cancelUpgrade(x, y),
                class: 'reject'
            });
        }

        const repairCheck = canRepairBuilding(x, y);
        if (repairCheck.canRepair) {
            const costStr = Object.entries(repairCheck.cost)
                .map(([r, a]) => `${r}: ${a}`)
                .join(', ');
            buttons.push({
                text: `Repair (${costStr})`,
                action: () => repairBuilding(x, y),
                class: 'accept'
            });
        }

        if (typeof showNotification === 'function') {
            showNotification(content, buttons);
        }
    }

    // ============= UI HELPERS =============
    let selectedBuildingPos = null; // {x, y}

    function getUpgradeProgress(x, y) {
        const key = `${x},${y}`;
        const upgrade = activeUpgrades.find(u => u.key === key);
        if (!upgrade) return null;

        return {
            progress: upgrade.progress,
            totalTime: upgrade.totalTime,
            percent: (upgrade.progress / upgrade.totalTime) * 100,
            remaining: Math.max(0, upgrade.totalTime - upgrade.progress),
            targetLevel: upgrade.targetLevel
        };
    }

    function showUpgradeUI(x, y) {
        selectedBuildingPos = { x, y };
        updateUI();

        const dialog = document.getElementById('upgradeDialog');
        if (dialog) {
            dialog.style.display = 'block';
        }
    }

    function closeUpgradeUI() {
        selectedBuildingPos = null;
        const dialog = document.getElementById('upgradeDialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
    }

    function updateUI() {
        if (!selectedBuildingPos) return;

        const { x, y } = selectedBuildingPos;
        const data = getBuildingData(x, y);

        // If building is gone or invalid, close UI
        if (!data) {
            closeUpgradeUI();
            return;
        }

        const building = buildings.find(b => b.x === x && b.y === y);
        const upgradeProgress = getUpgradeProgress(x, y);

        // Update Content
        const contentEl = document.getElementById('upgradeContent');
        if (contentEl) {
            let html = `
                ${data.upgrade.icon} <strong>${data.upgrade.name}</strong>
                <div>Level ${data.level} / ${data.maxLevel}</div>
                <div>Health: ${Math.floor(building?.health || 0)} / ${data.upgrade.health}</div>
            `;

            if (data.upgrade.description) {
                html += `<div style="font-style: italic; margin-top: 5px; color: #aaa;">${data.upgrade.description}</div>`;
            }

            // Show stats
            if (data.upgrade.stats) {
                html += `<div style="margin-top: 10px; font-size: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">`;
                for (const [key, val] of Object.entries(data.upgrade.stats)) {
                    html += `<div style="text-align: left;"><span style="color:#888;">${key}:</span> <span style="color:#eee;">${val}</span></div>`;
                }
                html += `</div>`;
            }

            contentEl.innerHTML = html;
        }

        // Update Progress Bar
        const progressContainer = document.getElementById('upgradeProgressBarContainer');
        const progressFill = document.getElementById('upgradeProgressFill');
        const timeLeft = document.getElementById('upgradeTimeLeft');

        if (upgradeProgress && progressContainer) {
            progressContainer.style.display = 'block';
            if (progressFill) progressFill.style.width = `${upgradeProgress.percent}%`;
            if (timeLeft) timeLeft.textContent = `${upgradeProgress.remaining.toFixed(1)}s`;
        } else if (progressContainer) {
            progressContainer.style.display = 'none';
        }

        // Update Buttons (only if not upgrading, or if cancel is needed)
        const actionsEl = document.getElementById('upgradeActions');
        if (actionsEl) {
            // Rebuild buttons only if needed (simplified: always rebuild for reactive state usually, 
            // but for performance we might check. For now, rebuild is safe for this scale).
            actionsEl.innerHTML = ''; // Clear

            if (data.canUpgrade && !upgradeProgress) {
                const nextUpgrade = data.nextUpgrade;
                const costStr = Object.entries(nextUpgrade.cost)
                    .map(([r, a]) => `${a} ${r}`) // swapped for reading "10 wood"
                    .join(', ');

                const btn = document.createElement('button');
                btn.className = 'upgrade-btn accept';
                btn.innerHTML = `<i class="material-icons">arrow_upward</i> Upgrade <span style="font-size: 11px; opacity: 0.8;">(${costStr})</span>`;
                btn.onclick = () => {
                    startUpgrade(x, y);
                    updateUI(); // Refresh immediately
                };
                actionsEl.appendChild(btn);
            }

            if (upgradeProgress) {
                const btn = document.createElement('button');
                btn.className = 'upgrade-btn reject';
                btn.innerHTML = `<i class="material-icons">cancel</i> Cancel`;
                btn.onclick = () => {
                    cancelUpgrade(x, y);
                    updateUI();
                };
                actionsEl.appendChild(btn);
            }

            const repairCheck = canRepairBuilding(x, y);
            if (repairCheck.canRepair && !upgradeProgress) {
                const costStr = Object.entries(repairCheck.cost)
                    .map(([r, a]) => `${a} ${r}`)
                    .join(', ');

                const btn = document.createElement('button');
                btn.className = 'upgrade-btn accept';
                btn.innerHTML = `<i class="material-icons">build</i> Repair <div style="font-size: 10px;">(${costStr})</div>`;
                btn.onclick = () => {
                    repairBuilding(x, y);
                    updateUI();
                };
                actionsEl.appendChild(btn);
            }
        }
    }

    // ============= BUILDING MOVEMENT =============
    function moveBuilding(oldX, oldY, newX, newY) {
        const oldKey = `${oldX},${oldY}`;
        const level = buildingLevels.get(oldKey);

        // Move level data
        if (level) {
            buildingLevels.delete(oldKey);
            setBuildingLevel(newX, newY, level);
        }

        // Update active upgrade if any
        const upgrade = activeUpgrades.find(u => u.key === oldKey);
        if (upgrade) {
            upgrade.x = newX;
            upgrade.y = newY;
            upgrade.key = `${newX},${newY}`;
        }

        // Ensure the new building object in the world tracking has the correct level
        const newBuilding = buildings.find(b => b.x === newX && b.y === newY);
        if (newBuilding && level) {
            newBuilding.level = level;
        }

        // If UI was open for this building, update position
        if (selectedBuildingPos && selectedBuildingPos.x === oldX && selectedBuildingPos.y === oldY) {
            selectedBuildingPos = { x: newX, y: newY };
            updateUI();
        }
    }

    // ============= SERIALIZATION =============
    function getState() {
        return {
            buildingLevels: Array.from(buildingLevels.entries()),
            activeUpgrades: activeUpgrades.map(u => ({
                key: u.key,
                x: u.x,
                y: u.y,
                currentLevel: u.currentLevel,
                targetLevel: u.targetLevel,
                progress: u.progress,
                totalTime: u.totalTime
            }))
        };
    }

    function setState(state) {
        if (!state) return;

        buildingLevels = new Map(state.buildingLevels || []);

        activeUpgrades = (state.activeUpgrades || []).map(u => {
            const tile = getTile(u.x, u.y);
            // If tile is floor (moved?), try to find building in buildings array? 
            // For now assume tile type is correct or persisted elsewhere.
            // Actually getTile might be just data. 
            // We need to re-link the type.
            const building = buildings.find(b => b.x === u.x && b.y === u.y);
            // Best effort to find type from buildings array or tile
            let type = null;
            if (building) {
                // get type from tile at location
                const t = getTile(u.x, u.y);
                type = getBuildingType(t);
            }

            // Fallback if needed, but safe to assume it works if world loaded first
            if (!type) {
                // Try to guess from active upgrade data if we stored it? We didn't.
                // We re-derive from world.
                const t = getTile(u.x, u.y);
                type = getBuildingType(t);
            }

            return {
                ...u,
                buildingType: type,
                startTime: Date.now() // Reset start time reference for smoothness if needed, but progress is saved
            };
        }).filter(u => u.buildingType);
    }

    // ============= PUBLIC API =============
    return {
        // Constants
        BUILDING_TYPES,
        CONFIG,

        // Queries
        getBuildingType,
        getBuildingLevel,
        getBuildingData,
        getBuildingStats,
        getTowerStats,
        getCannonStats,
        getActiveUpgrades: () => activeUpgrades, // Exposed for renderer

        // Upgrades
        canUpgradeBuilding,
        startUpgrade,
        cancelUpgrade,
        getUpgradeProgress,

        // Repair
        canRepairBuilding,
        calculateRepairCost,
        repairBuilding,

        // Movement
        moveBuilding,

        // Updates
        update,

        // UI
        showUpgradeUI,
        closeUpgradeUI,
        updateUI,

        // State
        getState,
        setState,
        setBuildingLevel
    };
})();

// Export globally
window.BuildingUpgradeSystem = BuildingUpgradeSystem;
