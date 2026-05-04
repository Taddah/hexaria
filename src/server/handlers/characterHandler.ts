import { Socket } from "socket.io";
import { World } from "../core/World";
import { PlayerFactory } from "../factories/PlayerFactory";
import { getWorldState } from "./utils";
import { TileData, TileType } from "$shared/types";

export class CharacterHandler {
    constructor(private world: World, private map: TileData[]) { }

    register(socket: Socket) {
        socket.on('create_character', (data: { firstName: string, lastName: string }) => {
            // Find a river tile to spawn near it
            const riverTiles = this.map.filter(t => t.type.includes('COAST'));
            let startTile = null;

            if (riverTiles.length > 0) {
                // Pick a random river tile
                const randomRiver = riverTiles[Math.floor(Math.random() * riverTiles.length)];
                // Find a LAND neighbor
                const neighbors = this.map.filter(t =>
                    t.type === TileType.LAND &&
                    Math.abs(t.q - randomRiver!.q) <= 1 &&
                    Math.abs(t.r - randomRiver!.r) <= 1 &&
                    Math.abs(-t.q - t.r - (-randomRiver!.q - randomRiver!.r)) <= 1
                );
                if (neighbors.length > 0) {
                    startTile = neighbors[Math.floor(Math.random() * neighbors.length)];
                }
            }

            // Fallback
            if (!startTile) {
                const validTiles = this.map.filter(t => t.type === TileType.LAND || t.type.includes('COAST'));
                startTile = validTiles[Math.floor(Math.random() * validTiles.length)];
            }

            const startPosition = startTile ? { q: startTile.q, r: startTile.r } : { q: 25, r: 25 };

            const playerId = PlayerFactory.create({
                socketId: socket.id,
                world: this.world,
                name: `${data.firstName} ${data.lastName}`,
                age: 0,
                startPosition
            });

            const CHUNK_SIZE = 500;

            for (let i = 0; i < this.map.length; i += CHUNK_SIZE) {
                socket.emit('map_chunk', {
                    tiles: this.map.slice(i, i + CHUNK_SIZE),
                    total: this.map.length,
                    done: i + CHUNK_SIZE >= this.map.length
                });
            }

            socket.emit('world_update', getWorldState(this.world));
            socket.emit('player_init', { entityId: playerId });
        });
    }
}