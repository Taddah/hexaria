// systems/BodySystem.ts
import { World } from '../core/World';
import { BodyPartState, VISION_RADIUS_DAY, DEBUG_MODE, BodyComponent, BODY_COMPONENT, BODY_MODIFIERS_COMPONENT, BodyModifiersComponent, DEATH_INTENT_COMPONENT, DeathIntentComponent } from '$shared';

function stateIndex(state: BodyPartState): number {
    return ['intact', 'injured', 'handicapped', 'lost'].indexOf(state);
}

function computeMovementMultiplier(body: BodyComponent): number {
    const leftIdx = stateIndex(body.legLeft);
    const rightIdx = stateIndex(body.legRight);

    if (leftIdx === 3 && rightIdx === 3) return Infinity;

    const worst = Math.max(leftIdx, rightIdx);
    return [1.0, 1.2, 1.6, 2.0][worst] ?? 1;
}

function computeHarvestMultiplier(body: BodyComponent): number {
    const leftIdx = stateIndex(body.armLeft);
    const rightIdx = stateIndex(body.armRight);

    if (leftIdx === 3 && rightIdx === 3) return 0.0;

    const best = Math.min(leftIdx, rightIdx);
    return [1.0, 0.7, 0.4, 0.2][best] ?? 1;
}

function computeVisionRadius(body: BodyComponent): number {
    const baseRadius = DEBUG_MODE ? 10 : VISION_RADIUS_DAY;
    const leftLost = body.eyeLeft === 'lost';
    const rightLost = body.eyeRight === 'lost';
    const leftInjured = body.eyeLeft === 'injured';
    const rightInjured = body.eyeRight === 'injured';

    if (leftLost && rightLost) return 0;
    if (leftLost || rightLost) return baseRadius - 1;
    if (leftInjured || rightInjured) return baseRadius - 1;
    return baseRadius;
}

export function runBodySystem(world: World): void {
    const entities = world.query([BODY_COMPONENT]);

    for (const entity of entities) {
        const body = world.getComponent<BodyComponent>(entity, BODY_COMPONENT);
        if (!body) continue;

        if (body.torso === 'lost' || body.head === 'lost') {
            if (!world.getComponent(entity, DEATH_INTENT_COMPONENT)) {
                world.addComponent<DeathIntentComponent>(entity, DEATH_INTENT_COMPONENT, {
                    deadline: null,
                    cause: 'INJURY'
                });
            }
            continue;
        }

        const modifiers: BodyModifiersComponent = {
            movementMultiplier: computeMovementMultiplier(body),
            harvestMultiplier: computeHarvestMultiplier(body),
            visionRadius: computeVisionRadius(body),
        };

        world.addComponent(entity, BODY_MODIFIERS_COMPONENT, modifiers);
    }
}