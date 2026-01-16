// ============================================
// QUEST & MISSION SYSTEM - Objectives & Rewards
// ============================================
// Complete quest system with story missions, daily
// challenges, objectives tracking, and reward system

const QuestSystem = (function() {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        MAX_ACTIVE_QUESTS: 5,
        DAILY_QUEST_COUNT: 3,
        DAILY_RESET_HOUR: 6,            // 6 AM reset
        QUEST_MARKER_RANGE: 50,         // Range to show quest markers
        BONUS_XP_MULTIPLIER: 1.5,       // Bonus for completing all objectives
        CHAIN_QUEST_BONUS: 0.25         // Bonus for completing quest chains
    };

    // ============= QUEST TYPES =============
    const QUEST_TYPES = {
        MAIN: 'main',           // Story quests
        SIDE: 'side',           // Optional quests
        DAILY: 'daily',         // Daily challenges
        REPEATABLE: 'repeatable', // Can be done multiple times
        EVENT: 'event'          // Special event quests
    };

    // ============= OBJECTIVE TYPES =============
    const OBJECTIVE_TYPES = {
        KILL: 'kill',               // Kill X enemies
        KILL_TYPE: 'kill_type',     // Kill specific enemy type
        COLLECT: 'collect',         // Collect X resources
        BUILD: 'build',             // Build X structures
        UPGRADE: 'upgrade',         // Upgrade buildings
        CRAFT: 'craft',             // Craft items
        EXPLORE: 'explore',         // Reach location/biome
        SURVIVE: 'survive',         // Survive X nights
        RESCUE: 'rescue',           // Rescue survivors
        DEFEND: 'defend',           // Defend base for time
        BOSS: 'boss',               // Defeat boss
        GATHER: 'gather',           // Gather resources (any type)
        REACH_LEVEL: 'reach_level', // Reach player level
        SKILL_LEVEL: 'skill_level', // Reach skill level
        EQUIP: 'equip',             // Equip item of rarity
        DISCOVER: 'discover'        // Discover structures/biomes
    };

    // ============= QUEST DEFINITIONS =============
    const QUESTS = {
        // ========== MAIN STORY QUESTS ==========
        tutorial_survival: {
            id: 'tutorial_survival',
            name: 'First Steps',
            type: QUEST_TYPES.MAIN,
            chapter: 1,
            description: 'Learn the basics of survival in this hostile world.',
            objectives: [
                { type: OBJECTIVE_TYPES.COLLECT, target: 'wood', amount: 20, description: 'Gather wood' },
                { type: OBJECTIVE_TYPES.COLLECT, target: 'stone', amount: 10, description: 'Gather stone' },
                { type: OBJECTIVE_TYPES.BUILD, target: 'wall', amount: 4, description: 'Build walls' },
                { type: OBJECTIVE_TYPES.SURVIVE, target: 'night', amount: 1, description: 'Survive the first night' }
            ],
            rewards: {
                xp: 100,
                resources: { wood: 30, stone: 20, food: 15 },
                items: ['wooden_sword']
            },
            nextQuest: 'establish_base',
            unlocked: true
        },

        establish_base: {
            id: 'establish_base',
            name: 'Home Sweet Home',
            type: QUEST_TYPES.MAIN,
            chapter: 1,
            description: 'Establish a proper base of operations.',
            objectives: [
                { type: OBJECTIVE_TYPES.BUILD, target: 'campfire', amount: 1, description: 'Build a campfire' },
                { type: OBJECTIVE_TYPES.BUILD, target: 'workbench', amount: 1, description: 'Build a workbench' },
                { type: OBJECTIVE_TYPES.BUILD, target: 'bed', amount: 1, description: 'Build a bed' },
                { type: OBJECTIVE_TYPES.BUILD, target: 'storage', amount: 1, description: 'Build storage' }
            ],
            rewards: {
                xp: 150,
                resources: { iron: 15, food: 20 },
                skillPoints: 1
            },
            prerequisite: 'tutorial_survival',
            nextQuest: 'arm_yourself'
        },

        arm_yourself: {
            id: 'arm_yourself',
            name: 'Armed and Ready',
            type: QUEST_TYPES.MAIN,
            chapter: 1,
            description: 'Craft better weapons and armor to survive.',
            objectives: [
                { type: OBJECTIVE_TYPES.CRAFT, target: 'iron_sword', amount: 1, description: 'Craft an iron sword' },
                { type: OBJECTIVE_TYPES.CRAFT, target: 'iron_armor', amount: 1, description: 'Craft iron armor' },
                { type: OBJECTIVE_TYPES.KILL, target: 'zombie', amount: 20, description: 'Kill zombies' }
            ],
            rewards: {
                xp: 200,
                items: ['health_potion', 'health_potion'],
                perkPoints: 1
            },
            prerequisite: 'establish_base',
            nextQuest: 'growing_threat'
        },

        growing_threat: {
            id: 'growing_threat',
            name: 'The Growing Threat',
            type: QUEST_TYPES.MAIN,
            chapter: 2,
            description: 'The zombie hordes grow stronger. Prepare your defenses.',
            objectives: [
                { type: OBJECTIVE_TYPES.BUILD, target: 'tower', amount: 2, description: 'Build guard towers' },
                { type: OBJECTIVE_TYPES.BUILD, target: 'cannon', amount: 1, description: 'Build a cannon' },
                { type: OBJECTIVE_TYPES.UPGRADE, target: 'wall', amount: 4, description: 'Upgrade walls to level 2' },
                { type: OBJECTIVE_TYPES.KILL_TYPE, target: 'special', amount: 5, description: 'Kill special zombies' }
            ],
            rewards: {
                xp: 350,
                resources: { iron: 30, stone: 40 },
                items: ['hunters_ring']
            },
            prerequisite: 'arm_yourself',
            nextQuest: 'find_survivors'
        },

        find_survivors: {
            id: 'find_survivors',
            name: 'Not Alone',
            type: QUEST_TYPES.MAIN,
            chapter: 2,
            description: 'Search for other survivors to join your cause.',
            objectives: [
                { type: OBJECTIVE_TYPES.RESCUE, target: 'survivor', amount: 3, description: 'Rescue survivors' },
                { type: OBJECTIVE_TYPES.BUILD, target: 'bed', amount: 3, description: 'Build beds for survivors' },
                { type: OBJECTIVE_TYPES.COLLECT, target: 'food', amount: 100, description: 'Stockpile food' }
            ],
            rewards: {
                xp: 400,
                resources: { food: 50, wood: 50 },
                skillPoints: 2
            },
            prerequisite: 'growing_threat',
            nextQuest: 'explore_biomes'
        },

        explore_biomes: {
            id: 'explore_biomes',
            name: 'Beyond the Jungle',
            type: QUEST_TYPES.MAIN,
            chapter: 3,
            description: 'Explore the different biomes surrounding your base.',
            objectives: [
                { type: OBJECTIVE_TYPES.DISCOVER, target: 'biome_desert', amount: 1, description: 'Discover the Desert' },
                { type: OBJECTIVE_TYPES.DISCOVER, target: 'biome_snow', amount: 1, description: 'Discover the Frozen Tundra' },
                { type: OBJECTIVE_TYPES.DISCOVER, target: 'biome_swamp', amount: 1, description: 'Discover the Swamp' }
            ],
            rewards: {
                xp: 500,
                items: ['explorers_boots'],
                perkPoints: 1
            },
            prerequisite: 'find_survivors',
            nextQuest: 'first_boss'
        },

        first_boss: {
            id: 'first_boss',
            name: 'The Titan Awakens',
            type: QUEST_TYPES.MAIN,
            chapter: 3,
            description: 'A massive zombie titan has been spotted. Defeat it!',
            objectives: [
                { type: OBJECTIVE_TYPES.BOSS, target: 'TITAN', amount: 1, description: 'Defeat the Zombie Titan' }
            ],
            rewards: {
                xp: 1000,
                items: ['titan_slayer_sword'],
                resources: { iron: 100, stone: 100 },
                skillPoints: 3
            },
            prerequisite: 'explore_biomes',
            nextQuest: 'ancient_ruins'
        },

        ancient_ruins: {
            id: 'ancient_ruins',
            name: 'Ancient Secrets',
            type: QUEST_TYPES.MAIN,
            chapter: 4,
            description: 'Explore the ancient ruins and uncover their secrets.',
            objectives: [
                { type: OBJECTIVE_TYPES.DISCOVER, target: 'biome_ruins', amount: 1, description: 'Find the Ancient Ruins' },
                { type: OBJECTIVE_TYPES.DISCOVER, target: 'structure_temple', amount: 1, description: 'Discover a temple' },
                { type: OBJECTIVE_TYPES.KILL_TYPE, target: 'elite', amount: 10, description: 'Defeat elite zombies' }
            ],
            rewards: {
                xp: 750,
                items: ['ancient_amulet'],
                perkPoints: 1
            },
            prerequisite: 'first_boss',
            nextQuest: 'volcanic_depths'
        },

        volcanic_depths: {
            id: 'volcanic_depths',
            name: 'Into the Fire',
            type: QUEST_TYPES.MAIN,
            chapter: 4,
            description: 'Venture into the volcanic wasteland for rare resources.',
            objectives: [
                { type: OBJECTIVE_TYPES.DISCOVER, target: 'biome_volcanic', amount: 1, description: 'Reach the Volcanic Wasteland' },
                { type: OBJECTIVE_TYPES.COLLECT, target: 'iron', amount: 200, description: 'Mine volcanic ore' },
                { type: OBJECTIVE_TYPES.SURVIVE, target: 'night', amount: 3, description: 'Survive in the volcanic biome' }
            ],
            rewards: {
                xp: 800,
                items: ['lava_blade', 'fire_resistance_potion'],
                resources: { iron: 150 }
            },
            prerequisite: 'ancient_ruins',
            nextQuest: 'queen_hunt'
        },

        queen_hunt: {
            id: 'queen_hunt',
            name: 'Regicide',
            type: QUEST_TYPES.MAIN,
            chapter: 5,
            description: 'Hunt down and destroy the Zombie Queen.',
            objectives: [
                { type: OBJECTIVE_TYPES.BOSS, target: 'QUEEN', amount: 1, description: 'Defeat the Zombie Queen' },
                { type: OBJECTIVE_TYPES.KILL, target: 'zombie', amount: 100, description: 'Destroy her minions' }
            ],
            rewards: {
                xp: 1500,
                items: ['queens_scepter'],
                skillPoints: 3,
                perkPoints: 2
            },
            prerequisite: 'volcanic_depths',
            nextQuest: 'the_abomination'
        },

        the_abomination: {
            id: 'the_abomination',
            name: 'The Final Horror',
            type: QUEST_TYPES.MAIN,
            chapter: 5,
            description: 'Face the ultimate threat: The Abomination.',
            objectives: [
                { type: OBJECTIVE_TYPES.BOSS, target: 'ABOMINATION', amount: 1, description: 'Defeat The Abomination' }
            ],
            rewards: {
                xp: 3000,
                items: ['legendary_armor', 'doom_cleaver'],
                skillPoints: 5,
                perkPoints: 3,
                title: 'Savior of the World'
            },
            prerequisite: 'queen_hunt'
        },

        // ========== SIDE QUESTS ==========
        resource_hoarder: {
            id: 'resource_hoarder',
            name: 'Resource Hoarder',
            type: QUEST_TYPES.SIDE,
            description: 'Stockpile large amounts of resources.',
            objectives: [
                { type: OBJECTIVE_TYPES.COLLECT, target: 'wood', amount: 500, description: 'Stockpile wood' },
                { type: OBJECTIVE_TYPES.COLLECT, target: 'stone', amount: 500, description: 'Stockpile stone' },
                { type: OBJECTIVE_TYPES.COLLECT, target: 'iron', amount: 200, description: 'Stockpile iron' }
            ],
            rewards: {
                xp: 500,
                items: ['storage_upgrade'],
                resources: { food: 100 }
            },
            unlocked: true
        },

        zombie_hunter: {
            id: 'zombie_hunter',
            name: 'Zombie Hunter',
            type: QUEST_TYPES.SIDE,
            description: 'Become a legendary zombie slayer.',
            objectives: [
                { type: OBJECTIVE_TYPES.KILL, target: 'zombie', amount: 500, description: 'Kill 500 zombies' },
                { type: OBJECTIVE_TYPES.KILL_TYPE, target: 'special', amount: 50, description: 'Kill 50 special zombies' },
                { type: OBJECTIVE_TYPES.KILL_TYPE, target: 'elite', amount: 20, description: 'Kill 20 elite zombies' }
            ],
            rewards: {
                xp: 1000,
                items: ['zombie_slayer_blade'],
                perkPoints: 1,
                title: 'Zombie Hunter'
            },
            unlocked: true
        },

        master_builder: {
            id: 'master_builder',
            name: 'Master Builder',
            type: QUEST_TYPES.SIDE,
            description: 'Create an impenetrable fortress.',
            objectives: [
                { type: OBJECTIVE_TYPES.BUILD, target: 'wall', amount: 50, description: 'Build 50 walls' },
                { type: OBJECTIVE_TYPES.BUILD, target: 'tower', amount: 8, description: 'Build 8 towers' },
                { type: OBJECTIVE_TYPES.BUILD, target: 'cannon', amount: 4, description: 'Build 4 cannons' },
                { type: OBJECTIVE_TYPES.UPGRADE, target: 'any', amount: 20, description: 'Upgrade 20 buildings' }
            ],
            rewards: {
                xp: 800,
                skillPoints: 2,
                items: ['architects_hammer'],
                title: 'Master Builder'
            },
            unlocked: true
        },

        night_stalker: {
            id: 'night_stalker',
            name: 'Night Stalker',
            type: QUEST_TYPES.SIDE,
            description: 'Prove your mastery of nighttime survival.',
            objectives: [
                { type: OBJECTIVE_TYPES.SURVIVE, target: 'night', amount: 30, description: 'Survive 30 nights' },
                { type: OBJECTIVE_TYPES.KILL, target: 'zombie_night', amount: 200, description: 'Kill 200 zombies at night' }
            ],
            rewards: {
                xp: 600,
                items: ['night_vision_goggles'],
                perkPoints: 1,
                title: 'Night Stalker'
            },
            unlocked: true
        },

        gatherer_supreme: {
            id: 'gatherer_supreme',
            name: 'Gatherer Supreme',
            type: QUEST_TYPES.SIDE,
            description: 'Master the art of resource gathering.',
            objectives: [
                { type: OBJECTIVE_TYPES.SKILL_LEVEL, target: 'woodcutting', amount: 7, description: 'Reach Woodcutting level 7' },
                { type: OBJECTIVE_TYPES.SKILL_LEVEL, target: 'mining', amount: 7, description: 'Reach Mining level 7' },
                { type: OBJECTIVE_TYPES.SKILL_LEVEL, target: 'farming', amount: 7, description: 'Reach Farming level 7' }
            ],
            rewards: {
                xp: 700,
                items: ['gathering_gloves'],
                skillPoints: 2,
                title: 'Gatherer Supreme'
            },
            unlocked: true
        },

        blood_moon_survivor: {
            id: 'blood_moon_survivor',
            name: 'Blood Moon Survivor',
            type: QUEST_TYPES.SIDE,
            description: 'Survive the terrifying Blood Moon event.',
            objectives: [
                { type: OBJECTIVE_TYPES.SURVIVE, target: 'blood_moon', amount: 3, description: 'Survive 3 Blood Moons' },
                { type: OBJECTIVE_TYPES.KILL, target: 'zombie_blood_moon', amount: 100, description: 'Kill 100 zombies during Blood Moon' }
            ],
            rewards: {
                xp: 1000,
                items: ['blood_moon_talisman'],
                perkPoints: 1,
                title: 'Blood Moon Survivor'
            },
            unlocked: true
        },

        // ========== REPEATABLE QUESTS ==========
        daily_hunt: {
            id: 'daily_hunt',
            name: 'Daily Hunt',
            type: QUEST_TYPES.REPEATABLE,
            description: 'Complete your daily zombie hunt.',
            cooldown: 86400000, // 24 hours
            objectives: [
                { type: OBJECTIVE_TYPES.KILL, target: 'zombie', amount: 50, description: 'Kill 50 zombies' }
            ],
            rewards: {
                xp: 100,
                resources: { food: 20, iron: 10 }
            },
            unlocked: true
        },

        supply_run: {
            id: 'supply_run',
            name: 'Supply Run',
            type: QUEST_TYPES.REPEATABLE,
            description: 'Gather supplies for the base.',
            cooldown: 86400000,
            objectives: [
                { type: OBJECTIVE_TYPES.GATHER, target: 'any', amount: 100, description: 'Gather 100 resources' }
            ],
            rewards: {
                xp: 75,
                resources: { food: 15 }
            },
            unlocked: true
        },

        elite_bounty: {
            id: 'elite_bounty',
            name: 'Elite Bounty',
            type: QUEST_TYPES.REPEATABLE,
            description: 'Hunt down dangerous elite zombies.',
            cooldown: 172800000, // 48 hours
            objectives: [
                { type: OBJECTIVE_TYPES.KILL_TYPE, target: 'elite', amount: 5, description: 'Kill 5 elite zombies' }
            ],
            rewards: {
                xp: 300,
                items: ['random_rare_item']
            },
            unlocked: true
        }
    };

    // ============= DAILY CHALLENGE TEMPLATES =============
    const DAILY_TEMPLATES = [
        {
            name: 'Quick Hunt',
            objectives: [{ type: OBJECTIVE_TYPES.KILL, target: 'zombie', amount: 25 }],
            rewards: { xp: 50, resources: { food: 10 } }
        },
        {
            name: 'Gatherer',
            objectives: [{ type: OBJECTIVE_TYPES.GATHER, target: 'any', amount: 50 }],
            rewards: { xp: 50, resources: { wood: 20 } }
        },
        {
            name: 'Defender',
            objectives: [{ type: OBJECTIVE_TYPES.BUILD, target: 'wall', amount: 5 }],
            rewards: { xp: 50, resources: { stone: 20 } }
        },
        {
            name: 'Crafter',
            objectives: [{ type: OBJECTIVE_TYPES.CRAFT, target: 'any', amount: 3 }],
            rewards: { xp: 75, resources: { iron: 10 } }
        },
        {
            name: 'Special Hunter',
            objectives: [{ type: OBJECTIVE_TYPES.KILL_TYPE, target: 'special', amount: 3 }],
            rewards: { xp: 100, items: ['health_potion'] }
        },
        {
            name: 'Survivor',
            objectives: [{ type: OBJECTIVE_TYPES.SURVIVE, target: 'night', amount: 1 }],
            rewards: { xp: 60, resources: { food: 15 } }
        },
        {
            name: 'Explorer',
            objectives: [{ type: OBJECTIVE_TYPES.EXPLORE, target: 'distance', amount: 100 }],
            rewards: { xp: 75, resources: { food: 10, wood: 10, stone: 10 } }
        },
        {
            name: 'Builder',
            objectives: [{ type: OBJECTIVE_TYPES.UPGRADE, target: 'any', amount: 2 }],
            rewards: { xp: 100, resources: { iron: 15 } }
        }
    ];

    // ============= STATE =============
    let activeQuests = [];
    let completedQuests = new Set();
    let questProgress = {};
    let dailyQuests = [];
    let lastDailyReset = 0;
    let questCooldowns = {};
    let earnedTitles = new Set();
    let currentTitle = null;

    // ============= QUEST MANAGEMENT =============
    function getQuest(questId) {
        return QUESTS[questId] || null;
    }

    function isQuestUnlocked(questId) {
        const quest = getQuest(questId);
        if (!quest) return false;

        if (quest.unlocked) return true;

        if (quest.prerequisite) {
            return completedQuests.has(quest.prerequisite);
        }

        return false;
    }

    function canAcceptQuest(questId) {
        const quest = getQuest(questId);
        if (!quest) return { canAccept: false, reason: 'Quest not found' };

        if (activeQuests.find(q => q.id === questId)) {
            return { canAccept: false, reason: 'Quest already active' };
        }

        if (completedQuests.has(questId) && quest.type !== QUEST_TYPES.REPEATABLE) {
            return { canAccept: false, reason: 'Quest already completed' };
        }

        if (!isQuestUnlocked(questId)) {
            return { canAccept: false, reason: 'Quest is locked' };
        }

        if (activeQuests.length >= CONFIG.MAX_ACTIVE_QUESTS) {
            return { canAccept: false, reason: 'Too many active quests' };
        }

        if (quest.type === QUEST_TYPES.REPEATABLE && questCooldowns[questId] > Date.now()) {
            return { canAccept: false, reason: 'Quest on cooldown' };
        }

        return { canAccept: true };
    }

    function acceptQuest(questId) {
        const check = canAcceptQuest(questId);
        if (!check.canAccept) {
            if (typeof showNotification === 'function') {
                showNotification(
                    `<i class="material-icons">warning</i> ${check.reason}`,
                    []
                );
            }
            return false;
        }

        const quest = getQuest(questId);

        // Initialize progress
        const progress = {
            id: questId,
            objectives: quest.objectives.map((obj, index) => ({
                index,
                ...obj,
                current: 0,
                completed: false
            })),
            startTime: Date.now(),
            completed: false
        };

        activeQuests.push(progress);
        questProgress[questId] = progress;

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">assignment</i> Quest Accepted: ${quest.name}`,
                []
            );
        }

        updateQuestUI();
        return true;
    }

    function abandonQuest(questId) {
        const index = activeQuests.findIndex(q => q.id === questId);
        if (index === -1) return false;

        activeQuests.splice(index, 1);
        delete questProgress[questId];

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">cancel</i> Quest Abandoned`,
                []
            );
        }

        updateQuestUI();
        return true;
    }

    // ============= OBJECTIVE TRACKING =============
    function updateObjective(type, target, amount = 1, context = {}) {
        for (const quest of activeQuests) {
            if (quest.completed) continue;

            for (const objective of quest.objectives) {
                if (objective.completed) continue;
                if (objective.type !== type) continue;

                // Check target match
                let matches = false;

                switch (type) {
                    case OBJECTIVE_TYPES.KILL:
                        matches = target === 'zombie' || objective.target === 'zombie';
                        if (objective.target === 'zombie_night' && !isNight) matches = false;
                        if (objective.target === 'zombie_blood_moon') {
                            matches = context.weather === 'blood_moon';
                        }
                        break;

                    case OBJECTIVE_TYPES.KILL_TYPE:
                        matches = target === objective.target ||
                                 (objective.target === 'special' && ['runner', 'tank', 'spitter', 'exploder', 'screamer'].includes(target)) ||
                                 (objective.target === 'elite' && ['brute', 'shadow', 'necromancer'].includes(target));
                        break;

                    case OBJECTIVE_TYPES.COLLECT:
                    case OBJECTIVE_TYPES.GATHER:
                        matches = objective.target === 'any' || target === objective.target;
                        break;

                    case OBJECTIVE_TYPES.BUILD:
                    case OBJECTIVE_TYPES.UPGRADE:
                        matches = objective.target === 'any' || target === objective.target;
                        break;

                    case OBJECTIVE_TYPES.CRAFT:
                        matches = objective.target === 'any' || target === objective.target;
                        break;

                    case OBJECTIVE_TYPES.SURVIVE:
                        matches = objective.target === 'night' ||
                                 (objective.target === 'blood_moon' && context.weather === 'blood_moon');
                        break;

                    case OBJECTIVE_TYPES.RESCUE:
                        matches = objective.target === 'survivor';
                        break;

                    case OBJECTIVE_TYPES.BOSS:
                        matches = target.toUpperCase() === objective.target;
                        break;

                    case OBJECTIVE_TYPES.DISCOVER:
                        matches = target === objective.target;
                        break;

                    case OBJECTIVE_TYPES.SKILL_LEVEL:
                        matches = target === objective.target && context.level >= objective.amount;
                        break;

                    case OBJECTIVE_TYPES.EXPLORE:
                        matches = objective.target === 'distance';
                        break;

                    default:
                        matches = target === objective.target;
                }

                if (matches) {
                    objective.current = Math.min(objective.amount, objective.current + amount);

                    if (objective.current >= objective.amount) {
                        objective.completed = true;
                        onObjectiveComplete(quest, objective);
                    }
                }
            }

            // Check if all objectives complete
            if (quest.objectives.every(o => o.completed)) {
                completeQuest(quest.id);
            }
        }

        updateQuestUI();
    }

    function onObjectiveComplete(quest, objective) {
        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">check_circle</i> Objective Complete: ${objective.description}`,
                []
            );
        }

        if (typeof spawnParticles === 'function') {
            spawnParticles(player.x, player.y, '#00ff00', 10);
        }
    }

    // ============= QUEST COMPLETION =============
    function completeQuest(questId) {
        const questData = getQuest(questId);
        const progress = questProgress[questId];

        if (!questData || !progress) return false;

        progress.completed = true;
        progress.completionTime = Date.now();

        // Remove from active
        const index = activeQuests.findIndex(q => q.id === questId);
        if (index !== -1) {
            activeQuests.splice(index, 1);
        }

        // Mark as completed (for non-repeatable)
        if (questData.type !== QUEST_TYPES.REPEATABLE) {
            completedQuests.add(questId);
        } else {
            // Set cooldown for repeatable
            questCooldowns[questId] = Date.now() + (questData.cooldown || 86400000);
        }

        // Grant rewards
        grantRewards(questData.rewards, questId);

        // Handle chain quest bonus
        if (questData.nextQuest) {
            const chainBonus = Math.floor(questData.rewards.xp * CONFIG.CHAIN_QUEST_BONUS);
            player.exp += chainBonus;
            if (typeof showNotification === 'function') {
                showNotification(
                    `<i class="material-icons">link</i> Chain Quest Bonus: +${chainBonus} XP`,
                    []
                );
            }
        }

        // Award title if present
        if (questData.rewards.title) {
            earnedTitles.add(questData.rewards.title);
            if (!currentTitle) {
                currentTitle = questData.rewards.title;
            }
            if (typeof showNotification === 'function') {
                showNotification(
                    `<i class="material-icons">military_tech</i> Title Earned: ${questData.rewards.title}`,
                    []
                );
            }
        }

        // Celebration
        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">emoji_events</i> Quest Complete: ${questData.name}!`,
                [{ text: 'Claim Rewards', action: () => {}, class: 'accept' }]
            );
        }

        if (typeof spawnParticles === 'function') {
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    spawnParticles(
                        player.x + (Math.random() - 0.5) * 3,
                        player.y + (Math.random() - 0.5) * 3,
                        '#ffd700', 5
                    );
                }, i * 50);
            }
        }

        // Track stats
        if (window.gameStats) {
            window.gameStats.questsCompleted = (window.gameStats.questsCompleted || 0) + 1;
        }

        updateQuestUI();
        return true;
    }

    function grantRewards(rewards, questId) {
        if (!rewards) return;

        // XP
        if (rewards.xp) {
            player.exp += rewards.xp;
            if (typeof checkLevelUp === 'function') {
                checkLevelUp();
            }
        }

        // Resources
        if (rewards.resources) {
            for (const [resource, amount] of Object.entries(rewards.resources)) {
                resources[resource] = (resources[resource] || 0) + amount;
            }
        }

        // Items
        if (rewards.items && typeof EquipmentSystem !== 'undefined') {
            for (const itemId of rewards.items) {
                if (itemId === 'random_rare_item') {
                    // Grant random rare item
                    const rareItems = ['health_potion', 'stamina_elixir', 'hunters_ring', 'warriors_pendant'];
                    const randomItem = rareItems[Math.floor(Math.random() * rareItems.length)];
                    const item = EquipmentSystem.createItem(randomItem);
                    if (item) EquipmentSystem.addToInventory(item);
                } else {
                    const item = EquipmentSystem.createItem(itemId);
                    if (item) EquipmentSystem.addToInventory(item);
                }
            }
        }

        // Skill points
        if (rewards.skillPoints && typeof SkillSystem !== 'undefined') {
            SkillSystem.addSkillPoints(rewards.skillPoints);
        }

        // Perk points
        if (rewards.perkPoints && typeof SkillSystem !== 'undefined') {
            SkillSystem.addPerkPoints(rewards.perkPoints);
        }
    }

    // ============= DAILY QUESTS =============
    function generateDailyQuests() {
        dailyQuests = [];

        // Shuffle templates
        const shuffled = [...DAILY_TEMPLATES].sort(() => Math.random() - 0.5);

        for (let i = 0; i < CONFIG.DAILY_QUEST_COUNT; i++) {
            const template = shuffled[i % shuffled.length];
            const daily = {
                id: `daily_${Date.now()}_${i}`,
                name: `Daily: ${template.name}`,
                type: QUEST_TYPES.DAILY,
                description: `Complete today's ${template.name.toLowerCase()} challenge`,
                objectives: template.objectives.map(o => ({ ...o })),
                rewards: { ...template.rewards },
                isDaily: true
            };

            // Scale difficulty based on day count
            const dayScale = 1 + (dayCount || 0) * 0.05;
            for (const obj of daily.objectives) {
                obj.amount = Math.ceil(obj.amount * dayScale);
            }

            daily.rewards.xp = Math.ceil(daily.rewards.xp * dayScale);

            dailyQuests.push(daily);
        }

        lastDailyReset = Date.now();
    }

    function checkDailyReset() {
        const now = new Date();
        const resetHour = CONFIG.DAILY_RESET_HOUR;

        // Check if we need to reset
        const lastReset = new Date(lastDailyReset);
        const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);

        if (hoursSinceReset >= 24 || (now.getHours() >= resetHour && lastReset.getDate() !== now.getDate())) {
            generateDailyQuests();

            if (typeof showNotification === 'function') {
                showNotification(
                    `<i class="material-icons">today</i> Daily Quests Reset!`,
                    []
                );
            }
        }
    }

    function getDailyQuests() {
        checkDailyReset();
        return dailyQuests;
    }

    // ============= QUEST TRACKING HOOKS =============
    function onZombieKilled(zombie) {
        updateObjective(OBJECTIVE_TYPES.KILL, 'zombie', 1, {
            weather: typeof WeatherSystem !== 'undefined' ? WeatherSystem.getCurrentWeather()?.id : null
        });

        // Check type-specific
        if (zombie.typeId) {
            updateObjective(OBJECTIVE_TYPES.KILL_TYPE, zombie.typeId.toLowerCase(), 1);
        }

        if (zombie.tier === 'boss') {
            updateObjective(OBJECTIVE_TYPES.BOSS, zombie.typeId, 1);
        }
    }

    function onResourceCollected(resourceType, amount) {
        updateObjective(OBJECTIVE_TYPES.COLLECT, resourceType, amount);
        updateObjective(OBJECTIVE_TYPES.GATHER, resourceType, amount);
    }

    function onBuildingPlaced(buildingType) {
        updateObjective(OBJECTIVE_TYPES.BUILD, buildingType.toLowerCase(), 1);
    }

    function onBuildingUpgraded(buildingType) {
        updateObjective(OBJECTIVE_TYPES.UPGRADE, buildingType.toLowerCase(), 1);
        updateObjective(OBJECTIVE_TYPES.UPGRADE, 'any', 1);
    }

    function onItemCrafted(itemId) {
        updateObjective(OBJECTIVE_TYPES.CRAFT, itemId, 1);
        updateObjective(OBJECTIVE_TYPES.CRAFT, 'any', 1);
    }

    function onNightSurvived() {
        updateObjective(OBJECTIVE_TYPES.SURVIVE, 'night', 1, {
            weather: typeof WeatherSystem !== 'undefined' ? WeatherSystem.getCurrentWeather()?.id : null
        });
    }

    function onSurvivorRescued() {
        updateObjective(OBJECTIVE_TYPES.RESCUE, 'survivor', 1);
    }

    function onBiomeDiscovered(biomeId) {
        updateObjective(OBJECTIVE_TYPES.DISCOVER, `biome_${biomeId}`, 1);
    }

    function onStructureDiscovered(structureType) {
        updateObjective(OBJECTIVE_TYPES.DISCOVER, `structure_${structureType}`, 1);
    }

    function onSkillLevelUp(skillId, level) {
        updateObjective(OBJECTIVE_TYPES.SKILL_LEVEL, skillId, 1, { level });
    }

    function onDistanceTraveled(distance) {
        updateObjective(OBJECTIVE_TYPES.EXPLORE, 'distance', distance);
    }

    // ============= UI FUNCTIONS =============
    function updateQuestUI() {
        const container = document.getElementById('questListContainer');
        if (!container) return;

        container.innerHTML = '';

        // Active quests
        for (const quest of activeQuests) {
            const questDef = getQuest(quest.id);
            if (!questDef) continue;

            const questDiv = document.createElement('div');
            questDiv.className = `quest-item ${questDef.type}`;

            const progressPercent = (quest.objectives.filter(o => o.completed).length / quest.objectives.length) * 100;

            questDiv.innerHTML = `
                <div class="quest-header">
                    <span class="quest-type-badge">${questDef.type.toUpperCase()}</span>
                    <span class="quest-name">${questDef.name}</span>
                    <button class="quest-abandon" onclick="QuestSystem.abandonQuest('${quest.id}')">&times;</button>
                </div>
                <div class="quest-description">${questDef.description}</div>
                <div class="quest-objectives">
                    ${quest.objectives.map(obj => `
                        <div class="objective ${obj.completed ? 'completed' : ''}">
                            <span class="objective-check">${obj.completed ? '✓' : '○'}</span>
                            <span class="objective-text">${obj.description}</span>
                            <span class="objective-progress">${obj.current}/${obj.amount}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="quest-progress-bar">
                    <div class="quest-progress-fill" style="width: ${progressPercent}%"></div>
                </div>
            `;

            container.appendChild(questDiv);
        }

        // Available quests section
        const availableQuests = Object.values(QUESTS).filter(q =>
            isQuestUnlocked(q.id) &&
            !activeQuests.find(a => a.id === q.id) &&
            !completedQuests.has(q.id)
        );

        if (availableQuests.length > 0) {
            const availableDiv = document.createElement('div');
            availableDiv.className = 'quest-section';
            availableDiv.innerHTML = '<h4>Available Quests</h4>';

            for (const quest of availableQuests.slice(0, 5)) {
                const check = canAcceptQuest(quest.id);
                const questBtn = document.createElement('div');
                questBtn.className = `quest-available ${check.canAccept ? 'can-accept' : ''}`;
                questBtn.innerHTML = `
                    <span class="quest-type-badge">${quest.type.toUpperCase()}</span>
                    <span class="quest-name">${quest.name}</span>
                    ${check.canAccept ? `<button onclick="QuestSystem.acceptQuest('${quest.id}')">Accept</button>` : ''}
                `;
                availableDiv.appendChild(questBtn);
            }

            container.appendChild(availableDiv);
        }
    }

    function showQuestDetails(questId) {
        const quest = getQuest(questId);
        if (!quest) return;

        const progress = questProgress[questId];

        let content = `
            <strong>${quest.name}</strong><br>
            <small>${quest.description}</small><br><br>
            <strong>Objectives:</strong><br>
        `;

        const objectives = progress?.objectives || quest.objectives;
        for (const obj of objectives) {
            const current = obj.current || 0;
            const completed = obj.completed || current >= obj.amount;
            content += `${completed ? '✓' : '○'} ${obj.description} (${current}/${obj.amount})<br>`;
        }

        content += `<br><strong>Rewards:</strong><br>`;
        if (quest.rewards.xp) content += `• ${quest.rewards.xp} XP<br>`;
        if (quest.rewards.resources) {
            for (const [res, amt] of Object.entries(quest.rewards.resources)) {
                content += `• ${amt} ${res}<br>`;
            }
        }
        if (quest.rewards.items) {
            content += `• ${quest.rewards.items.length} item(s)<br>`;
        }

        if (typeof showNotification === 'function') {
            showNotification(content, []);
        }
    }

    // ============= SERIALIZATION =============
    function getState() {
        return {
            activeQuests: activeQuests,
            completedQuests: Array.from(completedQuests),
            questProgress: questProgress,
            dailyQuests: dailyQuests,
            lastDailyReset: lastDailyReset,
            questCooldowns: questCooldowns,
            earnedTitles: Array.from(earnedTitles),
            currentTitle: currentTitle
        };
    }

    function setState(state) {
        if (!state) return;

        activeQuests = state.activeQuests || [];
        completedQuests = new Set(state.completedQuests || []);
        questProgress = state.questProgress || {};
        dailyQuests = state.dailyQuests || [];
        lastDailyReset = state.lastDailyReset || 0;
        questCooldowns = state.questCooldowns || {};
        earnedTitles = new Set(state.earnedTitles || []);
        currentTitle = state.currentTitle || null;

        checkDailyReset();
        updateQuestUI();
    }

    // Initialize daily quests
    generateDailyQuests();

    // ============= PUBLIC API =============
    return {
        // Constants
        QUESTS,
        QUEST_TYPES,
        OBJECTIVE_TYPES,
        CONFIG,

        // Quest Management
        getQuest,
        isQuestUnlocked,
        canAcceptQuest,
        acceptQuest,
        abandonQuest,
        completeQuest,

        // Objective Tracking
        updateObjective,

        // Daily Quests
        getDailyQuests,
        checkDailyReset,

        // Event Hooks
        onZombieKilled,
        onResourceCollected,
        onBuildingPlaced,
        onBuildingUpgraded,
        onItemCrafted,
        onNightSurvived,
        onSurvivorRescued,
        onBiomeDiscovered,
        onStructureDiscovered,
        onSkillLevelUp,
        onDistanceTraveled,

        // UI
        updateQuestUI,
        showQuestDetails,

        // Titles
        getEarnedTitles: () => Array.from(earnedTitles),
        getCurrentTitle: () => currentTitle,
        setCurrentTitle: (title) => {
            if (earnedTitles.has(title)) {
                currentTitle = title;
            }
        },

        // State
        getState,
        setState,
        getActiveQuests: () => [...activeQuests],
        getCompletedQuests: () => Array.from(completedQuests)
    };
})();

// Export globally
window.QuestSystem = QuestSystem;
