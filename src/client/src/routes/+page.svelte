<script lang="ts">
	import { onDestroy } from 'svelte';
	import GameCanvas from '$lib/components/GameCanvas.svelte';
	import { initializeSocket } from '$lib/services/socket';
	import { gameState } from '$lib/stores/gameState.svelte';

	import Sidebar from '$lib/components/ui/Sidebar.svelte';
	import PlayerInfo from '$lib/components/ui/PlayerInfo.svelte';
	import TimeDisplay from '$lib/components/ui/TimeDisplay.svelte';
	import ActionPanel from '$lib/components/ui/ActionPanel.svelte';
	import InventoryPopup from '$lib/components/ui/InventoryPopup.svelte';
	import HexInfoPanel from '$lib/components/ui/HexInfoPanel.svelte';
	import EventLogPanel from '$lib/components/ui/EventLogPanel.svelte';
	import { processGameEvents } from '$lib/services/eventService';
	import { getPlayerTile } from '$lib/utils/tiles/playerUtils';
	import { requestMove } from '$lib/services/movementService';
	import { requestHarvest } from '$lib/services/harvestService';

	let socket = initializeSocket();
	onDestroy(() => socket.disconnect());

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
		if (menuId === 'inventaire') {
			activePopup = 'inventaire';
		}
	}
</script>

<svelte:head>
	<title>Hexaria</title>
</svelte:head>

<main
	class="relative h-screen w-full overflow-hidden bg-[#1e1e2f] font-serif text-[#d5d0c5] select-none"
>
	{#if localPlayer}
		<GameCanvas />

		<!-- HUD Wrapper -->
		<div class="pointer-events-none absolute inset-0 z-10">
			<Sidebar onMenuClick={handleMenuClick} />
			<PlayerInfo player={localPlayer} />
			<TimeDisplay year={214} />
			{#if isMoveValid || canHarvest}
				<ActionPanel
					selectedHex={gameState.selectedHex}
					{isMoveValid}
					{canHarvest}
					{playerTile}
					onRequestMove={() => requestMove(socket, localPlayer, selectedTile)}
					onRequestHarvest={() => requestHarvest(socket, selectedTile)}
				/>
			{/if}
			<HexInfoPanel displayedHex={displayedHexData} {playersOnHex} />
			<EventLogPanel />
		</div>

		{#if activePopup === 'inventaire'}
			<InventoryPopup player={localPlayer} onClose={() => (activePopup = null)} />
		{/if}
	{/if}
</main>

<style>
	:global(body) {
		margin: 0;
		overflow: hidden;
		background: #000;
	}
</style>
