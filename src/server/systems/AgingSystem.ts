import { World } from '../core/World';
import { IdentityComponent, IDENTITY_COMPONENT, FatigueComponent, FATIGUE_COMPONENT } from '$shared';

export function runAgingSystem(world: World): void {
    const entities = world.query([IDENTITY_COMPONENT]);

    for (const entity of entities) {
        const identity = world.getComponent<IdentityComponent>(entity, IDENTITY_COMPONENT);
        if (!identity) continue;

        identity.currentAge += 1;

        if (shouldDieOfAge(identity.currentAge, world, entity)) {
            handleDeath(world, identity, entity);
        }
    }
}

function shouldDieOfAge(age: number, world: World, entity: number): boolean {
    const fatigue = world.getComponent<FatigueComponent>(entity, FATIGUE_COMPONENT);
    const fatigueMult = fatigue ? 1 + (fatigue.fatigue / 100) * 0.5 : 1;

    const baseChance = getDeathChance(age);
    return Math.random() < baseChance * fatigueMult;
}

function getDeathChance(age: number): number {
    if (age < 40) return 0.001;
    if (age < 60) return 0.005;
    if (age < 70) return 0.02;
    if (age < 80) return 0.05;
    if (age < 90) return 0.12;
    if (age < 100) return 0.25;
    return 0.5;
}


function handleDeath(world: World, identity: IdentityComponent, entity: number): void {
    world.deleteEntity(entity);
}
