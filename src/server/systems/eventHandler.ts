// server/systems/eventHandler.ts
import { EventComponent, Event, BodyEffect, EffectType, EventEffect, IBody, IInventory, ResourceEffect } from '$shared/components';
import { World } from '../core/World';
import { EventRegistry } from '../core/EventRegistry';
import { generateResolutionText } from '../services/eventEnrichment';
import { broadcastEventQueue } from '../network/eventBroadcaster';
import { EventResponsePayload } from '$shared/types/eventNetwork';

/**
 * Appelé quand le client répond à un event
 * INSTANT: choiceId = null
 * CHOICE: choiceId = choice.id
 */
export async function handleEventResponse(
    world: World,
    entity: string,
    payload: EventResponsePayload
): Promise<void> {
    const eventComp = world.getComponent<EventComponent>(entity, 'EventComponent');
    if (!eventComp) return;

    // Trouver l'event dans la queue
    const instance = eventComp.queue.find((e) => e.uuid === payload.eventUuid);
    if (!instance) {
        console.warn(`Event ${payload.eventUuid} not found in queue`);
        return;
    }

    // Récupérer la définition
    const definition = EventRegistry.get(instance.definitionId);
    if (!definition) {
        console.warn(`Definition ${instance.definitionId} not found`);
        return;
    }

    // Marquer comme RESOLVING
    instance.status = 'RESOLVING';

    // Appliquer les effets
    let effects = definition.effects; // INSTANT
    let nextEventId: string | null = null;

    if (definition.type === 'CHOICE') {
        const choice = instance.choices?.find((c) => c.id === payload.choiceId);
        if (!choice) {
            console.warn(`Choice ${payload.choiceId} not found`);
            return;
        }

        instance.choiceId = choice.id;
        effects = choice.effects;
        nextEventId = choice.nextEventId;
    }

    // Appliquer les effets
    applyEffects(world, entity, effects);

    // Générer le texte de résolution
    instance.resolutionText = await generateResolutionText(instance, definition);

    // Marquer comme RESOLVED
    instance.status = 'RESOLVED';
    instance.resolvedAt = Date.now();

    // Déplacer vers history
    eventComp.history.push(instance);
    eventComp.queue = eventComp.queue.filter((e) => e.uuid !== instance.uuid);

    // Broadcaster le changement
    broadcastEventQueue(entity, eventComp);

    // Gérer le next event
    if (nextEventId) {
        await triggerNextEvent(world, entity, eventComp, nextEventId);
    }
}

async function triggerNextEvent(
    world: World,
    entity: string,
    eventComp: EventComponent,
    definitionId: string
): Promise<void> {
    const definition = EventRegistry.get(definitionId);
    if (!definition) {
        console.warn(`Next event definition ${definitionId} not found`);
        return;
    }

    const { enrichEvent } = await import('../services/eventEnrichment');

    const instance: Event = {
        uuid: crypto.randomUUID(),
        definitionId: definition.id,
        status: 'PENDING',
        createdAt: Date.now(),
        title: '',
        description: '',
        type: definition.type,
        polarity: definition.polarity,
        effects: [],
    };

    eventComp.queue.push(instance);
    await enrichEvent(instance, definition);

    broadcastEventQueue(entity, eventComp);
}

function applyEffects(world: World, entity: string, effects: EventEffect[]): void {
    // TODO: implémenter l'application des effets
    // Par système (Inventory, Body, Stats, Skills, Equipment)
    console.log(`[Effects] Applying ${effects.length} effects to ${entity}`);

    for (const effect of effects) {
        switch (effect.type) {
            case EffectType.RESOURCE:
                applyResourceEffect(world, entity, effect);
                break;
            case EffectType.BODY:
                applyBodyEffect(world, entity, effect);
                break;
            // ... etc
        }
    }
}

function applyResourceEffect(world: World, entity: string, effect: ResourceEffect): void {
    const inventory = world.getComponent<IInventory>(entity, 'Inventory');
    if (!inventory) return;

    const current = inventory.resources[effect.stat] ?? 0;
    inventory.resources[effect.stat] = Math.max(0, current + effect.value);
}

function applyBodyEffect(world: World, entity: string, effect: BodyEffect): void {
    const body = world.getComponent<IBody>(entity, 'Body');
    if (!body) return;

    const part = body.parts[effect.stat];
    if (!part) return;

    part.aggravation = Math.max(0, (part.aggravation ?? 0) + effect.value);
}

// ... autres applyXXXEffect
