import { World } from './core/World';
import { MapGenerator } from './core/MapGenerator';
import { IPosition, IAge, IIdentity, IInventory } from './shared/components';
import { runAgingSystem } from './systems/AgingSystem';

function bootstrap() {
  const world = new World();
  const mapGen = new MapGenerator();

  const map = mapGen.generateMap(50, 50);
  console.log(`[INIT] Carte générée avec ${map.length} tuiles.`);

  const player = world.createEntity();
  world.addComponent<IPosition>(player, 'Position', { q: 25, r: 25 });
  world.addComponent<IAge>(player, 'Age', { current: 18, max: 25 });
  world.addComponent<IIdentity>(player, 'Identity', { name: "Héros Test" });
  world.addComponent<IInventory>(player, 'Inventory', { wood: 50 });

  console.log(`[INIT] Joueur créé avec l'ID: ${player}`);

  setInterval(() => {
    runAgingSystem(world);
  }, 1000);
}

bootstrap();
