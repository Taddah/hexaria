<script lang="ts">
	import { loadTexture } from '$lib/utils/textureCache';
	import type { TileRenderData } from '$lib/utils/tiles/tileResolver';
	import { T } from '@threlte/core';
	import { useGltf } from '@threlte/extras';
	import * as THREE from 'three';
	import Props from './Props.svelte';

	let {
		renderData,
		isVisible = true
	}: { renderData: TileRenderData; isVisible: boolean | undefined } = $props();

	const gltfTop = useGltf(renderData.topAsset);
	const gltfBottom = useGltf(renderData.bottomAsset);

	let sceneTop = $state<THREE.Group | null>(null);
	let sceneBottom = $state<THREE.Group | null>(null);

	async function buildScene(gltf: THREE.Group): Promise<THREE.Group> {
		const clone = gltf.clone(true);

		// D'abord cloner tous les matériaux
		clone.traverse((child) => {
			const mesh = child as THREE.Mesh;
			if (mesh.isMesh) {
				if (Array.isArray(mesh.material)) {
					mesh.material = mesh.material.map((m) => m.clone());
				} else {
					mesh.material = mesh.material.clone();
				}
			}
		});

		if (!renderData.isWater) {
			const newTexture = await loadTexture(renderData.material);
			clone.traverse((child) => {
				const mesh = child as THREE.Mesh;
				if (mesh.isMesh) {
					const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
					mats.forEach((m) => {
						const mat = m as THREE.MeshStandardMaterial;
						if (mat.map) {
							newTexture.wrapS = mat.map.wrapS;
							newTexture.wrapT = mat.map.wrapT;
							newTexture.repeat.copy(mat.map.repeat);
							newTexture.offset.copy(mat.map.offset);
						}
						mat.map = newTexture;
						mat.needsUpdate = true;
					});
				}
			});
		}

		return clone;
	}

	$effect(() => {
		if (!$gltfTop) return;
		buildScene($gltfTop.scene).then((s) => (sceneTop = s));
	});

	$effect(() => {
		if (!$gltfBottom || renderData.isWater) return;
		buildScene($gltfBottom.scene).then((s) => (sceneBottom = s));
	});

	$effect(() => {
		[sceneTop, sceneBottom].forEach((scene) => {
			if (!scene) return;
			scene.traverse((child) => {
				const mesh = child as THREE.Mesh;
				if (mesh.isMesh) {
					const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
					mats.forEach((m) => {
						const mat = m as THREE.MeshStandardMaterial;
						mat.color.set(isVisible ? 0xffffff : 0x333344);
						mat.needsUpdate = true;
					});
				}
			});
		});
	});
</script>

{#if sceneBottom}
	<T
		is={sceneBottom}
		scale={[1, renderData.scaleY, 1]}
		rotation={[0, renderData.rotation, 0]}
		position={[0, renderData.scaleY, 0]}
	/>
{/if}
{#if sceneTop}
	<T
		is={sceneTop}
		scale={[1, 1, 1]}
		rotation={[0, renderData.rotation, 0]}
		position={[0, renderData.scaleY + 1, 0]}
	/>

	{#if isVisible}
		{#each renderData.props as prop (prop.assetPath + prop.x + prop.z)}
			<Props data={prop} />
		{/each}
	{/if}
{/if}
