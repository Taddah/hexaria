// shared/types/events.ts
import { Resource } from "$shared/types";
import { EventNarrative } from "src/server/services/LLMservice";
import { ActionType } from "../actions/actionTag";
import { BodyPart } from "../player/body";

export const EVENT_COMPONENT = 'EventComponent';

export enum EffectType {
    RESOURCE = 'RESOURCE',
    BODY = 'BODY',
    STAT = 'STAT',
    SKILL = 'SKILL',
    EQUIPMENT = 'EQUIPMENT',
    DEATH_IMMEDIATE = 'DEATH_IMMEDIATE',
    DEATH_DELAYED = 'DEATH_DELAYED',
    REMOVE_DEATH_INTENT = 'REMOVE_DEATH_INTENT',
}

export interface ResourceEffect {
    type: EffectType.RESOURCE;
    stat: Resource;
    value: number;
}
export interface BodyEffect {
    type: EffectType.BODY;
    stat: BodyPart;
    value: number;
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

export interface DeathImmediateEffect {
    type: EffectType.DEATH_IMMEDIATE;
    eventName: string;
}

export interface DeathDelayedEffect {
    type: EffectType.DEATH_DELAYED;
    eventName: string;
    delayMs: number;
}

export interface RemoveDeathIntentEffect {
    type: EffectType.REMOVE_DEATH_INTENT;
}

export type EventEffect =
    | ResourceEffect
    | BodyEffect
    | StatEffect
    | SkillEffect
    | EquipmentEffect
    | DeathImmediateEffect
    | DeathDelayedEffect
    | RemoveDeathIntentEffect;

// ─── Nodes / Choices / Outcomes (NOUVEAU) ────────────────────────────────────

export interface EventOutcome {
    weight: number;
    nextNode: string;     // id du node suivant, "end" si terminal
    effects: EventEffect[];
}

export interface EventChoice {
    id: string;
    label: string;
    outcomes: EventOutcome[];
}

export interface EventNode {
    id: string;
    description: string;
    choices: EventChoice[]; // [] = node terminal
    effects?: EventEffect[];
    isSignificant: boolean;
}

export interface VisitedStep {
    nodeId: string;
    choiceId: string;
    choiceLabel: string;
}

// ─── Event Definition ─────────────────────────────────────────────────────────

export interface GameEvent {
    id: string;
    title: string;
    probability: number;
    triggers: ActionType[];
    polarity: EventPolarity;
    nodes: EventNode[];         // remplace description + effects
}

// ─── Event Instance ───────────────────────────────────────────────────────────


export type EventStatus = "PENDING" | "RESOLVED" | "SEEN" | "PENDING_CONFIRM" | "ACTIVE";  // +RESOLVED
export type EventPolarity = 'positive' | 'negative' | 'neutral';

export interface Event {
    uuid: string;
    event: GameEvent;
    status: EventStatus;
    currentNodeId: string;
    pendingEffects: EventEffect[];
    narrative: EventNarrative | null;
    visitedPath: VisitedStep[];
}

export interface EventComponent {
    events: Event[];
}
