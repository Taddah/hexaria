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
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity">
		<div 
			class="panel-shadow relative mx-4 w-full max-w-2xl min-w-[320px] rounded-lg border flex flex-col overflow-hidden"
			style="
				background: linear-gradient(135deg, var(--color-bg-panel-2), var(--color-bg-panel));
				border-color: var(--color-gold);
				box-shadow: 0 20px 50px -10px rgba(0,0,0,0.7), inset 0 0 20px rgba(212, 175, 55, 0.05);
			"
		>
			<!-- Optional decoration -->
			<div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, transparent, var(--color-gold), transparent); opacity: 0.5;"></div>

			<div class="p-8 md:p-10 flex flex-col gap-8">
				<!-- Description -->
				<div class="relative">
					<p 
						class="text-lg md:text-xl leading-relaxed whitespace-pre-wrap"
						style="color: var(--color-text-light); font-family: var(--font-serif);"
					>
						{currentNode.description}
					</p>
				</div>

				<!-- Effets subis immédiats -->
				{#if currentNode.effects?.length}
					<div class="rounded-md border p-4 bg-black/30" style="border-color: var(--color-gold-dark);">
						<h4 class="text-xs uppercase tracking-widest mb-2 font-bold opacity-80" style="color: var(--color-gold);">Conséquences Immédiates</h4>
						<ul class="space-y-1.5">
							{#each currentNode.effects as effect}
								<li class="text-sm font-medium flex items-center gap-2 {effect.value < 0 ? 'text-green-400' : 'text-red-400'}">
									<span class="opacity-50 text-[10px]">♦</span> {formatEffect(effect)}
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				<!-- Choices -->
				<div class="flex flex-col gap-3 mt-4">
					{#if currentNode.choices.length === 0}
						<button
							onclick={() => choose('__confirm__')}
							class="w-full cursor-pointer rounded-md py-4 text-center font-bold uppercase tracking-wider transition-all"
							style="
								background: rgba(212, 175, 55, 0.1);
								border: 1px solid var(--color-gold-dark);
								color: var(--color-gold);
							"
							onmouseover={(e) => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.15)'; }}
							onfocus={(e) => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.15)'; }}
							onmouseout={(e) => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
							onblur={(e) => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
						>
							Continuer
						</button>
					{:else}
						{#each currentNode.choices as choice}
							<button
								onclick={() => choose(choice.id)}
								class="w-full cursor-pointer rounded-md py-4 px-6 text-left transition-all relative overflow-hidden group border border-transparent"
								style="
									background: var(--color-bg-dark);
									color: var(--color-text-light);
								"
								onmouseover={(e) => { e.currentTarget.style.borderColor = 'var(--color-gold-dark)'; e.currentTarget.style.background = 'var(--color-bg-panel-2)'; }}
								onfocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-gold-dark)'; e.currentTarget.style.background = 'var(--color-bg-panel-2)'; }}
								onmouseout={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'var(--color-bg-dark)'; }}
								onblur={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'var(--color-bg-dark)'; }}
							>
								<div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style="background: linear-gradient(90deg, rgba(212, 175, 55, 0.1), transparent);"></div>
								<span class="relative z-10 text-base md:text-lg font-medium" style="font-family: var(--font-serif);">{choice.label}</span>
							</button>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
