import { Socket } from "socket.io";
import { World } from "../core/World";
import { MovementIntentComponent, MOVEMENT_INTENT_COMPONENT, POSITION_COMPONENT, PositionComponent, TRADE_TAG_COMPONENT, TradeTagComponent } from "$shared/components";
import { TileData } from "$shared/types";
import { findEntityByUserId } from "./utils";
import { cancelSession } from "./tradeHandler";
import { PlayerRegistry } from "../core/PlayerRegistry";

export class MovementHandler {
    constructor(private world: World, private map: TileData[], private registry: PlayerRegistry) { }

    register(socket: Socket) {
        socket.on('request_move', (target: { q: number; r: number }) => {
            const entityId = findEntityByUserId(this.world, socket.data.userId);
            if (entityId === undefined) return;

            const existingIntent = this.world.getComponent<MovementIntentComponent>(entityId, MOVEMENT_INTENT_COMPONENT);
            if (existingIntent) return;

            const pos = this.world.getComponent<PositionComponent>(entityId, POSITION_COMPONENT);
            if (!pos) return;

            const tile = this.map.find(t => t.q === target.q && t.r === target.r);
            if (!tile || tile.type === 'WATER') return;

            const tradeTag = this.world.getComponent<TradeTagComponent>(entityId, TRADE_TAG_COMPONENT)
            if (tradeTag) {
                cancelSession(this.world, this.registry, tradeTag.sessionEntity, 'PLAYER_MOVED')
                this.world.removeComponent(entityId, MOVEMENT_INTENT_COMPONENT)
                return
            }

            this.world.addComponent<MovementIntentComponent>(entityId, MOVEMENT_INTENT_COMPONENT, {
                targetQ: target.q,
                targetR: target.r,
                startedAt: Date.now()
            });
        });
    }
}