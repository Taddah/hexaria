import { Socket } from "socket.io";
import { World } from "../core/World";
import { EventComponent } from "$shared/components";
import { findEntityByUserId } from "./utils";
import { EventResolutionService } from "../services/EventResolutionService";
import { applyNarrative } from "../services/LLMservice";

export class EventHandler {
    private resolutionService = new EventResolutionService();

    constructor(private world: World) { }

    register(socket: Socket) {

        // ─── Ancien "vu" → remplacé par gestion des choix ────────────────────

        socket.on('event:choice', ({ eventUuid, choiceId }: { eventUuid: string; choiceId: string }) => {
            const entityId = findEntityByUserId(this.world, socket.data.userId);
            if (entityId === undefined) return;

            const component = this.world.getComponent<EventComponent>(entityId, 'EventComponent');
            if (!component || component.events.length === 0) return;

            const targetEvent = component.events.find(e => e.uuid === eventUuid);
            if (!targetEvent) return;

            try {

                if (choiceId === '__confirm__') {
                    targetEvent.status = 'RESOLVED';
                    socket.emit('event:end', { eventUuid });
                    return;
                }

                const { nextNode, effects } = this.resolutionService.resolveChoice(targetEvent, choiceId);

                targetEvent.currentNodeId = nextNode.id;

                const enrichedNode = applyNarrative(nextNode, targetEvent.narrative ?? null);

                if (enrichedNode.choices?.length === 0) {
                    targetEvent.pendingEffects = effects;
                    targetEvent.status = 'PENDING_CONFIRM';
                    socket.emit('event:node', { eventUuid, node: enrichedNode });
                    return;
                }

                socket.emit('event:node', { eventUuid, node: enrichedNode });

            } catch (err) {
                console.error('[EventHandler] event:choice error:', err);
            }
        });

        socket.on('event:poll', () => {
            const entityId = findEntityByUserId(this.world, socket.data.userId);
            if (entityId === undefined) return;

            const component = this.world.getComponent<EventComponent>(entityId, 'EventComponent');
            if (!component) return;

            for (const ev of component.events) {
                if (ev.status === 'PENDING') {
                    const firstNode = ev.event.nodes.find(n => n.id === ev.currentNodeId);
                    if (firstNode) {
                        socket.emit('event:node', { eventUuid: ev.uuid, node: firstNode });
                    }
                }
            }
        });
    }
}
