import { ActionType, Event } from "$shared/index";

export const EVENTS_HISTORY_COMPONENT = 'EventsHistoryComponent';

export interface EventsHistoryComponent {
    history: EventHistory[];
}

export interface EventHistory {
    eventNarrative: string | null;
    isSignificant: boolean;
    action: ActionType[];
    hadEvent: boolean;
    timestamp: number;
    year: number;
    eventName: string;
}
