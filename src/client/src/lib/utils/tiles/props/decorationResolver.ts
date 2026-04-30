import { Biome, DecoType, type TileData } from "$shared";
import { seededRandom, type PropData } from "../propsResolver";

const DECO_PATH = '/assets/models/decoration/nature/';


const SPARSE_ASSETS = {
    [Biome.PRAIRIE]: ['sparse_1_B', 'sparse_2_B', 'sparse_3', 'sparse_4', 'sparse_5_B', 'sparse_6_B'],
    [Biome.TAIGA]: ['sparse_1_A', 'sparse_2_A', 'sparse_3', 'sparse_4', 'sparse_5_A', 'sparse_6_A'],
    [Biome.DESERT]: ['sparse_3', 'sparse_4'],
    [Biome.MOUNTAIN]: ['sparse_1_A', 'sparse_2_A', 'sparse_3', 'sparse_4', 'sparse_5_A', 'sparse_6_A'],
    [Biome.WATER]: [],
};

const MEDIUM_ASSETS = {
    [Biome.PRAIRIE]: ['medium_1_B', 'medium_2', 'medium_3_B', 'medium_4_B', 'medium_5'],
    [Biome.TAIGA]: ['medium_1_A', 'medium_2', 'medium_3_A', 'medium_4_A', 'medium_5'],
    [Biome.DESERT]: ['medium_2', 'medium_5'],
    [Biome.MOUNTAIN]: ['medium_1_A', 'medium_2', 'medium_3_A', 'medium_4_A', 'medium_5'],
    [Biome.WATER]: [],
};


const DENSE_ASSETS = {
    [Biome.PRAIRIE]: ['dense_1', 'dense_2_B', 'dense_3_B', 'dense_4_B', 'dense_5', 'dense_6', 'dense_7_B', 'dense_8', 'dense_9', 'dense_10_B', 'dense_11', 'dense_12', 'dense_13_B'],
    [Biome.TAIGA]: ['dense_1', 'dense_2_A', 'dense_3_A', 'dense_4_A', 'dense_5', 'dense_6', 'dense_7_A', 'dense_8', 'dense_9', 'dense_10_A', 'dense_11', 'dense_12', 'dense_13_A'],
    [Biome.DESERT]: ['dense_1', 'dense_5', 'dense_6', 'dense_8', 'dense_9', 'dense_11', 'dense_12',],
    [Biome.MOUNTAIN]: ['dense_1', 'dense_2_A', 'dense_3_A', 'dense_4_A', 'dense_5', 'dense_6', 'dense_7_A', 'dense_8', 'dense_9', 'dense_10_A', 'dense_11', 'dense_12', 'dense_13_A'],
    [Biome.WATER]: [],
};

function getAssetPath(category: DecoType, asset: string): string {
    return `${DECO_PATH}${category.toLowerCase()}/${asset}.gltf`;
}

function pickAsset(assets: string[], q: number, r: number, seed: number): string {
    return assets[Math.floor(seededRandom(q, r, seed) * assets.length)];
}

function buildSparseProps(tile: TileData, assets: string[], scaleY: number): PropData[] {
    const props: PropData[] = [];
    const count = Math.floor(seededRandom(tile.q, tile.r, 100) * 2) + 2;
    const MIN_DIST = 0.35;

    for (let i = 0; i < count; i++) {
        let x = 0, z = 0, isValid = false;

        for (let attempt = 0; attempt < 10; attempt++) {
            const angle = seededRandom(tile.q, tile.r, 200 + i + attempt * 10) * Math.PI * 2;
            const radius = 0.2 + seededRandom(tile.q, tile.r, 300 + i + attempt * 10) * 0.5;
            x = Math.cos(angle) * radius;
            z = Math.sin(angle) * radius;
            isValid = props.every(p => Math.sqrt((p.x - x) ** 2 + (p.z - z) ** 2) > MIN_DIST);
            if (isValid) break;
        }

        if (!isValid) continue;

        props.push({
            assetPath: getAssetPath(DecoType.SPARSE, pickAsset(assets, tile.q, tile.r, 400 + i)),
            x, z,
            y: scaleY + 1,
            rotation: seededRandom(tile.q, tile.r, 500 + i) * Math.PI * 2,
            scale: 0.8 + seededRandom(tile.q, tile.r, 600 + i) * 0.3
        });
    }

    return props;
}

function buildSingleProp(tile: TileData, assets: string[], scaleY: number, category: DecoType): PropData {
    const angle = seededRandom(tile.q, tile.r, 800) * Math.PI * 2;
    const radius = seededRandom(tile.q, tile.r, 900) * 0.15;

    return {
        assetPath: getAssetPath(category, pickAsset(assets, tile.q, tile.r, 700)),
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        y: scaleY + 1,
        rotation: seededRandom(tile.q, tile.r, 1000) * Math.PI * 2,
        scale: 0.95 + seededRandom(tile.q, tile.r, 1100) * 0.1
    };
}

export function getDecorationProps(tile: TileData, scaleY: number): PropData[] {
    if (tile.type === 'WATER' || tile.resource) return [];
    if (!tile.decoZone || tile.decoZone.type === DecoType.EMPTY) return [];

    const assetMap = { [DecoType.SPARSE]: SPARSE_ASSETS, [DecoType.MEDIUM]: MEDIUM_ASSETS, [DecoType.DENSE]: DENSE_ASSETS };
    const assets = assetMap[tile.decoZone.type][tile.biome] ?? [];

    if (assets.length === 0) return [];

    if (tile.decoZone.type === DecoType.SPARSE) return buildSparseProps(tile, assets, scaleY);
    return [buildSingleProp(tile, assets, scaleY, tile.decoZone.type)];
}