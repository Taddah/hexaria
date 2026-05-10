import { ActionType, EventHistory } from "$shared/components";
import Groq from "groq-sdk";

export interface EventContext {
    actionType: string;
    fatigue: string;
    recentActions: EventHistory[];
    polarity: string;
    baseTitle: string;
    baseDescription: string;
}

export interface EventNarrative {
    nodes: {
        [nodeId: string]: {
            description: string;
            choiceLabels?: { [choiceId: string]: string };
        };
    };
}

export interface EventDefinition {
    id: string;
    title: string;
    polarity: string;
    nodes: EventNode[];
}

export interface EventNode {
    id: string;
    description: string;
    choices?: { id: string; label: string; outcomes: any[] }[];
    effects?: any[];
}

export interface SummaryContext {
    eventName: string;
    action: ActionType[];
    visitedPath: { nodeId: string; choiceId?: string; choiceLabel?: string }[];
    appliedEffects: any[];
}

export class LLMService {
    private static instance: LLMService;
    private groq: Groq;

    private constructor() {
        this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }

    static getInstance(): LLMService {
        if (!LLMService.instance) {
            LLMService.instance = new LLMService();
        }
        return LLMService.instance;
    }

    async enrichAllNodes(event: EventDefinition, ctx: EventContext): Promise<EventNarrative> {
        const prompt = buildFullEventPrompt(event, ctx);

        const completion = await this.groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });

        const content = JSON.parse(completion.choices[0]!.message.content!);
        return content as EventNarrative;
    }

    async generateEventSummary(ctx: SummaryContext): Promise<string> {
        const prompt = buildSummaryPrompt(ctx);

        const completion = await this.groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
        });

        return completion.choices[0]!.message.content!.trim();
    }
}

function buildSummaryPrompt(ctx: SummaryContext): string {
    const pathBlock = ctx.visitedPath
        .map(p => `- Node "${p.nodeId}"${p.choiceLabel ? ` → choix : "${p.choiceLabel}"` : ''}`)
        .join('\n');

    const effectsBlock = ctx.appliedEffects.length > 0
        ? ctx.appliedEffects.map(e => `- ${JSON.stringify(e)}`).join('\n')
        : '- Aucun effet notable';

    return `
Tu es le narrateur d'un jeu de survie médiéval sombre, style "Darkest Dungeon".
Écris 2 à 4 phrases style journal de bord, à la première personne, résumant ce qui vient de se passer.
Phrases courtes, images concrètes, tension palpable. Jamais cliché. En français.
IMPORTANT : Incorpore de manière narrative, explicite et dramatique les effets subis (blessures, pertes de ressources, gains) dans ton résumé.

Événement : "${ctx.eventName}"
Action déclenchante : ${ctx.action}

Chemin parcouru :
${pathBlock}

Effets subis :
${effectsBlock}

Retourne uniquement le texte narratif, sans JSON, sans guillemets.
`.trim();
}

export function applyNarrative(node: EventNode, narrative: EventNarrative | null) {
    if (!narrative) return node;
    const enriched = narrative.nodes[node.id];
    if (!enriched) return node;

    return {
        ...node,
        description: enriched.description ?? node.description,
        choices: node.choices?.map(c => ({
            ...c,
            label: enriched.choiceLabels?.[c.id] ?? c.label
        }))
    };
}

function buildFullEventPrompt(event: EventDefinition, ctx: EventContext): string {
    const nodesBlock = event.nodes.map(node => {
        const nodeEffects = node.effects?.length ? `\n  Effets immédiats du node: ${JSON.stringify(node.effects)}` : '';
        const choicesBlock = node.choices?.map(c => {
            const allEffects = c.outcomes?.flatMap(o => o.effects || []) || [];
            const effectsStr = allEffects.length ? ` (conséquences possibles: ${JSON.stringify(allEffects)})` : '';
            return `  - id: "${c.id}", label: "${c.label}"${effectsStr}`;
        }).join('\n') ?? '';
        return `Node "${node.id}":
  Description brute: "${node.description}"${nodeEffects}${choicesBlock ? `\n  Choix:\n${choicesBlock}` : ''}`;
    }).join('\n\n');

    const expectedJson: EventNarrative = {
        nodes: Object.fromEntries(event.nodes.map(n => [
            n.id,
            {
                description: "...",
                ...(n.choices?.length ? {
                    choiceLabels: Object.fromEntries(n.choices.map(c => [c.id, "..."]))
                } : {})
            }
        ]))
    };

    return `
Tu es le narrateur d'un jeu de survie médiéval sombre, style "Darkest Dungeon".
Phrases courtes, images concrètes, tension palpable. Jamais cliché. En français.
IMPORTANT : Si des effets (blessures, gains, pertes de ressources) sont listés pour un node ou un choix, tu DOIS absolument les incorporer dans la description narrative du node pour que le joueur comprenne ce qui lui arrive physiquement et matériellement.

Événement : "${event.title}"
Tonalité : ${ctx.polarity}
Action déclenchante : ${ctx.actionType}
Fatigue du joueur : ${ctx.fatigue}
Actions récentes : ${ctx.recentActions.slice(-3).map(r => r.toString()).join(', ')}

Nodes à enrichir :
${nodesBlock}

Retourne UNIQUEMENT ce JSON (même structure, tous les nodes) :
${JSON.stringify(expectedJson, null, 2)}
`.trim();
}
