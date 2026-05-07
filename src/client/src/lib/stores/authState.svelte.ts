import type { Session } from '@supabase/supabase-js';

interface AuthState {
	session: Session | null;
	userId: string | null;
	loading: boolean;
}

export const authState = $state<AuthState>({
	session: null,
	userId: null,
	loading: true
});

export function setSession(session: Session | null) {
	authState.session = session;
	authState.userId = session?.user?.id ?? null;
	authState.loading = false;
}

export function getAccessToken(): string | null {
	return authState.session?.access_token ?? null;
}
