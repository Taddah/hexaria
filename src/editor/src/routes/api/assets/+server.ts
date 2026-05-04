import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

// Chemin absolu vers le dossier des modèles de l'éditeur
const MODELS_DIR = path.resolve(process.cwd(), 'static/models');

export function GET() {
	try {
		const assets: Record<string, string[]> = {};

		if (!fs.existsSync(MODELS_DIR)) {
			return json(assets);
		}

		// Lire tous les dossiers (catégories) dans static/models
		const categories = fs.readdirSync(MODELS_DIR, { withFileTypes: true })
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);

		for (const category of categories) {
			const dirPath = path.join(MODELS_DIR, category);
			const files = fs.readdirSync(dirPath);
			// Garder uniquement les fichiers 3D
			const models = files.filter(f => f.endsWith('.gltf') || f.endsWith('.glb'));
			if (models.length > 0) {
				assets[category] = models;
			}
		}

		return json(assets);
	} catch (e) {
		console.error("Erreur lors du scan des assets :", e);
		return json({ error: "Impossible de lire les assets" }, { status: 500 });
	}
}
