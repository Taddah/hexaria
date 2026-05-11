import { TileData } from "$shared/types";
import { ACTION_TAG_COMPONENT } from "$shared/components";
import { World } from "../core/World";
import { runBodySystem } from "../systems/BodySystem";
import { runDeathSystem } from "../systems/DeathSystem";
import { runEventSystem } from "../systems/EventSystem";
import { runHarvestSystem } from "../systems/HarvestSystem";
import { runMovementSystem } from "../systems/MovementSystem";
import { NetworkSystem } from "../systems/NetworkSystem";
import { runResourceRenewalSystem } from "../systems/ResourceRenewalSystem";
import { SaveSystem } from "../systems/SaveSystem";
import { getTimeState, tickTimeOfDay } from "../systems/TimeSystem";

export class GameLoop {
    private timer: ReturnType<typeof setInterval> | null = null;
    private tickCount = 0;

    constructor(
        private world: World,
        private map: TileData[],
        private network: NetworkSystem,
        private saveSystem: SaveSystem
    ) { }

    start() {
        this.timer = setInterval(() => this.tick(), 100);
    }

    stop() {
        if (this.timer) clearInterval(this.timer);
    }

    private async tick() {
        this.tickCount++;

        runMovementSystem(this.world, this.map, (userId, pos) => {
            this.network.emitToUser(userId, 'move_confirmed', pos);
        });
        await runEventSystem(this.world, this.network);
        runBodySystem(this.world);
        await runDeathSystem(this.world, this.network);

        const renewed = runResourceRenewalSystem(this.map);

        const harvestOccurred = runHarvestSystem(this.world, this.map);
        if (harvestOccurred || renewed.length > 0) {
            this.network.broadcastMapUpdate();
            for (const tile of renewed) this.saveSystem.markTileDirty(tile);
        }

        tickTimeOfDay(100);

        if (harvestOccurred) {
            const harvestedTiles = this.map.filter(t => t.resource && t.resource.amount === 0);
            for (const tile of harvestedTiles) this.saveSystem.markTileDirty(tile);
        }

        if (this.tickCount % 10 === 0) {
            const timeState = getTimeState();
            this.network.broadcastTimeUpdate(timeState);
        }

        this.network.broadcastWorldState();

        const actionEntities = this.world.query([ACTION_TAG_COMPONENT]);
        for (const entity of actionEntities) {
            this.world.removeComponent(entity, ACTION_TAG_COMPONENT);
        }

        if (this.tickCount >= 10000) this.tickCount = 0;
    }
}
