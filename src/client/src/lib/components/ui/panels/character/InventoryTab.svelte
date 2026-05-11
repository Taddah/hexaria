<!-- InventoryPopup.svelte -->
<script lang="ts">
	import { gameState } from '$lib/stores/gameState.svelte';
	import { Resource } from '$shared/types';
	import { type Component } from 'svelte';
	import { Trees, Mountain, Coins } from 'lucide-svelte';

	type Icon = Component<{ size?: number; color?: string }>;

	const RESOURCE_META: Record<Resource, { label: string; icon: Icon; color: string }> = {
		[Resource.WOOD]: { label: 'Bois', icon: Trees as unknown as Icon, color: '#639922' },
		[Resource.STONE]: { label: 'Pierre', icon: Mountain as unknown as Icon, color: '#888780' },
		[Resource.SILVER]: { label: 'Argent', icon: Coins as unknown as Icon, color: '#378ADD' }
	};

	const items = $derived(
		Object.entries(gameState.localPlayer?.inventory ?? {})
			.filter(([, qty]) => (qty as number) > 0)
			.map(([key, qty]) => ({
				key: key as Resource,
				qty: qty as number,
				meta: RESOURCE_META[key as Resource] ?? { label: key, icon: 'ti-box', color: '#888780' }
			}))
	);
</script>

{#if items.length === 0}
	<p class="py-4 text-center text-xs" style="color: var(--color-text-muted)">
		Aucun item dans l'inventaire.
	</p>
{:else}
	<div class="grid grid-cols-4 gap-1.5">
		{#each items as { qty, meta }}
			<div
				class="relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md transition-colors"
				style="background: var(--color-bg-dark); border: 1px solid var(--color-bg-panel-2);"
			>
				<span
					class="absolute top-1 left-1 h-1.5 w-1.5 rounded-full"
					style="background: {meta.color}"
				></span>

				<meta.icon size={24} color={meta.color} />

				<span
					class="px-1 text-center text-[10px] leading-tight"
					style="color: var(--color-text-muted)"
				>
					{meta.label}
				</span>

				<span
					class="absolute right-1.5 bottom-1 text-[11px] font-medium"
					style="color: var(--color-text-light)"
				>
					{qty}
				</span>
			</div>
		{/each}
	</div>
{/if}
