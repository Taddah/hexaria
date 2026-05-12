import { Socket } from 'socket.io'
import { World } from '../core/World'
import { PlayerRegistry } from '../core/PlayerRegistry'
import {
    TRADE_SESSION_COMPONENT,
    TRADE_TAG_COMPONENT,
    EMPTY_OFFER,
    type TradeSessionComponent,
    type TradeTagComponent,
    type CancelReason,
    type TradeRequestPayload,
    type TradeRespondPayload,
    type TradeUpdateOfferPayload,
    type TradeLockPayload,
    type TradeCancelPayload,
} from '$shared'
import {
    POSITION_COMPONENT,
    PLAYER_COMPONENT,
    type PositionComponent,
    type PlayerComponent,
} from '$shared'
import { findEntityByUserId } from './utils'
import { randomUUID } from 'crypto'

export class TradeHandler {
    constructor(private world: World, private registry: PlayerRegistry) { }

    register(socket: Socket) {
        const userId = socket.data.userId as string

        // ── trade_request ────────────────────────────────────────────────────────
        socket.on('trade_request', (payload: TradeRequestPayload) => {
            console.log("trade_request", payload)
            const initiatorEntity = findEntityByUserId(this.world, userId)
            if (initiatorEntity === undefined) return

            const targetEntity = payload.targetId

            // Les deux ne doivent pas déjà être en session
            if (this.world.getComponent(initiatorEntity, TRADE_TAG_COMPONENT)) return
            if (this.world.getComponent(targetEntity, TRADE_TAG_COMPONENT)) return

            // Même tile
            const posA = this.world.getComponent<PositionComponent>(initiatorEntity, POSITION_COMPONENT)
            const posB = this.world.getComponent<PositionComponent>(targetEntity, POSITION_COMPONENT)
            if (!posA || !posB) return
            if (posA.q !== posB.q || posA.r !== posB.r) return

            // Création de l'entité session
            const sessionEntity = this.world.createEntity()


            const session: TradeSessionComponent = {
                id: randomUUID(),
                playerA: initiatorEntity,
                playerB: targetEntity,
                offerA: { ...EMPTY_OFFER },
                offerB: { ...EMPTY_OFFER },
                lockedA: false,
                lockedB: false,
                status: 'PENDING',
                expiresAt: Date.now() + 15_000,
            }
            this.world.addComponent(sessionEntity, TRADE_SESSION_COMPONENT, session);

            console.log("session", session);

            // Tags sur les joueurs
            const tag: TradeTagComponent = { sessionEntity }
            this.world.addComponent(initiatorEntity, TRADE_TAG_COMPONENT, tag)
            this.world.addComponent(targetEntity, TRADE_TAG_COMPONENT, tag)

            // Notifier B uniquement
            const userB = getUserIdByEntity(this.world, targetEntity)
            if (userB) {
                console.log("trade_invite", { session })
                emitToPlayer(this.registry, userB, 'trade_invite', { session })
            }
        })

        // ── trade_respond ────────────────────────────────────────────────────────

        socket.on('trade_respond', (payload: TradeRespondPayload) => {
            const sessionEntity = findSessionEntity(this.world, payload.sessionId)
            if (sessionEntity === undefined) return

            const session = getSession(this.world, sessionEntity)
            if (!session || session.status !== 'PENDING') return

            // Seul B peut répondre
            const responderEntity = findEntityByUserId(this.world, userId)
            if (responderEntity !== session.playerB) return

            if (!payload.accept) {
                cancelSession(this.world, this.registry, sessionEntity, 'REFUSED')
                return
            }

            session.status = 'ACTIVE'
            session.expiresAt = 0   // plus de timeout une fois ACTIVE

            emitToSession(this.world, this.registry, session, 'trade_update', { session })
        })

        // ── trade_update_offer ───────────────────────────────────────────────────

        socket.on('trade_update_offer', (payload: TradeUpdateOfferPayload) => {
            const sessionEntity = findSessionEntity(this.world, payload.sessionId)
            if (sessionEntity === undefined) return

            const session = getSession(this.world, sessionEntity)
            if (!session || session.status !== 'ACTIVE') return

            const playerEntity = findEntityByUserId(this.world, userId)
            if (playerEntity === undefined) return

            const isA = playerEntity === session.playerA
            const isB = playerEntity === session.playerB
            if (!isA && !isB) return

            if (isA) {
                session.offerA = payload.offer
                session.lockedA = false   // modification → délock automatique
            } else {
                session.offerB = payload.offer
                session.lockedB = false
            }

            // Si l'autre avait validé → on l'invalide aussi
            if (isA && session.lockedB) session.lockedB = false
            if (isB && session.lockedA) session.lockedA = false

            emitToSession(this.world, this.registry, session, 'trade_update', { session })
        })

        // ── trade_lock ───────────────────────────────────────────────────────────

        socket.on('trade_lock', (payload: TradeLockPayload) => {
            const sessionEntity = findSessionEntity(this.world, payload.sessionId)
            if (sessionEntity === undefined) return

            const session = getSession(this.world, sessionEntity)
            if (!session || session.status !== 'ACTIVE') return

            const playerEntity = findEntityByUserId(this.world, userId)
            if (playerEntity === undefined) return

            const isA = playerEntity === session.playerA
            const isB = playerEntity === session.playerB
            if (!isA && !isB) return

            if (isA) session.lockedA = true
            if (isB) session.lockedB = true

            // Les deux ont validé → transfert
            if (session.lockedA && session.lockedB) {
                executeTransfer(this.world, this.registry, sessionEntity, session)
                return
            }

            emitToSession(this.world, this.registry, session, 'trade_update', { session })
        })

        // ── trade_cancel ─────────────────────────────────────────────────────────

        socket.on('trade_cancel', (payload: TradeCancelPayload) => {
            const sessionEntity = findSessionEntity(this.world, payload.sessionId)
            if (sessionEntity === undefined) return

            const session = getSession(this.world, sessionEntity)
            if (!session) return

            // Seuls A ou B peuvent annuler
            const playerEntity = findEntityByUserId(this.world, userId)
            if (playerEntity !== session.playerA && playerEntity !== session.playerB) return

            cancelSession(this.world, this.registry, sessionEntity, 'MANUAL')
        })
    }
}

