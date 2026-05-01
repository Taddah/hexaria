<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { interactivity } from '@threlte/extras';
	import { getTile, hexDistance, hexToWorld } from '$lib/utils/hexUtils';
	import HexTile from './HexTile.svelte';
	import { resolveTile } from '$lib/utils/tiles/tileResolver';
	import { gameState } from '$lib/stores/gameState.svelte';
	import Players from './Players.svelte';

	// Stores réactifs
	const mapData = $derived(Object.values(gameState.map));
	const localPlayer = $derived(gameState.localPlayer);
	const pQ = $derived(localPlayer?.position.q ?? 0);
	const pR = $derived(localPlayer?.position.r ?? 0);
	const exploredSet = $derived(new Set(gameState.exploredTiles));

	const { camera, renderer } = useThrelte();

	interactivity({
		compute: (event, state) => {
			const rect = renderer.domElement.getBoundingClientRect();
			state.pointer.update((p) => {
				p.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
				p.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
				return p;
			});
			state.raycaster.setFromCamera(state.pointer.current, $camera);
		}
	});
</script>

{#each mapData as tile (`${tile.q},${tile.r}`)}
	{@const isVisible = hexDistance(pQ, pR, tile.q, tile.r) <= gameState.time.visionRadius}
	{@const isExplored = exploredSet.has(`${tile.q},${tile.r}`)}
	{@const pos = hexToWorld(tile.q, tile.r)}
	{@const isSelected = gameState.selectedHex?.q === tile.q && gameState.selectedHex?.r === tile.r}
	{@const tileRenderData = resolveTile(tile)}

	{#if isExplored || isVisible}
		<T.Group position={pos}>
			<T.Mesh
				interactive
				position={[0, tileRenderData.scaleY + 1, 0]}
				rotation={[0, Math.PI / 6, 0]}
				onclick={() => {
					gameState.selectedHex = getTile(tile.q, tile.r);
				}}
			>
				<T.CylinderGeometry args={[1.155, 1.155, 0.2, 6]} />
				<T.MeshBasicMaterial transparent opacity={0} depthWrite={false} />
			</T.Mesh>

			<HexTile renderData={tileRenderData} {isVisible} />

			{#if isSelected}
				<T.Mesh position={[0, tileRenderData.scaleY + 1, 0]} rotation={[0, Math.PI / 3, 0]}>
					<T.CylinderGeometry args={[1, 1, 0.3, 6, 1, true]} />
					<T.MeshBasicMaterial color="#ffaa00" side={2} />
				</T.Mesh>
			{/if}
		</T.Group>
	{/if}
{/each}

<Players />
