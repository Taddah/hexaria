import { DecoType, HEX_DIRECTIONS, type TileData } from "$shared";
import { hexDistance } from "./hexUtils";


function isBlocked(tile: TileData | undefined): boolean {
    if (!tile) return true;
    if (tile.type === 'WATER') return true;
    if (tile.decoZone?.type === DecoType.DENSE) return true;
    return false;
}


export function findPath(
    startQ: number, startR: number,
    endQ: number, endR: number,
    map: Record<string, TileData>
): { q: number, r: number }[] {
    const tileMap = map;
    if (isBlocked(tileMap[`${endQ},${endR}`])) return [];

    interface Node { q: number; r: number; g: number; f: number; }

    const openList = new Map<string, Node>();
    const closedList = new Set<string>();
    const cameFrom = new Map<string, string | null>();

    const startKey = `${startQ},${startR}`;
    openList.set(startKey, {
        q: startQ, r: startR,
        g: 0,
        f: hexDistance(startQ, startR, endQ, endR)
    });
    cameFrom.set(startKey, null);

    while (openList.size > 0) {
        let current: Node | null = null;
        let currentKey = '';
        for (const [key, node] of openList) {
            if (!current || node.f < current.f) {
                current = node;
                currentKey = key;
            }
        }
        if (!current) break;

        if (current.q === endQ && current.r === endR) {
            // Reconstruction du chemin
            const path: { q: number, r: number }[] = [];
            let key: string | null = currentKey;
            while (key) {
                const [q, r] = key.split(',').map(Number);
                path.unshift({ q, r });
                key = cameFrom.get(key) ?? null;
            }
            return path.slice(1);
        }

        openList.delete(currentKey);
        closedList.add(currentKey);

        for (const dir of HEX_DIRECTIONS) {
            const nq = current.q + dir.q;
            const nr = current.r + dir.r;
            const nKey = `${nq},${nr}`;

            if (closedList.has(nKey)) continue;
            if (isBlocked(tileMap[nKey])) continue;

            const g = current.g + 1;
            const existing = openList.get(nKey);

            if (!existing || g < existing.g) {
                openList.set(nKey, {
                    q: nq, r: nr,
                    g,
                    f: g + hexDistance(nq, nr, endQ, endR)
                });
                cameFrom.set(nKey, currentKey);
            }
        }
    }

    return [];
}