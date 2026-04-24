import { createNoise2D } from 'simplex-noise';
import seedrandom from 'seedrandom';

const SEED = "storyteller"
export enum TileType {
  WATER = 'WATER',
  LAND = 'LAND',
}

export enum Biome {
  WINTER = "WINTER",
  SUMMER = "SUMMER",
  FALL = "FALL",
  SPRING = "SPRING",
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
  biome: Biome;
  resource?: TileResource;
}

export class MapGenerator {
  private noise2D = createNoise2D();
  private biomeNoise2D = createNoise2D();
  private rng = seedrandom(SEED);

  generateMap(width: number, height: number): HexTile[] {
    const tiles: HexTile[] = [];

    for (let q = 0; q < width; q++) {
      for (let r = 0; r < height; r++) {
        const elevation = this.getFractalNoise(q, r);
        const biome = this.determineBiome(q, r, elevation);
        const type = this.determineTileType(elevation);

        const tile: HexTile = { q, r, type, elevation, biome };
        const resource = this.generateResource(type);
        if (resource !== undefined) tile.resource = resource;
        tiles.push(tile);
      }
    }

    return tiles;
  }

  private getFractalNoise(q: number, r: number): number {
    let total = 0;
    let frequency = 0.025;
    let amplitude = 1;
    let maxValue = 0;


    for (let i = 0; i < 4; i++) {
      total += this.noise2D(q * frequency, r * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.45;
      frequency *= 2.1;
    }

    let e = (total / maxValue + 1) / 2;

    e = e + 0.05;
    e = Math.pow(e, 1.2);

    return Math.max(0, Math.min(e, 1));
  }

  private determineBiome(q: number, r: number, elevation: number): Biome {
    const humidity = (this.biomeNoise2D(q * 0.03, r * 0.03) + 1) / 2;

    if (elevation > 0.70) return Biome.WINTER;

    if (elevation < 0.5) {
      return humidity < 0.35 ? Biome.SUMMER : Biome.FALL;
    }

    return humidity < 0.3 ? Biome.SUMMER : Biome.SPRING;
  }

  private determineTileType(e: number): TileType {
    if (e < 0.3) return TileType.WATER;
    return TileType.LAND;
  }

  private generateResource(type: TileType): TileResource | undefined {
    if (type === TileType.LAND && this.rng() < 0.4) {
      return { type: 'wood', amount: Math.floor(this.rng() * 8) + 3 };
    }
    if (type === TileType.LAND && this.rng() < 0.1) {
      return { type: 'iron', amount: Math.floor(this.rng() * 6) + 2 };
    }
    return undefined;
  }
}
