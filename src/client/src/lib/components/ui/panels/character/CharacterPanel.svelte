<script lang="ts">
	import BodyPanel from '$lib/components/ui/panels/character/BodyPanel.svelte';
	import InventoryTab from '$lib/components/ui/panels/character/InventoryTab.svelte';
	import SkillsTab from '$lib/components/ui/panels/character/SkillsTab.svelte';
	import StatsTab from '$lib/components/ui/panels/character/StatsTab.svelte';
	import { gameState } from '$lib/stores/gameState.svelte';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	let activeTab = $state<'stats' | 'skills' | 'inventory'>('stats');
	const localPlayer = $derived(gameState.localPlayer);

	const character = $derived({
		name: localPlayer?.identity.name || '',
		hunger: 0,
		thirst: 0,
		fatigue: localPlayer?.fatigue?.fatigue ?? 0
	});

	function gaugeColor(value: number): string {
		if (value > 60) return '#16a34a';
		if (value > 30) return '#ca8a04';
		return '#b91c1c';
	}

	const tabs = [
		{ id: 'stats', label: 'Stats' },
		{ id: 'skills', label: 'Compétences' },
		{ id: 'inventory', label: 'Inventaire' }
	] as const;
</script>

<div
	class="panel-shadow absolute flex flex-col"
	style="
        left: calc(5.75rem + 1rem + 0.75rem);
        top: 50%;
        transform: translateY(-50%);
        z-index: 20;
        width: 620px;
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
		<span class="text-panel-title tracking-wide">Fiche Personnage</span>
		<button
			onclick={onclose}
			class="panel-btn flex items-center justify-center text-xs leading-none"
			style="width: 1.4rem; height: 1.4rem; padding: 0; color: var(--color-text-light);"
			aria-label="Fermer">✕</button
		>
	</div>

	<!-- 2 colonnes -->
	<div class="flex min-h-0 flex-1">
		<!-- Gauche -->
		<div
			class="flex shrink-0 flex-col gap-3 overflow-y-auto p-4"
			style="width: 200px; border-right: 1px solid var(--color-gold-dark);"
		>
			<p
				class="text-center text-sm font-bold"
				style="color: var(--color-gold); font-family: var(--font-serif);"
			>
				{character.name}
			</p>

			<BodyPanel />

			<!-- Jauges -->
			<div class="flex flex-col gap-2">
				{#each [{ label: '🍖 Faim', value: character.hunger }, { label: '💧 Soif', value: character.thirst }, { label: '😴 Fatigue', value: character.fatigue, invert: true }] as gauge}
					<div class="flex flex-col gap-1">
						<div class="flex items-center justify-between">
							<span class="text-xs" style="color: var(--color-text-muted);">{gauge.label}</span>
							<span class="text-xs font-bold" style="color: var(--color-text-light);"
								>{gauge.value}%</span
							>
						</div>
						<div
							class="h-1.5 w-full overflow-hidden rounded-full"
							style="background: var(--color-bg-dark);"
						>
							<div
								class="h-full rounded-full transition-all"
								style="width: {gauge.value}%; background: {gaugeColor(
									gauge.invert ? 100 - gauge.value : gauge.value
								)};"
							></div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Droite -->
		<div class="flex min-w-0 flex-1 flex-col">
			<!-- Onglets -->
			<div class="flex shrink-0" style="border-bottom: 1px solid var(--color-gold-dark);">
				{#each tabs as tab}
					<button
						onclick={() => (activeTab = tab.id)}
						class="px-4 py-2 text-xs tracking-wide transition-all"
						style="
                            color: {activeTab === tab.id
							? 'var(--color-gold)'
							: 'var(--color-text-muted)'};
                            border-bottom: 2px solid {activeTab === tab.id
							? 'var(--color-gold)'
							: 'transparent'};
                            background: none;
                            cursor: pointer;
                            font-family: var(--font-serif);
                        ">{tab.label}</button
					>
				{/each}
			</div>

			<!-- Contenu -->
			<div class="flex-1 overflow-y-auto p-4">
				{#if activeTab === 'stats'}
					<StatsTab />
				{:else if activeTab === 'skills'}
					<SkillsTab />
				{:else if activeTab === 'inventory'}
					<InventoryTab />
				{/if}
			</div>
		</div>
	</div>
</div>
