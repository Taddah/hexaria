// systems/eventSystem.ts
import { IActionTag, IEventsHistory, EventComponent, IFatigue, EventEffect, EffectType, IInventory, BodyPart, IBody, BodyPartState, ActionType, GameEvent, EventPolarity, IPlayer } from "$shared/components";
import { v4 as uuidv4 } from "uuid";
import { EventRegistry } from "../core/EventRegistry";
import { World } from "../core/World";
import { getThreshold, ThresholdKey } from "./FatigueSystem";
import { NetworkSystem } from "./NetworkSystem";
import { applyNarrative, EventContext, EventNarrative, LLMService } from "../services/LLMservice";

const BASE_EVENT_CHANCE = 1;
const llmService = LLMService.getInstance();

export async function runEventSystem(world: World, network: NetworkSystem): Promise<void> {
    const entitiesWithEvents = world.query(['EventComponent']);
    for (const entity of entitiesWithEvents) {
        const eventComponent = world.getComponent<EventComponent>(entity, 'EventComponent');
        if (!eventComponent) continue;

        for (const gameEvent of eventComponent.events) {
            if (gameEvent.status === 'RESOLVED') {
                if (gameEvent.pendingEffects?.length) {
                    applyEffects(world, entity, gameEvent.pendingEffects);
                    gameEvent.pendingEffects = [];
                }
                gameEvent.status = 'SEEN';
            }
        }
    }

    const entities = world.query(['ActionTag']);

    for (const entity of entities) {
        const action = world.getComponent<IActionTag>(entity, 'ActionTag');
        const history = world.getComponent<IEventsHistory>(entity, 'EventHistory');
        let eventComponent = world.getComponent<EventComponent>(entity, 'EventComponent');

        if (!action) continue;

        if (!eventComponent) {
            world.addComponent(entity, 'EventComponent', { events: [] });
            eventComponent = world.getComponent<EventComponent>(entity, 'EventComponent');
        }

        const fatigue = world.getComponent<IFatigue>(entity, 'Fatigue');
        const threshold = fatigue ? getThreshold(fatigue.fatigue) : 'RESTED';

        if (shouldTriggerEvent(history, action.type, threshold)) {
            const event = pickEvent(action.type);

            if (event && eventComponent) {
                const firstNode = event.nodes[0];

                if (firstNode) {
                    const uuid = uuidv4();

                    const ctx: EventContext = {
                        actionType: action.type,
                        fatigue: 'fatigué',
                        recentActions: history?.history ?? [],
                        polarity: event.polarity,
                        baseTitle: event.title,
                        baseDescription: firstNode.description,
                    };

                    world.removeComponent(entity, 'ActionTag');

                    let narrative: EventNarrative | null = null;
                    try {
                        narrative = await llmService.enrichAllNodes(event, ctx);
                    } catch (e) {
                        console.warn('[LLM] Enrichment failed, using raw text', e);
                    }

                    eventComponent.events.push({
                        uuid,
                        event,
                        status: "PENDING",
                        currentNodeId: firstNode.id,
                        pendingEffects: firstNode.effects ?? [],
                        narrative,
                        visitedPath: []
                    });

                    const player = world.getComponent<IPlayer>(entity, 'Player');
                    if (player?.userId) {
                        network.emitToUser(player.userId, 'event:node', {
                            eventUuid: uuid,
                            node: applyNarrative(firstNode, narrative)
                        });
                    }
                }
            }
        }
    }
}

// ─── Apply Effects ────────────────────────────────────────────────────────────

function applyEffects(world: World, entity: number, effects: EventEffect[]): void {
    for (const effect of effects) {
        switch (effect.type) {
            case EffectType.RESOURCE:
                applyResourceEffect(world, entity, effect.stat, effect.value);
                break;
            case EffectType.BODY:
                applyBodyEffect(world, entity, effect.stat, effect.value);
                break;
        }
    }
}

function applyResourceEffect(world: World, entity: number, stat: string, value: number): void {
    const inventory = world.getComponent<IInventory>(entity, 'Inventory');
    if (!inventory) return;

    const current = (inventory as any)[stat] ?? 0;
    (inventory as any)[stat] = Math.max(0, current + value);
}

function applyBodyEffect(world: World, entity: number, part: BodyPart, delta: number): void {
    const body = world.getComponent<IBody>(entity, 'Body');
    if (!body) return;

    const states = [
        BodyPartState.INTACT,
        BodyPartState.INJURED,
        BodyPartState.HANDICAPPED,
        BodyPartState.LOST,
    ];

    const current = states.indexOf(body[part]);
    const next = Math.min(Math.max(current + delta, 0), states.length - 1);
    const nextState = states[next] as BodyPartState;

    body[part] = nextState;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shouldTriggerEvent(
    history: IEventsHistory | undefined,
    actionType: ActionType,
    threshold: ThresholdKey
): boolean {
    const recentSameActions = history
        ? history.history.slice(-5).filter(a => a.action.includes(actionType)).length
        : 0;

    const fatigueBonus = { RESTED: 0, TIRED: 0.1, EXHAUSTED: 0.2, DONE: 0.35 };

    const chance = BASE_EVENT_CHANCE
        * (1 + recentSameActions * 0.05)   // +5% par action répétée récente
        + fatigueBonus[threshold];

    return Math.random() < chance;
}

function pickEvent(
    actionType: ActionType,
    filter: (EventPolarity | 'all') = 'all'
): GameEvent | undefined {
    const events = EventRegistry.getAll() as GameEvent[];

    const candidates = events
        .filter(e => e.triggers.includes(actionType))
        .filter(e => filter === 'all' || e.polarity === filter)
        .sort(() => Math.random() - 0.5);

    for (const event of candidates) {
        if (Math.random() * 100 < event.probability) {
            return event;
        }
    }

    return undefined;
}
