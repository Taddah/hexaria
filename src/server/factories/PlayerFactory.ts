import { IPlayer, IPosition, IIdentity, IInventory, ISkills } from "$shared/components";
import { BodyPart, BodyPartState, IBody } from "$shared/components/player/body";
import { IFatigue } from "$shared/components/player/fatigue";
import { Resource } from "$shared/types";
import { World } from "../core/World";

export class PlayerFactory {
    constructor() { }
    static create(params: {
        socketId: string;
        world: World;
        name: string;
        age: number;
        startPosition: { q: number, r: number };
    }) {
        const player = params.world.createEntity();

        params.world.addComponent<IPlayer>(player, 'Player', { socketId: params.socketId });
        params.world.addComponent<IPosition>(player, 'Position', { q: params.startPosition.q, r: params.startPosition.r });
        params.world.addComponent<IIdentity>(player, 'Identity', { name: params.name, currentAge: params.age });
        params.world.addComponent<IInventory>(player, 'Inventory', { [Resource.WOOD]: 0, [Resource.STONE]: 0, [Resource.SILVER]: 0 });
        params.world.addComponent<IFatigue>(player, 'Fatigue', { fatigue: 0 });

        params.world.addComponent<IBody>(player, 'Body', {
            [BodyPart.HEAD]: BodyPartState.INTACT,
            [BodyPart.EYE_LEFT]: BodyPartState.INTACT,
            [BodyPart.EYE_RIGHT]: BodyPartState.INTACT,
            [BodyPart.ARM_LEFT]: BodyPartState.INTACT,
            [BodyPart.ARM_RIGHT]: BodyPartState.INTACT,
            [BodyPart.LEG_LEFT]: BodyPartState.INTACT,
            [BodyPart.LEG_RIGHT]: BodyPartState.INTACT,
            [BodyPart.TORSO]: BodyPartState.INTACT,
        });

        params.world.addComponent<ISkills>(player, "skills", {});

        return player;

    }
}