import { Socket } from "socket.io";
import { World } from "../core/World";
import { PositionComponent, POSITION_COMPONENT, HarvestIntentComponent, HARVEST_INTENT_COMPONENT } from "$shared/components";
import { findEntityByUserId } from "./utils";
import { TileData } from "$shared/types";

export class HarvestHandler {
    constructor(private world: World, private map: TileData[]) { }

    register(socket: Socket) {
        socket.on('request_harvest', () => {
            const entityId = findEntityByUserId(this.world, socket.data.userId);
            if (entityId === undefined) return;


            const pos = this.world.getComponent<PositionComponent>(entityId, POSITION_COMPONENT);
            if (!pos) return;

            const tile = this.map.find(t => t.q === pos.q && t.r === pos.r);
            if (!tile?.resource || tile.resource.amount <= 0) return;

            this.world.addComponent<HarvestIntentComponent>(entityId, HARVEST_INTENT_COMPONENT, {
                tileQ: pos.q,
                tileR: pos.r
            });
        });
    }
}