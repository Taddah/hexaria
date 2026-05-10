export enum ActionType {
    CHOP_WOOD = 'CHOP_WOOD',
    MINE_STONE = 'MINE_STONE',
    MINE_SILVER = 'MINE_SILVER',
    TRAVEL = 'TRAVEL',
    REST = 'REST'
}

export const ACTION_TAG_COMPONENT = 'ActionTagComponent';

export interface ActionTagComponent {
    type: ActionType;
    timestamp: number;
}