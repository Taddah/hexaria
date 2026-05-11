import { World } from '../core/World';
import { ActionType, AttributesComponent, ATTRIBUTES_COMPONENT, IDENTITY_COMPONENT, IdentityComponent, type AttributeKey } from '$shared/components';
import { ATTRIBUTE_XP } from '../data/attributeXpTable';

function getAgeFactor(age: number, stat: AttributeKey): number {
    const curves: Record<AttributeKey, { peak: number; declineStart: number }> = {
        strength: { peak: 25, declineStart: 45 },
        endurance: { peak: 30, declineStart: 50 },
        agility: { peak: 20, declineStart: 38 },
        intelligence: { peak: 35, declineStart: 65 },
        charisma: { peak: 45, declineStart: 75 },
        willpower: { peak: 40, declineStart: 70 },
        discretion: { peak: 30, declineStart: 60 },
    };

    const { peak, declineStart } = curves[stat];

    if (age <= peak) {
        return 0.5 + 0.5 * (age / peak);
    } else if (age <= declineStart) {
        return 1.0;
    } else {
        const decline = (age - declineStart) * 0.015;
        return Math.max(0.1, 1.0 - decline);
    }
}

function computeGain(current: number, baseXp: number, ageFactor: number): number {
    const diminishing = 1 / (1 + current * 0.05);
    return baseXp * diminishing * ageFactor;
}

export function gainAttributeXp(world: World, entity: number, actionType: ActionType): void {
    const attrs = world.getComponent<AttributesComponent>(entity, ATTRIBUTES_COMPONENT);
    const identity = world.getComponent<IdentityComponent>(entity, IDENTITY_COMPONENT);

    if (!attrs || !identity) return;

    const xpMap = ATTRIBUTE_XP[actionType];
    if (!xpMap) return;

    for (const [statStr, baseXp] of Object.entries(xpMap)) {
        const stat = statStr as AttributeKey;
        const ageFactor = getAgeFactor(identity.currentAge, stat);
        attrs[stat] += computeGain(attrs[stat], baseXp as number, ageFactor);
    }
}

export function applyAttributePenalty(
    world: World,
    entity: number,
    stat: AttributeKey,
    amount: number,
    permanent: boolean
): void {
    const attrs = world.getComponent<AttributesComponent>(entity, ATTRIBUTES_COMPONENT);
    if (!attrs) return;
    attrs[stat] = Math.max(0, attrs[stat] - amount);
}
