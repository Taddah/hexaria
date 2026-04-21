import { createNoise2D } from 'simplex-noise';

export enum TileType {
  WATER = 'WATER',
  PLAINS = 'PLAINS',
  FOREST = 'FOREST',
  MOUNTAIN = 'MOUNTAIN'
}

export interface HexTile {
  q: number;
  r: number;
  type: TileType;
  elevation: number;
}

export class MapGenerator {
  private noise2D = createNoise2D();

  generateMap(width: number, height: number): HexTile[] {
    const tiles: HexTile[] = [];
    const scale = 0.1;

    for (let q = 0; q < width; q++) {
      for (let r = 0; r < height; r++) {
        const noiseValue = this.noise2D(q * scale, r * scale);
        const elevation = (noiseValue + 1) / 2;

        tiles.push({
          q,
          r,
          type: this.determineTileType(elevation),
          elevation
        });
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
}
