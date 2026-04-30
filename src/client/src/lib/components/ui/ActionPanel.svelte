<script lang="ts">
	import { gameState } from '$lib/stores/gameState.svelte';
	import { getPlayerTile } from '$lib/utils/tiles/playerUtils';
	import { getSocket } from '$lib/services/socket';
	import { requestMove } from '$lib/services/movementService';
	import { requestHarvest } from '$lib/services/harvestService';
	import PanelBg from '$lib/components/ui/PanelBg.svelte';
	import { Resource } from '$shared';

	interface Action {
		id: string;
		emoji: string;
		title: string;
		execute: () => void;
	}

	const HEADER_HEIGHT = 44;
	const ITEM_HEIGHT = 72;
	const POINT_DEPTH = 28;
	const VIEW_WIDTH = 220;

	const localPlayer = $derived(gameState.localPlayer);
	const playerTile = $derived.by(() => {
		const tile = getPlayerTile(localPlayer, gameState.map);
		return tile;
	});

	const selectedTile = $derived(gameState.selectedHex);

	const canHarvestWood = $derived.by(() => {
		return (
			!!playerTile?.resource &&
			playerTile.resource.type === Resource.WOOD &&
			playerTile.resource.amount > 0
		);
	});
	const canHarvestStone = $derived.by(() => {
		return (
			!!playerTile?.resource &&
			playerTile.resource.type === Resource.STONE &&
			playerTile.resource.amount > 0
		);
	});
	const canHarvestSilver = $derived.by(() => {
		return (
			!!playerTile?.resource &&
			playerTile.resource.type === Resource.SILVER &&
			playerTile.resource.amount > 0
		);
	});

	const isMoveValid = $derived(!!(localPlayer && selectedTile && selectedTile.type !== 'WATER'));

	const actions = $derived(buildActions());
	const totalHeight = $derived(HEADER_HEIGHT + actions.length * ITEM_HEIGHT + POINT_DEPTH);

	function buildActions(): Action[] {
		const list: Action[] = [];

		if (isMoveValid) {
			list.push({
				id: 'move',
				emoji: '🗺️',
				title: 'Se déplacer',
				execute: () => requestMove(getSocket(), localPlayer!, selectedTile)
			});
		}

		if (canHarvestWood) {
			list.push({
				id: 'harvestWood',
				emoji: '🌳',
				title: 'Couper du bois',
				execute: () => requestHarvest(getSocket(), playerTile)
			});
		}

		if (canHarvestStone) {
			list.push({
				id: 'harvestStone',
				emoji: '🪨',
				title: 'Miner de la pierre',
				execute: () => requestHarvest(getSocket(), playerTile)
			});
		}

		if (canHarvestSilver) {
			list.push({
				id: 'harvestSilver',
				emoji: '⛏️',
				title: "Miner de l'argent",
				execute: () => requestHarvest(getSocket(), playerTile)
			});
		}

		return list;
	}
</script>

{#if actions.length > 0}
	<div class="panel-shadow absolute top-36 right-4" style="width: 13.75rem;">
		<PanelBg
			width={VIEW_WIDTH}
			height={totalHeight}
			shape="pentagon"
			gradientId="actionGrad"
			bevel={POINT_DEPTH}
			dividerY={HEADER_HEIGHT}
		/>

		<div class="relative flex flex-col" style="width: 13.75rem;">
			<div class="flex items-center gap-2 px-3" style="height: 2.75rem;">
				<span class="text-base">👑</span>
				<span class="text-panel-title text-sm tracking-wide">Actions disponibles</span>
			</div>

			{#each actions as action, i (action.id)}
				<div
					class="px-2 py-1.5"
					style={i < actions.length - 1
						? `border-bottom: 1px solid var(--color-border-separator);`
						: ''}
				>
					<button class="panel-btn gap-3 rounded-md px-3 py-2" onclick={action.execute}>
						<span class="shrink-0 text-2xl leading-none">{action.emoji}</span>
						<span class="text-panel-title text-sm leading-tight">{action.title}</span>
					</button>
				</div>
			{/each}

			<div style="height: 1.75rem;"></div>
		</div>
	</div>
{/if}
