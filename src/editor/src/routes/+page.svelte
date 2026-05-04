<script lang="ts">
	import { Canvas } from '@threlte/core';
	import EditorCanvas from './EditorCanvas.svelte';
	import EditorSidebar from './EditorSidebar.svelte';
	import '../app.css';
</script>

<div class="h-screen w-screen overflow-hidden bg-zinc-900 text-white relative">
	<EditorSidebar />

	<!-- Editor Canvas taking full screen -->
	<div class="absolute inset-0">
		<Canvas>
			<EditorCanvas />
		</Canvas>
	</div>
</div>
