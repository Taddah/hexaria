import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });
import { World } from './core/World';
import { MapGenerator } from './core/map/MapGenerator';
import { runAgingSystem } from './systems/AgingSystem';
import { NetworkSystem } from './systems/NetworkSystem';
import { runMovementSystem } from './systems/MovementSystem';
import { runHarvestSystem } from './systems/HarvestSystem';
import { EventRegistry } from './core/EventRegistry';
import { runEventSystem } from './systems/EventSystem';
import { runResourceRenewalSystem } from './systems/ResourceRenewalSystem';
import { getCurrentYear, getTimeState, incrementYear, initYear } from './systems/TimeSystem';
import { runBodySystem } from './systems/BodySystem';
import { SaveSystem } from './systems/SaveSystem';
import { WorldPersistenceService } from './services/WorldPersistenceService';
import { DAY_CYCLE_DURATION_MS, DAY_START } from '$shared/config';
import { TileData } from '$shared/types';

async function bootstrap() {
  const worldPersistence = new WorldPersistenceService();

  let worldMeta = await worldPersistence.loadWorldMeta();
  if (!worldMeta) {
    worldMeta = { seed: "hexaria", gameTime: {} };
    await worldPersistence.saveWorldMeta(worldMeta);
    console.log('[INIT] World meta créée avec seed:', worldMeta.seed);
  } else {
    console.log('[INIT] World meta chargée, seed:', worldMeta.seed);
  }

  const world = new World();
  const mapGen = new MapGenerator(worldMeta.seed);
  initYear(typeof worldMeta.gameTime?.year === 'number' ? worldMeta.gameTime.year : 1);

  EventRegistry.loadAll();

  const map = mapGen.generateMap(300, 300);
  console.log(`[INIT] Carte générée avec ${map.length} tuiles.`);

  const mods = await worldPersistence.loadMapModifications();
  if (mods.length > 0) {
    applyModifications(map, mods);
    console.log(`[INIT] ${mods.length} modifications de tuiles appliquées.`);
  }

  const network = new NetworkSystem(3000, world, map);

  const DAY_START_MS = DAY_START * DAY_CYCLE_DURATION_MS;
  const serverStartTime = Date.now() - DAY_START_MS;

  const saveSystem = new SaveSystem(
    world,
    network.registry,
    () => {
      const timeState = getTimeState(serverStartTime);
      return {
        timeOfDay: timeState.timeOfDay,
        isDay: timeState.isDay,
        visionRadius: timeState.visionRadius,
        year: timeState.year
      };
    },
    worldMeta.seed
  );
  saveSystem.start();

  const gracefulShutdown = async () => {
    console.log('[SHUTDOWN] Sauvegarde en cours...');
    saveSystem.stop();
    await saveSystem.saveAll();
    console.log('[SHUTDOWN] Sauvegarde terminée. Arrêt.');
    process.exit(0);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  let tickCount = 0;
  setInterval(async () => {
    tickCount++;

    runMovementSystem(world, map, (userId, pos) => {
      network.emitToUser(userId, 'move_confirmed', pos);
    });
    await runEventSystem(world, network);
    runBodySystem(world);

    const renewed = runResourceRenewalSystem(map);

    const harvestOccurred = runHarvestSystem(world, map);
    if (harvestOccurred || renewed.length > 0) {
      network.broadcastMapUpdate();
      for (const tile of renewed) saveSystem.markTileDirty(tile);
    }

    if (harvestOccurred) {
      const harvestedTiles = map.filter(t => t.resource && t.resource.amount === 0);
      for (const tile of harvestedTiles) saveSystem.markTileDirty(tile);
    }

    if (tickCount % 10 === 0) {
      const timeState = getTimeState(serverStartTime);
      network.broadcastTimeUpdate(timeState);
    }

    network.broadcastWorldState();

    if (tickCount >= 10000) tickCount = 0;
  }, 100);

  const AGING_INTERVAL = 12 * 60 * 60 * 1000;
  setInterval(() => {
    incrementYear();
    runAgingSystem(world);

    worldMeta.gameTime.year = getCurrentYear();
  }, AGING_INTERVAL);
}

function applyModifications(map: TileData[], mods: { q: number; r: number; modifications: Record<string, unknown> }[]) {
  const tileMap = new Map<string, TileData>();
  for (const tile of map) tileMap.set(`${tile.q},${tile.r}`, tile);

  for (const mod of mods) {
    const tile = tileMap.get(`${mod.q},${mod.r}`);
    if (!tile) continue;
    Object.assign(tile, mod.modifications);
  }
}

bootstrap().catch(err => {
  console.error('[FATAL] Bootstrap failed:', err);
  process.exit(1);
});
