import type { TileData } from "$shared";
import { Biome } from "$shared";

const TEXTURES: Record<Biome, string> = {
    [Biome.TAIGA]: '/assets/models/tiles/base/hexagons_medieval_Summer.png',
    [Biome.MOUNTAIN]: '/assets/models/tiles/base/hexagons_medieval_Winter.png',
    [Biome.DESERT]: '/assets/models/tiles/base/hexagons_medieval_Fall.png',
    [Biome.PRAIRIE]: '/assets/models/tiles/base/hexagons_medieval.png',
    [Biome.WATER]: '/assets/models/tiles/base/hexagons_medieval.png'
}

export function getTopAssetPath(type: TileData): string {
    switch (type.type) {
        case 'WATER':
            return '/assets/models/tiles/base/hex_water.gltf';
        case 'LAND':
            return '/assets/models/tiles/base/hex_grass.gltf';
        default:
            return '/assets/models/tiles/base/hex_grass.gltf';
    }
}

export function getBottomAssetPath(type: TileData): string {
    switch (type.type) {
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
