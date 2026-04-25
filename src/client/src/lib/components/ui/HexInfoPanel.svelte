<script lang="ts">
	import type { EntityDTO } from '$lib/stores/gameStore';
	import { Biome, type TileData } from '$shared';

	let {
		displayedHex,
		playersOnHex
	}: { displayedHex: TileData | null | undefined; playersOnHex: EntityDTO[] } = $props();

	function formatBiome(type: string | undefined) {
		if (!type) return 'Inconnu';
		switch (type) {
			case Biome.MOUNTAIN:
				return 'Montagne';
			case Biome.TAIGA:
				return 'Taïga';
			case Biome.DESERT:
				return 'Désert';
			case Biome.PRAIRIE:
				return 'Prairie';
			case Biome.WATER:
				return 'Eau';
			default:
				return 'Inconnu';
		}
	}
</script>

<div
	class="pointer-events-auto absolute top-0 left-1/2 z-20 flex h-12 -translate-x-1/2 items-center"
>
	<div
		class="flex h-full items-center gap-6 rounded-b-[1.5rem] border-r-[3px] border-b-[3px] border-l-[3px] border-[#695d4e] bg-[#1a1715]/95 px-8 text-[14px] whitespace-nowrap text-[#cfc5b3] shadow-md backdrop-blur-md"
	>
		{#if displayedHex}
			<div class="font-bold tracking-wider text-[#e1d5c2]">
				Hex [{displayedHex.q}, {displayedHex.r}]
			</div>

			<div class="h-6 w-px bg-[#4a433a] opacity-50"></div>

			<div class="flex items-center gap-2">
				<span class="text-[#938a7c]">Biome :</span>
				<span class="font-semibold text-[#cfc5b3]">{formatBiome(displayedHex.biome)}</span>
			</div>

			{#if displayedHex.resource && displayedHex.resource.amount > 0}
				<div class="h-6 w-px bg-[#4a433a] opacity-50"></div>
				<div class="flex items-center gap-2">
					<span class="text-[#938a7c]">Ressource :</span>
					<span class="font-semibold text-[#cfc5b3]">
						{displayedHex.resource.amount}
						{displayedHex.resource.type === 'wood' ? 'Bois 🌲' : 'Fer ⛏️'}
					</span>
				</div>
			{/if}

			<div class="h-6 w-px bg-[#4a433a] opacity-50"></div>

			<div class="flex items-center gap-2">
				<span class="text-[#938a7c]">Joueurs :</span>
				<span class="font-semibold text-[#e1d5c2]">
					{#if playersOnHex.length === 0}
						0
					{:else}
						{playersOnHex.map((p) => p.identity.name).join(', ')}
					{/if}
				</span>
			</div>
		{:else}
			<div class="text-[#938a7c] italic">Aucun hexagone ciblé</div>
		{/if}
	</div>
</div>
