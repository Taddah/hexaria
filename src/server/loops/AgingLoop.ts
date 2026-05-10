import { WorldComponent, WORLD_COMPONENT } from "$shared/components/world";
import { World } from "../core/World";
import { WorldPersistenceService, WorldMeta } from "../services/WorldPersistenceService";
import { runAgingSystem } from "../systems/AgingSystem";

export class AgingLoop {
    private timer: ReturnType<typeof setInterval> | null = null;
    private readonly INTERVAL = 12 * 60 * 60 * 1000;

    constructor(
        private world: World,
        private worldEntity: number,
        private worldPersistence: WorldPersistenceService,
        private worldMeta: WorldMeta
    ) { }

    start() {
        this.timer = setInterval(() => this.tick(), this.INTERVAL);
    }

    stop() {
        if (this.timer) clearInterval(this.timer);
    }

    private async tick() {
        const worldData = this.world.getComponent<WorldComponent>(this.worldEntity, WORLD_COMPONENT);
        if (worldData) worldData.year++;

        runAgingSystem(this.world);

        const currentYear = worldData?.year ?? 1;
        this.worldMeta.gameTime = { ...this.worldMeta.gameTime, year: currentYear };
        await this.worldPersistence.saveWorldMeta(this.worldMeta);

        console.log(`[AGING] Année ${currentYear}`);
    }
}
