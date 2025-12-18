# CLAUDE.md - Gorillas.js Codebase Guide

**Last Updated:** 2025-11-23
**Project:** Gorillas.js - JavaScript clone of the classic gorillas.bas game

## Table of Contents

1. [Project Overview](#project-overview)
2. [Codebase Structure](#codebase-structure)
3. [Architecture and Patterns](#architecture-and-patterns)
4. [Development Workflow](#development-workflow)
5. [Key Conventions](#key-conventions)
6. [Technologies and Dependencies](#technologies-and-dependencies)
7. [Common Tasks](#common-tasks)
8. [Known Issues and TODOs](#known-issues-and-todos)
9. [Testing and Debugging](#testing-and-debugging)
10. [Important Files Reference](#important-files-reference)

---

## Project Overview

Gorillas.js is a web-based clone of the classic MS-DOS game [gorillas.bas](http://en.wikipedia.org/wiki/Gorillas_%28video_game%29). It's a turn-based artillery game where two gorillas throw explosive bananas at each other across a city skyline.

**Purpose:** Learning exercise for HTML5 Canvas 2D context and JavaScript game development
**Type:** Client-side JavaScript game (no build process, no npm dependencies)
**Game Loop:** RequestAnimationFrame-based
**Rendering:** Pure Canvas 2D (no images, all procedural pixel art)

### Key Features

- Turn-based 2-player local gameplay
- Physics-based projectile motion (gravity: 9.8 m/s²)
- Procedurally generated city skyline
- Pixel art sprites drawn with Canvas fillRect
- Custom game framework (Shark)
- Keyboard input for angle and velocity

---

## Codebase Structure

```
Gorillas.js/
├── index.html              # Main entry point, script loading order
├── gorillas.css            # Minimal styling (game container)
├── gorillas.js             # Main game logic and state machine
│
├── Drawing Functions (pixel art renderers)
├── banana-draw.js          # Banana sprite (rotates during flight)
├── building-draw.js        # Building factory with random properties
├── gorillas-draw.js        # Gorilla sprite (large pixel art)
├── sun-draw.js             # Sun sprite with rays
│
└── ext/                    # External libraries (custom-built)
    ├── base/
    │   └── Base.js         # Classical inheritance (Dean Edwards v1.1)
    ├── load/
    │   └── load.js         # Async script loader (not actively used)
    └── shark/              # Custom game framework
        ├── shark.js        # Namespace + Base.js copy
        ├── shark-core.js   # Canvas, Vm, Entity classes
        ├── shark-events.js # Event handling system
        ├── shark-assets.js # DSprite (Dynamic Sprite) class
        └── shark-texts.js  # Text rendering class
```

### Script Loading Order (Critical)

From `index.html`, scripts MUST load in this order:

1. Shark framework core files
2. Drawing function files
3. Main game logic (gorillas.js)

**Why:** gorillas.js depends on Shark classes and drawing functions being available globally.

---

## Architecture and Patterns

### High-Level Architecture

```
┌─────────────────────────────────────────────┐
│           Vm (Virtual Machine)              │
│  - Game loop (requestAnimationFrame)        │
│  - Phase/state management                   │
│  - Entity registry                          │
│  - Variable storage (key-value)             │
│  - Event queue                              │
└──────────────┬──────────────────────────────┘
               │
               ├─── Entity: Gorilla 1 (DSprite)
               ├─── Entity: Gorilla 2 (DSprite)
               ├─── Entity: Banana (DSprite)
               ├─── Entity: Sun (DSprite)
               ├─── Entity: Buildings[0..9] (DSprite)
               └─── Entity: Text displays
```

### Design Patterns

#### 1. State Machine Pattern

The game uses a phase-based state machine in `gorillas.js`:

```javascript
// Phases (states)
onInit → waitingAngle → waitingVel → throwing → changeTurn → [loop back]
                                              ↓
                                           onWin (reset)
```

Each phase function:
- Executes logic for current state
- Returns name of next phase (or null to stay in current)
- Has access to `this` (the Vm instance)

#### 2. Entity-Component Pattern

All game objects inherit from `Shark.Core.Entity`:

```javascript
var entity = new Shark.Assets.DSprite({
    position: {x: 0, y: 0},
    size: {width: 100, height: 100},
    drawing: drawFunctionReference
});
vm.addEntity(entity);
```

Entities are:
- Registered with the Vm
- Automatically drawn each frame
- Can check collisions with other entities

#### 3. Module Pattern

All files use IIFE to avoid global pollution:

```javascript
(function(window) {
    // File contents
    window.draws = window.draws || {};
    window.draws.banana = function() { ... };
})(window);
```

#### 4. Factory Pattern

`building-draw.js` creates parameterized building generators:

```javascript
window.draws.building = function(pars) {
    return function(canvas, time) {
        // Draw building with pars.width, pars.height, pars.color, etc.
    };
};
```

#### 5. Double Buffering

All sprites use off-screen canvas for flicker-free rendering:

```javascript
bufferCanvas → draw operations → copy to display canvas
```

### Key Classes (Shark Framework)

#### Shark.Core.Canvas
- Wraps HTML5 canvas element
- Provides drawing context
- Handles canvas creation and attachment to DOM

#### Shark.Core.Vm (Virtual Machine/App)
- **Game engine core**
- Methods:
  - `addEntity(entity)` - Register game object
  - `set(key, value)` / `get(key)` - State storage
  - `start()` - Begin game loop
  - `onInit()` - Override for initialization
  - `onLoop()` - Override for per-frame logic
- Properties:
  - `entities` - Array of all game objects
  - `phase` - Current state name
  - `tick` - Frame counter

#### Shark.Core.Entity
- Base class for all game objects
- Properties: `position`, `size`, `canvas`
- Methods:
  - `hasCollisionedWith(entity)` - AABB collision detection
  - `draw()` - Render to canvas

#### Shark.Assets.DSprite (Dynamic Sprite)
- Extends Entity for drawable objects
- Constructor parameters:
  - `drawing` - Function that draws the sprite
  - `position` - {x, y}
  - `size` - {width, height}
  - `frame` - Animation frame number
- Drawing function signature: `function(canvas, time)`

#### Shark.Texts.Text
- Text rendering on canvas
- Methods: `setText(str)`, `append(str)`, `draw()`
- Uses `strokeText` for rendering

---

## Development Workflow

### Making Changes

This is a simple client-side project with **no build process**. To develop:

1. **Edit files directly** - Changes take effect on page reload
2. **Test in browser** - Open `index.html` in a browser
3. **Use browser DevTools** - Console for debugging, Canvas inspector
4. **Refresh page** - See changes immediately

### Git Workflow

- **Main branch:** `master` (default)
- **Feature branches:** `claude/claude-md-*` format (required prefix for AI assistants)
- **Commits:** Use clear, descriptive messages
- **Push:** Always use `git push -u origin <branch-name>`

### Adding New Features

When adding game features, follow this pattern:

1. **Identify the phase** where feature belongs
2. **Create entity** if visual component needed
3. **Add drawing function** if new sprite needed
4. **Update game loop** if per-frame logic needed
5. **Test physics/collisions** if movement involved

Example: Adding a new obstacle

```javascript
// 1. Create drawing function (new file: obstacle-draw.js)
(function(window) {
    window.draws = window.draws || {};
    window.draws.obstacle = function(canvas, time) {
        // Pixel art drawing code
    };
})(window);

// 2. In gorillas.js onInit phase
var obstacle = new Shark.Assets.DSprite({
    drawing: window.draws.obstacle,
    position: {x: 200, y: 300},
    size: {width: 50, height: 50}
});
this.addEntity(obstacle);
this.set('obstacle', obstacle);

// 3. In throwing phase, check collision
if (banana.hasCollisionedWith(this.get('obstacle'))) {
    // Handle obstacle hit
}
```

---

## Key Conventions

### Naming Conventions

1. **Variables**
   - Prefix with type hint: `f` = function, `n` = number, `s` = string
   - Example: `fDrawing`, `nVelocity`, `sPhase`
   - camelCase for all identifiers

2. **Classes**
   - PascalCase: `DSprite`, `Canvas`, `Entity`

3. **Namespaces**
   - Dot notation: `Shark.Core`, `Shark.Assets`, `window.draws`

4. **Files**
   - Kebab-case: `banana-draw.js`, `shark-core.js`

### Code Style

- **Indentation:** 4 spaces (inconsistent in some files)
- **Semicolons:** Used consistently
- **Quotes:** Single quotes preferred
- **Comments:** Sparse - code should be self-documenting
- **Line length:** No strict limit

### Physics Conventions

- **Coordinates:** Origin (0,0) is top-left
- **Units:** Pixels for position, degrees for angle
- **Gravity:** 9.8 (represents m/s² but pixel-based)
- **Velocity:** Pixels per frame

### Entity Conventions

- All entities registered with `vm.addEntity(entity)`
- Store important entities in Vm variables: `this.set('banana', banana)`
- Collision detection uses AABB (axis-aligned bounding box)
- Drawing functions receive `(canvas, time)` parameters

---

## Technologies and Dependencies

### External Dependencies

**None.** This project has zero external dependencies.

### Browser APIs Used

- **Canvas 2D Context** - All rendering
  - `fillRect()` - Primary drawing method (pixel art)
  - `strokeText()` - Text rendering
  - `translate()`, `rotate()` - Transformations (banana rotation)

- **RequestAnimationFrame** - Game loop timing

- **Keyboard Events** - Input handling
  - Captures numeric keys (0-9)
  - Enter key for input confirmation

### Embedded Libraries

1. **Base.js v1.1** (Dean Edwards)
   - Location: `ext/base/Base.js` and embedded in `ext/shark/shark.js`
   - Purpose: Classical inheritance for JavaScript
   - License: MIT

2. **chain.js** (embedded in `ext/load/load.js`)
   - Purpose: Async operation chaining
   - Currently unused in game

### Custom Framework: Shark

**Status:** Custom-built for this project
**Purpose:** Lightweight HTML5 Canvas game engine
**Size:** ~500 lines across 5 files
**Architecture:** Modular, inheritance-based

**Key Design Decisions:**
- No external dependencies
- Classical inheritance over prototypal
- Function-based sprites (not image-based)
- Entity-component hybrid pattern
- Single-threaded, synchronous

---

## Common Tasks

### Adding a New Sprite

1. Create drawing file (e.g., `cloud-draw.js`)
2. Add to `window.draws` namespace
3. Include script in `index.html` before `gorillas.js`
4. Create DSprite in game initialization

```javascript
// cloud-draw.js
(function(window) {
    window.draws = window.draws || {};
    window.draws.cloud = function(canvas, time) {
        canvas.fillStyle = '#FFFFFF';
        // Draw cloud using fillRect calls
    };
})(window);

// In gorillas.js onInit
var cloud = new Shark.Assets.DSprite({
    drawing: window.draws.cloud,
    position: {x: 100, y: 50},
    size: {width: 80, height: 40}
});
this.addEntity(cloud);
```

### Adding a New Game Phase

1. Define phase function in `gorillas.js`
2. Return phase name from previous phase
3. Handle phase logic and transitions

```javascript
function newPhase() {
    var self = this;

    // Phase initialization (runs once on entry)
    if (!this.get('phase_initialized')) {
        this.set('phase_initialized', true);
        // Setup code
    }

    // Per-frame logic
    // ...

    // Transition condition
    if (condition) {
        this.set('phase_initialized', false); // Reset for next time
        return 'nextPhase';
    }

    return null; // Stay in this phase
}
```

### Modifying Physics

Physics calculations are in the `throwing` phase of `gorillas.js`:

```javascript
// Current projectile motion formula
y = initial_y - (nVelY * t - (nGravity * Math.pow(t, 2)) / 2);
x = initial_x + nVelX * t;

// To modify:
// - Adjust nGravity (currently 9.8)
// - Change velocity calculations (based on angle/velocity input)
// - Modify banana.position updates
```

### Adding Collision Detection

Use `entity.hasCollisionedWith(otherEntity)`:

```javascript
// In throwing phase
var banana = this.get('banana');
var obstacle = this.get('obstacle');

if (banana.hasCollisionedWith(obstacle)) {
    // Handle collision
    return 'nextPhase';
}
```

**Note:** Collision detection is AABB-based:
```javascript
hasCollisionedWith: function(e) {
    return (this.position.x < e.position.x + e.size.width &&
            this.position.x + this.size.width > e.position.x &&
            this.position.y < e.position.y + e.size.height &&
            this.position.y + this.size.height > e.position.y);
}
```

### Debugging Tips

1. **Check browser console** - All errors appear here
2. **Use `console.log`** in phase functions
3. **Inspect entities** - `vm.entities` array
4. **Check variables** - `vm.variables` object
5. **Monitor phase transitions** - Log phase returns
6. **Canvas inspector** - Chrome DevTools has canvas debugging

### Testing Changes

1. Open `index.html` in browser
2. Play through relevant game scenarios
3. Test edge cases (e.g., banana going off-screen)
4. Check collision detection accuracy
5. Verify input handling
6. Test both players' turns

---

## Known Issues and TODOs

From `README.md`:

### Known Issues

1. **Events system needs cleanup**
   - Current implementation in `shark-events.js` is functional but could be refactored
   - Event queue processing could be more robust

2. **Collision detection is basic**
   - Only AABB (no pixel-perfect collision)
   - Banana size is small, making hits difficult
   - TODO in README: "Detect collisions" (may be outdated, basic collision exists)

3. **No end workflow**
   - Game resets immediately on win
   - No score tracking
   - No game-over screen

### TODO Items

From README:
- ~~Detect collisions~~ (Implemented with `hasCollisionedWith`)
- End workflow (victory screen, score tracking)
- Allow online multiplayer (ambitious future goal)

### Additional Observations

- **No package.json** - Consider adding for metadata
- **No .gitignore** - `.git/` files appear in Glob results
- **Duplicate Base.js** - Exists in both `ext/base/` and embedded in `shark.js`
- **Unused load.js** - Script loader not actively used
- **Sparse comments** - More documentation would help maintainability
- **No tests** - No automated testing framework

---

## Testing and Debugging

### Manual Testing Checklist

When making changes, verify:

- [ ] Game loads without console errors
- [ ] Both gorillas appear on buildings
- [ ] Angle input works (2 digits)
- [ ] Velocity input works (2 digits)
- [ ] Banana throws with correct trajectory
- [ ] Gravity affects banana correctly
- [ ] Collision detection works
- [ ] Turn switches after miss
- [ ] Game resets after hit
- [ ] Sun appears correctly
- [ ] Buildings render properly

### Debug Mode

No built-in debug mode. To add debugging:

```javascript
// In gorillas.js, add to onLoop
if (this.get('debug')) {
    console.log('Phase:', this.phase);
    console.log('Tick:', this.tick);
    console.log('Banana pos:', this.get('banana').position);
}

// Enable with:
vm.set('debug', true);
```

### Common Errors

1. **"Cannot read property 'x' of undefined"**
   - Entity not initialized in current phase
   - Check entity exists before accessing: `if (entity) { ... }`

2. **Sprites not appearing**
   - Drawing function not in `window.draws`
   - Script load order incorrect
   - Entity not added with `addEntity()`

3. **Input not working**
   - Event handler not processing correctly
   - Check keyboard event listeners in `shark-events.js`

4. **Physics looks wrong**
   - Check gravity constant (9.8)
   - Verify velocity calculations
   - Ensure `t` (time variable) is correct

---

## Important Files Reference

### Core Game Logic

**gorillas.js** (315 lines)
- Main game file
- Creates Vm instance (800x600)
- Defines all game phases
- Handles input processing
- Physics calculations
- Win condition logic

Key functions:
- `onInit()` - Game setup
- `waitingAngle()` - Angle input phase
- `waitingVel()` - Velocity input phase
- `throwing()` - Physics simulation phase
- `changeTurn()` - Player switch phase
- `onWin()` - Victory handling

### Drawing Functions

All follow pattern: `function(canvas, time) { ... }`

**banana-draw.js** (77 lines)
- Yellow banana sprite (#fcfe04)
- Rotates based on `time` parameter
- Size: ~20x20 pixels

**building-draw.js** (40 lines)
- Factory function: `window.draws.building(pars)`
- Parameters: width, height, color, windows
- Random window states (lit/unlit)
- Colors: red, cyan, gray

**gorillas-draw.js** (1,424 lines)
- Largest drawing file
- Detailed gorilla pixel art
- Orange/tan color (#fcaa54)
- Size: ~60x60 pixels

**sun-draw.js** (376 lines)
- Yellow sun with rays
- Static sprite (no animation)
- Positioned top-center

### Shark Framework Files

**shark-core.js** (175 lines)
- `Shark.Core.Canvas` - Canvas wrapper class
- `Shark.Core.Vm` - Game engine/virtual machine
- `Shark.Core.Entity` - Base entity class

**shark-events.js** (56 lines)
- Extends Vm with event handling
- Keyboard input processing
- Event queue management

**shark-assets.js** (91 lines)
- `Shark.Assets.DSprite` - Dynamic sprite class
- Extends Entity
- Function-based sprite rendering
- Double-buffering implementation

**shark-texts.js** (36 lines)
- `Shark.Texts.Text` - Text rendering class
- Simple API: setText, append, draw

**shark.js** (145 lines)
- Initializes Shark namespace
- Embeds Base.js library
- Entry point for framework

### Support Files

**index.html** (39 lines)
- Script loading (order matters!)
- Google Analytics integration
- Minimal structure

**gorillas.css** (16 lines)
- Dark background (#222222)
- Game container (#game) styled
- Blue background (#38c5e8) for canvas area

**ext/base/Base.js** (146 lines)
- Classical inheritance library
- Provides `extend()` method
- `this.base()` for super calls

**ext/load/load.js** (37 lines)
- Async script loader
- Not actively used
- Based on chain.js pattern

---

## AI Assistant Guidelines

When working on this codebase:

### DO:
- Read relevant files before making changes
- Maintain the existing code style and patterns
- Test changes by opening index.html in browser
- Keep the no-dependency philosophy
- Use the Shark framework as intended
- Follow the phase-based state machine pattern
- Preserve pixel art drawing style
- Add entities through proper Vm methods

### DON'T:
- Add npm packages or build processes without discussion
- Break the script loading order in index.html
- Modify Shark framework unless specifically requested
- Change physics constants without understanding impact
- Add images/sprites (project uses procedural drawing)
- Over-engineer simple features
- Remove backward compatibility without testing

### When Adding Features:
1. Understand which game phase it affects
2. Check if new entities are needed
3. Follow existing drawing function patterns
4. Maintain the turn-based flow
5. Test both player perspectives
6. Consider collision implications

### When Fixing Bugs:
1. Reproduce the issue in browser
2. Check browser console for errors
3. Trace through relevant phase functions
4. Verify entity states with debugging
5. Test fix thoroughly
6. Consider edge cases

### Code Review Checklist:
- [ ] Script load order maintained
- [ ] Entities properly registered
- [ ] Phase transitions correct
- [ ] Collision detection working
- [ ] No console errors
- [ ] Input handling works
- [ ] Physics calculations accurate
- [ ] Pixel art rendering correct

---

## Quick Reference

### Project Stats
- **Language:** JavaScript (ES5-era syntax)
- **Lines of Code:** ~4,000 (including pixel art)
- **Files:** 15 JavaScript files
- **Dependencies:** 0
- **Framework:** Custom (Shark)
- **Game Loop:** RequestAnimationFrame
- **Rendering:** Canvas 2D fillRect

### Key Metrics
- Canvas size: 800x600
- Gravity: 9.8
- Building count: 10
- Max angle: 99°
- Max velocity: 99

### External Resources
- [Original game info](http://en.wikipedia.org/wiki/Gorillas_%28video_game%29)
- [Live demo](http://tehsis.github.io/Gorillas.js/)
- Canvas 2D API: [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)

---

**End of CLAUDE.md**

*This file is intended to help AI assistants understand and work effectively with the Gorillas.js codebase. Keep it updated as the project evolves.*
