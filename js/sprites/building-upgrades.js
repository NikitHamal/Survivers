// ============= BUILDING UPGRADE VISUAL VARIANTS =============
// Adds level-based overlays without replacing base sprites.

function renderBuildingTile(tile, x, y, s, wx, wy) {
    if (typeof TILES === 'undefined') return false;
    if (typeof getBuilding !== 'function') return false;

    const building = getBuilding(wx, wy);
    const level = Math.max(1, Math.floor(building?.level || 1));

    switch (tile) {
        case TILES.WALL:
            renderWall(x, y, s, wx, wy);
            renderWallUpgradeOverlay(level, x, y, s);
            return true;
        case TILES.TOWER:
            renderTower(x, y, s);
            renderTowerUpgradeOverlay(level, x, y, s);
            return true;
        case TILES.CANNON:
            renderCannon(x, y, s);
            renderCannonUpgradeOverlay(level, x, y, s);
            return true;
        case TILES.CAMPFIRE:
            renderCampfire(x, y, s);
            renderCampfireUpgradeOverlay(level, x, y, s);
            return true;
        case TILES.WORKBENCH:
            renderWorkbench(x, y, s);
            renderWorkbenchUpgradeOverlay(level, x, y, s);
            return true;
        case TILES.CHEST:
            renderChest(x, y, s);
            renderChestUpgradeOverlay(level, x, y, s);
            return true;
        case TILES.BED:
            renderBed(x, y, s);
            renderBedUpgradeOverlay(level, x, y, s);
            return true;
        case TILES.FARM:
            renderFarm(x, y, s);
            renderFarmUpgradeOverlay(level, x, y, s);
            return true;
        case TILES.HOUSE:
            renderHouse(x, y, s);
            renderHouseUpgradeOverlay(level, x, y, s);
            return true;
        case TILES.SPIKES:
            renderSpikes(x, y, s);
            renderSpikeUpgradeOverlay(level, x, y, s);
            return true;
        default:
            return false;
    }
}

function drawUpgradeBadge(level, x, y, s, color) {
    if (level <= 1) return;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x + s * 0.02, y + s * 0.02, s * 0.28, s * 0.18);
    ctx.fillStyle = color;
    ctx.fillRect(x + s * 0.03, y + s * 0.03, s * 0.26, s * 0.16);
    ctx.fillStyle = '#111';
    ctx.font = `bold ${Math.floor(s * 0.14)}px Pixelify Sans`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(level), x + s * 0.16, y + s * 0.11);
}

function renderWallUpgradeOverlay(level, x, y, s) {
    if (level >= 2) {
        ctx.fillStyle = '#3b3b3b';
        ctx.fillRect(x + s * 0.15, y + s * 0.2, s * 0.1, s * 0.6);
        ctx.fillRect(x + s * 0.75, y + s * 0.2, s * 0.1, s * 0.6);
    }
    if (level >= 3) {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x + s * 0.05, y + s * 0.05, s * 0.9, 2);
    }
    if (level >= 4) {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(x + s * 0.3, y - 2, s * 0.4, 3);
        ctx.fillRect(x + s * 0.45, y - 4, 2, 6);
    }
    if (level >= 5) {
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#ffd66a';
        ctx.fillRect(x + s * 0.25, y + s * 0.7, s * 0.5, 2);
        ctx.globalAlpha = 1;
    }
    drawUpgradeBadge(level, x, y, s, '#d8c27a');
}

function renderTowerUpgradeOverlay(level, x, y, s) {
    if (level >= 2) {
        ctx.fillStyle = '#5a3d2b';
        ctx.fillRect(x + s * 0.1, y + s * 0.2, s * 0.8, 3);
    }
    if (level >= 3) {
        ctx.fillStyle = '#c9b37d';
        ctx.fillRect(x + s * 0.2, y - 4, s * 0.6, 4);
    }
    if (level >= 4) {
        ctx.fillStyle = '#1f1f1f';
        ctx.fillRect(x + s * 0.25, y + s * 0.35, s * 0.12, s * 0.2);
        ctx.fillRect(x + s * 0.63, y + s * 0.35, s * 0.12, s * 0.2);
    }
    if (level >= 5) {
        ctx.fillStyle = '#88ccff';
        ctx.fillRect(x + s * 0.46, y - 8, s * 0.08, 8);
        ctx.fillRect(x + s * 0.42, y - 10, s * 0.16, 3);
    }
    drawUpgradeBadge(level, x, y, s, '#ffd27a');
}

