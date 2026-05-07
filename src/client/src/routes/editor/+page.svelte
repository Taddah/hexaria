<script lang="ts">
	import EdgePanel from '$lib/components/editor/EdgePanel.svelte';
	import EventList from '$lib/components/editor/EventList.svelte';
	import EventPanel from '$lib/components/editor/EventPanel.svelte';
	import FlowCanvas from '$lib/components/editor/FlowCanvas.svelte';
	import NodePanel from '$lib/components/editor/NodePanel.svelte';
	import {
		type EventChoice,
		type EventEffect,
		type EventNode,
		type EventOutcome,
		type GameEvent
	} from '$shared';
	import type { Node, Edge } from '@xyflow/svelte';

	const modules = import.meta.glob('$shared/data/events/**/*.json', { eager: true });

	type NodeData = {
		label: string;
		description?: string;
		effects: EventEffect[];
		isSignificant: boolean;
	};

	type TreeNode =
		| { type: 'folder'; name: string; children: TreeNode[] }
		| { type: 'event'; name: string; event: GameEvent };

	let events: GameEvent[] = $state(
		Object.values(modules).flatMap((mod) => (mod as { default: GameEvent[] }).default)
	);
	let selectedEvent: GameEvent | null = $state(null);
	let selectedEdge = $state<Edge | null>(null);
	let selectedNodeId = $state<string | null>(null);
	let nodes = $state<Node[]>([]);
	let edges = $state<Edge[]>([]);

	let selectedNode = $derived(nodes.find((n) => n.id === selectedNodeId) ?? null);

	const tree = buildTree(modules);

	function createNewEvent(): GameEvent {
		return {
			id: 'new-event',
			title: 'Nouvel événement',
			probability: 50,
			triggers: [],
			polarity: 'neutral',
			nodes: [
				{
					id: 'start',
					description: 'Description du node de départ',
					effects: [],
					choices: [],
					isSignificant: false
				}
			]
		};
	}

	function buildTree(modules: Record<string, unknown>): TreeNode[] {
		const root: TreeNode[] = [];

		for (const [path, mod] of Object.entries(modules)) {
			const after = path.split('data/events/')[1];
			const parts = after.split('/');
			const eventsFromFile = (mod as { default: unknown }).default as GameEvent[];

			let current = root;
			for (let i = 0; i < parts.length - 1; i++) {
				const folderName = parts[i];
				let folder = current.find(
					(n): n is Extract<TreeNode, { type: 'folder' }> =>
						n.type === 'folder' && n.name === folderName
				);
				if (!folder) {
					folder = { type: 'folder', name: folderName, children: [] };
					current.push(folder);
				}
				current = folder.children;
			}

			for (const event of eventsFromFile) {
				current.push({ type: 'event', name: event.id, event });
			}
		}

		return root;
	}

	function saveEvent() {
		if (!selectedEvent) return;
		const rebuilt = flowToEvent(selectedEvent);
		const json = JSON.stringify([rebuilt], null, 2);
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${selectedEvent.id}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function computePositions(nodes: EventNode[], edges: { source: string; target: string }[]) {
		const levels = new Map<string, number>();
		const queue = [nodes[0].id];
		levels.set(nodes[0].id, 0);
		while (queue.length > 0) {
			const current = queue.shift()!;
			const currentLevel = levels.get(current)!;
			edges
				.filter((e) => e.source === current)
				.forEach((e) => {
					if (!levels.has(e.target)) {
						levels.set(e.target, currentLevel + 1);
						queue.push(e.target);
					}
				});
		}
		const levelCount = new Map<number, number>();
		levels.forEach((level) => levelCount.set(level, (levelCount.get(level) ?? 0) + 1));
		const levelCurrent = new Map<number, number>();
		const positions = new Map<string, { x: number; y: number }>();
		const SPACING_X = 220,
			SPACING_Y = 120;
		[...levels.entries()]
			.sort((a, b) => a[1] - b[1])
			.forEach(([id, level]) => {
				const count = levelCount.get(level)!;
				const current = levelCurrent.get(level) ?? 0;
				levelCurrent.set(level, current + 1);
				positions.set(id, {
					x: current * SPACING_X - ((count - 1) * SPACING_X) / 2,
					y: level * SPACING_Y
				});
			});
		return positions;
	}

	function eventToFlow(event: GameEvent): { nodes: Node[]; edges: Edge[] } {
		const localNodes: Node[] = [];
		const localEdges: Edge[] = [];

		event.nodes.forEach((node) => {
			node.choices?.forEach((choice) => {
				localEdges.push({
					id: `${node.id}-${choice.id}`,
					source: node.id,
					target: choice.id,
					label: choice.label,
					data: { choiceId: choice.id }
				});
				choice.outcomes?.forEach((outcome, j) => {
					if (outcome.nextNode)
						localEdges.push({
							id: `${node.id}-${choice.id}-${j}`,
							source: choice.id,
							target: outcome.nextNode,
							label: `${outcome.weight}%`,
							data: { weight: outcome.weight, baseLabel: choice.label, baseId: choice.id }
						});
				});
			});
		});

		const positions = computePositions(
			event.nodes,
			localEdges.map((e) => ({ source: e.source as string, target: e.target as string }))
		);

		event.nodes.forEach((node, i) => {
			const isRoot = i === 0;
			const isTerminal = !node.choices || node.choices.length === 0;
			const pos = positions.get(node.id) ?? { x: i * 220, y: 0 };
			localNodes.push({
				id: node.id,
				position: pos,
				style: isRoot
					? 'background:#14532d;border-color:#16a34a;color:white;'
					: isTerminal
						? 'background:#7f1d1d;border-color:#dc2626;color:white;'
						: 'background:#1e3a5f;border-color:#2563eb;color:white;',
				data: {
					label: node.description,
					description: node.description,
					effects: node.effects ?? []
				}
			});
			node.choices?.forEach((choice) => {
				const choicePos = positions.get(choice.id) ?? { x: 0, y: 150 };
				localNodes.push({
					id: choice.id,
					position: choicePos,
					data: { label: choice.label, description: choice.label, effects: [] }
				});
			});
		});

		return { nodes: localNodes, edges: localEdges };
	}

	function flowToEvent(event: GameEvent): GameEvent {
		const eventNodes: EventNode[] = [];
		const choiceNodeIds = new Set(
			edges
				.filter((e) => nodes.some((n) => n.id === e.source))
				.filter((e) => edges.some((oe) => oe.source === e.target))
				.map((e) => e.target)
		);
		for (const node of nodes.filter((n) => !choiceNodeIds.has(n.id))) {
			const data = node.data as NodeData;
			const choices: EventChoice[] = edges
				.filter((e) => e.source === node.id)
				.map((choiceEdge) => {
					const choiceId = String((choiceEdge.data as any)?.baseId ?? choiceEdge.target);
					const choiceLabel = String((choiceEdge.data as any)?.baseLabel ?? choiceEdge.label ?? '');
					const outcomes: EventOutcome[] = edges
						.filter((e) => e.source === choiceEdge.target)
						.map((oe) => ({
							weight: Number((oe.data as any)?.weight ?? 100),
							nextNode: String(oe.target),
							effects: ((oe.data as any)?.effects ?? []) as EventEffect[]
						}));
					return { id: choiceId, label: choiceLabel, outcomes };
				});
			eventNodes.push({
				id: node.id,
				description: data.description ?? '',
				choices,
				effects: (data.effects ?? []) as EventEffect[],
				isSignificant: Boolean(data.isSignificant)
			});
		}
		return { ...event, nodes: eventNodes };
	}

	function updateSelectedNodeData(patch: Partial<NodeData>) {
		if (!selectedNodeId) return;
		nodes = nodes.map((n) =>
			n.id === selectedNodeId
				? {
						...n,
						data: {
							...n.data,
							...patch,
							...(patch.description !== undefined ? { label: patch.description } : {})
						}
					}
				: n
		);
	}

	$effect(() => {
		if (selectedEvent) {
			const flow = eventToFlow(selectedEvent);
			nodes = flow.nodes;
			edges = flow.edges;
			selectedNodeId = null;
			selectedEdge = null;
		}
	});
</script>

<div class="grid h-screen overflow-hidden" style="grid-template-columns: 220px 1fr 300px">
	<EventList
		{tree}
		{selectedEvent}
		onselect={(e) => (selectedEvent = e)}
		oncreate={() => {
			const newEvent = createNewEvent();
			events = [...events, newEvent];
			selectedEvent = newEvent;
		}}
	/>

	{#if selectedEvent}
		<FlowCanvas
			bind:nodes
			bind:edges
			onsave={saveEvent}
			onnodeclick={({ node }) => {
				selectedNodeId = node.id;
				selectedEdge = null;
			}}
			onedgeclick={(e) => {
				selectedEdge = e.edge;
				selectedNodeId = null;
			}}
			onconnect={(e) => {
				edges = [
					...edges,
					{
						id: `${e.source}-${e.target}-${Date.now()}`,
						source: e.source,
						target: e.target,
						label: 'new',
						data: { choiceId: '', weight: 100 }
					}
				];
			}}
		/>
	{:else}
		<main class="flex items-center justify-center bg-gray-950">
			<p class="text-gray-600">Sélectionne un event</p>
		</main>
	{/if}

	<aside class="flex h-full flex-col overflow-hidden border-l border-gray-700 bg-gray-900">
		{#if selectedEvent}
			<EventPanel event={selectedEvent} onchange={(e) => (selectedEvent = e)} />
		{/if}
		<div class="shrink-0 border-t border-gray-700"></div>
		<div class="min-h-0 flex-1 overflow-y-auto p-3">
			{#if selectedNode}
				<NodePanel
					data={selectedNode.data as NodeData}
					onchange={updateSelectedNodeData}
					ondelete={() => {
						nodes = nodes.filter((n) => n.id !== selectedNodeId);
						edges = edges.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId);
						selectedNodeId = null;
					}}
				/>
			{:else if selectedEdge}
				<EdgePanel
					edge={selectedEdge}
					onchange={(updated) => {
						edges = edges.map((e) => (e.id === updated.id ? updated : e));
						selectedEdge = updated;
					}}
					ondelete={() => {
						edges = edges.filter((e) => e.id !== selectedEdge?.id);
						selectedEdge = null;
					}}
				/>
			{:else}
				<p class="text-xs text-gray-500">Sélectionne un node ou edge</p>
			{/if}
		</div>
		<div class="shrink-0 border-t border-gray-700 p-3">
			<button
				class="w-full rounded bg-blue-700 px-3 py-1.5 text-xs text-white hover:bg-blue-600"
				onclick={() => {
					nodes = [
						...nodes,
						{
							id: `node_${Date.now()}`,
							position: { x: 100, y: 100 },
							data: { label: 'Nouveau node', description: '', effects: [] }
						}
					];
				}}>+ Ajouter un Node</button
			>
		</div>
	</aside>
</div>
