import Phaser from 'phaser';
import { MAP_DATA, MAP_WIDTH, MAP_HEIGHT, TILE_SIZE, TILE_COLORS } from '../data/mapData';
import { TileType } from '../data/types';
import { NPC_DATA } from '../data/npcs';
import { NPC } from '../entities/NPC';
import { createPlayer } from '../entities/Player';
import { MovementSystem } from '../systems/MovementSystem';
import { DialogueSystem } from '../systems/DialogueSystem';
import { NotebookSystem } from '../systems/NotebookSystem';
import { HUD } from '../ui/HUD';
import { Minimap } from '../ui/Minimap';

export class GameScene extends Phaser.Scene {
  private movementSystem!: MovementSystem;
  private dialogueSystem!: DialogueSystem;
  private notebookSystem!: NotebookSystem;
  private hud!: HUD;
  private minimap!: Minimap;
  private npcs: NPC[] = [];
  private player!: Phaser.GameObjects.Container;
  private chatPending = false;
  private interactPending = false;
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.cameras.main.fadeIn(400);

    this.renderMap();
    this.spawnNPCs();

    this.player = createPlayer(this);
    // Start player at a walkable tile near center
    this.movementSystem = new MovementSystem(this, this.player, 9, 8);
    this.dialogueSystem = new DialogueSystem(this);
    this.notebookSystem = new NotebookSystem(this);
    this.hud = new HUD(this, NPC_DATA.length);
    this.minimap = new Minimap(this, this.npcs);

    this.input.keyboard!.on('keydown-C', () => { this.chatPending = true; });
    this.input.keyboard!.on('keydown-E', () => { this.interactPending = true; });

    // Camera setup
    const mapPixelWidth = MAP_WIDTH * TILE_SIZE;
    const mapPixelHeight = MAP_HEIGHT * TILE_SIZE;
    this.cameras.main.setBounds(0, 0, mapPixelWidth, mapPixelHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);

    // UI camera — unzoomed, renders only UI elements at 1:1 screen size
    this.uiCamera = this.cameras.add(0, 0, this.cameras.main.width, this.cameras.main.height);
    this.uiCamera.setScroll(0, 0);

    // Main camera should NOT render UI objects; UI camera should ONLY render them
    const uiObjects: Phaser.GameObjects.GameObject[] = [
      ...this.dialogueSystem.getUIObjects(),
      ...this.notebookSystem.getUIObjects(),
      ...this.hud.getUIObjects(),
      ...this.minimap.getUIObjects(),
    ];
    for (const obj of uiObjects) {
      this.cameras.main.ignore(obj);
    }
    // UI camera ignores everything EXCEPT UI objects
    for (const child of this.children.list) {
      if (!uiObjects.includes(child)) {
        this.uiCamera.ignore(child);
      }
    }

    // Vignette effect for atmosphere
    this.addVignette();

    this.movementSystem.onMove(() => {
      this.checkNPCProximity();
      this.checkDoorProximity();
      const pos = this.movementSystem.getPosition();
      this.minimap.updatePlayerPosition(pos.x, pos.y);
    });

