import { supabase } from './supabaseServer';

export interface WorldMeta {
    seed: string;
    gameTime: Record<string, unknown>;
}

export interface MapModification {
    q: number;
    r: number;
    modifications: Record<string, unknown>;
}

export class WorldPersistenceService {
    async loadWorldMeta(): Promise<WorldMeta | null> {
        const { data, error } = await supabase
            .from('world_meta')
            .select('seed, game_time')
            .eq('id', 1)
            .single();

        if (error || !data) return null;

        return {
            seed: data.seed as string,
            gameTime: (data.game_time as Record<string, unknown>) ?? {}

        };
    }

    async saveWorldMeta(meta: WorldMeta): Promise<void> {
        const { error } = await supabase
            .from('world_meta')
            .upsert({
                id: 1,
                seed: meta.seed,
                game_time: meta.gameTime
            });

        if (error) {
            console.error('[PERSISTENCE] Failed to save world_meta:', error.message);
        }
    }

    async loadMapModifications(): Promise<MapModification[]> {
        const { data, error } = await supabase
            .from('map_modifications')
            .select('q, r, modifications');

        if (error || !data) return [];

        return data.map(row => ({
            q: row.q as number,
            r: row.r as number,
            modifications: (row.modifications as Record<string, unknown>) ?? {}
        }));
    }

    async saveMapModifications(mods: MapModification[]): Promise<void> {
        if (mods.length === 0) return;

        const rows = mods.map(m => ({
            q: m.q,
            r: m.r,
            modifications: m.modifications,
            updated_at: new Date().toISOString()
        }));

        const { error } = await supabase
            .from('map_modifications')
            .upsert(rows, { onConflict: 'q,r' });

        if (error) {
            console.error('[PERSISTENCE] Failed to save map_modifications:', error.message);
        }
    }
}
