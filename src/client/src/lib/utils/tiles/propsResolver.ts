import type { TileData } from "$shared";
import { getDecorationProps } from "./props/decorationResolver";
import { getMineralProps } from "./resource/mineralsResolver";
import { getTreeProps } from "./resource/treesResolver";

export interface PropData {
    assetPath: string;
    x: number;
    z: number;
    y: number;
    rotation: number;
    scale: number;
}

export function seededRandom(q: number, r: number, seed: number = 0): number {
    const x = Math.sin(q * 12.9898 + r * 78.233 + seed * 43758.5453) * 43758.5453123;
    return x - Math.floor(x);
}


export function getProps(tileData: TileData, scaleY: number): PropData[] {
    return [
        ...getTreeProps(tileData, scaleY),
        ...getMineralProps(tileData, scaleY),
        ...getDecorationProps(tileData, scaleY)
    ]
}


