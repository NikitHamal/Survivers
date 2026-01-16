// ============================================
// EQUIPMENT & INVENTORY SYSTEM
// ============================================
// Complete equipment system with weapons, armor, tools,
// item management, and stat modifications

const EquipmentSystem = (function () {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        MAX_INVENTORY_SIZE: 20,
        MAX_HOTBAR_SIZE: 5,
        DURABILITY_DECAY_RATE: 0.01,
        REPAIR_COST_MULTIPLIER: 0.5
    };

    // ============= ITEM DEFINITIONS =============
    const ITEM_TYPES = {
        WEAPON: 'weapon',
        ARMOR: 'armor',
        TOOL: 'tool',
        CONSUMABLE: 'consumable',
        MATERIAL: 'material',
        SPECIAL: 'special'
    };

    const EQUIPMENT_SLOTS = {
        WEAPON: 'weapon',
        HEAD: 'head',
        CHEST: 'chest',
        LEGS: 'legs',
        ACCESSORY: 'accessory'
    };

    const RARITY = {
        COMMON: { name: 'Common', color: '#aaaaaa', multiplier: 1.0 },
        UNCOMMON: { name: 'Uncommon', color: '#55ff55', multiplier: 1.2 },
        RARE: { name: 'Rare', color: '#5555ff', multiplier: 1.5 },
        EPIC: { name: 'Epic', color: '#aa55ff', multiplier: 2.0 },
        LEGENDARY: { name: 'Legendary', color: '#ffaa00', multiplier: 3.0 }
    };

    // ============= ITEM DATABASE =============
    const ITEMS = {
        // === WEAPONS ===
        wooden_sword: {
            id: 'wooden_sword',
            name: 'Wooden Sword',
            type: ITEM_TYPES.WEAPON,
            slot: EQUIPMENT_SLOTS.WEAPON,
            icon: '🗡️',
            rarity: 'COMMON',
            stats: { damage: 5, attackSpeed: 1.0 },
            durability: 50,
            maxDurability: 50,
            craftable: true,
            recipe: { wood: 10 },
            description: 'A basic wooden sword. Better than nothing.'
        },
        stone_sword: {
            id: 'stone_sword',
            name: 'Stone Sword',
            type: ITEM_TYPES.WEAPON,
            slot: EQUIPMENT_SLOTS.WEAPON,
            icon: '🗡️',
            rarity: 'COMMON',
            stats: { damage: 10, attackSpeed: 0.9 },
            durability: 80,
            maxDurability: 80,
            craftable: true,
            recipe: { stone: 15, wood: 5 },
            description: 'A sturdy stone blade.'
        },
        iron_sword: {
            id: 'iron_sword',
            name: 'Iron Sword',
            type: ITEM_TYPES.WEAPON,
            slot: EQUIPMENT_SLOTS.WEAPON,
            icon: '⚔️',
            rarity: 'UNCOMMON',
            stats: { damage: 18, attackSpeed: 1.0 },
            durability: 150,
            maxDurability: 150,
            craftable: true,
            recipe: { iron: 20, wood: 8 },
            description: 'A sharp iron blade.'
        },
        steel_sword: {
            id: 'steel_sword',
            name: 'Steel Sword',
            type: ITEM_TYPES.WEAPON,
            slot: EQUIPMENT_SLOTS.WEAPON,
            icon: '⚔️',
            rarity: 'RARE',
            stats: { damage: 28, attackSpeed: 1.1, critChance: 0.1 },
            durability: 250,
            maxDurability: 250,
            craftable: true,
            recipe: { iron: 35, stone: 15, wood: 10 },
            description: 'A refined steel blade with deadly precision.'
        },
        flame_blade: {
            id: 'flame_blade',
            name: 'Flame Blade',
            type: ITEM_TYPES.WEAPON,
            slot: EQUIPMENT_SLOTS.WEAPON,
            icon: '🔥',
            rarity: 'EPIC',
            stats: { damage: 35, attackSpeed: 1.0, fireDamage: 10, critChance: 0.15 },
            durability: 300,
            maxDurability: 300,
            craftable: true,
            recipe: { iron: 50, stone: 30, wood: 20 },
            special: 'burn',
            description: 'A blade engulfed in eternal flame. Burns enemies on hit.'
        },
        doom_cleaver: {
            id: 'doom_cleaver',
            name: 'Doom Cleaver',
            type: ITEM_TYPES.WEAPON,
            slot: EQUIPMENT_SLOTS.WEAPON,
            icon: '💀',
            rarity: 'LEGENDARY',
            stats: { damage: 50, attackSpeed: 0.8, lifesteal: 0.1, critChance: 0.2, critDamage: 2.0 },
            durability: 500,
            maxDurability: 500,
            craftable: false, // Boss drop only
            special: 'cleave',
            description: 'An ancient weapon of destruction. Cleaves through multiple enemies.'
        },
        bow: {
            id: 'bow',
            name: 'Wooden Bow',
            type: ITEM_TYPES.WEAPON,
            slot: EQUIPMENT_SLOTS.WEAPON,
            icon: '🏹',
            rarity: 'COMMON',
            stats: { damage: 12, attackSpeed: 0.7, range: 8 },
            durability: 60,
            maxDurability: 60,
            craftable: true,
            recipe: { wood: 15, iron: 2 },
            ranged: true,
            description: 'A simple but effective ranged weapon.'
        },
        crossbow: {
            id: 'crossbow',
            name: 'Crossbow',
            type: ITEM_TYPES.WEAPON,
            slot: EQUIPMENT_SLOTS.WEAPON,
            icon: '🏹',
            rarity: 'RARE',
            stats: { damage: 25, attackSpeed: 0.4, range: 12, piercing: true },
            durability: 120,
            maxDurability: 120,
            craftable: true,
            recipe: { wood: 20, iron: 25, stone: 10 },
            ranged: true,
            description: 'A powerful crossbow that pierces through enemies.'
        },

        // === ARMOR - HEAD ===
        leather_cap: {
            id: 'leather_cap',
            name: 'Leather Cap',
            type: ITEM_TYPES.ARMOR,
            slot: EQUIPMENT_SLOTS.HEAD,
            icon: '🎩',
            rarity: 'COMMON',
            stats: { defense: 2, maxHealth: 5 },
            durability: 40,
            maxDurability: 40,
            craftable: true,
            recipe: { wood: 5 },
            description: 'Basic head protection.'
        },
        iron_helmet: {
            id: 'iron_helmet',
            name: 'Iron Helmet',
            type: ITEM_TYPES.ARMOR,
            slot: EQUIPMENT_SLOTS.HEAD,
            icon: '⛑️',
            rarity: 'UNCOMMON',
            stats: { defense: 5, maxHealth: 15 },
            durability: 100,
            maxDurability: 100,
            craftable: true,
            recipe: { iron: 15 },
            description: 'Solid iron head protection.'
        },
        steel_helmet: {
            id: 'steel_helmet',
            name: 'Steel Helmet',
            type: ITEM_TYPES.ARMOR,
            slot: EQUIPMENT_SLOTS.HEAD,
            icon: '⛑️',
            rarity: 'RARE',
            stats: { defense: 10, maxHealth: 30, resistPoison: 0.2 },
            durability: 180,
            maxDurability: 180,
            craftable: true,
            recipe: { iron: 30, stone: 10 },
            description: 'Superior head protection with poison resistance.'
        },

        // === ARMOR - CHEST ===
        leather_vest: {
            id: 'leather_vest',
            name: 'Leather Vest',
            type: ITEM_TYPES.ARMOR,
            slot: EQUIPMENT_SLOTS.CHEST,
            icon: '🥋',
            rarity: 'COMMON',
            stats: { defense: 4, maxHealth: 10 },
            durability: 50,
            maxDurability: 50,
            craftable: true,
            recipe: { wood: 8 },
            description: 'Basic torso protection.'
        },
        iron_chestplate: {
            id: 'iron_chestplate',
            name: 'Iron Chestplate',
            type: ITEM_TYPES.ARMOR,
            slot: EQUIPMENT_SLOTS.CHEST,
            icon: '🛡️',
            rarity: 'UNCOMMON',
            stats: { defense: 10, maxHealth: 30 },
            durability: 150,
            maxDurability: 150,
            craftable: true,
            recipe: { iron: 25 },
            description: 'Sturdy iron chest protection.'
        },
        steel_chestplate: {
            id: 'steel_chestplate',
            name: 'Steel Chestplate',
            type: ITEM_TYPES.ARMOR,
            slot: EQUIPMENT_SLOTS.CHEST,
            icon: '🛡️',
            rarity: 'RARE',
            stats: { defense: 18, maxHealth: 50, damageReduction: 0.1 },
            durability: 250,
            maxDurability: 250,
            craftable: true,
            recipe: { iron: 45, stone: 20 },
            description: 'Heavy steel protection. Reduces incoming damage.'
        },
        dragon_mail: {
            id: 'dragon_mail',
            name: 'Dragon Mail',
            type: ITEM_TYPES.ARMOR,
            slot: EQUIPMENT_SLOTS.CHEST,
            icon: '🐉',
            rarity: 'LEGENDARY',
            stats: { defense: 30, maxHealth: 100, damageReduction: 0.2, fireResist: 0.5 },
            durability: 500,
            maxDurability: 500,
            craftable: false,
            description: 'Armor forged from dragon scales. Highly resistant to fire.'
        },

        // === ARMOR - LEGS ===
        leather_pants: {
            id: 'leather_pants',
            name: 'Leather Pants',
            type: ITEM_TYPES.ARMOR,
            slot: EQUIPMENT_SLOTS.LEGS,
            icon: '👖',
            rarity: 'COMMON',
            stats: { defense: 2, speed: 0.1 },
            durability: 40,
            maxDurability: 40,
            craftable: true,
            recipe: { wood: 6 },
            description: 'Light leg protection with mobility.'
        },
        iron_greaves: {
            id: 'iron_greaves',
            name: 'Iron Greaves',
            type: ITEM_TYPES.ARMOR,
            slot: EQUIPMENT_SLOTS.LEGS,
            icon: '👖',
            rarity: 'UNCOMMON',
            stats: { defense: 6, maxHealth: 15 },
            durability: 100,
            maxDurability: 100,
            craftable: true,
            recipe: { iron: 18 },
            description: 'Solid iron leg protection.'
        },

        // === ACCESSORIES ===
        hunters_ring: {
            id: 'hunters_ring',
            name: "Hunter's Ring",
            type: ITEM_TYPES.ARMOR,
            slot: EQUIPMENT_SLOTS.ACCESSORY,
            icon: '💍',
            rarity: 'UNCOMMON',
            stats: { critChance: 0.1, damage: 5 },
            durability: 999,
            maxDurability: 999,
            craftable: true,
            recipe: { iron: 10, stone: 5 },
            description: 'Increases critical hit chance.'
        },
        vitality_amulet: {
            id: 'vitality_amulet',
            name: 'Vitality Amulet',
            type: ITEM_TYPES.ARMOR,
            slot: EQUIPMENT_SLOTS.ACCESSORY,
            icon: '📿',
            rarity: 'RARE',
            stats: { maxHealth: 50, healthRegen: 0.5 },
            durability: 999,
            maxDurability: 999,
            craftable: true,
            recipe: { iron: 20, stone: 15 },
            description: 'Boosts health and regeneration.'
        },
        berserker_charm: {
            id: 'berserker_charm',
            name: 'Berserker Charm',
            type: ITEM_TYPES.ARMOR,
            slot: EQUIPMENT_SLOTS.ACCESSORY,
            icon: '🔮',
            rarity: 'EPIC',
            stats: { damage: 15, attackSpeed: 0.2, defense: -5 },
            durability: 999,
            maxDurability: 999,
            craftable: false,
            description: 'Massive damage boost at the cost of defense.'
        },

        // === TOOLS ===
        wooden_pickaxe: {
            id: 'wooden_pickaxe',
            name: 'Wooden Pickaxe',
            type: ITEM_TYPES.TOOL,
            icon: '⛏️',
            rarity: 'COMMON',
            stats: { miningSpeed: 1.2 },
            durability: 30,
            maxDurability: 30,
            craftable: true,
            recipe: { wood: 8 },
            description: 'Speeds up mining.'
        },
        iron_pickaxe: {
            id: 'iron_pickaxe',
            name: 'Iron Pickaxe',
            type: ITEM_TYPES.TOOL,
            icon: '⛏️',
            rarity: 'UNCOMMON',
            stats: { miningSpeed: 1.8, ironBonus: 0.2 },
            durability: 100,
            maxDurability: 100,
            craftable: true,
            recipe: { iron: 15, wood: 5 },
            description: 'Efficient mining with iron bonus.'
        },
        wooden_axe: {
            id: 'wooden_axe',
            name: 'Wooden Axe',
            type: ITEM_TYPES.TOOL,
            icon: '🪓',
            rarity: 'COMMON',
            stats: { woodcuttingSpeed: 1.3, damage: 3 },
            durability: 35,
            maxDurability: 35,
            craftable: true,
            recipe: { wood: 10 },
            description: 'Speeds up woodcutting. Can be used as weapon.'
        },
        iron_axe: {
            id: 'iron_axe',
            name: 'Iron Axe',
            type: ITEM_TYPES.TOOL,
            icon: '🪓',
            rarity: 'UNCOMMON',
            stats: { woodcuttingSpeed: 2.0, damage: 8, woodBonus: 0.3 },
            durability: 120,
            maxDurability: 120,
            craftable: true,
            recipe: { iron: 18, wood: 8 },
            description: 'Efficient woodcutting with wood bonus.'
        },

        // === CONSUMABLES ===
        health_potion: {
            id: 'health_potion',
            name: 'Health Potion',
            type: ITEM_TYPES.CONSUMABLE,
            icon: '🧪',
            rarity: 'COMMON',
            effect: { heal: 30 },
            stackable: true,
            maxStack: 10,
            craftable: true,
            recipe: { food: 5, wood: 2 },
            description: 'Restores 30 health.'
        },
        greater_health_potion: {
            id: 'greater_health_potion',
            name: 'Greater Health Potion',
            type: ITEM_TYPES.CONSUMABLE,
            icon: '🧪',
            rarity: 'UNCOMMON',
            effect: { heal: 75 },
            stackable: true,
            maxStack: 10,
            craftable: true,
            recipe: { food: 15, iron: 5 },
            description: 'Restores 75 health.'
        },
        stamina_elixir: {
            id: 'stamina_elixir',
            name: 'Stamina Elixir',
            type: ITEM_TYPES.CONSUMABLE,
            icon: '⚗️',
            rarity: 'UNCOMMON',
            effect: { speedBoost: 0.5, duration: 30 },
            stackable: true,
            maxStack: 5,
            craftable: true,
            recipe: { food: 10, stone: 5 },
            description: 'Increases movement speed for 30 seconds.'
        },
        rage_potion: {
            id: 'rage_potion',
            name: 'Rage Potion',
            type: ITEM_TYPES.CONSUMABLE,
            icon: '💢',
            rarity: 'RARE',
            effect: { damageBoost: 0.5, attackSpeedBoost: 0.3, duration: 20 },
            stackable: true,
            maxStack: 3,
            craftable: true,
            recipe: { food: 20, iron: 10 },
            description: 'Massively increases damage and attack speed.'
        },
        antidote: {
            id: 'antidote',
            name: 'Antidote',
            type: ITEM_TYPES.CONSUMABLE,
            icon: '💊',
            rarity: 'COMMON',
            effect: { curePoison: true, poisonResist: 30 },
            stackable: true,
            maxStack: 10,
            craftable: true,
            recipe: { food: 8, wood: 3 },
            description: 'Cures poison and provides temporary immunity.'
        },

        // === LEGENDARY & ACHIEVEMENT REWARDS ===
        legendary_sword: {
            id: 'legendary_sword',
            name: 'Excalibur',
            type: ITEM_TYPES.WEAPON,
            slot: EQUIPMENT_SLOTS.WEAPON,
            icon: '🗡️',
            rarity: 'LEGENDARY',
            stats: { damage: 65, attackSpeed: 1.3, critChance: 0.25, critDamage: 2.5 },
            durability: 1000,
            maxDurability: 1000,
            craftable: false,
            description: 'A sword of mythic power. Legends say it was pulled from a stone.'
        },
        titans_heart: {
            id: 'titans_heart',
            name: "Titan's Heart",
            type: ITEM_TYPES.ARMOR,
            slot: EQUIPMENT_SLOTS.ACCESSORY,
            icon: '💎',
            rarity: 'LEGENDARY',
            stats: { maxHealth: 200, damageReduction: 0.15, healthRegen: 2.0 },
            durability: 999,
            maxDurability: 999,
            craftable: false,
            description: 'The pulsing core of a defeated titan. Grants immense vitality.'
        },
        queens_crown: {
            id: 'queens_crown',
            name: "Queen's Crown",
            type: ITEM_TYPES.ARMOR,
            slot: EQUIPMENT_SLOTS.HEAD,
            icon: '👑',
            rarity: 'EPIC',
            stats: { defense: 25, maxHealth: 60, critChance: 0.1, thorns: 0.2 },
            durability: 400,
            maxDurability: 400,
            craftable: false,
            description: 'A royal crown that commands respect and punishes attackers.'
        },
        legendary_armor: {
            id: 'legendary_armor',
            name: 'Aegis Plate',
            type: ITEM_TYPES.ARMOR,
            slot: EQUIPMENT_SLOTS.CHEST,
            icon: '🛡️',
            rarity: 'LEGENDARY',
            stats: { defense: 50, maxHealth: 150, damageReduction: 0.3, resistAll: 0.2 },
            durability: 1000,
            maxDurability: 1000,
            craftable: false,
            description: 'Indestructible armor forged by gods. The ultimate protection.'
        },
        blood_moon_charm: {
            id: 'blood_moon_charm',
            name: 'Blood Moon Charm',
            type: ITEM_TYPES.ARMOR,
            slot: EQUIPMENT_SLOTS.ACCESSORY,
            icon: '🏮',
            rarity: 'EPIC',
            stats: { damage: 20, lifesteal: 0.15, critDamage: 0.5 },
            durability: 999,
            maxDurability: 999,
            craftable: false,
            description: 'A charm glowing with malevolent red light. Feeds on the blood of enemies.'
        },
        explorers_boots: {
            id: 'explorers_boots',
            name: "Explorer's Boots",
            type: ITEM_TYPES.ARMOR,
            slot: EQUIPMENT_SLOTS.LEGS,
            icon: '👢',
            rarity: 'RARE',
            stats: { defense: 12, speed: 0.4, terrainPenaltyReduction: 0.5 },
            durability: 350,
            maxDurability: 350,
            craftable: false,
            description: 'Worn boots that have seen many worlds. Makes travel much easier.'
        },
        fire_resistance_potion: {
            id: 'fire_resistance_potion',
            name: 'Fire Resist Potion',
            type: ITEM_TYPES.CONSUMABLE,
            icon: '🧪',
            rarity: 'RARE',
            effect: { fireResist: 0.8, duration: 60 },
            stackable: true,
            maxStack: 5,
            craftable: true,
            recipe: { food: 25, iron: 10 },
            description: 'Temporary near-immunity to extreme heat and lava.'
        },
        alchemist_kit: {
            id: 'alchemist_kit',
            name: 'Alchemist Kit',
            type: ITEM_TYPES.ARMOR,
            slot: EQUIPMENT_SLOTS.ACCESSORY,
            icon: '🎒',
            rarity: 'EPIC',
            stats: { potionDuration: 0.5, potionEffect: 0.3 },
            durability: 999,
            maxDurability: 999,
            craftable: false,
            description: 'A bag full of brewing essentials and catalysts.'
        },
        quest_compass: {
            id: 'quest_compass',
            name: 'Quest Compass',
            type: ITEM_TYPES.ARMOR,
            slot: EQUIPMENT_SLOTS.ACCESSORY,
            icon: '🧭',
            rarity: 'RARE',
            stats: { range: 15, expBonus: 0.1 },
            durability: 999,
            maxDurability: 999,
            craftable: false,
            description: 'Always points towards destiny. Increases experience gain.'
        },
        hero_armor: {
            id: 'hero_armor',
            name: "Hero's Plate",
            type: ITEM_TYPES.ARMOR,
            slot: EQUIPMENT_SLOTS.CHEST,
            icon: '🎖️',
            rarity: 'EPIC',
            stats: { defense: 35, maxHealth: 80, speed: 0.2, damage: 10 },
            durability: 600,
            maxDurability: 600,
            craftable: false,
            description: 'Armor worn by the saviors of old. Well-balanced and powerful.'
        },
        golden_crown: {
            id: 'golden_crown',
            name: 'Golden Crown',
            type: ITEM_TYPES.ARMOR,
            slot: EQUIPMENT_SLOTS.HEAD,
            icon: '👑',
            rarity: 'LEGENDARY',
            stats: { defense: 40, maxHealth: 100, critChance: 0.2, goldBonus: 1.0 },
            durability: 999,
            maxDurability: 999,
            craftable: false,
            description: 'The ultimate symbol of completion. You have mastered this world.'
        }
    };

    // ============= PLAYER EQUIPMENT STATE =============
    let playerEquipment = {
        weapon: null,
        head: null,
        chest: null,
        legs: null,
        accessory: null
    };

    let inventory = [];
    let hotbar = [null, null, null, null, null];
    let selectedHotbarSlot = 0;
    let activeBuffs = [];

    // ============= ITEM MANAGEMENT =============
    function createItem(itemId, quantity = 1) {
        const template = ITEMS[itemId];
        if (!template) {
            console.warn(`Unknown item: ${itemId}`);
            return null;
        }

        return {
            ...template,
            quantity: template.stackable ? quantity : 1,
            durability: template.durability,
            uid: generateItemUID()
        };
    }

    function generateItemUID() {
        return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    function addToInventory(item) {
        if (!item) return false;

        // Try to stack with existing items
        if (item.stackable) {
            for (const invItem of inventory) {
                if (invItem.id === item.id && invItem.quantity < (item.maxStack || 99)) {
                    const space = (item.maxStack || 99) - invItem.quantity;
                    const toAdd = Math.min(space, item.quantity);
                    invItem.quantity += toAdd;
                    item.quantity -= toAdd;

                    if (item.quantity <= 0) {
                        updateInventoryUI();
                        return true;
                    }
                }
            }
        }

        // Add as new item if inventory has space
        if (inventory.length < CONFIG.MAX_INVENTORY_SIZE) {
            inventory.push(item);
            updateInventoryUI();
            return true;
        }

        // Inventory full
        if (typeof showNotification === 'function') {
            showNotification(
                '<i class="material-icons">warning</i> Inventory full!',
                []
            );
        }
        return false;
    }

    function removeFromInventory(itemUid, quantity = 1) {
        const index = inventory.findIndex(item => item.uid === itemUid);
        if (index === -1) return false;

        const item = inventory[index];

        if (item.stackable && item.quantity > quantity) {
            item.quantity -= quantity;
        } else {
            inventory.splice(index, 1);
        }

        updateInventoryUI();
        return true;
    }

    function getInventoryItem(itemUid) {
        return inventory.find(item => item.uid === itemUid);
    }

    // ============= EQUIPMENT MANAGEMENT =============
    function equipItem(item) {
        if (!item || item.type === ITEM_TYPES.CONSUMABLE || item.type === ITEM_TYPES.MATERIAL) {
            return false;
        }

        const slot = item.slot || EQUIPMENT_SLOTS.WEAPON;
        const currentEquipped = playerEquipment[slot];

        // Unequip current item first
        if (currentEquipped) {
            addToInventory(currentEquipped);
        }

        // Remove from inventory and equip
        removeFromInventory(item.uid);
        playerEquipment[slot] = item;

        // Recalculate stats
        recalculatePlayerStats();
        updateEquipmentUI();

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">check_circle</i> Equipped ${item.name}`,
                []
            );
        }

        return true;
    }

    function unequipItem(slot) {
        const item = playerEquipment[slot];
        if (!item) return false;

        if (inventory.length >= CONFIG.MAX_INVENTORY_SIZE) {
            if (typeof showNotification === 'function') {
                showNotification(
                    '<i class="material-icons">warning</i> Inventory full! Cannot unequip.',
                    []
                );
            }
            return false;
        }

        playerEquipment[slot] = null;
        addToInventory(item);
        recalculatePlayerStats();
        updateEquipmentUI();

        return true;
    }

    function getEquippedItem(slot) {
        return playerEquipment[slot];
    }

    // ============= STAT CALCULATIONS =============
    function recalculatePlayerStats() {
        if (!player) return;

        // Base stats
        let totalStats = {
            damage: 18 + (player.level || 1) * 3,
            defense: 0,
            maxHealth: 100 + (player.level - 1) * 15,
            attackSpeed: 1.0,
            critChance: 0.05,
            critDamage: 1.5,
            speed: 4.5,
            lifesteal: 0,
            damageReduction: 0,
            healthRegen: 0,
            miningSpeed: 1.0,
            woodcuttingSpeed: 1.0
        };

        // Add equipment stats
        for (const slot of Object.values(EQUIPMENT_SLOTS)) {
            const item = playerEquipment[slot];
            if (!item || !item.stats) continue;

            for (const [stat, value] of Object.entries(item.stats)) {
                if (totalStats.hasOwnProperty(stat)) {
                    totalStats[stat] += value;
                }
            }
        }

        // Apply active buff modifiers
        for (const buff of activeBuffs) {
            if (buff.stats) {
                for (const [stat, value] of Object.entries(buff.stats)) {
                    if (totalStats.hasOwnProperty(stat)) {
                        totalStats[stat] *= (1 + value);
                    }
                }
            }
        }

        // Store calculated stats for use in combat
        player.calculatedStats = totalStats;

        // Update max health (preserve current health percentage)
        const healthPercent = player.health / player.maxHealth;
        player.maxHealth = totalStats.maxHealth;
        player.health = Math.min(player.health, player.maxHealth);

        return totalStats;
    }

    function getPlayerStats() {
        return player?.calculatedStats || recalculatePlayerStats();
    }

    // ============= DURABILITY SYSTEM =============
    function degradeEquipment(slot, amount = 1) {
        const item = playerEquipment[slot];
        if (!item || item.durability === 999) return; // 999 = unbreakable

        item.durability = Math.max(0, item.durability - amount);

        if (item.durability <= 0) {
            // Item broke
            if (typeof showNotification === 'function') {
                showNotification(
                    `<i class="material-icons">broken_image</i> Your ${item.name} broke!`,
                    []
                );
            }
            playerEquipment[slot] = null;
            recalculatePlayerStats();
            updateEquipmentUI();
        } else if (item.durability <= item.maxDurability * 0.2) {
            // Low durability warning
            if (typeof showNotification === 'function') {
                showNotification(
                    `<i class="material-icons">warning</i> Your ${item.name} is about to break!`,
                    []
                );
            }
        }
    }

    function repairItem(item) {
        if (!item || item.durability >= item.maxDurability) return false;

        // Calculate repair cost
        const missingDurability = item.maxDurability - item.durability;
        const repairCost = calculateRepairCost(item, missingDurability);

        // Check resources
        if (!hasResources(repairCost)) {
            if (typeof showNotification === 'function') {
                showNotification(
                    '<i class="material-icons">warning</i> Not enough resources to repair!',
                    []
                );
            }
            return false;
        }

        // Consume resources
        consumeResources(repairCost);

        // Repair item
        item.durability = item.maxDurability;

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">build</i> Repaired ${item.name}!`,
                []
            );
        }

        updateEquipmentUI();
        return true;
    }

    function calculateRepairCost(item, durabilityToRestore) {
        const cost = {};
        const ratio = durabilityToRestore / item.maxDurability;

        if (item.recipe) {
            for (const [resource, amount] of Object.entries(item.recipe)) {
                cost[resource] = Math.ceil(amount * ratio * CONFIG.REPAIR_COST_MULTIPLIER);
            }
        } else {
            // Default repair cost based on rarity
            const rarityMultiplier = RARITY[item.rarity]?.multiplier || 1;
            cost.iron = Math.ceil(5 * ratio * rarityMultiplier);
        }

        return cost;
    }

    // ============= CONSUMABLE USAGE =============
    function useConsumable(item) {
        if (!item || item.type !== ITEM_TYPES.CONSUMABLE) return false;

        const effect = item.effect;

        // Apply immediate effects
        if (effect.heal) {
            player.health = Math.min(player.maxHealth, player.health + effect.heal);
            spawnParticles(player.x, player.y, '#00ff00', 8);
            addDamageNumber(player.x, player.y - 0.5, `+${effect.heal}`, '#00ff00');
        }

        if (effect.curePoison) {
            // Remove poison debuff
            activeBuffs = activeBuffs.filter(b => b.type !== 'poison');
        }

        // Apply timed buffs
        if (effect.duration) {
            const buff = {
                id: item.id,
                name: item.name,
                duration: effect.duration,
                remainingTime: effect.duration,
                stats: {}
            };

            if (effect.speedBoost) buff.stats.speed = effect.speedBoost;
            if (effect.damageBoost) buff.stats.damage = effect.damageBoost;
            if (effect.attackSpeedBoost) buff.stats.attackSpeed = effect.attackSpeedBoost;
            if (effect.poisonResist) buff.stats.poisonResist = effect.poisonResist;

            // Remove existing buff of same type
            activeBuffs = activeBuffs.filter(b => b.id !== item.id);
            activeBuffs.push(buff);

            recalculatePlayerStats();
        }

        // Remove item from inventory
        removeFromInventory(item.uid);

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">local_drink</i> Used ${item.name}`,
                []
            );
        }

        return true;
    }

    function updateBuffs(dt) {
        let recalcNeeded = false;

        activeBuffs = activeBuffs.filter(buff => {
            buff.remainingTime -= dt;
            if (buff.remainingTime <= 0) {
                recalcNeeded = true;
                return false;
            }
            return true;
        });

        if (recalcNeeded) {
            recalculatePlayerStats();
        }
    }

    // ============= HOTBAR MANAGEMENT =============
    function setHotbarItem(slotIndex, item) {
        if (slotIndex < 0 || slotIndex >= CONFIG.MAX_HOTBAR_SIZE) return false;

        // Remove from previous slot if exists
        const existingIndex = hotbar.findIndex(h => h && h.uid === item?.uid);
        if (existingIndex !== -1) {
            hotbar[existingIndex] = null;
        }

        hotbar[slotIndex] = item;
        updateHotbarUI();
        return true;
    }

    function selectHotbarSlot(slotIndex) {
        if (slotIndex < 0 || slotIndex >= CONFIG.MAX_HOTBAR_SIZE) return;
        selectedHotbarSlot = slotIndex;
        updateHotbarUI();
    }

    function useSelectedHotbarItem() {
        const item = hotbar[selectedHotbarSlot];
        if (!item) return false;

        if (item.type === ITEM_TYPES.CONSUMABLE) {
            return useConsumable(item);
        }

        return false;
    }

    // ============= RESOURCE HELPERS =============
    function hasResources(cost) {
        for (const [resource, amount] of Object.entries(cost)) {
            if ((resources[resource] || 0) < amount) {
                return false;
            }
        }
        return true;
    }

    function consumeResources(cost) {
        for (const [resource, amount] of Object.entries(cost)) {
            resources[resource] = (resources[resource] || 0) - amount;
        }
    }

    // ============= UI UPDATE FUNCTIONS =============
    function updateInventoryUI() {
        const container = document.getElementById('fullInventoryGrid');
        if (!container) return;

        container.innerHTML = '';

        for (let i = 0; i < CONFIG.MAX_INVENTORY_SIZE; i++) {
            const item = inventory[i];
            const slot = document.createElement('div');
            slot.className = 'inventory-slot' + (item ? ` rarity-${item.rarity?.toLowerCase()}` : '');

            if (item) {
                slot.innerHTML = `
                    <span class="item-icon">${item.icon}</span>
                    ${item.stackable && item.quantity > 1 ? `<span class="item-quantity">${item.quantity}</span>` : ''}
                    ${item.durability < item.maxDurability * 0.3 ? '<span class="item-warning">!</span>' : ''}
                `;
                slot.title = `${item.name}\n${item.description}`;
                slot.onclick = () => showItemMenu(item);
            }

            container.appendChild(slot);
        }
    }

    function updateEquipmentUI() {
        const slotsPanel = document.getElementById('slotsPanel');
        if (!slotsPanel) return;

        // If slots don't exist, create them
        if (slotsPanel.children.length === 0) {
            for (const slotName of Object.values(EQUIPMENT_SLOTS)) {
                const div = document.createElement('div');
                div.id = `equip-${slotName}`;
                div.className = 'equipment-slot empty';
                div.innerHTML = '<span class="empty-slot">+</span>';
                slotsPanel.appendChild(div);
            }
        }

        for (const [slot, item] of Object.entries(playerEquipment)) {
            const element = document.getElementById(`equip-${slot}`);
            if (!element) continue;

            if (item) {
                element.innerHTML = `
                    <span class="item-icon">${item.icon}</span>
                    <div class="durability-bar">
                        <div class="durability-fill" style="width: ${(item.durability / item.maxDurability) * 100}%"></div>
                    </div>
                `;
                element.className = `equipment-slot filled rarity-${item.rarity?.toLowerCase()}`;
                element.title = `${item.name}\nDurability: ${item.durability}/${item.maxDurability}`;
                element.onclick = () => showEquipmentMenu(slot, item);
            } else {
                element.innerHTML = '<span class="empty-slot">+</span>';
                element.className = 'equipment-slot empty';
                element.title = `Empty ${slot} slot`;
                element.onclick = null;
            }
        }
    }

    function updateStatsUI() {
        const container = document.getElementById('statsPanel');
        if (!container) return;

        const stats = getPlayerStats();
        container.innerHTML = `
            <h4>Player Stats</h4>
            <div class="stats-grid">
                <div class="stat-item">
                    <span>Damage:</span>
                    <span class="stat-value">${Math.floor(stats.damage)}</span>
                </div>
                <div class="stat-item">
                    <span>Defense:</span>
                    <span class="stat-value">${Math.floor(stats.defense)}</span>
                </div>
                <div class="stat-item">
                    <span>Max HP:</span>
                    <span class="stat-value">${Math.floor(stats.maxHealth)}</span>
                </div>
                <div class="stat-item">
                    <span>Attack Speed:</span>
                    <span class="stat-value">${stats.attackSpeed.toFixed(1)}x</span>
                </div>
                <div class="stat-item">
                    <span>Crit Chance:</span>
                    <span class="stat-value">${Math.round(stats.critChance * 100)}%</span>
                </div>
                <div class="stat-item">
                    <span>Movement:</span>
                    <span class="stat-value">${stats.speed.toFixed(1)}</span>
                </div>
            </div>
            
            <div class="active-buffs" style="margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                <h5 style="margin: 0 0 5px 0;">Active Effects</h5>
                ${activeBuffs.length === 0 ? '<span style="color:#666; font-size:10px;">No active effects</span>' :
                activeBuffs.map(b => `
                        <div class="buff-tag">
                            <span>${b.name}</span>
                            <span class="buff-timer">${Math.ceil(b.remainingTime)}s</span>
                        </div>
                    `).join('')
            }
            </div>
        `;
    }

    function updateHotbarUI() {
        const container = document.getElementById('invSlots');
        if (!container) return;

        container.innerHTML = '';

        for (let i = 0; i < CONFIG.MAX_HOTBAR_SIZE; i++) {
            const item = hotbar[i];
            const slot = document.createElement('div');
            slot.className = 'inv-slot' + (i === selectedHotbarSlot ? ' selected' : '');

            if (item) {
                slot.innerHTML = `
                    <span class="slot-num">${i + 1}</span>
                    <span class="item-icon">${item.icon}</span>
                    ${item.stackable && item.quantity > 1 ? `<span class="item-qty">${item.quantity}</span>` : ''}
                `;
            } else {
                slot.innerHTML = `<span class="slot-num">${i + 1}</span>`;
            }

            slot.onclick = () => selectHotbarSlot(i);
            container.appendChild(slot);
        }
    }

    function showItemMenu(item) {
        // This would typically show a context menu with options
        const options = [];

        if (item.type === ITEM_TYPES.WEAPON || item.type === ITEM_TYPES.ARMOR) {
            options.push({
                text: 'Equip',
                action: () => {
                    equipItem(item);
                    updateStatsUI();
                }
            });
        }

        if (item.type === ITEM_TYPES.CONSUMABLE) {
            options.push({
                text: 'Use',
                action: () => {
                    useConsumable(item);
                    updateStatsUI();
                }
            });
        }

        options.push({
            text: 'Add to Hotbar',
            action: () => setHotbarItem(selectedHotbarSlot, item)
        });

        options.push({
            text: 'Drop',
            action: () => removeFromInventory(item.uid, item.quantity)
        });

        if (typeof showNotification === 'function' && options.length > 0) {
            showNotification(
                `<strong>${item.icon} ${item.name}</strong><br><small>${item.description}</small>`,
                options.map(opt => ({ text: opt.text, action: opt.action, class: 'accept' }))
            );
        }
    }

    function showEquipmentMenu(slot, item) {
        if (typeof showNotification === 'function') {
            showNotification(
                `<strong>${item.icon} ${item.name}</strong><br>
                <small>Durability: ${item.durability}/${item.maxDurability}</small>`,
                [
                    {
                        text: 'Unequip', action: () => {
                            unequipItem(slot);
                            updateStatsUI();
                        }, class: 'accept'
                    },
                    { text: 'Repair', action: () => repairItem(item), class: 'accept' }
                ]
            );
        }
    }

    // ============= SERIALIZATION FOR SAVE SYSTEM =============
    function getPlayerEquipment() {
        return {
            equipment: { ...playerEquipment },
            inventory: inventory.map(item => ({ ...item })),
            hotbar: hotbar.map(item => item ? { ...item } : null),
            activeBuffs: activeBuffs.map(buff => ({ ...buff }))
        };
    }

    function setPlayerEquipment(data) {
        if (!data) return;

        playerEquipment = data.equipment || {
            weapon: null, head: null, chest: null, legs: null, accessory: null
        };

        inventory = data.inventory || [];
        hotbar = data.hotbar || [null, null, null, null, null];
        activeBuffs = data.activeBuffs || [];

        recalculatePlayerStats();
        updateInventoryUI();
        updateEquipmentUI();
        updateHotbarUI();
    }

    // ============= PUBLIC API =============
    return {
        // Item Management
        ITEMS,
        ITEM_TYPES,
        EQUIPMENT_SLOTS,
        RARITY,
        createItem,
        addToInventory,
        removeFromInventory,
        getInventoryItem,

        // Equipment
        equipItem,
        unequipItem,
        getEquippedItem,
        degradeEquipment,
        repairItem,

        // Stats
        recalculatePlayerStats,
        getPlayerStats,

        // Consumables & Buffs
        useConsumable,
        updateBuffs,
        getActiveBuffs: () => [...activeBuffs],

        // Hotbar
        setHotbarItem,
        selectHotbarSlot,
        useSelectedHotbarItem,
        getSelectedSlot: () => selectedHotbarSlot,

        // Inventory access
        getInventory: () => [...inventory],
        getHotbar: () => [...hotbar],

        // UI
        updateInventoryUI,
        updateEquipmentUI,
        updateStatsUI,
        updateHotbarUI,

        // Save/Load
        getPlayerEquipment,
        setPlayerEquipment,

        // Config
        CONFIG
    };
})();

// Export globally
window.EquipmentSystem = EquipmentSystem;
