import type { EntityDTO, TileData } from "$lib/stores/gameStore";
import { VISION_RADIUS } from "../fogOfWar";
import { hexDistance } from "../hexUtils";
import { getBottomAssetPath, getMaterial, getTopAssetPath } from "./biomeResolver";

export interface TileRenderData {
    bottomAsset: string;
    topAsset: string;
    material: string;
    scaleY: number;
    rotation: number;
    transitionAsset?: string;
    isWater: boolean;
}

export function resolveTile(tileData: TileData): TileRenderData {
    const tile: TileRenderData = {
        bottomAsset: getBottomAssetPath(tileData),
        topAsset: getTopAssetPath(tileData),
        material: getMaterial(tileData),
        scaleY: tileData.type === 'WATER' ? 1 : getScaleY(tileData.elevation),
        rotation: 0,
        isWater: tileData.type === 'WATER'
    };

    return tile;
}



export function getScaleY(elevation: number): number {
    const level = Math.round(elevation * 10)
    return level * 0.5;
}