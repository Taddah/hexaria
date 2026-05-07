import { Server, Socket } from 'socket.io';
import { World } from '../core/World';
import { PlayerRegistry } from '../core/PlayerRegistry';
import { findEntityByUserId, getWorldState, serializePlayerComponents } from '../handlers/utils';
import { HarvestHandler } from '../handlers/harvestHandler';
import { MovementHandler } from '../handlers/movementHandler';
import { EventHandler } from '../handlers/eventHandler';
import { TileData, type TimeState } from '$shared';
import { CharacterHandler } from '../handlers/characterHandler';
import { supabase } from '../services/supabaseServer';
import { PlayerPersistenceService } from '../services/PlayerPersistenceService';

export class NetworkSystem {
    private io: Server;
    readonly registry: PlayerRegistry;

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

        this.registry = new PlayerRegistry();

        console.log(`[NETWORK] Serveur WebSocket démarré sur le port ${port}`);

        this.io.use(async (socket, next) => {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error('auth_required'));

            try {
                const { data: { user }, error } = await supabase.auth.getUser(token);
                if (error || !user) return next(new Error('auth_invalid'));
                socket.data.userId = user.id;
                next();
            } catch {
                next(new Error('auth_error'));
            }
        });

        this.harvestHandler = new HarvestHandler(this.world, this.map);
        this.movementHandler = new MovementHandler(this.world, this.map);
        this.eventHandler = new EventHandler(this.world);
        this.characterHandler = new CharacterHandler(this.world, this.map, this.registry);

        this.io.on('connection', (socket: Socket) => {
            console.log(`[NETWORK] Client authentifié: userId=${socket.data.userId}`);

            this.harvestHandler.register(socket);
            this.movementHandler.register(socket);
            this.eventHandler.register(socket);
            this.characterHandler.register(socket);

            socket.on('disconnect', async () => {
                const userId = socket.data.userId as string;
                console.log(`[NETWORK] Client déconnecté: userId=${userId}`);

                const entityId = findEntityByUserId(this.world, userId);
                if (entityId !== undefined) {
                    const persistence = new PlayerPersistenceService();
                    const components = serializePlayerComponents(this.world, entityId);
                    await persistence.savePlayer(userId, components);
                    console.log(`[SAVE] Joueur ${userId} sauvegardé au disconnect`);

                    this.world.deleteEntity(entityId);
                    this.broadcastWorldState();
                }

                this.registry.remove(userId);
            });
        });

        this.syncPreviousMap();
    }

    private syncPreviousMap() {
        this.previousMap = this.map.map(tile => ({
            ...tile,
            ...(tile.resource ? { resource: { ...tile.resource } } : {})
        }));
    }

    emitToUser(userId: string, event: string, data: unknown) {
        const socket = this.registry.getSocketByUserId(userId);
        if (socket) socket.emit(event, data);
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
