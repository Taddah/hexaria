

export enum BodyPart {
    HEAD = 'head',
    EYE_LEFT = 'eyeLeft',
    EYE_RIGHT = 'eyeRight',
    ARM_LEFT = 'armLeft',
    ARM_RIGHT = 'armRight',
    LEG_LEFT = 'legLeft',
    LEG_RIGHT = 'legRight',
    TORSO = 'torso',
}

export enum BodyPartState {
    INTACT = 'intact',
    INJURED = 'injured',
    HANDICAPPED = 'handicapped',
    LOST = 'lost',
}

export interface IBody {
    [BodyPart.HEAD]: BodyPartState;
    [BodyPart.EYE_LEFT]: BodyPartState;
    [BodyPart.EYE_RIGHT]: BodyPartState;
    [BodyPart.ARM_LEFT]: BodyPartState;
    [BodyPart.ARM_RIGHT]: BodyPartState;
    [BodyPart.LEG_LEFT]: BodyPartState;
    [BodyPart.LEG_RIGHT]: BodyPartState;
    [BodyPart.TORSO]: BodyPartState;
}

export interface IBodyModifiers {
    movementMultiplier: number;  // 1.0 = normal, 2.0 = deux fois plus lent
    harvestMultiplier: number;   // 1.0 = normal, 0.0 = impossible
    visionRadius: number;        // nombre de tiles
}