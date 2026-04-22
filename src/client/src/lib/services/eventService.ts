import { writable } from 'svelte/store';

export interface GameEvent {
    id: number;
    text: string;
    timestamp: Date;
}

export const eventsStore = writable<GameEvent[]>([]);

let eventId = 0;

export function addGameEvent(text: string) {
    eventsStore.update(events => {
        const newEvents = [...events, { id: eventId++, text, timestamp: new Date() }];
        // Conserve les 50 derniers événements
        if (newEvents.length > 50) newEvents.shift();
        return newEvents;
    });
}
