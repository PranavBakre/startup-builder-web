import Phaser from 'phaser';
import { TILE_SIZE } from '../data/mapData';

export function createPlayer(scene: Phaser.Scene): Phaser.GameObjects.Container {
  const container = scene.add.container(0, 0);

  // Body
  const body = scene.add.rectangle(0, 0, TILE_SIZE * 0.6, TILE_SIZE * 0.7, 0x3498db);
  container.add(body);

  // Head
  const head = scene.add.circle(0, -TILE_SIZE * 0.35, TILE_SIZE * 0.22, 0xf5cba7);
  container.add(head);

  // Small detail - "backpack"
  const backpack = scene.add.rectangle(TILE_SIZE * 0.2, 0, TILE_SIZE * 0.15, TILE_SIZE * 0.35, 0x2c3e50);
  container.add(backpack);

  container.setDepth(10);

  return container;
}
