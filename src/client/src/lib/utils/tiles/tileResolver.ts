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
        rotation: getRotation(tileData),
        isWater: tileData.type === 'WATER'
    };

    return tile;
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
    let elevation = tileData.elevation
    if (tileData.type === 'WATER' || tileData.type?.includes("COAST")) elevation = 0.3;

    const level = Math.round(elevation * 10)
    return level * 0.2;
}