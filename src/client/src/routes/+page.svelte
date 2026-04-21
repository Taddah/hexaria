<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import GameCanvas from '$lib/components/GameCanvas.svelte';
	import { initializeSocket } from '$lib/services/socket';
	import { entitiesStore, selectedHexStore, mapStore } from '$lib/stores/gameStore';

	let socket: ReturnType<typeof initializeSocket>;

	onMount(() => {
		socket = initializeSocket();
	});

	onDestroy(() => {
		if (socket) {
			socket.disconnect();
		}
	});

	const localPlayer = $derived($entitiesStore.find((e) => e.identity?.name === 'Héros Test'));

	const selectedTile = $derived(
		$selectedHexStore
			? $mapStore.find((t) => t.q === $selectedHexStore.q && t.r === $selectedHexStore.r)
			: null
	);

	const isMoveValid = $derived.by(() => {
		if (!localPlayer || !selectedTile) return false;
		if (selectedTile.type === 'WATER') return false;

		const p = localPlayer.position;
		const h = selectedTile;
		const distance =
			(Math.abs(p.q - h.q) + Math.abs(p.r - h.r) + Math.abs(p.q + p.r - h.q - h.r)) / 2;

		return distance === 1;
	});

	function requestMove() {
		if (isMoveValid && $selectedHexStore) {
			socket.emit('request_move', { q: $selectedHexStore.q, r: $selectedHexStore.r });
		}
	}
</script>

<svelte:head>
	<title>Hexaria</title>
</svelte:head>

<main class="relative h-screen w-full overflow-hidden">
	<GameCanvas />

	<div
		class="absolute top-4 left-4 w-64 rounded-2xl border border-white/20 bg-white/10 p-6 text-white shadow-xl backdrop-blur-md"
	>
		<h1
			class="mb-4 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-2xl font-bold text-transparent"
		>
			Hexaria
		</h1>

		{#if localPlayer}
			<div class="space-y-3">
				<div class="flex items-center justify-between border-b border-white/10 pb-2">
					<span class="font-medium text-white/60">Nom</span>
					<span class="font-semibold">{localPlayer.identity.name}</span>
				</div>

				{#if localPlayer.age}
					<div class="flex flex-col gap-1 border-b border-white/10 pb-2">
						<div class="flex items-center justify-between">
							<span class="font-medium text-white/60">Âge</span>
							<span class="font-semibold text-amber-400"
								>{localPlayer.age.current} / {localPlayer.age.max}</span
							>
						</div>
						<div class="h-1.5 w-full overflow-hidden rounded-full bg-black/40">
							<div
								class="h-full bg-amber-400 transition-all duration-300"
								style="width: {(localPlayer.age.current / localPlayer.age.max) * 100}%"
							></div>
						</div>
					</div>
				{/if}

				{#if localPlayer.inventory}
					<div class="flex items-center justify-between pb-2">
						<span class="flex items-center gap-2 font-medium text-white/60">
							<span class="text-orange-400">🪵</span> Bois
						</span>
						<span class="font-semibold">{localPlayer.inventory.wood}</span>
					</div>
				{/if}
			</div>
		{:else}
			<div class="animate-pulse py-4 text-center text-white/50">
				Connecté - En attente du héros...
			</div>
		{/if}
	</div>

	{#if isMoveValid}
		<div
			class="animate-in fade-in slide-in-from-right-8 absolute top-1/2 right-12 flex -translate-y-1/2 flex-col gap-4 duration-300"
		>
			<button
				onclick={requestMove}
				class="flex items-center justify-center gap-2 rounded-xl border border-blue-400/30 bg-blue-600 px-8 py-4 font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all hover:scale-105 hover:bg-blue-500 active:scale-95 active:bg-blue-700"
			>
				<span>Se déplacer</span>
				<span>🏃</span>
			</button>
		</div>
	{/if}
</main>
