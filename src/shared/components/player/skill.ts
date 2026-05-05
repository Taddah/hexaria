
export interface ISkillData {
    xp: number;
    lastPracticed: number;
}

export interface ISkills {
    [skillName: string]: ISkillData;
}


export function getDegradation(xp: number): number {
    return 50 * getSkillGain(xp);
}

export enum SKILL_LIST {
    WOODCUTTING = "woodcutting",
    MINING = "mining",
    ATHLETICS = "athletics"
}

export const SKILL_DISPLAY_NAME: Record<SKILL_LIST, string> = {
    [SKILL_LIST.WOODCUTTING]: "Woodcutting",
    [SKILL_LIST.MINING]: "Mining",
    [SKILL_LIST.ATHLETICS]: "Athletics"
}


export const SKILL_TITLES: Record<string, string[]> = {
    [SKILL_LIST.WOODCUTTING]: ["Novice", "Apprenti", "Bûcheron", "Bûcheron confirmé", "Expert", "Maître", "Légende"],
    [SKILL_LIST.MINING]: ["Novice", "Apprenti", "Mineur", "Mineur confirmé", "Expert mineur", "Maître mineur", "Légende"],
    [SKILL_LIST.ATHLETICS]: ["Sédentaire", "Marcheur", "Randonneur", "Athlète", "Coureur", "Sprinter", "Légende"],
};

const THRESHOLDS = [0, 1, 5, 15, 40, 100, 250];

export function getSkillTitle(skill: string, xp: number): string {
    let i = THRESHOLDS.findLastIndex(t => xp >= t);
    if (i < 0) return "";

    const skillTitle = SKILL_TITLES[skill]?.[i];
    if (!skillTitle) return "";
    return skillTitle;
}

export function getSkillName(skill: SKILL_LIST): string {
    return SKILL_DISPLAY_NAME[skill];
}

export function getSkillGain(xp: number): number {
    if (xp < 8) return 0.8;
    if (xp < 20) return 0.3;
    if (xp < 50) return 0.1;
    if (xp < 100) return 0.03;
    return 0.015;
}