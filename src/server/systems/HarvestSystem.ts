import { World } from '../core/World';
import { IHarvestIntent, IInventory, IPosition, TileData, Resource, ActionType } from '$shared';
import { addFatigue } from './FatigueSystem';
import { gainXp } from './SkillSystem';

export function runHarvestSystem(world: World, map: TileData[]): boolean {
    const entities = world.query(['Position', 'Inventory', 'HarvestIntent']);
    let harvested = false;

    for (const entity of entities) {
        const pos = world.getComponent<IPosition>(entity, 'Position');
        const inventory = world.getComponent<IInventory>(entity, 'Inventory');
        const intent = world.getComponent<IHarvestIntent>(entity, 'HarvestIntent');

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

        harvested = true;
        world.addComponent(entity, 'ActionTag', { type: getActionType(resource.type), timestamp: Date.now() });
        addFatigue(world, entity, 2);
        gainXp(world, entity, getSkillName(resource.type));
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

function getSkillName(resourceType: Resource): string {
    switch (resourceType) {
        case Resource.WOOD: return "woodcutting";
        case Resource.STONE: return "mining";
        case Resource.SILVER: return "mining";
        default: return "woodcutting";
    }
}