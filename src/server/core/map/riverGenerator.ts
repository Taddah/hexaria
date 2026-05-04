import { TileData, HEX_DIRECTIONS, TileType, Biome } from "$shared/index";

// === REGLAGES DES COURBES ===
// Modifie ces valeurs (de 0 à 5) et sauvegarde pour voir le résultat direct dans ton navigateur.
// Cela dépend de l'orientation native de ton modèle 3D RIVER_B dans Blender/Blockbench.
const OFFSET_LEFT_TURN = 4;   // Pour les virages à gauche
const OFFSET_RIGHT_TURN = 3;  // Pour les virages à droite avec scaleX = -1
// ============================

export class RiverGenerator {
    generate(tiles: TileData[]): TileData[] {
        const tileMap = new Map<string, TileData>(
            tiles.map(t => [`${t.q},${t.r}`, t])
        );

        const getNeighbor = (tile: TileData, dirIndex: number) =>
            tileMap.get(`${tile.q + HEX_DIRECTIONS[dirIndex]!.q},${tile.r + HEX_DIRECTIONS[dirIndex]!.r}`);

        // 1. Calculate distance to water for all tiles (BFS)
        const distMap = new Map<string, number>();
        const queue: TileData[] = [];

        for (const tile of tiles) {
            if (tile.type === TileType.WATER) {
                distMap.set(`${tile.q},${tile.r}`, 0);
                queue.push(tile);
            }
        }

        let head = 0;
        while (head < queue.length) {
            const current = queue[head++]!;
            const currentDist = distMap.get(`${current.q},${current.r}`)!;

            for (let i = 0; i < 6; i++) {
                const neighbor = getNeighbor(current, i);
                if (neighbor && neighbor.type !== TileType.WATER) {
                    const key = `${neighbor.q},${neighbor.r}`;
                    if (!distMap.has(key)) {
                        // Weighted by elevation: it's harder to go up.
                        // Actually just distance is fine to find shortest path to water.
                        distMap.set(key, currentDist + 1);
                        queue.push(neighbor);
                    }
                }
            }
        }

        // 2. Generate rivers from mountains
        const mountainTiles = tiles.filter(t => t.biome === Biome.MOUNTAIN);
        // Shuffle and pick up to 2 sources
        const sources = mountainTiles.sort(() => Math.random() - 0.5).slice(0, 2);

        for (const source of sources) {
            let current = source;
            let path: { tile: TileData, dirIn: number, dirOut: number }[] = [];
            let inDir = -1;
            let blocked = false;

            while (current.type !== TileType.WATER) {
                let candidates = HEX_DIRECTIONS.map((_, i) => ({ neighbor: getNeighbor(current, i), dir: i }))
                    .filter(c => c.neighbor && c.neighbor.elevation <= current.elevation && !path.some(p => p.tile === c.neighbor));

                if (candidates.length === 0) {
                    blocked = true;
                    break;
                }

                const currentDist = distMap.get(`${current.q},${current.r}`) ?? 999;

                let validCandidates = candidates.filter(c => {
                    const d = distMap.get(`${c.neighbor!.q},${c.neighbor!.r}`) ?? 999;
                    return d <= currentDist || c.neighbor!.elevation < current.elevation;
                });

                if (validCandidates.length === 0) validCandidates = candidates;

                const weighted = validCandidates.map(c => {
                    let weight = 10;
                    const cDist = distMap.get(`${c.neighbor!.q},${c.neighbor!.r}`) ?? 999;

                    if (c.neighbor!.elevation < current.elevation) weight += 200; // Forte préférence pour descendre
                    if (cDist < currentDist) weight += 30; // Préférence pour se rapprocher de l'eau
                    if (cDist === currentDist) weight += 20; // Permet de faire des détours (méandres) sur la même hauteur
                    if (inDir !== -1 && c.dir === (inDir + 3) % 6) weight += 10; // Légère préférence pour aller tout droit

                    return { candidate: c, weight };
                });

                const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
                let rand = Math.random() * totalWeight;
                let next = weighted[0]!.candidate;
                for (const w of weighted) {
                    if (rand < w.weight) {
                        next = w.candidate;
                        break;
                    }
                    rand -= w.weight;
                }

                path.push({ tile: current, dirIn: inDir, dirOut: next.dir });
                inDir = (next.dir + 3) % 6; // Opposite direction for next tile
                current = next.neighbor!;
            }

            if (blocked || path.length < 2) continue; // Skip if it didn't reach water

            // 3. Process path
            for (let i = 0; i < path.length; i++) {
                const node = path[i]!;
                if (node.tile.type === TileType.WATER) continue;

                // Determine river type and rotation
                if (node.dirIn !== -1 && node.dirOut !== -1) {
                    const diff = (node.dirOut - node.dirIn + 6) % 6;

                    if (diff === 3) {
                        node.tile.type = TileType.RIVER_STRAIGHT;
                        node.tile.riverRotation = (node.dirIn + 3) * (Math.PI / 3);
                    } else if (diff === 2 || diff === 4) {
                        node.tile.type = TileType.RIVER_B;
                        // The RIVER_B asset naturally connects edges 1 and 5 (diff=4, left turn).
                        // To make it connect the correct edges, we use the offsets defined at the top of the file:
                        if (diff === 2) { // Right turn
                            node.tile.riverRotation = ((node.dirIn + OFFSET_RIGHT_TURN) % 6) * (Math.PI / 3);
                            node.tile.riverScaleX = -1;
                        } else { // Left turn
                            node.tile.riverRotation = ((node.dirIn + OFFSET_LEFT_TURN) % 6) * (Math.PI / 3);
                            node.tile.riverScaleX = 1;
                        }
                    } else {
                        node.tile.type = TileType.RIVER_C;
                        // Fallback rotation for RIVER_C (might need similar tweaking if asset is misaligned)
                        node.tile.riverRotation = (node.dirIn + 3) * (Math.PI / 3);
                    }
                } else if (node.dirOut !== -1) {
                    node.tile.type = TileType.RIVER_STRAIGHT;
                    node.tile.riverRotation = node.dirOut * (Math.PI / 3);
                } else if (node.dirIn !== -1) {
                    node.tile.type = TileType.RIVER_STRAIGHT;
                    node.tile.riverRotation = node.dirIn * (Math.PI / 3);
                }

                if (node.tile.resource) delete node.tile.resource;
                if (node.tile.decoZone) delete node.tile.decoZone;


            }
        }

        return tiles;
    }
}
