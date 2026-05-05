<script lang="ts">
	const stats = [
		{ label: 'Santé globale', value: 72, max: 100, color: '#16a34a' },
		{ label: 'Endurance', value: 55, max: 100, color: '#2563eb' },
		{ label: 'Force', value: 48, max: 100, color: '#9333ea' },
		{ label: 'Agilité', value: 61, max: 100, color: '#0891b2' },
		{ label: 'Perception', value: 39, max: 100, color: '#ca8a04' }
	];
</script>

<div class="flex flex-col gap-3">
	{#each stats as stat}
		<div class="flex flex-col gap-1">
			<div class="flex items-center justify-between">
				<span
					class="text-xs"
					style="color: var(--color-text-light); font-family: var(--font-serif);"
				>
					{stat.label}
				</span>
				<span class="text-xs font-bold" style="color: {stat.color};">
					{stat.value} / {stat.max}
				</span>
			</div>
			<div
				class="h-2 w-full overflow-hidden rounded-full"
				style="background: var(--color-bg-dark);"
			>
				<div
					class="h-full rounded-full transition-all"
					style="width: {(stat.value / stat.max) * 100}%; background: {stat.color};"
				></div>
			</div>
		</div>
	{/each}
</div>
