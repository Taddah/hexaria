import { World } from '../core/World';
import { TileData } from '$shared/types';
import { MovementIntentComponent, PositionComponent, MOVEMENT_DURATION_MS, PlayerComponent, ActionType, MOVEMENT_INTENT_COMPONENT, POSITION_COMPONENT, ACTION_TAG_COMPONENT, PLAYER_COMPONENT } from '$shared';
import { addFatigue } from './FatigueSystem';
import { gainXp } from './SkillSystem';



export function runMovementSystem(world: World, map: TileData[], onMoveConfirmed: (userId: string, pos: { q: number, r: number }) => void): void {
    const entities = world.query([POSITION_COMPONENT, MOVEMENT_INTENT_COMPONENT]);
    for (const entity of entities) {
        const pos = world.getComponent<PositionComponent>(entity, POSITION_COMPONENT);
        const intent = world.getComponent<MovementIntentComponent>(entity, MOVEMENT_INTENT_COMPONENT);
        if (!pos || !intent) continue;
        if (Date.now() - intent.startedAt < MOVEMENT_DURATION_MS) continue;

        const distance =
            (Math.abs(pos.q - intent.targetQ) +
                Math.abs(pos.r - intent.targetR) +
                Math.abs(pos.q + pos.r - intent.targetQ - intent.targetR)) / 2;

        if (distance !== 1) {
            world.removeComponent(entity, MOVEMENT_INTENT_COMPONENT);
            continue;
        }

        const tile = map.find(t => t.q === intent.targetQ && t.r === intent.targetR);
        if (!tile || tile.type === 'WATER') {
            world.removeComponent(entity, MOVEMENT_INTENT_COMPONENT);
            continue;
        }

        pos.q = intent.targetQ;
        pos.r = intent.targetR;
        world.removeComponent(entity, MOVEMENT_INTENT_COMPONENT);

        const player = world.getComponent<PlayerComponent>(entity, PLAYER_COMPONENT);
        if (player?.userId) {
            onMoveConfirmed(player.userId, { q: pos.q, r: pos.r });
        }

        world.addComponent(entity, ACTION_TAG_COMPONENT, { type: ActionType.TRAVEL, timestamp: Date.now() });
        addFatigue(world, entity, 1);
        gainXp(world, entity, "athletics");
    }
}
