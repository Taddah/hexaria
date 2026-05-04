<script lang="ts">
	import { T } from '@threlte/core';
	import { interactivity } from '@threlte/extras';
	import type { OrthographicCamera } from 'three';
	import { editorState, initMap } from '$lib/stores/editorState.svelte';
	import EditorHexMap from './EditorHexMap.svelte';

	interactivity();

	let camRef: OrthographicCamera | undefined = $state();
	let camOffset = $state({ x: 0, z: 0 });
	let zoomLevel = $state(60);

	const CAMERA_SPEED = 1.0;

	function handleKeyDown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowUp':
				camOffset.z -= CAMERA_SPEED;
				break;
			case 'ArrowDown':
				camOffset.z += CAMERA_SPEED;
				break;
			case 'ArrowLeft':
				camOffset.x -= CAMERA_SPEED;
				break;
			case 'ArrowRight':
				camOffset.x += CAMERA_SPEED;
				break;
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

	// Initialize the map with a (0,0) tile if empty
	$effect(() => {
		if (editorState.map.size === 0) {
			initMap();
		}
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
