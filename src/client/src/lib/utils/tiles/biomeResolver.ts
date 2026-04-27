import type { TileData } from "$shared";
import { Biome } from "$shared";

const TEXTURES: Record<Biome, string> = {
    [Biome.TAIGA]: '/assets/models/tiles/base/taiga.png',
    [Biome.MOUNTAIN]: '/assets/models/tiles/base/montain.png',
    [Biome.DESERT]: '/assets/models/tiles/base/desert.png',
    [Biome.PRAIRIE]: '/assets/models/tiles/base/prairie.png',
    [Biome.WATER]: '/assets/models/tiles/base/prairie.png'
}

export function getTopAssetPath(tileData: TileData): string {
    switch (tileData.type) {
        case 'WATER':
            return '/assets/models/tiles/base/hex_water.gltf';
        case 'LAND':
            return '/assets/models/tiles/base/hex_grass.gltf';
        case 'COAST_1':
            return '/assets/models/tiles/coast/hex_coast_A.gltf'
        case 'COAST_2':
            return '/assets/models/tiles/coast/hex_coast_B.gltf'
        case 'COAST_3':
            return '/assets/models/tiles/coast/hex_coast_C.gltf'
        case 'COAST_4':
            return '/assets/models/tiles/coast/hex_coast_D.gltf'
        default:
            return '/assets/models/tiles/base/hex_grass.gltf';
    }
}

export function getBottomAssetPath(tileData: TileData): string {
    switch (tileData.type) {
        case 'LAND':
            return '/assets/models/tiles/base/hex_grass_bottom.gltf';
        default:
            return '/assets/models/tiles/base/hex_grass_bottom.gltf';
    }
}

export function getMaterial(tile: TileData): string {
    if (tile.biome === Biome.WATER) return TEXTURES[Biome.WATER];
    return TEXTURES[tile.biome];
}
