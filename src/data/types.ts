export interface Position {
  x: number;
  y: number;
}

export interface NPCData {
  id: string;
  name: string;
  color: number;
  position: Position;
  dialogue: string[];
  problem: ProblemData;
}

export interface ProblemData {
  id: string;
  title: string;
  summary: string;
  npcName: string;
  location: string;
}

export interface DiscoveredProblem extends ProblemData {
  discoveredAt: number;
}

export enum TileType {
  GRASS = 0,
  GRASS_ALT = 1,
  PATH = 2,
  BUILDING_WALL = 3,
  BUILDING_DOOR = 4,
  WATER = 5,
  TREE = 6,
  BENCH = 7,
}

export interface GameState {
  discoveredProblems: DiscoveredProblem[];
  chosenProblem: DiscoveredProblem | null;
  playerPosition: Position;
}
