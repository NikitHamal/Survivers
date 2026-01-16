# Codebase Investigation Report

## Executive Summary
The `Survive` codebase represents a functional JavaScript game engine with a chunk-based infinite world, entity management, and a fixed-timestep loop. However, several critical architectural flaws, performance bottlenecks, and resource leaks threaten its scalability and production readiness.

## 1. Critical Performance Bottlenecks

### 1.1 Pathfinding Efficiency (FIXED)
**Location:** `js/pathfinding.js`
**Issue:** The `PriorityQueue` implementation uses `Array.sort()` on every `enqueue` operation.
- **Complexity:** $O(N \log N)$ per insertion.
- **Impact:** With multiple zombies repathing simultaneously (100 steps limit), this will cause significant frame drops on larger waves.
- **Resolution:** Replaced with a **Binary Heap** implementation ($O(\log N)$).

### 1.2 Rendering Loop (FIXED)
**Location:** `js/render.js`
**Issue:** The `render()` function iterates and draws every visible tile individually every frame using `ctx.fillRect`.
- **Impact:** High CPU/GPU usage even for static terrain.
- **Resolution:** Implemented **Chunk Caching**. Terrain is drawn to offscreen canvases and composited. `invalidateChunkCache` handles updates.

### 1.3 DOM Thrashing (FIXED)
**Location:** `js/ui.js` -> `updateUI()`
**Issue:** DOM elements (`dayCount`, `woodCount`, etc.) are updated every cycle regardless of whether values changed.
- **Impact:** Excessive browser reflows and layout calculations.
- **Resolution:** Implemented **Dirty Checking**. DOM is only updated when values change.

## 2. Memory Management Risks

### 2.1 Infinite Heap Growth
**Location:** `js/world.js`
**Issue:** The `modifiedChunks` Map stores every tile change made by the player.
- **Code:** `const modifiedChunks = new Map();`
- **Behavior:** This map is **never** cleared or pruned. As the player explores and builds, memory usage will grow indefinitely until the browser crashes.
- **Recommendation:** Implement a region-based persistence system. Serialize "far" regions to `localStorage` or IndexedDB and remove them from memory.

## 3. Architectural Flaws

### 3.1 Monolithic Entity Logic
**Location:** `js/entities.js`
**Issue:** `updateZombies`, `updateSurvivors`, and `updateTowers` contain mixed logic for movement, combat, AI state, and collision.
- **Impact:** Hard to read, test, and extend. Adding a new enemy type requires modifying the massive `updateZombies` function.
- **Recommendation:** Refactor into an **Object-Oriented** or **Composition-Based** structure.
  - Create `Zombie` class with `update()` and `draw()` methods.
  - Extract AI behaviors (Flee, Hunt, Attack) into a State Machine.

### 3.2 Global State Dependency
**Location:** Everywhere (`js/game.js`, `js/state.js`, `js/ui.js`)
**Issue:** Heavy reliance on implicit global variables (`player`, `zombies`, `resources`, `chunks`).
- **Impact:** Makes unit testing impossible and module dependencies unclear.
- **Recommendation:** Encapsulate game state into a `GameContext` or Singleton and pass it explicitly to update/render functions.

## 4. Code Quality & Standards

### 4.1 Magic Numbers
**Location:** `js/entities.js`, `js/game.js`
**Issue:** Critical values are hardcoded inline.
- Example: `distSq > 4` (Zombie pathfinding threshold)
- Example: `distSq < 0.1` (Path node arrival)
- **Recommendation:** Extract all gameplay tuning values to `js/constants.js`.

### 4.2 Type Safety
**Issue:** No JSDoc or TypeScript usage.
- **Risk:** `z.cachedTarget` or `entity.path` structure is implicit, leading to potential `undefined` runtime errors.
- **Recommendation:** Adopt **JSDoc** for core classes and functions to enable IDE type checking.

## 5. Next Steps Plan

1.  **Phase 1: Stabilization (High Priority)**
    - Fix `PriorityQueue` in `pathfinding.js`.
    - Implement dirty checking in `ui.js`.
    - Fix `modifiedChunks` memory leak (cap size or implement rudimentary unloading).

2.  **Phase 2: Refactoring**
    - Split `entities.js` into modular classes (`Zombie.js`, `Survivor.js`).
    - Extract magic numbers to `constants.js`.

3.  **Phase 3: Optimization**
    - Implement canvas chunk caching in `render.js`.
    - Switch to ES Modules (`<script type="module">`).
