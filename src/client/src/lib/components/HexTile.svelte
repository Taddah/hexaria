<script lang="ts">
	import { T } from '@threlte/core';
	import * as THREE from 'three';

	let {
		gltf,
		isVisible,
		scale = [2, 2, 2]
	}: {
		gltf: { scene: THREE.Group; [key: string]: any };
		isVisible: boolean;
		scale?: [number, number, number];
	} = $props();

	const scene = gltf.scene.clone(true);
	scene.traverse((child) => {
		const mesh = child as THREE.Mesh;
		if (mesh.isMesh) {
			if (Array.isArray(mesh.material)) {
				mesh.material = mesh.material.map((m) => m.clone());
			} else {
				mesh.material = (mesh.material as THREE.Material).clone();
			}
		}
	});

	$effect(() => {
		scene.traverse((child) => {
			const mesh = child as THREE.Mesh;
			if (mesh.isMesh) {
				const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

				materials.forEach((m) => {
					const mat = m as THREE.MeshStandardMaterial;
					if (isVisible) {
						mat.color.set(0xffffff);
					} else {
						mat.color.set(0x333344);
					}
					mat.needsUpdate = true;
				});
			}
		});
	});
</script>

<T is={scene} {scale} />
