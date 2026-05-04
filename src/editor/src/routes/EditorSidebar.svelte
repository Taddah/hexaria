<script lang="ts">
	import { editorState } from '$lib/stores/editorState.svelte';
	import { onMount } from 'svelte';

	let assets: Record<string, string[]> = $state({});
	let loading = $state(true);

	onMount(async () => {
		try {
			const res = await fetch('/api/assets');
			if (res.ok) {
				assets = await res.json();
			}
		} catch (e) {
			console.error('Failed to load assets', e);
		} finally {
			loading = false;
		}
	});

	function handleDragStart(e: DragEvent, assetPath: string) {
		if (e.dataTransfer) {
			e.dataTransfer.setData('application/json', JSON.stringify({ assetPath }));
			e.dataTransfer.effectAllowed = 'copy';
		}
	}

	let selectedData = $derived.by(() => {
		if (!editorState.selectedAssetId) return null;
		for (const tile of editorState.map.values()) {
			const asset = tile.assets.find(a => a.id === editorState.selectedAssetId);
			if (asset) return { tileKey: `${tile.q},${tile.r}`, tile, asset };
		}
		return null;
	});

	function deleteSelected() {
		if (!selectedData) return;
		const { tileKey, tile, asset } = selectedData;
		tile.assets = tile.assets.filter(a => a.id !== asset.id);
		editorState.map.set(tileKey, tile);
		editorState.selectedAssetId = null;
	}

	function updateAsset(type: 'position' | 'rotation' | 'scale', index: number, event: Event) {
		if (!selectedData) return;
		const target = event.target as HTMLInputElement;
		const val = parseFloat(target.value) || 0;
		const { tileKey, tile, asset } = selectedData;
		asset[type][index] = val;
		// Force la réactivité
		editorState.map.set(tileKey, tile);
	}
</script>

<div class="fixed top-0 left-0 bottom-0 w-80 bg-zinc-900 border-r border-zinc-700 shadow-xl flex flex-col z-10 text-white overflow-hidden pointer-events-auto">
	<div class="p-4 bg-zinc-800 border-b border-zinc-700">
		<h1 class="text-xl font-bold text-amber-500 mb-1">Hexaria Map Editor</h1>
		<p class="text-sm text-zinc-400">Glissez-déposez les assets sur la carte.</p>
	</div>

	{#if selectedData}
		<div class="p-4 bg-zinc-800 border-b border-zinc-600 shadow-inner">
			<div class="flex justify-between items-center mb-3">
				<h2 class="text-sm font-bold text-amber-400 uppercase tracking-wider">Transform</h2>
				<button onclick={() => editorState.selectedAssetId = null} class="text-zinc-400 hover:text-white">✕</button>
			</div>
			
			<div class="text-xs text-zinc-300 mb-4 truncate">{selectedData.asset.file}</div>

			<div class="space-y-3 text-xs">
				<div class="flex items-center gap-2">
					<span class="w-12 text-zinc-400">Position</span>
					<input type="number" step="0.1" value={selectedData.asset.position[0]} oninput={(e) => updateAsset('position', 0, e)} class="w-14 bg-zinc-900 border border-zinc-600 rounded px-1" />
					<input type="number" step="0.1" value={selectedData.asset.position[1]} oninput={(e) => updateAsset('position', 1, e)} class="w-14 bg-zinc-900 border border-zinc-600 rounded px-1" />
					<input type="number" step="0.1" value={selectedData.asset.position[2]} oninput={(e) => updateAsset('position', 2, e)} class="w-14 bg-zinc-900 border border-zinc-600 rounded px-1" />
				</div>
				<div class="flex items-center gap-2">
					<span class="w-12 text-zinc-400">Rotation</span>
					<input type="number" step="0.1" value={selectedData.asset.rotation[0]} oninput={(e) => updateAsset('rotation', 0, e)} class="w-14 bg-zinc-900 border border-zinc-600 rounded px-1" />
					<input type="number" step="0.1" value={selectedData.asset.rotation[1]} oninput={(e) => updateAsset('rotation', 1, e)} class="w-14 bg-zinc-900 border border-zinc-600 rounded px-1" />
					<input type="number" step="0.1" value={selectedData.asset.rotation[2]} oninput={(e) => updateAsset('rotation', 2, e)} class="w-14 bg-zinc-900 border border-zinc-600 rounded px-1" />
				</div>
				<div class="flex items-center gap-2">
					<span class="w-12 text-zinc-400">Scale</span>
					<input type="number" step="0.1" value={selectedData.asset.scale[0]} oninput={(e) => updateAsset('scale', 0, e)} class="w-14 bg-zinc-900 border border-zinc-600 rounded px-1" />
					<input type="number" step="0.1" value={selectedData.asset.scale[1]} oninput={(e) => updateAsset('scale', 1, e)} class="w-14 bg-zinc-900 border border-zinc-600 rounded px-1" />
					<input type="number" step="0.1" value={selectedData.asset.scale[2]} oninput={(e) => updateAsset('scale', 2, e)} class="w-14 bg-zinc-900 border border-zinc-600 rounded px-1" />
				</div>
			</div>

			<button onclick={deleteSelected} class="mt-4 w-full p-2 bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-700 rounded text-xs font-bold transition-colors">
				Supprimer cet objet
			</button>
		</div>
	{/if}

	<div class="flex-1 overflow-y-auto p-4">
		<h2 class="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Librairie 3D</h2>
		
		{#if loading}
			<p class="text-sm text-zinc-500">Chargement des assets...</p>
		{:else}
			{#each Object.entries(assets) as [category, files]}
				{#if files.length > 0}
					<div class="mb-4">
						<h3 class="text-sm font-semibold text-zinc-300 capitalize mb-2">{category}</h3>
						<div class="space-y-1">
							{#each files as file}
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									class="w-full p-2 text-xs text-left rounded border border-transparent text-zinc-400 hover:bg-zinc-800 cursor-grab active:cursor-grabbing truncate"
									draggable="true"
									ondragstart={(e) => handleDragStart(e, `${category}/${file}`)}
									title={file}
								>
									▤ {file}
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{/each}
		{/if}
	</div>
</div>
