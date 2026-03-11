# Architecture

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Engine | Phaser 3 | `Phaser.AUTO` renderer, `pixelArt: true` |
| Language | TypeScript | Strict mode via Vite build |
| Bundler | Vite | Dev server + production builds |
| Resolution | 800 x 600 | `Phaser.Scale.FIT` with `CENTER_BOTH` |
| Tile size | 32 px | Constant `TILE_SIZE` in `src/data/mapData.ts` |
| Map | 26 x 22 tiles | 832 x 704 px world |

## Scene Graph

```
TitleScene  -->  GameScene
```

- **TitleScene** (`src/scenes/TitleScene.ts`): Static title screen. Displays game title, subtitle, control hints, and a blinking "Press ENTER to start" prompt. Fades out over 400ms and transitions to GameScene via `this.scene.start('GameScene')`.
- **GameScene** (`src/scenes/GameScene.ts`): Main gameplay scene. Orchestrates all systems, renders the map, spawns NPCs, sets up dual cameras, and runs the update loop.

## System Architecture

GameScene owns and orchestrates five subsystems, each responsible for one concern:

| System | File | Responsibility |
|--------|------|----------------|
| MovementSystem | `src/systems/MovementSystem.ts` | Grid-based WASD/arrow movement, tween animation (150ms/tile), boundary + walkability checks |
| DialogueSystem | `src/systems/DialogueSystem.ts` | NPC dialogue box rendering, Enter/Space line advancement, event-based keyboard listeners |
| NotebookSystem | `src/systems/NotebookSystem.ts` | Problem collection, list UI with Up/Down navigation, Enter to choose startup direction |
| HUD | `src/ui/HUD.ts` | Problem counter (top-right), "Founder" label (top-left), keyboard hints (bottom-left), interaction prompts (center-bottom) |
| Minimap | `src/ui/Minimap.ts` | Bottom-right minimap (4px/tile), static tile layer + dynamic player/NPC dots |

GameScene also directly handles:
- Map rendering (`renderMap()`) -- procedural tile detail (grass variation, path borders, building walls/roofs, tree canopy, water shimmer, benches)
- NPC spawning (`spawnNPCs()`) -- iterates `NPC_DATA`, creates `NPC` instances
- NPC proximity checks (`checkNPCProximity()`) -- shows/hides `[C] Chat` indicators
- Door proximity checks (`checkDoorProximity()`) -- shows Phase 2 placeholder message
- Chat initiation (`tryChat()`) -- finds adjacent NPC, starts dialogue, handles problem discovery callback
- Depth sorting (`updateDepthSorting()`) -- Y-based depth + perspective scale (0.85--1.0)
- Vignette overlay (`addVignette()`) -- semi-transparent edge darkening for atmosphere

## Dual Camera System

Two cameras render the scene simultaneously:

| Camera | Zoom | Scroll | Renders |
|--------|------|--------|---------|
| `cameras.main` | 2x | Follows player (`startFollow` with lerp 0.1) | World: map tiles, NPCs, player, vignette |
| `uiCamera` | 1x (default) | Fixed at (0, 0) | UI: dialogue box, notebook, HUD, minimap |

### Ignore Pattern

During `create()`:
1. All UI objects are collected from `dialogueSystem.getUIObjects()`, `notebookSystem.getUIObjects()`, `hud.getUIObjects()`, and `minimap.getUIObjects()`.
2. Each UI object is added to `cameras.main.ignore(obj)` so the main camera does not render it.
3. Every non-UI child in the scene is added to `uiCamera.ignore(child)` so the UI camera does not render world objects.

For dynamic UI objects created after `create()` (notifications, confirmation text), `cameras.main.ignore(obj)` must be called immediately after creation. See `tryChat()` notification and `chooseProblem()` confirmation in the source.

## State Machine (Update Loop)

The `update()` method in GameScene implements a priority-based state machine:

```
1. updateDepthSorting()          -- always runs
2. if notebookSystem.isOpen:     -- notebook blocks ALL input
     notebookSystem.update()
     return
3. if dialogueSystem.isActive:   -- dialogue blocks movement + chat
     return
4. notebookSystem.update()       -- check N key toggle
   if notebookSystem.isOpen: return
5. if chatPending:               -- consume C key, tryChat()
     return
6. if interactPending:           -- consume E key, door interaction
7. movementSystem.update()       -- process WASD/arrow held keys
```

Priority order: **Notebook > Dialogue > Chat > Interact > Movement**

## Data Flow

### Problem Discovery Flow

```
Player walks near NPC
  --> checkNPCProximity() shows [C] Chat indicator
Player presses C
  --> keydown-C sets chatPending = true
  --> update() consumes chatPending, calls tryChat()
  --> tryChat() finds adjacent NPC via isAdjacentTo()
  --> dialogueSystem.startDialogue(name, dialogue[], onComplete)
  --> Player advances dialogue with Enter/Space
  --> On complete callback:
       if !npc.hasBeenTalkedTo:
         npc.markTalkedTo()
         notebookSystem.addProblem(problem)
         hud.updateProblemCount()
         show discovery notification (dynamic UI, cameras.main.ignore)
```

### Movement Flow

```
Player holds WASD/arrow
  --> movementSystem.update() reads isDown state
  --> Checks boundaries (MAP_WIDTH, MAP_HEIGHT) and isWalkable()
  --> Updates gridX/gridY, sets isMoving = true
  --> Tween animates player container (150ms, Linear ease)
  --> onComplete: isMoving = false, calls onMoveCallback
  --> GameScene callback: checkNPCProximity(), checkDoorProximity(), minimap.updatePlayerPosition()
```

## Input Handling Pattern

Two patterns are used depending on the input type:

### Event-based (discrete actions)
Used for C (chat) and E (interact) in GameScene, and Enter/Space in DialogueSystem:
```typescript
this.input.keyboard!.on('keydown-C', () => { this.chatPending = true; });
// In update(): consume flag and act
```

### Polling (continuous held keys)
Used for movement (WASD/arrows) in MovementSystem and notebook navigation (Up/Down/N/Esc/Enter) in NotebookSystem:
```typescript
if (this.cursors.left.isDown || this.wasd.A.isDown) dx = -1;
// Or with JustDown for single-press in notebook:
if (Phaser.Input.Keyboard.JustDown(this.upKey)) { ... }
```

Note: JustDown is used in NotebookSystem for Up/Down/N/Esc/Enter navigation. This works within the notebook's own update loop but is considered unreliable for general gameplay input (see [gotchas](gotchas.md)).
