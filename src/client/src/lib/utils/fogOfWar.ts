import { hexDistance } from './hexUtils';

export const VISION_RADIUS = 3;

export const exploredTiles = new Set<string>();

export function expandFog(
    playerQ: number,
    playerR: number,
    allTiles: Array<{ q: number; r: number }>
): void {
    for (const tile of allTiles) {
        if (hexDistance(playerQ, playerR, tile.q, tile.r) <= VISION_RADIUS) {
            exploredTiles.add(`${tile.q},${tile.r}`);
        }
    }
}
