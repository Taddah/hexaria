import { gameState } from '$lib/stores/gameState.svelte';
import type { TileData } from '$shared';
import { hexDistance } from './hexUtils';

export const VISION_RADIUS = 3;

export function expandFog(playerQ: number, playerR: number, allTiles: TileData[]) {
    const visibleTiles = allTiles
        .filter(tile => hexDistance(playerQ, playerR, tile.q, tile.r) <= VISION_RADIUS)
        .map(tile => `${tile.q},${tile.r}`);

    const currentExplored = new Set(gameState.exploredTiles);
    let hasChanged = false;

    visibleTiles.forEach(tile => {
        if (!currentExplored.has(tile)) {
            currentExplored.add(tile);
            hasChanged = true;
        }
    });

    if (hasChanged) gameState.exploredTiles = Array.from(currentExplored);
}