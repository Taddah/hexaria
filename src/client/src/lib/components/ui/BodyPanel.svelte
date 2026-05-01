<!-- BodyPanel.svelte -->
<script lang="ts">
	import { gameState } from '$lib/stores/gameState.svelte';
	import { BodyPart, type BodyPartState, type IBody } from '$shared';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	const stateColor: Record<BodyPartState, string> = {
		intact: '#16a34a', // green-600
		injured: '#ca8a04', // yellow-600
		handicapped: '#c2410c', // orange-700
		lost: '#b91c1c' // red-700
	};

	const stateLabel: Record<BodyPartState, string> = {
		intact: 'Intact',
		injured: 'Blessé',
		handicapped: 'Handicapé',
		lost: 'Perdu'
	};

	let body = $derived(gameState.localPlayer?.body);
	let hoveredPart = $state<keyof IBody | null>(null);

	function color(part: keyof IBody): string {
		if (!body) return stateColor.intact;
		return stateColor[body[part]];
	}

	function tooltip(part: keyof IBody): string {
		if (!body) return '';
		return stateLabel[body[part]];
	}

	const partLabels: Record<keyof IBody, string> = {
		head: 'Tête',
		eyeLeft: 'Œil gauche',
		eyeRight: 'Œil droit',
		armLeft: 'Bras gauche',
		armRight: 'Bras droit',
		legLeft: 'Jambe gauche',
		legRight: 'Jambe droite',
		torso: 'Torse'
	};
</script>

<!-- Panneau positionné à droite de la sidebar -->
<div
	class="panel-shadow absolute flex flex-col gap-3 p-4"
	style="
        left: calc(5.75rem + 1rem + 0.75rem);
        top: 50%;
        transform: translateY(-50%);
        z-index: 20;
        width: 220px;
        background: linear-gradient(135deg, var(--color-bg-panel-2), var(--color-bg-panel));
        border: 1px solid var(--color-gold);
        border-radius: 8px;
    "
