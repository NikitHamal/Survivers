// ============================================
// ADVANCED CRAFTING SYSTEM
// ============================================
// Complete crafting system with recipes, workbench upgrades,
// research unlocks, and quality modifiers

const CraftingSystem = (function() {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        BASE_CRAFT_TIME: 1.0,
        QUALITY_VARIATION: 0.2,
        WORKBENCH_SPEED_BONUS: 0.25,
        FORGE_SPEED_BONUS: 0.4,
        RESEARCH_POINTS_PER_LEVEL: 1
    };

    // ============= RECIPE CATEGORIES =============
    const CATEGORIES = {
        WEAPONS: 'weapons',
        ARMOR: 'armor',
        TOOLS: 'tools',
        CONSUMABLES: 'consumables',
        BUILDINGS: 'buildings',
        SPECIAL: 'special'
    };

    // ============= CRAFTING STATIONS =============
    const STATIONS = {
        NONE: { id: 'none', name: 'Handcraft', icon: '✋', speedMultiplier: 1.0 },
        WORKBENCH: { id: 'workbench', name: 'Workbench', icon: '🔧', speedMultiplier: 1.5, tile: TILES.WORKBENCH },
        FORGE: { id: 'forge', name: 'Forge', icon: '🔥', speedMultiplier: 2.0, tile: 'FORGE' },
        ALCHEMY: { id: 'alchemy', name: 'Alchemy Lab', icon: '⚗️', speedMultiplier: 1.8, tile: 'ALCHEMY' }
    };

    // ============= COMPLETE RECIPE DATABASE =============
    const RECIPES = {
        // === WEAPONS ===
        wooden_sword: {
            id: 'wooden_sword',
            name: 'Wooden Sword',
            category: CATEGORIES.WEAPONS,
            station: STATIONS.NONE.id,
            materials: { wood: 10 },
            craftTime: 2.0,
            output: { itemId: 'wooden_sword', quantity: 1 },
            unlocked: true,
            description: 'A basic wooden blade'
        },
        stone_sword: {
            id: 'stone_sword',
            name: 'Stone Sword',
            category: CATEGORIES.WEAPONS,
            station: STATIONS.WORKBENCH.id,
            materials: { stone: 15, wood: 5 },
            craftTime: 3.0,
            output: { itemId: 'stone_sword', quantity: 1 },
            unlocked: true,
            description: 'A sturdy stone blade'
        },
        iron_sword: {
            id: 'iron_sword',
            name: 'Iron Sword',
            category: CATEGORIES.WEAPONS,
            station: STATIONS.WORKBENCH.id,
            materials: { iron: 20, wood: 8 },
            craftTime: 5.0,
            output: { itemId: 'iron_sword', quantity: 1 },
            unlocked: false,
            researchRequired: 'metallurgy_1',
            description: 'A sharp iron blade'
        },
        steel_sword: {
            id: 'steel_sword',
            name: 'Steel Sword',
            category: CATEGORIES.WEAPONS,
            station: STATIONS.FORGE.id,
            materials: { iron: 35, stone: 15, wood: 10 },
            craftTime: 8.0,
            output: { itemId: 'steel_sword', quantity: 1 },
            unlocked: false,
            researchRequired: 'metallurgy_2',
            description: 'A refined steel blade'
        },
        flame_blade: {
            id: 'flame_blade',
            name: 'Flame Blade',
            category: CATEGORIES.WEAPONS,
            station: STATIONS.FORGE.id,
            materials: { iron: 50, stone: 30, wood: 20 },
            craftTime: 15.0,
            output: { itemId: 'flame_blade', quantity: 1 },
            unlocked: false,
            researchRequired: 'elemental_weapons',
            description: 'A blade engulfed in flame'
        },
        bow: {
            id: 'bow',
            name: 'Wooden Bow',
            category: CATEGORIES.WEAPONS,
            station: STATIONS.WORKBENCH.id,
            materials: { wood: 15, iron: 2 },
            craftTime: 4.0,
            output: { itemId: 'bow', quantity: 1 },
            unlocked: true,
            description: 'A ranged weapon'
        },
        crossbow: {
            id: 'crossbow',
            name: 'Crossbow',
            category: CATEGORIES.WEAPONS,
            station: STATIONS.WORKBENCH.id,
            materials: { wood: 20, iron: 25, stone: 10 },
            craftTime: 8.0,
            output: { itemId: 'crossbow', quantity: 1 },
            unlocked: false,
            researchRequired: 'advanced_ranged',
            description: 'A powerful crossbow'
        },
        arrows: {
            id: 'arrows',
            name: 'Arrows (x10)',
            category: CATEGORIES.WEAPONS,
            station: STATIONS.NONE.id,
            materials: { wood: 5, stone: 2 },
            craftTime: 1.5,
            output: { itemId: 'arrows', quantity: 10 },
            unlocked: true,
            description: 'Ammunition for bows'
        },

        // === ARMOR ===
        leather_cap: {
            id: 'leather_cap',
            name: 'Leather Cap',
            category: CATEGORIES.ARMOR,
            station: STATIONS.NONE.id,
            materials: { wood: 5 },
            craftTime: 2.0,
            output: { itemId: 'leather_cap', quantity: 1 },
            unlocked: true,
            description: 'Basic head protection'
        },
        leather_vest: {
            id: 'leather_vest',
            name: 'Leather Vest',
            category: CATEGORIES.ARMOR,
            station: STATIONS.NONE.id,
            materials: { wood: 8 },
            craftTime: 3.0,
            output: { itemId: 'leather_vest', quantity: 1 },
            unlocked: true,
            description: 'Basic torso protection'
        },
        leather_pants: {
            id: 'leather_pants',
            name: 'Leather Pants',
            category: CATEGORIES.ARMOR,
            station: STATIONS.NONE.id,
            materials: { wood: 6 },
            craftTime: 2.5,
            output: { itemId: 'leather_pants', quantity: 1 },
            unlocked: true,
            description: 'Basic leg protection'
        },
        iron_helmet: {
            id: 'iron_helmet',
            name: 'Iron Helmet',
            category: CATEGORIES.ARMOR,
            station: STATIONS.WORKBENCH.id,
            materials: { iron: 15 },
            craftTime: 5.0,
            output: { itemId: 'iron_helmet', quantity: 1 },
            unlocked: false,
            researchRequired: 'armor_smithing_1',
            description: 'Solid iron head protection'
        },
        iron_chestplate: {
            id: 'iron_chestplate',
            name: 'Iron Chestplate',
            category: CATEGORIES.ARMOR,
            station: STATIONS.WORKBENCH.id,
            materials: { iron: 25 },
            craftTime: 7.0,
            output: { itemId: 'iron_chestplate', quantity: 1 },
            unlocked: false,
            researchRequired: 'armor_smithing_1',
            description: 'Sturdy iron protection'
        },
        iron_greaves: {
            id: 'iron_greaves',
            name: 'Iron Greaves',
            category: CATEGORIES.ARMOR,
            station: STATIONS.WORKBENCH.id,
            materials: { iron: 18 },
            craftTime: 5.0,
            output: { itemId: 'iron_greaves', quantity: 1 },
            unlocked: false,
            researchRequired: 'armor_smithing_1',
            description: 'Solid iron leg protection'
        },
        steel_helmet: {
            id: 'steel_helmet',
            name: 'Steel Helmet',
            category: CATEGORIES.ARMOR,
            station: STATIONS.FORGE.id,
            materials: { iron: 30, stone: 10 },
            craftTime: 10.0,
            output: { itemId: 'steel_helmet', quantity: 1 },
            unlocked: false,
            researchRequired: 'armor_smithing_2',
            description: 'Superior head protection'
        },
        steel_chestplate: {
            id: 'steel_chestplate',
            name: 'Steel Chestplate',
            category: CATEGORIES.ARMOR,
            station: STATIONS.FORGE.id,
            materials: { iron: 45, stone: 20 },
            craftTime: 12.0,
            output: { itemId: 'steel_chestplate', quantity: 1 },
            unlocked: false,
            researchRequired: 'armor_smithing_2',
            description: 'Heavy steel protection'
        },
        hunters_ring: {
            id: 'hunters_ring',
            name: "Hunter's Ring",
            category: CATEGORIES.ARMOR,
            station: STATIONS.WORKBENCH.id,
            materials: { iron: 10, stone: 5 },
            craftTime: 4.0,
            output: { itemId: 'hunters_ring', quantity: 1 },
            unlocked: false,
            researchRequired: 'jewelcrafting',
            description: 'Increases critical hit chance'
        },
        vitality_amulet: {
            id: 'vitality_amulet',
            name: 'Vitality Amulet',
            category: CATEGORIES.ARMOR,
            station: STATIONS.WORKBENCH.id,
            materials: { iron: 20, stone: 15 },
            craftTime: 6.0,
            output: { itemId: 'vitality_amulet', quantity: 1 },
            unlocked: false,
            researchRequired: 'jewelcrafting',
            description: 'Boosts health and regen'
        },

        // === TOOLS ===
        wooden_pickaxe: {
            id: 'wooden_pickaxe',
            name: 'Wooden Pickaxe',
            category: CATEGORIES.TOOLS,
            station: STATIONS.NONE.id,
            materials: { wood: 8 },
            craftTime: 2.0,
            output: { itemId: 'wooden_pickaxe', quantity: 1 },
            unlocked: true,
            description: 'Basic mining tool'
        },
        iron_pickaxe: {
            id: 'iron_pickaxe',
            name: 'Iron Pickaxe',
            category: CATEGORIES.TOOLS,
            station: STATIONS.WORKBENCH.id,
            materials: { iron: 15, wood: 5 },
            craftTime: 4.0,
            output: { itemId: 'iron_pickaxe', quantity: 1 },
            unlocked: false,
            researchRequired: 'metallurgy_1',
            description: 'Efficient mining tool'
        },
        wooden_axe: {
            id: 'wooden_axe',
            name: 'Wooden Axe',
            category: CATEGORIES.TOOLS,
            station: STATIONS.NONE.id,
            materials: { wood: 10 },
            craftTime: 2.0,
            output: { itemId: 'wooden_axe', quantity: 1 },
            unlocked: true,
            description: 'Basic woodcutting tool'
        },
        iron_axe: {
            id: 'iron_axe',
            name: 'Iron Axe',
            category: CATEGORIES.TOOLS,
            station: STATIONS.WORKBENCH.id,
            materials: { iron: 18, wood: 8 },
            craftTime: 4.0,
            output: { itemId: 'iron_axe', quantity: 1 },
            unlocked: false,
            researchRequired: 'metallurgy_1',
            description: 'Efficient woodcutting tool'
        },
        torch: {
            id: 'torch',
            name: 'Torch (x5)',
            category: CATEGORIES.TOOLS,
            station: STATIONS.NONE.id,
            materials: { wood: 5 },
            craftTime: 1.0,
            output: { itemId: 'torch', quantity: 5 },
            unlocked: true,
            description: 'Provides light in darkness'
        },

        // === CONSUMABLES ===
        health_potion: {
            id: 'health_potion',
            name: 'Health Potion',
            category: CATEGORIES.CONSUMABLES,
            station: STATIONS.NONE.id,
            materials: { food: 5, wood: 2 },
            craftTime: 2.0,
            output: { itemId: 'health_potion', quantity: 1 },
            unlocked: true,
            description: 'Restores health'
        },
        greater_health_potion: {
            id: 'greater_health_potion',
            name: 'Greater Health Potion',
            category: CATEGORIES.CONSUMABLES,
            station: STATIONS.ALCHEMY.id,
            materials: { food: 15, iron: 5 },
            craftTime: 4.0,
            output: { itemId: 'greater_health_potion', quantity: 1 },
            unlocked: false,
            researchRequired: 'alchemy_1',
            description: 'Restores more health'
        },
        stamina_elixir: {
            id: 'stamina_elixir',
            name: 'Stamina Elixir',
            category: CATEGORIES.CONSUMABLES,
            station: STATIONS.ALCHEMY.id,
            materials: { food: 10, stone: 5 },
            craftTime: 3.0,
            output: { itemId: 'stamina_elixir', quantity: 1 },
            unlocked: false,
            researchRequired: 'alchemy_1',
            description: 'Increases movement speed'
        },
        rage_potion: {
            id: 'rage_potion',
            name: 'Rage Potion',
            category: CATEGORIES.CONSUMABLES,
            station: STATIONS.ALCHEMY.id,
            materials: { food: 20, iron: 10 },
            craftTime: 6.0,
            output: { itemId: 'rage_potion', quantity: 1 },
            unlocked: false,
            researchRequired: 'alchemy_2',
            description: 'Massively increases damage'
        },
        antidote: {
            id: 'antidote',
            name: 'Antidote',
            category: CATEGORIES.CONSUMABLES,
            station: STATIONS.NONE.id,
            materials: { food: 8, wood: 3 },
            craftTime: 2.5,
            output: { itemId: 'antidote', quantity: 1 },
            unlocked: true,
            description: 'Cures poison'
        },
        bandage: {
            id: 'bandage',
            name: 'Bandages (x3)',
            category: CATEGORIES.CONSUMABLES,
            station: STATIONS.NONE.id,
            materials: { wood: 3 },
            craftTime: 1.0,
            output: { itemId: 'bandage', quantity: 3 },
            unlocked: true,
            description: 'Stops bleeding, minor heal'
        },
        cooked_meat: {
            id: 'cooked_meat',
            name: 'Cooked Meat',
            category: CATEGORIES.CONSUMABLES,
            station: STATIONS.NONE.id,
            materials: { food: 2 },
            craftTime: 1.5,
            requirements: { nearCampfire: true },
            output: { itemId: 'cooked_meat', quantity: 1 },
            unlocked: true,
            description: 'Restores hunger efficiently'
        },

        // === SPECIAL ITEMS ===
        survivor_beacon: {
            id: 'survivor_beacon',
            name: 'Survivor Beacon',
            category: CATEGORIES.SPECIAL,
            station: STATIONS.WORKBENCH.id,
            materials: { iron: 30, stone: 20, wood: 15 },
            craftTime: 10.0,
            output: { itemId: 'survivor_beacon', quantity: 1 },
            unlocked: false,
            researchRequired: 'communication',
            description: 'Attracts nearby survivors'
        },
        zombie_repellent: {
            id: 'zombie_repellent',
            name: 'Zombie Repellent',
            category: CATEGORIES.SPECIAL,
            station: STATIONS.ALCHEMY.id,
            materials: { food: 25, iron: 15, stone: 10 },
            craftTime: 8.0,
            output: { itemId: 'zombie_repellent', quantity: 1 },
            unlocked: false,
            researchRequired: 'alchemy_2',
            description: 'Keeps zombies away temporarily'
        }
    };

    // ============= RESEARCH/TECH TREE =============
    const RESEARCH = {
        metallurgy_1: {
            id: 'metallurgy_1',
            name: 'Basic Metallurgy',
            description: 'Learn to work with iron',
            cost: { iron: 30, stone: 20 },
            researchTime: 60,
            prerequisites: [],
            unlocks: ['iron_sword', 'iron_pickaxe', 'iron_axe']
        },
        metallurgy_2: {
            id: 'metallurgy_2',
            name: 'Advanced Metallurgy',
            description: 'Master steel crafting',
            cost: { iron: 80, stone: 50 },
            researchTime: 120,
            prerequisites: ['metallurgy_1'],
            unlocks: ['steel_sword']
        },
        armor_smithing_1: {
            id: 'armor_smithing_1',
            name: 'Armor Smithing',
            description: 'Craft iron armor',
            cost: { iron: 40, stone: 20 },
            researchTime: 80,
            prerequisites: ['metallurgy_1'],
            unlocks: ['iron_helmet', 'iron_chestplate', 'iron_greaves']
        },
        armor_smithing_2: {
            id: 'armor_smithing_2',
            name: 'Advanced Armor',
            description: 'Craft steel armor',
            cost: { iron: 100, stone: 60 },
            researchTime: 150,
            prerequisites: ['armor_smithing_1', 'metallurgy_2'],
            unlocks: ['steel_helmet', 'steel_chestplate']
        },
        alchemy_1: {
            id: 'alchemy_1',
            name: 'Basic Alchemy',
            description: 'Create potions and elixirs',
            cost: { food: 50, iron: 20 },
            researchTime: 60,
            prerequisites: [],
            unlocks: ['greater_health_potion', 'stamina_elixir']
        },
        alchemy_2: {
            id: 'alchemy_2',
            name: 'Advanced Alchemy',
            description: 'Create powerful concoctions',
            cost: { food: 100, iron: 50, stone: 30 },
            researchTime: 120,
            prerequisites: ['alchemy_1'],
            unlocks: ['rage_potion', 'zombie_repellent']
        },
        advanced_ranged: {
            id: 'advanced_ranged',
            name: 'Advanced Ranged Weapons',
            description: 'Craft crossbows and advanced ammunition',
            cost: { wood: 50, iron: 40 },
            researchTime: 90,
            prerequisites: [],
            unlocks: ['crossbow']
        },
        jewelcrafting: {
            id: 'jewelcrafting',
            name: 'Jewelcrafting',
            description: 'Create rings and amulets',
            cost: { iron: 50, stone: 40 },
            researchTime: 100,
            prerequisites: ['metallurgy_1'],
            unlocks: ['hunters_ring', 'vitality_amulet']
        },
        elemental_weapons: {
            id: 'elemental_weapons',
            name: 'Elemental Weapons',
            description: 'Infuse weapons with elemental power',
            cost: { iron: 120, stone: 80, wood: 40 },
            researchTime: 180,
            prerequisites: ['metallurgy_2'],
            unlocks: ['flame_blade']
        },
        communication: {
            id: 'communication',
            name: 'Communication Systems',
            description: 'Build devices to contact survivors',
            cost: { iron: 60, stone: 40, wood: 30 },
            researchTime: 100,
            prerequisites: [],
            unlocks: ['survivor_beacon']
        }
    };

    // ============= STATE =============
    let unlockedResearch = new Set();
    let currentCraft = null;
    let craftQueue = [];
    let activeStation = null;

    // ============= CRAFTING FUNCTIONS =============
    function canCraft(recipeId) {
        const recipe = RECIPES[recipeId];
        if (!recipe) return { canCraft: false, reason: 'Recipe not found' };

        // Check if unlocked
        if (!recipe.unlocked && recipe.researchRequired && !unlockedResearch.has(recipe.researchRequired)) {
            return { canCraft: false, reason: 'Research required', research: recipe.researchRequired };
        }

        // Check materials
        for (const [resource, amount] of Object.entries(recipe.materials)) {
            if ((resources[resource] || 0) < amount) {
                return { canCraft: false, reason: 'Insufficient materials', missing: { [resource]: amount - (resources[resource] || 0) } };
            }
        }

        // Check station requirement
        if (recipe.station !== STATIONS.NONE.id && !isNearStation(recipe.station)) {
            return { canCraft: false, reason: 'Requires crafting station', station: recipe.station };
        }

        // Check special requirements
        if (recipe.requirements) {
            if (recipe.requirements.nearCampfire && !isNearCampfire()) {
                return { canCraft: false, reason: 'Must be near campfire' };
            }
        }

        return { canCraft: true };
    }

    function startCraft(recipeId, quantity = 1) {
        const check = canCraft(recipeId);
        if (!check.canCraft) {
            if (typeof showNotification === 'function') {
                showNotification(
                    `<i class="material-icons">warning</i> Cannot craft: ${check.reason}`,
                    []
                );
            }
            return false;
        }

        const recipe = RECIPES[recipeId];

        // Consume materials
        for (const [resource, amount] of Object.entries(recipe.materials)) {
            resources[resource] -= amount * quantity;
        }

        // Calculate craft time with modifiers
        const station = getStationData(recipe.station);
        let craftTime = recipe.craftTime * quantity;
        craftTime /= station.speedMultiplier;

        // Apply skill bonuses if available
        if (typeof SkillSystem !== 'undefined') {
            const craftingSkill = SkillSystem.getSkillLevel('crafting');
            craftTime *= (1 - craftingSkill * 0.05);
        }

        currentCraft = {
            recipeId,
            recipe,
            quantity,
            progress: 0,
            totalTime: craftTime,
            startTime: Date.now()
        };

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">build</i> Crafting ${recipe.name}...`,
                []
            );
        }

        return true;
    }

    function updateCrafting(dt) {
        if (!currentCraft) return;

        currentCraft.progress += dt;

        if (currentCraft.progress >= currentCraft.totalTime) {
            completeCraft();
        }
    }

    function completeCraft() {
        if (!currentCraft) return;

        const recipe = currentCraft.recipe;
        const quantity = currentCraft.quantity;

        // Create output items
        if (typeof EquipmentSystem !== 'undefined' && EquipmentSystem.ITEMS[recipe.output.itemId]) {
            // Create equipment/consumable item
            const item = EquipmentSystem.createItem(recipe.output.itemId, recipe.output.quantity * quantity);
            if (item) {
                // Apply quality modifier based on skill
                if (typeof SkillSystem !== 'undefined') {
                    const craftingSkill = SkillSystem.getSkillLevel('crafting');
                    const qualityBonus = Math.random() * CONFIG.QUALITY_VARIATION * craftingSkill;
                    if (item.stats) {
                        for (const stat of Object.keys(item.stats)) {
                            if (typeof item.stats[stat] === 'number') {
                                item.stats[stat] *= (1 + qualityBonus);
                            }
                        }
                    }
                }

                EquipmentSystem.addToInventory(item);
            }
        } else {
            // Resource output or special handling
            if (recipe.output.resource) {
                resources[recipe.output.resource] = (resources[recipe.output.resource] || 0) +
                    recipe.output.quantity * quantity;
            }
        }

        // Award crafting XP
        if (typeof SkillSystem !== 'undefined') {
            SkillSystem.addSkillXP('crafting', recipe.craftTime * 10 * quantity);
        }

        // Track statistics
        if (window.gameStats) {
            window.gameStats.itemsCrafted = (window.gameStats.itemsCrafted || 0) + quantity;
        }

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">check_circle</i> Crafted ${recipe.name} x${quantity}!`,
                []
            );
        }

        // Visual feedback
        if (typeof spawnParticles === 'function') {
            spawnParticles(player.x, player.y, '#ffd700', 10);
        }

        currentCraft = null;

        // Process queue if exists
        if (craftQueue.length > 0) {
            const next = craftQueue.shift();
            startCraft(next.recipeId, next.quantity);
        }
    }

    function cancelCraft() {
        if (!currentCraft) return false;

        // Refund half materials
        const recipe = currentCraft.recipe;
        for (const [resource, amount] of Object.entries(recipe.materials)) {
            resources[resource] += Math.floor(amount * currentCraft.quantity * 0.5);
        }

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">cancel</i> Crafting cancelled. 50% materials refunded.`,
                []
            );
        }

        currentCraft = null;
        return true;
    }

    function queueCraft(recipeId, quantity = 1) {
        if (currentCraft) {
            craftQueue.push({ recipeId, quantity });
            if (typeof showNotification === 'function') {
                showNotification(
                    `<i class="material-icons">queue</i> Added to craft queue`,
                    []
                );
            }
            return true;
        }
        return startCraft(recipeId, quantity);
    }

    // ============= RESEARCH FUNCTIONS =============
    function canResearch(researchId) {
        const research = RESEARCH[researchId];
        if (!research) return { canResearch: false, reason: 'Research not found' };

        // Check if already unlocked
        if (unlockedResearch.has(researchId)) {
            return { canResearch: false, reason: 'Already researched' };
        }

        // Check prerequisites
        for (const prereq of research.prerequisites) {
            if (!unlockedResearch.has(prereq)) {
                return { canResearch: false, reason: 'Prerequisites not met', missing: prereq };
            }
        }

        // Check cost
        for (const [resource, amount] of Object.entries(research.cost)) {
            if ((resources[resource] || 0) < amount) {
                return { canResearch: false, reason: 'Insufficient resources' };
            }
        }

        return { canResearch: true };
    }

    function startResearch(researchId) {
        const check = canResearch(researchId);
        if (!check.canResearch) {
            if (typeof showNotification === 'function') {
                showNotification(
                    `<i class="material-icons">warning</i> Cannot research: ${check.reason}`,
                    []
                );
            }
            return false;
        }

        const research = RESEARCH[researchId];

        // Consume resources
        for (const [resource, amount] of Object.entries(research.cost)) {
            resources[resource] -= amount;
        }

        // Unlock research and recipes
        unlockedResearch.add(researchId);

        for (const recipeId of research.unlocks) {
            if (RECIPES[recipeId]) {
                RECIPES[recipeId].unlocked = true;
            }
        }

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">science</i> Researched: ${research.name}!`,
                []
            );
        }

        // Visual feedback
        if (typeof spawnParticles === 'function') {
            spawnParticles(player.x, player.y, '#00ffff', 15);
        }

        return true;
    }

    function getResearchProgress() {
        const total = Object.keys(RESEARCH).length;
        const unlocked = unlockedResearch.size;
        return { unlocked, total, percent: (unlocked / total) * 100 };
    }

    // ============= STATION HELPERS =============
    function isNearStation(stationId) {
        if (stationId === STATIONS.NONE.id) return true;

        const station = Object.values(STATIONS).find(s => s.id === stationId);
        if (!station || !station.tile) return false;

        // Check nearby tiles
        const checkRadius = 2;
        for (let dy = -checkRadius; dy <= checkRadius; dy++) {
            for (let dx = -checkRadius; dx <= checkRadius; dx++) {
                const tile = getTile(Math.floor(player.x) + dx, Math.floor(player.y) + dy);
                if (tile === station.tile || tile === TILES.WORKBENCH) {
                    return true;
                }
            }
        }

        return false;
    }

    function isNearCampfire() {
        const checkRadius = 2;
        for (let dy = -checkRadius; dy <= checkRadius; dy++) {
            for (let dx = -checkRadius; dx <= checkRadius; dx++) {
                const tile = getTile(Math.floor(player.x) + dx, Math.floor(player.y) + dy);
                if (tile === TILES.CAMPFIRE) {
                    return true;
                }
            }
        }
        return false;
    }

    function getStationData(stationId) {
        return Object.values(STATIONS).find(s => s.id === stationId) || STATIONS.NONE;
    }

    function setActiveStation(stationId) {
        activeStation = stationId;
    }

    // ============= UI FUNCTIONS =============
    function getAvailableRecipes(category = null) {
        return Object.values(RECIPES).filter(recipe => {
            if (category && recipe.category !== category) return false;

            // Show if unlocked or if prerequisites can be seen
            if (recipe.unlocked) return true;
            if (!recipe.researchRequired) return true;

            // Check if research prerequisites are met
            const research = RESEARCH[recipe.researchRequired];
            if (!research) return false;

            // Show locked recipes if prerequisites are partially met
            return research.prerequisites.every(p => unlockedResearch.has(p)) ||
                   research.prerequisites.length === 0;
        });
    }

    function getRecipeDetails(recipeId) {
        const recipe = RECIPES[recipeId];
        if (!recipe) return null;

        const check = canCraft(recipeId);
        const station = getStationData(recipe.station);

        return {
            ...recipe,
            station,
            canCraft: check.canCraft,
            craftReason: check.reason,
            materialStatus: Object.entries(recipe.materials).map(([resource, amount]) => ({
                resource,
                required: amount,
                available: resources[resource] || 0,
                sufficient: (resources[resource] || 0) >= amount
            }))
        };
    }

    function getCraftProgress() {
        if (!currentCraft) return null;

        return {
            recipe: currentCraft.recipe,
            progress: currentCraft.progress,
            totalTime: currentCraft.totalTime,
            percent: (currentCraft.progress / currentCraft.totalTime) * 100,
            remaining: currentCraft.totalTime - currentCraft.progress
        };
    }

    function openCraftingUI(stationId = STATIONS.NONE.id) {
        setActiveStation(stationId);
        // This would trigger the UI to open - implementation depends on UI system
        updateCraftingUI();
    }

    function updateCraftingUI() {
        const container = document.getElementById('craftingGrid');
        if (!container) return;

        container.innerHTML = '';

        const recipes = getAvailableRecipes();
        const categories = [...new Set(recipes.map(r => r.category))];

        for (const category of categories) {
            const categoryRecipes = recipes.filter(r => r.category === category);

            const categoryHeader = document.createElement('h4');
            categoryHeader.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categoryHeader.className = 'craft-category-header';
            container.appendChild(categoryHeader);

            for (const recipe of categoryRecipes) {
                const details = getRecipeDetails(recipe.id);
                const slot = document.createElement('div');
                slot.className = `craft-slot ${details.canCraft ? 'available' : 'unavailable'}`;

                slot.innerHTML = `
                    <div class="craft-icon">${recipe.output?.icon || '?'}</div>
                    <div class="craft-name">${recipe.name}</div>
                    <div class="craft-materials">
                        ${Object.entries(recipe.materials).map(([res, amt]) =>
                            `<span class="${(resources[res] || 0) >= amt ? 'sufficient' : 'insufficient'}">${res}: ${amt}</span>`
                        ).join(' ')}
                    </div>
                    ${!recipe.unlocked ? '<div class="locked-overlay">🔒</div>' : ''}
                `;

                slot.title = recipe.description;

                if (details.canCraft) {
                    slot.onclick = () => startCraft(recipe.id);
                }

                container.appendChild(slot);
            }
        }
    }

    // ============= SERIALIZATION =============
    function getState() {
        return {
            unlockedResearch: Array.from(unlockedResearch),
            currentCraft: currentCraft ? {
                recipeId: currentCraft.recipeId,
                quantity: currentCraft.quantity,
                progress: currentCraft.progress
            } : null,
            craftQueue: craftQueue.map(q => ({ recipeId: q.recipeId, quantity: q.quantity }))
        };
    }

    function setState(state) {
        if (!state) return;

        unlockedResearch = new Set(state.unlockedResearch || []);

        // Re-unlock recipes
        for (const researchId of unlockedResearch) {
            const research = RESEARCH[researchId];
            if (research) {
                for (const recipeId of research.unlocks) {
                    if (RECIPES[recipeId]) {
                        RECIPES[recipeId].unlocked = true;
                    }
                }
            }
        }

        craftQueue = state.craftQueue || [];

        if (state.currentCraft) {
            currentCraft = {
                recipeId: state.currentCraft.recipeId,
                recipe: RECIPES[state.currentCraft.recipeId],
                quantity: state.currentCraft.quantity,
                progress: state.currentCraft.progress,
                totalTime: RECIPES[state.currentCraft.recipeId]?.craftTime * state.currentCraft.quantity || 5
            };
        }
    }

    // ============= PUBLIC API =============
    return {
        // Constants
        RECIPES,
        RESEARCH,
        CATEGORIES,
        STATIONS,

        // Crafting
        canCraft,
        startCraft,
        queueCraft,
        cancelCraft,
        updateCrafting,
        getCraftProgress,

        // Research
        canResearch,
        startResearch,
        getResearchProgress,
        isResearchUnlocked: (id) => unlockedResearch.has(id),

        // Stations
        isNearStation,
        isNearCampfire,
        setActiveStation,
        getActiveStation: () => activeStation,

        // UI
        getAvailableRecipes,
        getRecipeDetails,
        openCraftingUI,
        updateCraftingUI,

        // State
        getState,
        setState,

        // Config
        CONFIG
    };
})();

// Export globally
window.CraftingSystem = CraftingSystem;
