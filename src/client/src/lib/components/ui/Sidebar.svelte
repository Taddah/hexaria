<!-- Sidebar.svelte -->
<script lang="ts">
	import PanelBg from './PanelBg.svelte';
	import BodyPanel from '$lib/components/ui/BodyPanel.svelte';

	interface SidebarItem {
		emoji: string;
		label: string;
		panel?: string;
	}

	const items: SidebarItem[] = [
		{ emoji: '👤', label: 'Status' },
		{ emoji: '🫀', label: 'Corps', panel: 'body' },
		{ emoji: '🗺️', label: 'Carte' },
		{ emoji: '📜', label: 'Diplomatie' },
		{ emoji: '🏴', label: 'Quêtes' },
		{ emoji: '✉️', label: 'Messagerie' }
	];

	let activePanel = $state<string | null>(null);

	function togglePanel(panel?: string) {
		if (!panel) return;

		console.log('activePanel', activePanel);
		activePanel = activePanel === panel ? null : panel;
	}
</script>

<div
	class="relative -mt-12 ml-4 [filter:drop-shadow(0_4px_6px_rgba(0,0,0,0.5))]"
	style="width: 5.75rem; z-index: 10;"
>
	<PanelBg width={92} height={568} shape="pentagon" gradientId="sidebarGrad" bevel={28} />

	<div class="relative flex flex-col items-center" style="width: 5.75rem;">
		<div class="h-20 w-full"></div>

		{#each items as item}
			<div
				class="relative box-border flex items-center justify-center p-1.5"
				style="height: 5.75rem; width: 100%;"
			>
				<button
					class="panel-btn flex h-full w-full flex-col items-center justify-center gap-1
                        {item.panel && activePanel === item.panel ? 'brightness-125' : ''}"
					aria-label={item.label}
					onclick={() => togglePanel(item.panel)}
				>
					<span class="text-[1.7rem] leading-none">{item.emoji}</span>
					<span class="text-panel-title text-[0.7rem]">{item.label}</span>
				</button>
			</div>
		{/each}

		<div class="h-7"></div>
	</div>
</div>

{#if activePanel === 'body'}
	<BodyPanel onclose={() => (activePanel = null)} />
{/if}
