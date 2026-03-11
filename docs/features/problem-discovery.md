# Phase 1: Problem Discovery

## Summary

The player walks around a tile-based map, approaches NPCs, and presses C to chat. Each NPC delivers a multi-line dialogue that surfaces a real-world problem. After completing the conversation, the problem is added to the Founder's Notebook. The player collects problems from multiple NPCs, then opens the notebook (N) to review them and choose one as their startup direction. This choice defines the product the player will build in Phase 2.

## Code Index

### Scenes

| File | Key Methods | Description |
|------|-------------|-------------|
| `src/scenes/TitleScene.ts` | `create()` | Title screen with blinking start prompt; transitions to GameScene on Enter |
| `src/scenes/GameScene.ts` | `create()`, `update()`, `tryChat()`, `checkNPCProximity()`, `checkDoorProximity()`, `renderMap()`, `spawnNPCs()`, `updateDepthSorting()`, `addVignette()` | Main gameplay scene; orchestrates all systems, cameras, and game loop |

### Systems

| File | Key Methods | Description |
|------|-------------|-------------|
| `src/systems/MovementSystem.ts` | `update()`, `getPosition()`, `onMove()`, `isPlayerMoving()` | Grid-based WASD/arrow movement with 150ms tween animation per tile |
| `src/systems/DialogueSystem.ts` | `startDialogue()`, `advance()`, `close()`, `getIsActive()`, `getUIObjects()` | Renders dialogue box at bottom of screen; Enter/Space to advance lines |
| `src/systems/NotebookSystem.ts` | `addProblem()`, `update()`, `getIsOpen()`, `getDiscoveredCount()`, `getChosenProblem()`, `getUIObjects()` | Full-screen notebook overlay; Up/Down to navigate, Enter to choose problem |

### Entities

| File | Key Methods | Description |
|------|-------------|-------------|
| `src/entities/Player.ts` | `createPlayer()` | Factory function; builds procedural player sprite as a Phaser Container (shadow, body, head, hair, backpack) |
| `src/entities/NPC.ts` | `constructor()`, `showIndicator()`, `markTalkedTo()`, `getHasBeenTalkedTo()`, `isAdjacentTo()` | NPC class with idle bobbing animation, name label, "[C] Chat" indicator, adjacency check (8-directional, 1 tile) |

### UI

| File | Key Methods | Description |
|------|-------------|-------------|
| `src/ui/HUD.ts` | `updateProblemCount()`, `showInteraction()`, `hideInteraction()`, `getUIObjects()` | Founder label, problem counter, keyboard hints, interaction prompts |
| `src/ui/Minimap.ts` | `updatePlayerPosition()`, `getUIObjects()` | 4px/tile minimap in bottom-right; static tile layer + dynamic player (white dot) and NPC (colored dots) |

### Data

| File | Exports | Description |
|------|---------|-------------|
| `src/data/types.ts` | `Position`, `NPCData`, `ProblemData`, `DiscoveredProblem`, `GameState`, `TileType` | All shared interfaces and the TileType enum (GRASS, GRASS_ALT, PATH, BUILDING_WALL, BUILDING_DOOR, WATER, TREE, BENCH) |
| `src/data/mapData.ts` | `MAP_DATA`, `MAP_WIDTH`, `MAP_HEIGHT`, `TILE_SIZE`, `TILE_COLORS`, `isWalkable()` | 26x22 tile map array, tile color palette, walkability check (GRASS, GRASS_ALT, PATH, BUILDING_DOOR are walkable) |
| `src/data/npcs.ts` | `NPC_DATA` | Array of 10 NPCData objects with id, name, color, position, dialogue lines, and problem |

## Map Details

| Property | Value |
|----------|-------|
| Dimensions | 26 tiles wide x 22 tiles tall |
| Tile size | 32 px |
| World pixel size | 832 x 704 px |
| Tile types | GRASS (0), GRASS_ALT (1), PATH (2), BUILDING_WALL (3), BUILDING_DOOR (4), WATER (5), TREE (6), BENCH (7) |
| Walkable tiles | GRASS, GRASS_ALT, PATH, BUILDING_DOOR |
| Buildings | Office (col 2-5, row 2-4, door at 4,4), Startup Hub (col 13-16, row 2-4, door at 15,3), Cafe (col 18-23, row 14-16, door at 21,15) |

