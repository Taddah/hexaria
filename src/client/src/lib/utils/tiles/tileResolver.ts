import type { TileData } from "$shared";
import { getBottomAssetPath, getMaterial, getTopAssetPath } from "./biomeResolver";
import { getTreeProps, type PropData } from "./propsResolver";

export interface TileRenderData {
    bottomAsset: string;
    topAsset: string;
    material: string;
    scaleY: number;
    rotation: number;
    transitionAsset?: string;
    isWater: boolean;
    props: PropData[];
}

export function resolveTile(tileData: TileData | undefined): TileRenderData {
    if (tileData === undefined) {
        return {
            bottomAsset: '',
            topAsset: '',
            material: '',
            scaleY: 0,
            rotation: 0,
            isWater: false,
            props: []
        };
    }
    const scaleY = tileData.type === 'WATER' ? 1 : getScaleY(tileData.elevation);
    const tile: TileRenderData = {
        bottomAsset: getBottomAssetPath(tileData),
        topAsset: getTopAssetPath(tileData),
        material: getMaterial(tileData),
        props: getTreeProps(tileData, scaleY),
        scaleY,
        rotation: 0,
        isWater: tileData.type === 'WATER'
    };

    return tile;
}



export function getScaleY(elevation: number): number {
    const level = Math.round(elevation * 10)
    return level * 0.5;
}