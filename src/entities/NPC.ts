import Phaser from 'phaser';
import { NPCData } from '../data/types';
import { TILE_SIZE } from '../data/mapData';

export class NPC {
  readonly data: NPCData;
  readonly sprite: Phaser.GameObjects.Container;
  private indicator: Phaser.GameObjects.Text;
  private nameLabel: Phaser.GameObjects.Text;
  private hasBeenTalkedTo = false;

  constructor(scene: Phaser.Scene, npcData: NPCData) {
    this.data = npcData;
    const px = npcData.position.x * TILE_SIZE + TILE_SIZE / 2;
    const py = npcData.position.y * TILE_SIZE + TILE_SIZE / 2;

    this.sprite = scene.add.container(px, py);

    // Body circle
    const body = scene.add.circle(0, 0, 10, npcData.color);
    this.sprite.add(body);

    // Head/dot on top
    const head = scene.add.circle(0, -8, 5, npcData.color);
    this.sprite.add(head);

    // Name label
    this.nameLabel = scene.add.text(0, -22, npcData.name, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: '#00000088',
      padding: { x: 3, y: 1 },
    }).setOrigin(0.5, 1);
    this.sprite.add(this.nameLabel);

    // Chat indicator (hidden by default)
    this.indicator = scene.add.text(0, 16, '[C] Chat', {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#4a90d9',
      backgroundColor: '#1a1a2ecc',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5, 0).setVisible(false);
    this.sprite.add(this.indicator);

    this.sprite.setDepth(5);
  }

  showIndicator(show: boolean): void {
    this.indicator.setVisible(show);
  }

  markTalkedTo(): void {
    this.hasBeenTalkedTo = true;
    this.nameLabel.setColor('#2ecc71');
  }

  getHasBeenTalkedTo(): boolean {
    return this.hasBeenTalkedTo;
  }

  isAdjacentTo(gridX: number, gridY: number): boolean {
    const dx = Math.abs(this.data.position.x - gridX);
    const dy = Math.abs(this.data.position.y - gridY);
    return (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0);
  }
}
