import { io } from 'socket.io-client';
import type { TileData } from '$shared';
import { gameState } from '$lib/stores/gameState.svelte';

const SERVER_URL = 'http://localhost:3000';

export function initializeSocket() {
    console.log('[CLIENT NETWORK] Connexion au serveur...');
    const socket = io(SERVER_URL);

    socket.on('connect', () => {
        console.log(`[CLIENT NETWORK] Connecté au serveur: ${socket.id}`);
    });

    socket.on('player_init', (data: { entityId: number }) => {
        console.log("init player with id: ", data.entityId);
        gameState.localPlayer = gameState.entities.find(e => e.id === data.entityId) ?? null;
        console.log("localPlayer: ", gameState.localPlayer);
    });

    socket.on('full_map', (fullMap: TileData[]) => {
        const mapRecord: Record<string, TileData> = {};
        fullMap.forEach(tile => {
            mapRecord[`${tile.q},${tile.r}`] = tile;
        });
        gameState.map = mapRecord;
    });

    socket.on('map_update', (mapData: TileData[]) => {
        const record: Record<string, TileData> = {};
        mapData.forEach(tile => { record[`${tile.q},${tile.r}`] = tile; });
        gameState.map = record;
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
        gameState.localPlayer = gameState.entities.find(e => e.id === gameState.localPlayer?.id) ?? null;
    });

    socket.on('disconnect', () => {
        console.warn('[CLIENT NETWORK] Déconnecté du serveur');
        gameState.localPlayer = null;
    });

    return socket;
}
