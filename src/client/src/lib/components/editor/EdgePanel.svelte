<script lang="ts">
	import type { Edge } from '@xyflow/svelte';

	let {
		edge,
		onchange,
		ondelete
	}: {
		edge: Edge;
		onchange: (edge: Edge) => void;
		ondelete: () => void;
	} = $props();
</script>

<div class="flex flex-col gap-2">
	<h2 class="mb-2 text-xs font-bold tracking-wider text-gray-400 uppercase">Transition</h2>
	<p class="text-xs text-gray-500">{edge.source} → {edge.target}</p>
	<div class="flex flex-col gap-0.5">
		<label class="text-xs text-gray-500">Label</label>
		<input
			class="rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-white"
			value={edge.data?.baseLabel ?? ''}
			oninput={(e) =>
				onchange({ ...edge, data: { ...edge.data, baseLabel: e.currentTarget.value } })}
		/>
	</div>
	<div class="flex flex-col gap-0.5">
		<label class="text-xs text-gray-500">ID</label>
		<input
			class="rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-white"
			value={edge.data?.baseId ?? ''}
			onchange={(e) => onchange({ ...edge, data: { ...edge.data, baseId: e.currentTarget.value } })}
		/>
	</div>
	<div class="flex flex-col gap-0.5">
		<label class="text-xs text-gray-500">Poids</label>
		<input
			type="number"
			class="rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-white"
			value={edge.data?.weight ?? 1}
			oninput={(e) =>
				onchange({ ...edge, data: { ...edge.data, weight: Number(e.currentTarget.value) } })}
		/>
	</div>
	<button
		class="mt-2 w-full rounded bg-red-700 px-3 py-1.5 text-xs text-white hover:bg-red-600"
		onclick={ondelete}>Supprimer l'edge</button
	>
</div>
