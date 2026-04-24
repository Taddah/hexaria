export interface TileData {
    q: number;
    r: number;
    type: TileType;
    elevation: number;
    biome: Biome;
    resource?: TileResource;
}


export enum TileType {
    WATER = 'WATER',
    LAND = 'LAND',
}

export enum Biome {
    WINTER = "WINTER",
    SUMMER = "SUMMER",
    FALL = "FALL",
    SPRING = "SPRING",
}

export type ResourceType = 'wood' | 'iron';

export interface TileResource {
    type: ResourceType;
    amount: number;
}