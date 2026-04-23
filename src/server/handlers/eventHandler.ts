import { Socket } from "socket.io";
import { World } from "../core/World";
import { EventComponent } from "$shared/components";
import { findEntityBySocket } from "./utils";

export class EventHandler {
    constructor(private world: World) { }

    register(socket: Socket) {
        socket.on('event_response', (eventUuid: string) => {
            const entityId = findEntityBySocket(this.world, socket.id);
            if (entityId === undefined) return;

            const event = this.world.getComponent<EventComponent>(entityId, 'EventComponent');
            if (!event || event.events.length === 0) return;

            const targetEvent = event.events.find(e => e.uuid === eventUuid);
            if (!targetEvent) return;

            targetEvent.status = "SEEN";
        });
    }
}