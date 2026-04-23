import { World } from "../core/World";
import { ActionType, EventComponent, GameEvent, IActionTag, IEventsHistory } from "$shared";
import { EventRegistry } from "../core/EventRegistry";
import { v4 as uuidv4 } from 'uuid';

const BASE_EVENT_CHANCE = 0.05;


export function runEventSystem(world: World): void {
    const entities = world.query(['ActionTag']);

    if (entities.length > 0)

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
                if (event) {

                    eventComponent?.events.push({
                        uuid: uuidv4(),
                        event: event,
                        status: "PENDING",
                        appliedAt: Date.now()
                    });

                    // Mise à jour historique
                    world.addComponent(entity, 'EventHistory',
                        history ? { history: [...history.history, action.type].slice(-20) } : { history: [action.type] }
                    );
                }
            }

            // Retire le tag après traitement
            world.removeComponent(entity, 'ActionTag');
        }
}

function shouldTriggerEvent(history: IEventsHistory | undefined): boolean {
    const recentSameActions = history ? history.history.slice(-5).length : 0;
    const chance = BASE_EVENT_CHANCE * (1 - recentSameActions * 0.01);
    return Math.random() < chance;
}

function pickEvent(actionType: ActionType): GameEvent | undefined {
    const events = EventRegistry.getAll();
    const candidates = (events as GameEvent[]).filter(e =>
        e.triggers.includes(actionType)
    );
    if (candidates.length === 0) return undefined;

    const totalWeight = candidates.reduce((sum, e) => sum + e.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const event of candidates) {
        roll -= event.weight;
        if (roll <= 0) return event;
    }

    return candidates[candidates.length - 1];
}


