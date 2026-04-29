<script>
	import { gameState } from '$lib/stores/gameState.svelte';

	const localPlayer = $derived(gameState.localPlayer);
</script>

<div
	class="panel-shadow relative flex items-center"
	style="width: 23rem; height: 5.75rem; margin: 1rem 0 1rem 1rem; z-index: 20; position: relative;"
>
	<svg
		class="absolute inset-0 ml-4 h-full w-full"
		viewBox="0 0 370 92"
		xmlns="http://www.w3.org/2000/svg"
		preserveAspectRatio="none"
	>
		<defs>
			<linearGradient id="playerInfoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stop-color="var(--color-bg-panel-2)" />
				<stop offset="100%" stop-color="var(--color-bg-panel)" />
			</linearGradient>
		</defs>
		<polygon points="0,0 358,0 325,92 0,92" fill="url(#playerInfoGrad)" />
		<polygon
			points="0,0 358,0 325,92 0,92"
			fill="none"
			stroke="var(--color-gold)"
			stroke-width="1.5"
		/>
	</svg>

	<div
		class="relative z-10 flex h-full w-full items-center"
		style="padding-left: 7rem; padding-right: 2.5rem; gap: 0.75rem;"
	>
		<!-- Avatar circle -->
		<div
			class="avatar-ring"
			style="
				width: 6.25rem;
				height: 6.25rem;
				left: -0.3rem;
				top: 50%;
				transform: translateY(-50%);
			"
		>
			<div
				class="absolute inset-0 rounded-full"
				style="
					background: linear-gradient(to bottom, var(--color-gold) 0%, var(--color-gold-dark) 50%, var(--color-gold-deep) 100%);
					padding: 0.25rem;
					border-radius: 9999px;
					z-index: -1;
					margin: -0.25rem;
				"
			>
				<div class="h-full w-full rounded-full" style="background: var(--color-bg-dark);"></div>
			</div>

			<svg
				xmlns="http://www.w3.org/2000/svg"
				style="width: 2.8rem; height: 2.8rem; position: relative; z-index: 1;"
				viewBox="0 0 24 24"
				fill="none"
				stroke="#6b7a8d"
				stroke-width="1.5"
			>
				<circle cx="12" cy="8" r="4" />
				<path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
			</svg>
		</div>

		<div class="flex flex-col gap-1">
			<span class="text-panel-title text-lg leading-tight">{localPlayer?.identity.name}</span>
			<span class="text-panel-title text-lg leading-tight" style="color: var(--color-gold)"
				>Âge: {localPlayer?.identity.currentAge}</span
			>
		</div>
	</div>
</div>

<style>
	.avatar-ring {
		position: absolute;
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		background: var(--color-bg-dark);
		border: 0.25rem solid transparent;
		background-clip: padding-box;
		box-shadow:
			0 0 0 0.25rem var(--color-gold-ring),
			inset 0 0 0.625rem rgba(0, 0, 0, 0.8);
		z-index: 20;
	}
</style>
