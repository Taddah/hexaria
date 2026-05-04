import { TileData, HEX_DIRECTIONS, TileType, Biome } from "$shared/index";
import seedrandom from "seedrandom";

// === REGLAGES DES COURBES ===
// Modifie ces valeurs (de 0 à 5) selon l'orientation native de tes modèles 3D.
const OFFSET_LEFT_TURN = 3;
const OFFSET_RIGHT_TURN = 0;
const OFFSET_RIVER_START = 0;
const OFFSET_RIVER_END = 3;
// ============================

// === REGLAGES GENERATION ===
const MAX_RIVER_LENGTH = 100;
const STRAIGHT_VS_CURVY_RATIO = 0.5;
// ============================

interface PathNode {
    tile: TileData;
    dirIn: number;   // direction d'entrée (-1 si source)
    dirOut: number;  // direction de sortie (-1 si fin)
}

export class RiverGenerator {
    private rng: () => number;
    private tileMap = new Map<string, TileData>();
    private distMap = new Map<string, number>();

    constructor(seed: string) {
        this.rng = seedrandom(`${seed}_rivers`);
    }

    // ============================================================
    // POINT D'ENTREE
    // ============================================================
    generate(tiles: TileData[]): TileData[] {
        this.buildTileMap(tiles);
        this.computeDistanceToWater(tiles);

        const clusters = this.findMountainClusters(tiles);
        const sources = this.pickSourcesFromClusters(clusters);

        for (const source of sources) {
            const path = this.tracePathToWater(source);
            if (path.length < 2) continue;
            this.applyRiverToPath(path);
        }

        return tiles;
    }

    // ============================================================
    // UTILITAIRES DE BASE
    // ============================================================
    private key(tile: TileData): string {
        return `${tile.q},${tile.r}`;
    }

    private buildTileMap(tiles: TileData[]): void {
        this.tileMap.clear();
        for (const t of tiles) {
            this.tileMap.set(this.key(t), t);
        }
    }

    private getNeighbor(tile: TileData, dirIndex: number): TileData | undefined {
        const dir = HEX_DIRECTIONS[dirIndex]!;
        return this.tileMap.get(`${tile.q + dir.q},${tile.r + dir.r}`);
    }

    // ============================================================
    // ETAPE 1 : DISTANCE A L'EAU (BFS depuis toutes les tuiles eau)
    // ============================================================
    private computeDistanceToWater(tiles: TileData[]): void {
        this.distMap.clear();
        const queue: TileData[] = [];

        for (const tile of tiles) {
            if (tile.type === TileType.WATER) {
                this.distMap.set(this.key(tile), 0);
                queue.push(tile);
            }
        }

        let head = 0;
        while (head < queue.length) {
            const current = queue[head++]!;
            const currentDist = this.distMap.get(this.key(current))!;

            for (let i = 0; i < 6; i++) {
                const neighbor = this.getNeighbor(current, i);
                if (!neighbor || neighbor.type === TileType.WATER) continue;

                const nKey = this.key(neighbor);
                if (this.distMap.has(nKey)) continue;

                this.distMap.set(nKey, currentDist + 1);
                queue.push(neighbor);
            }
        }
    }

    // ============================================================
    // ETAPE 2 : CLUSTERING DES MONTAGNES (composantes connexes)
    // ============================================================
    private findMountainClusters(tiles: TileData[]): TileData[][] {
        // Tri pour ordre déterministe
        const mountainTiles = tiles
            .filter(t => t.biome === Biome.MOUNTAIN)
            .sort((a, b) => a.q - b.q || a.r - b.r);

        const visited = new Set<string>();
        const clusters: TileData[][] = [];

        for (const start of mountainTiles) {
            if (visited.has(this.key(start))) continue;
            clusters.push(this.floodFillMountain(start, visited));
        }

        return clusters;
    }

    private floodFillMountain(start: TileData, visited: Set<string>): TileData[] {
        const cluster: TileData[] = [];
        const stack: TileData[] = [start];
        visited.add(this.key(start));

        while (stack.length > 0) {
            const tile = stack.pop()!;
            cluster.push(tile);

            for (let i = 0; i < 6; i++) {
                const neighbor = this.getNeighbor(tile, i);
                if (!neighbor) continue;
                if (neighbor.biome !== Biome.MOUNTAIN) continue;

                const nKey = this.key(neighbor);
                if (visited.has(nKey)) continue;

                visited.add(nKey);
                stack.push(neighbor);
            }
        }

        return cluster;
    }

