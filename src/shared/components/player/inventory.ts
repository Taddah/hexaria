import { Resource } from "$shared/types";

export const INVENTORY_COMPONENT = 'InventoryComponent';

export interface InventoryComponent {
    [Resource.WOOD]: number;
    [Resource.STONE]: number;
    [Resource.SILVER]: number;
}
