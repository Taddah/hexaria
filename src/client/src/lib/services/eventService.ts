import { gameState } from '$lib/stores/gameState.svelte';
import { writable } from 'svelte/store';
import type { Socket } from 'socket.io-client';
import type { DefaultEventsMap } from 'socket.io';

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


export function processGameEvents(socket: Socket<DefaultEventsMap, DefaultEventsMap>) {
    const pending = gameState.localPlayer?.gameEvents?.events?.filter(e => e.status === 'PENDING') ?? [];
    pending.forEach(event => {
        addGameEvent(event.event.description);

    });
}