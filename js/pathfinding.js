// ============= PATHFINDING SYSTEM =============
const PATHFINDING_CONFIG = {
    MAX_SEARCH_STEPS: 100, // Limit CPU usage per path
    GRID_SIZE: 1, // Tile size
    REPATH_BOREDOM: 2.0 // Seconds before repathing if stuck
};

class Pathfinder {
    constructor() {
        this.directions = [
            { x: 0, y: -1 }, // Up
            { x: 1, y: 0 },  // Right
            { x: 0, y: 1 },  // Down
            { x: -1, y: 0 }, // Left
            { x: 1, y: -1 }, // Up-Right (Diagonals)
            { x: 1, y: 1 },  // Down-Right
            { x: -1, y: 1 }, // Down-Left
            { x: -1, y: -1 } // Up-Left
        ];
    }

    // Heuristic: Manhattan distance (or Euclidean)
    heuristic(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    // Check if a tile is walkable
    isWalkable(x, y) {
        const tile = getTile(x, y);
        // We rely on the global isPassable function, but might need custom logic
        // e.g. zombies can break walls, so walls are "high cost" not "unwalkable"
        return {
            passable: !isSolid(tile) || tile === TILES.WALL || tile === TILES.WALL_BROKEN || tile === TILES.SPIKES,
            cost: this.getTileCost(tile)
        };
    }

    getTileCost(tile) {
        switch (tile) {
            case TILES.GRASS: return 1;
            case TILES.FLOOR: return 1;
            case TILES.BUSH: return 2; // Slower
            case TILES.SPIKES: return 10; // Avoid if possible
            case TILES.WALL: return 20; // High cost (break it)
            case TILES.WALL_BROKEN: return 3; // Debris
            case TILES.WATER: return Infinity;
            case TILES.TREE: return Infinity; // Indestructible (gameplay wise)
            case TILES.STONE: return Infinity;
            case TILES.IRON: return Infinity;
            case TILES.TOWER: return Infinity;
            case TILES.CANNON: return Infinity;
            case TILES.HOUSE: return Infinity;
            case TILES.CHEST: return Infinity;
            default: return 1;
        }
    }

    findPath(startX, startY, endX, endY) {
        // Floor coordinates
        const sx = Math.floor(startX);
        const sy = Math.floor(startY);
        const ex = Math.floor(endX);
        const ey = Math.floor(endY);

        // Early exit if start == end
        if (sx === ex && sy === ey) return [];

        // Early exit if target is strictly unreachable (not handled here usually)

        const openSet = new PriorityQueue();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();

        const startKey = `${sx},${sy}`;
        const endKey = `${ex},${ey}`;

        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(sx, sy, ex, ey));
        openSet.enqueue(startKey, 0);

        const visited = new Set();
        let steps = 0;

        while (!openSet.isEmpty()) {
            steps++;
            if (steps > PATHFINDING_CONFIG.MAX_SEARCH_STEPS) {
                // Return best partial path or failed
                return this.reconstructPath(cameFrom, openSet.peek()); // fallback
            }

            const currentKey = openSet.dequeue();
            const [cx, cy] = currentKey.split(',').map(Number);

            if (cx === ex && cy === ey) {
                return this.reconstructPath(cameFrom, currentKey);
            }

            visited.add(currentKey);

            for (const dir of this.directions) {
                const nx = cx + dir.x;
                const ny = cy + dir.y;
                const neighborKey = `${nx},${ny}`;

                if (visited.has(neighborKey)) continue;

                const { passable, cost } = this.isWalkable(nx, ny);
                if (!passable || cost === Infinity) continue;

                // Diagonal cost adjustment (approx 1.4)
                const distCost = (dir.x !== 0 && dir.y !== 0) ? 1.4 : 1.0;

                const tentativeG = (gScore.get(currentKey) || Infinity) + cost * distCost;

                if (tentativeG < (gScore.get(neighborKey) || Infinity)) {
                    cameFrom.set(neighborKey, currentKey);
                    gScore.set(neighborKey, tentativeG);
                    const f = tentativeG + this.heuristic(nx, ny, ex, ey);
                    fScore.set(neighborKey, f);

                    // Simple priority queue doesn't support update, so just push
                    openSet.enqueue(neighborKey, f);
                }
            }
        }

        return null; // No path found
    }

    reconstructPath(cameFrom, currentKey) {
        if (!currentKey) return []; // Path failed

        const path = [];
        while (cameFrom.has(currentKey)) {
            const [x, y] = currentKey.split(',').map(Number);
            // Center of tile
            path.push({ x: x + 0.5, y: y + 0.5 });
            currentKey = cameFrom.get(currentKey);
        }
        return path.reverse();
    }
}

// Simple Priority Queue implementation
class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(element, priority) {
        this.elements.push({ element, priority });
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.elements.shift().element;
    }

    peek() {
        return this.elements.length > 0 ? this.elements[0].element : null;
    }

    isEmpty() {
        return this.elements.length === 0;
    }
}

const pathfinder = new Pathfinder();
