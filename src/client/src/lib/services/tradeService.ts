import { getSocket } from './socket'
import { gameState } from '$lib/stores/gameState.svelte'
import { tradeState } from '$lib/stores/tradeState.svelte'
import type {
    TradeRequestPayload,
    TradeRespondPayload,
    TradeUpdateOfferPayload,
    TradeLockPayload,
    TradeCancelPayload,
    TradeOffer,
    TradeInvitePayload,
    TradeUpdatePayload,
    TradeCancelledPayload,
    TradeConfirmedPayload,
} from '$shared'

// ─── Émissions client → serveur ───────────────────────────────────────────────

export function requestTrade(targetEntityId: number): void {
    getSocket().emit('trade_request', { targetId: targetEntityId } satisfies TradeRequestPayload)
}

export function respondTrade(sessionId: string, accept: boolean): void {
    getSocket().emit('trade_respond', { sessionId, accept } satisfies TradeRespondPayload)
}

export function updateOffer(sessionId: string, offer: TradeOffer): void {
    getSocket().emit('trade_update_offer', { sessionId, offer } satisfies TradeUpdateOfferPayload)
}

export function lockOffer(sessionId: string): void {
    getSocket().emit('trade_lock', { sessionId } satisfies TradeLockPayload)
}

export function cancelTrade(sessionId: string): void {
    getSocket().emit('trade_cancel', { sessionId } satisfies TradeCancelPayload)
}

// ─── Réception serveur → client ───────────────────────────────────────────────

export function registerTradeListeners(): void {
    const socket = getSocket()

    // Invitation reçue (côté B)
    socket.on('trade_invite', ({ session }: TradeInvitePayload) => {
        console.log("trade_invite", { session })
        const initiator = gameState.entities.find(e => e.id === session.playerA)
        tradeState.pendingInvite = {
            session,
            initiatorName: initiator?.identity?.firstName + ' ' + initiator?.identity?.lastName,
        }
    })

    // Mise à jour de la session (les deux joueurs)
    socket.on('trade_update', ({ session }: TradeUpdatePayload) => {
        tradeState.pendingInvite = null
        tradeState.session = session
    })

    // Annulation
    socket.on('trade_cancelled', ({ sessionId, reason }: TradeCancelledPayload) => {
        if (tradeState.session?.id !== sessionId && tradeState.pendingInvite?.session.id !== sessionId) return

        tradeState.session = null
        tradeState.pendingInvite = null

        // Le composant TradePanel réagit à session === null,
        // on passe la raison via un événement DOM léger pour l'UI toast
        window.dispatchEvent(new CustomEvent('trade:cancelled', { detail: { reason } }))
    })

    // Confirmation
    socket.on('trade_confirmed', ({ sessionId }: TradeConfirmedPayload) => {
        if (tradeState.session?.id !== sessionId) return

        window.dispatchEvent(new CustomEvent('trade:confirmed'))
        tradeState.session = null
    })
}
