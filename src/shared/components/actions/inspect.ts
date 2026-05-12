import { BodyComponent, BodyPart, BodyPartState } from "../player/body"

export interface InspectData {
    entityId: number;
    firstName: string;
    lastName: string;
    age: number;
    reputation: number;
    bodyStatus: BodyComponent;
}


export interface LimbStatus {
    limb: BodyPart.ARM_LEFT | BodyPart.ARM_RIGHT | BodyPart.LEG_LEFT | BodyPart.LEG_RIGHT | BodyPart.TORSO | BodyPart.HEAD;
    status: BodyPartState.INTACT | BodyPartState.LOST;
}
