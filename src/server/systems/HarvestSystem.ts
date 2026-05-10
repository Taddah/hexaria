import { World } from '../core/World';
import { TileData, Resource, ActionType, HARVEST_INTENT_COMPONENT, HarvestIntentComponent, INVENTORY_COMPONENT, InventoryComponent, POSITION_COMPONENT, PositionComponent, ACTION_TAG_COMPONENT } from '$shared';
import { addFatigue } from './FatigueSystem';
import { gainXp } from './SkillSystem';

export function runHarvestSystem(world: World, map: TileData[]): boolean {
    const entities = world.query([POSITION_COMPONENT, INVENTORY_COMPONENT, HARVEST_INTENT_COMPONENT]);
    let harvested = false;

    for (const entity of entities) {
        const pos = world.getComponent<PositionComponent>(entity, POSITION_COMPONENT);
        const inventory = world.getComponent<InventoryComponent>(entity, INVENTORY_COMPONENT);
        const intent = world.getComponent<HarvestIntentComponent>(entity, HARVEST_INTENT_COMPONENT);

        world.removeComponent(entity, HARVEST_INTENT_COMPONENT);

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
        world.addComponent(entity, ACTION_TAG_COMPONENT, { type: getActionType(resource.type), timestamp: Date.now() });
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