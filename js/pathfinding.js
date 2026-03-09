// ============= PATHFINDING SYSTEM =============
const PATHFINDING_CONFIG = {
    MAX_SEARCH_STEPS: 8000,
    GRID_SIZE: 1,
    REPATH_BOREDOM: 2.0,
    NODE_REACH_THRESHOLD: 0.2, // Slightly larger for smoother movement
    DIAGONAL_COST: 1.414,
    PATH_CACHE_TTL_MS: 1500,
    PATH_CACHE_MAX: 600,
    LOS_STEP: 0.35,
    CROWD_PENALTY_RADIUS: 0.9,
    CROWD_PENALTY_WEIGHT: 0.35
};

class Pathfinder {
    constructor() {
        this.pathCache = new Map();
        this.lastCachePrune = 0;
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

    makeCacheKey(sx, sy, ex, ey) {
        return `${sx},${sy}->${ex},${ey}`;
    }

    getCachedPath(key) {
        const entry = this.pathCache.get(key);
        if (!entry) return null;
        if (Date.now() - entry.time > PATHFINDING_CONFIG.PATH_CACHE_TTL_MS) {
            this.pathCache.delete(key);
            return null;
        }
        return entry.path.map(n => ({ x: n.x, y: n.y }));
    }

    setCachedPath(key, path) {
        if (!Array.isArray(path)) return;
        this.pathCache.set(key, {
            time: Date.now(),
            path: path.map(n => ({ x: n.x, y: n.y }))
        });
    }

    prunePathCache() {
        const now = Date.now();
        if (now - this.lastCachePrune < 500) return;
        this.lastCachePrune = now;

        for (const [k, v] of this.pathCache) {
            if (now - v.time > PATHFINDING_CONFIG.PATH_CACHE_TTL_MS) {
                this.pathCache.delete(k);
            }
        }

        if (this.pathCache.size <= PATHFINDING_CONFIG.PATH_CACHE_MAX) return;

        const oldest = Array.from(this.pathCache.entries())
            .sort((a, b) => a[1].time - b[1].time);
        const removeCount = this.pathCache.size - PATHFINDING_CONFIG.PATH_CACHE_MAX;
        for (let i = 0; i < removeCount; i++) {
            this.pathCache.delete(oldest[i][0]);
        }
    }

    hasDirectPath(startX, startY, endX, endY, radius = 0.2) {
        const dx = endX - startX;
        const dy = endY - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.001) return true;

        const steps = Math.max(2, Math.ceil(dist / PATHFINDING_CONFIG.LOS_STEP));
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const x = startX + dx * t;
            const y = startY + dy * t;
            if (isSolidAt(x, y, radius)) return false;
        }
        return true;
    }

    getCrowdPenalty(x, y) {
        const r = PATHFINDING_CONFIG.CROWD_PENALTY_RADIUS;
        const rSq = r * r;
        let penalty = 0;

        if (Array.isArray(survivors)) {
            for (const s of survivors) {
                if (!s || s.health <= 0) continue;
                const dx = s.x - x;
                const dy = s.y - y;
                const dSq = dx * dx + dy * dy;
                if (dSq > 0 && dSq < rSq) penalty += (rSq - dSq) / rSq;
            }
        }

        if (Array.isArray(zombies)) {
            for (const z of zombies) {
                if (!z || z.health <= 0) continue;
                const dx = z.x - x;
                const dy = z.y - y;
                const dSq = dx * dx + dy * dy;
                if (dSq > 0 && dSq < rSq) penalty += 0.5 * ((rSq - dSq) / rSq);
            }
        }

        return penalty * PATHFINDING_CONFIG.CROWD_PENALTY_WEIGHT;
    }

    smoothPath(path, startX, startY) {
        if (!Array.isArray(path) || path.length <= 2) return path;

        const smoothed = [];
        let anchorX = startX;
        let anchorY = startY;
        let i = 0;

        while (i < path.length) {
            let furthest = i;
            for (let j = path.length - 1; j >= i; j--) {
                const node = path[j];
                if (this.hasDirectPath(anchorX, anchorY, node.x, node.y, 0.22)) {
                    furthest = j;
                    break;
                }
            }

            const chosen = path[furthest];
            smoothed.push(chosen);
            anchorX = chosen.x;
            anchorY = chosen.y;
            i = furthest + 1;
        }

        return smoothed;
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

        this.prunePathCache();

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

        const cacheKey = this.makeCacheKey(sx, sy, targetX, targetY);
        const cached = this.getCachedPath(cacheKey);
        if (cached) return cached;

        if (this.hasDirectPath(startX, startY, targetX + 0.5, targetY + 0.5, 0.22)) {
            const direct = [{ x: targetX + 0.5, y: targetY + 0.5 }];
            this.setCachedPath(cacheKey, direct);
            return direct;
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
                const partial = this.smoothPath(
                    this.reconstructPath(cameFrom, closestKey, sx, sy),
                    startX,
                    startY
                );
                this.setCachedPath(cacheKey, partial);
                return partial;
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
                const rawPath = this.reconstructPath(cameFrom, currentKey, sx, sy);
                const finalPath = this.smoothPath(rawPath, startX, startY);
                this.setCachedPath(cacheKey, finalPath);
                return finalPath;
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

                const crowdPenalty = this.getCrowdPenalty(nx + 0.5, ny + 0.5);
                const tentativeG = currentG + cost * dir.cost + crowdPenalty;
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
            const partial = this.smoothPath(
                this.reconstructPath(cameFrom, closestKey, sx, sy),
                startX,
                startY
            );
            this.setCachedPath(cacheKey, partial);
            return partial;
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
