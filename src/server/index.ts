import { World } from './core/World';
import { MapGenerator } from './core/map/MapGenerator';
import { runAgingSystem } from './systems/AgingSystem';
import { NetworkSystem } from './systems/NetworkSystem';
import { runMovementSystem } from './systems/MovementSystem';
import { runHarvestSystem } from './systems/HarvestSystem';
import { EventRegistry } from './core/EventRegistry';
import { runEventSystem } from './systems/EventSystem';
import { runResourceRenewalSystem } from './systems/ResourceRenewalSystem';
import { getTimeState } from './systems/TimeSystem';
import { runBodySystem } from './systems/BodySystem';
import { DAY_CYCLE_DURATION_MS, DAY_START } from '$shared/config';

function bootstrap() {
  const world = new World();
  const mapGen = new MapGenerator();

  EventRegistry.loadAll();

  const map = mapGen.generateMap(300, 300);
  console.log(`[INIT] Carte générée avec ${map.length} tuiles.`);

  const network = new NetworkSystem(3000, world, map);

  const DAY_START_MS = DAY_START * DAY_CYCLE_DURATION_MS; // offset en ms du début du jour
  const serverStartTime = Date.now() - DAY_START_MS;
  //Main heartbeat
  let tickCount = 0;
  setInterval(() => {
    tickCount++;

    runMovementSystem(world, map, (socketId, pos) => {
      network.emitTo(socketId, 'move_confirmed', pos);
    });
    runEventSystem(world);
    runBodySystem(world);

    const renewed = runResourceRenewalSystem(map);

    const harvestOccurred = runHarvestSystem(world, map);
    if (harvestOccurred || renewed.length > 0) network.broadcastMapUpdate();

    if (tickCount % 10 === 0) {
      const timeState = getTimeState(serverStartTime);
      network.broadcastTimeUpdate(timeState);
    }

    network.broadcastWorldState();

    if (tickCount >= 10000) tickCount = 0;
  }, 100);


  const AGING_INTERVAL = 12 * 60 * 60 * 1000; // 12h par année dans le jeu
  setInterval(() => {
    runAgingSystem(world);
  }, AGING_INTERVAL);
}

bootstrap();
