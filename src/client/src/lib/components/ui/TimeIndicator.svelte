<script lang="ts">
	import { gameState } from '$lib/stores/gameState.svelte';

	const hours = $derived(Math.floor(gameState.time.timeOfDay * 24));
	const minutes = $derived(Math.floor((gameState.time.timeOfDay * 24 * 60) % 60));
	const timeLabel = $derived(
		`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
	);
</script>

<div class="flex items-center gap-1 text-sm font-bold" style="color: var(--color-gold)">
	<span>{gameState.time.isDay ? '🌞' : '🌙'}</span>
	<span>{timeLabel}</span>
</div>
