<script lang="ts">
	import { Canvas } from '@threlte/core';
	import EditorCanvas from './EditorCanvas.svelte';
	import '../app.css';
</script>

<div class="h-screen w-screen overflow-hidden bg-zinc-900 text-white relative">
	<!-- Editor Canvas taking full screen -->
	<div class="absolute inset-0">
		<Canvas>
			<EditorCanvas />
		</Canvas>
	</div>

	<!-- Simple overlay for UI placeholder (Iteration 2 will replace this) -->
	<div class="absolute top-4 left-4 p-4 bg-zinc-800/80 rounded border border-zinc-700 pointer-events-none shadow-lg">
		<h1 class="text-xl font-bold text-amber-500 mb-1">Hexaria Map Editor</h1>
		<p class="text-sm text-zinc-300">Flèches pour bouger • Molette pour zoomer</p>
		<p class="text-xs text-zinc-400 mt-2">Cliquez sur une zone semi-transparente pour étendre la map.</p>
	</div>
</div>
