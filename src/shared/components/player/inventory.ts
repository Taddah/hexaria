import { Resource } from "$shared/types";

export interface IInventory {
    [Resource.WOOD]: number;
    [Resource.STONE]: number;
    [Resource.SILVER]: number;
}
