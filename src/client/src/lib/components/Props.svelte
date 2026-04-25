<script lang="ts">
	import { loadTexture } from '$lib/utils/textureCache';
	import type { PropData } from '$lib/utils/tiles/propsResolver';
	import { T } from '@threlte/core';
	import { useGltf } from '@threlte/extras';
	import * as THREE from 'three';

	let { data }: { data: PropData } = $props();
	const gltf = useGltf(data.assetPath);
	let scene = $state<THREE.Group | null>(null);

	$effect(() => {
		if (!$gltf) return;
		const clone = $gltf.scene.clone(true);

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

		loadTexture(data.material).then((newTexture) => {
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
			scene = clone;
		});
	});
</script>

{#if scene}
	<T is={scene} position={[data.x, data.y, data.z]} rotation.y={data.rotation} scale={data.scale} />
{/if}
