import { HEX_DIRECTIONS, TileData, TileType } from "$shared/types";

const COAST_TYPE: Record<number, TileType> = {
    1: TileType.COAST_1,
    2: TileType.COAST_2,
    3: TileType.COAST_3,
    4: TileType.COAST_4,
};

const COAST_ROTATION_OFFSET: Record<number, number> = {
    1: 1,
    2: 2,
    3: 2,
    4: 2,
};

export function applyCoastPass(tiles: TileData[]): void {
    const tileMap = new Map<string, TileData>(
        tiles.map(t => [`${t.q},${t.r}`, t])
    );

    const getNeighbor = (tile: TileData, dirIndex: number) =>
        tileMap.get(`${tile.q + HEX_DIRECTIONS[dirIndex]!.q},${tile.r + HEX_DIRECTIONS[dirIndex]!.r}`);

    for (const tile of tiles) {
        if (tile.type !== TileType.LAND || tile.elevation > 0.5) continue;

        const waterDirs = HEX_DIRECTIONS
            .map((_, i) => i)
            .filter(i => {
                const neighbor = getNeighbor(tile, i);
                return !neighbor || neighbor.type === TileType.WATER;
            });

        if (waterDirs.length === 0) continue;

        const { start, count, isContiguous } = findConsecutiveWaterGroup(waterDirs);

        if (!isContiguous) {
            if (waterDirs.length >= 3) tile.type = TileType.WATER;
            continue;
        }

        tile.type = COAST_TYPE[count] ?? TileType.COAST_4;
        if (tile.resource) delete tile.resource;
        tile.coastRotation = (start + (COAST_ROTATION_OFFSET[count] ?? 0)) % 6;
    }
}

function findConsecutiveWaterGroup(waterDirs: number[]): {
    start: number;
    count: number;
    isContiguous: boolean;
} {
    const set = new Set(waterDirs);
    const start = waterDirs.find(d => !set.has((d + 5) % 6)) ?? waterDirs[0] ?? 0;

    const isContiguous = Array.from({ length: waterDirs.length }, (_, i) => (start + i) % 6)
        .every(d => set.has(d));

    return { start, count: waterDirs.length, isContiguous };
}
