<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import GameCanvas from '$lib/components/GameCanvas.svelte';
	import { initializeSocket } from '$lib/services/socket';
	import { entitiesStore } from '$lib/stores/gameStore';

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
</main>
