<script lang="ts">
	import type { PropData } from '$lib/utils/tiles/propsResolver';
	import { T } from '@threlte/core';
	import { useGltf } from '@threlte/extras';

	let { data }: { data: PropData } = $props();
	const gltf = useGltf(data.assetPath);
</script>

{#if $gltf}
	<T
		is={$gltf.scene}
		position={[data.x, data.y, data.z]}
		rotation.y={data.rotation}
		scale={data.scale}
	/>
{/if}
