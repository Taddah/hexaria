import { Biome, DecoType, HEX_DIRECTIONS, TileData } from "$shared/types";
import seedrandom from "seedrandom";
import { createNoise2D, NoiseFunction2D } from "simplex-noise";

export class DecorationGenerator {

    private decoNoise2D: NoiseFunction2D | null;
    private rng: seedrandom.PRNG | null = null;

    constructor(seed: string) {
        this.rng = seedrandom(seed);
        this.decoNoise2D = createNoise2D(seedrandom(`${seed}_deco`))
    }


    generate(tiles: TileData[]): TileData[] {
        if (!this.rng || !this.decoNoise2D) return tiles;

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
        return tiles;
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
}