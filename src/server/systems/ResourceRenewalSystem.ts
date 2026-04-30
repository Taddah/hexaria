import { Resource, TileData } from "$shared/types";

const RENEWAL_RATES: Record<Resource, number> = {
    [Resource.WOOD]: 30_000,
    [Resource.STONE]: 120_000,
    [Resource.SILVER]: 300_000,
};

export function runResourceRenewalSystem(map: TileData[]): TileData[] {
    const now = Date.now();
    const updatedTiles: TileData[] = [];

    for (const tile of map) {
        const res = tile.resource;
        if (!res || res.amount >= res.maxAmount || !res.lastHarvestedAt) continue;

        const elapsed = now - res.lastHarvestedAt;
        const gain = Math.floor(elapsed / RENEWAL_RATES[res.type]);
        if (gain <= 0) continue;

        res.amount = Math.min(res.amount + gain, res.maxAmount);
        res.lastHarvestedAt = now - (elapsed % RENEWAL_RATES[res.type]);
        updatedTiles.push(tile);
    }

    return updatedTiles;
}