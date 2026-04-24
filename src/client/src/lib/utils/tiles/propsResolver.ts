import type { TileData } from "$lib/stores/gameStore";

const PROPS_TREE: Record<string, string> = {
    TREE_A: '/assets/models/decoration/nature/tree_single_A.gltf',
    TREE_B: '/assets/models/decoration/nature/tree_single_B.gltf',
    TREES_A_LARGE: '/assets/models/decoration/nature/trees_A_large.gltf',
    TREES_A_MEDIUM: '/assets/models/decoration/nature/trees_A_medium.gltf',
    TREES_A_SMALL: '/assets/models/decoration/nature/trees_A_small.gltf',
    TREES_B_LARGE: '/assets/models/decoration/nature/trees_B_large.gltf',
    TREES_B_MEDIUM: '/assets/models/decoration/nature/trees_B_medium.gltf',
    TREES_B_SMALL: '/assets/models/decoration/nature/trees_B_small.gltf',
    TREES_A_CUT: '/assets/models/decoration/nature/trees_A_cut.gltf',
    TREES_B_CUT: '/assets/models/decoration/nature/trees_B_cut.gltf',
};

export interface PropData {
    assetPath: string;
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
    const count = tile.resource?.type === 'wood' ? tile.resource.amount : 0;

    if (count <= 0 && tile.resource?.type !== 'wood') return [];

    if (count <= 0) {

        props.push({
            assetPath: PROPS_TREE['TREES_A_CUT'],
            x: 0,
            z: 0,
            y: scaleY + 1,
            rotation: seededRandom(tile.q, tile.r) * Math.PI * 2,
            scale: 1
        });
    };

    if (count < 5) {
        const MIN_DIST = 0.25;

        for (let i = 0; i < count; i++) {
            const modelType = seededRandom(tile.q, tile.r, i) > 0.5 ? 'TREE_A' : 'TREE_B';

            let x = 0, z = 0, isValid = false;
            for (let attempt = 0; attempt < 5; attempt++) {
                const angle = seededRandom(tile.q, tile.r, i + attempt * 10) * Math.PI * 2;
                const radius = 0.15 + seededRandom(tile.q, tile.r, i + attempt * 20) * 0.45;
                x = Math.cos(angle) * radius;
                z = Math.sin(angle) * radius;

                isValid = props.every(p => Math.sqrt((p.x - x) ** 2 + (p.z - z) ** 2) > MIN_DIST);
                if (isValid) break;
            }

            props.push({
                assetPath: PROPS_TREE[modelType],
                x,
                z,
                y: scaleY + 1,
                rotation: seededRandom(tile.q, tile.r, i + 5) * Math.PI * 2,
                scale: 0.8 + seededRandom(tile.q, tile.r, i + 6) * 0.4
            });
        }
    }
    else {
        const clusters = [
            'TREES_A_LARGE', 'TREES_A_MEDIUM', 'TREES_A_SMALL',
            'TREES_B_LARGE', 'TREES_B_MEDIUM', 'TREES_B_SMALL'
        ];

        const randomIndex = Math.floor(seededRandom(tile.q, tile.r, 999) * clusters.length);
        const selectedAsset = clusters[randomIndex];

        props.push({
            assetPath: PROPS_TREE[selectedAsset],
            x: 0,
            z: 0,
            y: scaleY + 1,
            rotation: seededRandom(tile.q, tile.r, 888) * Math.PI * 2,
            scale: 0.9 + seededRandom(tile.q, tile.r, 777) * 0.2
        });
    }

    return props;
}