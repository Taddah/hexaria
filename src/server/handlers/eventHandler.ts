import { Socket } from "socket.io";
import { World } from "../core/World";
import { EVENT_COMPONENT, EventComponent, EventHistory, EVENTS_HISTORY_COMPONENT, EventsHistoryComponent } from "$shared/components";
import { findEntityByUserId } from "./utils";
import { EventResolutionService } from "../services/EventResolutionService";
import { applyNarrative, LLMService } from "../services/LLMservice";

export class EventHandler {
    private resolutionService = new EventResolutionService();
    private llmService = LLMService.getInstance();

    constructor(private world: World) { }

    register(socket: Socket) {

        // ─── Ancien "vu" → remplacé par gestion des choix ────────────────────

        socket.on('event:choice', ({ eventUuid, choiceId }: { eventUuid: string; choiceId: string }) => {
            const entityId = findEntityByUserId(this.world, socket.data.userId);
            if (entityId === undefined) return;

            const component = this.world.getComponent<EventComponent>(entityId, EVENT_COMPONENT);
            if (!component || component.events.length === 0) return;

            const targetEvent = component.events.find(e => e.uuid === eventUuid);
            if (!targetEvent) return;

            try {

                if (choiceId === '__confirm__') {
                    targetEvent.status = 'RESOLVED';
                    socket.emit('event:end', { eventUuid });

                    // Collecter les données avant nettoyage
                    const visitedPath = [...targetEvent.visitedPath];
                    const appliedEffects = [...targetEvent.pendingEffects];
                    const eventName = targetEvent.event.title;
                    const action = targetEvent.event.triggers;

                    component.events = component.events.filter(e => e.uuid !== eventUuid);

                    const worldEntity = this.world.getFirst(['WorldComponent']);
                    let currentYear = 0;
                    if (worldEntity !== undefined) {
                        const worldComp = this.world.getComponent<any>(worldEntity, 'WorldComponent');
                        if (worldComp) {
                            currentYear = worldComp.year;
                        }
                    }

                    // Background — non bloquant
                    (async () => {
                        const narrative = await this.llmService.generateEventSummary({
                            eventName,
                            action,
                            visitedPath,
                            appliedEffects,
                        });

                        const historyEntry: EventHistory = {
                            eventName,
                            action,
                            eventNarrative: narrative,
                            isSignificant: appliedEffects.length > 0,
                            timestamp: Date.now(),
                            year: currentYear,
                            hadEvent: true,
                        };

                        const historyComponent = this.world.getComponent<EventsHistoryComponent>(entityId, EVENTS_HISTORY_COMPONENT);
                        historyComponent?.history.push(historyEntry);

                        socket.emit('event:history_updated', historyEntry);

                    })();
                    return;
                }

                const { nextNode, effects, choiceLabel } = this.resolutionService.resolveChoice(targetEvent, choiceId);

                targetEvent.visitedPath.push({
                    nodeId: targetEvent.currentNodeId,  // ancien node
                    choiceId,
                    choiceLabel,
                });

                targetEvent.currentNodeId = nextNode.id;

                const enrichedNode = applyNarrative(nextNode, targetEvent.narrative ?? null);

                if (enrichedNode.choices?.length === 0) {
                    targetEvent.pendingEffects.push(...effects);
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
