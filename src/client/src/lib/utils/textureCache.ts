import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const cache = new Map<string, THREE.Texture>();

export function loadTexture(path: string): Promise<THREE.Texture> {
    if (cache.has(path)) return Promise.resolve(cache.get(path)!);

    return new Promise((resolve, reject) => {
        loader.load(
            path,
            (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.flipY = false;
                cache.set(path, texture);
                resolve(texture);
            },
            undefined,
            reject
        );
    });
}