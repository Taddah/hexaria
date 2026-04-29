<script lang="ts">
	import PanelBg from './PanelBg.svelte';
</script>

<div
	class="panel-shadow absolute bottom-0 left-0"
	style="z-index: 15;"
>
	<div class="relative" style="width: 28.75rem; height: 2.625rem;">
		<PanelBg width={460} height={42} shape="trapezoid-left" gradientId="hexInfoGrad" bevel={20} />

		<div
			class="relative z-10 flex h-full w-full items-center justify-between"
			style="padding: 0 2.5rem;"
		>
			<span class="label-uppercase">
				<span class="font-bold" style="color: var(--color-gold);">COORDONNÉES:</span> X: 412, Y: 298
			</span>

			<span class="label-uppercase">
				<span class="font-bold" style="color: var(--color-gold);">BIOME:</span> Plaines Verdoyantes
			</span>
		</div>
	</div>
</div>
