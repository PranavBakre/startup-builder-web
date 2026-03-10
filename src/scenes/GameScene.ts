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

export class GameScene extends Phaser.Scene {
  private movementSystem!: MovementSystem;
  private dialogueSystem!: DialogueSystem;
  private notebookSystem!: NotebookSystem;
  private hud!: HUD;
  private npcs: NPC[] = [];
  private chatKey!: Phaser.Input.Keyboard.Key;
  private interactKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.cameras.main.fadeIn(400);

    this.renderMap();
    this.spawnNPCs();

    const player = createPlayer(this);
    // Start player at a walkable tile near center
    this.movementSystem = new MovementSystem(this, player, 9, 8);
    this.dialogueSystem = new DialogueSystem(this);
    this.notebookSystem = new NotebookSystem(this);
    this.hud = new HUD(this, NPC_DATA.length);

    this.chatKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Camera setup
    const mapPixelWidth = MAP_WIDTH * TILE_SIZE;
    const mapPixelHeight = MAP_HEIGHT * TILE_SIZE;
    this.cameras.main.setBounds(0, 0, mapPixelWidth, mapPixelHeight);
    this.cameras.main.startFollow(player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);

    this.movementSystem.onMove(() => {
      this.checkNPCProximity();
      this.checkDoorProximity();
    });

    // Initial check
    this.checkNPCProximity();
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

        // Add visual details for special tiles
        if (tileType === TileType.BUILDING_DOOR) {
          // Door knob
          this.add.circle(px + TILE_SIZE / 2 + 4, py + TILE_SIZE / 2 + 2, 2, 0xffffff).setDepth(1);
        }

        if (tileType === TileType.TREE) {
          // Tree trunk
          this.add.rectangle(px + TILE_SIZE / 2, py + TILE_SIZE / 2 + 6, 6, 12, 0x5c3a1e).setDepth(1);
          // Tree canopy
          this.add.circle(px + TILE_SIZE / 2, py + TILE_SIZE / 2 - 4, 10, 0x3d8b37).setDepth(2);
        }

        if (tileType === TileType.BENCH) {
          // Bench detail
          this.add.rectangle(px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE * 0.8, 6, 0xa0522d).setDepth(1);
          this.add.rectangle(px + TILE_SIZE / 2, py + TILE_SIZE / 2 + 4, TILE_SIZE * 0.6, 4, 0x8b4513).setDepth(1);
        }

        if (tileType === TileType.WATER) {
          // Water shimmer
          if ((x + y) % 2 === 0) {
            this.add.rectangle(px + TILE_SIZE / 2 + 4, py + TILE_SIZE / 2 - 4, 8, 2, 0x6db8f0, 0.5).setDepth(1);
          }
        }
      }
    }

    // Building labels
    this.addBuildingLabel(3, 2, 'Office');
    this.addBuildingLabel(14, 2, 'Startup Hub');
    this.addBuildingLabel(20, 14, 'Cafe');
  }

  private addBuildingLabel(x: number, y: number, label: string): void {
    this.add.text(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE - 4, label, {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: '#00000099',
      padding: { x: 3, y: 1 },
    }).setOrigin(0.5, 1).setDepth(3);
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

  update(): void {
    // Notebook takes priority over everything
    if (this.notebookSystem.getIsOpen()) {
      this.notebookSystem.update();
      return;
    }

    // Dialogue takes priority over movement
    if (this.dialogueSystem.getIsActive()) {
      this.dialogueSystem.update();
      return;
    }

    // Check for notebook toggle (even when not open)
    this.notebookSystem.update();
    if (this.notebookSystem.getIsOpen()) return;

    // Chat input
    if (Phaser.Input.Keyboard.JustDown(this.chatKey)) {
      this.tryChat();
      return;
    }

    // Interact with doors
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
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
