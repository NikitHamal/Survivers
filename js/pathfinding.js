// ============= PATHFINDING SYSTEM =============
const PATHFINDING_CONFIG = {
    MAX_SEARCH_STEPS: 5000,
    GRID_SIZE: 1,
    REPATH_BOREDOM: 2.0,
    NODE_REACH_THRESHOLD: 0.2, // Slightly larger for smoother movement
    DIAGONAL_COST: 1.414
};

class Pathfinder {
    constructor() {
        this.directions = [
            { x: 0, y: -1, cost: 1 },     // Up
            { x: 1, y: 0, cost: 1 },      // Right
            { x: 0, y: 1, cost: 1 },      // Down
            { x: -1, y: 0, cost: 1 },     // Left
            { x: 1, y: -1, cost: PATHFINDING_CONFIG.DIAGONAL_COST },  // Up-Right
            { x: 1, y: 1, cost: PATHFINDING_CONFIG.DIAGONAL_COST },   // Down-Right
            { x: -1, y: 1, cost: PATHFINDING_CONFIG.DIAGONAL_COST },  // Down-Left
            { x: -1, y: -1, cost: PATHFINDING_CONFIG.DIAGONAL_COST }  // Up-Left
        ];
    }

    // Heuristic: Octile distance (better for 8-directional movement)
    heuristic(x1, y1, x2, y2) {
        const dx = Math.abs(x1 - x2);
        const dy = Math.abs(y1 - y2);
        // Octile distance
        return Math.max(dx, dy) + (PATHFINDING_CONFIG.DIAGONAL_COST - 1) * Math.min(dx, dy);
    }

    // Check if a tile is walkable
    isWalkable(x, y) {
        const tileX = Math.floor(x);
        const tileY = Math.floor(y);
        const tile = getTile(tileX, tileY);
        return {
            passable: isPassable(tile) || tile === TILES.SPIKES,
            cost: this.getTileCost(tile)
        };
    }

    getTileCost(tile) {
        switch (tile) {
            case TILES.GRASS: return 1;
            case TILES.FLOOR: return 0.8;
            case TILES.BUSH: return 2.5;
            case TILES.SPIKES: return 10;
            case TILES.WALL: return 50;
            case TILES.WATER: return Infinity;
            default: 
                if (typeof isSolid === 'function' && isSolid(tile)) return Infinity;
                return 1;
        }
    }

    findPath(startX, startY, endX, endY) {
        // Floor coordinates to get tile positions
        const sx = Math.floor(startX);
        const sy = Math.floor(startY);
        let ex = Math.floor(endX);
        let ey = Math.floor(endY);

        // If target is unwalkable, find nearest walkable neighbor
        let targetX = ex;
        let targetY = ey;

        if (!this.isWalkable(ex, ey).passable) {
            const nearest = this.findNearestWalkable(ex, ey, sx, sy);
            if (nearest) {
                targetX = nearest.x;
                targetY = nearest.y;
            } else {
                console.debug('Pathfinding: No walkable target found');
                return null;
            }
        }
        
        // Same tile check - return empty path (already there)
        if (sx === targetX && sy === targetY) {
            return [];
        }

        const openSet = new PriorityQueue();
        const cameFrom = new Map();
        const gScore = new Map();
        const closedSet = new Set(); // Track fully processed nodes

        const startKey = `${sx},${sy}`;
        const endKey = `${targetX},${targetY}`;

        gScore.set(startKey, 0);
        const startH = this.heuristic(sx, sy, targetX, targetY);
        openSet.enqueue(startKey, startH);

        let steps = 0;
        let closestKey = startKey;
        let closestH = startH;

        while (!openSet.isEmpty()) {
            steps++;
            if (steps > PATHFINDING_CONFIG.MAX_SEARCH_STEPS) {
                console.debug('Pathfinding: Max steps reached, returning partial path');
                return this.reconstructPath(cameFrom, closestKey, sx, sy);
            }

            const currentKey = openSet.dequeue();
            
            // CRITICAL FIX: Skip if already fully processed
            if (closedSet.has(currentKey)) {
                continue;
            }
            closedSet.add(currentKey);

            const [cx, cy] = currentKey.split(',').map(Number);

            // Check if we reached the target
            if (cx === targetX && cy === targetY) {
                return this.reconstructPath(cameFrom, currentKey, sx, sy);
            }

            // Track closest node to target for partial paths
            const h = this.heuristic(cx, cy, targetX, targetY);
            if (h < closestH) {
                closestH = h;
                closestKey = currentKey;
            }

            const currentG = gScore.has(currentKey) ? gScore.get(currentKey) : Infinity;

            for (const dir of this.directions) {
                const nx = cx + dir.x;
                const ny = cy + dir.y;
                const neighborKey = `${nx},${ny}`;

                // Skip if already fully processed
                if (closedSet.has(neighborKey)) continue;

                const { passable, cost } = this.isWalkable(nx, ny);
                if (!passable || cost === Infinity) continue;
                
                // Corner cutting check for diagonals
                if (dir.x !== 0 && dir.y !== 0) {
                    const side1 = this.isWalkable(cx + dir.x, cy);
                    const side2 = this.isWalkable(cx, cy + dir.y);
                    if (!side1.passable || !side2.passable) {
                        continue; // Don't cut corners through walls
                    }
                }

                const tentativeG = currentG + cost * dir.cost;
                const neighborG = gScore.has(neighborKey) ? gScore.get(neighborKey) : Infinity;

                if (tentativeG < neighborG) {
                    cameFrom.set(neighborKey, currentKey);
                    gScore.set(neighborKey, tentativeG);
                    const f = tentativeG + this.heuristic(nx, ny, targetX, targetY);
                    openSet.enqueue(neighborKey, f);
                }
            }
        }

        // No full path found - return partial path to closest point
        if (closestKey !== startKey) {
            console.debug('Pathfinding: Returning partial path');
            return this.reconstructPath(cameFrom, closestKey, sx, sy);
        }

        return null;
    }
    