    // ============================================================
    // ETAPE 3 : CHOIX DES SOURCES (une par cluster)
    // ============================================================
    private pickSourcesFromClusters(clusters: TileData[][]): TileData[] {
        return clusters.map(cluster => this.pickSourceInCluster(cluster));
    }

    private pickSourceInCluster(cluster: TileData[]): TileData {
        // Stratégie : tuile aléatoire seedée
        // (alternative possible : la plus haute en élévation)
        const idx = Math.floor(this.rng() * cluster.length);
        return cluster[idx]!;
    }

    // ============================================================
    // ETAPE 4 : TRACE DU CHEMIN VERS L'EAU
    // ============================================================
    private tracePathToWater(source: TileData): PathNode[] {
        const path: PathNode[] = [];
        const visitedPath = new Set<string>();

        let current = source;
        let dirIn = -1;

        for (let step = 0; step < MAX_RIVER_LENGTH; step++) {
            visitedPath.add(this.key(current));

            const next = this.findNextStep(current, visitedPath);

            if (!next) {
                // Bloqué : on termine le chemin ici
                path.push({ tile: current, dirIn, dirOut: -1 });
                break;
            }

            path.push({ tile: current, dirIn, dirOut: next.dir });

            // Si on atteint l'eau, on arrête (sans pousser la tuile d'eau)
            if (next.neighbor.type === TileType.WATER) break;

            dirIn = (next.dir + 3) % 6; // direction inverse
            current = next.neighbor;
        }

        return path;
    }

    private findNextStep(
        current: TileData,
        visitedPath: Set<string>
    ): { neighbor: TileData; dir: number } | null {
        let best: { neighbor: TileData; dir: number; dist: number } | null = null;

        for (let i = 0; i < 6; i++) {
            const neighbor = this.getNeighbor(current, i);
            if (!neighbor) continue;
            if (visitedPath.has(this.key(neighbor))) continue;

            const dist = this.distMap.get(this.key(neighbor));
            if (dist === undefined) continue;

            if (!best || dist < best.dist) {
                best = { neighbor, dir: i, dist };
            }
        }

        return best ? { neighbor: best.neighbor, dir: best.dir } : null;
    }

    // ============================================================
    // ETAPE 5 : APPLICATION DU RENDU SUR LE CHEMIN
    // ============================================================
    private applyRiverToPath(path: PathNode[]): void {
        for (const node of path) {
            if (node.tile.type === TileType.WATER) continue;
            this.applyRiverTile(node);
            this.cleanupTile(node.tile);
        }
    }

    private applyRiverTile(node: PathNode): void {
        const { dirIn, dirOut } = node;

        if (dirIn !== -1 && dirOut !== -1) {
            this.applyRiverMiddle(node);
        } else if (dirOut !== -1) {
            this.applyRiverSource(node);
        } else if (dirIn !== -1) {
            this.applyRiverDeadEnd(node);
        }
    }

    private applyRiverMiddle(node: PathNode): void {
        const diff = (node.dirOut - node.dirIn + 6) % 6;

        if (diff === 3) {
            // Tout droit
            node.tile.type = this.rng() > STRAIGHT_VS_CURVY_RATIO
                ? TileType.RIVER_STRAIGHT
                : TileType.RIVER_CURVY;
            node.tile.riverRotation = (node.dirIn + 3) * (Math.PI / 3);
        } else if (diff === 2) {
            // Virage à droite
            node.tile.type = TileType.RIVER_B;
            node.tile.riverRotation = ((node.dirIn + OFFSET_RIGHT_TURN) % 6) * (Math.PI / 3);
            node.tile.riverScaleX = -1;
        } else if (diff === 4) {
            // Virage à gauche
            node.tile.type = TileType.RIVER_B;
            node.tile.riverRotation = ((node.dirIn + OFFSET_LEFT_TURN) % 6) * (Math.PI / 3);
            node.tile.riverScaleX = 1;
        }
    }

    private applyRiverSource(node: PathNode): void {
        node.tile.type = TileType.RIVER_END;
        node.tile.riverRotation = ((node.dirOut + OFFSET_RIVER_START) % 6) * (Math.PI / 3);
    }

    private applyRiverDeadEnd(node: PathNode): void {
        node.tile.type = TileType.RIVER_END;
        node.tile.riverRotation = ((node.dirIn + OFFSET_RIVER_END) % 6) * (Math.PI / 3);
    }

    private cleanupTile(tile: TileData): void {
        if (tile.resource) delete tile.resource;
        if (tile.decoZone) delete tile.decoZone;
    }
}
