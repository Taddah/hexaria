import { createNoise2D } from 'simplex-noise';
import seedrandom from 'seedrandom';
import { TileData, TileType, Biome, TileResource } from '$shared/index';

const SEED = "storyteller"

export class MapGenerator {
  private noise2D = createNoise2D();
  private biomeNoise2D = createNoise2D();
  private forestNoise2D = createNoise2D();
  private rng = seedrandom(SEED);

  generateMap(width: number, height: number): TileData[] {
    const tiles: TileData[] = [];

    for (let q = 0; q < width; q++) {
      for (let r = 0; r < height; r++) {
        const elevation = this.getFractalNoise(q, r);
        const type = this.determineTileType(elevation);
        const biome = this.determineBiome(q, r, elevation);


        const tile: TileData = { q, r, type, elevation, biome };
        const resource = this.generateResource(type, q, r, elevation, biome);
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
    if (elevation < 0.3) return Biome.WATER;

    const humidity = (this.biomeNoise2D(q * 0.03, r * 0.03) + 1) / 2;

    if (elevation > 0.70) return Biome.MOUNTAIN;

    if (elevation < 0.5) {
      return humidity < 0.35 ? Biome.PRAIRIE : Biome.DESERT;
    }

    return humidity < 0.3 ? Biome.PRAIRIE : Biome.TAIGA;
  }

  private determineTileType(e: number): TileType {
    if (e < 0.3) return TileType.WATER;
    return TileType.LAND;
  }

  private generateResource(type: TileType, q: number, r: number, elevation: number, biome: Biome): TileResource | undefined {
    if (type !== TileType.LAND) return undefined;

    const forestValue = (this.forestNoise2D(q * 0.08, r * 0.15) + 1) / 2;
    const allowedForestBiomes = [Biome.PRAIRIE, Biome.TAIGA];
    const allowedMountainForest = biome === Biome.MOUNTAIN && elevation < 0.8;

    if (forestValue > 0.65 && (allowedForestBiomes.includes(biome) || allowedMountainForest)) {
      const amount = Math.floor(2 + (forestValue - 0.65) / 0.35 * 8);
      return { type: 'wood', amount };
    }

    if (elevation > 0.65 && this.rng() < 0.15) {
      return { type: 'iron', amount: Math.floor(this.rng() * 6) + 2 };
    }

    return undefined;
  }
}
