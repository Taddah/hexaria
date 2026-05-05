<script lang="ts">
	import { eventsStore } from '$lib/services/eventService';
	import PanelBg from '$lib/components/ui/panels/PanelBg.svelte';

	let container: HTMLDivElement | undefined = $state();
	let isMinimized = $state(false);

	$effect(() => {
		const _ = $eventsStore.length;
		if (container && !isMinimized) {
			container.scrollTop = container.scrollHeight;
		}
	});

	function formatTime(d: Date) {
		return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<div class="panel-shadow pointer-events-auto absolute right-0 bottom-0 z-20" style="width: 20rem;">
	{#if !isMinimized}
		<div
			bind:this={container}
			class="events-list ml-auto flex w-[94%] flex-col gap-1 overflow-y-auto p-2"
		>
			{#each $eventsStore as ev}
				<div class="flex items-start gap-1.5 leading-snug">
					<span class="shrink-0 font-mono text-xs" style="color: var(--color-gold);">
						[{formatTime(ev.timestamp)}]
					</span>
					<span class="text-panel-subtitle text-xs">{ev.text}</span>
				</div>
			{/each}
			{#if $eventsStore.length === 0}
				<div class="mt-8 text-center text-xs italic" style="color: var(--color-text-dim);">
					Aucun événement...
				</div>
			{/if}
		</div>
	{/if}

	<div class="relative" style="height: 2.25rem;">
		<PanelBg
			width={320}
			height={36}
			shape="trapezoid-top-left"
			gradientId="eventsGrad"
			bevel={20}
		/>

		<div class="relative z-10 flex h-full items-center justify-between px-8">
			<div class="flex items-center gap-2">
				<span class="text-sm leading-none">📣</span>
				<span class="text-panel-title text-xs tracking-widest uppercase">Événements</span>
			</div>
			<button
				onclick={() => (isMinimized = !isMinimized)}
				class="chat-toggle"
				aria-label={isMinimized ? 'Agrandir' : 'Réduire'}
			>
				{isMinimized ? '▲' : '▼'}
			</button>
		</div>
	</div>
</div>

<style>
	.events-list {
		height: 8.125rem;
		background: var(--color-bg-panel);
		border: 1.5px solid var(--color-gold);
		border-bottom: none;
		scrollbar-width: thin;
		scrollbar-color: var(--color-border-btn) transparent;
	}

	.chat-toggle {
		padding: 0 0.25rem;
		font-size: 0.75rem;
		line-height: 1;
		color: var(--color-text-dim);
		transition: color 0.2s ease;
	}

	.chat-toggle:hover {
		color: var(--color-gold);
	}
</style>
