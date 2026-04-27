import type { TileData } from "$shared";
import { Biome } from "$shared";

const PROPS_PATH = "/assets/models/decoration/nature/"
const TREE_ASSETS_BY_BIOME: Record<Biome, { single: string, singleCut: string, clusters: string[], clustersCut: string, material: string }> = {
    [Biome.WATER]: {
        single: "",
        singleCut: "",
        clusters: [""],
        clustersCut: "",
        material: ""
    },
    [Biome.DESERT]: {
        single: "",
        singleCut: "",
        clusters: [""],
        clustersCut: "",
        material: ""
    },
    [Biome.PRAIRIE]: {
        single: 'tree_single_A',
        singleCut: 'tree_A_cut',
        clusters: ['trees_A_large', 'trees_A_medium', 'trees_A_small'],
        clustersCut: 'trees_A_cut',
        material: "/assets/models/tiles/base/taiga.png"
    },
    [Biome.TAIGA]: {
        single: 'tree_single_A',
        singleCut: 'tree_A_cut',
        clusters: ['trees_A_large', 'trees_A_medium', 'trees_A_small'],
        clustersCut: 'trees_A_cut',
        material: "/assets/models/tiles/base/prairie.png"
    },
    [Biome.MOUNTAIN]: {
        single: 'tree_single_B',
        singleCut: 'tree_B_cut',
        clusters: ['trees_B_large', 'trees_B_medium', 'trees_B_small'],
        clustersCut: 'trees_B_cut',
        material: "/assets/models/tiles/base/mountain.png"
    }
};

export interface PropData {
    assetPath: string;
    material: string;
    x: number;
    z: number;
    y: number;
    rotation: number;
    scale: number;
}

function seededRandom(q: number, r: number, seed: number = 0): number {
    const x = Math.sin(q * 12.9898 + r * 78.233 + seed * 43758.5453) * 43758.5453123;
    return x - Math.floor(x);
}

export function getTreeProps(tile: TileData, scaleY: number): PropData[] {
    const props: PropData[] = [];
    if (!tile.resource || tile.resource.type !== 'wood') return props;

    const amount = tile.resource.amount ?? 0;
    const biomeAssets = TREE_ASSETS_BY_BIOME[tile.biome] ?? TREE_ASSETS_BY_BIOME.PRAIRIE;

    // Arbres coupés
    if (amount <= 0) {
        const cutAsset = biomeAssets.clustersCut;
        props.push({
            assetPath: PROPS_PATH + cutAsset + ".gltf",
            material: biomeAssets.material,
            x: 0, z: 0,
            y: scaleY + 1,
            rotation: seededRandom(tile.q, tile.r) * Math.PI * 2,
            scale: 1
        });
        return props;
    }

    // Toujours utiliser les clusters en priorité
    if (amount >= 3) {
        const clusterCount = Math.min(3, Math.floor(amount / 3));

        for (let c = 0; c < clusterCount; c++) {
            const clusters = biomeAssets.clusters;
            const index = Math.floor(seededRandom(tile.q, tile.r, c * 100) * clusters.length);
            const angle = seededRandom(tile.q, tile.r, c * 200) * Math.PI * 2;
            const radius = c === 0 ? 0 : 0.3 + seededRandom(tile.q, tile.r, c * 300) * 0.3;

            props.push({
                assetPath: PROPS_PATH + clusters[index] + ".gltf",
                material: biomeAssets.material,
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius,
                y: scaleY + 1,
                rotation: seededRandom(tile.q, tile.r, c * 400) * Math.PI * 2,
                scale: 0.8 + seededRandom(tile.q, tile.r, c * 500) * 0.4
            });
        }
        return props;
    }

    // Petits groupes — arbres individuels
    const MIN_DIST = 0.3;
    for (let i = 0; i < amount; i++) {
        const single = biomeAssets.single;
        let x = 0, z = 0, isValid = false;

        for (let attempt = 0; attempt < 20; attempt++) {
            const angle = seededRandom(tile.q, tile.r, i + attempt * 10) * Math.PI * 2;
            const radius = 0.1 + seededRandom(tile.q, tile.r, i + attempt * 20) * 0.5;
            x = Math.cos(angle) * radius;
            z = Math.sin(angle) * radius;
            isValid = props.every(p => Math.sqrt((p.x - x) ** 2 + (p.z - z) ** 2) > MIN_DIST);
            if (isValid) break;
        }

        if (!isValid) continue;

        props.push({
            assetPath: PROPS_PATH + single + ".gltf",
            material: biomeAssets.material,
            x, z,
            y: scaleY + 1,
            rotation: seededRandom(tile.q, tile.r, i + 5) * Math.PI * 2,
            scale: 0.8 + seededRandom(tile.q, tile.r, i + 6) * 0.4
        });
    }

    return props;
}