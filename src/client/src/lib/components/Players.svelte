<script lang="ts">
	import { gameState } from '$lib/stores/gameState.svelte';
	import { VISION_RADIUS } from '$lib/utils/fogOfWar.svelte';
	import { hexDistance, hexToWorld } from '$lib/utils/hexUtils';
	import { getPlayerOffsetOnTile } from '$lib/utils/playerPlacement';
	import { getScaleY } from '$lib/utils/tiles/tileResolver';
	import { T } from '@threlte/core';
	import { useGltf } from '@threlte/extras';

	const gltfOthersPlayer = useGltf('/assets/models/units/red/unit_red_accent.gltf');
	const gltfLocalPlayer = useGltf('/assets/models/units/green/unit_green_accent.gltf');
	const localPlayer = $derived(gameState.localPlayer);
	const pQ = $derived(localPlayer?.position.q ?? 0);
	const pR = $derived(localPlayer?.position.r ?? 0);

	const visibleEntities = $derived(
		Object.values(gameState.entities).filter(
			(e) => hexDistance(pQ, pR, e.position.q, e.position.r) <= VISION_RADIUS
		)
	);

	const entitiesByTile = $derived(() => {
		const groups: Record<string, typeof visibleEntities> = {};
		for (const e of visibleEntities) {
			const key = `${e.position.q},${e.position.r}`;
			if (!groups[key]) groups[key] = [];
			groups[key].push(e);
		}
		return groups;
	});
</script>

{#each visibleEntities.filter((e) => e.id !== localPlayer?.id) as entity}
	{@const tileKey = `${entity.position.q},${entity.position.r}`}
	{@const tileGroup = entitiesByTile()[tileKey] ?? [entity]}
	{@const indexInTile = tileGroup.findIndex((e) => e.id === entity.id)}
	{@const worldPos = hexToWorld(entity.position.q, entity.position.r)}
	{@const tileScaleY = getScaleY(gameState.map[tileKey])}
	{@const offset = getPlayerOffsetOnTile(entity.id, indexInTile, tileGroup.length)}
	{#if $gltfOthersPlayer}
		<T
			is={$gltfOthersPlayer.scene.clone()}
			position={[worldPos[0] + offset.x, tileScaleY + 1, worldPos[2] + offset.z]}
			scale={[0.5, 0.5, 0.5]}
		/>
	{/if}
{/each}

{#if localPlayer && $gltfLocalPlayer}
	{@const pos = gameState.playerAnimPosition ?? {
		x: hexToWorld(pQ, pR)[0],
		y: getScaleY(gameState.map[`${pQ},${pR}`]) + 1,
		z: hexToWorld(pQ, pR)[2]
	}}

	<T
		is={$gltfLocalPlayer.scene}
		position={[pos.x, pos.y, pos.z]}
		scale={[0.5, 0.5, 0.5]}
		renderOrder={999}
	/>

	<T.Mesh position={[pos.x, pos.y + 0.05, pos.z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={998}>
		<T.RingGeometry args={[0.25, 0.35, 32]} />
		<T.MeshBasicMaterial color="red" depthTest={false} />
	</T.Mesh>
{/if}
