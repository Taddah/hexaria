import { writable } from 'svelte/store';
import type { IPosition, IAge, IIdentity, IInventory } from '$shared/components';

export interface TileData {
    q: number;
    r: number;
    type: string;
    elevation: number;
}

export interface EntityDTO {
    id: number;
    position: IPosition;
    identity: IIdentity;
    age?: IAge;
    inventory?: IInventory;
}

export const mapStore = writable<TileData[]>([]);
export const entitiesStore = writable<EntityDTO[]>([]);
export const hexSizeStore = writable<number>(75);
export const selectedHexStore = writable<{ q: number; r: number } | null>(null);