## NPC List

| Name | ID | Position (x, y) | Color | Problem Title | Location |
|------|----|-----------------|-------|--------------|----------|
| Maria | npc_maria | (8, 5) | 0xe74c3c (red) | Restaurant Food Waste | Town Square |
| James | npc_james | (15, 5) | 0x3498db (blue) | Freelancer Health Insurance | Near Office Building |
| Sarah | npc_sarah | (4, 12) | 0x9b59b6 (purple) | Local Event Discovery | Park |
| David | npc_david | (20, 8) | 0x2ecc71 (green) | Affordable Small Business Websites | Cafe Area |
| Lisa | npc_lisa | (12, 15) | 0xf39c12 (orange) | Reliable Pet Sitting | Park |
| Alex | npc_alex | (22, 14) | 0x1abc9c (teal) | Student Study Group Scheduling | Coworking Space |
| Rachel | npc_rachel | (6, 18) | 0xe91e63 (pink) | Neighborhood Safety Info | Residential Area |
| Tom | npc_tom | (18, 18) | 0x795548 (brown) | Food Delivery Tracking | Near Cafe |
| Priya | npc_priya | (14, 10) | 0xff5722 (deep orange) | Employee Onboarding | Office Building |
| Kevin | npc_kevin | (3, 7) | 0x607d8b (blue-grey) | Coworking Space Networking | Coworking Space |

## Dialogue Flow (End-to-End)

1. **Player walks near NPC** (within 1 tile, 8-directional adjacency via `NPC.isAdjacentTo()`)
2. **`[C] Chat` indicator appears** above the NPC (`GameScene.checkNPCProximity()` calls `npc.showIndicator(true)`)
3. **Player presses C** -- `keydown-C` event sets `chatPending = true`
4. **`update()` consumes flag** -- calls `tryChat()`, which finds the adjacent NPC
5. **All NPC indicators are hidden** during dialogue
6. **`dialogueSystem.startDialogue(name, dialogue[], onComplete)`** is called
   - Dialogue box appears at the bottom of the screen (760px wide, 120px tall)
   - NPC name displayed in blue, dialogue text in white
   - Prompt shows `[Enter / Space] (1/5)` with line counter
7. **Player presses Enter or Space** to advance lines (event-based: `keydown-ENTER`, `keydown-SPACE`)
8. **On last line**, prompt changes to `[Enter / Space to close]`
9. **Dialogue closes** -- event listeners are removed, `onComplete` callback fires
10. **If first conversation with this NPC**:
    - `npc.markTalkedTo()` -- name label turns green
    - Problem added to notebook via `notebookSystem.addProblem()`
    - HUD problem counter updated
    - Green notification banner "Problem Discovered: {title}" fades in at top of screen, then fades out after 2 seconds
11. **NPC proximity re-checked** -- nearby indicators re-shown

## Camera Setup

Configured in `GameScene.create()`:

| Camera | Property | Value |
|--------|----------|-------|
| Main (`cameras.main`) | Zoom | 2x |
| Main | Bounds | 0, 0, 832, 704 (full map) |
| Main | Follow | Player container, lerp 0.1/0.1 |
| Main | Renders | Map tiles, NPCs, player, vignette overlay |
| Main | Ignores | All UI objects (dialogue, notebook, HUD, minimap) |
| UI (`uiCamera`) | Zoom | 1x (default) |
| UI | Scroll | Fixed at (0, 0) |
| UI | Renders | Dialogue box, notebook overlay, HUD elements, minimap |
| UI | Ignores | All world objects (tiles, NPCs, player, vignette) |

The vignette overlay uses `setScrollFactor(0)` and is ignored by the UI camera, so it renders as a fixed darkened border on the main camera despite the zoom. This works because the vignette is a world-rendered aesthetic element, not a UI element.
