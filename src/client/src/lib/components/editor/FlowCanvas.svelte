<script lang="ts">
	import { SvelteFlow, Background } from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import type { Node, Edge } from '@xyflow/svelte';

	let {
		nodes = $bindable(),
		edges = $bindable(),
		onnodeclick,
		onedgeclick,
		onconnect,
		onsave
	}: {
		nodes: Node[];
		edges: Edge[];
		onnodeclick: (e: { node: Node }) => void;
		onedgeclick: (e: { edge: Edge }) => void;
		onconnect: (e: any) => void;
		onsave: () => void;
	} = $props();
</script>

<main class="relative flex items-center justify-center bg-gray-950">
	<div class="absolute top-4 left-4 z-10 flex gap-2">
		<button
			onclick={onsave}
			class="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-colors hover:bg-emerald-500"
		>
			💾 Sauvegarder
		</button>
	</div>
	<SvelteFlow bind:nodes bind:edges fitView {onnodeclick} {onedgeclick} {onconnect}>
		<Background />
	</SvelteFlow>
</main>
