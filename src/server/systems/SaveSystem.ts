import { World } from '../core/World';
import { PlayerRegistry } from '../core/PlayerRegistry';
import { PlayerPersistenceService } from '../services/PlayerPersistenceService';
import { WorldPersistenceService } from '../services/WorldPersistenceService';
import { serializePlayerComponents } from '../handlers/utils';
import { TileData } from '$shared/types';
import { PLAYER_COMPONENT, PlayerComponent } from '$shared/components';

const SAVE_INTERVAL_MS = 5 * 60 * 1000;

export class SaveSystem {
    private playerPersistence = new PlayerPersistenceService();
    private worldPersistence = new WorldPersistenceService();
    private timer: ReturnType<typeof setInterval> | null = null;
    private dirtyTiles = new Map<string, TileData>();

    constructor(
        private world: World,
        private registry: PlayerRegistry,
        private getGameTime: () => { timeOfDay: number; year: number },
        private seed: string
    ) { }

    start() {
        this.timer = setInterval(() => {
            this.saveAll().catch(err => {
                console.error('[SAVE] Periodic save failed:', err);
            });
        }, SAVE_INTERVAL_MS);

        console.log(`[SAVE] Auto-save démarré (toutes les ${SAVE_INTERVAL_MS / 1000}s)`);
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    markTileDirty(tile: TileData) {
        this.dirtyTiles.set(`${tile.q},${tile.r}`, tile);
    }

    async saveAll(): Promise<void> {
        const start = Date.now();
        const promises: Promise<void>[] = [];

        for (const [userId] of this.registry.getAllEntries()) {
            const entityId = this.registry.getEntityByUserId(userId);
            if (entityId === undefined) continue;

            const player = this.world.getComponent<PlayerComponent>(entityId, PLAYER_COMPONENT);
            if (!player) continue;

            const components = serializePlayerComponents(this.world, entityId);
            promises.push(this.playerPersistence.savePlayer(userId, components));
        }

        promises.push(
            this.worldPersistence.saveWorldMeta({
                seed: this.seed,
                gameTime: {
                    timeOfDay: this.getGameTime().timeOfDay,
                    year: this.getGameTime().year,
                }
            })
        );

        if (this.dirtyTiles.size > 0) {
            const mods = Array.from(this.dirtyTiles.values()).map(t => ({
                q: t.q,
                r: t.r,
                modifications: {
                    type: t.type,
                    elevation: t.elevation,
                    biome: t.biome,
                    resource: t.resource
                }
            }));
            promises.push(this.worldPersistence.saveMapModifications(mods));
            this.dirtyTiles.clear();
        }

        await Promise.all(promises);
        console.log(`[SAVE] Save complète en ${Date.now() - start}ms (${this.registry.size} joueurs)`);
    }

    async savePlayer(userId: string): Promise<void> {
        const entityId = this.registry.getEntityByUserId(userId);
        if (entityId === undefined) return;

        const components = serializePlayerComponents(this.world, entityId);
        await this.playerPersistence.savePlayer(userId, components);
    }
}
