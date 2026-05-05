<script lang="ts">
	import { getSocket } from '$lib/services/socket';
	import { EffectType, type EventEffect, type EventNode } from '$shared';

	const socket = getSocket();

	let currentEventUuid = $state<string | null>(null);
	let currentNode = $state<EventNode | null>(null);

	socket.on('event:node', ({ eventUuid, node }: { eventUuid: string; node: EventNode }) => {
		currentEventUuid = eventUuid;
		currentNode = node;
	});

	socket.on('event:end', ({ eventUuid }: { eventUuid: string }) => {
		if (currentEventUuid === eventUuid) {
			currentNode = null;
			currentEventUuid = null;
		}
	});

	function choose(choiceId: string) {
		if (!currentEventUuid) return;
		socket.emit('event:choice', { eventUuid: currentEventUuid, choiceId });
	}

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
</script>

{#if currentNode}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
		<div class="mx-4 w-full max-w-lg min-w-80 rounded border border-neutral-600 bg-neutral-900 p-8">
			<p class="mb-6 leading-relaxed text-neutral-300">
				{currentNode.description}
			</p>

			{#if currentNode.effects?.length}
				<ul class="mb-6 space-y-1">
					{#each currentNode.effects as effect}
						<li class="text-sm {effect.value < 0 ? 'text-green-400' : 'text-red-400'}">
							{formatEffect(effect)}
						</li>
					{/each}
				</ul>
			{/if}

			<div class="flex flex-col gap-2">
				{#if currentNode.choices.length === 0}
					<button
						onclick={() => choose('__confirm__')}
						class="w-full cursor-pointer rounded bg-neutral-700 py-3 text-white transition-colors hover:bg-neutral-600"
					>
						Continuer
					</button>
				{:else}
					{#each currentNode.choices as choice}
						<button
							onclick={() => choose(choice.id)}
							class="w-full cursor-pointer rounded bg-neutral-700 py-3 text-white transition-colors hover:bg-neutral-600"
						>
							{choice.label}
						</button>
					{/each}
				{/if}
			</div>
		</div>
	</div>
{/if}
