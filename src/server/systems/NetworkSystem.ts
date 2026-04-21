import { Server, Socket } from 'socket.io';
import { World } from '../core/World';
import { HexTile } from '../core/MapGenerator';
import { IPosition, IAge, IIdentity, IInventory } from '$shared/components';

export class NetworkSystem {
    private io: Server;

    constructor(port: number, private world: World, private map: HexTile[]) {
        this.io = new Server(port, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        console.log(`[NETWORK] Serveur WebSocket démarré sur le port ${port}`);

        this.io.on('connection', (socket: Socket) => {
            console.log(`[NETWORK] Nouveau client connecté: ${socket.id}`);

            socket.emit('map_init', this.map);
            socket.emit('world_update', this.getWorldState());

            socket.on('disconnect', () => {
                console.log(`[NETWORK] Client déconnecté: ${socket.id}`);
            });
        });
    }


    private getWorldState(): any[] {
        const entities = this.world.query(['Position', 'Identity']);
        const worldState: any[] = [];

        for (const entity of entities) {
            const pos = this.world.getComponent<IPosition>(entity, 'Position');
            const identity = this.world.getComponent<IIdentity>(entity, 'Identity');
            const age = this.world.getComponent<IAge>(entity, 'Age');
            const inventory = this.world.getComponent<IInventory>(entity, 'Inventory');

            if (pos && identity) {
                worldState.push({
                    id: entity,
                    position: pos,
                    identity: identity,
                    age: age,
                    inventory: inventory
                });
            }
        }
        return worldState;
    }

    broadcastWorldState(): void {
        this.io.emit('world_update', this.getWorldState());
    }
}
