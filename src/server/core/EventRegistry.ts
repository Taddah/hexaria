import * as fs from 'fs';
import path from 'path';

export class EventRegistry {
    private static events: Map<string, any> = new Map();

    static loadAll() {
        const directoryPath = path.join(__dirname, '../../shared/data/events');

        const loadDir = (dirPath: string) => {
            const files = fs.readdirSync(dirPath);
            for (const file of files) {
                const fullPath = path.join(dirPath, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    loadDir(fullPath);
                } else if (file.endsWith('.json')) {
                    const content = fs.readFileSync(fullPath, 'utf-8');
                    const data = JSON.parse(content);
                    data.forEach((event: any) => {
                        this.events.set(event.id, event);
                    });
                }
            }
        };

        loadDir(directoryPath);
        console.log(`[EVENT] ${this.events.size} événements chargés en mémoire.`);
    }


    static getAll() {
        return Array.from(this.events.values());
    }

    static getById(id: string) {
        return this.events.get(id);
    }
}