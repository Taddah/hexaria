<script lang="ts">
	import { T } from "@threlte/core";
	import {
		editorState,
		getAdjacentHexes,
		getHexKey,
	} from "$lib/stores/editorState.svelte";
	import { hexToWorld, HEX_SIZE } from "$lib/utils/hexUtils";

	// The current selected tool could be part of editorState later, for now we just add empty tiles on click
	function handleAdjacentClick(q: number, r: number) {
		const key = getHexKey(q, r);
		if (!editorState.map.has(key)) {
			editorState.map.set(key, {
				q,
				r,
				elevation: 0,
				bottomTile: null,
				topTile: null,
				decorations: [],
			});
		}
	}

	const adjacentHexes = $derived(getAdjacentHexes());
</script>

<!-- Render existing tiles -->
{#each Array.from(editorState.map.values()) as tile}
	{@const pos = hexToWorld(tile.q, tile.r, tile.elevation)}
	<T.Mesh position={pos}>
		<T.CylinderGeometry args={[HEX_SIZE, HEX_SIZE, 0.5, 6]} />
		<T.MeshStandardMaterial color="#5c7a5c" />
	</T.Mesh>
{/each}

<!-- Render clickable adjacent "ghost" tiles -->
{#each adjacentHexes as ghost}
	{@const pos = hexToWorld(ghost.q, ghost.r, 0)}
	<T.Mesh
		position={pos}
		onclick={() => handleAdjacentClick(ghost.q, ghost.r)}
		onpointerenter={() => {
			document.body.style.cursor = 'pointer';
		}}
		onpointerleave={() => {
			document.body.style.cursor = 'default';
		}}
	>
		<T.CylinderGeometry args={[HEX_SIZE, HEX_SIZE, 0.1, 6]} />
		<T.MeshBasicMaterial color="white" opacity={0.3} transparent />
	</T.Mesh>
{/each}
