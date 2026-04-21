<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as PIXI from 'pixi.js';
	import { mapStore, entitiesStore, hexSizeStore } from '../stores/gameStore';

	let canvasContainer: HTMLDivElement;
	let app: PIXI.Application;

	let mapContainer: PIXI.Container;
	let entitiesContainer: PIXI.Container;

	const entityGraphicsMap = new Map<number, PIXI.Graphics>();

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
		entitiesContainer = new PIXI.Container();
		app.stage.addChild(mapContainer);
		app.stage.addChild(entitiesContainer);

		const sqrt3 = Math.sqrt(3);
		const size = $hexSizeStore;
		const mapCenterX = size * (sqrt3 * 25 + (sqrt3 / 2) * 25);
		const mapCenterY = size * ((3 / 2) * 25);

		const offsetX = window.innerWidth / 2 - mapCenterX;
		const offsetY = window.innerHeight / 2 - mapCenterY;
		app.stage.position.set(offsetX, offsetY);

		app.stage.eventMode = 'static';
		app.stage.hitArea = new PIXI.Rectangle(-100000, -100000, 200000, 200000);

		app.stage.on('pointerdown', (e) => {
			const localPos = mapContainer.toLocal(e.global);
			const coords = pixelToHex(localPos.x, localPos.y, $hexSizeStore);

			console.log('Hexagone cliqué :', coords);

			const tile = $mapStore.find((t) => t.q === coords.q && t.r === coords.r);
			if (tile) {
				console.log('Infos de la tuile (Store) :', tile);
			} else {
				console.log('Aucune tuile existante à cet emplacement.');
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

	function drawMap(mapData: any[], size: number) {
		mapContainer.removeChildren();

		const sqrt3 = Math.sqrt(3);

		for (const tile of mapData) {
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
			hex.fill({ color: color });
			hex.stroke({ color: 0x000000, width: 1, alpha: 0.5 });

			hex.x = x;
			hex.y = y;

			mapContainer.addChild(hex);
		}
	}

	function updateEntities(entities: any[], size: number) {
		const currentIds = new Set<number>();
		const sqrt3 = Math.sqrt(3);

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
		}
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
