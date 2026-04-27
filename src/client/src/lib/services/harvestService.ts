import type { TileData } from "$shared";
import type { Socket } from "socket.io-client";


export function requestHarvest(socket: Socket, playerTile: TileData | null | undefined) {
    const canHarvest = !!playerTile?.resource && (playerTile.resource.amount ?? 0) > 0;

    if (canHarvest) {
        socket.emit('request_harvest');
    }
}