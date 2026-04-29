<script lang="ts">
	import { onDestroy } from 'svelte';
	import GameCanvas from '$lib/components/GameCanvas.svelte';
	import { initializeSocket } from '$lib/services/socket';
	import { gameState } from '$lib/stores/gameState.svelte';
	import Sidebar from '$lib/components/ui/Sidebar.svelte';
	import ActionPanel from '$lib/components/ui/ActionPanel.svelte';
	import { processGameEvents } from '$lib/services/eventService';
	import { getPlayerTile } from '$lib/utils/tiles/playerUtils';
	import PlayerInfo from '$lib/components/ui/PlayerInfo.svelte';
	import HexInfoBar from '$lib/components/ui/HexInfoBar.svelte';
	import ChatPanel from '$lib/components/ui/ChatPanel.svelte';

	let socket = initializeSocket();
	onDestroy(() => socket.disconnect());

	let activeMenu = $state('');
	let activePopup = $state<string | null>(null);

	const localPlayer = $derived(gameState.localPlayer);
	const selectedTile = $derived(gameState.selectedHex);
	const playerTile = $derived(getPlayerTile(localPlayer));
	const canHarvest = $derived(!!playerTile?.resource && (playerTile.resource.amount ?? 0) > 0);
	const isMoveValid = $derived(!!(localPlayer && selectedTile && selectedTile.type !== 'WATER'));
	const displayedHexData = $derived(selectedTile ?? playerTile);
	const playersOnHex = $derived(
		displayedHexData
			? gameState.entities.filter(
					(e) => e.position.q === displayedHexData.q && e.position.r === displayedHexData.r
				)
			: []
	);

	$effect(() => {
		if (localPlayer) processGameEvents(socket);
	});

	function handleMenuClick(menuId: string) {
		activeMenu = activeMenu === menuId ? '' : menuId;
		if (menuId === 'inventaire') activePopup = 'inventaire';
	}
</script>

<svelte:head>
	<title>Hexaria</title>
</svelte:head>

<main class="relative h-screen w-full overflow-hidden bg-[#1a1410] font-serif select-none">
	{#if localPlayer}
		<!-- Canvas 3D — plein écran derrière tout -->
		<GameCanvas />

		<!-- PlayerInfo — panneau horizontal haut gauche -->
		<PlayerInfo />

		<!-- Sidebar — colonne gauche sous PlayerInfo -->
		<Sidebar />

		<!-- HexInfoBar — barre info bas gauche -->
		<HexInfoBar />

		<ActionPanel />

		<ChatPanel />
	{:else}
		<!-- Loading -->
		<div class="flex h-full items-center justify-center">
			<div class="flex flex-col items-center gap-4">
				<span class="animate-pulse text-4xl">⚔️</span>
				<span class="text-sm tracking-widest text-[#8a7a68] uppercase">
					Connexion au monde...
				</span>
			</div>
		</div>
	{/if}
</main>