function renderCannonUpgradeOverlay(level, x, y, s) {
    if (level >= 2) {
        ctx.fillStyle = '#2b2b2b';
        ctx.fillRect(x + s * 0.15, y + s * 0.7, s * 0.7, 3);
    }
    if (level >= 3) {
        ctx.fillStyle = '#7a3a1a';
        ctx.fillRect(x + s * 0.25, y + s * 0.2, s * 0.5, 3);
    }
    if (level >= 4) {
        ctx.fillStyle = '#aa2b1a';
        ctx.fillRect(x + s * 0.65, y + s * 0.35, 3, s * 0.2);
    }
    if (level >= 5) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#ffcc66';
        ctx.fillRect(x + s * 0.2, y + s * 0.45, s * 0.6, 2);
        ctx.globalAlpha = 1;
    }
    drawUpgradeBadge(level, x, y, s, '#ffb36b');
}

function renderCampfireUpgradeOverlay(level, x, y, s) {
    if (level >= 2) {
        ctx.fillStyle = 'rgba(255,140,0,0.35)';
        ctx.beginPath();
        ctx.arc(x + s / 2, y + s / 2, s * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }
    if (level >= 3) {
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(x + s * 0.2, y + s * 0.8, s * 0.6, 3);
    }
    if (level >= 4) {
        ctx.fillStyle = '#c96b2c';
        ctx.fillRect(x + s * 0.45, y + s * 0.15, s * 0.1, s * 0.2);
    }
    if (level >= 5) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#ffe29a';
        ctx.fillRect(x + s * 0.35, y + s * 0.05, s * 0.3, 3);
        ctx.globalAlpha = 1;
    }
    drawUpgradeBadge(level, x, y, s, '#ffb050');
}

function renderWorkbenchUpgradeOverlay(level, x, y, s) {
    if (level >= 2) {
        ctx.fillStyle = '#6b4c2c';
        ctx.fillRect(x + s * 0.1, y + s * 0.2, s * 0.8, 2);
    }
    if (level >= 3) {
        ctx.fillStyle = '#2b2b2b';
        ctx.fillRect(x + s * 0.15, y + s * 0.6, s * 0.1, s * 0.2);
        ctx.fillRect(x + s * 0.75, y + s * 0.6, s * 0.1, s * 0.2);
    }
    if (level >= 4) {
        ctx.fillStyle = '#b8a060';
        ctx.fillRect(x + s * 0.35, y + s * 0.4, s * 0.3, 3);
    }
    if (level >= 5) {
        ctx.fillStyle = '#8fd1ff';
        ctx.fillRect(x + s * 0.7, y + s * 0.2, s * 0.18, s * 0.12);
    }
    drawUpgradeBadge(level, x, y, s, '#c9a468');
}

function renderChestUpgradeOverlay(level, x, y, s) {
    if (level >= 2) {
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(x + s * 0.2, y + s * 0.5, s * 0.6, 2);
    }
    if (level >= 3) {
        ctx.fillStyle = '#c9b37d';
        ctx.fillRect(x + s * 0.3, y + s * 0.3, s * 0.4, 3);
    }
    if (level >= 4) {
        ctx.fillStyle = '#2b2b2b';
        ctx.fillRect(x + s * 0.48, y + s * 0.52, s * 0.04, s * 0.15);
    }
    if (level >= 5) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#ffd66a';
        ctx.fillRect(x + s * 0.2, y + s * 0.2, s * 0.6, 2);
        ctx.globalAlpha = 1;
    }
    drawUpgradeBadge(level, x, y, s, '#e3c36a');
}

