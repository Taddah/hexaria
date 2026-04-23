import { createNoise2D } from 'simplex-noise';

export enum TileType {
  WATER = 'WATER',
  PLAINS = 'PLAINS',
  FOREST = 'FOREST',
  MOUNTAIN = 'MOUNTAIN'
}

export type ResourceType = 'wood' | 'iron';

export interface TileResource {
  type: ResourceType;
  amount: number;
}

export interface HexTile {
  q: number;
  r: number;
  type: TileType;
  elevation: number;
  resource?: TileResource;
}

export class MapGenerator {
  private noise2D = createNoise2D();

  generateMap(width: number, height: number): HexTile[] {
    const tiles: HexTile[] = [];
    const scale = 0.05;

    for (let q = 0; q < width; q++) {
      for (let r = 0; r < height; r++) {
        const noiseValue = this.noise2D(q * scale, r * scale);
        const elevation = (noiseValue + 1) / 2;
        const type = this.determineTileType(elevation);

        const tile: HexTile = { q, r, type, elevation };
        const resource = this.generateResource(type);
        if (resource !== undefined) tile.resource = resource;
        tiles.push(tile);
      }
    }

    return tiles;
  }

  private determineTileType(elevation: number): TileType {
    if (elevation < 0.3) return TileType.WATER;
    if (elevation < 0.6) return TileType.PLAINS;
    if (elevation < 0.8) return TileType.FOREST;
    return TileType.MOUNTAIN;
  }

  private generateResource(type: TileType): TileResource | undefined {
    if (type === TileType.FOREST && Math.random() < 0.4) {
      return { type: 'wood', amount: Math.floor(Math.random() * 8) + 3 };
    }
    if (type === TileType.MOUNTAIN && Math.random() < 0.3) {
      return { type: 'iron', amount: Math.floor(Math.random() * 6) + 2 };
    }
    return undefined;
  }
}
