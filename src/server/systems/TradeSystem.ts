import { World } from '../core/World'
import { PlayerRegistry } from '../core/PlayerRegistry'
import { TRADE_SESSION_COMPONENT, type TradeSessionComponent } from '$shared'
import { cancelSession } from '../handlers/tradeHandler'

export function runTradeSystem(world: World, registry: PlayerRegistry): void {
    const now = Date.now()
    const entities = world.query([TRADE_SESSION_COMPONENT])

    for (const entity of entities) {
        const session = world.getComponent<TradeSessionComponent>(
            entity,
            TRADE_SESSION_COMPONENT,
        )
        if (!session) continue
        if (session.status !== 'PENDING') continue
        if (session.expiresAt > now) continue

        cancelSession(world, registry, entity, 'TIMEOUT')
    }
}