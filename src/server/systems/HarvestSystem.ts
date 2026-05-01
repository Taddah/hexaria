import { World } from '../core/World';
import { IHarvestIntent, IInventory, IPosition, IEnergy, TileData, Resource, ActionType } from '$shared';

export function runHarvestSystem(world: World, map: TileData[]): boolean {
    const entities = world.query(['Position', 'Inventory', 'HarvestIntent']);
    let harvested = false;

    for (const entity of entities) {
        const pos = world.getComponent<IPosition>(entity, 'Position');
        const inventory = world.getComponent<IInventory>(entity, 'Inventory');
        const intent = world.getComponent<IHarvestIntent>(entity, 'HarvestIntent');
        const energy = world.getComponent<IEnergy>(entity, 'Energy');

        world.removeComponent(entity, 'HarvestIntent');

        if (!pos || !inventory || !intent) continue;

        if (pos.q !== intent.tileQ || pos.r !== intent.tileR) continue;

        const tile = map.find(t => t.q === intent.tileQ && t.r === intent.tileR);
        if (!tile?.resource || tile.resource.amount <= 0) continue;

        const resource = tile.resource;
        const amount = Math.min(1, resource.amount);
        resource.amount -= amount;
        resource.lastHarvestedAt = Date.now();

        inventory[resource.type] += amount;

        if (energy) energy.current = Math.max(0, energy.current - 1);

        harvested = true;
        world.addComponent(entity, 'ActionTag', { type: getActionType(resource.type), timestamp: Date.now() });
    }

    return harvested;
}


function getActionType(resourceType: Resource): ActionType {
    switch (resourceType) {
        case Resource.WOOD: return ActionType.CHOP_WOOD;
        case Resource.STONE: return ActionType.MINE_STONE;
        case Resource.SILVER: return ActionType.MINE_SILVER;
        default: return ActionType.CHOP_WOOD;
    }
}