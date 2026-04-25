<script lang="ts">
	import type { TileData } from '$shared';

	let {
		selectedHex,
		isMoveValid,
		canHarvest,
		playerTile,
		onRequestMove,
		onRequestHarvest
	}: {
		selectedHex: { q: number; r: number } | null;
		isMoveValid: boolean;
		canHarvest: boolean;
		playerTile: TileData | null | undefined;
		onRequestMove: () => void;
		onRequestHarvest: () => void;
	} = $props();
</script>

<div class="pointer-events-auto absolute top-24 right-6 z-20 w-[320px]">
	<div
		class="rounded-md border border-[#4a433a] bg-[#1a1715]/95 p-1 shadow-[0_8px_30px_rgba(0,0,0,0.7)] ring-1 ring-[#695d4e] backdrop-blur-md ring-inset"
	>
		<div class="rounded-sm border border-[#3e3831] bg-[#24211d]/90 px-3 pt-3 pb-3 shadow-inner">
			<!-- Header -->
			<div
				class="relative mb-3 rounded-sm border border-[#3e3831] bg-[#1c1917] py-1 text-center shadow-inner"
			>
				<span class="text-[13px] font-semibold tracking-widest text-[#cfc5b3]">
					Actions Disponibles - [Hex {selectedHex ? `${selectedHex.q}, ${selectedHex.r}` : '—'}]
				</span>
			</div>

			<div class="flex flex-col gap-[7px]">
				{#if isMoveValid}
					<button onclick={onRequestMove} class="action-btn">
						<div class="flex items-center gap-3">
							<span class="icon drop-shadow-md">🏃</span>
							<span class="font-semibold text-[#e1d5c2]">Déplacer</span>
						</div>
					</button>
				{/if}

				{#if canHarvest}
					<button
						onclick={onRequestHarvest}
						class="action-btn border-[#3b4731] bg-gradient-to-b from-[#253022] to-[#161c14]"
					>
						<div class="flex items-center gap-3">
							<span class="icon drop-shadow-md"
								>{playerTile?.resource?.type === 'iron' ? '⛏️' : '🌲'}</span
							> <span class="font-semibold text-[#8eb87e] drop-shadow-sm">Récolter</span>
						</div>
						<span class="text-[11px] text-[#718d65]"
							>({playerTile?.resource?.type === 'iron' ? 'Fer' : 'Bois'})</span
						>
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.action-btn {
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: space-between;
		border-radius: 4px;
		border: 1px solid #4a433a;
		background: linear-gradient(180deg, #2e2a25 0%, #1e1b18 100%);
		padding: 8px 12px;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.05),
			0 2px 4px rgba(0, 0, 0, 0.3);
		transition: all 150ms ease;
		cursor: pointer;
	}

	.action-btn:hover {
		filter: brightness(1.2);
		transform: translateY(-1px);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 4px 6px rgba(0, 0, 0, 0.4);
	}

	.action-btn:active {
		filter: brightness(0.9);
		transform: translateY(1px);
		box-shadow:
			inset 0 1px 0 rgba(0, 0, 0, 0.2),
			0 1px 2px rgba(0, 0, 0, 0.5);
	}

	.action-btn .icon {
		font-size: 18px;
		line-height: 1;
	}
</style>
