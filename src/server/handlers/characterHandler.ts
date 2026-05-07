import { Socket } from "socket.io";
import { World } from "../core/World";
import { PlayerRegistry } from "../core/PlayerRegistry";
import { PlayerFactory } from "../factories/PlayerFactory";
import { getWorldState, serializePlayerComponents } from "./utils";
import { TileData, TileType } from "$shared/types";
import { PlayerPersistenceService } from "../services/PlayerPersistenceService";

export class CharacterHandler {
    private persistence = new PlayerPersistenceService();

    constructor(
        private world: World,
        private map: TileData[],
        private registry: PlayerRegistry
    ) { }

    register(socket: Socket) {
        const userId = socket.data.userId as string;

        socket.on('get_character', async () => {
            try {
                const result = await this.persistence.hasCharacter(userId);
                socket.emit('character_info', {
                    hasCharacter: result.exists,
                    firstName: result.firstName,
                    lastName: result.lastName
                });
            } catch (err) {
                console.error('[CharacterHandler] get_character error:', err);
                socket.emit('character_error', 'Erreur lors du chargement du personnage.');
            }
        });

        socket.on('create_character', async (data: { firstName: string; lastName: string }) => {
            try {
                const existing = await this.persistence.hasCharacter(userId);
                if (existing.exists) {
                    socket.emit('character_error', 'Un personnage existe déjà.');
                    return;
                }

                const startPosition = this.findSpawnPosition();
                const entityId = PlayerFactory.create({
                    socketId: socket.id,
                    userId,
                    world: this.world,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    age: 0,
                    startPosition
                });

                const components = serializePlayerComponents(this.world, entityId);
                await this.persistence.createPlayer(userId, data.firstName, data.lastName, components);

                this.registry.register(userId, entityId, socket);
                this.sendGameData(socket, entityId);
            } catch (err) {
                console.error('[CharacterHandler] create_character error:', err);
                socket.emit('character_error', 'Erreur lors de la création du personnage.');
            }
        });

        socket.on('join_game', async () => {
            try {
                const playerData = await this.persistence.loadPlayer(userId);
                if (!playerData) {
                    socket.emit('character_error', 'Aucun personnage trouvé.');
                    return;
                }

                const entityId = PlayerFactory.createFromComponents({
                    socketId: socket.id,
                    userId,
                    world: this.world,
                    components: playerData.components
                });

                this.registry.register(userId, entityId, socket);
                this.sendGameData(socket, entityId);
            } catch (err) {
                console.error('[CharacterHandler] join_game error:', err);
                socket.emit('character_error', 'Erreur lors du chargement de la partie.');
            }
        });
    }

    private sendGameData(socket: Socket, entityId: number) {
        const CHUNK_SIZE = 500;
        for (let i = 0; i < this.map.length; i += CHUNK_SIZE) {
            socket.emit('map_chunk', {
                tiles: this.map.slice(i, i + CHUNK_SIZE),
                total: this.map.length,
                done: i + CHUNK_SIZE >= this.map.length
            });
        }

        socket.emit('world_update', getWorldState(this.world));
        socket.emit('player_init', { entityId });
    }

    private findSpawnPosition(): { q: number; r: number } {
        const coastTiles = this.map.filter(t => t.type.includes('COAST'));

        if (coastTiles.length > 0) {
            const randomCoast = coastTiles[Math.floor(Math.random() * coastTiles.length)];
            if (randomCoast) {
                const neighbors = this.map.filter(t =>
                    t.type === TileType.LAND &&
                    Math.abs(t.q - randomCoast.q) <= 1 &&
                    Math.abs(t.r - randomCoast.r) <= 1 &&
                    Math.abs(-t.q - t.r - (-randomCoast.q - randomCoast.r)) <= 1
                );
                const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
                if (pick) return { q: pick.q, r: pick.r };
            }
        }

        const validTiles = this.map.filter(t => t.type === TileType.LAND || t.type.includes('COAST'));
        const fallback = validTiles[Math.floor(Math.random() * validTiles.length)];
        return fallback ? { q: fallback.q, r: fallback.r } : { q: 25, r: 25 };
    }
}