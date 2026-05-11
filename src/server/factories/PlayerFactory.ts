import { PlayerComponent, PositionComponent, IdentityComponent, InventoryComponent, SkillsComponent, FatigueComponent, PLAYER_COMPONENT, IDENTITY_COMPONENT, POSITION_COMPONENT, FATIGUE_COMPONENT, INVENTORY_COMPONENT, SKILLS_COMPONENT, BodyPart, BodyPartState, BodyComponent, BODY_COMPONENT, ATTRIBUTES_COMPONENT, AttributesComponent, DEFAULT_ATTRIBUTES } from "$shared/components";
import { Resource } from "$shared/types";
import { World } from "../core/World";

interface CreatePlayerParams {
    socketId: string;
    userId: string;
    world: World;
    firstName: string;
    lastName: string;
    age: number;
    startPosition: { q: number; r: number };
}

interface CreateFromComponentsParams {
    socketId: string;
    userId: string;
    world: World;
    components: Record<string, unknown>;
}

export class PlayerFactory {
    static create(params: CreatePlayerParams) {
        const player = params.world.createEntity();

        params.world.addComponent<PlayerComponent>(player, PLAYER_COMPONENT, {
            socketId: params.socketId,
            userId: params.userId
        });
        params.world.addComponent<PositionComponent>(player, POSITION_COMPONENT, {
            q: params.startPosition.q,
            r: params.startPosition.r
        });
        params.world.addComponent<IdentityComponent>(player, IDENTITY_COMPONENT, {
            firstName: params.firstName,
            lastName: params.lastName,
            currentAge: params.age
        });
        params.world.addComponent<InventoryComponent>(player, INVENTORY_COMPONENT, {
            [Resource.WOOD]: 0,
            [Resource.STONE]: 0,
            [Resource.SILVER]: 0
        });
        params.world.addComponent<FatigueComponent>(player, FATIGUE_COMPONENT, { fatigue: 0 });

        params.world.addComponent<BodyComponent>(player, BODY_COMPONENT, {
            [BodyPart.HEAD]: BodyPartState.INTACT,
            [BodyPart.EYE_LEFT]: BodyPartState.INTACT,
            [BodyPart.EYE_RIGHT]: BodyPartState.INTACT,
            [BodyPart.ARM_LEFT]: BodyPartState.INTACT,
            [BodyPart.ARM_RIGHT]: BodyPartState.INTACT,
            [BodyPart.LEG_LEFT]: BodyPartState.INTACT,
            [BodyPart.LEG_RIGHT]: BodyPartState.INTACT,
            [BodyPart.TORSO]: BodyPartState.INTACT,
        });

        params.world.addComponent<SkillsComponent>(player, SKILLS_COMPONENT, {});
        params.world.addComponent<AttributesComponent>(player, ATTRIBUTES_COMPONENT, { ...DEFAULT_ATTRIBUTES });

        return player;
    }

    static createFromComponents(params: CreateFromComponentsParams) {
        const player = params.world.createEntity();

        params.world.addComponent<PlayerComponent>(player, PLAYER_COMPONENT, {
            socketId: params.socketId,
            userId: params.userId
        });

        for (const [name, data] of Object.entries(params.components)) {
            if (name === 'Player') continue;
            params.world.addComponent(player, name, data);
        }

        return player;
    }
}