export function getPlayerOffsetOnTile(entityId: number, index: number, total: number): { x: number, z: number } {
    if (total <= 1) return { x: 0, z: 0 };

    // Rayon adapté à la taille réelle d'un hexagone (~2.5 unités)
    const radius = Math.min(0.5 + (total / 50) * 1.5, 2.0);

    const angle = (entityId * 2.399963) % (Math.PI * 2);
    const r = radius * Math.sqrt((index + 0.5) / total);

    return {
        x: Math.cos(angle + index) * r,
        z: Math.sin(angle + index) * r
    };
}