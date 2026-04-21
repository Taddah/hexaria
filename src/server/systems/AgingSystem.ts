import { World } from '../core/World';
import { IAge, IIdentity } from '$shared/components';

export function runAgingSystem(world: World): void {
    const entities = world.query(['Age', 'Identity']);

    for (const entity of entities) {
        const age = world.getComponent<IAge>(entity, 'Age');
        const identity = world.getComponent<IIdentity>(entity, 'Identity');

        if (age && identity) {
            age.current += 1;
            console.log(`L'entité ${identity.name} (ID: ${entity}) a vieilli : ${age.current}/${age.max}`);

            if (age.current >= age.max) {
                handleDeath(world, identity, entity);
            }
        }
    }
}

function handleDeath(world: World, identity: IIdentity, entity: number): void {
    world.deleteEntity(entity);
    console.log(`-> ${identity.name} est mort de vieillesse.`);
}
