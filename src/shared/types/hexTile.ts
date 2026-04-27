export interface TileData {
    q: number;
    r: number;
    type: TileType;
    elevation: number;
    biome: Biome;
    resource?: TileResource;
    coastRotation?: number;
}


export enum TileType {
    WATER = 'WATER',
    LAND = 'LAND',
    COAST_1 = 'COAST_1',
    COAST_2 = 'COAST_2',
    COAST_3 = 'COAST_3',
    COAST_4 = 'COAST_4',
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

export type ResourceType = 'wood' | 'iron';

export interface TileResource {
    type: ResourceType;
    amount: number;
}