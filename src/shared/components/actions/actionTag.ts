export type ActionType = 'CHOP_WOOD' | 'TRAVEL' | 'REST';

export interface IActionTag {
    type: ActionType;
    timestamp: number;
}