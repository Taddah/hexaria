import { Socket } from "socket.io";
import { World } from "../core/World";
import { PositionComponent, POSITION_COMPONENT, BodyComponent, IdentityComponent, BODY_COMPONENT, IDENTITY_COMPONENT, BodyPartState, BodyPart } from "$shared/components";
import { findEntityByUserId } from "./utils";

export class InspectHandler {
    constructor(private world: World) { }

    register(socket: Socket) {
        socket.on('inspect_request', ({ targetId }) => {
            const entityId = findEntityByUserId(this.world, socket.data.userId);

            if (entityId === undefined) return;

            if (!targetId) return socket.emit('inspect_response', { error: 'NOT_FOUND' })

            const posA = this.world.getComponent<PositionComponent>(entityId, POSITION_COMPONENT)
            const posB = this.world.getComponent<PositionComponent>(targetId, POSITION_COMPONENT)
            if (!posA || !posB) return socket.emit('inspect_response', { error: 'OUT_OF_RANGE' })
            if (posA.q !== posB.q || posA.r !== posB.r) return socket.emit('inspect_response', { error: 'OUT_OF_RANGE' })


            const health = this.world.getComponent<BodyComponent>(targetId, BODY_COMPONENT)
            const identity = this.world.getComponent<IdentityComponent>(targetId, IDENTITY_COMPONENT)

            const bodyStatus: Record<string, BodyPartState> = {
                [BodyPart.ARM_LEFT]: health?.[BodyPart.ARM_LEFT] === BodyPartState.LOST ? BodyPartState.LOST : BodyPartState.INTACT,
                [BodyPart.ARM_RIGHT]: health?.[BodyPart.ARM_RIGHT] === BodyPartState.LOST ? BodyPartState.LOST : BodyPartState.INTACT,
                [BodyPart.LEG_LEFT]: health?.[BodyPart.LEG_LEFT] === BodyPartState.LOST ? BodyPartState.LOST : BodyPartState.INTACT,
                [BodyPart.LEG_RIGHT]: health?.[BodyPart.LEG_RIGHT] === BodyPartState.LOST ? BodyPartState.LOST : BodyPartState.INTACT,
                [BodyPart.TORSO]: health?.[BodyPart.TORSO] === BodyPartState.LOST ? BodyPartState.LOST : BodyPartState.INTACT,
                [BodyPart.HEAD]: health?.[BodyPart.HEAD] === BodyPartState.LOST ? BodyPartState.LOST : BodyPartState.INTACT,
                [BodyPart.EYE_LEFT]: health?.[BodyPart.EYE_LEFT] === BodyPartState.LOST ? BodyPartState.LOST : BodyPartState.INTACT,
                [BodyPart.EYE_RIGHT]: health?.[BodyPart.EYE_RIGHT] === BodyPartState.LOST ? BodyPartState.LOST : BodyPartState.INTACT,
            }

            socket.emit('inspect_response', {
                data: {
                    entityId: targetId,
                    firstName: identity?.firstName,
                    lastName: identity?.lastName,
                    age: identity?.currentAge,
                    reputation: 'unknown',
                    bodyStatus
                }
            })
        })
    }
}



