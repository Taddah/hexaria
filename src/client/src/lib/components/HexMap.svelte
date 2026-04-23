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

	const mapData = $derived($mapStore);
	const localPlayer = $derived($entitiesStore.find((e) => e.id === $myEntityIdStore));

	const pQ = $derived(localPlayer?.position.q ?? 0);
	const pR = $derived(localPlayer?.position.r ?? 0);

	let exploredSet = $state(new Set(exploredTiles));

	$effect(() => {
		if (localPlayer && mapData.length > 0) {
			expandFog(pQ, pR, mapData);
			exploredSet = new Set(exploredTiles);
			console.log(mapData);
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

	const gltfWater = useGltf('/assets/3D_models/water.glb');
	const gltfPlains = useGltf('/assets/3D_models/grass.glb');
	const gltfForest = useGltf('/assets/3D_models/grass-forest.glb');
	const gltfMountain = useGltf('/assets/3D_models/stone-mountain.glb');
	const gltfDirt = useGltf('/assets/3D_models/dirt.glb');
</script>

{#each mapData as tile (`${tile.q},${tile.r}`)}
	{@const isVisible = localPlayer && hexDistance(pQ, pR, tile.q, tile.r) <= VISION_RADIUS}
	{@const isExplored = exploredSet.has(`${tile.q},${tile.r}`)}
	{@const pos = hexToWorld(tile.q, tile.r)}
	{@const isSelected = $selectedHexStore?.q === tile.q && $selectedHexStore?.r === tile.r}

	{#if isExplored || isVisible}
		<T.Group position={pos}>
			<T.Mesh
				interactive
				position={[0, 0.1, 0]}
				rotation={[0, Math.PI / 6, 0]}
				onclick={() => {
					selectedHexStore.set({ q: tile.q, r: tile.r });
				}}
			>
				<T.CylinderGeometry args={[1.155, 1.155, 0.2, 6]} />
				<T.MeshBasicMaterial transparent opacity={0} depthWrite={false} />
			</T.Mesh>

			{#if tile.type === 'WATER' && $gltfWater}
				<HexTile gltf={$gltfWater} isVisible={isVisible ?? true} />
			{:else if tile.type === 'PLAINS' && $gltfPlains}
				<HexTile gltf={$gltfPlains} isVisible={isVisible ?? true} />
			{:else if tile.type === 'FOREST' && $gltfForest}
				<HexTile gltf={$gltfForest} isVisible={isVisible ?? true} />
			{:else if tile.type === 'MOUNTAIN' && $gltfMountain}
				<HexTile gltf={$gltfMountain} isVisible={isVisible ?? true} />
			{:else if $gltfDirt}
				<HexTile gltf={$gltfDirt} isVisible={isVisible ?? true} />
			{/if}

			{#if isSelected}
				<T.Mesh position={[0, 0.6, 0]} rotation={[0, Math.PI / 3, 0]}>
					<T.CylinderGeometry args={[1.22, 1.22, 0.12, 6, 1, true]} />
					<T.MeshBasicMaterial color="#ffaa00" side={2} />
				</T.Mesh>
			{/if}
		</T.Group>
	{/if}
{/each}

{#if localPlayer}
	{@const playerWorldPos = hexToWorld(pQ, pR)}
	<T.Mesh position={[playerWorldPos[0], 0.6, playerWorldPos[2]]} rotation={[0, Math.PI / 3, 0]}>
		<T.CylinderGeometry args={[1.22, 1.22, 0.12, 6, 1, true]} />
		<T.MeshBasicMaterial color="#0000ff" side={2} />
	</T.Mesh>
{/if}