    findNearestWalkable(targetX, targetY, startX, startY) {
        // Ensure we're working with integers
        targetX = Math.floor(targetX);
        targetY = Math.floor(targetY);
        startX = Math.floor(startX);
        startY = Math.floor(startY);

        const maxRadius = 5;
        let bestTile = null;
        let minDist = Infinity;

        for (let r = 1; r <= maxRadius; r++) {
            for (let dy = -r; dy <= r; dy++) {
                for (let dx = -r; dx <= r; dx++) {
                    // Only check the outer ring of current radius
                    if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;

                    const nx = targetX + dx;
                    const ny = targetY + dy;

                    if (this.isWalkable(nx, ny).passable) {
                        // Prefer tiles closer to the start position
                        const distToStart = (nx - startX) ** 2 + (ny - startY) ** 2;
                        
                        if (distToStart < minDist) {
                            minDist = distToStart;
                            bestTile = { x: nx, y: ny };
                        }
                    }
                }
            }
            // Return best from this ring before checking further
            if (bestTile) return bestTile;
        }

        return null;
    }

    reconstructPath(cameFrom, endKey, startX, startY) {
        if (!endKey) return [];

        const path = [];
        let currentKey = endKey;

        // Build path from end to start
        while (currentKey && cameFrom.has(currentKey)) {
            const [x, y] = currentKey.split(',').map(Number);
            // Use center of tile for smooth movement
            path.push({ x: x + 0.5, y: y + 0.5 });
            currentKey = cameFrom.get(currentKey);
        }

        // Reverse to get start-to-end order
        path.reverse();

        // CRITICAL: If path is empty but we have an end key different from start,
        // add the end position directly
        if (path.length === 0 && endKey) {
            const [ex, ey] = endKey.split(',').map(Number);
            if (ex !== startX || ey !== startY) {
                path.push({ x: ex + 0.5, y: ey + 0.5 });
            }
        }

        return path;
    }
}

// Improved Priority Queue with better performance
class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    enqueue(element, priority) {
        const node = { element, priority };
        this.heap.push(node);
        this._bubbleUp(this.heap.length - 1);
    }

    dequeue() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop().element;

        const result = this.heap[0].element;
        this.heap[0] = this.heap.pop();
        this._bubbleDown(0);
        return result;
    }

    peek() {
        return this.heap.length > 0 ? this.heap[0].element : null;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    _bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex].priority <= this.heap[index].priority) break;
            
            // Swap
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }

    _bubbleDown(index) {
        const length = this.heap.length;
        
        while (true) {
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            let smallest = index;

            if (leftChild < length && this.heap[leftChild].priority < this.heap[smallest].priority) {
                smallest = leftChild;
            }
            if (rightChild < length && this.heap[rightChild].priority < this.heap[smallest].priority) {
                smallest = rightChild;
            }

            if (smallest === index) break;

            // Swap
            [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
            index = smallest;
        }
    }
}

const pathfinder = new Pathfinder();