<script lang="ts">
	import type { EventEffect } from '$shared';
	import EffectsEditor from '$lib/components/editor/EffectsEditor.svelte';

	type NodeData = {
		label: string;
		description?: string;
		effects: EventEffect[];
	};

	let {
		data,
		onchange,
		ondelete
	}: {
		data: NodeData;
		onchange: (patch: Partial<NodeData>) => void;
		ondelete: () => void;
	} = $props();
</script>

<div class="flex flex-col gap-2">
	<h2 class="mb-2 text-xs font-bold tracking-wider text-gray-400 uppercase">Node</h2>
	<div class="flex flex-col gap-0.5">
		<label class="text-xs text-gray-500">Description</label>
		<textarea
			class="resize-none rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
			rows={3}
			value={data.description ?? ''}
			oninput={(e) => onchange({ description: e.currentTarget.value })}
		></textarea>
	</div>
	<EffectsEditor effects={data.effects ?? []} onchange={(effects) => onchange({ effects })} />
	<button
		class="mt-2 w-full rounded bg-red-700 px-3 py-1.5 text-xs text-white hover:bg-red-600"
		onclick={ondelete}>Supprimer le node</button
	>
</div>
