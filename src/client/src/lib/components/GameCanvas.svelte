<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as PIXI from 'pixi.js';
	import { mapStore, entitiesStore, hexSizeStore, selectedHexStore } from '$lib/stores/gameStore';
	import { pixelToHex, drawHexagonPoly, hexDistance } from '$lib/utils/hexUtils';
	import { exploredTiles, expandFog, VISION_RADIUS } from '$lib/utils/fogOfWar';

	let canvasContainer: HTMLDivElement;
	let app: PIXI.Application;

	let mapContainer: PIXI.Container;
	let highlightContainer: PIXI.Container;
	let entitiesContainer: PIXI.Container;

	let highlightGraphic: PIXI.Graphics;
	const entityGraphicsMap = new Map<number, PIXI.Graphics>();

	let playerPos: { q: number; r: number } | null = null;
	let unsubs: Array<() => void> = [];

	onMount(async () => {
		app = new PIXI.Application();
		await app.init({ resizeTo: canvasContainer, backgroundColor: 0x1e1e2f, antialias: true });
		canvasContainer.appendChild(app.canvas);

		mapContainer = new PIXI.Container();
		highlightContainer = new PIXI.Container();
		entitiesContainer = new PIXI.Container();
		app.stage.addChild(mapContainer);
		app.stage.addChild(highlightContainer);
		app.stage.addChild(entitiesContainer);

		highlightGraphic = new PIXI.Graphics();
		highlightContainer.addChild(highlightGraphic);

		app.stage.position.set(window.innerWidth / 2, window.innerHeight / 2);

		app.stage.eventMode = 'static';
		app.stage.hitArea = new PIXI.Rectangle(-100000, -100000, 200000, 200000);

		app.stage.on('pointerdown', (e) => {
			const localPos = mapContainer.toLocal(e.global);
			const coords = pixelToHex(localPos.x, localPos.y, $hexSizeStore);
			const tile = $mapStore.find((t) => t.q === coords.q && t.r === coords.r);
			selectedHexStore.set(tile ? { q: coords.q, r: coords.r } : null);
		});

		unsubs.push(
			mapStore.subscribe((mapData) => {
				if (mapData.length > 0) drawMap(mapData, $hexSizeStore);
			})
		);

		unsubs.push(
			hexSizeStore.subscribe((size) => {
				if ($mapStore.length > 0) drawMap($mapStore, size);
			})
		);

		unsubs.push(
			selectedHexStore.subscribe((sel) => {
				if (highlightGraphic) updateHighlight(sel, $hexSizeStore);
			})
		);

		unsubs.push(
			entitiesStore.subscribe((entities) => {
				updateEntities(entities, $hexSizeStore);
			})
		);
	});

	onDestroy(() => {
		unsubs.forEach((u) => u());
		app?.destroy(true, { children: true, texture: true });
	});

	function drawMap(mapData: typeof $mapStore, size: number) {
		mapContainer.removeChildren();
		const sqrt3 = Math.sqrt(3);

		for (const tile of mapData) {
			const key = `${tile.q},${tile.r}`;
			const isExplored = exploredTiles.has(key);
			const isVisible =
				playerPos !== null &&
				hexDistance(playerPos.q, playerPos.r, tile.q, tile.r) <= VISION_RADIUS;

			if (!isExplored && !isVisible) continue;

			const x = size * (sqrt3 * tile.q + (sqrt3 / 2) * tile.r);
			const y = size * ((3 / 2) * tile.r);

			const hex = new PIXI.Graphics();
			let color = 0x000000;
			switch (tile.type) {
				case 'WATER':
					color = 0x2288cc;
					break;
				case 'PLAINS':
					color = 0x55aa55;
					break;
				case 'FOREST':
					color = 0x227722;
					break;
				case 'MOUNTAIN':
					color = 0x777777;
					break;
			}

			hex.poly(drawHexagonPoly(size));
			if (isVisible) {
				hex.fill({ color });
				hex.stroke({ color: 0x000000, width: 1, alpha: 0.5 });
			} else {
				hex.fill({ color, alpha: 0.35 });
				hex.stroke({ color: 0x000000, width: 1, alpha: 0.2 });
			}
			hex.x = x;
			hex.y = y;
			mapContainer.addChild(hex);
		}
	}

	function updateHighlight(sel: { q: number; r: number } | null, size: number) {
		highlightGraphic.clear();
		if (!sel) return;
		const sqrt3 = Math.sqrt(3);
		highlightGraphic.poly(drawHexagonPoly(size));
		highlightGraphic.fill({ color: 0xffaa00, alpha: 0.3 });
		highlightGraphic.stroke({ color: 0xffaa00, width: 4, alpha: 1 });
		highlightGraphic.x = size * (sqrt3 * sel.q + (sqrt3 / 2) * sel.r);
		highlightGraphic.y = size * ((3 / 2) * sel.r);
	}

	function updateEntities(entities: typeof $entitiesStore, size: number) {
		const currentIds = new Set<number>();
		const sqrt3 = Math.sqrt(3);
		let needsRedraw = false;

		for (const entity of entities) {
			currentIds.add(entity.id);
			const { q, r } = entity.position;
			const x = size * (sqrt3 * q + (sqrt3 / 2) * r);
			const y = size * ((3 / 2) * r);

			let g = entityGraphicsMap.get(entity.id);
			if (!g) {
				g = new PIXI.Graphics();
				g.circle(0, 0, size * 0.6);
				g.fill({ color: 0xff3344 });
				g.stroke({ color: 0xffffff, width: 2 });
				entitiesContainer.addChild(g);
				entityGraphicsMap.set(entity.id, g);
			}
			g.x = x;
			g.y = y;

			if (entity.identity?.name === 'Héros Test') {
				app.stage.position.set(window.innerWidth / 2 - x, window.innerHeight / 2 - y);

				if (!playerPos || playerPos.q !== q || playerPos.r !== r) {
					playerPos = { q, r };
					expandFog(q, r, $mapStore);
					needsRedraw = true;
				}
			}
		}

		if (needsRedraw) drawMap($mapStore, size);

		for (const [id, g] of entityGraphicsMap.entries()) {
			if (!currentIds.has(id)) {
				entitiesContainer.removeChild(g);
				g.destroy();
				entityGraphicsMap.delete(id);
			}
		}
	}
</script>

<div bind:this={canvasContainer} class="absolute inset-0 h-full w-full overflow-hidden"></div>
