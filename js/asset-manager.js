// ============= ASSET MANAGER =============
const AssetManager = (function () {
    'use strict';

    const images = {};
    let loadedCount = 0;
    let totalCount = 0;
    let onComplete = null;

    const ASSET_PATHS = {
        // Animals
        'chick': 'assets/images/animals/chick.png',
        'rooster': 'assets/images/animals/rooster.png',
        'sheep': 'assets/images/animals/sheep.png',
        'pig': 'assets/images/animals/pig.png',
        'cow': 'assets/images/animals/cow.png',

        // Trees
        'tree1': 'assets/images/environment/tree1.png',
        'tree2': 'assets/images/environment/tree2.png',
        'tree3': 'assets/images/environment/tree3.png',

        // Characters - Swordsman Layered Parts
        'p_body_i': 'assets/images/characters/swordsman/idle_body.png',
        'p_head_i': 'assets/images/characters/swordsman/idle_head.png',
        'p_sword_i': 'assets/images/characters/swordsman/idle_sword.png',
        'p_swordback_i': 'assets/images/characters/swordsman/idle_sword_back.png',

        'p_body_w': 'assets/images/characters/swordsman/walk_body.png',
        'p_head_w': 'assets/images/characters/swordsman/walk_head.png',
        'p_sword_w': 'assets/images/characters/swordsman/walk_sword.png',
        'p_swordback_w': 'assets/images/characters/swordsman/walk_sword_back.png',

        'p_body_a': 'assets/images/characters/swordsman/attack_body.png',
        'p_head_a': 'assets/images/characters/swordsman/attack_head.png',
        'p_sword_a': 'assets/images/characters/swordsman/attack_sword.png',
        'p_swordback_a': 'assets/images/characters/swordsman/attack_sword_back.png',

        'slime': 'assets/images/enemies/slime.png',

        // NEW: Zombie and Skeleton sprites (32x48, 3-frame walk, 4 directions)
        'zombie_skeleton': 'assets/images/enemies/zombies/zombie_skeleton.png',

        // NEW: NPC Character sprites (32x32, various characters)
        'rpg_characters': 'assets/images/npcs/rpg_characters.png',
        'soldier': 'assets/images/npcs/soldier.png',
        'characters_tiny': 'assets/images/npcs/characters_tiny16.png',

        // NEW: Item icons
        'items': 'assets/images/items/items.png',

        // NEW: Building/Wall tileset
        'walls': 'assets/images/buildings/walls/lpc-walls/walls.png',

        // Environment
        'bush1': 'assets/images/environment/bush1.png',
        'bush2': 'assets/images/environment/bush2.png',
        'bush3': 'assets/images/environment/bush3.png',
        'rock1': 'assets/images/environment/rock1.png',
        'rock2': 'assets/images/environment/rock2.png',
        'crystal_blue': 'assets/images/environment/crystal_blue.png',
        'crystal_green': 'assets/images/environment/crystal_green.png',

        // NEW: Environment tilesets
        'basictiles': 'assets/images/environment/basictiles.png',
        'things': 'assets/images/environment/things.png',
        'base_landscape': 'assets/images/environment/base_landscape.png'
    };

    function load(callback) {
        onComplete = callback;
        const keys = Object.keys(ASSET_PATHS);
        totalCount = keys.length;

        if (totalCount === 0) {
            if (onComplete) onComplete();
            return;
        }

        keys.forEach(key => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalCount) {
                    if (onComplete) onComplete();
                }
            };
            img.onerror = () => {
                console.error(`Failed to load asset: ${key} at ${ASSET_PATHS[key]}`);
                loadedCount++;
                if (loadedCount === totalCount) {
                    if (onComplete) onComplete();
                }
            };
            img.src = ASSET_PATHS[key];
            images[key] = img;
        });
    }

    function get(key) {
        return images[key];
    }

    return {
        load,
        get
    };
})();

window.AssetManager = AssetManager;
