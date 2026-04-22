import { writable } from 'svelte/store';
import type { IPosition, IAge, IIdentity, IInventory, IEnergy } from '$shared/components';

export interface TileResource {
    type: 'wood' | 'iron';
    amount: number;
}

export interface TileData {
    q: number;
    r: number;
    type: string;
    elevation: number;
    resource?: TileResource;
}

export interface EntityDTO {
    id: number;
    position: IPosition;
    identity: IIdentity;
    age?: IAge;
    inventory?: IInventory;
    energy?: IEnergy;
}

export const mapStore = writable<TileData[]>([]);
export const entitiesStore = writable<EntityDTO[]>([]);
export const hexSizeStore = writable<number>(75);
export const selectedHexStore = writable<{ q: number; r: number } | null>(null);
export const myEntityIdStore = writable<number | null>(null);
