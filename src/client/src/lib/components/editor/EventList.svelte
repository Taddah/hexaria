<script lang="ts">
	import type { GameEvent } from '$shared';
	import EventTree from './EventTree.svelte';

	let {
		tree,
		selectedEvent,
		onselect,
		oncreate
	}: {
		tree: TreeNode[];
		selectedEvent: GameEvent | null;
		onselect: (e: GameEvent) => void;
		oncreate: () => void;
	} = $props();

	type TreeNode =
		| { type: 'folder'; name: string; children: TreeNode[] }
		| { type: 'event'; name: string; event: GameEvent };
</script>

<aside class="flex flex-col gap-2 overflow-y-auto border-r border-gray-700 bg-gray-900 p-3">
	<button
		class="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
		onclick={oncreate}
	>
		+ Nouvel event
	</button>
	<div class="mt-2 flex flex-col gap-0.5">
		<EventTree {tree} {selectedEvent} {onselect} />
	</div>
</aside>
