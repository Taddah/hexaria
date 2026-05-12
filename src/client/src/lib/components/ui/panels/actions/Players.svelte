<script lang="ts">
	import { gameState } from '$lib/stores/gameState.svelte';
	import { getPlayersOnCurrentTile } from '$lib/utils/playerUtils';

	interface Props {
		onclose: () => void;
		oninspect: (playerId: number) => void;
		ontrade: (playerId: number) => void;
		onattack: (playerId: number) => void;
	}

	let { onclose, oninspect, ontrade, onattack }: Props = $props();

	let expandedId = $state<number | null>(null);

	const playersHere = $derived(getPlayersOnCurrentTile(gameState.localPlayer, gameState.entities));

	function getInitials(firstName: string, lastName: string): string {
		return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
	}

	function getReputationLabel(): string {
		return 'Inconnu';
	}

	function toggle(id: number) {
		expandedId = expandedId === id ? null : id;
	}
</script>

<div
	class="panel-shadow absolute flex flex-col"
	style="
        right: calc(5.75rem + 1rem + 0.75rem);
        top: 50%;
        transform: translateY(-50%);
        z-index: 20;
        width: 280px;
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
		<div class="flex items-center gap-2">
			<span class="text-panel-title tracking-wide">Joueurs: </span>
			{#if playersHere.length > 0}
				<span
					class="flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium"
					style="
                        background: color-mix(in srgb, var(--color-gold) 15%, transparent);
                        color: var(--color-gold);
                        min-width: 1.25rem;
                    "
				>
					{playersHere.length}
				</span>
			{/if}
		</div>
		<button
			onclick={onclose}
			class="panel-btn flex items-center justify-center text-xs leading-none"
			style="width: 1.4rem; height: 1.4rem; padding: 0; color: var(--color-text-light);"
			aria-label="Fermer">✕</button
		>
	</div>

	<!-- Liste -->
	<div class="flex flex-col">
		{#if playersHere.length === 0}
			<p class="px-4 py-6 text-center text-xs" style="color: var(--color-text-muted);">
				Personne d'autre sur cette tile.
			</p>
		{:else}
			{#each playersHere as player (player.id)}
				{@const isExpanded = expandedId === player.id}
				{@const firstName = player.identity?.firstName ?? ''}
				{@const lastName = player.identity?.lastName ?? ''}
				{@const age = player.identity?.currentAge ?? '?'}

				<div style="border-bottom: 1px solid var(--color-gold-dark);" class="last:border-b-0">
					<!-- Ligne joueur -->
					<button
						onclick={() => toggle(player.id)}
						class="flex w-full items-center gap-3 px-4 py-3 text-left transition-all"
						style="
                            background: {isExpanded
							? 'color-mix(in srgb, var(--color-gold) 6%, transparent)'
							: 'transparent'};
                            cursor: pointer;
                        "
					>
						<!-- Avatar initiales -->
						<div
							class="flex shrink-0 items-center justify-center rounded-full text-xs font-medium"
							style="
                                width: 32px;
                                height: 32px;
                                background: color-mix(in srgb, var(--color-gold) 15%, transparent);
                                color: var(--color-gold);
                                font-family: var(--font-serif);
                            "
						>
							{getInitials(firstName, lastName)}
						</div>

						<!-- Nom + réputation -->
						<div class="min-w-0 flex-1">
							<p
								class="truncate text-sm font-medium"
								style="color: var(--color-text-light); font-family: var(--font-serif);"
							>
								{firstName}
								{lastName}
							</p>
							<p class="truncate text-xs" style="color: var(--color-text-muted);">
								{getReputationLabel()} · {age} ans
							</p>
						</div>

						<!-- Chevron -->
						<span
							class="shrink-0 text-xs transition-transform duration-150"
							style="
                                color: var(--color-text-muted);
                                transform: rotate({isExpanded ? '180deg' : '0deg'});
                            ">▾</span
						>
					</button>

					<!-- Actions (dépliées) -->
					{#if isExpanded}
						<div class="flex gap-2 px-4 pb-3">
							<button
								onclick={() => oninspect(player.id)}
								class="panel-btn flex flex-1 items-center justify-center gap-1.5 py-1.5 text-xs"
								style="color: var(--color-text-light);"
							>
								<span style="font-size: 0.7rem;">👁</span>
								Inspecter
							</button>
							<button
								onclick={() => ontrade(player.id)}
								class="panel-btn flex flex-1 items-center justify-center gap-1.5 py-1.5 text-xs"
								style="color: var(--color-text-light);"
							>
								<span style="font-size: 0.7rem;">⇄</span>
								Échanger
							</button>
							<button
								onclick={() => onattack(player.id)}
								class="panel-btn flex flex-1 items-center justify-center gap-1.5 py-1.5 text-xs"
								style="
                                    color: #c0392b;
                                    border-color: color-mix(in srgb, #c0392b 40%, transparent);
                                "
							>
								<span style="font-size: 0.7rem;">⚔</span>
								Attaquer
							</button>
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</div>
