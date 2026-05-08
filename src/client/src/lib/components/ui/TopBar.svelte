<script lang="ts">
	import { gameState } from '$lib/stores/gameState.svelte';

	const hours = $derived(Math.floor(gameState.time.timeOfDay * 24));
	const minutes = $derived(Math.floor((gameState.time.timeOfDay * 24 * 60) % 60));
	const timeLabel = $derived(
		`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
	);
	const year = $derived(gameState.time.year);
	const parsedYear = $derived(() => {
		if (year === 1) return '1ère année';
		return year + 'ème année';
	});
</script>

<div
	class="absolute top-0 left-1/2 z-20 flex w-fit -translate-x-1/2 items-center justify-between gap-6 px-8 py-2"
	style="
        background: linear-gradient(to bottom, var(--color-bg-panel-2), var(--color-bg-panel));
        border-bottom: 1px solid var(--color-gold);
        border-left: 1px solid var(--color-gold);
        border-right: 1px solid var(--color-gold);
        border-radius: 0 0 0.75rem 0.75rem;
    "
>
	<span class="text-sm tracking-wide" style="color: var(--color-gold)">
		<div class="flex items-center gap-1 text-sm font-bold" style="color: var(--color-gold)">
			<span>📅 {parsedYear()}</span>
			<span>{gameState.time.isDay ? '🌞' : '🌙'} {timeLabel}</span>
		</div>
	</span>
</div>
