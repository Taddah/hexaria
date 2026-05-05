import { EventHistory } from "$shared/components";
import Groq from "groq-sdk";

export interface EventContext {
    actionType: string;
    fatigue: string;
    recentActions: EventHistory[];
    polarity: string;
    baseTitle: string;
    baseDescription: string;
    choices?: { id: string; label: string; effects: any[] }[]; // ← AJOUTER
}

export interface LLMEventEnrichment {
    title: string;
    description: string;
    choiceLabels?: { [choiceId: string]: string }; // ← AJOUTER
}

// ← AJOUTER
export interface ResolutionContext {
    eventTitle: string;
    choiceLabel: string;
    effects: { stat: string; value: number }[];
}

export class LLMService {
    private groq: Groq;

    constructor() {
        this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }

    async enrichEvent(context: EventContext): Promise<LLMEventEnrichment> {
        const prompt = buildPrompt(context);

        const completion = await this.groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });

        const content = JSON.parse(completion?.choices?.[0]?.message?.content!);

        return {
            title: content.title ?? context.baseTitle,
            description: content.description ?? context.baseDescription,
            choiceLabels: content.choiceLabels ?? {}, // ← AJOUTER
        };
    }

    // ← AJOUTER
    async generateResolution(ctx: ResolutionContext): Promise<string> {
        const effectsDesc = ctx.effects
            .map(e => `${e.value > 0 ? '+' : ''}${e.value} ${e.stat}`)
            .join(', ') || 'aucun effet';

        const prompt = `
Tu es le narrateur d'un jeu de survie médiéval sombre, style "Darkest Dungeon".
L'événement : "${ctx.eventTitle}"
Le joueur a choisi : "${ctx.choiceLabel}"
Effets : ${effectsDesc}

2 phrases max, ton sombre, mentionne naturellement les effets.
JSON uniquement : { "resolutionText": "..." }
`.trim();

        const completion = await this.groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });

        const content = JSON.parse(completion?.choices?.[0]?.message?.content!);
        return content.resolutionText ?? '';
    }
}

function buildPrompt(ctx: EventContext): string {
    const choicesBlock = ctx.choices?.length
        ? `\nChoix disponibles :\n${ctx.choices.map(c => `- id: "${c.id}", label: "${c.label}"`).join('\n')}`
        : '';

    const choicesJson = ctx.choices?.length
        ? `, "choiceLabels": { ${ctx.choices.map(c => `"${c.id}": "..."`).join(', ')} }`
        : '';

    return `
Tu es le narrateur d'un jeu de survie médiéval sombre, style "Darkest Dungeon".
Ton style : phrases courtes, images concrètes, tension palpable. Jamais cliché.

Événement de base : "${ctx.baseTitle}"
Description : "${ctx.baseDescription}"
Action : ${ctx.actionType}
Tonalité : ${ctx.polarity}
Fatigue du joueur : ${ctx.fatigue}
Actions récentes : ${ctx.recentActions.slice(-3).join(', ')}
${choicesBlock}

Réécris en français dans ce style sombre et immersif.
JSON uniquement : { "title": "...", "description": "..."${choicesJson} }
`.trim();
}
