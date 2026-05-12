<script lang="ts">
	import { tradeState } from '$lib/stores/tradeState.svelte';
	import { respondTrade } from '$lib/services/tradeService';

	let timeLeft = $state(15);
	let interval: ReturnType<typeof setInterval> | null = null;

	$effect(() => {
		if (!tradeState.pendingInvite) {
			clearTimer();
			timeLeft = 15;
			return;
		}

		const expiresAt = tradeState.pendingInvite.session.expiresAt;

		const tick = () => {
			const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
			timeLeft = remaining;
			if (remaining === 0) clearTimer();
		};

		tick();
		interval = setInterval(tick, 200);

		return () => clearTimer();
	});

	function clearTimer() {
		if (interval !== null) {
			clearInterval(interval);
			interval = null;
		}
	}

	function accept() {
		if (!tradeState.pendingInvite) return;
		respondTrade(tradeState.pendingInvite.session.id, true);
		tradeState.pendingInvite = null;
	}

	function refuse() {
		if (!tradeState.pendingInvite) return;
		respondTrade(tradeState.pendingInvite.session.id, false);
		tradeState.pendingInvite = null;
	}
</script>

{#if tradeState.pendingInvite}
	<div
		class="fixed bottom-20 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-xl
                border border-[hsl(220_15%_35%)] bg-[hsl(220_15%_18%/0.95)] px-5
                py-2.5 text-sm text-slate-200 backdrop-blur-sm"
	>
		<span class="font-semibold text-blue-300">{tradeState.pendingInvite.initiatorName}</span>
		<span>vous propose un échange</span>

		<!-- Timer circulaire -->
		<div class="relative grid h-8 w-8 place-items-center">
			<svg class="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 32 32">
				<circle class="fill-none stroke-[hsl(220_15%_30%)] stroke-[3]" cx="16" cy="16" r="13" />
				<circle
					class="linear fill-none stroke-blue-400 stroke-[3] transition-[stroke-dashoffset] duration-200"
					cx="16"
					cy="16"
					r="13"
					stroke-dasharray="81.68"
					stroke-dashoffset={81.68 - (timeLeft / 15) * 81.68}
				/>
			</svg>
			<span class="relative text-[0.7rem] font-bold">{timeLeft}</span>
		</div>

		<button
			onclick={accept}
			class="cursor-pointer rounded-md border-none bg-green-700 px-3 py-1 text-[0.85rem] text-white"
		>
			Accepter
		</button>
		<button
			onclick={refuse}
			class="cursor-pointer rounded-md border-none bg-[hsl(220_15%_28%)] px-3 py-1 text-[0.85rem] text-slate-200"
		>
			Refuser
		</button>
	</div>
{/if}
