<script lang="ts">
	import { gameState } from '$lib/stores/gameState.svelte';

	const attributeLabels: Record<string, string> = {
		strength: 'Force',
		endurance: 'Endurance',
		agility: 'Agilité',
		intelligence: 'Intelligence',
		charisma: 'Charisme',
		willpower: 'Volonté',
		discretion: 'Discrétion'
	};

	const attributeColors: Record<string, string> = {
		strength: '#9333ea',
		endurance: '#2563eb',
		agility: '#0891b2',
		intelligence: '#0ea5e9',
		charisma: '#f43f5e',
		willpower: '#f59e0b',
		discretion: '#64748b'
	};

	const labelToValue: Record<string, number> = {
		'Très faible': 15,
		'Faible': 30,
		'Moyen': 50,
		'Bon': 70,
		'Remarquable': 85,
		'Exceptionnel': 100
	};

	const calculateHealth = () => {
		if (!gameState.localPlayer?.body) return 100;
		const body = gameState.localPlayer.body;
		const states = Object.values(body);
		let healthValue = 0;
		states.forEach((state) => {
			if (state === 'intact') healthValue += 1;
			else if (state === 'injured') healthValue += 0.7;
			else if (state === 'handicapped') healthValue += 0.3;
			else if (state === 'lost') healthValue += 0;
		});
		return Math.floor((healthValue / states.length) * 100);
	};

	let health = $derived(calculateHealth());
	let attributes = $derived(gameState.localPlayer?.attributes ?? {});
</script>

<div class="flex flex-col gap-3">
	<!-- Santé Globale -->
	<div class="flex flex-col gap-1">
		<div class="flex items-center justify-between">
			<span class="text-xs" style="color: var(--color-text-light); font-family: var(--font-serif);">
				Santé globale
			</span>
			<span class="text-xs font-bold" style="color: #16a34a;">
				{health}%
			</span>
		</div>
		<div class="h-2 w-full overflow-hidden rounded-full" style="background: var(--color-bg-dark);">
			<div
				class="h-full rounded-full transition-all"
				style="width: {health}%; background: #16a34a;"
			></div>
		</div>
	</div>

	<!-- Attributs -->
	{#each Object.entries(attributes) as [key, label]}
		{@const displayLabel = attributeLabels[key] || key}
		{@const color = attributeColors[key] || '#94a3b8'}
		{@const value = labelToValue[label] || 0}
		<div class="flex flex-col gap-1">
			<div class="flex items-center justify-between">
				<span class="text-xs" style="color: var(--color-text-light); font-family: var(--font-serif);">
					{displayLabel}
				</span>
				<span class="text-xs font-bold" style="color: {color};">
					{label}
				</span>
			</div>
			<div class="h-2 w-full overflow-hidden rounded-full" style="background: var(--color-bg-dark);">
				<div
					class="h-full rounded-full transition-all"
					style="width: {value}%; background: {color};"
				></div>
			</div>
		</div>
	{/each}
</div>
