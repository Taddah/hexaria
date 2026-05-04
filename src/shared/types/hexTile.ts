export interface TileData {
    q: number;
    r: number;
    type: TileType;
    elevation: number;
    biome: Biome;
    resource?: TileResource;
    coastRotation?: number;
    slopeRotation?: number;
    slope?: {
        directionIndex: number;
        goesUp: boolean;
    }
    decoZone?: {
        density: number;
        type: DecoType;
    }
    riverRotation?: number;
    riverScaleX?: number;
}

export enum DecoType {
    EMPTY = 'EMPTY',
    SPARSE = 'SPARSE',
    MEDIUM = 'MEDIUM',
    DENSE = 'DENSE'
}

export enum TileType {
    WATER = 'WATER',
    LAND = 'LAND',
    COAST_1 = 'COAST_1',
    COAST_2 = 'COAST_2',
    COAST_3 = 'COAST_3',
    COAST_4 = 'COAST_4',
    SLOPE = 'SLOPE',
    RIVER_STRAIGHT = 'RIVER_STRAIGHT',
    RIVER_CURVY = 'RIVER_CURVY',
    RIVER_B = 'RIVER_B',
    RIVER_END = 'RIVER_END'
}

export const HEX_DIRECTIONS = [
    { q: 1, r: 0 },  // dir 0 — référence
    { q: 1, r: -1 },  // dir 1
    { q: 0, r: -1 },  // dir 2
    { q: -1, r: 0 },  // dir 3
    { q: -1, r: 1 },  // dir 4
    { q: 0, r: 1 },  // dir 5
]


export enum Biome {
    WATER = "WATER",
    MOUNTAIN = "MOUNTAIN",
    DESERT = "DESERT",
    TAIGA = "TAIGA",
    PRAIRIE = "PRAIRIE",
}

export enum Resource {
    WOOD = 'wood',
    STONE = 'stone',
    SILVER = 'silver'
}

export interface TileResource {
    type: Resource;
    amount: number;
    maxAmount: number;
    lastHarvestedAt?: number;
}