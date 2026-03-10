import Phaser from 'phaser';
import { MAP_DATA, MAP_WIDTH, MAP_HEIGHT, TILE_SIZE, isWalkable } from '../data/mapData';
import { Position } from '../data/types';

export class MovementSystem {
  private scene: Phaser.Scene;
  private player: Phaser.GameObjects.Container;
  private gridX: number;
  private gridY: number;
  private isMoving = false;
  private moveSpeed = 150; // ms per tile
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private onMoveCallback?: (pos: Position) => void;

  constructor(scene: Phaser.Scene, player: Phaser.GameObjects.Container, startX: number, startY: number) {
    this.scene = scene;
    this.player = player;
    this.gridX = startX;
    this.gridY = startY;

    this.player.x = startX * TILE_SIZE + TILE_SIZE / 2;
    this.player.y = startY * TILE_SIZE + TILE_SIZE / 2;

    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  onMove(callback: (pos: Position) => void): void {
    this.onMoveCallback = callback;
  }

  getPosition(): Position {
    return { x: this.gridX, y: this.gridY };
  }

  update(): void {
    if (this.isMoving) return;

    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) dx = -1;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) dx = 1;
    else if (this.cursors.up.isDown || this.wasd.W.isDown) dy = -1;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) dy = 1;

    if (dx === 0 && dy === 0) return;

    const newX = this.gridX + dx;
    const newY = this.gridY + dy;

    if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) return;

    const targetTile = MAP_DATA[newY][newX];
    if (!isWalkable(targetTile)) return;

    this.gridX = newX;
    this.gridY = newY;
    this.isMoving = true;

    this.scene.tweens.add({
      targets: this.player,
      x: newX * TILE_SIZE + TILE_SIZE / 2,
      y: newY * TILE_SIZE + TILE_SIZE / 2,
      duration: this.moveSpeed,
      ease: 'Linear',
      onComplete: () => {
        this.isMoving = false;
        this.onMoveCallback?.({ x: this.gridX, y: this.gridY });
      },
    });
  }

  isPlayerMoving(): boolean {
    return this.isMoving;
  }
}
