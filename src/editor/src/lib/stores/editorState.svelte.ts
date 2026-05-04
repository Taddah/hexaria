import { SvelteMap } from 'svelte/reactivity';

export interface EditorTile {
	q: number;
	r: number;
	elevation: number;
	bottomTile: string | null;
	topTile: string | null;
	decorations: string[];
}

export const editorState = $state({
	map: new SvelteMap<string, EditorTile>(),
	hoveredHex: null as { q: number; r: number } | null,
});

export function getHexKey(q: number, r: number) {
	return `${q},${r}`;
}

export function initMap() {
	// Créer une case par défaut à l'origine
	const originKey = getHexKey(0, 0);
	editorState.map.set(originKey, {
		q: 0,
		r: 0,
		elevation: 0,
		bottomTile: null, // Plus tard on pourra mettre un tile par défaut
		topTile: null,
		decorations: [],
	});
}

// Les directions des 6 voisins pour un hexagone (pointy-top ou flat-top, ici on suppose la même logique que le client)
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

			// Ajouter seulement si la case n'existe pas déjà
			if (!editorState.map.has(key)) {
				adjacent.set(key, { q: nq, r: nr });
			}
		}
	}

	return Array.from(adjacent.values());
}
