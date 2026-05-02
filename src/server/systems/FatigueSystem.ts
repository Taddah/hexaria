import { IIdentity, IFatigue } from "$shared/components";
import { World } from "../core/World";

const THRESHOLDS = {
    RESTED: { min: 0, max: 30, label: 'Reposé' },
    TIRED: { min: 30, max: 60, label: 'Fatigué' },
    EXHAUSTED: { min: 60, max: 80, label: 'Épuisé' },
    DONE: { min: 80, max: 100, label: 'À bout' },
} as const;

export type ThresholdKey = keyof typeof THRESHOLDS;

export function getThreshold(fatigue: number): ThresholdKey {
    if (fatigue < 30) return 'RESTED';
    if (fatigue < 60) return 'TIRED';
    if (fatigue < 80) return 'EXHAUSTED';
    return 'DONE';
}

export function addFatigue(world: World, entity: number, baseAmount: number): void {
    const fatigue = world.getComponent<IFatigue>(entity, 'Fatigue');
    const identity = world.getComponent<IIdentity>(entity, 'Identity');
    if (!fatigue) return;

    const age = identity?.currentAge ?? 25;
    const amount = baseAmount * getAgeFatigueMult(age);

    const oldThreshold = getThreshold(fatigue.fatigue);
    fatigue.fatigue = Math.min(100, fatigue.fatigue + amount);
    const newThreshold = getThreshold(fatigue.fatigue);

    if (oldThreshold !== newThreshold) {
        world.addComponent(entity, 'FatigueThresholdChanged', {
            from: oldThreshold,
            to: newThreshold,
            label: THRESHOLDS[newThreshold].label
        });
    }
}


export function reduceFatigue(world: World, entity: number, amount: number): void {
    const fatigue = world.getComponent<IFatigue>(entity, 'Fatigue');
    if (!fatigue) return;
    fatigue.fatigue = Math.max(0, fatigue.fatigue - amount);
}

function getAgeFatigueMult(age: number): number {
    if (age <= 25) return 0.8;
    return 0.8 + ((age - 25) / 75) * 1.4; // Monte progressivement jusqu'à 2.2 à 100 ans
}
