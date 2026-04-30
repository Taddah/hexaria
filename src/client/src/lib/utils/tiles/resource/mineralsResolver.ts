import { Resource, type TileData } from "$shared";
import { seededRandom, type PropData } from "../propsResolver";

const PROPS_PATH = "/assets/models/decoration/nature/";
const MINERAL_ASSET = "dense/dense_5.gltf";

export function getMineralProps(tile: TileData, scaleY: number): PropData[] {
    if (!tile.resource || (tile.resource.type !== Resource.STONE && tile.resource.type !== Resource.SILVER)) {
        return [];
    }

    return [{
        assetPath: PROPS_PATH + MINERAL_ASSET,
        x: 0,
        z: 0,
        y: scaleY + 1,
        rotation: seededRandom(tile.q, tile.r) * Math.PI * 2,
        scale: 1
    }];
}