// ============================================
// PHASE 1 UI FUNCTIONS
// ============================================
// Toggle functions for the new Phase 1 system menus

// Pet Menu - Now shows wild animals in the area
let petMenuOpen = false;
function togglePetMenu() {
    const menu = document.getElementById('petMenu');
    if (!menu) return;

    petMenuOpen = !petMenuOpen;
    menu.style.display = petMenuOpen ? 'block' : 'none';

    if (petMenuOpen) {
        updatePetMenuUI();
    }
}

function updatePetMenuUI() {
    const list = document.getElementById('petList');
    if (!list) return;

    if (typeof PetSystem === 'undefined') {
        list.innerHTML = '<p>Animal system not available</p>';
        return;
    }

    const animals = PetSystem.getWildAnimals();
    if (animals.length === 0) {
        list.innerHTML = '<p style="color:#888;text-align:center;">No animals nearby.<br>Animals spawn naturally as you explore!</p>';
        return;
    }

    // Group animals by type
    const grouped = {};
    for (const animal of animals) {
        const typeId = animal.type?.id || 'unknown';
        if (!grouped[typeId]) {
            grouped[typeId] = { type: animal.type, count: 0, animals: [] };
        }
        grouped[typeId].count++;
        grouped[typeId].animals.push(animal);
    }

    let html = '<div style="margin-bottom:10px;color:#aaa;font-size:12px;">Animals in the area:</div>';
    for (const [typeId, data] of Object.entries(grouped)) {
        const type = data.type;
        const dropsText = type.drops ? type.drops.map(d => d.item).join(', ') : 'none';

        html += `
            <div class="pet-card" style="cursor:default;">
                <div class="pet-icon" style="font-size:24px;">${type.icon || '🐾'}</div>
                <div class="pet-info">
                    <div class="pet-name">${type.name || typeId} x${data.count}</div>
                    <div class="pet-stats" style="color:#888;font-size:11px;">
                        <span>HP: ${type.baseStats?.health || '?'}</span>
                        <span>Drops: ${dropsText}</span>
                    </div>
                </div>
            </div>
        `;
    }

    html += '<div style="margin-top:15px;padding:10px;background:rgba(0,0,0,0.3);border-radius:6px;font-size:11px;color:#888;">';
    html += '<b>Tip:</b> Click or press Space near animals to attack them and collect resources!';
    html += '</div>';

    list.innerHTML = html;
}

// These functions are no longer used but kept for compatibility
function showPetDetails(petId) {
    // No longer applicable - we don't have tamed pets
}

function unequipPetItem(petId, slot) {
    // No longer applicable
}

function petCommand(petId, command) {
    // No longer applicable
}

// Farm Menu
let farmMenuOpen = false;
function toggleFarmMenu() {
    const menu = document.getElementById('farmMenu');
    if (!menu) return;

    farmMenuOpen = !farmMenuOpen;
    menu.style.display = farmMenuOpen ? 'block' : 'none';

    if (farmMenuOpen) {
        updateFarmMenuUI();
    }
}

