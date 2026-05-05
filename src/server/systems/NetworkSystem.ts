import { Server, Socket } from 'socket.io';
import { World } from '../core/World';
import { findEntityBySocket, getWorldState } from '../handlers/utils';
import { HarvestHandler } from '../handlers/harvestHandler';
import { MovementHandler } from '../handlers/movementHandler';
import { EventHandler } from '../handlers/eventHandler';
import { TileData, type TimeState } from '$shared';
import { CharacterHandler } from '../handlers/characterHandler';

export class NetworkSystem {
    private io: Server;

    private harvestHandler: HarvestHandler;
    private movementHandler: MovementHandler;
    private eventHandler: EventHandler;
    private characterHandler: CharacterHandler;

    private previousWorldState: string = "";
    private previousMap: TileData[] = [];

    constructor(port: number, private world: World, private map: TileData[]) {
        this.io = new Server(port, {
            cors: { origin: '*', methods: ['GET', 'POST'] }
        });

        console.log(`[NETWORK] Serveur WebSocket démarré sur le port ${port}`);

        this.harvestHandler = new HarvestHandler(this.world, this.map);
        this.movementHandler = new MovementHandler(this.world, this.map);
        this.eventHandler = new EventHandler(this.world);
        this.characterHandler = new CharacterHandler(this.world, this.map);

        this.io.on('connection', (socket: Socket) => {

            this.harvestHandler.register(socket);
            this.movementHandler.register(socket);
            this.eventHandler.register(socket);
            this.characterHandler.register(socket);

            socket.on('disconnect', () => {
                console.log(`[NETWORK] Client déconnecté: ${socket.id}`);
                const entityId = findEntityBySocket(this.world, socket.id);
                if (entityId !== undefined) {
                    this.world.deleteEntity(entityId);
                    this.broadcastWorldState();
                }
            });
        });

        // Initialisation de la carte précédente pour éviter un broadcast complet au premier changement
        this.syncPreviousMap();
    }

    private syncPreviousMap() {
        this.previousMap = this.map.map(tile => ({
            ...tile,
            ...(tile.resource ? { resource: { ...tile.resource } } : {})
        }));
    }

    emitTo(socketId: string, event: string, data: unknown) {
        this.io.to(socketId).emit(event, data);
    }

    broadcastWorldState(): void {
        const world = JSON.stringify(getWorldState(this.world));

        if (world === this.previousWorldState) {
            return;
        }

        this.io.emit('world_update', JSON.parse(world));
        this.previousWorldState = world;
    }

    broadcastMapUpdate() {
        const diff = this.getMapDiff(this.map, this.previousMap);

        if (diff.length > 0) {
            this.io.emit('tile_update', diff);
        }

        this.syncPreviousMap();
    }

    broadcastTimeUpdate(time: TimeState) {
        this.io.emit('time_update', time);
    }

    private getMapDiff(currentMap: TileData[], previousMap: TileData[]): TileData[] {
        const diff: TileData[] = [];
        
        // Optimisation O(N) : comparaison par index car l'ordre est garanti
        for (let i = 0; i < currentMap.length; i++) {
            const currentTile = currentMap[i];
            const previousTile = previousMap[i];

            if (!currentTile) continue;

            if (!previousTile || JSON.stringify(previousTile) !== JSON.stringify(currentTile)) {
                diff.push(currentTile);
            }
        }

        return diff;
    }
}
