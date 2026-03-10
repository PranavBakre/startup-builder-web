import { TileType } from './types';

const G = TileType.GRASS;

const P = TileType.PATH;
const W = TileType.BUILDING_WALL;
const D = TileType.BUILDING_DOOR;
const R = TileType.WATER;
const T = TileType.TREE;
const B = TileType.BENCH;

export const MAP_WIDTH = 26;
export const MAP_HEIGHT = 22;
export const TILE_SIZE = 32;

// 26 x 22 tile map
export const MAP_DATA: TileType[][] = [
  // Row 0
  [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T],
  // Row 1 - Top border with trees
  [T, G, G, G, G, G, P, P, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T],
  // Row 2 - Office building top
  [T, G, W, W, W, W, P, G, G, G, G, G, G, W, W, W, W, G, G, G, G, G, G, G, G, T],
  // Row 3 - Office building with door
  [T, G, W, W, W, W, P, G, G, G, G, G, G, W, W, D, W, G, G, G, G, G, G, G, G, T],
  // Row 4 - Below office
  [T, G, W, W, D, W, P, G, G, G, G, G, G, W, W, W, W, G, G, G, G, G, G, G, G, T],
  // Row 5 - Town square area
  [T, G, G, G, P, G, P, P, P, P, P, P, P, P, P, P, P, P, P, G, G, G, G, G, G, T],
  // Row 6 - Town square
  [T, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, T],
  // Row 7 - Town square with benches
  [T, G, G, G, P, G, G, B, G, G, G, B, G, G, G, G, G, G, P, G, G, G, G, G, G, T],
  // Row 8 - Town square center
  [T, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, P, P, P, P, G, G, G, T],
  // Row 9 - Path intersection
  [T, G, G, G, P, P, P, P, P, P, P, P, P, P, G, G, G, G, G, G, G, P, G, G, G, T],
  // Row 10 - Park area starts
  [T, G, G, G, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, P, G, G, G, T],
  // Row 11 - Park with trees and water
  [T, G, T, G, G, G, R, R, G, G, G, G, G, P, G, G, G, G, G, G, G, P, G, G, G, T],
  // Row 12 - Park
  [T, G, G, G, G, R, R, R, R, G, G, G, G, P, P, P, P, P, P, P, P, P, G, G, G, T],
  // Row 13 - Park with bench
  [T, G, G, B, G, G, R, R, G, G, G, G, G, G, G, G, G, G, G, G, G, P, G, G, G, T],
  // Row 14 - Cafe area top
  [T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, W, W, W, P, W, W, G, T],
  // Row 15 - Cafe
  [T, G, G, G, G, G, G, G, G, G, G, G, G, P, P, P, P, P, W, W, W, D, W, W, G, T],
  // Row 16 - Residential
  [T, G, G, G, G, G, G, G, G, G, G, G, G, P, G, G, G, G, W, W, W, W, W, W, G, T],
  // Row 17 - Residential path
  [T, G, G, G, G, G, P, P, P, P, P, P, P, P, G, G, G, G, G, G, G, G, G, G, G, T],
  // Row 18 - Bottom area
  [T, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T],
  // Row 19 - Bottom area
  [T, G, G, G, G, G, P, G, G, B, G, G, T, G, G, G, G, T, G, G, G, G, G, G, G, T],
  // Row 20 - Bottom border
  [T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T],
  // Row 21 - Bottom border
  [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T],
];

export const TILE_COLORS: Record<TileType, number> = {
  [TileType.GRASS]: 0x7ec850,
  [TileType.GRASS_ALT]: 0x6db840,
  [TileType.PATH]: 0xd4c4a0,
  [TileType.BUILDING_WALL]: 0x8b7355,
  [TileType.BUILDING_DOOR]: 0xdaa520,
  [TileType.WATER]: 0x4a90d9,
  [TileType.TREE]: 0x2d5a1e,
  [TileType.BENCH]: 0x8b6914,
};

export function isWalkable(tileType: TileType): boolean {
  return (
    tileType === TileType.GRASS ||
    tileType === TileType.GRASS_ALT ||
    tileType === TileType.PATH ||
    tileType === TileType.BUILDING_DOOR
  );
}
