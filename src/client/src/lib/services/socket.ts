import { io } from 'socket.io-client';
import { mapStore, entitiesStore } from '../stores/gameStore';

const SERVER_URL = 'http://localhost:3000';

export function initializeSocket() {
    console.log('[CLIENT NETWORK] Connexion au serveur...');
    const socket = io(SERVER_URL);

    socket.on('connect', () => {
        console.log(`[CLIENT NETWORK] Connecté au serveur: ${socket.id}`);
    });

    socket.on('map_init', (mapData) => {
        console.log(`[CLIENT NETWORK] Réception de la map: ${mapData.length} tuiles`);
        mapStore.set(mapData);
    });

    socket.on('world_update', (entities) => {
        entitiesStore.set(entities);
    });

    socket.on('disconnect', () => {
        console.warn('[CLIENT NETWORK] Déconnecté du serveur');
    });

    return socket;
}
