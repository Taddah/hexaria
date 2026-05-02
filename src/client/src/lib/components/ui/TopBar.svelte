<script lang="ts">
	import { gameState } from '$lib/stores/gameState.svelte';
	import TimeIndicator from './TimeIndicator.svelte';

	const time = $derived(gameState.time);
</script>

<div
	class="absolute top-0 left-1/2 z-20 flex -translate-x-1/2 items-center justify-between gap-6 px-8 py-2"
	style="
        background: linear-gradient(to bottom, var(--color-bg-panel-2), var(--color-bg-panel));
        border-bottom: 1px solid var(--color-gold);
        border-left: 1px solid var(--color-gold);
        border-right: 1px solid var(--color-gold);
        border-radius: 0 0 0.75rem 0.75rem;
        min-width: 20rem;
    "
>
	<span class="text-sm tracking-wide" style="color: var(--color-gold)">
		<TimeIndicator />
	</span>
	<span class="text-panel-title text-sm"> 📅 2nd Année </span>
</div>
