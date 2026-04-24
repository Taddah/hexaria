import { Socket } from "socket.io";
import { World } from "../core/World";
import { IPosition, IEnergy, IHarvestIntent } from "$shared/components";
import { findEntityBySocket } from "./utils";
import { TileData } from "$shared/types";

export class HarvestHandler {
    constructor(private world: World, private map: TileData[]) { }

    register(socket: Socket) {
        socket.on('request_harvest', () => {
            const entityId = findEntityBySocket(this.world, socket.id);
            if (entityId === undefined) return;

            const pos = this.world.getComponent<IPosition>(entityId, 'Position');
            if (!pos) return;

            const energy = this.world.getComponent<IEnergy>(entityId, 'Energy');
            if (!energy || energy.current < 1) return;

            const tile = this.map.find(t => t.q === pos.q && t.r === pos.r);
            if (!tile?.resource || tile.resource.amount <= 0) return;

            this.world.addComponent<IHarvestIntent>(entityId, 'HarvestIntent', {
                tileQ: pos.q,
                tileR: pos.r
            });
        });
    }
}