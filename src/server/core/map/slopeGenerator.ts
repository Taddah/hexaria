import { TileData, HEX_DIRECTIONS, TileType, Biome, DecoType } from "$shared/index";

const OFFSET_SLOPE_ROTATION = 3;

export class SlopeGenerator {
    private tileMap = new Map<string, TileData>();

    generate(tiles: TileData[]): TileData[] {
        this.buildTileMap(tiles);

        for (const tile of tiles) {
            if (!this.isEligibleForSlope(tile)) continue;

            const higherDirs = this.findHigherNeighborDirs(tile);
            if (higherDirs.length === 0) continue;

            const rotation = this.computeSlopeRotation(higherDirs);
            if (rotation === null) continue;

            this.applySlope(tile, rotation);
        }

        return tiles;
    }

    private buildTileMap(tiles: TileData[]): void {
        this.tileMap.clear();
        for (const t of tiles) this.tileMap.set(`${t.q},${t.r}`, t);
    }

    private getNeighbor(tile: TileData, dirIndex: number): TileData | undefined {
        const dir = HEX_DIRECTIONS[dirIndex]!;
        return this.tileMap.get(`${tile.q + dir.q},${tile.r + dir.r}`);
    }

    private isEligibleForSlope(tile: TileData): boolean {
        if (this.isRiverTile(tile)) return false;
        if (tile.type === TileType.WATER) return false;
        if (tile.type?.includes("COAST")) return false;
        return true;
    }

    private isRiverTile(tile: TileData): boolean {
        return (
            tile.type === TileType.RIVER_STRAIGHT ||
            tile.type === TileType.RIVER_CURVY ||
            tile.type === TileType.RIVER_B ||
            tile.type === TileType.RIVER_END
        );
    }

    // Cherche les voisins PLUS HAUTS que la tuile courante
    private findHigherNeighborDirs(tile: TileData): number[] {
        const dirs: number[] = [];
        for (let i = 0; i < 6; i++) {
            const neighbor = this.getNeighbor(tile, i);
            if (!neighbor) continue;
            if (neighbor.elevation > tile.elevation + 0.05) {
                dirs.push(i);
            }
        }
        return dirs;
    }

    private computeSlopeRotation(higherDirs: number[]): number | null {
        if (higherDirs.length === 0) return null;
        if (higherDirs.length === 1) return this.dirToRotation(higherDirs[0]!);

        const middleDir = this.findMiddleAdjacentDir(higherDirs);
        if (middleDir === null) return null;

        return this.dirToRotation(middleDir);
    }

    private dirToRotation(dirIndex: number): number {
        return ((dirIndex + OFFSET_SLOPE_ROTATION) % 6) * (Math.PI / 3);
    }

    private findMiddleAdjacentDir(dirs: number[]): number | null {
        const sorted = [...dirs].sort((a, b) => a - b);

        for (let start = 0; start < 6; start++) {
            const arc: number[] = [];
            for (let offset = 0; offset < 6; offset++) {
                const d = (start + offset) % 6;
                if (sorted.includes(d)) {
                    arc.push(d);
                } else if (arc.length > 0) {
                    break;
                }
            }

            if (arc.length === sorted.length) {
                const middleIdx = Math.floor((arc.length - 1) / 2);
                return arc[middleIdx]!;
            }
        }

        return null;
    }

    private applySlope(tile: TileData, rotation: number): void {
        tile.type = TileType.SLOPE;
        tile.slopeRotation = rotation;
        tile.decoZone = { type: DecoType.EMPTY, density: 0 };
    }
}
