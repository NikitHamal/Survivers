// ============================================
// COOKING & NUTRITION SYSTEM
// ============================================
// Complete cooking system with recipes, nutrition tracking,
// food preservation, and meal quality

const CookingSystem = (function() {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        FOOD_DECAY_RATE: 0.5,
        PRESERVED_DECAY_RATE: 0.1,
        SMOKED_DECAY_RATE: 0.05,
        FROZEN_DECAY_RATE: 0.02,

        FRESH_THRESHOLD: 80,
        STALE_THRESHOLD: 40,
        SPOILED_THRESHOLD: 0,

        COOKING_QUALITY_PERFECT: 1.0,
        COOKING_QUALITY_GOOD: 0.85,
        COOKING_QUALITY_OKAY: 0.7,
        COOKING_QUALITY_POOR: 0.5,
        COOKING_QUALITY_BURNT: 0.3,

        HUNGER_RESTORE_BASE: 25,
        HEALTH_RESTORE_BASE: 5,

        NUTRITION_TARGET: {
            calories: 2000,
            protein: 50,
            carbs: 250,
            vitamins: 100
        },

        MALNUTRITION_THRESHOLD: 0.6,

        PRESERVATION_METHODS: {
            smoking: { decayMod: 0.1, duration: 300 },
            drying: { decayMod: 0.15, duration: 200 },
            salting: { decayMod: 0.2, duration: 150 },
            fermenting: { decayMod: 0.08, duration: 400 },
            canning: { decayMod: 0.05, duration: 500 }
        }
    };

    // ============= RECIPE DEFINITIONS =============
    const RECIPES = {
        BREAD: {
            id: 'bread',
            name: 'Bread',
            icon: '🍞',
            type: 'baked',
            ingredients: [
                { item: 'flour', amount: 2 },
                { item: 'water', amount: 1 }
            ],
            cookingTime: 30,
            cookingMethod: ['oven', 'stove', 'campfire'],
            output: { bread: 1 },
            nutrition: { calories: 200, protein: 7, carbs: 40, vitamins: 1 },
            buff: { duration: 300, effects: { fullness: 30 } },
            difficulty: 1
        },

        SOUP: {
            id: 'soup',
            name: 'Vegetable Soup',
            icon: '🥣',
            type: 'soup',
            ingredients: [
                { item: 'carrot', amount: 2 },
                { item: 'potato', amount: 2 },
                { item: 'water', amount: 2 }
            ],
            cookingTime: 45,
            cookingMethod: ['campfire', 'stove'],
            output: { soup: 3 },
            nutrition: { calories: 80, protein: 3, carbs: 18, vitamins: 8 },
            buff: { duration: 180, effects: { healthRegen: 2 } },
            difficulty: 2
        },

        STEAK: {
            id: 'steak',
            name: 'Grilled Steak',
            icon: '🥩',
            type: 'meat',
            ingredients: [
                { item: 'meat', amount: 2 }
            ],
            cookingTime: 40,
            cookingMethod: ['campfire', 'grill', 'stove'],
            output: { steak: 2 },
            nutrition: { calories: 300, protein: 35, carbs: 0, vitamins: 2 },
            buff: { duration: 240, effects: { damageBonus: 0.1 } },
            difficulty: 2
        },

        ROAST_CHICKEN: {
            id: 'roast_chicken',
            name: 'Roast Chicken',
            icon: '🍗',
            type: 'meat',
            ingredients: [
                { item: 'chicken', amount: 1 },
                { item: 'carrot', amount: 1 },
                { item: 'potato', amount: 2 }
            ],
            cookingTime: 90,
            cookingMethod: ['oven', 'campfire'],
            output: { roast_chicken: 4 },
            nutrition: { calories: 280, protein: 30, carbs: 15, vitamins: 5 },
            buff: { duration: 360, effects: { maxHealthBonus: 20 } },
            difficulty: 4
        },

        FISH_SOUP: {
            id: 'fish_soup',
            name: 'Fish Soup',
            icon: '🍲',
            type: 'soup',
            ingredients: [
                { item: 'fish', amount: 2 },
                { item: 'potato', amount: 1 },
                { item: 'water', amount: 2 }
            ],
            cookingTime: 35,
            cookingMethod: ['campfire', 'stove'],
            output: { fish_soup: 3 },
            nutrition: { calories: 100, protein: 15, carbs: 10, vitamins: 6 },
            buff: { duration: 200, effects: { waterBreathing: true } },
            difficulty: 2
        },

        SALAD: {
            id: 'salad',
            name: 'Garden Salad',
            icon: '🥗',
            type: 'vegetable',
            ingredients: [
                { item: 'carrot', amount: 2 },
                { item: 'tomato', amount: 2 },
                { item: 'herb', amount: 1 }
            ],
            cookingTime: 10,
            cookingMethod: ['raw'],
            output: { salad: 2 },
            nutrition: { calories: 60, protein: 3, carbs: 12, vitamins: 15 },
            buff: { duration: 150, effects: { vitaminBoost: true } },
            difficulty: 1
        },

        PIZZA: {
            id: 'pizza',
            name: 'Homemade Pizza',
            icon: '🍕',
            type: 'baked',
            ingredients: [
                { item: 'flour', amount: 2 },
                { item: 'tomato', amount: 2 },
                { item: 'cheese', amount: 1 }
            ],
            cookingTime: 50,
            cookingMethod: ['oven'],
            output: { pizza: 3 },
            nutrition: { calories: 250, protein: 12, carbs: 35, vitamins: 6 },
            buff: { duration: 300, effects: { speedBonus: 0.1 } },
            difficulty: 4
        },

        PASTA: {
            id: 'pasta',
            name: 'Pasta Dish',
            icon: '🍝',
            type: 'grain',
            ingredients: [
                { item: 'flour', amount: 2 },
                { item: 'tomato', amount: 2 },
                { item: 'meat', amount: 1 }
            ],
            cookingTime: 40,
            cookingMethod: ['stove'],
            output: { pasta: 3 },
            nutrition: { calories: 220, protein: 15, carbs: 40, vitamins: 4 },
            buff: { duration: 250, effects: { staminaRegen: 3 } },
            difficulty: 3
        },

        STEW: {
            id: 'stew',
            name: 'Hearty Stew',
            icon: '🍜',
            type: 'soup',
            ingredients: [
                { item: 'meat', amount: 2 },
                { item: 'potato', amount: 3 },
                { item: 'carrot', amount: 2 },
                { item: 'water', amount: 1 }
            ],
            cookingTime: 80,
            cookingMethod: ['campfire', 'stove'],
            output: { stew: 5 },
            nutrition: { calories: 180, protein: 20, carbs: 25, vitamins: 8 },
            buff: { duration: 400, effects: { coldResistance: 0.3 } },
            difficulty: 3
        },

        SANDWICH: {
            id: 'sandwich',
            name: 'Meat Sandwich',
            icon: '🥪',
            type: 'simple',
            ingredients: [
                { item: 'bread', amount: 2 },
                { item: 'meat', amount: 1 }
            ],
            cookingTime: 5,
            cookingMethod: ['raw'],
            output: { sandwich: 1 },
            nutrition: { calories: 250, protein: 18, carbs: 30, vitamins: 2 },
            buff: { duration: 120, effects: { hungerPrevention: 20 } },
            difficulty: 1
        },

        BURGER: {
            id: 'burger',
            name: 'Survivor Burger',
            icon: '🍔',
            type: 'simple',
            ingredients: [
                { item: 'bread', amount: 2 },
                { item: 'meat', amount: 2 },
                { item: 'tomato', amount: 1 },
                { item: 'cheese', amount: 1 }
            ],
            cookingTime: 20,
            cookingMethod: ['stove', 'grill'],
            output: { burger: 2 },
            nutrition: { calories: 350, protein: 28, carbs: 35, vitamins: 4 },
            buff: { duration: 300, effects: { strengthBonus: 0.15 } },
            difficulty: 3
        },

        TACOS: {
            id: 'tacos',
            name: 'Beef Tacos',
            icon: '🌮',
            type: 'simple',
            ingredients: [
                { item: 'cornmeal', amount: 2 },
                { item: 'meat', amount: 2 },
                { item: 'pepper', amount: 1 }
            ],
            cookingTime: 25,
            cookingMethod: ['stove', 'grill'],
            output: { tacos: 3 },
            nutrition: { calories: 200, protein: 18, carbs: 22, vitamins: 5 },
            buff: { duration: 200, effects: { critChance: 0.1 } },
            difficulty: 3
        },

        CAKE: {
            id: 'cake',
            name: 'Celebration Cake',
            icon: '🎂',
            type: 'dessert',
            ingredients: [
                { item: 'flour', amount: 3 },
                { item: 'sugar', amount: 2 },
                { item: 'egg', amount: 2 },
                { item: 'honey', amount: 1 }
            ],
            cookingTime: 60,
            cookingMethod: ['oven'],
            output: { cake: 4 },
            nutrition: { calories: 400, protein: 8, carbs: 60, vitamins: 3 },
            buff: { duration: 600, effects: { happiness: 20, allStatsBonus: 0.05 } },
            difficulty: 5
        },

        COOKIES: {
            id: 'cookies',
            name: 'Chocolate Cookies',
            icon: '🍪',
            type: 'dessert',
            ingredients: [
                { item: 'flour', amount: 2 },
                { item: 'sugar', amount: 1 },
                { item: 'honey', amount: 1 }
            ],
            cookingTime: 25,
            cookingMethod: ['oven'],
            output: { cookies: 6 },
            nutrition: { calories: 150, protein: 2, carbs: 25, vitamins: 1 },
            buff: { duration: 180, effects: { speedBonus: 0.05 } },
            difficulty: 2
        },

        PIE: {
            id: 'pie',
            name: 'Berry Pie',
            icon: '🥧',
            type: 'dessert',
            ingredients: [
                { item: 'flour', amount: 2 },
                { item: 'berries', amount: 3 },
                { item: 'sugar', amount: 1 }
            ],
            cookingTime: 50,
            cookingMethod: ['oven'],
            output: { pie: 4 },
            nutrition: { calories: 180, protein: 3, carbs: 35, vitamins: 10 },
            buff: { duration: 300, effects: { vitaminBoost: true, energyBoost: true } },
            difficulty: 3
        },

        JAM: {
            id: 'jam',
            name: 'Berry Jam',
            icon: '🍯',
            type: 'preserve',
            ingredients: [
                { item: 'berries', amount: 4 },
                { item: 'sugar', amount: 1 }
            ],
            cookingTime: 30,
            cookingMethod: ['stove'],
            output: { jam: 3 },
            nutrition: { calories: 100, protein: 0, carbs: 25, vitamins: 5 },
            buff: { duration: 120, effects: { sweetness: true } },
            difficulty: 2
        },

        JERKY: {
            id: 'jerky',
            name: 'Beef Jerky',
            icon: '🥩',
            type: 'preserve',
            ingredients: [
                { item: 'meat', amount: 3 },
                { item: 'salt', amount: 1 }
            ],
            cookingTime: 120,
            cookingMethod: ['smoker', 'drying'],
            output: { jerky: 4 },
            nutrition: { calories: 150, protein: 25, carbs: 2, vitamins: 0 },
            buff: { duration: 600, effects: { hungerPrevention: 50, staminaBonus: 0.1 } },
            difficulty: 3
        },

        SMOKED_FISH: {
            id: 'smoked_fish',
            name: 'Smoked Fish',
            icon: '🐟',
            type: 'preserve',
            ingredients: [
                { item: 'fish', amount: 2 }
            ],
            cookingTime: 60,
            cookingMethod: ['smoker'],
            output: { smoked_fish: 2 },
            nutrition: { calories: 120, protein: 20, carbs: 0, vitamins: 3 },
            buff: { duration: 400, effects: { waterAffinity: true } },
            difficulty: 2
        },

        CHEESE: {
            id: 'cheese',
            name: 'Aged Cheese',
            icon: '🧀',
            type: 'dairy',
            ingredients: [
                { item: 'milk', amount: 4 }
            ],
            cookingTime: 180,
            cookingMethod: ['dairy'],
            output: { cheese: 2 },
            nutrition: { calories: 150, protein: 10, carbs: 2, vitamins: 4 },
            buff: { duration: 250, effects: { calcium: true } },
            difficulty: 4
        },

        BUTTER: {
            id: 'butter',
            name: 'Fresh Butter',
            icon: '🧈',
            type: 'dairy',
            ingredients: [
                { item: 'milk', amount: 3 }
            ],
            cookingTime: 30,
            cookingMethod: ['dairy'],
            output: { butter: 1 },
            nutrition: { calories: 100, protein: 0, carbs: 0, vitamins: 2 },
            buff: { duration: 100, effects: { cookingBonus: 0.2 } },
            difficulty: 2
        },

        ICE_CREAM: {
            id: 'ice_cream',
            name: 'Vanilla Ice Cream',
            icon: '🍨',
            type: 'dessert',
            ingredients: [
                { item: 'milk', amount: 2 },
                { item: 'sugar', amount: 1 },
                { item: 'honey', amount: 1 }
            ],
            cookingTime: 20,
            cookingMethod: ['freezer'],
            output: { ice_cream: 2 },
            nutrition: { calories: 200, protein: 5, carbs: 25, vitamins: 3 },
            buff: { duration: 180, effects: { cooling: true, happiness: 10 } },
            difficulty: 4
        },

        PORRIDGE: {
            id: 'porridge',
            name: 'Hearty Porridge',
            icon: '🥣',
            type: 'grain',
            ingredients: [
                { item: 'rice', amount: 2 },
                { item: 'water', amount: 2 },
                { item: 'honey', amount: 1 }
            ],
            cookingTime: 25,
            cookingTime: ['campfire', 'stove'],
            output: { porridge: 2 },
            nutrition: { calories: 150, protein: 4, carbs: 35, vitamins: 2 },
            buff: { duration: 180, effects: { warmth: true, energy: true } },
            difficulty: 1
        },

        RAMEN: {
            id: 'ramen',
            name: 'Survivor Ramen',
            icon: '🍜',
            type: 'soup',
            ingredients: [
                { item: 'rice_flour', amount: 2 },
                { item: 'meat', amount: 1 },
                { item: 'egg', amount: 1 },
                { item: 'herb', amount: 1 }
            ],
            cookingTime: 35,
            cookingMethod: ['stove'],
            output: { ramen: 2 },
            nutrition: { calories: 250, protein: 18, carbs: 30, vitamins: 5 },
            buff: { duration: 300, effects: { allStatsBonus: 0.1, speedBonus: 0.1 } },
            difficulty: 4
        },

        WINE: {
            id: 'wine',
            name: 'Berry Wine',
            icon: '🍷',
            type: 'drink',
            ingredients: [
                { item: 'berries', amount: 5 },
                { item: 'sugar', amount: 2 },
                { item: 'water', amount: 1 }
            ],
            cookingTime: 300,
            cookingMethod: ['brewery'],
            output: { wine: 3 },
            nutrition: { calories: 80, protein: 0, carbs: 15, vitamins: 3 },
            buff: { duration: 500, effects: { moraleBonus: 0.2, warmth: true } },
            difficulty: 5
        },

        BEER: {
            id: 'beer',
            name: 'Craft Beer',
            icon: '🍺',
            type: 'drink',
            ingredients: [
                { item: 'wheat', amount: 3 },
                { item: 'hops', amount: 1 },
                { item: 'water', amount: 2 }
            ],
            cookingTime: 120,
            cookingMethod: ['brewery'],
            output: { beer: 4 },
            nutrition: { calories: 120, protein: 2, carbs: 10, vitamins: 1 },
            buff: { duration: 400, effects: { stressRelief: true, socialBonus: 0.1 } },
            difficulty: 4
        },

        MEAD: {
            id: 'mead',
            name: 'Honey Mead',
            icon: '🍯',
            type: 'drink',
            ingredients: [
                { item: 'honey', amount: 3 },
                { item: 'water', amount: 2 }
            ],
            cookingTime: 180,
            cookingMethod: ['brewery'],
            output: { mead: 3 },
            nutrition: { calories: 150, protein: 0, carbs: 40, vitamins: 2 },
            buff: { duration: 450, effects: { healthBonus: 0.1, manaRegen: true } },
            difficulty: 4
        },

        ENERGY_DRINK: {
            id: 'energy_drink',
            name: 'Survivor Energy Drink',
            icon: '⚡',
            type: 'drink',
            ingredients: [
                { item: 'honey', amount: 1 },
                { item: 'herb', amount: 2 },
                { item: 'water', amount: 1 }
            ],
            cookingTime: 15,
            cookingMethod: ['stove'],
            output: { energy_drink: 2 },
            nutrition: { calories: 50, protein: 0, carbs: 12, vitamins: 5 },
            buff: { duration: 120, effects: { speedBurst: true, staminaMax: 30 } },
            difficulty: 2
        },

        HEALING_POTION: {
            id: 'healing_potion',
            name: 'Healing Potion',
            icon: '🧪',
            type: 'potion',
            ingredients: [
                { item: 'herb', amount: 3 },
                { item: 'mushroom', amount: 2 },
                { item: 'water', amount: 1 }
            ],
            cookingTime: 40,
            cookingMethod: ['stove'],
            output: { healing_potion: 2 },
            nutrition: { calories: 5, protein: 0, carbs: 1, vitamins: 2 },
            buff: { duration: 0, effects: { instantHeal: 50 } },
            difficulty: 3
        },

        ANTIDOTE: {
            id: 'antidote',
            name: 'Antidote',
            icon: '💉',
            type: 'potion',
            ingredients: [
                { item: 'herb', amount: 2 },
                { item: 'mushroom', amount: 1 }
            ],
            cookingTime: 25,
            cookingMethod: ['stove'],
            output: { antidote: 2 },
            nutrition: { calories: 5, protein: 0, carbs: 1, vitamins: 1 },
            buff: { duration: 0, effects: { curePoison: true } },
            difficulty: 2
        },

        STAMINA_POTION: {
            id: 'stamina_potion',
            name: 'Stamina Potion',
            icon: '💪',
            type: 'potion',
            ingredients: [
                { item: 'herb', amount: 2 },
                { item: 'honey', amount: 1 },
                { item: 'water', amount: 1 }
            ],
            cookingTime: 30,
            cookingMethod: ['stove'],
            output: { stamina_potion: 2 },
            nutrition: { calories: 30, protein: 0, carbs: 8, vitamins: 3 },
            buff: { duration: 180, effects: { staminaRegen: 5 } },
            difficulty: 3
        }
    };

    // ============= FOOD ITEMS =============
    const FOOD_ITEMS = {
        APPLE: { id: 'apple', name: 'Apple', icon: '🍎', calories: 95, protein: 0.5, carbs: 25, vitamins: 8, decayRate: 0.3, rawEdible: true },
        BERRY: { id: 'berry', name: 'Berry', icon: '🫐', calories: 60, protein: 1, carbs: 15, vitamins: 10, decayRate: 0.4, rawEdible: true },
        CARROT: { id: 'carrot', name: 'Carrot', icon: '🥕', calories: 50, protein: 1, carbs: 12, vitamins: 8, decayRate: 0.25, rawEdible: true },
        POTATO: { id: 'potato', name: 'Potato', icon: '🥔', calories: 160, protein: 4, carbs: 37, vitamins: 2, decayRate: 0.2, rawEdible: false, cookingRequired: true },
        TOMATO: { id: 'tomato', name: 'Tomato', icon: '🍅', calories: 40, protein: 2, carbs: 9, vitamins: 5, decayRate: 0.35, rawEdible: true },
        CORN: { id: 'corn', name: 'Corn', icon: '🌽', calories: 140, protein: 5, carbs: 30, vitamins: 3, decayRate: 0.3, rawEdible: true },
        MEAT: { id: 'meat', name: 'Raw Meat', icon: '🥩', calories: 250, protein: 26, carbs: 0, vitamins: 1, decayRate: 0.8, rawEdible: false, cookingRequired: true },
        FISH: { id: 'fish', name: 'Raw Fish', icon: '🐟', calories: 100, protein: 20, carbs: 0, vitamins: 2, decayRate: 0.7, rawEdible: false, cookingRequired: true },
        EGG: { id: 'egg', name: 'Egg', icon: '🥚', calories: 70, protein: 6, carbs: 0, vitamins: 3, decayRate: 0.5, rawEdible: true },
        MILK: { id: 'milk', name: 'Milk', icon: '🥛', calories: 100, protein: 8, carbs: 12, vitamins: 4, decayRate: 0.6, rawEdible: true },
        WHEAT: { id: 'wheat', name: 'Wheat', icon: '🌾', calories: 120, protein: 4, carbs: 25, vitamins: 1, decayRate: 0.2, rawEdible: false, processing: 'milling' },
        RICE: { id: 'rice', name: 'Rice', icon: '🍚', calories: 130, protein: 3, carbs: 28, vitamins: 1, decayRate: 0.15, rawEdible: false, cooking: true },
        FLOUR: { id: 'flour', name: 'Flour', icon: '🌾', calories: 0, protein: 0, carbs: 0, vitamins: 0, decayRate: 0.1, rawEdible: false, ingredient: true },
        SUGAR: { id: 'sugar', name: 'Sugar', icon: '🍬', calories: 49, protein: 0, carbs: 12, vitamins: 0, decayRate: 0.05, rawEdible: true, ingredient: true },
        HONEY: { id: 'honey', name: 'Honey', icon: '🍯', calories: 64, protein: 0, carbs: 17, vitamins: 0, decayRate: 0.02, rawEdible: true },
        BREAD: { id: 'bread', name: 'Bread', icon: '🍞', calories: 200, protein: 7, carbs: 40, vitamins: 1, decayRate: 0.4, rawEdible: true },
        CHEESE: { id: 'cheese', name: 'Cheese', icon: '🧀', calories: 150, protein: 10, carbs: 2, vitamins: 4, decayRate: 0.3, rawEdible: true },
        BUTTER: { id: 'butter', name: 'Butter', icon: '🧈', calories: 100, protein: 0, carbs: 0, vitamins: 2, decayRate: 0.35, rawEdible: true },
        JAM: { id: 'jam', name: 'Jam', icon: '🍯', calories: 100, protein: 0, carbs: 25, vitamins: 5, decayRate: 0.15, rawEdible: true },
        JERKY: { id: 'jerky', name: 'Beef Jerky', icon: '🥩', calories: 150, protein: 25, carbs: 2, vitamins: 0, decayRate: 0.1, rawEdible: true },
        SMOKED_FISH: { id: 'smoked_fish', name: 'Smoked Fish', icon: '🐟', calories: 120, protein: 20, carbs: 0, vitamins: 3, decayRate: 0.15, rawEdible: true },
        SOUP: { id: 'soup', name: 'Vegetable Soup', icon: '🥣', calories: 80, protein: 3, carbs: 18, vitamins: 8, decayRate: 0.6, rawEdible: true },
        STEAK: { id: 'steak', name: 'Grilled Steak', icon: '🥩', calories: 300, protein: 35, carbs: 0, vitamins: 2, decayRate: 0.5, rawEdible: true },
        SALAD: { id: 'salad', name: 'Garden Salad', icon: '🥗', calories: 60, protein: 3, carbs: 12, vitamins: 15, decayRate: 0.5, rawEdible: true },
        PIZZA: { id: 'pizza', name: 'Pizza', icon: '🍕', calories: 250, protein: 12, carbs: 35, vitamins: 6, decayRate: 0.4, rawEdible: true },
        BURGER: { id: 'burger', name: 'Burger', icon: '🍔', calories: 350, protein: 28, carbs: 35, vitamins: 4, decayRate: 0.45, rawEdible: true },
        CAKE: { id: 'cake', name: 'Cake', icon: '🎂', calories: 400, protein: 8, carbs: 60, vitamins: 3, decayRate: 0.35, rawEdible: true },
        COOKIE: { id: 'cookie', name: 'Cookie', icon: '🍪', calories: 150, protein: 2, carbs: 25, vitamins: 1, decayRate: 0.4, rawEdible: true },
        HEALING_POTION: { id: 'healing_potion', name: 'Healing Potion', icon: '🧪', calories: 5, protein: 0, carbs: 1, vitamins: 2, decayRate: 0.1, rawEdible: true },
        STAMINA_POTION: { id: 'stamina_potion', name: 'Stamina Potion', icon: '💪', calories: 30, protein: 0, carbs: 8, vitamins: 3, decayRate: 0.1, rawEdible: true },
        WATER: { id: 'water', name: 'Water', icon: '💧', calories: 0, protein: 0, carbs: 0, vitamins: 0, decayRate: 0, rawEdible: true }
    };

    // ============= STATE =============
    let cookingQueue = [];
    let activeCookingStations = [];
    let playerNutrition = {
        calories: 0,
        protein: 0,
        carbs: 0,
        vitamins: 0
    };
    let nutritionBalance = 1.0;
    let foodInventory = [];
    let nextCookingId = 1;

    let buffEffects = [];
    let malnutritionSeverity = 0;

    // ============= COOKING QUEUE ITEM =============
    class CookingQueueItem {
        constructor(recipeId, station, quantity = 1) {
            this.id = nextCookingId++;
            this.recipeId = recipeId;
            this.recipe = RECIPES[recipeId.toUpperCase()];
            this.station = station;
            this.quantity = quantity;
            this.progress = 0;
            this.status = 'pending';
            this.quality = null;
            this.startTime = null;
        }

        start() {
            if (this.status !== 'pending') return false;

            this.status = 'cooking';
            this.startTime = Date.now();
            return true;
        }

        update(dt) {
            if (this.status !== 'cooking') return;

            this.progress += dt;

            if (this.progress >= this.recipe.cookingTime) {
                this.complete();
            }
        }

        complete() {
            this.status = 'complete';
            this.progress = this.recipe.cookingTime;

            // Calculate quality
            this.quality = this.calculateQuality();

            EventBus.emit('cooking:complete', {
                item: this,
                recipe: this.recipe,
                quality: this.quality
            });
        }

        calculateQuality() {
            let quality = CONFIG.COOKING_QUALITY_PERFECT;

            // Cooking station bonus
            if (this.station === 'oven') quality += 0.05;
            if (this.station === 'grill') quality += 0.03;

            // Random variation
            const variation = (Math.random() - 0.5) * 0.2;
            quality += variation;

            // Clamp
            quality = Math.max(0.1, Math.min(1.0, quality));

            return quality;
        }

        collect() {
            if (this.status !== 'complete') return [];

            const outputs = [];

            for (const [item, amount] of Object.entries(this.recipe.output)) {
                const outputAmount = Math.ceil(amount * this.quantity * this.quality);

                const foodItem = {
                    id: item,
                    name: FOOD_ITEMS[item.toUpperCase()]?.name || item,
                    icon: FOOD_ITEMS[item.toUpperCase()]?.icon || '🍖',
                    ...FOOD_ITEMS[item.toUpperCase()] || {},
                    quantity: outputAmount,
                    freshness: 100,
                    preserved: false,
                    buff: this.recipe.buff,
                    nutritionMultiplier: this.quality
                };

                outputs.push(foodItem);
            }

            return outputs;
        }
    }

    // ============= COOKING STATION CLASS =============
    class CookingStation {
        constructor(type, x, y) {
            this.type = type;
            this.x = x;
            this.y = y;
            this.fuel = 100;
            this.heat = 0;
            this.isActive = false;
            this.currentRecipe = null;
            this.inventory = [];
        }

        canCook(recipe) {
            if (!recipe.cookingMethod.includes(this.type)) return false;

            // Check ingredients
            for (const ingredient of recipe.ingredients) {
                const have = this.inventory.filter(i => i.id === ingredient.item).reduce((sum, i) => sum + i.quantity, 0);
                if (have < ingredient.amount) return false;
            }

            return true;
        }

        startCooking(recipeId) {
            const recipe = RECIPES[recipeId.toUpperCase()];
            if (!recipe) return false;
            if (!this.canCook(recipe)) return false;

            // Consume ingredients
            for (const ingredient of recipe.ingredients) {
                for (let i = this.inventory.length - 1; i >= 0; i--) {
                    if (this.inventory[i].id === ingredient.item && this.inventory[i].quantity >= ingredient.amount) {
                        this.inventory[i].quantity -= ingredient.amount;
                        if (this.inventory[i].quantity <= 0) {
                            this.inventory.splice(i, 1);
                        }
                        break;
                    }
                }
            }

            this.currentRecipe = new CookingQueueItem(recipeId, this.type);
            this.currentRecipe.start();
            this.isActive = true;

            return true;
        }

        update(dt) {
            // Fuel consumption
            if (this.isActive) {
                this.fuel -= dt * 0.5;
            }

            // Heat level
            this.heat = this.fuel > 0 ? 1 : 0;

            // Update cooking
            if (this.currentRecipe) {
                this.currentRecipe.update(dt);

                if (this.currentRecipe.status === 'complete') {
                    const outputs = this.currentRecipe.collect();
                    for (const output of outputs) {
                        this.inventory.push(output);
                    }

                    this.currentRecipe = null;
                    this.isActive = false;
                }
            }
        }

        addIngredient(item, amount) {
            const existing = this.inventory.find(i => i.id === item);
            if (existing) {
                existing.quantity += amount;
            } else {
                this.inventory.push({
                    id: item,
                    ...FOOD_ITEMS[item.toUpperCase()],
                    quantity: amount,
                    freshness: 100
                });
            }
        }

        takeOutput() {
            if (!this.currentRecipe || this.currentRecipe.status !== 'complete') return [];

            const outputs = this.currentRecipe.collect();
            this.currentRecipe = null;
            this.isActive = false;

            return outputs;
        }

        addFuel(amount) {
            this.fuel = Math.min(100, this.fuel + amount);
        }
    }

    // ============= NUTRITION SYSTEM =============
    function consumeFood(food) {
        if (!food || food.freshness <= 0) {
            if (typeof showNotification === 'function') {
                showNotification('This food is spoiled!', []);
            }
            return false;
        }

        // Calculate nutrition based on freshness
        const freshnessMod = food.freshness / 100;
        const qualityMod = food.nutritionMultiplier || 1.0;
        const totalMod = freshnessMod * qualityMod;

        const nutrition = {
            calories: (food.calories || 0) * totalMod,
            protein: (food.protein || 0) * totalMod,
            carbs: (food.carbs || 0) * totalMod,
            vitamins: (food.vitamins || 0) * totalMod
        };

        // Apply to totals
        playerNutrition.calories += nutrition.calories;
        playerNutrition.protein += nutrition.protein;
        playerNutrition.carbs += nutrition.carbs;
        playerNutrition.vitamins += nutrition.vitamins;

        // Restore hunger
        if (food.calories) {
            const hungerRestore = food.calories * 0.05 * totalMod;
            player.hunger = Math.min(100, player.hunger + hungerRestore);
        }

        // Restore health if food has healing properties
        if (food.buff?.effects?.instantHeal) {
            const healAmount = food.buff.effects.instantHeal * totalMod;
            player.health = Math.min(player.maxHealth, player.health + healAmount);
        }

        // Apply buff
        if (food.buff) {
            applyBuff(food.buff);
        }

        // Check for spoiled food effects
        if (food.freshness < CONFIG.SPOILED_THRESHOLD) {
            applyFoodPoisoning();
        }

        // Update balance
        updateNutritionBalance();

        EventBus.emit('food:consumed', { food: food, nutrition: nutrition });
        return true;
    }

    function updateNutritionBalance() {
        const target = CONFIG.NUTRITION_TARGET;

        const proteinRatio = playerNutrition.protein / target.protein;
        const carbRatio = playerNutrition.carbs / target.carbs;
        const vitaminRatio = playerNutrition.vitamins / target.vitamins;

        const deviation = Math.abs(1 - proteinRatio) + Math.abs(1 - carbRatio) + Math.abs(1 - vitaminRatio);
        nutritionBalance = Math.max(0, 1 - deviation / 3);

        // Malnutrition
        if (nutritionBalance < CONFIG.MALNUTRITION_THRESHOLD) {
            malnutritionSeverity = (CONFIG.MALNUTRITION_THRESHOLD - nutritionBalance) / CONFIG.MALNUTRITION_THRESHOLD;

            // Apply malnutrition effects
            player.health -= malnutritionSeverity * 0.5;
            player.speed *= 0.9;
        } else {
            malnutritionSeverity = 0;
        }
    }

    function applyBuff(buff) {
        const buffItem = {
            duration: buff.duration,
            remaining: buff.duration,
            effects: buff.effects
        };

        buffEffects.push(buffItem);

        EventBus.emit('buff:applied', { buff: buffItem });
    }

    function applyFoodPoisoning() {
        player.health -= 20;
        player.hunger = Math.max(0, player.hunger - 20);

        if (typeof addDamageNumber === 'function') {
            addDamageNumber(player.x, player.y - 0.5, 20, '#00ff00');
        }

        if (typeof showNotification === 'function') {
            showNotification('Food poisoning! -20 HP', []);
        }
    }

    function updateBuffs(dt) {
        for (let i = buffEffects.length - 1; i >= 0; i--) {
            const buff = buffEffects[i];
            buff.remaining -= dt;

            if (buff.remaining <= 0) {
                buffEffects.splice(i, 1);
                EventBus.emit('buff:expired', { buff: buff });
            }
        }
    }

    function getActiveBuffs() {
        return buffEffects.map(b => ({
            remaining: b.remaining,
            effects: b.effects
        }));
    }

    // ============= FOOD PRESERVATION =============
    function preserveFood(food, method) {
        const preservation = CONFIG.PRESERVATION_METHODS[method];
        if (!preservation) return null;

        const preserved = { ...food };
        preserved.freshness = 100;
        preserved.preserved = true;
        preserved.preservationMethod = method;
        preserved.decayRate = food.decayRate * preservation.decayMod;

        return preserved;
    }

    function updateFoodDecay(dt) {
        for (const food of foodInventory) {
            if (food.preserved) continue;

            const decay = (food.decayRate || CONFIG.FOOD_DECAY_RATE) * dt;
            food.freshness = Math.max(0, food.freshness - decay);
        }
    }

    // ============= COOKING MANAGEMENT =============
    function createCookingStation(type, x, y) {
        const station = new CookingStation(type, x, y);
        activeCookingStations.push(station);
        return station;
    }

    function getNearbyStation(x, y, type = null) {
        for (const station of activeCookingStations) {
            const dist = Math.sqrt((station.x - x) ** 2 + (station.y - y) ** 2);
            if (dist < 2) {
                if (!type || station.type === type) {
                    return station;
                }
            }
        }
        return null;
    }

    function addToInventory(food) {
        const existing = foodInventory.find(f => f.id === food.id && f.freshness === food.freshness);
        if (existing) {
            existing.quantity += food.quantity;
        } else {
            foodInventory.push({ ...food });
        }
    }

    function removeFromInventory(foodId, amount) {
        for (let i = foodInventory.length - 1; i >= 0; i--) {
            const food = foodInventory[i];
            if (food.id === foodId) {
                if (food.quantity > amount) {
                    food.quantity -= amount;
                    return amount;
                } else {
                    const taken = food.quantity;
                    foodInventory.splice(i, 1);
                    return taken;
                }
            }
        }
        return 0;
    }

    function getInventory() {
        return [...foodInventory];
    }

    // ============= UPDATE FUNCTIONS =============
    function update(dt) {
        // Update cooking stations
        for (const station of activeCookingStations) {
            station.update(dt);
        }

        // Update food decay
        updateFoodDecay(dt);

        // Update buffs
        updateBuffs(dt);

        // Daily nutrition reset (at new day)
        if (typeof dayNightCycle !== 'undefined' && dayNightCycle.time < 0.05) {
            // Gradually reset daily nutrition at day boundary
            playerNutrition = {
                calories: playerNutrition.calories * 0.1,
                protein: playerNutrition.protein * 0.1,
                carbs: playerNutrition.carbs * 0.1,
                vitamins: playerNutrition.vitamins * 0.1
            };
        }
    }

    // ============= RENDERING =============
    function renderCooking(ctx) {
        // Render cooking stations
        for (const station of activeCookingStations) {
            renderCookingStation(ctx, station);
        }
    }

    function renderCookingStation(ctx, station) {
        const screenX = (station.x - camera.x) * TILE_SIZE + ctx.canvas.width / 2;
        const screenY = (station.y - camera.y) * TILE_SIZE + ctx.canvas.height / 2;

        // Station base
        ctx.fillStyle = station.isActive ? '#884444' : '#666666';
        ctx.fillRect(screenX - TILE_SIZE / 2, screenY - TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);

        // Station icon
        ctx.font = `${TILE_SIZE * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const icons = { campfire: '🔥', stove: '🍳', oven: '🔥', smoker: '💨', grill: '🥓' };
        ctx.fillText(icons[station.type] || '🍽️', screenX, screenY);

        // Progress bar
        if (station.currentRecipe && station.currentRecipe.status === 'cooking') {
            const progress = station.currentRecipe.progress / station.currentRecipe.recipe.cookingTime;
            ctx.fillStyle = '#333';
            ctx.fillRect(screenX - TILE_SIZE / 2, screenY + TILE_SIZE / 2 - 8, TILE_SIZE, 4);
            ctx.fillStyle = '#ff6600';
            ctx.fillRect(screenX - TILE_SIZE / 2, screenY + TILE_SIZE / 2 - 8, TILE_SIZE * progress, 4);
        }

        // Fuel indicator
        if (station.fuel < 30) {
            ctx.font = '10px Arial';
            ctx.fillStyle = '#ff0000';
            ctx.fillText('⛽', screenX + TILE_SIZE / 3, screenY - TILE_SIZE / 3);
        }
    }

    // ============= UI FUNCTIONS =============
    function getNutritionStatus() {
        const target = CONFIG.NUTRITION_TARGET;

        const status = {
            calories: { current: Math.floor(playerNutrition.calories), target: target.calories },
            protein: { current: Math.floor(playerNutrition.protein), target: target.protein },
            carbs: { current: Math.floor(playerNutrition.carbs), target: target.carbs },
            vitamins: { current: Math.floor(playerNutrition.vitamins), target: target.vitamins },
            balance: nutritionBalance
        };

        // Calculate percentages
        for (const nutrient of ['calories', 'protein', 'carbs', 'vitamins']) {
            const ratio = playerNutrition[nutrient] / target[nutrient];
            if (ratio < 0.5) status[nutrient].status = 'deficient';
            else if (ratio < 0.9) status[nutrient].status = 'low';
            else if (ratio <= 1.1) status[nutrient].status = 'optimal';
            else if (ratio <= 1.5) status[nutrient].status = 'high';
            else status[nutrient].status = 'excessive';
        }

        return status;
    }

    function getMalnutritionStatus() {
        if (malnutritionSeverity === 0) return null;
        if (malnutritionSeverity < 0.3) return { level: 'mild', color: '#ffcc00' };
        if (malnutritionSeverity < 0.6) return { level: 'moderate', color: '#ff8800' };
        return { level: 'severe', color: '#ff0000' };
    }

    function getActiveBuffStatus() {
        return buffEffects.map(buff => ({
            remaining: Math.ceil(buff.remaining),
            effects: buff.effects
        }));
    }

    // ============= RECIPE BOOK =============
    function getRecipeBook() {
        const unlocked = [];
        const locked = [];

        for (const [id, recipe] of Object.entries(RECIPES)) {
            const entry = { id, ...recipe };

            // Check if player has discovered recipe
            const isUnlocked = player.recipes?.includes(id.toLowerCase()) || Math.random() < 0.3;

            if (isUnlocked) {
                unlocked.push(entry);
            } else {
                locked.push(entry);
            }
        }

        return { unlocked, locked };
    }

    function discoverRecipe(recipeId) {
        if (!player.recipes) player.recipes = [];
        if (!player.recipes.includes(recipeId.toLowerCase())) {
            player.recipes.push(recipeId.toLowerCase());
            EventBus.emit('recipe:discovered', { recipeId: recipeId });
            return true;
        }
        return false;
    }

    // ============= SERIALIZATION =============
    function getState() {
        return {
            foodInventory: foodInventory.map(f => ({ ...f })),
            playerNutrition: { ...playerNutrition },
            nutritionBalance: nutritionBalance,
            malnutritionSeverity: malnutritionSeverity,
            buffEffects: buffEffects.map(b => ({ ...b })),
            activeCookingStations: activeCookingStations.map(s => ({
                type: s.type,
                x: s.x,
                y: s.y,
                fuel: s.fuel,
                heat: s.heat,
                isActive: s.isActive,
                currentRecipe: s.currentRecipe ? {
                    recipeId: s.currentRecipe.recipeId,
                    progress: s.currentRecipe.progress,
                    status: s.currentRecipe.status,
                    quality: s.currentRecipe.quality
                } : null,
                inventory: s.inventory.map(i => ({ ...i }))
            })),
            recipesDiscovered: player.recipes || []
        };
    }

    function setState(state) {
        if (!state) return;

        foodInventory = state.foodInventory || [];
        playerNutrition = state.playerNutrition || { calories: 0, protein: 0, carbs: 0, vitamins: 0 };
        nutritionBalance = state.nutritionBalance || 1.0;
        malnutritionSeverity = state.malnutritionSeverity || 0;
        buffEffects = state.buffEffects || [];
        player.recipes = state.recipesDiscovered || [];

        activeCookingStations = [];
        if (state.activeCookingStations) {
            for (const sState of state.activeCookingStations) {
                const station = new CookingStation(sState.type, sState.x, sState.y);
                station.fuel = sState.fuel;
                station.heat = sState.heat;
                station.isActive = sState.isActive;
                station.inventory = sState.inventory || [];

                if (sState.currentRecipe) {
                    station.currentRecipe = new CookingQueueItem(sState.currentRecipe.recipeId, station.type);
                    station.currentRecipe.progress = sState.currentRecipe.progress;
                    station.currentRecipe.status = sState.currentRecipe.status;
                    station.currentRecipe.quality = sState.currentRecipe.quality;
                }

                activeCookingStations.push(station);
            }
        }
    }

    // ============= PUBLIC API =============
    return {
        // Configuration
        CONFIG,
        RECIPES,
        FOOD_ITEMS,

        // Cooking Management
        createCookingStation,
        getNearbyStation,
        addToInventory,
        removeFromInventory,
        getInventory,

        // Food Consumption
        consumeFood,

        // Nutrition
        getNutritionStatus,
        getMalnutritionStatus,
        updateNutritionBalance,

        // Buffs
        applyBuff,
        getActiveBuffs,

        // Preservation
        preserveFood,

        // Recipe Book
        getRecipeBook,
        discoverRecipe,

        // Update & Render
        update,
        renderCooking,

        // State
        getState,
        setState
    };
})();

window.CookingSystem = CookingSystem;
