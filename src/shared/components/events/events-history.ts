import { ActionType, Event } from "$shared/index";

export interface IEventsHistory {
    history: EventHistory[];
}

export interface EventHistory {
    eventNarrative: string | null;
    action: ActionType;
    hadEvent: boolean;
    timestamp: number;
}
