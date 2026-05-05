// $server/systems/Skills.system.ts
import { World } from "../core/World";
import { ISkills } from "$shared/components";
import { getSkillGain } from "$shared/components";

export function runSkillSystem(world: World): void {
    const entities = world.query(["skills"]);
    const now = Date.now();

    for (const entity of entities) {
        const skills = world.getComponent<ISkills>(entity, "skills");
        if (!skills) continue;

        for (const [_name, data] of Object.entries(skills)) {
            const hoursSince = (now - data.lastPracticed) / 3_600_000;
            if (hoursSince < 1) continue;

            const loss = hoursSince * 50 * getSkillGain(data.xp);
            data.xp = Math.max(0, data.xp - loss);
        }
    }
}

export function gainXp(world: World, entity: number, skillName: string): void {
    const skills = world.getComponent<ISkills>(entity, "skills");
    if (!skills) return;

    let data = skills[skillName];
    if (!data) {
        skills[skillName] = { xp: 0, lastPracticed: Date.now() };
        data = skills[skillName];
    };

    const gain = getSkillGain(data.xp);
    data.xp += gain;
    data.lastPracticed = Date.now();
}