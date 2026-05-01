import { IPlayer, IPosition, IIdentity, IInventory, IEnergy } from "$shared/components";
import { BodyPart, BodyPartState, IBody } from "$shared/components/player/body";
import { Resource } from "$shared/types";
import { World } from "../core/World";

export class PlayerFactory {
    constructor() { }
    static create(params: {
        socketId: string;
        world: World;
        name: string;
        age: number;
    }) {
        const player = params.world.createEntity();

        params.world.addComponent<IPlayer>(player, 'Player', { socketId: params.socketId });
        params.world.addComponent<IPosition>(player, 'Position', { q: 25, r: 25 });
        params.world.addComponent<IIdentity>(player, 'Identity', { name: params.name, currentAge: params.age, ageMax: 100 });
        params.world.addComponent<IInventory>(player, 'Inventory', { [Resource.WOOD]: 0, [Resource.STONE]: 0, [Resource.SILVER]: 0 });
        params.world.addComponent<IEnergy>(player, 'Energy', { current: 100, max: 100 });

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

        return player;

    }
}