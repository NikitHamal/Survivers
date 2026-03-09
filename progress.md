Original prompt: this is a game I am building....see the attached image, the character, and the trees, and sometimes animals too looks like they are floating...like see the shadows...fix it please...also totally audit the whole game for potential bugs, issues, inaccuracies, bottlenecks, rooms for improvements, gaps, missing things, non functionals and so on and report to me.

2026-03-10: Started investigation. Found probable visual grounding mismatch between generic entity shadow placement in js/render.js and sprite feet anchors in js/sprites/entities.js and js/sprites/environment.js.
2026-03-10: Implemented grounding pass.
- Removed duplicate ground layer draw loop in js/render.js.
- Stopped generic shadow pass for survivors/animals (they now own their shadow placement).
- Added dedicated player shadow and corrected swordsman foot anchor (0.69) in js/sprites/entities.js.
- Fixed animated animal anchor math (center/ground alignment + per-type foot ratios) and added in-function shadow in js/sprites/pets.js.
- Added cached transparent-bounds trim helper in js/sprites/core.js and applied it to tree image drawing in js/sprites/environment.js so tree roots align to shadow.
2026-03-10: Patched animal sprite issues in js/sprites/pets.js.
- Added per-animal non-slime scale tuning relative to sheep.
- Added movement detection using actual position delta to avoid false running states.
- Idle animals now stay on frame 0 (no running animation while standing).
- Added per-type moving-frame caps to avoid selecting empty frames in 8-row sheets (flicker fix).
2026-03-10: Fixed slime direction enum bug in js/pet-system.js (was 1/-1, now 0/2 for right/left).
2026-03-10: Fixed duplicate HTML id in index.html by renaming game-over button id startBtn -> retryBtn.
2026-03-10: Clarification update.
- Restored drag/drop building interaction paths after user clarified intent.
- Removed AI Supply Drop event from js/event-system.js (definition/config/handler removed).
- Completed audit-fix pass:
  * enforced build distance in js/ui.js
  * bounded save retry and safer old-save cleanup in js/save-system.js
  * removed modified-chunk truncation default in js/save-system.js
  * removed mouse-up keyboard-state clear side-effect in js/input.js
  * standardized canvas resize to display-space coordinates in js/game.js
  * moved random survivor spawn origin to around player in js/main.js
