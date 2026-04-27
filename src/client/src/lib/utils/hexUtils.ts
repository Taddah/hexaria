import { gameState } from "$lib/stores/gameState.svelte";
import type { TileData } from "$shared";
import type { Vector3Tuple } from 'three';


export function pixelToHex(x: number, y: number, size: number): { q: number; r: number } {
    const q = ((Math.sqrt(3) / 3) * x - (1 / 3) * y) / size;
    const r = ((2 / 3) * y) / size;
    return hexRound(q, r);
}

export function hexDistance(q1: number, r1: number, q2: number, r2: number): number {
    return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
}

export function drawHexagonPoly(size: number): number[] {
    const points: number[] = [];
    for (let i = 0; i < 6; i++) {
        const angle_rad = (Math.PI / 180) * (60 * i - 30);
        points.push(size * Math.cos(angle_rad), size * Math.sin(angle_rad));
    }
    return points;
}

export function getTile(q: number, r: number): TileData | null {
    return gameState.map[`${q},${r}`] ?? null;
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
