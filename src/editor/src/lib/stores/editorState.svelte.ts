import { SvelteMap } from 'svelte/reactivity';

export interface PlacedAsset {
	id: string;
	file: string;
	position: [number, number, number];
	rotation: [number, number, number];
	scale: [number, number, number];
}

export interface EditorTile {
	q: number;
	r: number;
	assets: PlacedAsset[];
}

export const editorState = $state({
	map: new SvelteMap<string, EditorTile>(),
	hoveredHex: null as { q: number; r: number } | null,
	selectedAssetId: null as string | null,
});

export function getHexKey(q: number, r: number) {
	return `${q},${r}`;
}

export function generateId() {
	return Math.random().toString(36).substring(2, 11);
}

export function initMap() {
	// Créer une case par défaut à l'origine (vide)
	const originKey = getHexKey(0, 0);
	editorState.map.set(originKey, {
		q: 0,
		r: 0,
		assets: [],
	});
}

// Les directions des 6 voisins pour un hexagone
export const HEX_DIRECTIONS = [
	{ q: 1, r: 0 },
	{ q: 1, r: -1 },
	{ q: 0, r: -1 },
	{ q: -1, r: 0 },
	{ q: -1, r: 1 },
	{ q: 0, r: 1 },
];

export function getAdjacentHexes(): { q: number; r: number }[] {
	const adjacent = new Map<string, { q: number; r: number }>();

	for (const tile of editorState.map.values()) {
		for (const dir of HEX_DIRECTIONS) {
			const nq = tile.q + dir.q;
			const nr = tile.r + dir.r;
			const key = getHexKey(nq, nr);

			if (!editorState.map.has(key)) {
				adjacent.set(key, { q: nq, r: nr });
			}
		}
	}

	return Array.from(adjacent.values());
}
