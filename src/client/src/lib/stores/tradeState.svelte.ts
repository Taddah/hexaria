import type { TradeSessionComponent } from '$shared'

interface PendingInvite {
    session: TradeSessionComponent
    initiatorName: string   // résolu depuis gameState.entities au moment de la réception
}

interface TradeState {
    session: TradeSessionComponent | null
    pendingInvite: PendingInvite | null
}

export const tradeState = $state<TradeState>({
    session: null,
    pendingInvite: null,
})

// ─── Helpers dérivés ──────────────────────────────────────────────────────────

export function myOffer(localEntityId: number) {
    const s = tradeState.session
    if (!s) return null
    return s.playerA === localEntityId ? s.offerA : s.offerB
}

export function theirOffer(localEntityId: number) {
    const s = tradeState.session
    if (!s) return null
    return s.playerA === localEntityId ? s.offerB : s.offerA
}

export function amILocked(localEntityId: number) {
    const s = tradeState.session
    if (!s) return false
    return s.playerA === localEntityId ? s.lockedA : s.lockedB
}

export function isOtherLocked(localEntityId: number) {
    const s = tradeState.session
    if (!s) return false
    return s.playerA === localEntityId ? s.lockedB : s.lockedA
}
