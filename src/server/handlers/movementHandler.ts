import { Socket } from "socket.io";
import { World } from "../core/World";
import { IPosition, IMovementIntent } from "$shared/components";
import { TileData } from "$shared/types";
import { findEntityByUserId } from "./utils";

export class MovementHandler {
    constructor(private world: World, private map: TileData[]) { }

    register(socket: Socket) {
        socket.on('request_move', (target: { q: number; r: number }) => {
            const entityId = findEntityByUserId(this.world, socket.data.userId);
            if (entityId === undefined) return;

            const existingIntent = this.world.getComponent<IMovementIntent>(entityId, 'MovementIntent');
            if (existingIntent) return;

            const pos = this.world.getComponent<IPosition>(entityId, 'Position');
            if (!pos) return;

            const tile = this.map.find(t => t.q === target.q && t.r === target.r);
            if (!tile || tile.type === 'WATER') return;

            this.world.addComponent<IMovementIntent>(entityId, 'MovementIntent', {
                targetQ: target.q,
                targetR: target.r,
                startedAt: Date.now()
            });
        });
    }
}