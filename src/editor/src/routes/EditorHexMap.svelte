<script lang="ts">
	import { T } from '@threlte/core';
	import { GLTF } from '@threlte/extras';
	import { editorState, getAdjacentHexes, getHexKey } from '$lib/stores/editorState.svelte';
	import { hexToWorld, HEX_SIZE } from '$lib/utils/hexUtils';

	const adjacentHexes = $derived(getAdjacentHexes());

	function handlePointerEnter(q: number, r: number) {
		editorState.hoveredHex = { q, r };
	}

	function handlePointerLeave() {
		editorState.hoveredHex = null;
	}

	function handleAssetClick(e: MouseEvent | PointerEvent, assetId: string) {
		e.stopPropagation();
		editorState.selectedAssetId = assetId;
	}
</script>

<!-- Render existing tiles -->
{#each Array.from(editorState.map.values()) as tile}
	{@const basePos = hexToWorld(tile.q, tile.r, 0)}
	<T.Group 
		position={basePos} 
		onpointerenter={() => handlePointerEnter(tile.q, tile.r)}
		onpointerleave={handlePointerLeave}
	>
		<!-- Plancher de la case invisible pour capter les raycasts, ou un léger helper -->
		<T.Mesh position={[0, -0.05, 0]}>
			<T.CylinderGeometry args={[HEX_SIZE, HEX_SIZE, 0.1, 6]} />
			<T.MeshBasicMaterial color="#5c7a5c" opacity={0.2} transparent />
		</T.Mesh>

		<!-- Assets placés -->
		{#each tile.assets as asset}
			<T.Group 
				position={asset.position} 
				rotation={asset.rotation} 
				scale={asset.scale}
			>
				<GLTF url={`/models/${asset.file}`} />
				
				<!-- Hitbox invisible pour capter le clic -->
				<T.Mesh 
					onclick={(e) => handleAssetClick(e, asset.id)}
					onpointerenter={() => { document.body.style.cursor = 'pointer'; }}
					onpointerleave={() => { document.body.style.cursor = 'default'; }}
				>
					<T.BoxGeometry args={[HEX_SIZE, HEX_SIZE, HEX_SIZE]} />
					<T.MeshBasicMaterial transparent opacity={0.0} depthWrite={false} />
				</T.Mesh>

				<!-- Highlight bounding box if selected -->
				{#if editorState.selectedAssetId === asset.id}
					<T.Mesh>
						<T.BoxGeometry args={[HEX_SIZE, HEX_SIZE, HEX_SIZE]} />
						<T.MeshBasicMaterial color="yellow" wireframe transparent opacity={0.5} />
					</T.Mesh>
				{/if}
			</T.Group>
		{/each}
	</T.Group>
{/each}

<!-- Render clickable adjacent "ghost" tiles -->
{#each adjacentHexes as ghost}
	{@const pos = hexToWorld(ghost.q, ghost.r, 0)}
	<T.Mesh
		position={pos}
		onpointerenter={() => handlePointerEnter(ghost.q, ghost.r)}
		onpointerleave={handlePointerLeave}
	>
		<T.CylinderGeometry args={[HEX_SIZE, HEX_SIZE, 0.1, 6]} />
		<T.MeshBasicMaterial color="white" opacity={0.3} transparent />
	</T.Mesh>
{/each}
