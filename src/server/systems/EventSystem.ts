// systems/eventSystem.ts
import { IActionTag, IEventsHistory, EventComponent, EventEffect, EffectType, IInventory, BodyPart, IBody, BodyPartState, ActionType, GameEvent, EventPolarity } from "$shared/components";
import { v4 as uuidv4 } from "uuid";
import { EventRegistry } from "../core/EventRegistry";
import { World } from "../core/World";

const BASE_EVENT_CHANCE = 0.3;

export function runEventSystem(world: World): void {
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

        if (shouldTriggerEvent(history)) {
            const event = pickEvent(action.type);
            if (event && eventComponent) {
                eventComponent.events.push({
                    uuid: uuidv4(),
                    event,
                    status: "PENDING",
                    appliedAt: Date.now()
                });

                applyEffects(world, entity, event.effects);

                world.addComponent(entity, 'EventHistory',
                    history
                        ? { history: [...history.history, action.type].slice(-20) }
                        : { history: [action.type] }
                );
            }
        }

        world.removeComponent(entity, 'ActionTag');
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

    console.log("apply effect", body[part], body, part, delta)

    const current = states.indexOf(body[part]);
    const next = Math.min(Math.max(current + delta, 0), states.length - 1);
    const nextState = states[next] as BodyPartState;

    console.log("next state", nextState)
    body[part] = nextState;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shouldTriggerEvent(history: IEventsHistory | undefined): boolean {
    const recentSameActions = history ? history.history.slice(-5).length : 0;
    const chance = BASE_EVENT_CHANCE * (1 - recentSameActions * 0.01);
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
