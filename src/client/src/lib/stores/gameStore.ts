import { writable } from 'svelte/store';
import type { IPosition, IIdentity, IInventory, IEnergy, GameEvent, EventComponent } from '$shared';

export interface TileResource {
    type: 'wood' | 'iron';
    amount: number;
}

export interface TileData {
    q: number;
    r: number;
    type: string;
    elevation: number;
    biome: string;
    resource?: TileResource;
}

export interface EntityDTO {
    id: number;
    position: IPosition;
    identity: IIdentity;
    inventory?: IInventory;
    energy?: IEnergy;
    gameEvents?: EventComponent;
}

export const mapStore = writable<Record<string, TileData>>({});
export const entitiesStore = writable<EntityDTO[]>([]);
export const hexSizeStore = writable<number>(75);
export const selectedHexStore = writable<{ q: number; r: number } | null>(null);
export const myEntityIdStore = writable<number | null>(null);
