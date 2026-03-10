import Phaser from 'phaser';
import { TILE_SIZE } from '../data/mapData';

export function createPlayer(scene: Phaser.Scene): Phaser.GameObjects.Container {
  const container = scene.add.container(0, 0);

  // Drop shadow
  const shadow = scene.add.ellipse(0, TILE_SIZE * 0.3, TILE_SIZE * 0.7, TILE_SIZE * 0.25, 0x000000, 0.35);
  container.add(shadow);

  // Body with outline effect (dark layer behind, then colored layer)
  const bodyOutline = scene.add.rectangle(0, 0, TILE_SIZE * 0.65, TILE_SIZE * 0.75, 0x1a3a6b);
  container.add(bodyOutline);
  const body = scene.add.rectangle(0, 0, TILE_SIZE * 0.55, TILE_SIZE * 0.65, 0x3498db);
  container.add(body);

  // Shirt detail - lighter stripe
  const stripe = scene.add.rectangle(0, -TILE_SIZE * 0.05, TILE_SIZE * 0.35, TILE_SIZE * 0.08, 0x5dade2);
  container.add(stripe);

  // Head with outline
  const headOutline = scene.add.circle(0, -TILE_SIZE * 0.38, TILE_SIZE * 0.26, 0xc49a6c);
  container.add(headOutline);
  const head = scene.add.circle(0, -TILE_SIZE * 0.38, TILE_SIZE * 0.22, 0xf5cba7);
  container.add(head);

  // Hair
  const hair = scene.add.ellipse(0, -TILE_SIZE * 0.52, TILE_SIZE * 0.36, TILE_SIZE * 0.18, 0x4a3520);
  container.add(hair);

  // Backpack with outline
  const backpackOutline = scene.add.rectangle(TILE_SIZE * 0.22, TILE_SIZE * 0.02, TILE_SIZE * 0.2, TILE_SIZE * 0.4, 0x1a2530);
  container.add(backpackOutline);
  const backpack = scene.add.rectangle(TILE_SIZE * 0.22, TILE_SIZE * 0.02, TILE_SIZE * 0.15, TILE_SIZE * 0.35, 0x2c3e50);
  container.add(backpack);

  container.setDepth(10);

  return container;
}
