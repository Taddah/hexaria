<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { interactivity, useGltf } from '@threlte/extras';
	import {
		mapStore,
		selectedHexStore,
		entitiesStore,
		myEntityIdStore
	} from '$lib/stores/gameStore';
	import { hexToWorld } from '$lib/utils/hexTo3D';
	import { hexDistance } from '$lib/utils/hexUtils';
	import { exploredTiles, expandFog, VISION_RADIUS } from '$lib/utils/fogOfWar';
	import HexTile from './HexTile.svelte';
	import { resolveTile } from '$lib/utils/tiles/tileResolver';

	const mapData = $derived(Object.values($mapStore));
	const localPlayer = $derived($entitiesStore.find((e) => e.id === $myEntityIdStore));

	const pQ = $derived(localPlayer?.position.q ?? 0);
	const pR = $derived(localPlayer?.position.r ?? 0);

	let exploredSet = $state(new Set(exploredTiles));

	let lastQ = -1;
	let lastR = -1;

	$effect(() => {
		if (localPlayer && mapData.length > 0 && (pQ !== lastQ || pR !== lastR)) {
			expandFog(pQ, pR, mapData);
			exploredSet = new Set(exploredTiles);
			lastQ = pQ;
			lastR = pR;
		}
	});

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

	const gltfPlayer = useGltf('/assets/models/units/red/unit_red_accent.gltf');
</script>

{#each mapData as tile (`${tile.q},${tile.r}`)}
	{@const isVisible = localPlayer && hexDistance(pQ, pR, tile.q, tile.r) <= VISION_RADIUS}
	{@const isExplored = exploredSet.has(`${tile.q},${tile.r}`)}
	{@const pos = hexToWorld(tile.q, tile.r)}
	{@const isSelected = $selectedHexStore?.q === tile.q && $selectedHexStore?.r === tile.r}
	{@const tileRenderData = resolveTile(tile)}

	{#if isExplored || isVisible}
		<T.Group position={pos}>
			<T.Mesh
				interactive
				position={[0, tileRenderData.scaleY + 1, 0]}
				rotation={[0, Math.PI / 6, 0]}
				onclick={() => {
					selectedHexStore.set({ q: tile.q, r: tile.r });
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

{#if localPlayer && $gltfPlayer}
	{@const playerWorldPos = hexToWorld(pQ, pR)}
	{@const playerTile = $mapStore[`${localPlayer.position.q},${localPlayer.position.r}`]}
	{@const tileRenderData = resolveTile(playerTile)}
	<T
		is={$gltfPlayer.scene}
		position={[playerWorldPos[0], tileRenderData.scaleY + 1, playerWorldPos[2]]}
		scale={[3, 3, 3]}
	/>
{/if}
