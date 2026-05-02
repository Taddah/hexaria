<script lang="ts">
	import { gameState } from '$lib/stores/gameState.svelte';
	import { getPlayerTile } from '$lib/utils/playerUtils';
	import PanelBg from '$lib/components/ui/PanelBg.svelte';
	import { Resource, type Biome } from '$shared';

	const localPlayer = $derived(gameState.localPlayer);
	const playerTile = $derived.by(() => {
		return getPlayerTile(localPlayer, gameState.map);
	});
	const selectedTile = $derived(
		gameState.selectedHex
			? (gameState.map[`${gameState.selectedHex.q},${gameState.selectedHex.r}`] ?? null)
			: null
	);
	const displayedTile = $derived(selectedTile ?? playerTile);

	const BIOME_LABELS: Record<Biome, string> = {
		WATER: 'Océan',
		MOUNTAIN: 'Montagne',
		DESERT: 'Désert',
		TAIGA: 'Taïga',
		PRAIRIE: 'Prairie'
	};

	const RESOURCE_LABELS: Record<Resource, { emoji: string; label: string }> = {
		[Resource.WOOD]: { emoji: '🌳', label: 'Bois' },
		[Resource.STONE]: { emoji: '🪨', label: 'Pierre' },
		[Resource.SILVER]: { emoji: '⛏️', label: 'Argent' }
	};

	const biomeName = $derived(
		displayedTile ? (BIOME_LABELS[displayedTile.biome] ?? displayedTile.biome) : '—'
	);
	const resource = $derived(displayedTile?.resource);
	const resourceInfo = $derived(
		resource && resource.amount > 0 ? RESOURCE_LABELS[resource.type] : null
	);
</script>

<div class="panel-shadow absolute bottom-0 left-0" style="z-index: 15;">
	<div class="relative" style="width: 28.75rem; height: 2.625rem;">
		<PanelBg width={460} height={42} shape="trapezoid-left" gradientId="hexInfoGrad" bevel={20} />

		<div
			class="relative z-10 flex h-full w-full items-center gap-6"
			style="padding: 0 2.5rem; font-size: 0.8rem;"
		>
			<span class="label-uppercase" style="font-size: inherit;">
				<span class="font-bold" style="color: var(--color-gold);">BIOME:</span>
				{biomeName}
			</span>

			{#if resourceInfo && resource}
				<span class="label-uppercase" style="font-size: inherit;">
					<span>{resourceInfo.emoji}</span>
					<span class="font-bold" style="color: var(--color-gold);">{resourceInfo.label}:</span>
					{resource.amount}
				</span>
			{/if}
		</div>
	</div>
</div>