function showFarmTab(tab) {
    document.querySelectorAll('.farm-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    document.getElementById('farmCrops').style.display = tab === 'crops' ? 'block' : 'none';
    document.getElementById('farmLivestock').style.display = tab === 'livestock' ? 'block' : 'none';
    document.getElementById('farmProcessors').style.display = tab === 'processors' ? 'block' : 'none';
}

function updateFarmMenuUI() {
    if (typeof FarmingSystem === 'undefined') return;

    const cropsDiv = document.getElementById('farmCrops');
    if (cropsDiv) {
        const tiles = FarmingSystem.getAllFarmTiles();
        if (tiles.length === 0) {
            cropsDiv.innerHTML = '<p>No farm tiles. Use a hoe on grass/dirt to create farm tiles!</p>';
        } else {
            let html = '';
            for (const tile of tiles) {
                html += `
                    <div class="farm-tile">
                        <div class="farm-tile-header">
                            <span class="farm-tile-crop">${tile.crop ? tile.crop.type.icon : '🌱'}</span>
                            <span class="farm-tile-stage">${tile.crop ? `Stage ${tile.crop.stage + 1}/${tile.crop.type.stages}` : 'Empty'}</span>
                        </div>
                        <div class="farm-tile-indicators">
                            <span class="tile-indicator water-indicator">💧 ${Math.floor(tile.waterLevel)}%</span>
                            <span class="tile-indicator nutrient-indicator">🌱 N:${Math.floor(tile.nutrients.nitrogen)} P:${Math.floor(tile.nutrients.phosphorus)}</span>
                        </div>
                        <div class="farm-actions">
                            <button class="farm-action-btn" onclick="plantCrop(${tile.id})">Plant</button>
                            <button class="farm-action-btn" onclick="harvestCrop(${tile.id})">Harvest</button>
                            <button class="farm-action-btn" onclick="waterCrop(${tile.id})">Water</button>
                            <button class="farm-action-btn" onclick="fertilizeCrop(${tile.id})">Fertilize</button>
                        </div>
                    </div>
                `;
            }
            cropsDiv.innerHTML = html;
        }
    }

    const livestockDiv = document.getElementById('farmLivestock');
    if (livestockDiv) {
        const animals = FarmingSystem.getAllLivestock();
        if (animals.length === 0) {
            livestockDiv.innerHTML = '<p>No livestock. Capture or buy animals to start a farm!</p>';
        } else {
            let html = '';
            for (const animal of animals) {
                html += `
                    <div class="livestock-card">
                        <div class="livestock-icon">${animal.type.icon}</div>
                        <div class="livestock-info">
                            <div class="livestock-name">${animal.type.name}</div>
                            <div class="livestock-status">
                                ❤️ ${Math.floor(animal.health)}/100 |
                                🍖 ${Math.floor(animal.hunger)}/100 |
                                ${animal.isPregnant ? '🤰 Pregnant' : 'Ready to breed'}
                            </div>
                        </div>
                    </div>
                `;
            }
            livestockDiv.innerHTML = html;
        }
    }

    const processorsDiv = document.getElementById('farmProcessors');
    if (processorsDiv) {
        const processors = FarmingSystem.getAllProcessors();
        if (processors.length === 0) {
            processorsDiv.innerHTML = '<p>No processors. Build mills, dairies, and smokers!</p>';
        } else {
            let html = '';
            for (const proc of processors) {
                html += `
                    <div class="processor-card">
                        <div class="processor-header">
                            <span class="processor-icon">${proc.type.icon}</span>
                            <span>${proc.type.name}</span>
                            <span class="processor-status ${proc.isRunning ? 'running' : ''}">${proc.isRunning ? 'Running' : 'Idle'}</span>
                        </div>
                        ${proc.isRunning ? `<div class="processor-progress"><div class="processor-progress-fill" style="width:${(proc.processProgress / proc.currentProcess?.time || 0) * 100}%"></div></div>` : ''}
                    </div>
                `;
            }
            processorsDiv.innerHTML = html;
        }
    }
}

function plantCrop(tileId) {
    if (typeof FarmingSystem === 'undefined') return;
    const tile = FarmingSystem.getFarmTile(tileId);
    if (tile && !tile.crop) {
        // Show crop selection menu
        showNotification('Click on a crop type to plant:', []);
    }
}

function harvestCrop(tileId) {
    if (typeof FarmingSystem === 'undefined') return;
    const tile = FarmingSystem.getFarmTile(tileId);
    if (tile) {
        const outputs = tile.harvest();
        if (outputs) {
            for (const [item, amount] of Object.entries(outputs)) {
                resources[item] = (resources[item] || 0) + amount;
            }
            showNotification(`Harvested: ${Object.entries(outputs).map(([k, v]) => `${v} ${k}`).join(', ')}`, []);
            updateFarmMenuUI();
        }
    }
}

function waterCrop(tileId) {
    if (typeof FarmingSystem === 'undefined') return;
    const tile = FarmingSystem.getFarmTile(tileId);
    if (tile) {
        tile.addWater(50);
        updateFarmMenuUI();
    }
}

function fertilizeCrop(tileId) {
    if (typeof FarmingSystem === 'undefined') return;
    const tile = FarmingSystem.getFarmTile(tileId);
    if (tile) {
        tile.fertilize(30);
        updateFarmMenuUI();
    }
}

// Shelter Menu
let shelterMenuOpen = false;
function toggleShelterMenu() {
    const menu = document.getElementById('shelterMenu');
    if (!menu) return;

    shelterMenuOpen = !shelterMenuOpen;
    menu.style.display = shelterMenuOpen ? 'block' : 'none';

    if (shelterMenuOpen) {
        updateShelterMenuUI();
    }
}

function updateShelterMenuUI() {
    if (typeof ShelterSystem === 'undefined') return;

    const list = document.getElementById('shelterList');
    const tempInfo = document.getElementById('temperatureInfo');
    const comfortInfo = document.getElementById('comfortInfo');
    const fireMgmt = document.getElementById('fireManagement');

    const buildings = ShelterSystem.getBuildings();
    if (list) {
        if (buildings.length === 0) {
            list.innerHTML = '<p>No shelters built. Build a tent, shack, or cabin!</p>';
        } else {
            list.innerHTML = buildings.map(b => `
                <div class="shelter-item">
                    <span class="shelter-item-icon">${b.type.icon}</span>
                    <span>${b.type.name} (Lv.${b.level})</span>
                </div>
            `).join('');
        }
    }

    if (tempInfo) {
        const tempStatus = ShelterSystem.getTemperatureStatus();
        tempInfo.innerHTML = `
            <p>Temperature: ${tempStatus.message}</p>
            <p>${ShelterSystem.getHypothermiaSeverity() ? '⚠️ Hypothermia: ' + ShelterSystem.getHypothermiaSeverity().level : ''}</p>
            <p>${ShelterSystem.getHeatstrokeSeverity() ? '⚠️ Heatstroke: ' + ShelterSystem.getHeatstrokeSeverity().level : ''}</p>
        `;
    }

    if (comfortInfo) {
        const comfort = ShelterSystem.getComfortLevel();
        const rested = ShelterSystem.getWellRestedStatus();
        comfortInfo.innerHTML = `
            <p>Comfort: ${comfort.level}</p>
            <p>Health Regen: ${ShelterSystem.getHealthRegenRate().toFixed(1)}/s</p>
            ${rested ? `<p class="well-rested-badge">💤 Well Rested (${rested.duration} min left)</p>` : ''}
        `;
    }

    if (fireMgmt) {
        const fires = ShelterSystem.getActiveFires();
        if (fires.length === 0) {
            fireMgmt.innerHTML = '<p>No fires burning. Build a campfire to stay warm!</p>';
        } else {
            fireMgmt.innerHTML = fires.map(f => `
                <div class="fire-status">
                    ${f.type.icon} ${f.type.name} - ${Math.floor((f.fuel / f.maxFuel) * 100)}% fuel
                </div>
            `).join('');
        }
    }
}

// Cooking Menu
let cookingMenuOpen = false;
function toggleCookingMenu() {
    const menu = document.getElementById('cookingMenu');
    if (!menu) return;

    cookingMenuOpen = !cookingMenuOpen;
    menu.style.display = cookingMenuOpen ? 'block' : 'none';

    if (cookingMenuOpen) {
        updateCookingMenuUI();
    }
}

function updateCookingMenuUI() {
    if (typeof CookingSystem === 'undefined') return;

    // Update nutrition
    const nutrition = CookingSystem.getNutritionStatus();
    document.getElementById('nutritionCalories').textContent = `${nutrition.calories.current} / ${nutrition.calories.target}`;
    document.getElementById('nutritionProtein').textContent = `${nutrition.protein.current} / ${nutrition.protein.target}`;
    document.getElementById('nutritionCarbs').textContent = `${nutrition.carbs.current} / ${nutrition.carbs.target}`;
    document.getElementById('nutritionVitamins').textContent = `${nutrition.vitamins.current} / ${nutrition.vitamins.target}`;

    document.getElementById('caloriesFill').style.width = `${Math.min(100, (nutrition.calories.current / nutrition.calories.target) * 100)}%`;
    document.getElementById('proteinFill').style.width = `${Math.min(100, (nutrition.protein.current / nutrition.protein.target) * 100)}%`;
    document.getElementById('carbsFill').style.width = `${Math.min(100, (nutrition.carbs.current / nutrition.carbs.target) * 100)}%`;
    document.getElementById('vitaminsFill').style.width = `${Math.min(100, (nutrition.vitamins.current / nutrition.vitamins.target) * 100)}%`;

    const balance = document.getElementById('nutritionBalance');
    balance.textContent = nutrition.balance > 0.8 ? 'Optimal' : nutrition.balance > 0.6 ? 'Good' : nutrition.balance > 0.4 ? 'Poor' : 'Bad';
    balance.className = 'balance-indicator ' + (nutrition.balance > 0.8 ? 'optimal' : nutrition.balance > 0.6 ? 'good' : nutrition.balance > 0.4 ? 'poor' : 'bad');

    // Update food inventory
    const inventory = CookingSystem.getInventory();
    const foodDiv = document.getElementById('foodInventory');
    if (foodDiv) {
        if (inventory.length === 0) {
            foodDiv.innerHTML = '<p>No food in inventory. Hunt, farm, or gather food!</p>';
        } else {
            foodDiv.innerHTML = `
                <div class="inventory-title">Food Inventory</div>
                ${inventory.map(f => `
                    <div class="food-item" onclick="consumeFoodItem('${f.id}')">
                        <span class="food-icon">${f.icon}</span>
                        <span class="food-name">${f.name}</span>
                        <span class="food-quantity">x${f.quantity}</span>
                        <span class="food-freshness ${f.freshness > 80 ? 'fresh' : f.freshness > 40 ? 'stale' : 'spoiled'}">${Math.floor(f.freshness)}%</span>
                    </div>
                `).join('')}
            `;
        }
    }

    // Update buffs
    const buffs = CookingSystem.getActiveBuffs();
    const buffDiv = document.getElementById('buffPanel');
    if (buffDiv) {
        if (buffs.length === 0) {
            buffDiv.innerHTML = '';
        } else {
            buffDiv.innerHTML = buffs.map(b => `
                <div class="buff-item">
                    ${b.effects && b.effects.instantHeal ? '💖' : b.effects && b.effects.strengthBonus ? '💪' : '✨'} ${b.remaining}s
                </div>
            `).join('');
        }
    }
}

function consumeFoodItem(foodId) {
    if (typeof CookingSystem === 'undefined') return;

    const inventory = CookingSystem.getInventory();
    const food = inventory.find(f => f.id === foodId);
    if (food) {
        CookingSystem.consumeFood(food);
        updateCookingMenuUI();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyP' && !e.ctrlKey && !e.altKey) {
        togglePetMenu();
    }
    if (e.code === 'KeyG' && !e.ctrlKey && !e.altKey) {
        toggleFarmMenu();
    }
    if (e.code === 'KeyO' && !e.ctrlKey && !e.altKey) {
        toggleCookingMenu();
    }
});
