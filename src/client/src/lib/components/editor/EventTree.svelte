<script lang="ts">
	import type { GameEvent } from '$shared';

	type TreeNode =
		| { type: 'folder'; name: string; children: TreeNode[] }
		| { type: 'event'; name: string; event: GameEvent };

	let {
		tree,
		selectedEvent,
		onselect
	}: {
		tree: TreeNode[];
		selectedEvent: GameEvent | null;
		onselect: (e: GameEvent) => void;
	} = $props();

	let openFolders = $state<Set<string>>(new Set());

	function toggle(path: string) {
		if (openFolders.has(path)) {
			openFolders.delete(path);
		} else {
			openFolders.add(path);
		}
		openFolders = new Set(openFolders);
	}
</script>

{#snippet renderTree(nodes: TreeNode[], depth: number, parentPath: string)}
	{#each nodes as node}
		{#if node.type === 'folder'}
			{@const path = `${parentPath}/${node.name}`}
			<div>
				<button
					class="flex w-full items-center gap-1 rounded px-2 py-1 text-left text-xs text-gray-400 hover:bg-gray-800"
					style="padding-left: {depth * 12 + 8}px"
					onclick={() => toggle(path)}
				>
					<span class="text-gray-500">{openFolders.has(path) ? '▾' : '▸'}</span>
					<span class="font-semibold tracking-wider uppercase">{node.name}</span>
				</button>
				{#if openFolders.has(path)}
					<div>
						{@render renderTree(node.children, depth + 1, path)}
					</div>
				{/if}
			</div>
		{:else}
			<button
				class="flex w-full items-center gap-1 rounded px-2 py-1 text-left text-xs transition-colors
                    {selectedEvent?.id === node.event.id
					? 'bg-blue-600 text-white'
					: 'text-gray-300 hover:bg-gray-700'}"
				style="padding-left: {depth * 12 + 16}px"
				onclick={() => onselect(node.event)}
			>
				<span class="opacity-50">◆</span>
				<span class="truncate">{node.event.title}</span>
			</button>
		{/if}
	{/each}
{/snippet}

{@render renderTree(tree, 0, '')}
