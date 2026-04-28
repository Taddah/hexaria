import { Biome, type TileData } from "$shared";

const TEXTURES: Record<Biome, string> = {
    [Biome.TAIGA]: '/assets/textures/taiga.png',
    [Biome.MOUNTAIN]: '/assets/textures/mountain.png',
    [Biome.DESERT]: '/assets/textures/desert.png',
    [Biome.PRAIRIE]: '/assets/textures/hexagons_medieval.png',
    [Biome.WATER]: '/assets/textures/hexagons_medieval.png'
}

export function getMaterial(tile: TileData): string {
    if (tile.biome === Biome.WATER) return TEXTURES[Biome.WATER];
    return TEXTURES[tile.biome];
}