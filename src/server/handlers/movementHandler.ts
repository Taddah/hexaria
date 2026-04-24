import { Socket } from "socket.io";
import { World } from "../core/World";
import { IPosition, IEnergy, IMovementIntent } from "$shared/components";
import { TileData } from "$shared/types";
import { findEntityBySocket } from "./utils";

export class MovementHandler {
    constructor(private world: World, private map: TileData[]) { }

    register(socket: Socket) {
        socket.on('request_move', (target: { q: number; r: number }) => {
            const entityId = findEntityBySocket(this.world, socket.id);
            if (entityId === undefined) return;

            const pos = this.world.getComponent<IPosition>(entityId, 'Position');
            if (!pos) return;

            const energy = this.world.getComponent<IEnergy>(entityId, 'Energy');
            if (!energy || energy.current < 1) return;

            const distance =
                (Math.abs(pos.q - target.q) +
                    Math.abs(pos.r - target.r) +
                    Math.abs(pos.q + pos.r - target.q - target.r)) / 2;
            if (distance !== 1) return;

            const tile = this.map.find(t => t.q === target.q && t.r === target.r);
            if (!tile || tile.type === 'WATER') return;

            this.world.addComponent<IMovementIntent>(entityId, 'MovementIntent', {
                targetQ: target.q,
                targetR: target.r
            });
        });
    }
}