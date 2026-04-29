import { World } from '../core/World';
import { IIdentity } from '$shared';

export function runAgingSystem(world: World): void {
    const entities = world.query(['Identity']);

    for (const entity of entities) {
        const identity = world.getComponent<IIdentity>(entity, 'Identity');

        if (identity) {
            identity.currentAge += 1;
            if (identity.currentAge >= identity.ageMax) {
                handleDeath(world, identity, entity);
            }
        }
    }
}

function handleDeath(world: World, identity: IIdentity, entity: number): void {
    world.deleteEntity(entity);
}
