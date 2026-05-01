export enum ActionType {
    CHOP_WOOD = 'CHOP_WOOD',
    MINE_STONE = 'MINE_STONE',
    MINE_SILVER = 'MINE_SILVER',
    TRAVEL = 'TRAVEL',
    REST = 'REST'
}

export interface IActionTag {
    type: ActionType;
    timestamp: number;
}