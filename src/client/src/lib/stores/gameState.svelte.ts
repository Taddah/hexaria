import type { IPosition, IIdentity, IInventory, IEnergy, EventComponent, TileData } from '$shared';

export interface EntityDTO {
    id: number;
    position: IPosition;
    identity: IIdentity;
    inventory?: IInventory;
    energy?: IEnergy;
    gameEvents?: EventComponent;
}

interface GameState {
    selectedHex: TileData | null;
    localPlayer: EntityDTO | null;
    exploredTiles: string[];
    path: { q: number, r: number }[];
    playerAnimPosition: { x: number, y: number, z: number } | null;
    map: Record<string, TileData>;
    updatedTiles: TileData[];
    entities: EntityDTO[];
    hexSize: number;
}

export const gameState = $state<GameState>({
    selectedHex: null,
    localPlayer: null,
    exploredTiles: [],
    path: [],
    playerAnimPosition: null,
    map: {},
    updatedTiles: [],
    entities: [],
    hexSize: 75,
});