import { Server, Socket } from 'socket.io';
import { World } from '../core/World';
import { HexTile } from '../core/MapGenerator';
import { IAge, IEnergy, IIdentity, IInventory, IMovementIntent, IHarvestIntent, IPlayer, IPosition } from '$shared/components';

export class NetworkSystem {
    private io: Server;

    constructor(port: number, private world: World, private map: HexTile[]) {
        this.io = new Server(port, {
            cors: { origin: '*', methods: ['GET', 'POST'] }
        });

        console.log(`[NETWORK] Serveur WebSocket démarré sur le port ${port}`);

        this.io.on('connection', (socket: Socket) => {
            console.log(`[NETWORK] Nouveau client connecté: ${socket.id}`);

            // Création de l'entité joueur associée à ce socket
            const entityId = this.world.createEntity();
            this.world.addComponent<IPlayer>(entityId, 'Player', { socketId: socket.id });
            this.world.addComponent<IPosition>(entityId, 'Position', { q: 25, r: 25 });
            this.world.addComponent<IAge>(entityId, 'Age', { current: 0, max: 100 });
            this.world.addComponent<IIdentity>(entityId, 'Identity', { name: `Joueur_${entityId}` });
            this.world.addComponent<IInventory>(entityId, 'Inventory', { wood: 0, iron: 0 });
            this.world.addComponent<IEnergy>(entityId, 'Energy', { current: 100, max: 100 });

            // Informer le client de son entité
            socket.emit('player_init', { entityId });
            socket.emit('map_init', this.map);
            socket.emit('world_update', this.getWorldState());

            socket.on('request_move', (target: { q: number; r: number }) => {
                const entityId = this.findEntityBySocket(socket.id);
                if (entityId === undefined) return;

                const pos = this.world.getComponent<IPosition>(entityId, 'Position');
                if (!pos) return;

                const energy = this.world.getComponent<IEnergy>(entityId, 'Energy');
                if (!energy || energy.current < 1) return;

                const distance =
                    (Math.abs(pos.q - target.q) +
                        Math.abs(pos.r - target.r) +
                        Math.abs(pos.q + pos.r - target.q - target.r)) / 2;
                if (distance !== 1) return;

                const tile = this.map.find(t => t.q === target.q && t.r === target.r);
                if (!tile || tile.type === 'WATER') return;

                this.world.addComponent<IMovementIntent>(entityId, 'MovementIntent', {
                    targetQ: target.q,
                    targetR: target.r
                });
            });

            socket.on('request_harvest', () => {
                const entityId = this.findEntityBySocket(socket.id);
                if (entityId === undefined) return;

                const pos = this.world.getComponent<IPosition>(entityId, 'Position');
                if (!pos) return;

                const energy = this.world.getComponent<IEnergy>(entityId, 'Energy');
                if (!energy || energy.current < 1) return;

                const tile = this.map.find(t => t.q === pos.q && t.r === pos.r);
                if (!tile?.resource || tile.resource.amount <= 0) return;

                this.world.addComponent<IHarvestIntent>(entityId, 'HarvestIntent', {
                    tileQ: pos.q,
                    tileR: pos.r
                });
            });

            socket.on('disconnect', () => {
                console.log(`[NETWORK] Client déconnecté: ${socket.id}`);
                const entityId = this.findEntityBySocket(socket.id);
                if (entityId !== undefined) {
                    this.world.deleteEntity(entityId);
                    this.broadcastWorldState();
                }
            });
        });
    }

    private findEntityBySocket(socketId: string): number | undefined {
        return Array.from(this.world.query(['Player'])).find(
            id => this.world.getComponent<IPlayer>(id, 'Player')?.socketId === socketId
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
            const energy = this.world.getComponent<IEnergy>(entity, 'Energy');

            if (pos && identity) {
                worldState.push({ id: entity, position: pos, identity, age, inventory, energy });
            }
        }

        return worldState;
    }

    broadcastWorldState(): void {
        this.io.emit('world_update', this.getWorldState());
    }

    broadcastMapUpdate(): void {
        this.io.emit('map_update', this.map);
    }
}
