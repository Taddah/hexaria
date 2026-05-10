<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getSocket } from '$lib/services/socket';

	interface DeceasedCharacter {
		id: string;
		character_name: string;
		age_at_death: number;
		cause: string;
		life_summary: string;
		died_at: string;
		year_of_death?: number;
	}

	let characters = $state<DeceasedCharacter[]>([]);
	let loading = $state(true);
	let selected = $state<DeceasedCharacter | null>(null);

	onMount(() => {
		const socket = getSocket();

		socket.on('legacy_data', (data) => {
			characters = data;
			loading = false;
		});

		socket.on('legacy_error', (msg) => {
			console.error(msg);
			loading = false;
		});

		socket.emit('get_legacy');
	});

	onDestroy(() => {
		try {
			const socket = getSocket();
			socket.off('legacy_data');
			socket.off('legacy_error');
		} catch (e) {}
	});

	interface Props {
		onClose: () => void;
	}
	let { onClose }: Props = $props();

	const CAUSE_LABELS: Record<string, string> = {
		AGE: 'Vieillesse',
		INJURY: 'Blessure',
		EVENT: 'Événement'
	};
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
	<div
		class="relative flex h-[80vh] w-full max-w-5xl flex-col gap-6 overflow-hidden rounded-lg border border-[var(--color-gold-dark)] bg-[var(--color-bg-panel)] shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
	>
		<!-- Header -->
		<div
			class="flex items-center justify-between border-b border-[var(--color-gold-dark)] bg-[var(--color-bg-dark)]/50 p-6"
		>
			<h2 class="m-0 font-serif text-2xl font-bold tracking-[0.1em] text-[var(--color-gold)]">
				Le Livre des Morts
			</h2>
			<button
				onclick={onClose}
				class="cursor-pointer border-none bg-transparent p-2 text-[var(--color-text-muted)] transition-colors hover:text-white"
			>
				✕
			</button>
		</div>

		<!-- Grid -->
		<div class="flex-1 overflow-y-auto p-6">
			{#if loading}
				<div class="flex justify-center py-12">
					<span class="animate-pulse text-2xl text-[var(--color-gold)]">⏳</span>
				</div>
			{:else if characters.length === 0}
				<div class="py-12 text-center font-serif text-[var(--color-text-muted)] italic">
					Aucun habitant n'a encore péri sous votre garde.
				</div>
			{:else}
				<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
					{#each characters as char}
						<button
							onclick={() => (selected = char)}
							class="group flex cursor-pointer flex-col items-center gap-2 rounded border border-neutral-700 bg-[var(--color-bg-dark)] p-4 text-center transition-all hover:border-[var(--color-gold-dark)] hover:bg-[var(--color-bg-dark)]/80 hover:shadow-[0_0_12px_rgba(0,0,0,0.4)]"
						>
							<span class="text-3xl transition-transform group-hover:scale-110">🪦</span>
							<span class="font-serif text-sm leading-tight font-bold text-white">
								{char.character_name}
							</span>
							<span class="text-xs text-[var(--color-text-muted)]">
								{char.age_at_death} ans
							</span>
							{#if char.year_of_death}
								<span
									class="text-[10px] tracking-widest text-[var(--color-gold-dark)] uppercase opacity-70"
								>
									An {char.year_of_death}
								</span>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Detail modal -->
{#if selected}
	<div
		class="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
		role="presentation"
		onclick={() => (selected = null)}
		onkeydown={(e) => e.key === 'Escape' && (selected = null)}
	>
		<div
			class="relative flex max-h-[70vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-lg border border-[var(--color-gold-dark)] bg-[var(--color-bg-panel)] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
		>
			<div class="flex items-start justify-between gap-4">
				<div class="flex items-center gap-3">
					<span class="text-4xl">🪦</span>
					<div>
						<h3 class="m-0 font-serif text-xl font-bold text-white">{selected.character_name}</h3>
						<p class="m-0 text-xs tracking-wider text-[var(--color-text-muted)] uppercase">
							{selected.age_at_death} ans · {CAUSE_LABELS[selected.cause] ?? selected.cause}
							{#if selected.year_of_death}
								· An {selected.year_of_death}{/if}
						</p>
					</div>
				</div>
				<button
					onclick={() => (selected = null)}
					class="shrink-0 cursor-pointer border-none bg-transparent p-1 text-[var(--color-text-muted)] transition-colors hover:text-white"
				>
					✕
				</button>
			</div>

			<p
				class="m-0 border-t border-neutral-700 pt-4 font-serif text-sm leading-relaxed whitespace-pre-wrap text-neutral-300 italic"
			>
				{selected.life_summary}
			</p>
		</div>
	</div>
{/if}