// ─── Helpers internes ─────────────────────────────────────────────────────────

function findSessionEntity(world: World, sessionId: string): number | undefined {
    const entities = world.query([TRADE_SESSION_COMPONENT])
    return entities.find(e => {
        const s = world.getComponent<TradeSessionComponent>(e, TRADE_SESSION_COMPONENT)
        return s?.id === sessionId
    })
}

function getSession(world: World, sessionEntity: number): TradeSessionComponent | undefined {
    return world.getComponent<TradeSessionComponent>(sessionEntity, TRADE_SESSION_COMPONENT) ?? undefined
}

function getUserIdByEntity(world: World, entity: number): string | undefined {
    return world.getComponent<PlayerComponent>(entity, PLAYER_COMPONENT)?.userId
}

function emitToPlayer(
    registry: PlayerRegistry,
    userId: string,
    event: string,
    data: unknown,
) {
    const socket = registry.getSocketByUserId(userId)
    socket?.emit(event, data)
}

function emitToSession(
    world: World,
    registry: PlayerRegistry,
    session: TradeSessionComponent,
    event: string,
    data: unknown,
) {
    const userA = getUserIdByEntity(world, session.playerA)
    const userB = getUserIdByEntity(world, session.playerB)
    if (userA) emitToPlayer(registry, userA, event, data)
    if (userB) emitToPlayer(registry, userB, event, data)
}

// ─── Nettoyage ECS ────────────────────────────────────────────────────────────

function cleanupSession(world: World, sessionEntity: number, session: TradeSessionComponent) {
    world.removeComponent(session.playerA, TRADE_TAG_COMPONENT)
    world.removeComponent(session.playerB, TRADE_TAG_COMPONENT)
    world.deleteEntity(sessionEntity)
}

// ─── Export : annulation depuis d'autres systems ──────────────────────────────

export function cancelSession(
    world: World,
    registry: PlayerRegistry,
    sessionEntity: number,
    reason: CancelReason,
): void {
    const session = getSession(world, sessionEntity)
    if (!session) return
    if (session.status === 'CONFIRMED' || session.status === 'CANCELLED') return

    session.status = 'CANCELLED'

    emitToSession(world, registry, session, 'trade_cancelled', {
        sessionId: session.id,
        reason,
    })

    cleanupSession(world, sessionEntity, session)
}

// ─── Transfert atomique ───────────────────────────────────────────────────────

import {
    INVENTORY_COMPONENT,
    type InventoryComponent,
} from '$shared'

function executeTransfer(
    world: World,
    registry: PlayerRegistry,
    sessionEntity: number,
    session: TradeSessionComponent,
): void {
    const invA = world.getComponent<InventoryComponent>(session.playerA, INVENTORY_COMPONENT)
    const invB = world.getComponent<InventoryComponent>(session.playerB, INVENTORY_COMPONENT)

    if (!invA || !invB) {
        cancelSession(world, registry, sessionEntity, 'INSUFFICIENT_FUNDS')
        return
    }

    // Vérification finale
    const offerA = session.offerA
    const offerB = session.offerB

    if (
        invA.wood < offerA.wood ||
        invA.stone < offerA.stone ||
        invA.silver < offerA.silver ||
        invB.wood < offerB.wood ||
        invB.stone < offerB.stone ||
        invB.silver < offerB.silver
    ) {
        cancelSession(world, registry, sessionEntity, 'INSUFFICIENT_FUNDS')
        return
    }

    // Transfert atomique
    invA.wood -= offerA.wood; invA.stone -= offerA.stone; invA.silver -= offerA.silver
    invB.wood -= offerB.wood; invB.stone -= offerB.stone; invB.silver -= offerB.silver

    invA.wood += offerB.wood; invA.stone += offerB.stone; invA.silver += offerB.silver
    invB.wood += offerA.wood; invB.stone += offerA.stone; invB.silver += offerA.silver

    session.status = 'CONFIRMED'

    emitToSession(world, registry, session, 'trade_confirmed', {
        sessionId: session.id,
    })

    cleanupSession(world, sessionEntity, session)
}

// ─── Handler principal ────────────────────────────────────────────────────────

export function registerTradeHandlers(
    socket: Socket,
    registry: PlayerRegistry,
    world: World,
): void {

}
