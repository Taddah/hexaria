import type { Socket } from 'socket.io';

interface PlayerEntry {
    entityId: number;
    socket: Socket;
}

export class PlayerRegistry {
    private byUserId = new Map<string, PlayerEntry>();

    register(userId: string, entityId: number, socket: Socket): void {
        const existing = this.byUserId.get(userId);
        if (existing) {
            existing.socket.emit('session_kicked');
            existing.socket.disconnect(true);
        }
        this.byUserId.set(userId, { entityId, socket });
    }

    remove(userId: string): void {
        this.byUserId.delete(userId);
    }

    getByUserId(userId: string): PlayerEntry | undefined {
        return this.byUserId.get(userId);
    }

    getSocketByUserId(userId: string): Socket | undefined {
        return this.byUserId.get(userId)?.socket;
    }

    getEntityByUserId(userId: string): number | undefined {
        return this.byUserId.get(userId)?.entityId;
    }

    getAllEntries(): IterableIterator<[string, PlayerEntry]> {
        return this.byUserId.entries();
    }

    get size(): number {
        return this.byUserId.size;
    }
}
