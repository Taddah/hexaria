<!-- EventModal.svelte -->
<script lang="ts">
	import { getSocket } from '$lib/services/socket';
	import { gameState } from '$lib/stores/gameState.svelte';
	import { EffectType, type EventEffect, type Event } from '$shared';

	const socket = getSocket();

	let pendingEvents = $derived(
		gameState.localPlayer?.gameEvents?.events?.filter((e) => e.status === 'PENDING') ?? []
	);

	let current: Event | undefined = $derived(pendingEvents[0]);

	function formatEffect(effect: EventEffect): string {
		switch (effect.type) {
			case EffectType.RESOURCE:
				return `${effect.stat} : ${effect.value > 0 ? '+' : ''}${effect.value}`;
			case EffectType.BODY:
				return `${effect.stat} : ${effect.value > 0 ? '+' : ''}${effect.value} aggravation`;
			default:
				return `${effect.stat} : ${effect.value}`;
		}
	}

	function acknowledge() {
		if (!current) return;
		socket.emit('event_response', current.uuid);
	}
</script>

{#if current}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
		<div class="mx-4 w-full max-w-lg min-w-80 rounded border border-neutral-600 bg-neutral-900 p-8">
			<h2 class="mb-4 text-xl font-semibold text-yellow-300">
				{current.event.title}
			</h2>

			<p class="mb-6 leading-relaxed text-neutral-300">
				{current.event.description}
			</p>

			{#if current.event.effects.length > 0}
				<ul class="mb-6 space-y-1">
					{#each current.event.effects as effect}
						<li class="text-sm {effect.value < 0 ? 'text-green-400' : 'text-red-400'}">
							{formatEffect(effect)}
						</li>
					{/each}
				</ul>
			{/if}

			<button
				onclick={acknowledge}
				class="w-full cursor-pointer rounded bg-neutral-700 py-3 text-white transition-colors hover:bg-neutral-600"
			>
				Confirmer
			</button>
		</div>
	</div>
{/if}
