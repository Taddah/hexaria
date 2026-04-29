<script lang="ts">
	type PanelShape =
		| 'pentagon'
		| 'trapezoid-right'
		| 'trapezoid-left'
		| 'trapezoid-top-left'
		| 'trapezoid-top-right';

	interface Props {
		width: number;
		height: number;
		shape?: PanelShape;
		gradientId?: string;
		bevel?: number;
		dividerY?: number;
	}

	let {
		width,
		height,
		shape = 'pentagon',
		gradientId = 'panelGrad',
		bevel = 24,
		dividerY
	}: Props = $props();

	function getPoints(w: number, h: number, s: PanelShape, b: number): string {
		switch (s) {
			case 'pentagon':
				return `0,0 ${w},0 ${w},${h - b} ${w / 2},${h} 0,${h - b}`;
			case 'trapezoid-right':
				return `0,0 ${w - b},0 ${w - b - (h * b) / w},${h} 0,${h}`;
			case 'trapezoid-left':
				return `0,0 ${w - b},0 ${w},${h} 0,${h}`;
			case 'trapezoid-top-left':
				return `${b},0 ${w},0 ${w},${h} 0,${h}`;
			case 'trapezoid-top-right':
				return `0,0 ${w},0 ${w},${h} ${b},${h}`;
			default:
				return `0,0 ${w},0 ${w},${h} 0,${h}`;
		}
	}

	const points = $derived(getPoints(width, height, shape, bevel));
</script>

<svg
	class="absolute inset-0 h-full w-full"
	viewBox="0 0 {width} {height}"
	xmlns="http://www.w3.org/2000/svg"
	preserveAspectRatio="none"
>
	<defs>
		<linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
			<stop offset="0%" stop-color="var(--color-bg-panel-2)" />
			<stop offset="100%" stop-color="var(--color-bg-panel)" />
		</linearGradient>
	</defs>
	<polygon {points} fill="url(#{gradientId})" />
	<polygon {points} fill="none" stroke="var(--color-gold)" stroke-width="1.5" />
	{#if dividerY !== undefined}
		<line x1="0" y1={dividerY} x2={width} y2={dividerY} stroke="var(--color-gold)" stroke-width="1" />
	{/if}
</svg>
