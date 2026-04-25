import { io } from 'socket.io-client';
import { mapStore, entitiesStore, myEntityIdStore, updatedTilesStore } from '../stores/gameStore';
import type { TileData } from '$shared';

const SERVER_URL = 'http://localhost:3000';

export function initializeSocket() {
    console.log('[CLIENT NETWORK] Connexion au serveur...');
    const socket = io(SERVER_URL);

    socket.on('connect', () => {
        console.log(`[CLIENT NETWORK] Connecté au serveur: ${socket.id}`);
    });

    socket.on('player_init', (data: { entityId: number }) => {
        myEntityIdStore.set(data.entityId);
    });

    socket.on('full_map', (fullMap: TileData[]) => {
        const mapRecord: Record<string, TileData> = {};
        fullMap.forEach(tile => {
            mapRecord[`${tile.q},${tile.r}`] = tile;
        });
        mapStore.set(mapRecord); // Initialise le store principal
    });

    socket.on('map_update', (mapData: TileData[]) => {
        const record: Record<string, TileData> = {};
        mapData.forEach(tile => { record[`${tile.q},${tile.r}`] = tile; });
        mapStore.set(record);
    });

    socket.on('tile_update', (updatedTiles: TileData[]) => {
        mapStore.update(currentMap => {
            const newMap = { ...currentMap };

            updatedTiles.forEach(tile => {
                const key = `${tile.q},${tile.r}`;
                newMap[key] = { ...tile };
            });

            return newMap;
        });

        updatedTilesStore.set(updatedTiles);
    });


    socket.on('world_update', (entities) => {
        entitiesStore.set(entities);
    });

    socket.on('disconnect', () => {
        console.warn('[CLIENT NETWORK] Déconnecté du serveur');
        myEntityIdStore.set(null);
    });

    return socket;
}
