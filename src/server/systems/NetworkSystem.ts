import { Server, Socket } from 'socket.io';
import { World } from '../core/World';
import { HexTile } from '../core/MapGenerator';
import { findEntityBySocket, getWorldState } from '../handlers/utils';
import { PlayerFactory } from '../factories/PlayerFactory';
import { HarvestHandler } from '../handlers/harvestHandler';
import { MovementHandler } from '../handlers/movementHandler';
import { EventHandler } from '../handlers/eventHandler';

export class NetworkSystem {
    private io: Server;

    private harvestHandler: HarvestHandler;
    private movementHandler: MovementHandler;
    private eventHandler: EventHandler;

    private previousWorldState = {};

    constructor(port: number, private world: World, private map: HexTile[]) {
        this.io = new Server(port, {
            cors: { origin: '*', methods: ['GET', 'POST'] }
        });

        console.log(`[NETWORK] Serveur WebSocket démarré sur le port ${port}`);

        this.harvestHandler = new HarvestHandler(this.world, this.map);
        this.movementHandler = new MovementHandler(this.world, this.map);
        this.eventHandler = new EventHandler(this.world);

        this.io.on('connection', (socket: Socket) => {

            const playerId = PlayerFactory.create({
                socketId: socket.id,
                world: this.world,
                name: `Joueur_${socket.id}`,
                age: 0
            });

            this.harvestHandler.register(socket);
            this.movementHandler.register(socket);
            this.eventHandler.register(socket);

            socket.emit('player_init', { entityId: playerId });
            socket.emit('map_init', this.map);
            socket.emit('world_update', getWorldState(this.world));

            socket.on('disconnect', () => {
                console.log(`[NETWORK] Client déconnecté: ${socket.id}`);
                const entityId = findEntityBySocket(this.world, socket.id);
                if (entityId !== undefined) {
                    this.world.deleteEntity(entityId);
                    this.broadcastWorldState();
                }
            });
        });
    }



    broadcastWorldState(): void {
        const world = JSON.stringify(getWorldState(this.world));

        if (world === this.previousWorldState) {
            return;
        }

        this.io.emit('world_update', JSON.parse(world));
        this.previousWorldState = world;
    }

    broadcastMapUpdate(): void {
        this.io.emit('map_update', this.map);
    }
}
