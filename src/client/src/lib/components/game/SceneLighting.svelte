<script lang="ts">
	import { gameState } from '$lib/stores/gameState.svelte';
	import { T } from '@threlte/core';

	function lerp(a: number, b: number, t: number) {
		return a + (b - a) * t;
	}

	function getDayPhase(timeOfDay: number): number {
		if (timeOfDay >= 0.25 && timeOfDay < 0.5) return (timeOfDay - 0.25) / 0.25;
		if (timeOfDay >= 0.5 && timeOfDay < 0.75) return 1 - (timeOfDay - 0.5) / 0.25;
		return 0;
	}

	function getLightColor(timeOfDay: number): string {
		if (timeOfDay >= 0.2 && timeOfDay < 0.35) return '#ffaa55';
		if (timeOfDay >= 0.35 && timeOfDay < 0.65) return '#ffffff';
		if (timeOfDay >= 0.65 && timeOfDay < 0.8) return '#ff8844';
		return '#1a2a4a';
	}

	const dayPhase = $derived(getDayPhase(gameState.time.timeOfDay));
	const ambientIntensity = $derived(lerp(0.15, 0.5, dayPhase)); // 0.05 → 0.15
	const sunIntensity = $derived(lerp(0.2, 2.0, dayPhase)); // 0.0 → 0.2
	const fillIntensity = $derived(lerp(0.1, 1.5, dayPhase)); // 0.0 → 0.1
	const lightColor = $derived(getLightColor(gameState.time.timeOfDay));
	const ambientColor = $derived(gameState.time.isDay ? '#ffffff' : '#2a3a5a');
</script>

<T.AmbientLight intensity={ambientIntensity} color={ambientColor} />
<T.DirectionalLight
	position={[15, 30, 10]}
	intensity={sunIntensity}
	color={lightColor}
	castShadow
/>
<T.DirectionalLight position={[-10, 5, -15]} intensity={fillIntensity} color="#ffffff" />
