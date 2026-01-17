// ============================================
// ACHIEVEMENT SYSTEM - Unlockables & Rewards
// ============================================
// Complete achievement system with categories, tiers,
// progress tracking, unlockables, and special rewards

const AchievementSystem = (function () {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        NOTIFICATION_DURATION: 5,       // Seconds to show achievement popup
        POINTS_PER_TIER: {
            bronze: 10,
            silver: 25,
            gold: 50,
            platinum: 100,
            legendary: 250
        },
        UNLOCK_CHECK_INTERVAL: 5        // Seconds between automatic checks
    };

    // ============= ACHIEVEMENT CATEGORIES =============
    const CATEGORIES = {
        COMBAT: { id: 'combat', name: 'Combat', icon: '⚔️', color: '#ff4444' },
        SURVIVAL: { id: 'survival', name: 'Survival', icon: '🏕️', color: '#44ff44' },
        BUILDING: { id: 'building', name: 'Building', icon: '🏗️', color: '#4488ff' },
        EXPLORATION: { id: 'exploration', name: 'Exploration', icon: '🗺️', color: '#ffaa44' },
        CRAFTING: { id: 'crafting', name: 'Crafting', icon: '🔨', color: '#aa44ff' },
        SOCIAL: { id: 'social', name: 'Social', icon: '👥', color: '#44ffff' },
        SPECIAL: { id: 'special', name: 'Special', icon: '⭐', color: '#ffd700' }
    };

    // ============= TIER DEFINITIONS =============
    const TIERS = {
        BRONZE: { id: 'bronze', name: 'Bronze', color: '#cd7f32', icon: '🥉' },
        SILVER: { id: 'silver', name: 'Silver', color: '#c0c0c0', icon: '🥈' },
        GOLD: { id: 'gold', name: 'Gold', color: '#ffd700', icon: '🥇' },
        PLATINUM: { id: 'platinum', name: 'Platinum', color: '#e5e4e2', icon: '💎' },
        LEGENDARY: { id: 'legendary', name: 'Legendary', color: '#ff6600', icon: '👑' }
    };

    // ============= ACHIEVEMENT DEFINITIONS =============
    const ACHIEVEMENTS = {
        // ========== COMBAT ACHIEVEMENTS ==========
        first_blood: {
            id: 'first_blood',
            name: 'First Blood',
            description: 'Kill your first zombie',
            category: CATEGORIES.COMBAT,
            tier: TIERS.BRONZE,
            requirement: { type: 'zombies_killed', amount: 1 },
            reward: { xp: 25 },
            icon: '🩸'
        },

        zombie_slayer: {
            id: 'zombie_slayer',
            name: 'Zombie Slayer',
            description: 'Kill 100 zombies',
            category: CATEGORIES.COMBAT,
            tier: TIERS.BRONZE,
            requirement: { type: 'zombies_killed', amount: 100 },
            reward: { xp: 100, item: 'health_potion' },
            icon: '💀'
        },

        zombie_hunter: {
            id: 'zombie_hunter',
            name: 'Zombie Hunter',
            description: 'Kill 500 zombies',
            category: CATEGORIES.COMBAT,
            tier: TIERS.SILVER,
            requirement: { type: 'zombies_killed', amount: 500 },
            reward: { xp: 300, skillPoints: 1 },
            icon: '🎯'
        },

        zombie_exterminator: {
            id: 'zombie_exterminator',
            name: 'Zombie Exterminator',
            description: 'Kill 1,000 zombies',
            category: CATEGORIES.COMBAT,
            tier: TIERS.GOLD,
            requirement: { type: 'zombies_killed', amount: 1000 },
            reward: { xp: 500, perkPoints: 1, title: 'Exterminator' },
            icon: '☠️'
        },

        zombie_apocalypse: {
            id: 'zombie_apocalypse',
            name: 'Walking Apocalypse',
            description: 'Kill 5,000 zombies',
            category: CATEGORIES.COMBAT,
            tier: TIERS.PLATINUM,
            requirement: { type: 'zombies_killed', amount: 5000 },
            reward: { xp: 1500, item: 'legendary_sword', title: 'Apocalypse' },
            icon: '💥'
        },

        special_hunter: {
            id: 'special_hunter',
            name: 'Special Hunter',
            description: 'Kill 50 special zombies',
            category: CATEGORIES.COMBAT,
            tier: TIERS.SILVER,
            requirement: { type: 'special_zombies_killed', amount: 50 },
            reward: { xp: 250, item: 'hunters_ring' },
            icon: '🎖️'
        },

        boss_slayer: {
            id: 'boss_slayer',
            name: 'Boss Slayer',
            description: 'Defeat your first boss',
            category: CATEGORIES.COMBAT,
            tier: TIERS.SILVER,
            requirement: { type: 'bosses_killed', amount: 1 },
            reward: { xp: 300, perkPoints: 1 },
            icon: '👹'
        },

        titan_hunter: {
            id: 'titan_hunter',
            name: 'Titan Hunter',
            description: 'Defeat the Zombie Titan',
            category: CATEGORIES.COMBAT,
            tier: TIERS.GOLD,
            requirement: { type: 'specific_boss', boss: 'TITAN' },
            reward: { xp: 500, item: 'titans_heart', title: 'Titan Slayer' },
            icon: '🗿'
        },

        queen_slayer: {
            id: 'queen_slayer',
            name: 'Regicide',
            description: 'Defeat the Zombie Queen',
            category: CATEGORIES.COMBAT,
            tier: TIERS.GOLD,
            requirement: { type: 'specific_boss', boss: 'QUEEN' },
            reward: { xp: 750, item: 'queens_crown', title: 'Kingslayer' },
            icon: '👸'
        },

        horde_survivor: {
            id: 'horde_survivor',
            name: 'Horde Survivor',
            description: 'Survive a zombie horde',
            category: CATEGORIES.COMBAT,
            tier: TIERS.SILVER,
            requirement: { type: 'hordes_survived', amount: 1 },
            reward: { xp: 200 },
            icon: '🌊'
        },

        horde_master: {
            id: 'horde_master',
            name: 'Horde Master',
            description: 'Survive 10 zombie hordes',
            category: CATEGORIES.COMBAT,
            tier: TIERS.GOLD,
            requirement: { type: 'hordes_survived', amount: 10 },
            reward: { xp: 500, perkPoints: 2, title: 'Horde Master' },
            icon: '🌪️'
        },

        // ========== SURVIVAL ACHIEVEMENTS ==========
        first_night: {
            id: 'first_night',
            name: 'First Night',
            description: 'Survive your first night',
            category: CATEGORIES.SURVIVAL,
            tier: TIERS.BRONZE,
            requirement: { type: 'nights_survived', amount: 1 },
            reward: { xp: 50 },
            icon: '🌙'
        },

        week_survivor: {
            id: 'week_survivor',
            name: 'Week Survivor',
            description: 'Survive 7 nights',
            category: CATEGORIES.SURVIVAL,
            tier: TIERS.BRONZE,
            requirement: { type: 'nights_survived', amount: 7 },
            reward: { xp: 150, resources: { food: 50 } },
            icon: '📅'
        },

        month_survivor: {
            id: 'month_survivor',
            name: 'Month Survivor',
            description: 'Survive 30 nights',
            category: CATEGORIES.SURVIVAL,
            tier: TIERS.SILVER,
            requirement: { type: 'nights_survived', amount: 30 },
            reward: { xp: 400, skillPoints: 2, title: 'Veteran' },
            icon: '🗓️'
        },

        century_survivor: {
            id: 'century_survivor',
            name: 'Century Survivor',
            description: 'Survive 100 nights',
            category: CATEGORIES.SURVIVAL,
            tier: TIERS.PLATINUM,
            requirement: { type: 'nights_survived', amount: 100 },
            reward: { xp: 1000, perkPoints: 3, title: 'Legend', item: 'legendary_armor' },
            icon: '♾️'
        },

        blood_moon_survivor: {
            id: 'blood_moon_survivor',
            name: 'Blood Moon Survivor',
            description: 'Survive a Blood Moon night',
            category: CATEGORIES.SURVIVAL,
            tier: TIERS.GOLD,
            requirement: { type: 'blood_moons_survived', amount: 1 },
            reward: { xp: 300, item: 'blood_moon_charm' },
            icon: '🔴'
        },

        near_death: {
            id: 'near_death',
            name: 'Near Death Experience',
            description: 'Survive with less than 5% health',
            category: CATEGORIES.SURVIVAL,
            tier: TIERS.BRONZE,
            requirement: { type: 'near_death', threshold: 0.05 },
            reward: { xp: 75 },
            icon: '💔'
        },

        ironman: {
            id: 'ironman',
            name: 'Iron Man',
            description: 'Survive 10 nights without dying',
            category: CATEGORIES.SURVIVAL,
            tier: TIERS.GOLD,
            requirement: { type: 'consecutive_nights', amount: 10 },
            reward: { xp: 500, title: 'Ironman', perkPoints: 1 },
            icon: '🛡️'
        },

        // ========== BUILDING ACHIEVEMENTS ==========
        first_wall: {
            id: 'first_wall',
            name: 'First Wall',
            description: 'Build your first wall',
            category: CATEGORIES.BUILDING,
            tier: TIERS.BRONZE,
            requirement: { type: 'buildings_built', building: 'wall', amount: 1 },
            reward: { xp: 25 },
            icon: '🧱'
        },

        fortress: {
            id: 'fortress',
            name: 'Fortress',
            description: 'Build 50 walls',
            category: CATEGORIES.BUILDING,
            tier: TIERS.SILVER,
            requirement: { type: 'buildings_built', building: 'wall', amount: 50 },
            reward: { xp: 200, resources: { stone: 100 } },
            icon: '🏰'
        },

        tower_defense: {
            id: 'tower_defense',
            name: 'Tower Defense',
            description: 'Build 5 guard towers',
            category: CATEGORIES.BUILDING,
            tier: TIERS.SILVER,
            requirement: { type: 'buildings_built', building: 'tower', amount: 5 },
            reward: { xp: 250, resources: { iron: 50 } },
            icon: '🗼'
        },

        artillery_commander: {
            id: 'artillery_commander',
            name: 'Artillery Commander',
            description: 'Build 10 cannons',
            category: CATEGORIES.BUILDING,
            tier: TIERS.GOLD,
            requirement: { type: 'buildings_built', building: 'cannon', amount: 10 },
            reward: { xp: 400, perkPoints: 1, title: 'Commander' },
            icon: '💣'
        },

        master_builder: {
            id: 'master_builder',
            name: 'Master Builder',
            description: 'Upgrade a building to max level',
            category: CATEGORIES.BUILDING,
            tier: TIERS.GOLD,
            requirement: { type: 'max_level_building', amount: 1 },
            reward: { xp: 350, skillPoints: 1, title: 'Master Builder' },
            icon: '🏛️'
        },

        city_planner: {
            id: 'city_planner',
            name: 'City Planner',
            description: 'Build 100 structures total',
            category: CATEGORIES.BUILDING,
            tier: TIERS.GOLD,
            requirement: { type: 'total_buildings', amount: 100 },
            reward: { xp: 500, perkPoints: 1 },
            icon: '🌆'
        },

        // ========== EXPLORATION ACHIEVEMENTS ==========
        explorer: {
            id: 'explorer',
            name: 'Explorer',
            description: 'Travel 1000 tiles',
            category: CATEGORIES.EXPLORATION,
            tier: TIERS.BRONZE,
            requirement: { type: 'distance_traveled', amount: 1000 },
            reward: { xp: 100 },
            icon: '🧭'
        },

        world_traveler: {
            id: 'world_traveler',
            name: 'World Traveler',
            description: 'Travel 10,000 tiles',
            category: CATEGORIES.EXPLORATION,
            tier: TIERS.SILVER,
            requirement: { type: 'distance_traveled', amount: 10000 },
            reward: { xp: 300, item: 'explorers_boots' },
            icon: '🌍'
        },

        biome_discoverer: {
            id: 'biome_discoverer',
            name: 'Biome Discoverer',
            description: 'Discover a new biome',
            category: CATEGORIES.EXPLORATION,
            tier: TIERS.BRONZE,
            requirement: { type: 'biomes_discovered', amount: 1 },
            reward: { xp: 75 },
            icon: '🏝️'
        },

        biome_master: {
            id: 'biome_master',
            name: 'Biome Master',
            description: 'Discover all biomes',
            category: CATEGORIES.EXPLORATION,
            tier: TIERS.GOLD,
            requirement: { type: 'biomes_discovered', amount: 6 },
            reward: { xp: 500, title: 'World Explorer', perkPoints: 1 },
            icon: '🌎'
        },

        desert_survivor: {
            id: 'desert_survivor',
            name: 'Desert Survivor',
            description: 'Survive in the desert biome',
            category: CATEGORIES.EXPLORATION,
            tier: TIERS.BRONZE,
            requirement: { type: 'biome_survival', biome: 'desert' },
            reward: { xp: 100 },
            icon: '🏜️'
        },

        snow_survivor: {
            id: 'snow_survivor',
            name: 'Ice Walker',
            description: 'Survive in the snow biome',
            category: CATEGORIES.EXPLORATION,
            tier: TIERS.BRONZE,
            requirement: { type: 'biome_survival', biome: 'snow' },
            reward: { xp: 100 },
            icon: '❄️'
        },

        volcanic_survivor: {
            id: 'volcanic_survivor',
            name: 'Firewalker',
            description: 'Survive in the volcanic biome',
            category: CATEGORIES.EXPLORATION,
            tier: TIERS.SILVER,
            requirement: { type: 'biome_survival', biome: 'volcanic' },
            reward: { xp: 200, item: 'fire_resistance_potion' },
            icon: '🌋'
        },

        // ========== CRAFTING ACHIEVEMENTS ==========
        first_craft: {
            id: 'first_craft',
            name: 'Craftsman',
            description: 'Craft your first item',
            category: CATEGORIES.CRAFTING,
            tier: TIERS.BRONZE,
            requirement: { type: 'items_crafted', amount: 1 },
            reward: { xp: 25 },
            icon: '🔧'
        },

        prolific_crafter: {
            id: 'prolific_crafter',
            name: 'Prolific Crafter',
            description: 'Craft 50 items',
            category: CATEGORIES.CRAFTING,
            tier: TIERS.SILVER,
            requirement: { type: 'items_crafted', amount: 50 },
            reward: { xp: 200, resources: { iron: 30 } },
            icon: '⚒️'
        },

        legendary_smith: {
            id: 'legendary_smith',
            name: 'Legendary Smith',
            description: 'Craft a legendary item',
            category: CATEGORIES.CRAFTING,
            tier: TIERS.PLATINUM,
            requirement: { type: 'legendary_crafted', amount: 1 },
            reward: { xp: 500, title: 'Legendary Smith', perkPoints: 2 },
            icon: '🗡️'
        },

        potion_master: {
            id: 'potion_master',
            name: 'Potion Master',
            description: 'Craft 20 potions',
            category: CATEGORIES.CRAFTING,
            tier: TIERS.SILVER,
            requirement: { type: 'potions_crafted', amount: 20 },
            reward: { xp: 250, item: 'alchemist_kit' },
            icon: '🧪'
        },

        // ========== SOCIAL ACHIEVEMENTS ==========
        first_rescue: {
            id: 'first_rescue',
            name: 'Good Samaritan',
            description: 'Rescue your first survivor',
            category: CATEGORIES.SOCIAL,
            tier: TIERS.BRONZE,
            requirement: { type: 'survivors_rescued', amount: 1 },
            reward: { xp: 50 },
            icon: '🤝'
        },

        rescue_squad: {
            id: 'rescue_squad',
            name: 'Rescue Squad',
            description: 'Rescue 10 survivors',
            category: CATEGORIES.SOCIAL,
            tier: TIERS.SILVER,
            requirement: { type: 'survivors_rescued', amount: 10 },
            reward: { xp: 300, title: 'Rescuer' },
            icon: '🚑'
        },

        community_leader: {
            id: 'community_leader',
            name: 'Community Leader',
            description: 'Have 20 survivors in your base',
            category: CATEGORIES.SOCIAL,
            tier: TIERS.GOLD,
            requirement: { type: 'active_survivors', amount: 20 },
            reward: { xp: 500, perkPoints: 2, title: 'Leader' },
            icon: '👔'
        },

        high_morale: {
            id: 'high_morale',
            name: 'Morale Booster',
            description: 'Reach excellent morale',
            category: CATEGORIES.SOCIAL,
            tier: TIERS.SILVER,
            requirement: { type: 'morale_level', level: 'excellent' },
            reward: { xp: 200 },
            icon: '😊'
        },

        // ========== SPECIAL ACHIEVEMENTS ==========
        quest_completer: {
            id: 'quest_completer',
            name: 'Quest Completer',
            description: 'Complete 10 quests',
            category: CATEGORIES.SPECIAL,
            tier: TIERS.SILVER,
            requirement: { type: 'quests_completed', amount: 10 },
            reward: { xp: 300, item: 'quest_compass' },
            icon: '📜'
        },

        main_story: {
            id: 'main_story',
            name: 'Story Complete',
            description: 'Complete the main story',
            category: CATEGORIES.SPECIAL,
            tier: TIERS.LEGENDARY,
            requirement: { type: 'main_story_complete' },
            reward: { xp: 2000, title: 'Hero', perkPoints: 5, item: 'hero_armor' },
            icon: '📖'
        },

        speed_runner: {
            id: 'speed_runner',
            name: 'Speed Runner',
            description: 'Reach day 10 in under 30 minutes',
            category: CATEGORIES.SPECIAL,
            tier: TIERS.GOLD,
            requirement: { type: 'speed_run', day: 10, time: 1800 },
            reward: { xp: 400, title: 'Speedster' },
            icon: '⏱️'
        },

        pacifist: {
            id: 'pacifist',
            name: 'Pacifist',
            description: 'Survive a night without killing',
            category: CATEGORIES.SPECIAL,
            tier: TIERS.GOLD,
            requirement: { type: 'pacifist_night' },
            reward: { xp: 300, title: 'Pacifist' },
            icon: '☮️'
        },

        collector: {
            id: 'collector',
            name: 'Collector',
            description: 'Own 50 different items',
            category: CATEGORIES.SPECIAL,
            tier: TIERS.GOLD,
            requirement: { type: 'unique_items', amount: 50 },
            reward: { xp: 400, title: 'Collector' },
            icon: '🎒'
        },

        completionist: {
            id: 'completionist',
            name: 'Completionist',
            description: 'Unlock all other achievements',
            category: CATEGORIES.SPECIAL,
            tier: TIERS.LEGENDARY,
            requirement: { type: 'all_achievements' },
            reward: { xp: 5000, title: 'Completionist', item: 'golden_crown' },
            icon: '🏆'
        }
    };

    // ============= STATE =============
    let unlockedAchievements = new Set();
    let achievementProgress = {};
    let totalPoints = 0;
    let recentUnlocks = [];
    let checkTimer = 0;

    // ============= TRACKING STATS =============
    let stats = {
        zombiesKilled: 0,
        specialZombiesKilled: 0,
        bossesKilled: {},
        nightsSurvived: 0,
        consecutiveNights: 0,
        bloodMoonsSurvived: 0,
        buildingsBuilt: {},
        totalBuildings: 0,
        maxLevelBuildings: 0,
        distanceTraveled: 0,
        biomesDiscovered: new Set(),
        biomeSurvival: new Set(),
        itemsCrafted: 0,
        potionsCrafted: 0,
        legendaryCrafted: 0,
        survivorsRescued: 0,
        questsCompleted: 0,
        hordesSurvived: 0,
        nearDeathExperiences: 0,
        uniqueItems: new Set(),
        playTime: 0,
        mainStoryComplete: false
    };

    // ============= ACHIEVEMENT CHECKING =============
    function checkAchievements() {
        for (const achievement of Object.values(ACHIEVEMENTS)) {
            if (unlockedAchievements.has(achievement.id)) continue;

            if (checkRequirement(achievement)) {
                unlockAchievement(achievement);
            }
        }
    }

    function checkRequirement(achievement) {
        const req = achievement.requirement;

        switch (req.type) {
            case 'zombies_killed':
                return stats.zombiesKilled >= req.amount;

            case 'special_zombies_killed':
                return stats.specialZombiesKilled >= req.amount;

            case 'bosses_killed':
                const totalBosses = Object.values(stats.bossesKilled).reduce((a, b) => a + b, 0);
                return totalBosses >= req.amount;

            case 'specific_boss':
                return (stats.bossesKilled[req.boss] || 0) >= 1;

            case 'nights_survived':
                return stats.nightsSurvived >= req.amount;

            case 'consecutive_nights':
                return stats.consecutiveNights >= req.amount;

            case 'blood_moons_survived':
                return stats.bloodMoonsSurvived >= req.amount;

            case 'near_death':
                return stats.nearDeathExperiences > 0;

            case 'buildings_built':
                if (req.building) {
                    return (stats.buildingsBuilt[req.building] || 0) >= req.amount;
                }
                return stats.totalBuildings >= req.amount;

            case 'total_buildings':
                return stats.totalBuildings >= req.amount;

            case 'max_level_building':
                return stats.maxLevelBuildings >= req.amount;

            case 'distance_traveled':
                return stats.distanceTraveled >= req.amount;

            case 'biomes_discovered':
                return stats.biomesDiscovered.size >= req.amount;

            case 'biome_survival':
                return stats.biomeSurvival.has(req.biome);

            case 'items_crafted':
                return stats.itemsCrafted >= req.amount;

            case 'potions_crafted':
                return stats.potionsCrafted >= req.amount;

            case 'legendary_crafted':
                return stats.legendaryCrafted >= req.amount;

            case 'survivors_rescued':
                return stats.survivorsRescued >= req.amount;

            case 'active_survivors':
                return (typeof survivors !== 'undefined' ? survivors.length : 0) >= req.amount;

            case 'morale_level':
                if (typeof MoraleSystem !== 'undefined') {
                    return MoraleSystem.getMoraleLevel() === req.level;
                }
                return false;

            case 'quests_completed':
                return stats.questsCompleted >= req.amount;

            case 'hordes_survived':
                return stats.hordesSurvived >= req.amount;

            case 'main_story_complete':
                return stats.mainStoryComplete;

            case 'speed_run':
                return (dayCount || 0) >= req.day && stats.playTime <= req.time;

            case 'unique_items':
                return stats.uniqueItems.size >= req.amount;

            case 'all_achievements':
                const totalAchievements = Object.keys(ACHIEVEMENTS).length;
                return unlockedAchievements.size >= totalAchievements - 1; // Exclude self

            case 'pacifist_night':
                // Tracked separately during night cycles
                return achievementProgress.pacifistNight || false;

            default:
                return false;
        }
    }

    function unlockAchievement(achievement) {
        if (unlockedAchievements.has(achievement.id)) return;

        unlockedAchievements.add(achievement.id);
        totalPoints += CONFIG.POINTS_PER_TIER[achievement.tier.id] || 10;

        // Grant rewards
        grantRewards(achievement.reward);

        // Add to recent unlocks
        recentUnlocks.push({
            achievement: achievement,
            time: Date.now()
        });

        // Keep recent list manageable
        if (recentUnlocks.length > 10) {
            recentUnlocks = recentUnlocks.slice(-10);
        }

        // Show notification
        showAchievementNotification(achievement);

        // Track stats
        if (window.gameStats) {
            window.gameStats.achievementsUnlocked = (window.gameStats.achievementsUnlocked || 0) + 1;
        }

        // Check for completionist
        if (achievement.id !== 'completionist') {
            checkAchievements();
        }
    }

    function grantRewards(reward) {
        if (!reward) return;

        // XP
        if (reward.xp) {
            player.exp = (player.exp || 0) + reward.xp;
            if (typeof checkLevelUp === 'function') {
                checkLevelUp();
            }
        }

        // Resources
        if (reward.resources) {
            for (const [resource, amount] of Object.entries(reward.resources)) {
                resources[resource] = (resources[resource] || 0) + amount;
            }
        }

        // Items
        if (reward.item && typeof EquipmentSystem !== 'undefined') {
            const item = EquipmentSystem.createItem(reward.item);
            if (item) EquipmentSystem.addToInventory(item);
        }

        // Skill Points
        if (reward.skillPoints && typeof SkillSystem !== 'undefined') {
            SkillSystem.addSkillPoints(reward.skillPoints);
        }

        // Perk Points
        if (reward.perkPoints && typeof SkillSystem !== 'undefined') {
            SkillSystem.addPerkPoints(reward.perkPoints);
        }

        // Title
        if (reward.title) {
            player.titles = player.titles || [];
            if (!player.titles.includes(reward.title)) {
                player.titles.push(reward.title);
            }
        }
    }

    function showAchievementNotification(achievement) {
        if (typeof showNotification === 'function') {
            showNotification(
                `<div style="text-align: center;">
                    <div style="font-size: 24px;">${achievement.icon}</div>
                    <div style="color: ${achievement.tier.color}; font-weight: bold;">
                        ${achievement.tier.icon} ACHIEVEMENT UNLOCKED!
                    </div>
                    <div style="font-size: 16px; margin: 5px 0;">${achievement.name}</div>
                    <div style="font-size: 12px; opacity: 0.8;">${achievement.description}</div>
                </div>`,
                [{ text: 'Awesome!', action: () => { }, class: 'accept' }]
            );
        }

        // Celebration particles
        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 30; i++) {
                setTimeout(() => {
                    spawnParticles(
                        player.x + (Math.random() - 0.5) * 3,
                        player.y + (Math.random() - 0.5) * 3,
                        achievement.tier.color, 3
                    );
                }, i * 30);
            }
        }

        // Screen shake
        if (camera) {
            camera.shake = 3;
        }
    }

    // ============= STAT TRACKING FUNCTIONS =============
    function onZombieKilled(zombie) {
        stats.zombiesKilled++;

        // Check for special types
        if (zombie.typeId && !['NORMAL'].includes(zombie.typeId)) {
            stats.specialZombiesKilled++;
        }

        // Check for boss
        if (zombie.tier === 'boss' && zombie.typeId) {
            stats.bossesKilled[zombie.typeId] = (stats.bossesKilled[zombie.typeId] || 0) + 1;
        }

        checkAchievements();
    }

    function onNightSurvived() {
        stats.nightsSurvived++;
        stats.consecutiveNights++;
        checkAchievements();
    }

    function onPlayerDeath() {
        stats.consecutiveNights = 0;
    }

    function onBloodMoonSurvived() {
        stats.bloodMoonsSurvived++;
        checkAchievements();
    }

    function onBuildingPlaced(buildingType) {
        stats.buildingsBuilt[buildingType] = (stats.buildingsBuilt[buildingType] || 0) + 1;
        stats.totalBuildings++;
        checkAchievements();
    }

    function onBuildingUpgraded(buildingType, level) {
        if (level >= 5) { // Max level
            stats.maxLevelBuildings++;
            checkAchievements();
        }
    }

    function onDistanceTraveled(distance) {
        stats.distanceTraveled += distance;
        // Check occasionally to reduce overhead
        if (Math.random() < 0.1) {
            checkAchievements();
        }
    }

    function onBiomeDiscovered(biomeId) {
        stats.biomesDiscovered.add(biomeId);
        checkAchievements();
    }

    function onBiomeSurvived(biomeId) {
        stats.biomeSurvival.add(biomeId);
        checkAchievements();
    }

    function onItemCrafted(itemId, rarity) {
        stats.itemsCrafted++;

        if (itemId.includes('potion') || itemId.includes('elixir')) {
            stats.potionsCrafted++;
        }

        if (rarity === 'legendary') {
            stats.legendaryCrafted++;
        }

        checkAchievements();
    }

    function onSurvivorRescued() {
        stats.survivorsRescued++;
        checkAchievements();
    }

    function onQuestCompleted(questId) {
        stats.questsCompleted++;
        checkAchievements();
    }

    function onHordeSurvived() {
        stats.hordesSurvived++;
        checkAchievements();
    }

    function onMainStoryComplete() {
        stats.mainStoryComplete = true;
        checkAchievements();
    }

    function onItemAcquired(itemId) {
        stats.uniqueItems.add(itemId);
        if (Math.random() < 0.2) {
            checkAchievements();
        }
    }

    function onNearDeath() {
        stats.nearDeathExperiences++;
        checkAchievements();
    }

    // ============= UPDATE =============
    function update(dt) {
        stats.playTime += dt;

        // Check near death
        if (player.health > 0 && player.health < player.maxHealth * 0.05) {
            onNearDeath();
        }

        // Periodic achievement check
        checkTimer += dt;
        if (checkTimer >= CONFIG.UNLOCK_CHECK_INTERVAL) {
            checkTimer = 0;
            checkAchievements();
        }
    }

    // ============= UI FUNCTIONS =============
    function getAchievementList() {
        const list = [];

        for (const achievement of Object.values(ACHIEVEMENTS)) {
            const unlocked = unlockedAchievements.has(achievement.id);
            const progress = getAchievementProgress(achievement);

            list.push({
                ...achievement,
                unlocked: unlocked,
                progress: progress.current,
                maxProgress: progress.max,
                progressPercent: progress.percent
            });
        }

        return list;
    }

    function getAchievementProgress(achievement) {
        const req = achievement.requirement;
        let current = 0;
        let max = req.amount || 1;

        switch (req.type) {
            case 'zombies_killed':
                current = stats.zombiesKilled;
                break;
            case 'special_zombies_killed':
                current = stats.specialZombiesKilled;
                break;
            case 'bosses_killed':
                current = Object.values(stats.bossesKilled).reduce((a, b) => a + b, 0);
                break;
            case 'nights_survived':
                current = stats.nightsSurvived;
                break;
            case 'distance_traveled':
                current = Math.floor(stats.distanceTraveled);
                break;
            case 'biomes_discovered':
                current = stats.biomesDiscovered.size;
                break;
            case 'items_crafted':
                current = stats.itemsCrafted;
                break;
            case 'survivors_rescued':
                current = stats.survivorsRescued;
                break;
            case 'quests_completed':
                current = stats.questsCompleted;
                break;
            case 'hordes_survived':
                current = stats.hordesSurvived;
                break;
            default:
                current = unlockedAchievements.has(achievement.id) ? 1 : 0;
                max = 1;
        }

        return {
            current: Math.min(current, max),
            max: max,
            percent: Math.min(100, (current / max) * 100)
        };
    }

    function getAchievementsByCategory(categoryId) {
        return getAchievementList().filter(a => a.category.id === categoryId);
    }

    function getUnlockedCount() {
        return unlockedAchievements.size;
    }

    function getTotalCount() {
        return Object.keys(ACHIEVEMENTS).length;
    }

    function getCompletionPercent() {
        return (unlockedAchievements.size / Object.keys(ACHIEVEMENTS).length) * 100;
    }

    // ============= SERIALIZATION =============
    function getState() {
        return {
            unlockedAchievements: Array.from(unlockedAchievements),
            totalPoints: totalPoints,
            stats: {
                ...stats,
                biomesDiscovered: Array.from(stats.biomesDiscovered),
                biomeSurvival: Array.from(stats.biomeSurvival),
                uniqueItems: Array.from(stats.uniqueItems)
            }
        };
    }

    function setState(state) {
        if (!state) return;

        unlockedAchievements = new Set(state.unlockedAchievements || []);
        totalPoints = state.totalPoints || 0;

        if (state.stats) {
            stats = {
                ...stats,
                ...state.stats,
                biomesDiscovered: new Set(state.stats.biomesDiscovered || []),
                biomeSurvival: new Set(state.stats.biomeSurvival || []),
                uniqueItems: new Set(state.stats.uniqueItems || [])
            };
        }
    }

    // ============= PUBLIC API =============
    return {
        // Constants
        ACHIEVEMENTS,
        CATEGORIES,
        TIERS,
        CONFIG,

        // Core
        update,
        checkAchievements,

        // Event handlers
        onZombieKilled,
        onNightSurvived,
        onPlayerDeath,
        onBloodMoonSurvived,
        onBuildingPlaced,
        onBuildingUpgraded,
        onDistanceTraveled,
        onBiomeDiscovered,
        onBiomeSurvived,
        onItemCrafted,
        onSurvivorRescued,
        onQuestCompleted,
        onHordeSurvived,
        onMainStoryComplete,
        onItemAcquired,
        onNearDeath,

        // Queries
        isUnlocked: (id) => unlockedAchievements.has(id),
        getAchievementList,
        getAchievementsByCategory,
        getAchievementProgress,
        getUnlockedCount,
        getTotalCount,
        getCompletionPercent,
        getTotalPoints: () => totalPoints,
        getRecentUnlocks: () => [...recentUnlocks],
        getStats: () => ({ ...stats }),

        // State
        getState,
        setState,
        unlockAll: () => {
            for (const achievement of Object.values(ACHIEVEMENTS)) {
                unlockAchievement(achievement);
            }
        }
    };
})();

// Export globally
window.AchievementSystem = AchievementSystem;