function renderBedUpgradeOverlay(level, x, y, s) {
    if (level >= 2) {
        ctx.fillStyle = '#8a6a3a';
        ctx.fillRect(x + s * 0.1, y + s * 0.7, s * 0.8, 2);
    }
    if (level >= 3) {
        ctx.fillStyle = '#c96b8a';
        ctx.fillRect(x + s * 0.2, y + s * 0.35, s * 0.6, 2);
    }
    if (level >= 4) {
        ctx.fillStyle = '#f0d8a8';
        ctx.fillRect(x + s * 0.7, y + s * 0.25, s * 0.15, s * 0.1);
    }
    if (level >= 5) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#88ffcc';
        ctx.fillRect(x + s * 0.15, y + s * 0.2, s * 0.7, 2);
        ctx.globalAlpha = 1;
    }
    drawUpgradeBadge(level, x, y, s, '#d8b46a');
}

function renderFarmUpgradeOverlay(level, x, y, s) {
    if (level >= 2) {
        ctx.fillStyle = '#5a7a3a';
        ctx.fillRect(x + s * 0.1, y + s * 0.6, s * 0.8, 2);
    }
    if (level >= 3) {
        ctx.fillStyle = '#c2a15a';
        ctx.fillRect(x + s * 0.2, y + s * 0.3, s * 0.15, s * 0.2);
        ctx.fillRect(x + s * 0.65, y + s * 0.3, s * 0.15, s * 0.2);
    }
    if (level >= 4) {
        ctx.fillStyle = '#d9b05c';
        ctx.fillRect(x + s * 0.45, y + s * 0.2, s * 0.1, s * 0.2);
    }
    if (level >= 5) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#9bff9b';
        ctx.fillRect(x + s * 0.2, y + s * 0.15, s * 0.6, 2);
        ctx.globalAlpha = 1;
    }
    drawUpgradeBadge(level, x, y, s, '#7fc96a');
}

function renderHouseUpgradeOverlay(level, x, y, s) {
    const s2 = s * 2;
    if (level >= 2) {
        ctx.fillStyle = '#6b4d2f';
        ctx.fillRect(x + s2 * 0.1, y + s2 * 0.55, s2 * 0.8, 3);
    }
    if (level >= 3) {
        ctx.fillStyle = '#c9b37d';
        ctx.fillRect(x + s2 * 0.35, y + s2 * 0.18, s2 * 0.3, 3);
    }
    if (level >= 4) {
        ctx.fillStyle = '#1f1f1f';
        ctx.fillRect(x + s2 * 0.15, y + s2 * 0.4, s2 * 0.12, s2 * 0.2);
        ctx.fillRect(x + s2 * 0.73, y + s2 * 0.4, s2 * 0.12, s2 * 0.2);
    }
    if (level >= 5) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#ffd66a';
        ctx.fillRect(x + s2 * 0.25, y + s2 * 0.15, s2 * 0.5, 3);
        ctx.globalAlpha = 1;
    }
    drawUpgradeBadge(level, x, y, s, '#e3c36a');
}

function renderSpikeUpgradeOverlay(level, x, y, s) {
    if (level >= 2) {
        ctx.fillStyle = '#2b2b2b';
        ctx.fillRect(x + s * 0.2, y + s * 0.75, s * 0.6, 2);
    }
    if (level >= 3) {
        ctx.fillStyle = '#8a2a2a';
        ctx.fillRect(x + s * 0.45, y + s * 0.2, 2, s * 0.2);
    }
    if (level >= 4) {
        ctx.fillStyle = '#f2c266';
        ctx.fillRect(x + s * 0.35, y + s * 0.15, s * 0.3, 2);
    }
    if (level >= 5) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#ff9b9b';
        ctx.fillRect(x + s * 0.2, y + s * 0.1, s * 0.6, 2);
        ctx.globalAlpha = 1;
    }
    drawUpgradeBadge(level, x, y, s, '#d16a6a');
}
