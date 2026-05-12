<script lang="ts">
	import { inspectState } from '$lib/stores/inspectStore.svelte';

	const reputationLabel = (r: number) =>
		r >= 60
			? 'Excellente'
			: r >= 20
				? 'Bonne'
				: r >= -20
					? 'Neutre'
					: r >= -60
						? 'Mauvaise'
						: 'Exécrable';

	const reputationColor = (r: number) =>
		r >= 20 ? 'text-green-400' : r >= -20 ? 'text-slate-300' : 'text-red-400';

	const LIMB_LABEL: Record<string, string> = {
		head: 'Tête',
		torso: 'Torse',
		armLeft: 'Bras gauche',
		armRight: 'Bras droit',
		legLeft: 'Jambe gauche',
		legRight: 'Jambe droite',
		eyeLeft: 'Œil gauche',
		eyeRight: 'Œil droit'
	};

	const injuredLimbs = $derived(
		inspectState.data
			? (Object.entries(inspectState.data.bodyStatus) as [string, string][]).filter(
					([_, state]) => state !== 'intact'
				)
			: []
	);
</script>

{#if inspectState.open}
	<div
		class="fixed inset-0 z-[200] flex items-center justify-center bg-black/40"
		role="button"
		tabindex="0"
		onclick={() => (inspectState.open = false)}
		onkeydown={(e) => e.key === 'Escape' && (inspectState.open = false)}
		aria-label="Fermer l'inspection"
	>
		<div
			class="relative flex w-80 flex-col gap-4 rounded-2xl
                    border border-[hsl(220_15%_30%)] bg-[hsl(220_15%_18%/0.97)]
                    p-6 text-slate-200 shadow-xl backdrop-blur-md"
		>
			<!-- Header -->
			<header class="flex items-start justify-between">
				<div>
					<h2 class="m-0 text-lg font-semibold">
						{#if inspectState.data}
							{inspectState.data.firstName} {inspectState.data.lastName}
						{:else}
							Inspection…
						{/if}
					</h2>
					{#if inspectState.data}
						<p class="m-0 text-sm text-slate-400">{inspectState.data.age} ans</p>
					{/if}
				</div>
				<button
					onclick={() => (inspectState.open = false)}
					class="cursor-pointer border-none bg-transparent text-lg text-slate-400 hover:text-slate-200"
				>
					✕
				</button>
			</header>

			{#if inspectState.loading}
				<p class="py-4 text-center text-sm text-slate-400">Chargement…</p>
			{:else if inspectState.error}
				<p class="py-4 text-center text-sm text-red-400">
					{inspectState.error === 'OUT_OF_RANGE'
						? 'Ce joueur est trop loin.'
						: 'Joueur introuvable.'}
				</p>
			{:else if inspectState.data}
				<!-- Réputation -->
				<div
					class="flex items-center justify-between
                            rounded-lg bg-[hsl(220_15%_22%)] px-4 py-2"
				>
					<span class="text-sm text-slate-400">Réputation</span>
					<span class="text-sm font-semibold {reputationColor(inspectState.data.reputation)}">
						{reputationLabel(inspectState.data.reputation)}
					</span>
				</div>

				<!-- État physique -->
				<div class="flex flex-col gap-2">
					<h3 class="m-0 text-xs tracking-wide text-slate-500 uppercase">État physique</h3>

					{#if injuredLimbs.length === 0}
						<p class="text-sm text-green-400">Aucune blessure apparente</p>
					{:else}
						{#each injuredLimbs as [part, state]}
							<div class="flex items-center gap-2 text-sm">
								<span
									class="h-2 w-2 flex-shrink-0 rounded-full
                   {state === 'lost' ? 'bg-red-600' : 'bg-orange-400'}"
								></span>
								<span class="text-slate-300">{LIMB_LABEL[part] ?? part}</span>
								<span
									class="ml-auto text-xs {state === 'lost' ? 'text-red-400' : 'text-orange-300'}"
								>
									{state === 'lost' ? 'Manquant' : 'Gravement blessé'}
								</span>
							</div>
						{/each}
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}
