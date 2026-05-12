import { World } from './core/World';
import { MapGenerator } from './core/map/MapGenerator';
import { runAgingSystem } from './systems/AgingSystem';
import { NetworkSystem } from './systems/NetworkSystem';
import { runMovementSystem } from './systems/MovementSystem';
import { runHarvestSystem } from './systems/HarvestSystem';
import { EventRegistry } from './core/EventRegistry';
import { runEventSystem } from './systems/EventSystem';
import { runResourceRenewalSystem } from './systems/ResourceRenewalSystem';
import { getTimeState, initTimeOfDay, tickTimeOfDay } from './systems/TimeSystem';
import { runBodySystem } from './systems/BodySystem';
import { SaveSystem } from './systems/SaveSystem';
import { WorldMeta, WorldPersistenceService } from './services/WorldPersistenceService';
import { DAY_START } from '$shared/config';
import { TileData } from '$shared/types';
import { WORLD_COMPONENT, WorldComponent } from '$shared/components/world';
import { AgingLoop } from './loops/AgingLoop';
import { GameLoop } from './loops/GameLoop';
import { PlayerRegistry } from './core/PlayerRegistry';

const MAP_SIZE = 300;

export class GameServer {
    private world!: World;
    private worldEntity!: number;
    private network!: NetworkSystem;
    private saveSystem!: SaveSystem;
    private map!: TileData[];
    private worldPersistence!: WorldPersistenceService;
    private worldMeta!: WorldMeta;
    private registry!: PlayerRegistry;

    private agingLoop!: AgingLoop;
    private gameLoop!: GameLoop;

    async start() {
        await this.initPersistence();
        this.initWorld();
        await this.initMap();

        this.registry = new PlayerRegistry()

        this.initNetwork();
        this.initSaveSystem();
        this.initShutdownHandlers();



        this.agingLoop = new AgingLoop(this.world, this.worldEntity, this.worldPersistence, this.worldMeta);
        this.gameLoop = new GameLoop(this.world, this.map, this.network, this.saveSystem, this.registry);
        this.startLoops();
        console.log('[SERVER] Démarré');
    }

    async stop() {
        console.log('[SHUTDOWN] Sauvegarde en cours...');
        this.gameLoop.stop();
        this.agingLoop.stop();
        this.saveSystem.stop();
        await this.saveSystem.saveAll();
        console.log('[SHUTDOWN] Sauvegarde terminée. Arrêt.');
    }

    private async initPersistence() {
        this.worldPersistence = new WorldPersistenceService();

        const loaded = await this.worldPersistence.loadWorldMeta();
        if (!loaded) {
            this.worldMeta = { seed: 'hexaria', gameTime: { year: 1, timeOfDay: DAY_START } };
            await this.worldPersistence.saveWorldMeta(this.worldMeta);
            console.log('[INIT] World meta créée avec seed:', this.worldMeta.seed);
        } else {
            this.worldMeta = loaded;
            console.log('[INIT] World meta chargée, seed:', this.worldMeta.seed);
        }
    }

    private initWorld() {
        this.world = new World();

        this.worldEntity = this.world.createEntity();
        this.world.addComponent<WorldComponent>(this.worldEntity, WORLD_COMPONENT, {
            seed: this.worldMeta.seed,
            year: this.worldMeta.gameTime?.year ?? 1,
            timeOfDay: this.worldMeta.gameTime?.timeOfDay ?? DAY_START,
        });

        initTimeOfDay(this.worldMeta.gameTime?.timeOfDay ?? DAY_START);
        EventRegistry.loadAll();
    }

    private async initMap() {
        const mapGen = new MapGenerator(this.worldMeta.seed);
        this.map = mapGen.generateMap(MAP_SIZE, MAP_SIZE);
        console.log(`[INIT] Carte générée avec ${this.map.length} tuiles.`);

        const mods = await this.worldPersistence.loadMapModifications();
        if (mods.length > 0) {
            this.applyModifications(mods);
            console.log(`[INIT] ${mods.length} modifications de tuiles appliquées.`);
        }
    }

    private initNetwork() {
        this.network = new NetworkSystem(3000, this.world, this.map, this.registry);
    }

    private initSaveSystem() {
        this.saveSystem = new SaveSystem(
            this.world,
            this.registry,
            () => {
                const timeState = getTimeState();
                const worldData = this.world.getComponent<WorldComponent>(this.worldEntity, WORLD_COMPONENT);
                return {
                    timeOfDay: timeState.timeOfDay,
                    year: worldData?.year ?? 1
                };
            },
            this.worldMeta.seed
        );
        this.saveSystem.start();
    }

    private initShutdownHandlers() {
        const gracefulShutdown = async () => {
            await this.stop();
            process.exit(0);
        };

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
    }

    private startLoops() {
        this.gameLoop.start();
        this.agingLoop.start();
    }

    private applyModifications(mods: { q: number; r: number; modifications: Record<string, unknown> }[]) {
        const tileMap = new Map<string, TileData>();
        for (const tile of this.map) tileMap.set(`${tile.q},${tile.r}`, tile);

        for (const mod of mods) {
            const tile = tileMap.get(`${mod.q},${mod.r}`);
            if (!tile) continue;
            Object.assign(tile, mod.modifications);
        }
    }
}
