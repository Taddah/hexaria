<script lang="ts">
	import { Canvas, T } from '@threlte/core';
	import HexMap from './HexMap.svelte';
	import { entitiesStore, myEntityIdStore } from '$lib/stores/gameStore';
	import { hexToWorld } from '$lib/utils/hexTo3D';
	import type { OrthographicCamera } from 'three';
	import { browser } from '$app/environment';

	const localPlayer = $derived($entitiesStore.find((e) => e.id === $myEntityIdStore));
	const playerPos = $derived(
		localPlayer ? hexToWorld(localPlayer.position.q, localPlayer.position.r) : [0, 0, 0]
	);

	let camRef: OrthographicCamera | undefined = $state();

	$effect(() => {
		if (camRef) {
			camRef.lookAt(0, 0, 0);
			camRef.updateProjectionMatrix();
		}
	});
</script>

{#if browser}
	<div class="absolute inset-0 h-full w-full overflow-hidden bg-[#1e1e2f]">
		<Canvas toneMapping={0}>
			<!-- Caméra isométrique -->
			<T.OrthographicCamera makeDefault position={[20, 20, 20]} zoom={75} bind:ref={camRef} />

			<T.AmbientLight intensity={0.5} color="#ffffff" />
			<T.DirectionalLight position={[15, 30, 10]} intensity={2.0} color="#ffffff" castShadow />
			<T.DirectionalLight position={[-10, 5, -15]} intensity={1.5} color="#ffffff" />

			<!-- Carte centrée sur le joueur -->
			<T.Group position={[-playerPos[0], 0, -playerPos[2]]}>
				<HexMap />
			</T.Group>
		</Canvas>
	</div>
{/if}
