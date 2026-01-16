// ============================================
// SKILL & PERK SYSTEM
// ============================================
// Complete skill progression system with skill trees,
// passive abilities, and character specialization

const SkillSystem = (function() {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        BASE_XP_REQUIREMENT: 100,
        XP_GROWTH_RATE: 1.5,
        MAX_SKILL_LEVEL: 10,
        SKILL_POINTS_PER_PLAYER_LEVEL: 1,
        PERK_POINTS_PER_5_LEVELS: 1
    };

    // ============= SKILL DEFINITIONS =============
    const SKILLS = {
        // === COMBAT SKILLS ===
        melee_combat: {
            id: 'melee_combat',
            name: 'Melee Combat',
            category: 'combat',
            icon: '⚔️',
            description: 'Increases melee damage and attack speed',
            effects: [
                { stat: 'meleeDamage', perLevel: 0.08 },
                { stat: 'attackSpeed', perLevel: 0.03 }
            ],
            maxLevel: CONFIG.MAX_SKILL_LEVEL
        },
        ranged_combat: {
            id: 'ranged_combat',
            name: 'Ranged Combat',
            category: 'combat',
            icon: '🏹',
            description: 'Increases ranged damage and accuracy',
            effects: [
                { stat: 'rangedDamage', perLevel: 0.1 },
                { stat: 'accuracy', perLevel: 0.05 }
            ],
            maxLevel: CONFIG.MAX_SKILL_LEVEL
        },
        critical_strikes: {
            id: 'critical_strikes',
            name: 'Critical Strikes',
            category: 'combat',
            icon: '💥',
            description: 'Increases critical hit chance and damage',
            effects: [
                { stat: 'critChance', perLevel: 0.02 },
                { stat: 'critDamage', perLevel: 0.1 }
            ],
            maxLevel: CONFIG.MAX_SKILL_LEVEL
        },
        defense: {
            id: 'defense',
            name: 'Defense',
            category: 'combat',
            icon: '🛡️',
            description: 'Increases armor and damage reduction',
            effects: [
                { stat: 'defense', perLevel: 2 },
                { stat: 'damageReduction', perLevel: 0.02 }
            ],
            maxLevel: CONFIG.MAX_SKILL_LEVEL
        },

        // === SURVIVAL SKILLS ===
        vitality: {
            id: 'vitality',
            name: 'Vitality',
            category: 'survival',
            icon: '❤️',
            description: 'Increases max health and health regeneration',
            effects: [
                { stat: 'maxHealth', perLevel: 15 },
                { stat: 'healthRegen', perLevel: 0.2 }
            ],
            maxLevel: CONFIG.MAX_SKILL_LEVEL
        },
        endurance: {
            id: 'endurance',
            name: 'Endurance',
            category: 'survival',
            icon: '🏃',
            description: 'Increases movement speed and hunger efficiency',
            effects: [
                { stat: 'speed', perLevel: 0.15 },
                { stat: 'hungerEfficiency', perLevel: 0.05 }
            ],
            maxLevel: CONFIG.MAX_SKILL_LEVEL
        },
        resistance: {
            id: 'resistance',
            name: 'Resistance',
            category: 'survival',
            icon: '🧬',
            description: 'Increases resistance to poison and status effects',
            effects: [
                { stat: 'poisonResist', perLevel: 0.08 },
                { stat: 'statusResist', perLevel: 0.05 }
            ],
            maxLevel: CONFIG.MAX_SKILL_LEVEL
        },
        scavenging: {
            id: 'scavenging',
            name: 'Scavenging',
            category: 'survival',
            icon: '🎒',
            description: 'Increases loot drops and resource finding',
            effects: [
                { stat: 'lootBonus', perLevel: 0.1 },
                { stat: 'resourceFind', perLevel: 0.08 }
            ],
            maxLevel: CONFIG.MAX_SKILL_LEVEL
        },

        // === GATHERING SKILLS ===
        woodcutting: {
            id: 'woodcutting',
            name: 'Woodcutting',
            category: 'gathering',
            icon: '🪓',
            description: 'Increases wood gathering speed and yield',
            effects: [
                { stat: 'woodcuttingSpeed', perLevel: 0.12 },
                { stat: 'woodYield', perLevel: 0.1 }
            ],
            maxLevel: CONFIG.MAX_SKILL_LEVEL
        },
        mining: {
            id: 'mining',
            name: 'Mining',
            category: 'gathering',
            icon: '⛏️',
            description: 'Increases mining speed and ore yield',
            effects: [
                { stat: 'miningSpeed', perLevel: 0.12 },
                { stat: 'oreYield', perLevel: 0.1 }
            ],
            maxLevel: CONFIG.MAX_SKILL_LEVEL
        },
        farming: {
            id: 'farming',
            name: 'Farming',
            category: 'gathering',
            icon: '🌾',
            description: 'Increases farming efficiency and food yield',
            effects: [
                { stat: 'farmingSpeed', perLevel: 0.1 },
                { stat: 'foodYield', perLevel: 0.12 }
            ],
            maxLevel: CONFIG.MAX_SKILL_LEVEL
        },

        // === CRAFTING SKILLS ===
        crafting: {
            id: 'crafting',
            name: 'Crafting',
            category: 'crafting',
            icon: '🔧',
            description: 'Increases crafting speed and quality',
            effects: [
                { stat: 'craftingSpeed', perLevel: 0.08 },
                { stat: 'craftQuality', perLevel: 0.05 }
            ],
            maxLevel: CONFIG.MAX_SKILL_LEVEL
        },
        engineering: {
            id: 'engineering',
            name: 'Engineering',
            category: 'crafting',
            icon: '⚙️',
            description: 'Increases building efficiency and durability',
            effects: [
                { stat: 'buildingSpeed', perLevel: 0.1 },
                { stat: 'buildingDurability', perLevel: 0.08 }
            ],
            maxLevel: CONFIG.MAX_SKILL_LEVEL
        },
        alchemy: {
            id: 'alchemy',
            name: 'Alchemy',
            category: 'crafting',
            icon: '⚗️',
            description: 'Increases potion effectiveness and duration',
            effects: [
                { stat: 'potionPower', perLevel: 0.1 },
                { stat: 'potionDuration', perLevel: 0.08 }
            ],
            maxLevel: CONFIG.MAX_SKILL_LEVEL
        },

        // === LEADERSHIP SKILLS ===
        leadership: {
            id: 'leadership',
            name: 'Leadership',
            category: 'leadership',
            icon: '👑',
            description: 'Increases survivor morale and capacity',
            effects: [
                { stat: 'survivorMorale', perLevel: 0.08 },
                { stat: 'survivorCapacity', perLevel: 1 }
            ],
            maxLevel: CONFIG.MAX_SKILL_LEVEL
        },
        tactics: {
            id: 'tactics',
            name: 'Tactics',
            category: 'leadership',
            icon: '📋',
            description: 'Increases survivor combat effectiveness',
            effects: [
                { stat: 'survivorDamage', perLevel: 0.06 },
                { stat: 'survivorDefense', perLevel: 0.05 }
            ],
            maxLevel: CONFIG.MAX_SKILL_LEVEL
        },
        inspiration: {
            id: 'inspiration',
            name: 'Inspiration',
            category: 'leadership',
            icon: '✨',
            description: 'Increases survivor work efficiency',
            effects: [
                { stat: 'survivorWorkSpeed', perLevel: 0.08 },
                { stat: 'survivorLoyalty', perLevel: 0.05 }
            ],
            maxLevel: CONFIG.MAX_SKILL_LEVEL
        }
    };

    // ============= PERK DEFINITIONS =============
    const PERKS = {
        // === COMBAT PERKS ===
        berserker: {
            id: 'berserker',
            name: 'Berserker',
            category: 'combat',
            icon: '😤',
            description: 'Deal 30% more damage when below 30% health',
            requirements: { melee_combat: 5 },
            effect: { type: 'conditional', condition: 'lowHealth', stat: 'damage', value: 0.3 }
        },
        executioner: {
            id: 'executioner',
            name: 'Executioner',
            category: 'combat',
            icon: '⚰️',
            description: 'Deal 50% more damage to enemies below 25% health',
            requirements: { critical_strikes: 5 },
            effect: { type: 'conditional', condition: 'targetLowHealth', stat: 'damage', value: 0.5 }
        },
        vampire: {
            id: 'vampire',
            name: 'Vampire',
            category: 'combat',
            icon: '🧛',
            description: 'Lifesteal 10% of damage dealt',
            requirements: { melee_combat: 7, vitality: 3 },
            effect: { type: 'passive', stat: 'lifesteal', value: 0.1 }
        },
        rapid_fire: {
            id: 'rapid_fire',
            name: 'Rapid Fire',
            category: 'combat',
            icon: '⚡',
            description: '25% faster attack speed',
            requirements: { ranged_combat: 5 },
            effect: { type: 'passive', stat: 'attackSpeed', value: 0.25 }
        },
        piercing_strikes: {
            id: 'piercing_strikes',
            name: 'Piercing Strikes',
            category: 'combat',
            icon: '🔱',
            description: 'Attacks pierce through to hit an additional target',
            requirements: { melee_combat: 8 },
            effect: { type: 'special', ability: 'piercing' }
        },
        deadly_precision: {
            id: 'deadly_precision',
            name: 'Deadly Precision',
            category: 'combat',
            icon: '🎯',
            description: 'Critical hits deal triple damage instead of double',
            requirements: { critical_strikes: 8 },
            effect: { type: 'passive', stat: 'critDamage', value: 0.5 }
        },

        // === SURVIVAL PERKS ===
        iron_skin: {
            id: 'iron_skin',
            name: 'Iron Skin',
            category: 'survival',
            icon: '🪨',
            description: 'Reduce all damage taken by 15%',
            requirements: { defense: 5 },
            effect: { type: 'passive', stat: 'damageReduction', value: 0.15 }
        },
        second_wind: {
            id: 'second_wind',
            name: 'Second Wind',
            category: 'survival',
            icon: '💨',
            description: 'Automatically heal 30% HP when dropping below 20% (5 min cooldown)',
            requirements: { vitality: 6 },
            effect: { type: 'triggered', trigger: 'lowHealth', action: 'heal', value: 0.3, cooldown: 300 }
        },
        marathon: {
            id: 'marathon',
            name: 'Marathon Runner',
            category: 'survival',
            icon: '🏃',
            description: 'Movement speed increased by 20%',
            requirements: { endurance: 5 },
            effect: { type: 'passive', stat: 'speed', value: 0.2 }
        },
        survivalist: {
            id: 'survivalist',
            name: 'Survivalist',
            category: 'survival',
            icon: '🏕️',
            description: 'Hunger decreases 30% slower',
            requirements: { endurance: 4, scavenging: 3 },
            effect: { type: 'passive', stat: 'hungerDecayRate', value: -0.3 }
        },
        thick_skin: {
            id: 'thick_skin',
            name: 'Thick Skin',
            category: 'survival',
            icon: '🦎',
            description: 'Immune to poison',
            requirements: { resistance: 7 },
            effect: { type: 'immunity', status: 'poison' }
        },
        lucky_looter: {
            id: 'lucky_looter',
            name: 'Lucky Looter',
            category: 'survival',
            icon: '🍀',
            description: '50% more loot drops from enemies',
            requirements: { scavenging: 6 },
            effect: { type: 'passive', stat: 'lootMultiplier', value: 0.5 }
        },

        // === GATHERING PERKS ===
        efficient_harvester: {
            id: 'efficient_harvester',
            name: 'Efficient Harvester',
            category: 'gathering',
            icon: '🌿',
            description: '25% chance to not consume resource when harvesting',
            requirements: { woodcutting: 4, mining: 4 },
            effect: { type: 'chance', stat: 'freeHarvest', value: 0.25 }
        },
        motherlode: {
            id: 'motherlode',
            name: 'Motherlode',
            category: 'gathering',
            icon: '💎',
            description: '10% chance to find rare gems when mining',
            requirements: { mining: 7 },
            effect: { type: 'chance', stat: 'gemFind', value: 0.1 }
        },
        green_thumb: {
            id: 'green_thumb',
            name: 'Green Thumb',
            category: 'gathering',
            icon: '🌱',
            description: 'Farms produce 50% more food',
            requirements: { farming: 6 },
            effect: { type: 'passive', stat: 'farmOutput', value: 0.5 }
        },
        speed_gatherer: {
            id: 'speed_gatherer',
            name: 'Speed Gatherer',
            category: 'gathering',
            icon: '⚡',
            description: 'Gather resources 40% faster',
            requirements: { woodcutting: 5, mining: 5, farming: 5 },
            effect: { type: 'passive', stat: 'gatherSpeed', value: 0.4 }
        },

        // === CRAFTING PERKS ===
        master_craftsman: {
            id: 'master_craftsman',
            name: 'Master Craftsman',
            category: 'crafting',
            icon: '🏆',
            description: '20% chance to craft an additional item for free',
            requirements: { crafting: 7 },
            effect: { type: 'chance', stat: 'doubleCraft', value: 0.2 }
        },
        efficient_crafter: {
            id: 'efficient_crafter',
            name: 'Efficient Crafter',
            category: 'crafting',
            icon: '♻️',
            description: 'Use 20% fewer materials when crafting',
            requirements: { crafting: 5 },
            effect: { type: 'passive', stat: 'materialCost', value: -0.2 }
        },
        architect: {
            id: 'architect',
            name: 'Architect',
            category: 'crafting',
            icon: '🏗️',
            description: 'Buildings have 50% more health',
            requirements: { engineering: 6 },
            effect: { type: 'passive', stat: 'buildingHealth', value: 0.5 }
        },
        alchemist_master: {
            id: 'alchemist_master',
            name: 'Master Alchemist',
            category: 'crafting',
            icon: '🧙',
            description: 'Potions are 50% more effective',
            requirements: { alchemy: 7 },
            effect: { type: 'passive', stat: 'potionEffectiveness', value: 0.5 }
        },

        // === LEADERSHIP PERKS ===
        inspiring_presence: {
            id: 'inspiring_presence',
            name: 'Inspiring Presence',
            category: 'leadership',
            icon: '🌟',
            description: 'Survivors near you work 25% faster',
            requirements: { leadership: 5, inspiration: 3 },
            effect: { type: 'aura', stat: 'workSpeed', value: 0.25, radius: 5 }
        },
        battle_commander: {
            id: 'battle_commander',
            name: 'Battle Commander',
            category: 'leadership',
            icon: '⚔️',
            description: 'Survivors deal 30% more damage',
            requirements: { tactics: 6 },
            effect: { type: 'passive', stat: 'survivorDamage', value: 0.3 }
        },
        rally_cry: {
            id: 'rally_cry',
            name: 'Rally Cry',
            category: 'leadership',
            icon: '📯',
            description: 'Can activate to boost all survivors attack speed by 50% for 10 seconds (60s cooldown)',
            requirements: { leadership: 7, tactics: 5 },
            effect: { type: 'active', ability: 'rally', duration: 10, cooldown: 60 }
        },
        mass_recruitment: {
            id: 'mass_recruitment',
            name: 'Mass Recruitment',
            category: 'leadership',
            icon: '👥',
            description: 'Increase maximum survivor count by 5',
            requirements: { leadership: 8 },
            effect: { type: 'passive', stat: 'maxSurvivors', value: 5 }
        }
    };

    // ============= STATE =============
    let playerSkills = {};
    let playerPerks = new Set();
    let availableSkillPoints = 0;
    let availablePerkPoints = 0;
    let skillXP = {};
    let perkCooldowns = {};

    // Initialize skills
    function initializeSkills() {
        for (const skillId of Object.keys(SKILLS)) {
            playerSkills[skillId] = 0;
            skillXP[skillId] = 0;
        }
    }

    // ============= SKILL FUNCTIONS =============
    function getSkillLevel(skillId) {
        return playerSkills[skillId] || 0;
    }

    function getSkillXP(skillId) {
        return skillXP[skillId] || 0;
    }

    function getXPToNextLevel(skillId) {
        const level = getSkillLevel(skillId);
        if (level >= CONFIG.MAX_SKILL_LEVEL) return Infinity;
        return Math.floor(CONFIG.BASE_XP_REQUIREMENT * Math.pow(CONFIG.XP_GROWTH_RATE, level));
    }

    function addSkillXP(skillId, amount) {
        const skill = SKILLS[skillId];
        if (!skill) return;

        const currentLevel = getSkillLevel(skillId);
        if (currentLevel >= skill.maxLevel) return;

        skillXP[skillId] = (skillXP[skillId] || 0) + amount;

        // Check for level up
        while (skillXP[skillId] >= getXPToNextLevel(skillId) && playerSkills[skillId] < skill.maxLevel) {
            skillXP[skillId] -= getXPToNextLevel(skillId);
            levelUpSkill(skillId);
        }
    }

    function levelUpSkill(skillId) {
        const skill = SKILLS[skillId];
        if (!skill) return false;

        if (playerSkills[skillId] >= skill.maxLevel) {
            return false;
        }

        playerSkills[skillId]++;

        // Apply effects
        recalculateSkillBonuses();

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">trending_up</i> ${skill.name} leveled up to ${playerSkills[skillId]}!`,
                []
            );
        }

        if (typeof spawnParticles === 'function') {
            spawnParticles(player.x, player.y, '#00ff88', 12);
        }

        // Check for unlocked perks
        checkPerkUnlocks();

        return true;
    }

    function spendSkillPoint(skillId) {
        if (availableSkillPoints <= 0) {
            if (typeof showNotification === 'function') {
                showNotification('<i class="material-icons">warning</i> No skill points available!', []);
            }
            return false;
        }

        const skill = SKILLS[skillId];
        if (!skill || playerSkills[skillId] >= skill.maxLevel) {
            return false;
        }

        availableSkillPoints--;
        playerSkills[skillId]++;
        recalculateSkillBonuses();
        checkPerkUnlocks();
        updateSkillUI();

        return true;
    }

    function addSkillPoints(amount) {
        availableSkillPoints += amount;
        updateSkillUI();
    }

    // ============= PERK FUNCTIONS =============
    function hasPerk(perkId) {
        return playerPerks.has(perkId);
    }

    function canUnlockPerk(perkId) {
        const perk = PERKS[perkId];
        if (!perk) return { canUnlock: false, reason: 'Perk not found' };

        if (playerPerks.has(perkId)) {
            return { canUnlock: false, reason: 'Already unlocked' };
        }

        if (availablePerkPoints <= 0) {
            return { canUnlock: false, reason: 'No perk points available' };
        }

        // Check skill requirements
        for (const [skillId, requiredLevel] of Object.entries(perk.requirements)) {
            if (getSkillLevel(skillId) < requiredLevel) {
                return {
                    canUnlock: false,
                    reason: 'Skill requirements not met',
                    missing: { [skillId]: requiredLevel - getSkillLevel(skillId) }
                };
            }
        }

        return { canUnlock: true };
    }

    function unlockPerk(perkId) {
        const check = canUnlockPerk(perkId);
        if (!check.canUnlock) {
            if (typeof showNotification === 'function') {
                showNotification(`<i class="material-icons">warning</i> Cannot unlock: ${check.reason}`, []);
            }
            return false;
        }

        const perk = PERKS[perkId];
        availablePerkPoints--;
        playerPerks.add(perkId);

        // Apply immediate effects
        applyPerkEffect(perk);

        if (typeof showNotification === 'function') {
            showNotification(
                `<i class="material-icons">stars</i> Perk Unlocked: ${perk.name}!`,
                []
            );
        }

        if (typeof spawnParticles === 'function') {
            spawnParticles(player.x, player.y, '#ffd700', 20);
        }

        recalculateSkillBonuses();
        updateSkillUI();

        return true;
    }

    function addPerkPoints(amount) {
        availablePerkPoints += amount;
        updateSkillUI();
    }

    function checkPerkUnlocks() {
        // Check if any new perks became available
        for (const [perkId, perk] of Object.entries(PERKS)) {
            if (playerPerks.has(perkId)) continue;

            let allMet = true;
            for (const [skillId, requiredLevel] of Object.entries(perk.requirements)) {
                if (getSkillLevel(skillId) < requiredLevel) {
                    allMet = false;
                    break;
                }
            }

            if (allMet) {
                // Perk requirements met - could show notification
            }
        }
    }

    // ============= EFFECT CALCULATIONS =============
    function recalculateSkillBonuses() {
        if (!player) return;

        // Initialize bonus object
        const bonuses = {
            meleeDamage: 0,
            rangedDamage: 0,
            attackSpeed: 0,
            critChance: 0,
            critDamage: 0,
            defense: 0,
            damageReduction: 0,
            maxHealth: 0,
            healthRegen: 0,
            speed: 0,
            lifesteal: 0,
            lootBonus: 0,
            craftingSpeed: 0,
            miningSpeed: 0,
            woodcuttingSpeed: 0,
            farmingSpeed: 0
        };

        // Add skill bonuses
        for (const [skillId, level] of Object.entries(playerSkills)) {
            if (level <= 0) continue;

            const skill = SKILLS[skillId];
            if (!skill) continue;

            for (const effect of skill.effects) {
                if (bonuses.hasOwnProperty(effect.stat)) {
                    bonuses[effect.stat] += effect.perLevel * level;
                }
            }
        }

        // Add perk bonuses
        for (const perkId of playerPerks) {
            const perk = PERKS[perkId];
            if (!perk || !perk.effect) continue;

            if (perk.effect.type === 'passive' && bonuses.hasOwnProperty(perk.effect.stat)) {
                bonuses[perk.effect.stat] += perk.effect.value;
            }
        }

        // Store bonuses for use by other systems
        player.skillBonuses = bonuses;

        // Recalculate equipment stats if available
        if (typeof EquipmentSystem !== 'undefined') {
            EquipmentSystem.recalculatePlayerStats();
        }

        return bonuses;
    }

    function applyPerkEffect(perk) {
        if (!perk.effect) return;

        switch (perk.effect.type) {
            case 'passive':
                // Applied in recalculateSkillBonuses
                break;

            case 'immunity':
                // Add immunity flag
                if (!player.immunities) player.immunities = new Set();
                player.immunities.add(perk.effect.status);
                break;

            case 'active':
                // Register active ability
                if (!player.activeAbilities) player.activeAbilities = {};
                player.activeAbilities[perk.id] = {
                    perk,
                    cooldown: 0,
                    ready: true
                };
                break;
        }
    }

    function getSkillBonus(statName) {
        return player?.skillBonuses?.[statName] || 0;
    }

    // ============= ACTIVE ABILITIES =============
    function useActiveAbility(perkId) {
        const ability = player?.activeAbilities?.[perkId];
        if (!ability || !ability.ready) {
            if (typeof showNotification === 'function') {
                showNotification('<i class="material-icons">hourglass_empty</i> Ability on cooldown!', []);
            }
            return false;
        }

        const perk = ability.perk;

        // Execute ability
        switch (perk.effect.ability) {
            case 'rally':
                // Boost all survivors
                for (const survivor of survivors) {
                    if (survivor.isPlayer) continue;
                    survivor.rallyBuff = {
                        attackSpeedBoost: 0.5,
                        duration: perk.effect.duration,
                        remaining: perk.effect.duration
                    };
                }
                if (typeof showNotification === 'function') {
                    showNotification('<i class="material-icons">volume_up</i> Rally Cry activated!', []);
                }
                break;
        }

        // Set cooldown
        ability.ready = false;
        ability.cooldown = perk.effect.cooldown;
        perkCooldowns[perkId] = perk.effect.cooldown;

        return true;
    }

    function updateAbilityCooldowns(dt) {
        for (const perkId of Object.keys(perkCooldowns)) {
            perkCooldowns[perkId] -= dt;
            if (perkCooldowns[perkId] <= 0) {
                perkCooldowns[perkId] = 0;
                if (player?.activeAbilities?.[perkId]) {
                    player.activeAbilities[perkId].ready = true;
                }
            }
        }
    }

    // ============= TRIGGERED EFFECTS =============
    function checkTriggeredPerks(trigger, context = {}) {
        for (const perkId of playerPerks) {
            const perk = PERKS[perkId];
            if (!perk?.effect || perk.effect.type !== 'triggered') continue;
            if (perk.effect.trigger !== trigger) continue;

            // Check cooldown
            if (perkCooldowns[perkId] > 0) continue;

            // Execute triggered effect
            switch (perk.effect.action) {
                case 'heal':
                    const healAmount = player.maxHealth * perk.effect.value;
                    player.health = Math.min(player.maxHealth, player.health + healAmount);
                    if (typeof spawnParticles === 'function') {
                        spawnParticles(player.x, player.y, '#00ff00', 10);
                    }
                    if (typeof addDamageNumber === 'function') {
                        addDamageNumber(player.x, player.y - 0.5, `+${Math.floor(healAmount)}`, '#00ff00');
                    }
                    if (typeof showNotification === 'function') {
                        showNotification(`<i class="material-icons">healing</i> ${perk.name} activated!`, []);
                    }
                    break;
            }

            // Set cooldown
            perkCooldowns[perkId] = perk.effect.cooldown;
        }
    }

    // ============= CONDITIONAL EFFECTS =============
    function getConditionalBonus(statName, context = {}) {
        let bonus = 0;

        for (const perkId of playerPerks) {
            const perk = PERKS[perkId];
            if (!perk?.effect || perk.effect.type !== 'conditional') continue;
            if (perk.effect.stat !== statName) continue;

            // Check condition
            let conditionMet = false;

            switch (perk.effect.condition) {
                case 'lowHealth':
                    conditionMet = player.health < player.maxHealth * 0.3;
                    break;
                case 'targetLowHealth':
                    conditionMet = context.targetHealth && context.targetMaxHealth &&
                                  context.targetHealth < context.targetMaxHealth * 0.25;
                    break;
                case 'fullHealth':
                    conditionMet = player.health >= player.maxHealth;
                    break;
                case 'isNight':
                    conditionMet = isNight;
                    break;
            }

            if (conditionMet) {
                bonus += perk.effect.value;
            }
        }

        return bonus;
    }

    // ============= UI FUNCTIONS =============
    function updateSkillUI() {
        const container = document.getElementById('skillTreeGrid');
        if (!container) return;

        container.innerHTML = '';

        const categories = [...new Set(Object.values(SKILLS).map(s => s.category))];

        for (const category of categories) {
            const categorySkills = Object.values(SKILLS).filter(s => s.category === category);

            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'skill-category';
            categoryDiv.innerHTML = `<h4>${category.charAt(0).toUpperCase() + category.slice(1)}</h4>`;

            for (const skill of categorySkills) {
                const level = getSkillLevel(skill.id);
                const xp = getSkillXP(skill.id);
                const xpNeeded = getXPToNextLevel(skill.id);
                const xpPercent = level < skill.maxLevel ? (xp / xpNeeded) * 100 : 100;

                const skillDiv = document.createElement('div');
                skillDiv.className = `skill-slot ${level > 0 ? 'unlocked' : ''} ${level >= skill.maxLevel ? 'maxed' : ''}`;

                skillDiv.innerHTML = `
                    <span class="skill-icon">${skill.icon}</span>
                    <div class="skill-info">
                        <span class="skill-name">${skill.name}</span>
                        <span class="skill-level">Lv. ${level}/${skill.maxLevel}</span>
                    </div>
                    <div class="skill-xp-bar">
                        <div class="skill-xp-fill" style="width: ${xpPercent}%"></div>
                    </div>
                    ${availableSkillPoints > 0 && level < skill.maxLevel ?
                        '<button class="skill-upgrade-btn" onclick="SkillSystem.spendSkillPoint(\'' + skill.id + '\')">+</button>' : ''}
                `;

                skillDiv.title = `${skill.description}\n${skill.effects.map(e => `+${(e.perLevel * 100).toFixed(0)}% ${e.stat} per level`).join('\n')}`;

                categoryDiv.appendChild(skillDiv);
            }

            container.appendChild(categoryDiv);
        }

        // Update points display
        const pointsDisplay = document.getElementById('skillPointsDisplay');
        if (pointsDisplay) {
            pointsDisplay.textContent = `Skill Points: ${availableSkillPoints} | Perk Points: ${availablePerkPoints}`;
        }
    }

    function updatePerkUI() {
        const container = document.getElementById('perkTreeGrid');
        if (!container) return;

        container.innerHTML = '';

        const categories = [...new Set(Object.values(PERKS).map(p => p.category))];

        for (const category of categories) {
            const categoryPerks = Object.values(PERKS).filter(p => p.category === category);

            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'perk-category';
            categoryDiv.innerHTML = `<h4>${category.charAt(0).toUpperCase() + category.slice(1)}</h4>`;

            for (const perk of categoryPerks) {
                const unlocked = hasPerk(perk.id);
                const check = canUnlockPerk(perk.id);

                const perkDiv = document.createElement('div');
                perkDiv.className = `perk-slot ${unlocked ? 'unlocked' : ''} ${check.canUnlock ? 'available' : ''}`;

                perkDiv.innerHTML = `
                    <span class="perk-icon">${perk.icon}</span>
                    <span class="perk-name">${perk.name}</span>
                    ${!unlocked && check.canUnlock ?
                        '<button class="perk-unlock-btn" onclick="SkillSystem.unlockPerk(\'' + perk.id + '\')">Unlock</button>' : ''}
                    ${!unlocked && !check.canUnlock ? '<span class="perk-locked">🔒</span>' : ''}
                `;

                perkDiv.title = `${perk.description}\n\nRequires:\n${Object.entries(perk.requirements).map(([s, l]) => `${SKILLS[s]?.name || s} Lv. ${l}`).join('\n')}`;

                categoryDiv.appendChild(perkDiv);
            }

            container.appendChild(categoryDiv);
        }
    }

    // ============= PLAYER LEVEL INTEGRATION =============
    function onPlayerLevelUp(newLevel) {
        addSkillPoints(CONFIG.SKILL_POINTS_PER_PLAYER_LEVEL);

        if (newLevel % 5 === 0) {
            addPerkPoints(CONFIG.PERK_POINTS_PER_5_LEVELS);
        }
    }

    // ============= SERIALIZATION =============
    function getPlayerSkills() {
        return {
            skills: { ...playerSkills },
            skillXP: { ...skillXP },
            perks: Array.from(playerPerks),
            availableSkillPoints,
            availablePerkPoints,
            perkCooldowns: { ...perkCooldowns }
        };
    }

    function setPlayerSkills(data) {
        if (!data) return;

        playerSkills = data.skills || {};
        skillXP = data.skillXP || {};
        playerPerks = new Set(data.perks || []);
        availableSkillPoints = data.availableSkillPoints || 0;
        availablePerkPoints = data.availablePerkPoints || 0;
        perkCooldowns = data.perkCooldowns || {};

        // Initialize missing skills
        for (const skillId of Object.keys(SKILLS)) {
            if (playerSkills[skillId] === undefined) {
                playerSkills[skillId] = 0;
                skillXP[skillId] = 0;
            }
        }

        // Re-apply perk effects
        for (const perkId of playerPerks) {
            const perk = PERKS[perkId];
            if (perk) applyPerkEffect(perk);
        }

        recalculateSkillBonuses();
        updateSkillUI();
        updatePerkUI();
    }

    // Initialize on load
    initializeSkills();

    // ============= PUBLIC API =============
    return {
        // Constants
        SKILLS,
        PERKS,
        CONFIG,

        // Skills
        getSkillLevel,
        getSkillXP,
        getXPToNextLevel,
        addSkillXP,
        spendSkillPoint,
        addSkillPoints,

        // Perks
        hasPerk,
        canUnlockPerk,
        unlockPerk,
        addPerkPoints,
        useActiveAbility,

        // Effects
        recalculateSkillBonuses,
        getSkillBonus,
        getConditionalBonus,
        checkTriggeredPerks,

        // Updates
        updateAbilityCooldowns,
        onPlayerLevelUp,

        // UI
        updateSkillUI,
        updatePerkUI,

        // State
        getPlayerSkills,
        setPlayerSkills,
        getAvailableSkillPoints: () => availableSkillPoints,
        getAvailablePerkPoints: () => availablePerkPoints
    };
})();

// Export globally
window.SkillSystem = SkillSystem;
