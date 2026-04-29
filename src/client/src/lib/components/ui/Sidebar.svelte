<script lang="ts">
	import PanelBg from './PanelBg.svelte';

	interface SidebarItem {
		emoji: string;
		label: string;
	}

	const items: SidebarItem[] = [
		{ emoji: '🔨', label: 'Métier' },
		{ emoji: '🗺️', label: 'Carte' },
		{ emoji: '📜', label: 'Diplomatie' },
		{ emoji: '🏴', label: 'Quêtes' },
		{ emoji: '✉️', label: 'Messagerie' }
	];
</script>

<div class="panel-shadow relative -mt-12 ml-4" style="width: 5.75rem; z-index: 10;">
	<PanelBg width={92} height={568} shape="pentagon" gradientId="sidebarGrad" bevel={28} />

	<div class="relative flex flex-col items-center" style="width: 5.75rem;">
		<div style="height: 5rem; width: 100%;"></div>

		{#each items as item}
			<div
				class="relative flex items-center justify-center"
				style="height: 5.75rem; width: 100%; padding: 0.375rem; box-sizing: border-box;"
			>
				<button class="panel-btn sidebar-btn" aria-label={item.label}>
					<span class="sidebar-emoji">{item.emoji}</span>
					<span class="text-panel-title sidebar-label">{item.label}</span>
				</button>
			</div>
		{/each}

		<div style="height: 1.75rem;"></div>
	</div>
</div>

<style>
	.sidebar-btn {
		flex-direction: column;
		justify-content: center;
		gap: 0.25rem;
		height: 100%;
	}

	.sidebar-emoji {
		font-size: 1.7rem;
		line-height: 1;
	}

	.sidebar-label {
		font-size: 0.7rem;
	}
</style>
