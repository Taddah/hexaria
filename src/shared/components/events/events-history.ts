import { ActionType } from "$shared/index";

export interface IEventsHistory {
    history: EventHistory[];
}

export interface EventHistory {
    action: ActionType;
    hadEvent: boolean;
    timestamp: number;
}
