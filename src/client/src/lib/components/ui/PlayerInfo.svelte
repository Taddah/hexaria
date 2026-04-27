<script lang="ts">
	import type { EntityDTO } from '$lib/stores/gameState.svelte';

	let { player }: { player: EntityDTO } = $props();

	const energyPct = $derived(
		player?.energy ? Math.round((player.energy.current / player.energy.max) * 100) : 0
	);
</script>

<div
	class="pointer-events-auto absolute top-0 left-[5.5rem] z-10 flex h-[7.5rem] w-[370px] items-center rounded-br-[2rem] border-r-[3px] border-b-[3px] border-[#695d4e] bg-[#1a1715]/95 pr-6 pl-10 shadow-xl backdrop-blur-md"
>
	<div class="relative -top-1 flex w-full flex-col gap-1">
		<div class="flex w-full items-baseline justify-between">
			<span class="text-2xl font-bold tracking-wider text-[#e6decb] drop-shadow-md">
				{player?.identity?.name || 'Aldric'}
			</span>
			<div class="text-[13px] text-[#a19688]">
				<span>Age: 64</span>
				<span class="mx-1">|</span>
				<span>Forgeron</span>
			</div>
		</div>
		<!-- Health Bar -->
		<div class="mt-1 flex items-center gap-2">
			<span class="text-sm drop-shadow">❤️</span>
			<div
				class="relative box-content h-2 w-48 flex-shrink-0 overflow-hidden rounded-sm border border-[#2b2723] bg-[#0a0908] shadow-inner"
			>
				<div
					class="h-full bg-gradient-to-r from-[#af2320] to-[#e03a36] transition-all duration-300"
					style="width: 80%; box-shadow: inset 0 2px 4px rgba(255,255,255,0.2);"
				></div>
			</div>
		</div>
		<!-- Energy Bar -->
		<div class="flex items-center gap-2">
			<span class="text-sm drop-shadow">⚡</span>
			<div
				class="relative box-content h-2 w-48 flex-shrink-0 overflow-hidden rounded-sm border border-[#2b2723] bg-[#0a0908] shadow-inner"
			>
				<div
					class="h-full bg-gradient-to-r from-[#7a5c10] to-[#f0c030] transition-all duration-500"
					style="width: {energyPct}%; box-shadow: inset 0 2px 4px rgba(255,255,255,0.15);"
				></div>
			</div>
			<span class="text-[11px] text-[#a19688] tabular-nums">
				{player?.energy?.current ?? 100}/{player?.energy?.max ?? 100}
			</span>
		</div>
	</div>
</div>
