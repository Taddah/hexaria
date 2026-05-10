import { World } from '../core/World';
import { NetworkSystem } from '../systems/NetworkSystem';
import { IdentityComponent, IDENTITY_COMPONENT, EventsHistoryComponent, EVENTS_HISTORY_COMPONENT, DeathIntentComponent, DEATH_INTENT_COMPONENT, PlayerComponent, PLAYER_COMPONENT } from '$shared';
import { LLMService } from './LLMservice';
import { supabase } from './supabaseServer';

export class DeathService {
    static async kill(entity: number, world: World, network: NetworkSystem) {
        const intent = world.getComponent<DeathIntentComponent>(entity, DEATH_INTENT_COMPONENT);
        if (!intent) return;

        world.removeComponent(entity, DEATH_INTENT_COMPONENT);

        const identity = world.getComponent<IdentityComponent>(entity, IDENTITY_COMPONENT);
        const player = world.getComponent<PlayerComponent>(entity, PLAYER_COMPONENT);
        const historyComponent = world.getComponent<EventsHistoryComponent>(entity, EVENTS_HISTORY_COMPONENT);

        if (!identity || !player) {
            world.deleteEntity(entity);
            return;
        }

        const events = historyComponent?.history.filter(e => e.isSignificant) ?? [];

        let lifeSummary = "Un habitant de Hexaria dont l'histoire n'a pas été retenue...";
        try {
            lifeSummary = await LLMService.getInstance().generateLifeSummary(
                identity.firstName + " " + identity.lastName,
                identity.currentAge,
                events
            );
        } catch (e) {
            console.error('[DeathService] Failed to generate life summary', e);
        }

        const deceasedData = {
            user_id: player.userId,
            character_name: identity.firstName + " " + identity.lastName,
            age_at_death: identity.currentAge,
            cause: intent.cause,
            event_name: intent.eventName || null,
            life_summary: lifeSummary,
            events_history: historyComponent?.history ?? []
        };

        try {
            const { error: insertError } = await supabase.from('deceased_characters').insert(deceasedData);
            if (insertError) console.error('[DeathService] Failed to insert deceased character', insertError);

            const { error: deleteError } = await supabase.from('players').delete().eq('user_id', player.userId);
            if (deleteError) console.error('[DeathService] Failed to delete player', deleteError);
        } catch (e) {
            console.error('[DeathService] Supabase error', e);
        }

        network.emitToUser(player.userId, 'character:death', {
            cause: intent.cause,
            eventName: intent.eventName,
            age: identity.currentAge,
            lifeSummary,
            significantEvents: events
        });

        world.deleteEntity(entity);
    }
}
