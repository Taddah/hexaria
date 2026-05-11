export enum ActionType {
    CHOP_WOOD = 'CHOP_WOOD',
    MINE_STONE = 'MINE_STONE',
    MINE_SILVER = 'MINE_SILVER',
    TRAVEL = 'TRAVEL',
    REST = 'REST',
    HARVEST_IRON = 'HARVEST_IRON',
    FISH = 'FISH',
    HUNT = 'HUNT',
    GATHER_HERBS = 'GATHER_HERBS',
    GATHER_BERRIES = 'GATHER_BERRIES',
    GATHER_MUSHROOMS = 'GATHER_MUSHROOMS',
    HEAL = 'HEAL',
    TRADE = 'TRADE',
    EXPLORE = 'EXPLORE',
    SURVIVE_EVENT = 'SURVIVE_EVENT'
}

export const ACTION_TAG_COMPONENT = 'ActionTagComponent';

export interface ActionTagComponent {
    type: ActionType;
    timestamp: number;
}