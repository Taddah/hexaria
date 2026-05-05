import { IPlayer, IPosition, IIdentity, IInventory, EventComponent, IBodyModifiers, IBody, IFatigue, ISkills } from "$shared/components";
import { World } from "../core/World";

export function findEntityBySocket(world: World, socketId: string): number | undefined {
    return Array.from(world.query(['Player'])).find(
        id => world.getComponent<IPlayer>(id, 'Player')?.socketId === socketId
    );
}

export function getWorldState(world: World): object[] {
    const entities = world.query(['Position', 'Identity']);
    const worldState: object[] = [];

    for (const entity of entities) {
        const pos = world.getComponent<IPosition>(entity, 'Position');
        const body = world.getComponent<IBody>(entity, 'Body');
        const bodyModifiers = world.getComponent<IBodyModifiers>(entity, 'BodyModifiers');
        const identity = world.getComponent<IIdentity>(entity, 'Identity');
        const inventory = world.getComponent<IInventory>(entity, 'Inventory');
        const fatigue = world.getComponent<IFatigue>(entity, 'Fatigue');
        const gameEvents = world.getComponent<EventComponent>(entity, 'EventComponent');
        const skills = world.getComponent<ISkills>(entity, "skills");

        if (pos && identity) {
            worldState.push({ id: entity, position: pos, body, bodyModifiers, identity, inventory, fatigue, gameEvents, skills });
        }
    }

    return worldState;
}