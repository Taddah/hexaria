import type { TileData } from "$lib/stores/gameStore";

const TEXTURES: Record<string, string> = {
    SUMMER: '/assets/models/tiles/base/hexagons_medieval_Summer.png',
    WINTER: '/assets/models/tiles/base/hexagons_medieval_Winter.png',
    FALL: '/assets/models/tiles/base/hexagons_medieval_Fall.png',
    SPRING: '/assets/models/tiles/base/hexagons_medieval.png',
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
        case 'WATER':
            return '/assets/models/tiles/base/hex_grass_bottom.gltf';
        case 'LAND':
            return '/assets/models/tiles/base/hex_grass_bottom.gltf';
        default:
            return '/assets/models/tiles/base/hex_grass_bottom.gltf';
    }
}

export function getMaterial(tile: TileData): string {
    if (tile.type === 'WATER') return TEXTURES.SPRING;
    return TEXTURES[tile.biome];
}