    // Initial state
    this.checkNPCProximity();
    const startPos = this.movementSystem.getPosition();
    this.minimap.updatePlayerPosition(startPos.x, startPos.y);
  }

  private addVignette(): void {
    const cam = this.cameras.main;
    const w = cam.width;
    const h = cam.height;
    const vignette = this.add.graphics().setScrollFactor(0).setDepth(90);
    this.uiCamera.ignore(vignette);

    // Layered rectangles at edges for a simple vignette effect
    vignette.fillStyle(0x000000, 0.12);
    vignette.fillRect(0, 0, w * 0.08, h);
    vignette.fillRect(w - w * 0.08, 0, w * 0.08, h);
    vignette.fillRect(0, 0, w, h * 0.06);
    vignette.fillRect(0, h - h * 0.06, w, h * 0.06);

    // Softer inner edges
    vignette.fillStyle(0x000000, 0.06);
    vignette.fillRect(w * 0.08, 0, w * 0.06, h);
    vignette.fillRect(w - w * 0.14, 0, w * 0.06, h);
    vignette.fillRect(0, h * 0.06, w, h * 0.04);
    vignette.fillRect(0, h - h * 0.10, w, h * 0.04);
  }

  private renderMap(): void {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tileType = MAP_DATA[y][x];
        const color = TILE_COLORS[tileType];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        const tile = this.add.rectangle(px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE, TILE_SIZE, color);

        // Add slight variation to grass tiles
        if (tileType === TileType.GRASS && (x + y) % 3 === 0) {
          tile.setFillStyle(0x6db840);
        }
        if (tileType === TileType.GRASS && (x * y) % 5 === 0) {
          tile.setFillStyle(0x72c048);
        }

        // Path borders — draw subtle darker edge lines around path tiles
        if (tileType === TileType.PATH) {
          // Add subtle texture variation
          if ((x + y) % 2 === 0) {
            tile.setFillStyle(0xcebf98);
          }
          // Draw border lines where path meets non-path
          this.addPathBorders(x, y, px, py);
        }

        // Building walls — add height effect
        if (tileType === TileType.BUILDING_WALL) {
          this.renderBuildingWall(x, y, px, py);
        }

        // Door with knob
        if (tileType === TileType.BUILDING_DOOR) {
          this.add.circle(px + TILE_SIZE / 2 + 4, py + TILE_SIZE / 2 + 2, 2, 0xffffff).setDepth(1);
        }

        // Trees with shadow and height
        if (tileType === TileType.TREE) {
          this.renderTree(px, py);
        }

        // Bench
        if (tileType === TileType.BENCH) {
          // Bench shadow
          this.add.ellipse(px + TILE_SIZE / 2 + 2, py + TILE_SIZE / 2 + 6, TILE_SIZE * 0.7, TILE_SIZE * 0.2, 0x000000, 0.2).setDepth(0);
          this.add.rectangle(px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE * 0.8, 6, 0xa0522d).setDepth(1);
          this.add.rectangle(px + TILE_SIZE / 2, py + TILE_SIZE / 2 + 4, TILE_SIZE * 0.6, 4, 0x8b4513).setDepth(1);
        }

        // Water shimmer
        if (tileType === TileType.WATER) {
          if ((x + y) % 2 === 0) {
            this.add.rectangle(px + TILE_SIZE / 2 + 4, py + TILE_SIZE / 2 - 4, 8, 2, 0x6db8f0, 0.5).setDepth(1);
          }
          if ((x * 3 + y) % 4 === 0) {
            this.add.rectangle(px + TILE_SIZE / 2 - 6, py + TILE_SIZE / 2 + 2, 6, 2, 0x7dc8ff, 0.3).setDepth(1);
          }
        }
      }
    }

    // Building labels
    this.addBuildingLabel(3, 2, 'Office');
    this.addBuildingLabel(14, 2, 'Startup Hub');
    this.addBuildingLabel(20, 14, 'Cafe');
  }

  private addPathBorders(x: number, y: number, px: number, py: number): void {
    const borderColor = 0xb0a080;
    const borderAlpha = 0.5;
    const borderThickness = 2;

    // Check adjacent tiles and draw border where path meets non-path
    if (y > 0 && MAP_DATA[y - 1][x] !== TileType.PATH && MAP_DATA[y - 1][x] !== TileType.BUILDING_DOOR) {
      this.add.rectangle(px + TILE_SIZE / 2, py + borderThickness / 2, TILE_SIZE, borderThickness, borderColor, borderAlpha).setDepth(1);
    }
    if (y < MAP_HEIGHT - 1 && MAP_DATA[y + 1][x] !== TileType.PATH && MAP_DATA[y + 1][x] !== TileType.BUILDING_DOOR) {
      this.add.rectangle(px + TILE_SIZE / 2, py + TILE_SIZE - borderThickness / 2, TILE_SIZE, borderThickness, borderColor, borderAlpha).setDepth(1);
    }
    if (x > 0 && MAP_DATA[y][x - 1] !== TileType.PATH && MAP_DATA[y][x - 1] !== TileType.BUILDING_DOOR) {
      this.add.rectangle(px + borderThickness / 2, py + TILE_SIZE / 2, borderThickness, TILE_SIZE, borderColor, borderAlpha).setDepth(1);
    }
    if (x < MAP_WIDTH - 1 && MAP_DATA[y][x + 1] !== TileType.PATH && MAP_DATA[y][x + 1] !== TileType.BUILDING_DOOR) {
      this.add.rectangle(px + TILE_SIZE - borderThickness / 2, py + TILE_SIZE / 2, borderThickness, TILE_SIZE, borderColor, borderAlpha).setDepth(1);
    }
  }

  private renderBuildingWall(x: number, y: number, px: number, py: number): void {
    // Check if this is a top-row wall (no wall above) — add roof
    const hasWallAbove = y > 0 && (MAP_DATA[y - 1][x] === TileType.BUILDING_WALL || MAP_DATA[y - 1][x] === TileType.BUILDING_DOOR);

    if (!hasWallAbove) {
      // Roof — darker shade extending upward
      this.add.rectangle(px + TILE_SIZE / 2, py - TILE_SIZE * 0.2, TILE_SIZE, TILE_SIZE * 0.4, 0x5a4a3a).setDepth(3);
      // Roof edge highlight
      this.add.rectangle(px + TILE_SIZE / 2, py - TILE_SIZE * 0.4 + 1, TILE_SIZE, 2, 0x6b5b4b).setDepth(3);
    }

    // Add vertical "height" shading — darker at bottom to simulate wall depth
    this.add.rectangle(px + TILE_SIZE / 2, py + TILE_SIZE * 0.75, TILE_SIZE, TILE_SIZE * 0.5, 0x000000, 0.15).setDepth(1);

    // Window details on some wall tiles
    if ((x + y) % 2 === 0) {
      this.add.rectangle(px + TILE_SIZE / 2, py + TILE_SIZE / 2 - 2, 8, 8, 0xbdd7ee, 0.6).setDepth(2);
      this.add.rectangle(px + TILE_SIZE / 2, py + TILE_SIZE / 2 - 2, 8, 1, 0x6b5b4b, 0.8).setDepth(2);
    }
  }

  private renderTree(px: number, py: number): void {
    // Tree shadow on ground
    this.add.ellipse(px + TILE_SIZE / 2 + 4, py + TILE_SIZE / 2 + 10, TILE_SIZE * 0.8, TILE_SIZE * 0.35, 0x000000, 0.2).setDepth(0);

    // Tree trunk
    this.add.rectangle(px + TILE_SIZE / 2, py + TILE_SIZE / 2 + 4, 6, 14, 0x5c3a1e).setDepth(3);
    // Trunk highlight
    this.add.rectangle(px + TILE_SIZE / 2 - 1, py + TILE_SIZE / 2 + 4, 2, 14, 0x7a5a3e, 0.4).setDepth(3);

    // Tree canopy layers for depth (back layer darker, front lighter)
    this.add.circle(px + TILE_SIZE / 2, py + TILE_SIZE / 2 - 6, 11, 0x2d6b27).setDepth(4);
    this.add.circle(px + TILE_SIZE / 2 - 2, py + TILE_SIZE / 2 - 4, 9, 0x3d8b37).setDepth(4);
    this.add.circle(px + TILE_SIZE / 2 + 3, py + TILE_SIZE / 2 - 8, 7, 0x4a9b47).setDepth(4);
    // Top highlight
    this.add.circle(px + TILE_SIZE / 2 - 1, py + TILE_SIZE / 2 - 10, 4, 0x5aab57, 0.5).setDepth(4);
  }

  private addBuildingLabel(x: number, y: number, label: string): void {
    this.add.text(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE - 12, label, {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: '#00000099',
      padding: { x: 3, y: 1 },
    }).setOrigin(0.5, 1).setDepth(5);
  }

  private spawnNPCs(): void {
    for (const npcData of NPC_DATA) {
      const npc = new NPC(this, npcData);
      this.npcs.push(npc);
    }
  }

  private checkNPCProximity(): void {
    const pos = this.movementSystem.getPosition();
    let anyNearby = false;

    for (const npc of this.npcs) {
      const isNear = npc.isAdjacentTo(pos.x, pos.y);
      npc.showIndicator(isNear && !this.dialogueSystem.getIsActive());
      if (isNear) anyNearby = true;
    }

    if (!anyNearby) {
      // Don't hide if dialogue or notebook is open
    }
  }

  private checkDoorProximity(): void {
    const pos = this.movementSystem.getPosition();
    const tile = MAP_DATA[pos.y][pos.x];
    if (tile === TileType.BUILDING_DOOR) {
      this.hud.showInteraction('Press E to enter (Coming in Phase 2)');
    } else {
      this.hud.hideInteraction();
    }
  }

  private tryChat(): void {
    const pos = this.movementSystem.getPosition();
    for (const npc of this.npcs) {
      if (npc.isAdjacentTo(pos.x, pos.y)) {
        // Hide all indicators during dialogue
        for (const n of this.npcs) n.showIndicator(false);

        this.dialogueSystem.startDialogue(npc.data.name, npc.data.dialogue, () => {
          // On dialogue complete - discover the problem
          if (!npc.getHasBeenTalkedTo()) {
            npc.markTalkedTo();
            const problem = {
              ...npc.data.problem,
              discoveredAt: Date.now(),
            };
            this.notebookSystem.addProblem(problem);
            this.hud.updateProblemCount(this.notebookSystem.getDiscoveredCount(), NPC_DATA.length);

            // Show discovery notification
            const cam = this.cameras.main;
            const notif = this.add.text(cam.width / 2, 60, `Problem Discovered: ${problem.title}`, {
              fontSize: '14px',
              fontFamily: 'monospace',
              color: '#2ecc71',
              backgroundColor: '#1a1a2eee',
              padding: { x: 12, y: 6 },
            }).setOrigin(0.5).setScrollFactor(0).setDepth(150);

            // Register with UI camera
            this.cameras.main.ignore(notif);

            this.tweens.add({
              targets: notif,
              alpha: 0,
              y: 40,
              delay: 2000,
              duration: 600,
              onComplete: () => notif.destroy(),
            });
          }
          this.checkNPCProximity();
        });
        return;
      }
    }
  }

  /** Depth sort: entities lower on screen (higher Y) render in front */
  private updateDepthSorting(): void {
    const mapPixelHeight = MAP_HEIGHT * TILE_SIZE;

    // Player depth based on Y position
    const playerDepth = 10 + (this.player.y / mapPixelHeight) * 5;
    this.player.setDepth(playerDepth);

    // Perspective scale: entities further north are slightly smaller
    const playerNormY = this.player.y / mapPixelHeight;
    const playerScale = 0.85 + playerNormY * 0.15; // Range: 0.85 to 1.0
    this.player.setScale(playerScale);

    // NPC depth and scale based on Y
    for (const npc of this.npcs) {
      const npcDepth = 10 + (npc.sprite.y / mapPixelHeight) * 5;
      npc.sprite.setDepth(npcDepth);

      const npcNormY = npc.sprite.y / mapPixelHeight;
      const npcScale = 0.85 + npcNormY * 0.15;
      npc.sprite.setScale(npcScale);
    }
  }

  update(): void {
    // Always update depth sorting
    this.updateDepthSorting();

    // Notebook takes priority over everything
    if (this.notebookSystem.getIsOpen()) {
      this.notebookSystem.update();
      return;
    }

    // Dialogue takes priority over movement
    if (this.dialogueSystem.getIsActive()) {
      return;
    }

    // Check for notebook toggle (even when not open)
    this.notebookSystem.update();
    if (this.notebookSystem.getIsOpen()) return;

    // Chat input
    if (this.chatPending) {
      this.chatPending = false;
      this.tryChat();
      return;
    }

    // Interact with doors
    if (this.interactPending) {
      this.interactPending = false;
      const pos = this.movementSystem.getPosition();
      const tile = MAP_DATA[pos.y][pos.x];
      if (tile === TileType.BUILDING_DOOR) {
        this.hud.showInteraction('Building interiors coming in Phase 2!');
        this.time.delayedCall(2000, () => this.hud.hideInteraction());
      }
    }

    // Movement
    this.movementSystem.update();
  }
}
