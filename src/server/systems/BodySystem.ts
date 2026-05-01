// systems/BodySystem.ts
import { World } from '../core/World';
import { IBody, IBodyModifiers, BodyPartState, VISION_RADIUS_DAY } from '$shared';

function stateIndex(state: BodyPartState): number {
    return ['intact', 'injured', 'handicapped', 'lost'].indexOf(state);
}

function computeMovementMultiplier(body: IBody): number {
    const leftIdx = stateIndex(body.legLeft);
    const rightIdx = stateIndex(body.legRight);

    if (leftIdx === 3 && rightIdx === 3) return Infinity;

    const worst = Math.max(leftIdx, rightIdx);
    return [1.0, 1.2, 1.6, 2.0][worst] ?? 1;
}

function computeHarvestMultiplier(body: IBody): number {
    const leftIdx = stateIndex(body.armLeft);
    const rightIdx = stateIndex(body.armRight);

    if (leftIdx === 3 && rightIdx === 3) return 0.0;

    const best = Math.min(leftIdx, rightIdx);
    return [1.0, 0.7, 0.4, 0.2][best] ?? 1;
}

function computeVisionRadius(body: IBody): number {
    const leftLost = body.eyeLeft === 'lost';
    const rightLost = body.eyeRight === 'lost';
    const leftInjured = body.eyeLeft === 'injured';
    const rightInjured = body.eyeRight === 'injured';

    if (leftLost && rightLost) return 0;
    if (leftLost || rightLost) return VISION_RADIUS_DAY - 1;
    if (leftInjured || rightInjured) return VISION_RADIUS_DAY - 1;
    return VISION_RADIUS_DAY;
}

export function runBodySystem(world: World): void {
    const entities = world.query(['Body']);

    for (const entity of entities) {
        const body = world.getComponent<IBody>(entity, 'Body');
        if (!body) continue;

        if (body.torso === 'lost' || body.head === 'lost') {
            continue;
        }

        const modifiers: IBodyModifiers = {
            movementMultiplier: computeMovementMultiplier(body),
            harvestMultiplier: computeHarvestMultiplier(body),
            visionRadius: computeVisionRadius(body),
        };

        world.addComponent<IBodyModifiers>(entity, 'BodyModifiers', modifiers);
    }
}