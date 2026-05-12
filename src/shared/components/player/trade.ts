// ─── États ────────────────────────────────────────────────────────────────────

export type TradeStatus =
    | 'PENDING'    // invitation envoyée, B n'a pas encore répondu
    | 'ACTIVE'     // les deux configurent leur offre
    | 'CONFIRMED'  // transfert effectué
    | 'CANCELLED'  // annulé pour une raison quelconque

export type CancelReason =
    | 'TIMEOUT'               // B n'a pas répondu à temps
    | 'REFUSED'               // B a refusé l'invitation
    | 'PLAYER_MOVED'          // un des joueurs s'est déplacé
    | 'PLAYER_DISCONNECTED'   // un des joueurs s'est déconnecté
    | 'INSUFFICIENT_FUNDS'    // inventaire insuffisant au moment du transfert
    | 'MANUAL'                // annulation volontaire en cours d'échange

// ─── Offre ────────────────────────────────────────────────────────────────────

export interface TradeOffer {
    wood: number
    stone: number
    silver: number
}

export const EMPTY_OFFER: TradeOffer = { wood: 0, stone: 0, silver: 0 }

// ─── Session ──────────────────────────────────────────────────────────────────

export interface TradeSessionComponent {
    id: string       // uuid
    playerA: number       // initiateur
    playerB: number       // cible
    offerA: TradeOffer
    offerB: TradeOffer
    lockedA: boolean      // A a validé son offre
    lockedB: boolean      // B a validé son offre
    status: TradeStatus
    expiresAt: number       // timestamp ms — utilisé pour le timeout PENDING
}

// ─── Payloads Serveur → Client ────────────────────────────────────────────────

/** Reçu par B quand A initie un échange */
export interface TradeInvitePayload {
    session: TradeSessionComponent
}

/** Reçu par A et B à chaque changement d'état de la session */
export interface TradeUpdatePayload {
    session: TradeSessionComponent
}

/** Reçu par A et B quand la session est annulée */
export interface TradeCancelledPayload {
    sessionId: string
    reason: CancelReason
}

/** Reçu par A et B quand le transfert est confirmé */
export interface TradeConfirmedPayload {
    sessionId: string
}

// ─── Payloads Client → Serveur ────────────────────────────────────────────────

/** A veut initier un échange avec B */
export interface TradeRequestPayload {
    targetId: number
}

/** B accepte ou refuse l'invitation */
export interface TradeRespondPayload {
    sessionId: string
    accept: boolean
}

/** A ou B met à jour son offre */
export interface TradeUpdateOfferPayload {
    sessionId: string
    offer: TradeOffer
}

/** A ou B verrouille son offre (valide) */
export interface TradeLockPayload {
    sessionId: string
}

/** A ou B annule l'échange en cours */
export interface TradeCancelPayload {
    sessionId: string
}

// Ajouter à la fin de trade.ts existant
export const TRADE_SESSION_COMPONENT = 'TradeSessionComponent'
export const TRADE_TAG_COMPONENT = 'TradeTagComponent'

export interface TradeTagComponent {
    sessionEntity: number
}