import { derived, writable } from 'svelte/store';
import type { IPosition, IIdentity, IInventory, IEnergy, GameEvent, EventComponent, Biome, TileData } from '$shared';




export interface EntityDTO {
    id: number;
    position: IPosition;
    identity: IIdentity;
    inventory?: IInventory;
    energy?: IEnergy;
    gameEvents?: EventComponent;
}

export const mapStore = writable<Record<string, TileData>>({});
export const updatedTilesStore = writable<TileData[]>([]);

export const entitiesStore = writable<EntityDTO[]>([]);
export const hexSizeStore = writable<number>(75);
export const selectedHexStore = writable<{ q: number; r: number } | null>(null);
export const myEntityIdStore = writable<number | null>(null);

export const exploredTilesStore = writable<string[]>([]);

export const pathStore = writable<{ q: number, r: number }[]>([]);
export const playerAnimPosition = writable<{ x: number, y: number, z: number } | null>(null);


export const optimizedMapData = derived(
    [mapStore, updatedTilesStore],
    ([$mapStore, $updatedTiles]) => {
        const newMap = { ...$mapStore };
        $updatedTiles.forEach(tile => {
            newMap[`${tile.q},${tile.r}`] = tile;
        });
        return Object.values(newMap);
    }
);