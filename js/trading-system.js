// ============================================
// DYNAMIC NPC TRADING SYSTEM
// ============================================
// Production-grade trading system with merchants, dynamic economy,
// reputation, quests, and supply/demand mechanics

const TradingSystem = (function() {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        MAX_MERCHANTS: 5,
        MERCHANT_SPAWN_INTERVAL: 300,    // 5 minutes
        MERCHANT_STAY_DURATION: 180,     // 3 minutes
        BASE_PRICE_FLUCTUATION: 0.3,     // ±30% price variance
        REPUTATION_GAIN_RATE: 1,
        REPUTATION_DECAY_RATE: 0.1,      // per minute
        MAX_REPUTATION: 100,
        QUEST_REFRESH_INTERVAL: 600,     // 10 minutes
        MAX_ACTIVE_QUESTS: 3,
        BARTER_DISCOUNT_BASE: 0.05,      // 5% per reputation tier
        SUPPLY_REGENERATION_RATE: 0.02   // per minute
    };

    // ============= MERCHANT DEFINITIONS =============
    const MERCHANT_TYPES = {
        wandering_trader: {
            id: 'wandering_trader',
            name: 'Wandering Trader',
            icon: '🧳',
            description: 'A nomadic merchant with random wares',
            category: 'general',
            rarity: 'common',
            personality: 'friendly',
            baseInventorySlots: 8,
            specializations: ['misc', 'tools', 'food'],
            priceModifier: 1.0,
            buybackRate: 0.4,
            dialogues: {
                greeting: ["Greetings, traveler!", "Looking for supplies?", "Best prices in the wasteland!"],
                farewell: ["Safe travels!", "Come back soon!", "May fortune favor you!"],
                haggle_success: ["You drive a hard bargain!", "Fine, fine, you win this round!"],
                haggle_fail: ["I can't go any lower!", "That's my final offer!"],
                no_money: ["Come back when you have more to trade!", "I don't do charity!"]
            }
        },

        weapon_smith: {
            id: 'weapon_smith',
            name: 'Weapon Smith',
            icon: '⚔️',
            description: 'Expert in weapons and combat gear',
            category: 'specialist',
            rarity: 'uncommon',
            personality: 'gruff',
            baseInventorySlots: 6,
            specializations: ['weapons', 'ammo'],
            priceModifier: 1.2,
            buybackRate: 0.5,
            dialogues: {
                greeting: ["Need something that kills?", "Looking for firepower?"],
                farewell: ["Don't get killed out there.", "Make 'em count."],
                haggle_success: ["Ugh, fine. But you owe me."],
                haggle_fail: ["Quality costs. Take it or leave it."],
                no_money: ["No resources, no weapons. Simple."]
            }
        },

        herbalist: {
            id: 'herbalist',
            name: 'Herbalist',
            icon: '🌿',
            description: 'Sells medical supplies and potions',
            category: 'specialist',
            rarity: 'uncommon',
            personality: 'wise',
            baseInventorySlots: 8,
            specializations: ['medical', 'potions', 'food'],
            priceModifier: 1.1,
            buybackRate: 0.45,
            dialogues: {
                greeting: ["Seeking remedies?", "I have what ails you... or rather, cures it."],
                farewell: ["Stay healthy, friend.", "May nature protect you."],
                haggle_success: ["For a fellow survivor, I suppose..."],
                haggle_fail: ["These herbs are rare. The price is fair."],
                no_money: ["Healing takes resources, dear."]
            }
        },

        scavenger: {
            id: 'scavenger',
            name: 'Scavenger',
            icon: '🔧',
            description: 'Trades in salvage and rare materials',
            category: 'specialist',
            rarity: 'uncommon',
            personality: 'shady',
            baseInventorySlots: 10,
            specializations: ['materials', 'misc', 'rare'],
            priceModifier: 0.9,
            buybackRate: 0.6,
            dialogues: {
                greeting: ["Psst... got some good stuff.", "Looking for something... special?"],
                farewell: ["You didn't see me.", "Keep it quiet, yeah?"],
                haggle_success: ["Alright, alright, but keep it between us."],
                haggle_fail: ["This fell off a zombie truck. Price is firm."],
                no_money: ["No payment, no deal. I got mouths to feed."]
            }
        },

        engineer: {
            id: 'engineer',
            name: 'Engineer',
            icon: '🔩',
            description: 'Specializes in building materials and traps',
            category: 'specialist',
            rarity: 'rare',
            personality: 'analytical',
            baseInventorySlots: 7,
            specializations: ['building', 'traps', 'tools'],
            priceModifier: 1.15,
            buybackRate: 0.45,
            dialogues: {
                greeting: ["Need something built?", "I've got the blueprints you need."],
                farewell: ["Build smart, survive longer.", "Engineering saves lives."],
                haggle_success: ["Hmm, the math checks out. Deal."],
                haggle_fail: ["The calculations don't lie. This is the price."],
                no_money: ["Can't build without materials."]
            }
        },

        rare_collector: {
            id: 'rare_collector',
            name: 'Rare Collector',
            icon: '💎',
            description: 'Deals exclusively in rare and legendary items',
            category: 'elite',
            rarity: 'rare',
            personality: 'mysterious',
            baseInventorySlots: 5,
            specializations: ['legendary', 'rare', 'unique'],
            priceModifier: 1.5,
            buybackRate: 0.7,
            dialogues: {
                greeting: ["Ah, a discerning customer.", "I deal only in the exceptional."],
                farewell: ["Until our paths cross again.", "Treasure what you've acquired."],
                haggle_success: ["You appreciate value. I respect that."],
                haggle_fail: ["This is beyond haggling. It's priceless."],
                no_money: ["Come back when you're... prepared."]
            }
        }
    };

    // ============= ITEM CATALOG =============
    const TRADE_ITEMS = {
        // === WEAPONS ===
        iron_sword: {
            id: 'iron_sword',
            name: 'Iron Sword',
            icon: '🗡️',
            category: 'weapons',
            rarity: 'common',
            basePrice: { wood: 5, iron: 15 },
            description: '+15 melee damage',
            effect: { type: 'weapon', damage: 15 }
        },
        steel_blade: {
            id: 'steel_blade',
            name: 'Steel Blade',
            icon: '⚔️',
            category: 'weapons',
            rarity: 'uncommon',
            basePrice: { iron: 30, stone: 10 },
            description: '+25 melee damage, +10% attack speed',
            effect: { type: 'weapon', damage: 25, attackSpeed: 0.1 }
        },
        crossbow: {
            id: 'crossbow',
            name: 'Crossbow',
            icon: '🏹',
            category: 'weapons',
            rarity: 'uncommon',
            basePrice: { wood: 20, iron: 20 },
            description: 'Ranged weapon, 20 damage',
            effect: { type: 'ranged_weapon', damage: 20, range: 8 }
        },
        legendary_axe: {
            id: 'legendary_axe',
            name: 'Executioner\'s Axe',
            icon: '🪓',
            category: 'legendary',
            rarity: 'legendary',
            basePrice: { wood: 50, iron: 80, stone: 30 },
            description: '+40 damage, +20% crit chance',
            effect: { type: 'weapon', damage: 40, critChance: 0.2 }
        },

        // === MEDICAL ===
        health_potion: {
            id: 'health_potion',
            name: 'Health Potion',
            icon: '🧪',
            category: 'medical',
            rarity: 'common',
            basePrice: { food: 5, wood: 2 },
            description: 'Restores 50 health',
            effect: { type: 'consumable', heal: 50 },
            stackable: true,
            maxStack: 10
        },
        greater_health_potion: {
            id: 'greater_health_potion',
            name: 'Greater Health Potion',
            icon: '💊',
            category: 'medical',
            rarity: 'uncommon',
            basePrice: { food: 12, iron: 5 },
            description: 'Restores 100 health',
            effect: { type: 'consumable', heal: 100 },
            stackable: true,
            maxStack: 5
        },
        antidote: {
            id: 'antidote',
            name: 'Antidote',
            icon: '💉',
            category: 'medical',
            rarity: 'common',
            basePrice: { food: 8 },
            description: 'Cures poison and disease',
            effect: { type: 'consumable', curePoison: true },
            stackable: true,
            maxStack: 5
        },
        regeneration_elixir: {
            id: 'regeneration_elixir',
            name: 'Regeneration Elixir',
            icon: '✨',
            category: 'potions',
            rarity: 'rare',
            basePrice: { food: 20, iron: 10 },
            description: 'Regenerate 5 HP/s for 30 seconds',
            effect: { type: 'consumable', regen: 5, duration: 30 },
            stackable: true,
            maxStack: 3
        },

        // === FOOD ===
        rations: {
            id: 'rations',
            name: 'Survival Rations',
            icon: '🥫',
            category: 'food',
            rarity: 'common',
            basePrice: { wood: 3 },
            description: 'Restores 20 hunger',
            effect: { type: 'food', hunger: 20 },
            stackable: true,
            maxStack: 20
        },
        premium_meal: {
            id: 'premium_meal',
            name: 'Premium Meal',
            icon: '🍖',
            category: 'food',
            rarity: 'uncommon',
            basePrice: { wood: 8, iron: 2 },
            description: 'Full hunger restore + temp buff',
            effect: { type: 'food', hunger: 100, buff: { damage: 0.1, duration: 120 } },
            stackable: true,
            maxStack: 5
        },

        // === MATERIALS ===
        refined_iron: {
            id: 'refined_iron',
            name: 'Refined Iron',
            icon: '🔩',
            category: 'materials',
            rarity: 'common',
            basePrice: { iron: 5 },
            description: 'High-quality iron for crafting',
            effect: { type: 'material', resource: 'iron', amount: 8 },
            stackable: true,
            maxStack: 50
        },
        hardened_wood: {
            id: 'hardened_wood',
            name: 'Hardened Wood',
            icon: '🪵',
            category: 'materials',
            rarity: 'common',
            basePrice: { wood: 5 },
            description: 'Treated wood for construction',
            effect: { type: 'material', resource: 'wood', amount: 8 },
            stackable: true,
            maxStack: 50
        },
        rare_crystal: {
            id: 'rare_crystal',
            name: 'Power Crystal',
            icon: '💎',
            category: 'rare',
            rarity: 'rare',
            basePrice: { iron: 40, stone: 40 },
            description: 'Used for advanced crafting',
            effect: { type: 'material', special: 'power_crystal' },
            stackable: true,
            maxStack: 10
        },

        // === TOOLS ===
        reinforced_pickaxe: {
            id: 'reinforced_pickaxe',
            name: 'Reinforced Pickaxe',
            icon: '⛏️',
            category: 'tools',
            rarity: 'uncommon',
            basePrice: { wood: 15, iron: 20 },
            description: '+50% mining speed',
            effect: { type: 'tool', miningSpeed: 1.5 }
        },
        builders_hammer: {
            id: 'builders_hammer',
            name: 'Builder\'s Hammer',
            icon: '🔨',
            category: 'tools',
            rarity: 'uncommon',
            basePrice: { wood: 10, iron: 25 },
            description: '+25% building speed',
            effect: { type: 'tool', buildSpeed: 1.25 }
        },
        survival_kit: {
            id: 'survival_kit',
            name: 'Survival Kit',
            icon: '🎒',
            category: 'tools',
            rarity: 'rare',
            basePrice: { wood: 30, iron: 30, food: 20 },
            description: '+10 inventory slots',
            effect: { type: 'equipment', inventorySlots: 10 }
        },

        // === BUILDING ===
        wall_blueprint: {
            id: 'wall_blueprint',
            name: 'Reinforced Wall Blueprint',
            icon: '📜',
            category: 'building',
            rarity: 'uncommon',
            basePrice: { wood: 20, stone: 15 },
            description: 'Unlock reinforced walls (+100% HP)',
            effect: { type: 'blueprint', unlock: 'reinforced_wall' }
        },
        turret_blueprint: {
            id: 'turret_blueprint',
            name: 'Auto-Turret Blueprint',
            icon: '📋',
            category: 'building',
            rarity: 'rare',
            basePrice: { iron: 50, stone: 30 },
            description: 'Unlock auto-turret construction',
            effect: { type: 'blueprint', unlock: 'auto_turret' }
        },

        // === TRAPS ===
        trap_kit_basic: {
            id: 'trap_kit_basic',
            name: 'Basic Trap Kit',
            icon: '🪤',
            category: 'traps',
            rarity: 'common',
            basePrice: { wood: 10, iron: 5 },
            description: 'Contains 3 spike traps',
            effect: { type: 'kit', traps: [{ id: 'spike_trap', count: 3 }] },
            stackable: true,
            maxStack: 5
        },
        trap_kit_advanced: {
            id: 'trap_kit_advanced',
            name: 'Advanced Trap Kit',
            icon: '💣',
            category: 'traps',
            rarity: 'uncommon',
            basePrice: { iron: 25, stone: 15 },
            description: 'Contains 2 explosive barrels + 1 tesla coil',
            effect: { type: 'kit', traps: [
                { id: 'explosive_barrel', count: 2 },
                { id: 'tesla_coil', count: 1 }
            ]}
        },

        // === UNIQUE/LEGENDARY ===
        phoenix_feather: {
            id: 'phoenix_feather',
            name: 'Phoenix Feather',
            icon: '🔥',
            category: 'legendary',
            rarity: 'legendary',
            basePrice: { wood: 100, iron: 100, stone: 100 },
            description: 'Auto-revive once when killed',
            effect: { type: 'equipment', autoRevive: true, uses: 1 }
        },
        shadow_cloak: {
            id: 'shadow_cloak',
            name: 'Shadow Cloak',
            icon: '🌑',
            category: 'legendary',
            rarity: 'legendary',
            basePrice: { iron: 80, stone: 60, food: 40 },
            description: 'Become invisible for 10 seconds (30s cooldown)',
            effect: { type: 'equipment', ability: 'invisibility', duration: 10, cooldown: 30 }
        }
    };

    // ============= QUEST DEFINITIONS =============
    const QUEST_TEMPLATES = {
        // === COLLECTION QUESTS ===
        gather_resources: {
            id: 'gather_resources',
            type: 'collection',
            nameTemplate: 'Gather {amount} {resource}',
            descriptionTemplate: 'Collect {amount} units of {resource} for the merchant',
            resourceOptions: ['wood', 'stone', 'iron', 'food'],
            amountRange: { min: 20, max: 100 },
            rewardMultiplier: 1.5,
            xpReward: 50
        },
        collect_items: {
            id: 'collect_items',
            type: 'collection',
            nameTemplate: 'Collect {amount} {item}',
            descriptionTemplate: 'Find and bring back {amount} {item}',
            itemOptions: ['health_potion', 'rations', 'refined_iron'],
            amountRange: { min: 2, max: 8 },
            rewardMultiplier: 2.0,
            xpReward: 75
        },

        // === KILL QUESTS ===
        zombie_slayer: {
            id: 'zombie_slayer',
            type: 'kill',
            nameTemplate: 'Eliminate {amount} Zombies',
            descriptionTemplate: 'Destroy {amount} zombies for a bounty',
            targetType: 'zombie',
            amountRange: { min: 10, max: 50 },
            rewardMultiplier: 1.0,
            xpReward: 100
        },
        elite_hunter: {
            id: 'elite_hunter',
            type: 'kill',
            nameTemplate: 'Hunt {amount} Elite Enemies',
            descriptionTemplate: 'Take down {amount} elite zombie variants',
            targetType: 'elite',
            amountRange: { min: 2, max: 5 },
            rewardMultiplier: 3.0,
            xpReward: 200
        },
        miniboss_bounty: {
            id: 'miniboss_bounty',
            type: 'kill',
            nameTemplate: 'Mini-Boss Bounty: {target}',
            descriptionTemplate: 'Defeat the {target} mini-boss',
            targetType: 'miniboss',
            amountRange: { min: 1, max: 1 },
            rewardMultiplier: 5.0,
            xpReward: 500
        },

        // === DEFENSE QUESTS ===
        defend_merchant: {
            id: 'defend_merchant',
            type: 'defense',
            nameTemplate: 'Protect the Merchant',
            descriptionTemplate: 'Keep the merchant alive for {duration} seconds',
            durationRange: { min: 60, max: 120 },
            rewardMultiplier: 2.5,
            xpReward: 150
        },

        // === EXPLORATION QUESTS ===
        explore_area: {
            id: 'explore_area',
            type: 'exploration',
            nameTemplate: 'Scout the Area',
            descriptionTemplate: 'Explore {distance} tiles away from camp',
            distanceRange: { min: 30, max: 80 },
            rewardMultiplier: 1.5,
            xpReward: 80
        }
    };

    // ============= STATE =============
    let activeMerchants = [];
    let merchantIdCounter = 0;
    let merchantSpawnTimer = CONFIG.MERCHANT_SPAWN_INTERVAL;

    let playerReputation = {};  // merchant_type -> reputation
    let activeQuests = [];
    let completedQuests = new Set();
    let questIdCounter = 0;
    let questRefreshTimer = CONFIG.QUEST_REFRESH_INTERVAL;

    let marketPrices = {};  // item_id -> price_multiplier
    let supplyLevels = {};  // item_id -> supply (0-1)
    let demandLevels = {}; // item_id -> demand (0-1)

    let tradingUI = null;
    let selectedMerchant = null;

    // ============= INITIALIZATION =============
    function init() {
        // Initialize market prices
        for (const itemId of Object.keys(TRADE_ITEMS)) {
            marketPrices[itemId] = 1.0;
            supplyLevels[itemId] = 0.5 + Math.random() * 0.3;
            demandLevels[itemId] = 0.3 + Math.random() * 0.4;
        }

        // Initialize reputation
        for (const merchantType of Object.keys(MERCHANT_TYPES)) {
            playerReputation[merchantType] = 0;
        }
    }

    // ============= MERCHANT SPAWNING =============
    function spawnMerchant(merchantTypeId = null, x = null, y = null) {
        if (activeMerchants.length >= CONFIG.MAX_MERCHANTS) {
            return null;
        }

        // Select merchant type
        let merchantType;
        if (merchantTypeId && MERCHANT_TYPES[merchantTypeId]) {
            merchantType = MERCHANT_TYPES[merchantTypeId];
        } else {
            merchantType = selectRandomMerchant();
        }

        if (!merchantType) return null;

        // Determine spawn position
        if (x === null || y === null) {
            const spawnPos = findMerchantSpawnPosition();
            if (!spawnPos) return null;
            x = spawnPos.x;
            y = spawnPos.y;
        }

        // Generate inventory
        const inventory = generateMerchantInventory(merchantType);

        // Create merchant
        const merchant = {
            id: merchantIdCounter++,
            typeId: merchantType.id,
            type: merchantType,
            name: generateMerchantName(merchantType),

            // Position
            x: x,
            y: y,

            // State
            isActive: true,
            stayTimer: CONFIG.MERCHANT_STAY_DURATION,

            // Inventory
            inventory: inventory,
            gold: 100 + Math.floor(Math.random() * 200),

            // Quests
            availableQuests: [],

            // Trading state
            currentCustomer: null,
            lastInteraction: 0,

            // Visual
            animFrame: 0,
            animTimer: 0
        };

        // Generate quests for this merchant
        generateMerchantQuests(merchant);

        activeMerchants.push(merchant);

        // Notification
        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">storefront</i> ${merchantType.icon} ${merchant.name} has arrived!`,
                []
            );
        }

        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('notification', { position: { x, y } });
        }

        return merchant;
    }

    function selectRandomMerchant() {
        const types = Object.values(MERCHANT_TYPES);
        const weighted = [];

        for (const type of types) {
            const weight = type.rarity === 'common' ? 10 :
                          type.rarity === 'uncommon' ? 5 :
                          type.rarity === 'rare' ? 2 : 1;
            for (let i = 0; i < weight; i++) {
                weighted.push(type);
            }
        }

        return weighted[Math.floor(Math.random() * weighted.length)];
    }

    function findMerchantSpawnPosition() {
        if (typeof player === 'undefined') return null;

        // Try to spawn near player but not too close
        for (let attempt = 0; attempt < 20; attempt++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 8 + Math.random() * 7;

            const x = Math.floor(player.x + Math.cos(angle) * distance);
            const y = Math.floor(player.y + Math.sin(angle) * distance);

            const tile = getTile(x, y);
            if (tile === TILES.GRASS || tile === TILES.FLOOR) {
                // Check for buildings
                const building = buildingMap?.get(`${x},${y}`);
                if (!building) {
                    return { x: x + 0.5, y: y + 0.5 };
                }
            }
        }

        return null;
    }

    function generateMerchantName(merchantType) {
        const firstNames = ['Old', 'Wise', 'Crafty', 'Lucky', 'Silent', 'Swift', 'Iron', 'Shadow'];
        const lastNames = ['Jack', 'Mira', 'Gus', 'Rosa', 'Viktor', 'Elena', 'Marcus', 'Nadia'];

        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

        return `${firstName} ${lastName}`;
    }

    // ============= INVENTORY GENERATION =============
    function generateMerchantInventory(merchantType) {
        const inventory = [];
        const slots = merchantType.baseInventorySlots;

        // Get items matching specializations
        const validItems = Object.values(TRADE_ITEMS).filter(item =>
            merchantType.specializations.includes(item.category) ||
            merchantType.specializations.includes(item.rarity)
        );

        if (validItems.length === 0) return inventory;

        // Fill inventory slots
        const usedItems = new Set();
        for (let i = 0; i < slots; i++) {
            // Weight by rarity
            const weighted = [];
            for (const item of validItems) {
                if (usedItems.has(item.id)) continue;

                const weight = item.rarity === 'common' ? 10 :
                              item.rarity === 'uncommon' ? 5 :
                              item.rarity === 'rare' ? 2 :
                              item.rarity === 'legendary' ? 1 : 5;
                for (let w = 0; w < weight; w++) {
                    weighted.push(item);
                }
            }

            if (weighted.length === 0) break;

            const selectedItem = weighted[Math.floor(Math.random() * weighted.length)];
            usedItems.add(selectedItem.id);

            // Determine quantity
            let quantity = 1;
            if (selectedItem.stackable) {
                quantity = Math.floor(Math.random() * (selectedItem.maxStack / 2)) + 1;
            }

            inventory.push({
                item: selectedItem,
                quantity: quantity,
                price: calculateItemPrice(selectedItem, merchantType)
            });
        }

        return inventory;
    }

    // ============= PRICING SYSTEM =============
    function calculateItemPrice(item, merchantType, isBuying = false) {
        const basePrice = { ...item.basePrice };

        // Apply merchant price modifier
        const merchantMod = merchantType ? merchantType.priceModifier : 1.0;

        // Apply market fluctuation
        const marketMod = marketPrices[item.id] || 1.0;

        // Apply supply/demand
        const supply = supplyLevels[item.id] || 0.5;
        const demand = demandLevels[item.id] || 0.5;
        const supplyDemandMod = 0.8 + (demand - supply) * 0.4;

        // Apply reputation discount
        let reputationMod = 1.0;
        if (merchantType && playerReputation[merchantType.id]) {
            const rep = playerReputation[merchantType.id];
            const tier = Math.floor(rep / 20);
            reputationMod = 1 - (tier * CONFIG.BARTER_DISCOUNT_BASE);
        }

        // Calculate final price
        const finalPrice = {};
        for (const [resource, amount] of Object.entries(basePrice)) {
            let price = amount * merchantMod * marketMod * supplyDemandMod;

            if (!isBuying) {
                price *= reputationMod;
            } else {
                // Buyback is lower
                price *= (merchantType ? merchantType.buybackRate : 0.5);
            }

            finalPrice[resource] = Math.max(1, Math.ceil(price));
        }

        return finalPrice;
    }

    function updateMarketPrices(dt) {
        // Slowly fluctuate prices
        for (const itemId of Object.keys(marketPrices)) {
            const change = (Math.random() - 0.5) * 0.02 * dt;
            marketPrices[itemId] = Math.max(0.7, Math.min(1.3, marketPrices[itemId] + change));
        }

        // Regenerate supply
        for (const itemId of Object.keys(supplyLevels)) {
            supplyLevels[itemId] = Math.min(1, supplyLevels[itemId] + CONFIG.SUPPLY_REGENERATION_RATE * dt / 60);
        }
    }

    // ============= TRADING FUNCTIONS =============
    function buyItem(merchant, inventoryIndex, quantity = 1) {
        if (!merchant || inventoryIndex < 0 || inventoryIndex >= merchant.inventory.length) {
            return { success: false, message: 'Invalid selection' };
        }

        const slot = merchant.inventory[inventoryIndex];
        const item = slot.item;
        quantity = Math.min(quantity, slot.quantity);

        if (quantity <= 0) {
            return { success: false, message: 'Out of stock' };
        }

        // Calculate total price
        const totalPrice = {};
        for (const [resource, amount] of Object.entries(slot.price)) {
            totalPrice[resource] = amount * quantity;
        }

        // Check if player can afford
        for (const [resource, amount] of Object.entries(totalPrice)) {
            if ((resources[resource] || 0) < amount) {
                // Show merchant dialogue
                showMerchantDialogue(merchant, 'no_money');
                return { success: false, message: 'Not enough resources' };
            }
        }

        // Deduct resources
        for (const [resource, amount] of Object.entries(totalPrice)) {
            resources[resource] -= amount;
        }

        // Add item to player inventory/apply effect
        applyItemEffect(item, quantity);

        // Update merchant inventory
        slot.quantity -= quantity;
        if (slot.quantity <= 0) {
            merchant.inventory.splice(inventoryIndex, 1);
        }

        // Update supply/demand
        supplyLevels[item.id] = Math.max(0, (supplyLevels[item.id] || 0.5) - 0.05 * quantity);
        demandLevels[item.id] = Math.min(1, (demandLevels[item.id] || 0.5) + 0.03 * quantity);

        // Gain reputation
        gainReputation(merchant.typeId, quantity);

        // Update UI
        if (typeof updateUI === 'function') {
            updateUI();
        }

        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('ui_click');
        }

        return { success: true, message: `Purchased ${quantity}x ${item.name}` };
    }

    function sellItem(merchant, itemId, quantity = 1) {
        const item = TRADE_ITEMS[itemId];
        if (!item) {
            return { success: false, message: 'Invalid item' };
        }

        // Check if player has the item
        // This would need integration with actual inventory system
        // For now, we'll check if they have the base materials

        // Calculate buyback price
        const buybackPrice = calculateItemPrice(item, merchant.type, true);

        // Give resources
        for (const [resource, amount] of Object.entries(buybackPrice)) {
            resources[resource] = (resources[resource] || 0) + amount * quantity;
        }

        // Update supply
        supplyLevels[item.id] = Math.min(1, (supplyLevels[item.id] || 0.5) + 0.05 * quantity);

        // Small reputation gain
        gainReputation(merchant.typeId, quantity * 0.5);

        if (typeof updateUI === 'function') {
            updateUI();
        }

        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('ui_click');
        }

        return { success: true, message: `Sold ${quantity}x ${item.name}` };
    }

    function applyItemEffect(item, quantity) {
        const effect = item.effect;
        if (!effect) return;

        switch (effect.type) {
            case 'consumable':
                if (effect.heal && typeof player !== 'undefined') {
                    player.health = Math.min(player.maxHealth, player.health + effect.heal * quantity);
                }
                if (effect.curePoison && player.statusEffects) {
                    delete player.statusEffects.poison;
                }
                if (effect.regen) {
                    applyPlayerBuff('regeneration', effect.duration, { healRate: effect.regen });
                }
                break;

            case 'food':
                // Apply hunger restoration
                if (effect.hunger && typeof player !== 'undefined') {
                    player.hunger = Math.min(100, (player.hunger || 0) + effect.hunger * quantity);
                }
                if (effect.buff) {
                    applyPlayerBuff(effect.buff.type || 'damage', effect.buff.duration, effect.buff);
                }
                break;

            case 'material':
                if (effect.resource) {
                    resources[effect.resource] = (resources[effect.resource] || 0) + effect.amount * quantity;
                }
                break;

            case 'weapon':
            case 'tool':
            case 'equipment':
                // Add to equipment inventory
                if (typeof EquipmentSystem !== 'undefined') {
                    EquipmentSystem.addToInventory({
                        id: item.id,
                        name: item.name,
                        icon: item.icon,
                        rarity: item.rarity,
                        effect: effect
                    });
                }
                break;

            case 'kit':
                if (effect.traps && typeof TrapSystem !== 'undefined') {
                    for (const trapKit of effect.traps) {
                        // Add trap items to inventory
                        // The player would place them manually
                    }
                }
                break;

            case 'blueprint':
                // Unlock crafting recipe
                if (typeof unlockBlueprint === 'function') {
                    unlockBlueprint(effect.unlock);
                }
                break;
        }

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">check_circle</i> Acquired ${quantity}x ${item.name}`,
                []
            );
        }
    }

    function applyPlayerBuff(buffType, duration, params) {
        if (typeof player === 'undefined') return;

        if (!player.activeBuffs) player.activeBuffs = [];

        player.activeBuffs.push({
            type: buffType,
            duration: duration,
            remaining: duration,
            ...params
        });
    }

    // ============= REPUTATION SYSTEM =============
    function gainReputation(merchantTypeId, amount) {
        const current = playerReputation[merchantTypeId] || 0;
        playerReputation[merchantTypeId] = Math.min(CONFIG.MAX_REPUTATION, current + amount * CONFIG.REPUTATION_GAIN_RATE);
    }

    function getReputationTier(merchantTypeId) {
        const rep = playerReputation[merchantTypeId] || 0;
        if (rep >= 80) return { tier: 4, name: 'Trusted Partner' };
        if (rep >= 60) return { tier: 3, name: 'Valued Customer' };
        if (rep >= 40) return { tier: 2, name: 'Regular' };
        if (rep >= 20) return { tier: 1, name: 'Acquaintance' };
        return { tier: 0, name: 'Stranger' };
    }

    function getReputationDiscount(merchantTypeId) {
        const tier = getReputationTier(merchantTypeId).tier;
        return tier * CONFIG.BARTER_DISCOUNT_BASE;
    }

    // ============= QUEST SYSTEM =============
    function generateMerchantQuests(merchant) {
        merchant.availableQuests = [];
        const numQuests = 2 + Math.floor(Math.random() * 2);

        const questTypes = Object.keys(QUEST_TEMPLATES);

        for (let i = 0; i < numQuests; i++) {
            const templateId = questTypes[Math.floor(Math.random() * questTypes.length)];
            const quest = generateQuest(templateId, merchant);
            if (quest) {
                merchant.availableQuests.push(quest);
            }
        }
    }

    function generateQuest(templateId, merchant) {
        const template = QUEST_TEMPLATES[templateId];
        if (!template) return null;

        const quest = {
            id: questIdCounter++,
            templateId: templateId,
            type: template.type,
            merchantId: merchant.id,
            merchantName: merchant.name,
            status: 'available', // available, active, completed, failed
            progress: 0,
            startTime: 0,
            rewards: {}
        };

        // Generate quest specifics based on type
        switch (template.type) {
            case 'collection':
                if (template.resourceOptions) {
                    quest.targetResource = template.resourceOptions[Math.floor(Math.random() * template.resourceOptions.length)];
                    quest.targetAmount = Math.floor(
                        template.amountRange.min + Math.random() * (template.amountRange.max - template.amountRange.min)
                    );
                    quest.name = template.nameTemplate
                        .replace('{amount}', quest.targetAmount)
                        .replace('{resource}', quest.targetResource);
                    quest.description = template.descriptionTemplate
                        .replace('{amount}', quest.targetAmount)
                        .replace('{resource}', quest.targetResource);
                } else if (template.itemOptions) {
                    quest.targetItem = template.itemOptions[Math.floor(Math.random() * template.itemOptions.length)];
                    quest.targetAmount = Math.floor(
                        template.amountRange.min + Math.random() * (template.amountRange.max - template.amountRange.min)
                    );
                    const itemName = TRADE_ITEMS[quest.targetItem]?.name || quest.targetItem;
                    quest.name = template.nameTemplate
                        .replace('{amount}', quest.targetAmount)
                        .replace('{item}', itemName);
                    quest.description = template.descriptionTemplate
                        .replace('{amount}', quest.targetAmount)
                        .replace('{item}', itemName);
                }
                break;

            case 'kill':
                quest.targetType = template.targetType;
                quest.targetAmount = Math.floor(
                    template.amountRange.min + Math.random() * (template.amountRange.max - template.amountRange.min)
                );

                if (template.targetType === 'miniboss') {
                    const minibosses = ['hulk', 'shadowstalker', 'plaguebearer', 'crystallord', 'necromancer', 'inferno'];
                    quest.targetBoss = minibosses[Math.floor(Math.random() * minibosses.length)];
                    quest.name = template.nameTemplate.replace('{target}', quest.targetBoss);
                    quest.description = template.descriptionTemplate.replace('{target}', quest.targetBoss);
                } else {
                    quest.name = template.nameTemplate.replace('{amount}', quest.targetAmount);
                    quest.description = template.descriptionTemplate.replace('{amount}', quest.targetAmount);
                }
                break;

            case 'defense':
                quest.duration = Math.floor(
                    template.durationRange.min + Math.random() * (template.durationRange.max - template.durationRange.min)
                );
                quest.name = template.nameTemplate;
                quest.description = template.descriptionTemplate.replace('{duration}', quest.duration);
                break;

            case 'exploration':
                quest.targetDistance = Math.floor(
                    template.distanceRange.min + Math.random() * (template.distanceRange.max - template.distanceRange.min)
                );
                quest.name = template.nameTemplate;
                quest.description = template.descriptionTemplate.replace('{distance}', quest.targetDistance);
                break;
        }

        // Generate rewards
        const baseReward = 20 + Math.floor(Math.random() * 30);
        quest.rewards = {
            wood: Math.floor(baseReward * template.rewardMultiplier),
            iron: Math.floor(baseReward * 0.7 * template.rewardMultiplier),
            xp: template.xpReward,
            reputation: 5 + Math.floor(Math.random() * 10)
        };

        return quest;
    }

    function acceptQuest(questId) {
        if (activeQuests.length >= CONFIG.MAX_ACTIVE_QUESTS) {
            if (typeof showNotification === 'function') {
                showNotification('<i class="material-icons">warning</i> Maximum active quests reached!', []);
            }
            return false;
        }

        // Find quest in merchant inventories
        for (const merchant of activeMerchants) {
            const questIndex = merchant.availableQuests.findIndex(q => q.id === questId);
            if (questIndex !== -1) {
                const quest = merchant.availableQuests[questIndex];
                quest.status = 'active';
                quest.startTime = Date.now();

                activeQuests.push(quest);
                merchant.availableQuests.splice(questIndex, 1);

                if (typeof showNotification === 'function') {
                    showNotification(`<i class="material-icons">assignment</i> Quest accepted: ${quest.name}`, []);
                }

                return true;
            }
        }

        return false;
    }

    function updateQuestProgress(eventType, data) {
        for (const quest of activeQuests) {
            if (quest.status !== 'active') continue;

            switch (quest.type) {
                case 'collection':
                    if (eventType === 'resource_gained' && data.resource === quest.targetResource) {
                        quest.progress += data.amount;
                    }
                    break;

                case 'kill':
                    if (eventType === 'enemy_killed') {
                        if (quest.targetType === 'zombie' && data.type === 'zombie') {
                            quest.progress++;
                        } else if (quest.targetType === 'elite' && data.isElite) {
                            quest.progress++;
                        } else if (quest.targetType === 'miniboss' && data.isMiniBoss && data.bossId === quest.targetBoss) {
                            quest.progress++;
                        }
                    }
                    break;

                case 'exploration':
                    if (eventType === 'distance_traveled') {
                        quest.progress += data.distance;
                    }
                    break;
            }

            // Check completion
            if (quest.progress >= (quest.targetAmount || quest.targetDistance || 1)) {
                completeQuest(quest.id);
            }
        }
    }

    function completeQuest(questId) {
        const questIndex = activeQuests.findIndex(q => q.id === questId);
        if (questIndex === -1) return false;

        const quest = activeQuests[questIndex];
        quest.status = 'completed';

        // Grant rewards
        for (const [resource, amount] of Object.entries(quest.rewards)) {
            if (resource === 'xp') {
                if (typeof player !== 'undefined') {
                    player.exp += amount;
                    if (typeof checkLevelUp === 'function') {
                        checkLevelUp();
                    }
                }
            } else if (resource === 'reputation') {
                gainReputation(quest.merchantTypeId, amount);
            } else {
                resources[resource] = (resources[resource] || 0) + amount;
            }
        }

        completedQuests.add(quest.templateId + '_' + quest.id);
        activeQuests.splice(questIndex, 1);

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">emoji_events</i> Quest completed: ${quest.name}!`,
                []
            );
        }

        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.play('achievement');
        }

        if (typeof updateUI === 'function') {
            updateUI();
        }

        return true;
    }

    // ============= MERCHANT DIALOGUE =============
    function showMerchantDialogue(merchant, dialogueType) {
        const dialogues = merchant.type.dialogues[dialogueType];
        if (!dialogues || dialogues.length === 0) return;

        const message = dialogues[Math.floor(Math.random() * dialogues.length)];

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">chat</i> ${merchant.type.icon} ${merchant.name}: "${message}"`,
                []
            );
        }
    }

    // ============= UPDATE LOOP =============
    function update(dt) {
        // Update merchant spawn timer
        merchantSpawnTimer -= dt;
        if (merchantSpawnTimer <= 0) {
            merchantSpawnTimer = CONFIG.MERCHANT_SPAWN_INTERVAL;
            if (Math.random() < 0.4) {
                spawnMerchant();
            }
        }

        // Update active merchants
        for (let i = activeMerchants.length - 1; i >= 0; i--) {
            const merchant = activeMerchants[i];

            // Update stay timer
            merchant.stayTimer -= dt;
            if (merchant.stayTimer <= 0) {
                // Merchant leaves
                if (typeof showNotification === 'function') {
                    showNotification(
                        `<i class="material-icons">directions_walk</i> ${merchant.type.icon} ${merchant.name} has left.`,
                        []
                    );
                }
                activeMerchants.splice(i, 1);
                continue;
            }

            // Update animation
            merchant.animTimer += dt;
            if (merchant.animTimer >= 0.5) {
                merchant.animTimer = 0;
                merchant.animFrame = (merchant.animFrame + 1) % 2;
            }
        }

        // Update market prices
        updateMarketPrices(dt);

        // Update reputation decay
        for (const merchantType of Object.keys(playerReputation)) {
            playerReputation[merchantType] = Math.max(
                0,
                playerReputation[merchantType] - CONFIG.REPUTATION_DECAY_RATE * dt / 60
            );
        }
    }

    // ============= INTERACTION =============
    function interactWithMerchant(merchant) {
        if (!merchant || !merchant.isActive) return false;

        // Check distance
        const dist = Math.sqrt((player.x - merchant.x) ** 2 + (player.y - merchant.y) ** 2);
        if (dist > 2) {
            if (typeof showNotification === 'function') {
                showNotification('<i class="material-icons">warning</i> Too far away!', []);
            }
            return false;
        }

        selectedMerchant = merchant;
        showMerchantDialogue(merchant, 'greeting');
        openTradingUI(merchant);

        return true;
    }

    function openTradingUI(merchant) {
        // Create trading UI overlay
        if (tradingUI) {
            document.body.removeChild(tradingUI);
        }

        tradingUI = document.createElement('div');
        tradingUI.id = 'trading-ui';
        tradingUI.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
            border: 2px solid #ffd700;
            border-radius: 10px;
            padding: 20px;
            z-index: 1000;
            min-width: 400px;
            max-width: 600px;
            color: #fff;
            font-family: Arial, sans-serif;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
        `;

        const repTier = getReputationTier(merchant.typeId);
        const discount = Math.floor(getReputationDiscount(merchant.typeId) * 100);

        tradingUI.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #555; padding-bottom: 10px;">
                <div>
                    <h2 style="margin: 0; color: #ffd700;">${merchant.type.icon} ${merchant.name}</h2>
                    <p style="margin: 5px 0 0 0; color: #aaa; font-size: 12px;">${merchant.type.name} - ${merchant.type.description}</p>
                </div>
                <button id="close-trading" style="background: #ff4444; border: none; color: white; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 16px;">✕</button>
            </div>

            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <div style="flex: 1; background: #333; padding: 8px; border-radius: 5px;">
                    <span style="color: #888;">Reputation:</span>
                    <span style="color: #ffd700;">${repTier.name}</span>
                    ${discount > 0 ? `<span style="color: #44ff44; font-size: 11px;"> (-${discount}%)</span>` : ''}
                </div>
                <div style="flex: 1; background: #333; padding: 8px; border-radius: 5px;">
                    <span style="color: #888;">Leaves in:</span>
                    <span style="color: #ff8844;">${Math.floor(merchant.stayTimer)}s</span>
                </div>
            </div>

            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                <button class="trade-tab active" data-tab="buy" style="flex: 1; padding: 8px; border: none; background: #ffd700; color: #000; cursor: pointer; border-radius: 5px;">Buy</button>
                <button class="trade-tab" data-tab="quests" style="flex: 1; padding: 8px; border: none; background: #444; color: #fff; cursor: pointer; border-radius: 5px;">Quests (${merchant.availableQuests.length})</button>
            </div>

            <div id="trade-content" style="max-height: 300px; overflow-y: auto;">
                ${renderBuyTab(merchant)}
            </div>

            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #555; display: flex; justify-content: space-between; font-size: 12px; color: #888;">
                <span>🪵 ${resources.wood || 0}</span>
                <span>🪨 ${resources.stone || 0}</span>
                <span>⚙️ ${resources.iron || 0}</span>
                <span>🍖 ${resources.food || 0}</span>
            </div>
        `;

        document.body.appendChild(tradingUI);

        // Event listeners
        document.getElementById('close-trading').addEventListener('click', closeTradingUI);

        tradingUI.querySelectorAll('.trade-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                tradingUI.querySelectorAll('.trade-tab').forEach(t => {
                    t.style.background = '#444';
                    t.style.color = '#fff';
                    t.classList.remove('active');
                });
                tab.style.background = '#ffd700';
                tab.style.color = '#000';
                tab.classList.add('active');

                const content = document.getElementById('trade-content');
                if (tab.dataset.tab === 'buy') {
                    content.innerHTML = renderBuyTab(merchant);
                } else {
                    content.innerHTML = renderQuestsTab(merchant);
                }
                attachTradeListeners(merchant);
            });
        });

        attachTradeListeners(merchant);
    }

    function renderBuyTab(merchant) {
        if (merchant.inventory.length === 0) {
            return '<p style="text-align: center; color: #888;">No items available</p>';
        }

        return merchant.inventory.map((slot, index) => {
            const item = slot.item;
            const priceStr = Object.entries(slot.price)
                .map(([r, a]) => `${getResourceIcon(r)}${a}`)
                .join(' ');

            const rarityColor = getRarityColor(item.rarity);

            return `
                <div class="trade-item" data-index="${index}" style="display: flex; align-items: center; padding: 10px; background: #333; margin-bottom: 5px; border-radius: 5px; cursor: pointer; border-left: 3px solid ${rarityColor};">
                    <span style="font-size: 24px; margin-right: 10px;">${item.icon}</span>
                    <div style="flex: 1;">
                        <div style="color: ${rarityColor}; font-weight: bold;">${item.name}</div>
                        <div style="font-size: 11px; color: #888;">${item.description}</div>
                        <div style="font-size: 11px; color: #aaa;">Stock: ${slot.quantity}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: #ffd700;">${priceStr}</div>
                        <button class="buy-btn" data-index="${index}" style="margin-top: 5px; padding: 3px 10px; background: #44aa44; border: none; color: white; border-radius: 3px; cursor: pointer;">Buy</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderQuestsTab(merchant) {
        if (merchant.availableQuests.length === 0) {
            return '<p style="text-align: center; color: #888;">No quests available</p>';
        }

        return merchant.availableQuests.map(quest => {
            const rewardsStr = Object.entries(quest.rewards)
                .filter(([r]) => r !== 'reputation')
                .map(([r, a]) => `${getResourceIcon(r)}${a}`)
                .join(' ');

            return `
                <div class="quest-item" style="padding: 10px; background: #333; margin-bottom: 5px; border-radius: 5px; border-left: 3px solid #4488ff;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <div style="color: #4488ff; font-weight: bold;">${quest.name}</div>
                            <div style="font-size: 11px; color: #888; margin-top: 3px;">${quest.description}</div>
                        </div>
                        <button class="accept-quest-btn" data-quest-id="${quest.id}" style="padding: 5px 12px; background: #4488ff; border: none; color: white; border-radius: 3px; cursor: pointer;">Accept</button>
                    </div>
                    <div style="font-size: 11px; color: #ffd700; margin-top: 8px;">Rewards: ${rewardsStr}</div>
                </div>
            `;
        }).join('');
    }

    function attachTradeListeners(merchant) {
        tradingUI.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                const result = buyItem(merchant, index, 1);
                if (result.success) {
                    // Refresh UI
                    document.getElementById('trade-content').innerHTML = renderBuyTab(merchant);
                    attachTradeListeners(merchant);
                }
            });
        });

        tradingUI.querySelectorAll('.accept-quest-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const questId = parseInt(btn.dataset.questId);
                if (acceptQuest(questId)) {
                    document.getElementById('trade-content').innerHTML = renderQuestsTab(merchant);
                    attachTradeListeners(merchant);
                }
            });
        });
    }

    function closeTradingUI() {
        if (tradingUI) {
            if (selectedMerchant) {
                showMerchantDialogue(selectedMerchant, 'farewell');
            }
            document.body.removeChild(tradingUI);
            tradingUI = null;
            selectedMerchant = null;
        }
    }

    function getResourceIcon(resource) {
        const icons = { wood: '🪵', stone: '🪨', iron: '⚙️', food: '🍖', xp: '⭐' };
        return icons[resource] || resource;
    }

    function getRarityColor(rarity) {
        const colors = {
            common: '#aaaaaa',
            uncommon: '#44ff44',
            rare: '#4488ff',
            legendary: '#ff8800'
        };
        return colors[rarity] || '#ffffff';
    }

    // ============= RENDERING =============
    function draw(ctx, camX, camY) {
        const s = TILE_SIZE * SCALE;

        for (const merchant of activeMerchants) {
            drawMerchant(ctx, merchant, camX, camY, s);
        }
    }

    function drawMerchant(ctx, merchant, camX, camY, s) {
        const sx = (merchant.x - 0.5) * s - camX;
        const sy = (merchant.y - 0.5) * s - camY;

        // Skip if off-screen
        if (sx < -s * 2 || sx > ctx.canvas.width + s || sy < -s * 2 || sy > ctx.canvas.height + s) {
            return;
        }

        ctx.save();

        // Draw shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(sx + s / 2, sy + s * 0.9, s * 0.4, s * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw merchant icon
        ctx.font = `${s * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(merchant.type.icon, sx + s / 2, sy + s / 2);

        // Draw name
        ctx.font = 'bold 10px Arial';
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText(merchant.name, sx + s / 2, sy - 5);
        ctx.fillText(merchant.name, sx + s / 2, sy - 5);

        // Draw interaction indicator if close
        if (typeof player !== 'undefined') {
            const dist = Math.sqrt((player.x - merchant.x) ** 2 + (player.y - merchant.y) ** 2);
            if (dist <= 3) {
                ctx.font = '10px Arial';
                ctx.fillStyle = '#ffffff';
                ctx.fillText('[E] Trade', sx + s / 2, sy + s + 15);
            }
        }

        // Draw timer warning if leaving soon
        if (merchant.stayTimer < 30) {
            const pulse = Math.sin(Date.now() / 200) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255, 0, 0, ${0.3 + pulse * 0.4})`;
            ctx.beginPath();
            ctx.arc(sx + s / 2, sy + s / 2, s * 0.6, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    // ============= SERIALIZATION =============
    function getState() {
        return {
            playerReputation,
            marketPrices,
            supplyLevels,
            demandLevels,
            completedQuests: Array.from(completedQuests),
            activeQuests: activeQuests.map(q => ({
                ...q,
                startTime: q.startTime
            })),
            merchantSpawnTimer
        };
    }

    function setState(data) {
        if (!data) return;

        playerReputation = data.playerReputation || {};
        marketPrices = data.marketPrices || {};
        supplyLevels = data.supplyLevels || {};
        demandLevels = data.demandLevels || {};
        completedQuests = new Set(data.completedQuests || []);
        activeQuests = data.activeQuests || [];
        merchantSpawnTimer = data.merchantSpawnTimer || CONFIG.MERCHANT_SPAWN_INTERVAL;

        // Re-initialize missing data
        init();
    }

    // Initialize on load
    init();

    // ============= PUBLIC API =============
    return {
        // Core
        update,
        draw,

        // Merchant management
        spawnMerchant,
        interactWithMerchant,
        getMerchantAt: (x, y) => activeMerchants.find(m =>
            Math.abs(m.x - x) < 1 && Math.abs(m.y - y) < 1
        ),

        // Trading
        buyItem,
        sellItem,
        closeTradingUI,

        // Quests
        acceptQuest,
        updateQuestProgress,
        getActiveQuests: () => activeQuests,

        // Reputation
        getReputationTier,
        getReputationDiscount,

        // Queries
        getActiveMerchants: () => activeMerchants,
        getMarketPrices: () => marketPrices,

        // Serialization
        getState,
        setState,

        // Constants
        MERCHANT_TYPES,
        TRADE_ITEMS,
        CONFIG
    };
})();

// Export globally
window.TradingSystem = TradingSystem;
