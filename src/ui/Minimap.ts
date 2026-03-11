import Phaser from 'phaser';
import { MAP_DATA, MAP_WIDTH, MAP_HEIGHT, TILE_COLORS } from '../data/mapData';
import { TileType } from '../data/types';
import { NPC } from '../entities/NPC';

const MINIMAP_TILE = 4; // pixels per tile on minimap
const PADDING = 10;
const BORDER = 2;

export class Minimap {
  private container: Phaser.GameObjects.Container;
  private mapGraphics: Phaser.GameObjects.Graphics;
  private dynamicGraphics: Phaser.GameObjects.Graphics;
  private playerPos = { x: 0, y: 0 };

  constructor(scene: Phaser.Scene, private npcs: NPC[]) {
    const cam = scene.cameras.main;
    const mapW = MAP_WIDTH * MINIMAP_TILE;
    const mapH = MAP_HEIGHT * MINIMAP_TILE;

    // Position: bottom-right corner
    const containerX = cam.width - mapW - PADDING - BORDER * 2;
    const containerY = cam.height - mapH - PADDING - BORDER * 2;

    this.container = scene.add.container(containerX, containerY)
      .setScrollFactor(0)
      .setDepth(80);

    // Background border
    const border = scene.add.rectangle(
      (mapW + BORDER * 2) / 2, (mapH + BORDER * 2) / 2,
      mapW + BORDER * 2, mapH + BORDER * 2,
      0x1a1a2e, 0.9
    ).setStrokeStyle(1, 0x4a90d9, 0.8);
    this.container.add(border);

    // Static map tiles (drawn once)
    this.mapGraphics = scene.add.graphics();
    this.drawStaticMap();
    this.container.add(this.mapGraphics);

    // Dynamic layer (player + NPCs, redrawn on move)
    this.dynamicGraphics = scene.add.graphics();
    this.container.add(this.dynamicGraphics);
  }

  private drawStaticMap(): void {
    const g = this.mapGraphics;
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = MAP_DATA[y][x];
        const color = TILE_COLORS[tile];
        // Slightly darken for minimap contrast
        g.fillStyle(color, tile === TileType.TREE ? 0.9 : 0.85);
        g.fillRect(
          BORDER + x * MINIMAP_TILE,
          BORDER + y * MINIMAP_TILE,
          MINIMAP_TILE,
          MINIMAP_TILE
        );
      }
    }
  }

  updatePlayerPosition(gridX: number, gridY: number): void {
    this.playerPos = { x: gridX, y: gridY };
    this.drawDynamic();
  }

  private drawDynamic(): void {
    const g = this.dynamicGraphics;
    g.clear();

    // Draw NPCs as colored dots
    for (const npc of this.npcs) {
      const nx = BORDER + npc.data.position.x * MINIMAP_TILE + MINIMAP_TILE / 2;
      const ny = BORDER + npc.data.position.y * MINIMAP_TILE + MINIMAP_TILE / 2;
      g.fillStyle(npc.data.color, 1);
      g.fillCircle(nx, ny, MINIMAP_TILE * 0.6);
    }

    // Draw player as white dot
    const px = BORDER + this.playerPos.x * MINIMAP_TILE + MINIMAP_TILE / 2;
    const py = BORDER + this.playerPos.y * MINIMAP_TILE + MINIMAP_TILE / 2;
    g.fillStyle(0xffffff, 1);
    g.fillCircle(px, py, MINIMAP_TILE * 0.7);
    // Outline for visibility
    g.lineStyle(1, 0x000000, 0.5);
    g.strokeCircle(px, py, MINIMAP_TILE * 0.7);
  }

  getUIObjects(): Phaser.GameObjects.GameObject[] {
    return [this.container];
  }
}
