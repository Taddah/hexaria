import { Biome, Resource, TileResource, TileType } from "$shared/types";
import seedrandom from "seedrandom";
import { createNoise2D, NoiseFunction2D } from "simplex-noise";

export class ResourceGenerator {
    private forestNoise2D: NoiseFunction2D | null;
    private stoneNoise2D: NoiseFunction2D | null;
    private silverNoise2D: NoiseFunction2D | null;
    private rng: seedrandom.PRNG | null = null;

    constructor(seed: string) {
        this.rng = seedrandom(seed);
        this.forestNoise2D = createNoise2D(seedrandom(`${seed}_forest`));
        this.stoneNoise2D = createNoise2D(seedrandom(`${seed}_stone`));
        this.silverNoise2D = createNoise2D(seedrandom(`${seed}_silver`));
    }

    generate(type: TileType, q: number, r: number, elevation: number, biome: Biome): TileResource | undefined {
        if (type !== TileType.LAND || !this.forestNoise2D || !this.stoneNoise2D || !this.silverNoise2D || !this.rng) return undefined;

        const forestValue = (this.forestNoise2D(q * 0.08, r * 0.15) + 1) / 2;
        const allowedForestBiomes = [Biome.PRAIRIE, Biome.TAIGA];
        const allowedMountainForest = biome === Biome.MOUNTAIN && elevation < 0.8;
        if (forestValue > 0.65 && (allowedForestBiomes.includes(biome) || allowedMountainForest)) {
            const amount = Math.floor(2 + (forestValue - 0.65) / 0.35 * 8);
            return { type: Resource.WOOD, amount, maxAmount: amount };
        }

        const stoneValue = (this.stoneNoise2D(q * 0.4, r * 0.4) + 1) / 2;
        if (biome === Biome.MOUNTAIN && elevation > 0.65 && stoneValue > 0.72) {
            const amount = Math.floor(2 + (stoneValue - 0.72) / 0.28 * 6);
            return { type: Resource.STONE, amount, maxAmount: amount };
        }

        const silverValue = (this.silverNoise2D(q * 0.7, r * 0.7) + 1) / 2;
        const allowedSilverBiomes = [Biome.MOUNTAIN, Biome.TAIGA];
        if (allowedSilverBiomes.includes(biome) && silverValue > 0.88) {
            const amount = Math.floor(1 + (silverValue - 0.88) / 0.12 * 3);
            return { type: Resource.SILVER, amount, maxAmount: amount };
        }

        return undefined;
    }
}