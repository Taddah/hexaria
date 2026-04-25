<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import GameCanvas from '$lib/components/GameCanvas.svelte';
	import { initializeSocket } from '$lib/services/socket';
	import {
		entitiesStore,
		selectedHexStore,
		mapStore,
		myEntityIdStore,
		pathStore,
		playerAnimPosition
	} from '$lib/stores/gameStore';

	import Sidebar from '$lib/components/ui/Sidebar.svelte';
	import PlayerInfo from '$lib/components/ui/PlayerInfo.svelte';
	import TimeDisplay from '$lib/components/ui/TimeDisplay.svelte';
	import ActionPanel from '$lib/components/ui/ActionPanel.svelte';
	import InventoryPopup from '$lib/components/ui/InventoryPopup.svelte';
	import HexInfoPanel from '$lib/components/ui/HexInfoPanel.svelte';
	import EventLogPanel from '$lib/components/ui/EventLogPanel.svelte';
	import { addGameEvent } from '$lib/services/eventService';
	import { findPath } from '$lib/utils/pathfinding';
	import { get } from 'svelte/store';
	import { hexToWorld } from '$lib/utils/hexTo3D';

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

		return true;
	});

	const MOVE_DURATION = 5000;
	let isMoving = false;

	async function startMovement(path: { q: number; r: number }[]) {
		if (path.length === 0 || isMoving) return;
		isMoving = true;

		const pQ = $derived(localPlayer?.position.q ?? 0);
		const pR = $derived(localPlayer?.position.r ?? 0);

		for (const step of path) {
			const current = get(playerAnimPosition) ?? {
				x: hexToWorld(pQ, pR)[0],
				y: 0,
				z: hexToWorld(pQ, pR)[2]
			};
			const target = hexToWorld(step.q, step.r);

			// Envoie l'étape au serveur
			socket.emit('request_move', { q: step.q, r: step.r });

			// Anime pendant MOVE_DURATION
			const startTime = performance.now();
			await new Promise<void>((resolve) => {
				function animate() {
					const elapsed = performance.now() - startTime;
					const t = Math.min(elapsed / MOVE_DURATION, 1);
					const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOut

					playerAnimPosition.set({
						x: current.x + (target[0] - current.x) * eased,
						y: current.y + (target[1] - current.y) * eased,
						z: current.z + (target[2] - current.z) * eased
					});

					if (t < 1) {
						requestAnimationFrame(animate);
					} else {
						resolve();
					}
				}
				requestAnimationFrame(animate);
			});
		}

		isMoving = false;
		pathStore.set([]);
	}

	function requestMove() {
		if (isMoveValid && $selectedHexStore && localPlayer) {
			const path = findPath(
				localPlayer.position.q,
				localPlayer.position.r,
				$selectedHexStore.q,
				$selectedHexStore.r,
				$mapStore
			);

			if (path.length === 0) return;

			pathStore.set(path);
			startMovement(path);
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
