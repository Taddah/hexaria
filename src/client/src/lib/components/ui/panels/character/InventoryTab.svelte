<script lang="ts">
	const inventory = [
		{ name: 'Couteau de chasse', type: 'Arme', qty: 1, weight: '0.8 kg' },
		{ name: 'Bandage', type: 'Médical', qty: 3, weight: '0.1 kg' },
		{ name: 'Ration sèche', type: 'Nourriture', qty: 2, weight: '0.5 kg' },
		{ name: 'Corde (5m)', type: 'Outil', qty: 1, weight: '1.2 kg' },
		{ name: 'Briquet', type: 'Outil', qty: 1, weight: '0.05 kg' },
		{ name: 'Gourde', type: 'Équipement', qty: 1, weight: '0.3 kg' }
	];

	const typeColor: Record<string, string> = {
		Arme: '#ef4444',
		Médical: '#16a34a',
		Nourriture: '#ca8a04',
		Outil: '#2563eb',
		Équipement: '#9333ea'
	};
</script>

<div class="flex flex-col gap-1">
	{#each inventory as item}
		<div
			class="flex items-center justify-between rounded px-3 py-2"
			style="background: var(--color-bg-dark); border: 1px solid var(--color-bg-panel-2);"
		>
			<div class="flex items-center gap-2">
				<span
					class="rounded px-1.5 py-0.5 text-xs font-bold"
					style="
                        background: {typeColor[item.type] ?? '#555'}22;
                        color: {typeColor[item.type] ?? '#aaa'};
                        border: 1px solid {typeColor[item.type] ?? '#555'}44;
                    ">{item.type}</span
				>
				<span class="text-xs" style="color: var(--color-text-light);">{item.name}</span>
			</div>
			<div class="flex items-center gap-3">
				<span class="text-xs" style="color: var(--color-text-muted);">x{item.qty}</span>
				<span class="text-xs" style="color: var(--color-text-muted);">{item.weight}</span>
			</div>
		</div>
	{/each}
</div>
