import { ActionType } from "../actions/actionTag";

export interface GameEvent {

    id: string;
    title: string;
    description: string;
    weight: number;
    triggers: ActionType[];
    effects: EventEffect[];
}

export interface Event {
    uuid: string;
    event: GameEvent;
    status: EventStatus;
    appliedAt: number;
}

export interface EventEffect {
    type: 'RESOURCE';
    value: number;
    stat?: string;
}

export type EventStatus = "PENDING" | "SEEN";

export interface EventComponent {
    events: Event[];
}