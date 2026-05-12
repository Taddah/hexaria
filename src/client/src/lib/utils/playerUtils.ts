import { type EntityDTO } from "$lib/stores/gameState.svelte";
import type { TileData } from "$shared";

export function getPlayerTile(player: EntityDTO | null, map: Record<string, TileData>): TileData | null {
    if (!player) return null;
    return map[`${player.position.q},${player.position.r}`] ?? null;
}

export function getPlayersOnCurrentTile(player: EntityDTO | null, players: EntityDTO[]): EntityDTO[] {
    if (!player) return [];
    return players.filter((p) => p.position.q === player.position.q && p.position.r === player.position.r && p.id !== player.id);
}
