
export function pixelToHex(x: number, y: number, size: number): { q: number; r: number } {
    const q = ((Math.sqrt(3) / 3) * x - (1 / 3) * y) / size;
    const r = ((2 / 3) * y) / size;
    return hexRound(q, r);
}

export function hexDistance(q1: number, r1: number, q2: number, r2: number): number {
    return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
}

export function drawHexagonPoly(size: number): number[] {
    const points: number[] = [];
    for (let i = 0; i < 6; i++) {
        const angle_rad = (Math.PI / 180) * (60 * i - 30);
        points.push(size * Math.cos(angle_rad), size * Math.sin(angle_rad));
    }
    return points;
}

function hexRound(q: number, r: number): { q: number; r: number } {
    let x = q, z = r, y = -x - z;
    let rx = Math.round(x), ry = Math.round(y), rz = Math.round(z);

    const dx = Math.abs(rx - x), dy = Math.abs(ry - y), dz = Math.abs(rz - z);

    if (dx > dy && dx > dz) rx = -ry - rz;
    else if (dy > dz) ry = -rx - rz;
    else rz = -rx - ry;

    return { q: rx, r: rz };
}
