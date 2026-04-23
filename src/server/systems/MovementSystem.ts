import { World } from '../core/World';
import { HexTile } from '../core/MapGenerator';
import { IMovementIntent, IPosition, IEnergy } from '$shared';

const MOVEMENT_TICK_MS = 500;

export function runMovementSystem(world: World, map: HexTile[]): void {
    const entities = world.query(['Position', 'MovementIntent']);

    for (const entity of entities) {
        const pos = world.getComponent<IPosition>(entity, 'Position');
        const intent = world.getComponent<IMovementIntent>(entity, 'MovementIntent');
        const energy = world.getComponent<IEnergy>(entity, 'Energy');

        if (!pos || !intent) continue;

        const distance =
            (Math.abs(pos.q - intent.targetQ) +
                Math.abs(pos.r - intent.targetR) +
                Math.abs(pos.q + pos.r - intent.targetQ - intent.targetR)) / 2;

        if (distance !== 1) {
            world.removeComponent(entity, 'MovementIntent');
            continue;
        }

        const tile = map.find(t => t.q === intent.targetQ && t.r === intent.targetR);
        if (!tile || tile.type === 'WATER') {
            world.removeComponent(entity, 'MovementIntent');
            continue;
        }

        pos.q = intent.targetQ;
        pos.r = intent.targetR;

        if (energy) energy.current = Math.max(0, energy.current - 1);

        world.removeComponent(entity, 'MovementIntent');
    }
}

export { MOVEMENT_TICK_MS };
