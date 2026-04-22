<script lang="ts">
	let { onMenuClick }: { onMenuClick: (menuId: string) => void } = $props();
</script>

<aside class="pointer-events-auto absolute left-0 top-0 bottom-0 w-24 bg-[#1a1715]/95 flex flex-col items-center pt-24 border-r-[3px] border-[#695d4e] shadow-[5px_0_15px_rgba(0,0,0,0.5)] z-20 backdrop-blur-md">
	<div class="flex w-full flex-col gap-1 mt-4">
		{@render MenuItem('village', '🏠', 'Village', 1)}
		{@render MenuItem('metier', '⚒️', 'Métier', 1)}
		{@render MenuItem('carte', '🗺️', 'Carte', 0, true)}
		{@render MenuItem('inventaire', '🎒', 'Inventaire', 0)}
		{@render MenuItem('diplomatie', '🤝', 'Diplomatie', 0)}
		{@render MenuItem('quetes', '📜', 'Quêtes', 3)}
		{@render MenuItem('messagerie', '✉️', 'Messagerie', 1)}
	</div>
</aside>

{#snippet MenuItem(id: string, icon: string, label: string, badge: number, active: boolean = false)}
	<button 
		onclick={() => onMenuClick(id)}
		class="menu-item relative flex w-full flex-col items-center justify-center py-[10px] text-[#7a7266] transition-all hover:bg-white/5 hover:text-[#dcd1c4] {active ? 'active-menu-item' : ''}"
	>
		{#if badge > 0}
			<div class="absolute right-4 top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#af2320] text-[10px] font-bold text-white shadow-md border border-[#1c1917]">
				{badge}
			</div>
		{/if}
		<div class="flex h-[36px] w-[36px] items-center justify-center rounded-full {active ? 'bg-[#937c61]/20 border border-[#937c61]/40 shadow-inner' : 'border border-transparent'}">
			<span class="text-[22px] {active ? 'grayscale-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'grayscale text-opacity-80 saturate-[0.2]'}">{icon}</span>
		</div>
		<span class="mt-1 text-[11px] font-bold uppercase tracking-wider {active ? 'text-[#b89b78]' : ''}">{label}</span>
	</button>
{/snippet}

<style>
	.active-menu-item {
		background: linear-gradient(90deg, transparent 0%, rgba(147,124,97,0.15) 50%, transparent 100%);
		border-top: 1px solid rgba(147,124,97,0.1);
		border-bottom: 1px solid rgba(147,124,97,0.1);
	}
</style>
