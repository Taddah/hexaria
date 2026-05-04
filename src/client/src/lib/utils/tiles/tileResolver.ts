import { TileType, type TileData } from "$shared";
import { getBottomAssetPath, getTopAssetPath } from "./biomeResolver";
import { getMaterial } from "./materialResolver";
import { getProps, type PropData } from "./propsResolver";

export interface TileRenderData {
    bottomAsset: string;
    topAsset: string;
    material: string;
    scaleX: number;
    scaleY: number;
    scaleZ: number;
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
            scaleX: 1,
            scaleY: 0,
            scaleZ: 1,
            rotation: 0,
            isWater: false,
            props: []
        };
    }

    const scaleY = getScaleY(tileData);

    const tile: TileRenderData = {
        bottomAsset: getBottomAssetPath(tileData),
        topAsset: getTopAssetPath(tileData),
        material: getMaterial(tileData),
        props: getProps(tileData, scaleY),
        scaleX: tileData.riverScaleX ?? 1,
        scaleY,
        scaleZ: getScaleZ(tileData),
        rotation: getRotation(tileData),
        isWater: tileData.type === 'WATER'
    };

    return tile;
}

export function getScaleZ(tileData: TileData): number {
    if (tileData.type === TileType.SLOPE) return 1;
    return 1;
}



function getRotation(tileData: TileData) {
    if (tileData.type === TileType.SLOPE)
        return (tileData.slope?.directionIndex ?? 0) * (Math.PI / 3);

    if (tileData.type?.includes("RIVER"))
        return tileData.riverRotation ?? 0;

    if (tileData.type?.includes("COAST"))
        return (tileData.coastRotation ?? 0) * (Math.PI / 3);

    return 0;
}

export function getScaleY(tileData: TileData): number {
    if (tileData.type === 'WATER') {
        return 0.3;
    }


    if (tileData.type?.includes("COAST")) {
        return 0.3; // même niveau que l'eau
    }

    if (tileData.elevation <= 0.3) {
        return 0.3;
    }


    const level = Math.round(tileData.elevation * 10);
    return Math.max(level * 0.2, 0.3);
}

