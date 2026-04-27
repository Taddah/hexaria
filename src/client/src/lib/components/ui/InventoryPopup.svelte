<script lang="ts">
	import Popup from './Popup.svelte';
	import type { EntityDTO } from '$lib/stores/gameState.svelte';

	let { onClose, player }: { onClose: () => void; player: EntityDTO } = $props();

	let inventory = $derived(player?.inventory || { wood: 0, iron: 0 });

	let items = $derived([
		{ id: 'wood', name: 'Bois', icon: '🪵', amount: inventory.wood },
		{ id: 'iron', name: 'Fer', icon: '⛏️', amount: inventory.iron },
		...Array.from({ length: 18 }).map((_, i) => ({
			id: `empty-${i}`,
			name: '',
			icon: '',
			amount: 0
		}))
	]);
</script>

<Popup title="Inventaire" {onClose}>
	<div class="grid grid-cols-5 gap-[6px] p-2">
		{#each items as item}
			<div
				class="relative flex h-14 w-14 flex-col items-center justify-center rounded-sm border border-[#4a433a] bg-gradient-to-br from-[#2e2a25] to-[#1a1815] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
			>
				{#if item.icon && item.amount > 0}
					<span class="text-2xl drop-shadow-md">{item.icon}</span>
					<span
						class="absolute right-1 bottom-0 text-[11px] font-bold text-[#e1d5c2] drop-shadow-[0_1px_2px_rgba(0,0,0,1)]"
					>
						{item.amount}
					</span>
				{:else if item.icon}
					<!-- Item vide (0) : affiché en grisé -->
					<span class="text-2xl opacity-20 grayscale">{item.icon}</span>
				{/if}
			</div>
		{/each}
	</div>
</Popup>
