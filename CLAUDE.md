# Startup Simulator

A top-down 2.5D startup simulator built with **Phaser 3 + TypeScript + Vite**. The player walks around a tile-based map, talks to NPCs to discover real-world problems, and chooses one to build a startup around. Currently implements the Phase 1 core loop (Problem Discovery); future phases add product building, hiring, office setup, team management, launch events, and growth cycles toward a $1B valuation goal.

## Documentation Index

| Document | Description |
|----------|-------------|
| [docs/architecture.md](docs/architecture.md) | Tech stack, scene graph, system architecture, dual camera, state machine, data flow |
| [docs/phases.md](docs/phases.md) | All 7 game phases, economy summary, key mechanics |
| [docs/input-map.md](docs/input-map.md) | Complete keyboard input reference table |
| [docs/gotchas.md](docs/gotchas.md) | Phaser 3 pitfalls and solutions learned during development |
| [docs/features/problem-discovery.md](docs/features/problem-discovery.md) | Phase 1 feature doc: code index, NPC list, dialogue flow, camera setup |

## File Structure

```
src/
  main.ts                    # Phaser game config and entry point (800x600, pixel art, FIT scale)
  data/
    types.ts                 # Shared interfaces (Position, NPCData, ProblemData, GameState) and TileType enum
    mapData.ts               # 26x22 tile map, tile colors, TILE_SIZE (32), isWalkable()
    npcs.ts                  # NPC_DATA array -- 10 NPCs with dialogue and problems
  entities/
    Player.ts                # createPlayer() -- procedural player sprite (container of shapes)
    NPC.ts                   # NPC class -- sprite, chat indicator, idle animation, adjacency check
  scenes/
    TitleScene.ts            # Title screen with blinking "Press ENTER to start"
    GameScene.ts             # Main gameplay scene -- orchestrates all systems and cameras
  systems/
    MovementSystem.ts        # Grid-based WASD/arrow movement with tween animation (150ms/tile)
    DialogueSystem.ts        # NPC dialogue display with Enter/Space advancement
    NotebookSystem.ts        # Problem collection, selection UI, and startup direction choice
  ui/
    HUD.ts                   # Problem counter, keyboard hints, interaction prompts
    Minimap.ts               # Bottom-right minimap (4px/tile) showing player + NPC positions
```

## Current State

- **Phase 1: Problem Discovery** -- complete (tagged `phase-1`)
- **Phase 2: Build Product Website** -- next

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # TypeScript compile + Vite production build
npm run preview   # Preview production build
```

## Critical Rules

### UI must use the UI camera, not main camera
The main camera is zoomed 2x and follows the player. Any UI element rendered on the main camera will be zoomed and scroll with the world. All HUD, dialogue, notebook, and minimap elements must be rendered on the separate unzoomed UI camera.

### Use event-based keyboard input, not JustDown() polling
`Phaser.Input.Keyboard.JustDown()` is unreliable for discrete key presses. Instead use `keyboard.on("keydown-X", callback)` to set a pending flag, then consume it in `update()`.

### New UI objects must be registered with both cameras
When creating UI objects, they must be added to the ignore list of the main camera (`cameras.main.ignore(obj)`) so they only render on the UI camera. The UI camera already ignores all world objects set up during `create()`.

### Dynamic UI objects need cameras.main.ignore()
Objects created after scene setup (notifications, confirmation text, popups) won't be in the initial ignore list. Call `this.cameras.main.ignore(obj)` immediately after creation -- see `tryChat()` notification in `GameScene.ts` for the pattern.

## Quick Reference

| How does X work? | Where to look |
|---|---|
| Player movement | `src/systems/MovementSystem.ts` -- grid-based tween movement |
| NPC conversations | `src/systems/DialogueSystem.ts` -- queued dialogue lines |
| Problem collection | `src/systems/NotebookSystem.ts` -- tracks discovered problems |
| Chat initiation | `GameScene.ts:tryChat()` -- finds adjacent NPC, starts dialogue |
| Problem discovery | `GameScene.ts:tryChat()` callback -- marks NPC, adds to notebook |
| Map layout | `src/data/mapData.ts` -- MAP_DATA 2D array + TILE_COLORS |
| NPC data | `src/data/npcs.ts` -- NPC_DATA with positions, dialogue, problems |
| Camera setup | `GameScene.ts:create()` lines 46-72 -- dual camera configuration |
| Depth sorting | `GameScene.ts:updateDepthSorting()` -- Y-based depth + scale |
| Tile rendering | `GameScene.ts:renderMap()` -- procedural tiles with detail |
| Type definitions | `src/data/types.ts` -- Position, NPCData, ProblemData, TileType |
