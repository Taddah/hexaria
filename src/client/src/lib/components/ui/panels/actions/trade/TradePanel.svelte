<script lang="ts">
	import {
		tradeState,
		myOffer,
		theirOffer,
		amILocked,
		isOtherLocked
	} from '$lib/stores/tradeState.svelte';
	import { updateOffer, lockOffer, cancelTrade } from '$lib/services/tradeService';
	import { gameState } from '$lib/stores/gameState.svelte';
	import type { TradeOffer } from '$shared';

	const localId = $derived(gameState.localPlayer?.id ?? -1);

	const mine = $derived(myOffer(localId) ?? { wood: 0, stone: 0, silver: 0 });
	const theirs = $derived(theirOffer(localId) ?? { wood: 0, stone: 0, silver: 0 });
	const locked = $derived(amILocked(localId));
	const otherLocked = $derived(isOtherLocked(localId));

	const inv = $derived(gameState.localPlayer?.inventory);

	let confirmed = $state(false);
	let cancelMsg = $state<string | null>(null);

	$effect(() => {
		const onConfirmed = () => {
			confirmed = true;
			setTimeout(() => {
				confirmed = false;
			}, 2_000);
		};
		const onCancelled = (e: Event) => {
			const reason = (e as CustomEvent).detail?.reason as string;
			cancelMsg = reasonLabel(reason);
			setTimeout(() => {
				cancelMsg = null;
			}, 3_000);
		};

		window.addEventListener('trade:confirmed', onConfirmed);
		window.addEventListener('trade:cancelled', onCancelled);
		return () => {
			window.removeEventListener('trade:confirmed', onConfirmed);
			window.removeEventListener('trade:cancelled', onCancelled);
		};
	});

	const REASON_LABELS: Record<string, string> = {
		TIMEOUT: "L'invitation a expiré.",
		REFUSED: "L'échange a été refusé.",
		PLAYER_MOVED: "Un joueur s'est déplacé.",
		PLAYER_DISCONNECTED: "Un joueur s'est déconnecté.",
		INSUFFICIENT_FUNDS: 'Inventaire insuffisant.',
		MANUAL: 'Échange annulé.'
	};
	function reasonLabel(r: string) {
		return REASON_LABELS[r] ?? 'Échange annulé.';
	}

	function handleChange(field: keyof TradeOffer, raw: string) {
		const val = Math.max(0, parseInt(raw, 10) || 0);
		updateOffer(tradeState.session!.id, { ...mine, [field]: val });
	}
	function handleLock() {
		lockOffer(tradeState.session!.id);
	}
	function handleCancel() {
		cancelTrade(tradeState.session!.id);
	}

	const otherId = $derived(
		tradeState.session
			? tradeState.session.playerA === localId
				? tradeState.session.playerB
				: tradeState.session.playerA
			: -1
	);
	const otherName = $derived(
		gameState.entities.find((e) => e.id === otherId)?.identity?.firstName ?? 'Joueur'
	);
</script>

<!-- Toasts -->
{#if confirmed}
	<div
		class="pointer-events-none fixed top-20 left-1/2 z-[300] -translate-x-1/2 rounded-lg bg-green-700 px-5
                py-2 text-sm font-semibold text-white"
	>
		✓ Échange effectué !
	</div>
{/if}

{#if cancelMsg}
	<div
		class="pointer-events-none fixed top-20 left-1/2 z-[300] -translate-x-1/2 rounded-lg bg-red-600 px-5
                py-2 text-sm font-semibold text-white"
	>
		{cancelMsg}
	</div>
{/if}

<!-- Panneau principal -->
{#if tradeState.session?.status === 'ACTIVE'}
	<div
		class="fixed top-1/2 left-1/2 z-[200] flex
                w-[min(640px,95vw)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4
                rounded-2xl border border-[hsl(220_15%_30%)]
                bg-[hsl(220_15%_14%/0.97)] p-6 text-slate-200 backdrop-blur-md"
	>
		<!-- Header -->
		<header class="flex items-center justify-between">
			<h2 class="m-0 text-[1.1rem]">
				Échange avec <span class="text-blue-300">{otherName}</span>
			</h2>
			<button
				onclick={handleCancel}
				class="cursor-pointer border-none bg-transparent text-[1.1rem] text-slate-400 hover:text-slate-200"
				>✕</button
			>
		</header>

		<!-- Offres -->
		<div class="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
			<!-- Mon offre -->
			<section class="flex flex-col gap-2">
				<h3 class="m-0 mb-2 text-[0.9rem] text-slate-400">Votre offre</h3>
				{#each ['wood', 'stone', 'silver'] as const as resource}
					<label class="flex items-center gap-2 text-sm">
						<span class="w-14 text-slate-400 capitalize">{resource}</span>
						<input
							type="number"
							min="0"
							max={inv ? inv[resource] : 999}
							value={mine[resource]}
							disabled={locked}
							oninput={(e) => handleChange(resource, (e.target as HTMLInputElement).value)}
							class="w-20 rounded-md border border-[hsl(220_15%_35%)] bg-[hsl(220_15%_22%)] px-2
                                   py-1 text-sm text-slate-200
                                   disabled:opacity-50"
						/>
						<span class="text-xs text-slate-500">/ {inv?.[resource] ?? 0}</span>
					</label>
				{/each}
			</section>

			<!-- Séparateur -->
			<div class="flex items-center justify-center pt-8 text-2xl text-slate-600">⇄</div>

			<!-- Offre adverse -->
			<section class="flex flex-col gap-2">
				<h3 class="m-0 mb-2 text-[0.9rem] text-slate-400">Offre de {otherName}</h3>
				{#each ['wood', 'stone', 'silver'] as const as resource}
					<div class="flex items-center gap-2 text-sm">
						<span class="w-14 text-slate-400 capitalize">{resource}</span>
						<span class="font-semibold">{theirs[resource]}</span>
					</div>
				{/each}
			</section>
		</div>

		<!-- Footer -->
		<footer class="flex flex-col gap-3 border-t border-[hsl(220_15%_25%)] pt-4">
			<div class="flex justify-around text-xs text-slate-400">
				<span class={locked ? 'text-green-400' : ''}>
					{locked ? '🔒 Vous avez validé' : '⬜ En attente de votre validation'}
				</span>
				<span class={otherLocked ? 'text-green-400' : ''}>
					{otherLocked ? `🔒 ${otherName} a validé` : `⬜ ${otherName} en attente`}
				</span>
			</div>

			<button
				onclick={handleLock}
				disabled={locked}
				class="cursor-pointer self-center rounded-lg border-none px-6 py-2 text-[0.95rem]
                       text-white transition-colors duration-150
                       {locked
					? 'cursor-default bg-[hsl(220_15%_28%)]'
					: 'bg-blue-600 hover:bg-blue-700'}"
			>
				{locked ? "En attente de l'autre joueur…" : 'Valider mon offre'}
			</button>
		</footer>
	</div>
{/if}
