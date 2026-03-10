# Startup Simulator

A top-down startup simulator where you build a billion-dollar company from scratch. Walk around, talk to NPCs, discover real-world problems, and choose your startup direction.

## Phase 1: Problem Discovery

Walk around the map, chat with 10 NPCs, and discover startup problems. Choose one to define your company's direction.

## Setup

```bash
npm install
npm run dev
```

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrow Keys | Move |
| C | Chat with nearby NPC |
| N | Open/close Notebook |
| E | Interact with buildings |
| Enter / Space | Advance dialogue |
| Esc | Close notebook |

## Project Structure

```
src/
  scenes/       - Phaser scenes (TitleScene, GameScene)
  entities/     - Game entities (Player, NPC)
  systems/      - Core systems (Movement, Dialogue, Notebook)
  ui/           - UI components (HUD)
  data/         - Game data (map, NPCs, types)
```

## Tech Stack

- TypeScript + Phaser 3
- Vite for dev server and bundling
