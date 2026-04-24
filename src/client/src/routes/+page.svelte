<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import GameCanvas from '$lib/components/GameCanvas.svelte';
	import { initializeSocket } from '$lib/services/socket';
	import {
		entitiesStore,
		selectedHexStore,
		mapStore,
		myEntityIdStore
	} from '$lib/stores/gameStore';

	import Sidebar from '$lib/components/ui/Sidebar.svelte';
	import PlayerInfo from '$lib/components/ui/PlayerInfo.svelte';
	import TimeDisplay from '$lib/components/ui/TimeDisplay.svelte';
	import ActionPanel from '$lib/components/ui/ActionPanel.svelte';
	import InventoryPopup from '$lib/components/ui/InventoryPopup.svelte';
	import HexInfoPanel from '$lib/components/ui/HexInfoPanel.svelte';
	import EventLogPanel from '$lib/components/ui/EventLogPanel.svelte';
	import { addGameEvent } from '$lib/services/eventService';

	let socket: ReturnType<typeof initializeSocket>;

	onMount(() => {
		socket = initializeSocket();
	});

	onDestroy(() => {
		if (socket) {
			socket.disconnect();
		}
	});

	let activePopup: string | null = $state(null);

	const localPlayer = $derived($entitiesStore.find((e) => e.id === $myEntityIdStore));

	const selectedTile = $derived(
		$selectedHexStore ? ($mapStore[`${$selectedHexStore.q},${$selectedHexStore.r}`] ?? null) : null
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
			addGameEvent(
				`Vous vous déplacez vers l'hexagone [${$selectedHexStore.q}, ${$selectedHexStore.r}].`
			);
		}
	}

	const playerTile = $derived(
		localPlayer ? ($mapStore[`${localPlayer.position.q},${localPlayer.position.r}`] ?? null) : null
	);

	const canHarvest = $derived(!!playerTile?.resource && (playerTile.resource.amount ?? 0) > 0);

	function requestHarvest() {
		if (canHarvest) {
			socket.emit('request_harvest');
		}
	}

	function handleMenuClick(menuId: string) {
		if (menuId === 'inventaire') {
			activePopup = 'inventaire';
		}
	}

	const displayedHexData = $derived(selectedTile ? selectedTile : playerTile);

	const playersOnHex = $derived(
		displayedHexData
			? $entitiesStore.filter(
					(e) => e.position.q === displayedHexData.q && e.position.r === displayedHexData.r
				)
			: []
	);

	$effect(() => {
		const gameEvents = localPlayer?.gameEvents?.events ?? [];
		const gameEventsUnseed = gameEvents.filter((event) => event.status === 'PENDING');

		if (gameEventsUnseed.length > 0) {
			gameEventsUnseed.forEach((gameEventUnseed) => {
				addGameEvent(gameEventUnseed.event.description);
				socket.emit('event_response', gameEventUnseed.uuid);
			});
		}
	});
</script>

<svelte:head>
	<title>Hexaria</title>
</svelte:head>

<main
	class="relative h-screen w-full overflow-hidden bg-[#1e1e2f] font-serif text-[#d5d0c5] select-none"
>
	<GameCanvas />

	<!-- HUD Wrapper -->
	<div class="pointer-events-none absolute inset-0 z-10">
		<Sidebar onMenuClick={handleMenuClick} />
		<PlayerInfo player={localPlayer} />
		<TimeDisplay year={214} />
		{#if isMoveValid || canHarvest}
			<ActionPanel
				selectedHex={$selectedHexStore}
				{isMoveValid}
				{canHarvest}
				{playerTile}
				onRequestMove={requestMove}
				onRequestHarvest={requestHarvest}
			/>
		{/if}
		<HexInfoPanel displayedHex={displayedHexData} {playersOnHex} />
		<EventLogPanel />
	</div>

	{#if activePopup === 'inventaire'}
		<InventoryPopup player={localPlayer} onClose={() => (activePopup = null)} />
	{/if}
</main>

<style>
	:global(body) {
		margin: 0;
		overflow: hidden;
		background: #000;
	}
</style>
