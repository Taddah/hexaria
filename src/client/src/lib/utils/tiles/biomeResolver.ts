import type { TileData } from "$shared";

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
        case 'SLOPE':
            return '/assets/models/tiles/base/hex_grass_sloped_low.gltf'
        case 'RIVER_STRAIGHT':
            return '/assets/models/tiles/rivers/hex_river_A.gltf'
        case 'RIVER_CURVY':
            return '/assets/models/tiles/rivers/hex_river_A_curvy.gltf'
        case 'RIVER_B':
            return '/assets/models/tiles/rivers/hex_river_B.gltf'
        case 'RIVER_C':
            return '/assets/models/tiles/rivers/hex_river_C.gltf'
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

