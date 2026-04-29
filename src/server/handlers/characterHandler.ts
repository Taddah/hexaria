import { Socket } from "socket.io";
import { World } from "../core/World";
import { PlayerFactory } from "../factories/PlayerFactory";
import { getWorldState } from "./utils";
import { TileData } from "$shared/types";

export class CharacterHandler {
    constructor(private world: World, private map: TileData[]) { }

    register(socket: Socket) {
        socket.on('create_character', (data: { firstName: string, lastName: string }) => {
            const playerId = PlayerFactory.create({
                socketId: socket.id,
                world: this.world,
                name: `${data.firstName} ${data.lastName}`,
                age: 0
            });

            socket.emit('full_map', this.map);
            socket.emit('world_update', getWorldState(this.world));
            socket.emit('player_init', { entityId: playerId });
        });
    }
}