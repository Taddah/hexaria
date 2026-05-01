// shared/types/events.ts
import { Resource } from "$shared/types";
import { ActionType } from "../actions/actionTag";
import { BodyPart } from "../player/body";

// ─── Effect Types ─────────────────────────────────────────────────────────────

export enum EffectType {
    RESOURCE = 'RESOURCE',
    BODY = 'BODY',
    STAT = 'STAT',
    SKILL = 'SKILL',
    EQUIPMENT = 'EQUIPMENT',
}

// ─── Effects ──────────────────────────────────────────────────────────────────

export interface ResourceEffect {
    type: EffectType.RESOURCE;
    stat: Resource;
    value: number;
}

export interface BodyEffect {
    type: EffectType.BODY;
    stat: BodyPart;
    value: number;   // delta : +1 aggravation, -1 amélioration
}

export interface StatEffect {
    type: EffectType.STAT;
    stat: string;
    value: number;
}

export interface SkillEffect {
    type: EffectType.SKILL;
    stat: string;
    value: number;
}

export interface EquipmentEffect {
    type: EffectType.EQUIPMENT;
    stat: string;
    value: number;
}

export type EventEffect =
    | ResourceEffect
    | BodyEffect
    | StatEffect
    | SkillEffect
    | EquipmentEffect;

// ─── Event Definition ─────────────────────────────────────────────────────────

export interface GameEvent {
    id: string;
    title: string;
    description: string;
    probability: number;
    triggers: ActionType[];
    polarity: EventPolarity;
    effects: EventEffect[];
}

// ─── Event Instance ───────────────────────────────────────────────────────────

export type EventStatus = "PENDING" | "SEEN";
export type EventPolarity = 'positive' | 'negative' | 'neutral'

export interface Event {
    uuid: string;
    event: GameEvent;
    status: EventStatus;
    appliedAt: number;
}

export interface EventComponent {
    events: Event[];
}
