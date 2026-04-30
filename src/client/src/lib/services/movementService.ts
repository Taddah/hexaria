import { gameState, type EntityDTO } from "$lib/stores/gameState.svelte";
import { expandFog } from "$lib/utils/fogOfWar.svelte";
import { hexToWorld } from "$lib/utils/hexUtils"
import { findPath } from "$lib/utils/pathfinding";
import { getScaleY } from "$lib/utils/tiles/tileResolver";
import { MOVEMENT_DURATION_MS, type TileData } from "$shared";
import type { Socket } from "socket.io-client";

let _isMoving = false;
export const isMoving = () => _isMoving;

export async function startMovement(socket: Socket, path: { q: number, r: number }[], localPlayer: EntityDTO) {
    if (path.length === 0 || _isMoving || !localPlayer) return;
    _isMoving = true;

    try {
        let currentQ = localPlayer.position.q;
        let currentR = localPlayer.position.r;

        for (const step of path) {
            const current = gameState.playerAnimPosition ?? {
                x: hexToWorld(currentQ, currentR)[0],
                y: 0,
                z: hexToWorld(currentQ, currentR)[2]
            };
            const target = hexToWorld(step.q, step.r);

            const fromTile = gameState.map[`${currentQ},${currentR}`];
            const toTile = gameState.map[`${step.q},${step.r}`];
            const fromY = fromTile ? getScaleY(fromTile) + 1 : current.y;
            const toY = toTile ? getScaleY(toTile) + 1 : fromY;

            await new Promise(resolve => setTimeout(resolve, 150));
            socket.emit('request_move', { q: step.q, r: step.r });
            const sameElevation = fromY === toY;
            const startTime = performance.now();

            await new Promise<void>((resolve) => {
                function animate() {
                    const elapsed = performance.now() - startTime;
                    const t = Math.min(elapsed / MOVEMENT_DURATION_MS, 1);
                    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                    gameState.playerAnimPosition = {
                        x: current.x + (target[0] - current.x) * eased,
                        y: sameElevation ? fromY : fromY + (toY - fromY) * t,
                        z: current.z + (target[2] - current.z) * eased
                    };
                    if (t < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        resolve();
                    }
                }
                requestAnimationFrame(animate);
            });

            currentQ = step.q;
            currentR = step.r;

            const mapData = Object.values(gameState.map);

            const fresh = gameState.entities.find(e => e.id === gameState.localPlayer?.id) ?? null;
            if (fresh) {
                gameState.localPlayer = {
                    ...fresh,
                    position: { q: currentQ, r: currentR }
                };
            }

            expandFog(step.q, step.r, mapData);
        }

    }
    finally {
        _isMoving = false;
        gameState.path = [];
    }


}

export function requestMove(socket: Socket, localPlayer: EntityDTO, selectedHex: TileData | null | undefined) {

    if (!selectedHex) return;

    const path = findPath(
        localPlayer.position.q,
        localPlayer.position.r,
        selectedHex.q,
        selectedHex.r,
        gameState.map
    );

    if (path.length === 0) return;

    gameState.path = path;
    startMovement(socket, path, localPlayer);

}

export const isMoveValid = () => {
    if (!gameState.localPlayer || !gameState.selectedHex) return false;
    if (gameState.selectedHex.type === 'WATER') return false;

    return true;
};