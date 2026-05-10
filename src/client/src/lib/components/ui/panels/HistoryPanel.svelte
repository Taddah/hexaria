<script lang="ts">
	import { gameState } from '$lib/stores/gameState.svelte';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	const history = $derived(gameState.eventsHistory ?? []);
	const sorted = $derived([...history].sort((a, b) => b.timestamp - a.timestamp));

	function formatTime(ts: number): string {
		return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
	}
</script>

<div
	class="panel-shadow absolute flex flex-col"
	style="
        left: calc(5.75rem + 1rem + 0.75rem);
        top: 50%;
        transform: translateY(-50%);
        z-index: 20;
        width: 520px;
        max-height: 80vh;
        background: linear-gradient(135deg, var(--color-bg-panel-2), var(--color-bg-panel));
        border: 1px solid var(--color-gold);
        border-radius: 8px;
        overflow: hidden;
    "
>
	<!-- Header -->
	<div
		class="flex shrink-0 items-center justify-between px-4 py-3"
		style="border-bottom: 1px solid var(--color-gold-dark);"
	>
		<span class="text-panel-title tracking-wide">Journal des événements</span>
		<button
			onclick={onclose}
			class="panel-btn flex items-center justify-center text-xs leading-none"
			style="width: 1.4rem; height: 1.4rem; padding: 0; color: var(--color-text-light);"
			aria-label="Fermer">✕</button
		>
	</div>

	<!-- Liste -->
	<div class="flex-1 overflow-y-auto p-4">
		{#if sorted.length === 0}
			<p class="text-center text-xs italic" style="color: var(--color-text-muted);">
				Aucun événement enregistré.
			</p>
		{:else}
			<div class="flex flex-col gap-3">
				{#each sorted as entry}
					<div
						class="flex flex-col gap-1 rounded p-3"
						style="
                            background: var(--color-bg-dark);
                            border-left: 3px solid {entry.isSignificant
							? 'var(--color-gold)'
							: 'var(--color-text-muted)'};
                        "
					>
						<!-- Ligne haute -->
						<div class="flex items-start justify-between">
							<span
								class="text-xs font-bold"
								style="color: {entry.isSignificant
									? 'var(--color-gold)'
									: 'var(--color-text-light)'}; font-family: var(--font-serif);"
							>
								{entry.eventName}
							</span>
							<div class="flex flex-col items-end">
								{#if entry.year !== undefined}
									<span class="text-xs" style="color: var(--color-gold-dark);">
										An {entry.year}
									</span>
								{/if}
								<span class="text-[10px] opacity-75" style="color: var(--color-text-muted);">
									{formatTime(entry.timestamp)}
								</span>
							</div>
						</div>

						<!-- Actions -->
						<div class="flex flex-wrap gap-1">
							{#each entry.action as act}
								<span
									class="rounded px-1.5 py-0.5 text-xs"
									style="background: var(--color-bg-panel-2); color: var(--color-text-muted);"
								>
									{act}
								</span>
							{/each}
						</div>

						<!-- Narrative -->
						{#if entry.eventNarrative}
							<p
								class="text-xs leading-relaxed italic"
								style="color: var(--color-text-light); margin-top: 0.25rem;"
							>
								{entry.eventNarrative}
							</p>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
