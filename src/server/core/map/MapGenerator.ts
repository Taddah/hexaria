import { createNoise2D } from 'simplex-noise';
import seedrandom from 'seedrandom';
import { TileData, TileType, Biome, HEX_DIRECTIONS } from '$shared/index';
import { CoastGenerator } from './coastGenerator';
import { ResourceGenerator } from './resourceGenerator';
import { DecorationGenerator } from './decorationGenerator';
import { RiverGenerator } from './riverGenerator';

const SEED = "hexaria";
const WATER_THRESHOLD = 0.3;

export class MapGenerator {
  private noise2D = createNoise2D(seedrandom(`${SEED}_elevation`));
  private biomeNoise2D = createNoise2D(seedrandom(`${SEED}_biome`));

  private resourceGenerator = new ResourceGenerator(SEED);
  private decorationGenerator = new DecorationGenerator(SEED);
  private coastGenerator = new CoastGenerator();
  private riverGenerator = new RiverGenerator(SEED);

  generateMap(width: number, height: number): TileData[] {
    let tiles: TileData[] = [];

    for (let q = 0; q < width; q++) {
      for (let r = 0; r < height; r++) {
        const elevation = this.getElevation(q, r);
        const type = elevation < WATER_THRESHOLD ? TileType.WATER : TileType.LAND;
        const biome = this.determineBiome(q, r, elevation);
        const tile: TileData = { q, r, type, elevation, biome };
        const resource = this.resourceGenerator.generate(type, q, r, elevation, biome);
        if (resource !== undefined) tile.resource = resource;
        tiles.push(tile);
      }
    }

    const BORDER = 2;
    for (const tile of tiles) {
      if (tile.q < BORDER || tile.q >= width - BORDER ||
        tile.r < BORDER || tile.r >= height - BORDER) {
        tile.elevation = 0;
        tile.type = TileType.WATER;
        tile.biome = Biome.WATER;
      }
    }

    this.smoothCoastElevation(tiles);

    for (const tile of tiles) {
      tile.type = tile.elevation < WATER_THRESHOLD ? TileType.WATER : TileType.LAND;
      tile.biome = this.determineBiome(tile.q, tile.r, tile.elevation);
      const resource = this.resourceGenerator.generate(tile.type, tile.q, tile.r, tile.elevation, tile.biome);
      if (resource !== undefined) tile.resource = resource;
    }



    tiles = this.coastGenerator.generate(tiles);
    tiles = this.riverGenerator.generate(tiles);
    tiles = this.decorationGenerator.generate(tiles);

    return tiles;
  }

  private getElevation(q: number, r: number): number {
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
    e = Math.max(0, Math.min(e, 1));

    return Math.floor(e * 10) / 10;
  }


  /**
   * BFS depuis l'eau : chaque couche terrestre ne peut pas dépasser
   * (distanceFromWater * MAX_ELEV_PER_LAYER).
   * Garantit une pente douce quelle que soit l'élévation initiale.
   */
  private smoothCoastElevation(tiles: TileData[]): void {
    const MAX_ELEV_PER_LAYER = 0.1; // élévation max autorisée par couche depuis l'eau

    const tileMap = new Map<string, TileData>();
    for (const t of tiles) tileMap.set(`${t.q},${t.r}`, t);

    const getNeighbors = (t: TileData): TileData[] =>
      HEX_DIRECTIONS
        .map(d => tileMap.get(`${t.q + d.q},${t.r + d.r}`))
        .filter(Boolean) as TileData[];

    // BFS depuis toutes les tuiles eau
    const distanceFromWater = new Map<string, number>();
    const queue: TileData[] = [];

    for (const tile of tiles) {
      if (tile.elevation < WATER_THRESHOLD) {
        const key = `${tile.q},${tile.r}`;
        distanceFromWater.set(key, 0);
        queue.push(tile);
      }
    }

    let head = 0;
    while (head < queue.length) {
      const current = queue[head++];
      if (!current) continue;
      const currentDist = distanceFromWater.get(`${current.q},${current.r}`)!;

      for (const neighbor of getNeighbors(current)) {
        const nkey = `${neighbor.q},${neighbor.r}`;
        if (!distanceFromWater.has(nkey)) {
          distanceFromWater.set(nkey, currentDist + 1);
          queue.push(neighbor);
        }
      }
    }



    // Cap l'élévation selon la distance à l'eau
    for (const tile of tiles) {
      if (tile.elevation <= WATER_THRESHOLD) continue;
      const key = `${tile.q},${tile.r}`;
      const dist = distanceFromWater.get(key) ?? 999;

      const FLAT_LAYERS = 1;
      const maxAllowed = dist <= FLAT_LAYERS
        ? WATER_THRESHOLD  // exactement 0.3 = plage plate
        : WATER_THRESHOLD + ((dist - FLAT_LAYERS) * MAX_ELEV_PER_LAYER);
      if (dist <= FLAT_LAYERS) {
        tile.elevation = WATER_THRESHOLD; // niveau plage, pas eau
      } else {


        if (tile.elevation > maxAllowed) {
          tile.elevation = maxAllowed;
        }
      }

      // Re-snap terracing
      tile.elevation = Math.floor(tile.elevation * 10) / 10;
    }

    for (const tile of tiles) {
      if (tile.elevation <= WATER_THRESHOLD) continue;
      const key = `${tile.q},${tile.r}`;
      const dist = distanceFromWater.get(key) ?? 999;

      if (dist === 1 && tile.elevation > WATER_THRESHOLD) {
        console.log(`Tile dist=1 trop haute: ${tile.q},${tile.r} elev=${tile.elevation}`);
      }
    }
  }

  private determineBiome(q: number, r: number, elevation: number): Biome {
    if (elevation < WATER_THRESHOLD) return Biome.WATER;
    if (elevation >= 0.8) return Biome.MOUNTAIN;

    const humidity = (this.biomeNoise2D(q * 0.03, r * 0.03) + 1) / 2;

    if (elevation < 0.5) {
      return humidity < 0.2 ? Biome.DESERT : Biome.PRAIRIE;
    }
    return humidity < 0.4 ? Biome.PRAIRIE : Biome.TAIGA;
  }
}
