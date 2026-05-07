import { supabase } from './supabaseServer';

export class PlayerPersistenceService {
    async loadPlayer(userId: string): Promise<{ firstName: string; lastName: string; components: Record<string, unknown> } | null> {
        const { data, error } = await supabase
            .from('players')
            .select('first_name, last_name, components')
            .eq('user_id', userId)
            .single();

        if (error || !data) return null;

        return {
            firstName: data.first_name as string,
            lastName: data.last_name as string,
            components: (data.components as Record<string, unknown>) ?? {}
        };
    }

    async savePlayer(userId: string, components: Record<string, unknown>): Promise<void> {
        const { error } = await supabase
            .from('players')
            .update({ components, updated_at: new Date().toISOString() })
            .eq('user_id', userId);

        if (error) {
            console.error(`[PERSISTENCE] Failed to save player ${userId}:`, error.message);
        }
    }

    async createPlayer(userId: string, firstName: string, lastName: string, components: Record<string, unknown>): Promise<void> {
        const { error } = await supabase
            .from('players')
            .insert({
                user_id: userId,
                first_name: firstName,
                last_name: lastName,
                components
            });

        if (error) {
            console.error(`[PERSISTENCE] Failed to create player ${userId}:`, error.message);
            throw error;
        }
    }

    async hasCharacter(userId: string): Promise<{ exists: boolean; firstName?: string; lastName?: string }> {
        const { data, error } = await supabase
            .from('players')
            .select('first_name, last_name')
            .eq('user_id', userId)
            .single();

        if (error || !data) return { exists: false };
        return { exists: true, firstName: data.first_name as string, lastName: data.last_name as string };
    }
}
