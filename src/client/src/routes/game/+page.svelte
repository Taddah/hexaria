<script lang="ts">
	import GameCanvas from '$lib/components/game/GameCanvas.svelte';
	import { getSocket } from '$lib/services/socket';
	import { gameState } from '$lib/stores/gameState.svelte';
	import { authState } from '$lib/stores/authState.svelte';
	import Sidebar from '$lib/components/ui/Sidebar.svelte';
	import ActionPanel from '$lib/components/ui/panels/actions/ActionPanel.svelte';
	import { processGameEvents } from '$lib/services/eventService';
	import PlayerInfo from '$lib/components/ui/panels/PlayerInfo.svelte';
	import HexInfoBar from '$lib/components/ui/panels/hexInfo/HexInfoBar.svelte';
	import ChatPanel from '$lib/components/ui/panels/chat/ChatPanel.svelte';
	import { goto } from '$app/navigation';
	import EventModal from '$lib/components/ui/EventModal.svelte';
	import TopBar from '$lib/components/ui/TopBar.svelte';
	import ConnectionOverlay from '$lib/components/ui/ConnectionOverlay.svelte';
	import DeathPanel from '$lib/components/ui/panels/DeathPanel.svelte';
	import { browser } from '$app/environment';
	import TradeInvitBanner from '$lib/components/ui/panels/actions/trade/TradeInvitBanner.svelte';
	import TradePanel from '$lib/components/ui/panels/actions/trade/TradePanel.svelte';

	const localPlayer = $derived(gameState.localPlayer);

	let socket: any;
	try {
		socket = getSocket();
	} catch (e) {
		if (browser) goto('/');
	}

	$effect(() => {
		if (localPlayer) processGameEvents(socket);

		if (!localPlayer) goto('/');
	});
</script>

<svelte:head>
	<title>Hexaria</title>
</svelte:head>

<main class="relative h-screen w-full overflow-hidden bg-[#1a1410] font-serif select-none">
	{#if localPlayer}
		<!-- Canvas 3D — plein écran derrière tout -->
		<GameCanvas />

		<TopBar />

		<!-- PlayerInfo — panneau horizontal haut gauche -->
		<PlayerInfo />

		<!-- Sidebar — colonne gauche sous PlayerInfo -->
		<Sidebar />

		<!-- HexInfoBar — barre info bas gauche -->
		<HexInfoBar />

		<ActionPanel />

		<ChatPanel />

		<EventModal />

		<TradeInvitBanner />
		<TradePanel />

		<ConnectionOverlay />
		<DeathPanel />
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
