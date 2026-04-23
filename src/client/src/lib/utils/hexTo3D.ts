import type { Vector3Tuple } from 'three';

/** Taille d'une tuile hexagonale en unités Three.js. 1.155 correspond à une tuile parfaite pour scale x2 avec la plupart des assets Kenneys/KayKit */
export const HEX_SIZE = 1.155;

/**
 * Convertit des coordonnées axiales hex (q, r) en position 3D (x, 0, z).
 * Utilise l'orientation "pointy-top" pour coller au rendu existant.
 */
export function hexToWorld(q: number, r: number): Vector3Tuple {
	const x = HEX_SIZE * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
	const z = HEX_SIZE * ((3 / 2) * r);
	return [x, 0, z];
}
