import { createNoise2D } from 'simplex-noise';
import seedrandom from 'seedrandom';
import { TileData, TileType, Biome, TileResource, HEX_DIRECTIONS, DecoType } from '$shared/index';
import { applyCoastPass } from './coastGenerator';

const SEED = "storyteller"

export class MapGenerator {
  private rng = seedrandom(SEED);
  private noise2D = createNoise2D(seedrandom(`${SEED}_elevation`));
  private biomeNoise2D = createNoise2D(seedrandom(`${SEED}_biome`));
  private forestNoise2D = createNoise2D(seedrandom(`${SEED}_forest`));
  private decoNoise2D = createNoise2D(seedrandom(`${SEED}_deco`))


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

    //applySlopeInfo(tiles);
    applyCoastPass(tiles);
    this.applyDecorationZones(tiles);

    return tiles;
  }

  private applyDecorationZones(tiles: TileData[]): void {
    const tileMap = new Map(tiles.map(t => [`${t.q},${t.r}`, t]));

    for (const tile of tiles) {
      if (tile.type === 'WATER' || tile.resource) continue;

      const decoValue = (this.decoNoise2D(tile.q * 0.5, tile.r * 0.5) + 1) / 2;
      const type = this.getDecoType(decoValue, tile.biome);

      if (type === DecoType.EMPTY) continue; // ← ne pas assigner

      tile.decoZone = { density: decoValue, type };
    }

    for (const tile of tiles) {
      if (tile.decoZone?.type !== DecoType.DENSE) continue;

      const hasAdjacentDense = HEX_DIRECTIONS.some(dir => {
        const neighbor = tileMap.get(`${tile.q + dir.q},${tile.r + dir.r}`);
        return neighbor?.decoZone?.type === DecoType.DENSE;
      });

      if (hasAdjacentDense) tile.decoZone!.type = DecoType.SPARSE;
    }

    const empty = tiles.filter(t => !t.decoZone).length;
    const total = tiles.filter(t => t.type !== 'WATER').length;

  }


  private getDecoType(density: number, biome: Biome): DecoType {

    if (biome === Biome.MOUNTAIN) {
      if (density < 0.6) return DecoType.EMPTY;
      if (density < 0.7) return DecoType.SPARSE;
      if (density < 0.8) return DecoType.MEDIUM;
      return DecoType.DENSE;
    }
    if (density < 0.7) return DecoType.EMPTY;
    if (density < 0.8) return DecoType.SPARSE;
    if (density < 0.9) return DecoType.MEDIUM;
    return DecoType.DENSE;
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
