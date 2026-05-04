import { io, type Socket } from 'socket.io-client';
import type { TileData, TimeState } from '$shared';
import { gameState } from '$lib/stores/gameState.svelte';
import { goto } from '$app/navigation';
import { isMoving, onMoveConfirmed } from './movementService';

const SERVER_URL = 'http://localhost:3000';

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
    if (!socketInstance) throw new Error('Socket not initialized');
    return socketInstance;
}

export function initializeSocket() {
    console.log('[CLIENT NETWORK] Connexion au serveur...');
    const socket = io(SERVER_URL);
    socketInstance = socket;

    socket.on('connect', () => {
        console.log(`[CLIENT NETWORK] Connecté au serveur: ${socket.id}`);
    });

    socket.on('player_init', (data: { entityId: number }) => {
        gameState.localPlayer = gameState.entities.find(e => e.id === data.entityId) ?? null;
        goto('/game');

    });

    socket.on('map_chunk', ({ tiles, done }: { tiles: TileData[], done: boolean }) => {
        tiles.forEach(tile => {
            gameState.map[`${tile.q},${tile.r}`] = tile;
        });

        if (done) {
            gameState.mapLoaded = true;
        }
    });

    socket.on('map_update', (mapData: TileData[]) => {
        const record: Record<string, TileData> = {};
        mapData.forEach(tile => { record[`${tile.q},${tile.r}`] = tile; });
        gameState.map = record;
    });

    socket.on('time_update', (time: TimeState) => {
        gameState.time.timeOfDay = time.timeOfDay;
        gameState.time.isDay = time.isDay;
        gameState.time.visionRadius = time.visionRadius;
    });

    socket.on('tile_update', (updatedTiles: TileData[]) => {
        const newMap = { ...gameState.map };

        updatedTiles.forEach(tile => {
            const key = `${tile.q},${tile.r}`;
            newMap[key] = { ...tile };
        });

        gameState.map = newMap;
        gameState.updatedTiles = updatedTiles;
    });


    socket.on('world_update', (entities) => {
        gameState.entities = entities;
        const fresh = gameState.entities.find(e => e.id === gameState.localPlayer?.id) ?? null;
        if (!fresh) return;

        gameState.localPlayer = {
            ...fresh,
            position: isMoving() ? gameState.localPlayer!.position : fresh.position
        };
    });

    socket.on('move_confirmed', (pos: { q: number, r: number }) => {
        onMoveConfirmed(pos);
    });

    socket.on('disconnect', () => {
        console.warn('[CLIENT NETWORK] Déconnecté du serveur');
        gameState.localPlayer = null;
    });

    return socket;
}
