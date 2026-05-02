import type { IPosition, IIdentity, IInventory, EventComponent, TileData, IBody, IBodyModifiers, IFatigue } from '$shared';

export interface EntityDTO {
    id: number;
    position: IPosition;
    identity: IIdentity;
    inventory?: IInventory;
    gameEvents?: EventComponent;
    body: IBody;
    bodyModifiers: IBodyModifiers;
    fatigue: IFatigue;
}

export interface TimeDTO {
    timeOfDay: number;
    isDay: boolean;
    visionRadius: number;

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
    time: TimeDTO;
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
    time: {
        timeOfDay: 0.5,
        isDay: true,
        visionRadius: 3,
    }
});