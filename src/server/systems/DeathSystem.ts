import { DeathIntentComponent, DEATH_INTENT_COMPONENT } from '$shared/components';
import { World } from '../core/World';
import { NetworkSystem } from './NetworkSystem';
import { DeathService } from '../services/DeathService';

export async function runDeathSystem(world: World, network: NetworkSystem): Promise<void> {
    const entities = world.query([DEATH_INTENT_COMPONENT]);

    for (const entity of entities) {
        const intent = world.getComponent<DeathIntentComponent>(entity, DEATH_INTENT_COMPONENT);
        if (!intent) continue;

        if (intent.deadline === null || Date.now() >= intent.deadline) {
            await DeathService.kill(entity, world, network);
        }
    }
}
