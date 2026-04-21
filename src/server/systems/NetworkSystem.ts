import { Server, Socket } from 'socket.io';
import { World } from '../core/World';
import { HexTile } from '../core/MapGenerator';
import { IAge, IIdentity, IInventory, IMovementIntent, IPosition } from '$shared/components';

export class NetworkSystem {
    private io: Server;

    constructor(port: number, private world: World, private map: HexTile[]) {
        this.io = new Server(port, {
            cors: { origin: '*', methods: ['GET', 'POST'] }
        });

        console.log(`[NETWORK] Serveur WebSocket démarré sur le port ${port}`);

        this.io.on('connection', (socket: Socket) => {
            console.log(`[NETWORK] Nouveau client connecté: ${socket.id}`);

            socket.emit('map_init', this.map);
            socket.emit('world_update', this.getWorldState());

            socket.on('request_move', (target: { q: number; r: number }) => {
                const heroId = this.findHeroId();
                if (heroId === undefined) return;

                const pos = this.world.getComponent<IPosition>(heroId, 'Position');
                if (!pos) return;

                const distance =
                    (Math.abs(pos.q - target.q) +
                        Math.abs(pos.r - target.r) +
                        Math.abs(pos.q + pos.r - target.q - target.r)) / 2;
                if (distance !== 1) return;

                const tile = this.map.find(t => t.q === target.q && t.r === target.r);
                if (!tile || tile.type === 'WATER') return;

                this.world.addComponent<IMovementIntent>(heroId, 'MovementIntent', {
                    targetQ: target.q,
                    targetR: target.r
                });
            });

            socket.on('disconnect', () => {
                console.log(`[NETWORK] Client déconnecté: ${socket.id}`);
            });
        });
    }

    private findHeroId(): number | undefined {
        return Array.from(this.world.query(['Position', 'Identity'])).find(
            id => this.world.getComponent<IIdentity>(id, 'Identity')?.name === 'Héros Test'
        );
    }

    private getWorldState(): object[] {
        const entities = this.world.query(['Position', 'Identity']);
        const worldState: object[] = [];

        for (const entity of entities) {
            const pos = this.world.getComponent<IPosition>(entity, 'Position');
            const identity = this.world.getComponent<IIdentity>(entity, 'Identity');
            const age = this.world.getComponent<IAge>(entity, 'Age');
            const inventory = this.world.getComponent<IInventory>(entity, 'Inventory');

            if (pos && identity) {
                worldState.push({ id: entity, position: pos, identity, age, inventory });
            }
        }

        return worldState;
    }

    broadcastWorldState(): void {
        this.io.emit('world_update', this.getWorldState());
    }
}
