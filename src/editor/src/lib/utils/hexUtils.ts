import type { Vector3Tuple } from 'three';

export const HEX_SIZE = 1.155;

/**
 * Convertit des coordonnées axiales hex (q, r) en position 3D (x, 0, z).
 * Utilise l'orientation "pointy-top" pour coller au rendu existant.
 */
export function hexToWorld(q: number, r: number, elevation: number = 0): Vector3Tuple {
	const x = HEX_SIZE * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
	const z = HEX_SIZE * ((3 / 2) * r);
	return [x, elevation, z];
}

function cubeRound(fracQ: number, fracR: number, fracS: number) {
	let q = Math.round(fracQ);
	let r = Math.round(fracR);
	let s = Math.round(fracS);

	const qDiff = Math.abs(q - fracQ);
	const rDiff = Math.abs(r - fracR);
	const sDiff = Math.abs(s - fracS);

	if (qDiff > rDiff && qDiff > sDiff) {
		q = -r - s;
	} else if (rDiff > sDiff) {
		r = -q - s;
	} else {
		s = -q - r;
	}

	return { q, r };
}

export function worldToHex(x: number, z: number): { q: number; r: number } {
	const q = ((Math.sqrt(3) / 3) * x - (1 / 3) * z) / HEX_SIZE;
	const r = ((2 / 3) * z) / HEX_SIZE;
	return cubeRound(q, r, -q - r);
}

export function pixelToHex(x: number, y: number, size: number = HEX_SIZE): { q: number; r: number } {
	const q = ((Math.sqrt(3) / 3) * x - (1 / 3) * y) / size;
	const r = ((2 / 3) * y) / size;
	return hexRound(q, r);
}

function hexRound(q: number, r: number): { q: number; r: number } {
	let x = q, z = r, y = -x - z;
	let rx = Math.round(x), ry = Math.round(y), rz = Math.round(z);

	const dx = Math.abs(rx - x), dy = Math.abs(ry - y), dz = Math.abs(rz - z);

	if (dx > dy && dx > dz) rx = -ry - rz;
	else if (dy > dz) ry = -rx - rz;
	else rz = -rx - ry;

	return { q: rx, r: rz };
}
