import { IPlayer, IPosition, IIdentity, IInventory, IEnergy, EventComponent } from "$shared/components";
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
        const identity = world.getComponent<IIdentity>(entity, 'Identity');
        const inventory = world.getComponent<IInventory>(entity, 'Inventory');
        const energy = world.getComponent<IEnergy>(entity, 'Energy');
        const gameEvents = world.getComponent<EventComponent>(entity, 'EventComponent');

        if (pos && identity) {
            worldState.push({ id: entity, position: pos, identity, inventory, energy, gameEvents });
        }
    }

    return worldState;
}