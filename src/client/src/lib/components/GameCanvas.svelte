<script lang="ts">
	import { Canvas, T } from '@threlte/core';
	import HexMap from './HexMap.svelte';
	import type { OrthographicCamera } from 'three';
	import { browser } from '$app/environment';
	import { gameState } from '$lib/stores/gameState.svelte';
	import { hexToWorld } from '$lib/utils/hexUtils';
	import SceneLighting from './SceneLighting.svelte';

	let camRef: OrthographicCamera | undefined = $state();

	$effect(() => {
		if (camRef) {
			camRef.lookAt(0, 0, 0);
			camRef.updateProjectionMatrix();
		}
	});

	let camOffset = $state({ x: 0, z: 0 });
	const CAMERA_SPEED = 0.5;
	const localPlayer = $derived(gameState.localPlayer);

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

	const cameraTarget = $derived.by((): [number, number, number] => {
		const player = gameState.localPlayer;
		if (gameState.playerAnimPosition) {
			return [-gameState.playerAnimPosition.x, 0, -gameState.playerAnimPosition.z];
		}
		if (player?.position) {
			const pos = hexToWorld(player.position.q, player.position.r);
			return [-pos[0], 0, -pos[2]];
		}
		return [0, 0, 0];
	});
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if browser && localPlayer}
	<div
		class="padding-top: 4rem; padding-left: 5rem absolute inset-0 h-full w-full overflow-hidden bg-[#1e1e2f]"
	>
		<Canvas toneMapping={0}>
			<T.OrthographicCamera
				makeDefault
				position={[20 + camOffset.x, 20, 20 + camOffset.z]}
				zoom={60}
				bind:ref={camRef}
			/>

			<SceneLighting />

			<T.Group position={cameraTarget}>
				<HexMap />
			</T.Group>
		</Canvas>
	</div>
{/if}
