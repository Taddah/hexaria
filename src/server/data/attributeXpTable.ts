import { ActionType } from '$shared/components';
import type { AttributeKey } from '$shared/components';

export const ATTRIBUTE_XP: Partial<Record<ActionType, Partial<Record<AttributeKey, number>>>> = {
    [ActionType.CHOP_WOOD]: { strength: 0.08, endurance: 0.04 },
    [ActionType.MINE_STONE]: { strength: 0.10, endurance: 0.05 },
    [ActionType.MINE_SILVER]: { strength: 0.06, endurance: 0.04, discretion: 0.03 },
    [ActionType.HUNT]: { strength: 0.10, agility: 0.08 },
    [ActionType.FISH]: { intelligence: 0.05, endurance: 0.03 },
    [ActionType.GATHER_HERBS]: { intelligence: 0.06 },
    [ActionType.GATHER_BERRIES]: { intelligence: 0.04 },
    [ActionType.GATHER_MUSHROOMS]: { intelligence: 0.04, discretion: 0.02 },
    [ActionType.TRAVEL]: { agility: 0.03, endurance: 0.02 },
    [ActionType.REST]: { endurance: 0.02, willpower: 0.02 },
    [ActionType.HEAL]: { intelligence: 0.05, willpower: 0.03 },
    [ActionType.TRADE]: { charisma: 0.08, intelligence: 0.03 },
    [ActionType.EXPLORE]: { endurance: 0.02 },
    [ActionType.SURVIVE_EVENT]: { willpower: 0.10 },
    [ActionType.HARVEST_IRON]: { strength: 0.10, endurance: 0.05 },
};
