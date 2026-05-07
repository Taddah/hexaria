<script lang="ts">
	import { gameState } from '$lib/stores/gameState.svelte';

	const visible = $derived(!gameState.connected && gameState.localPlayer !== null);
</script>

{#if visible}
	<div
		class="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(13,21,32,0.85)] backdrop-blur-sm"
		role="alert"
		aria-live="assertive"
	>
		<div
			class="flex flex-col items-center gap-3 rounded-lg border border-[var(--color-gold-dark)] bg-[var(--color-bg-panel)] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
		>
			<span class="text-4xl">🔌</span>
			<p class="m-0 font-serif text-base font-bold text-[var(--color-text-light)]">
				Connexion perdue
			</p>
			<p class="m-0 font-serif text-[0.8rem] text-[var(--color-text-muted)]">
				Reconnexion en cours…
			</p>
			<div
				class="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-gold-dark)] border-t-[var(--color-gold)]"
			></div>
		</div>
	</div>
{/if}
