import { BODY_COMPONENT, BODY_MODIFIERS_COMPONENT, BodyComponent, BodyModifiersComponent, EVENT_COMPONENT, EventComponent, FATIGUE_COMPONENT, FatigueComponent, IDENTITY_COMPONENT, IdentityComponent, INVENTORY_COMPONENT, InventoryComponent, PlayerComponent, PLAYER_COMPONENT, POSITION_COMPONENT, PositionComponent, SKILLS_COMPONENT, SkillsComponent, ATTRIBUTES_COMPONENT, AttributesComponent, toAttributesDTO } from "$shared/components";
import { World } from "../core/World";
import { MOVEMENT_DURATION_MS } from "$shared/config";

export function findEntityBySocket(world: World, socketId: string): number | undefined {
    return Array.from(world.query([PLAYER_COMPONENT])).find(
        id => world.getComponent<PlayerComponent>(id, PLAYER_COMPONENT)?.socketId === socketId
    );
}

export function findEntityByUserId(world: World, userId: string): number | undefined {
    return Array.from(world.query([PLAYER_COMPONENT])).find(
        id => world.getComponent<PlayerComponent>(id, PLAYER_COMPONENT)?.userId === userId
    );
}

export function getWorldState(world: World): object[] {
    const entities = world.query([POSITION_COMPONENT, IDENTITY_COMPONENT]);
    const worldState: object[] = [];

    for (const entity of entities) {
        const pos = world.getComponent<PositionComponent>(entity, POSITION_COMPONENT);
        const body = world.getComponent<BodyComponent>(entity, BODY_COMPONENT);
        const bodyModifiers = world.getComponent<BodyModifiersComponent>(entity, BODY_MODIFIERS_COMPONENT);
        const identity = world.getComponent<IdentityComponent>(entity, IDENTITY_COMPONENT);
        const inventory = world.getComponent<InventoryComponent>(entity, INVENTORY_COMPONENT);
        const fatigue = world.getComponent<FatigueComponent>(entity, FATIGUE_COMPONENT);
        const gameEvents = world.getComponent<EventComponent>(entity, EVENT_COMPONENT);
        const skills = world.getComponent<SkillsComponent>(entity, SKILLS_COMPONENT);
        const attrs = world.getComponent<AttributesComponent>(entity, ATTRIBUTES_COMPONENT);

        if (pos && identity) {
            const movementDuration = attrs ? MOVEMENT_DURATION_MS / (1 + attrs.agility * 0.01) : MOVEMENT_DURATION_MS;
            worldState.push({
                id: entity, position: pos, body, bodyModifiers, identity, inventory, fatigue, gameEvents, skills,
                attributes: attrs ? toAttributesDTO(attrs) : undefined,
                movementDuration
            });
        }
    }

    return worldState;
}

const PERSISTED_COMPONENTS = [POSITION_COMPONENT, IDENTITY_COMPONENT, INVENTORY_COMPONENT, FATIGUE_COMPONENT, BODY_COMPONENT, BODY_MODIFIERS_COMPONENT, SKILLS_COMPONENT, EVENT_COMPONENT, ATTRIBUTES_COMPONENT];

export function serializePlayerComponents(world: World, entityId: number): Record<string, unknown> {
    const components: Record<string, unknown> = {};
    for (const name of PERSISTED_COMPONENTS) {
        const data = world.getComponent(entityId, name);
        if (data !== undefined) {
            components[name] = data;
        }
    }
    return components;
}