<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as PIXI from 'pixi.js';
	import { mapStore, entitiesStore, hexSizeStore, selectedHexStore } from '../stores/gameStore';

	let canvasContainer: HTMLDivElement;
	let app: PIXI.Application;

	let mapContainer: PIXI.Container;
	let highlightContainer: PIXI.Container;
	let entitiesContainer: PIXI.Container;

	const entityGraphicsMap = new Map<number, PIXI.Graphics>();
	let highlightGraphic: PIXI.Graphics;

	const VISION_RADIUS = 3;
	const exploredTiles = new Set<string>();
	let playerPos: { q: number; r: number } | null = null;

	let unsubs: Array<() => void> = [];

	onMount(async () => {
		app = new PIXI.Application();

		await app.init({
			resizeTo: canvasContainer,
			backgroundColor: 0x1e1e2f,
			antialias: true
		});

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

			console.log('Hexagone cliqué :', coords);

			const tile = $mapStore.find((t) => t.q === coords.q && t.r === coords.r);
			if (tile) {
				console.log('Infos de la tuile (Store) :', tile);
				selectedHexStore.set({ q: coords.q, r: coords.r });
			} else {
				console.log('Aucune tuile existante à cet emplacement.');
				selectedHexStore.set(null);
			}
		});

		unsubs.push(
			mapStore.subscribe((mapData) => {
				if (mapData.length > 0) {
					drawMap(mapData, $hexSizeStore);
				}
			})
		);

		unsubs.push(
			hexSizeStore.subscribe((size) => {
				const mapData = $mapStore;
				if (mapData && mapData.length > 0) {
					drawMap(mapData, size);
				}
			})
		);

		unsubs.push(
			selectedHexStore.subscribe((selectedHex) => {
				if (highlightGraphic) updateHighlight(selectedHex, $hexSizeStore);
			})
		);

		unsubs.push(
			entitiesStore.subscribe((entities) => {
				updateEntities(entities, $hexSizeStore);
			})
		);
	});

	onDestroy(() => {
		unsubs.forEach((unsub) => unsub());
		if (app) {
			app.destroy(true, { children: true, texture: true });
		}
	});

	function drawHexagonPoly(size: number): number[] {
		const points: number[] = [];
		for (let i = 0; i < 6; i++) {
			const angle_deg = 60 * i - 30;
			const angle_rad = (Math.PI / 180) * angle_deg;
			points.push(size * Math.cos(angle_rad), size * Math.sin(angle_rad));
		}
		return points;
	}

	function hexDistance(q1: number, r1: number, q2: number, r2: number): number {
		return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
	}

	function drawMap(mapData: any[], size: number) {
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
				hex.fill({ color: color });
				hex.stroke({ color: 0x000000, width: 1, alpha: 0.5 });
			} else {
				hex.fill({ color: color, alpha: 0.35 });
				hex.stroke({ color: 0x000000, width: 1, alpha: 0.2 });
			}

			hex.x = x;
			hex.y = y;

			mapContainer.addChild(hex);
		}
	}

	function updateHighlight(selectedHex: { q: number; r: number } | null, size: number) {
		highlightGraphic.clear();
		if (!selectedHex) return;

		const sqrt3 = Math.sqrt(3);
		const x = size * (sqrt3 * selectedHex.q + (sqrt3 / 2) * selectedHex.r);
		const y = size * ((3 / 2) * selectedHex.r);

		highlightGraphic.poly(drawHexagonPoly(size));
		highlightGraphic.fill({ color: 0xffaa00, alpha: 0.3 });
		highlightGraphic.stroke({ color: 0xffaa00, width: 4, alpha: 1 });

		highlightGraphic.x = x;
		highlightGraphic.y = y;
	}

	function updateEntities(entities: any[], size: number) {
		const currentIds = new Set<number>();
		const sqrt3 = Math.sqrt(3);
		let needsRedraw = false;

		for (const entity of entities) {
			currentIds.add(entity.id);
			const { q, r } = entity.position;

			const x = size * (sqrt3 * q + (sqrt3 / 2) * r);
			const y = size * ((3 / 2) * r);

			let graphic = entityGraphicsMap.get(entity.id);
			if (!graphic) {
				graphic = new PIXI.Graphics();
				graphic.circle(0, 0, size * 0.6);
				graphic.fill({ color: 0xff3344 });
				graphic.stroke({ color: 0xffffff, width: 2 });

				entitiesContainer.addChild(graphic);
				entityGraphicsMap.set(entity.id, graphic);
			}

			graphic.x = x;
			graphic.y = y;

			if (entity.identity?.name === 'Héros Test') {
				app.stage.position.set(window.innerWidth / 2 - x, window.innerHeight / 2 - y);

				if (!playerPos || playerPos.q !== q || playerPos.r !== r) {
					playerPos = { q, r };
					const mapData = $mapStore;
					for (const tile of mapData) {
						if (hexDistance(q, r, tile.q, tile.r) <= VISION_RADIUS) {
							exploredTiles.add(`${tile.q},${tile.r}`);
						}
					}
					needsRedraw = true;
				}
			}
		}

		if (needsRedraw) drawMap($mapStore, size);

		for (const [id, graphic] of entityGraphicsMap.entries()) {
			if (!currentIds.has(id)) {
				entitiesContainer.removeChild(graphic);
				graphic.destroy();
				entityGraphicsMap.delete(id);
			}
		}
	}

	function pixelToHex(x: number, y: number, size: number) {
		const q = ((Math.sqrt(3) / 3) * x - (1 / 3) * y) / size;
		const r = ((2 / 3) * y) / size;
		return hexRound(q, r);
	}

	function hexRound(q: number, r: number) {
		let x = q,
			z = r,
			y = -x - z;
		let rx = Math.round(x),
			ry = Math.round(y),
			rz = Math.round(z);

		const x_diff = Math.abs(rx - x);
		const y_diff = Math.abs(ry - y);
		const z_diff = Math.abs(rz - z);

		if (x_diff > y_diff && x_diff > z_diff) rx = -ry - rz;
		else if (y_diff > z_diff) ry = -rx - rz;
		else rz = -rx - ry;

		return { q: rx, r: rz };
	}
</script>

<div bind:this={canvasContainer} class="absolute inset-0 h-full w-full overflow-hidden"></div>
