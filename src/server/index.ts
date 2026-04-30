import { World } from './core/World';
import { MapGenerator } from './core/map/MapGenerator';
import { runAgingSystem } from './systems/AgingSystem';
import { NetworkSystem } from './systems/NetworkSystem';
import { runMovementSystem } from './systems/MovementSystem';
import { runHarvestSystem } from './systems/HarvestSystem';
import { EventRegistry } from './core/EventRegistry';
import { runEventSystem } from './systems/EventSystem';
import { runResourceRenewalSystem } from './systems/ResourceRenewalSystem';

function bootstrap() {
  const world = new World();
  const mapGen = new MapGenerator();

  EventRegistry.loadAll();

  const map = mapGen.generateMap(50, 50);
  console.log(`[INIT] Carte générée avec ${map.length} tuiles.`);

  const network = new NetworkSystem(3000, world, map);


  //Main heartbeat
  let tickCount = 0;
  setInterval(() => {
    tickCount++;
    if (tickCount % 1000 === 0) {
      runAgingSystem(world);
    }

    runMovementSystem(world, map);
    runEventSystem(world);

    const renewed = runResourceRenewalSystem(map);

    const harvestOccurred = runHarvestSystem(world, map);
    if (harvestOccurred || renewed.length > 0) network.broadcastMapUpdate();


    network.broadcastWorldState();

    if (tickCount >= 10000) tickCount = 0;
  }, 100);
}

bootstrap();
