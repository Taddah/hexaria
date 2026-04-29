<script lang="ts">
	import PanelBg from './PanelBg.svelte';

	const actions = [
		{ emoji: '🏰', title: 'Caserne', subtitle: 'Améliorer Nv.15' },
		{ emoji: '🏪', title: 'Marché', subtitle: 'Vendre Ressources' },
		{ emoji: '⚔️', title: 'Forge', subtitle: 'Forger Épée' }
	];
</script>

<div
	class="panel-shadow absolute top-36 right-4"
	style="width: 13.75rem;"
>
	<PanelBg width={220} height={260} shape="pentagon" gradientId="actionGrad" bevel={28} dividerY={44} />

	<div class="relative flex flex-col" style="width: 13.75rem;">
		<div class="flex items-center gap-2 px-3" style="height: 2.75rem;">
			<span class="text-base">👑</span>
			<span class="text-panel-title text-sm tracking-wide">Actions disponibles</span>
		</div>

		{#each actions as action, i}
			<div
				class="px-2 py-1.5"
				style={i < actions.length - 1 ? `border-bottom: 1px solid var(--color-border-separator);` : ''}
			>
				<button class="panel-btn gap-3 rounded-md px-3 py-2">
					<span class="shrink-0 text-2xl leading-none">{action.emoji}</span>
					<div class="flex flex-col items-start gap-0.5">
						<span class="text-panel-title text-sm leading-tight">{action.title}</span>
						<span class="text-panel-subtitle text-xs leading-tight">{action.subtitle}</span>
					</div>
				</button>
			</div>
		{/each}

		<div style="height: 1.75rem;"></div>
	</div>
</div>
