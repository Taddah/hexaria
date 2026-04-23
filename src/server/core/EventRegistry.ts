import * as fs from 'fs';
import path from 'path';

export class EventRegistry {
    private static events: Map<string, any> = new Map();

    static loadAll() {
        const directoryPath = path.join(__dirname, '../data/events');
        const files = fs.readdirSync(directoryPath);


        for (const file of files) {
            if (file.endsWith('.json')) {
                const content = fs.readFileSync(path.join(directoryPath, file), 'utf-8');
                const data = JSON.parse(content);


                data.forEach((event: any) => {
                    this.events.set(event.id, event);
                });
            }
        }
        console.log(`[EVENT] ${this.events.size} événements chargés en mémoire.`);
    }

    static getAll() {
        return Array.from(this.events.values());
    }

    static getById(id: string) {
        return this.events.get(id);
    }
}