>
	<!-- Header -->
	<div
		class="flex items-center justify-between border-b pb-2"
		style="border-color: var(--color-gold-dark);"
	>
		<span class="text-panel-title text-sm tracking-wide">État du corps</span>
		<button
			onclick={onclose}
			class="panel-btn flex items-center justify-center text-xs leading-none"
			style="width: 1.4rem; height: 1.4rem; padding: 0; color: var(--color-text-light);"
			aria-label="Fermer">✕</button
		>
	</div>

	<!-- SVG corps -->
	<div class="flex justify-center">
		<svg viewBox="0 0 200 340" width="160" height="272" xmlns="http://www.w3.org/2000/svg">
			<!-- Jambe gauche -->
			<g
				role="img"
				aria-label="Jambe gauche"
				onmouseenter={() => (hoveredPart = BodyPart.LEG_LEFT)}
				onmouseleave={() => (hoveredPart = null)}
				class="cursor-pointer"
			>
				<ellipse
					cx="82"
					cy="245"
					rx="16"
					ry="55"
					transform="rotate(-3 82 245)"
					fill={color(BodyPart.LEG_LEFT)}
					stroke="#1a1a1a"
					stroke-width="2"
				/>
				<ellipse
					cx="78"
					cy="310"
					rx="14"
					ry="8"
					fill={color(BodyPart.LEG_LEFT)}
					stroke="#1a1a1a"
					stroke-width="2"
				/>
			</g>

			<!-- Jambe droite -->
			<g
				role="img"
				aria-label="Jambe droite"
				onmouseenter={() => (hoveredPart = BodyPart.LEG_RIGHT)}
				onmouseleave={() => (hoveredPart = null)}
				class="cursor-pointer"
			>
				<ellipse
					cx="118"
					cy="245"
					rx="16"
					ry="55"
					transform="rotate(3 118 245)"
					fill={color(BodyPart.LEG_RIGHT)}
					stroke="#1a1a1a"
					stroke-width="2"
				/>
				<ellipse
					cx="122"
					cy="310"
					rx="14"
					ry="8"
					fill={color(BodyPart.LEG_RIGHT)}
					stroke="#1a1a1a"
					stroke-width="2"
				/>
			</g>

			<!-- Bras gauche (plus écarté) -->
			<!-- Bras gauche -->
			<ellipse
				cx="53"
				cy="155"
				rx="13"
				ry="48"
				transform="rotate(24 53 155)"
				fill={color(BodyPart.ARM_LEFT)}
				stroke="#1a1a1a"
				stroke-width="2"
			/>
			<ellipse
				cx="25"
				cy="217"
				rx="10"
				ry="12"
				fill={color(BodyPart.ARM_LEFT)}
				stroke="#1a1a1a"
				stroke-width="2"
			/>

			<!-- Bras droit -->
			<ellipse
				cx="147"
				cy="155"
				rx="13"
				ry="48"
				transform="rotate(-24 147 155)"
				fill={color(BodyPart.ARM_RIGHT)}
				stroke="#1a1a1a"
				stroke-width="2"
			/>
			<ellipse
				cx="170"
				cy="217"
				rx="10"
				ry="12"
				fill={color(BodyPart.ARM_RIGHT)}
				stroke="#1a1a1a"
				stroke-width="2"
			/>

			<!-- Torse -->
			<g
				role="img"
				aria-label="Torse"
				onmouseenter={() => (hoveredPart = BodyPart.TORSO)}
				onmouseleave={() => (hoveredPart = null)}
				class="cursor-pointer"
			>
				<ellipse
					cx="100"
					cy="165"
					rx="35"
					ry="65"
					fill={color(BodyPart.TORSO)}
					stroke="#1a1a1a"
					stroke-width="2"
				/>
			</g>

			<!-- Tête (rapprochée du torse) -->
			<g
				role="img"
				aria-label="Tête"
				onmouseenter={() => (hoveredPart = BodyPart.HEAD)}
				onmouseleave={() => (hoveredPart = null)}
				class="cursor-pointer"
			>
				<ellipse
					cx="100"
					cy="65"
					rx="28"
					ry="32"
					fill={color(BodyPart.HEAD)}
					stroke="#1a1a1a"
					stroke-width="2"
				/>
			</g>

			<!-- Œil gauche -->
			<g
				role="img"
				aria-label="Œil gauche"
				onmouseenter={() => (hoveredPart = BodyPart.EYE_LEFT)}
				onmouseleave={() => (hoveredPart = null)}
				class="cursor-pointer"
			>
				<ellipse
					cx="89"
					cy="62"
					rx="5"
					ry="4"
					fill={color(BodyPart.EYE_LEFT)}
					stroke="#1a1a1a"
					stroke-width="1.5"
				/>
				<ellipse cx="89" cy="62" rx="2" ry="2" fill="#1a1a1a" />
			</g>

			<!-- Œil droit -->
			<g
				role="img"
				aria-label="Œil droit"
				onmouseenter={() => (hoveredPart = BodyPart.EYE_RIGHT)}
				onmouseleave={() => (hoveredPart = null)}
				class="cursor-pointer"
			>
				<ellipse
					cx="111"
					cy="62"
					rx="5"
					ry="4"
					fill={color(BodyPart.EYE_RIGHT)}
					stroke="#1a1a1a"
					stroke-width="1.5"
				/>
				<ellipse cx="111" cy="62" rx="2" ry="2" fill="#1a1a1a" />
			</g>

			<!-- Nez -->
			<path
				d="M 95 73 Q 100 68 105 73"
				fill="none"
				stroke="#1a1a1a"
				stroke-width="1.5"
				stroke-linecap="round"
			/>
			<ellipse cx="97" cy="74" rx="1.5" ry="1" fill="#1a1a1a" />
			<ellipse cx="103" cy="74" rx="1.5" ry="1" fill="#1a1a1a" />
			<!-- Bouche -->
			<path
				d="M 92 88 Q 100 92 108 88"
				fill="none"
				stroke="#1a1a1a"
				stroke-width="1.5"
				stroke-linecap="round"
			/>
		</svg>
	</div>

	<!-- Tooltip partie hovered -->
	{#if hoveredPart && body}
		<div
			class="flex h-7 items-center justify-center rounded"
			style="background: var(--color-bg-dark); border: 1px solid var(--color-gold-deep);"
		>
			<span class="text-xs" style="color: var(--color-text-light); font-family: var(--font-serif);">
				{partLabels[hoveredPart]}
				<span style="color: var(--color-text-muted)">—</span>
				<span style="color: {color(hoveredPart)}; font-weight: 700;">{tooltip(hoveredPart)}</span>
			</span>
		</div>
	{:else}
		<div class="h-7"></div>
	{/if}
</div>
