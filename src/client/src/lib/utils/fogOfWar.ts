import { exploredTilesStore } from '$lib/stores/gameStore';
import type { TileData } from '$shared';
import { hexDistance } from './hexUtils';

export const VISION_RADIUS = 3;

export function expandFog(playerQ: number, playerR: number, allTiles: TileData[]) {
    const visibleTiles = allTiles
        .filter(tile => hexDistance(playerQ, playerR, tile.q, tile.r) <= VISION_RADIUS)
        .map(tile => `${tile.q},${tile.r}`);

    // 2. Met à jour uniquement les nouvelles tiles explorées
    exploredTilesStore.update(exploredTiles => {
        const currentExplored = new Set(exploredTiles);
        let hasChanged = false;

        visibleTiles.forEach(tile => {
            if (!currentExplored.has(tile)) {
                currentExplored.add(tile);
                hasChanged = true;
            }
        });

        return hasChanged ? Array.from(currentExplored) : exploredTiles;
    });
}