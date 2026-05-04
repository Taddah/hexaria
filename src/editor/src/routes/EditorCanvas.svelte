<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { interactivity } from '@threlte/extras';
	import { Raycaster, Vector2, Plane, Vector3 } from 'three';
	import type { OrthographicCamera } from 'three';
	import { onMount } from 'svelte';
	import { editorState, initMap, generateId, getHexKey } from '$lib/stores/editorState.svelte';
	import EditorHexMap from './EditorHexMap.svelte';
	import { worldToHex } from '$lib/utils/hexUtils';

	interactivity();

	const { renderer, camera } = useThrelte();

	let camRef: OrthographicCamera | undefined = $state();
	let camOffset = $state({ x: 0, z: 0 });
	let zoomLevel = $state(60);

	const CAMERA_SPEED = 1.0;

	function handleKeyDown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowUp': camOffset.z -= CAMERA_SPEED; break;
			case 'ArrowDown': camOffset.z += CAMERA_SPEED; break;
			case 'ArrowLeft': camOffset.x -= CAMERA_SPEED; break;
			case 'ArrowRight': camOffset.x += CAMERA_SPEED; break;
		}
	}

	function handleWheel(e: WheelEvent) {
		const zoomDelta = e.deltaY > 0 ? -5 : 5;
		zoomLevel = Math.max(10, Math.min(150, zoomLevel + zoomDelta));
	}

	$effect(() => {
		if (camRef) {
			camRef.lookAt(0 + camOffset.x, 0, 0 + camOffset.z);
			camRef.updateProjectionMatrix();
		}
	});

	$effect(() => {
		if (editorState.map.size === 0) {
			initMap();
		}
	});

	onMount(() => {
		const canvas = renderer.domElement;
		
		const onDragOver = (e: DragEvent) => {
			e.preventDefault();
		};

		const onDrop = (e: DragEvent) => {
			e.preventDefault();
			const dataStr = e.dataTransfer?.getData('application/json');
			if (!dataStr) return;
			
			const { assetPath } = JSON.parse(dataStr);
			
			// Raycast from mouse to Y=0 plane
			const rect = canvas.getBoundingClientRect();
			const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
			const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

			const raycaster = new Raycaster();
			raycaster.setFromCamera(new Vector2(x, y), camera.current);
			
			const plane = new Plane(new Vector3(0, 1, 0), 0);
			const target = new Vector3();
			raycaster.ray.intersectPlane(plane, target);

			if (target) {
				const { q, r } = worldToHex(target.x, target.z);
				const key = getHexKey(q, r);
				
				let tile = editorState.map.get(key);
				if (!tile) {
					// Create tile if dropped on ghost space or empty space
					tile = { q, r, assets: [] };
				}

				const newAsset = {
					id: generateId(),
					file: assetPath,
					position: [0, 0, 0] as [number, number, number],
					rotation: [0, 0, 0] as [number, number, number],
					scale: [1, 1, 1] as [number, number, number]
				};

				tile.assets.push(newAsset);
				editorState.map.set(key, tile);
				editorState.selectedAssetId = newAsset.id; // Auto select newly dropped asset
			}
		};

		canvas.addEventListener('dragover', onDragOver);
		canvas.addEventListener('drop', onDrop);

		return () => {
			canvas.removeEventListener('dragover', onDragOver);
			canvas.removeEventListener('drop', onDrop);
		};
	});
</script>

<svelte:window onkeydown={handleKeyDown} onwheel={handleWheel} />

<T.OrthographicCamera
	makeDefault
	position={[20 + camOffset.x, 20, 20 + camOffset.z]}
	zoom={zoomLevel}
	bind:ref={camRef}
/>

<T.DirectionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
<T.AmbientLight intensity={0.5} />

<EditorHexMap />
